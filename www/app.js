const DB='https://navconqest-default-rtdb.europe-west1.firebasedatabase.app',PW={b:'123',r:'321',o:'1201'},CODES=['','48213','70365','26914','83570','15689','35404','34142','58189','27523','60892','68842','15509','64225','14632','25002','49295','66987','35584','46371','43489'];
const S=Object.assign({lang:'sr'},JSON.parse(localStorage.S||'{}')),T=(a,b)=>S.lang=='sr'?a:b,$=s=>document.querySelector(s);
let D={},role,cur,stream,raf,prev,pulse={},on=0,sel,cod,exp,iv,ready=0,AC,ph,edit=0,drag=null,dn=null,mv=0,vb={x:0,y:0,w:360,h:620};
const G=new Map(),nm=k=>k=='b'?T('PLAVI','BLUE'):T('CRVENI','RED'),BL='#3b9cff',RD='#ff4d4d';
const stop=()=>{clearInterval(iv);cancelAnimationFrame(raf);stream&&stream.getTracks().forEach(x=>x.stop());stream=0};
const v=h=>{stop();$('#v').innerHTML=h};
const btn=(f,l,c='')=>`<button class="${c}" onclick="${f}">${l}</button>`;
const msg=(m,b='map()')=>v(`<p class="c err">${m}</p>${btn(b,T('Nazad','Back'))}`);
const fm=ts=>new Date(ts).toLocaleTimeString('sr-Latn',{hour:'2-digit',minute:'2-digit'});
const ac=()=>{AC=AC||new(window.AudioContext||window.webkitAudioContext)();AC.state=='suspended'&&AC.resume();return AC};
function play(seq,n=1,ty='sine',vb){try{const a=ac();let t=a.currentTime+.05;for(let r=0;r<n;r++){for(const[f,d]of seq){const o=a.createOscillator(),g=a.createGain();o.type=ty;o.frequency.value=f;g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(.25,t+.02);g.gain.exponentialRampToValueAtTime(.0001,t+d/1000);o.connect(g);g.connect(a.destination);o.start(t);o.stop(t+d/1000+.02);t+=d/1000+.04}t+=.4}}catch(e){}
 navigator.vibrate&&vb&&navigator.vibrate(vb)}
const alarm=()=>play([[330,250]],1,'sine',[300,100,300,100,300]);
const cheer=()=>play([[523,110],[659,110],[784,110],[1047,320]],1,'triangle',[80,40,80,40,80,40,260]);
const startSnd=()=>play([[392,160],[392,160],[523,520]],3,'square',[160,60,160,60,520,300,160,60,160,60,520,300,160,60,160,60,520]);
const endSnd=()=>play([[523,320],[392,320],[330,320],[262,800]],3,'sawtooth',[320,60,320,60,320,60,800,300,320,60,320,60,320,60,800,300,320,60,320,60,320,60,800]);
const gps=()=>new Promise(r=>navigator.geolocation?navigator.geolocation.getCurrentPosition(p=>r(p.coords),()=>r(null),{enableHighAccuracy:true,timeout:15000,maximumAge:3000}):r(null));
const dist=(a,b,c,d)=>{const f=x=>x*Math.PI/180,h=Math.sin(f(c-a)/2)**2+Math.cos(f(a))*Math.cos(f(c))*Math.sin(f(d-b)/2)**2;return 12742e3*Math.asin(Math.sqrt(h))};
async function post(ev){try{ev.t={'.sv':'timestamp'};return(await fetch(DB+'/events.json',{method:'POST',body:JSON.stringify(ev)})).ok}catch(e){return false}}
async function put(p,d){try{return(await fetch(DB+p+'.json',{method:'PUT',body:JSON.stringify(d)})).ok}catch(e){return false}}

const DEF={1:[150,150],2:[210,235],3:[150,320],4:[210,405],5:[150,490]};
const P=id=>{if(drag&&drag.t=='p'&&drag.id==id)return[drag.x,drag.y];const p=D.cfg&&D.cfg.pos&&D.cfg.pos[id];return p?[p.x,p.y]:DEF[id]||[180,310]};
const BP=k=>{if(drag&&drag.t=='b'&&drag.id==k)return[drag.x,drag.y];const b=D.cfg&&D.cfg.bs&&D.cfg.bs[k];return b?[b.x,b.y]:k=='b'?[180,50]:[180,570]};
const arr=o=>Array.isArray(o)?o.filter(x=>x):Object.keys(o||{}).sort((a,b)=>a-b).map(k=>o[k]);
const nn=id=>calc().O.indexOf(id)+1||'#'+id;

