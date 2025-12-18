from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional, Dict, Any
import os
import math
from qualysdk.auth import BasicAuth
import qualysdk.was as qualys
from models import Scan, Asset, AssetDetail, VulnerabilityCounts
from dataclasses import asdict
# TODO: add response models in signature 
#
QUALYS_CREDENTIALS = {
    "username":os.getenv("QUALYS_USERNAME"),
    "password":os.getenv("QUALYS_PASSWORD"),
    "region":os.getenv("QUALYS_REGION")
}

qualys_auth = BasicAuth.from_dict(QUALYS_CREDENTIALS)

app = FastAPI(title="Managed Scanning Dashboard API")

# Enable CORS for the React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# TODO: move this to a helper functions file
def convert_qualys_scan_to_scan(qualys_scan) -> Scan:
    base_data = asdict(qualys_scan)
    base_data["id"] = str(base_data["id"])
    base_data["vendor"] = "Qualys"
    base_data["assetUri"] = base_data["target"]["webApp"]["url"]
    base_data["assetId"] = base_data["target"]["webApp"]["id"]
    base_data["client"] = "N/A"
    base_data["vulnerabilities"] = VulnerabilityCounts(
        critical=0,
        high=0,
        medium=0,
        low=0,
        informational=0,
    )
    base_data["newVulnerabilities"] = VulnerabilityCounts(
        critical=0,
        high=0,
        medium=0,
        low=0,
        informational=0,
    )
    base_data["tags"] = []
    base_data["scanDate"] = str(base_data["launchedDate"])
    
    return Scan.model_validate(base_data)

def convert_qualys_asset_to_asset(qualys_asset) -> Asset:
    base_data = asdict(qualys_asset)
    base_data["id"] = str(base_data["id"])
    base_data["uri"] = base_data["url"]
    base_data["client"] = "N/A"
    base_data["vulnerabilities"] = VulnerabilityCounts(
        critical=0,
        high=0,
        medium=0,
        low=0,
        informational=0,
    )
    base_data["newVulnerabilities"] = VulnerabilityCounts(
        critical=0,
        high=0,
        medium=0,
        low=0,
        informational=0,
    )
    base_data["tags"] = []
    base_data["totalScans"] = 0
    base_data["lastScanned"] = str(base_data["updatedDate"])
    
    return Asset.model_validate(base_data)

@app.post("/v1/auth/config")
async def configure_qualys(username: str, password: str):
    """
    Endpoint to dynamically set Qualys credentials.
    """
    global qualys_auth
    config = {
        "username": username,
        "password": password,
        "region": QUALYS_CREDENTIALS["region"]
    }
    qualys_auth = BasicAuth.from_dict(config)
    if not qualys_auth.is_authenticated():
        raise HTTPException(status_code=401, detail="Failed to initialize Qualys SDK with provided credentials")
    return {"status": "success", "message": "Qualys configuration updated"}

@app.get("/v1/scans", response_model=List[Scan])
async def get_scans(limit: int = 100):
    qualys_scans = qualys.get_scans(auth=qualys_auth, page_count=math.ceil(limit/100))
    
    if not qualys_scans:
        # Return mock data if SDK returns nothing (stubs) or if not configured
        return [
            Scan.model_validate({
                "id": "1",
                "vendor": "Qualys",
                "name": "Production Web Application Scan",
                "assetUri": "https://app.example.com",
                "assetId": "asset-1",
                "client": "Acme Corporation",
                "vulnerabilities": {"critical": 3, "high": 12, "medium": 28, "low": 15, "informational": 42},
                "newVulnerabilities": {"critical": 1, "high": 3, "medium": 5, "low": 2, "informational": 8},
                "scanDate": "2025-11-23T14:30:00Z",
                "scanFileUrl": "https://reports.example.com/scan-1.pdf",
                "tags": ["production", "web"]
            })
        ]

    scans: List[Scan] = []
    for scan in qualys_scans:
        scans.append(convert_qualys_scan_to_scan(scan))

    return scans[:limit]

@app.get("/v1/scans/{scan_id}", response_model=Scan)
async def get_scan(scan_id: str):
    scan = qualys.get_scans_verbose(auth=qualys_auth, id=scan_id)
    if not scan:
        # Fallback to mock search
        #scans = await get_scans_verbose()
        #found = next((s for s in scans if s["id"] == scan_id), None)
        if not found:
            raise HTTPException(status_code=404, detail="Scan not found")
        return found
    return convert_qualys_scan_to_scan(scan[0])

@app.get("/v1/assets", response_model=List[Asset])
async def get_assets(limit: int = 100):
    qualys_assets = qualys.get_webapps(auth=qualys_auth, page_count=math.ceil(limit/100))
    if not qualys_assets:
        # Return mock data if SDK returns nothing (stubs) or if not configured
        return [
            {
                "id": "asset-1",
                "name": "Production Web Application",
                "uri": "https://app.example.com",
                "client": "Acme Corporation",
                "totalScans": 3,
                "lastScanned": "Nov 23, 2025",
                "vulnerabilities": {"critical": 3, "high": 12, "medium": 28, "low": 15, "informational": 42},
                "newVulnerabilities": {"critical": 1, "high": 3, "medium": 5, "low": 2, "informational": 8},
                "tags": ["production", "web", "critical"]
            }
        ]

    assets: List[Asset] = []
    for asset in qualys_assets:
        assets.append(convert_qualys_asset_to_asset(asset))
    return assets[:limit]

@app.get("/v1/assets/{asset_id}", response_model=Asset)
async def get_asset_detail(asset_id: str):
    qualys_asset = qualys.get_webapps(auth=qualys_auth, id=asset_id)
    if not qualys_asset:
        raise HTTPException(status_code=404, detail="Asset not found")
    
    #scans = await get_scans_verbose()
    #asset["scans"] = [s for s in scans if s["assetId"] == asset_id]
    return convert_qualys_asset_to_asset(qualys_asset[0])

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
