const fs = require('fs').promises;
const path = require('path');

// Function to save tokens to file
async function saveTokensToFile() {
    if (typeof global.resetTokens === 'object' && global.resetTokens !== null) {
        try {
            const tokensObject = {};
            global.resetTokens.forEach((value, key) => {
                tokensObject[key] = value;
            });
            // Ensure the directory exists
            await fs.writeFile(path.join(__dirname, '..', 'reset-tokens.json'), JSON.stringify(tokensObject, null, 2));
            console.log('Tokens saved to file successfully');
        } catch (error) {
            console.error('Error saving tokens to file:', error);
        }
    }
}

// Function to load tokens from file
async function loadTokensFromFile() {
    try {
        // Create the file if it doesn't exist
        const data = await fs.readFile(path.join(__dirname, '..', 'reset-tokens.json'), 'utf8');
        if (data.trim() === '') {
            // If file is empty, initialize with empty object
            await fs.writeFile(path.join(__dirname, '..', 'reset-tokens.json'), JSON.stringify({}));
            global.resetTokens = new Map();
        } else {
            const tokens = JSON.parse(data);
            global.resetTokens = new Map(Object.entries(tokens));
        }
        console.log('Loaded tokens from file');
    } catch (error) {
        console.log('No existing tokens file found, will create a new one when needed');
        global.resetTokens = new Map();
    }
}

module.exports = {
    saveTokensToFile,
    loadTokensFromFile
};