function calc(){const E=Object.values(D.events||{}).sort((a,b)=>a.t-b.t),c=D.cfg||{},st=c.start||0,en=c.end||1e18;
 let O=[1,2,3,4,5],own={},bal={b:0,r:0},last=st,R={b:0,r:0};
 const rt=()=>{let b=0,r=0;for(let i=0;i<O.length&&own[O[i]]=='b';i++)b+=i+1;for(let j=0;j<O.length&&own[O[O.length-1-j]]=='r';j++)r+=j+1;R={b,r}};
 const acc=to=>{to=Math.min(to,en);if(st&&to>last){bal.b+=R.b*(to-last)/6e4;bal.r+=R.r*(to-last)/6e4;last=to}};
 for(const e of E){acc(e.t);if(e.k=='cap')own[e.p]=e.o;else if(e.k=='ord')O=arr(e.o);else if(e.k=='adj')bal[e.tm]+=e.d;else if(e.k=='rst'){if(e.p)own[e.p]=0;else{own={};bal={b:0,r:0};last=Math.max(last,e.t)}}rt()}
 acc(Date.now());let cb=0,cr=0;while(cb<O.length&&own[O[cb]]=='b')cb++;while(cr<O.length&&own[O[O.length-1-cr]]=='r')cr++;
 return{own,bal,R,cb,cr,O,st,en,on:st&&Date.now()>=st&&Date.now()<=en}}

function conn(){if(!DB)return;const es=new EventSource(DB+'/.json');
 const ap=(p,d)=>{if(p=='/')D=d||{};else{const k=p.slice(1).split('/'),l=k.pop();let o=D;for(const x of k)o=o[x]=o[x]||{};d===null?delete o[l]:o[l]=d}const f=p=='/'&&!ready;chg();if(f)ready=1};
 es.addEventListener('put',e=>{const m=JSON.parse(e.data);ap(m.path,m.data)});
 es.addEventListener('patch',e=>{const m=JSON.parse(e.data);for(const k in m.data)ap((m.path=='/'?'':m.path)+'/'+k,m.data[k])});
 es.onopen=()=>{on=1;chg()};es.onerror=()=>{on=0;chg()}}
function chg(){const s=calc();let lost=0,gain=0;
 if(prev&&ready){for(const id of s.O)if((prev.own[id]||0)!=(s.own[id]||0)){pulse[id]=Date.now()+6000;setTimeout(drw,6100);if(role&&role!='o'){if(prev.own[id]==role)lost=1;if(s.own[id]==role)gain=1}}
  if(role=='b'&&s.cb<prev.cb||role=='r'&&s.cr<prev.cr)lost=1;if(lost)alarm();else if(gain)cheer()}
 prev=s;if(cur=='map'&&!drag)upd()}
setInterval(()=>cur=='map'&&bars(),5000);
setInterval(()=>{if(!ready)return;const s=calc(),n=Date.now(),p=!s.st?0:n<s.st?1:n<=s.en?2:3;if(role&&ph===1&&p===2)startSnd();if(role&&ph===2&&p===3)endSnd();ph=p},1000);

function setLang(){S.lang=S.lang=='sr'?'en':'sr';localStorage.S=JSON.stringify(S);cur=='map'?map():home()}
function home(){cur='home';role=0;edit=0;v(`<div class=top><h1>NAVIGATOR CONQUEST</h1><button class=g onclick="setLang()">${S.lang.toUpperCase()}</button></div><p class=sub>${DB?'':T('Server nije podešen (DB u app.js)','Server not set (DB in app.js)')}</p>${btn("pw('b')",T('PLAVI','BLUE'),'bl')}${btn("pw('r')",T('CRVENI','RED'),'rd')}${btn("pw('o')",T('ORGANIZATOR','ORGANIZER'),'g')}`)}
function pw(r){cur='pw';v(`<h1>${r=='o'?T('ORGANIZATOR','ORGANIZER'):nm(r)}</h1><input id=p type=password inputmode=numeric placeholder="${T('Šifra','Password')}">${btn(`ck('${r}')`,'OK')}${btn('home()',T('Nazad','Back'),'g')}`)}
function ck(r){if($('#p').value==PW[r]){role=r;map()}else msg(T('Pogrešna šifra','Wrong password'),'home()')}

