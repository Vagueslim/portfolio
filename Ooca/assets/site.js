const menuButton=document.querySelector('.menu-toggle');
const nav=document.querySelector('.nav');
function closeMenu(){nav?.classList.remove('is-open');menuButton?.setAttribute('aria-expanded','false');}
menuButton?.addEventListener('click',()=>{const open=nav.classList.toggle('is-open');menuButton.setAttribute('aria-expanded',String(open));});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&nav?.classList.contains('is-open')){closeMenu();menuButton.focus();}});
document.addEventListener('click',e=>{if(menuButton&&!e.target.closest('.site-header'))closeMenu();});
const filters=[...document.querySelectorAll('.filter')];
const projects=[...document.querySelectorAll('[data-category]')];
filters.forEach(button=>button.addEventListener('click',()=>{
 filters.forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
 let count=0;projects.forEach(card=>{const visible=button.dataset.filter==='all'||card.dataset.category===button.dataset.filter;card.hidden=!visible;if(visible)count++;});
 const status=document.querySelector('.filter-count');if(status)status.textContent=`แสดง ${count} ผลงาน`;
}));
const dialog=document.querySelector('.dialog');let imageTrigger;
document.querySelectorAll('[data-image]').forEach(button=>button.addEventListener('click',()=>{
 imageTrigger=button;const img=dialog.querySelector('img');img.src=button.dataset.image;img.alt=button.dataset.caption;dialog.querySelector('figcaption').textContent=button.dataset.caption;dialog.showModal();
}));
dialog?.querySelector('.dialog-close').addEventListener('click',()=>dialog.close());
dialog?.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();}});
dialog?.addEventListener('close',()=>imageTrigger?.focus());
