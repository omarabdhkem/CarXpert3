// استيراد مكتبة passport للتحكم في المصادقة
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User } from "../shared/schema";
import connectPg from "connect-pg-simple";
import pg from 'pg';

// تعريف نوع المستخدم المستخدم في Passport
type PassportUser = {
  id: number;
  username: string;
  email: string;
  password: string;
  role?: string;
  [key: string]: any;
};

declare global {
  namespace Express {
    // تعريف نوع المستخدم في Express
    interface User extends PassportUser {}
  }
}

// تحويل الدالة scrypt إلى نسخة تدعم الوعود async/await
const scryptAsync = promisify(scrypt);
const PostgresqlStore = connectPg(session);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

export function setupAuth(app: Express) {
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    store: new PostgresqlStore({
      pool: new pg.Pool({ connectionString: process.env.DATABASE_URL }), // إنشاء مجمع اتصالات متوافق مع connect-pg-simple
      createTableIfMissing: true,
    }),
    cookie: {
      secure: process.env.NODE_ENV === "production",
      maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
    }
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user) {
          return done(null, false);
        }
        
        // تحقق من وجود خاصية password
        if (typeof user !== 'object' || !(await comparePasswords(password, (user as any).password))) {
          return done(null, false);
        }
        
        return done(null, user as Express.User);
      } catch (error) {
        return done(error);
      }
    }),
  );

  // تعريف عملية تخزين معلومات المستخدم في الجلسة
  passport.serializeUser((user: Express.User, done) => {
    return done(null, (user as any).id);
  });
  
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      if (!user || typeof user !== 'object') {
        return done(null, false);
      }
      return done(null, user as Express.User);
    } catch (error) {
      return done(error);
    }
  });

  app.post("/api/register", async (req, res, next) => {
    try {
      const existingUser = await storage.getUserByUsername(req.body.username);
      if (existingUser) {
        return res.status(400).json({ message: "اسم المستخدم موجود بالفعل" });
      }

      const hashedPassword = await hashPassword(req.body.password);
      const user = await storage.createUser({
        ...req.body,
        password: hashedPassword,
      });

      req.login(user as Express.User, (err) => {
        if (err) return next(err);
        res.status(201).json(user);
      });
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/login", passport.authenticate("local"), (req, res) => {
    res.status(200).json(req.user);
  });

  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    res.json(req.user);
  });
}
