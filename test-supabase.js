const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://lcobtrewjpukkpegmrjn.supabase.co',
  'sb_publishable_SUz8xk8AebcR-tKz6ppq7w_nxAuFZX6'
);

async function test() {
  console.log("Fetching categories...");
  const { data, error } = await supabase.from('categories').select('*');
  console.log("Data:", data);
  console.log("Error:", error);
  
  console.log("Testing insert...");
  const { data: insertData, error: insertError } = await supabase.from('categories').insert([
    { id: Date.now(), name: 'Test', icon: 'Pizza', type: 'expense' }
  ]).select();
  console.log("Insert Data:", insertData);
  console.log("Insert Error:", insertError);
}

test();
