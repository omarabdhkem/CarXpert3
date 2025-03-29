import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'wouter';
import { Mic, Loader2, MicOff, Search } from 'lucide-react';
import { t } from '@/i18n';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';

interface VoiceSearchProps {
  largeDisplay?: boolean;
}

export function VoiceSearch({ largeDisplay = false }: VoiceSearchProps) {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isSupported, setIsSupported] = useState(true);
  const [showPopup, setShowPopup] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // مرجع للميكروفون
  const recognitionRef = useRef<any>(null);
  
  // إعداد API للتعرف على الصوت
  useEffect(() => {
    // التحقق من دعم المتصفح للتعرف على الصوت
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'ar-SA'; // ضبط اللغة للعربية
      
      recognitionRef.current.onresult = (event: any) => {
        const result = event.results[0];
        const transcript = result[0].transcript;
        setTranscript(transcript);
        
        // إذا كانت النتيجة نهائية، قم بمعالجتها
        if (result.isFinal) {
          handleVoiceCommand(transcript);
        }
      };
      
      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
      
      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        setIsListening(false);
        toast({
          title: t('common.error'),
          description: t('voiceSearch.errorRecognizing'),
          variant: 'destructive',
        });
      };
    } else {
      setIsSupported(false);
    }
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [toast]);
  
  // بدء الاستماع
  const startListening = () => {
    if (!isSupported) {
      toast({
        title: t('common.notSupported'),
        description: t('voiceSearch.browserNotSupported'),
        variant: 'destructive',
      });
      return;
    }
    
    setIsListening(true);
    setTranscript('');
    setShowPopup(true);
    
    try {
      recognitionRef.current.start();
    } catch (error) {
      console.error('Failed to start speech recognition', error);
      setIsListening(false);
      toast({
        title: t('common.error'),
        description: t('voiceSearch.failedToStart'),
        variant: 'destructive',
      });
    }
  };
  
  // إيقاف الاستماع
  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  };
  
  // معالجة الأمر الصوتي
  const handleVoiceCommand = async (text: string) => {
    if (!text.trim()) return;
    
    setIsProcessing(true);
    
    try {
      // إرسال النص إلى الخادم للمعالجة
      const response = await fetch('/api/ai/voice-search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: text,
          userId: user?.id,
        }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      // التحقق من وجود أخطاء
      if (result.error) {
        throw new Error(result.error);
      }
      
      // معالجة النتائج
      processSearchResults(result);
    } catch (error) {
      console.error('Error processing voice command', error);
      toast({
        title: t('common.error'),
        description: t('voiceSearch.processingError'),
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
      setTimeout(() => {
        setShowPopup(false);
      }, 1000);
    }
  };
  
  // معالجة نتائج البحث
  const processSearchResults = (results: any) => {
    // بناء عنوان URL للبحث مع الفلاتر
    let searchUrl = '/cars?';
    const params = new URLSearchParams();
    
    if (results.processedQuery) {
      params.append('q', results.processedQuery);
    }
    
    // إضافة الفلاتر إلى URL
    if (results.filters) {
      const filters = results.filters;
      
      if (filters.make) {
        params.append('make', Array.isArray(filters.make) ? filters.make[0] : filters.make);
      }
      
      if (filters.model) {
        params.append('model', Array.isArray(filters.model) ? filters.model[0] : filters.model);
      }
      
      if (filters.color) {
        params.append('color', filters.color);
      }
      
      if (filters.bodyType) {
        params.append('bodyType', filters.bodyType);
      }
      
      if (filters.yearRange) {
        if (filters.yearRange.min) params.append('yearMin', filters.yearRange.min.toString());
        if (filters.yearRange.max) params.append('yearMax', filters.yearRange.max.toString());
      }
      
      if (filters.priceRange) {
        if (filters.priceRange.min) params.append('priceMin', filters.priceRange.min.toString());
        if (filters.priceRange.max) params.append('priceMax', filters.priceRange.max.toString());
      }
    }
    
    // الانتقال إلى صفحة البحث مع الفلاتر
    searchUrl += params.toString();
    navigate(searchUrl);
    
    toast({
      title: t('voiceSearch.searchResults'),
      description: results.results ? `${results.results.length} ${t('voiceSearch.carsFound')}` : t('voiceSearch.processingSearch'),
    });
  };
  
  return (
    <>
      {largeDisplay ? (
        <button
          onClick={isListening ? stopListening : startListening}
          className={`w-full h-full rounded-full flex items-center justify-center transition-all ${
            isListening 
              ? 'bg-red-500 text-white animate-pulse' 
              : 'bg-[var(--primary)] text-white hover:bg-[var(--primary-dark)]'
          }`}
          disabled={isProcessing}
          aria-label={isListening ? t('voiceSearch.stopListening') : t('voiceSearch.startListening')}
        >
          {isProcessing ? (
            <Loader2 className="h-12 w-12 animate-spin" />
          ) : isListening ? (
            <MicOff className="h-12 w-12" />
          ) : (
            <Mic className="h-12 w-12" />
          )}
        </button>
      ) : (
        <button
          onClick={isListening ? stopListening : startListening}
          className={`w-14 h-14 rounded-full flex items-center justify-center shadow-md transition-all ${
            isListening 
              ? 'bg-red-500 text-white animate-pulse' 
              : 'bg-white text-[var(--primary)] hover:bg-gray-100'
          }`}
          disabled={isProcessing}
          aria-label={isListening ? t('voiceSearch.stopListening') : t('voiceSearch.startListening')}
        >
          {isProcessing ? (
            <Loader2 className="h-6 w-6 animate-spin" />
          ) : isListening ? (
            <MicOff className="h-6 w-6" />
          ) : (
            <Mic className="h-6 w-6" />
          )}
        </button>
      )}
      
      {/* نافذة منبثقة للنص المستمع */}
      {showPopup && (
        <div className="fixed inset-x-0 bottom-24 z-50 flex justify-center px-4 pointer-events-none">
          <div className="bg-white rounded-lg shadow-lg p-4 max-w-md w-full pointer-events-auto animate-in fade-in slide-in-from-bottom-5">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium text-gray-900 flex items-center">
                <Mic className="h-4 w-4 mr-2 text-[var(--primary)]" />
                {isListening ? t('voiceSearch.listening') : t('voiceSearch.processing')}
              </h3>
              <button 
                onClick={() => {
                  stopListening();
                  setShowPopup(false);
                }}
                className="text-gray-400 hover:text-gray-600"
                aria-label={t('common.close')}
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="min-h-[60px] bg-gray-50 rounded p-3 mb-3 text-gray-700 text-sm overflow-hidden">
              {transcript || (
                <span className="text-gray-400">
                  {isListening ? t('voiceSearch.sayCommand') : t('voiceSearch.processing')}
                </span>
              )}
              {isListening && (
                <span className="inline-block w-1.5 h-4 bg-[var(--primary)] ml-1 animate-pulse">
                  &nbsp;
                </span>
              )}
            </div>
            
            <div className="flex text-xs text-gray-500 items-center">
              <Search className="h-3 w-3 mr-1" />
              <span>
                {t('voiceSearch.examples')}: "{t('voiceSearch.exampleQuery1')}", "{t('voiceSearch.exampleQuery2')}"
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}