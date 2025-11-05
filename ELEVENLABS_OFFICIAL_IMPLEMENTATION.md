# ElevenLabs Conversational AI - Official Implementation

## Based on Official ElevenLabs Documentation

This implementation follows the official ElevenLabs Conversational AI WebSocket best practices as documented at:
- https://elevenlabs.io/docs/conversational-ai/api-reference/conversational-ai/websocket
- https://elevenlabs.io/docs/agents-platform/libraries/web-sockets
- https://help.elevenlabs.io/hc/en-us/articles/28084868106513-How-can-I-keep-the-WebSocket-open

## WebSocket Connection

### Endpoint
```
wss://api.elevenlabs.io/v1/convai/conversation?agent_id={agent_id}
```

### Authentication
- **Public Agents**: Include `agent_id` in URL
- **Private Agents**: Include API key via `xi-api-key` query parameter
- **Never expose API keys** in client-side code for production

## Message Protocol

### Client → Server Messages

#### 1. User Audio Chunks
**Format**: JSON with base64-encoded audio

```typescript
{
  "user_audio_chunk": "base64_encoded_pcm16_audio_data"
}
```

**Audio Specifications**:
- Format: PCM16 (16-bit PCM)
- Sample Rate: 16000 Hz
- Channels: Mono (1 channel)
- Encoding: Base64

**Implementation**:
```typescript
const base64Audio = this.arrayBufferToBase64(audioData);
this.ws.send(JSON.stringify({
  user_audio_chunk: base64Audio
}));
```

#### 2. Pong Response (to server ping)
**Format**: JSON with event_id

```typescript
{
  "type": "pong",
  "event_id": "event_id_from_ping"
}
```

#### 3. Keep-Alive
**Format**: Single space character

```typescript
this.ws.send(" "); // Single space, NOT empty string
```

**Timing**:
- Send every 18-20 seconds
- Default timeout: 20 seconds
- Do NOT send empty string `""` (signals EOS and closes connection)

#### 4. End of Sequence (graceful close)
**Format**: JSON with empty text

```typescript
{
  "text": ""
}
```

### Server → Client Messages

#### 1. Conversation Initiation Metadata
```typescript
{
  "type": "conversation_initiation_metadata",
  "conversation_initiation_metadata_event": {
    "agent_output_audio_format": "pcm_16000",
    "user_input_audio_format": "pcm_16000"
  }
}
```

#### 2. User Transcript
```typescript
{
  "type": "user_transcript",
  "user_transcription": "transcribed text"
}
```

#### 3. Agent Response
```typescript
{
  "type": "agent_response",
  "agent_response": "response text"
}
```

#### 4. Audio Event
```typescript
{
  "type": "audio",
  "audio_event": {
    "audio_base_64": "base64_encoded_audio"
  }
}
```

#### 5. Ping (server health check)
```typescript
{
  "type": "ping",
  "event_id": "unique_event_id"
}
```

**Expected Response**: Send pong with same event_id

#### 6. Interruption
```typescript
{
  "type": "interruption"
}
```

## Implementation Details

### Audio Capture and Conversion

```typescript
// 1. Capture audio from microphone
const mediaStream = await navigator.mediaDevices.getUserMedia({
  audio: {
    echoCancellation: true,
    noiseSuppression: true,
    autoGainControl: true,
    sampleRate: 16000,  // Match ElevenLabs requirement
    channelCount: 1      // Mono
  }
});

// 2. Process audio with ScriptProcessorNode
this.scriptProcessorNode.onaudioprocess = (event) => {
  const inputData = event.inputBuffer.getChannelData(0); // Float32Array
  
  // 3. Convert Float32 to PCM16
  const pcm16 = this.floatToPCM16(inputData);
  
  // 4. Convert to ArrayBuffer
  const buffer = pcm16.buffer as ArrayBuffer;
  
  // 5. Send to ElevenLabs
  this.sendAudio(buffer);
};

// Helper: Float32 to PCM16 conversion
private floatToPCM16(float32Array: Float32Array): Int16Array {
  const pcm16 = new Int16Array(float32Array.length);
  for (let i = 0; i < float32Array.length; i++) {
    const s = Math.max(-1, Math.min(1, float32Array[i]));
    pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
  }
  return pcm16;
}

// Helper: ArrayBuffer to Base64
private arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}
```

### Keep-Alive Implementation

```typescript
private startKeepAlive(): void {
  this.stopKeepAlive();
  
  // Send single space character every 18 seconds
  // (safely under 20 second timeout)
  this.keepAliveInterval = setInterval(() => {
    if (this.ws?.readyState === WebSocket.OPEN && this.conversationReady) {
      try {
        this.ws.send(" "); // Single space as per docs
        console.log('🏓 Sent keep-alive');
      } catch (e) {
        console.warn('⚠️ Failed to send keep-alive:', e);
      }
    }
  }, 18000);
}
```

