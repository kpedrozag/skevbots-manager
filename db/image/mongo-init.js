db = db.getSiblingDB('application');

db.tasks.createIndex({ id: 1 }, { unique: true });

db.tasks.insertMany([
  {
    "id": 10001,
    "description": "process invoice",
    "duration": 1500
  },
  {
    "id": 10002,
    "description": "categorize transactions",
    "duration": 2750
  },
  {
    "id": 10003,
    "description": "extract statement data",
    "duration": 18000
  },
  {
    "id": 10004,
    "description": "amortize loan payments",
    "duration": 2573
  },
  {
    "id": 10005,
    "description": "depreciate fixed assets",
    "duration": 7454
  },
  {
    "id": 10006,
    "description": "calculate payroll allocations",
    "duration": 37473
  },
  {
    "id": 10007,
    "description": "generate month end report",
    "duration": 34332
  },
  {
    "id": 10008,
    "description": "audit for discrepancies",
    "duration": 6765
  },
  {
    "id": 10009,
    "description": "close the books",
    "duration": 3643
  },
  {
    "id": 10010,
    "description": "perform reconciliation",
    "duration": 4542
  }
]);

print("ok");
