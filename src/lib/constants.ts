export const NOTE_TEMPLATES = [
  { emoji: '📞', text: 'Recruiter called, next round is {round}' },
  { emoji: '📧', text: 'Sent follow-up email asking about timeline' },
  { emoji: '💬', text: 'Received feedback: {feedback}' },
  { emoji: '⏰', text: 'Remember to check on this application' },
  { emoji: '📝', text: 'Glassdoor reviews mention {concern}' },
];

export const SALARY_CURRENCIES = [
  { value: 'USD', label: 'USD ($)' },
  { value: 'EUR', label: 'EUR (€)' },
  { value: 'GBP', label: 'GBP (£)' },
  { value: 'CAD', label: 'CAD ($)' },
  { value: 'AUD', label: 'AUD ($)' },
];

export const KEYBOARD_SHORTCUTS = {
  ADD_JOB: 'k',
} as const;
