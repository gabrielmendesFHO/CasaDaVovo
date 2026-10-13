export function changeQuantity(cart,id,delta){
  const next={...cart};
  const quantity=Math.max(0,Math.min(99,(Number(next[id])||0)+delta));
  if(quantity) next[id]=quantity; else delete next[id];
  return next;
}
export function restoreCart(raw,ids){
  try{
    const parsed=JSON.parse(raw);
    if(!parsed||typeof parsed!=='object'||Array.isArray(parsed))return {};
    return Object.fromEntries(Object.entries(parsed).filter(([id,q])=>ids.includes(id)&&Number.isInteger(q)&&q>0&&q<=99));
  }catch{return {};}
}
export function buildMessage(cart,products,details={}){
  const items=products.filter(p=>cart[p.id]).map(p=>`${cart[p.id]} × ${p.name}`);
  const date=details.date?details.date.split('-').reverse().join('/'):'';
  return ['Olá, Casa da Vovó! Gostaria de consultar esta encomenda:',...items,'',details.name?`Nome: ${details.name}`:'',details.method?`Preferência: ${details.method}`:'',date?`Data desejada: ${date}`:'',details.notes?`Observações: ${details.notes}`:'','Podem confirmar as opções, os valores e disponibilidade? Aguardo a confirmação da loja.'].filter(Boolean).join('\n');
}
export function whatsappUrl(message){return `https://wa.me/5519993409426?text=${encodeURIComponent(message)}`;}
