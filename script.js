const topics=[{label:'COMECE PELA ESTRUTURA',rule:'Pessoa + am / is / are + complemento',en:'I am a student.',pt:'Eu sou estudante.',practice:'Sua vez: como você diria “Ela é estudante”? Resposta: She is a student.'},{label:'CONECTE COM A SUA ROTINA',rule:'I / you / we / they + verbo + complemento',en:'I study English every day.',pt:'Eu estudo inglês todos os dias.',practice:'Sua vez: troque “I” por “we”. Resposta: We study English every day.'},{label:'TRANSFORME A FRASE EM PERGUNTA',rule:'Do + I / you / we / they + verbo + complemento?',en:'Do you speak English?',pt:'Você fala inglês?',practice:'Resposta curta: Yes, I do. / No, I don’t. Observe o auxiliar “do” na pergunta e na resposta.'}];
const tabs=[...document.querySelectorAll('[data-topic]')];function selectTopic(i){const t=topics[i];tabs.forEach((b,n)=>{b.setAttribute('aria-selected',String(n===i));b.tabIndex=n===i?0:-1});document.getElementById('demo-content').setAttribute('aria-labelledby','tab-'+i);for(const k of ['label','rule','en','pt','practice'])document.getElementById('demo-'+k).textContent=t[k]}tabs.forEach((b,i)=>{b.addEventListener('click',()=>selectTopic(i));b.addEventListener('keydown',e=>{let n;if(e.key==='ArrowRight')n=(i+1)%tabs.length;if(e.key==='ArrowLeft')n=(i+tabs.length-1)%tabs.length;if(e.key==='Home')n=0;if(e.key==='End')n=tabs.length-1;if(n!==undefined){e.preventDefault();selectTopic(n);tabs[n].focus()}})});
/* Eventos preparados para GA4/Meta, sem enviar compras não confirmadas. */
function trackOfferEvent(eventName,details={}){
 const payload={event:eventName,offer:'ingles_descomplicado',...details};
 window.dataLayer=window.dataLayer||[];
 window.dataLayer.push(payload);
 try{window.dispatchEvent(new CustomEvent('offer:analytics',{detail:payload}))}catch(_){}
 if(typeof window.gtag==='function')window.gtag('event',eventName,details);
 if(typeof window.fbq==='function'){
  if(eventName==='checkout_start')window.fbq('track','InitiateCheckout',{content_name:details.plan||'Inglês Descomplicado',value:details.price,currency:'BRL'});
  else if(eventName==='plan_selected')window.fbq('trackCustom','PlanSelected',details);
 }
}
document.querySelectorAll('a[href="#planos"]').forEach(link=>{
 link.addEventListener('click',()=>trackOfferEvent('view_offers',{source:link.closest('section')?.id||link.closest('aside')?.id||'page'}));
});
const config=window.OFFER_CONFIG||{};const dialog=document.getElementById('upgrade-dialog');let previousFocus;
function checkout(key){let url;try{url=new URL(config.checkout?.[key]);if(url.protocol!=='https:')throw new Error('Invalid checkout')}catch{return}trackOfferEvent('checkout_start',{plan:key,price:key==='basic'?10:key==='upgrade'?17:27,currency:'BRL'});for(const [k,v]of new URLSearchParams(location.search)){if(/^utm_[a-z_]+$|^(fbclid|gclid)$/i.test(k)&&!url.searchParams.has(k))url.searchParams.set(k,v)}location.assign(url.href)}
function closeUpgrade(){dialog.close();previousFocus?.focus()}
document.querySelectorAll('[data-checkout]').forEach(button=>{button.disabled=!config.salesOpen;button.addEventListener('click',()=>{trackOfferEvent('plan_selected',{plan:button.dataset.checkout,price:button.dataset.checkout==='basic'?10:27,currency:'BRL'});if(button.dataset.checkout==='basic'){previousFocus=button;dialog.showModal();trackOfferEvent('upgrade_offer_view',{price:17,currency:'BRL'});dialog.querySelector('.modal-close').focus()}else checkout('complete')})});
dialog.querySelector('.modal-close').addEventListener('click',closeUpgrade);dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)closeUpgrade()}});dialog.addEventListener('close',()=>previousFocus?.focus());document.getElementById('accept-upgrade').addEventListener('click',()=>{trackOfferEvent('upgrade_accepted',{price:17,currency:'BRL'});checkout('upgrade')});document.getElementById('continue-basic').addEventListener('click',()=>{trackOfferEvent('upgrade_declined',{price:10,currency:'BRL'});checkout('basic')});

