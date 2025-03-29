/**
 * نظام التحسين الذاتي للتطبيق باستخدام الذكاء الاصطناعي
 * يقوم هذا النظام بمراقبة أخطاء التطبيق ومحاولة إصلاحها تلقائيًا
 */
import { storage } from '../storage';
import { callExternalAI } from './external-api';
import * as fs from 'fs';
import * as path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

// تحويل exec إلى وعد
const execPromise = promisify(exec);

export class SelfImprovementSystem {
  isRunning: boolean = false;
  lastRunTime: Date | null = null;
  checkInterval: NodeJS.Timeout | null = null;
  errorPatterns: Array<{
    pattern: RegExp;
    suggestedFix: string;
    severity: 'low' | 'medium' | 'high';
  }> = [
    {
      pattern: /TypeError: Cannot read properties? of (undefined|null)/i,
      suggestedFix: 'إضافة فحص للقيمة قبل محاولة الوصول إلى خصائصها',
      severity: 'high'
    },
    {
      pattern: /ECONNREFUSED|connection refused/i,
      suggestedFix: 'التحقق من اتصال قاعدة البيانات والخدمات الخارجية',
      severity: 'high'
    },
    {
      pattern: /Unexpected token/i,
      suggestedFix: 'تصحيح خطأ في صياغة JSON أو JavaScript',
      severity: 'medium'
    },
    {
      pattern: /ETIMEDOUT|timeout/i,
      suggestedFix: 'زيادة مهلة الاتصال أو التحقق من حالة الخدمة',
      severity: 'medium'
    },
    {
      pattern: /memory leak|heap out of memory/i,
      suggestedFix: 'تحقق من تسريبات الذاكرة واستخدام الموارد',
      severity: 'high'
    }
  ];

  /**
   * بدء تشغيل نظام التحسين الذاتي
   */
  async start(checkIntervalMinutes: number = 60): Promise<void> {
    if (this.isRunning) {
      console.log('نظام التحسين الذاتي قيد التشغيل بالفعل');
      return;
    }

    try {
      // تحديث حالة النظام
      await storage.updateSelfImprovementStatus({
        active: true,
        lastCycleTimestamp: new Date(),
        updatedAt: new Date()
      });

      // تهيئة الوحدات
      await storage.getSelfImprovementModules();

      this.isRunning = true;
      this.lastRunTime = new Date();

      // جدولة عملية فحص دورية
      const intervalMs = checkIntervalMinutes * 60 * 1000;
      this.checkInterval = setInterval(() => this.performHealthCheck(), intervalMs);

      // تشغيل فحص مبدئي
      await this.performHealthCheck();

      console.log(`تم بدء تشغيل نظام التحسين الذاتي بنجاح. سيتم إجراء فحص كل ${checkIntervalMinutes} دقيقة.`);
      
      // تسجيل نشاط النظام
      await storage.logSystemActivity('self_improvement_start', {
        timestamp: new Date(),
        message: 'تم بدء تشغيل نظام التحسين الذاتي'
      });
    } catch (error) {
      console.error('فشل في بدء تشغيل نظام التحسين الذاتي:', error);
      this.isRunning = false;

      // تسجيل الخطأ
      await storage.logError({
        type: 'self_improvement',
        message: 'فشل في بدء تشغيل نظام التحسين الذاتي',
        details: {
          error: String(error),
          timestamp: new Date()
        }
      });
    }
  }

  /**
   * إيقاف نظام التحسين الذاتي
   */
  async stop(): Promise<void> {
    if (!this.isRunning) {
      console.log('نظام التحسين الذاتي غير نشط حاليًا');
      return;
    }

    try {
      if (this.checkInterval) {
        clearInterval(this.checkInterval);
        this.checkInterval = null;
      }

      this.isRunning = false;

      // تحديث حالة النظام
      await storage.updateSelfImprovementStatus({
        active: false,
        updatedAt: new Date()
      });

      console.log('تم إيقاف نظام التحسين الذاتي بنجاح');
      
      // تسجيل نشاط النظام
      await storage.logSystemActivity('self_improvement_stop', {
        timestamp: new Date(),
        message: 'تم إيقاف نظام التحسين الذاتي'
      });
    } catch (error) {
      console.error('فشل في إيقاف نظام التحسين الذاتي:', error);

      // تسجيل الخطأ
      await storage.logError({
        type: 'self_improvement',
        message: 'فشل في إيقاف نظام التحسين الذاتي',
        details: {
          error: String(error),
          timestamp: new Date()
        }
      });
    }
  }

