'use client';

import { useState, useEffect } from 'react';
import { useConversation } from '@elevenlabs/react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Phone, PhoneOff, MessageSquare, X, Upload, Sparkles, Volume2 } from 'lucide-react';
import speechesDatabase from '@/public/speeches_database.json';

export default function Home() {
  const [showAnalyzer, setShowAnalyzer] = useState(false);
  const [userSpeech, setUserSpeech] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  const [improvedVersion, setImprovedVersion] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [callDuration, setCallDuration] = useState(0);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioUrl, setAudioUrl] = useState('');

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
      console.log('✅ Connected');
      setCallDuration(0);
    },
    onDisconnect: () => console.log('❌ Disconnected'),
    onMessage: (message) => console.log('💬 Message:', message),
    onError: (error) => {
      console.error('⚠️ Error:', error);
      alert(`Error: ${error.message}`);
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

  const analyzeSpeech = async () => {
    if (!userSpeech.trim()) {
      alert('Please enter your speech');
      return;
    }

    setIsAnalyzing(true);
    
    // Try AI-enhanced analysis first (if OpenAI key is configured on server)
    try {
      const response = await fetch('/api/analyze-speech', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userSpeech }),
      });

      if (response.ok) {
        const data = await response.json();
        setAnalysis({ ...data.analysis, enhanced: true });
        setImprovedVersion(data.improvedVersion);
        setIsAnalyzing(false);
        return;
      }
    } catch (error) {
      console.log('AI analysis not available, using free analysis');
    }
    
    // Fall back to free client-side analysis
    const { analyzeSpeech: analyze, generateImprovedVersion } = await import('@/lib/speech-analyzer');
    
    setTimeout(() => {
      try {
        const result = analyze(userSpeech);
        setAnalysis({ ...result, enhanced: false });
        
        const improved = generateImprovedVersion(userSpeech);
        setImprovedVersion(improved);
      } catch (error: any) {
        alert(`Analysis failed: ${error.message}`);
      } finally {
        setIsAnalyzing(false);
      }
    }, 500);
  };

  const generateVoice = async (text: string) => {
    if (!apiKey) {
      alert('Please enter your ElevenLabs API key');
      return;
    }

    setIsPlayingAudio(true);
    try {
      // Use ElevenLabs API directly via fetch
      const voiceId = 'pNInz6obpgDQGcFmaJgB'; // Default voice
      
      const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': apiKey
        },
        body: JSON.stringify({
          text: text,
          model_id: 'eleven_multilingual_v2',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.8,
            style: 0.4,
            use_speaker_boost: true
          }
        })
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Invalid ElevenLabs API key. Please check your settings.');
        }
        throw new Error(`API error: ${response.status}`);
      }

      const audioBlob = await response.blob();
      const url = URL.createObjectURL(audioBlob);
      setAudioUrl(url);
      
      const audioElement = new Audio(url);
      audioElement.play();
      audioElement.onended = () => setIsPlayingAudio(false);
    } catch (error: any) {
      alert(`Voice generation failed: ${error.message}`);
      setIsPlayingAudio(false);
    }
  };

  const startCall = async () => {
    if (!apiKey) {
      alert('Please enter your ElevenLabs API key');
      return;
    }
    try {
      await conversation.startSession({ agentId: AGENT_ID, apiKey });
    } catch (error: any) {
      alert(`Failed to connect: ${error.message}`);
    }
  };

  const endCall = async () => {
    await conversation.endSession();
    setCallDuration(0);
  };

  const isConnected = conversation.status === 'connected';

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        
        {!isConnected ? (
          <div className="space-y-8 text-center">
            <div className="space-y-2">
              <h1 className="text-sm font-medium text-slate-400 uppercase tracking-wide">
                World Bank Group
              </h1>
              <div className="flex justify-center">
                <div className="relative">
                  <Avatar className="w-32 h-32 ring-4 ring-[#0071bc] ring-offset-4 ring-offset-slate-950">
                    <AvatarImage src="https://www.worldbank.org/content/dam/photos/780x439/2023/jun-3/Ajay-Banga.jpg" />
                    <AvatarFallback className="bg-gradient-to-br from-[#0071bc] to-[#009fdb] text-white text-4xl font-bold">
                      AB
                    </AvatarFallback>
                  </Avatar>
                  <Badge className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-[#0071bc] text-white border-0">
                    President
                  </Badge>
                </div>
              </div>
              <h2 className="text-4xl font-semibold text-white mt-4">
                Ajay Banga
              </h2>
              <p className="text-lg text-slate-400">
                AI Voice Agent
              </p>
            </div>

            <div className="space-y-4">
              <Button
                size="lg"
                onClick={startCall}
                disabled={!apiKey}
                className="w-20 h-20 rounded-full bg-gradient-to-br from-[#4caf50] to-[#45a049] hover:from-[#45a049] hover:to-[#3d8b40] text-white shadow-2xl shadow-green-500/50 border-0 mx-auto block"
              >
                <Phone className="w-8 h-8" />
              </Button>
              <p className="text-sm text-slate-500">
                Tap to start conversation
              </p>
            </div>

            <div className="flex gap-4 justify-center">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowAnalyzer(true)}
                className="w-14 h-14 rounded-full bg-slate-800/50 hover:bg-slate-800 text-slate-300"
                title="Analyze Your Speech"
              >
                <Upload className="w-5 h-5" />
              </Button>
            </div>

            {!apiKey && (
              <Card className="bg-slate-900/50 border-slate-800 p-4 space-y-3">
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="ElevenLabs API Key"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder:text-slate-500 focus:ring-2 focus:ring-[#0071bc] focus:border-transparent text-sm"
                />
              </Card>
            )}
          </div>
        ) : (
          <div className="space-y-12 text-center py-12">
            <div className="space-y-6">
              <div className="flex justify-center">
                <Avatar className="w-40 h-40 ring-4 ring-[#0071bc] ring-offset-8 ring-offset-slate-950">
                  <AvatarImage src="https://www.worldbank.org/content/dam/photos/780x439/2023/jun-3/Ajay-Banga.jpg" />
                  <AvatarFallback className="bg-gradient-to-br from-[#0071bc] to-[#009fdb] text-white text-5xl font-bold">
                    AB
                  </AvatarFallback>
                </Avatar>
              </div>
              
              <div className="space-y-2">
                <h2 className="text-3xl font-semibold text-white">
                  Ajay Banga
                </h2>
                <Badge className="bg-[#0071bc] text-white border-0">
                  {conversation.isSpeaking ? '🔊 Speaking' : '👂 Listening'}
                </Badge>
              </div>

              <div className="text-5xl font-light text-slate-400 tabular-nums">
                {formatDuration(callDuration)}
              </div>
            </div>

            <div className="pt-16">
              <Button
                size="lg"
                onClick={endCall}
                className="w-20 h-20 rounded-full bg-gradient-to-br from-[#eb1c2d] to-[#c41526] hover:from-[#c41526] hover:to-[#a01120] text-white shadow-2xl shadow-red-500/50 border-0"
              >
                <PhoneOff className="w-8 h-8" />
              </Button>
            </div>
          </div>
        )}

        {/* Speech Analyzer Modal */}
        {showAnalyzer && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4 overflow-y-auto">
            <Card className="w-full max-w-2xl bg-slate-900 border-slate-700 p-6 space-y-4 rounded-t-3xl sm:rounded-3xl my-auto">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-[#0071bc]" />
                  <h3 className="text-xl font-semibold text-white">
                    CEO Alignment Checker
                  </h3>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setShowAnalyzer(false);
                    setAnalysis(null);
                    setImprovedVersion('');
                  }}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <p className="text-sm text-slate-400">
                Test if your content aligns with the CEO's values, vision, and communication style. Get instant AI-powered feedback based on real speeches.
              </p>
              
              <Card className="bg-green-500/10 border-green-500/30 p-3">
                <p className="text-xs text-green-400">
                  ✓ Analyzes alignment with leadership communication patterns from {speechesDatabase.total_speeches} speeches ({speechesDatabase.total_words.toLocaleString()} words)
                </p>
              </Card>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-2">
                    Your Content (Speech, Article, or Statement):
                  </label>
                  <textarea
                    value={userSpeech}
                    onChange={(e) => setUserSpeech(e.target.value)}
                    placeholder="Paste your content here to test alignment with CEO values, vision, and style..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder:text-slate-500 focus:ring-2 focus:ring-[#0071bc] focus:border-transparent h-32"
                  />
                </div>

                <Button
                  onClick={analyzeSpeech}
                  disabled={isAnalyzing || !userSpeech.trim()}
                  className="w-full bg-gradient-to-r from-[#0071bc] to-[#009fdb] hover:from-[#005a99] hover:to-[#0071bc] text-white"
                >
                  {isAnalyzing ? 'Analyzing Alignment...' : '✨ Test CEO Alignment'}
                </Button>

                {analysis && (
                  <div className="space-y-4 pt-4">
                    {/* Score */}
                    <Card className="bg-slate-950 border-slate-700 p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-slate-400">Similarity Score</span>
                          {analysis.enhanced && (
                            <Badge className="ml-2 bg-purple-500 text-white text-xs">
                              AI Enhanced
                            </Badge>
                          )}
                        </div>
                        <span className="text-3xl font-bold text-[#0071bc]">
                          {analysis.score}%
                        </span>
                      </div>
                    </Card>

                    {/* Strengths */}
                    <div>
                      <h4 className="text-sm font-semibold text-green-400 mb-2">
                        ✓ Aligned with CEO Style
                      </h4>
                      <Card className="bg-slate-950 border-slate-700 p-3">
                        <p className="text-sm text-slate-300">
                          {Array.isArray(analysis.strengths) 
                            ? analysis.strengths.join('. ') 
                            : analysis.strengths}
                        </p>
                      </Card>
                    </div>

                    {/* Improvements */}
                    <div>
                      <h4 className="text-sm font-semibold text-yellow-400 mb-2">
                        ⚠ Alignment Gaps
                      </h4>
                      <Card className="bg-slate-950 border-slate-700 p-3">
                        <p className="text-sm text-slate-300">
                          {Array.isArray(analysis.improvements) 
                            ? analysis.improvements.join('. ') 
                            : analysis.improvements}
                        </p>
                      </Card>
                    </div>

                    {/* Improved Version */}
                    {improvedVersion && (
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-sm font-semibold text-[#0071bc]">
                            Rewritten in CEO's Voice
                          </h4>
                          <Button
                            size="sm"
                            onClick={async () => {
                              if (!isConnected) {
                                // Start the call first
                                if (!apiKey) {
                                  alert('Please enter your ElevenLabs API key first');
                                  return;
                                }
                                try {
                                  await conversation.startSession({ agentId: AGENT_ID, apiKey });
                                  // Copy to clipboard for user to paste if needed
                                  navigator.clipboard.writeText(improvedVersion);
                                  alert('Call started! The agent is ready. You can now ask: "Please read this speech" and paste it, or the agent can discuss it with you.');
                                } catch (error: any) {
                                  alert(`Failed to start call: ${error.message}`);
                                }
                              } else {
                                // Already connected, just copy
                                navigator.clipboard.writeText(improvedVersion);
                                alert('Speech copied! You can now paste it in the conversation or ask the agent to discuss it.');
                              }
                              setShowAnalyzer(false);
                            }}
                            className="bg-[#0071bc] hover:bg-[#005a99]"
                          >
                            <Phone className="w-4 h-4 mr-1" />
                            {isConnected ? 'Copy to Call' : 'Start Call & Discuss'}
                          </Button>
                        </div>
                        <Card className="bg-slate-950 border-slate-700 p-4 max-h-64 overflow-y-auto">
                          <p className="text-sm text-slate-200 whitespace-pre-wrap leading-relaxed">
                            {improvedVersion}
                          </p>
                        </Card>
                        <p className="text-xs text-slate-500 mt-2">
                          💡 Tip: Click above to start a conversation with the CEO's AI voice. Ask them to read this aloud or discuss how to better align with their vision and values.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </Card>
          </div>
        )}
      </div>
    </main>
  );
}
