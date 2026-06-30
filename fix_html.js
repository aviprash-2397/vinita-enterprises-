const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const regex = /Top Products by Territory \(Revenue\)<\/div>(\r?\n|\r)<script>/;
const replacement = 'Top Products by Territory (Revenue)</div>\n      <div id="chart-product-territory"></div>\n    </div>\n  </div>\n</div>\n<script>';

if (regex.test(html)) {
  html = html.replace(regex, replacement);
  fs.writeFileSync('index.html', html);
  console.log("Fixed HTML using regex!");
} else {
  console.log("Regex still failed to match.");
}
