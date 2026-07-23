const mysql = require('mysql2/promise');

async function checkRecords() {
  const pool = mysql.createPool({
    host: process.env.MYSQL_HOST || 'localhost',
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || '',
    database: process.env.MYSQL_DATABASE || 'clinic_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  });

  try {
    const connection = await pool.getConnection();

    console.log('\n=== DATABASE DIAGNOSTIC ===\n');

    // Check if tables exist
    const [tables] = await connection.execute(
      `SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = DATABASE()`
    );
    console.log('Tables in database:', tables.map(t => t.TABLE_NAME));

    // Check staff members
    const [staff] = await connection.execute(
      'SELECT staff_id, email, full_name, role FROM staff_users'
    );
    console.log('\n--- Staff Members ---');
    if (staff.length > 0) {
      console.log(staff);
    } else {
      console.log('No staff members found!');
    }

    // Check medical records
    const [records] = await connection.execute(
      'SELECT matric_number, student_name, level, created_by_staff_id FROM student_files'
    );
    console.log('\n--- Medical Records ---');
    if (records.length > 0) {
      console.log(`Found ${records.length} record(s):`);
      records.forEach(r => {
        console.log(`  - ${r.matric_number}: ${r.student_name} (Level ${r.level}, Created by: ${r.created_by_staff_id || 'NULL'})`);
      });
    } else {
      console.log('No medical records found!');
    }

    // Check foreign key constraints
    const [constraints] = await connection.execute(
      `SELECT CONSTRAINT_NAME, TABLE_NAME, REFERENCED_TABLE_NAME 
       FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
       WHERE TABLE_SCHEMA = DATABASE() AND REFERENCED_TABLE_NAME IS NOT NULL`
    );
    console.log('\n--- Foreign Key Constraints ---');
    constraints.forEach(c => {
      console.log(`  ${c.TABLE_NAME}.${c.CONSTRAINT_NAME} -> ${c.REFERENCED_TABLE_NAME}`);
    });

    connection.release();
    await pool.end();

    console.log('\n=== END DIAGNOSTIC ===\n');
  } catch (error) {
    console.error('Error running diagnostic:', error.message);
    process.exit(1);
  }
}

checkRecords();
