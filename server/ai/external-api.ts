import { getAIConfig, AIConfig } from './config';
import fetch from 'node-fetch';

/**
 * نموذج استجابة الذكاء الاصطناعي
 */
export interface AIResponse {
  text: string;
  raw?: any;
  metadata?: {
    usage?: {
      promptTokens?: number;
      completionTokens?: number;
      totalTokens?: number;
    };
    model?: string;
    finishReason?: string;
  };
}

/**
 * نموذج طلب الذكاء الاصطناعي
 */
export interface AIRequest {
  prompt: string;
  systemPrompt?: string;
  maxTokens?: number;
  temperature?: number;
  model?: string;
  imageBase64?: string; // دعم إرفاق الصور مع الطلب
}

/**
 * استدعاء OpenAI API
 */
async function callOpenAI(request: AIRequest, config: AIConfig): Promise<AIResponse> {
  const apiKey = config.apiKey;
  if (!apiKey) {
    throw new Error('OpenAI API key is required');
  }
  
  // إذا كانت هناك صورة، نستخدم نموذج يدعم الصور
  const hasImage = !!request.imageBase64;
  const model = hasImage 
    ? 'gpt-4-vision-preview' 
    : (request.model || config.model || 'gpt-3.5-turbo');
  
  const endpoint = config.endpoint || 'https://api.openai.com/v1/chat/completions';
  
  const messages = [];
  
  // إضافة رسالة النظام إذا كانت موجودة
  if (request.systemPrompt) {
    messages.push({
      role: 'system',
      content: request.systemPrompt
    });
  }
  
  // إضافة رسالة المستخدم
  if (hasImage) {
    // تنسيق خاص للرسائل مع صور
    messages.push({
      role: 'user',
      content: [
        { type: 'text', text: request.prompt },
        { 
          type: 'image_url', 
          image_url: {
            url: request.imageBase64,
            detail: 'high' // نستخدم جودة عالية للصور
          }
        }
      ]
    });
    
    // تسجيل للمراقبة
    console.log('Sending image to OpenAI Vision API with model:', model);
  } else {
    // رسالة نصية عادية
    messages.push({
      role: 'user',
      content: request.prompt
    });
  }
  
  const openAIRequest = {
    model,
    messages,
    max_tokens: request.maxTokens || config.maxTokens || 1000,
    temperature: request.temperature !== undefined ? request.temperature : (config.temperature || 0.7)
  };
  
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(openAIRequest)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API error response:', errorData);
      throw new Error(`OpenAI API error: ${errorData.error?.message || response.statusText}`);
    }
    
    const data = await response.json();
    
    // تسجيل جزء من الرد للمراقبة
    if (hasImage) {
      const responsePreview = data.choices && data.choices[0] && data.choices[0].message 
        ? data.choices[0].message.content.substring(0, 100) + '...' 
        : 'No response content';
      console.log('Received Vision API response. Preview:', responsePreview);
    }
    
    return {
      text: data.choices[0].message.content,
      raw: data,
      metadata: {
        usage: data.usage,
        model: data.model,
        finishReason: data.choices[0].finish_reason
      }
    };
  } catch (error) {
    console.error('Error calling OpenAI API:', error);
    throw error;
  }
}

/**
 * استدعاء Google Gemini API
 */
