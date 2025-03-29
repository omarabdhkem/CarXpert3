import { Router, Request, Response } from 'express';
import { aiServices } from '../../ai';
import { storage } from '../../storage';

const router = Router();

/**
 * مسار API لمقارنة السيارات باستخدام الذكاء الاصطناعي
 * يقارن بين السيارات المختارة ويقدم تحليلًا مفصلًا للمزايا والعيوب
 * ويقدم توصية بالسيارة المناسبة بناءً على تفضيلات المستخدم
 */
router.post('/car-comparison', async (req: Request, res: Response) => {
  try {
    const { carIds, userPreference, userId } = req.body;
    
    if (!carIds || !Array.isArray(carIds) || carIds.length < 2) {
      return res.status(400).json({ error: 'مطلوب على الأقل معرفات سيارتين للمقارنة' });
    }

    if (carIds.length > 4) {
      return res.status(400).json({ error: 'يمكن مقارنة 4 سيارات كحد أقصى' });
    }

    // جلب بيانات السيارات التي سيتم مقارنتها
    const cars = await Promise.all(carIds.map(id => storage.getCar(id)));
    
    // التحقق من وجود جميع السيارات
    const missingCars = cars.map((car, index) => car ? null : carIds[index]).filter(id => id !== null);
    if (missingCars.length > 0) {
      return res.status(404).json({ 
        error: 'بعض السيارات غير موجودة', 
        missingCars 
      });
    }

    // تخصيص المقارنة بناءً على تفضيلات المستخدم
    let userBehavior;
    if (userId) {
      userBehavior = await storage.getUserBehavior(userId);
    }

    // إجراء المقارنة باستخدام الذكاء الاصطناعي
    const comparisonResult = {
      items: [],
      recommendation: '',
      comparison: {}
    };

    // لكل سيارة، قم بإعداد بيانات المقارنة
    for (const car of cars) {
      // حساب المزايا والعيوب لكل سيارة
      const advantages = generateAdvantages(car, cars);
      const disadvantages = generateDisadvantages(car, cars);
      
      // حساب نتيجة السيارة بناءً على المزايا والعيوب
      const score = calculateScore(car, cars, userPreference, userBehavior);
      
      // حساب قيمة السيارة مقابل السعر
      const valueScore = calculateValueScore(car, cars);
      
      comparisonResult.items.push({
        car,
        advantages,
        disadvantages,
        score,
        valueScore
      });
    }

    // إنشاء جدول المقارنة التفصيلي لكل خاصية
    comparisonResult.comparison = createComparisonTable(cars);
    
    // تحديد التوصية النهائية
    comparisonResult.recommendation = generateRecommendation(
      comparisonResult.items, 
      userPreference, 
      userBehavior
    );

    // حفظ المقارنة إذا كان هناك مستخدم
    if (userId) {
      const savedComparison = await storage.createCarComparison(
        userId, 
        carIds, 
        `مقارنة ${carIds.length} سيارات`
      );
      
      // تسجيل النشاط
      await storage.logUserEvent(userId, 'car_comparison', {
        carIds,
        comparisonId: savedComparison.id,
        timestamp: new Date().toISOString()
      });
    }

    res.json(comparisonResult);
  } catch (error) {
    console.error('Error performing car comparison:', error);
    res.status(500).json({ error: 'حدث خطأ أثناء مقارنة السيارات' });
  }
});

/**
 * توليد مزايا السيارة بالمقارنة مع السيارات الأخرى
 */