function map(){cur='map';v(`<div class=top><h1 class="${role=='b'?'bl':role=='r'?'rd':''}">${role=='o'?T('ORGANIZATOR','ORGANIZER'):nm(role)}</h1><div class=row><button class=g onclick="zr()">⟲</button><button class=g onclick="setLang()">${S.lang.toUpperCase()}</button><button class=g onclick="home()">✕</button></div></div><div id=st></div><div id=ban></div><div id=mp></div>${btn('scn()',T('Skeniraj QR','Scan QR'))}${role=='o'?btn('te()',edit?T('Završi uređivanje mape','Finish map editing'):T('Uredi mapu','Edit map'),'g')+btn('op()',T('Meni organizatora','Organizer menu'),'g'):''}`);gin();upd()}
const zr=()=>{vb={x:0,y:0,w:360,h:620};drw()},te=()=>{edit=!edit;map()},upd=()=>{bars();drw()};
function bars(){const s=calc(),el=$('#st');if(!el)return;
 const g=!DB?T('Server nije podešen','No server'):!on?T('Nema veze…','Offline…'):!s.st?T('Vreme igre nije podešeno','Game time not set'):Date.now()<s.st?T('Počinje u ','Starts at ')+fm(s.st):s.on?T('Kraj igre: ','Game ends: ')+fm(s.en):T('IGRA ZAVRŠENA — ','GAME OVER — ')+(s.bal.b==s.bal.r?T('nerešeno','draw'):(s.bal.b>s.bal.r?nm('b'):nm('r'))+T(' pobeđuje',' wins'));
 el.innerHTML=`<div class=stat><span class=bl>${nm('b')} ${Math.floor(s.bal.b)}€ <small>+${s.R.b}€/60s</small></span><span class=rd>${nm('r')} ${Math.floor(s.bal.r)}€ <small>+${s.R.r}€/60s</small></span></div><p class=sub>${g}</p>${edit?`<p class=sub>${T('REŽIM UREĐIVANJA: prevlači tačke i baze','EDIT MODE: drag points and bases')}</p>`:''}`}
function drw(){const el=$('#mp');if(!el)return;const s=calc(),O=s.O,n=O.length,C=o=>o=='b'?BL:o=='r'?RD:'#2f7a4f',N=[BP('b'),...O.map(P),BP('r')];
 let h=`<svg id=svg viewBox="${vb.x} ${vb.y} ${vb.w} ${vb.h}"><g stroke="#15402a" fill="none"><circle cx=180 cy=310 r=90 /><circle cx=180 cy=310 r=170 /><circle cx=180 cy=310 r=260 /><line x1=180 y1=10 x2=180 y2=610 /><line x1=0 y1=310 x2=360 y2=310 /></g><g class=sw><line x1=180 y1=310 x2=180 y2=45 stroke="#35ff8a" opacity=.45 /></g>`;
 const sg=(a,b,c)=>h+=`<line class=fl x1="${N[a][0]}" y1="${N[a][1]}" x2="${N[b][0]}" y2="${N[b][1]}" stroke="${c}"/>`;
 for(let i=1;i<=s.cb;i++)sg(i,i-1,BL);for(let j=1;j<=s.cr;j++)sg(n+1-j,n+2-j,RD);
 [['b',0,BL,'#031225',T('Plavi','Blue')],['r',n+1,RD,'#2a0505',T('Crveni','Red')]].forEach(([k,i,c,f,l])=>h+=`<g data-t=b data-i=${k}><rect x=${N[i][0]-35} y=${N[i][1]-22} width=70 height=44 fill="${f}" stroke="${c}" stroke-width=3 /><text x=${N[i][0]} y=${N[i][1]+5} fill="${c}" text-anchor=middle font-size=14 font-weight=700>${l}</text></g>`);
 O.forEach((id,i)=>{const o=s.own[id],c=C(o),[x,y]=N[i+1];h+=`<g data-t=p data-i=${id}>`+(pulse[id]>Date.now()?[0,.6,1.2].map(d=>`<circle class=rip cx=${x} cy=${y} r=22 stroke="${c}" style="animation-delay:${d}s"/>`).join(''):'')+`<circle cx=${x} cy=${y} r=22 fill="${o?c+'44':'#07140d'}" stroke="${c}" stroke-width=3 stroke-dasharray="${edit?'5 4':''}" /><text x=${x} y=${y+7} fill="#b8ffd2" text-anchor=middle font-size=20 font-weight=700>${i+1}</text></g>`});
 el.innerHTML=h+'</svg>'}

