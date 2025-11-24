import { useState } from 'react';
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
import { Eye, ExternalLink, Settings2 } from 'lucide-react';
import { Scan, SortField, SortOrder } from '@/types/scan';
import { VulnerabilitiesDisplay } from './VulnerabilitiesDisplay';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ScansTableProps {
  scans: Scan[];
  vulnerabilitiesVisibility: number;
}

interface ColumnVisibility {
  vendor: boolean;
  name: boolean;
  client: boolean;
  assetUri: boolean;
  vulnerabilities: boolean;
  scanDate: boolean;
  tags: boolean;
  actions: boolean;
}

export function ScansTable({ scans, vulnerabilitiesVisibility }: ScansTableProps) {
  const [sortField, setSortField] = useState<SortField>('scanDate');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [columnVisibility, setColumnVisibility] = useState<ColumnVisibility>({
    vendor: true,
    name: true,
    client: true,
    assetUri: true,
    vulnerabilities: true,
    scanDate: true,
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

  const sortedScans = [...scans].sort((a, b) => {
    let aValue: any;
    let bValue: any;

    switch (sortField) {
      case 'totalVulnerabilities':
        // Sort by severity priority: critical > high > medium > low > info
        aValue =
          a.vulnerabilities.critical * 10000 +
          a.vulnerabilities.high * 1000 +
          a.vulnerabilities.medium * 100 +
          a.vulnerabilities.low * 10 +
          a.vulnerabilities.informational;
        bValue =
          b.vulnerabilities.critical * 10000 +
          b.vulnerabilities.high * 1000 +
          b.vulnerabilities.medium * 100 +
          b.vulnerabilities.low * 10 +
          b.vulnerabilities.informational;
        break;
      case 'scanDate':
        aValue = new Date(a.scanDate).getTime();
        bValue = new Date(b.scanDate).getTime();
        break;
      default:
        aValue = a[sortField];
        bValue = b[sortField];
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
              checked={columnVisibility.vendor}
              onCheckedChange={() => toggleColumn('vendor')}
            >
              Vendor
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={columnVisibility.name}
              onCheckedChange={() => toggleColumn('name')}
            >
              Scan Name
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={columnVisibility.client}
              onCheckedChange={() => toggleColumn('client')}
            >
              Client
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={columnVisibility.assetUri}
              onCheckedChange={() => toggleColumn('assetUri')}
            >
              Asset URI
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={columnVisibility.vulnerabilities}
              onCheckedChange={() => toggleColumn('vulnerabilities')}
            >
              Vulnerabilities
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={columnVisibility.scanDate}
              onCheckedChange={() => toggleColumn('scanDate')}
            >
              Scan Date
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
            {columnVisibility.vendor && (
              <TableHead
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort('vendor')}
              >
                <div className="flex items-center gap-2">
                  Vendor <SortIcon field="vendor" />
                </div>
              </TableHead>
            )}
            {columnVisibility.name && <TableHead>Scan Name</TableHead>}
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
            {columnVisibility.assetUri && (
              <TableHead
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort('assetUri')}
              >
                <div className="flex items-center gap-2">
                  Asset URI <SortIcon field="assetUri" />
                </div>
              </TableHead>
            )}
            {columnVisibility.vulnerabilities && (
              <TableHead 
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort('totalVulnerabilities')}
              >
                <div className="flex items-center gap-2">
                  Vulnerabilities <SortIcon field="totalVulnerabilities" />
                </div>
              </TableHead>
            )}
            {columnVisibility.scanDate && (
              <TableHead
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort('scanDate')}
              >
                <div className="flex items-center gap-2">
                  Scan Date <SortIcon field="scanDate" />
                </div>
              </TableHead>
            )}
            {columnVisibility.tags && <TableHead>Tags</TableHead>}
            {columnVisibility.actions && <TableHead className="text-right">Actions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedScans.map((scan) => (
            <TableRow key={scan.id}>
              {columnVisibility.vendor && <TableCell className="commercial-data">{scan.vendor}</TableCell>}
              {columnVisibility.name && <TableCell className="commercial-data">{scan.name}</TableCell>}
              {columnVisibility.client && <TableCell className="commercial-data">{scan.client}</TableCell>}
              {columnVisibility.assetUri && (
                <TableCell className="font-mono text-sm break-all max-w-md">
                  <Link to={`/asset/${scan.assetId}`} className="hover:underline text-primary">
                    {scan.assetUri}
                  </Link>
                </TableCell>
              )}
              {columnVisibility.vulnerabilities && (
                <TableCell>
                  <VulnerabilitiesDisplay 
                    vulnerabilities={scan.vulnerabilities} 
                    visibilityLevel={vulnerabilitiesVisibility}
                  />
                </TableCell>
              )}
              {columnVisibility.scanDate && <TableCell>{scan.scanDate}</TableCell>}
              {columnVisibility.tags && (
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {(scan.tags || []).map((tag) => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </TableCell>
              )}
              {columnVisibility.actions && (
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Link to={`/scan/${scan.id}`}>
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>
                    <a href={scan.scanFileUrl} target="_blank" rel="noopener noreferrer">
                      <Button variant="outline" size="sm">
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </a>
                  </div>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
