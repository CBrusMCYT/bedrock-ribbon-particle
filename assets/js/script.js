(function(){
  var $=function(s,r){return (r||document).querySelector(s)};
  var $$=function(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))};
  var reduce=window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var PAGES=["lang","home","actions","recreated"], cur=null, busy=false, langChosen=false, returnTo=null, pending=null;
  var root=document.documentElement;

  function esc(s){return s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}
  function hl(code){
    if(code.getAttribute("data-hl")) return;
    var s=esc(code.textContent);
    s=s.replace(/\b(Math\.[A-Za-z_]+)/g,'<span class="mm">$1</span>')
       .replace(/\b(v\.[A-Za-z_][A-Za-z_0-9]*)/g,'<span class="vv">$1</span>')
       .replace(/\b(t\.[A-Za-z_][A-Za-z_0-9]*)/g,'<span class="tt">$1</span>')
       .replace(/^(\s*)("[^"\n]+")(\s*:)/gm,'$1<span class="k">$2</span>$3');
    code.innerHTML=s; code.setAttribute("data-hl","1");
  }
  function hlVisible(r){$$(".cw.on code",r).forEach(hl)}
  function setLang(l){root.setAttribute("data-lang",l); root.setAttribute("lang",l)}

  /* ---------- loading screen: pixel ribbon + real font load ---------- */
  var TITLE="Action & Stuff Ribbon Particle Reverse Engineering";
  var STAT=["Loading font...","Reading particles...","Linking segments...","Ready"];
  var TIPS=["The PNG is straight. The curve comes from math.","A ribbon is many short straight quads.","Particles can play sounds with sound_effect.","sealpe is the flag that spawns each segment."];
  var boot=$("#boot"), skip=false, fontReady=false;
  var fp=(document.fonts&&document.fonts.load)?Promise.race([document.fonts.load('16px "Mojangles"'),new Promise(function(r){setTimeout(r,2500)})]):Promise.resolve();
  fp.then(function(){fontReady=true},function(){fontReady=true});

  // closed-form curve (same family of formulas as the particle), side projection
  function pos(p,tau){
    var k=3,dr=3,rv=1,ra=1.5,w=p.turn,wr=w*Math.PI/180,k2=k*k+wr*wr,R=Math.PI/180;
    var jr=Math.exp(-k*tau),gz=Math.cos(w*tau*R),pu=Math.sin(w*tau*R);
    var u0=p.spd*Math.cos(p.pitch*R)-dr,w0=p.spd*Math.sin(p.pitch*R)-rv;
    var lx=dr*(1-gz)/wr+u0*(wr*(1-jr*gz)-k*jr*pu)/k2;
    var lz=dr*pu/wr+u0*(k*(1-jr*gz)+wr*jr*pu)/k2;
    var y=rv*tau+w0*(1-jr)/k+0.5*ra*tau*tau;
    return [lx*Math.cos(p.yaw*R)-lz*Math.sin(p.yaw*R),y];
  }
  function newRibbon(t){
    var s=Math.random()<0.5?-1:1;
    return {t0:t,life:2.4+Math.random()*0.8,turn:s*(28+Math.random()*22),pitch:16+Math.random()*16,spd:8+Math.random()*3,yaw:Math.random()*40,dir:s,ox:s>0?16+Math.random()*60:112+Math.random()*60};
  }
  function drawRibbon(ctx,p,e){
    var L=0.9,th=Math.min(e,p.life),tt=Math.max(0,th-L),fade=Math.max(0,Math.min(1,(p.life+0.5-e)/0.5));
    if(fade<=0) return;
    var n=70,i,u,tau,q,x,y,wd,c,a;
    for(i=0;i<=n;i++){
      u=i/n; tau=tt+(th-tt)*u; q=pos(p,tau);
      x=Math.floor(p.ox+q[0]*5.2*p.dir); y=Math.floor(102-q[1]*6.4);
      wd=1+Math.floor(u*2.2); a=Math.pow(u,1.4)*fade; c=Math.floor(110+145*Math.pow(u,3));
      ctx.globalAlpha=a; ctx.fillStyle="rgb("+c+","+Math.floor(215+40*Math.pow(u,3))+",255)";
      ctx.fillRect(x,y,wd,wd);
    }
    ctx.globalAlpha=fade; ctx.fillStyle="#fff";
    q=pos(p,th); x=Math.floor(p.ox+q[0]*5.2*p.dir); y=Math.floor(102-q[1]*6.4);
    ctx.fillRect(x-1,y,4,2); ctx.fillRect(x,y-1,2,4);
    ctx.globalAlpha=1;
  }
  function startBoot(){
    var t=$("#bootT"), bar=$("#bootBar"), pct=$("#bootP"), st=$("#bootS"), tip=$("#bootTip"), cv=$("#bootCv");
    var ctx=cv.getContext("2d"), rs=[], lastSpawn=-9, t0=null, shown=0, tipI=-1, ended=false;
    var dur=reduce?600:3600;
    t.textContent=""; t.appendChild(document.createTextNode("")); t.appendChild(document.createElement("i"));
    function frame(ts){
      if(t0===null) t0=ts;
      var el=(ts-t0)/1000;
      var p=Math.min(1,(ts-t0)/(skip?150:dur));
      if(!fontReady&&!skip) p=Math.min(p,0.88);
      var e=p<1?Math.floor(p*32)/32:1;
      bar.style.width=(e*100)+"%"; pct.textContent=Math.round(e*100)+"%";
      st.textContent=STAT[p>=1?3:(p<0.3?0:(p<0.65?1:2))];
      var n=Math.min(TITLE.length,Math.ceil(TITLE.length*Math.min(1,p/0.6)));
      if(n!==shown){shown=n;t.firstChild.nodeValue=TITLE.slice(0,n)}
      var ti=Math.floor(el/1.5)%TIPS.length;
      if(ti!==tipI){tipI=ti;tip.innerHTML="<b>Tip:</b> "+TIPS[ti]}
      ctx.clearRect(0,0,cv.width,cv.height);
      if(reduce){ if(!rs.length) rs.push(newRibbon(0)); drawRibbon(ctx,rs[0],1.7); }
      else{
        if(el-lastSpawn>1.0){rs.push(newRibbon(el));lastSpawn=el;if(rs.length>3)rs.shift()}
        rs.forEach(function(r){drawRibbon(ctx,r,el-r.t0)});
      }
      if(p<1||!ended){
        if(p>=1&&!ended){ended=true;setTimeout(finishBoot,reduce?100:520)}
        requestAnimationFrame(frame);
      }
    }
    requestAnimationFrame(frame);
  }
  function finishBoot(){
    boot.classList.add("done");
    var n=location.hash.slice(1); pending=(PAGES.indexOf(n)>0)?n:null;
    setPage("lang",true);
    setTimeout(function(){boot.style.display="none"},520);
  }
  boot.addEventListener("click",function(){skip=true});

  /* ---------- pages ---------- */
  function setPage(n,enter){
    PAGES.forEach(function(p){var el=$("#page-"+p); el.classList.toggle("on",p===n); el.classList.remove("enter")});
    cur=n; window.scrollTo(0,0);
    var el=$("#page-"+n);
    if(enter&&!reduce){void el.offsetWidth; el.classList.add("enter")}
    hlVisible(el);
    if(n!=="lang"&&location.hash.slice(1)!==n) location.hash=n;
  }
  function go(n){
    if(busy||n===cur||PAGES.indexOf(n)<0) return;
    if(n==="lang"&&cur&&cur!=="lang") returnTo=cur;
    busy=true; var w=$("#wipe");
    if(reduce){setPage(n,false);busy=false;return}
    w.classList.remove("run"); void w.offsetWidth; w.classList.add("run");
    setTimeout(function(){setPage(n,true)},310);
    setTimeout(function(){w.classList.remove("run");busy=false},700);
  }
  document.addEventListener("click",function(e){
    var lb=e.target.closest("[data-set-lang]");
    if(lb){
      setLang(lb.getAttribute("data-set-lang")); langChosen=true;
      var target=returnTo||pending||"home"; returnTo=null; pending=null;
      go(target); return;
    }
    var b=e.target.closest("[data-go]"); if(b){e.preventDefault();go(b.getAttribute("data-go"))}
  });
  window.addEventListener("hashchange",function(){
    if(!langChosen) return;
    var n=location.hash.slice(1); if(PAGES.indexOf(n)>0&&n!==cur) go(n);
  });

  /* ---------- tabs, chips, copy ---------- */
  document.addEventListener("click",function(e){
    var tab=e.target.closest(".tab");
    if(tab){
      var pg=tab.closest(".page"), id=tab.getAttribute("data-tab");
      $$(".tab",pg).forEach(function(x){x.classList.toggle("on",x===tab)});
      $$(".tp",pg).forEach(function(x){x.classList.toggle("on",x.getAttribute("data-tab")===id)});
      hlVisible(pg); return;
    }
    var chip=e.target.closest(".chip");
    if(chip){
      var tp=chip.closest(".tp"), g=chip.getAttribute("data-g"), id2=chip.getAttribute("data-show");
      $$(".chip[data-g='"+g+"']",tp).forEach(function(x){x.classList.toggle("on",x===chip)});
      $$(".cw[data-g='"+g+"']",tp).forEach(function(x){x.classList.toggle("on",x.id===id2)});
      hlVisible(tp); return;
    }
    var cp=e.target.closest(".copy");
    if(cp){
      var raw=document.getElementById(cp.getAttribute("data-raw")).textContent, old=cp.innerHTML, en=root.getAttribute("data-lang")==="en";
      function done(ok){cp.textContent=ok?(en?"Copied":"Tersalin"):(en?"Copy failed":"Gagal menyalin");setTimeout(function(){cp.innerHTML=old},1600)}
      function fb(){
        try{var ta=document.createElement("textarea");ta.value=raw;ta.style.position="fixed";ta.style.opacity="0";document.body.appendChild(ta);ta.select();var ok=document.execCommand("copy");document.body.removeChild(ta);done(ok)}catch(x){done(false)}
      }
      try{ if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(raw).then(function(){done(true)},fb)} else fb() }catch(x){fb()}
    }
  });
  startBoot();
})();