  /**
   * إجراء فحص صحة للنظام
   */
  async performHealthCheck(): Promise<void> {
    if (!this.isRunning) return;

    try {
      console.log('جاري إجراء فحص صحة النظام...');
      this.lastRunTime = new Date();

      // تحديث حالة النظام
      await storage.updateSelfImprovementStatus({
        lastCycleTimestamp: new Date()
      });

      // 1. فحص سجلات الأخطاء الحديثة
      const recentErrors = await storage.getErrorLogs(50);
      
      // 2. تحليل الأخطاء وتحديد أنماطها المتكررة
      const errorPatterns = this.analyzePatternsInErrors(recentErrors);
      
      // 3. فحص استخدام الموارد
      const resourceStatus = await this.checkResourceUsage();
      
      // 4. تقييم أداء قاعدة البيانات
      const dbStatus = await this.checkDatabasePerformance();
      
      // 5. توليد اقتراحات للتحسين
      const suggestions = await this.generateOptimizationSuggestions(
        errorPatterns,
        resourceStatus,
        dbStatus
      );
      
      // تسجيل التقرير
      await storage.logSystemActivity('health_check_completed', {
        timestamp: new Date(),
        details: {
          errorPatterns,
          resourceStatus,
          dbStatus,
          suggestionsCount: suggestions.length
        }
      });

      console.log(`تم الانتهاء من فحص صحة النظام. تم توليد ${suggestions.length} اقتراح(ات).`);
    } catch (error) {
      console.error('فشل في إجراء فحص صحة النظام:', error);

      // تسجيل الخطأ
      await storage.logError({
        type: 'self_improvement',
        message: 'فشل في إجراء فحص صحة النظام',
        details: {
          error: String(error),
          timestamp: new Date()
        }
      });
    }
  }

  /**
   * تحليل أنماط الأخطاء في سجلات الأخطاء
   */
  analyzePatternsInErrors(errors: any[]): Array<{
    pattern: string;
    count: number;
    examples: string[];
    severity: 'low' | 'medium' | 'high';
  }> {
    const patterns: Map<string, {
      count: number;
      examples: string[];
      severity: 'low' | 'medium' | 'high';
    }> = new Map();

    // تحليل كل خطأ وتجميع الأنماط المتشابهة
    for (const error of errors) {
      const errorMessage = error.message || '';
      const errorDetails = error.details ? JSON.stringify(error.details) : '';
      const fullErrorText = `${errorMessage} ${errorDetails}`;

      // فحص الرسالة مقابل أنماط الأخطاء المعروفة
      for (const pattern of this.errorPatterns) {
        if (pattern.pattern.test(fullErrorText)) {
          const patternKey = pattern.suggestedFix;
          if (!patterns.has(patternKey)) {
            patterns.set(patternKey, {
              count: 0,
              examples: [],
              severity: pattern.severity
            });
          }

          const patternInfo = patterns.get(patternKey)!;
          patternInfo.count++;

          // إضافة مثال فقط إذا لم يتم تجاوز الحد
          if (patternInfo.examples.length < 3) {
            patternInfo.examples.push(errorMessage);
          }
        }
      }
    }

    // تحويل الخريطة إلى مصفوفة للعودة
    return Array.from(patterns.entries()).map(([pattern, info]) => ({
      pattern,
      count: info.count,
      examples: info.examples,
      severity: info.severity
    }));
  }

