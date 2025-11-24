import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { scanApiService } from '@/services/scanApi';
import { Button } from '@/components/ui/button';
import { RefreshCw, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { AssetsTable } from '@/components/AssetsTable';
import { AssetsFilters, AssetFiltersState } from '@/components/AssetsFilters';
import { Asset } from '@/types/scan';

const Assets = () => {
  const { toast } = useToast();
  const [selectedAssets, setSelectedAssets] = useState<Set<string>>(new Set());
  const [filters, setFilters] = useState<AssetFiltersState>({
    name: '',
    uri: '',
    client: '',
    tags: '',
    dateFrom: '',
    dateTo: '',
    vulnerabilitiesVisibility: 0,
    newVulnerabilitiesVisibility: 0,
  });

  const {
    data: assets,
    isLoading,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ['assets'],
    queryFn: () => scanApiService.fetchAssets(),
    refetchInterval: 60000,
  });

  const handleRefresh = () => {
    refetch();
    toast({
      title: 'Refreshing assets',
      description: 'Fetching latest asset data...',
    });
  };

  const getFilteredAssets = (): Asset[] => {
    if (!assets) return [];

    return assets.filter((asset) => {
      if (filters.name && !asset.name.toLowerCase().includes(filters.name.toLowerCase())) {
        return false;
      }
      if (filters.uri && !asset.uri.toLowerCase().includes(filters.uri.toLowerCase())) {
        return false;
      }
      if (filters.client && !asset.client.toLowerCase().includes(filters.client.toLowerCase())) {
        return false;
      }
      if (filters.tags) {
        const hasTag = (asset.tags || []).some((tag) =>
          tag.toLowerCase().includes(filters.tags.toLowerCase())
        );
        if (!hasTag) return false;
      }
      if (filters.dateFrom) {
        const lastScannedDate = new Date(asset.lastScanned);
        const fromDate = new Date(filters.dateFrom);
        if (lastScannedDate < fromDate) return false;
      }
      if (filters.dateTo) {
        const lastScannedDate = new Date(asset.lastScanned);
        const toDate = new Date(filters.dateTo);
        toDate.setHours(23, 59, 59, 999);
        if (lastScannedDate > toDate) return false;
      }
      return true;
    });
  };

  const filteredAssets = getFilteredAssets();

  const handleSelectAsset = (assetId: string) => {
    setSelectedAssets((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(assetId)) {
        newSet.delete(assetId);
      } else {
        newSet.add(assetId);
      }
      return newSet;
    });
  };

  const handleSelectAll = (selected: boolean) => {
    if (selected) {
      setSelectedAssets(new Set(filteredAssets.map((asset) => asset.id)));
    } else {
      setSelectedAssets(new Set());
    }
  };

  const handleExport = async () => {
    if (selectedAssets.size === 0) return;

    try {
      toast({
        title: 'Exporting reports',
        description: 'Fetching scan data for selected assets...',
      });

      const exportData = await Promise.all(
        Array.from(selectedAssets).map(async (assetId) => {
          const assetDetail = await scanApiService.fetchAssetById(assetId);
          return assetDetail;
        })
      );

      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `asset-reports-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: 'Export successful',
        description: `Exported reports for ${selectedAssets.size} asset(s)`,
      });

      setSelectedAssets(new Set());
    } catch (error) {
      toast({
        title: 'Export failed',
        description: 'Failed to export asset reports',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Assets</h2>
          <p className="text-sm text-muted-foreground">
            All assets being monitored for security vulnerabilities
          </p>
        </div>
        <div className="flex gap-2">
          {selectedAssets.size > 0 && (
            <Button
              onClick={handleExport}
              variant="default"
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              Export ({selectedAssets.size})
            </Button>
          )}
          <Button
            onClick={handleRefresh}
            disabled={isRefetching}
            variant="outline"
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isRefetching ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      <AssetsFilters filters={filters} onFilterChange={setFilters} />

      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="text-center">
            <RefreshCw className="mx-auto h-8 w-8 animate-spin text-muted-foreground" />
            <p className="mt-4 text-sm text-muted-foreground">Loading assets...</p>
          </div>
        </div>
      ) : filteredAssets.length > 0 ? (
        <>
          <div className="mb-4">
            <p className="text-sm text-muted-foreground">
              Showing {filteredAssets.length} of {assets?.length || 0}{' '}
              {filteredAssets.length === 1 ? 'asset' : 'assets'}
            </p>
          </div>
          <AssetsTable 
            assets={filteredAssets} 
            vulnerabilitiesVisibility={filters.vulnerabilitiesVisibility}
            newVulnerabilitiesVisibility={filters.newVulnerabilitiesVisibility}
            selectedAssets={selectedAssets}
            onSelectAsset={handleSelectAsset}
            onSelectAll={handleSelectAll}
          />
        </>
      ) : (
        <div className="flex h-64 items-center justify-center rounded-lg border border-border bg-card">
          <div className="text-center">
            <p className="text-lg font-medium">No assets found</p>
            <p className="text-sm text-muted-foreground">
              {assets && assets.length > 0
                ? 'Try adjusting your filters'
                : 'Asset data will appear here once available from your API'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Assets;
