import { execSync } from 'child_process';
import fs from 'fs';

console.clear();
console.log('👀 Watching for changes in src/ to run validation...');

let timeoutId = null;

function run() {
  console.clear();
  console.log('🔄 Running validation & linting...');
  try {
    // Run TS type checking and rules validation
    execSync('npm run lint && npm run validate', { stdio: 'inherit' });
    console.log('\n✨ All checks passed! Watching for changes...\n');
  } catch (err) {
    console.error('\n❌ Check failed. Waiting for changes to fix...\n');
  }
}

// Initial run
run();

// Watch src directory for changes with a simple debounce to avoid double execution on rapid saves
fs.watch('src', { recursive: true }, (eventType, filename) => {
  if (filename) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      run();
    }, 300); // 300ms debounce
  }
});
