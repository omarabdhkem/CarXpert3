import mongoose from 'mongoose';
import dotenv from 'dotenv';

// تحميل المتغيرات البيئية
dotenv.config();

// تكوين MongoDB مع معالجة أفضل للأخطاء
export async function connectMongoDB() {
  try {
    const MONGODB_URI = process.env.MONGODB_URI;
    
    if (!MONGODB_URI) {
      console.warn('MONGODB_URI not set, skipping MongoDB connection');
      return false;
    }

    // إعداد خيارات الاتصال
    const options = {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    };

    // محاولة الاتصال مع معالجة الأخطاء
    await mongoose.connect(MONGODB_URI, options);
    
    console.log('MongoDB connected successfully');
    return true;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    return false;
  }
}

// User Schema - تعريف مخطط المستخدم
const userSchema = new mongoose.Schema({
  pgUserId: Number, // معرف المستخدم في PostgreSQL
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  fullName: String,
  phone: String,
  avatarUrl: String,
  profile: {
    bio: String,
    website: String,
    socialLinks: {
      facebook: String,
      twitter: String,
      instagram: String,
      linkedIn: String
    }
  },
  preferences: {
    language: { type: String, default: 'ar' },
    darkMode: { type: Boolean, default: false },
    notifications: {
      enabled: { type: Boolean, default: true },
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true },
      sms: { type: Boolean, default: false }
    },
    privacy: {
      showContactInfo: { type: Boolean, default: false },
      showListings: { type: Boolean, default: true }
    },
    currency: { type: String, default: 'SAR' }, // عملة العرض الافتراضية
    displayUnits: {
      distance: { type: String, default: 'km' },
      fuel: { type: String, default: 'L/100km' }
    }
  },
  searchHistory: [{
    query: String,
    filters: mongoose.Schema.Types.Mixed,
    resultCount: Number,
    timestamp: { type: Date, default: Date.now }
  }],
  viewedCars: [{
    carId: Number,
    duration: Number, // بالثواني
    interestScore: Number, // مستوى الاهتمام
    timestamp: { type: Date, default: Date.now }
  }],
  // معلومات الجهاز لتحسين تجربة المستخدم
  deviceInfo: {
    lastBrowser: String,
    lastDevice: String,
    lastLogin: Date,
    loginHistory: [{
      ip: String,
      location: {
        country: String,
        city: String
      },
      device: String,
      timestamp: Date
    }]
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Car Schema - تعريف مخطط السيارة
const carSchema = new mongoose.Schema({
  pgCarId: Number, // معرف السيارة في PostgreSQL
  make: { type: String, required: true },
  model: { type: String, required: true },
  year: { type: Number, required: true },
  price: { type: Number, required: true },
  mileage: Number,
  description: String,
  specifications: mongoose.Schema.Types.Mixed, // مواصفات تفصيلية للسيارة
  images: [String],
  threeDImages: [String], // روابط للنماذج ثلاثية الأبعاد
  // إحصائيات و تحليلات
  analytics: {
    viewCount: { type: Number, default: 0 },
    contactCount: { type: Number, default: 0 }, // عدد مرات التواصل 
    searchCount: { type: Number, default: 0 },
    viewDuration: { type: Number, default: 0 }, // متوسط مدة المشاهدة بالثواني
    demographicViews: {
      age18to24: { type: Number, default: 0 },
      age25to34: { type: Number, default: 0 },
      age35to44: { type: Number, default: 0 },
      age45Plus: { type: Number, default: 0 },
      male: { type: Number, default: 0 },
      female: { type: Number, default: 0 }
    },
    viewsByLocation: {
      type: Map,
      of: Number
    }, // تخزين عدد المشاهدات حسب المدينة/المنطقة
    priceHistory: [{
      price: Number,
      date: Date
    }], // تاريخ أسعار السيارة
    lastViewed: Date
  },
  // بيانات الذكاء الاصطناعي والتوصيات
  aiData: {
    recommendationScore: { type: Number, default: 0 }, // درجة التوصية
    popularityTrend: { type: String, enum: ['rising', 'stable', 'declining'] },
    pricePrediction: {
      trend: { type: String, enum: ['up', 'stable', 'down'] },
      predictedValue: Number,
      confidence: Number
    },
    marketCompetitiveness: { type: Number, min: 0, max: 10 }, // مؤشر تنافسية السعر
    dealQuality: { type: Number, min: 0, max: 10 } // جودة الصفقة
  },
  similarCars: [{
    carId: Number,
    similarityScore: Number
  }],
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Favorite Schema - تعريف مخطط المفضلة
const favoriteSchema = new mongoose.Schema({
  pgFavoriteId: Number, // معرف المفضلة في PostgreSQL
  pgUserId: Number,
  pgCarId: Number,
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  carId: { type: mongoose.Schema.Types.ObjectId, ref: 'Car', required: true },
  notes: String, // ملاحظات المستخدم حول السيارة المفضلة
  priceAtTimeOfSave: Number, // سعر السيارة وقت الإضافة للمفضلة
  notifications: {
    priceDrops: { type: Boolean, default: true },
    statusChange: { type: Boolean, default: true }
  },
  createdAt: { type: Date, default: Date.now }
});

// Car Comparison Schema - تعريف مخطط مقارنة السيارات
const carComparisonSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  pgUserId: Number,
  cars: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Car' }], // قائمة بالسيارات المقارنة
  pgCars: [Number], // قائمة بمعرفات السيارات في PostgreSQL
  name: String, // اسم المقارنة (اختياري)
  public: { type: Boolean, default: false }, // هل المقارنة عامة أم خاصة
  permalink: String, // رابط دائم للمقارنة
  createdAt: { type: Date, default: Date.now },
  lastViewedAt: Date
});

// User Review Schema - تعريف مخطط تقييمات المستخدمين
const userReviewSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  pgUserId: Number,
  entityId: mongoose.Schema.Types.ObjectId, // معرف الكيان (سيارة، معرض، مركز صيانة)
  pgEntityId: Number, // معرف الكيان في PostgreSQL
  entityType: { type: String, enum: ['car', 'dealership', 'service_center'], required: true },
  rating: { type: Number, min: 1, max: 5, required: true },
  title: String,
  content: String,
  pros: [String],
  cons: [String],
  images: [String], // روابط للصور
  helpfulCount: { type: Number, default: 0 }, // عدد الأشخاص الذين وجدوا المراجعة مفيدة
  verified: { type: Boolean, default: false }, // هل تم التحقق من الشراء
  createdAt: { type: Date, default: Date.now },
  updatedAt: Date
});

