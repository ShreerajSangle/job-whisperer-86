import { Job, JobStatus, STATUS_CONFIG, SOURCE_CONFIG } from '@/types/job';
import { format, formatDistanceToNow } from 'date-fns';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { StatusBadge } from './StatusBadge';
import { NotesTimeline } from './NotesTimeline';
import { StatusHistoryTimeline } from './StatusHistoryTimeline';
import { ExternalLink, MapPin, DollarSign, Calendar, Clock } from 'lucide-react';

interface JobDetailSheetProps {
  job: Job | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStatusChange: (jobId: string, newStatus: JobStatus) => void;
}

export function JobDetailSheet({ job, open, onOpenChange, onStatusChange }: JobDetailSheetProps) {
  if (!job) return null;

  const sourceConfig = job.source ? SOURCE_CONFIG[job.source] : null;

  const formatSalary = (min?: number | null, max?: number | null) => {
    if (!min && !max) return null;
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: job.currency || 'USD',
      maximumFractionDigits: 0,
    });
    if (min && max) return `${formatter.format(min)} - ${formatter.format(max)}`;
    if (min) return `${formatter.format(min)}+`;
    if (max) return `Up to ${formatter.format(max)}`;
    return null;
  };

  const salary = formatSalary(job.salary_min, job.salary_max);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
        <SheetHeader className="space-y-4 pb-6 border-b">
          <div>
            <SheetTitle className="text-xl">{job.company_name}</SheetTitle>
            <p className="text-muted-foreground">{job.job_title}</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <StatusBadge
              status={job.status}
              onStatusChange={(newStatus) => onStatusChange(job.id, newStatus)}
              interactive
            />
            {sourceConfig && (
              <Badge variant="secondary" className={`${sourceConfig.bgColor} ${sourceConfig.color}`}>
                {sourceConfig.label}
              </Badge>
            )}
          </div>
        </SheetHeader>

        <Tabs defaultValue="details" className="mt-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="notes">Notes</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="mt-6 space-y-4">
            {job.job_url && (
              <Button variant="outline" asChild className="w-full">
                <a href={job.job_url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  View Job Posting
                </a>
              </Button>
            )}

            <div className="grid grid-cols-2 gap-4">
              {job.location && (
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Location</p>
                    <p className="text-sm text-muted-foreground">{job.location}</p>
                  </div>
                </div>
              )}
              {salary && (
                <div className="flex items-start gap-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Salary</p>
                    <p className="text-sm text-muted-foreground">{salary}</p>
                  </div>
                </div>
              )}
              {job.applied_date && (
                <div className="flex items-start gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Applied</p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(job.applied_date), 'MMM d, yyyy')}
                    </p>
                  </div>
                </div>
              )}
              <div className="flex items-start gap-2">
                <Clock className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Last Updated</p>
                  <p className="text-sm text-muted-foreground">
                    {formatDistanceToNow(new Date(job.updated_at), { addSuffix: true })}
                  </p>
                </div>
              </div>
            </div>

            {job.tags && job.tags.length > 0 && (
              <div>
                <p className="text-sm font-medium mb-2">Tags</p>
                <div className="flex gap-1 flex-wrap">
                  {job.tags.map((tag) => (
                    <Badge key={tag} variant="outline">
                      #{tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {job.notes && (
              <div>
                <p className="text-sm font-medium mb-2">Initial Notes</p>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {job.notes}
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="notes" className="mt-6">
            <NotesTimeline jobId={job.id} />
          </TabsContent>

          <TabsContent value="history" className="mt-6">
            <StatusHistoryTimeline jobId={job.id} />
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}
