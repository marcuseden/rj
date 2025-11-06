# ElevenLabs Voice Agent Setup Guide

## ✅ What Was Fixed

The voice agent now uses the **official ElevenLabs React `Conversation` component** which properly handles:
- ✅ Audio input/output
- ✅ WebRTC connection
- ✅ Automatic microphone permissions
- ✅ Voice greeting messages
- ✅ Two-way voice conversation

## 🔧 Configuration Required

### 1. Get Your ElevenLabs Agent ID

1. Go to [ElevenLabs Conversational AI Dashboard](https://elevenlabs.io/app/conversational-ai)
2. Create or select your agent
3. Copy the Agent ID from the agent settings

### 2. Add Environment Variable

Create or update `.env.local` file in the project root:

```bash
NEXT_PUBLIC_ELEVENLABS_AGENT_ID=your_agent_id_here
```

### 3. Restart Development Server

```bash
npm run dev
```

## 🎙️ How It Works

The implementation now uses:

```tsx
<Conversation
  agentId={agentId}
  onConnect={handleConnect}
  onDisconnect={handleDisconnect}
  onError={handleError}
>
  {({ conversation, status }) => (
    // Your UI here
  )}
</Conversation>
```

This component:
- Automatically handles microphone access
- Manages WebRTC connections
- Processes audio input/output
- Sends and receives voice properly
- Plays the agent's greeting message

## 🧪 Testing

1. Navigate to `/rj-agent`
2. Click the green phone button
3. Allow microphone permissions when prompted
4. You should hear the greeting message from the agent
5. Start speaking - the agent will respond with voice

## 🐛 Troubleshooting

**No audio?**
- Check browser microphone permissions
- Make sure HTTPS is enabled (required for WebRTC)
- Check browser console for errors
- Verify Agent ID is correct

**Connection fails?**
- Verify your ElevenLabs API key is valid
- Check that the agent is published and active
- Ensure you have credits in your ElevenLabs account

**No greeting message?**
- Make sure your agent has a greeting configured in ElevenLabs dashboard
- Check the agent's conversation settings

## 📚 Resources

- [ElevenLabs React SDK](https://elevenlabs.io/docs/conversational-ai/libraries/react)
- [Conversation Component Docs](https://elevenlabs.io/docs/api-reference/conversational-ai)
- [ElevenLabs Dashboard](https://elevenlabs.io/app)

