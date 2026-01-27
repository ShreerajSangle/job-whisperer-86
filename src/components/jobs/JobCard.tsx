import { formatDistanceToNow } from 'date-fns';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { StatusBadge } from './StatusBadge';
import { Job, JobStatus, SOURCE_CONFIG } from '@/types/job';
import { ExternalLink, MoreHorizontal, Trash2, Pencil, MapPin, DollarSign } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useState } from 'react';

interface JobCardProps {
  job: Job;
  onStatusChange: (jobId: string, newStatus: JobStatus) => void;
  onDelete: (jobId: string) => void;
  onViewDetails: (job: Job) => void;
}

export function JobCard({ job, onStatusChange, onDelete, onViewDetails }: JobCardProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
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
    <>
      <Card className="group relative overflow-hidden transition-all hover:shadow-lg hover:border-primary/20">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-lg truncate">{job.company_name}</h3>
              <p className="text-muted-foreground truncate">{job.job_title}</p>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onViewDetails(job)}>
                  <Pencil className="mr-2 h-4 w-4" />
                  View Details
                </DropdownMenuItem>
                {job.job_url && (
                  <DropdownMenuItem asChild>
                    <a href={job.job_url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Open Job URL
                    </a>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem
                  onClick={() => setDeleteDialogOpen(true)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2 flex-wrap">
            <StatusBadge
              status={job.status}
              onStatusChange={(newStatus) => onStatusChange(job.id, newStatus)}
              interactive
              size="sm"
            />
            {sourceConfig && (
              <Badge variant="secondary" className={`${sourceConfig.bgColor} ${sourceConfig.color} text-xs`}>
                {sourceConfig.label}
              </Badge>
            )}
          </div>

          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
            {job.location && (
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {job.location}
              </span>
            )}
            {salary && (
              <span className="flex items-center gap-1">
                <DollarSign className="h-3 w-3" />
                {salary}
              </span>
            )}
          </div>

          {job.tags && job.tags.length > 0 && (
            <div className="flex gap-1 flex-wrap">
              {job.tags.slice(0, 3).map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  #{tag}
                </Badge>
              ))}
              {job.tags.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{job.tags.length - 3}
                </Badge>
              )}
            </div>
          )}

          <p className="text-xs text-muted-foreground">
            Updated {formatDistanceToNow(new Date(job.updated_at), { addSuffix: true })}
          </p>
        </CardContent>
      </Card>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this job?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete {job.company_name} - {job.job_title} and all associated notes.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                onDelete(job.id);
                setDeleteDialogOpen(false);
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
