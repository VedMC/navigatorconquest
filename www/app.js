const DB='https://navconqest-default-rtdb.europe-west1.firebasedatabase.app', PW={b:'123',r:'321',o:'1201'},INC=[20,30,40,50,60],CODES=['','48213','70365','26914','83570','15689'];
const S=Object.assign({lang:'sr'},JSON.parse(localStorage.S||'{}')),T=(a,b)=>S.lang=='sr'?a:b,$=s=>document.querySelector(s);
let D={},role,cur,stream,raf,prev,pulse={},on=0,sel;
const NM={b:'PLAVI',r:'CRVENI'},BL='#3b9cff',RD='#ff4d4d';
const stop=()=>{cancelAnimationFrame(raf);stream&&stream.getTracks().forEach(x=>x.stop());stream=0};
const v=h=>{stop();$('#v').innerHTML=h};
const btn=(f,l,c='')=>`<button class="${c}" onclick="${f}">${l}</button>`;
const msg=(m,b='map()')=>v(`<p class="c err">${m}</p>${btn(b,T('Nazad','Back'))}`);
const fm=ts=>new Date(ts).toLocaleTimeString('sr-Latn',{hour:'2-digit',minute:'2-digit'});
const beep=f=>{try{const a=new AudioContext(),o=a.createOscillator();o.connect(a.destination);o.frequency.value=f;o.start();o.stop(a.currentTime+.25)}catch(e){}};
const alarm=()=>{navigator.vibrate&&navigator.vibrate([300,100,300,100,300]);beep(330)};
const gps=()=>new Promise(r=>navigator.geolocation?navigator.geolocation.getCurrentPosition(p=>r(p.coords),()=>r(null),{enableHighAccuracy:true,timeout:15000,maximumAge:3000}):r(null));
const dist=(a,b,c,d)=>{const f=x=>x*Math.PI/180,h=Math.sin(f(c-a)/2)**2+Math.cos(f(a))*Math.cos(f(c))*Math.sin(f(d-b)/2)**2;return 12742e3*Math.asin(Math.sqrt(h))};
async function post(ev){try{ev.t={'.sv':'timestamp'};return(await fetch(DB+'/events.json',{method:'POST',body:JSON.stringify(ev)})).ok}catch(e){return false}}
async function put(p,d){try{return(await fetch(DB+p+'.json',{method:'PUT',body:JSON.stringify(d)})).ok}catch(e){return false}}

function calc(){const E=Object.values(D.events||{}).sort((a,b)=>a.t-b.t),c=D.cfg||{},st=c.start||0,en=c.end||1e18;
 let own=[0,0,0,0,0,0],bal={b:0,r:0},last=st,R={b:0,r:0};
 const rt=()=>{let b=0,r=0;for(let i=1;i<6&&own[i]=='b';i++)b+=INC[i-1];for(let i=5;i>0&&own[i]=='r';i--)r+=INC[5-i];R={b,r}};
 const acc=to=>{to=Math.min(to,en);if(st&&to>last){bal.b+=R.b*(to-last)/9e5;bal.r+=R.r*(to-last)/9e5;last=to}};
 for(const e of E){acc(e.t);if(e.k=='cap')own[e.p]=e.o;else if(e.k=='adj')bal[e.tm]+=e.d;else if(e.k=='rst'){if(e.p)own[e.p]=0;else{own=[0,0,0,0,0,0];bal={b:0,r:0};last=Math.max(last,e.t)}}rt()}
 acc(Date.now());let cb=0,cr=0;while(cb<5&&own[cb+1]=='b')cb++;while(cr<5&&own[5-cr]=='r')cr++;
 return{own,bal,R,cb,cr,st,en,on:st&&Date.now()>=st&&Date.now()<=en}}

function conn(){if(!DB)return;const es=new EventSource(DB+'/.json');
 const ap=(p,d)=>{if(p=='/')D=d||{};else{const k=p.slice(1).split('/'),l=k.pop();let o=D;for(const x of k)o=o[x]=o[x]||{};d===null?delete o[l]:o[l]=d}chg()};
 es.addEventListener('put',e=>{const m=JSON.parse(e.data);ap(m.path,m.data)});
 es.addEventListener('patch',e=>{const m=JSON.parse(e.data);for(const k in m.data)ap((m.path=='/'?'':m.path)+'/'+k,m.data[k])});
 es.onopen=()=>{on=1;chg()};es.onerror=()=>{on=0;chg()}}
