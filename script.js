// Vídeo local da surpresa. Mantenha o arquivo junto de index.html.
// Fluxo: envelope → papel branco → saída em duas partes → vídeo ou espaço reservado.
const VIDEO_URL = 'surpresa.mp4';
const $ = (selector) => document.querySelector(selector);
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const welcome = $('.welcome'), play = $('#play');
let busy = false;

function flower(x,y,color,size=1){
  return `<g transform="translate(${x} ${y}) scale(${size})">${Array.from({length:7},(_,i)=>`<ellipse class="flower-petal" cx="0" cy="-18" rx="10" ry="21" fill="${color}" transform="rotate(${i*360/7})"/>`).join('')}<circle r="10" fill="#c6a34a"/><circle r="6" fill="#e7cf79"/></g>`;
}
const bouquet = `<svg viewBox="0 0 245 295" xmlns="http://www.w3.org/2000/svg"><g fill="none" stroke="#95a183" stroke-width="2"><path d="M120 295Q75 190 62 58M120 295Q150 175 179 112M120 295Q80 230 42 169M120 295Q138 190 128 30"/></g><g fill="#a9b398"><ellipse cx="91" cy="205" rx="9" ry="29" transform="rotate(-41 91 205)"/><ellipse cx="143" cy="201" rx="10" ry="29" transform="rotate(35 143 201)"/><ellipse cx="112" cy="144" rx="8" ry="23" transform="rotate(-37 112 144)"/><ellipse cx="70" cy="117" rx="8" ry="22" transform="rotate(33 70 117)"/></g>${flower(62,58,'#e4c65c',.9)}${flower(179,112,'#9bbbcf',1.05)}${flower(42,169,'#a8c5d5',.7)}${flower(128,30,'#ebd583',.65)}</svg>`;
$('.garden').innerHTML = ['tl','tr','bl','br'].map(c=>`<div class="bouquet ${c}">${bouquet}</div>`).join('');
const delay = ms => new Promise(resolve=>setTimeout(resolve,ms));

// Trajeto fechado: as flores mantêm o coração mesmo com movimento reduzido.
const heartPath = $('#heart-orbit');
const heartLength = heartPath.getTotalLength();
const heartFlowers = $('.heart-flowers');
heartFlowers.innerHTML = Array.from({length:64},(_,i)=>
  `<g class="heart-flower">${flower(0,0,i%2?'#94b8ce':'#dec15b',.12+(i%4)*.018)}</g>`
).join('');
const orbitFlowers = [...heartFlowers.children];
let orbitFrame = 0;
let orbitProgress = 0;
let previousOrbitTime = null;
let heartActive = false;
let arrivalElapsed = 0;
let arrivalOrigins = [];
const arrivalDuration = 2100;
function resetHeart(){
  cancelAnimationFrame(orbitFrame);
  heartActive=false;previousOrbitTime=null;orbitProgress=0;arrivalElapsed=0;
  $('.flower-heart').classList.remove('heart-active');
}
function startHeart(){
  resetHeart();
  const inverse=$('.flower-heart').getScreenCTM().inverse();
  arrivalOrigins=orbitFlowers.map((_,i)=>{
    const fraction=((i*0.61803398875)%1);
    const side=i%4;
    const x=side===0?-24:side===1?innerWidth+24:fraction*innerWidth;
    const y=side===2?-24:side===3?innerHeight+24:fraction*innerHeight;
    return new DOMPoint(x,y).matrixTransform(inverse);
  });
  heartActive=true;
  if(reducedMotion.matches)arrivalElapsed=arrivalDuration+300;
  drawHeart();$('.flower-heart').classList.add('heart-active');
  syncHeartMotion();
}
function drawHeart(){
  orbitFlowers.forEach((node,i)=>{
    const point=heartPath.getPointAtLength(((i/orbitFlowers.length+orbitProgress)%1)*heartLength);
    const t=Math.max(0,Math.min(1,(arrivalElapsed-(i%8)*35)/arrivalDuration));
    const eased=t*t*(3-2*t);
    const origin=arrivalOrigins[i] || point;
    const drift=Math.sin(Math.PI*t)*24*(i%2?1:-1);
    const x=origin.x+(point.x-origin.x)*eased+drift;
    const y=origin.y+(point.y-origin.y)*eased;
    node.style.opacity=String(.78*Math.min(1,t*6));
    node.setAttribute('transform',`translate(${x} ${y}) rotate(${i*37+orbitProgress*360+(1-eased)*95})`);
  });
}
function animateHeart(time){
  if(previousOrbitTime!==null){
    const elapsed=Math.min(time-previousOrbitTime,50);
    orbitProgress=(orbitProgress+elapsed/42000)%1;
    arrivalElapsed+=elapsed;
  }
  previousOrbitTime=time;drawHeart();orbitFrame=requestAnimationFrame(animateHeart);
}
function syncHeartMotion(){
  cancelAnimationFrame(orbitFrame);previousOrbitTime=null;
  if(!heartActive)return;
  if(reducedMotion.matches)arrivalElapsed=arrivalDuration+300;
  drawHeart();
  if(!reducedMotion.matches&&!document.hidden)orbitFrame=requestAnimationFrame(animateHeart);
}
reducedMotion.addEventListener('change',syncHeartMotion);
document.addEventListener('visibilitychange',syncHeartMotion);
syncHeartMotion();

