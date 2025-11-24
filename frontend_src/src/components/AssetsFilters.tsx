import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface AssetFiltersState {
  name: string;
  uri: string;
  client: string;
  tags: string;
  dateFrom: string;
  dateTo: string;
  vulnerabilitiesVisibility: number;
  newVulnerabilitiesVisibility: number;
}

interface AssetsFiltersProps {
  filters: AssetFiltersState;
  onFilterChange: (filters: AssetFiltersState) => void;
}

export function AssetsFilters({ filters, onFilterChange }: AssetsFiltersProps) {
  const handleChange = (field: keyof AssetFiltersState, value: string) => {
    onFilterChange({ ...filters, [field]: value });
  };

  const hasActiveFilters = Object.values(filters).some((value) => value !== '');

  const clearFilters = () => {
    onFilterChange({
      name: '',
      uri: '',
      client: '',
      tags: '',
      dateFrom: '',
      dateTo: '',
      vulnerabilitiesVisibility: 0,
      newVulnerabilitiesVisibility: 0,
    });
  };

  return (
    <div className="rounded-lg border border-border bg-card p-4 mb-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold">Filters</h3>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="h-7 px-2">
            <X className="h-3 w-3 mr-1" />
            Clear
          </Button>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-xs">
            Name
          </Label>
          <Input
            id="name"
            placeholder="Filter by name..."
            value={filters.name}
            onChange={(e) => handleChange('name', e.target.value)}
            className="h-8"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="uri" className="text-xs">
            URI
          </Label>
          <Input
            id="uri"
            placeholder="Filter by URI..."
            value={filters.uri}
            onChange={(e) => handleChange('uri', e.target.value)}
            className="h-8"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="client" className="text-xs">
            Client
          </Label>
          <Input
            id="client"
            placeholder="Filter by client..."
            value={filters.client}
            onChange={(e) => handleChange('client', e.target.value)}
            className="h-8"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="tags" className="text-xs">
            Tags
          </Label>
          <Input
            id="tags"
            placeholder="Filter by tags..."
            value={filters.tags}
            onChange={(e) => handleChange('tags', e.target.value)}
            className="h-8"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="dateFrom" className="text-xs">
            Last Scanned From
          </Label>
          <Input
            id="dateFrom"
            type="date"
            value={filters.dateFrom}
            onChange={(e) => handleChange('dateFrom', e.target.value)}
            className="h-8"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="dateTo" className="text-xs">
            Last Scanned To
          </Label>
          <Input
            id="dateTo"
            type="date"
            value={filters.dateTo}
            onChange={(e) => handleChange('dateTo', e.target.value)}
            className="h-8"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 mt-4">
        <div className="space-y-2">
          <Label htmlFor="vulnerabilities-visibility" className="text-xs">
            Vulnerabilities Display
          </Label>
          <select
            id="vulnerabilities-visibility"
            value={filters.vulnerabilitiesVisibility}
            onChange={(e) => handleChange('vulnerabilitiesVisibility', e.target.value)}
            className="flex h-8 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <option value="0">All Severities (C/H/M/L/I)</option>
            <option value="1">Critical, High, Medium, Low</option>
            <option value="2">Critical, High, Medium</option>
            <option value="3">Critical, High</option>
            <option value="4">Critical Only</option>
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="new-vulnerabilities-visibility" className="text-xs">
            New Vulnerabilities Display
          </Label>
          <select
            id="new-vulnerabilities-visibility"
            value={filters.newVulnerabilitiesVisibility}
            onChange={(e) => handleChange('newVulnerabilitiesVisibility', e.target.value)}
            className="flex h-8 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <option value="0">All Severities (C/H/M/L/I)</option>
            <option value="1">Critical, High, Medium, Low</option>
            <option value="2">Critical, High, Medium</option>
            <option value="3">Critical, High</option>
            <option value="4">Critical Only</option>
          </select>
        </div>
      </div>
    </div>
  );
}
