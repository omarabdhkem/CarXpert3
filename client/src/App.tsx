import React, { useState, useEffect } from 'react';
import { Switch, Route, Router } from 'wouter';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import OfflineDetector from '@/components/ui/offline-detector';
import { ThemeProvider } from '@/context/theme-context';

// الصفحات
import HomePage from '@/pages/home-page';
import AuthPage from '@/pages/auth-page';
import CarDetailsPage from '@/pages/car-details.tsx';
import DealershipsPage from '@/pages/dealerships';
import CarsPage from '@/pages/cars';
import ComparePage from '@/pages/compare';
import CarConfiguratorPage from '@/pages/car-configurator';
import CarColorLabPage from '@/pages/car-color-lab';
import AdvancedSearchPage from '@/pages/advanced-search';
import CarEvaluationPage from '@/pages/car-evaluation';

// صفحات الذكاء الاصطناعي
import AIHubPage from '@/pages/ai-hub';
import CarAIPage from '@/pages/car-ai';
import CarAnalyzerPage from '@/pages/ai/car-analyzer';
import RecommendationsPage from '@/pages/ai/recommendations';
import MarketInsightsPage from '@/pages/ai/market-insights';
import AIComparePage from '@/pages/ai/car-comparison';

// صفحات الإدارة
import AdminDashboard from '@/pages/admin/dashboard';
import SelfImprovementPage from '@/pages/admin/self-improvement';
import NotFound from '@/pages/not-found';

// المكونات والمزودين
import MainLayout from '@/components/layouts/main-layout';
import AdminLayout from '@/components/layouts/admin-layout';
import { AuthProvider } from '@/hooks/use-auth';
import { ProtectedRoute } from '@/lib/protected-route';
import { LoadingProvider } from '@/context/loading-context';
import { SplashScreen } from '@/components/ui/animated-logo';

// إنشاء عميل استعلام
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 دقائق
      retry: 1,
    },
  },
});



// استيراد مكونات الانتقال
import { PageTransition, HomePageTransition, CarPageTransition, AIPageTransition } from '@/components/ui/page-transition';

export default function App() {
  // استخدام الموجه
  const [location] = Router.useLocation();
  // حالة شاشة البداية
  const [showSplash, setShowSplash] = useState(true);

  // تعريف الصفحات الإدارية (محمية وتتطلب صلاحيات المشرف)
  const adminRoutes = (
    <Route path="/admin">
      <AdminLayout>
        <Switch>
          <ProtectedRoute path="/admin" component={AdminDashboard} admin />
          <ProtectedRoute path="/admin/self-improvement" component={SelfImprovementPage} admin />
          <Route path="/admin/:rest*">
            <NotFound />
          </Route>
        </Switch>
      </AdminLayout>
    </Route>
  );

  // تعريف مسارات خدمات الذكاء الاصطناعي
  const aiRoutes = (
    <Route path="/ai">
      <MainLayout>
        <AIPageTransition>
          <Switch>
            <Route path="/ai" component={AIHubPage} />
            <Route path="/ai/car-analyzer">
              {() => <CarAnalyzerPage />}
            </Route>
            <Route path="/ai/recommendations">
              {() => <RecommendationsPage />}
            </Route>
            <Route path="/ai/market-insights">
              {() => <MarketInsightsPage />}
            </Route>
            <Route path="/ai/car-comparison">
              {() => <AIComparePage />}
            </Route>
            <Route path="/ai/:rest*">
              <NotFound />
            </Route>
          </Switch>
        </AIPageTransition>
      </MainLayout>
    </Route>
  );

  // تعريف مسارات صفحات السيارات
  const carRoutes = (
    <Switch>
      <Route path="/cars">
        <MainLayout>
          <CarPageTransition>
            <Switch>
              <Route path="/cars" exact component={CarsPage} />
              <Route path="/cars/:id">
                {(params) => <CarDetailsPage />}
              </Route>
            </Switch>
          </CarPageTransition>
        </MainLayout>
      </Route>
      <ProtectedRoute path="/compare" component={ComparePage} />
      <ProtectedRoute path="/car-configurator" component={CarConfiguratorPage} />
      <Route path="/car-color-lab">
        <MainLayout>
          <PageTransition type="slide">
            <CarColorLabPage />
          </PageTransition>
        </MainLayout>
      </Route>
      <Route path="/advanced-search">
        <MainLayout>
          <PageTransition type="fade">
            <AdvancedSearchPage />
          </PageTransition>
        </MainLayout>
      </Route>
      <Route path="/car-evaluation/:id">
        {(params) => (
          <MainLayout>
            <PageTransition type="slide">
              <CarEvaluationPage />
            </PageTransition>
          </MainLayout>
        )}
      </Route>
    </Switch>
  );

  // تعريف الصفحات الرئيسية
  const mainRoutes = (
    <Switch>
      <Route path="/" exact>
        <MainLayout>
          <HomePageTransition>
            <HomePage />
          </HomePageTransition>
        </MainLayout>
      </Route>
      
      <Route path="/auth">
        <PageTransition type="fade">
          <AuthPage />
        </PageTransition>
      </Route>
      
      <Route path="/dealerships">
        <MainLayout>
          <PageTransition type="slide">
            <DealershipsPage />
          </PageTransition>
        </MainLayout>
      </Route>

      <Route path="/car-ai">
        <MainLayout>
          <AIPageTransition>
            <CarAIPage />
          </AIPageTransition>
        </MainLayout>
      </Route>
      
      {/* مسارات السيارات */}
      {carRoutes}
      
      {/* مسارات الذكاء الاصطناعي */}
      {aiRoutes}
      
      {/* صفحات الادارة */}
      {adminRoutes}
      
      <Route>
        <PageTransition>
          <NotFound />
        </PageTransition>
      </Route>
    </Switch>
  );

  if (showSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <LoadingProvider minDuration={800} showOnRouteChange>
            <div className="min-h-screen bg-background text-text-primary rtl">
              {mainRoutes}
              <OfflineDetector />
              <Toaster />
            </div>
          </LoadingProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}