  /**
   * فحص استخدام موارد النظام
   */
  async checkResourceUsage(): Promise<{
    memory: {
      totalMB: number;
      usedMB: number;
      usagePercent: number;
    };
    cpu: {
      usagePercent: number;
    };
    disk: {
      totalGB: number;
      freeGB: number;
      usagePercent: number;
    };
  }> {
    try {
      // فحص استخدام الذاكرة
      const memoryInfo = process.memoryUsage();
      const totalMemoryMB = Math.round(os.totalmem() / 1024 / 1024);
      const usedMemoryMB = Math.round(memoryInfo.rss / 1024 / 1024);
      const memoryUsagePercent = Math.round((usedMemoryMB / totalMemoryMB) * 100);

      // فحص استخدام وحدة المعالجة المركزية (CPU)
      // هذا هو تقريب بسيط - في بيئة الإنتاج استخدم أدوات أكثر تقدمًا
      const cpuUsagePercent = await this.getCpuUsage();

      // فحص استخدام القرص
      const { stdout: diskOutput } = await execPromise('df -h / --output=size,avail,pcent');
      const diskMatches = diskOutput.match(/([0-9.]+[GT])\s+([0-9.]+[GT])\s+([0-9]+)%/);
      
      let totalGB = 0;
      let freeGB = 0;
      let diskUsagePercent = 0;
      
      if (diskMatches && diskMatches.length >= 4) {
        totalGB = this.parseSize(diskMatches[1]);
        freeGB = this.parseSize(diskMatches[2]);
        diskUsagePercent = parseInt(diskMatches[3], 10);
      }

      return {
        memory: {
          totalMB: totalMemoryMB,
          usedMB: usedMemoryMB,
          usagePercent: memoryUsagePercent
        },
        cpu: {
          usagePercent: cpuUsagePercent
        },
        disk: {
          totalGB,
          freeGB,
          usagePercent: diskUsagePercent
        }
      };
    } catch (error) {
      console.error('فشل في فحص استخدام الموارد:', error);
      
      // قيم افتراضية في حالة الفشل
      return {
        memory: { totalMB: 0, usedMB: 0, usagePercent: 0 },
        cpu: { usagePercent: 0 },
        disk: { totalGB: 0, freeGB: 0, usagePercent: 0 }
      };
    }
  }

  /**
   * تحليل حجم القرص من صيغة نصية (مثل "10G" أو "500M")
   */
  parseSize(sizeStr: string): number {
    try {
      const value = parseFloat(sizeStr);
      if (sizeStr.endsWith('G')) {
        return value;
      } else if (sizeStr.endsWith('T')) {
        return value * 1024;
      } else if (sizeStr.endsWith('M')) {
        return value / 1024;
      }
      return 0;
    } catch {
      return 0;
    }
  }

  /**
   * الحصول على استخدام المعالج
   */
  async getCpuUsage(): Promise<number> {
    try {
      const startMeasure = os.cpus();
      
      // انتظار لفترة قصيرة ثم قياس مرة أخرى
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const endMeasure = os.cpus();
      
      let idleDifference = 0;
      let totalDifference = 0;
      
      for (let i = 0; i < startMeasure.length; i++) {
        const startTimes = startMeasure[i].times;
        const endTimes = endMeasure[i].times;
        
        const startIdle = startTimes.idle;
        const startTotal = startTimes.user + startTimes.nice + startTimes.sys + startTimes.idle + startTimes.irq;
        
        const endIdle = endTimes.idle;
        const endTotal = endTimes.user + endTimes.nice + endTimes.sys + endTimes.idle + endTimes.irq;
        
        idleDifference += (endIdle - startIdle);
        totalDifference += (endTotal - startTotal);
      }
      
      const cpuUsagePercent = 100 - Math.round((idleDifference / totalDifference) * 100);
      return cpuUsagePercent;
    } catch (error) {
      console.error('فشل في حساب استخدام المعالج:', error);
      return 0;
    }
  }

