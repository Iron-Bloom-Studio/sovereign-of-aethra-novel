(()=>{
const manifest=JSON.parse(document.getElementById('book-manifest').textContent);
const lang=document.body.dataset.language||'id';
const left=document.querySelector('.left-page'),right=document.querySelector('.right-page');
const status=document.querySelector('.page-status'),loader=document.querySelector('.page-loader');
const drawer=document.querySelector('.book-drawer'),dialog=document.querySelector('.search-dialog');
const turnSheet=document.querySelector('.turn-sheet');
const turnFront=turnSheet?.querySelector('.turn-front'),turnBack=turnSheet?.querySelector('.turn-back');
let chapter=Number(localStorage.getItem('soaBookChapter-'+lang)||0);
let page=Number(localStorage.getItem('soaBookPage-'+lang)||0);
let pages=[],cache=new Map(),turning=false,wasMobile=null;
const mobile=()=>matchMedia('(max-width:850px)').matches;
const escape=s=>String(s||'').replace(/[&<>\"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const blank=()=>({type:'blank',html:'<div class="blank-page" aria-hidden="true"></div>'});
function cover(item){return {type:'cover',html:'<div class="chapter-cover"><p class="kicker">'+escape(item.label)+'</p><h1>'+escape(item.title)+'</h1>'+(item.order>=12?'<p class="draft">'+(lang==='en'?'Volume I complete draft':'Draf lengkap Volume I')+'</p>':'')+'</div>'}}
function illustration(node){
 const img=node.querySelector('img');
 const caption=node.querySelector('figcaption')?.textContent?.trim()||'';
 if(!img)return null;
 return {type:'illustration',html:'<div class="illustration-page"><img src="'+escape(img.getAttribute('src'))+'" alt="'+escape(img.alt)+'">'+(caption?'<span class="illustration-caption">'+escape(caption)+'</span>':'')+'</div>'};
}
function makePages(doc,item){
 const isMobile=mobile();
 const root=doc.querySelector('.chapter-prose')||doc.querySelector('article')||doc.body;
 const nodes=[...root.children].filter(n=>!(/^H1$|^H2$/.test(n.tagName)));
 const fallbackLimit=isMobile?650:780;
 let out=isMobile?[cover(item)]:[blank(),cover(item)],buf='',count=0;
 const shell=document.querySelector('.book-shell');
 const probe=document.createElement('article');
 probe.className='paper-page pagination-probe';
 shell.appendChild(probe);
 const canMeasure=probe.clientWidth>0&&probe.clientHeight>0;
 const flush=()=>{if(buf){out.push({type:'text',html:buf});buf='';count=0;probe.innerHTML=''}};
 for(const n of nodes){
   if(n.matches?.('.novel-illustration[data-book-page="right"],.novel-illustration.book-right-page')){
     flush();
     const art=illustration(n);if(!art)continue;
     if(!isMobile&&out.length%2===0)out.push(blank());
     out.push(art);continue;
   }
   const html=n.outerHTML||'<p>'+escape(n.textContent)+'</p>';
   const len=n.textContent.trim().length;
   if(canMeasure){
     probe.innerHTML=buf+html;
     if(buf&&probe.scrollHeight>probe.clientHeight){
       flush();
       probe.innerHTML=html;
     }
   }else if(buf&&count+len>fallbackLimit){
     flush();
   }
   // A paragraph is always kept intact and moves wholly to the next page.
   buf+=html;count+=len;
 }
 flush();probe.remove();return out;
}
async function load(index,desired=0){
 chapter=Math.max(0,Math.min(manifest.length-1,index));loader.hidden=false;
 try{
  let doc=cache.get(chapter);
  if(!doc){const res=await fetch(manifest[chapter].url);if(!res.ok)throw new Error('HTTP '+res.status);doc=new DOMParser().parseFromString(await res.text(),'text/html');cache.set(chapter,doc)}
  pages=makePages(doc,manifest[chapter]);page=normalizePage(desired);render();
  localStorage.setItem('soaBookChapter-'+lang,chapter);
 }catch(e){pages=[{type:'cover',html:'<div class="chapter-cover"><h1>Unable to open chapter</h1><p>'+escape(e.message)+'</p></div>'}];page=0;render()}
 finally{loader.hidden=true}
}
function normalizePage(value){
 let i=Math.max(0,Math.min(pages.length-1,Number(value)||0));
 if(!mobile())i-=i%2;
 return i;
}
function content(i){if(i<0||i>=pages.length)return '';return pages[i].html+(pages[i].type==='blank'?'':'<span class="folio">'+(i+1)+'</span>')}
function paint(el,i){
 const item=pages[i];el.classList.toggle('is-illustration',item?.type==='illustration');el.classList.toggle('is-blank',!item||item.type==='blank');el.innerHTML=content(i);
}
function render(){
 const isMobile=mobile();
 if(isMobile){page=Math.max(0,Math.min(pages.length-1,page));paint(left,-1);paint(right,page);status.textContent=(page+1)+' / '+pages.length}
 else{page=normalizePage(page);paint(left,page);paint(right,page+1);status.textContent=Math.min(page+2,pages.length)+' / '+pages.length}
 localStorage.setItem('soaBookPage-'+lang,page);
 document.title=manifest[chapter].label+': '+manifest[chapter].title+' — Sovereign of Aethra';
}
async function turn(dir){
 if(turning)return;turning=true;
 const step=mobile()?1:2,next=page+dir*step;
 if((next>=pages.length&&chapter>=manifest.length-1)||(next<0&&chapter<=0)){turning=false;return}
 if(turnSheet&&turnFront&&turnBack&&!matchMedia('(prefers-reduced-motion: reduce)').matches){
   turnFront.innerHTML=dir>0?right.innerHTML:left.innerHTML;
   turnBack.innerHTML='';turnSheet.className='turn-sheet '+(dir>0?'flip-next':'flip-prev');
   await new Promise(r=>setTimeout(r,310));
   if(next>=pages.length)await load(chapter+1,0);else if(next<0)await load(chapter-1,99999);else{page=next;render()}
   await new Promise(r=>setTimeout(r,350));turnSheet.className='turn-sheet';turnFront.innerHTML='';
 }else{
   if(next>=pages.length)await load(chapter+1,0);else if(next<0)await load(chapter-1,99999);else{page=next;render()}
 }
 turning=false;
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
let resizeTimer;addEventListener('resize',()=>{clearTimeout(resizeTimer);resizeTimer=setTimeout(()=>{const now=mobile();if(now!==wasMobile){wasMobile=now;const doc=cache.get(chapter);if(doc){pages=makePages(doc,manifest[chapter]);page=normalizePage(page);render()}}},180)});wasMobile=mobile();
const input=document.querySelector('[data-search-input]'),results=document.querySelector('.search-results');
document.querySelector('[data-action=search]').onclick=()=>{dialog.showModal();input.focus()};
input.addEventListener('input',()=>{clearTimeout(input._t);input._t=setTimeout(search,250)});
async function search(){const q=input.value.trim().toLowerCase();if(q.length<3){results.innerHTML='';return}results.innerHTML='<p>'+(lang==='en'?'Searching…':'Mencari…')+'</p>';let found=[];
 for(let i=0;i<manifest.length;i++){let doc=cache.get(i);if(!doc){try{const r=await fetch(manifest[i].url);doc=new DOMParser().parseFromString(await r.text(),'text/html');cache.set(i,doc)}catch{}}
 const text=(doc?.querySelector('.chapter-prose')?.textContent||'').replace(/\s+/g,' '),at=text.toLowerCase().indexOf(q);if(at>=0)found.push({i,s:text.slice(Math.max(0,at-70),at+q.length+110)})}
 results.innerHTML=found.length?found.map(f=>'<button data-result="'+f.i+'"><small>'+escape(manifest[f.i].label)+' · '+escape(manifest[f.i].title)+'</small>'+escape(f.s)+'</button>').join(''):'<p>'+(lang==='en'?'No results.':'Tidak ditemukan.')+'</p>';
 results.querySelectorAll('[data-result]').forEach(b=>b.onclick=()=>{dialog.close();load(+b.dataset.result,0)})}
load(chapter,page);
})();
