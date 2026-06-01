const fs = require('fs');
const path = require('path');

const logoPath = path.join(__dirname, 'logo.jpg');
const logoB64 = fs.readFileSync(logoPath).toString('base64');
const logoDataUri = `data:image/jpeg;base64,${logoB64}`;

const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>Saude do Gueto</title>
<link rel="icon" type="image/svg+xml" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='48' fill='none' stroke='%23FFA500' stroke-width='2'/%3E%3Ctext x='50' y='68' text-anchor='middle' font-size='44' fill='%23FFA500'%3ESG%3C/text%3E%3C/svg%3E">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">

<style>
*,*::before,*::after{margin:0;padding:0;box-sizing:border-box}
html{scroll-behavior:smooth}
body{
  font-family:'Inter',system-ui,-apple-system,sans-serif;
  background:#060b06;color:#fff;overflow-x:hidden;
  -webkit-font-smoothing:antialiased
}
#canvas{position:fixed;top:0;left:0;width:100%;height:100%;z-index:-2}
.grad-overlay{position:fixed;inset:0;z-index:-1;
  background:radial-gradient(ellipse 1000px 600px at 0% 100%,rgba(255,140,0,0.06),transparent),
             radial-gradient(ellipse 800px 800px at 100% 0%,rgba(0,200,80,0.04),transparent),
             radial-gradient(ellipse 500px 500px at 50% 50%,rgba(255,165,0,0.02),transparent)}
