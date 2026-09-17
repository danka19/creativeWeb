(() => {
  const data=window.PORTFOLIO;
  if(!data)return;
  let lang='en',filter='all',selected=0;
  const viewer=document.querySelector('#viewer');
  const getCopy=()=>data.copy[lang];
  const visible=()=>data.projects.map((p,i)=>({p,i})).filter(({p})=>filter==='all'||(filter==='square'?p.width===p.height:p.width!==p.height)).map(({i})=>i);
  function showProject(index){
    selected=index;const p=data.projects[index];const c=getCopy();
    const img=document.querySelector('#viewer-image');img.src=p.image;img.width=p.width;img.height=p.height;img.alt=p.brand+' — '+p[lang].title;
    document.querySelector('#viewer-title').textContent=p.brand+' / '+p[lang].title;
    document.querySelector('#viewer-description').textContent=p[lang].description;
    document.querySelector('#viewer-case').href=p.url;
    const story=document.querySelector('#viewer-story');story.replaceChildren();
    ['context','analysis','solution'].forEach((key,i)=>{const section=document.createElement('section');const heading=document.createElement('h4');heading.textContent=c[key];const paragraph=document.createElement('p');paragraph.textContent=p[lang].story[i];section.append(heading,paragraph);story.append(section);});
    const source=document.createElement('a');source.href=p.source;source.target='_blank';source.rel='noopener noreferrer';source.textContent=c.source+' ↗';story.append(source);
    const research=document.createElement('p');research.className='research-note';research.textContent=c.researchDate;story.append(research);
    const list=visible(),position=list.indexOf(index);
    document.querySelector('#viewer-count').textContent=String(position+1).padStart(2,'0')+' / '+String(list.length).padStart(2,'0');
    document.querySelector('#previous').disabled=position===0;
    document.querySelector('#next').disabled=position===list.length-1;
    document.querySelector('.close-viewer').setAttribute('aria-label',c.close);
    document.querySelector('#previous').setAttribute('aria-label',c.previous);
    document.querySelector('#next').setAttribute('aria-label',c.next);
    if(!viewer.open)viewer.showModal();
  }
  function move(amount){const list=visible(),index=list.indexOf(selected)+amount;if(index>=0&&index<list.length)showProject(list[index]);}
  function renderLanguage(language){
    lang=language;const c=getCopy();document.documentElement.lang=lang;document.title=c.title;
    document.querySelector('meta[name="description"]').content=c.description;
    document.querySelectorAll('[data-i18n]').forEach(el=>{el.textContent=c[el.dataset.i18n];});
    document.querySelectorAll('[data-language]').forEach(el=>el.setAttribute('aria-pressed',String(el.dataset.language===lang)));
    document.querySelectorAll('[data-project-title]').forEach(el=>el.textContent=data.projects[el.dataset.projectTitle][lang].title);
    document.querySelectorAll('[data-project-description]').forEach(el=>el.textContent=data.projects[el.dataset.projectDescription][lang].description);
    document.querySelectorAll('[data-story-text]').forEach(el=>{const [i,j]=el.dataset.storyText.split(':');el.textContent=data.projects[i][lang].story[j];});
    document.querySelectorAll('[data-project]').forEach(el=>{const p=data.projects[el.dataset.project];el.setAttribute('aria-label',c.open+': '+p.brand+' — '+p[lang].title);el.querySelector('img').alt=p.brand+' — '+p[lang].title;});
    document.querySelector('.copy-status').textContent='';
    if(viewer.open)showProject(selected);
  }
  document.querySelectorAll('[data-language]').forEach(button=>button.addEventListener('click',()=>{
    renderLanguage(button.dataset.language);
    try{localStorage.setItem('portfolio-language',lang);}catch{}
    try{const url=new URL(location.href);url.searchParams.set('lang',lang);history.replaceState(null,'',url);}catch{}
  }));
  document.querySelectorAll('[data-filter]').forEach(button=>button.addEventListener('click',()=>{
    filter=button.dataset.filter;
    document.querySelectorAll('[data-filter]').forEach(el=>el.setAttribute('aria-pressed',String(el.dataset.filter===filter)));
    document.querySelectorAll('.project').forEach(el=>el.hidden=filter!=='all'&&el.dataset.format!==filter);
    document.querySelector('.gallery-count').textContent=visible().length+' / '+data.projects.length;
  }));
  document.querySelectorAll('[data-project]').forEach(el=>el.addEventListener('click',event=>{
    if(event.ctrlKey||event.metaKey||event.shiftKey||event.altKey)return;
    event.preventDefault();showProject(Number(el.dataset.project));
  }));
  document.querySelectorAll('.hero-preview').forEach(el=>el.addEventListener('click',()=>{
    if(filter!=='all')document.querySelector('[data-filter="all"]').click();
  }));
  document.querySelector('.close-viewer').addEventListener('click',()=>viewer.close());
  document.querySelector('#previous').addEventListener('click',()=>move(-1));
  document.querySelector('#next').addEventListener('click',()=>move(1));
  viewer.addEventListener('keydown',event=>{if(event.key==='ArrowLeft'){event.preventDefault();move(-1);}if(event.key==='ArrowRight'){event.preventDefault();move(1);}});
  viewer.addEventListener('click',event=>{if(event.target!==viewer)return;const r=viewer.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)viewer.close();});
  document.querySelector('.copy-email').addEventListener('click',async()=>{
    let ok=false;
    try{await navigator.clipboard.writeText(data.email);ok=true;}catch{
      const input=document.createElement('textarea');input.value=data.email;input.style.cssText='position:fixed;top:0;left:-9999px';document.body.append(input);input.select();try{ok=document.execCommand('copy');}catch{}input.remove();document.querySelector('.copy-email').focus();
    }
    document.querySelector('.copy-status').textContent=getCopy()[ok?'copied':'copyFailed'];
  });
  // Contacts are shared by both languages. Missing Telegram is hidden until supplied.
  document.querySelectorAll('a[href^="mailto:"]').forEach(el=>el.href='mailto:'+data.email);
  document.querySelector('.email').textContent=data.email;
  document.querySelectorAll('.behance-top,.socials a:first-child').forEach(el=>el.href=data.behance);
  document.querySelector('.collection-link').href=data.collection;
  if(data.telegram){try{const url=new URL(data.telegram);if(url.protocol==='https:'){const el=document.querySelector('#telegram');el.hidden=false;el.href=url.href;el.target='_blank';el.rel='noopener noreferrer';}}catch{}}
  let saved;try{saved=localStorage.getItem('portfolio-language');}catch{}
  const requested=new URLSearchParams(location.search).get('lang');
  renderLanguage(['ru','en'].includes(requested)?requested:saved==='ru'?'ru':'en');
})();
