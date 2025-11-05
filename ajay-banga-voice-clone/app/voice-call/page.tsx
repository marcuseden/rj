'use client';

import { useState, useEffect } from 'react';
import { useConversation } from '@elevenlabs/react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Phone, PhoneOff } from 'lucide-react';
import { AppLayout } from '@/components/app-layout';

export default function VoiceCallPage() {
  const [apiKey, setApiKey] = useState('');
  const [callDuration, setCallDuration] = useState(0);

  useEffect(() => {
    const envKey = process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY;
    const savedKey = localStorage.getItem('elevenlabs_api_key');

    if (envKey) setApiKey(envKey);
    else if (savedKey) setApiKey(savedKey);
  }, []);

  useEffect(() => {
    if (apiKey && !process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY) {
      localStorage.setItem('elevenlabs_api_key', apiKey);
    }
  }, [apiKey]);

  const AGENT_ID = process.env.NEXT_PUBLIC_AGENT_ID || 'agent_2101k94jg1rpfef8hrt86n3qrm5q';

  const conversation = useConversation({
    onConnect: () => {
      console.log('✅ Voice call connected');
      setCallDuration(0);
    },
    onDisconnect: () => {
      console.log('❌ Voice call disconnected');
    },
    onMessage: (message) => {
      console.log('💬 Message:', message);
    },
    onError: (error) => {
      console.error('⚠️ Error:', error);
      alert(`Voice call error: ${typeof error === 'string' ? error : (error as any)?.message || 'Unknown error'}`);
    },
    onAudio: (_audioBase64) => {
      console.log('🔊 Audio received');
      // Audio is automatically played by the SDK
    },
  });

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (conversation.status === 'connected') {
      interval = setInterval(() => setCallDuration(prev => prev + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [conversation.status]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startCall = async () => {
    if (!apiKey) {
      const key = prompt('Enter your ElevenLabs API key:');
      if (!key) return;
      setApiKey(key);
      localStorage.setItem('elevenlabs_api_key', key);
    }

    try {
      await conversation.startSession({
        agentId: AGENT_ID,
        connectionType: 'webRTC' as any,
      });
    } catch (error) {
      console.error('Failed to start call:', error);
      alert('Failed to start voice call. Please check your API key.');
    }
  };

  const endCall = async () => {
    await conversation.endSession();
  };

  const isConnected = conversation.status === 'connected';
  const isConnecting = conversation.status === 'connecting';

  return (
    <AppLayout>
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          {/* Avatar */}
          <div className="flex justify-center mb-8">
            <div className="relative">
              <Avatar className={`w-32 h-32 ring-4 ${
                isConnected ? 'ring-green-500 animate-pulse' :
                isConnecting ? 'ring-yellow-500 animate-pulse' :
                'ring-stone-200'
              }`}>
                <AvatarImage
                  src="/ajay-banga.svg"
                  onError={(e) => e.currentTarget.style.display = 'none'}
                />
                <AvatarFallback className="bg-stone-100 text-stone-700 text-4xl font-bold">
                  AB
                </AvatarFallback>
              </Avatar>

              {/* Status indicator */}
              {isConnected && (
                <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-green-500 text-white border-0 text-xs">
                    Live
                  </Badge>
                </div>
              )}
            </div>
          </div>

          {/* Name */}
          <h2 className="text-2xl font-bold text-stone-900 mb-2">Ajay Banga</h2>
          <p className="text-stone-600 mb-8">President, World Bank Group</p>

          {/* Call Duration (only when connected) */}
          {isConnected && (
            <div className="mb-8">
              <div className="text-3xl font-mono text-green-600">
                {formatDuration(callDuration)}
              </div>
            </div>
          )}

          {/* Call Button */}
          <div className="flex items-center justify-center">
            {!isConnected && !isConnecting && (
              <button
                onClick={startCall}
                className="w-20 h-20 rounded-full bg-green-500 hover:bg-green-600 text-white flex items-center justify-center shadow-lg transition-colors"
              >
                <Phone className="w-8 h-8" />
              </button>
            )}

            {isConnected && (
              <button
                onClick={endCall}
                className="w-20 h-20 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center shadow-lg transition-colors"
              >
                <PhoneOff className="w-8 h-8" />
              </button>
            )}

            {isConnecting && (
              <div className="w-20 h-20 rounded-full bg-stone-100 flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-stone-400 border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}



