import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Command, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { useJobs } from '@/hooks/useJobs';
import { JobStatus, JobSource, STATUS_CONFIG, SOURCE_CONFIG } from '@/types/job';
import { ChevronDown } from 'lucide-react';

const jobSchema = z.object({
  company_name: z.string().min(1, 'Company name is required').max(255),
  job_title: z.string().min(1, 'Job title is required').max(255),
  status: z.enum(['saved', 'applied', 'interviewing', 'offered', 'accepted', 'rejected', 'withdrawn']),
  job_url: z.string().url().optional().or(z.literal('')),
  source: z.enum(['linkedin', 'indeed', 'referral', 'company_site', 'recruiter', 'other']).optional(),
  salary_min: z.coerce.number().optional().nullable(),
  salary_max: z.coerce.number().optional().nullable(),
  applied_date: z.string().optional(),
  notes: z.string().max(2000).optional(),
});

type JobFormData = z.infer<typeof jobSchema>;

interface QuickAddJobFormProps {
  trigger?: React.ReactNode;
}

export function QuickAddJobForm({ trigger }: QuickAddJobFormProps) {
  const [open, setOpen] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const { createJob } = useJobs();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<JobFormData>({
    resolver: zodResolver(jobSchema),
    defaultValues: {
      status: 'saved',
      applied_date: new Date().toISOString().split('T')[0],
    },
  });

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen(true);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const onSubmit = async (data: JobFormData) => {
    setLoading(true);
    
    const result = await createJob({
      company_name: data.company_name,
      job_title: data.job_title,
      status: data.status as JobStatus,
      job_url: data.job_url || undefined,
      source: data.source as JobSource | undefined,
      salary_min: data.salary_min || undefined,
      salary_max: data.salary_max || undefined,
      applied_date: data.applied_date || undefined,
      notes: data.notes || undefined,
    });

    setLoading(false);

    if (!result.error) {
      setOpen(false);
      reset();
      setShowMore(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Add Job
            <kbd className="pointer-events-none hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-xs font-medium opacity-100 sm:flex">
              <Command className="h-3 w-3" />K
            </kbd>
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Job</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="company_name">Company *</Label>
            <Input
              id="company_name"
              placeholder="e.g., Google"
              {...register('company_name')}
              autoFocus
            />
            {errors.company_name && (
              <p className="text-sm text-destructive">{errors.company_name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="job_title">Job Title *</Label>
            <Input
              id="job_title"
              placeholder="e.g., Senior Software Engineer"
              {...register('job_title')}
            />
            {errors.job_title && (
              <p className="text-sm text-destructive">{errors.job_title.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Status *</Label>
            <Select
              value={watch('status')}
              onValueChange={(value) => setValue('status', value as JobStatus)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                  <SelectItem key={key} value={key}>
                    <span className="flex items-center gap-2">
                      <span>{config.icon}</span>
                      <span>{config.label}</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Collapsible open={showMore} onOpenChange={setShowMore}>
            <CollapsibleTrigger asChild>
              <Button type="button" variant="ghost" className="w-full justify-between">
                More options
                <ChevronDown className={`h-4 w-4 transition-transform ${showMore ? 'rotate-180' : ''}`} />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="job_url">Job URL</Label>
                <Input
                  id="job_url"
                  type="url"
                  placeholder="https://..."
                  {...register('job_url')}
                />
              </div>

              <div className="space-y-2">
                <Label>Source</Label>
                <Select
                  value={watch('source') || ''}
                  onValueChange={(value) => setValue('source', value as JobSource)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Where did you find this job?" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(SOURCE_CONFIG).map(([key, config]) => (
                      <SelectItem key={key} value={key}>
                        {config.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="salary_min">Salary Min</Label>
                  <Input
                    id="salary_min"
                    type="number"
                    placeholder="100000"
                    {...register('salary_min')}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="salary_max">Salary Max</Label>
                  <Input
                    id="salary_max"
                    type="number"
                    placeholder="150000"
                    {...register('salary_max')}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="applied_date">Applied Date</Label>
                <Input
                  id="applied_date"
                  type="date"
                  {...register('applied_date')}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Any additional notes..."
                  {...register('notes')}
                  rows={3}
                />
              </div>
            </CollapsibleContent>
          </Collapsible>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Add Job
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