function generateAdvantages(car, allCars) {
  const advantages = [];
  
  // السعر
  const cheaperCars = allCars.filter(c => c.id !== car.id && c.price > car.price);
  if (cheaperCars.length > 0) {
    advantages.push(`سعر أقل من ${cheaperCars.length} سيارات أخرى`);
  }
  
  // السنة
  const olderCars = allCars.filter(c => c.id !== car.id && c.year < car.year);
  if (olderCars.length > 0) {
    advantages.push(`موديل أحدث من ${olderCars.length} سيارات أخرى`);
  }
  
  // المسافة
  const higherMileageCars = allCars.filter(c => c.id !== car.id && c.mileage > car.mileage);
  if (higherMileageCars.length > 0) {
    advantages.push(`عدد كيلومترات أقل من ${higherMileageCars.length} سيارات أخرى`);
  }
  
  // قوة المحرك
  if (car.horsepower) {
    const lowerHorsepowerCars = allCars.filter(
      c => c.id !== car.id && c.horsepower && c.horsepower < car.horsepower
    );
    if (lowerHorsepowerCars.length > 0) {
      advantages.push(`قوة محرك أعلى (${car.horsepower} حصان)`);
    }
  }
  
  // استهلاك الوقود
  if (car.fuelConsumption) {
    const higherConsumptionCars = allCars.filter(
      c => c.id !== car.id && c.fuelConsumption && c.fuelConsumption > car.fuelConsumption
    );
    if (higherConsumptionCars.length > 0) {
      advantages.push(`استهلاك وقود أقل (${car.fuelConsumption} لتر/100كم)`);
    }
  }
  
  // المميزات
  if (car.features && car.features.length > 0) {
    for (const otherCar of allCars) {
      if (otherCar.id === car.id || !otherCar.features) continue;
      
      const uniqueFeatures = car.features.filter(feature => !otherCar.features.includes(feature));
      if (uniqueFeatures.length > 0) {
        advantages.push(`يتميز بـ ${uniqueFeatures.length} ميزات غير متوفرة في ${otherCar.make} ${otherCar.model}`);
        break;
      }
    }
  }
  
  // إضافة مزايا إضافية إذا كانت المزايا قليلة
  if (advantages.length < 3) {
    if (car.transmission === 'automatic' && allCars.some(c => c.id !== car.id && c.transmission === 'manual')) {
      advantages.push('ناقل حركة أوتوماتيكي');
    }
    
    if (car.bodyType === 'SUV' && allCars.some(c => c.id !== car.id && c.bodyType !== 'SUV')) {
      advantages.push('تصميم دفع رباعي أكثر ملاءمة للطرق الوعرة');
    }
  }
  
  return advantages;
}

/**
 * توليد عيوب السيارة بالمقارنة مع السيارات الأخرى
 */
function generateDisadvantages(car, allCars) {
  const disadvantages = [];
  
  // السعر
  const expensiveCars = allCars.filter(c => c.id !== car.id && c.price < car.price);
  if (expensiveCars.length > 0) {
    disadvantages.push(`سعر أعلى من ${expensiveCars.length} سيارات أخرى`);
  }
  
  // السنة
  const newerCars = allCars.filter(c => c.id !== car.id && c.year > car.year);
  if (newerCars.length > 0) {
    disadvantages.push(`موديل أقدم من ${newerCars.length} سيارات أخرى`);
  }
  
  // المسافة
  const lowerMileageCars = allCars.filter(c => c.id !== car.id && c.mileage < car.mileage);
  if (lowerMileageCars.length > 0) {
    disadvantages.push(`عدد كيلومترات أعلى من ${lowerMileageCars.length} سيارات أخرى`);
  }
  
  // قوة المحرك
  if (car.horsepower) {
    const higherHorsepowerCars = allCars.filter(
      c => c.id !== car.id && c.horsepower && c.horsepower > car.horsepower
    );
    if (higherHorsepowerCars.length > 0) {
      disadvantages.push(`قوة محرك أقل (${car.horsepower} حصان)`);
    }
  }
  
  // استهلاك الوقود
  if (car.fuelConsumption) {
    const lowerConsumptionCars = allCars.filter(
      c => c.id !== car.id && c.fuelConsumption && c.fuelConsumption < car.fuelConsumption
    );
    if (lowerConsumptionCars.length > 0) {
      disadvantages.push(`استهلاك وقود أعلى (${car.fuelConsumption} لتر/100كم)`);
    }
  }
  
  // المميزات
  for (const otherCar of allCars) {
    if (otherCar.id === car.id) continue;
    
    if (otherCar.features && car.features) {
      const missingFeatures = otherCar.features.filter(feature => !car.features.includes(feature));
      if (missingFeatures.length > 0) {
        disadvantages.push(`يفتقر إلى ${missingFeatures.length} ميزات متوفرة في ${otherCar.make} ${otherCar.model}`);
        break;
      }
    }
  }
  
  // إضافة عيوب إضافية إذا كانت العيوب قليلة
  if (disadvantages.length < 2) {
    if (car.transmission === 'manual' && allCars.some(c => c.id !== car.id && c.transmission === 'automatic')) {
      disadvantages.push('ناقل حركة يدوي يتطلب مجهوداً أكبر في القيادة');
    }
    
    if (car.bodyType === 'sedan' && allCars.some(c => c.id !== car.id && c.bodyType === 'SUV')) {
      disadvantages.push('مساحة داخلية أقل مقارنة بسيارات الدفع الرباعي');
    }
  }
  
  return disadvantages;
}

/**
 * حساب نتيجة السيارة بناءً على مقارنتها مع السيارات الأخرى
 */
