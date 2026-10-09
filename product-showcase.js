(() => {
 'use strict';
 const section=document.querySelector('#shieldtx');
 if(!section)return;
 const trigger=section.querySelector('.protection-trigger');
 const dialog=document.querySelector('.protection-dialog');
 const steps=[...dialog.querySelectorAll('.protection-step')];
 const scroller=dialog.querySelector('.protection-scroll');
 let previousOverflow='';
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const syncSteps=()=>{
  const height=scroller.clientHeight||1;
  const progress=scroller.scrollTop/height;
  steps.forEach((step,i)=>step.style.setProperty('--step-visibility',String(reduced.matches?1:Math.max(.2,1-Math.abs(progress-i)*.8))));
 };
 const showStep=index=>scroller.scrollTo({top:index*scroller.clientHeight,behavior:reduced.matches?'instant':'smooth'});
 scroller.addEventListener('scroll',syncSteps,{passive:true});
 // Treat a wheel/trackpad gesture as one step, so momentum cannot skip Open.
 let lastWheel=0;
 scroller.addEventListener('wheel',event=>{
  if(event.ctrlKey||Math.abs(event.deltaY)<2)return;
  event.preventDefault();
  const now=performance.now(),continuing=now-lastWheel<450;lastWheel=now;
  if(continuing)return;
  const current=Math.round(scroller.scrollTop/(scroller.clientHeight||1));
  showStep(Math.max(0,Math.min(2,current+Math.sign(event.deltaY))));
 },{passive:false});
 new ResizeObserver(()=>{if(dialog.open)syncSteps();}).observe(scroller);
 const open=()=>{if(dialog.open)return;previousOverflow=document.body.style.overflow;document.body.style.overflow='hidden';dialog.showModal();scroller.scrollTo({top:0,behavior:'instant'});syncSteps();};
 trigger.addEventListener('click',open);
 dialog.querySelector('.protection-close').addEventListener('click',()=>dialog.close());
 dialog.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();}});
 dialog.addEventListener('close',()=>{document.body.style.overflow=previousOverflow;trigger.focus({preventScroll:true});});
 if(!window.gsap||!window.ScrollTrigger){trigger.style.opacity=1;trigger.style.visibility='visible';return;}
 gsap.registerPlugin(ScrollTrigger);
 const stage=section.querySelector('.shieldtx-stage');
 new IntersectionObserver(entries=>stage.classList.toggle('is-in-view',entries[0].isIntersecting),{threshold:.05}).observe(stage);
 const laptop=section.querySelector('.shieldtx-photo');
 const heading=section.querySelector('.shieldtx-heading');
 gsap.matchMedia().add('(prefers-reduced-motion: no-preference)',()=>{
  gsap.fromTo(heading,{translateY:32},{translateY:0,ease:'none',scrollTrigger:{trigger:section,start:'top 90%',end:'top top',scrub:.45}});
  gsap.fromTo(laptop,{opacity:0},{opacity:1,ease:'none',scrollTrigger:{trigger:section,start:'top 75%',end:'top top',scrub:.45}});
  // Enlarge the complete laptop gently, keeping the keyboard inside the viewport.
  const metrics=()=>{
   const scale=Math.max(1,Math.min(1.22,(stage.clientWidth-64)/laptop.clientWidth,(stage.clientHeight-100)/laptop.clientHeight));
   return {scale,y:stage.clientHeight/2-laptop.offsetTop-laptop.clientHeight*scale/2};
  };
  const timeline=gsap.timeline({scrollTrigger:{trigger:section,start:'top top',end:'bottom bottom',scrub:.7,invalidateOnRefresh:true}});
  timeline.to(heading,{opacity:0,y:-24,duration:.22,ease:'none'},.06)
   .to(laptop,{scale:()=>metrics().scale,y:()=>metrics().y,duration:.76,ease:'power1.inOut'},.12)
   .to(trigger,{autoAlpha:1,duration:.12,ease:'none'},.88)
   .to({}, {duration:.15});
 });
 let refreshFrame;
 new ResizeObserver(()=>{cancelAnimationFrame(refreshFrame);refreshFrame=requestAnimationFrame(()=>ScrollTrigger.refresh());}).observe(document.querySelector('#how-it-works'));
 const phoneImage=section.querySelector('.product-phone img');
 const refreshScreen=()=>requestAnimationFrame(()=>ScrollTrigger.refresh());
 if(phoneImage.complete)refreshScreen();else phoneImage.addEventListener('load',refreshScreen,{once:true});
 addEventListener('pageshow',refreshScreen);
 document.fonts.ready.then(()=>ScrollTrigger.refresh());
})();
