import fs from 'fs';

function checkDuplicates(filePath) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        const lines = content.split('\n');
        const keys = new Set();
        const rootKeys = new Set();

        lines.forEach((line, index) => {
            // Very naive check for root keys based on indentation
            if (line.match(/^\s{2}"([^"]+)":/)) {
                const match = line.match(/^\s{2}"([^"]+)":/);
                const key = match[1];
                if (rootKeys.has(key)) {
                    console.log(`Duplicate ROOT key found: "${key}" at line ${index + 1}`);
                }
                rootKeys.add(key);
            }
        });

        try {
            JSON.parse(content);
            console.log(`JSON is valid: ${filePath}`);
        } catch (e) {
            console.error(`JSON PARSE ERROR in ${filePath}:`, e.message);
        }

    } catch (e) {
        console.error(`Error processing ${filePath}:`, e.message);
    }
}

checkDuplicates('c:/anw2/teqwa-pro/teqwa-frontend/src/locales/en.json');
checkDuplicates('c:/anw2/teqwa-pro/teqwa-frontend/src/locales/am.json');
