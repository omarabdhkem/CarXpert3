import { db } from './db';
import { eq, and } from 'drizzle-orm';
import {
  users, cars, favorites, dealerships, serviceCenters, advertisements,
  carCategories, carModels, configOptions, carConfigurations,
  type User, type InsertUser, type Car, type InsertCar, type Favorite, type InsertFavorite,
  type Dealership, type InsertDealership, type ServiceCenter, type InsertServiceCenter,
  type Advertisement, type InsertAdvertisement
} from '../shared/schema';

// Optional MongoDB integration
let MongoDB: any = {};
try {
  // Try to import the MongoDB models if available
  const {
    UserModel,
    CarModel,
    FavoriteModel,
    CarComparisonModel,
    UserReviewModel,
    ChatMessage,
    ChatSession,
    ErrorLog,
    SystemStatus,
    ModuleStatus,
    OptimizationSuggestion,
    SystemActivity
  } = require('./mongodb');
  
  MongoDB = {
    AIAnalytics: { create: async () => ({}) },
    SearchHistory: { create: async () => ({}), find: async () => [] },
    Content: { find: async () => [] },
    UserBehavior: { findOne: async () => null, create: async () => ({ behaviors: [], save: async () => ({}) }) },
    MarketTrends: { findOne: async () => ({}), findOneAndUpdate: async () => ({}) },
    Notification: { create: async () => ({}), find: async () => [], findByIdAndUpdate: async () => ({}) },
    ChatMessage,
    ChatSession,
    UserModel,
    CarModel,
    FavoriteModel,
    CarComparisonModel,
    UserReviewModel,
    ErrorLog,
    SystemStatus,
    ModuleStatus,
    OptimizationSuggestion,
    SystemActivity
  };
} catch (error) {
  console.warn('MongoDB models not available, using in-memory fallback for analytics features.');
  // Create empty fallback objects
  MongoDB = {
    AIAnalytics: { create: async () => ({}) },
    SearchHistory: { create: async () => ({}), find: async () => [] },
    UserBehavior: { 
      findOne: async () => null, 
      create: async () => ({ behaviors: [], save: async () => ({}) }) 
    },
    MarketTrends: { 
      findOne: async () => ({}),
      findOneAndUpdate: async () => ({})
    },
    Notification: {
      create: async () => ({}),
      find: async () => [],
      findByIdAndUpdate: async () => ({})
    },
    ChatMessage: {
      create: async () => ({}),
      find: async () => [],
      findOne: async () => ({}),
      findOneAndUpdate: async () => ({}),
      countDocuments: async () => 0,
      aggregate: async () => []
    },
    ChatSession: {
      create: async () => ({})
    },
    CarComparisonModel: {
      create: async () => ({}),
      find: async () => []
    },
    UserReviewModel: {
      create: async () => ({}),
      find: async () => []
    },
    ErrorLog: {
      create: async () => ({})
    },
    SystemStatus: {
      findOne: async () => ({}),
      findOneAndUpdate: async () => ({})
    },
    ModuleStatus: {
      find: async () => [],
      findOne: async () => ({}),
      findOneAndUpdate: async () => ({})
    },
    OptimizationSuggestion: {
      create: async () => ({}),
      find: async () => [],
      findOneAndUpdate: async () => ({})
    },
    SystemActivity: {
      create: async () => ({}),
      find: async () => []
    }
  };
}
import { v4 as uuidv4 } from 'uuid'; // تم إضافة @types/uuid

// فئة تعريف العمليات الأساسية لقاعدة البيانات
export class Storage {
  // Core PostgreSQL Operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async createUser(user: InsertUser): Promise<User> {
    const [newUser] = await db.insert(users).values(user as any).returning();
    return newUser as User;
  }

  async getCar(id: number): Promise<Car | undefined> {
    const [car] = await db.select().from(cars).where(eq(cars.id, id));
    return car || undefined;
  }

  async createCar(car: InsertCar): Promise<Car> {
    const [newCar] = await db.insert(cars).values(car as any).returning();
    return newCar as Car;
  }

  // Analytics Operations (MongoDB)
  // تسجيل الأحداث الخاصة بالمستخدم للأغراض التحليلية
