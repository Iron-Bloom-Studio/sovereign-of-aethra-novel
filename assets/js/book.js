(()=>{
const manifest=JSON.parse(document.getElementById('book-manifest').textContent);
const lang=document.body.dataset.language||'id';
const left=document.querySelector('.left-page'),right=document.querySelector('.right-page');
const status=document.querySelector('.page-status'),loader=document.querySelector('.page-loader');
const drawer=document.querySelector('.book-drawer'),dialog=document.querySelector('.search-dialog');
let chapter=Number(localStorage.getItem('soaBookChapter-'+lang)||0),page=Number(localStorage.getItem('soaBookPage-'+lang)||0);
let pages=[],cache=new Map(),turning=false;
const mobile=()=>matchMedia('(max-width:850px)').matches;
const escape=s=>s.replace(/[&<>\"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
function cover(item){return '<div class="chapter-cover"><p class="kicker">'+escape(item.label)+'</p><h1>'+escape(item.title)+'</h1>'+(item.order>=12?'<p class="draft">'+(lang==='en'?'Volume I complete draft':'Draf lengkap Volume I')+'</p>':'')+'</div>'}
function makePages(doc,item){
 const root=doc.querySelector('.chapter-prose')||doc.querySelector('article')||doc.body;
 const nodes=[...root.children].filter(n=>!(/^H1$|^H2$/.test(n.tagName)));
 const limit=mobile()?1250:1550;let out=[cover(item)],buf='',count=0;
 for(const n of nodes){let html=n.outerHTML||'<p>'+escape(n.textContent)+'</p>';let len=n.textContent.trim().length;
   if(buf&&count+len>limit){out.push(buf);buf='';count=0}
   if(len>limit&&n.tagName==='P'){const words=n.textContent.trim().split(/\s+/);let part='';
     for(const w of words){if((part+' '+w).length>limit){if(buf){out.push(buf);buf='';count=0}out.push('<p>'+escape(part)+'</p>');part=w}else part+=(part?' ':'')+w}
     if(part){buf+='<p>'+escape(part)+'</p>';count+=part.length}
   }else{buf+=html;count+=len}
 }
 if(buf)out.push(buf);return out;
}
async function load(index,desired=0){
 chapter=Math.max(0,Math.min(manifest.length-1,index));loader.hidden=false;
 try{
  let doc=cache.get(chapter);
  if(!doc){const res=await fetch(manifest[chapter].url);if(!res.ok)throw new Error('HTTP '+res.status);doc=new DOMParser().parseFromString(await res.text(),'text/html');cache.set(chapter,doc)}
  pages=makePages(doc,manifest[chapter]);page=Math.max(0,Math.min(pages.length-1,desired));render();
  localStorage.setItem('soaBookChapter-'+lang,chapter);
 }catch(e){pages=['<div class="chapter-cover"><h1>Unable to open chapter</h1><p>'+escape(e.message)+'</p></div>'];page=0;render()}
 finally{loader.hidden=true}
}
function content(i){if(i<0||i>=pages.length)return '';return pages[i]+'<span class="folio">'+(i+1)+'</span>'}
function render(){
 if(mobile()){left.innerHTML='';right.innerHTML=content(page);status.textContent=(page+1)+' / '+pages.length}
 else{page=page-page%2;left.innerHTML=content(page);right.innerHTML=content(page+1);status.textContent=(Math.min(page+2,pages.length))+' / '+pages.length}
 localStorage.setItem('soaBookPage-'+lang,page);
 document.title=manifest[chapter].label+': '+manifest[chapter].title+' — Sovereign of Aethra';
}
async function turn(dir){
 if(turning)return;turning=true;const el=dir>0?right:left;el.classList.add(dir>0?'turn-next':'turn-prev');
 await new Promise(r=>setTimeout(r,280));const step=mobile()?1:2;let next=page+dir*step;
 if(next>=pages.length){if(chapter<manifest.length-1){await load(chapter+1,0)}else{page=pages.length-1;render()}}
 else if(next<0){if(chapter>0){await load(chapter-1,99999)}else{page=0;render()}}
 else{page=next;render()}
 el.classList.remove('turn-next','turn-prev');turning=false;
}
document.querySelector('[data-action=next]').onclick=()=>turn(1);
document.querySelector('[data-action=prev]').onclick=()=>turn(-1);
document.querySelector('[data-action=contents]').onclick=()=>{drawer.classList.add('open');drawer.setAttribute('aria-hidden','false')};
document.querySelectorAll('[data-action=close-drawer]').forEach(x=>x.onclick=()=>{drawer.classList.remove('open');drawer.setAttribute('aria-hidden','true')});
document.querySelectorAll('[data-chapter]').forEach(x=>x.onclick=()=>{drawer.classList.remove('open');load(+x.dataset.chapter,0)});
document.querySelector('[data-action=fullscreen]').onclick=()=>document.fullscreenElement?document.exitFullscreen():document.documentElement.requestFullscreen();
const themes=['','theme-sepia','theme-dark'];let ti=Number(localStorage.soaBookTheme||0);if(themes[ti])document.body.classList.add(themes[ti]);
document.querySelector('[data-action=theme]').onclick=()=>{document.body.classList.remove(...themes.filter(Boolean));ti=(ti+1)%themes.length;if(themes[ti])document.body.classList.add(themes[ti]);localStorage.soaBookTheme=ti};
addEventListener('keydown',e=>{if(dialog.open)return;if(e.key==='ArrowRight'||e.key==='PageDown')turn(1);if(e.key==='ArrowLeft'||e.key==='PageUp')turn(-1)});
let sx=0;document.querySelector('.book-shell').addEventListener('touchstart',e=>sx=e.touches[0].clientX,{passive:true});document.querySelector('.book-shell').addEventListener('touchend',e=>{const d=e.changedTouches[0].clientX-sx;if(Math.abs(d)>45)turn(d<0?1:-1)},{passive:true});
let resizeTimer;addEventListener('resize',()=>{clearTimeout(resizeTimer);resizeTimer=setTimeout(()=>{const doc=cache.get(chapter);if(doc){pages=makePages(doc,manifest[chapter]);render()}},160)});
const input=document.querySelector('[data-search-input]'),results=document.querySelector('.search-results');
document.querySelector('[data-action=search]').onclick=()=>{dialog.showModal();input.focus()};
input.addEventListener('input',()=>{clearTimeout(input._t);input._t=setTimeout(search,250)});
async function search(){const q=input.value.trim().toLowerCase();if(q.length<3){results.innerHTML='';return}results.innerHTML='<p>'+(lang==='en'?'Searching…':'Mencari…')+'</p>';let found=[];
 for(let i=0;i<manifest.length;i++){let doc=cache.get(i);if(!doc){try{const r=await fetch(manifest[i].url);doc=new DOMParser().parseFromString(await r.text(),'text/html');cache.set(i,doc)}catch{}}
 const text=(doc?.querySelector('.chapter-prose')?.textContent||'').replace(/\s+/g,' ');const at=text.toLowerCase().indexOf(q);if(at>=0)found.push({i,s:text.slice(Math.max(0,at-70),at+q.length+110)})}
 results.innerHTML=found.length?found.map(f=>'<button data-result="'+f.i+'"><small>'+escape(manifest[f.i].label)+' · '+escape(manifest[f.i].title)+'</small>'+escape(f.s)+'</button>').join(''):'<p>'+(lang==='en'?'No results.':'Tidak ditemukan.')+'</p>';
 results.querySelectorAll('[data-result]').forEach(b=>b.onclick=()=>{dialog.close();load(+b.dataset.result,0)})}
load(chapter,page);
})();