/* O vídeo de 25MB só é solicitado após interação explícita. */
(()=>{
 const video=document.getElementById('offer-video');
 const button=document.getElementById('enable-video-sound');
 const caption=document.getElementById('video-caption');
 const stage=document.getElementById('offer-video-stage');
 const preview=document.getElementById('offer-video-preview');
 if(!video||!button||!stage)return;
 let initialized=false;
 button.addEventListener('click',()=>{
  if(!initialized){
   const source=video.querySelector('source[data-src]');
   if(!source)return;
   source.src=source.dataset.src;
   source.removeAttribute('data-src');
   video.hidden=false;
   stage.classList.remove('video-stage-pending');
   preview?.remove();
   video.controls=true;
   video.preload='auto';
   video.load();
   initialized=true;
  }
  video.muted=false;
  video.volume=1;
  const playPromise=video.play();
  button.disabled=true;
  if(caption)caption.textContent='Use os controles do vídeo para pausar ou ajustar o som.';
  if(playPromise&&typeof playPromise.then==='function'){
   playPromise.then(()=>{button.hidden=true;video.focus({preventScroll:true})}).catch(()=>{
    button.disabled=false;
    button.hidden=true;
    if(caption)caption.textContent='Toque em reproduzir nos controles do vídeo para assistir.';
   });
  }else button.hidden=true;
 });
})();

/* Carrossel: só o mapa ativo participa do layout, evitando altura herdada de imagens verticais. */
(()=>{
 const root=document.querySelector('.showcase-carousel');
 if(!root)return;
 const viewport=root.querySelector('.showcase-viewport');
 const slides=[...root.querySelectorAll('.showcase-slide')];
 const dots=root.querySelector('#showcase-dots');
 const prev=root.querySelector('#showcase-prev');
 const next=root.querySelector('#showcase-next');
 if(!slides.length)return;
 let index=0,timer=null,visible=true;
 const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
 const dotButtons=slides.map((slide,i)=>{
   const dot=document.createElement('button');
   dot.type='button';dot.className='showcase-dot';
   dot.setAttribute('aria-label','Ver mapa '+(i+1));
   dot.addEventListener('click',()=>{show(i);start()});
   dots.appendChild(dot);
   const img=slide.querySelector('img');
   img?.addEventListener('error',()=>{
     img.hidden=true;
     if(!slide.querySelector('.showcase-unavailable')){
       const message=document.createElement('p');
       message.className='showcase-unavailable';
       message.textContent='Prévia do mapa indisponível';
       slide.insertBefore(message,slide.querySelector('figcaption'));
     }
   });
   return dot;
 });
 function show(n){
   index=(n+slides.length)%slides.length;
   slides.forEach((slide,i)=>{
     slide.hidden=i!==index;
     slide.setAttribute('aria-hidden',String(i!==index));
     dotButtons[i].setAttribute('aria-current',String(i===index));
   });
 }
 function stop(){if(timer!==null){clearInterval(timer);timer=null}}
 function start(){stop();if(!reduced&&visible&&!document.hidden)timer=setInterval(()=>show(index+1),4500)}
 prev.addEventListener('click',()=>{show(index-1);start()});
 next.addEventListener('click',()=>{show(index+1);start()});
 root.addEventListener('mouseenter',stop);
 root.addEventListener('mouseleave',start);
 root.addEventListener('focusin',stop);
 root.addEventListener('focusout',e=>{if(!root.contains(e.relatedTarget))start()});
 let touchStart=null;
 viewport.addEventListener('touchstart',e=>{touchStart=e.touches[0]?.clientX??null},{passive:true});
 viewport.addEventListener('touchend',e=>{
   if(touchStart===null)return;
   const delta=(e.changedTouches[0]?.clientX??touchStart)-touchStart;
   if(Math.abs(delta)>45){show(index+(delta<0?1:-1));start()}
   touchStart=null;
 },{passive:true});
 document.addEventListener('visibilitychange',()=>document.hidden?stop():start());
 show(0);
 if('IntersectionObserver'in window){
   const observer=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;visible?start():stop()},{threshold:.15});
   observer.observe(root);
 }else start();
})();

/* Oculta o CTA fixo quando os cards da oferta já estão visíveis. */
(()=>{
 const banner=document.getElementById('mobile-sticky-offer');
 const pricing=document.getElementById('planos');
 if(!banner||!pricing)return;
 const viewportCheck=()=>{
  const bounds=pricing.getBoundingClientRect();
  const visible=bounds.top<window.innerHeight-90&&bounds.bottom>90;
  banner.classList.toggle('is-pricing-visible',visible);
 };
 if('IntersectionObserver'in window){
  const observer=new IntersectionObserver(entries=>{
   banner.classList.toggle('is-pricing-visible',entries[0].isIntersecting);
  },{rootMargin:'-90px 0px -90px 0px',threshold:0});
  observer.observe(pricing);
 }else{
  window.addEventListener('scroll',viewportCheck,{passive:true});
  window.addEventListener('resize',viewportCheck,{passive:true});
  viewportCheck();
 }
})();