function calculateScore(car, allCars, userPreference, userBehavior) {
  let score = 0.5; // نتيجة محايدة افتراضية
  
  // المعايير الأساسية ووزنها
  const criteria = {
    price: 0.2,
    year: 0.15,
    mileage: 0.15,
    horsepower: 0.1,
    fuelConsumption: 0.1,
    features: 0.1,
    bodyType: 0.1,
    transmission: 0.1
  };
  
  // تعديل الأوزان بناءً على تفضيلات المستخدم
  if (userPreference) {
    switch (userPreference) {
      case 'price':
        criteria.price = 0.4;
        criteria.year = 0.1;
        criteria.mileage = 0.1;
        break;
      case 'performance':
        criteria.horsepower = 0.3;
        criteria.year = 0.2;
        criteria.price = 0.1;
        break;
      case 'fuel':
        criteria.fuelConsumption = 0.4;
        criteria.price = 0.2;
        criteria.mileage = 0.1;
        break;
      case 'reliability':
        criteria.year = 0.25;
        criteria.mileage = 0.25;
        criteria.make = 0.2;
        break;
      case 'luxury':
        criteria.features = 0.3;
        criteria.year = 0.2;
        criteria.horsepower = 0.15;
        break;
      case 'family':
        criteria.bodyType = 0.3;
        criteria.features = 0.2;
        criteria.safety = 0.2;
        break;
      case 'value':
        // الوزن الافتراضي متوازن
        break;
    }
  }
  
  // حساب نتيجة السعر (نتيجة أعلى للسعر الأقل)
  const minPrice = Math.min(...allCars.map(c => c.price));
  const maxPrice = Math.max(...allCars.map(c => c.price));
  const priceRange = maxPrice - minPrice;
  
  if (priceRange > 0) {
    const priceScore = 1 - ((car.price - minPrice) / priceRange);
    score += (priceScore * criteria.price) - (criteria.price / 2);
  }
  
  // حساب نتيجة السنة (نتيجة أعلى للسنة الأحدث)
  const minYear = Math.min(...allCars.map(c => c.year));
  const maxYear = Math.max(...allCars.map(c => c.year));
  const yearRange = maxYear - minYear;
  
  if (yearRange > 0) {
    const yearScore = (car.year - minYear) / yearRange;
    score += (yearScore * criteria.year) - (criteria.year / 2);
  }
  
  // حساب نتيجة المسافة (نتيجة أعلى للمسافة الأقل)
  const minMileage = Math.min(...allCars.map(c => c.mileage));
  const maxMileage = Math.max(...allCars.map(c => c.mileage));
  const mileageRange = maxMileage - minMileage;
  
  if (mileageRange > 0) {
    const mileageScore = 1 - ((car.mileage - minMileage) / mileageRange);
    score += (mileageScore * criteria.mileage) - (criteria.mileage / 2);
  }
  
  // حساب نتيجة قوة المحرك (إذا كانت متوفرة)
  if (car.horsepower) {
    const horsepowerValues = allCars
      .filter(c => c.horsepower)
      .map(c => c.horsepower);
    
    if (horsepowerValues.length > 1) {
      const minHorsepower = Math.min(...horsepowerValues);
      const maxHorsepower = Math.max(...horsepowerValues);
      const horsepowerRange = maxHorsepower - minHorsepower;
      
      if (horsepowerRange > 0) {
        const horsepowerScore = (car.horsepower - minHorsepower) / horsepowerRange;
        score += (horsepowerScore * criteria.horsepower) - (criteria.horsepower / 2);
      }
    }
  }
  
  // حساب نتيجة استهلاك الوقود (إذا كانت متوفرة)
  if (car.fuelConsumption) {
    const fuelValues = allCars
      .filter(c => c.fuelConsumption)
      .map(c => c.fuelConsumption);
    
    if (fuelValues.length > 1) {
      const minFuel = Math.min(...fuelValues);
      const maxFuel = Math.max(...fuelValues);
      const fuelRange = maxFuel - minFuel;
      
      if (fuelRange > 0) {
        const fuelScore = 1 - ((car.fuelConsumption - minFuel) / fuelRange);
        score += (fuelScore * criteria.fuelConsumption) - (criteria.fuelConsumption / 2);
      }
    }
  }
  
  // حساب نتيجة المميزات (إذا كانت متوفرة)
  if (car.features) {
    const featuresCounts = allCars
      .filter(c => c.features)
      .map(c => c.features.length);
    
    if (featuresCounts.length > 1) {
      const minFeatures = Math.min(...featuresCounts);
      const maxFeatures = Math.max(...featuresCounts);
      const featuresRange = maxFeatures - minFeatures;
      
      if (featuresRange > 0) {
        const featuresScore = (car.features.length - minFeatures) / featuresRange;
        score += (featuresScore * criteria.features) - (criteria.features / 2);
      }
    }
  }
  
  // تعديل النتيجة بناءً على سلوك المستخدم (إذا كان متوفراً)
  if (userBehavior && userBehavior.preferences) {
    // تفضيلات الماركة
    if (userBehavior.preferences.makes && userBehavior.preferences.makes[car.make]) {
      const makePreference = userBehavior.preferences.makes[car.make];
      score += makePreference > 0 ? 0.05 : -0.05;
    }
    
    // تفضيلات نوع الهيكل
    if (userBehavior.preferences.bodyTypes && car.bodyType && 
        userBehavior.preferences.bodyTypes[car.bodyType]) {
      const bodyTypePreference = userBehavior.preferences.bodyTypes[car.bodyType];
      score += bodyTypePreference > 0 ? 0.05 : -0.05;
    }
    
    // تفضيلات نطاق السعر
    if (userBehavior.preferences.priceRanges) {
      const priceRange = Math.floor(car.price / 50000) * 50000;
      const priceRangeKey = `${priceRange}-${priceRange + 50000}`;
      
      if (userBehavior.preferences.priceRanges[priceRangeKey]) {
        const priceRangePreference = userBehavior.preferences.priceRanges[priceRangeKey];
        score += priceRangePreference > 0 ? 0.05 : -0.05;
      }
    }
  }
  
  // التأكد من أن النتيجة ضمن النطاق [0, 1]
  return Math.max(0, Math.min(1, score));
}

