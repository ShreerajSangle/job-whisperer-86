import { useState, useMemo } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { StatsCards } from '@/components/dashboard/StatsCards';
import { SourceInsights } from '@/components/dashboard/SourceInsights';
import { SourceStatsChart } from '@/components/dashboard/SourceStatsChart';
import { JobCard } from '@/components/jobs/JobCard';
import { JobDetailSheet } from '@/components/jobs/JobDetailSheet';
import { QuickAddJobForm } from '@/components/jobs/QuickAddJobForm';
import { useJobs } from '@/hooks/useJobs';
import { useJobStats } from '@/hooks/useJobStats';
import { Job, JobStatus, JobSource, STATUS_CONFIG, SOURCE_CONFIG } from '@/types/job';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, Search, Briefcase, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Dashboard() {
  const { jobs, loading, updateJobStatus, deleteJob } = useJobs();
  const stats = useJobStats(jobs);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<JobStatus | 'all'>('all');
  const [sourceFilter, setSourceFilter] = useState<JobSource | 'all'>('all');
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const matchesSearch =
        job.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.job_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (job.notes && job.notes.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesStatus = statusFilter === 'all' || job.status === statusFilter;
      const matchesSource = sourceFilter === 'all' || job.source === sourceFilter;

      return matchesSearch && matchesStatus && matchesSource;
    });
  }, [jobs, searchTerm, statusFilter, sourceFilter]);

  const handleStatusChange = async (jobId: string, newStatus: JobStatus) => {
    await updateJobStatus(jobId, newStatus);
  };

  const handleDeleteJob = async (jobId: string) => {
    await deleteJob(jobId);
    if (selectedJob?.id === jobId) {
      setSelectedJob(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1 container py-6 space-y-5">
        {/* Stats */}
        <StatsCards stats={stats} />

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by company, title, or notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as JobStatus | 'all')}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                <SelectItem key={key} value={key}>
                  {config.icon} {config.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={sourceFilter} onValueChange={(v) => setSourceFilter(v as JobSource | 'all')}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="All Sources" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sources</SelectItem>
              {Object.entries(SOURCE_CONFIG).map(([key, config]) => (
                <SelectItem key={key} value={key}>
                  {config.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Jobs Grid or Empty State */}
        {jobs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted mb-5">
              <Briefcase className="h-8 w-8 text-muted-foreground" />
            </div>
            <h2 className="text-lg font-semibold mb-1.5">No jobs yet</h2>
            <p className="text-muted-foreground mb-5 max-w-xs text-sm">
              Start tracking your job applications by adding your first job.
            </p>
            <QuickAddJobForm
              trigger={
                <Button size="default" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Your First Job
                </Button>
              }
            />
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <p className="text-muted-foreground text-sm">
              No jobs match your search criteria
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredJobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                onStatusChange={handleStatusChange}
                onDelete={handleDeleteJob}
                onViewDetails={setSelectedJob}
              />
            ))}
          </div>
        )}

        {/* Insights Section */}
        {jobs.length > 0 && (
          <div className="space-y-5 pt-5 border-t border-border/50">
            <h2 className="text-base font-medium text-foreground">Insights</h2>
            <SourceInsights
              bestSource={stats.bestSource}
              worstSource={stats.worstSource}
            />
            <SourceStatsChart bySource={stats.bySource} />
          </div>
        )}
      </main>

      <JobDetailSheet
        job={selectedJob}
        open={!!selectedJob}
        onOpenChange={(open) => !open && setSelectedJob(null)}
        onStatusChange={handleStatusChange}
      />
    </div>
  );
}
