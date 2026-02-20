import { useState, useMemo, useCallback } from 'react';
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
import { Loader2, Search, Briefcase, Plus, LayoutGrid, Kanban as KanbanIcon, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

// ── Kanban columns ──────────────────────────────────────────────────────────
const KANBAN_COLUMNS: { key: JobStatus; label: string }[] = [
  { key: 'saved',        label: 'Saved' },
  { key: 'applied',      label: 'Applied' },
  { key: 'interviewing', label: 'Interviewing' },
  { key: 'offered',      label: 'Offered' },
  { key: 'accepted',     label: 'Accepted' },
  { key: 'rejected',     label: 'Rejected' },
  { key: 'withdrawn',    label: 'Withdrawn' },
];

// ── Mini Kanban card ─────────────────────────────────────────────────────────
interface KanbanCardProps {
  job: Job;
  isDragging: boolean;
  onDragStart: (e: React.DragEvent) => void;
  onDragEnd: () => void;
  onClick: () => void;
}

function KanbanCard({ job, isDragging, onDragStart, onDragEnd, onClick }: KanbanCardProps) {
  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onClick={onClick}
      className={`group rounded-lg border bg-card p-3 cursor-grab active:cursor-grabbing select-none transition-all duration-150 ${
        isDragging
          ? 'opacity-40 scale-95 border-border/60'
          : 'border-border/30 hover:border-border/60 hover:bg-muted/20'
      }`}
    >
      <p className="text-sm font-medium text-foreground leading-snug line-clamp-2">
        {job.job_title}
      </p>
      <p className="text-xs text-muted-foreground mt-1 truncate">{job.company_name}</p>
      {job.location && (
        <p className="text-[11px] text-muted-foreground/60 mt-1.5 truncate">{job.location}</p>
      )}
      {job.applied_date && (
        <p className="text-[11px] text-muted-foreground/50 mt-1">
          {new Date(job.applied_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </p>
      )}
    </div>
  );
}

// ── Main Dashboard ───────────────────────────────────────────────────────────
type ViewMode = 'list' | 'kanban';

export default function Dashboard() {
  const { jobs, loading, updateJobStatus, deleteJob } = useJobs();
  const stats = useJobStats(jobs);

  // filters & view
  const [searchTerm, setSearchTerm]     = useState('');
  const [statusFilter, setStatusFilter] = useState<JobStatus | 'all'>('all');
  const [sourceFilter, setSourceFilter] = useState<JobSource | 'all'>('all');
  const [viewMode, setViewMode]         = useState<ViewMode>('list');
  const [selectedJob, setSelectedJob]   = useState<Job | null>(null);

  // kanban drag state
  const [draggingJobId, setDraggingJobId] = useState<string | null>(null);
  const [dragOverCol,   setDragOverCol]   = useState<JobStatus | null>(null);

  // ── filtered jobs ──────────────────────────────────────────────────────────
  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const q = searchTerm.toLowerCase();
      const matchesSearch =
        !q ||
        job.company_name.toLowerCase().includes(q) ||
        job.job_title.toLowerCase().includes(q) ||
        (job.notes && job.notes.toLowerCase().includes(q));
      const matchesStatus = statusFilter === 'all' || job.status === statusFilter;
      const matchesSource = sourceFilter === 'all' || job.source === sourceFilter;
      return matchesSearch && matchesStatus && matchesSource;
    });
  }, [jobs, searchTerm, statusFilter, sourceFilter]);

  // ── handlers ──────────────────────────────────────────────────────────────
  const handleStatusChange = useCallback(async (jobId: string, newStatus: JobStatus) => {
    await updateJobStatus(jobId, newStatus);
  }, [updateJobStatus]);

  const handleDeleteJob = useCallback(async (jobId: string) => {
    await deleteJob(jobId);
    if (selectedJob?.id === jobId) setSelectedJob(null);
  }, [deleteJob, selectedJob]);

  // ── kanban drag ───────────────────────────────────────────────────────────
  const handleDragStart = useCallback((e: React.DragEvent, jobId: string) => {
    setDraggingJobId(jobId);
    e.dataTransfer.effectAllowed = 'move';
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, col: JobStatus) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverCol(col);
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent, col: JobStatus) => {
    e.preventDefault();
    setDragOverCol(null);
    if (!draggingJobId) return;
    const job = jobs.find(j => j.id === draggingJobId);
    if (job && job.status !== col) {
      await updateJobStatus(draggingJobId, col);
    }
    setDraggingJobId(null);
  }, [draggingJobId, jobs, updateJobStatus]);

  const handleDragEnd = useCallback(() => {
    setDraggingJobId(null);
    setDragOverCol(null);
  }, []);

  // ── loading ───────────────────────────────────────────────────────────────
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

  // ── empty state ───────────────────────────────────────────────────────────
  if (jobs.length === 0) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 container py-6">
          <div className="flex flex-col items-center justify-center py-24 text-center">
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
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1 flex flex-col min-h-0">

        {/* ── Stats section ─────────────────────────────────────────────── */}
        <section className="container pt-6 pb-4 shrink-0 space-y-4">
          <StatsCards stats={stats} />
        </section>

        {/* ── Filters + view toggle ─────────────────────────────────────── */}
        <section className="container pb-4 shrink-0">
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
            {/* search */}
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                placeholder="Search by company, title, or notes…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* status filter */}
            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as JobStatus | 'all')}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                  <SelectItem key={key} value={key}>{config.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* source filter */}
            <Select value={sourceFilter} onValueChange={(v) => setSourceFilter(v as JobSource | 'all')}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="All Sources" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sources</SelectItem>
                {Object.entries(SOURCE_CONFIG).map(([key, config]) => (
                  <SelectItem key={key} value={key}>{config.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* view toggle */}
            <div className="flex items-center gap-1 p-0.5 rounded-lg bg-muted border border-border/50 shrink-0">
              <button
                onClick={() => setViewMode('list')}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all ${
                  viewMode === 'list'
                    ? 'bg-card text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <LayoutGrid className="h-3.5 w-3.5" />
                List
              </button>
              <button
                onClick={() => setViewMode('kanban')}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all ${
                  viewMode === 'kanban'
                    ? 'bg-card text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <KanbanIcon className="h-3.5 w-3.5" />
                Kanban
              </button>
            </div>
          </div>
        </section>

        {/* ── Content ───────────────────────────────────────────────────── */}
        {filteredJobs.length === 0 ? (
          <div className="container flex flex-col items-center justify-center py-20 text-center">
            <p className="text-muted-foreground text-sm">No jobs match your search criteria</p>
          </div>
        ) : viewMode === 'list' ? (
          /* ── List / card grid ───────────────────────────────────────── */
          <section className="container pb-8 flex-1">
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

            {/* Insights below list */}
            {jobs.length > 0 && (
              <div className="mt-8 space-y-5 pt-6 border-t border-border/40">
                <h2 className="text-sm font-semibold text-foreground tracking-wide uppercase opacity-60">
                  Insights
                </h2>
                <SourceInsights bestSource={stats.bestSource} worstSource={stats.worstSource} />
                <SourceStatsChart bySource={stats.bySource} />
              </div>
            )}
          </section>
        ) : (
          /* ── Kanban board ───────────────────────────────────────────── */
          <section className="flex-1 overflow-x-auto overflow-y-hidden px-4 pb-6 min-h-0">
            <div className="flex gap-3 h-full pt-1" style={{ minWidth: 'max-content' }}>
              {KANBAN_COLUMNS.map((col) => {
                const config = STATUS_CONFIG[col.key];
                // in kanban, ignore status filter — show all jobs filtered by search/source only
                const colJobs = jobs.filter((j) => {
                  const q = searchTerm.toLowerCase();
                  const matchesSearch =
                    !q ||
                    j.company_name.toLowerCase().includes(q) ||
                    j.job_title.toLowerCase().includes(q);
                  const matchesSource = sourceFilter === 'all' || j.source === sourceFilter;
                  return j.status === col.key && matchesSearch && matchesSource;
                });
                const isOver = dragOverCol === col.key;

                return (
                  <div
                    key={col.key}
                    className={`flex flex-col w-60 rounded-xl border transition-colors duration-150 ${
                      isOver
                        ? 'border-border bg-muted/20'
                        : 'border-border/30 bg-card/40'
                    }`}
                    onDragOver={(e) => handleDragOver(e, col.key)}
                    onDrop={(e) => handleDrop(e, col.key)}
                    onDragLeave={() => setDragOverCol(null)}
                  >
                    {/* Column header */}
                    <div className="px-3 py-2.5 border-b border-border/30 shrink-0">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`h-1.5 w-1.5 rounded-full ${config.bgColor} border ${config.borderColor}`} />
                          <span className={`text-[11px] font-semibold tracking-wider uppercase ${config.color}`}>
                            {col.label}
                          </span>
                        </div>
                        <span className="text-[11px] text-muted-foreground/50 tabular-nums">
                          {colJobs.length}
                        </span>
                      </div>
                    </div>

                    {/* Cards */}
                    <div className="flex-1 overflow-y-auto p-2 space-y-2 min-h-[120px]">
                      {colJobs.length === 0 && (
                        <div className="flex items-center justify-center h-14 rounded-lg border border-dashed border-border/25">
                          <span className="text-[11px] text-muted-foreground/30">Drop here</span>
                        </div>
                      )}
                      {colJobs.map((job) => (
                        <KanbanCard
                          key={job.id}
                          job={job}
                          isDragging={draggingJobId === job.id}
                          onDragStart={(e) => handleDragStart(e, job.id)}
                          onDragEnd={handleDragEnd}
                          onClick={() => setSelectedJob(job)}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
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
