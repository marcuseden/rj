'use client';

import { useState, useEffect } from 'react';
import { useConversation } from '@elevenlabs/react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Phone, PhoneOff, Volume2, Mic } from 'lucide-react';

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
    <div className="min-h-screen bg-gradient-to-b from-stone-900 via-stone-800 to-stone-900 flex flex-col items-center justify-between py-20 px-6">
      {/* Top Section - Avatar and Info */}
      <div className="flex-1 flex flex-col items-center justify-center">
        {/* Large Avatar - iPhone style */}
        <div className="mb-8 relative">
          <Avatar className={`w-40 h-40 border-4 ${isConnected ? 'border-green-500' : 'border-stone-600'} transition-all`}>
            <AvatarImage src="/ajay-banga-avatar.jpg" alt="Ajay Banga" />
            <AvatarFallback className={`text-5xl font-bold ${isConnected ? 'bg-[#0071bc] text-white' : 'bg-stone-200 text-stone-700'}`}>
              AB
            </AvatarFallback>
          </Avatar>
          {isConnected && (
            <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2">
              <Badge className="bg-green-500 text-white border-0 shadow-lg">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse mr-2"></div>
                Connected
              </Badge>
            </div>
          )}
        </div>

        {/* Name and Title */}
        <h1 className="text-4xl font-semibold text-white mb-3">
          Ajay Banga
        </h1>
        
        {isConnected ? (
          <div className="text-center">
            <div className="text-6xl font-light text-green-400 mb-2">
              {formatDuration(callDuration)}
            </div>
            <div className="flex items-center justify-center gap-2">
              <Volume2 className="h-4 w-4 text-green-400 animate-pulse" />
              <p className="text-lg text-stone-300">
                Call in progress
              </p>
            </div>
          </div>
        ) : (
          <>
            <p className="text-xl text-stone-400 mb-2">
              World Bank President
            </p>
            <p className="text-sm text-stone-500">
              AI Voice Agent
            </p>
          </>
        )}
      </div>

      {/* Bottom Section - Call Button */}
      <div className="flex flex-col items-center gap-8">
        {/* Info text */}
        {!isConnected && (
          <p className="text-stone-400 text-center max-w-md">
            Tap to start conversation
          </p>
        )}

        {/* Big Round Call Button - iPhone style */}
        {!isConnected ? (
          <button
            onClick={startCall}
            disabled={conversation.status === 'connecting'}
            className="w-24 h-24 rounded-full bg-green-500 hover:bg-green-600 active:scale-95 flex items-center justify-center transition-all shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {conversation.status === 'connecting' ? (
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-white"></div>
            ) : (
              <Phone className="h-12 w-12 text-white" />
            )}
          </button>
        ) : (
          <button
            onClick={endCall}
            className="w-24 h-24 rounded-full bg-red-500 hover:bg-red-600 active:scale-95 flex items-center justify-center transition-all shadow-2xl"
          >
            <PhoneOff className="h-12 w-12 text-white" />
          </button>
        )}

        {/* Additional info */}
        {!isConnected && (
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 text-xs text-stone-500">
              <Mic className="h-3 w-3" />
              <span>Powered by ElevenLabs</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
