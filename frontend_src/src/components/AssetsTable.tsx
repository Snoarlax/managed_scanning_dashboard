import { Link } from 'react-router-dom';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { ExternalLink, Settings2 } from 'lucide-react';
import { Asset } from '@/types/scan';
import { useState } from 'react';
import { VulnerabilitiesDisplay } from './VulnerabilitiesDisplay';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

type SortField = 'name' | 'uri' | 'client' | 'totalScans' | 'lastScanned';
type SortOrder = 'asc' | 'desc';

interface AssetsTableProps {
  assets: Asset[];
  vulnerabilitiesVisibility: number;
  newVulnerabilitiesVisibility: number;
  selectedAssets: Set<string>;
  onSelectAsset: (assetId: string) => void;
  onSelectAll: (selected: boolean) => void;
}

interface ColumnVisibility {
  name: boolean;
  client: boolean;
  uri: boolean;
  totalScans: boolean;
  lastScanned: boolean;
  vulnerabilities: boolean;
  newVulnerabilities: boolean;
  tags: boolean;
  actions: boolean;
}

export function AssetsTable({ 
  assets, 
  vulnerabilitiesVisibility, 
  newVulnerabilitiesVisibility,
  selectedAssets,
  onSelectAsset,
  onSelectAll,
}: AssetsTableProps) {
  const [sortField, setSortField] = useState<SortField>('lastScanned');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [columnVisibility, setColumnVisibility] = useState<ColumnVisibility>({
    name: true,
    client: true,
    uri: true,
    totalScans: true,
    lastScanned: true,
    vulnerabilities: true,
    newVulnerabilities: true,
    tags: true,
    actions: true,
  });

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const toggleColumn = (column: keyof ColumnVisibility) => {
    setColumnVisibility((prev) => ({
      ...prev,
      [column]: !prev[column],
    }));
  };

  const sortedAssets = [...assets].sort((a, b) => {
    let aValue: string | number = a[sortField];
    let bValue: string | number = b[sortField];

    if (sortField === 'lastScanned') {
      aValue = new Date(a.lastScanned).getTime();
      bValue = new Date(b.lastScanned).getTime();
    }

    if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <span className="text-muted-foreground">↕</span>;
    return <span>{sortOrder === 'asc' ? '↑' : '↓'}</span>;
  };

  return (
    <div className="rounded-lg border border-border bg-card">
      <div className="flex justify-end p-2 border-b border-border">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <Settings2 className="h-4 w-4" />
              Columns
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 bg-popover z-50">
            <DropdownMenuLabel>Toggle Columns</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuCheckboxItem
              checked={columnVisibility.name}
              onCheckedChange={() => toggleColumn('name')}
            >
              Name
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={columnVisibility.client}
              onCheckedChange={() => toggleColumn('client')}
            >
              Client
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={columnVisibility.uri}
              onCheckedChange={() => toggleColumn('uri')}
            >
              URI
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={columnVisibility.totalScans}
              onCheckedChange={() => toggleColumn('totalScans')}
            >
              Total Scans
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={columnVisibility.lastScanned}
              onCheckedChange={() => toggleColumn('lastScanned')}
            >
              Last Scanned
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={columnVisibility.vulnerabilities}
              onCheckedChange={() => toggleColumn('vulnerabilities')}
            >
              Vulnerabilities
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={columnVisibility.newVulnerabilities}
              onCheckedChange={() => toggleColumn('newVulnerabilities')}
            >
              New Vulnerabilities
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={columnVisibility.tags}
              onCheckedChange={() => toggleColumn('tags')}
            >
              Tags
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={columnVisibility.actions}
              onCheckedChange={() => toggleColumn('actions')}
            >
              Actions
            </DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">
              <Checkbox
                checked={assets.length > 0 && selectedAssets.size === assets.length}
                onCheckedChange={onSelectAll}
                aria-label="Select all assets"
              />
            </TableHead>
            {columnVisibility.name && (
              <TableHead
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort('name')}
              >
                <div className="flex items-center gap-2">
                  Name <SortIcon field="name" />
                </div>
              </TableHead>
            )}
            {columnVisibility.client && (
              <TableHead
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort('client')}
              >
                <div className="flex items-center gap-2">
                  Client <SortIcon field="client" />
                </div>
              </TableHead>
            )}
            {columnVisibility.uri && (
              <TableHead
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort('uri')}
              >
                <div className="flex items-center gap-2">
                  URI <SortIcon field="uri" />
                </div>
              </TableHead>
            )}
            {columnVisibility.totalScans && (
              <TableHead
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort('totalScans')}
              >
                <div className="flex items-center gap-2">
                  Total Scans <SortIcon field="totalScans" />
                </div>
              </TableHead>
            )}
            {columnVisibility.lastScanned && (
              <TableHead
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort('lastScanned')}
              >
                <div className="flex items-center gap-2">
                  Last Scanned <SortIcon field="lastScanned" />
                </div>
              </TableHead>
            )}
            {columnVisibility.vulnerabilities && (
              <TableHead>
                Vulnerabilities
              </TableHead>
            )}
            {columnVisibility.newVulnerabilities && (
              <TableHead>
                New Vulnerabilities
              </TableHead>
            )}
            {columnVisibility.tags && <TableHead>Tags</TableHead>}
            {columnVisibility.actions && <TableHead className="text-right">Actions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedAssets.map((asset) => (
            <TableRow key={asset.id}>
              <TableCell>
                <Checkbox
                  checked={selectedAssets.has(asset.id)}
                  onCheckedChange={() => onSelectAsset(asset.id)}
                  aria-label={`Select ${asset.name}`}
                />
              </TableCell>
              {columnVisibility.name && <TableCell className="commercial-data">{asset.name}</TableCell>}
              {columnVisibility.client && <TableCell className="commercial-data">{asset.client}</TableCell>}
              {columnVisibility.uri && (
                <TableCell className="font-mono text-sm break-all max-w-md">
                  {asset.uri}
                </TableCell>
              )}
              {columnVisibility.totalScans && <TableCell>{asset.totalScans}</TableCell>}
              {columnVisibility.lastScanned && <TableCell>{asset.lastScanned}</TableCell>}
              {columnVisibility.vulnerabilities && (
                <TableCell>
                  <VulnerabilitiesDisplay 
                    vulnerabilities={asset.vulnerabilities}
                    visibilityLevel={vulnerabilitiesVisibility}
                  />
                </TableCell>
              )}
              {columnVisibility.newVulnerabilities && (
                <TableCell>
                  <VulnerabilitiesDisplay 
                    vulnerabilities={asset.newVulnerabilities}
                    visibilityLevel={newVulnerabilitiesVisibility}
                  />
                </TableCell>
              )}
              {columnVisibility.tags && (
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {(asset.tags || []).map((tag) => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </TableCell>
              )}
              {columnVisibility.actions && (
                <TableCell className="text-right">
                  <Link to={`/asset/${asset.id}`}>
                    <Button variant="outline" size="sm" className="gap-2">
                      View Details
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  </Link>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
