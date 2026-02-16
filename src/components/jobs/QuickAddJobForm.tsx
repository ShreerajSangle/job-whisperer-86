import { useEffect, useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Command, Loader2, Upload, FileText, X } from 'lucide-react';
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
  job_description: z.string().max(10000).optional(),
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
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
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
      job_description: data.job_description || undefined,
      notes: data.notes || undefined,
    });

    // Upload resume if file selected and job created
    if (!result.error && result.data && resumeFile) {
      const { supabase } = await import('@/integrations/supabase/client');
      const filePath = `${result.data.user_id}/${result.data.id}/${Date.now()}_${resumeFile.name}`;
      
      const { error: uploadError } = await supabase.storage
        .from('job-documents')
        .upload(filePath, resumeFile);

      if (!uploadError) {
        await supabase.from('job_documents').insert({
          job_id: result.data.id,
          user_id: result.data.user_id,
          file_name: resumeFile.name,
          file_path: filePath,
          file_size: resumeFile.size,
          document_type: 'resume' as const,
          is_primary: true,
        });
      }
    }

    setLoading(false);

    if (!result.error) {
      setOpen(false);
      reset();
      setShowMore(false);
      setResumeFile(null);
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

              {/* Resume Upload */}
              <div className="space-y-2">
                <Label>Resume</Label>
                {resumeFile ? (
                  <div className="flex items-center gap-3 p-2.5 rounded-lg bg-muted/30 border border-border/30">
                    <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span className="text-sm text-foreground truncate flex-1">{resumeFile.name}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 shrink-0 text-muted-foreground hover:text-destructive"
                      onClick={() => setResumeFile(null)}
                    >
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ) : (
                  <div className="rounded-lg border border-dashed border-border/50 bg-muted/20 p-4">
                    <div className="flex flex-col items-center text-center gap-2">
                      <FileText className="h-5 w-5 text-muted-foreground/60" />
                      <p className="text-xs text-muted-foreground">
                        Attach a resume for this application
                      </p>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".pdf,.doc,.docx"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) setResumeFile(file);
                          if (fileInputRef.current) fileInputRef.current.value = '';
                        }}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="text-xs border-border/40 bg-muted/30 hover:bg-muted/50"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <Upload className="mr-1.5 h-3.5 w-3.5" />
                        Choose File
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* Job Description */}
              <div className="space-y-2">
                <Label htmlFor="job_description">Job Description</Label>
                <Textarea
                  id="job_description"
                  placeholder="Paste or type the job description..."
                  {...register('job_description')}
                  rows={4}
                  className="bg-muted/20 border-border/40 text-sm placeholder:text-muted-foreground/40 resize-y"
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
