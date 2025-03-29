import React, { useState, useEffect } from 'react';
import { CarColorConfigurator, CarColor, InteriorColor } from '@/components/ui/car-color-configurator';
import { Card, CardTitle } from '@/components/ui/card';
import { t } from '@/i18n';
import { useToast } from '@/hooks/use-toast';

// بيانات توضيحية للألوان والصور
const demoExteriorColors: CarColor[] = [
  {
    id: 'white',
    name: 'أبيض كريستالي',
    colorCode: '#ffffff',
    price: 0,
    description: 'لون كلاسيكي أنيق يناسب جميع الأذواق',
    images: {
      exterior: Array(8).fill('/assets/cars/placeholder.svg'),
      interior: ['/assets/cars/placeholder.svg']
    },
    compatibleInteriors: ['beige', 'black', 'red'],
  },
  {
    id: 'black',
    name: 'أسود معدني',
    colorCode: '#1a1a1a',
    price: 1500,
    description: 'لون فاخر يوفر مظهراً جذاباً وأنيقاً',
    images: {
      exterior: Array(8).fill('/assets/cars/placeholder.svg'),
      interior: ['/assets/cars/placeholder.svg']
    },
    compatibleInteriors: ['beige', 'black', 'red'],
  },
  {
    id: 'red',
    name: 'أحمر ياقوتي',
    colorCode: '#8e1914',
    price: 2500,
    description: 'لون جريء يعكس الشخصية الديناميكية',
    images: {
      exterior: Array(8).fill('/assets/cars/placeholder.svg'),
      interior: ['/assets/cars/placeholder.svg']
    },
    compatibleInteriors: ['black', 'beige'],
  },
  {
    id: 'blue',
    name: 'أزرق محيطي',
    colorCode: '#1f3a5e',
    price: 2000,
    description: 'لون عميق وهادئ يعكس الثقة والرصانة',
    images: {
      exterior: Array(8).fill('/assets/cars/placeholder.svg'),
      interior: ['/assets/cars/placeholder.svg']
    },
    compatibleInteriors: ['black', 'beige'],
  },
  {
    id: 'silver',
    name: 'فضي لامع',
    colorCode: '#c0c0c0',
    price: 1000,
    description: 'لون عصري يمتاز بأناقته وسهولة صيانته',
    images: {
      exterior: Array(8).fill('/assets/cars/placeholder.svg'),
      interior: ['/assets/cars/placeholder.svg']
    },
    compatibleInteriors: ['beige', 'black', 'red'],
  },
];

const demoInteriorColors: InteriorColor[] = [
  {
    id: 'black',
    name: 'أسود',
    colorCode: '#1a1a1a',
    price: 0,
    description: 'داخلية أنيقة وعملية',
    image: '/assets/cars/placeholder.svg',
  },
  {
    id: 'beige',
    name: 'بيج',
    colorCode: '#e8dcc5',
    price: 1000,
    description: 'داخلية فاتحة توفر شعوراً بالرحابة',
    image: '/assets/cars/placeholder.svg',
  },
  {
    id: 'red',
    name: 'أحمر رياضي',
    colorCode: '#8e1914',
    price: 2500,
    description: 'داخلية رياضية تعكس الروح الشبابية',
    image: '/assets/cars/placeholder.svg',
  },
];

