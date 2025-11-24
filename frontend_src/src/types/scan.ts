export interface Vulnerability {
  critical: number;
  high: number;
  medium: number;
  low: number;
  informational: number;
}

export interface Scan {
  id: string;
  vendor: string;
  name: string;
  assetUri: string;
  assetId: string;
  client: string;
  vulnerabilities: Vulnerability;
  newVulnerabilities: Vulnerability;
  scanDate: string;
  scanFileUrl: string;
  tags: string[];
}

export interface Asset {
  id: string;
  name: string;
  uri: string;
  client: string;
  totalScans: number;
  lastScanned: string;
  vulnerabilities: Vulnerability;
  newVulnerabilities: Vulnerability;
  tags: string[];
}

export type SortField = 'vendor' | 'name' | 'assetUri' | 'client' | 'scanDate' | 'totalVulnerabilities';
export type SortOrder = 'asc' | 'desc';