// صدّر النماذج
// نماذج الدردشة

// نموذج رسالة الدردشة
const chatMessageSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  senderId: { type: Number, required: true },
  recipientId: { type: Number, default: null }, // null للرسائل العامة
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  isRead: { type: Boolean, default: false },
  readAt: { type: Date },
  type: { 
    type: String, 
    required: true, 
    enum: ['text', 'image', 'system'],
    default: 'text'
  },
  metadata: mongoose.Schema.Types.Mixed
});

// نموذج جلسة الدردشة
const chatSessionSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  participantIds: [{ type: Number, required: true }],
  title: { type: String },
  lastMessageTime: { type: Date, default: Date.now },
  unreadCount: { type: Map, of: Number, default: {} },
  createdAt: { type: Date, default: Date.now },
  metadata: mongoose.Schema.Types.Mixed
});

export const UserModel = mongoose.model('User', userSchema);
export const CarModel = mongoose.model('Car', carSchema);
export const FavoriteModel = mongoose.model('Favorite', favoriteSchema);
export const CarComparisonModel = mongoose.model('CarComparison', carComparisonSchema);
export const UserReviewModel = mongoose.model('UserReview', userReviewSchema);
export const ChatMessage = mongoose.model('ChatMessage', chatMessageSchema);
export const ChatSession = mongoose.model('ChatSession', chatSessionSchema);

// نظام التحسين الذاتي
const errorLogSchema = new mongoose.Schema({
  type: String,
  message: String,
  location: String,
  stack: String,
  context: mongoose.Schema.Types.Mixed,
  timestamp: { type: Date, default: Date.now }
});

const systemStatusSchema = new mongoose.Schema({
  active: { type: Boolean, default: false },
  runningFor: { type: Number, default: 0 },
  lastCycleTimestamp: { type: Date, default: Date.now },
  totalIssuesFixed: { type: Number, default: 0 },
  pendingIssues: { type: Number, default: 0 },
  memoryUsage: { type: Number, default: 0 },
  optimizationSuggestionsCount: { type: Number, default: 0 },
  updatedAt: { type: Date, default: Date.now }
});

const moduleStatusSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  enabled: { type: Boolean, default: false },
  successRate: { type: Number, default: 0 },
  lastRun: { type: Date, default: null },
  config: { type: mongoose.Schema.Types.Mixed, default: {} },
  updatedAt: { type: Date, default: Date.now }
});

const optimizationSuggestionSchema = new mongoose.Schema({
  filePath: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  suggestions: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['pending_review', 'approved', 'rejected', 'applied'], 
    default: 'pending_review' 
  },
  appliedAt: { type: Date, default: null },
  appliedBy: { type: Number, default: null },
  diff: { type: String, default: null }
});

const systemActivitySchema = new mongoose.Schema({
  type: { type: String, required: true },
  data: { type: mongoose.Schema.Types.Mixed },
  timestamp: { type: Date, default: Date.now }
});

export const ErrorLog = mongoose.model('ErrorLog', errorLogSchema);
export const SystemStatus = mongoose.model('SystemStatus', systemStatusSchema);
export const ModuleStatus = mongoose.model('ModuleStatus', moduleStatusSchema);
export const OptimizationSuggestion = mongoose.model('OptimizationSuggestion', optimizationSuggestionSchema);
export const SystemActivity = mongoose.model('SystemActivity', systemActivitySchema);
