import WebSocket from 'ws';
import { Server } from 'http';
import { storage } from './storage';
import { v4 as uuidv4 } from 'uuid';

// نموذج بيانات الرسالة
interface ChatMessage {
  id: string;
  senderId: number;
  recipientId: number | null;
  content: string;
  timestamp: Date;
  isRead: boolean;
  type: 'text' | 'image' | 'system';
}

// نموذج اتصال المستخدم
interface UserConnection {
  userId: number;
  socket: WebSocket;
}

// فئة خدمة الدردشة
export class ChatService {
  private wss: WebSocket.Server | null = null;
  private connections: UserConnection[] = [];
  private supportAgents: number[] = [1, 2]; // معرّفات وكلاء الدعم

  constructor() {}

  // بدء خدمة الدردشة
  initialize(server: Server) {
    this.wss = new WebSocket.Server({ server });

    this.wss.on('connection', (socket: WebSocket) => {
      console.log('اتصال جديد بخدمة الدردشة');

      // تهيئة الاتصال
      socket.on('message', async (message: WebSocket.Data) => {
        try {
          const parsedMessage = JSON.parse(message.toString());
          await this.handleMessage(socket, parsedMessage);
        } catch (error) {
          console.error('خطأ في معالجة رسالة الدردشة:', error);
          this.sendToSocket(socket, {
            type: 'error',
            message: 'حدث خطأ أثناء معالجة الرسالة',
          });
        }
      });

      // إغلاق الاتصال
      socket.on('close', () => {
        const connectionIndex = this.connections.findIndex(
          (conn) => conn.socket === socket
        );
        if (connectionIndex !== -1) {
          const userId = this.connections[connectionIndex].userId;
          console.log(`اتصال المستخدم ${userId} مغلق`);
          this.connections.splice(connectionIndex, 1);
          this.broadcastUserStatus(userId, 'offline');
        }
      });

      // إرسال رسالة ترحيب
      this.sendToSocket(socket, {
        type: 'system',
        message: 'مرحباً بك في نظام الدردشة المباشرة. يرجى تعريف نفسك باستخدام رسالة "auth".',
      });
    });

    console.log('تم تهيئة خدمة الدردشة');
  }