  /**
   * فحص أداء قاعدة البيانات
   */
  async checkDatabasePerformance(): Promise<{
    connectionStatus: 'ok' | 'slow' | 'error';
    avgQueryTime: number;
    activeConnections: number;
  }> {
    try {
      // قياس وقت الاستجابة لاستعلام بسيط
      const startTime = Date.now();
      
      try {
        // استعلام بسيط
        await storage.getUser(1);
        
        const queryTime = Date.now() - startTime;
        
        return {
          connectionStatus: queryTime < 100 ? 'ok' : 'slow',
          avgQueryTime: queryTime,
          activeConnections: 1 // في بيئة الإنتاج، استخدم استعلامات خاصة لقاعدة البيانات للحصول على العدد الحقيقي
        };
      } catch {
        return {
          connectionStatus: 'error',
          avgQueryTime: -1,
          activeConnections: 0
        };
      }
    } catch (error) {
      console.error('فشل في فحص أداء قاعدة البيانات:', error);
      
      return {
        connectionStatus: 'error',
        avgQueryTime: -1,
        activeConnections: 0
      };
    }
  }

  /**
   * توليد اقتراحات للتحسين بناءً على بيانات الفحص
   */
  async generateOptimizationSuggestions(
    errorPatterns: Array<{
      pattern: string;
      count: number;
      examples: string[];
      severity: 'low' | 'medium' | 'high';
    }>,
    resourceStatus: any,
    dbStatus: any
  ): Promise<any[]> {
    const suggestions = [];

    // 1. اقتراحات بناءً على أنماط الأخطاء
    for (const pattern of errorPatterns) {
      if (pattern.count >= 3 || pattern.severity === 'high') {
        const suggestion = {
          type: 'error_pattern',
          title: `معالجة نمط الخطأ المتكرر: ${pattern.pattern}`,
          description: `تم ملاحظة هذا الخطأ ${pattern.count} مرات. مثال: ${pattern.examples[0]}`,
          severity: pattern.severity,
          status: 'pending',
          timestamp: new Date()
        };
        
        await storage.saveOptimizationSuggestion(suggestion);
        suggestions.push(suggestion);
      }
    }

    // 2. اقتراحات بناءً على استخدام الموارد
    if (resourceStatus.memory.usagePercent > 85) {
      const suggestion = {
        type: 'resource_usage',
        title: 'استخدام الذاكرة مرتفع',
        description: `استخدام الذاكرة حاليًا ${resourceStatus.memory.usagePercent}%. يُنصح بتحسين استخدام الذاكرة أو زيادة الموارد المتاحة.`,
        severity: 'high',
        status: 'pending',
        timestamp: new Date()
      };
      
      await storage.saveOptimizationSuggestion(suggestion);
      suggestions.push(suggestion);
    }

    if (resourceStatus.cpu.usagePercent > 80) {
      const suggestion = {
        type: 'resource_usage',
        title: 'استخدام المعالج مرتفع',
        description: `استخدام المعالج حاليًا ${resourceStatus.cpu.usagePercent}%. يُنصح بتحسين الأداء أو زيادة موارد المعالجة.`,
        severity: 'medium',
        status: 'pending',
        timestamp: new Date()
      };
      
      await storage.saveOptimizationSuggestion(suggestion);
      suggestions.push(suggestion);
    }

    if (resourceStatus.disk.usagePercent > 90) {
      const suggestion = {
        type: 'resource_usage',
        title: 'مساحة القرص منخفضة',
        description: `استخدام القرص حاليًا ${resourceStatus.disk.usagePercent}%. يُنصح بتحرير مساحة أو إضافة مساحة تخزين.`,
        severity: 'high',
        status: 'pending',
        timestamp: new Date()
      };
      
      await storage.saveOptimizationSuggestion(suggestion);
      suggestions.push(suggestion);
    }

    // 3. اقتراحات بناءً على أداء قاعدة البيانات
    if (dbStatus.connectionStatus === 'slow') {
      const suggestion = {
        type: 'database_performance',
        title: 'أداء قاعدة البيانات بطيء',
        description: `متوسط وقت الاستعلام ${dbStatus.avgQueryTime}ms. يُنصح بتحسين استعلامات قاعدة البيانات أو تحسين تكوين قاعدة البيانات.`,
        severity: 'medium',
        status: 'pending',
        timestamp: new Date()
      };
      
      await storage.saveOptimizationSuggestion(suggestion);
      suggestions.push(suggestion);
    }

    return suggestions;
  }