function chg(){const s=calc();let lost=0;
 if(prev){for(let i=1;i<6;i++)if(prev.own[i]!=s.own[i]){pulse[i]=Date.now()+6000;setTimeout(drw,6100);if(role&&role!='o'&&prev.own[i]==role)lost=1}
  if(role=='b'&&s.cb<prev.cb||role=='r'&&s.cr<prev.cr)lost=1;if(lost)alarm()}
 prev=s;if(cur=='map')upd()}
setInterval(()=>cur=='map'&&bars(),5000);

function setLang(){S.lang=S.lang=='sr'?'en':'sr';localStorage.S=JSON.stringify(S);cur=='map'?map():home()}
function home(){cur='home';role=0;v(`<div class=top><h1>NAVIGATOR CONQUEST</h1><button class=g onclick="setLang()">${S.lang.toUpperCase()}</button></div><p class=sub>${DB?'':T('Server nije podešen (DB u app.js)','Server not set (DB in app.js)')}</p>${btn("pw('b')",T('PLAVI','BLUE'),'bl')}${btn("pw('r')",T('CRVENI','RED'),'rd')}${btn("pw('o')",T('ORGANIZATOR','ORGANIZER'),'g')}`)}
function pw(r){cur='pw';v(`<h1>${r=='o'?T('ORGANIZATOR','ORGANIZER'):NM[r]}</h1><input id=p type=password inputmode=numeric placeholder="${T('Šifra','Password')}">${btn(`ck('${r}')`,'OK')}${btn('home()',T('Nazad','Back'),'g')}`)}
function ck(r){if($('#p').value==PW[r]){role=r;map()}else msg(T('Pogrešna šifra','Wrong password'),'home()')}

function map(){cur='map';v(`<div class=top><h1>${role=='o'?T('ORGANIZATOR','ORGANIZER'):NM[role]}</h1><div class=row><button class=g onclick="setLang()">${S.lang.toUpperCase()}</button><button class=g onclick="home()">✕</button></div></div><div id=st></div><div id=ban></div><div id=mp></div>${btn('scn()',T('Skeniraj QR','Scan QR'))}${role=='o'?btn('op()',T('Meni organizatora','Organizer menu'),'g'):''}`);upd()}
const upd=()=>{bars();drw()};
function bars(){const s=calc(),el=$('#st');if(!el)return;
 const g=!DB?T('Server nije podešen','No server'):!on?T('Nema veze…','Offline…'):!s.st?T('Vreme igre nije podešeno','Game time not set'):Date.now()<s.st?T('Počinje u ','Starts at ')+fm(s.st):s.on?T('U toku do ','Live until ')+fm(s.en):T('IGRA ZAVRŠENA — ','GAME OVER — ')+(s.bal.b==s.bal.r?T('nerešeno','draw'):(s.bal.b>s.bal.r?NM.b:NM.r)+T(' pobeđuje',' wins'));
 el.innerHTML=`<div class=stat><span class=bl>${NM.b} ${Math.floor(s.bal.b)}€ <small>+${s.R.b}/15m</small></span><span class=rd>${NM.r} ${Math.floor(s.bal.r)}€ <small>+${s.R.r}/15m</small></span></div><p class=sub>${g}</p>`}
