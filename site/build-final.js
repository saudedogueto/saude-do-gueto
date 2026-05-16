const fs = require('fs');
const path = require('path');

const logoPath = path.join(__dirname, 'logo.jpg');
const logoB64 = fs.readFileSync(logoPath).toString('base64');
const logoDataUri = `data:image/jpeg;base64,${logoB64}`;

let h = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>Saude do Gueto</title>
<link rel="icon" type="image/svg+xml" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='48' fill='none' stroke='%23FF6B00' stroke-width='2'/%3E%3Ctext x='50' y='68' text-anchor='middle' font-size='44' fill='%23FF6B00'%3ESG%3C/text%3E%3C/svg%3E">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
<style>
*,*::before,*::after{margin:0;padding:0;box-sizing:border-box}
html{scroll-behavior:smooth}
body{font-family:'Inter',system-ui,-apple-system,sans-serif;background:#050d05;color:#f5f5f5;overflow-x:hidden;-webkit-font-smoothing:antialiased}
#pCanvas{position:fixed;top:0;left:0;width:100%;height:100%;z-index:-3}
#lCanvas{position:fixed;top:0;left:0;width:100%;height:100%;z-index:-2;pointer-events:none}
#fCanvas{position:fixed;top:0;left:0;width:100%;height:100%;z-index:-1;pointer-events:none}
.go{position:fixed;inset:0;z-index:-1;background:radial-gradient(ellipse 1000px 600px at 0% 100%,rgba(255,107,0,0.06),transparent),radial-gradient(ellipse 800px 800px at 100% 0%,rgba(168,255,53,0.05),transparent),radial-gradient(ellipse 500px 500px at 50% 50%,rgba(255,149,0,0.03),transparent)}
.ns{position:fixed;inset:0;z-index:-1;opacity:.01;pointer-events:none;background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.8' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")}
::-webkit-scrollbar{width:5px}
::-webkit-scrollbar-track{background:#050d05}
::-webkit-scrollbar-thumb{background:rgba(255,107,0,.2);border-radius:10px}
header{position:fixed;top:0;left:0;right:0;z-index:100;padding:16px 32px;background:rgba(5,13,5,.75);backdrop-filter:blur(30px) saturate(1.6);border-bottom:1px solid rgba(255,107,0,.05);transition:all .3s}
header.scrolled{background:rgba(5,13,5,.88);border-bottom-color:rgba(255,107,0,.1)}
header .in{max-width:1200px;margin:0 auto;display:flex;align-items:center;justify-content:space-between}
header .l{display:flex;align-items:center;gap:12px}
header .l img{width:30px;height:30px;object-fit:contain;border-radius:4px;filter:drop-shadow(0 0 10px rgba(255,107,0,.25))}
header .l span{font-size:18px;font-weight:700;letter-spacing:-.3px;color:#f5f5f5}
header .l span em{font-style:normal;color:#FF9500;text-shadow:0 0 12px rgba(255,149,0,.35)}
header nav{display:flex;align-items:center;gap:28px}
header nav a{color:rgba(245,245,245,.45);text-decoration:none;font-size:14px;font-weight:600;transition:all .3s;position:relative}
header nav a::after{content:'';position:absolute;bottom:-4px;left:0;width:0;height:2px;background:#FF9500;transition:width .3s}
header nav a:hover{color:#FF9500;text-shadow:0 0 10px rgba(255,149,0,.35)}
header nav a:hover::after{width:100%}
header .cta{background:linear-gradient(135deg,#FF6B00,#FF9500);color:#fff;padding:9px 22px;border-radius:100px;font-size:13px;font-weight:700;text-decoration:none;transition:all .3s;box-shadow:0 0 25px rgba(255,107,0,.2)}
header .cta:hover{transform:scale(1.05);box-shadow:0 0 45px rgba(255,107,0,.35)}
@media(max-width:640px){header nav a:not(.cta){display:none}}
.hero{min-height:100vh;display:flex;align-items:center;justify-content:center;text-align:center;padding:120px 24px 60px;position:relative}
.hi{max-width:720px;position:relative;z-index:1}
.hg{position:absolute;width:600px;height:600px;border-radius:50%;background:radial-gradient(circle,rgba(255,107,0,.06),transparent 70%);top:50%;left:50%;transform:translate(-50%,-50%);pointer-events:none;animation:pg 4s ease-in-out infinite}
@keyframes pg{0%,100%{opacity:.5;transform:translate(-50%,-50%) scale(1)}50%{opacity:1;transform:translate(-50%,-50%) scale(1.15)}}
.lw{width:120px;height:120px;margin:0 auto 28px;position:relative}
.lr{position:absolute;inset:-20px;border-radius:50%;border:1.5px solid rgba(255,107,0,.1)}
.lr:nth-child(2){inset:-34px;border-color:rgba(255,149,0,.06);animation:sp 12s linear infinite}
@keyframes sp{to{transform:rotate(360deg)}}
.lw img{width:100%;height:100%;object-fit:contain;border-radius:10px;position:relative;z-index:2;filter:drop-shadow(0 0 30px rgba(255,107,0,.2))}
.bd{display:inline-flex;align-items:center;gap:6px;background:rgba(25,10,0,.45);border:1px solid rgba(255,107,0,.08);border-radius:100px;padding:6px 16px;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:1.5px;color:rgba(255,149,0,.7);margin-bottom:24px;backdrop-filter:blur(4px)}
.bd span{width:6px;height:6px;border-radius:50%;background:#A8FF35;display:inline-block;animation:pp 2s infinite;box-shadow:0 0 8px #A8FF35}
@keyframes pp{0%,100%{opacity:1}50%{opacity:.3}}
.hero h1{font-size:clamp(3rem,8vw,5rem);font-weight:900;line-height:1.08;letter-spacing:-2.5px;margin-bottom:14px;color:#f5f5f5}
.hero h1 em{font-style:normal;background:linear-gradient(135deg,#A8FF35,#00FF88);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent}
.hero p{font-size:clamp(1.1rem,2vw,1.35rem);color:rgba(245,245,245,.55);line-height:1.7;max-width:550px;margin:0 auto 36px}
.hero p strong{color:rgba(245,245,245,.75);font-weight:600}
.fl{animation:fy 6s ease-in-out infinite}
@keyframes fy{0%,100%{transform:translateY(0)}50%{transform:translateY(-12px)}}
.bt{display:flex;flex-wrap:wrap;gap:12px;justify-content:center;margin-bottom:50px}
.bp{background:linear-gradient(135deg,#FF6B00,#FF9500);color:#fff;padding:15px 36px;border-radius:100px;font-size:15px;font-weight:700;text-decoration:none;transition:all .4s;box-shadow:0 0 35px rgba(255,107,0,.15)}
.bp:hover{transform:translateY(-3px);box-shadow:0 12px 45px rgba(255,107,0,.3)}
.bs{background:rgba(25,10,0,.35);backdrop-filter:blur(8px);color:rgba(245,245,245,.7);border:1.5px solid rgba(255,107,0,.08);padding:15px 36px;border-radius:100px;font-size:15px;font-weight:600;text-decoration:none;transition:all .3s}
.bs:hover{border-color:rgba(255,107,0,.2);color:#FF9500;text-shadow:0 0 10px rgba(255,149,0,.35);transform:translateY(-2px)}
.st{display:flex;flex-wrap:wrap;gap:40px;justify-content:center}
.sn{font-size:2.2rem;font-weight:900;background:linear-gradient(135deg,#FF6B00,#FF9500);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;filter:drop-shadow(0 0 8px rgba(255,107,0,.25))}
.sl{font-size:12px;color:rgba(255,149,0,.25);text-transform:uppercase;letter-spacing:3px;margin-top:4px}
@media(max-width:640px){.st{gap:24px}.sn{font-size:1.8rem}}
section{padding:100px 24px}
section>.in{max-width:1000px;margin:0 auto}
.sh{text-align:center;margin-bottom:50px}
.sb{display:inline-flex;align-items:center;gap:4px;background:rgba(25,10,0,.4);border:1px solid rgba(255,107,0,.06);border-radius:100px;padding:5px 14px;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:1.5px;color:rgba(255,149,0,.55);margin-bottom:16px;backdrop-filter:blur(4px)}
.sh h2{font-size:clamp(2rem,4vw,2.8rem);font-weight:800;letter-spacing:-1.5px;margin-bottom:12px;line-height:1.2;color:#f5f5f5}
.sh h2 em{font-style:normal;color:#FF9500;text-shadow:0 0 15px rgba(255,149,0,.3)}
.sh p{font-size:17px;color:rgba(245,245,245,.5);line-height:1.7;max-width:550px;margin:0 auto}
.fg{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:14px}
.fc{background:rgba(25,10,0,.12);border:1px solid rgba(255,107,0,.05);border-radius:18px;padding:34px 30px;transition:all .4s;position:relative;overflow:hidden}
.fc::before{content:'';position:absolute;top:0;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent,rgba(255,107,0,.12),transparent);opacity:0;transition:opacity .4s}
.fc:hover{transform:translateY(-6px);border-color:rgba(255,107,0,.12);background:rgba(25,10,0,.2);box-shadow:0 20px 60px rgba(0,0,0,.3),0 0 40px rgba(255,107,0,.06)}
.fc:hover::before{opacity:1}
.fi{width:46px;height:46px;border-radius:12px;display:flex;align-items:center;justify-content:center;background:rgba(255,107,0,.06);border:1px solid rgba(255,107,0,.1);margin-bottom:16px;font-size:22px;transition:all .3s}
.fc:hover .fi{background:rgba(255,107,0,.1);border-color:rgba(255,107,0,.18);box-shadow:0 0 20px rgba(255,107,0,.12)}
.fc h3{font-size:18px;font-weight:700;margin-bottom:6px;color:#f5f5f5}
.fc p{font-size:15px;color:rgba(245,245,245,.5);line-height:1.6}
.rm{display:flex;flex-direction:column;gap:0;max-width:720px;margin:0 auto}
.ri{border-left:1.5px solid rgba(255,107,0,.08);padding:0 0 40px 36px;position:relative}
.ri:last-child{padding-bottom:0;border-left-color:transparent}
.rd{position:absolute;left:-6px;width:12px;height:12px;border-radius:50%;top:4px}
.ri .tg{font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;display:inline-block;margin-bottom:6px}
.ri h4{font-size:20px;font-weight:700;margin-bottom:3px;color:#f5f5f5}
.ri p{font-size:16px;color:rgba(245,245,245,.5);line-height:1.5}
.cg{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:14px;max-width:650px;margin:0 auto}
.cc{background:rgba(25,10,0,.1);border:1px solid rgba(255,107,0,.04);border-radius:16px;padding:34px 24px;text-align:center;text-decoration:none;color:#f5f5f5;transition:all .4s;position:relative;overflow:hidden}
.cc::before{content:'';position:absolute;top:0;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent,rgba(255,107,0,.1),transparent);opacity:0;transition:opacity .4s}
.cc:hover{transform:translateY(-4px);border-color:rgba(255,107,0,.12);background:rgba(25,10,0,.18);box-shadow:0 12px 40px rgba(0,0,0,.25),0 0 25px rgba(255,107,0,.06)}
.cc:hover::before{opacity:1}
.cc:hover .ic{text-shadow:0 0 20px rgba(255,107,0,.5)}
.cc .ic{font-size:30px;margin-bottom:12px;transition:all .3s}
.cc .nm{font-size:15px;font-weight:600;margin-bottom:4px;color:#f5f5f5}
.cc .dc{font-size:13px;color:rgba(255,149,0,.35)}
.ftr{text-align:center;padding:36px 24px;border-top:1px solid rgba(255,107,0,.02)}
.ftr .fl{display:flex;align-items:center;justify-content:center;gap:8px;margin-bottom:12px}
.ftr .fl img{width:20px;height:20px;object-fit:contain;border-radius:4px;filter:drop-shadow(0 0 5px rgba(255,107,0,.12))}
.ftr .fl span{font-size:14px;font-weight:600;color:rgba(245,245,245,.25)}
.ftr .fl span em{font-style:normal;color:#FF9500}
.ftr p{font-size:11px;color:rgba(245,245,245,.08)}
.rv{opacity:0;transform:translateY(40px);transition:all .8s cubic-bezier(.25,.46,.45,.94)}
.rv.vs{opacity:1;transform:translateY(0)}
.d1{transition-delay:.1s}
.d2{transition-delay:.2s}
.d3{transition-delay:.3s}
.d4{transition-delay:.4s}
</style>
</head><body>
<pCanvas id="pCanvas"></pCanvas>
<lCanvas id="lCanvas"></lCanvas>
<fCanvas id="fCanvas"></fCanvas>
<div class="go"></div><div class="ns"></div>
<header id="hdr"><div class="in"><div class="l"><img src="${logoDataUri}" alt=""><span>Saude do <em>Gueto</em></span></div><nav><a href="#app">App</a><a href="#road">Roadmap</a><a href="#ctt">Contato</a><a href="#app" class="cta">Baixar App</a></nav></div></header>
<section class="hero"><div class="hg"></div><div class="hi"><div class="lw"><div class="lr"></div><div class="lr"></div><img src="${logoDataUri}" alt="Saude do Gueto"></div><div class="bd"><span></span>App lancado</div><h1 class="fl">Tecnologia<br><em>do povo</em></h1><p>O app que nasceu na quebrada, feito por Agente Comunitaria de Saude, pra ACS. <strong>Saude com dignidade, tecnologia com alma.</strong></p><div class="bt"><a href="#app" class="bp">Conheca o App</a><a href="#ctt" class="bs">Fale Conosco</a></div><div class="st"><div class="s"><div class="sn">14</div><div class="sl">Telas</div></div><div class="s"><div class="sn">100%</div><div class="sl">Offline</div></div><div class="s"><div class="sn">1</div><div class="sl">ACS</div></div><div class="s"><div class="sn">&infin;</div><div class="sl">Comunidade</div></div></div></div></section>
<section id="app"><div class="in"><div class="sh rv"><div class="sb">O App</div><h2>Feito pra <em>trabalhar na ponta</em></h2><p>Sem internet? Sem problema. Tudo funciona offline, direto no seu celular.</p></div><div class="fg">
<div class="fc rv d1"><div class="fi">📋</div><h3>Cadastro Offline</h3><p>Cadastre pacientes mesmo sem internet. Dados salvos localmente.</p></div>
<div class="fc rv d2"><div class="fi">📍</div><h3>Familias</h3><p>Organize por microarea, veja historico e condicoes de saude.</p></div>
<div class="fc rv d3"><div class="fi">📊</div><h3>Relatorios</h3><p>Relatorios automaticos com dados mensais de visitas.</p></div>
<div class="fc rv d1"><div class="fi">🏥</div><h3>e-SUS</h3><p>Exportacao compativel com o sistema e-SUS.</p></div>
<div class="fc rv d2"><div class="fi">🔔</div><h3>Lembretes</h3><p>Notificacoes de visitas agendadas.</p></div>
<div class="fc rv d3"><div class="fi">🔒</div><h3>Seguranca</h3><p>Login protegido com senha, dados no celular.</p></div>
</div></div></section>
<section id="road"><div class="in"><div class="sh rv"><div class="sb">Roadmap</div><h2>O que <em>vem por ai</em></h2><p>A jornada do Saude do Gueto esta so comecando.</p></div><div class="rm">
<div class="ri rv"><div class="rd" style="background:#FF9500;box-shadow:0 0 10px rgba(255,149,0,.6)"></div><div class="tg" style="color:rgba(255,149,0,.7)">Feito</div><h4>App Mobile v1.0</h4><p>14 telas, offline, tema escuro, e-SUS, lembretes</p></div>
<div class="ri rv"><div class="rd" style="background:#A8FF35;box-shadow:0 0 10px rgba(168,255,53,.5)"></div><div class="tg" style="color:rgba(168,255,53,.7)">Em andamento</div><h4>Site + Twitter</h4><p>Presenca digital e comunicacao com a comunidade</p></div>
<div class="ri rv"><div class="rd" style="background:rgba(245,245,245,.2);box-shadow:0 0 6px rgba(245,245,245,.15)"></div><div class="tg" style="color:rgba(245,245,245,.3)">Proximo</div><h4>Novas funcionalidades</h4><p>Mapa do territorio, compartilhamento de dados, e mais</p></div>
</div></div></section>
<section id="ctt"><div class="in"><div class="sh rv"><div class="sb">Fale com a gente</div><h2>Bora <em>trocar ideia</em></h2><p>Quer saber mais ou levar o Saude do Gueto pra sua comunidade? Chama a gente.</p></div><div class="cg">
<a href="https://twitter.com/saudedogueto" target="_blank" class="cc rv d1"><div class="ic">🐦</div><div class="nm">Twitter</div><div class="dc">@saudedogueto</div></a>
<a href="https://instagram.com/saudedogueto" target="_blank" class="cc rv d2"><div class="ic">📸</div><div class="nm">Instagram</div><div class="dc">@saudedogueto</div></a>
<a href="mailto:saudedogueto@gmail.com" class="cc rv d3"><div class="ic">✉️</div><div class="nm">Email</div><div class="dc">saudedogueto@gmail.com</div></a>
</div></div></section>
<footer class="ftr"><div class="fl"><img src="${logoDataUri}" alt=""><span>Saude do <em>Gueto</em></span></div><p>Do povo, para o povo. &copy; 2026</p></footer>
<script>
// PARTICULAS
(function(){var c=document.getElementById('pCanvas'),ctx=c.getContext('2d');var w,h,p=[],m=80;function rs(){w=c.width=innerWidth;h=c.height=innerHeight}function ra(a,b){return Math.random()*(b-a)+a}function Pt(){this.x=ra(0,w);this.y=ra(0,h);this.vx=ra(-.5,.5);this.vy=ra(-.6,-.1);this.r=ra(1,2.5);this.a=ra(.1,.5)}Pt.prototype.up=function(){this.x+=this.vx;this.y+=this.vy;if(this.y<-10){this.y=h+10;this.x=ra(0,w);this.vx=ra(-.5,.5)}if(this.x<-10||this.x>w+10){this.x=ra(0,w);this.y=ra(0,h)}};Pt.prototype.dr=function(){ctx.beginPath();ctx.arc(this.x,this.y,this.r,0,Math.PI*2);ctx.fillStyle='rgba(255,107,0,'+this.a+')';ctx.fill()};function init(){rs();p=[];for(var i=0;i<m;i++)p.push(new Pt())}function dr(){ctx.clearRect(0,0,w,h);for(var i=0;i<p.length;i++)for(var j=i+1;j<p.length;j++){var dx=p[i].x-p[j].x,dy=p[i].y-p[j].y;var d=Math.sqrt(dx*dx+dy*dy);if(d<150){ctx.beginPath();ctx.moveTo(p[i].x,p[i].y);ctx.lineTo(p[j].x,p[j].y);ctx.strokeStyle='rgba(255,107,0,'+(.02*(1-d/150))+')';ctx.lineWidth=.5;ctx.stroke()}}p.forEach(function(q){q.up();q.dr()});requestAnimationFrame(dr)}init();dr();window.addEventListener('resize',function(){rs();p.forEach(function(q){q.x=Math.min(q.x,w);q.y=Math.min(q.y,h)})});})();
// VAGALUMES
(function(){var c=document.getElementById('fCanvas'),ctx=c.getContext('2d');var w,h,f=[],m=30;function rs(){c.width=w=innerWidth;c.height=h=innerHeight}function ra(a,b){return Math.random()*(b-a)+a}function FF(){this.x=ra(0,w);this.y=ra(0,h);this.tx=ra(0,w);this.ty=ra(0,h);this.sp=ra(.003,.01);this.r=ra(2,4.5);this.br=ra(.3,.9);this.bd=ra(.005,.02);this.age=0;this.lf=ra(200,600);this.al=true;this.gr=ra(10,30)}FF.prototype.up=function(){this.age++;if(this.age>this.lf){this.al=false;return}this.x+=(this.tx-this.x)*this.sp;this.y+=(this.ty-this.y)*this.sp;this.br+=this.bd;if(this.br>.95||this.br<.1)this.bd*=-1;if(Math.abs(this.x-this.tx)<5&&Math.abs(this.y-this.ty)<5){this.tx=ra(0,w);this.ty=ra(0,h)}};FF.prototype.dr=function(){var al=this.br*0.85;var g=ctx.createRadialGradient(this.x,this.y,0,this.x,this.y,this.gr);g.addColorStop(0,'rgba(168,255,53,'+(al*0.35)+')');g.addColorStop(0.5,'rgba(57,255,20,'+(al*0.12)+')');g.addColorStop(1,'rgba(57,255,20,0)');ctx.beginPath();ctx.arc(this.x,this.y,this.gr,0,Math.PI*2);ctx.fillStyle=g;ctx.fill();ctx.beginPath();ctx.arc(this.x,this.y,this.r,0,Math.PI*2);ctx.fillStyle='rgba(245,245,245,'+al+')';ctx.fill();ctx.beginPath();ctx.arc(this.x,this.y,this.r*0.5,0,Math.PI*2);ctx.fillStyle='rgba(255,255,255,'+al+')';ctx.fill()};function init(){rs();f=[];for(var i=0;i<m;i++)f.push(new FF())}function dr(){ctx.clearRect(0,0,w,h);f.forEach(function(v){if(v.al){v.up();v.dr()}});for(var i=f.length-1;i>=0;i--){if(!f[i].al)f[i]=new FF()}requestAnimationFrame(dr)}init();dr();window.addEventListener('resize',function(){rs();f.forEach(function(v){v.x=Math.min(v.x,w);v.y=Math.min(v.y,h)})});})();
// FOLHAS SECAS
(function(){var c=document.getElementById('lCanvas'),ctx=c.getContext('2d');var w,h,f=[],m=18;function rs(){c.width=w=innerWidth;c.height=h=innerHeight}function ra(a,b){return Math.random()*(b-a)+a}function Fl(){this.rs(true)}Fl.prototype.rs=function(i){this.x=ra(-50,w+50);this.y=i?ra(-h,0):-60;this.sz=ra(8,18);this.rt=ra(0,Math.PI*2);this.rs2=ra(-.02,.02);this.sy=ra(.4,1);this.sx=ra(-.3,.3);this.sw=ra(1,3);this.ss=ra(.01,.03);this.so=ra(0,Math.PI*2);this.op=ra(.2,.5);var cs=['#8B5E3C','#A0724A','#6D4828','#7A5535','#C4944A'];this.co=cs[Math.floor(ra(0,cs.length))]};Fl.prototype.up=function(sy){this.y+=this.sy;var wd=sy*0.001;this.x+=this.sx+Math.sin(this.so+Date.now()*this.ss)*this.sw*0.3+wd;this.rt+=this.rs2;if(this.y>h+60||this.x>w+100||this.x<-100)this.rs(false)};Fl.prototype.dr=function(){ctx.save();ctx.translate(this.x,this.y);ctx.rotate(this.rt);ctx.globalAlpha=this.op;ctx.fillStyle=this.co;var s=this.sz;ctx.beginPath();ctx.moveTo(0,-s*0.3);ctx.quadraticCurveTo(s*0.6,-s*0.2,s*0.5,0);ctx.quadraticCurveTo(s*0.6,s*0.2,0,s*0.3);ctx.quadraticCurveTo(-s*0.6,s*0.2,-s*0.5,0);ctx.quadraticCurveTo(-s*0.6,-s*0.2,0,-s*0.3);ctx.closePath();ctx.fill();ctx.strokeStyle='rgba(0,0,0,'+(this.op*0.15)+')';ctx.lineWidth=0.5;ctx.beginPath();ctx.moveTo(0,-s*0.25);ctx.lineTo(0,s*0.25);ctx.stroke();ctx.restore()};function init(){rs();f=[];for(var i=0;i<m;i++)f.push(new Fl())}function dr(){ctx.clearRect(0,0,w,h);var sy=window.scrollY||window.pageYOffset||0;f.forEach(function(v){v.up(sy);v.dr()});requestAnimationFrame(dr)}init();dr();window.addEventListener('resize',function(){rs();f.forEach(function(v){v.x=Math.min(v.x,w);v.y=Math.min(v.y,h)})});})();
// REVEAL
(function(){var e=document.querySelectorAll('.rv');function c(){var wh=innerHeight-80;e.forEach(function(el){var r=el.getBoundingClientRect();if(r.top<wh)el.classList.add('vs')})}window.addEventListener('scroll',c);window.addEventListener('resize',c);c()})();
// HEADER
(function(){var h=document.getElementById('hdr');window.addEventListener('scroll',function(){h.classList.toggle('scrolled',window.scrollY>50)})})();
</script></body></html>`;

fs.writeFileSync(path.join(__dirname, 'index.html'), h, 'utf8');
console.log(`OK - ${(h.length / 1024).toFixed(1)} KB`);
const refs = (h.match(/[Ll][Oo][Gg][Oo]\.jpg/g) || []).length;
console.log(`Referencias logo.jpg: ${refs}`);
