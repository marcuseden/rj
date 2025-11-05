'use client';

import { useState, useEffect, useRef } from 'react';
import { Send, Mic, StopCircle, Bot, User as UserIcon, Sparkles, FileText } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useConversation } from '@elevenlabs/react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  sources?: {
    title: string;
    url: string;
  }[];
}

export default function RJAgentPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // ElevenLabs conversation for voice mode
  const conversation = useConversation({
    onMessage: (message) => {
      if (message.source === 'ai') {
        addMessage('assistant', message.message);
      }
    },
    onConnect: () => {
      console.log('Connected to RJ Agent voice');
    },
    onError: (error) => {
      console.error('Voice error:', error);
    }
  });

  useEffect(() => {
    // Welcome message
    addMessage('assistant', "Hello! I'm the RJ Banga AI Assistant, trained on Ajay Banga's speeches and World Bank strategy documents. I can help you understand World Bank initiatives, strategic priorities, and provide insights based on his leadership vision. How can I assist you today?");
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const addMessage = (role: 'user' | 'assistant', content: string, sources?: Message['sources']) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      role,
      content,
      timestamp: new Date(),
      sources
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = inputMessage;
    setInputMessage('');
    addMessage('user', userMessage);

    // Simulate AI response (would integrate with OpenAI/Claude + World Bank knowledge)
    setTimeout(() => {
      const response = generateResponse(userMessage);
      addMessage('assistant', response.content, response.sources);
    }, 1000);
  };

  const generateResponse = (query: string): { content: string; sources?: Message['sources'] } => {
    const queryLower = query.toLowerCase();

    // Simple keyword-based responses (would be replaced with actual AI)
    if (queryLower.includes('climate')) {
      return {
        content: "RJ Banga has made climate action a top priority. At COP28, he announced that the World Bank is committing 45% of annual financing to climate by 2025 - over $40 billion per year. He emphasizes that climate change affects us all differently, which is why World Bank resources are deployed equally for both mitigation and adaptation. The focus is on concrete solutions that work - like the methane reduction blueprint targeting 15 national programs.",
        sources: [
          { title: "Remarks at COP28 Climate Finance Event", url: "http://documents.worldbank.org/..." },
          { title: "High Level Segment Summit on Methane", url: "http://documents.worldbank.org/..." }
        ]
      };
    }

    if (queryLower.includes('evolution') || queryLower.includes('roadmap')) {
      return {
        content: "The Evolution Roadmap is central to RJ Banga's vision for transforming the World Bank. It focuses on making the institution more effective, approachable, and impactful. Key elements include: shortening project approval processes, integrating operations across departments, expanding concessional financing for low-income countries, and measuring success by concrete outcomes - girls in school, jobs created, and private sector dollars mobilized.",
        sources: [
          { title: "Remarks at IDA Midterm Review", url: "http://documents.worldbank.org/..." }
        ]
      };
    }

    if (queryLower.includes('agriculture') || queryLower.includes('food')) {
      return {
        content: "At the Agriculture and Food event in October 2024, RJ Banga announced a strategic pivot to create a comprehensive agribusiness ecosystem. The World Bank is doubling commitments to $9 billion annually by 2030. He identified four key shifts: climate-smart agriculture, new financial derisking tools, digitalization to connect farmers with services, and strengthening farmer associations. This initiative targets 1.2 billion young people in developing countries who need employment.",
        sources: [
          { title: "Remarks on Agriculture as Engine of Growth", url: "http://documents.worldbank.org/..." }
        ]
      };
    }

    if (queryLower.includes('africa')) {
      return {
        content: "RJ Banga sees tremendous potential in Africa. At the IDA for Africa Summit, he emphasized that Africa's transformation requires strategic investments in people, infrastructure, and job-generating industries. He cited concrete examples like mini-grid systems in Nigeria that cut farmers' work time in half and enabled digital payments. The focus is on unity among African leaders and partnerships between governments, international community, and private sector.",
        sources: [
          { title: "IDA for Africa Heads of State Summit", url: "http://documents.worldbank.org/..." }
        ]
      };
    }

    return {
      content: "I can help you learn about RJ Banga's strategic vision for the World Bank. Try asking about:\n\n• Climate action and financing\n• The Evolution Roadmap\n• Agriculture and food security\n• Africa development initiatives\n• Poverty reduction strategies\n• Partnership approaches\n• Specific World Bank programs\n\nWhat would you like to know?"
    };
  };

  const toggleVoiceMode = async () => {
    if (isVoiceMode) {
      await conversation.endSession();
      setIsVoiceMode(false);
    } else {
      try {
        const agentId = process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID;
        if (agentId) {
          await conversation.startSession({ agentId, connectionType: 'websocket' });
          setIsVoiceMode(true);
        }
      } catch (error) {
        console.error('Failed to start voice:', error);
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col">
      <div className="bg-white border-b border-stone-200 px-6 py-4">
        <h1 className="text-2xl font-semibold text-stone-900">RJ Banga AI Agent</h1>
        <p className="text-sm text-stone-600 mt-1">AI assistant trained on Ajay Banga's speeches and World Bank strategy</p>
      </div>

      <div className="flex-1 max-w-4xl mx-auto w-full px-4 py-6 pb-32">
        {/* Info Banner */}
        <Card className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Sparkles className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <p className="text-sm text-gray-700">
                  <strong>Knowledge Base:</strong> Trained on {/* will be dynamic */}10+ speeches and documents from 2024
                </p>
                <div className="flex flex-wrap gap-2 mt-2">
                  <Badge variant="secondary" className="text-xs">Climate Action</Badge>
                  <Badge variant="secondary" className="text-xs">Evolution Roadmap</Badge>
                  <Badge variant="secondary" className="text-xs">Agriculture Initiative</Badge>
                  <Badge variant="secondary" className="text-xs">Africa Development</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Messages */}
        <div className="space-y-4 mb-6">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {message.role === 'assistant' && (
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                  <Bot className="h-5 w-5 text-white" />
                </div>
              )}

              <div className={`max-w-[80%] ${message.role === 'user' ? 'order-first' : ''}`}>
                <Card className={message.role === 'user' ? 'bg-blue-600 text-white' : 'bg-white'}>
                  <CardContent className="p-4">
                    <p className={`text-sm leading-relaxed ${message.role === 'user' ? 'text-white' : 'text-gray-900'}`}>
                      {message.content}
                    </p>

                    {message.sources && message.sources.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <p className="text-xs font-medium text-gray-500 mb-2">Sources:</p>
                        <div className="space-y-1">
                          {message.sources.map((source, idx) => (
                            <a
                              key={idx}
                              href={source.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800"
                            >
                              <FileText className="h-3 w-3" />
                              {source.title}
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
                <span className="text-xs text-gray-500 ml-2">
                  {message.timestamp.toLocaleTimeString()}
                </span>
              </div>

              {message.role === 'user' && (
                <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center flex-shrink-0">
                  <UserIcon className="h-5 w-5 text-white" />
                </div>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area (Fixed at bottom) */}
      <div className="fixed bottom-20 left-0 right-0 bg-white border-t border-gray-200 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex gap-2">
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask about World Bank strategy, initiatives, or RJ Banga's vision..."
              className="flex-1"
              disabled={isVoiceMode}
            />
            <Button
              onClick={toggleVoiceMode}
              variant={isVoiceMode ? 'destructive' : 'outline'}
              size="icon"
            >
              {isVoiceMode ? (
                <StopCircle className="h-5 w-5" />
              ) : (
                <Mic className="h-5 w-5" />
              )}
            </Button>
            <Button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isVoiceMode}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Send className="h-5 w-5" />
            </Button>
          </div>
          {isVoiceMode && (
            <p className="text-sm text-center text-gray-600 mt-2">
              🎤 Voice mode active - speak naturally
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