function drw(){const el=$('#mp');if(!el)return;const s=calc(),X=[180,150,210,150,210,150,180],Y=[50,150,235,320,405,490,570],C=o=>o=='b'?BL:o=='r'?RD:'#2f7a4f';
 let h=`<svg viewBox="0 0 360 620"><g stroke="#15402a" fill="none"><circle cx=180 cy=310 r=90 /><circle cx=180 cy=310 r=170 /><circle cx=180 cy=310 r=260 /><line x1=180 y1=40 x2=180 y2=580 /><line x1=20 y1=310 x2=340 y2=310 /></g><g class=sw><line x1=180 y1=310 x2=180 y2=45 stroke="#35ff8a" opacity=.45 /></g>`;
 const sg=(a,b,c)=>h+=`<line class=fl x1="${X[a]}" y1="${Y[a]}" x2="${X[b]}" y2="${Y[b]}" stroke="${c}"/>`;
 for(let i=1;i<=s.cb;i++)sg(i,i-1,BL);for(let j=1;j<=s.cr;j++)sg(6-j,7-j,RD);
 h+=`<rect x=145 y=28 width=70 height=44 fill="#031225" stroke="${BL}" stroke-width=3 /><text x=180 y=56 fill="${BL}" text-anchor=middle font-size=14 font-weight=700>${T('PLAVA','BLUE')}</text><rect x=145 y=548 width=70 height=44 fill="#2a0505" stroke="${RD}" stroke-width=3 /><text x=180 y=576 fill="${RD}" text-anchor=middle font-size=14 font-weight=700>${T('CRVENA','RED')}</text>`;
 for(let i=1;i<6;i++){const o=s.own[i],c=C(o);h+=`<g onclick="pt(${i})">`+(pulse[i]>Date.now()?[0,.6,1.2].map(d=>`<circle class=rip cx=${X[i]} cy=${Y[i]} r=22 stroke="${c}" style="animation-delay:${d}s"/>`).join(''):'')+`<circle cx=${X[i]} cy=${Y[i]} r=22 fill="${o?c+'44':'#07140d'}" stroke="${c}" stroke-width=3 /><text x=${X[i]} y=${Y[i]+7} fill="#b8ffd2" text-anchor=middle font-size=20 font-weight=700>${i}</text></g>`}
 el.innerHTML=h+'</svg>'}

function scn(){v(`<h1>${T('Skeniraj QR','Scan QR')}</h1><video id=vd playsinline muted></video>${btn('map()',T('Nazad','Back'),'g')}`);
 navigator.mediaDevices.getUserMedia({video:{facingMode:'environment'}}).then(async s=>{stream=s;const vd=$('#vd');vd.srcObject=s;await vd.play();
  const c=document.createElement('canvas'),x=c.getContext('2d',{willReadFrequently:true});
  const tick=()=>{if(vd.videoWidth){c.width=vd.videoWidth;c.height=vd.videoHeight;x.drawImage(vd,0,0);const r=jsQR(x.getImageData(0,0,c.width,c.height).data,c.width,c.height),m=r&&/^NC\|([1-5])\|(\d{5})$/.exec(r.data);if(m&&CODES[+m[1]]==m[2]){stop();return role=='o'?msg(`${T('TAČKA ','POINT ')}${m[1]} — ${m[2]}`):cap(+m[1])}}raf=requestAnimationFrame(tick)};tick()}).catch(()=>msg(T('Kamera nije dostupna','Camera not available')))}
function cap(n){sel=n;v(`<h1>${T('TAČKA ','POINT ')}${n}</h1><div class=card><small>${T('Šifra tačke','Point code')}</small><div class=big>${CODES[n]}</div></div><input id=cd type=number inputmode=numeric placeholder="${T('Upiši šifru','Enter code')}">${btn('send()',T('POŠALJI','SEND'))}${btn('map()',T('Nazad','Back'),'g')}`)}
async function send(){const n=sel,s=calc(),b=`cap(${n})`;
 if($('#cd').value!=CODES[n])return msg(T('Pogrešna šifra','Wrong code'),b);
 if(!DB||!on)return msg(T('Nema veze sa serverom','No connection'),b);
 if(s.st&&!s.on)return msg(T('Igra nije u toku','Game is not live'));
 if(s.own[n]==role)return msg(T('Tačka je već vaša','Already yours'));
 const Lc=D.cfg&&D.cfg.loc&&D.cfg.loc[n];
 if(Lc){const c=await gps();if(!c||dist(c.latitude,c.longitude,Lc.la,Lc.lo)>30+Math.min(c.accuracy,20))return msg(T('Niste dovoljno blizu tačke (GPS)','Too far from the point (GPS)'),b)}
 if(!await post({k:'cap',p:n,o:role,by:'t'}))return msg(T('Slanje nije uspelo','Send failed'),b);
 pulse[n]=Date.now()+6000;map();$('#ban').innerHTML=`<div class=ban>${T('OSVOJILI STE POZICIJU','POSITION CAPTURED')}</div>`;setTimeout(()=>{const e=$('#ban');e&&(e.innerHTML='')},4000);setTimeout(drw,6100)}

