// This script adds a serial number (srno) as the first column to each row in booked_tours.txt.
// Usage: node add_srno_to_booked_tours.js

const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'booked_tours.txt');
const backupPath = path.join(__dirname, 'booked_tours_backup.txt');

// Read the file
let data = fs.readFileSync(filePath, 'utf8');
const lines = data.split(/\r?\n/).filter(line => line.trim() !== '');

// Backup original file
fs.writeFileSync(backupPath, data, 'utf8');

// Add srno to each row (skip header if present)
let hasHeader = false;
if (lines[0].toLowerCase().includes('name') && !/^\d+$/.test(lines[0].split(',')[0])) {
  hasHeader = true;
}
const newLines = [];
if (hasHeader) {
  const header = lines[0];
  newLines.push('srno,' + header);
}
for (let i = hasHeader ? 1 : 0; i < lines.length; i++) {
  const line = lines[i];
  if (line.trim() === '') continue;
  newLines.push((i - (hasHeader ? 1 : 0) + 1) + ',' + line);
}

// Write back to file
fs.writeFileSync(filePath, newLines.join('\n'), 'utf8');

console.log('Serial numbers added to booked_tours.txt. Backup saved as booked_tours_backup.txt.');
