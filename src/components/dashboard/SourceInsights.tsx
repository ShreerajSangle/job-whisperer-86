import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, AlertTriangle } from 'lucide-react';
import { JobSource, SOURCE_CONFIG } from '@/types/job';

interface SourceInsightsProps {
  bestSource: { source: JobSource; rate: number } | null;
  worstSource: { source: JobSource; rate: number } | null;
}

export function SourceInsights({ bestSource, worstSource }: SourceInsightsProps) {
  if (!bestSource && !worstSource) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {bestSource && (
        <Card className="border-emerald-200 bg-emerald-50/50 dark:border-emerald-800 dark:bg-emerald-900/20">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-emerald-700 dark:text-emerald-300">
              <TrendingUp className="h-4 w-4" />
              Best Performer
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-semibold text-emerald-800 dark:text-emerald-200">
              {SOURCE_CONFIG[bestSource.source].label}: {bestSource.rate.toFixed(0)}% success rate
            </p>
            <p className="text-sm text-emerald-600 dark:text-emerald-400 mt-1">
              Focus on more {SOURCE_CONFIG[bestSource.source].label.toLowerCase()} applications!
            </p>
          </CardContent>
        </Card>
      )}

      {worstSource && worstSource.source !== bestSource?.source && (
        <Card className="border-amber-200 bg-amber-50/50 dark:border-amber-800 dark:bg-amber-900/20">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-amber-700 dark:text-amber-300">
              <AlertTriangle className="h-4 w-4" />
              Needs Attention
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-semibold text-amber-800 dark:text-amber-200">
              {SOURCE_CONFIG[worstSource.source].label}: {worstSource.rate.toFixed(0)}% success rate
            </p>
            <p className="text-sm text-amber-600 dark:text-amber-400 mt-1">
              Consider trying different platforms
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