export default function CarColorLab() {
  const [selectedExteriorColor, setSelectedExteriorColor] = useState<CarColor>(demoExteriorColors[0]);
  const [selectedInteriorColor, setSelectedInteriorColor] = useState<InteriorColor>(demoInteriorColors[0]);
  const [totalPrice, setTotalPrice] = useState(150000); // سعر افتراضي للسيارة
  const { toast } = useToast();

  useEffect(() => {
    // محاكاة تحميل الصور
    toast({
      title: 'جاري تحميل النماذج ثلاثية الأبعاد',
      description: 'يرجى الانتظار قليلاً...',
      type: 'info',
      duration: 2000,
    });
    
    // بعد الانتهاء من تحميل النماذج
    const timeout = setTimeout(() => {
      toast({
        title: 'تم تحميل النماذج بنجاح',
        description: 'يمكنك الآن استخدام المختبر بكامل مزاياه',
        type: 'success',
      });
    }, 2000);
    
    return () => clearTimeout(timeout);
  }, []);

  const handleExteriorColorChange = (color: CarColor) => {
    setSelectedExteriorColor(color);
    
    toast({
      title: `تم اختيار لون ${color.name}`,
      description: color.description,
      type: 'info',
    });
  };

  const handleInteriorColorChange = (color: InteriorColor) => {
    setSelectedInteriorColor(color);
    
    toast({
      title: `تم اختيار داخلية ${color.name}`,
      description: color.description,
      type: 'info',
    });
  };

  const handlePriceChange = (price: number) => {
    setTotalPrice(price);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">مختبر ألوان كارإكسبرت</h1>
          <p className="text-gray-600">
            قم بتخصيص سيارتك باختيار الألوان المثالية لتناسب ذوقك وشخصيتك
          </p>
        </div>
        
        <Card className="mb-8">
          <CarColorConfigurator
            carName="كارإكسبرت"
            carModel="سيدان 2023"
            exteriorColors={demoExteriorColors}
            interiorColors={demoInteriorColors}
            exteriorAngles={8}
            initialColor="white"
            initialInteriorColor="black"
            onColorChange={handleExteriorColorChange}
            onInteriorColorChange={handleInteriorColorChange}
            currency="ريال"
            basePrice={150000}
            onPriceChange={handlePriceChange}
            allow360View={true}
            allowZoom={true}
            allowFullscreen={true}
          />
        </Card>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="p-6">
            <CardTitle className="mb-4">المواصفات الفنية</CardTitle>
            <ul className="space-y-2 text-gray-700">
              <li className="flex justify-between">
                <span className="font-medium">المحرك:</span>
                <span>2.0 لتر توربو</span>
              </li>
              <li className="flex justify-between">
                <span className="font-medium">القوة:</span>
                <span>240 حصان</span>
              </li>
              <li className="flex justify-between">
                <span className="font-medium">عزم الدوران:</span>
                <span>350 نيوتن متر</span>
              </li>
              <li className="flex justify-between">
                <span className="font-medium">ناقل الحركة:</span>
                <span>أوتوماتيك 8 سرعات</span>
              </li>
              <li className="flex justify-between">
                <span className="font-medium">الدفع:</span>
                <span>دفع أمامي</span>
              </li>
              <li className="flex justify-between">
                <span className="font-medium">استهلاك الوقود:</span>
                <span>6.5 لتر/100 كم</span>
              </li>
            </ul>
          </Card>
          
          <Card className="p-6">
            <CardTitle className="mb-4">ملخص التخصيص</CardTitle>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">الطراز</h3>
                <p className="text-lg font-semibold">كارإكسبرت سيدان 2023</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">اللون الخارجي</h3>
                <div className="flex items-center mt-1">
                  <div 
                    className="w-6 h-6 rounded-full border border-gray-300 mr-2" 
                    style={{ backgroundColor: selectedExteriorColor.colorCode }}
                  />
                  <p>{selectedExteriorColor.name}</p>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">اللون الداخلي</h3>
                <div className="flex items-center mt-1">
                  <div 
                    className="w-6 h-6 rounded-full border border-gray-300 mr-2" 
                    style={{ backgroundColor: selectedInteriorColor.colorCode }}
                  />
                  <p>{selectedInteriorColor.name}</p>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">السعر الإجمالي</h3>
                <p className="text-2xl font-bold text-[var(--primary)]">
                  {totalPrice.toLocaleString('ar-SA')} ريال
                </p>
              </div>
              
              <button 
                className="w-full bg-[var(--primary)] text-white py-3 rounded-lg font-medium hover:bg-opacity-90 transition-colors"
                onClick={() => {
                  toast({
                    title: 'تم حفظ التخصيص',
                    description: 'سيتم التواصل معك لاستكمال عملية الحجز',
                    type: 'success',
                  });
                }}
              >
                حجز السيارة بهذه المواصفات
              </button>
            </div>
          </Card>
        </div>
        
        <div className="bg-blue-50 rounded-lg p-6 text-center">
          <h2 className="text-xl font-bold text-blue-900 mb-2">تجربة أكثر واقعية؟</h2>
          <p className="text-blue-700 mb-4">
            قم بزيارة أقرب معرض لتجربة تقنية الواقع الافتراضي لمشاهدة السيارة بالألوان التي اخترتها بتجربة ثلاثية الأبعاد كاملة
          </p>
          <button 
            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            onClick={() => {
              toast({
                title: 'تم تحديد موعد',
                description: 'سيتم التواصل معك لتأكيد الموعد',
                type: 'success',
              });
            }}
          >
            حجز موعد للتجربة
          </button>
        </div>
      </div>
    </div>
  );
}