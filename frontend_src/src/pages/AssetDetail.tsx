import { useQuery } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import { scanApiService } from '@/services/scanApi';
import { ScansTable } from '@/components/ScansTable';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, RefreshCw } from 'lucide-react';

const AssetDetail = () => {
  const { id } = useParams();

  const { data: asset, isLoading } = useQuery({
    queryKey: ['asset', id],
    queryFn: () => scanApiService.fetchAssetById(id!),
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

  if (!asset) {
    return (
      <div className="container mx-auto py-6 px-4">
        <div className="flex h-64 items-center justify-center">
          <div className="text-center">
            <p className="text-lg font-medium">Asset not found</p>
            <Link to="/assets">
              <Button variant="outline" className="mt-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Assets
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="mb-6">
        <Link to="/assets">
          <Button variant="ghost" className="mb-4 -ml-2">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Assets
          </Button>
        </Link>
        <h2 className="text-2xl font-bold tracking-tight">{asset.name}</h2>
        <p className="text-sm text-muted-foreground">Asset details and scan history</p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Asset Information</CardTitle>
          <CardDescription>Basic details about this asset</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Asset URI</p>
            <code className="text-sm bg-muted px-2 py-1 rounded">{asset.uri}</code>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Scans</p>
              <p className="text-xl font-semibold">{asset.totalScans}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Last Scanned</p>
              <p className="text-base font-medium">{asset.lastScanned}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">Recent Scans</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Security scan history for this asset
        </p>
      </div>

      {asset.scans && asset.scans.length > 0 ? (
        <ScansTable 
          scans={asset.scans} 
          vulnerabilitiesVisibility={0}
        />
      ) : (
        <div className="flex h-48 items-center justify-center rounded-lg border border-border bg-card">
          <div className="text-center">
            <p className="text-base font-medium">No scans found</p>
            <p className="text-sm text-muted-foreground">
              Scan data for this asset will appear here
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssetDetail;
