export type JobStatus = 'saved' | 'applied' | 'interviewing' | 'offered' | 'accepted' | 'rejected' | 'withdrawn';
export type JobSource = 'linkedin' | 'indeed' | 'referral' | 'company_site' | 'recruiter' | 'other';
export type NoteCategory = 'general' | 'call' | 'email' | 'feedback' | 'reminder';
export type DocumentType = 'resume' | 'cover_letter' | 'offer_letter' | 'assessment' | 'feedback' | 'other';

export interface Job {
  id: string;
  user_id: string;
  company_name: string;
  job_title: string;
  job_url?: string | null;
  status: JobStatus;
  source?: JobSource | null;
  salary_min?: number | null;
  salary_max?: number | null;
  currency?: string | null;
  location?: string | null;
  applied_date?: string | null;
  deadline_date?: string | null;
  notes?: string | null;
  tags?: string[];
  created_at: string;
  updated_at: string;
}

export interface JobNote {
  id: string;
  job_id: string;
  user_id: string;
  content: string;
  category: NoteCategory;
  created_at: string;
  updated_at?: string | null;
}

export interface JobStatusHistory {
  id: string;
  job_id: string;
  user_id: string;
  from_status: JobStatus | null;
  to_status: JobStatus;
  changed_at: string;
  reason?: string | null;
}

export interface JobDocument {
  id: string;
  job_id: string;
  user_id: string;
  file_name: string;
  file_path: string;
  file_size?: number | null;
  document_type: DocumentType;
  is_primary?: boolean | null;
  uploaded_at: string;
}

export const STATUS_CONFIG: Record<JobStatus, {
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
  icon: string;
}> = {
  saved: {
    label: 'Saved',
    color: 'text-slate-700 dark:text-slate-300',
    bgColor: 'bg-slate-100 dark:bg-slate-800',
    borderColor: 'border-slate-200 dark:border-slate-700',
    icon: '📑'
  },
  applied: {
    label: 'Applied',
    color: 'text-blue-700 dark:text-blue-300',
    bgColor: 'bg-blue-50 dark:bg-blue-900/30',
    borderColor: 'border-blue-200 dark:border-blue-800',
    icon: '📤'
  },
  interviewing: {
    label: 'Interviewing',
    color: 'text-violet-700 dark:text-violet-300',
    bgColor: 'bg-violet-50 dark:bg-violet-900/30',
    borderColor: 'border-violet-200 dark:border-violet-800',
    icon: '💬'
  },
  offered: {
    label: 'Offered',
    color: 'text-emerald-700 dark:text-emerald-300',
    bgColor: 'bg-emerald-50 dark:bg-emerald-900/30',
    borderColor: 'border-emerald-200 dark:border-emerald-800',
    icon: '🎉'
  },
  accepted: {
    label: 'Accepted',
    color: 'text-green-700 dark:text-green-300',
    bgColor: 'bg-green-50 dark:bg-green-900/30',
    borderColor: 'border-green-200 dark:border-green-800',
    icon: '✅'
  },
  rejected: {
    label: 'Rejected',
    color: 'text-red-700 dark:text-red-300',
    bgColor: 'bg-red-50 dark:bg-red-900/30',
    borderColor: 'border-red-200 dark:border-red-800',
    icon: '❌'
  },
  withdrawn: {
    label: 'Withdrawn',
    color: 'text-gray-600 dark:text-gray-400',
    bgColor: 'bg-gray-100 dark:bg-gray-800',
    borderColor: 'border-gray-200 dark:border-gray-700',
    icon: '↩️'
  }
};

export const SOURCE_CONFIG: Record<JobSource, {
  label: string;
  color: string;
  bgColor: string;
}> = {
  linkedin: { label: 'LinkedIn', color: 'text-blue-600', bgColor: 'bg-blue-100' },
  indeed: { label: 'Indeed', color: 'text-indigo-600', bgColor: 'bg-indigo-100' },
  referral: { label: 'Referral', color: 'text-green-600', bgColor: 'bg-green-100' },
  company_site: { label: 'Company Site', color: 'text-purple-600', bgColor: 'bg-purple-100' },
  recruiter: { label: 'Recruiter', color: 'text-amber-600', bgColor: 'bg-amber-100' },
  other: { label: 'Other', color: 'text-gray-600', bgColor: 'bg-gray-100' }
};

export const VALID_TRANSITIONS: Record<JobStatus, JobStatus[]> = {
  saved: ['applied', 'rejected', 'withdrawn'],
  applied: ['interviewing', 'rejected', 'withdrawn'],
  interviewing: ['offered', 'rejected', 'withdrawn'],
  offered: ['accepted', 'rejected', 'withdrawn'],
  accepted: [],
  rejected: ['applied'],
  withdrawn: ['applied']
};

export const NOTE_CATEGORY_CONFIG: Record<NoteCategory, {
  label: string;
  color: string;
  bgColor: string;
  icon: string;
}> = {
  general: { label: 'General', color: 'text-slate-600', bgColor: 'bg-slate-100', icon: '📝' },
  call: { label: 'Call', color: 'text-blue-600', bgColor: 'bg-blue-100', icon: '📞' },
  email: { label: 'Email', color: 'text-violet-600', bgColor: 'bg-violet-100', icon: '📧' },
  feedback: { label: 'Feedback', color: 'text-orange-600', bgColor: 'bg-orange-100', icon: '💬' },
  reminder: { label: 'Reminder', color: 'text-red-600', bgColor: 'bg-red-100', icon: '⏰' }
};
