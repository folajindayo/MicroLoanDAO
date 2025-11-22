/* eslint-disable */
const chokidar = require('chokidar');
const { exec } = require('child_process');

const watcher = chokidar.watch('./', { ignored: /node_modules|\.git|\.next/ });

console.log('Starting auto-commit watcher...');

watcher.on('change', path => {
  console.log(`File ${path} has been changed`);
  exec(`git add "${path}" && git commit -m "Updated ${path}"`, (err, stdout, stderr) => {
    if (err) {
        // Ignore error if nothing to commit (e.g. file changed but no content diff)
        if (!err.message.includes('nothing to commit')) {
             console.error(`Error committing ${path}:`, err);
        }
    } else {
        console.log(`Committed ${path}`);
    }
  });
});
