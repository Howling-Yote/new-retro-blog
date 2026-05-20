const fs = require('fs');
const files = ['about.html', 'dos-games.html', 'index.html', 'main.html', 'picture-gallery.html', 'thanks.html', 'whats-out-there.html', 'styles.css'];
files.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  content = content.replace(/href="\//g, 'href="./');
  content = content.replace(/src="\//g, 'src="./');
  content = content.replace(/url\('\//g, "url('./");
  content = content.replace(/href="\/main\.html"/g, 'href="./main.html"');
  content = content.replace(/window\.location\.href = '\/main\.html'/g, "window.location.href = './main.html'");
  fs.writeFileSync(f, content);
});
console.log('Done!');
