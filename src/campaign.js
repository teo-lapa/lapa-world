import { PRODUCTS } from './original-levels.js';

Object.assign(PRODUCTS, {
  pasta:{name:'Pasta',emoji:'🍝',color:'#e5b654',zone:'Secco'},
  bread:{name:'Pane',emoji:'🥖',color:'#c89958',zone:'Secco'},
  carrot:{name:'Carote',emoji:'🥕',color:'#ef954d',zone:'Fresco'},
  egg:{name:'Uova',emoji:'🥚',color:'#ede1c7',zone:'Fresco'},
  fish:{name:'Pesce',emoji:'🐟',color:'#83bcca',zone:'Fresco'},
  strawberry:{name:'Fragole',emoji:'🍓',color:'#d96372',zone:'Fresco'},
  oil:{name:'Olio',emoji:'🫒',color:'#9eaf61',zone:'Secco'},
  broccoli:{name:'Broccoli',emoji:'🥦',color:'#69a977',zone:'Fresco'},
});
export const CUSTOMERS={
  pizzeria:{name:'Pizzeria Sole',emoji:'🍕',chapter:0}, bakery:{name:'Forno del Borgo',emoji:'🥐',chapter:0},
  gelateria:{name:'Gelateria Nuvola',emoji:'🍦',chapter:1},
  trattoria:{name:'Trattoria degli Ulivi',emoji:'🍝',chapter:2}, market:{name:'Mercato dei Colori',emoji:'🧺',chapter:2},
  farm:{name:'Fattoria Girasole',emoji:'🌻',chapter:3}, supplier:{name:'Cooperativa Verde',emoji:'🚜',chapter:3},
  hotel:{name:'Hotel Bellavista',emoji:'🏨',chapter:4}, harbor:{name:'Ristorante del Porto',emoji:'⛵',chapter:5},
  mountain:{name:'Rifugio delle Stelle',emoji:'🏔️',chapter:6}, festival:{name:'Festa delle Valli',emoji:'🎡',chapter:7},
};
export const CHAPTERS=[
  {name:'Il nostro paese',icon:'🏡',color:'#729c73',story:'Tutto comincia da una piccola consegna.',customers:['pizzeria','bakery'],products:['tomato','flour','cheese','apple','milk','ice']},
  {name:'Il viale dei gelati',icon:'🍦',color:'#c18fab',story:'Una nuova strada! La gelateria aspetta la tua visita.',customers:['gelateria','bakery'],products:['ice','milk','strawberry']},
  {name:'La piazza del mercato',icon:'🧺',color:'#d5a55c',story:'Bancarelle, pasta e tanti nuovi amici in piazza.',customers:['trattoria','market'],products:['pasta','tomato','oil','bread']},
  {name:'La campagna dorata',icon:'🌻',color:'#8ba958',story:'Segui la strada tra i campi e incontra i produttori.',customers:['farm','supplier'],products:['carrot','egg','apple','broccoli']},
  {name:'Il lago azzurro',icon:'🏞️',color:'#69a4bb',story:'Il ponte è aperto! L’hotel prepara una grande colazione.',customers:['hotel'],products:['bread','milk','egg','strawberry']},
  {name:'Il porto delle vele',icon:'⛵',color:'#5b93ac',story:'Barche e ristoranti: il tuo servizio arriva al porto.',customers:['harbor','trattoria'],products:['fish','pasta','oil','tomato']},
  {name:'Le vette verdi',icon:'🏔️',color:'#889fae',story:'Una strada panoramica porta fino al rifugio.',customers:['mountain'],products:['cheese','bread','milk','apple']},
  {name:'La grande fiera',icon:'🎡',color:'#be8270',story:'Tutte le valli si ritrovano. La tua squadra le rifornisce!',customers:['festival','hotel','market'],products:['pasta','broccoli','ice','strawberry','fish']},
];
export const CHAPTER_LENGTHS={little:[5,5,5,5,5,5,5,5],explorer:[5,7,8,8,8,8,8,8]};
export const levelCount=mode=>CHAPTER_LENGTHS[mode].reduce((a,b)=>a+b,0);
export function chapterStart(mode,chapter){return CHAPTER_LENGTHS[mode].slice(0,chapter).reduce((a,b)=>a+b,0);}
export function campaignChapter(mode,index){let start=0;return CHAPTER_LENGTHS[mode].findIndex(n=>{start+=n;return index<start;});}
export const priceOf=id=>['fish','oil','cheese','ice'].includes(id)?3:['milk','egg','strawberry'].includes(id)?2:1;

