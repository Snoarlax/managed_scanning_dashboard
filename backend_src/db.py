from sqlalchemy import create_engine, Column, String, Integer, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os

# Default to a local postgres instance if environment variable is not set
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/scanning_db")

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class DBAsset(Base):
    __tablename__ = "assets"
    id = Column(String, primary_key=True, index=True)
    name = Column(String)
    uri = Column(String)
    client = Column(String)
    totalScans = Column(Integer)
    lastScanned = Column(String)
    vulnerabilities = Column(JSON)
    newVulnerabilities = Column(JSON)
    tags = Column(JSON)

class DBScan(Base):
    __tablename__ = "scans"
    id = Column(String, primary_key=True, index=True)
    vendor = Column(String)
    name = Column(String)
    assetUri = Column(String)
    assetId = Column(String)
    client = Column(String)
    vulnerabilities = Column(JSON)
    newVulnerabilities = Column(JSON)
    scanDate = Column(String)
    scanFileUrl = Column(String, nullable=True)
    tags = Column(JSON)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
