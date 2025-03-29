import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Camera, X, Info, Image as ImageIcon, Loader2, ZoomIn, ZoomOut, RotateCw, Maximize, ChevronDown, ChevronUp } from 'lucide-react';
import { t } from '@/i18n';
import { useAuth } from '@/hooks/use-auth';
import { LoadingScreen } from '@/components/ui/loading-screen';
import { useLoading } from '@/context/loading-context';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface AnalysisResult {
  car: {
    make?: string;
    model?: string;
    year?: string;
    color?: string;
    bodyType?: string;
    condition?: string;
  };
  detectedParts?: Array<{
    name: string;
    condition: string;
    confidence: number;
    boundingBox?: {
      x: number;
      y: number;
      width: number;
      height: number;
    };
  }>;
  damageAssessment?: {
    hasDamage: boolean;
    damageLocations: string[];
    severityScore: number;
    estimatedRepairCost?: number;
  };
  confidence: number;
  metadata?: any;
  fullText: string;
}

export default function CarAnalyzerPage() {
  const { user } = useAuth();
  const { isLoading } = useLoading();
  const { toast } = useToast();
  const [image, setImage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('upload');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [showAdvancedDetails, setShowAdvancedDetails] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const imageContainerRef = useRef<HTMLDivElement>(null);
  
  const resetState = () => {
    setImage(null);
    setAnalysisResult(null);
    setZoom(1);
    setRotation(0);
    setShowAdvancedDetails(false);
  };
  
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    
    if (file) {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setImage(reader.result as string);
          setAnalysisResult(null);
        };
        reader.readAsDataURL(file);
      } else {
        toast({
          title: t('common.error'),
          description: t('common.uploadError'),
          variant: 'destructive',
        });
      }
    }
  };
  
  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    
    const file = event.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setAnalysisResult(null);
      };
      reader.readAsDataURL(file);
    } else {
      toast({
        title: t('common.error'),
        description: t('common.uploadError'),
        variant: 'destructive',
      });
    }
  };
  
  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };
  
  const startCamera = async () => {
    try {
      const videoStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = videoStream;
      }
      
      setStream(videoStream);
      setActiveTab('camera');
    } catch (error) {
      console.error('Error accessing camera:', error);
      toast({
        title: t('common.error'),
        description: t('ai.cameraAccessError'),
        variant: 'destructive',
      });
    }
  };
  
  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current && stream) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        const imageDataUrl = canvas.toDataURL('image/jpeg');
        setImage(imageDataUrl);
        
        // Stop the camera stream
        stream.getTracks().forEach(track => track.stop());
        setStream(null);
        setActiveTab('upload');
      }
    }
  };
  
  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setActiveTab('upload');
  };
  
  const analyzeImage = async () => {
    if (!image) return;
    
    setIsAnalyzing(true);
    setAnalysisResult(null);
    
    try {
      // Extract base64 data from the data URL
      const base64Data = image.split(',')[1];
      
      const response = await apiRequest('POST', '/api/ai/analyze-image', {
        imageBase64: base64Data,
        userId: user?.id,
      });
      
      if (!response.ok) {
        throw new Error('Failed to analyze image');
      }
      
      const result = await response.json();
      setAnalysisResult(result);
    } catch (error) {
      console.error('Error analyzing image:', error);
      toast({
        title: t('common.error'),
        description: t('ai.analysisError'),
        variant: 'destructive',
      });
    } finally {
      setIsAnalyzing(false);
    }
  };
  
  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.25, 3));
  };
  
  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.25, 0.5));
  };
  
  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360);
  };
  
  const toggleFullScreen = () => {
    if (!imageContainerRef.current) return;
    
    if (!document.fullscreenElement) {
      imageContainerRef.current.requestFullscreen().catch(err => {
        toast({
          title: t('common.error'),
          description: t('common.fullscreenError'),
          variant: 'destructive',
        });
      });
      setIsFullScreen(true);
    } else {
      document.exitFullscreen();
      setIsFullScreen(false);
    }
  };
  
  const renderImageDisplay = () => {
    return (
      <div 
        ref={imageContainerRef}
        className="relative mb-6 bg-gray-900 rounded-lg overflow-hidden"
        style={{ height: '60vh', maxHeight: '600px' }}
      >
        {image && (
          <div className="absolute top-2 right-2 z-10 bg-gray-800 bg-opacity-70 rounded-lg p-1.5 flex space-x-2 space-x-reverse">
            <button
              onClick={handleZoomIn}
              className="text-gray-200 hover:text-white p-1.5 rounded hover:bg-gray-700"
              title={t('common.zoomIn')}
            >
              <ZoomIn className="w-5 h-5" />
            </button>
            <button
              onClick={handleZoomOut}
              className="text-gray-200 hover:text-white p-1.5 rounded hover:bg-gray-700"
              title={t('common.zoomOut')}
            >
              <ZoomOut className="w-5 h-5" />
            </button>
            <button
              onClick={handleRotate}
              className="text-gray-200 hover:text-white p-1.5 rounded hover:bg-gray-700"
              title={t('common.rotate')}
            >
              <RotateCw className="w-5 h-5" />
            </button>
            <button
              onClick={toggleFullScreen}
              className="text-gray-200 hover:text-white p-1.5 rounded hover:bg-gray-700"
              title={t('common.fullscreen')}
            >
              <Maximize className="w-5 h-5" />
            </button>
          </div>
        )}
        
        <div 
          className="relative w-full h-full flex items-center justify-center bg-gray-800"
        >
          {image ? (
            <img
              src={image}
              alt="Uploaded car"
              className="object-contain max-w-full max-h-full transition-transform"
              style={{ 
                transform: `scale(${zoom}) rotate(${rotation}deg)`,
                maxWidth: '100%',
                maxHeight: '100%',
              }}
            />
          ) : (
            <div className="text-center text-gray-300">
              <ImageIcon className="w-16 h-16 mx-auto mb-4 text-gray-500" />
              <p>{t('ai.noImageUploaded')}</p>
            </div>
          )}
          
          {/* Detected car parts overlay */}
          {image && analysisResult?.detectedParts && (
            <div className="absolute inset-0 pointer-events-none">
              {analysisResult.detectedParts.map((part, index) => {
                if (!part.boundingBox) return null;
                
                const { x, y, width, height } = part.boundingBox;
                const isGoodCondition = part.condition.toLowerCase().includes('good');
                const color = isGoodCondition ? 'rgba(34, 197, 94, 0.5)' : 'rgba(239, 68, 68, 0.5)';
                const borderColor = isGoodCondition ? 'rgb(34, 197, 94)' : 'rgb(239, 68, 68)';
                
                return (
                  <div
                    key={`${part.name}-${index}`}
                    className="absolute border-2 flex items-end"
                    style={{
                      left: `${x * 100}%`,
                      top: `${y * 100}%`,
                      width: `${width * 100}%`,
                      height: `${height * 100}%`,
                      backgroundColor: color,
                      borderColor: borderColor,
                      transform: `rotate(${rotation}deg) scale(${zoom})`,
                      transformOrigin: 'center',
                    }}
                  >
                    <div className="bg-black bg-opacity-70 text-white text-xs p-1 m-1 rounded">
                      {part.name} ({part.condition})
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderUploadTab = () => {
    return (
      <div className="p-6 bg-white rounded-lg shadow-sm">
        <div
          className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center mb-6"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          <Upload className="mx-auto h-12 w-12 text-gray-400 mb-3" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">{t('common.uploadImage')}</h3>
          <p className="text-sm text-gray-500 mb-4">{t('common.dragAndDrop')}</p>
          
          <div className="flex justify-center">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="bg-[var(--primary)] text-white px-4 py-2 rounded-md hover:bg-opacity-90 transition-colors"
            >
              {t('common.browse')}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>
        </div>

        {renderImageDisplay()}

        {image && !analysisResult && !isAnalyzing && (
          <div className="flex justify-center">
            <button
              onClick={analyzeImage}
              className="bg-[var(--primary)] text-white px-6 py-3 rounded-md hover:bg-opacity-90 transition-colors flex items-center"
            >
              <ImageIcon className="w-5 h-5 mr-2" />
              {t('ai.analyzeThis')}
            </button>
          </div>
        )}

        {isAnalyzing && (
          <div className="bg-indigo-50 p-4 rounded-lg flex items-center justify-center">
            <Loader2 className="animate-spin text-indigo-600 mr-2" />
            <span className="text-indigo-800 font-medium">{t('ai.analyzing')}</span>
          </div>
        )}
      </div>
    );
  };

  const renderCameraTab = () => {
    return (
      <div className="p-6 bg-white rounded-lg shadow-sm">
        <div className="bg-black rounded-lg overflow-hidden mb-6 relative">
          <video 
            ref={videoRef}
            autoPlay 
            playsInline 
            className="w-full h-[60vh] max-h-[600px] object-cover"
          ></video>
          
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
            <button
              onClick={capturePhoto}
              className="bg-white w-16 h-16 rounded-full flex items-center justify-center shadow-lg"
            >
              <div className="w-12 h-12 rounded-full border-4 border-[var(--primary)]"></div>
            </button>
          </div>
          
          <button
            onClick={stopCamera}
            className="absolute top-4 right-4 bg-red-500 text-white p-2 rounded-full"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <canvas ref={canvasRef} className="hidden"></canvas>
      </div>
    );
  };

  const renderAnalysisResults = () => {
    if (!analysisResult) return null;

    return (
      <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-bold mb-4">{t('ai.analysisResults')}</h2>
        
        {/* Car identification */}
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-3">{t('ai.carIdentification')}</h3>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {analysisResult.car.make && (
                <div>
                  <span className="text-gray-600 block">{t('car.make')}:</span>
                  <span className="font-medium text-lg">{analysisResult.car.make}</span>
                </div>
              )}
              {analysisResult.car.model && (
                <div>
                  <span className="text-gray-600 block">{t('car.model')}:</span>
                  <span className="font-medium text-lg">{analysisResult.car.model}</span>
                </div>
              )}
              {analysisResult.car.year && (
                <div>
                  <span className="text-gray-600 block">{t('car.year')}:</span>
                  <span className="font-medium">{analysisResult.car.year}</span>
                </div>
              )}
              {analysisResult.car.color && (
                <div>
                  <span className="text-gray-600 block">{t('car.color')}:</span>
                  <span className="font-medium">{analysisResult.car.color}</span>
                </div>
              )}
              {analysisResult.car.bodyType && (
                <div>
                  <span className="text-gray-600 block">{t('car.bodyType')}:</span>
                  <span className="font-medium">{analysisResult.car.bodyType}</span>
                </div>
              )}
              {analysisResult.car.condition && (
                <div>
                  <span className="text-gray-600 block">{t('car.condition')}:</span>
                  <span className="font-medium">{analysisResult.car.condition}</span>
                </div>
              )}
            </div>
            <div className="mt-4">
              <div 
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${
                  analysisResult.confidence > 0.8 
                    ? 'bg-green-100 text-green-800' 
                    : analysisResult.confidence > 0.5 
                    ? 'bg-yellow-100 text-yellow-800' 
                    : 'bg-red-100 text-red-800'
                }`}
              >
                <Info className="w-4 h-4 mr-1" />
                {t('ai.confidenceLevel')}: {Math.round(analysisResult.confidence * 100)}%
              </div>
            </div>
          </div>
        </div>
        
        {/* Damage Assessment */}
        {analysisResult.damageAssessment && (
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-3">{t('ai.damageAssessment')}</h3>
            <div className={`bg-gray-50 p-4 rounded-lg border-r-4 ${
              analysisResult.damageAssessment.hasDamage ? 'border-orange-500' : 'border-green-500'
            }`}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="text-gray-600 block">{t('ai.damageDetected')}:</span>
                  <span className={`font-medium ${
                    analysisResult.damageAssessment.hasDamage ? 'text-orange-600' : 'text-green-600'
                  }`}>
                    {analysisResult.damageAssessment.hasDamage ? t('common.yes') : t('common.no')}
                  </span>
                </div>
                
                {analysisResult.damageAssessment.hasDamage && (
                  <>
                    <div>
                      <span className="text-gray-600 block">{t('ai.severityScore')}:</span>
                      <span className="font-medium">
                        {analysisResult.damageAssessment.severityScore}/10
                      </span>
                    </div>
                    
                    {analysisResult.damageAssessment.damageLocations.length > 0 && (
                      <div className="md:col-span-2">
                        <span className="text-gray-600 block">{t('ai.damageLocations')}:</span>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {analysisResult.damageAssessment.damageLocations.map((location, index) => (
                            <span key={index} className="bg-orange-100 text-orange-800 px-2 py-1 rounded-md text-sm">
                              {location}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {analysisResult.damageAssessment.estimatedRepairCost && (
                      <div>
                        <span className="text-gray-600 block">{t('ai.estimatedRepairCost')}:</span>
                        <span className="font-medium text-lg">
                          {analysisResult.damageAssessment.estimatedRepairCost} SAR
                        </span>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        )}
        
        {/* Detected Parts */}
        {analysisResult.detectedParts && analysisResult.detectedParts.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-3">{t('ai.partIdentification')}</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t('ai.partName')}
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t('ai.condition')}
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t('ai.confidence')}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {analysisResult.detectedParts.map((part, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {part.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            part.condition.toLowerCase().includes('good')
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {part.condition}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {Math.round(part.confidence * 100)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
        
        {/* Advanced Details Toggle */}
        <button
          onClick={() => setShowAdvancedDetails(!showAdvancedDetails)}
          className="flex items-center text-indigo-600 hover:text-indigo-800 transition-colors mb-2"
        >
          {showAdvancedDetails ? <ChevronUp className="w-4 h-4 mr-1" /> : <ChevronDown className="w-4 h-4 mr-1" />}
          {showAdvancedDetails ? t('ai.hideAdvancedDetails') : t('ai.showAdvancedDetails')}
        </button>
        
        {/* Full Analysis Text */}
        <AnimatePresence>
          {showAdvancedDetails && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="bg-gray-800 text-gray-100 p-4 rounded-lg overflow-x-auto">
                <pre className="text-sm whitespace-pre-wrap">
                  {analysisResult.fullText}
                </pre>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Action Buttons */}
        <div className="mt-6 flex gap-3 flex-wrap">
          <button
            onClick={resetState}
            className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors"
          >
            {t('ai.analyzeDifferentImage')}
          </button>
          
          {/* Add any other action buttons here */}
        </div>
      </div>
    );
  };
  
  if (isLoading) {
    return <LoadingScreen variant="ai" />;
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center mb-6">
        <div className="p-3 bg-purple-100 rounded-full mr-4">
          <ImageIcon className="w-6 h-6 text-purple-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">{t('ai.carAnalyzer')}</h1>
          <p className="text-gray-600">{t('ai.carAnalyzerDescription')}</p>
        </div>
      </div>
      
      {/* Tab buttons */}
      {!analysisResult && (
        <div className="flex bg-gray-100 p-1 rounded-lg mb-6 w-fit">
          <button
            onClick={() => {
              setActiveTab('upload');
              stopCamera();
            }}
            className={`px-4 py-2 rounded-md ${
              activeTab === 'upload'
                ? 'bg-white shadow-sm text-[var(--primary)]'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Upload className="w-5 h-5 inline-block mr-2" />
            {t('ai.uploadImage')}
          </button>
          <button
            onClick={startCamera}
            className={`px-4 py-2 rounded-md ${
              activeTab === 'camera'
                ? 'bg-white shadow-sm text-[var(--primary)]'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Camera className="w-5 h-5 inline-block mr-2" />
            {t('ai.takePhoto')}
          </button>
        </div>
      )}
      
      {/* Active tab content */}
      {activeTab === 'upload' && renderUploadTab()}
      {activeTab === 'camera' && renderCameraTab()}
      
      {/* Analysis Results */}
      {renderAnalysisResults()}
    </div>
  );
}