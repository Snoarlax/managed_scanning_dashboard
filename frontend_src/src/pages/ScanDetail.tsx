import { useQuery } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import { scanApiService } from '@/services/scanApi';
import { SeverityBadge } from '@/components/SeverityBadge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, ExternalLink, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';

const ScanDetail = () => {
  const { id } = useParams();

  const { data: scan, isLoading } = useQuery({
    queryKey: ['scan', id],
    queryFn: () => scanApiService.fetchScanById(id!),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="container mx-auto py-6 px-4">
        <div className="flex h-64 items-center justify-center">
          <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (!scan) {
    return (
      <div className="container mx-auto py-6 px-4">
        <div className="flex h-64 items-center justify-center">
          <div className="text-center">
            <p className="text-lg font-medium">Scan not found</p>
            <Link to="/scans">
              <Button variant="outline" className="mt-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Scans
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const totalVulnerabilities =
    scan.vulnerabilities.critical +
    scan.vulnerabilities.high +
    scan.vulnerabilities.medium +
    scan.vulnerabilities.low +
    scan.vulnerabilities.informational;

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="mb-6">
        <Link to="/scans">
          <Button variant="ghost" className="mb-4 -ml-2">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Scans
          </Button>
        </Link>
        <h2 className="text-2xl font-bold tracking-tight">{scan.name}</h2>
        <p className="text-sm text-muted-foreground">Scan details and vulnerability overview</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Scan Information</CardTitle>
            <CardDescription>Basic details about this security scan</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Vendor</p>
              <p className="text-lg font-semibold">{scan.vendor}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Asset URI</p>
              <code className="text-sm bg-muted px-2 py-1 rounded">{scan.assetUri}</code>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Scan Date</p>
              <p className="text-base">
                {format(new Date(scan.scanDate), 'MMMM d, yyyy')} at{' '}
                {format(new Date(scan.scanDate), 'HH:mm:ss')}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">Scan Report</p>
              <Button variant="outline" asChild>
                <a href={scan.scanFileUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View Report
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Vulnerabilities</CardTitle>
            <CardDescription>
              Total vulnerabilities found: {totalVulnerabilities}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Critical</span>
                <SeverityBadge severity="critical" count={scan.vulnerabilities.critical} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">High</span>
                <SeverityBadge severity="high" count={scan.vulnerabilities.high} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Medium</span>
                <SeverityBadge severity="medium" count={scan.vulnerabilities.medium} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Low</span>
                <SeverityBadge severity="low" count={scan.vulnerabilities.low} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Informational</span>
                <SeverityBadge
                  severity="informational"
                  count={scan.vulnerabilities.informational}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ScanDetail;
