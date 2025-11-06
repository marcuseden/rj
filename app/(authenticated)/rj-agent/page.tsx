'use client';

import { useState, useEffect } from 'react';
import { Conversation } from '@elevenlabs/react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Phone, PhoneOff } from 'lucide-react';

export default function RJAgentPage() {
  const [callDuration, setCallDuration] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const agentId = process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID || '';

  // Call duration timer
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

  const handleConnect = () => {
    console.log('✅ Connected to Ajay Banga AI Agent');
    setIsConnected(true);
    setCallDuration(0);
  };

  const handleDisconnect = () => {
    console.log('📞 Call ended');
    setIsConnected(false);
    setCallDuration(0);
  };

  const handleError = (error: any) => {
    console.error('❌ Voice agent error:', error);
    setIsConnected(false);
    alert(`Voice agent error: ${error.message || 'Unknown error'}`);
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!agentId) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-stone-900 via-stone-800 to-stone-900 flex items-center justify-center p-6">
        <div className="text-center text-red-400">
          <p className="text-xl mb-4">❌ Configuration Error</p>
          <p>Please add NEXT_PUBLIC_ELEVENLABS_AGENT_ID to your .env.local file</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-900 via-stone-800 to-stone-900 flex items-center justify-center p-6">
      <Conversation
        agentId={agentId}
        onConnect={handleConnect}
        onDisconnect={handleDisconnect}
        onError={handleError}
        onMessage={(message) => console.log('💬 Message:', message)}
      >
        {({ conversation, status }) => (
          <div className="w-full max-w-md text-center">
            {/* Avatar */}
            <div className="mb-8">
              <Avatar className={`w-48 h-48 mx-auto border-4 transition-all duration-300 ${
                isConnected ? 'border-green-500 shadow-2xl shadow-green-500/50' : 'border-stone-600'
              }`}>
                <AvatarImage src="/ajay-banga-avatar.jpg" alt="Ajay Banga" />
                <AvatarFallback className="text-6xl font-bold bg-[#0071bc] text-white">
                  AB
                </AvatarFallback>
              </Avatar>
            </div>

            {/* Name and Title */}
            <h1 className="text-3xl font-bold text-white mb-2">
              Ajay Banga
            </h1>
            <p className="text-stone-400 mb-8">
              World Bank President • AI Voice Agent
            </p>

            {/* Call Duration or Status */}
            {isConnected && (
              <div className="mb-8">
                <div className="text-5xl font-light text-green-400 mb-3">
                  {formatDuration(callDuration)}
                </div>
                <Badge className="bg-green-500 text-white border-0 px-4 py-2">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse mr-2"></div>
                  Connected
                </Badge>
              </div>
            )}
            
            {!isConnected && <div className="mb-8"></div>}

            {/* Call Button */}
            {!isConnected ? (
              <button
                onClick={() => conversation.startSession()}
                disabled={status === 'connecting'}
                className="w-24 h-24 rounded-full bg-green-500 hover:bg-green-600 active:scale-95 flex items-center justify-center transition-all shadow-2xl mx-auto disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {status === 'connecting' ? (
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-white"></div>
                ) : (
                  <Phone className="h-12 w-12 text-white" />
                )}
              </button>
            ) : (
              <button
                onClick={() => conversation.endSession()}
                className="w-24 h-24 rounded-full bg-red-500 hover:bg-red-600 active:scale-95 flex items-center justify-center transition-all shadow-2xl mx-auto"
              >
                <PhoneOff className="h-12 w-12 text-white" />
              </button>
            )}

            {/* Status Message */}
            {status === 'connecting' && (
              <p className="text-stone-400 mt-6 animate-pulse">
                Connecting...
              </p>
            )}
          </div>
        )}
      </Conversation>
    </div>
  );
}
