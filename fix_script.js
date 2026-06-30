const fs = require('fs');
let content = fs.readFileSync('index.html', 'utf8');

// The code I injected by mistake starts with:
const wrongInjectionStart = `// ============================================================
//   ANALYTICS ENGINE
// ============================================================`;

// 1. Extract the whole analytics code block that I injected.
// It ends right before the next `</script>`. But wait, I injected `</script>` at the end of `analyticsJS` too!
// Let's just find the block and remove it.

const startIdx = content.indexOf(wrongInjectionStart);
if(startIdx !== -1) {
  // Extract until the NEXT </script> which was the one I added in my script.
  const endIdx = content.indexOf('</script>', startIdx);
  const analyticsCode = content.substring(startIdx, endIdx);
  
  // Remove it from its current position
  content = content.replace(analyticsCode, '');
  
  // Also, make sure the supabase script tag is closed properly.
  // Currently it looks like: <script src="...">\n</script> (because I removed the code inside it)
  
  // Now, inject analyticsCode into the actual main script block.
  // The main script block is the LAST script block. Or I can just append it before the very last `</script>` in the file.
  
  const lastScriptEnd = content.lastIndexOf('</script>');
  content = content.substring(0, lastScriptEnd) + '\n' + analyticsCode + '\n' + content.substring(lastScriptEnd);
  
  fs.writeFileSync('index.html', content);
  console.log('Fixed script location!');
} else {
  console.log('Could not find wrong injection');
}
