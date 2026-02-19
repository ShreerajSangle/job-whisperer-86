import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { JobStatus, STATUS_CONFIG, VALID_TRANSITIONS } from '@/types/job';
import { ChevronDown } from 'lucide-react';

interface StatusBadgeProps {
  status: JobStatus;
  onStatusChange?: (newStatus: JobStatus) => void;
  interactive?: boolean;
  size?: 'sm' | 'default';
}

export function StatusBadge({ status, onStatusChange, interactive = false, size = 'default' }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status];
  const validTransitions = VALID_TRANSITIONS[status];

  const badge = (
    <Badge
      className={`
        ${config.bgColor} ${config.color} ${config.borderColor}
        border cursor-pointer transition-all
        ${size === 'sm' ? 'text-xs px-2 py-0.5' : 'px-3 py-1'}
        ${interactive && validTransitions.length > 0 ? 'hover:opacity-80' : ''}
      `}
      variant="outline"
    >
      {config.label}
      {interactive && validTransitions.length > 0 && (
        <ChevronDown className="ml-1 h-3 w-3" />
      )}
    </Badge>
  );

  if (!interactive || !onStatusChange || validTransitions.length === 0) {
    return badge;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {badge}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-44">
        {validTransitions.map((nextStatus) => {
          const nextConfig = STATUS_CONFIG[nextStatus];
          return (
            <DropdownMenuItem
              key={nextStatus}
              onClick={() => onStatusChange(nextStatus)}
              className="cursor-pointer text-sm"
            >
              {nextConfig.label}
            </DropdownMenuItem>
          );
        })}
        {validTransitions.length === 0 && (
          <DropdownMenuItem disabled>No transitions available</DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
