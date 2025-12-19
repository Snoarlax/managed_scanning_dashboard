from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional, Dict, Any
import os
import math
from qualysdk.auth import BasicAuth
import qualysdk.was as qualys
from models import Scan, Asset, AssetDetail, VulnerabilityCounts
from dataclasses import asdict
from sqlalchemy.orm import Session
from db import get_db, DBScan, DBAsset

# TODO: refresh endpoint to create a refresh job for all data in database
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
async def get_scans(limit: int = 100, db: Session = Depends(get_db)):
    # Try fetching from DB first, ordered by most recent
    db_scans = db.query(DBScan).order_by(DBScan.scanDate.desc()).limit(limit).all()
    
    if db_scans:
        return [Scan.model_validate(s) for s in db_scans]

    # If no results in DB, fetch from Qualys API
    qualys_scans = qualys.get_scans(auth=qualys_auth, page_count=math.ceil(limit/100))
    
    if not qualys_scans:
        # Return mock data if SDK returns nothing (stubs) or if not configured
        # We don't store mock data in the DB
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
    for qs in qualys_scans:
        scan_obj = convert_qualys_scan_to_scan(qs)
        # Store in DB
        db_scan = DBScan(**scan_obj.model_dump())
        db.merge(db_scan)
        scans.append(scan_obj)
    
    db.commit()
    # Return sorted by date
    scans.sort(key=lambda x: x.scanDate, reverse=True)
    return scans[:limit]

@app.get("/v1/scans/{scan_id}", response_model=Scan)
async def get_scan(scan_id: str, db: Session = Depends(get_db)):
    # Try DB first
    db_scan = db.query(DBScan).filter(DBScan.id == scan_id).first()
    if db_scan:
        return Scan.model_validate(db_scan)

    # Fetch from API
    qualys_result = qualys.get_scans_verbose(auth=qualys_auth, id=scan_id)
    if not qualys_result:
        raise HTTPException(status_code=404, detail="Scan not found")
    
    scan_obj = convert_qualys_scan_to_scan(qualys_result[0])
    
    # Store in DB
    db_scan = DBScan(**scan_obj.model_dump())
    db.merge(db_scan)
    db.commit()
    
    return scan_obj

@app.get("/v1/assets", response_model=List[Asset])
async def get_assets(limit: int = 100, db: Session = Depends(get_db)):
    # Try DB first, ordered by most recent
    db_assets = db.query(DBAsset).order_by(DBAsset.lastScanned.desc()).limit(limit).all()
    
    if db_assets:
        return [Asset.model_validate(a) for a in db_assets]

    # Fetch from API
    qualys_assets = qualys.get_webapps(auth=qualys_auth, page_count=math.ceil(limit/100))
    if not qualys_assets:
        # Return mock data
        return [
            {
                "id": "asset-1",
                "name": "Production Web Application",
                "uri": "https://app.example.com",
                "client": "Acme Corporation",
                "totalScans": 3,
                "lastScanned": "2025-11-23T14:30:00Z",
                "vulnerabilities": {"critical": 3, "high": 12, "medium": 28, "low": 15, "informational": 42},
                "newVulnerabilities": {"critical": 1, "high": 3, "medium": 5, "low": 2, "informational": 8},
                "tags": ["production", "web", "critical"]
            }
        ]

    assets: List[Asset] = []
    for qa in qualys_assets:
        asset_obj = convert_qualys_asset_to_asset(qa)
        # Store in DB
        db_asset = DBAsset(**asset_obj.model_dump())
        db.merge(db_asset)
        assets.append(asset_obj)
    
    db.commit()
    # Return sorted by date
    assets.sort(key=lambda x: x.lastScanned, reverse=True)
    return assets[:limit]

@app.get("/v1/assets/{asset_id}", response_model=Asset)
async def get_asset_detail(asset_id: str, db: Session = Depends(get_db)):
    # Try DB first
    db_asset = db.query(DBAsset).filter(DBAsset.id == asset_id).first()
    if db_asset:
        return Asset.model_validate(db_asset)

    # Fetch from API
    qualys_result = qualys.get_webapps(auth=qualys_auth, id=asset_id)
    if not qualys_result:
        raise HTTPException(status_code=404, detail="Asset not found")
    
    asset_obj = convert_qualys_asset_to_asset(qualys_result[0])
    
    # Store in DB
    db_asset = DBAsset(**asset_obj.model_dump())
    db.merge(db_asset)
    db.commit()
    
    return asset_obj

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
