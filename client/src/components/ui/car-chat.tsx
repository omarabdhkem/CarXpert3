import React, { useState, useRef, useEffect } from 'react';
import { Button } from './button';
import { Card } from './card';
import { Mic, Send, Bot, User, Loader2 } from 'lucide-react';
import { t } from '@/i18n';
import { useAuth } from '@/hooks/use-auth';
import { useQuery, useMutation } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { apiRequest } from '@/lib/queryClient';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

interface CarChatProps {
  className?: string;
}

export const CarChat: React.FC<CarChatProps> = ({ className }) => {
  const { user } = useAuth();
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);
  const [context, setContext] = useState<string[]>([]);

  useEffect(() => {
    // إضافة رسالة ترحيبية عند التحميل
    const welcomeMessage: Message = {
      id: 'welcome',
      text: t('ai.chat.welcome'),
      sender: 'ai',
      timestamp: new Date(),
    };
    setMessages([welcomeMessage]);

    // إعداد واجهة التعرف على الصوت إذا كانت متوفرة في المتصفح
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.lang = 'ar-SA'; // للغة العربية
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      setRecognition(recognition);
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && input.trim()) {
      e.preventDefault();
      sendMessage();
    }
  };

  const toggleVoiceInput = () => {
    if (isListening) {
      recognition?.stop();
      setIsListening(false);
    } else if (recognition) {
      recognition.start();
      setIsListening(true);
    }
  };

  const chatMutation = useMutation({
    mutationFn: async (message: string) => {
      const response = await apiRequest('POST', '/api/ai/chat', {
        message,
        context: context.slice(-5), // إرسال آخر 5 رسائل كسياق للمحادثة
        userId: user?.id
      });
      return await response.json();
    },
    onSuccess: (data) => {
      const aiResponse: Message = {
        id: `ai-${Date.now()}`,
        text: data.text,
        sender: 'ai',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiResponse]);
      
      // تحديث سياق المحادثة
      setContext((prev) => [...prev, input, data.text]);
    },
  });

  const sendMessage = () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      text: input,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    chatMutation.mutate(input);
    setInput('');
  };

  return (
    <Card className={className}>
      <div className="flex flex-col h-[600px]">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`flex items-start gap-2 max-w-[80%] ${
                  message.sender === 'user' 
                    ? 'flex-row-reverse' 
                    : 'flex-row'
                }`}
              >
                <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                  message.sender === 'user' 
                    ? 'bg-blue-100' 
                    : 'bg-indigo-100'
                }`}>
                  {message.sender === 'user' 
                    ? <User className="w-4 h-4 text-blue-600" /> 
                    : <Bot className="w-4 h-4 text-indigo-600" />
                  }
                </div>
                <div className={`p-3 rounded-2xl ${
                  message.sender === 'user' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {message.text}
                </div>
              </div>
            </motion.div>
          ))}
          {chatMutation.isPending && (
            <div className="flex justify-start">
              <div className="flex items-start gap-2">
                <div className="shrink-0 w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-indigo-600" />
                </div>
                <div className="p-3 rounded-2xl bg-gray-100 text-gray-800">
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{t('ai.chat.thinking')}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        <div className="p-4 border-t">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={input}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                placeholder={t('ai.chat.placeholder')}
                className="w-full p-3 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={chatMutation.isPending}
              />
            </div>
            {window.SpeechRecognition || window.webkitSpeechRecognition ? (
              <Button
                variant="outline"
                size="icon"
                onClick={toggleVoiceInput}
                disabled={chatMutation.isPending}
                className={isListening ? 'bg-red-100 text-red-600 animate-pulse' : ''}
              >
                <Mic className="w-5 h-5" />
              </Button>
            ) : null}
            <Button
              onClick={sendMessage}
              disabled={!input.trim() || chatMutation.isPending}
            >
              <Send className="w-5 h-5 mr-2" />
              {t('ai.chat.send')}
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};