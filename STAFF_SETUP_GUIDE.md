# Staff Setup Guide

## Problem Solved
You were getting "Invalid staff ID - staff member does not exist" because no staff members were in the database.

## Solution
The app now automatically:
1. Checks for existing staff members on startup
2. If none exist, seeds the database with 3 default staff members
3. Provides a staff selection dropdown in the form

## What's New

### 1. Staff Setup API (`/api/staff/setup`)
- **GET**: Retrieves all active staff members
- **POST**: Seeds database with 3 default staff members

### 2. Updated Medical Record Form
- Shows a "Creating Staff Member" dropdown
- Automatically loads staff on page load
- Auto-seeds database if no staff exists
- Shows loading states while fetching/seeding

### 3. Default Staff Members Created
When seeded, the following staff members are created:

| Email | Name | Role | Department | Can Create Records |
|-------|------|------|------------|-------------------|
| admin@clinic.com | Dr. Admin User | ADMIN | Administration | ✅ Yes |
| doctor@clinic.com | Dr. John Doe | DOCTOR | General Medicine | ✅ Yes |
| nurse@clinic.com | Nurse Mary Smith | NURSE | Nursing | ✅ Yes |

## How to Use

### Option 1: Automatic Setup (Recommended)
1. Start the app: `pnpm dev`
2. Open http://localhost:3000
3. The form will automatically seed staff if needed
4. Select a staff member from the dropdown
5. Create a medical record

### Option 2: Manual Setup via SQL
```sql
-- Run this in your MySQL client
USE clinic_db;

INSERT INTO staff_users (email, full_name, password_hash, role, can_create_records, department)
VALUES 
  ('admin@clinic.com', 'Dr. Admin', '$2b$10$hash', 'ADMIN', TRUE, 'Administration'),
  ('doctor@clinic.com', 'Dr. John', '$2b$10$hash', 'DOCTOR', TRUE, 'General Medicine');

SELECT * FROM staff_users;
```

### Option 3: Call Setup Endpoint Directly
```bash
# Seed staff members
curl -X POST http://localhost:3000/api/staff/setup

# Get available staff
curl http://localhost:3000/api/staff/setup
```

## Testing Flow

1. **First Load**: Form detects no staff → triggers auto-seed
2. **See Loading State**: "Setting up database with default staff..."
3. **Staff Loaded**: Dropdown shows 3 staff members
4. **Fill Form**: Enter medical record details
5. **Select Staff**: Choose staff member from dropdown
6. **Submit**: Creates medical record successfully ✅

## Troubleshooting

### Staff Dropdown is Empty
- Check browser console (F12) for errors
- Ensure MySQL is running
- Check environment variables (.env.local)
- Try manually calling `/api/staff/setup` with POST

### Still Getting "Invalid staff ID" Error
1. Check that staff_id matches an existing record:
   ```sql
   SELECT staff_id, full_name FROM staff_users;
   ```
2. Verify the value passed in `x-staff-id` header matches a real staff ID
3. Ensure form is selecting a staff member before submitting

### Can't See Auto-Seed Message
- Open browser console (F12)
- Look for `[v0]` prefixed messages
- Check Network tab for `/api/staff/setup` POST request

## Files Modified

- `app/components/medical-record-form.tsx` - Added staff selection logic
- `app/api/staff/setup/route.ts` - New endpoint for staff management (NEW)
- `seed-staff.sql` - SQL script for manual seeding (NEW)

## API Documentation

### POST /api/staff/setup
Seeds database with default staff members

**Response Success:**
```json
{
  "success": true,
  "message": "Staff members created successfully",
  "staff": [
    {
      "staff_id": 1,
      "email": "admin@clinic.com",
      "full_name": "Dr. Admin User",
      "role": "ADMIN",
      "department": "Administration"
    }
  ]
}
```

**Response If Already Seeded:**
```json
{
  "success": false,
  "message": "Database already has 3 staff members. Skipping seed.",
  "staffCount": 3
}
```

### GET /api/staff/setup
Get list of available staff members

**Response:**
```json
{
  "success": true,
  "staff": [
    {
      "staff_id": 1,
      "email": "admin@clinic.com",
      "full_name": "Dr. Admin User",
      "role": "ADMIN",
      "department": "Administration",
      "can_create_records": true
    }
  ]
}
```

## Next Steps

After staff setup works:
1. Customize staff members for your clinic
2. Add proper password hashing (currently placeholder hashes)
3. Implement authentication for staff login
4. Add staff management UI for creating/editing staff members
5. Set role-based permissions properly
