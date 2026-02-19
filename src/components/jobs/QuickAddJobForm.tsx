import { useEffect, useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Plus, Command, Loader2, Upload, FileText, X,
  Building2, Briefcase, Link2, DollarSign, Calendar,
  StickyNote, AlignLeft, ChevronDown,
} from 'lucide-react';
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
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useJobs } from '@/hooks/useJobs';
import { JobStatus, JobSource, STATUS_CONFIG, SOURCE_CONFIG } from '@/types/job';

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

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs uppercase tracking-wider text-muted-foreground/70 font-medium">
      {children}
    </p>
  );
}

export function QuickAddJobForm({ trigger }: QuickAddJobFormProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [showOptional, setShowOptional] = useState(false);
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
      setShowOptional(false);
      setResumeFile(null);
    }
  };

  const statusValue = watch('status');
  const sourceValue = watch('source');

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

      <DialogContent className="sm:max-w-[520px] p-0 gap-0 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header — fixed */}
        <DialogHeader className="px-6 pt-6 pb-5 border-b border-border/30 shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted shrink-0">
              <Briefcase className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <DialogTitle className="text-base font-semibold text-foreground">
                Add New Job
              </DialogTitle>
              <p className="text-sm text-muted-foreground mt-0.5">
                Track a new application
              </p>
            </div>
          </div>
        </DialogHeader>

        {/* Scrollable body */}
        <ScrollArea className="flex-1 min-h-0">
          <form id="add-job-form" onSubmit={handleSubmit(onSubmit)}>
            <div className="px-6 py-5 space-y-6">

              {/* ── Core Info ── */}
              <section className="space-y-3">
                <SectionLabel>Job Info</SectionLabel>

                <div className="space-y-1.5">
                  <Label htmlFor="company_name" className="flex items-center gap-1.5 text-sm text-foreground/80">
                    <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                    Company <span className="text-destructive/60 ml-0.5">*</span>
                  </Label>
                  <Input
                    id="company_name"
                    placeholder="e.g., Google"
                    {...register('company_name')}
                    autoFocus
                    className="bg-muted/20 border-border/40 focus-visible:ring-1"
                  />
                  {errors.company_name && (
                    <p className="text-xs text-destructive">{errors.company_name.message}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="job_title" className="flex items-center gap-1.5 text-sm text-foreground/80">
                    <Briefcase className="h-3.5 w-3.5 text-muted-foreground" />
                    Job Title <span className="text-destructive/60 ml-0.5">*</span>
                  </Label>
                  <Input
                    id="job_title"
                    placeholder="e.g., Senior Software Engineer"
                    {...register('job_title')}
                    className="bg-muted/20 border-border/40 focus-visible:ring-1"
                  />
                  {errors.job_title && (
                    <p className="text-xs text-destructive">{errors.job_title.message}</p>
                  )}
                </div>
              </section>

              <Separator className="bg-border/30" />

              {/* ── Status ── */}
              <section className="space-y-3">
                <SectionLabel>Application Status</SectionLabel>
                <Select
                  value={statusValue}
                  onValueChange={(value) => setValue('status', value as JobStatus)}
                >
                  <SelectTrigger className="bg-muted/20 border-border/40 focus:ring-1">
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
              </section>

              <Separator className="bg-border/30" />

              {/* ── Resume ── */}
              <section className="space-y-2.5">
                <SectionLabel>Resume</SectionLabel>
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
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted/60">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                      </div>
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
                        className="mt-1 text-xs border-border/40 bg-muted/30 hover:bg-muted/50"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <Upload className="mr-1.5 h-3.5 w-3.5" />
                        Choose File
                      </Button>
                    </div>
                  </div>
                )}
              </section>

              <Separator className="bg-border/30" />

              {/* ── Job Description ── */}
              <section className="space-y-2.5">
                <SectionLabel>
                  <span className="flex items-center gap-1.5">
                    <AlignLeft className="h-3 w-3" />
                    Job Description
                  </span>
                </SectionLabel>
                <Textarea
                  id="job_description"
                  placeholder="Paste or type the job description..."
                  {...register('job_description')}
                  rows={4}
                  className="bg-muted/20 border-border/40 text-sm placeholder:text-muted-foreground/40 resize-y focus-visible:ring-1"
                />
              </section>

              <Separator className="bg-border/30" />

              {/* ── Notes ── */}
              <section className="space-y-2.5">
                <SectionLabel>
                  <span className="flex items-center gap-1.5">
                    <StickyNote className="h-3 w-3" />
                    Notes
                  </span>
                </SectionLabel>
                <Textarea
                  id="notes"
                  placeholder="Any additional notes or reminders..."
                  {...register('notes')}
                  rows={3}
                  className="bg-muted/20 border-border/40 text-sm placeholder:text-muted-foreground/40 resize-y focus-visible:ring-1"
                />
              </section>

              <Separator className="bg-border/30" />

              {/* ── Optional fields (collapsible) ── */}
              <section className="space-y-3">
                <button
                  type="button"
                  onClick={() => setShowOptional(!showOptional)}
                  className="flex items-center justify-between w-full group"
                >
                  <SectionLabel>More Details</SectionLabel>
                  <ChevronDown
                    className={`h-4 w-4 text-muted-foreground/50 transition-transform duration-200 ${showOptional ? 'rotate-180' : ''}`}
                  />
                </button>

                {showOptional && (
                  <div className="space-y-4 pt-1">
                    <div className="space-y-1.5">
                      <Label htmlFor="job_url" className="flex items-center gap-1.5 text-sm text-foreground/80">
                        <Link2 className="h-3.5 w-3.5 text-muted-foreground" />
                        Job URL
                      </Label>
                      <Input
                        id="job_url"
                        type="url"
                        placeholder="https://..."
                        {...register('job_url')}
                        className="bg-muted/20 border-border/40 focus-visible:ring-1"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-sm text-foreground/80">Source</Label>
                      <Select
                        value={sourceValue || ''}
                        onValueChange={(value) => setValue('source', value as JobSource)}
                      >
                        <SelectTrigger className="bg-muted/20 border-border/40 focus:ring-1">
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

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label htmlFor="salary_min" className="flex items-center gap-1.5 text-sm text-foreground/80">
                          <DollarSign className="h-3.5 w-3.5 text-muted-foreground" />
                          Salary Min
                        </Label>
                        <Input
                          id="salary_min"
                          type="number"
                          placeholder="100,000"
                          {...register('salary_min')}
                          className="bg-muted/20 border-border/40 focus-visible:ring-1"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="salary_max" className="flex items-center gap-1.5 text-sm text-foreground/80">
                          <DollarSign className="h-3.5 w-3.5 text-muted-foreground" />
                          Salary Max
                        </Label>
                        <Input
                          id="salary_max"
                          type="number"
                          placeholder="150,000"
                          {...register('salary_max')}
                          className="bg-muted/20 border-border/40 focus-visible:ring-1"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="applied_date" className="flex items-center gap-1.5 text-sm text-foreground/80">
                        <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                        Date Applied
                      </Label>
                      <Input
                        id="applied_date"
                        type="date"
                        {...register('applied_date')}
                        className="bg-muted/20 border-border/40 focus-visible:ring-1"
                      />
                    </div>
                  </div>
                )}
              </section>

            </div>
          </form>
        </ScrollArea>

        {/* Footer — fixed */}
        <div className="px-6 py-4 border-t border-border/30 flex justify-end gap-2 shrink-0 bg-card">
          <Button type="button" variant="outline" className="border-border/40" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button type="submit" form="add-job-form" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Add Job
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