function quizFor(order,chapter,step){
  const total=Object.values(order).reduce((a,b)=>a+b,0);
  const [id,n]=Object.entries(order)[0];
  let question,picture,answer,hint;
  if(step%3===0){answer=total;question='Quante cassette hai consegnato in tutto?';picture=Object.entries(order).map(([id,n])=>`${PRODUCTS[id].emoji} × ${n}`).join(' + ');hint=`Conta tutte le cassette dell’ordine: in tutto sono ${answer}.`;}
  else if(step%3===1){const used=Math.min(2,n);answer=n-used;question=`Il cliente usa ${used} delle ${n} cassette di ${PRODUCTS[id].name.toLowerCase()}. Quante ne restano?`;picture=`${PRODUCTS[id].emoji} ${n} − ${used} = ?`;hint=`Parti da ${n} e togli ${used}. Restano ${answer} cassette.`;}
  else {const price=chapter>=3?priceOf(id):1;answer=n*price;question=`${n} cassette di ${PRODUCTS[id].name.toLowerCase()}, ${price} monete ciascuna. Quante monete in tutto?`;picture=`${n} × ${price} = ?`;hint=`Aggiungi ${price} per ogni cassetta: il totale è ${answer}.`;}
  const options=[answer,answer+1,answer===0?2:answer-1];
  if(step%2)options.reverse();else options.push(options.shift());
  return {question,picture,answer,options,hint};
}
function mission(mode,chapter,step,seed=0){
  const region=CHAPTERS[chapter];
  const destination=region.customers[(step+seed)%region.customers.length];
  const pool=region.products;
  const first=pool[(step+seed)%pool.length],second=pool[(step+seed+1)%pool.length];
  const visit=step===0 || (mode==='explorer'&&step===4);
  const order=visit?{}:{[first]:mode==='little'?1+(step%2):2+(step%3),[second]:mode==='little'?1:1+(step%2)};
  if(mode==='explorer'&&!visit&&chapter>=4&&step%2===1)order[pool[(step+seed+2)%pool.length]]=1;
  const titles=mode==='little'?['Un nuovo amico','La merenda è pronta','Il piccolo aiutante','Un carico colorato','La festa del quartiere']:['Conosciamo il cliente','Il primo ordine','Scorte da rifornire','Il pranzo è servito','Un’altra visita','La dispensa perfetta','Il giro della squadra','La festa del quartiere'];
  const level={chapter,destination,order,kind:visit?'visit':'delivery',vehicle:visit?'car':'truck',sticker:visit?'🚙':PRODUCTS[first].emoji,
    title:titles[step%titles.length],intro:visit?`Andiamo a conoscere ${CUSTOMERS[destination].name}. Oggi si viaggia in macchina!`:`${CUSTOMERS[destination].name} aspetta ${PRODUCTS[first].name.toLowerCase()} e ${PRODUCTS[second].name.toLowerCase()}.`,
  };
  if(visit){level.request=first;const choices=[first,second,pool[(step+seed+2)%pool.length]];level.choices=[...choices.slice(chapter%3),...choices.slice(0,chapter%3)];level.visitText=`«Ciao! Vorrei ordinare ${PRODUCTS[first].name.toLowerCase()}. Mi aiuti a scegliere?»`;}
  else if(mode==='explorer'){
    level.quiz=quizFor(order,chapter,step);
    if(chapter>=2&&step%3===2){
      level.purchase=true;
      level.stock=Object.fromEntries(Object.entries(order).map(([id,n],i)=>[id,i===0?n-1:0]));
      level.budget=Object.entries(order).reduce((sum,[id,n])=>sum+(n-level.stock[id])*priceOf(id),0)+2;
    }
  }
  return level;
}
export function expandCampaign(original){
  return Object.fromEntries(['little','explorer'].map(mode=>[mode,[
    ...original[mode].map(l=>({...l,chapter:0,kind:'delivery',vehicle:'truck'})),
    ...CHAPTERS.slice(1).flatMap((_,i)=>Array.from({length:CHAPTER_LENGTHS[mode][i+1]},(_,step)=>mission(mode,i+1,step))),
  ]]));
}
export function bonusLevel(mode,round){
  const chapter=1+round%7, step=(round*3+1)%CHAPTER_LENGTHS[mode][chapter];
  return {...mission(mode,chapter,step,Math.floor(round/7)),title:`Incarico libero ${round+1}`,bonus:true};
}
