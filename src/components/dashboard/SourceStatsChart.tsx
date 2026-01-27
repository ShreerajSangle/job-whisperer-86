import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, Cell } from 'recharts';
import { JobSource, SOURCE_CONFIG } from '@/types/job';

interface SourceStatsChartProps {
  bySource: Record<JobSource, {
    total: number;
    applied: number;
    interviewing: number;
    offered: number;
    accepted: number;
  }>;
}

export function SourceStatsChart({ bySource }: SourceStatsChartProps) {
  const chartData = Object.entries(bySource)
    .filter(([_, data]) => data.total > 0)
    .map(([source, data]) => ({
      name: SOURCE_CONFIG[source as JobSource].label,
      Applied: data.applied,
      Interviewing: data.interviewing,
      Offered: data.offered,
      Accepted: data.accepted,
      total: data.total,
    }));

  if (chartData.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Applications by Source</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} layout="vertical" margin={{ left: 20, right: 20 }}>
              <XAxis type="number" />
              <YAxis type="category" dataKey="name" width={100} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
              />
              <Legend />
              <Bar dataKey="Applied" stackId="a" fill="hsl(217, 91%, 60%)" radius={[0, 0, 0, 0]} />
              <Bar dataKey="Interviewing" stackId="a" fill="hsl(263, 70%, 50%)" />
              <Bar dataKey="Offered" stackId="a" fill="hsl(142, 76%, 36%)" />
              <Bar dataKey="Accepted" stackId="a" fill="hsl(142, 71%, 45%)" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
