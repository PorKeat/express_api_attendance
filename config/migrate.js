const fs = require('fs');
const path = require('path');
const { pool } = require('./db');

const MIGRATIONS_DIR = path.resolve(__dirname, '../migrations');

const COLORS = {
  GREEN: '\x1b[32m',
  RED: '\x1b[31m',
  YELLOW: '\x1b[33m',
  BLUE: '\x1b[34m',
  RESET: '\x1b[0m'
};

const log = (message, color = COLORS.RESET) => console.log(`${color}${message}${COLORS.RESET}`);

async function getConnection() {
  try {
    const connection = await pool.getConnection();
    log('Successfully connected to the database.', COLORS.GREEN);
    return connection;
  } catch (error) {
    log(`Error connecting to the database: ${error.message}`, COLORS.RED);
    process.exit(1);
  }
}

async function ensureMigrationsTable(connection) {
  log('📊 Checking migrations table...', COLORS.BLUE);
  await connection.query(`
    CREATE TABLE IF NOT EXISTS migrations (
      id INT AUTO_INCREMENT PRIMARY KEY,
      migration_name VARCHAR(255) NOT NULL UNIQUE,
      executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
  `);
  log('✅ Migrations table ready', COLORS.GREEN);
}

async function getExecutedMigrations(connection) {
  const [rows] = await connection.query('SELECT migration_name FROM migrations');
  return rows.map(row => row.migration_name);
}

function getMigrationFiles() {
  const files = fs.readdirSync(MIGRATIONS_DIR).sort();
  log(`📁 Found ${files.length} migration files:`, COLORS.BLUE);
  files.forEach(file => log(`  - ${file}`));
  return files;
}

async function runMigrations() {
  const connection = await getConnection();
  try {
    log('🚀 Starting migration process...', COLORS.BLUE);
    await ensureMigrationsTable(connection);
    const executedMigrations = await getExecutedMigrations(connection);
    const migrationFiles = getMigrationFiles();
    let executedCount = 0;

    for (const file of migrationFiles) {
      if (executedMigrations.includes(file)) {
        log(`⏭️  Already executed: ${file}`, COLORS.YELLOW);
        continue;
      }
      log(`▶️  Running: ${file}`, COLORS.BLUE);
      const migration = require(path.join(MIGRATIONS_DIR, file));
      await migration.up(connection);
      await connection.query('INSERT INTO migrations (migration_name) VALUES (?)', [file]);
      log(`✅ Success: ${file}`, COLORS.GREEN);
      executedCount++;
    }

    log(`🎉 Migration completed successfully!`, COLORS.GREEN);
    log(`📈 Executed ${executedCount} new migrations`, COLORS.GREEN);
  } catch (error) {
    log(`❌ Migration failed: ${error.message}`, COLORS.RED);
  } finally {
    if (connection) {
      await connection.release();
      log('🔒 Database connection closed', COLORS.BLUE);
    }
    pool.end();
  }
}

async function rollbackLastMigration() {
  const connection = await getConnection();
  try {
    log('⏪ Rolling back the last migration...', COLORS.BLUE);
    const [lastMigration] = await connection.query('SELECT migration_name FROM migrations ORDER BY id DESC LIMIT 1');
    if (lastMigration.length === 0) {
      log('No migrations to roll back.', COLORS.YELLOW);
      return;
    }

    const migrationName = lastMigration[0].migration_name;
    log(`◀️  Rolling back: ${migrationName}`, COLORS.BLUE);
    const migration = require(path.join(MIGRATIONS_DIR, migrationName));
    await migration.down(connection);
    await connection.query('DELETE FROM migrations WHERE migration_name = ?', [migrationName]);
    log(`✅ Rollback successful: ${migrationName}`, COLORS.GREEN);
  } catch (error) {
    log(`❌ Rollback failed: ${error.message}`, COLORS.RED);
  } finally {
    if (connection) {
      await connection.release();
      log('🔒 Database connection closed', COLORS.BLUE);
    }
    pool.end();
  }
}

async function fresh() {
    const connection = await getConnection();
    try {
      log('🔄 Dropping all tables and re-running all migrations...', COLORS.BLUE);
      
      // Get all table names from the current database
      const [tables] = await connection.query('SHOW TABLES');
      const tableNames = tables.map(t => Object.values(t)[0]);
  
      // Temporarily disable foreign key checks
      await connection.query('SET FOREIGN_KEY_CHECKS = 0');
  
      // Drop all tables
      for (const tableName of tableNames) {
        log(`🔻 Dropping table: ${tableName}`, COLORS.YELLOW);
        await connection.query(`DROP TABLE IF EXISTS ${tableName}`);
      }
      log('✅ All tables dropped.', COLORS.GREEN);
  
      // Re-enable foreign key checks
      await connection.query('SET FOREIGN_KEY_CHECKS = 1');
  
      // Run all migrations
      await runMigrations();
  
      log('🎉 Fresh migration completed successfully!', COLORS.GREEN);
    } catch (error) {
      log(`❌ Fresh migration failed: ${error.message}`, COLORS.RED);
      // Attempt to re-enable foreign key checks in case of an error
      await connection.query('SET FOREIGN_KEY_CHECKS = 1');
    } finally {
      if (connection) {
        await connection.release();
        log('🔒 Database connection closed', COLORS.BLUE);
      }
      pool.end();
    }
  }

async function showStatus() {
  const connection = await getConnection();
  try {
    log('📊 Checking migration status...', COLORS.BLUE);
    await ensureMigrationsTable(connection);
    const executedMigrations = await getExecutedMigrations(connection);
    const migrationFiles = getMigrationFiles();

    log('Migration Status:', COLORS.BLUE);
    migrationFiles.forEach(file => {
      if (executedMigrations.includes(file)) {
        log(`  [✅] Executed: ${file}`, COLORS.GREEN);
      } else {
        log(`  [❌] Pending:  ${file}`, COLORS.RED);
      }
    });
  } catch (error) {
    log(`❌ Error checking status: ${error.message}`, COLORS.RED);
  } finally {
    if (connection) {
      await connection.release();
      log('🔒 Database connection closed', COLORS.BLUE);
    }
    pool.end();
  }
}

const command = process.argv[2];

switch (command) {
  case 'rollback':
    rollbackLastMigration();
    break;
  case 'restart':
    fresh();
    break;
  case 'status':
    showStatus();
    break;
  default:
    runMigrations();
    break;
}
