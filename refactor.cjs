const fs = require('fs');
const path = require('path');

const SERVER_DIR = path.join(__dirname, 'server');

// 1. Combine all services into supabase.js
const libSupabasePath = path.join(SERVER_DIR, 'lib', 'supabase.js');
let supabaseCode = fs.readFileSync(libSupabasePath, 'utf8');

const services = [
  'auth.service.js',
  'booking.service.js',
  'charger.service.js',
  'review.service.js',
  'station.service.js'
];

let servicesCombined = '';
for (const s of services) {
  const p = path.join(SERVER_DIR, 'services', s);
  if (fs.existsSync(p)) {
    let content = fs.readFileSync(p, 'utf8');
    // Remove import supabase from '../lib/supabase.js'
    content = content.replace(/import supabase from \'\.\.\/lib\/supabase\.js\'\n*/g, '');
    servicesCombined += content + '\n\n';
    fs.unlinkSync(p);
  }
}

// Remove the default export from lib/supabase.js
supabaseCode = supabaseCode.replace('export default supabase', '');

const newSupabaseContent = supabaseCode + '\n' + servicesCombined;
fs.writeFileSync(path.join(SERVER_DIR, 'services', 'supabase.js'), newSupabaseContent);

// Also create ai.js
fs.writeFileSync(path.join(SERVER_DIR, 'services', 'ai.js'), "export const aiService = { \n  // Claude/AI calls only\n};\n");

// Delete lib folder since it's no longer needed, optionally
try {
  fs.unlinkSync(libSupabasePath);
  fs.rmdirSync(path.join(SERVER_DIR, 'lib'));
} catch(e) {}

// 2. Rename and update controllers
const controllerMap = {
  'auth.controller.js': 'authController.js',
  'booking.controller.js': 'bookingsController.js',
  'charger.controller.js': 'chargersController.js',
  'review.controller.js': 'reviewsController.js',
  'station.controller.js': 'stationsController.js'
};

for (const [oldName, newName] of Object.entries(controllerMap)) {
  const oldPath = path.join(SERVER_DIR, 'controllers', oldName);
  if (fs.existsSync(oldPath)) {
    let content = fs.readFileSync(oldPath, 'utf8');
    // Change import from `../services/xx.service.js` to `../services/supabase.js`
    content = content.replace(/import \{ .* \} from \'\.\.\/services\/.*\.service\.js\'/, (match) => {
      return match.replace(/from \'\.\.\/services\/.*\.service\.js\'/, "from '../services/supabase.js'");
    });
    fs.writeFileSync(path.join(SERVER_DIR, 'controllers', newName), content);
    fs.unlinkSync(oldPath);
  }
}

// 3. Update routes to import new controllers
const routeFiles = fs.readdirSync(path.join(SERVER_DIR, 'routes')).filter(f => f.endsWith('.js'));
for (const file of routeFiles) {
  const p = path.join(SERVER_DIR, 'routes', file);
  let content = fs.readFileSync(p, 'utf8');
  
  for (const [oldName, newName] of Object.entries(controllerMap)) {
    content = content.replace(new RegExp(`\\.\\.\\/controllers\\/${oldName}`, 'g'), `../controllers/${newName}`);
  }
  fs.writeFileSync(p, content);
}
console.log("Refactoring complete");
