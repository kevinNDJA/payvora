const fs = require('fs');
const path = require('path');

// Minimal 1x1 transparent PNG base64
const base64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABAQMAAAAl21bKAAAABlBMVEX///8AAABVwtN+AAAAAXRSTlMAQObYZgAAAApJREFUeJxjYAAAAAIAAfRAc4kAAAAASUVORK5CYII=';

const outPath = path.join(__dirname, '..', 'public', 'logo.png');
fs.writeFileSync(outPath, Buffer.from(base64, 'base64'));
console.log('Wrote', outPath);
