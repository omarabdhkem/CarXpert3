import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { t } from '@/i18n';
import { Loader2, Upload, Image as ImageIcon, Check, X } from 'lucide-react';

interface ImageAnalyzerProps {
  onAnalysisComplete?: (result: any) => void;
}

export function ImageAnalyzer({ onAnalysisComplete }: ImageAnalyzerProps) {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleImageSelection = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // التحقق من نوع الملف
      if (!file.type.startsWith('image/')) {
        toast({
          title: t('imageAnalyzer.invalidFileType'),
          description: t('imageAnalyzer.pleaseSelectImage'),
          variant: 'destructive',
        });
        return;
      }

      // التحقق من حجم الملف (أقل من 5 ميجابايت)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: t('imageAnalyzer.fileTooLarge'),
          description: t('imageAnalyzer.fileSizeLimit'),
          variant: 'destructive',
        });
        return;
      }

      // عرض معاينة الصورة
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      setSelectedImage(file);
      setAnalysisResult(null);
      setError(null);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.currentTarget.classList.add('border-primary');
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.currentTarget.classList.remove('border-primary');
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.currentTarget.classList.remove('border-primary');
    
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      setSelectedImage(file);
      setAnalysisResult(null);
      setError(null);
    } else {
      toast({
        title: t('imageAnalyzer.invalidFileType'),
        description: t('imageAnalyzer.pleaseSelectImage'),
        variant: 'destructive',
      });
    }
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  const handleAnalyze = async () => {
    if (!selectedImage) return;

    setIsAnalyzing(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('image', selectedImage);

      const response = await fetch('/api/ai/analyze-image', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(t('imageAnalyzer.analysisFailed'));
      }

      const result = await response.json();
      setAnalysisResult(result);
      
      if (onAnalysisComplete) {
        onAnalysisComplete(result);
      }
    } catch (err) {
      console.error('Error analyzing image:', err);
      setError(t('imageAnalyzer.analysisFailed'));
      toast({
        title: t('imageAnalyzer.error'),
        description: err instanceof Error ? err.message : t('imageAnalyzer.unknownError'),
        variant: 'destructive',
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setAnalysisResult(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const renderAnalysisResult = () => {
    if (!analysisResult) return null;

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">
            {analysisResult.make} {analysisResult.model}
          </h3>
          <span className="bg-primary/10 text-primary px-2 py-1 rounded-full text-xs font-medium">
            {Math.round(analysisResult.confidence * 100)}% {t('imageAnalyzer.confidence')}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-xs text-gray-500">{t('imageAnalyzer.year')}</p>
            <p className="font-medium">{analysisResult.year}</p>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-xs text-gray-500">{t('imageAnalyzer.condition')}</p>
            <p className="font-medium">{analysisResult.condition}</p>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-xs text-gray-500">{t('imageAnalyzer.color')}</p>
            <p className="font-medium">{analysisResult.color}</p>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-xs text-gray-500">{t('imageAnalyzer.bodyType')}</p>
            <p className="font-medium">{analysisResult.bodyType}</p>
          </div>
        </div>

        {analysisResult.features && analysisResult.features.length > 0 && (
          <div className="mt-3">
            <p className="text-sm font-medium mb-2">{t('imageAnalyzer.features')}</p>
            <div className="flex flex-wrap gap-2">
              {analysisResult.features.map((feature: string, index: number) => (
                <div key={index} className="bg-primary/5 px-2 py-1 rounded-full text-xs">
                  <div className="flex items-center gap-1">
                    <Check className="h-3 w-3 text-primary" />
                    <span>{feature}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {analysisResult.estimatedValue && (
          <div className="mt-4 p-4 bg-primary/10 rounded-lg">
            <p className="text-sm font-medium mb-1">{t('imageAnalyzer.estimatedValue')}</p>
            <p className="text-xl font-bold text-primary">
              {analysisResult.estimatedValue.toLocaleString()} ريال
            </p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div 
        className={`border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center min-h-[280px] transition-colors ${
          imagePreview ? 'border-primary/20' : 'border-gray-300 hover:border-primary/50'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          type="file"
          accept="image/*"
          className="hidden"
          ref={fileInputRef}
          onChange={handleImageSelection}
        />

        {imagePreview ? (
          <div className="w-full flex flex-col items-center">
            <div className="relative w-full max-w-md mb-4">
              <img
                src={imagePreview}
                alt={t('imageAnalyzer.selectedImage')}
                className="w-full h-auto rounded-lg object-contain max-h-40"
              />
              <button
                onClick={handleReset}
                className="absolute -top-2 -right-2 bg-gray-100 rounded-full p-1 shadow-md hover:bg-gray-200 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <Button
              onClick={handleAnalyze}
              disabled={isAnalyzing}
              className="w-full max-w-xs"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {t('imageAnalyzer.analyzing')}
                </>
              ) : (
                <>
                  <ImageIcon className="h-4 w-4 mr-2" />
                  {analysisResult ? t('imageAnalyzer.analyzeAgain') : t('imageAnalyzer.analyze')}
                </>
              )}
            </Button>
          </div>
        ) : (
          <>
            <Upload className="w-12 h-12 text-gray-400 mb-4" />
            <p className="text-lg font-medium text-gray-900 mb-1">{t('imageAnalyzer.dropImageHere')}</p>
            <p className="text-sm text-gray-500 mb-4 text-center">{t('imageAnalyzer.dragAndDropInfo')}</p>
            <Button onClick={handleBrowseClick} variant="outline">
              {t('imageAnalyzer.browseFiles')}
            </Button>
          </>
        )}
      </div>

      <div className="bg-gray-50 rounded-lg p-6 min-h-[280px]">
        <h3 className="text-lg font-medium text-gray-900 mb-4">{t('imageAnalyzer.results')}</h3>
        
        {isAnalyzing ? (
          <div className="flex flex-col items-center justify-center h-full py-10">
            <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
            <p className="text-gray-500 text-center">
              {t('imageAnalyzer.analyzingImage')}
              <br />
              <span className="text-sm">{t('imageAnalyzer.waitMoment')}</span>
            </p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-10">
            <div className="bg-red-50 p-4 rounded-full mb-4">
              <X className="h-8 w-8 text-red-500" />
            </div>
            <p className="text-red-500 font-medium">{error}</p>
            <p className="text-gray-500 text-sm mt-2">{t('imageAnalyzer.tryAgain')}</p>
          </div>
        ) : analysisResult ? (
          renderAnalysisResult()
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 py-10">
            <ImageIcon className="h-10 w-10 mb-2 opacity-50" />
            <p className="text-center">{t('imageAnalyzer.uploadImageToSeeResults')}</p>
          </div>
        )}
      </div>
    </div>
  );
}