const envelope = $('#open-letter');
let envelopeRunning = false;
let envelopeOpened = false;
function measureMessage(){
  // Medir uma cópia evita alterar a posição/dimensão da folha visível.
  const measurement=$('.paper-peek').cloneNode(true);
  measurement.classList.add('measure-message');
  measurement.setAttribute('aria-hidden','true');
  measurement.querySelectorAll('[id]').forEach(node=>node.removeAttribute('id'));
  envelope.append(measurement);
  const paperHeight=measurement.scrollHeight;
  measurement.remove();
  $('.envelope-scene').style.setProperty('--message-height',`${paperHeight}px`);
}
window.addEventListener('resize',()=>{
  if($('.envelope-scene').classList.contains('reading-message')&&!busy)measureMessage();
});
const envelopePause = ms => delay(reducedMotion.matches ? 0 : ms);
async function openEnvelope(){
  if(envelopeRunning || envelopeOpened)return;
  envelopeRunning=true;
  startHeart();
  envelope.setAttribute('aria-busy','true');
  envelope.classList.add('envelope-jump');
  // O pulo termina exatamente na posição de repouso, sem uma segunda queda.
  await envelopePause(1100);
  envelope.classList.add('envelope-settled');
  envelope.classList.remove('envelope-jump');
  await envelopePause(120);
  envelope.classList.add('flap-open');
  await envelopePause(350);
  envelope.classList.add('flap-behind');
  await envelopePause(400);
  envelope.classList.add('paper-out');
  await envelopePause(950);
  const message=$('#paper-message');
  message.hidden=false;
  measureMessage();
  $('.envelope-scene').classList.add('reading-message');
  await envelopePause(1700);
  envelopeOpened=true;envelopeRunning=false;
  envelope.setAttribute('aria-expanded','true');
  envelope.setAttribute('aria-busy','false');
  envelope.setAttribute('aria-label','Envelope aberto para Duda');
  envelope.setAttribute('aria-describedby','paper-message');
  const instruction=$('.envelope-instruction');
  instruction.classList.add('fading-out');
  await envelopePause(550);
  instruction.hidden=true;
  play.hidden=false;$('.surprise-action').hidden=false;
  $('.status').textContent='A carta está aberta para leitura. O botão para assistir à mensagem está disponível abaixo.';
}
envelope.addEventListener('click',openEnvelope);
// A divisão usa cópias visuais recortadas, sem controles nem IDs duplicados.
// O envelope original continua intacto até a cena sair.
function tearEnvelope(){
  const stage=$('.departure-stage');
  const scene=$('.envelope-scene');
  const rect=scene.getBoundingClientRect();
  const seam='50% 0,49.4% 14%,50.8% 23%,49.5% 32%,50.6% 43%,49.2% 53%,50.7% 63%,49.5% 74%,50.5% 86%,50% 100%';
  const animations=[-1,1].map(direction=>{
    const piece=document.createElement('div');
    piece.className='paper-piece';
    Object.assign(piece.style,{left:`${rect.left}px`,top:`${rect.top-60}px`,width:`${rect.width}px`,height:`${rect.height+120}px`});
    piece.style.clipPath=direction<0?`polygon(0 0,${seam},0 100%)`:`polygon(${seam},100% 100%,100% 0)`;
    const copy=scene.cloneNode(true);
    copy.querySelector('.flower-heart').remove();
    copy.querySelectorAll('[id]').forEach(node=>node.removeAttribute('id'));
    copy.querySelectorAll('button').forEach(node=>{node.disabled=true;node.tabIndex=-1;});
    Object.assign(copy.style,{position:'absolute',top:'60px',left:'0',width:'100%',margin:'0',pointerEvents:'none'});
    piece.append(copy);stage.append(piece);
    const distance=innerWidth*.65+200;
    return piece.animate([
      {transform:'translate(0,0) rotate(0deg)',opacity:1},
      {transform:`translate(${direction*16}px, 3px) rotate(${direction*1.5}deg)`,opacity:1,offset:.25},
      {transform:`translate(${direction*distance}px, 65px) rotate(${direction*11}deg)`,opacity:0}
    ],{duration:1500,easing:'cubic-bezier(.35,0,.3,1)',fill:'forwards'});
  });
  envelope.style.visibility='hidden';
  return animations;
}
function scatterFlowers(){
  cancelAnimationFrame(orbitFrame);heartActive=false;
  const inverse=$('.flower-heart').getScreenCTM().inverse();
  return orbitFlowers.map((node,i)=>{
    const matrix=node.transform.baseVal.consolidate().matrix;
    const side=i%4,fraction=(i*.61803398875)%1;
    const target=new DOMPoint(side===0?-50:side===1?innerWidth+50:innerWidth*fraction,side===2?-50:side===3?innerHeight+50:innerHeight*fraction).matrixTransform(inverse);
    return node.animate([
      {transform:`translate(${matrix.e}px,${matrix.f}px) rotate(${i*37+orbitProgress*360}deg)`,opacity:.78},
      {transform:`translate(${target.x}px,${target.y}px) rotate(${i*37+orbitProgress*360+70}deg)`,opacity:0}
    ],{duration:1400,delay:(i%5)*25,easing:'cubic-bezier(.4,0,.25,1)',fill:'forwards'});
  });
}
play.addEventListener('click',async()=>{
  if(busy || !envelopeOpened)return;
  busy=true;play.disabled=true;
  welcome.inert=true;
  $('.status').textContent='Abrindo sua mensagem.';
  document.body.classList.add('departing');
  let animations=[];
  if(!reducedMotion.matches){
    animations=[...tearEnvelope(),...scatterFlowers()];
    // Uma mudança na preferência durante a saída também encerra o movimento.
    const finishMotion=()=>{if(reducedMotion.matches)animations.forEach(animation=>animation.finish());};
    reducedMotion.addEventListener('change',finishMotion);
    await Promise.allSettled(animations.map(animation=>animation.finished));
    reducedMotion.removeEventListener('change',finishMotion);
  }
  resetHeart();
  animations.forEach(animation=>animation.cancel());
  $('.departure-stage').replaceChildren();
  welcome.hidden=true;
  for(const selector of ['.garden','.page-header','footer'])$(selector).hidden=true;
  document.body.classList.add('video-mode');
  document.body.classList.remove('departing');
  $('#video-section').hidden=false;
  window.scrollTo({top:0,behavior:'instant'});
  $('#video-section').focus({preventScroll:true});
  $('.status').textContent='Uma mensagem somente para você. Use o play para assistir.';
});
// Música final: o contexto é liberado no gesto de iniciar o vídeo.
// O ganho funciona também em celulares que não permitem mudar audio.volume.
const finaleAudio = $('#finale-audio');
const musicToggle = $('#music-toggle');
const MUSIC_FADE_SECONDS = 6;
let musicContext;
let musicGain;
let musicStarting = false;

