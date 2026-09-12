import { CHAPTERS, CHAPTER_LENGTHS, CUSTOMERS, chapterStart, campaignChapter, priceOf } from './campaign.js';
import { PRODUCTS, LEVELS } from './game.js';
import { UPGRADES, unlockedLevel } from './storage.js';

const esc=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const revealedChapter=p=>campaignChapter(p.mode,unlockedLevel(p));
export function campaignMap(p,page){
  const revealed=revealedChapter(p),current=page??revealed,chapter=CHAPTERS[current];
  const start=chapterStart(p.mode,current),count=CHAPTER_LENGTHS[p.mode][current];
  const unlocked=unlockedLevel(p),completed=p.stars.filter(n=>n>0).length;
  const finished=completed===p.stars.length;
  const localComplete=p.stars.slice(start,start+count).filter(n=>n>0).length;
  return `<div class="world-caption"><span class="location-pin">●</span> ${revealed+1} zone scoperte · ${CHAPTERS[revealed].name}</div>
    <section class="panel map-panel campaign-panel" aria-labelledby="map-title">
    <div class="map-heading"><div class="ticket-tag"><span></span> UN MONDO CHE CRESCE</div><span class="star-total">★ ${p.stars.reduce((a,b)=>a+b,0)}<small> / ${p.stars.length*3}</small></span></div>
    <h1 id="map-title">Ciao, ${esc(p.name)}!</h1><button class="text-button" data-action="rename">Modifica nome</button>
    <div class="campaign-summary"><span>${completed} / ${p.stars.length} missioni</span>${p.mode==='explorer'?`<button data-action="company" class="company-chip">🪙 ${p.coins} · La mia LAPA</button>`:'<span>🚚 Piccoli piloti</span>'}</div>
    <nav class="chapter-nav" aria-label="Zone del mondo">${CHAPTERS.map((c,i)=>`<button data-action="chapter" data-chapter="${i}" class="chapter-tab ${i===current?'selected':''}" ${i>revealed?'disabled':''} aria-label="${i>revealed?`Zona ${i+1} ancora da scoprire`:`Zona ${i+1}: ${c.name}`}" aria-pressed="${i===current}"><span>${i>revealed?'☁️':c.icon}</span><small>${i+1}</small></button>`).join('')}</nav>
    <div class="chapter-heading" style="--region-color:${chapter.color}"><span>${chapter.icon}</span><div><small>ZONA ${current+1} · ${localComplete}/${count} MISSIONI</small><h2>${chapter.name}</h2></div></div>
    <p class="chapter-story">${chapter.story}</p>
    <ol class="level-list" start="${start+1}">${LEVELS[p.mode].slice(start,start+count).map((l,j)=>{
      const i=start+j,done=p.stars[i]>0,locked=i>unlocked;
      return `<li><button class="level ${i===unlocked&&!done?'current':''} ${locked?'locked':''}" data-action="level" data-level="${i}" ${locked?'disabled':''} aria-label="Livello ${i+1}: ${l.title}${locked?', bloccato':''}"><span class="level-number">${locked?'🔒':i+1}</span><span class="level-text"><strong>${l.title}</strong><small>${done?'⭐ ⭐ ⭐':`${l.kind==='visit'?'Visita':l.purchase?'Acquisti + consegna':'Consegna'} · ${CUSTOMERS[l.destination].name}`}</small></span><span class="level-sticker">${l.sticker}</span></button></li>`;
    }).join('')}</ol>
    ${finished?`<div class="frontier unlocked"><strong>🏆 Tutto il mondo è aperto!</strong><p>Nuovi ordini, nuove visite: l’avventura continua.</p><button class="primary wide" data-action="bonus">Incarico libero ${p.bonusRounds+1} →</button><small>${p.bonusRounds} incarichi liberi completati</small></div>`:current===revealed?`<div class="frontier"><span>☁️</span><div><strong>${current<7?'Un’altra zona oltre le nuvole':'Il mondo delle consegne libere'}</strong><p>Ancora ${count-localComplete} missioni per scoprirla.</p></div></div>`:'<p class="map-foot">Zona completata! Puoi rigiocare ogni missione.</p>'}
    </section><div class="corner-note">Trascina il paesaggio per esplorare · Le strade si aprono giocando</div>`;
}
export function companyPanel(p){
  const completed=p.stars.filter(n=>n>0).length;
  const rank=completed>=60?'Distributore delle valli':completed>=36?'Squadra in viaggio':completed>=20?'Distributore del territorio':completed>=12?'Piccola impresa':'Primi passi';
  return `<div class="company-heading"><span>🏢</span><div><small>${rank}</small><h2>La mia LAPA</h2></div></div><p>La tua attività cresce insieme al mondo. Ogni nuova missione vale 10 monete.</p><div class="company-balance">🪙 ${p.coins} <small>monete del gioco</small></div><div class="upgrade-list">${Object.entries(UPGRADES).map(([id,u])=>{
    const owned=p.upgrades.includes(id),locked=completed<u.after;
    return `<article class="upgrade"><span>${u.icon}</span><div><h3>${u.name}</h3><p>${u.description}</p><button class="secondary" data-action="upgrade" data-upgrade="${id}" ${owned||locked||p.coins<u.cost?'disabled':''}>${owned?'✓ Nella tua squadra':locked?`Dopo ${u.after} missioni (${completed}/${u.after})`:`Assumi / sblocca · ${u.cost} 🪙`}</button></div></article>`;
  }).join('')}</div><p class="small-note">Puoi giocare anche senza aiutanti. Le missioni già completate conservano le stelle; le monete si guadagnano solo la prima volta.</p>`;
}
export function purchasePanel(s){
  const ready=Object.entries(s.level.order).every(([id,n])=>s.stock[id]>=n);
  return `<div class="task-title"><div><h2>Prima, facciamo scorta!</h2><p>Acquista dalla cooperativa solo le cassette mancanti.</p></div><span class="parcel-count">🪙 ${s.budget}</span></div><p class="purchase-note">Questo è il budget dell’ordine. Le monete della tua squadra restano nella cassaforte.</p><div class="purchase-list">${Object.entries(s.level.order).map(([id,n])=>`<div class="purchase-item"><span>${PRODUCTS[id].emoji}</span><div><strong>${PRODUCTS[id].name}</strong><small>In dispensa: ${s.stock[id]} · Richieste: ${n}</small></div><button class="secondary" data-action="buy-product" data-product="${id}" ${s.stock[id]>=n?'disabled':''} aria-label="Acquista ${PRODUCTS[id].name}">${s.stock[id]>=n?'✓':`+1 · ${priceOf(id)} 🪙`}</button></div>`).join('')}</div><button class="primary wide" data-action="purchase-done" ${ready?'':'disabled'}>${ready?'Scorte pronte! Carichiamo →':'Acquista ciò che manca'}</button>`;
}
export function visitBrief(s){
  return `<div class="task-title"><div><h2>Una visita al cliente</h2><p>${CUSTOMERS[s.level.destination].name} vuole conoscerti.</p></div><span class="destination-emoji">🤝</span></div><div class="customer-speech">${s.level.intro}</div><p class="shelf-label">Scegli come viaggiare</p><div class="vehicle-options">${[['car','🚙','Macchina blu'],['truck','🚚','Camion LAPA']].map(([id,emoji,label])=>`<button class="vehicle-option ${s.level.vehicle===id?'selected':''}" data-action="vehicle" data-vehicle="${id}" aria-pressed="${s.level.vehicle===id}"><span>${emoji}</span><strong>${label}</strong></button>`).join('')}</div><p class="task-foot">Oggi niente cassette: ascolta il cliente e scopri che cosa gli serve.</p><button class="primary wide" data-action="depart">Andiamo a conoscerlo! →</button>`;
}
export function visitPanel(s){
  return `<div class="task-title"><div><h2>Piacere di conoscerti!</h2><p>${CUSTOMERS[s.level.destination].name}</p></div><span class="destination-emoji">👩‍🍳</span></div><div class="customer-speech">${s.level.visitText}<span>${PRODUCTS[s.level.request].emoji} ${PRODUCTS[s.level.request].name}</span></div><p class="shelf-label">Tocca il prodotto che il cliente desidera</p><div class="product-shelf">${s.level.choices.map(id=>`<button class="product" data-action="visit-product" data-product="${id}" style="--product-color:${PRODUCTS[id].color}" aria-label="Proponi ${PRODUCTS[id].name}"><span class="product-emoji">${PRODUCTS[id].emoji}</span><strong>${PRODUCTS[id].name}</strong></button>`).join('')}</div>`;
}
