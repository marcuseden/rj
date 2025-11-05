'use client';

import { useState, useEffect, useRef } from 'react';
import { useConversation } from '@elevenlabs/react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Phone, PhoneOff, Volume2, Mic, MessageSquare } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function RJAgentPage() {
  const [callDuration, setCallDuration] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Handle incoming messages from the AI
  const handleMessage = (message: any) => {
    console.log('Message received:', message);
    
    // Handle different message types from ElevenLabs
    if (message.type === 'agent_response' || message.message) {
      const content = message.message || message.text || message.content || '';
      
      if (content) {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content,
          timestamp: new Date()
        }]);
        setIsSpeaking(true);
        
        // Reset speaking state after a delay
        setTimeout(() => setIsSpeaking(false), 2000);
      }
    }
    
    // Handle user transcript
    if (message.type === 'user_transcript' || message.user_transcript) {
      const content = message.user_transcript || message.text || '';
      
      if (content) {
        setMessages(prev => [...prev, {
          role: 'user',
          content,
          timestamp: new Date()
        }]);
      }
    }
    
    // Handle audio events
    if (message.type === 'audio') {
      handleAudio(message);
    }
  };

  // Handle audio-related events
  const handleAudio = (audioData: any) => {
    console.log('Audio event:', audioData);
    
    // Handle audio level for visualization
    if (audioData.level !== undefined) {
      setAudioLevel(audioData.level);
    }
    
    // Handle speaking state
    if (audioData.speaking !== undefined) {
      setIsSpeaking(audioData.speaking);
    }
    
    // Handle listening state (user is speaking)
    if (audioData.listening !== undefined) {
      setIsListening(audioData.listening);
    }
    
    // Handle playback state changes
    if (audioData.state === 'playing') {
      setIsSpeaking(true);
    } else if (audioData.state === 'stopped' || audioData.state === 'paused') {
      setIsSpeaking(false);
    }
  };

  const conversation = useConversation({
    onConnect: () => {
      console.log('Connected to RJ Banga');
      setIsConnected(true);
      setCallDuration(0);
      setMessages([]);
      
      // Add welcome message
      setMessages([{
        role: 'assistant',
        content: 'Hello! I\'m ready to discuss World Bank strategies and initiatives. How can I help you today?',
        timestamp: new Date()
      }]);
    },
    onDisconnect: () => {
      console.log('Disconnected');
      setIsConnected(false);
      setCallDuration(0);
      setIsSpeaking(false);
      setIsListening(false);
      setAudioLevel(0);
    },
    onMessage: handleMessage,
    onError: (error) => {
      console.error('Error:', error);
      alert(`Voice error: ${error.message}`);
      setIsSpeaking(false);
      setIsListening(false);
    },
  });

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

  // Auto-scroll messages to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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
    <div className="min-h-screen bg-gradient-to-b from-stone-900 via-stone-800 to-stone-900 flex flex-col">
      {/* Header - Avatar and Status */}
      <div className="flex-shrink-0 bg-stone-900/80 backdrop-blur-sm border-b border-stone-700 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Avatar className={`w-16 h-16 border-2 ${isConnected ? 'border-green-500' : 'border-stone-600'} transition-all`}>
              <AvatarImage src="/ajay-banga-avatar.jpg" alt="Ajay Banga" />
              <AvatarFallback className={`text-2xl font-bold ${isConnected ? 'bg-[#0071bc] text-white' : 'bg-stone-200 text-stone-700'}`}>
                AB
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-xl font-semibold text-white">
                Ajay Banga
              </h1>
              <p className="text-sm text-stone-400">
                World Bank President • AI Voice Agent
              </p>
            </div>
          </div>
          
          {isConnected && (
            <div className="text-right">
              <div className="text-3xl font-light text-green-400 mb-1">
                {formatDuration(callDuration)}
              </div>
              <div className="flex items-center justify-end gap-2">
                {isSpeaking && <Volume2 className="h-4 w-4 text-green-400 animate-pulse" />}
                {isListening && <Mic className="h-4 w-4 text-blue-400 animate-pulse" />}
                <Badge className="bg-green-500 text-white border-0">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse mr-2"></div>
                  Connected
                </Badge>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Conversation Transcript */}
      {isConnected && messages.length > 0 && (
        <div className="flex-1 overflow-y-auto px-6 py-6">
          <div className="max-w-4xl mx-auto space-y-4">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    msg.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-stone-700 text-stone-100'
                  }`}
                >
                  <p className="text-sm leading-relaxed">{msg.content}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </div>
      )}

      {/* Empty State - Before Call */}
      {!isConnected && (
        <div className="flex-1 flex flex-col items-center justify-center px-6">
          <Avatar className="w-40 h-40 border-4 border-stone-600 mb-6">
            <AvatarImage src="/ajay-banga-avatar.jpg" alt="Ajay Banga" />
            <AvatarFallback className="text-5xl font-bold bg-stone-200 text-stone-700">
              AB
            </AvatarFallback>
          </Avatar>
          
          <h2 className="text-2xl font-semibold text-white mb-2">
            AI Voice Conversation
          </h2>
          <p className="text-stone-400 text-center max-w-md mb-8">
            Have a voice conversation with an AI trained on World Bank strategies and RJ Banga's leadership vision
          </p>
          
          <div className="flex flex-wrap gap-2 justify-center mb-8">
            <Badge variant="outline" className="bg-stone-800/50 text-stone-300 border-stone-600">
              Natural Voice
            </Badge>
            <Badge variant="outline" className="bg-stone-800/50 text-stone-300 border-stone-600">
              Real-time Responses
            </Badge>
            <Badge variant="outline" className="bg-stone-800/50 text-stone-300 border-stone-600">
              Strategic Insights
            </Badge>
          </div>
        </div>
      )}

      {/* Bottom Section - Call Controls */}
      <div className="flex-shrink-0 bg-stone-900/80 backdrop-blur-sm border-t border-stone-700 px-6 py-8">
        <div className="max-w-4xl mx-auto flex flex-col items-center gap-4">
          {/* Audio Level Indicator */}
          {isConnected && audioLevel > 0 && (
            <div className="w-full max-w-xs">
              <div className="h-1 bg-stone-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-green-500 to-blue-500 transition-all duration-150"
                  style={{ width: `${Math.min(audioLevel * 100, 100)}%` }}
                />
              </div>
            </div>
          )}

          {/* Status Text */}
          {isConnected ? (
            <div className="flex items-center gap-3 text-sm">
              {isSpeaking && (
                <span className="flex items-center gap-2 text-green-400">
                  <Volume2 className="h-4 w-4 animate-pulse" />
                  AI Speaking...
                </span>
              )}
              {isListening && (
                <span className="flex items-center gap-2 text-blue-400">
                  <Mic className="h-4 w-4 animate-pulse" />
                  Listening...
                </span>
              )}
              {!isSpeaking && !isListening && (
                <span className="text-stone-400">
                  Speak to continue the conversation
                </span>
              )}
            </div>
          ) : (
            <p className="text-stone-400 text-center">
              Tap the button below to start
            </p>
          )}

          {/* Call Button */}
          {!isConnected ? (
            <button
              onClick={startCall}
              disabled={conversation.status === 'connecting'}
              className="w-20 h-20 rounded-full bg-green-500 hover:bg-green-600 active:scale-95 flex items-center justify-center transition-all shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {conversation.status === 'connecting' ? (
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
              ) : (
                <Phone className="h-10 w-10 text-white" />
              )}
            </button>
          ) : (
            <button
              onClick={endCall}
              className="w-20 h-20 rounded-full bg-red-500 hover:bg-red-600 active:scale-95 flex items-center justify-center transition-all shadow-2xl"
            >
              <PhoneOff className="h-10 w-10 text-white" />
            </button>
          )}

          {/* Powered by */}
          <div className="flex items-center gap-2 text-xs text-stone-500">
            <Mic className="h-3 w-3" />
            <span>Powered by ElevenLabs</span>
          </div>
        </div>
      </div>
    </div>
  );
}