/**
 * حساب نتيجة القيمة مقابل السعر
 */
function calculateValueScore(car, allCars) {
  // حساب متوسط السعر
  const avgPrice = allCars.reduce((sum, c) => sum + c.price, 0) / allCars.length;
  
  // حساب قيمة السيارة (تقدير بسيط بناءً على السنة والمسافة والمميزات)
  let valueEstimate = 0;
  
  // السنة (موديلات أحدث = قيمة أعلى)
  const currentYear = new Date().getFullYear();
  const yearValue = (car.year - (currentYear - 10)) / 10; // نتيجة نسبية للسنوات العشر الماضية
  valueEstimate += yearValue * 0.4; // السنة تمثل 40% من التقييم
  
  // المسافة (مسافة أقل = قيمة أعلى)
  const mileageValue = 1 - (car.mileage / 200000); // افتراض أن 200,000 كم هي الحد الأقصى المعتاد
  valueEstimate += mileageValue * 0.3; // المسافة تمثل 30% من التقييم
  
  // المميزات (مميزات أكثر = قيمة أعلى)
  if (car.features) {
    const featuresValue = Math.min(1, car.features.length / 20); // افتراض أن 20 ميزة هي الحد الأقصى المتوقع
    valueEstimate += featuresValue * 0.2; // المميزات تمثل 20% من التقييم
  }
  
  // قوة المحرك (قوة أعلى = قيمة أعلى)
  if (car.horsepower) {
    const horsepowerValue = Math.min(1, car.horsepower / 400); // افتراض أن 400 حصان هو الحد الأقصى المتوقع
    valueEstimate += horsepowerValue * 0.1; // قوة المحرك تمثل 10% من التقييم
  }
  
  // ضبط قيمة السيارة لتكون بين 0.2 و 1
  valueEstimate = Math.max(0.2, Math.min(1, valueEstimate));
  
  // حساب نتيجة القيمة مقابل السعر (قيمة أعلى وسعر أقل = نتيجة أعلى)
  const priceRatio = avgPrice / car.price;
  const valueScore = (valueEstimate * priceRatio);
  
  // ضبط نتيجة القيمة مقابل السعر لتكون بين 0 و 1
  return Math.max(0, Math.min(1, valueScore));
}

/**
 * إنشاء جدول مقارنة تفصيلي
 */
