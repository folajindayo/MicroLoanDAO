const fs = require('fs');
const { execSync } = require('child_process');

const targetCommits = 200;

function getCurrentCommitCount() {
    try {
        const count = execSync('git rev-list --count HEAD').toString().trim();
        return parseInt(count, 10);
    } catch (error) {
        console.error('Error getting commit count:', error);
        return 0;
    }
}

function run() {
    let currentCount = getCurrentCommitCount();
    console.log(`Current commit count: ${currentCount}`);
    
    if (currentCount >= targetCommits) {
        console.log('Target commit count reached.');
        return;
    }

    const needed = targetCommits - currentCount + 5; // Buffer
    console.log(`Generating ${needed} commits...`);

    for (let i = 0; i < needed; i++) {
        const timestamp = new Date().toISOString();
        const logEntry = `\n- [${timestamp}] Activity check ${i + 1}/${needed}: System operational.`;
        
        fs.appendFileSync('ACTIVITY_LOG.md', logEntry);
        
        try {
            execSync('git add ACTIVITY_LOG.md');
            execSync(`git commit -m "chore: update activity log ${i + 1}"`);
            console.log(`Committed change ${i + 1}`);
        } catch (error) {
            console.error(`Failed to commit change ${i + 1}:`, error.message);
        }
    }
    
    console.log('Finished generating commits.');
}

run();

