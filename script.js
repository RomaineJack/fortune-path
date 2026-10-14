function applyOption(opt){
  if(opt.ePct){
    for(const [k,p] of Object.entries(opt.ePct)){
      let amt = state.start * Math.abs(p);
      if(opt.minCost) amt = Math.max(amt,opt.minCost);
      if(opt.maxCost) amt = Math.min(amt,opt.maxCost);
      state[k] += p < 0 ? -amt : amt;
    }
  }
  if(opt.e){ for(const [k,v] of Object.entries(opt.e)) state[k]=(state[k]||0)+v; }
  if(opt.f){ Object.assign(state.flags,opt.f); }
  state.risk=clamp(state.risk,0,100); state.happiness=clamp(state.happiness,0,100); state.reputation=clamp(state.reputation,0,100);
  state.cash=Math.max(0,state.cash);
  state.log.unshift({name:opt.t,text:opt.d});
  state.log=state.log.slice(0,6);
}

function eligibleQuestions(){
  return questions.filter(x=>!state.used.has(x.id) && x.condition());
}

function chooseQuestion(){
  if(state.decision >= state.maxDecisions || state.year>5){ finishGame(); return; }
  let eligible=eligibleQuestions();
  if(!eligible.length){ finishGame(); return; }

  // Strongly prefer consequence questions created by previous decisions.
  const priority = eligible.filter(x=>['estateExtras','resortTrouble','brandScale','businessRole','boundaries'].includes(x.id));
  const item = priority.length ? pick(priority) : pick(eligible);
  state.used.add(item.id);
  state.current=item;
  renderQuestion(item);
}

function renderQuestion(item){
  $('question-category').textContent=item.category;
  $('question-progress').textContent=`Decision ${state.decision+1} of ${state.maxDecisions}`;
  $('question-title').textContent=item.title;
  $('question-text').textContent=item.text;
  $('year-label').textContent=state.year;
  $('chapter-title').textContent=chapterTitle();
  const wrap=$('choices'); wrap.innerHTML='';
  item.options.forEach((o,i)=>{
    const b=document.createElement('button'); b.className='choice';
    b.innerHTML=`<strong>${String.fromCharCode(65+i)}. ${o.t}</strong><span>${o.d}</span>`;
    b.onclick=()=>handleChoice(o);
    wrap.appendChild(b);
  });
  renderStats();
}

function handleChoice(opt){
  applyOption(opt);
  state.decision++;
  if(state.decision % 4 === 0){
    endYear();
    state.year++;
  }
  saveGame(true);
  setTimeout(chooseQuestion,120);
}

function endYear(){
  // Operating cash flow for the year.
  const net = state.income - state.burn;
  state.cash += net;
  if(net<0 && state.cash===0){ state.debt += Math.abs(net)*.5; }

  // Basic asset appreciation / depreciation.
  const growth = state.assets * (0.025 - state.risk*0.0001);
  state.assets += growth;

  const available=yearlyEvents.filter(e=>!e.cond || e.cond(state));
  pick(available).apply(state);
}

function chapterTitle(){
  return ['Your new life begins','The money starts changing things','Your choices compound','The empire gets tested','Legacy or collapse'][Math.min(state.year-1,4)];
}

function netWorth(){ return state.cash + state.assets - state.debt; }

function renderStats(){
  $('stat-networth').textContent=fmt(netWorth());
  $('stat-cash').textContent=fmt(state.cash);
  $('stat-income').textContent=fmt(state.income);
  $('stat-burn').textContent=fmt(state.burn);
  $('stat-risk').textContent=Math.round(state.risk)+'/100';
  $('stat-happiness').textContent=Math.round(state.happiness)+'/100';

  const life=[];
  if(state.flags.retired||state.flags.retiredLater) life.push(['Work','Retired']);
  else if(state.flags.stillWorking) life.push(['Work','Still employed']);
  if(state.flags.estate) life.push(['Home','Custom estate']);
  else if(state.flags.luxuryHome) life.push(['Home','Luxury home']);
  else if(state.flags.modestHome) life.push(['Home','Current home']);
  if(state.flags.holding) life.push(['Business','Holding company']);
  else if(state.flags.passive) life.push(['Business','Passive investor']);
  if(state.flags.realestate) life.push(['Real estate','Portfolio owner']);
  if(state.flags.resort && !state.flags.resortSold) life.push(['Hospitality','Resort owner']);
  if(state.flags.publicBrand) life.push(['Media','Public brand']);
  if(state.flags.foundation) life.push(['Legacy','Foundation']);
  if(state.flags.jet) life.push(['Travel','Private jet']);
  life.push(['Reputation',Math.round(state.reputation)+'/100']);
  $('life-summary').innerHTML=life.map(x=>`<div class="summary-row"><span>${x[0]}</span><span>${x[1]}</span></div>`).join('');

  $('event-log').innerHTML=state.log.length?state.log.slice(0,5).map(x=>`<div class="event-item"><strong>${x.name}</strong>${x.text}</div>`).join(''):'<div class="event-item">Your decisions will appear here.</div>';
}

