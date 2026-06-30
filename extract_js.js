const fs = require('fs');
const content = fs.readFileSync('index.html', 'utf8');
const js = content.split('<script>')[1].split('</script>')[0];
fs.writeFileSync('temp_check.js', js);
