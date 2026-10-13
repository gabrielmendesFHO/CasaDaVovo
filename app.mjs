import {changeQuantity,restoreCart,buildMessage,whatsappUrl} from './order.mjs';
import {initializeCarousel} from './carousel.mjs';
initializeCarousel(document.querySelector('#hero-carousel'));
const products=[
 {id:'paes',name:'Pães da Vovó',category:'paes',image:'paes.jpg',tag:'PARA O SEU CAFÉ',description:'Conheça os sabores e escolha o pão que combina com a sua rotina.'},
 {id:'coco',name:'Bolo de coco com abacaxi',category:'doces',image:'bolo.jpg',tag:'UM CARINHO EM FORMA DE BOLO',description:'Coco e abacaxi em uma combinação para deixar sua pausa mais gostosa.'},
 {id:'biscoitos',name:'Biscoitos decorados',category:'biscoitos',image:'carinho.jpg',tag:'PARA PRESENTEAR',description:'Um presente cheio de detalhes. Consulte temas e personalização.'},
 {id:'doces',name:'Doces com morango',category:'doces',image:'doce.jpg',tag:'PARA ADOÇAR O DIA',description:'Descubra as opções com morango e consulte os sabores disponíveis.'}
];
const storageKey='vovo-encomenda-v1';
let saved=null;try{saved=localStorage.getItem(storageKey);}catch{}
let cart=restoreCart(saved,products.map(p=>p.id));
const dialog=document.querySelector('#order-dialog');
const form=document.querySelector('#order-form');
const grid=document.querySelector('#product-grid');
const orderItems=document.querySelector('#order-items');
let toastTimer;
grid.innerHTML=products.map(p=>`<article class="product-card" data-category="${p.category}"><div class="product-photo"><img src="assets/${p.image}" alt="${p.name} da Casa da Vovó" width="640" height="640" loading="lazy"><span class="product-tag">${p.tag}</span></div><h3>${p.name}</h3><p>${p.description}</p><button class="add-button" data-add="${p.id}" aria-label="Adicionar ${p.name} à encomenda">Adicionar à encomenda <span aria-hidden="true">+</span></button></article>`).join('');
function showToast(message){const toast=document.querySelector('#toast');toast.textContent=message;toast.classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>toast.classList.remove('visible'),2600);}
function updateCart(){
 try{localStorage.setItem(storageKey,JSON.stringify(cart));}catch{}
 const count=Object.values(cart).reduce((sum,q)=>sum+q,0);document.querySelector('#cart-count').textContent=count;
 document.querySelector('[data-open-order]').setAttribute('aria-label',`Minha encomenda, ${count} itens`);
 const selected=products.filter(p=>cart[p.id]);form.hidden=!selected.length;
 if(!selected.length){orderItems.innerHTML='<div class="empty-order"><p>Sua lista está esperando seus favoritos.</p><button class="button primary" id="choose-products">Explorar os produtos ↗</button></div>';return;}
 orderItems.innerHTML=selected.map(p=>`<div class="order-line"><img src="assets/${p.image}" alt=""><div class="order-line-info"><h3>${p.name}</h3><small>Opções e valores a confirmar</small><button class="remove-button" data-remove="${p.id}">Remover ${p.name}</button></div><div class="qty-control"><button type="button" data-quantity="${p.id}" data-delta="-1" aria-label="Diminuir quantidade de ${p.name}">−</button><span aria-label="Quantidade de ${p.name}">${cart[p.id]}</span><button type="button" data-quantity="${p.id}" data-delta="1" aria-label="Aumentar quantidade de ${p.name}">+</button></div></div>`).join('');
 updateWhatsAppLink();
}
function openOrder(){updateCart();dialog.showModal();}
function closeOrder(){dialog.close();}
document.querySelectorAll('[data-open-order]').forEach(button=>button.addEventListener('click',openOrder));
document.querySelector('#close-dialog').addEventListener('click',closeOrder);
dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)closeOrder();}});
grid.addEventListener('click',e=>{const add=e.target.closest('[data-add]');if(!add)return;cart=changeQuantity(cart,add.dataset.add,1);updateCart();showToast(`${products.find(p=>p.id===add.dataset.add).name} adicionado à sua lista`);});
orderItems.addEventListener('click',e=>{
 const quantity=e.target.closest('[data-quantity]');const remove=e.target.closest('[data-remove]');
 if(quantity){cart=changeQuantity(cart,quantity.dataset.quantity,Number(quantity.dataset.delta));updateCart();const replacement=orderItems.querySelector(`[data-quantity="${quantity.dataset.quantity}"][data-delta="${quantity.dataset.delta}"]`);if(replacement)replacement.focus();else document.querySelector('#close-dialog').focus();}
 if(remove){cart=changeQuantity(cart,remove.dataset.remove,-99);updateCart();document.querySelector('#close-dialog').focus();}
 if(e.target.closest('#choose-products')){closeOrder();document.querySelector('#produtos').scrollIntoView({behavior:'smooth'});}
});
document.querySelectorAll('[data-filter]').forEach(button=>button.addEventListener('click',()=>{document.querySelectorAll('[data-filter]').forEach(b=>{b.classList.toggle('active',b===button);b.setAttribute('aria-pressed',String(b===button));});document.querySelectorAll('.product-card').forEach(card=>card.hidden=button.dataset.filter!=='todos'&&card.dataset.category!==button.dataset.filter);}));
function orderUrl(){const details=Object.fromEntries(new FormData(form).entries());return whatsappUrl(buildMessage(cart,products,details));}
function updateWhatsAppLink(){form.dataset.whatsappUrl=orderUrl();}
form.addEventListener('input',updateWhatsAppLink);form.addEventListener('change',updateWhatsAppLink);
form.addEventListener('submit',e=>{e.preventDefault();if(!Object.keys(cart).length)return;window.open(orderUrl(),'_blank','noopener,noreferrer');});
document.querySelectorAll('[data-whatsapp]').forEach(a=>a.href=whatsappUrl(a.dataset.whatsapp));
document.querySelector('#year').textContent=new Date().getFullYear();
const today=new Intl.DateTimeFormat('sv-SE',{timeZone:'America/Sao_Paulo'}).format(new Date());form.elements.date.min=today;
updateCart();
