import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { t } from '@/i18n';
import { useAuth } from '@/hooks/use-auth';
import { Loader2, RefreshCw, AlertCircle } from 'lucide-react';
import { Link } from 'wouter';

interface CarRecommendation {
  id: number;
  title: string;
  price: number;
  imageUrl: string;
  year: number;
  make: string;
  model: string;
  matchScore: number;
  matchReason: string;
}

export function CarRecommendations() {
  const [recommendations, setRecommendations] = useState<CarRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchRecommendations = async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/ai/recommendations?userId=${user.id}`);
      
      if (!response.ok) {
        throw new Error(t('ai.error_recommendations_description'));
      }
      
      const data = await response.json();
      setRecommendations(data);
    } catch (err) {
      console.error('Error fetching recommendations:', err);
      setError(t('ai.error_recommendations_title'));
      toast({
        title: t('ai.error_recommendations_title'),
        description: t('ai.error_recommendations_description'),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, [user]);

  if (loading) {
    return (
      <div className="py-8 text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary mb-4" />
        <p>{t('ai.loading_recommendations')}</p>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-6 bg-destructive/10 text-destructive border-destructive">
        <div className="flex flex-col items-center text-center gap-4">
          <AlertCircle className="h-10 w-10" />
          <div>
            <h3 className="font-medium text-lg">{error}</h3>
            <p className="text-sm">{t('ai.recommendations_error')}</p>
          </div>
          <Button
            variant="outline"
            onClick={fetchRecommendations}
            className="mt-2"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            {t('ai.try_again')}
          </Button>
        </div>
      </Card>
    );
  }

  if (recommendations.length === 0) {
    return (
      <Card className="p-6 text-center">
        <p className="text-muted-foreground">لم نتمكن من العثور على توصيات لك في الوقت الحالي. حاول لاحقاً بعد تصفح المزيد من السيارات.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-lg">{t('ai.personalized_recommendations')}</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={fetchRecommendations}
          className="h-8"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          {t('common.refresh')}
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {recommendations.map((car) => (
          <Link key={car.id} href={`/cars/${car.id}`}>
            <a className="block">
              <Card className="overflow-hidden h-full transition-transform duration-200 hover:-translate-y-1 hover:shadow-md">
                <div className="relative aspect-video">
                  <img
                    src={car.imageUrl || 'https://via.placeholder.com/400x225'}
                    alt={car.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 right-2 bg-primary text-primary-foreground text-xs font-medium px-2 py-1 rounded-full">
                    {Math.round(car.matchScore * 100)}% {t('ai.based_on_preferences')}
                  </div>
                </div>
                <div className="p-4">
                  <h4 className="font-medium text-base truncate">{car.make} {car.model}</h4>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-sm text-muted-foreground">{car.year}</span>
                    <span className="font-medium">${car.price.toLocaleString()}</span>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                    {car.matchReason}
                  </p>
                </div>
              </Card>
            </a>
          </Link>
        ))}
      </div>
    </div>
  );
}