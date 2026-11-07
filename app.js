import {predict} from './predict.js';
const el = id => document.getElementById(id);
const game = el('game'), nameBox = el('species'), form = el('form'), gender = el('gender');
const status = el('message');
let db, currentGame, names = new Map(), selected;
const normalize = name => name.toLowerCase().normalize('NFD').replace(/\p{M}/gu,'').replace(/♀/g,'female').replace(/♂/g,'male').replace(/[^a-z0-9]/g,'');
function read(key) { try { return localStorage.getItem('pokesearch.'+key); } catch { return null; } }
function save(key,value) { try { localStorage.setItem('pokesearch.'+key,value); } catch {} }
function clearResult() { el('moves').replaceChildren(); status.textContent=''; }
function genderDependent(name) { return name === 'Indeedee' || name === 'Meowstic'; }
function renderSprite() {
  const sprite=el('sprite');
  const femaleIndex=db.sprites['female/'+selected?.id];
  const index=gender.value==='Female' && femaleIndex!==undefined ? femaleIndex : db.sprites[selected?.id];
  sprite.hidden = !selected || index===undefined;
  el('caption').textContent = selected ? (sprite.hidden ? 'Sprite unavailable' : selected.name) : '';
  if (sprite.hidden) return;
  const offset=index % 256;
  sprite.style.backgroundImage='url("./assets/sprites-'+Math.floor(index/256)+'.png")';
  sprite.style.backgroundPosition=(-(offset%16)*96)+'px '+(-Math.floor(offset/16)*96)+'px';
  sprite.setAttribute('aria-label',selected.name+' · '+selected.form);
}
function refreshForms() {
  clearResult();
  const matches = names.get(normalize(nameBox.value)) || [];
  const options=matches.filter(p=>!genderDependent(p.name) || !['Male','Female'].includes(gender.value) || p.slug.includes('-'+gender.value.toLowerCase()));
  const oldId=selected?.id;
  selected=options.find(p=>p.id===oldId) || options[0];
  form.replaceChildren(...options.map(p=>new Option(p.form,String(p.id))));
  if (selected) form.value=String(selected.id);
  form.disabled=options.length<=1;
  renderSprite();
}
function changeGame() {
  currentGame=db.games.find(g=>String(g.id)===game.value);
  names=new Map();
  for (const p of db.pokemon) {
    if (!db.learn[currentGame.group+':'+p.id]) continue;
    const key=normalize(p.name);
    if (!names.has(key)) names.set(key,[]);
    names.get(key).push(p);
  }
  const available=[...names.values()].map(list=>list[0].name).sort((a,b)=>a.localeCompare(b,'en'));
  el('species-options').replaceChildren(...available.map(name=>new Option(name,name)));
  nameBox.value=names.get(normalize(nameBox.value))?.[0].name || '';
  nameBox.disabled=!currentGame.available;
  refreshForms();
  el('display').disabled=!currentGame.available;
  if (!currentGame.available) status.textContent='Learnsets for this game are unavailable.';
  save('game',game.value);
}
el('dark').checked=read('theme')==='dark';
document.documentElement.classList.toggle('dark',el('dark').checked);
el('dark').onchange=()=>{document.documentElement.classList.toggle('dark',el('dark').checked);save('theme',el('dark').checked?'dark':'light');};
game.onchange=changeGame;
nameBox.oninput=refreshForms;
gender.onchange=refreshForms;
el('level').oninput=clearResult;
form.onchange=()=>{
  selected=names.get(normalize(nameBox.value))?.find(p=>String(p.id)===form.value);
  if(selected && genderDependent(selected.name)) gender.value=selected.slug.includes('-female')?'Female':'Male';
  clearResult(); renderSprite();
};
el('lookup').onsubmit=e=>{
  e.preventDefault(); clearResult();
  if (!selected) {status.textContent='Choose a Pokémon in the selected game.';nameBox.focus();return;}
  if (genderDependent(selected.name) && !['Male','Female'].includes(gender.value)) {
    status.textContent='Choose Male or Female for '+selected.name+'.'; gender.focus();return;
  }
  const result=predict(db.learn[currentGame.group+':'+selected.id],Number(el('level').value));
  for (const id of result.moves) {const item=document.createElement('li');item.textContent=db.moves[id];el('moves').append(item);}
  status.textContent=result.note;
};
async function start() {
  try {
    const res=await fetch('./assets/database.json');
    if(!res.ok) throw Error('Data unavailable');
    db=await res.json();
    game.replaceChildren(...db.games.map(g=>new Option(g.name,String(g.id))));
    const stored=read('game');
    game.value=db.games.some(g=>String(g.id)===stored)?stored:'29';
    nameBox.value=''; el('level').value=''; gender.value='Unknown';
    game.disabled=false;changeGame();
    if ('serviceWorker' in navigator) navigator.serviceWorker.register('./sw.js').catch(()=>{});
  } catch { status.textContent='Could not load the bundled game data. Reload the page or check that the assets folder was uploaded.'; }
}
start();