async logUserEvent(userId: number, event: string, metadata: any = {}) {
    return await MongoDB.AIAnalytics.create({ userId, event, metadata });
  }

  async saveSearchHistory(userId: number, query: string, filters: any = {}) {
    return await MongoDB.SearchHistory.create({ userId, query, filters });
  }

  async getUserSearchHistory(userId: number) {
    return await MongoDB.SearchHistory.find({ userId }).sort({ timestamp: -1 }).limit(10);
  }
  async getFavorites(userId: number): Promise<Favorite[]> {
    return (await db.select().from(favorites).where(eq(favorites.userId, userId))) as Favorite[];
  }

  async addFavorite(favorite: InsertFavorite): Promise<Favorite> {
    const [pgFavorite] = await db.insert(favorites).values(favorite as any).returning();
    return pgFavorite as Favorite;
  }

  async removeFavorite(userId: number, carId: number): Promise<void> {
    await db
      .delete(favorites)
      .where(and(
        eq(favorites.userId, userId),
        eq(favorites.carId, carId)
      ));
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }
  async getCars(filters?: Partial<Car>): Promise<Car[]> {
    let query = db.select().from(cars);
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && key in cars) {
          // تأكد من أن العمود عبارة عن كائن عمود وليس قيمة منطقية
          const column = cars[key as keyof typeof cars];
          if (typeof column === 'object' && column !== null) {
            // @ts-ignore - نتجاهل خطأ TypeScript لأننا نعلم أن column هو عمود صالح
            query = query.where(eq(column, value));
          }
        }
      });
    }
    return (await query) as Car[];
  }
  async updateCar(id: number, car: Partial<Car>): Promise<Car> {
    const [updatedCar] = await db
      .update(cars)
      .set(car)
      .where(eq(cars.id, id))
      .returning();
    return updatedCar as Car;
  }
  async deleteCar(id: number): Promise<void> {
    await db.delete(cars).where(eq(cars.id, id));
  }

  // وظائف المعارض (Dealerships)
  async getDealership(id: number): Promise<Dealership | undefined> {
    const [dealership] = await db.select().from(dealerships).where(eq(dealerships.id, id));
    return dealership || undefined;
  }

  async getDealerships(filters?: Partial<Dealership>): Promise<Dealership[]> {
    let query = db.select().from(dealerships);
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && key in dealerships) {
          // تأكد من أن العمود عبارة عن كائن عمود وليس قيمة منطقية
          const column = dealerships[key as keyof typeof dealerships];
          if (typeof column === 'object' && column !== null) {
            // @ts-ignore - نتجاهل خطأ TypeScript لأننا نعلم أن column هو عمود صالح
            query = query.where(eq(column, value));
          }
        }
      });
    }
    return (await query) as Dealership[];
  }

  async createDealership(dealership: InsertDealership): Promise<Dealership> {
    const [newDealership] = await db.insert(dealerships).values(dealership as any).returning();
    return newDealership as Dealership;
  }

  async updateDealership(id: number, dealership: Partial<Dealership>): Promise<Dealership> {
    const [updatedDealership] = await db
      .update(dealerships)
      .set(dealership)
      .where(eq(dealerships.id, id))
      .returning();
    return updatedDealership as Dealership;
  }

  async deleteDealership(id: number): Promise<void> {
    await db.delete(dealerships).where(eq(dealerships.id, id));
  }

  // وظائف مراكز الصيانة (Service Centers)
  async getServiceCenter(id: number): Promise<ServiceCenter | undefined> {
    const [serviceCenter] = await db.select().from(serviceCenters).where(eq(serviceCenters.id, id));
    return serviceCenter || undefined;
  }

  async getServiceCenters(filters?: Partial<ServiceCenter>): Promise<ServiceCenter[]> {
    let query = db.select().from(serviceCenters);
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && key in serviceCenters) {
          // تأكد من أن العمود عبارة عن كائن عمود وليس قيمة منطقية
          const column = serviceCenters[key as keyof typeof serviceCenters];
          if (typeof column === 'object' && column !== null) {
            // @ts-ignore - نتجاهل خطأ TypeScript لأننا نعلم أن column هو عمود صالح
            query = query.where(eq(column, value));
          }
        }
      });
    }
    return (await query) as ServiceCenter[];
  }

  async createServiceCenter(serviceCenter: InsertServiceCenter): Promise<ServiceCenter> {
    const [newServiceCenter] = await db.insert(serviceCenters).values(serviceCenter as any).returning();
    return newServiceCenter as ServiceCenter;
  }

  async updateServiceCenter(id: number, serviceCenter: Partial<ServiceCenter>): Promise<ServiceCenter> {
    const [updatedServiceCenter] = await db
      .update(serviceCenters)
      .set(serviceCenter)
      .where(eq(serviceCenters.id, id))
      .returning();
    return updatedServiceCenter as ServiceCenter;
  }

  async deleteServiceCenter(id: number): Promise<void> {
    await db.delete(serviceCenters).where(eq(serviceCenters.id, id));
  }

  // وظائف الإعلانات (Advertisements)
  async getAdvertisement(id: number): Promise<Advertisement | undefined> {
    const [advertisement] = await db.select().from(advertisements).where(eq(advertisements.id, id));
    return advertisement || undefined;
  }

  async getAdvertisements(filters?: Partial<Advertisement>): Promise<Advertisement[]> {
    let query = db.select().from(advertisements);
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && key in advertisements) {
          // تأكد من أن العمود عبارة عن كائن عمود وليس قيمة منطقية
          const column = advertisements[key as keyof typeof advertisements];
          if (typeof column === 'object' && column !== null) {
            // @ts-ignore - نتجاهل خطأ TypeScript لأننا نعلم أن column هو عمود صالح
            query = query.where(eq(column, value));
          }
        }
      });
    }
    return (await query) as Advertisement[];
  }

  async createAdvertisement(advertisement: InsertAdvertisement): Promise<Advertisement> {
    const [newAdvertisement] = await db.insert(advertisements).values(advertisement as any).returning();
    return newAdvertisement as Advertisement;
  }

  async updateAdvertisement(id: number, advertisement: Partial<Advertisement>): Promise<Advertisement> {
    const [updatedAdvertisement] = await db
      .update(advertisements)
      .set(advertisement)
      .where(eq(advertisements.id, id))
      .returning();
    return updatedAdvertisement as Advertisement;
  }

  async deleteAdvertisement(id: number): Promise<void> {
    await db.delete(advertisements).where(eq(advertisements.id, id));
  }

  // وظائف التحليلات المتقدمة (Advanced Analytics)
  async logAIAnalytics(data: any): Promise<any> {
    return await MongoDB.AIAnalytics.create(data);
  }

  async getUserBehavior(userId: number): Promise<any> {
    let behavior = await MongoDB.UserBehavior.findOne({ userId });
    if (!behavior) {
      behavior = await MongoDB.UserBehavior.create({ userId, behaviors: [] });
    }
    return behavior;
  }

  async updateUserBehavior(userId: number, behaviorData: any): Promise<any> {
    const behavior = await this.getUserBehavior(userId);
    behavior.behaviors.push({
      ...behaviorData,
      timestamp: new Date()
    });
    return await behavior.save();
  }

  async getMarketTrends(period: string = 'weekly'): Promise<any> {
    return await MongoDB.MarketTrends.findOne({ period }).sort({ date: -1 });
  }

  async createOrUpdateMarketTrends(data: any): Promise<any> {
    const { period } = data;
    return await MongoDB.MarketTrends.findOneAndUpdate(
      { period, date: new Date().toISOString().split('T')[0] }, 
      data, 
      { upsert: true, new: true }
    );
  }

  // وظائف مقارنة السيارات (Car Comparison)
  async createCarComparison(userId: number, carIds: number[], name?: string): Promise<any> {
    return await MongoDB.CarComparisonModel.create({
      pgUserId: userId,
      pgCars: carIds,
      name,
      createdAt: new Date(),
      lastViewedAt: new Date()
    });
  }

  async getUserComparisons(userId: number): Promise<any> {
    return await MongoDB.CarComparisonModel.find({ pgUserId: userId }).sort({ lastViewedAt: -1 });
  }

  // وظائف التقييمات (Reviews)
  async createReview(reviewData: any): Promise<any> {
    return await MongoDB.UserReviewModel.create({
      ...reviewData,
      createdAt: new Date(),
      updatedAt: new Date()
    });
  }

  async getReviewsForEntity(entityType: string, entityId: number): Promise<any> {
    return await MongoDB.UserReviewModel.find({ 
      pgEntityId: entityId, 
      entityType 
    }).sort({ createdAt: -1 });
  }

  async getUserReviews(userId: number): Promise<any> {
    return await MongoDB.UserReviewModel.find({ pgUserId: userId }).sort({ createdAt: -1 });
  }

  // وظائف الإشعارات (Notifications)
  async createNotification(userId: number, type: string, title: string, message: string, data: any = {}): Promise<any> {
    return await MongoDB.Notification.create({
      userId,
      type,
      title,
      message,
      data,
      read: false,
      sentAt: new Date()
    });
  }

  async getUserNotifications(userId: number, unreadOnly: boolean = false): Promise<any> {
    const query: any = { userId };
    if (unreadOnly) {
      query.read = false;
    }
    return await MongoDB.Notification.find(query).sort({ sentAt: -1 });
  }

  async markNotificationAsRead(notificationId: string): Promise<any> {
    return await MongoDB.Notification.findByIdAndUpdate(
      notificationId, 
      { read: true, readAt: new Date() }, 
      { new: true }
    );
  }
  
  // وظائف الدردشة (Chat Functions)
  async saveChatMessage(message: any): Promise<any> {
    // إذا لم يتم تحديد المعرف، قم بإنشاء واحد جديد
    if (!message.id) {
      message.id = uuidv4();
    }
    
    return await MongoDB.ChatMessage.create({
      ...message,
      createdAt: message.timestamp || new Date()
    });
  }
  
  async getChatMessage(id: string): Promise<any> {
    return await MongoDB.ChatMessage.findOne({ id });
  }
  
  async markMessageAsRead(id: string): Promise<boolean> {
    const result = await MongoDB.ChatMessage.findOneAndUpdate(
      { id },
      { $set: { isRead: true, readAt: new Date() } },
      { new: true }
    );
    
    return !!result;
  }
  
  async getUnreadMessages(userId: number): Promise<any[]> {
    return await MongoDB.ChatMessage.find({
      $or: [
        { recipientId: userId },
        { recipientId: null }
      ],
      isRead: false
    }).sort({ timestamp: 1 });
  }
  
  async getChatHistory(
    userId: number, 
    withUserId: number | null, 
    limit: number = 50, 
    offset: number = 0
  ): Promise<{ messages: any[], totalCount: number, hasMore: boolean }> {
    let query;
    
    if (withUserId === null) {
      // محادثة عامة
      query = {
        recipientId: null,
        $or: [
          { senderId: userId },
          { senderId: { $in: this.getSupportAgentIds() } }
        ]
      };
    } else {
      // محادثة خاصة بين مستخدمين
      query = {
        $or: [
          { senderId: userId, recipientId: withUserId },
          { senderId: withUserId, recipientId: userId }
        ]
      };
    }
    
    const totalCount = await MongoDB.ChatMessage.countDocuments(query);
    
    const messages = await MongoDB.ChatMessage.find(query)
      .sort({ timestamp: 1 })
      .skip(offset)
      .limit(limit);
      
    return {
      messages,
      totalCount,
      hasMore: totalCount > offset + messages.length
    };
  }
  
  private getSupportAgentIds(): number[] {
    // في الإنتاج، هذا يجب أن يتم استرجاعه من قاعدة البيانات
    return [1, 2]; // معرّفات وكلاء الدعم
  }
  
  async createChatSession(participantIds: number[]): Promise<any> {
    return await MongoDB.ChatSession.create({
      id: uuidv4(),
      participantIds,
      lastMessageTime: new Date(),
      unreadCount: {},
      createdAt: new Date()
    });
  }
  
  async getActiveChats(userId: number): Promise<Array<{
    type: 'general' | 'private',
    lastMessage: any,
    unreadCount: number,
    otherUser?: {
      id: number,
      username: string,
      name: string
    }
  }>> {
    // الحصول على جميع الرسائل الفريدة التي المستخدم مرسل أو مستقبل لها
    const sentMessages = await MongoDB.ChatMessage.aggregate([
      {
        $match: { senderId: userId }
      },
      {
        $group: {
          _id: "$recipientId",
          lastMessage: { $last: "$$ROOT" },
          count: { $sum: 1 }
        }
      }
    ]);
    
    const receivedMessages = await MongoDB.ChatMessage.aggregate([
      {
        $match: { recipientId: userId }
      },
      {
        $group: {
          _id: "$senderId",
          lastMessage: { $last: "$$ROOT" },
          count: { $sum: 1 }
        }
      }
    ]);
    
    // دمج الرسائل المرسلة والمستقبلة مع إزالة التكرار
    const combinedChats = [...sentMessages, ...receivedMessages].reduce((acc: any[], chat: any) => {
      const existingChat = acc.find(c => c._id === chat._id);
      if (!existingChat) {
        acc.push(chat);
      } else {
        // استخدم آخر رسالة بناء على الطابع الزمني
        if (new Date(chat.lastMessage.timestamp) > new Date(existingChat.lastMessage.timestamp)) {
          existingChat.lastMessage = chat.lastMessage;
        }
        existingChat.count += chat.count;
      }
      return acc;
    }, []);
    
    // فرز المحادثات حسب وقت آخر رسالة (الأحدث أولاً)
    combinedChats.sort((a: any, b: any) => {
      return new Date(b.lastMessage.timestamp).getTime() - new Date(a.lastMessage.timestamp).getTime();
    });
    
    // الحصول على معلومات المستخدمين
    const chatResults = [];
    for (const chat of combinedChats) {
      const otherUserId = chat._id;
      
      if (otherUserId === null) {
        // محادثة عامة
        chatResults.push({
          type: 'general' as const,
          lastMessage: chat.lastMessage,
          unreadCount: await this.getUnreadMessagesCount(userId, null)
        });
        continue;
      }
      
      // محادثة مع مستخدم آخر
      const otherUser = await this.getUser(otherUserId);
      if (otherUser) {
        chatResults.push({
          type: 'private' as const,
          otherUser: {
            id: (otherUser as any).id,
            username: (otherUser as any).username,
            name: (otherUser as any).name || (otherUser as any).username
          },
          lastMessage: chat.lastMessage,
          unreadCount: await this.getUnreadMessagesCount(userId, otherUserId)
        });
      }
    }
    
    return chatResults;
  }
  
  async getUnreadMessagesCount(userId: number, fromUserId: number | null): Promise<number> {
    const query = fromUserId === null
      ? { recipientId: null, isRead: false }
      : { senderId: fromUserId, recipientId: userId, isRead: false };
      
    return await MongoDB.ChatMessage.countDocuments(query);
  }

  // وظائف نظام التحسين الذاتي (Self Improvement System)
  async getErrorLogs(limit: number = 100): Promise<any[]> {
    return await MongoDB.ErrorLog.find()
      .sort({ timestamp: -1 })
      .limit(limit);
  }

  async logError(errorData: any): Promise<any> {
    return await MongoDB.ErrorLog.create({
      ...errorData,
      timestamp: new Date()
    });
  }

  async getSelfImprovementStatus(): Promise<any> {
    const status = await MongoDB.SystemStatus.findOne();
    if (!status) {
      // إنشاء حالة افتراضية إذا لم تكن موجودة
      return await MongoDB.SystemStatus.create({
        active: false,
        runningFor: 0,
        lastCycleTimestamp: new Date(),
        totalIssuesFixed: 0,
        pendingIssues: 0,
        memoryUsage: 0,
        optimizationSuggestionsCount: 0,
        updatedAt: new Date()
      });
    }
    return status;
  }

  async updateSelfImprovementStatus(statusData: any): Promise<any> {
    const status = await this.getSelfImprovementStatus();
    Object.assign(status, { ...statusData, updatedAt: new Date() });
    return await status.save();
  }

  async getSelfImprovementModules(): Promise<any[]> {
    const modules = await MongoDB.ModuleStatus.find();
    if (modules.length === 0) {
      // إنشاء الوحدات الافتراضية
      const defaultModules = [
        {
          name: 'مراقبة الأخطاء',
          enabled: true,
          successRate: 94,
          lastRun: new Date(),
          updatedAt: new Date()
        },
        {
          name: 'تصحيح الكود',
          enabled: true,
          successRate: 87,
          lastRun: new Date(),
          updatedAt: new Date()
        },
        {
          name: 'تحسين الأداء',
          enabled: false,
          successRate: 76,
          lastRun: null,
          updatedAt: new Date()
        },
        {
          name: 'مراقبة موارد النظام',
          enabled: true,
          successRate: 98,
          lastRun: new Date(),
          updatedAt: new Date()
        }
      ];

      return await MongoDB.ModuleStatus.insertMany(defaultModules);
    }
    return modules;
  }

  async updateSelfImprovementModule(name: string, moduleData: any): Promise<any> {
    return await MongoDB.ModuleStatus.findOneAndUpdate(
      { name },
      { ...moduleData, updatedAt: new Date() },
      { new: true, upsert: true }
    );
  }

  async getOptimizationSuggestions(status?: string): Promise<any[]> {
    const query = status ? { status } : {};
    return await MongoDB.OptimizationSuggestion.find(query)
      .sort({ timestamp: -1 });
  }

  async saveOptimizationSuggestion(suggestionData: any): Promise<any> {
    return await MongoDB.OptimizationSuggestion.create({
      ...suggestionData,
      timestamp: new Date()
    });
  }

  async updateOptimizationSuggestion(id: string, suggestionData: any): Promise<any> {
    const update: any = { ...suggestionData };
    
    // إذا تم تحديث الحالة إلى "تم التطبيق"، أضف طابع زمني للتطبيق
    if (suggestionData.status === 'applied') {
      update.appliedAt = new Date();
    }
    
    return await MongoDB.OptimizationSuggestion.findByIdAndUpdate(
      id,
      update,
      { new: true }
    );
  }

  async logSystemActivity(type: string, data: any): Promise<any> {
    return await MongoDB.SystemActivity.create({
      type,
      data,
      timestamp: new Date()
    });
  }

  async getSystemActivities(limit: number = 100): Promise<any[]> {
    return await MongoDB.SystemActivity.find()
      .sort({ timestamp: -1 })
      .limit(limit);
  }
}

// Export singleton instance
export const storage = new Storage();