(() => {
  const root=document.querySelector('#problem');if(!root)return;
  const tabs=[...root.querySelectorAll('[data-exposure]')],labels=[...root.querySelectorAll('[data-exposure-label]')];
  const views=[['Wallet exposure','Check your exposure score','Discover what your public trading is costing you.'],['Copy bots','Copy-bots bleed your edge','Copiers can skim up to 100bps off every trade.'],['Public leaks','Headlines damage your reputation','Some trades attract unwanted attention.'],['Compliance Risk','Compliance blocks access','Traditional firms can’t access Hyperliquid’s onchain liquidity.']];
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  function select(i,focus=false){
    labels.forEach(label=>label.setAttribute('aria-pressed',String(+label.dataset.exposureLabel===i)));
    tabs.forEach((tab,n)=>{tab.setAttribute('aria-selected',String(n===i));tab.classList.toggle('active',n===i);tab.tabIndex=n===i?0:-1;});
    ['exposure-view','exposure-panel-title','exposure-panel-copy'].forEach((id,n)=>{const el=document.getElementById(id);el.textContent=views[i][n];if(!reduced.matches){el.getAnimations().forEach(a=>a.cancel());el.animate([{opacity:.25},{opacity:1}],{duration:350,easing:'ease-out'});}});
    root.querySelector('#exposure-panel').setAttribute('aria-labelledby',tabs[i].id);if(focus)tabs[i].focus();
  }
  tabs.forEach((tab,i)=>{tab.addEventListener('click',()=>select(i));tab.addEventListener('keydown',e=>{if(['ArrowDown','ArrowUp','Home','End'].includes(e.key)){e.preventDefault();select(e.key==='Home'?0:e.key==='End'?3:(i+(e.key==='ArrowDown'?1:3))%4,true);}});});
  labels.forEach(label=>label.addEventListener('click',()=>select(+label.dataset.exposureLabel)));
  const svg=root.querySelector('.exposure-threat-rays'),ns='http://www.w3.org/2000/svg';
  const rayLabels=['COPY BOTS','MEDIA DESKS','WALLET TRACKING','PNL SCRUTINY','POSITION WATCHERS','STRATEGY MIRRORING','LIQUIDATION ALERTS','REPUTATION EXPOSURE'];
  const origins=[[87,168],[544,353],[402,71],[115,468],[528,197],[52,326],[393,531],[206,67]];
  const create=(tag,attrs)=>{let el=document.createElementNS(ns,tag);Object.entries(attrs).forEach(([k,v])=>el.setAttribute(k,v));return el;};
  const rays=origins.map(([x,y],i)=>{const a=Math.atan2(y-300,x-300);x=300+296*Math.cos(a);y=300+296*Math.sin(a);let group=create('g',{opacity:0}),path=create('path',{fill:'none'}),dot=create('circle',{r:2}),text=create('text',{x,y:y-13,'text-anchor':x>480?'end':x<110?'start':'middle'});text.textContent=rayLabels[i];group.append(path,dot,text);svg.append(group);return{group,path,dot,x,y};});
  let visible=false,frame=0,elapsed=0,last=0;
  const clamp=n=>Math.max(0,Math.min(1,n));
  function draw(seconds){rays.forEach((r,i)=>{const age=(seconds-i*.88)%7.04,live=reduced.matches?i<3:age>=0&&age<2.3;if(!live){r.group.setAttribute('opacity',0);return;}const f=reduced.matches?1:clamp(age/1.75),alpha=reduced.matches?.4:clamp(age/.22)*clamp((2.3-age)/.45);const dx=300-r.x,dy=300-r.y,d=Math.hypot(dx,dy),x=r.x+(dx-dx/d*52)*f,y=r.y+(dy-dy/d*52)*f;r.path.setAttribute('d',`M${r.x} ${r.y}L${x} ${y}`);r.dot.setAttribute('cx',x);r.dot.setAttribute('cy',y);r.group.setAttribute('opacity',alpha);});}
  function tick(now){frame=0;if(!visible||document.hidden||reduced.matches)return;if(last)elapsed+=Math.min(80,now-last)/1000;last=now;draw(elapsed);frame=requestAnimationFrame(tick);}
  function start(){if(reduced.matches){draw(0);return;}if(visible&&!document.hidden&&!frame){last=0;frame=requestAnimationFrame(tick);}}
  new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;root.classList.toggle('exposure-paused',!visible);start();},{threshold:.1}).observe(svg);
  document.addEventListener('visibilitychange',start);reduced.addEventListener('change',start);draw(0);
})();
