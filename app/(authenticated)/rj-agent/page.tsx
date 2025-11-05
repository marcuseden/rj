'use client';

import { useState, useEffect } from 'react';
import { useConversation } from '@elevenlabs/react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Phone, PhoneOff, Volume2, Mic, MicOff } from 'lucide-react';

export default function RJAgentPage() {
  const [callDuration, setCallDuration] = useState(0);
  const [isConnected, setIsConnected] = useState(false);

  const conversation = useConversation({
    onConnect: () => {
      console.log('Connected to RJ Banga');
      setIsConnected(true);
      setCallDuration(0);
    },
    onDisconnect: () => {
      console.log('Disconnected');
      setIsConnected(false);
      setCallDuration(0);
    },
    onMessage: (message) => {
      console.log('Message:', message);
    },
    onError: (error) => {
      console.error('Error:', error);
      alert(`Voice error: ${error.message}`);
    },
  });

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isConnected) {
      interval = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isConnected]);

  const startCall = async () => {
    try {
      const agentId = process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID;
      if (!agentId) {
        alert('ElevenLabs Agent ID not configured');
        return;
      }
      await conversation.startSession({ 
        agentId,
        connectionType: 'websocket'
      });
    } catch (error: any) {
      console.error('Failed to start call:', error);
      alert('Failed to start voice call. Please check your ElevenLabs configuration.');
    }
  };

  const endCall = async () => {
    await conversation.endSession();
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <div className="bg-white border-b border-stone-200 px-6 py-4">
        <h1 className="text-2xl font-semibold text-stone-900">RJ Banga Voice Agent</h1>
        <p className="text-sm text-stone-600 mt-1">Voice conversation with AI trained on Ajay Banga's speeches</p>
      </div>

      <div className="flex items-center justify-center min-h-[calc(100vh-80px)] p-6">
        <Card className="w-full max-w-md bg-white border-stone-200 shadow-xl">
          <CardContent className="p-12 text-center">
            {/* Avatar */}
            <div className="mb-8">
              <div className={`w-32 h-32 mx-auto rounded-full bg-gradient-to-br ${
                isConnected 
                  ? 'from-[#0071bc] to-[#005a99] animate-pulse' 
                  : 'from-stone-100 to-stone-200'
              } flex items-center justify-center relative`}>
                {isConnected ? (
                  <Volume2 className="h-16 w-16 text-white animate-pulse" />
                ) : (
                  <div className="text-3xl font-bold text-stone-700">AB</div>
                )}
                {isConnected && (
                  <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-green-500 text-white border-0">
                      Connected
                    </Badge>
                  </div>
                )}
              </div>
            </div>

            {/* Name and Title */}
            <h2 className="text-2xl font-bold text-stone-900 mb-2">
              Ajay Banga
            </h2>
            <p className="text-stone-600 mb-8">
              AI Voice Agent
            </p>

            {/* Call Duration */}
            {isConnected && (
              <div className="mb-8">
                <div className="text-4xl font-bold text-[#0071bc] mb-2">
                  {formatDuration(callDuration)}
                </div>
                <div className="flex items-center justify-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-stone-600">Call in progress</span>
                </div>
              </div>
            )}

            {/* Call Status */}
            {!isConnected && (
              <div className="mb-8">
                <p className="text-stone-600 mb-4">
                  Tap to start a voice conversation
                </p>
                <div className="flex items-center justify-center gap-2 text-xs text-stone-500">
                  <Mic className="h-3 w-3" />
                  <span>Voice-powered by ElevenLabs</span>
                </div>
              </div>
            )}

            {/* Call Button */}
            <div className="flex justify-center gap-4">
              {!isConnected ? (
                <button
                  onClick={startCall}
                  disabled={conversation.status === 'connecting'}
                  className="w-20 h-20 rounded-full bg-green-500 hover:bg-green-600 flex items-center justify-center transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Phone className="h-10 w-10 text-white" />
                </button>
              ) : (
                <button
                  onClick={endCall}
                  className="w-20 h-20 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center transition-all shadow-lg hover:shadow-xl"
                >
                  <PhoneOff className="h-10 w-10 text-white" />
                </button>
              )}
            </div>

            {/* Info */}
            {!isConnected && (
              <div className="mt-8 pt-8 border-t border-stone-200">
                <p className="text-xs text-stone-500">
                  This agent has knowledge of World Bank strategy, RJ Banga's speeches, and development initiatives. Ask about climate action, poverty reduction, partnerships, or any World Bank topics.
                </p>
              </div>
            )}

            {/* Conversation Status */}
            {conversation.status === 'connecting' && (
              <div className="mt-6">
                <div className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#0071bc]"></div>
                  <span className="text-sm text-stone-600">Connecting...</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