function ending(){
  const nw=netWorth(), ratio=nw/state.start;
  let title, blurb;
  if(state.debt>state.assets*.4 || ratio<.15){
    title='THE CRASH';
    blurb='The money felt endless until the obligations became larger than the fortune. Big purchases, weak cash flow, and risky decisions eventually caught up with you.';
  } else if(ratio<.55){
    title='THE BIG SPENDER';
    blurb='You are not broke, but the fortune is much smaller than when you started. You bought an extraordinary life, and the bill for that life became permanent.';
  } else if(ratio>1.35 && state.flags.holding){
    title='THE EMPIRE BUILDER';
    blurb='You turned a windfall into an operating machine. Businesses, assets, and disciplined exits did more than preserve the money — they expanded it.';
  } else if(state.risk<35 && ratio>.85){
    title='THE FORTRESS';
    blurb='You resisted the urge to prove you were rich. Most of your wealth stayed protected, your lifestyle remained manageable, and five years later the money still works for you.';
  } else if(state.happiness>75 && ratio>.65){
    title='THE GOOD LIFE';
    blurb='You spent enough to genuinely change your life without losing control. The fortune became freedom instead of a scoreboard.';
  } else {
    title='THE SURVIVOR';
    blurb='Five years of choices changed the shape of your wealth, but not your ability to live on your own terms. Some bets worked, some hurt, and you are still standing.';
  }
  return {title,blurb};
}

function finishGame(){
  document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));
  $('end-screen').classList.add('active');
  const e=ending();
  $('ending-title').textContent=e.title;
  const details=[];
  if(state.flags.estate) details.push('You built a custom estate instead of simply buying the biggest house available.');
  if(state.flags.holding) details.push('You used part of the fortune to build a holding company and became an owner rather than just a spender.');
  if(state.flags.resort) details.push(state.flags.resortSold?'The resort experiment ended with a sale after the numbers stopped making sense.':'Hospitality became one of your biggest and most unpredictable bets.');
  if(state.flags.publicBrand) details.push('Your story became a business of its own as your public brand created a new stream of income and attention.');
  if(state.flags.foundation) details.push('A foundation turned part of the windfall into a permanent legacy outside your personal balance sheet.');
  if(state.flags.boundaries) details.push('Clear boundaries kept family and friendship from becoming an unlimited financial obligation.');
  if(state.flags.openWallet) details.push('Generosity became expensive, and recurring expectations followed the first big checks.');
  $('ending-story').textContent=`${e.blurb}\n\n${details.join(' ')}\n\nYou started with ${fmt(state.start)}. Five years later, your estimated net worth is ${fmt(netWorth())}.`;
  $('end-start').textContent=fmt(state.start);
  $('end-networth').textContent=fmt(netWorth());
  $('end-cash').textContent=fmt(state.cash);
  $('end-income').textContent=fmt(state.income);
  $('end-risk').textContent=Math.round(state.risk)+'/100';
  $('end-happiness').textContent=Math.round(state.happiness)+'/100';
  localStorage.removeItem('fortunePathSave');
}

function startGame(amount){
  Object.assign(state,{start:amount,cash:amount,assets:0,debt:0,income:0,burn:0,risk:20,happiness:50,reputation:10,year:1,decision:0,flags:{},used:new Set(),log:[]});
  document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));
  $('game-screen').classList.add('active');
  chooseQuestion();
}

function saveGame(silent=false){
  const data={...state,used:[...state.used],current:undefined};
  localStorage.setItem('fortunePathSave',JSON.stringify(data));
  if(!silent){ state.log.unshift({name:'Game saved',text:'Your current life was saved on this device.'}); renderStats(); }
}

function loadGame(){
  const raw=localStorage.getItem('fortunePathSave'); if(!raw) return false;
  try{
    const data=JSON.parse(raw); Object.assign(state,data); state.used=new Set(data.used||[]);
    document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));
    $('game-screen').classList.add('active'); chooseQuestion(); return true;
  }catch{return false;}
}

$('randomize-btn').onclick=()=>{
  const brackets=[
    [100000,1000000],[1000000,10000000],[10000000,100000000],[100000000,1000000000]
  ];
  const [a,b]=pick(brackets); const amount=Math.round((a+Math.random()*(b-a))/100000)*100000;
  $('starting-amount').value=amount.toLocaleString('en-US');
};
$('starting-amount').addEventListener('input',e=>{
  const raw=e.target.value.replace(/[^0-9]/g,'');
  if(raw) e.target.value=Number(raw).toLocaleString('en-US');
});
$('start-btn').onclick=()=>{
  const amount=Number($('starting-amount').value.replace(/,/g,''));
  if(!Number.isFinite(amount)||amount<100000||amount>1000000000){ alert('Enter an amount between $100,000 and $1 billion.'); return; }
  startGame(amount);
};
$('save-btn').onclick=()=>saveGame(false);
$('restart-btn').onclick=()=>{ if(confirm('Restart this life and choose a new fortune?')){ localStorage.removeItem('fortunePathSave'); location.reload(); }};
$('play-again-btn').onclick=()=>location.reload();
$('copy-result-btn').onclick=async()=>{
  const e=ending(); const text=`Fortune Path: ${e.title}. I started with ${fmt(state.start)} and finished 5 years later with ${fmt(netWorth())}.`;
  await navigator.clipboard.writeText(text); $('copy-result-btn').textContent='Copied'; setTimeout(()=>$('copy-result-btn').textContent='Copy Result',1400);
};

// If a save exists, let the player continue automatically after a short prompt.
window.addEventListener('load',()=>{
  if(localStorage.getItem('fortunePathSave')){
    const continueBtn=document.createElement('button');
    continueBtn.className='btn secondary'; continueBtn.textContent='Continue Saved Life';
    continueBtn.onclick=loadGame;
    document.querySelector('.start-actions').prepend(continueBtn);
  }
});
