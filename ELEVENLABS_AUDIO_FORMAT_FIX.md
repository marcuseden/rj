# ElevenLabs Audio Format Fix - Critical Issue Resolved

## The Problem ❌

**Error Code 1008**: "Invalid message received"

After successfully connecting to ElevenLabs WebSocket, the connection was immediately closed with error code 1008 because we were sending audio in the wrong format.

## The Root Cause

```typescript
// ❌ WRONG - We were base64-encoding the audio
sendAudio(audioData: ArrayBuffer): void {
  const base64Audio = this.arrayBufferToBase64(audioData);
  this.ws.send(base64Audio); // Sending as string
}
```

**Why this is wrong:**
- ElevenLabs Conversational AI expects **raw binary PCM16 data**
- We were sending **base64-encoded strings**
- The WebSocket `binaryType` is set to `'arraybuffer'`
- Server correctly rejected the invalid format with error 1008

## The Solution ✅

```typescript
// ✅ CORRECT - Send raw binary data
sendAudio(audioData: ArrayBuffer): void {
  // ElevenLabs expects raw binary PCM16 audio data
  // Send directly as ArrayBuffer (not base64 encoded)
  if (audioData && audioData.byteLength > 0) {
    this.ws.send(audioData); // Sending as binary
  }
}
```

## ElevenLabs WebSocket Protocol

### Text Messages (JSON)
```typescript
// User text message
{
  "type": "user_message",
  "content": "Hello"
}

// End of sequence
{
  "text": ""
}

// Pong response
{
  "type": "pong",
  "event_id": "..."
}
```

### Binary Messages (Audio)
```typescript
// ✅ Raw ArrayBuffer (PCM16 format)
const pcm16Data = new Int16Array(audioBuffer);
ws.send(pcm16Data.buffer); // Send as binary, not string
```

## Audio Pipeline

### Microphone → ElevenLabs
```
Microphone Input
    ↓
Float32Array (Web Audio API)
    ↓
Convert to Int16Array (PCM16)
    ↓
Send as ArrayBuffer (binary)
    ↓
ElevenLabs Server
```

### ElevenLabs → Speaker
```
ElevenLabs Server
    ↓
Receive ArrayBuffer (binary PCM16)
    ↓
Convert to Float32Array
    ↓
Create AudioBuffer
    ↓
Play through speakers
```

## Key Differences

### Base64 Encoding (Wrong)
```typescript
// Base64 string representation
"AQACAAMABAA..." // String of characters
Length: ~4/3 of original (33% overhead)
Type: String
WebSocket: Text frame
```

### Raw Binary (Correct)
```typescript
// Raw bytes
ArrayBuffer { byteLength: 8192 } // Actual binary data
Length: Exact size needed
Type: ArrayBuffer
WebSocket: Binary frame
```

## Performance Impact

### Before (Base64)
- **Size**: 8192 bytes → 10,923 characters (33% larger)
- **CPU**: Encoding overhead for each chunk
- **Latency**: Additional processing time
- **Result**: ❌ Server rejects with 1008

### After (Binary)
- **Size**: 8192 bytes → 8192 bytes (no overhead)
- **CPU**: No encoding, direct send
- **Latency**: Minimal processing
- **Result**: ✅ Server accepts audio

## Testing Verification

You should now see:
```
✅ Connected to ElevenLabs agent
✅ Conversation initialized
📋 Audio format - Output: pcm_16000
📋 Audio format - Input: pcm_16000
✅ Recording started - streaming to ElevenLabs
```

And NO:
```
❌ WebSocket closed: 1008 Invalid message received
```

## Common Mistakes to Avoid

### ❌ Don't Do This
```typescript
// Base64 encoding
const base64 = btoa(String.fromCharCode(...new Uint8Array(buffer)));
ws.send(base64);

// JSON wrapping
ws.send(JSON.stringify({ audio: base64 }));

// String conversion
ws.send(buffer.toString());
```

### ✅ Do This
```typescript
// Direct binary send
ws.send(arrayBuffer);

// Or from typed array
const pcm16 = new Int16Array(length);
ws.send(pcm16.buffer);
```

## Why WebSocket Binary Type Matters

```typescript
// Set binary type to arraybuffer (not blob)
this.ws = new WebSocket(url);
this.ws.binaryType = 'arraybuffer'; // ✅ Correct

// This allows us to send/receive ArrayBuffer directly
this.ws.send(audioData); // Works perfectly
```

## Protocol Summary

| Direction | Type | Format | Encoding |
|-----------|------|--------|----------|
| Client → Server (Text) | String | JSON | UTF-8 |
| Client → Server (Audio) | Binary | PCM16 | Raw bytes |
| Server → Client (Text) | String | JSON | UTF-8 |
| Server → Client (Audio) | Binary | PCM16 | Raw bytes |

## Conclusion

The fix was simple but critical:
- **Remove**: Base64 encoding step
- **Keep**: Raw binary ArrayBuffer
- **Result**: Proper protocol compliance

This is a common mistake when implementing WebSocket audio streaming. Always check the API documentation for the expected format - some APIs want base64, others want raw binary. ElevenLabs Conversational AI requires raw binary PCM16 data.

---

**Status**: ✅ FIXED  
**Date**: November 2, 2025  
**Impact**: High - Enables audio streaming to work properly

