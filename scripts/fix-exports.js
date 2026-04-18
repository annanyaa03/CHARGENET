const fs = require('fs');
const path = require('path');

const components = [
  'Badge',
  'Skeleton',
  'Input',
  'Button',
  'Modal',
  'PageWrapper',
  'Navbar',
  'Footer',
  'PlugBadge',
  'LevelBadge',
  'Select',
  'Textarea'
];

function updateFiles(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    if (entry.isDirectory()) {
      if (entry.name !== 'node_modules' && entry.name !== '.git' && entry.name !== '.next' && entry.name !== 'dist') {
        updateFiles(fullPath);
      }
    } else if (fullPath.endsWith('.jsx') || fullPath.endsWith('.js')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let changed = false;

      // Rule 1: import X from './X' -> import { X } from './X'
      components.forEach(comp => {
        // Handle common import patterns
        const patterns = [
          {
            // import Button from '../common/Button'
            regex: new RegExp(`import\\s+${comp}\\s+from\\s+['"]([^'"]+\\/${comp})['"]`, 'g'),
            replace: `import { ${comp} } from '$1'`
          },
          {
            // import PageWrapper, { PageContainer } from '../layout/PageWrapper'
            regex: new RegExp(`import\\s+${comp}\\s*,\\s*{\\s*([^}]+)\\s*}\\s+from\\s+['"]([^'"]+\\/${comp})['"]`, 'g'),
            replace: `import { ${comp}, $1 } from '$2'`
          }
        ];

        patterns.forEach(p => {
          if (p.regex.test(content)) {
            content = content.replace(p.regex, p.replace);
            changed = true;
          }
        });
      });

      if (changed) {
        fs.writeFileSync(fullPath, content);
        console.log(`Updated: ${fullPath}`);
      }
    }
  }
}

console.log('Starting import updates...');
updateFiles('src');
console.log('Finished import updates.');
