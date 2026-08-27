"""
Dumps every collection in the app's MongoDB database to timestamped JSON files.

Run manually before a risky deploy, or on a schedule (e.g. a daily cron job):
    cd backend && python3 scripts/backup_db.py [output_dir]

Defaults to writing into backend/backups/<timestamp>/. Keeps the last 14
backups by default and deletes older ones.
"""
import asyncio
import json
import os
import sys
from datetime import datetime, timezone
from pathlib import Path

from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId

ROOT_DIR = Path(__file__).resolve().parent.parent
load_dotenv(ROOT_DIR / ".env")

KEEP_LAST_N_BACKUPS = 14


class MongoJSONEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, ObjectId):
            return str(obj)
        if isinstance(obj, datetime):
            return obj.isoformat()
        return super().default(obj)


async def backup(output_dir: Path):
    mongo_url = os.environ["MONGO_URL"]
    db_name = os.environ["DB_NAME"]
    client = AsyncIOMotorClient(mongo_url)
    db = client[db_name]

    output_dir.mkdir(parents=True, exist_ok=True)

    collection_names = await db.list_collection_names()
    total_docs = 0
    for name in collection_names:
        docs = await db[name].find({}).to_list(None)
        with open(output_dir / f"{name}.json", "w") as f:
            json.dump(docs, f, cls=MongoJSONEncoder, indent=2)
        total_docs += len(docs)
        print(f"  {name}: {len(docs)} documents")

    client.close()
    print(f"Backed up {len(collection_names)} collections, {total_docs} documents, to {output_dir}")


def prune_old_backups(backups_root: Path, keep: int):
    if not backups_root.exists():
        return
    entries = sorted(
        [p for p in backups_root.iterdir() if p.is_dir()],
        key=lambda p: p.name,
        reverse=True,
    )
    for stale in entries[keep:]:
        for f in stale.glob("*"):
            f.unlink()
        stale.rmdir()
        print(f"Pruned old backup: {stale}")


if __name__ == "__main__":
    backups_root = Path(sys.argv[1]) if len(sys.argv) > 1 else ROOT_DIR / "backups"
    timestamp = os.environ.get("BACKUP_TIMESTAMP") or __import__("time").strftime("%Y%m%d_%H%M%S")
    target = backups_root / timestamp

    asyncio.run(backup(target))
    prune_old_backups(backups_root, KEEP_LAST_N_BACKUPS)