  // معالجة الرسائل الواردة
  private async handleMessage(socket: WebSocket, message: any) {
    const { type, data } = message;

    switch (type) {
      case 'auth': {
        // المصادقة وتخزين اتصال المستخدم
        const { userId, token } = data;
        const user = await storage.getUser(userId);

        if (!user) {
          return this.sendToSocket(socket, {
            type: 'auth_error',
            message: 'المستخدم غير موجود',
          });
        }

        // في النظام الحقيقي، هنا نقوم بالتحقق من token
        
        // إزالة أي اتصالات سابقة لنفس المستخدم
        this.connections = this.connections.filter(conn => conn.userId !== userId);
        
        // إضافة الاتصال الجديد
        this.connections.push({ userId, socket });
        
        console.log(`مستخدم ${userId} متصل`);
        
        // إرسال تأكيد المصادقة
        this.sendToSocket(socket, {
          type: 'auth_success',
          data: { userId, username: user.username }
        });
        
        // إعلام الآخرين بحالة المستخدم
        this.broadcastUserStatus(userId, 'online');
        
        // إرسال الرسائل غير المقروءة
        const unreadMessages = await storage.getUnreadMessages(userId);
        if (unreadMessages && unreadMessages.length > 0) {
          this.sendToSocket(socket, {
            type: 'unread_messages',
            data: unreadMessages
          });
        }
        break;
      }
      
      case 'message': {
        // إرسال رسالة
        const { senderId, recipientId, content, messageType = 'text' } = data;
        
        // التحقق من المرسل
        const senderConnection = this.connections.find(conn => conn.userId === senderId);
        if (!senderConnection) {
          return this.sendToSocket(socket, {
            type: 'error',
            message: 'يجب عليك تسجيل الدخول أولاً',
          });
        }
        
        // إنشاء كائن الرسالة
        const messageObj: ChatMessage = {
          id: uuidv4(),
          senderId,
          recipientId,
          content,
          timestamp: new Date(),
          isRead: false,
          type: messageType as 'text' | 'image' | 'system',
        };
        
        // حفظ الرسالة في قاعدة البيانات
        await storage.saveChatMessage(messageObj);
        
        // إرسال الرسالة إلى المستلم إذا كان متصلاً
        if (recipientId) {
          const recipientConnection = this.connections.find(
            conn => conn.userId === recipientId
          );
          
          if (recipientConnection) {
            this.sendToSocket(recipientConnection.socket, {
              type: 'new_message',
              data: messageObj
            });
            
            // تحديث حالة القراءة إذا كان المستلم متصلاً
            await storage.markMessageAsRead(messageObj.id);
            messageObj.isRead = true;
          }
        } else {
          // رسالة عامة إلى وكلاء الدعم، أرسل إلى جميع وكلاء الدعم المتصلين
          this.supportAgents.forEach(agentId => {
            const agentConnection = this.connections.find(
              conn => conn.userId === agentId
            );
            
            if (agentConnection) {
              this.sendToSocket(agentConnection.socket, {
                type: 'new_message',
                data: messageObj
              });
            }
          });
        }
        
        // إرسال تأكيد الإرسال للمرسل
        this.sendToSocket(socket, {
          type: 'message_sent',
          data: messageObj
        });
        
        break;
      }
      
      case 'read_receipt': {
        // تحديث حالة قراءة الرسالة
        const { messageId, userId } = data;
        await storage.markMessageAsRead(messageId);
        
        // إرسال تأكيد القراءة إلى المرسل الأصلي
        const message = await storage.getChatMessage(messageId);
        if (message) {
          const senderConnection = this.connections.find(
            conn => conn.userId === message.senderId
          );
          
          if (senderConnection) {
            this.sendToSocket(senderConnection.socket, {
              type: 'read_receipt',
              data: { messageId, readBy: userId, timestamp: new Date() }
            });
          }
        }
        
        break;
      }
      
      case 'typing': {
        // إشعار الكتابة
        const { senderId, recipientId } = data;
        
        const recipientConnection = this.connections.find(
          conn => conn.userId === recipientId
        );
        
        if (recipientConnection) {
          this.sendToSocket(recipientConnection.socket, {
            type: 'typing',
            data: { userId: senderId }
          });
        }
        
        break;
      }
      
      case 'get_chat_history': {
        // استرجاع تاريخ المحادثة
        const { userId, withUserId, limit = 50, offset = 0 } = data;
        
        const chatHistory = await storage.getChatHistory(userId, withUserId, limit, offset);
        
        this.sendToSocket(socket, {
          type: 'chat_history',
          data: chatHistory
        });
        
        break;
      }
      
      case 'get_active_chats': {
        // استرجاع المحادثات النشطة
        const { userId } = data;
        
        const activeChats = await storage.getActiveChats(userId);
        
        this.sendToSocket(socket, {
          type: 'active_chats',
          data: activeChats
        });
        
        break;
      }
      
      default:
        this.sendToSocket(socket, {
          type: 'error',
          message: 'نوع الرسالة غير مدعوم',
        });
    }
  }

  // إرسال رسالة إلى اتصال معين
  private sendToSocket(socket: WebSocket, data: any) {
    if (socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(data));
    }
  }

  // بث حالة المستخدم إلى جميع المستخدمين المتصلين
  private broadcastUserStatus(userId: number, status: 'online' | 'offline') {
    const statusUpdate = {
      type: 'user_status',
      data: { userId, status, timestamp: new Date() }
    };

    this.connections.forEach(connection => {
      if (connection.userId !== userId) {
        this.sendToSocket(connection.socket, statusUpdate);
      }
    });
  }

  // إرسال رسالة إلى مستخدم معين
  sendToUser(userId: number, data: any) {
    const userConnection = this.connections.find(conn => conn.userId === userId);
    
    if (userConnection) {
      this.sendToSocket(userConnection.socket, data);
      return true;
    }
    
    return false;
  }

  // إرسال رسالة إلى جميع المستخدمين المتصلين
  broadcast(data: any, excludeUserId?: number) {
    this.connections.forEach(connection => {
      if (!excludeUserId || connection.userId !== excludeUserId) {
        this.sendToSocket(connection.socket, data);
      }
    });
  }
}

// تصدير نسخة واحدة من الخدمة
export const chatService = new ChatService();