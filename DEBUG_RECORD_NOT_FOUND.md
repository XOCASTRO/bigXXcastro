# Medical Record Not Found After Creation - Debugging Guide

## Problem
After creating a medical record successfully, when trying to retrieve it, you get "No medical record found for this matric number"

## Root Causes

### 1. Foreign Key Constraint Issue
The `student_files` table has a foreign key constraint on `created_by_staff_id`:
```sql
FOREIGN KEY (created_by_staff_id) REFERENCES staff_users(staff_id)
```

If the staff member doesn't exist in `staff_users`, the insert may fail silently or be rejected.

### 2. Data Not Actually Inserted
Even if the API returns a success response, the record may not be in the database.

### 3. Matric Number Mismatch
The matric number might be stored differently (with spaces, different casing, etc.) than what you're searching for.

## How to Debug

### Step 1: Check Console Logs
When the form submits, watch your browser console for `[v0]` prefixed messages:

```
[v0] Staff verification - ID: 1 Found: true
[v0] Medical record inserted: {...}
[v0] Verification query result: FOUND
```

### Step 2: Check Server Logs
Open the terminal where your dev server is running and look for error messages:

```
[v0] Database error when creating medical record: {...}
```

### Step 3: Run Diagnostic Script
To check your database state:

```bash
node scripts/check-records.js
```

This will show:
- All tables in the database
- All staff members that exist
- All medical records currently stored
- Foreign key constraint setup

### Step 4: Verify Staff Exists
Before creating a medical record, ensure staff members are seeded:

```bash
# Check if staff members exist
curl http://localhost:3000/api/staff/setup

# Should return something like:
# {
#   "success": true,
#   "staff": [
#     {"staff_id": 1, "full_name": "Dr. Admin", ...},
#     {"staff_id": 2, "full_name": "Dr. John", ...}
#   ]
# }
```

If empty, seed staff:
```bash
curl -X POST http://localhost:3000/api/staff/setup
```

## Common Issues and Solutions

### Issue: "No staff members found"
**Solution**: Ensure the seeding worked:
1. Refresh the form page
2. Wait for "Setting up database..." message
3. Wait for staff dropdown to appear

### Issue: Foreign Key Constraint Error
**Solution**: The selected staff member doesn't exist in `staff_users` table
1. Check `/api/staff/setup` to see available staff
2. Select only staff members that are in the list
3. Run: `node scripts/check-records.js` to verify

### Issue: Record Shows as Created but Not Found
**Solution**: Check matric number format
1. The matric number might have been trimmed differently
2. Check the exact value in the database:
   ```bash
   node scripts/check-records.js
   ```
3. Look at the exact matric number stored
4. Try querying with that exact value

## How to Manually Verify Records in Database

### Option 1: Using MySQL CLI
```bash
mysql -h localhost -u root clinic_db
SELECT * FROM student_files;
SELECT * FROM staff_users;
```

### Option 2: Using Node Script
```bash
node scripts/check-records.js
```

### Option 3: Using API
```bash
# Get all records
curl http://localhost:3000/api/medical-records

# Get specific record
curl "http://localhost:3000/api/medical-records?matric_number=ABC123"
```

## Comprehensive Testing Workflow

1. **Start fresh**
   ```bash
   pnpm dev
   ```

2. **Verify staff setup**
   ```bash
   curl http://localhost:3000/api/staff/setup
   ```

3. **Check form loads correctly**
   - Open http://localhost:3000
   - See staff dropdown
   - Open browser console (F12)

4. **Create a record**
   - Fill in all fields
   - Select a staff member from dropdown
   - Click "Create Medical Record"
   - Check console for `[v0]` messages

5. **Verify in database**
   ```bash
   node scripts/check-records.js
   ```

6. **Query via API**
   ```bash
   curl http://localhost:3000/api/medical-records
   ```

## What the New Logging Shows

The updated create endpoint now logs:

```
[v0] Staff verification - ID: 1 Found: true
  └─ Checks if the selected staff member exists

[v0] Medical record inserted: { matric_number: 'ABC123', insertId: 1, affectedRows: 1 }
  └─ Confirms the INSERT was executed

[v0] Verification query result: FOUND
  └─ Proves the record is now in the database
```

If any of these show `FOUND: false` or `affectedRows: 0`, the insert didn't work.

## Next Steps

1. Run `node scripts/check-records.js` to see your current database state
2. Check browser console for `[v0]` logs
3. If records aren't appearing, share the console output
4. Try the "Comprehensive Testing Workflow" above step by step

