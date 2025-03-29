const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'index.ts');
const fileContent = fs.readFileSync(filePath, 'utf8');

// البحث عن تعريف parseSearchQuery
const parseSearchQueryDefinition = fileContent.match(/private parseSearchQuery\([^)]*\)/);
console.log('parseSearchQuery definition:', parseSearchQueryDefinition ? parseSearchQueryDefinition[0] : 'Not found');

// البحث عن استخدام parseSearchQuery
const parseSearchQueryUsage = fileContent.match(/this\.parseSearchQuery\([^)]*\)/g);
console.log('parseSearchQuery usage:', parseSearchQueryUsage);