function prepareFinaleAudio() {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return;
  if (!musicContext) {
    musicContext = new AudioContextClass();
    musicGain = musicContext.createGain();
    musicGain.gain.value = 0;
    const source = musicContext.createMediaElementSource(finaleAudio);
    source.connect(musicGain);
    musicGain.connect(musicContext.destination);
  }
  return musicContext.resume();
}

async function startFinaleAudio() {
  if (musicStarting || $('#finale').hidden) return;
  musicStarting = true;
  musicToggle.hidden = false;
  try {
    await prepareFinaleAudio();
    if (musicGain) {
      musicGain.gain.cancelScheduledValues(musicContext.currentTime);
      musicGain.gain.setValueAtTime(0.02, musicContext.currentTime);
    } else {
      finaleAudio.volume = 0.02;
    }
    await finaleAudio.play();
    if (musicGain) {
      musicGain.gain.linearRampToValueAtTime(1, musicContext.currentTime + MUSIC_FADE_SECONDS);
    } else {
      const started = performance.now();
      const raiseVolume = () => {
        if (finaleAudio.paused) return;
        const progress = Math.min(1, (performance.now() - started) / (MUSIC_FADE_SECONDS * 1000));
        finaleAudio.volume = 0.02 + 0.98 * progress;
        if (progress < 1) requestAnimationFrame(raiseVolume);
      };
      requestAnimationFrame(raiseVolume);
    }
    musicToggle.textContent = 'Pausar música';
  } catch {
    musicToggle.textContent = 'Ouvir música';
    $('.status').textContent = 'Toque em Ouvir música para iniciar o áudio.';
  } finally {
    musicStarting = false;
  }
}

musicToggle.addEventListener('click', () => {
  if (musicStarting) return;
  if (finaleAudio.paused) {
    startFinaleAudio();
  } else {
    finaleAudio.pause();
    musicToggle.textContent = 'Ouvir música';
  }
});
window.addEventListener('pagehide', () => finaleAudio.pause());

