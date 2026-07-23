-- Seed initial staff members for testing
-- Run this after creating the database schema

USE clinic_db;

-- Insert test staff members
INSERT INTO staff_users (email, full_name, password_hash, role, can_create_records, can_create_staff, can_edit_records, can_delete_records, department, is_active)
VALUES 
  ('admin@clinic.com', 'Dr. Admin User', '$2b$10$abcdefghijklmnopqrstuvwxyz123456', 'ADMIN', TRUE, TRUE, TRUE, TRUE, 'Administration', TRUE),
  ('doctor@clinic.com', 'Dr. John Doe', '$2b$10$abcdefghijklmnopqrstuvwxyz123457', 'DOCTOR', TRUE, FALSE, TRUE, FALSE, 'General Medicine', TRUE),
  ('nurse@clinic.com', 'Nurse Mary Smith', '$2b$10$abcdefghijklmnopqrstuvwxyz123458', 'NURSE', TRUE, FALSE, TRUE, FALSE, 'Nursing', TRUE);

-- Display created staff
SELECT staff_id, email, full_name, role, can_create_records FROM staff_users;
