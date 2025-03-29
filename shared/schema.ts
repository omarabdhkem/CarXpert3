import { pgTable, serial, varchar, text, integer, timestamp, boolean, pgEnum, jsonb, decimal } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// تعريف أنواع الاستعلام
export type InferSelectModel<T> = T extends ReturnType<typeof pgTable<any, infer S>> ? S : never;
export type InferInsertModel<T> = T extends ReturnType<typeof pgTable<any, any, infer I>> ? I : never;

// تعريف الجداول
export const carStatusEnum = pgEnum('car_status', ['available', 'sold', 'reserved']);

// تعريف أنواع الأدوار
export const userRoleEnum = pgEnum('user_role', ['user', 'admin', 'moderator', 'dealer']);

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  username: varchar('username', { length: 100 }).unique().notNull(),
  email: varchar('email', { length: 255 }).unique().notNull(),
  password: varchar('password', { length: 255 }).notNull(),
  fullName: varchar('full_name', { length: 255 }),
  phone: varchar('phone', { length: 20 }),
  avatarUrl: text('avatar_url'),
  // إضافة الدور للمستخدم
  role: userRoleEnum('role').default('user'),
  // إضافة الموقع الجغرافي
  location: jsonb('location'),  // {lat: number, lng: number, address: string}
  // إضافة الإعدادات الشخصية
  preferences: jsonb('preferences'), // تفضيلات المستخدم مثل اللغة والإشعارات والتنبيهات وغيرها
  createdAt: timestamp('created_at').defaultNow(),
});

export const cars = pgTable('cars', {
  id: serial('id').primaryKey(),
  make: varchar('make', { length: 100 }).notNull(),
  model: varchar('model', { length: 100 }).notNull(),
  year: integer('year').notNull(),
  price: integer('price').notNull(),
  mileage: integer('mileage'),
  color: varchar('color', { length: 50 }),
  fuelType: varchar('fuel_type', { length: 50 }),
  description: text('description'),
  specifications: jsonb('specifications'), // مواصفات تفصيلية للسيارة
  // إضافة الصور بما في ذلك ثلاثية الأبعاد
  images: text('images').array(),
  threeDImages: text('three_d_images').array(), // روابط لنماذج ثلاثية الأبعاد
  // إضافة الموقع الجغرافي
  location: jsonb('location'), // {lat: number, lng: number, address: string}
  status: carStatusEnum('status').default('available'),
  userId: integer('user_id').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow(),
});

export const dealerships = pgTable("dealerships", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  address: text("address").notNull(),
  // تحديث الموقع الجغرافي ليكون بنفس شكل حقول الموقع الأخرى
  location: jsonb("location"), // {lat: number, lng: number, address: string}
  contact: jsonb("contact"), // {phone: string, email: string, website: string}
  images: text("images").array(),
  workingHours: jsonb("working_hours"), // ساعات العمل والأيام
  rating: decimal("rating", { precision: 3, scale: 2 }),
  facilities: text("facilities").array(), // مرافق المعرض
  createdAt: timestamp("created_at").defaultNow(),
});

export const serviceCenters = pgTable("service_centers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  address: text("address").notNull(),
  // تحديث الموقع الجغرافي ليكون بنفس شكل حقول الموقع الأخرى
  location: jsonb("location"), // {lat: number, lng: number, address: string}
  services: text("services").array(), // الخدمات المقدمة
  specializations: text("specializations").array(), // تخصصات مركز الصيانة
  contact: jsonb("contact"), // {phone: string, email: string, website: string}
  images: text("images").array(),
  workingHours: jsonb("working_hours"), // ساعات العمل والأيام
  rating: decimal("rating", { precision: 3, scale: 2 }),
  createdAt: timestamp("created_at").defaultNow(),
});

export const advertisements = pgTable("advertisements", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  type: text("type").notNull(), // نوع الإعلان (featured, banner, popup, etc)
  content: text("content"), 
  mediaUrls: text("media_urls").array(), // الصور أو مقاطع الفيديو المرتبطة بالإعلان
  carId: integer("car_id").references(() => cars.id),
  dealershipId: integer("dealership_id").references(() => dealerships.id),
  targetAudience: jsonb("target_audience"), // بيانات الجمهور المستهدف
  budget: integer("budget"), // ميزانية الإعلان
  metrics: jsonb("metrics"), // إحصائيات الإعلان (مشاهدات، نقرات، تحويلات)
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
  status: text("status").default("active"), // حالة الإعلان (active, paused, expired)
  createdAt: timestamp("created_at").defaultNow(),
});

export const favorites = pgTable('favorites', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  carId: integer('car_id').notNull().references(() => cars.id),
  createdAt: timestamp('created_at').defaultNow(),
});

// جدول فئات السيارات
export const carCategories = pgTable('car_categories', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  description: text('description'),
  imageUrl: text('image_url'),
  createdAt: timestamp('created_at').defaultNow(),
});

