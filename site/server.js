const http = require('http');
const fs = require('fs');
const path = require('path');
const mime = {'.html':'text/html','.jpg':'image/jpeg','.png':'image/png','.svg':'image/svg+xml','.css':'text/css','.js':'application/javascript'};
const dir = 'C:\\Users\\tartarugacoin\\.openclaw\\workspace\\saude-do-gueto\\site';
http.createServer((req,res)=>{
  let f = path.join(dir, req.url === '/' ? 'index.html' : req.url);
  try {
    let c = fs.readFileSync(f);
    let ext = path.extname(f);
    res.writeHead(200,{'Content-Type':mime[ext]||'text/plain'});
    res.end(c);
  } catch(e) {
    res.writeHead(404);
    res.end('404');
  }
}).listen(8080,()=>console.log('OK'));