function pt(i){if(role!='o')return;v(`<h1>${T('TAČKA ','POINT ')}${i}</h1>${btn(`so(${i},'b')`,T('Plavi drži','Blue holds'),'bl')}${btn(`so(${i},'r')`,T('Crveni drži','Red holds'),'rd')}${btn(`so(${i},0)`,T('Neutralna (reset tačke)','Neutral (reset point)'),'g')}${btn(`sl(${i})`,T('Postavi GPS lokaciju ovde','Set GPS location here'),'g')}${btn('map()',T('Nazad','Back'),'g')}`)}
async function so(i,o){await post({k:'cap',p:i,o,by:'o'});map()}
async function sl(i){const c=await gps();if(!c)return msg(T('GPS nije dostupan','GPS not available'));await put(`/cfg/loc/${i}`,{la:c.latitude,lo:c.longitude});msg(T('Lokacija sačuvana','Location saved'))}
function op(){v(`<h1>${T('MENI ORGANIZATORA','ORGANIZER MENU')}</h1>${btn('tf()',T('Vreme igre','Game time'))}${btn('mf()',T('Dodaj / oduzmi novac','Add / subtract money'))}${btn('hs()',T('Istorija osvajanja','Capture history'))}${btn('rg()',T('Resetuj celu igru','Reset whole game'),'g')}${btn('map()',T('Nazad','Back'),'g')}`)}
function tf(){v(`<h1>${T('Vreme igre','Game time')}</h1><small>${T('Početak','Start')}</small><input id=s type=time><small>${T('Kraj','End')}</small><input id=e type=time>${btn('tsv()',T('Sačuvaj','Save'))}${btn('op()',T('Nazad','Back'),'g')}`)}
async function tsv(){const f=id=>{const[h,m]=($(id).value||'').split(':');if(h==null||m==null)return 0;const d=new Date();d.setHours(+h,+m,0,0);return d.getTime()},a=f('#s'),b=f('#e');if(!a||!b||b<=a)return msg(T('Upiši ispravno vreme','Enter valid times'),'tf()');await put('/cfg/start',a);await put('/cfg/end',b);op()}
function mf(){v(`<h1>${T('Novac','Money')}</h1><select id=tm><option value=b>${NM.b}</option><option value=r>${NM.r}</option></select><select id=sg><option value=1>+ ${T('Dodaj','Add')}</option><option value=-1>− ${T('Oduzmi','Subtract')}</option></select><input id=d type=number inputmode=numeric placeholder="${T('Iznos','Amount')}">${btn('msv()',T('Potvrdi','Confirm'))}${btn('op()',T('Nazad','Back'),'g')}`)}
async function msv(){const d=+$('#d').value*+$('#sg').value;if(!d||d%1)return;await post({k:'adj',tm:$('#tm').value,d,by:'o'});op()}
function hs(){const E=Object.values(D.events||{}).sort((a,b)=>b.t-a.t),tx=e=>e.k=='cap'?`${T('Tačka','Point')} ${e.p} → ${e.o?NM[e.o]:'—'}${e.by=='o'?' ('+T('org.','org.')+')':''}`:e.k=='adj'?`${NM[e.tm]} ${e.d>0?'+':''}${e.d}€`:T('Reset','Reset')+(e.p?' '+e.p:'');
 v(`<h1>${T('Istorija osvajanja','Capture history')}</h1>`+(E.length?E.map(e=>`<div class=row2><span>${fm(e.t)}</span><span>${tx(e)}</span></div>`).join(''):`<p>—</p>`)+btn('op()',T('Nazad','Back')))}
function rg(){v(`<h1>${T('Resetuj celu igru','Reset whole game')}</h1><p>${T('Sve tačke postaju neutralne, a novac se vraća na 0.','All points become neutral and money returns to 0.')}</p>${btn('rg2()',T('Da, resetuj','Yes, reset'))}${btn('op()',T('Nazad','Back'),'g')}`)}
async function rg2(){await post({k:'rst',p:0});op()}
conn();home();