const m=ev=>{const r=$('#svg').getBoundingClientRect(),k=Math.min(r.width/vb.w,r.height/vb.h);return[vb.x+(ev.clientX-r.left-(r.width-vb.w*k)/2)/k,vb.y+(ev.clientY-r.top-(r.height-vb.h*k)/2)/k]};
const cl=()=>{vb.x=Math.max(0,Math.min(360-vb.w,vb.x));vb.y=Math.max(0,Math.min(620-vb.h,vb.y))};
function zoom(f,cx,cy){const c=m({clientX:cx,clientY:cy}),w=Math.max(90,Math.min(360,vb.w*f)),q=w/vb.w;vb={x:c[0]-(c[0]-vb.x)*q,y:c[1]-(c[1]-vb.y)*q,w,h:w*620/360};cl();drw()}
function gin(){const e=$('#mp');e.style.touchAction='none';e.style.userSelect='none';
 e.onpointerdown=ev=>{e.setPointerCapture(ev.pointerId);G.set(ev.pointerId,[ev.clientX,ev.clientY]);if(G.size==1){dn=ev.target.closest('[data-i]');mv=0}else{dn=null;drag=null}};
 e.onpointermove=ev=>{const o=G.get(ev.pointerId);if(!o)return;const n=[ev.clientX,ev.clientY];
  if(G.size==2){const q=[...G].find(([i])=>i!=ev.pointerId)[1];G.set(ev.pointerId,n);const d0=Math.hypot(o[0]-q[0],o[1]-q[1]),d1=Math.hypot(n[0]-q[0],n[1]-q[1]);if(d0&&d1)zoom(d0/d1,(n[0]+q[0])/2,(n[1]+q[1])/2);mv=1;return}
  G.set(ev.pointerId,n);const dx=n[0]-o[0],dy=n[1]-o[1];if(!dx&&!dy)return;mv=1;
  if(edit&&dn||drag){if(!drag)drag={t:dn.dataset.t,id:dn.dataset.t=='p'?+dn.dataset.i:dn.dataset.i};const c=m(ev);drag.x=Math.max(20,Math.min(340,c[0]));drag.y=Math.max(25,Math.min(595,c[1]));drw()}
  else{const r=$('#svg').getBoundingClientRect(),k=Math.min(r.width/vb.w,r.height/vb.h);vb.x-=dx/k;vb.y-=dy/k;cl();drw()}};
 e.onpointerup=e.onpointercancel=ev=>{G.delete(ev.pointerId);
  if(drag){const d=drag,q={x:Math.round(d.x),y:Math.round(d.y)},k=d.t=='p'?'pos':'bs';drag=null;D.cfg=D.cfg||{};D.cfg[k]=D.cfg[k]||{};D.cfg[k][d.id]=q;drw();put(`/cfg/${k}/${d.id}`,q)}
  else if(!mv&&dn&&role=='o'&&!edit&&dn.dataset.t=='p')pt(+dn.dataset.i);dn=null}}

function scn(){v(`<h1>${T('Skeniraj QR','Scan QR')}</h1><video id=vd playsinline muted></video>${btn('map()',T('Nazad','Back'),'g')}`);
 navigator.mediaDevices.getUserMedia({video:{facingMode:'environment'}}).then(async s=>{stream=s;const vd=$('#vd');vd.srcObject=s;await vd.play();
  const c=document.createElement('canvas'),x=c.getContext('2d',{willReadFrequently:true});
  const tick=()=>{if(vd.videoWidth){c.width=vd.videoWidth;c.height=vd.videoHeight;x.drawImage(vd,0,0);const r=jsQR(x.getImageData(0,0,c.width,c.height).data,c.width,c.height),q=r&&/^NC\|(\d{1,2})\|(\d{5})$/.exec(r.data),id=q&&+q[1];
   if(q&&CODES[id]&&CODES[id]==q[2]){stop();if(!calc().O.includes(id))return msg(T('Ova tačka nije u igri','This point is not in play'));return role=='o'?msg(`${T('TAČKA ','POINT ')}${nn(id)} — ${(D.codes&&D.codes[id])||'—'}`):cap(id)}}raf=requestAnimationFrame(tick)};tick()}).catch(()=>msg(T('Kamera nije dostupna','Camera not available')))}