  /**
   * محاولة إصلاح خطأ باستخدام الذكاء الاصطناعي
   */
  async attemptToFixError(errorLog: any): Promise<{
    success: boolean;
    message: string;
    appliedChanges?: any;
  }> {
    try {
      console.log(`محاولة إصلاح الخطأ: ${errorLog.message}`);

      // 1. تحليل الخطأ
      const errorInfo = this.analyzeError(errorLog);
      
      // 2. الحصول على ملف الكود المسبب للخطأ
      const filePath = this.findFileFromError(errorInfo);
      
      if (!filePath) {
        return {
          success: false,
          message: 'لم يتم العثور على ملف المصدر المرتبط بالخطأ'
        };
      }
      
      // 3. قراءة محتوى الملف
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      
      // 4. استخدام الذكاء الاصطناعي لإصلاح الخطأ
      const fixResult = await this.getAIFix(errorInfo, fileContent, filePath);
      
      if (!fixResult.success) {
        return {
          success: false,
          message: fixResult.message
        };
      }
      
      // 5. تطبيق الإصلاح
      fs.writeFileSync(filePath, fixResult.fixedCode);
      
      // 6. تسجيل الإصلاح
      await storage.logSystemActivity('auto_fix_applied', {
        timestamp: new Date(),
        errorId: errorLog.id,
        file: filePath,
        changes: {
          before: fileContent,
          after: fixResult.fixedCode
        }
      });
      
      return {
        success: true,
        message: `تم إصلاح الخطأ في ${filePath}`,
        appliedChanges: {
          file: filePath,
          lineNumbers: fixResult.changedLines
        }
      };
    } catch (error) {
      console.error('فشل في محاولة إصلاح الخطأ:', error);
      
      return {
        success: false,
        message: `فشل في إصلاح الخطأ: ${String(error)}`
      };
    }
  }

