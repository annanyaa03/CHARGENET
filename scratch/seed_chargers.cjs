const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function seedChargers() {
  console.log('Fetching stations...');
  const { data: stations, error: stationError } = await supabase.from('stations').select('id');
  
  if (stationError) {
    console.error('Error fetching stations:', stationError);
    return;
  }

  console.log(`Found ${stations.length} stations. Seeding chargers...`);

  const types = ['CCS', 'CHAdeMO', 'Type2', 'AC'];
  const powers = [7, 22, 50, 100, 150];
  const statuses = ['available', 'occupied', 'available', 'available']; // Weight towards available

  for (const station of stations) {
    const chargersToCreate = Math.floor(Math.random() * 3) + 2; // 2 to 4 chargers
    const chargers = [];

    for (let i = 0; i < chargersToCreate; i++) {
      chargers.push({
        station_id: station.id,
        type: types[Math.floor(Math.random() * types.length)],
        power_kw: powers[Math.floor(Math.random() * powers.length)],
        status: statuses[Math.floor(Math.random() * statuses.length)],
        price_per_kwh: (Math.random() * 7 + 8).toFixed(2), // 8 to 15
      });
    }

    const { error: insertError } = await supabase.from('chargers').insert(chargers);
    if (insertError) {
      console.error(`Error seeding chargers for station ${station.id}:`, insertError);
    } else {
      console.log(`Successfully seeded ${chargersToCreate} chargers for station ${station.id}`);
    }
  }

  console.log('Seeding complete!');
}

seedChargers();
