import mongoose from 'mongoose';
import dotenv from 'dotenv';

// تحميل المتغيرات البيئية
dotenv.config();

// MongoDB connection with better error handling
export async function connectMongoDB() {
  try {
    if (!process.env.MONGODB_URI) {
      console.warn('MONGODB_URI not set, skipping MongoDB connection');
      return false;
    }

    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected successfully');
    return true;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    return false;
  }
}

// AI Analytics Schema - لتتبع وتحليل سلوك المستخدم باستخدام الذكاء الاصطناعي
const aiAnalyticsSchema = new mongoose.Schema({
  userId: Number,
  carId: Number,
  event: String, // search, view, compare, etc.
  metadata: mongoose.Schema.Types.Mixed,
  predictions: mongoose.Schema.Types.Mixed,
  location: {
    latitude: Number,
    longitude: Number,
    city: String,
    country: String
  },
  deviceInfo: {
    type: String, // mobile, desktop, tablet
    browser: String,
    os: String
  },
  timestamp: { type: Date, default: Date.now }
});

// Content Management Schema - لإدارة المحتوى مثل المقالات والمراجعات
const contentSchema = new mongoose.Schema({
  type: String, // article, review, comparison, guide, news
  title: String,
  content: String,
  summary: String,
  language: { type: String, default: 'ar' }, // لغة المحتوى
  featuredImage: String,
  gallery: [String],
  tags: [String],
  relatedCars: [Number],
  author: {
    id: Number,
    name: String,
    avatar: String
  },
  status: { type: String, default: 'draft' }, // draft, published, archived
  publishDate: Date,
  seoMetadata: {
    keywords: [String],
    description: String,
    canonical: String,
    ogImage: String,
    twitterCard: String
  },
  analytics: {
    views: { type: Number, default: 0 },
    shares: { type: Number, default: 0 },
    likes: { type: Number, default: 0 },
    comments: { type: Number, default: 0 },
    engagement: { type: Number, default: 0 }
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// User Behavior Schema - لتتبع سلوك المستخدم وتخصيص التوصيات
const userBehaviorSchema = new mongoose.Schema({
  userId: Number,
  behaviors: [{
    type: String, // search, view, compare, save, contact, etc.
    data: mongoose.Schema.Types.Mixed,
    carId: Number,
    timestamp: Date
  }],
  interests: [String], // اهتمامات تم استنتاجها من السلوك
  preferences: {
    priceRange: {
      min: Number,
      max: Number
    },
    carTypes: [String],
    brands: [String],
    features: [String],
    colors: [String],
    fuelTypes: [String]
  },
  recommendations: [{
    carId: Number,
    score: Number,
    reason: String,
    seen: { type: Boolean, default: false },
    clicked: { type: Boolean, default: false },
    timestamp: Date
  }],
  lastActive: { type: Date, default: Date.now }
});

// Search History Schema - لتتبع عمليات البحث
const searchHistorySchema = new mongoose.Schema({
  userId: Number,
  query: String,
  filters: mongoose.Schema.Types.Mixed,
  results: {
    total: Number,
    carIds: [Number]
  },
  location: {
    latitude: Number,
    longitude: Number,
    city: String
  },
  timestamp: { type: Date, default: Date.now }
});

// Market Trends Schema - لتحليل اتجاهات السوق
const marketTrendsSchema = new mongoose.Schema({
  period: String, // daily, weekly, monthly
  date: Date,
  trends: {
    popularBrands: [{
      brand: String,
      searchCount: Number,
      viewCount: Number,
      growth: Number // النمو مقارنة بالفترة السابقة
    }],
    popularModels: [{
      model: String,
      brand: String,
      searchCount: Number,
      viewCount: Number,
      growth: Number
    }],
    priceRanges: [{
      range: String, // e.g. "0-50000", "50000-100000"
      searchCount: Number,
      viewCount: Number,
      growth: Number
    }]
  },
  insights: [String], // توصيات وملاحظات مستنتجة
  createdAt: { type: Date, default: Date.now }
});

// Notifications Schema - لإدارة الإشعارات
const notificationSchema = new mongoose.Schema({
  userId: Number,
  type: String, // price-drop, new-match, saved-search-results, etc.
  title: String,
  message: String,
  data: mongoose.Schema.Types.Mixed,
  read: { type: Boolean, default: false },
  sentAt: { type: Date, default: Date.now },
  readAt: Date
});

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

// Export models
export const AIAnalytics = mongoose.model('AIAnalytics', aiAnalyticsSchema);
export const Content = mongoose.model('Content', contentSchema);
export const UserBehavior = mongoose.model('UserBehavior', userBehaviorSchema);
export const SearchHistory = mongoose.model('SearchHistory', searchHistorySchema);
export const MarketTrends = mongoose.model('MarketTrends', marketTrendsSchema);
export const Notification = mongoose.model('Notification', notificationSchema);
export const ChatMessage = mongoose.model('ChatMessage', chatMessageSchema);
export const ChatSession = mongoose.model('ChatSession', chatSessionSchema);