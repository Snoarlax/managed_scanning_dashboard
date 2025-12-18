from pydantic import BaseModel, ConfigDict
from typing import List, Optional

class VulnerabilityCounts(BaseModel):
    critical: int
    high: int
    medium: int
    low: int
    informational: int

class Scan(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: str
    vendor: str
    name: str
    assetUri: str
    assetId: str
    client: str
    vulnerabilities: VulnerabilityCounts
    newVulnerabilities: VulnerabilityCounts
    scanDate: str
    scanFileUrl: Optional[str] = None
    tags: List[str]

class Asset(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    name: str
    uri: str
    client: str
    totalScans: int
    lastScanned: str
    vulnerabilities: VulnerabilityCounts
    newVulnerabilities: VulnerabilityCounts
    tags: List[str]

class AssetDetail(Asset):
    scans: List[Scan]
