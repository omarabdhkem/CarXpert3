import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import AdminLayout from '@/components/layouts/admin-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Clock, Cpu, Database, FileCode, FileText, Power } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { apiRequest } from '@/lib/queryClient';
import { t } from '@/i18n';

// نماذج البيانات
interface SystemStatus {
  active: boolean;
  runningFor: number; // بالدقائق
  lastCycleTimestamp: string;
  totalIssuesFixed: number;
  pendingIssues: number;
  memoryUsage: number; // MB
  optimizationSuggestionsCount: number;
}

interface ModuleStatus {
  name: string;
  enabled: boolean;
  successRate: number;
  lastRun: string | null;
}

interface CodeOptimization {
  id: string;
  filePath: string;
  timestamp: string;
  suggestions: string;
  status: 'pending_review' | 'approved' | 'rejected' | 'applied';
}

const SelfImprovementPage = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('system');

  // جلب حالة النظام
  const { 
    data: systemStatus,
    isLoading: isLoadingStatus, 
    refetch: refetchStatus 
  } = useQuery<SystemStatus>({
    queryKey: ['/api/self-improvement/status'],
    refetchInterval: 30000, // تحديث كل 30 ثانية
  });

  // جلب حالة الوحدات
  const { 
    data: modules,
    isLoading: isLoadingModules, 
    refetch: refetchModules 
  } = useQuery<ModuleStatus[]>({
    queryKey: ['/api/self-improvement/modules'],
  });

  // جلب اقتراحات التحسين
  const { 
    data: optimizations,
    isLoading: isLoadingOptimizations, 
    refetch: refetchOptimizations 
  } = useQuery<CodeOptimization[]>({
    queryKey: ['/api/self-improvement/optimizations'],
  });

  // تبديل تشغيل/إيقاف النظام
  const toggleSystemMutation = useMutation({
    mutationFn: async (active: boolean) => {
      return await apiRequest('POST', '/api/self-improvement/toggle', { active });
    },
    onSuccess: (_, active) => {
      refetchStatus();
      toast({
        title: active ? t('selfImprovement.systemEnabled') : t('selfImprovement.systemDisabled'),
        description: active ? t('selfImprovement.systemEnabledDesc') : t('selfImprovement.systemDisabledDesc'),
      });
    },
    onError: (error) => {
      toast({
        title: t('selfImprovement.errorToggling'),
        description: (error as Error).message,
        variant: 'destructive',
      });
    },
  });

  // تبديل تشغيل/إيقاف وحدة
  const toggleModuleMutation = useMutation({
    mutationFn: async ({ name, enabled }: { name: string; enabled: boolean }) => {
      return await apiRequest('POST', '/api/self-improvement/module/toggle', { name, enabled });
    },
    onSuccess: () => {
      refetchModules();
      toast({
        title: t('selfImprovement.moduleUpdated'),
        description: t('selfImprovement.moduleUpdatedDesc'),
      });
    },
    onError: (error) => {
      toast({
        title: t('selfImprovement.errorUpdatingModule'),
        description: (error as Error).message,
        variant: 'destructive',
      });
    },
  });

  // تشغيل دورة تحسين يدوياً
  const runCycleMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest('POST', '/api/self-improvement/run-cycle', {});
    },
    onSuccess: () => {
      refetchStatus();
      toast({
        title: t('selfImprovement.cycleStarted'),
        description: t('selfImprovement.cycleStartedDesc'),
      });
    },
    onError: (error) => {
      toast({
        title: t('selfImprovement.errorStartingCycle'),
        description: (error as Error).message,
        variant: 'destructive',
      });
    },
  });

  // تحديث حالة اقتراح تحسين
  const updateOptimizationMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      return await apiRequest('POST', '/api/self-improvement/optimization/update', { id, status });
    },
    onSuccess: () => {
      refetchOptimizations();
      toast({
        title: t('selfImprovement.optimizationUpdated'),
        description: t('selfImprovement.optimizationUpdatedDesc'),
      });
    },
    onError: (error) => {
      toast({
        title: t('selfImprovement.errorUpdatingOptimization'),
        description: (error as Error).message,
        variant: 'destructive',
      });
    },
  });

  // تطبيق اقتراح تحسين
  const applyOptimizationMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest('POST', '/api/self-improvement/optimization/apply', { id });
    },
    onSuccess: () => {
      refetchOptimizations();
      toast({
        title: t('selfImprovement.optimizationApplied'),
        description: t('selfImprovement.optimizationAppliedDesc'),
      });
    },
    onError: (error) => {
      toast({
        title: t('selfImprovement.errorApplyingOptimization'),
        description: (error as Error).message,
        variant: 'destructive',
      });
    },
  });

  // توليد وحدات زمنية مقروءة
  const formatDuration = (minutes: number): string => {
    if (minutes < 60) {
      return `${minutes} ${t('selfImprovement.minutes')}`;
    } else if (minutes < 1440) {
      const hours = Math.floor(minutes / 60);
      return `${hours} ${t('selfImprovement.hours')}`;
    } else {
      const days = Math.floor(minutes / 1440);
      return `${days} ${t('selfImprovement.days')}`;
    }
  };

  // توليد تاريخ مقروء
  const formatDate = (dateString: string | null): string => {
    if (!dateString) return t('common.never') || 'لم يحدث';
    const date = new Date(dateString);
    return date.toLocaleString('ar-SA');
  };

  return (
    <AdminLayout>
      <div className="space-y-4 rtl">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">{t('selfImprovement.title')}</h1>
          <div className="flex items-center gap-4">
            <Button
              onClick={() => {
                refetchStatus();
                refetchModules();
                refetchOptimizations();
              }}
              variant="outline"
            >
              {t('common.refresh')}
            </Button>
            <Button
              onClick={() => runCycleMutation.mutate()}
              disabled={runCycleMutation.isPending || !systemStatus?.active}
            >
              {runCycleMutation.isPending ? t('common.loading') : t('selfImprovement.runCycle')}
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="system">{t('selfImprovement.systemStatus')}</TabsTrigger>
            <TabsTrigger value="modules">{t('selfImprovement.modules')}</TabsTrigger>
            <TabsTrigger value="optimizations">{t('selfImprovement.optimizations')}</TabsTrigger>
          </TabsList>

          {/* قسم حالة النظام */}
          <TabsContent value="system">
            <Card>
              <CardHeader>
                <CardTitle>{t('selfImprovement.systemStatus')}</CardTitle>
                <CardDescription>{t('selfImprovement.description')}</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingStatus ? (
                  <div className="h-40 flex items-center justify-center">
                    <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
                  </div>
                ) : systemStatus ? (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between pb-4 border-b">
                      <div className="flex items-center gap-2">
                        {systemStatus.active ? (
                          <Power className="w-6 h-6 text-green-500" />
                        ) : (
                          <Power className="w-6 h-6 text-red-500" />
                        )}
                        <span className="font-medium text-lg">
                          {systemStatus.active ? t('selfImprovement.active') : t('selfImprovement.inactive')}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Label htmlFor="system-toggle">{t('selfImprovement.toggleSystem')}</Label>
                        <Switch
                          id="system-toggle"
                          checked={systemStatus.active}
                          onCheckedChange={(checked) => toggleSystemMutation.mutate(checked)}
                          disabled={toggleSystemMutation.isPending}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <StatusCard
                        icon={<Clock className="w-6 h-6 text-blue-500" />}
                        title={t('selfImprovement.runningFor')}
                        value={formatDuration(systemStatus.runningFor)}
                      />
                      <StatusCard
                        icon={<FileText className="w-6 h-6 text-green-500" />}
                        title={t('selfImprovement.issuesFixed')}
                        value={systemStatus.totalIssuesFixed.toString()}
                      />
                      <StatusCard
                        icon={<FileCode className="w-6 h-6 text-yellow-500" />}
                        title={t('selfImprovement.pendingIssues')}
                        value={systemStatus.pendingIssues.toString()}
                      />
                      <StatusCard
                        icon={<Database className="w-6 h-6 text-purple-500" />}
                        title={t('selfImprovement.memoryUsage')}
                        value={`${systemStatus.memoryUsage} ${t('selfImprovement.megabytes')}`}
                      />
                    </div>

                    <div className="pt-4 border-t">
                      <h3 className="font-medium mb-2">{t('selfImprovement.lastCycle')}</h3>
                      <p>{formatDate(systemStatus.lastCycleTimestamp)}</p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">{t('selfImprovement.noData')}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* قسم الوحدات */}
          <TabsContent value="modules">
            <Card>
              <CardHeader>
                <CardTitle>{t('selfImprovement.moduleStatus')}</CardTitle>
                <CardDescription>{t('selfImprovement.modulesDescription')}</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingModules ? (
                  <div className="h-40 flex items-center justify-center">
                    <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
                  </div>
                ) : modules && modules.length > 0 ? (
                  <div className="space-y-6">
                    {modules.map((module) => (
                      <div key={module.name} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            {module.enabled ? (
                              <Cpu className="w-5 h-5 text-green-500" />
                            ) : (
                              <Cpu className="w-5 h-5 text-gray-400" />
                            )}
                            <h3 className="font-medium">{module.name}</h3>
                          </div>
                          <div className="flex items-center gap-3">
                            <Label htmlFor={`module-toggle-${module.name}`}>
                              {module.enabled
                                ? t('selfImprovement.disableModule')
                                : t('selfImprovement.enableModule')}
                            </Label>
                            <Switch
                              id={`module-toggle-${module.name}`}
                              checked={module.enabled}
                              onCheckedChange={(checked) =>
                                toggleModuleMutation.mutate({ name: module.name, enabled: checked })
                              }
                              disabled={toggleModuleMutation.isPending}
                            />
                          </div>
                        </div>

                        <div className="flex flex-col gap-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-500">{t('selfImprovement.successRate')}</span>
                            <span className="text-sm font-medium">{module.successRate}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                            <div
                              className="bg-blue-600 h-2.5 rounded-full"
                              style={{ width: `${module.successRate}%` }}
                            ></div>
                          </div>
                        </div>

                        <div className="mt-4 text-sm text-gray-500">
                          <span className="font-medium">{t('selfImprovement.lastRun')}: </span>
                          {formatDate(module.lastRun)}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">{t('selfImprovement.noModules')}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* قسم التحسينات */}
          <TabsContent value="optimizations">
            <Card>
              <CardHeader>
                <CardTitle>{t('selfImprovement.optimizations')}</CardTitle>
                <CardDescription>{t('selfImprovement.optimizationInfo')}</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingOptimizations ? (
                  <div className="h-40 flex items-center justify-center">
                    <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
                  </div>
                ) : optimizations && optimizations.length > 0 ? (
                  <div className="space-y-6">
                    {optimizations.map((opt) => (
                      <div key={opt.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="font-medium text-base">{opt.filePath}</h3>
                            <p className="text-sm text-gray-500">{formatDate(opt.timestamp)}</p>
                          </div>
                          <Badge status={opt.status} />
                        </div>

                        <div className="bg-gray-50 p-3 rounded-md my-3 whitespace-pre-wrap text-sm font-mono">
                          {opt.suggestions}
                        </div>

                        {opt.status === 'pending_review' && (
                          <div className="flex gap-2 mt-4">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateOptimizationMutation.mutate({ id: opt.id, status: 'approved' })}
                              disabled={updateOptimizationMutation.isPending}
                            >
                              {t('selfImprovement.approve')}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateOptimizationMutation.mutate({ id: opt.id, status: 'rejected' })}
                              disabled={updateOptimizationMutation.isPending}
                            >
                              {t('selfImprovement.reject')}
                            </Button>
                          </div>
                        )}

                        {opt.status === 'approved' && (
                          <div className="mt-4">
                            <Button
                              size="sm"
                              onClick={() => applyOptimizationMutation.mutate(opt.id)}
                              disabled={applyOptimizationMutation.isPending}
                            >
                              {t('selfImprovement.apply')}
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">{t('selfImprovement.noOptimizations')}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

// مكون لعرض الحالة
const StatusCard = ({ icon, title, value }: { icon: any; title: string; value: string }) => {
  return (
    <div className="bg-gray-50 p-4 rounded-md">
      <div className="flex items-center gap-3 mb-2">
        {icon}
        <span className="text-sm font-medium text-gray-500">{title}</span>
      </div>
      <div className="text-xl font-semibold">{value}</div>
    </div>
  );
};

// مكون لعرض حالة الاقتراح
const Badge = ({ status }: { status: string }) => {
  let color = '';
  let label = '';

  switch (status) {
    case 'pending_review':
      color = 'bg-yellow-100 text-yellow-800';
      label = t('selfImprovement.pending');
      break;
    case 'approved':
      color = 'bg-green-100 text-green-800';
      label = t('selfImprovement.approved');
      break;
    case 'rejected':
      color = 'bg-red-100 text-red-800';
      label = t('selfImprovement.rejected');
      break;
    case 'applied':
      color = 'bg-blue-100 text-blue-800';
      label = t('selfImprovement.applied');
      break;
  }

  return <span className={`px-2 py-1 rounded-md text-xs font-medium ${color}`}>{label}</span>;
};

export default SelfImprovementPage;