const rc=()=>String(Math.floor(1e4+Math.random()*9e4)),valid=n=>Date.now()<=exp&&D.codes&&D.codes[n]===cod;
async function cap(n){if(!DB||!on)return msg(T('Nema veze sa serverom','No connection'));
 const c=rc();if(!await put(`/codes/${n}`,c))return msg(T('Slanje nije uspelo','Send failed'));
 sel=n;cod=c;exp=Date.now()+6e4;D.codes=D.codes||{};D.codes[n]=c;capUI(n)}
function capUI(n){if(!valid(n))return msg(T('Šifra više ne važi. Skeniraj ponovo.','Code no longer valid. Scan again.'));
 v(`<h1>${T('TAČKA ','POINT ')}${nn(n)}</h1><div class=card><small>${T('Šifra tačke (važi 60 s)','Point code (valid 60 s)')}</small><div class=big>${cod}</div><p class=sub id=tm></p></div><input id=cd type=number inputmode=numeric placeholder="${T('Upiši šifru','Enter code')}">${btn('send()',T('POŠALJI','SEND'))}${btn('map()',T('Nazad','Back'),'g')}`);
 const tk=()=>{const r=Math.ceil((exp-Date.now())/1000);if(r<=0)return msg(T('Šifra je istekla. Skeniraj ponovo.','Code expired. Scan again.'));const e=$('#tm');if(e)e.textContent=r+' s'};tk();iv=setInterval(tk,1000)}
async function send(){const n=sel,s=calc(),b=`capUI(${n})`;
 if($('#cd').value!=cod)return msg(T('Pogrešna šifra','Wrong code'),b);
 if(!valid(n))return msg(T('Šifra više ne važi. Skeniraj ponovo.','Code no longer valid. Scan again.'));
 if(!DB||!on)return msg(T('Nema veze sa serverom','No connection'),b);
 if(!s.O.includes(n))return msg(T('Ova tačka nije u igri','This point is not in play'));
 if(s.st&&!s.on)return msg(T('Igra nije u toku','Game is not live'));
 if(s.own[n]==role)return msg(T('Tačka je već vaša','Already yours'));
 const Lc=D.cfg&&D.cfg.loc&&D.cfg.loc[n];
 if(Lc){const c=await gps();if(!c||dist(c.latitude,c.longitude,Lc.la,Lc.lo)>30+Math.min(c.accuracy,20))return msg(T('Niste dovoljno blizu tačke (GPS)','Too far from the point (GPS)'),b)}
 if(!await post({k:'cap',p:n,o:role,by:'t'}))return msg(T('Slanje nije uspelo','Send failed'),b);
 put(`/codes/${n}`,rc());cod=0;pulse[n]=Date.now()+6000;map();$('#ban').innerHTML=`<div class=ban>${T('OSVOJILI STE POZICIJU','POSITION CAPTURED')}</div>`;setTimeout(()=>{const e=$('#ban');e&&(e.innerHTML='')},4000);setTimeout(drw,6100)}

function pt(i){v(`<h1>${T('TAČKA ','POINT ')}${nn(i)} <small>(QR-${i})</small></h1>${btn(`so(${i},'b')`,T('Plavi drži','Blue holds'),'bl')}${btn(`so(${i},'r')`,T('Crveni drži','Red holds'),'rd')}${btn(`so(${i},0)`,T('Neutralna (reset tačke)','Neutral (reset point)'),'g')}${btn(`sl(${i})`,T('Postavi GPS lokaciju ovde','Set GPS location here'),'g')}${btn(`dq(${i})`,T('Obriši tačku','Delete point'),'g')}${btn('map()',T('Nazad','Back'),'g')}`)}
async function so(i,o){await post({k:'cap',p:i,o,by:'o'});map()}
async function sl(i){const c=await gps();if(!c)return msg(T('GPS nije dostupan','GPS not available'));await put(`/cfg/loc/${i}`,{la:c.latitude,lo:c.longitude});msg(T('Lokacija sačuvana','Location saved'))}
function dq(i){v(`<h1>${T('Obriši tačku ','Delete point ')}${nn(i)}?</h1><p>${T('Ostale tačke se prebrojavaju.','The other points are renumbered.')}</p>${btn(`dp(${i})`,T('Da, obriši','Yes, delete'))}${btn('map()',T('Nazad','Back'),'g')}`)}
async function dp(i){await post({k:'ord',o:calc().O.filter(x=>x!=i),by:'o'});map()}
function np(){const O=calc().O;if(O.length>=20)return msg(T('Najviše 20 tačaka','Max 20 points'),'op()');const fr=[];for(let i=1;i<=20;i++)if(!O.includes(i))fr.push(i);
 v(`<h1>${T('Dodaj tačku','Add point')}</h1><small>${T('QR kod (oznaka)','QR code (label)')}</small><select id=qi>${fr.map(i=>`<option value=${i}>QR-${i}</option>`).join('')}</select><small>${T('Nova tačka dobija broj','New point gets number')}</small><select id=qp>${Array.from({length:O.length+1},(_,i)=>`<option value=${i+1}>${i+1}</option>`).join('')}</select>${btn('nps()',T('Dodaj','Add'))}${btn('op()',T('Nazad','Back'),'g')}`)}