### Message Handling

```typescript
ws.onmessage = async (event) => {
  if (typeof event.data === 'string') {
    // JSON message
    const data = JSON.parse(event.data);
    
    switch (data.type) {
      case 'conversation_initiation_metadata':
        this.conversationReady = true;
        console.log('✅ Conversation initialized');
        break;
        
      case 'audio':
        // Decode base64 audio and play
        const audioBuffer = this.base64ToArrayBuffer(data.audio_event.audio_base_64);
        await this.playAudioChunk(audioBuffer);
        break;
        
      case 'ping':
        // Respond with pong
        this.ws.send(JSON.stringify({
          type: 'pong',
          event_id: data.event_id
        }));
        break;
        
      case 'user_transcript':
        console.log('👤 User:', data.user_transcription);
        break;
        
      case 'agent_response':
        console.log('🤖 Agent:', data.agent_response);
        break;
        
      case 'interruption':
        this.stopCurrentAudio();
        break;
    }
  }
};
```

### Connection Lifecycle

```typescript
// 1. Connect
const ws = new WebSocket(
  `wss://api.elevenlabs.io/v1/convai/conversation?agent_id=${agentId}&xi-api-key=${apiKey}`
);

// 2. Wait for open
ws.onopen = () => {
  // Start keep-alive
  this.startKeepAlive();
};

// 3. Wait for conversation_initiation_metadata
// → Set conversationReady = true
// → Start sending audio

// 4. Continuous operation
// → Send audio chunks as JSON { user_audio_chunk: base64 }
// → Send keep-alive every 18-20 seconds
// → Respond to server pings with pongs
// → Receive and play agent audio

// 5. Graceful close
ws.send(JSON.stringify({ text: "" })); // EOS
ws.close(1000, 'Normal closure');
```

## Best Practices

### ✅ DO

1. **Send audio as base64-encoded JSON**:
   ```typescript
   { user_audio_chunk: "base64_data" }
   ```

2. **Send keep-alive every 18-20 seconds**:
   ```typescript
   ws.send(" "); // Single space
   ```

3. **Respond to server pings**:
   ```typescript
   { type: "pong", event_id: "..." }
   ```

4. **Wait for `conversation_initiation_metadata` before sending audio**

5. **Use PCM16 @ 16kHz mono for audio**

6. **Handle interruptions** by stopping current audio playback

7. **Send EOS before closing**:
   ```typescript
   { text: "" }
   ```

### ❌ DON'T

1. **Don't send raw binary audio** (must be base64 in JSON)

2. **Don't send empty string for keep-alive** (signals EOS)

3. **Don't send unsolicited ping messages** (server pings you)

4. **Don't expose API keys** in client code

5. **Don't send audio before `conversation_initiation_metadata`**

6. **Don't send invalid message formats** (causes 1008 error)

## Error Handling

### Error Code 1008: Policy Violation / Invalid Message

**Causes**:
- Sending audio in wrong format (not base64 JSON)
- Sending invalid JSON structures
- Sending empty string `""` as keep-alive
- Sending messages before conversation initialized

**Solutions**:
- Verify audio is sent as `{ user_audio_chunk: "base64" }`
- Check keep-alive sends `" "` not `""`
- Wait for `conversationReady` flag before sending audio
- Validate all JSON messages match expected structure

### Error Code 1002: Protocol Error

**Causes**:
- No activity for > 20 seconds
- Keep-alive not working

**Solutions**:
- Ensure keep-alive interval is running
- Verify keep-alive messages are being sent
- Check WebSocket connection state before sending

## Testing Checklist

- [ ] Connection establishes to correct endpoint
- [ ] See `conversation_initiation_metadata` received
- [ ] `conversationReady` flag set to true
- [ ] Audio chunks sent as `{ user_audio_chunk: "..." }`
- [ ] Keep-alive sends `" "` every 18-20 seconds
- [ ] Server pings receive pong responses
- [ ] User transcripts appear in console
- [ ] Agent responses appear in console
- [ ] Agent audio plays correctly
- [ ] No 1008 errors
- [ ] Connection stays open > 5 minutes
- [ ] Graceful close sends EOS

## Summary

This implementation follows the official ElevenLabs Conversational AI WebSocket protocol:

1. **Audio Format**: PCM16 @ 16kHz mono, base64-encoded, sent as JSON `{ user_audio_chunk: "..." }`
2. **Keep-Alive**: Single space character `" "` every 18-20 seconds
3. **Ping/Pong**: Respond to server pings with pongs containing event_id
4. **Timing**: Wait for conversation initialization before sending audio
5. **Graceful Close**: Send `{ text: "" }` before closing WebSocket

---

**Implementation Status**: ✅ COMPLETE  
**Compliance**: Official ElevenLabs Best Practices  
**Date**: November 2, 2025