  /**
   * تحليل معلومات الخطأ
   */
  analyzeError(errorLog: any): {
    message: string;
    stack?: string;
    lineNumber?: number;
    columnNumber?: number;
    filePath?: string;
    errorType?: string;
  } {
    const result: any = {
      message: errorLog.message
    };
    
    // استخراج معلومات الخطأ من السجل
    if (errorLog.details) {
      if (errorLog.details.stack) {
        result.stack = errorLog.details.stack;
        
        // استخراج رقم السطر وملف المصدر من stack trace
        const stackLines = result.stack.split('\n');
        for (const line of stackLines) {
          const match = line.match(/at\s+(?:.*?\s+\()?(.+?):(\d+):(\d+)/);
          if (match) {
            result.filePath = match[1];
            result.lineNumber = parseInt(match[2], 10);
            result.columnNumber = parseInt(match[3], 10);
            break;
          }
        }
      }
      
      // استخراج نوع الخطأ
      if (errorLog.details.name) {
        result.errorType = errorLog.details.name;
      } else if (errorLog.message.includes(':')) {
        result.errorType = errorLog.message.split(':')[0].trim();
      }
    }
    
    return result;
  }

  /**
   * البحث عن ملف المصدر من معلومات الخطأ
   */
  findFileFromError(errorInfo: any): string | null {
    if (errorInfo.filePath) {
      // تطبيع المسار إذا لزم الأمر
      let filePath = errorInfo.filePath;
      
      // التحقق من وجود الملف
      if (fs.existsSync(filePath)) {
        return filePath;
      }
      
      // محاولة تصحيح المسار
      if (filePath.startsWith('/') && !filePath.startsWith('/app')) {
        filePath = path.join('/app', filePath);
        if (fs.existsSync(filePath)) {
          return filePath;
        }
      }
    }
    
    // إذا لم يتم العثور على الملف من خلال السجل، يمكن أن نحاول البحث في محتوى الرسالة
    const fileMatches = errorInfo.message.match(/(\/[\w\/\.-]+\.[jt]s)(?::|$|\s)/);
    if (fileMatches && fileMatches[1]) {
      const filePath = fileMatches[1];
      if (fs.existsSync(filePath)) {
        return filePath;
      }
    }
    
    return null;
  }

  /**
   * الحصول على إصلاح من الذكاء الاصطناعي
   */
  async getAIFix(
    errorInfo: any,
    fileContent: string,
    filePath: string
  ): Promise<{
    success: boolean;
    message: string;
    fixedCode?: string;
    changedLines?: number[];
  }> {
    try {
      // إعداد الطلب للذكاء الاصطناعي
      const prompt = `
        أنا بحاجة إلى إصلاح الخطأ التالي في الكود:
        
        خطأ: ${errorInfo.message}
        ملف: ${filePath}
        سطر: ${errorInfo.lineNumber || 'غير معروف'}
        عمود: ${errorInfo.columnNumber || 'غير معروف'}
        نوع الخطأ: ${errorInfo.errorType || 'غير معروف'}
        
        هذا هو الكود الحالي:
        \`\`\`
        ${fileContent}
        \`\`\`
        
        يرجى تحليل الخطأ وإصلاحه. قم بإرجاع الكود كاملاً بعد الإصلاح مع تضمين تعليق توضيحي قبل السطر المُعدل يشرح التصحيح. كن دقيقاً ولا تغير سوى ما يحتاج إلى إصلاح.
      `;
      
      // استدعاء واجهة الذكاء الاصطناعي
      const response = await callExternalAI({
        prompt,
        systemPrompt: 'أنت مبرمج خبير متخصص في تصحيح أخطاء البرمجة. مهمتك هي تحليل الأخطاء وإصلاحها بدقة.',
        maxTokens: 2500,
        temperature: 0.2
      });
      
      // استخراج الكود المُصلح من الاستجابة
      let fixedCode = fileContent; // في حالة الفشل، استخدم الكود الأصلي
      
      // البحث عن كتلة الكود في الاستجابة
      const codeBlockMatch = response.text.match(/```(?:javascript|typescript|js|ts)?\s*([\s\S]+?)\s*```/);
      if (codeBlockMatch && codeBlockMatch[1]) {
        fixedCode = codeBlockMatch[1];
      }
      
      // حساب أرقام الأسطر المتغيرة
      const changedLines = this.diffLines(fileContent, fixedCode);
      
      return {
        success: true,
        message: 'تم إنشاء إصلاح محتمل باستخدام الذكاء الاصطناعي',
        fixedCode,
        changedLines
      };
    } catch (error) {
      console.error('فشل في الحصول على إصلاح من الذكاء الاصطناعي:', error);
      
      return {
        success: false,
        message: `فشل في الحصول على إصلاح من الذكاء الاصطناعي: ${String(error)}`
      };
    }
  }

  /**
   * حساب أرقام الأسطر المتغيرة بين إصدارين من الملف
   */
  diffLines(oldCode: string, newCode: string): number[] {
    const oldLines = oldCode.split('\n');
    const newLines = newCode.split('\n');
    const changedLineNumbers: number[] = [];
    
    // مقارنة كل سطر
    const minLength = Math.min(oldLines.length, newLines.length);
    
    for (let i = 0; i < minLength; i++) {
      if (oldLines[i] !== newLines[i]) {
        changedLineNumbers.push(i + 1); // الأسطر تبدأ من 1
      }
    }
    
    // إذا كان هناك أسطر إضافية أو محذوفة
    if (oldLines.length !== newLines.length) {
      if (oldLines.length < newLines.length) {
        // تمت إضافة أسطر
        for (let i = minLength; i < newLines.length; i++) {
          changedLineNumbers.push(i + 1);
        }
      } else {
        // تم حذف أسطر
        for (let i = minLength; i < oldLines.length; i++) {
          changedLineNumbers.push(i + 1);
        }
      }
    }
    
    return changedLineNumbers;
  }
}

// Singleton instance
export const selfImprovementSystem = new SelfImprovementSystem();

// صادرات إضافية لمرجع جزئي من الوحدة
import * as os from 'os';