async function nps(){const O=calc().O.slice(),id=+$('#qi').value,k=+$('#qp').value,a=k==1?BP('b'):P(O[k-2]),b=k>O.length?BP('r'):P(O[k-1]);
 await put(`/cfg/pos/${id}`,{x:Math.round((a[0]+b[0])/2),y:Math.round((a[1]+b[1])/2)});await post({k:'cap',p:id,o:0,by:'o'});O.splice(k-1,0,id);await post({k:'ord',o:O,by:'o'});map()}
function op(){v(`<h1>${T('MENI ORGANIZATORA','ORGANIZER MENU')}</h1>${btn('np()',T('Dodaj tačku','Add point'))}${btn('tf()',T('Vreme igre','Game time'))}${btn('mf()',T('Dodaj / oduzmi novac','Add / subtract money'))}${btn('hs()',T('Istorija osvajanja','Capture history'))}${btn('rg()',T('Resetuj celu igru','Reset whole game'),'g')}${btn('map()',T('Nazad','Back'),'g')}`)}
function tf(){v(`<h1>${T('Vreme igre','Game time')}</h1><small>${T('Početak','Start')}</small><input id=s type=time><small>${T('Kraj','End')}</small><input id=e type=time>${btn('tsv()',T('Sačuvaj','Save'))}${btn('op()',T('Nazad','Back'),'g')}`)}
async function tsv(){const f=id=>{const[h,mi]=($(id).value||'').split(':');if(h==null||mi==null)return 0;const d=new Date();d.setHours(+h,+mi,0,0);return d.getTime()},a=f('#s'),b=f('#e');if(!a||!b||b<=a)return msg(T('Upiši ispravno vreme','Enter valid times'),'tf()');await put('/cfg/start',a);await put('/cfg/end',b);op()}
function mf(){v(`<h1>${T('Novac','Money')}</h1><select id=tm><option value=b>${nm('b')}</option><option value=r>${nm('r')}</option></select><select id=sg><option value=1>+ ${T('Dodaj','Add')}</option><option value=-1>− ${T('Oduzmi','Subtract')}</option></select><input id=d type=number inputmode=numeric placeholder="${T('Iznos','Amount')}">${btn('msv()',T('Potvrdi','Confirm'))}${btn('op()',T('Nazad','Back'),'g')}`)}
async function msv(){const d=+$('#d').value*+$('#sg').value;if(!d||d%1)return;await post({k:'adj',tm:$('#tm').value,d,by:'o'});op()}
function hs(){const E=Object.values(D.events||{}).sort((a,b)=>b.t-a.t),tx=e=>e.k=='cap'?`${T('Tačka','Point')} ${nn(e.p)} → ${e.o?nm(e.o):'—'}${e.by=='o'?' ('+T('org.','org.')+')':''}`:e.k=='adj'?`${nm(e.tm)} ${e.d>0?'+':''}${e.d}€`:e.k=='ord'?T('Promena niza tačaka','Point order changed'):T('Reset','Reset')+(e.p?' '+nn(e.p):'');
 v(`<h1>${T('Istorija osvajanja','Capture history')}</h1>`+(E.length?E.map(e=>`<div class=row2><span>${fm(e.t)}</span><span>${tx(e)}</span></div>`).join(''):`<p>—</p>`)+btn('op()',T('Nazad','Back')))}
function rg(){v(`<h1>${T('Resetuj celu igru','Reset whole game')}</h1><p>${T('Sve tačke postaju neutralne, a novac se vraća na 0.','All points become neutral and money returns to 0.')}</p>${btn('rg2()',T('Da, resetuj','Yes, reset'))}${btn('op()',T('Nazad','Back'),'g')}`)}
async function rg2(){await post({k:'rst',p:0});op()}
conn();home();
