import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import postgres from 'postgres';

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error("DATABASE_URL is not defined in .env.local");
  process.exit(1);
}

const sql = postgres(DATABASE_URL, { ssl: 'require' });

async function updateDeceased() {
  try {
    console.log('--- Updating status: Markers generations 11-14 as deceased ---');
    
    // Fetch all members to build tree
    const members = await sql`SELECT id, parent_id, spouse_id FROM members`;
    
    // Map children
    const childrenMap = {};
    const rootNodes = [];
    const membersMap = {};

    members.forEach(m => {
      membersMap[m.id] = m;
      if (!m.parent_id) {
        rootNodes.push(m);
      } else {
        if (!childrenMap[m.parent_id]) childrenMap[m.parent_id] = [];
        childrenMap[m.parent_id].push(m);
      }
    });

    const deceasedIds = new Set();
    const spouseIds = new Set();

    // BFS to calculate depth
    const queue = rootNodes.map(r => ({ ...r, depth: 1 }));
    while (queue.length > 0) {
      const current = queue.shift();
      
      if (current.depth <= 4) {
        deceasedIds.add(current.id);
        // Find spouses of this person
        // Spouses are nodes where spouse_id = current.id
        // We can't easily find them without second pass or better map
      }

      const children = childrenMap[current.id] || [];
      children.forEach(child => {
        queue.push({ ...child, depth: current.depth + 1 });
      });
    }

    // Second pass to identify spouses of those marked deceased
    members.forEach(m => {
      if (m.spouse_id && deceasedIds.has(m.spouse_id)) {
        deceasedIds.add(m.id);
      }
    });

    console.log(`Found ${deceasedIds.size} members from generation 11 to 14.`);

    if (deceasedIds.size > 0) {
      const idsArray = Array.from(deceasedIds);
      
      // Update in batches to avoid query size limits
      const batchSize = 100;
      for (let i = 0; i < idsArray.length; i += batchSize) {
        const batch = idsArray.slice(i, i + batchSize);
        await sql`
          UPDATE members 
          SET is_alive = false 
          WHERE id IN ${sql(batch)}
        `;
        console.log(`Updated batch ${Math.floor(i / batchSize) + 1}...`);
      }
      
      console.log('--- Database update complete! ---');
    } else {
      console.log('No members found for these generations.');
    }

  } catch (err) {
    console.error('Update failed:', err);
  } finally {
    process.exit();
  }
}

updateDeceased();
