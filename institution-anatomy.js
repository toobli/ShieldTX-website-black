/* One institution, explored in four scroll-linked chapters. */
(() => {
  const section=document.querySelector('.anatomy-section');
  if(!section)return;
  const stage=section.querySelector('.anatomy-stage');
  const parts=['roof','coin','pillars','stairs'];
  const panels=[...section.querySelectorAll('.anatomy-panel')];
  const figure=section.querySelector('.anatomy-figure'),details=section.querySelector('.anatomy-details');
  const measureGroup=()=>{stage.style.setProperty('--anatomy-copy-height',details.offsetHeight+'px');stage.style.setProperty('--anatomy-figure-height',figure.offsetHeight+'px');};
  new ResizeObserver(measureGroup).observe(figure);new ResizeObserver(measureGroup).observe(details);
  measureGroup();
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  let active='',scheduled=false;
  function show(part){
    if(active===part)return;active=part;
    stage.dataset.focus=part;
    stage.classList.toggle('is-detail',parts.includes(part));
    panels.forEach(panel=>panel.setAttribute('aria-hidden',String(panel.dataset.panel!==part)));
  }
  function progress(){
    scheduled=false;

    const top=parseFloat(getComputedStyle(stage).top)||0;
    const padding=parseFloat(getComputedStyle(section).paddingTop);
    const travel=section.offsetHeight-stage.offsetHeight-padding;
    const p=Math.max(0,Math.min(1,(top-section.getBoundingClientRect().top-padding)/Math.max(1,travel)));
    // Start opening 40px after the coin docks; reserve the rest for the four parts.
    const distance=Math.max(0,top-section.getBoundingClientRect().top-padding);
    const index=distance<40?0:Math.min(5,1+Math.floor((distance-40)/Math.max(1,(travel-40)/5))); 
    show(['all',...parts,'assembled'][index]);
  }
  function request(){if(!scheduled){scheduled=true;requestAnimationFrame(progress);}}
  addEventListener('scroll',request,{passive:true});
  addEventListener('resize',request);
  reduced.addEventListener('change',()=>{request();startCoin();});
  let inView=false,coinFrame=0,angle=.42,lastTime=0;
  const coin=section.querySelector('[data-part="coin"]');
  const ring=(z,c,s)=>Array.from({length:65},(_,i)=>{const t=i/64*Math.PI*2;return [44*Math.cos(t)*c+z*s,44*Math.sin(t)];});
  const outline=points=>points.map((p,i)=>`${i?'L':'M'}${p[0].toFixed(2)} ${p[1].toFixed(2)}`).join('')+'Z';
  function drawCoin(){
    const c=Math.cos(angle),s=Math.sin(angle),frontZ=c>=0?6:-6;
    const front=ring(frontZ,c,s),rear=ring(-frontZ,c,s);
    coin.querySelector('.coin-rear').setAttribute('d',outline(rear));
    let rim='',reed='';
    for(let i=0;i<64;i++){
      const theta=(i+.5)/64*Math.PI*2;
      if(-Math.cos(theta)*s<=0)continue;
      rim+=outline([front[i],front[i+1],rear[i+1],rear[i]]);
      if(i%2===0)reed+=`M${front[i][0]} ${front[i][1]}L${rear[i][0]} ${rear[i][1]}`;
    }
    coin.querySelector('.coin-rim').setAttribute('d',rim);
    coin.querySelector('.coin-front').setAttribute('d',outline(front));
    coin.querySelector('.coin-reeding').setAttribute('d',reed);
    coin.querySelector('.coin-face-detail').setAttribute('transform',`matrix(${Math.abs(c)} 0 0 1 ${frontZ*s} 0)`);
  }
  function spin(now){coinFrame=0;if(!inView||document.hidden||reduced.matches||document.documentElement.classList.contains('shared-coin-ready'))return;if(lastTime)angle+=Math.min(now-lastTime,80)*Math.PI/4000;lastTime=now;drawCoin();coinFrame=requestAnimationFrame(spin);}
  function startCoin(){if(inView&&!document.hidden&&!reduced.matches&&!coinFrame){lastTime=0;coinFrame=requestAnimationFrame(spin);}}
  new IntersectionObserver(entries=>{inView=entries[0].isIntersecting;stage.classList.toggle('is-visible',inView);startCoin();},{threshold:.05}).observe(stage);
  document.addEventListener('visibilitychange',startCoin);
  drawCoin();progress();
})();
