"""
Neo4j-backed persistence for ACE memory.

Stores each learner's playbook as a single JSON blob attached to an
`AceMemoryState` node to keep the schema simple while enabling per-user
isolation across Render dynos.
"""

from __future__ import annotations

import json
import os
import threading
from typing import Any, Dict, Optional

from neo4j import GraphDatabase
from neo4j.exceptions import Neo4jError

_DRIVER = None
_DRIVER_LOCK = threading.Lock()


def _get_driver():
    """Initialise and cache a global Neo4j driver."""
    global _DRIVER
    if _DRIVER is not None:
        return _DRIVER

    uri = os.getenv("NEO4J_URI") or os.getenv("NEXT_PUBLIC_NEO4J_URI")
    user = os.getenv("NEO4J_USERNAME") or os.getenv("NEXT_PUBLIC_NEO4J_USERNAME")
    password = os.getenv("NEO4J_PASSWORD") or os.getenv("NEXT_PUBLIC_NEO4J_PASSWORD")

    if not uri or not user or not password:
        raise RuntimeError(
            "Neo4j credentials are not configured. "
            "Set NEO4J_URI / NEO4J_USERNAME / NEO4J_PASSWORD (or NEXT_PUBLIC_*)."
        )

    with _DRIVER_LOCK:
        if _DRIVER is None:
            _DRIVER = GraphDatabase.driver(uri, auth=(user, password))
    return _DRIVER


def _get_database() -> Optional[str]:
    """Return the configured database name, if provided."""
    return os.getenv("NEO4J_DATABASE") or None


class Neo4jMemoryStore:
    """Persist ACE memory state for a specific learner in Neo4j."""

    def __init__(self, learner_id: str):
        if not learner_id:
            raise ValueError("learner_id is required for Neo4jMemoryStore")
        self.learner_id = learner_id
        self._database = _get_database()

    def load(self) -> Optional[Dict[str, Any]]:
        """Load the stored memory JSON for this learner, if it exists."""
        driver = _get_driver()
        try:
            with driver.session(database=self._database) as session:
                record = session.run(
                    """
                    MATCH (u:User {id: $userId})
                    MERGE (u)-[:HAS_ACE_MEMORY]->(m:AceMemoryState)
                    ON CREATE SET
                        m.id = coalesce($memoryId, randomUUID()),
                        m.memory_json = $emptyPayload,
                        m.access_clock = 0,
                        m.created_at = datetime(),
                        m.updated_at = datetime()
                    RETURN m.memory_json AS memory_json,
                           m.access_clock AS access_clock
                    """,
                    {
                        "userId": self.learner_id,
                        "memoryId": None,
                        "emptyPayload": json.dumps(
                            {"bullets": [], "access_clock": 0}, ensure_ascii=False
                        ),
                    },
                ).single()
                if not record:
                    return None
                raw = record.get("memory_json")
                if not raw:
                    return None
                try:
                    data = json.loads(raw)
                except json.JSONDecodeError:
                    print(
                        f"[ACE Memory] Warning: Failed to decode stored memory for learner={self.learner_id}",
                        flush=True,
                    )
                    return None
                access_clock = record.get("access_clock")
                if access_clock is not None:
                    try:
                        access_clock = int(access_clock)
                    except (TypeError, ValueError):
                        pass
                if access_clock is not None and "access_clock" not in data:
                    data["access_clock"] = access_clock
                return data
        except Neo4jError as exc:
            print(
                f"[ACE Memory] Warning: Neo4j load failed for learner={self.learner_id}: {exc}",
                flush=True,
            )
            return None

    def save(self, data: Dict[str, Any]) -> None:
        """Persist the given memory snapshot for this learner."""
        driver = _get_driver()
        payload = json.dumps(data, ensure_ascii=False)
        access_clock = int(data.get("access_clock", 0))
        try:
            with driver.session(database=self._database) as session:
                session.run(
                    """
                    MERGE (u:User {id: $userId})
                    ON CREATE SET u.created_at = datetime()
                    MERGE (u)-[:HAS_ACE_MEMORY]->(m:AceMemoryState)
                    ON CREATE SET
                        m.id = randomUUID(),
                        m.created_at = datetime()
                    SET m.memory_json = $memory_json,
                        m.access_clock = $access_clock,
                        m.updated_at = datetime()
                    """,
                    {
                        "userId": self.learner_id,
                        "memory_json": payload,
                        "access_clock": access_clock,
                    },
                )
        except Neo4jError as exc:
            print(
                f"[ACE Memory] Warning: Neo4j save failed for learner={self.learner_id}: {exc}",
                flush=True,
            )
