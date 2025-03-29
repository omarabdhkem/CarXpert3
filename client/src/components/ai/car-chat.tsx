import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { t } from '@/i18n';
import { useAuth } from '@/hooks/use-auth';
import { MessageSquare, X, Send, ChevronUp, Loader2, Trash2 } from 'lucide-react';

interface ChatMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

interface CarChatProps {
  standalone?: boolean;
  fullHeight?: boolean;
}

export function CarChat({ standalone = false, fullHeight = false }: CarChatProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // إضافة رسالة ترحيب عند فتح المحادثة لأول مرة
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        {
          id: 'welcome',
          content: t('ai.welcome_message'),
          role: 'assistant',
          timestamp: new Date(),
        },
      ]);
    }
  }, [isOpen]);

  // التمرير إلى أسفل عند إضافة رسائل جديدة
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // التركيز على حقل الإدخال عند فتح المحادثة
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  const toggleChat = () => {
    setIsOpen(!isOpen);
    setError(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = {
      id: `user-${Date.now()}`,
      content: input.trim(),
      role: 'user' as const,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);
    setError(null);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage.content,
          userId: user?.id,
          context: messages.map((msg) => `${msg.role}: ${msg.content}`).join('\n'),
        }),
      });

      if (!response.ok) {
        throw new Error(t('ai.error_message'));
      }

      const data = await response.json();

      setMessages((prev) => [
        ...prev,
        {
          id: `assistant-${Date.now()}`,
          content: data.text,
          role: 'assistant',
          timestamp: new Date(),
        },
      ]);
    } catch (err) {
      console.error('Error sending message:', err);
      setError(t('ai.error_message'));
      toast({
        title: t('ai.error_title'),
        description: t('ai.error_description'),
        variant: 'destructive',
      });
    } finally {
      setIsTyping(false);
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: 'welcome',
        content: t('ai.welcome_message'),
        role: 'assistant',
        timestamp: new Date(),
      },
    ]);
  };

  const suggestedQuestions = [
    t('carChat.suggestedQuestion1'),
    t('carChat.suggestedQuestion2'),
    t('carChat.suggestedQuestion3'),
    t('carChat.suggestedQuestion4')
  ];

  const handleSuggestedQuestion = (question: string) => {
    setInput(question);
    setTimeout(() => {
      handleSendMessage();
    }, 100);
  };

  // تفعيل المحادثة في وضع standalone
  useEffect(() => {
    if (standalone) {
      setIsOpen(true);
      // إضافة رسالة ترحيب إذا لم تكن موجودة
      if (messages.length === 0) {
        setMessages([
          {
            id: 'welcome',
            content: t('ai.welcome_message'),
            role: 'assistant',
            timestamp: new Date(),
          },
        ]);
      }
    }
  }, [standalone]);

  // عرض المحادثة في وضع standalone داخل المكون المضيف
  if (standalone) {
    return (
      <div className={`w-full ${fullHeight ? 'h-full' : ''} flex flex-col`}>
        <div className="flex-grow overflow-auto">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`mb-4 ${
                message.role === 'assistant'
                  ? 'mr-8'
                  : 'ml-8'
              }`}
            >
              <div className="flex items-start gap-2">
                <div
                  className={`p-3 rounded-lg ${
                    message.role === 'assistant'
                      ? 'bg-muted/80 rounded-tl-none'
                      : 'bg-primary/10 rounded-tr-none'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                </div>
              </div>
              <div
                className={`mt-1 text-xs text-muted-foreground ${
                  message.role === 'assistant' ? 'text-right' : 'text-left'
                }`}
              >
                {message.role === 'assistant'
                  ? t('carChat.assistant')
                  : t('carChat.you')}
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="mb-4 mr-8">
              <div className="flex items-start gap-2">
                <div className="bg-muted/80 p-3 rounded-lg rounded-tl-none">
                  <div className="flex items-center gap-1">
                    <div className="h-2 w-2 bg-primary/50 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="h-2 w-2 bg-primary/50 rounded-full animate-bounce" style={{ animationDelay: '200ms' }}></div>
                    <div className="h-2 w-2 bg-primary/50 rounded-full animate-bounce" style={{ animationDelay: '400ms' }}></div>
                  </div>
                </div>
              </div>
              <div className="mt-1 text-xs text-muted-foreground text-right">
                {t('carChat.typing')}
              </div>
            </div>
          )}
          
          {error && (
            <div className="p-3 mb-4 rounded-lg bg-destructive/10 text-destructive text-sm">
              {error}
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
        
        {messages.length === 1 && (
          <div className="px-4 py-2 bg-muted/20">
            <p className="text-xs text-muted-foreground mb-2">{t('carChat.suggestedQuestions')}:</p>
            <div className="flex flex-wrap gap-2">
              {suggestedQuestions.map((question, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  className="text-xs py-1 h-auto"
                  onClick={() => handleSuggestedQuestion(question)}
                >
                  {question}
                </Button>
              ))}
            </div>
          </div>
        )}
        
        <div className="p-3 bg-background border-t mt-auto">
          <div className="flex gap-2">
            <textarea
              ref={inputRef}
              className="flex-1 min-h-[40px] max-h-[120px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
              placeholder={t('carChat.inputPlaceholder')}
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              rows={1}
              disabled={isTyping}
            />
            <Button
              size="icon"
              disabled={!input.trim() || isTyping}
              onClick={handleSendMessage}
            >
              {isTyping ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // عرض المحادثة كمكون قابل للفتح والإغلاق
  return (
    <>
      {isOpen ? (
        <div className="fixed bottom-0 right-0 md:right-4 w-full md:w-96 z-50 transition-transform duration-300 shadow-lg">
          <Card className="border rounded-t-lg overflow-hidden">
            <div className="bg-primary text-primary-foreground p-3 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                <h3 className="font-medium">{t('carChat.title')}</h3>
              </div>
              <div className="flex items-center gap-1">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-7 w-7 hover:bg-primary-foreground/10 text-primary-foreground"
                  onClick={clearChat}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-7 w-7 hover:bg-primary-foreground/10 text-primary-foreground"
                  onClick={toggleChat}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div className="h-[400px] overflow-y-auto p-4 bg-muted/30">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`mb-4 ${
                    message.role === 'assistant'
                      ? 'mr-8'
                      : 'ml-8'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <div
                      className={`p-3 rounded-lg ${
                        message.role === 'assistant'
                          ? 'bg-muted/80 rounded-tl-none'
                          : 'bg-primary/10 rounded-tr-none'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    </div>
                  </div>
                  <div
                    className={`mt-1 text-xs text-muted-foreground ${
                      message.role === 'assistant' ? 'text-right' : 'text-left'
                    }`}
                  >
                    {message.role === 'assistant'
                      ? t('carChat.assistant')
                      : t('carChat.you')}
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div className="mb-4 mr-8">
                  <div className="flex items-start gap-2">
                    <div className="bg-muted/80 p-3 rounded-lg rounded-tl-none">
                      <div className="flex items-center gap-1">
                        <div className="h-2 w-2 bg-primary/50 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="h-2 w-2 bg-primary/50 rounded-full animate-bounce" style={{ animationDelay: '200ms' }}></div>
                        <div className="h-2 w-2 bg-primary/50 rounded-full animate-bounce" style={{ animationDelay: '400ms' }}></div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground text-right">
                    {t('carChat.typing')}
                  </div>
                </div>
              )}
              
              {error && (
                <div className="p-3 mb-4 rounded-lg bg-destructive/10 text-destructive text-sm">
                  {error}
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
            
            {messages.length === 1 && (
              <div className="px-4 py-2 bg-muted/20">
                <p className="text-xs text-muted-foreground mb-2">{t('carChat.suggestedQuestions')}:</p>
                <div className="flex flex-wrap gap-2">
                  {suggestedQuestions.map((question, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      className="text-xs py-1 h-auto"
                      onClick={() => handleSuggestedQuestion(question)}
                    >
                      {question}
                    </Button>
                  ))}
                </div>
              </div>
            )}
            
            <div className="p-3 bg-background border-t">
              <div className="flex gap-2">
                <textarea
                  ref={inputRef}
                  className="flex-1 min-h-[40px] max-h-[120px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                  placeholder={t('carChat.inputPlaceholder')}
                  value={input}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  rows={1}
                  disabled={isTyping}
                />
                <Button
                  size="icon"
                  disabled={!input.trim() || isTyping}
                  onClick={handleSendMessage}
                >
                  {isTyping ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      ) : (
        <Button
          className="fixed bottom-4 right-4 rounded-full shadow-lg"
          size="icon"
          onClick={toggleChat}
        >
          <MessageSquare className="h-5 w-5" />
        </Button>
      )}
    </>
  );
}