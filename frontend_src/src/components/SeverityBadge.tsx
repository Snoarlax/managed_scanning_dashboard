import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface SeverityBadgeProps {
  severity: 'critical' | 'high' | 'medium' | 'low' | 'informational';
  count: number;
  className?: string;
}

const severityConfig = {
  critical: {
    label: 'Critical',
    colorClass: 'bg-critical text-critical-foreground hover:bg-critical/90',
  },
  high: {
    label: 'High',
    colorClass: 'bg-high text-high-foreground hover:bg-high/90',
  },
  medium: {
    label: 'Medium',
    colorClass: 'bg-medium text-medium-foreground hover:bg-medium/90',
  },
  low: {
    label: 'Low',
    colorClass: 'bg-low text-low-foreground hover:bg-low/90',
  },
  informational: {
    label: 'Info',
    colorClass: 'bg-info text-info-foreground hover:bg-info/90',
  },
};

export function SeverityBadge({ severity, count, className }: SeverityBadgeProps) {
  const config = severityConfig[severity];

  if (count === 0) {
    return (
      <Badge variant="outline" className={cn('font-mono text-xs', className)}>
        {config.label}: 0
      </Badge>
    );
  }

  return (
    <Badge className={cn('font-mono text-xs', config.colorClass, className)}>
      {config.label}: {count}
    </Badge>
  );
}
