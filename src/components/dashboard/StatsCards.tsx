import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { STATUS_CONFIG, JobStatus } from '@/types/job';
import { Briefcase } from 'lucide-react';

interface StatsCardsProps {
  stats: {
    total: number;
    byStatus: Record<JobStatus, number>;
  };
}

export function StatsCards({ stats }: StatsCardsProps) {
  const statCards = [
    { label: 'Total', value: stats.total, icon: Briefcase, color: 'text-foreground' },
    { label: 'Applied', value: stats.byStatus.applied, color: 'text-blue-600' },
    { label: 'Interviewing', value: stats.byStatus.interviewing, color: 'text-violet-600' },
    { label: 'Offered', value: stats.byStatus.offered, color: 'text-emerald-600' },
    { label: 'Accepted', value: stats.byStatus.accepted, color: 'text-green-600' },
    { label: 'Rejected', value: stats.byStatus.rejected, color: 'text-red-600' },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
      {statCards.map((stat) => (
        <Card key={stat.label} className="overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {stat.label}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
