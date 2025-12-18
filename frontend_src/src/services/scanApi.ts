import { Scan, Vulnerability } from '@/types/scan';

// Point to the local FastAPI server
const API_BASE_URL = 'http://localhost:8000';
const API_VERSION = 'v1';

/**
 * Extensible API service for scan data
 * Communicates with the Python FastAPI backend
 */
class ScanApiService {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  /**
   * Fetch all scans from the API
   */
  async fetchScans(): Promise<Scan[]> {
    try {
      const response = await fetch(`${this.baseUrl}/${API_VERSION}/scans`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();
      return this.transformApiResponse(data);
    } catch (error) {
      console.error('Error fetching scans:', error);
      // Return mock data for development if backend is unreachable
      return this.getMockScans();
    }
  }

  /**
   * Transform API response to match our internal Scan interface
   */
  private transformApiResponse(apiData: any): Scan[] {
    if (Array.isArray(apiData)) {
      return apiData.map((item: any) => ({
        id: item.id || item.scan_id,
        vendor: item.vendor || item.scanner_name,
        name: item.name || item.scan_name,
        assetUri: item.assetUri || item.asset_uri || item.target_url,
        assetId: item.assetId || item.asset_id || '',
        client: item.client || item.client_name || 'Unknown',
        vulnerabilities: {
          critical: item.vulnerabilities?.critical || item.vuln_critical || 0,
          high: item.vulnerabilities?.high || item.vuln_high || 0,
          medium: item.vulnerabilities?.medium || item.vuln_medium || 0,
          low: item.vulnerabilities?.low || item.vuln_low || 0,
          informational: item.vulnerabilities?.informational || item.vuln_info || 0,
        },
        newVulnerabilities: {
          critical: item.newVulnerabilities?.critical || item.new_vuln_critical || 0,
          high: item.newVulnerabilities?.high || item.new_vuln_high || 0,
          medium: item.newVulnerabilities?.medium || item.new_vuln_medium || 0,
          low: item.newVulnerabilities?.low || item.new_vuln_low || 0,
          informational: item.newVulnerabilities?.informational || item.new_vuln_info || 0,
        },
        scanDate: item.scanDate || item.scan_date || item.created_at,
        scanFileUrl: item.scanFileUrl || item.report_url || item.file_url,
        tags: item.tags || [],
      }));
    }
    
    return [];
  }

  /**
   * Fetch a single scan by ID
   */
  async fetchScanById(id: string): Promise<Scan | null> {
    try {
      const response = await fetch(`${this.baseUrl}/${API_VERSION}/scans/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();
      return this.transformApiResponse([data])[0] || null;
    } catch (error) {
      console.error('Error fetching scan:', error);
      return this.getMockScans().find((scan) => scan.id === id) || null;
    }
  }

  /**
   * Fetch all assets from the API
   */
  async fetchAssets(): Promise<Asset[]> {
    try {
      const response = await fetch(`${this.baseUrl}/${API_VERSION}/assets`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();
      return this.transformAssetResponse(data);
    } catch (error) {
      console.error('Error fetching assets:', error);
      return this.getMockAssets();
    }
  }

  /**
   * Fetch a single asset by ID with its scans
   */
  async fetchAssetById(id: string): Promise<AssetDetail | null> {
    try {
      const response = await fetch(`${this.baseUrl}/${API_VERSION}/assets/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();
      return this.transformAssetDetailResponse(data);
    } catch (error) {
      console.error('Error fetching asset:', error);
      return this.getMockAssetDetail(id);
    }
  }

  /**
   * Transform asset list API response
   */
  private transformAssetResponse(apiData: any): Asset[] {
    if (Array.isArray(apiData)) {
      return apiData.map((item: any) => ({
        id: item.id || item.asset_id,
        name: item.name || item.asset_name,
        uri: item.uri || item.asset_uri || item.url,
        client: item.client || item.client_name || 'Unknown',
        totalScans: item.totalScans || item.total_scans || item.scan_count || 0,
        lastScanned: item.lastScanned || item.last_scanned || item.last_scan_date || 'Never',
        vulnerabilities: {
          critical: item.vulnerabilities?.critical || item.vuln_critical || 0,
          high: item.vulnerabilities?.high || item.vuln_high || 0,
          medium: item.vulnerabilities?.medium || item.vuln_medium || 0,
          low: item.vulnerabilities?.low || item.vuln_low || 0,
          informational: item.vulnerabilities?.informational || item.vuln_info || 0,
        },
        newVulnerabilities: {
          critical: item.newVulnerabilities?.critical || item.new_vuln_critical || 0,
          high: item.newVulnerabilities?.high || item.new_vuln_high || 0,
          medium: item.newVulnerabilities?.medium || item.new_vuln_medium || 0,
          low: item.newVulnerabilities?.low || item.new_vuln_low || 0,
          informational: item.newVulnerabilities?.informational || item.new_vuln_info || 0,
        },
        tags: item.tags || [],
      }));
    }
    return [];
  }

  /**
   * Transform asset detail API response
   */
  private transformAssetDetailResponse(apiData: any): AssetDetail | null {
    if (!apiData) return null;

    return {
      id: apiData.id || apiData.asset_id,
      name: apiData.name || apiData.asset_name,
      uri: apiData.uri || apiData.asset_uri || apiData.url,
      client: apiData.client || apiData.client_name || 'Unknown',
      totalScans: apiData.totalScans || apiData.total_scans || apiData.scan_count || 0,
      lastScanned: apiData.lastScanned || apiData.last_scanned || apiData.last_scan_date || 'Never',
      vulnerabilities: {
        critical: apiData.vulnerabilities?.critical || apiData.vuln_critical || 0,
        high: apiData.vulnerabilities?.high || apiData.vuln_high || 0,
        medium: apiData.vulnerabilities?.medium || apiData.vuln_medium || 0,
        low: apiData.vulnerabilities?.low || apiData.vuln_low || 0,
        informational: apiData.vulnerabilities?.informational || apiData.vuln_info || 0,
      },
      newVulnerabilities: {
        critical: apiData.newVulnerabilities?.critical || apiData.new_vuln_critical || 0,
        high: apiData.newVulnerabilities?.high || apiData.new_vuln_high || 0,
        medium: apiData.newVulnerabilities?.medium || apiData.new_vuln_medium || 0,
        low: apiData.newVulnerabilities?.low || apiData.new_vuln_low || 0,
        informational: apiData.newVulnerabilities?.informational || apiData.new_vuln_info || 0,
      },
      tags: apiData.tags || [],
      scans: apiData.scans ? this.transformApiResponse(apiData.scans) : [],
    };
  }

  /**
   * Mock data for development and testing
   * Remove or replace this when your API is ready
   */
  private getMockScans(): Scan[] {
    return [
      {
        id: '1',
        vendor: 'Qualys',
        name: 'Production Web Application Scan',
        assetUri: 'https://app.example.com',
        assetId: 'asset-1',
        client: 'Acme Corporation',
        vulnerabilities: {
          critical: 3,
          high: 12,
          medium: 28,
          low: 15,
          informational: 42,
        },
        newVulnerabilities: {
          critical: 1,
          high: 3,
          medium: 5,
          low: 2,
          informational: 8,
        },
        scanDate: '2025-11-23T14:30:00Z',
        scanFileUrl: 'https://reports.example.com/scan-1.pdf',
        tags: ['production', 'web', 'quarterly'],
      },
      {
        id: '2',
        vendor: 'Nessus',
        name: 'Infrastructure Security Scan',
        assetUri: 'https://api.example.com',
        assetId: 'asset-2',
        client: 'TechStart Inc',
        vulnerabilities: {
          critical: 0,
          high: 5,
          medium: 18,
          low: 32,
          informational: 56,
        },
        newVulnerabilities: {
          critical: 0,
          high: 1,
          medium: 4,
          low: 6,
          informational: 12,
        },
        scanDate: '2025-11-22T09:15:00Z',
        scanFileUrl: 'https://reports.example.com/scan-2.pdf',
        tags: ['infrastructure', 'api', 'monthly'],
      },
      {
        id: '3',
        vendor: 'Burp Suite',
        name: 'API Penetration Test',
        assetUri: 'https://api.example.com/v1',
        assetId: 'asset-2',
        client: 'TechStart Inc',
        vulnerabilities: {
          critical: 1,
          high: 7,
          medium: 14,
          low: 8,
          informational: 23,
        },
        newVulnerabilities: {
          critical: 0,
          high: 2,
          medium: 3,
          low: 1,
          informational: 5,
        },
        scanDate: '2025-11-21T16:45:00Z',
        scanFileUrl: 'https://reports.example.com/scan-3.pdf',
        tags: ['api', 'pentest', 'compliance'],
      },
      {
        id: '4',
        vendor: 'OWASP ZAP',
        name: 'Weekly Automated Scan',
        assetUri: 'https://shop.example.com',
        assetId: 'asset-3',
        client: 'Global Retail Co',
        vulnerabilities: {
          critical: 5,
          high: 15,
          medium: 35,
          low: 22,
          informational: 67,
        },
        newVulnerabilities: {
          critical: 2,
          high: 4,
          medium: 7,
          low: 3,
          informational: 15,
        },
        scanDate: '2025-11-20T11:20:00Z',
        scanFileUrl: 'https://reports.example.com/scan-4.pdf',
        tags: ['automated', 'weekly', 'e-commerce'],
      },
      {
        id: '5',
        vendor: 'Acunetix',
        name: 'Compliance Security Assessment',
        assetUri: 'https://portal.example.com',
        assetId: 'asset-4',
        client: 'Acme Corporation',
        vulnerabilities: {
          critical: 2,
          high: 9,
          medium: 21,
          low: 18,
          informational: 45,
        },
        newVulnerabilities: {
          critical: 1,
          high: 2,
          medium: 4,
          low: 3,
          informational: 9,
        },
        scanDate: '2025-11-19T08:00:00Z',
        scanFileUrl: 'https://reports.example.com/scan-5.pdf',
        tags: ['compliance', 'sox', 'annual'],
      },
    ];
  }

  /**
   * Mock assets for development
   */
  private getMockAssets(): Asset[] {
    return [
      {
        id: 'asset-1',
        name: 'Production Web Application',
        uri: 'https://app.example.com',
        client: 'Acme Corporation',
        totalScans: 3,
        lastScanned: 'Nov 23, 2025',
        vulnerabilities: {
          critical: 3,
          high: 12,
          medium: 28,
          low: 15,
          informational: 42,
        },
        newVulnerabilities: {
          critical: 1,
          high: 3,
          medium: 5,
          low: 2,
          informational: 8,
        },
        tags: ['production', 'web', 'critical'],
      },
      {
        id: 'asset-2',
        name: 'API Gateway',
        uri: 'https://api.example.com',
        client: 'TechStart Inc',
        totalScans: 2,
        lastScanned: 'Nov 22, 2025',
        vulnerabilities: {
          critical: 1,
          high: 12,
          medium: 32,
          low: 40,
          informational: 73,
        },
        newVulnerabilities: {
          critical: 0,
          high: 3,
          medium: 7,
          low: 7,
          informational: 17,
        },
        tags: ['api', 'infrastructure', 'critical'],
      },
      {
        id: 'asset-3',
        name: 'Shopping Portal',
        uri: 'https://shop.example.com',
        client: 'Global Retail Co',
        totalScans: 1,
        lastScanned: 'Nov 20, 2025',
        vulnerabilities: {
          critical: 5,
          high: 15,
          medium: 35,
          low: 22,
          informational: 67,
        },
        newVulnerabilities: {
          critical: 2,
          high: 4,
          medium: 7,
          low: 3,
          informational: 15,
        },
        tags: ['e-commerce', 'production', 'pci-dss'],
      },
      {
        id: 'asset-4',
        name: 'Customer Portal',
        uri: 'https://portal.example.com',
        client: 'Acme Corporation',
        totalScans: 1,
        lastScanned: 'Nov 19, 2025',
        vulnerabilities: {
          critical: 2,
          high: 9,
          medium: 21,
          low: 18,
          informational: 45,
        },
        newVulnerabilities: {
          critical: 1,
          high: 2,
          medium: 4,
          low: 3,
          informational: 9,
        },
        tags: ['portal', 'customer-facing'],
      },
    ];
  }

  /**
   * Mock asset detail for development
   */
  private getMockAssetDetail(id: string): AssetDetail | null {
    const mockScans = this.getMockScans();
    const assetUriMap: Record<string, string> = {
      'asset-1': 'https://app.example.com',
      'asset-2': 'https://api.example.com',
      'asset-3': 'https://shop.example.com',
      'asset-4': 'https://portal.example.com',
    };

    const assetUri = assetUriMap[id];
    if (!assetUri) return null;

    const assetScans = mockScans.filter((scan) => scan.assetUri === assetUri);
    const assets = this.getMockAssets();
    const asset = assets.find((a) => a.id === id);

    if (!asset) return null;

    return {
      ...asset,
      scans: assetScans,
    };
  }

  /**
   * Update the base URL if needed
   */
  setBaseUrl(url: string): void {
    this.baseUrl = url;
  }
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

export interface AssetDetail extends Asset {
  scans: Scan[];
}

export const scanApiService = new ScanApiService();