.noise{position:fixed;inset:0;z-index:-1;opacity:.015;pointer-events:none;
  background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.8' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")}
::-webkit-scrollbar{width:4px}
::-webkit-scrollbar-track{background:#060b06}
::-webkit-scrollbar-thumb{background:rgba(255,165,0,.15);border-radius:10px}
header{position:fixed;top:0;left:0;right:0;z-index:100;padding:14px 28px;
  background:rgba(6,11,6,.7);backdrop-filter:blur(30px) saturate(1.6);
  border-bottom:1px solid rgba(255,165,0,.04);transition:all .3s}
header.scrolled{background:rgba(6,11,6,.85);border-bottom-color:rgba(255,165,0,.08)}
header .inner{max-width:1200px;margin:0 auto;display:flex;align-items:center;justify-content:space-between}
header .left{display:flex;align-items:center;gap:10px}
header .left img{width:28px;height:28px;object-fit:contain;border-radius:4px;filter:drop-shadow(0 0 8px rgba(255,165,0,.15))}
header .left span{font-size:16px;font-weight:700;letter-spacing:-.3px}
header .left span em{font-style:normal;color:#FFA500}
header nav{display:flex;align-items:center;gap:24px}
header nav a{color:rgba(255,255,255,.35);text-decoration:none;font-size:13px;font-weight:500;transition:all .3s;position:relative}
header nav a::after{content:'';position:absolute;bottom:-4px;left:0;width:0;height:1.5px;background:#FFA500;transition:width .3s}
header nav a:hover{color:#FFA500}
header nav a:hover::after{width:100%}
header .cta{background:linear-gradient(135deg,#e67e00,#ff9500);color:#fff;padding:7px 20px;border-radius:100px;font-size:12px;font-weight:600;text-decoration:none;transition:all .3s;box-shadow:0 0 20px rgba(255,165,0,.1)}
header .cta:hover{transform:scale(1.05);box-shadow:0 0 40px rgba(255,165,0,.2)}
@media(max-width:640px){header nav a:not(.cta){display:none}}
.hero{min-height:100vh;display:flex;align-items:center;justify-content:center;text-align:center;padding:120px 24px 60px;position:relative}
.hero-inner{max-width:700px;position:relative;z-index:1}
.hero-glow{position:absolute;width:500px;height:500px;border-radius:50%;background:radial-gradient(circle,rgba(255,165,0,.04),transparent 70%);top:50%;left:50%;transform:translate(-50%,-50%);pointer-events:none;animation:pulseGlow 4s ease-in-out infinite}
@keyframes pulseGlow{0%,100%{opacity:.5;transform:translate(-50%,-50%) scale(1)}50%{opacity:1;transform:translate(-50%,-50%) scale(1.1)}}
.logo-wrap{width:110px;height:110px;margin:0 auto 24px;position:relative}
.logo-ring{position:absolute;inset:-18px;border-radius:50%;border:1px solid rgba(255,165,0,.06)}
.logo-ring:nth-child(2){inset:-30px;border-color:rgba(255,165,0,.03);animation:spin 12s linear infinite}
@keyframes spin{to{transform:rotate(360deg)}}
.logo-wrap img{width:100%;height:100%;object-fit:contain;border-radius:8px;position:relative;z-index:2;filter:drop-shadow(0 0 25px rgba(255,165,0,.12))}
.badge{display:inline-flex;align-items:center;gap:6px;background:rgba(20,30,20,.4);border:1px solid rgba(255,165,0,.06);border-radius:100px;padding:5px 14px;font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:1.5px;color:rgba(255,183,77,.5);margin-bottom:20px;backdrop-filter:blur(4px)}
.badge span{width:5px;height:5px;border-radius:50%;background:#22c55e;display:inline-block;animation:pulse 2s infinite}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
.hero h1{font-size:clamp(2.5rem,7vw,4.2rem);font-weight:900;line-height:1.08;letter-spacing:-2px;margin-bottom:10px}
.hero h1 em{font-style:normal;background:linear-gradient(135deg,#FFA500,#ffcc00);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent}
.hero p{font-size:clamp(.95rem,1.8vw,1.1rem);color:rgba(255,255,255,.35);line-height:1.7;max-width:500px;margin:0 auto 32px}
.hero p strong{color:rgba(255,255,255,.5);font-weight:500}
.floating{animation:floatY 6s ease-in-out infinite}
@keyframes floatY{0%,100%{transform:translateY(0)}50%{transform:translateY(-12px)}}
.btns{display:flex;flex-wrap:wrap;gap:10px;justify-content:center;margin-bottom:44px}
.btn-p{background:linear-gradient(135deg,#e67e00,#ff9500);color:#fff;padding:13px 30px;border-radius:100px;font-size:13px;font-weight:600;text-decoration:none;transition:all .4s;box-shadow:0 0 30px rgba(255,165,0,.08)}
.btn-p:hover{transform:translateY(-3px);box-shadow:0 12px 40px rgba(255,165,0,.2)}
.btn-s{background:rgba(20,30,20,.3);backdrop-filter:blur(8px);color:rgba(255,255,255,.7);border:1px solid rgba(255,165,0,.06);padding:13px 30px;border-radius:100px;font-size:13px;font-weight:600;text-decoration:none;transition:all .3s}
.btn-s:hover{border-color:rgba(255,165,0,.15);color:#fff;transform:translateY(-2px)}
.stats{display:flex;flex-wrap:wrap;gap:32px;justify-content:center}
.stat{text-align:center}
.stat-n{font-size:2rem;font-weight:900;background:linear-gradient(135deg,#FFA500,#ffcc00);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent}
.stat-l{font-size:10px;color:rgba(255,255,255,.15);text-transform:uppercase;letter-spacing:2.5px;margin-top:4px}
@media(max-width:640px){.stats{gap:20px}.stat-n{font-size:1.5rem}}
section{padding:90px 24px}
section>.inner{max-width:1000px;margin:0 auto}
.sh{text-align:center;margin-bottom:44px}
.sh-b{display:inline-flex;align-items:center;gap:4px;background:rgba(20,30,20,.35);border:1px solid rgba(255,165,0,.04);border-radius:100px;padding:4px 12px;font-size:9px;font-weight:600;text-transform:uppercase;letter-spacing:1.5px;color:rgba(255,183,77,.45);margin-bottom:14px;backdrop-filter:blur(4px)}
.sh h2{font-size:clamp(1.6rem,3.5vw,2.5rem);font-weight:800;letter-spacing:-1px;margin-bottom:8px;line-height:1.2}
.sh h2 em{font-style:normal;color:#FFA500}
.sh p{font-size:14px;color:rgba(255,255,255,.3);line-height:1.6;max-width:500px;margin:0 auto}
.features-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:12px}
.f-card{background:rgba(20,30,20,.15);border:1px solid rgba(255,165,0,.04);border-radius:16px;padding:30px 26px;transition:all .4s;position:relative;overflow:hidden}
.f-card::before{content:'';position:absolute;top:0;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent,rgba(255,165,0,.1),transparent);opacity:0;transition:opacity .4s}
.f-card:hover{transform:translateY(-6px);border-color:rgba(255,165,0,.12);background:rgba(20,30,20,.25);box-shadow:0 20px 60px rgba(0,0,0,.3)}
.f-card:hover::before{opacity:1}
.f-icon{width:42px;height:42px;border-radius:10px;display:flex;align-items:center;justify-content:center;background:rgba(255,165,0,.04);border:1px solid rgba(255,165,0,.08);margin-bottom:14px;font-size:19px;transition:all .3s}
.f-card:hover .f-icon{background:rgba(255,165,0,.08);border-color:rgba(255,165,0,.15)}
.f-card h3{font-size:15px;font-weight:700;margin-bottom:5px}
.f-card p{font-size:13px;color:rgba(255,255,255,.3);line-height:1.6}
.rm{display:flex;flex-direction:column;gap:0;max-width:700px;margin:0 auto}
.rm-item{border-left:1px solid rgba(255,165,0,.06);padding:0 0 36px 32px;position:relative}
.rm-item:last-child{padding-bottom:0;border-left-color:transparent}
.rm-dot{position:absolute;left:-5px;width:10px;height:10px;border-radius:50%;top:4px}
.rm-item .tag{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;display:inline-block;margin-bottom:4px}
.rm-item h4{font-size:17px;font-weight:700;margin-bottom:2px}
.rm-item p{font-size:13px;color:rgba(255,255,255,.3);line-height:1.5}
.cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:10px;max-width:600px;margin:0 auto}
.cc{background:rgba(20,30,20,.12);border:1px solid rgba(255,165,0,.03);border-radius:14px;padding:30px 20px;text-align:center;text-decoration:none;color:#fff;transition:all .4s;position:relative;overflow:hidden}
.cc::before{content:'';position:absolute;top:0;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent,rgba(255,165,0,.08),transparent);opacity:0;transition:opacity .4s}
.cc:hover{transform:translateY(-4px);border-color:rgba(255,165,0,.1);background:rgba(20,30,20,.2);box-shadow:0 12px 40px rgba(0,0,0,.2)}
.cc:hover::before{opacity:1}
.cc .ic{font-size:26px;margin-bottom:10px}
.cc .name{font-size:13px;font-weight:600;margin-bottom:3px}
.cc .desc{font-size:11px;color:rgba(255,255,255,.25)}
footer{text-align:center;padding:32px 24px;border-top:1px solid rgba(255,255,255,.015)}
footer .fl{display:flex;align-items:center;justify-content:center;gap:6px;margin-bottom:10px}
footer .fl img{width:18px;height:18px;object-fit:contain;border-radius:3px}
footer .fl span{font-size:12px;font-weight:600;color:rgba(255,255,255,.2)}
footer .fl span em{font-style:normal;color:#FFA500}
footer p{font-size:10px;color:rgba(255,255,255,.06)}
.reveal{opacity:0;transform:translateY(40px);transition:all .8s cubic-bezier(.25,.46,.45,.94)}
.reveal.visible{opacity:1;transform:translateY(0)}
.reveal-delay-1{transition-delay:.1s}
.reveal-delay-2{transition-delay:.2s}
.reveal-delay-3{transition-delay:.3s}
.reveal-delay-4{transition-delay:.4s}
</style>
</head>
<body>

<canvas id="canvas"></canvas>
<div class="grad-overlay"></div>
<div class="noise"></div>

<header id="header">
  <div class="inner">
    <div class="left">
      <img src="${logoDataUri}" alt="">
      <span>Saude do <em>Gueto</em></span>
    </div>
    <nav>
      <a href="#app">App</a>
      <a href="#roadmap">Roadmap</a>
      <a href="#contato">Contato</a>
      <a href="#app" class="cta">Baixar App</a>
    </nav>
  </div>
</header>

<section class="hero">
  <div class="hero-glow"></div>
  <div class="hero-inner">
    <div class="logo-wrap">
      <div class="logo-ring"></div>
      <div class="logo-ring"></div>
      <img src="${logoDataUri}" alt="Saude do Gueto">
    </div>
    <div class="badge"><span></span>App lancado</div>
    <h1 class="floating">Tecnologia<br><em>do povo</em></h1>
    <p>O app que nasceu na quebrada, feito por Agente Comunitaria de Saude, pra ACS. <strong>Saude com dignidade, tecnologia com alma.</strong></p>
    <div class="btns">
      <a href="#app" class="btn-p">Conheca o App</a>
      <a href="#contato" class="btn-s">Fale Conosco</a>
    </div>
    <div class="stats">
      <div class="stat"><div class="stat-n">14</div><div class="stat-l">Telas</div></div>
      <div class="stat"><div class="stat-n">100%</div><div class="stat-l">Offline</div></div>
      <div class="stat"><div class="stat-n">1</div><div class="stat-l">ACS</div></div>
      <div class="stat"><div class="stat-n">&infin;</div><div class="stat-l">Comunidade</div></div>
    </div>
  </div>
</section>

<section id="app">
  <div class="inner">
    <div class="sh reveal">
      <div class="sh-b">O App</div>
      <h2>Feito pra <em>trabalhar na ponta</em></h2>
      <p>Sem internet? Sem problema. Tudo funciona offline, direto no seu celular.</p>
    </div>
    <div class="features-grid">
      <div class="f-card reveal reveal-delay-1">
        <div class="f-icon">&#128203;</div>
        <h3>Cadastro Offline</h3>
        <p>Cadastre pacientes mesmo sem internet. Dados salvos localmente.</p>
      </div>
      <div class="f-card reveal reveal-delay-2">
        <div class="f-icon">&#128205;</div>
        <h3>Familias</h3>
        <p>Organize por microarea, veja historico e condicoes de saude.</p>
      </div>
      <div class="f-card reveal reveal-delay-3">
        <div class="f-icon">&#128202;</div>
        <h3>Relatorios</h3>
        <p>Relatorios automaticos com dados mensais de visitas.</p>
      </div>
      <div class="f-card reveal reveal-delay-1">
        <div class="f-icon">&#127973;</div>
        <h3>e-SUS</h3>
        <p>Exportacao compativel com o sistema e-SUS.</p>
      </div>
      <div class="f-card reveal reveal-delay-2">
        <div class="f-icon">&#128276;</div>
        <h3>Lembretes</h3>
        <p>Notificacoes de visitas agendadas.</p>
      </div>
      <div class="f-card reveal reveal-delay-3">
        <div class="f-icon">&#128272;</div>
        <h3>Seguranca</h3>
        <p>Login protegido com senha, dados no celular.</p>
      </div>
    </div>
  </div>
</section>

<section id="roadmap">
  <div class="inner">
    <div class="sh reveal">
      <div class="sh-b">Roadmap</div>
      <h2>O que <em>vem por ai</em></h2>
      <p>A jornada do Saude do Gueto esta so comecando.</p>
    </div>
    <div class="rm">
      <div class="rm-item reveal">
        <div class="rm-dot" style="background:#FFA500;box-shadow:0 0 8px rgba(255,165,0,.4)"></div>
        <div class="tag" style="color:rgba(255,183,77,.6)">Feito</div>
        <h4>App Mobile v1.0</h4>
        <p>14 telas, offline, tema escuro, e-SUS, lembretes</p>
      </div>
      <div class="rm-item reveal">
        <div class="rm-dot" style="background:#22c55e"></div>
        <div class="tag" style="color:rgba(34,197,94,.6)">Em andamento</div>
        <h4>Site + Twitter</h4>
        <p>Presenca digital e comunicacao com a comunidade</p>
      </div>
      <div class="rm-item reveal">
        <div class="rm-dot" style="background:rgba(255,255,255,.15)"></div>
        <div class="tag" style="color:rgba(255,255,255,.2)">Proximo</div>
        <h4>Novas funcionalidades</h4>
        <p>Mapa do territorio, compartilhamento de dados, e mais</p>
      </div>
    </div>
  </div>
</section>

<section id="contato">
  <div class="inner">
    <div class="sh reveal">
      <div class="sh-b">Fale com a gente</div>
      <h2>Bora <em>trocar ideia</em></h2>
      <p>Quer saber mais ou levar o Saude do Gueto pra sua comunidade? Chama a gente.</p>
    </div>
    <div class="cards">
      <a href="https://twitter.com/saudedogueto" target="_blank" class="cc reveal reveal-delay-1">
        <div class="ic">&#128038;</div>
        <div class="name">Twitter</div>
        <div class="desc">@saudedogueto</div>
      </a>
      <a href="https://instagram.com/saudedogueto" target="_blank" class="cc reveal reveal-delay-2">
        <div class="ic">&#128248;</div>
        <div class="name">Instagram</div>
        <div class="desc">@saudedogueto</div>
      </a>
      <a href="mailto:saudedogueto@gmail.com" class="cc reveal reveal-delay-3">
        <div class="ic">&#9993;</div>
        <div class="name">Email</div>
        <div class="desc">saudedogueto@gmail.com</div>
      </a>
    </div>
  </div>
</section>

<footer>
  <div class="fl">
    <img src="${logoDataUri}" alt="">
    <span>Saude do <em>Gueto</em></span>
  </div>
  <p>Do povo, para o povo. &copy; 2026</p>
</footer>

<script>
(function(){
  var c=document.getElementById('canvas'),ctx=c.getContext('2d');
  var w,h,particles=[],max=80;
  function resize(){w=c.width=innerWidth;h=c.height=innerHeight}
  function rand(a,b){return Math.random()*(b-a)+a}
  function Particle(){
    this.x=rand(0,w);this.y=rand(0,h);
    this.vx=rand(-.5,.5);this.vy=rand(-.6,-.1);
    this.r=rand(1,2.5);this.a=rand(.1,.5);
  }
  Particle.prototype.update=function(){
    this.x+=this.vx;this.y+=this.vy;
    if(this.y<-10){this.y=h+10;this.x=rand(0,w);this.vx=rand(-.5,.5)}
    if(this.x<-10||this.x>w+10){this.x=rand(0,w);this.y=rand(0,h)}
  };
  Particle.prototype.draw=function(){
    ctx.beginPath();ctx.arc(this.x,this.y,this.r,0,Math.PI*2);
    ctx.fillStyle='rgba(255,165,0,'+this.a+')';ctx.fill();
  };
  function init(){
    resize();particles=[];
    for(var i=0;i<max;i++)particles.push(new Particle());
  }
  function draw(){
    ctx.clearRect(0,0,w,h);
    for(var i=0;i<particles.length;i++){
      for(var j=i+1;j<particles.length;j++){
        var dx=particles[i].x-particles[j].x,dy=particles[i].y-particles[j].y;
        var dist=Math.sqrt(dx*dx+dy*dy);
        if(dist<150){
          ctx.beginPath();ctx.moveTo(particles[i].x,particles[i].y);
          ctx.lineTo(particles[j].x,particles[j].y);
          ctx.strokeStyle='rgba(255,165,0,'+(.02*(1-dist/150))+')';
          ctx.lineWidth=.5;ctx.stroke();
        }
      }
    }
    particles.forEach(function(p){p.update();p.draw()});
    requestAnimationFrame(draw);
  }
  init();draw();
  window.addEventListener('resize',function(){resize();particles.forEach(function(p){
    p.x=Math.min(p.x,w);p.y=Math.min(p.y,h)})});
})();
(function(){
  var els=document.querySelectorAll('.reveal');
  function check(){
    var wh=innerHeight-80;
    els.forEach(function(el){
      var rect=el.getBoundingClientRect();
      if(rect.top<wh)el.classList.add('visible');
    });
  }
  window.addEventListener('scroll',check);
  window.addEventListener('resize',check);
  check();
})();
(function(){
  var h=document.getElementById('header');
  window.addEventListener('scroll',function(){
    h.classList.toggle('scrolled',window.scrollY>50);
  });
})();
</script>
</body>
</html>`;

const outPath = path.join(__dirname, 'index.html');
fs.writeFileSync(outPath, html, 'utf8');
console.log(`HTML escrito: ${outPath}`);
console.log(`Tamanho: ${(html.length / 1024).toFixed(1)} KB`);
