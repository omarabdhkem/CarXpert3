import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { t } from '@/i18n';
import { Camera, Upload, AlertCircle, CheckCircle } from 'lucide-react';

interface CarAnalysisResult {
  make: string;
  model: string;
  year: number;
  condition: string;
  color: string;
  bodyType: string;
  features: string[];
  confidence: number;
  estimatedValue?: number;
}

export function CarAnalyzer() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<CarAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // تحقق من نوع الملف (يجب أن يكون صورة)
      if (!file.type.match('image.*')) {
        toast({
          title: t('ai.invalid_file_type'),
          description: t('ai.select_image_file'),
          variant: "destructive",
        });
        return;
      }

      setSelectedFile(file);
      setError(null);
      setAnalysisResult(null);

      // إنشاء معاينة للصورة
      const reader = new FileReader();
      reader.onload = (event) => {
        setImagePreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzeImage = async () => {
    if (!selectedFile) return;

    setIsAnalyzing(true);
    setError(null);

    try {
      // إنشاء FormData لإرسال الملف
      const formData = new FormData();
      formData.append('image', selectedFile);

      // إرسال الطلب إلى الخادم
      const response = await fetch('/api/ai/analyze-car-image', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(t('ai.error_processing'));
      }

      const result = await response.json();
      setAnalysisResult(result);

      // إظهار رسالة نجاح
      toast({
        title: t('ai.analysis_complete'),
        description: t('ai.analysis_success'),
      });
    } catch (err) {
      console.error('Error analyzing image:', err);
      setError(t('ai.analysis_error'));
      toast({
        title: t('ai.error_title'),
        description: t('ai.try_again_later'),
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const resetAnalysis = () => {
    setSelectedFile(null);
    setImagePreview(null);
    setAnalysisResult(null);
    setError(null);
  };

  return (
    <div className="space-y-4">
      {!analysisResult && (
        <>
          <p className="text-muted-foreground mb-4">
            {t('ai.upload_car_image')}
          </p>

          <div className="grid grid-cols-1 gap-4">
            {imagePreview ? (
              <div className="relative">
                <img
                  src={imagePreview}
                  alt="Car preview"
                  className="w-full h-auto max-h-[300px] object-contain rounded-md border"
                />
                <Button
                  variant="outline"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={resetAnalysis}
                >
                  {t('common.cancel')}
                </Button>
              </div>
            ) : (
              <div className="border-2 border-dashed border-border rounded-md p-8 text-center">
                <div className="mx-auto flex flex-col items-center gap-2">
                  <Upload className="h-10 w-10 text-muted-foreground mb-2" />
                  <p className="text-sm font-medium">
                    {t('ai.select_image')}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    PNG, JPG, WEBP (مام 10MB)
                  </p>
                </div>
              </div>
            )}

            {!imagePreview && (
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <label
                    htmlFor="car-image-upload"
                    className="block w-full cursor-pointer"
                  >
                    <Button variant="outline" className="w-full">
                      <Upload className="h-4 w-4 mr-2" />
                      {t('ai.select_image')}
                    </Button>
                  </label>
                  <input
                    id="car-image-upload"
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                </div>

                <div className="flex-1">
                  <Button variant="outline" className="w-full" disabled>
                    <Camera className="h-4 w-4 mr-2" />
                    {t('ai.take_photo')}
                  </Button>
                </div>
              </div>
            )}

            {imagePreview && (
              <Button
                onClick={analyzeImage}
                disabled={isAnalyzing}
                className="w-full"
              >
                {isAnalyzing ? t('ai.analyzing_image') : t('ai.analyze_car')}
              </Button>
            )}
          </div>
        </>
      )}

      {isAnalyzing && (
        <div className="p-4 text-center">
          <div className="spinner-border animate-spin inline-block w-8 h-8 border-4 rounded-full text-primary" role="status">
            <span className="visually-hidden">{t('ai.analyzing_image')}</span>
          </div>
          <p className="mt-2">{t('ai.analyzing_image')}</p>
        </div>
      )}

      {error && (
        <Card className="p-4 bg-destructive/10 text-destructive border-destructive">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            <p className="font-medium">{error}</p>
          </div>
          <p className="mt-2 text-sm">{t('ai.try_again_later')}</p>
          <Button
            variant="outline"
            className="mt-4 w-full"
            onClick={resetAnalysis}
          >
            {t('ai.try_again')}
          </Button>
        </Card>
      )}

      {analysisResult && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-primary">
            <CheckCircle className="h-5 w-5" />
            <h3 className="font-medium">{t('ai.analysis_results')}</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              {imagePreview && (
                <img
                  src={imagePreview}
                  alt="Analyzed car"
                  className="w-full h-auto max-h-[200px] object-contain rounded-md border mb-4"
                />
              )}
            </div>

            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('car.condition')}:</span>
                <span className="font-medium">{analysisResult.condition}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('car.year')}:</span>
                <span className="font-medium">{analysisResult.year}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('car.color')}:</span>
                <span className="font-medium">{analysisResult.color}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('car.bodyType')}:</span>
                <span className="font-medium">{analysisResult.bodyType}</span>
              </div>
              {analysisResult.estimatedValue && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t('car.price')}:</span>
                  <span className="font-medium">${analysisResult.estimatedValue.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('ai.confidence')}:</span>
                <span className="font-medium">{Math.round(analysisResult.confidence * 100)}%</span>
              </div>
            </div>
          </div>

          <div className="pt-4">
            <h4 className="font-medium mb-2">{t('car.features')}:</h4>
            <ul className="grid grid-cols-2 gap-2">
              {analysisResult.features.map((feature, index) => (
                <li key={index} className="flex items-center gap-2">
                  <span className="text-primary">•</span>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          <p className="text-xs text-muted-foreground pt-2">
            {t('ai.analysis_disclaimer')}
          </p>

          <Button
            variant="outline"
            className="w-full"
            onClick={resetAnalysis}
          >
            {t('common.refresh')}
          </Button>
        </div>
      )}
    </div>
  );
}