let finaleStarted=false;
async function showFinale(){
  if(finaleStarted)return;
  finaleStarted=true;
  const video=$('#gift-video'),section=$('#video-section');
  video.pause();section.inert=true;
  if(document.fullscreenElement && section.contains(document.fullscreenElement)){
    await document.exitFullscreen().catch(()=>{});
  }
  if(video.webkitDisplayingFullscreen && video.webkitExitFullscreen)video.webkitExitFullscreen();
  if(!reducedMotion.matches){
    const fade=section.animate([{opacity:1},{opacity:0}],{duration:1200,easing:'ease-in-out',fill:'forwards'});
    const finishFade=()=>{if(reducedMotion.matches)fade.finish();};
    reducedMotion.addEventListener('change',finishFade);
    await fade.finished.catch(()=>{});
    reducedMotion.removeEventListener('change',finishFade);
    section.hidden=true;fade.cancel();
  }else section.hidden=true;
  const compactFinale=window.matchMedia('(max-width: 600px)').matches;
  const positions=[];
  $('.finale-flowers').innerHTML=Array.from({length:compactFinale?18:42},()=>{
    // Escolher entre posições aleatórias espaçadas evita fileiras e aglomerações.
    let chosen,spacing=-1;
    for(let attempt=0;attempt<50;attempt++){
      const candidate={
        x:8+Math.random()*84,
        y:compactFinale
          ? (Math.random()<.5?6+Math.random()*10:84+Math.random()*10)
          : 6+Math.random()*88
      };
      if(candidate.y>30 && candidate.y<70)continue;
      const distance=positions.length?Math.min(...positions.map(p=>
        ((p.x-candidate.x)*innerWidth/100)**2+((p.y-candidate.y)*innerHeight/100)**2
      )):1;
      if(distance>spacing){chosen=candidate;spacing=distance;}
    }
    // Reserva válida mesmo em caso de uma sequência aleatória incomum.
    chosen ||= {x:8+Math.random()*84,y:6+Math.random()*(compactFinale?10:24)};
    positions.push(chosen);
    const size=compactFinale?16+Math.random()*12:22+Math.random()*22;
    const rotation=Math.random()*360;
    return `<span class="finale-flower" style="left:${chosen.x}%;top:${chosen.y}%;--flower-size:${size}px;--flower-delay:${Math.random()*.65}s;--flower-rotation:${rotation}deg;--sway-duration:${8+Math.random()*6}s;--sway-phase:${-Math.random()*12}s;--sway-x:${Math.random()*8-4}px;--sway-y:${-4-Math.random()*4}px"><svg viewBox="-42 -42 84 84" focusable="false">${flower(0,0,Math.random()<.5?'#9bbbcf':'#e4c65c')}</svg></span>`;
  }).join('');
  $('.photo-stars').innerHTML=Array.from({length:compactFinale?16:28},(_,i)=>{
    const side=i%4,along=compactFinale?12+Math.floor(i/4)*25:5+Math.floor(i/4)*15;
    const x=side===0?-5:side===1?105:along;
    const y=side===2?-7:side===3?107:along;
    const starSize=compactFinale?9+Math.random()*5:12+Math.random()*12;
    return `<span class="photo-star" style="left:${x}%;top:${y}%;--star-size:${starSize}px;--star-duration:${2.8+Math.random()*2.7}s;--star-delay:${-Math.random()*5}s">✦</span>`;
  }).join('');
  $('#finale').hidden=false;
  startFinaleAudio();
  $('#finale-title').focus({preventScroll:true});
}
$('#gift-video').addEventListener('ended',showFinale,{once:true});
if(VIDEO_URL){
  const video=$('#gift-video');video.src=VIDEO_URL;
  $('#start-video').addEventListener('click',()=>{
    if(!video.hidden)return;
    try {
      Promise.resolve(prepareFinaleAudio()).catch(() => {});
      finaleAudio.load();
    } catch { /* O botão da tela final permite tentar novamente. */ }
    $('#video-placeholder').hidden=true;video.hidden=false;
    video.focus({preventScroll:true});
    video.play().catch(()=>{
      $('.status').textContent='Use os controles do vídeo para iniciar a reprodução.';
    });
  });
  video.addEventListener('error',()=>{
    video.hidden=true;$('#video-placeholder').hidden=false;
    $('#video-placeholder h2').textContent='O recadinho não abriu desta vez.';
    $('#video-placeholder p').textContent='Tente novamente daqui a pouquinho.';
    $('.video-signature').hidden=true;$('#start-video').hidden=true;
  });
}