async function callGemini(request: AIRequest, config: AIConfig): Promise<AIResponse> {
  const apiKey = config.apiKey;
  if (!apiKey) {
    throw new Error('Gemini API key is required');
  }
  
  // إذا كانت هناك صورة، نستخدم نموذج يدعم الصور
  const hasImage = !!request.imageBase64;
  const model = hasImage 
    ? 'gemini-pro-vision' 
    : (request.model || config.model || 'gemini-pro');
  
  const endpoint = config.endpoint || `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  
  const content = [];
  
  // إضافة رسالة النظام إذا كانت موجودة
  if (request.systemPrompt) {
    content.push({
      role: 'system',
      parts: [{ text: request.systemPrompt }]
    });
  }
  
  // إضافة رسالة المستخدم
  if (hasImage) {
    // تنسيق خاص للطلبات مع صور
    const userParts = [
      { text: request.prompt }
    ];
    
    // إضافة الصورة
    if (request.imageBase64) {
      // استخراج الجزء الفعلي من base64 بعد إزالة جزء التنسيق مثل "data:image/jpeg;base64,"
      const base64ImageData = request.imageBase64.split(',')[1] || request.imageBase64;
      
      userParts.push({
        inlineData: {
          data: base64ImageData,
          mimeType: request.imageBase64.startsWith('data:') 
            ? request.imageBase64.split(';')[0].slice(5) // استخراج نوع MIME من البيانات
            : 'image/jpeg' // النوع الافتراضي إذا لم يتم تحديده
        }
      });
    }
    
    content.push({
      role: 'user',
      parts: userParts
    });
    
    // تسجيل للمراقبة
    console.log('Sending image to Gemini Vision API with model:', model);
  } else {
    // رسالة نصية عادية
    content.push({
      role: 'user',
      parts: [{ text: request.prompt }]
    });
  }
  
  const geminiRequest = {
    contents: content,
    generationConfig: {
      temperature: request.temperature !== undefined ? request.temperature : (config.temperature || 0.7),
      maxOutputTokens: request.maxTokens || config.maxTokens || 1000,
    }
  };
  
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(geminiRequest)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Gemini API error response:', errorData);
      throw new Error(`Gemini API error: ${errorData.error?.message || response.statusText}`);
    }
    
    const data = await response.json();
    
    // تسجيل جزء من الرد للمراقبة
    if (hasImage) {
      const responsePreview = data.candidates && data.candidates[0] && data.candidates[0].content 
        ? data.candidates[0].content.parts[0].text.substring(0, 100) + '...' 
        : 'No response content';
      console.log('Received Gemini Vision API response. Preview:', responsePreview);
    }
    
    return {
      text: data.candidates[0].content.parts[0].text,
      raw: data,
      metadata: {
        model,
        finishReason: data.candidates[0].finishReason
      }
    };
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    throw error;
  }
}

/**
 * استدعاء HuggingFace API
 */
async function callHuggingFace(request: AIRequest, config: AIConfig): Promise<AIResponse> {
  const apiKey = config.apiKey;
  if (!apiKey) {
    throw new Error('HuggingFace API key is required');
  }
  
  const model = request.model || config.model || 'mistralai/Mistral-7B-Instruct-v0.2';
  const endpoint = config.endpoint || `https://api-inference.huggingface.co/models/${model}`;
  
  let prompt = request.prompt;
  if (request.systemPrompt) {
    prompt = `${request.systemPrompt}\n\n${prompt}`;
  }
  
  const huggingFaceRequest = {
    inputs: prompt,
    parameters: {
      max_new_tokens: request.maxTokens || config.maxTokens || 1000,
      temperature: request.temperature !== undefined ? request.temperature : (config.temperature || 0.7),
      return_full_text: false
    }
  };
  
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(huggingFaceRequest)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`HuggingFace API error: ${errorData.error || response.statusText}`);
    }
    
    const data = await response.json();
    
    return {
      text: Array.isArray(data) ? data[0].generated_text : data.generated_text,
      raw: data,
      metadata: {
        model
      }
    };
  } catch (error) {
    console.error('Error calling HuggingFace API:', error);
    throw error;
  }
}

/**
 * دالة موحدة لاستدعاء واجهات الذكاء الاصطناعي
 */
export async function callExternalAI(request: AIRequest): Promise<AIResponse> {
  const config = getAIConfig();
  
  // إذا لم يكن هناك مفتاح API، أرجع رسالة خطأ
  if (!config.apiKey) {
    console.error('No API key configured for AI services');
    return {
      text: 'عذراً، لم يتم تكوين خدمات الذكاء الاصطناعي بشكل صحيح. يرجى الاتصال بمسؤول النظام.',
      metadata: {
        error: 'No API key configured'
      }
    };
  }
  
  try {
    let response: AIResponse;
    
    switch (config.provider) {
      case 'openai':
        response = await callOpenAI(request, config);
        break;
      case 'gemini':
        response = await callGemini(request, config);
        break;
      case 'huggingface':
        response = await callHuggingFace(request, config);
        break;
      default:
        throw new Error(`Unsupported AI provider: ${config.provider}`);
    }
    
    return response;
  } catch (error: any) {
    console.error('Error calling external AI service:', error);
    
    // في حالة الخطأ، نرجع رسالة خطأ محددة للمستخدم
    return {
      text: 'عذراً، حدث خطأ أثناء الاتصال بخدمة الذكاء الاصطناعي. يرجى المحاولة مرة أخرى لاحقاً.',
      metadata: {
        error: error.message
      }
    };
  }
}