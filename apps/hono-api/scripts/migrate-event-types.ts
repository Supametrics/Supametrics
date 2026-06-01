/**
 * Migration script to rename event_type from 'page_view' to 'pageview'
 * 
 * This script updates all analytics_events records that have event_type = 'page_view'
 * to use 'pageview' instead for consistency.
 * 
 * Usage:
 *   cd apps/hono-api
 *   pnpm migrate:event-types
 */

import { sql } from 'drizzle-orm';
import { db } from '../src/db/index.js';

async function migrateEventTypes() {
  console.log('🔄 Starting event type migration...\n');

  try {
    // First, check how many records need to be updated
    const countResult = await db.execute(sql`
      SELECT COUNT(*) as count 
      FROM analytics_events 
      WHERE event_type = 'page_view'
    `);
    
    const count = countResult.rows[0]?.count || 0;
    console.log(`📊 Found ${count} records with event_type = 'page_view'`);

    if (count === 0) {
      console.log('✅ No records to migrate. All done!');
      return;
    }

    // Perform the update
    console.log('\n🔧 Updating records...');
    await db.execute(sql`
      UPDATE analytics_events 
      SET event_type = 'pageview' 
      WHERE event_type = 'page_view'
    `);

    console.log(`✅ Successfully updated ${count} records`);

    // Verify the update
    const verifyResult = await db.execute(sql`
      SELECT COUNT(*) as count 
      FROM analytics_events 
      WHERE event_type = 'page_view'
    `);
    
    const remainingCount = verifyResult.rows[0]?.count || 0;
    
    if (remainingCount === 0) {
      console.log('✅ Verification passed: No more page_view records found');
    } else {
      console.warn(`⚠️  Warning: ${remainingCount} page_view records still remain`);
    }

    // Show summary of event types
    console.log('\n📈 Current event type distribution:');
    const summaryResult = await db.execute(sql`
      SELECT event_type, COUNT(*) as count 
      FROM analytics_events 
      GROUP BY event_type 
      ORDER BY count DESC
    `);

    summaryResult.rows.forEach((row: any) => {
      console.log(`   ${row.event_type}: ${row.count}`);
    });

  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
  
  console.log('\n✅ Migration complete.');
}

// Run the migration
migrateEventTypes()
  .then(() => {
    console.log('\n🎉 All done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Migration failed:', error);
    process.exit(1);
  });
