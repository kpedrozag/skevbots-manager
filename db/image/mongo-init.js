db = db.getSiblingDB('application');

db.tasks.createIndex({ id: 1 }, { unique: true });

db.tasks.insertMany([
  {
    "id": 10001,
    "description": "Process invoice",
    "duration": 1500
  },
  {
    "id": 10002,
    "description": "Categorize transactions",
    "duration": 2750
  },
  {
    "id": 10003,
    "description": "Extract statement data",
    "duration": 18000
  },
  {
    "id": 10004,
    "description": "Amortize loan payments",
    "duration": 2573
  },
  {
    "id": 10005,
    "description": "Depreciate fixed assets",
    "duration": 7454
  },
  {
    "id": 10006,
    "description": "Calculate payroll allocations",
    "duration": 37473
  },
  {
    "id": 10007,
    "description": "Generate month end report",
    "duration": 34332
  },
  {
    "id": 10008,
    "description": "Audit for discrepancies",
    "duration": 6765
  },
  {
    "id": 10009,
    "description": "Close the books",
    "duration": 3643
  },
  {
    "id": 10010,
    "description": "Perform reconciliation",
    "duration": 4542
  }
]);

print("ok");