function createComparisonTable(cars) {
  const comparisonTable = {};
  
  // المواصفات الأساسية للمقارنة
  const properties = [
    'price', 'year', 'mileage', 'transmission', 'fuelType', 
    'color', 'bodyType', 'engineSize', 'horsepower'
  ];
  
  // إضافة المواصفات الإضافية إذا كانت متوفرة
  if (cars.some(car => car.fuelConsumption)) {
    properties.push('fuelConsumption');
  }
  
  // إنشاء جدول المقارنة
  for (const property of properties) {
    // تخطي المواصفات غير المتوفرة
    if (!cars.some(car => car[property])) continue;
    
    comparisonTable[property] = {
      label: property,
      values: {},
      winner: null
    };
    
    // إضافة قيمة كل سيارة
    for (const car of cars) {
      comparisonTable[property].values[car.id] = car[property];
    }
    
    // تحديد الفائز في هذه الخاصية
    if (['price', 'mileage', 'fuelConsumption'].includes(property)) {
      // للخصائص التي تكون القيمة الأقل فيها أفضل
      let minValue = Infinity;
      let winnerId = null;
      
      for (const car of cars) {
        if (car[property] && car[property] < minValue) {
          minValue = car[property];
          winnerId = car.id;
        }
      }
      
      comparisonTable[property].winner = winnerId;
    } else if (['year', 'horsepower', 'engineSize'].includes(property)) {
      // للخصائص التي تكون القيمة الأعلى فيها أفضل
      let maxValue = -Infinity;
      let winnerId = null;
      
      for (const car of cars) {
        if (car[property] && car[property] > maxValue) {
          maxValue = car[property];
          winnerId = car.id;
        }
      }
      
      comparisonTable[property].winner = winnerId;
    } else {
      // الخصائص النصية لا يوجد بها فائز واضح
      comparisonTable[property].winner = null;
    }
  }
  
  return comparisonTable;
}

/**
 * توليد التوصية النهائية
 */
function generateRecommendation(items, userPreference, userBehavior) {
  // ترتيب السيارات حسب النتيجة
  const sortedItems = [...items].sort((a, b) => b.score - a.score);
  const topCar = sortedItems[0];
  const runnerUp = sortedItems[1];
  
  // التحقق من الفرق بين أفضل سيارتين
  const scoreDifference = topCar.score - runnerUp.score;
  const isClearWinner = scoreDifference > 0.15; // فرق واضح
  
  // ترتيب السيارات حسب القيمة مقابل السعر
  const sortedByValue = [...items].sort((a, b) => b.valueScore - a.valueScore);
  const bestValue = sortedByValue[0];
  
  // بناء نص التوصية
  let recommendation = '';
  
  if (isClearWinner) {
    // توصية واضحة بالسيارة الأفضل
    recommendation = `نوصي بشدة بسيارة ${topCar.car.make} ${topCar.car.model} ${topCar.car.year}`;
    
    if (userPreference) {
      switch (userPreference) {
        case 'price':
          recommendation += ' نظراً للسعر التنافسي مقارنة بالمواصفات المقدمة';
          break;
        case 'performance':
          recommendation += ' لأدائها المتميز وقوتها العالية';
          break;
        case 'fuel':
          recommendation += ' لكفاءتها العالية في استهلاك الوقود';
          break;
        case 'reliability':
          recommendation += ' لموثوقيتها العالية وسجل الاعتمادية';
          break;
        case 'luxury':
          recommendation += ' لمستوى الفخامة والمميزات المتقدمة';
          break;
        case 'family':
          recommendation += ' لملاءمتها الممتازة للعائلة من حيث المساحة والأمان';
          break;
        case 'value':
          recommendation += ' لأنها تقدم أفضل قيمة مقابل السعر';
          break;
        default:
          recommendation += ' لتوازنها الجيد بين الأداء والسعر والمواصفات';
      }
    } else {
      recommendation += ' لتفوقها في معظم معايير المقارنة';
    }
  } else {
    // توصية غير حاسمة
    recommendation = `تتقارب سيارة ${topCar.car.make} ${topCar.car.model} وسيارة ${runnerUp.car.make} ${runnerUp.car.model} في التقييم العام`;
    
    // توصية بناءً على القيمة مقابل السعر
    if (bestValue.car.id !== topCar.car.id) {
      recommendation += `، لكن إذا كنت تبحث عن أفضل قيمة مقابل السعر فإن ${bestValue.car.make} ${bestValue.car.model} هي الخيار الأفضل`;
    }
    
    // إضافة معلومات إضافية
    if (topCar.car.price < runnerUp.car.price) {
      recommendation += `. سيارة ${topCar.car.make} ${topCar.car.model} أوفر بحوالي ${
        new Intl.NumberFormat('ar-SA').format(runnerUp.car.price - topCar.car.price)
      } ريال`;
    } else if (topCar.car.year > runnerUp.car.year) {
      recommendation += `. سيارة ${topCar.car.make} ${topCar.car.model} أحدث بـ ${
        topCar.car.year - runnerUp.car.year
      } سنوات`;
    }
  }
  
  // إضافة ملاحظة ختامية
  recommendation += `. نوصي بمراجعة المزايا والعيوب لكل سيارة لاتخاذ القرار المناسب لاحتياجاتك.`;
  
  return recommendation;
}

export default router;