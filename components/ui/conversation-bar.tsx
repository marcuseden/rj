'use client';

import { Conversation } from '@elevenlabs/react';
import { Phone, PhoneOff } from 'lucide-react';
import { useState } from 'react';

interface ConversationBarProps {
  agentId: string;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onMessage?: (message: any) => void;
  onError?: (error: any) => void;
}

export function ConversationBar({
  agentId,
  onConnect,
  onDisconnect,
  onMessage,
  onError
}: ConversationBarProps) {
  const [isConnected, setIsConnected] = useState(false);

  const handleConnect = () => {
    console.log('✅ Connected to voice agent');
    setIsConnected(true);
    onConnect?.();
  };

  const handleDisconnect = () => {
    console.log('📞 Disconnected from voice agent');
    setIsConnected(false);
    onDisconnect?.();
  };

  const handleMessage = (message: any) => {
    console.log('💬 Message:', message);
    onMessage?.(message);
  };

  const handleError = (error: any) => {
    console.error('❌ Error:', error);
    setIsConnected(false);
    onError?.(error);
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <Conversation
        agentId={agentId}
        onConnect={handleConnect}
        onDisconnect={handleDisconnect}
        onMessage={handleMessage}
        onError={handleError}
        className="w-full"
      >
        {({ conversation, status }) => (
          <div className="flex flex-col items-center gap-4">
            {/* Call Button */}
            {!isConnected ? (
              <button
                onClick={() => conversation.startSession()}
                disabled={status === 'connecting'}
                className="w-24 h-24 rounded-full bg-green-500 hover:bg-green-600 active:scale-95 flex items-center justify-center transition-all shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Start voice call"
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
                className="w-24 h-24 rounded-full bg-red-500 hover:bg-red-600 active:scale-95 flex items-center justify-center transition-all shadow-2xl"
                aria-label="End voice call"
              >
                <PhoneOff className="h-12 w-12 text-white" />
              </button>
            )}

            {/* Status Message */}
            {status === 'connecting' && (
              <p className="text-stone-400 animate-pulse">
                Connecting to voice agent...
              </p>
            )}
          </div>
        )}
      </Conversation>
    </div>
  );
}

