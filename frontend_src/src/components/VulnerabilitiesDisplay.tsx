import { SeverityBadge } from "./SeverityBadge";
import { Vulnerability } from "@/types/scan";

interface VulnerabilitiesDisplayProps {
  vulnerabilities: Vulnerability;
  visibilityLevel?: number; // 0: all, 1: no info, 2: no low/info, 3: no medium/low/info, 4: critical only
}

export function VulnerabilitiesDisplay({ vulnerabilities, visibilityLevel = 0 }: VulnerabilitiesDisplayProps) {
  const shouldShow = {
    critical: true,
    high: visibilityLevel <= 3,
    medium: visibilityLevel <= 2,
    low: visibilityLevel <= 1,
    informational: visibilityLevel == 0,
  };

  return (
    <div className="flex flex-wrap gap-1">
      {shouldShow.critical && <SeverityBadge severity="critical" count={vulnerabilities.critical} />}
      {shouldShow.high && <SeverityBadge severity="high" count={vulnerabilities.high} />}
      {shouldShow.medium && <SeverityBadge severity="medium" count={vulnerabilities.medium} />}
      {shouldShow.low && <SeverityBadge severity="low" count={vulnerabilities.low} />}
      {shouldShow.informational && <SeverityBadge severity="informational" count={vulnerabilities.informational} />}
    </div>
  );
}
