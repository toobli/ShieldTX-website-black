(() => {
  // Preserve semantic copy and deliberate line breaks; content stays visible
  // when animation is unavailable or reduced motion is requested.
  const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)');
  const revealGroups=document.querySelectorAll('.hero-copy,.section-heading,.scan-copy,.closing-copy');
  const revealObserver=new IntersectionObserver(entries=>{
    for(const entry of entries){entry.target.classList.toggle('is-revealed',entry.isIntersecting);}
  },{threshold:.12});
  for(const group of revealGroups){
    const items=[];
    for(const element of group.querySelectorAll('h1,h2,h3,p')){
      if(element.tagName==='H1'){
        for(const line of element.children){line.classList.add('reveal-item');items.push(line);}
        continue;
      }
      const nodes=Array.from(element.childNodes);let line=document.createElement('span');
      line.className='reveal-line reveal-item';
      for(const node of nodes){
        if(node.nodeName==='BR'){element.appendChild(line);items.push(line);line=document.createElement('span');line.className='reveal-line reveal-item';node.remove();}
        else line.appendChild(node);
      }
      if(line.childNodes.length){element.appendChild(line);items.push(line);}
    }
    const actions=group.querySelector('.actions');if(actions){actions.classList.add('reveal-item');items.push(actions);}
    items.forEach((item,index)=>item.style.setProperty('--reveal-delay',`${index*110}ms`));
    if(!reducedMotion.matches){group.classList.add('reveal-ready');revealObserver.observe(group);}
  }
  reducedMotion.addEventListener('change',event=>{if(event.matches)revealGroups.forEach(group=>group.classList.add('is-revealed'));});
  const menu = document.querySelector('.menu-toggle');
  const navigation = document.querySelector('#navigation');
  menu.addEventListener('click', () => {
    const open = menu.getAttribute('aria-expanded') !== 'true';
    menu.setAttribute('aria-expanded', String(open));
    menu.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
    navigation.classList.toggle('open', open);
  });
  navigation.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
    menu.setAttribute('aria-expanded', 'false');
    menu.setAttribute('aria-label', 'Open navigation');
    navigation.classList.remove('open');
  }));
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) if (entry.isIntersecting) {
      navigation.querySelectorAll('a').forEach(a => a.classList.toggle('active', a.hash === '#' + entry.target.id));
    }
  }, {rootMargin:'-15% 0px -65% 0px'});
  document.querySelectorAll('main > section[id]').forEach(section => observer.observe(section));
  const dialog = document.querySelector('#scan-dialog');
  const wallet = document.querySelector('#wallet-address');
  const error = document.querySelector('#scan-error');
  document.querySelectorAll('.scan-open').forEach(button => button.addEventListener('click', () => {
    menu.setAttribute('aria-expanded','false');
    menu.setAttribute('aria-label','Open navigation');
    navigation.classList.remove('open');
    dialog.showModal();
    document.body.style.overflow = 'hidden';
  }));
  document.querySelector('.scan-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    const r = dialog.getBoundingClientRect();
    if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) dialog.close();
  });
  dialog.addEventListener('close', () => {document.body.style.overflow = ''; error.hidden = true; wallet.removeAttribute('aria-invalid');});
  document.querySelector('#scan-form').addEventListener('submit', event => {
    event.preventDefault();
    const address = wallet.value.trim();
    if (!/^0x[0-9a-fA-F]{40}$/.test(address)) {
      error.textContent = 'Enter a valid public wallet address: 0x followed by 40 hexadecimal characters.';
      error.hidden = false;
      wallet.setAttribute('aria-invalid', 'true');
      wallet.focus();
      return;
    }
    error.hidden = true;
    wallet.removeAttribute('aria-invalid');
    window.open('https://scanner.shieldtx.xyz/#scan/' + encodeURIComponent(address.toLowerCase()), '_blank', 'noopener,noreferrer');
  });
  wallet.addEventListener('input', () => { error.hidden = true; wallet.removeAttribute('aria-invalid'); });
})();

// Reveal section contents without transforming sticky scroll-story containers.
(() => {
  const targets=document.querySelectorAll('.exposure-window,.flow-window,.trust-window,.faq-grid>details,.footer-main>*,.exposure-summary>*');
  const observer=new IntersectionObserver(entries=>{
    entries.forEach(entry=>entry.target.classList.toggle('is-in-view',entry.isIntersecting));
  },{threshold:0,rootMargin:'0px 0px -55px 0px'});
  targets.forEach((element,i)=>{
    element.classList.add('scroll-enter');
    element.style.setProperty('--enter-delay',`${element.matches('details')?(i%3)*70:0}ms`);
    observer.observe(element);
  });
})();

// Animate native details in both directions, retaining keyboard activation.
document.querySelectorAll('.faq-grid details').forEach(details=>{
  const summary=details.querySelector('summary');
  let animation=null,expanded=details.open;
  summary.addEventListener('click',event=>{
    event.preventDefault();
    const from=details.getBoundingClientRect().height;
    animation?.cancel();
    expanded=!expanded;
    if(matchMedia('(prefers-reduced-motion: reduce)').matches){details.open=expanded;return;}
    details.open=true;
    const to=expanded?details.getBoundingClientRect().height:summary.getBoundingClientRect().height+2;
    animation=details.animate({height:[from+'px',to+'px']},{duration:340,easing:'cubic-bezier(.22,1,.36,1)'});
    animation.onfinish=()=>{details.open=expanded;animation=null;};
  });
});

(() => {
 const button=document.querySelector('.scroll-top');
 const update=()=>{button.hidden=scrollY<innerHeight*.65;};
 button.addEventListener('click',()=>window.scrollTo({top:0,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'}));
 addEventListener('scroll',update,{passive:true});update();
})();
