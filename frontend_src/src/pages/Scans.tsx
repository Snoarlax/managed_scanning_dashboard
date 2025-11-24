import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { scanApiService } from '@/services/scanApi';
import { ScansTable } from '@/components/ScansTable';
import { ScansFilters, FiltersState } from '@/components/ScansFilters';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Scan } from '@/types/scan';

const Scans = () => {
  const { toast } = useToast();
  const [filters, setFilters] = useState<FiltersState>({
    vendor: '',
    name: '',
    assetUri: '',
    client: '',
    tags: '',
    dateFrom: '',
    dateTo: '',
    vulnerabilitiesVisibility: 0,
  });

  const {
    data: scans,
    isLoading,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ['scans'],
    queryFn: () => scanApiService.fetchScans(),
    refetchInterval: 60000,
  });

  const handleRefresh = () => {
    refetch();
    toast({
      title: 'Refreshing scans',
      description: 'Fetching latest scan data...',
    });
  };

  const getFilteredScans = (): Scan[] => {
    if (!scans) return [];

    return scans.filter((scan) => {
      if (filters.vendor && !scan.vendor.toLowerCase().includes(filters.vendor.toLowerCase())) {
        return false;
      }
      if (filters.name && !scan.name.toLowerCase().includes(filters.name.toLowerCase())) {
        return false;
      }
      if (filters.client && !scan.client.toLowerCase().includes(filters.client.toLowerCase())) {
        return false;
      }
      if (
        filters.assetUri &&
        !scan.assetUri.toLowerCase().includes(filters.assetUri.toLowerCase())
      ) {
        return false;
      }
      if (filters.tags) {
        const hasTag = (scan.tags || []).some((tag) =>
          tag.toLowerCase().includes(filters.tags.toLowerCase())
        );
        if (!hasTag) return false;
      }
      if (filters.dateFrom) {
        const scanDate = new Date(scan.scanDate);
        const fromDate = new Date(filters.dateFrom);
        if (scanDate < fromDate) return false;
      }
      if (filters.dateTo) {
        const scanDate = new Date(scan.scanDate);
        const toDate = new Date(filters.dateTo);
        toDate.setHours(23, 59, 59, 999);
        if (scanDate > toDate) return false;
      }
      return true;
    });
  };

  const filteredScans = getFilteredScans();

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Security Scans</h2>
          <p className="text-sm text-muted-foreground">
            View and filter vulnerability scan results
          </p>
        </div>
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

      <ScansFilters filters={filters} onFilterChange={setFilters} />

      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="text-center">
            <RefreshCw className="mx-auto h-8 w-8 animate-spin text-muted-foreground" />
            <p className="mt-4 text-sm text-muted-foreground">Loading scan data...</p>
          </div>
        </div>
      ) : filteredScans.length > 0 ? (
        <>
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing {filteredScans.length} of {scans?.length || 0}{' '}
              {filteredScans.length === 1 ? 'scan' : 'scans'}
            </p>
          </div>
          <ScansTable 
            scans={filteredScans} 
            vulnerabilitiesVisibility={filters.vulnerabilitiesVisibility}
          />
        </>
      ) : (
        <div className="flex h-64 items-center justify-center rounded-lg border border-border bg-card">
          <div className="text-center">
            <p className="text-lg font-medium">No scans found</p>
            <p className="text-sm text-muted-foreground">
              {scans && scans.length > 0
                ? 'Try adjusting your filters'
                : 'Scan data will appear here once available'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Scans;