// جدول المكونات الأساسية للسيارات
export const carModels = pgTable('car_models', {
  id: serial('id').primaryKey(),
  make: varchar('make', { length: 100 }).notNull(),
  model: varchar('model', { length: 100 }).notNull(),
  categoryId: integer('category_id').references(() => carCategories.id),
  basePrice: integer('base_price').notNull(),
  year: integer('year').notNull(),
  description: text('description'),
  specifications: jsonb('specifications'),
  imageUrl: text('image_url'),
  thumbnailUrl: text('thumbnail_url'),
  createdAt: timestamp('created_at').defaultNow(),
});

// جدول خيارات تكوين السيارات
export const configOptions = pgTable('config_options', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  category: varchar('category', { length: 100 }).notNull(), // مثل: المحرك، الإطارات، اللون، الخ
  description: text('description'),
  price: integer('price').notNull(),
  imageUrl: text('image_url'),
  availableForModels: integer('available_for_models').array(), // معرفات الموديلات المتوافقة
  createdAt: timestamp('created_at').defaultNow(),
});

// جدول لحفظ تكوينات السيارات المخصصة للمستخدمين
export const carConfigurations = pgTable('car_configurations', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id),
  carModelId: integer('car_model_id').notNull().references(() => carModels.id),
  name: varchar('name', { length: 100 }),
  options: jsonb('options'), // مصفوفة معرفات الخيارات المحددة
  totalPrice: integer('total_price').notNull(), 
  isPublic: boolean('is_public').default(false),
  isPurchased: boolean('is_purchased').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// العلاقات
export const usersRelations = relations(users, ({ many }) => ({
  cars: many(cars),
  favorites: many(favorites),
  carConfigurations: many(carConfigurations),
}));

export const carsRelations = relations(cars, ({ one, many }) => ({
  user: one(users, {
    fields: [cars.userId],
    references: [users.id],
  }),
  favorites: many(favorites),
  advertisements: many(advertisements),
}));

export const favoritesRelations = relations(favorites, ({ one }) => ({
  user: one(users, {
    fields: [favorites.userId],
    references: [users.id],
  }),
  car: one(cars, {
    fields: [favorites.carId],
    references: [cars.id],
  }),
}));

export const dealershipRelations = relations(dealerships, ({ many }) => ({
  advertisements: many(advertisements),
}));

export const advertisementRelations = relations(advertisements, ({ one }) => ({
  car: one(cars, {
    fields: [advertisements.carId],
    references: [cars.id],
  }),
  dealership: one(dealerships, {
    fields: [advertisements.dealershipId],
    references: [dealerships.id],
  }),
}));

// العلاقات للجداول الجديدة
export const carCategoriesRelations = relations(carCategories, ({ many }) => ({
  carModels: many(carModels),
}));

export const carModelsRelations = relations(carModels, ({ one, many }) => ({
  category: one(carCategories, {
    fields: [carModels.categoryId],
    references: [carCategories.id],
  }),
  configurations: many(carConfigurations),
}));

export const carConfigurationsRelations = relations(carConfigurations, ({ one }) => ({
  user: one(users, {
    fields: [carConfigurations.userId],
    references: [users.id],
  }),
  carModel: one(carModels, {
    fields: [carConfigurations.carModelId],
    references: [carModels.id],
  }),
}));

// أنواع البيانات للاستخدام
export type User = InferSelectModel<typeof users>;
export type InsertUser = InferInsertModel<typeof users>;

export type Car = InferSelectModel<typeof cars>;
export type InsertCar = InferInsertModel<typeof cars>;

export type Favorite = InferSelectModel<typeof favorites>;
export type InsertFavorite = InferInsertModel<typeof favorites>;

export type Dealership = InferSelectModel<typeof dealerships>;
export type InsertDealership = InferInsertModel<typeof dealerships>;

export type ServiceCenter = InferSelectModel<typeof serviceCenters>;
export type InsertServiceCenter = InferInsertModel<typeof serviceCenters>;

export type Advertisement = InferSelectModel<typeof advertisements>;
export type InsertAdvertisement = InferInsertModel<typeof advertisements>;

// أنواع بيانات مُكوِّن السيارات
export type CarCategory = InferSelectModel<typeof carCategories>;
export type InsertCarCategory = InferInsertModel<typeof carCategories>;

export type CarModel = InferSelectModel<typeof carModels>;
export type InsertCarModel = InferInsertModel<typeof carModels>;

export type ConfigOption = InferSelectModel<typeof configOptions>;
export type InsertConfigOption = InferInsertModel<typeof configOptions>;

export type CarConfiguration = InferSelectModel<typeof carConfigurations>;
export type InsertCarConfiguration = InferInsertModel<typeof carConfigurations>;