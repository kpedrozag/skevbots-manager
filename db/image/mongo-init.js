db = db.getSiblingDB('application');

db.tasks.insertMany([
  {
    "description": "Process invoice",
    "duration": 1500
  },
  {
    "description": "Categorize transactions",
    "duration": 2750
  },
  {
    "description": "Extract statement data",
    "duration": 18000
  },
  {
    "description": "Amortize loan payments",
    "duration": 2573
  },
  {
    "description": "Depreciate fixed assets",
    "duration": 7454
  },
  {
    "description": "Calculate payroll allocations",
    "duration": 37473
  },
  {
    "description": "Generate month end report",
    "duration": 34332
  },
  {
    "description": "Audit for discrepancies",
    "duration": 6765
  },
  {
    "description": "Close the books",
    "duration": 3643
  },
  {
    "description": "Perform reconciliation",
    "duration": 4542
  }
]);

print("ok");
