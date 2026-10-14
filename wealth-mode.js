const W$ = (id) => document.getElementById(id);
const wfmt = (n) => new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:0}).format(Math.round(n));
const wpick = (arr) => arr[Math.floor(Math.random()*arr.length)];
const wclamp = (v,min,max)=>Math.max(min,Math.min(max,v));

const wealthState = {
  start:0,cash:0,investments:0,businessValue:0,debt:0,annualProfit:0,
  risk:25,reputation:25,year:1,decision:0,maxDecisions:25,
  style:'business',difficulty:'realistic',flags:{},used:new Set(),log:[],history:[]
};

function showOnly(id){
  document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));
  W$(id).classList.add('active');
}

W$('life-mode-btn').onclick=()=>showOnly('start-screen');
W$('wealth-mode-btn').onclick=()=>showOnly('wealth-start-screen');
W$('life-back-btn').onclick=()=>showOnly('mode-screen');
W$('wealth-back-btn').onclick=()=>showOnly('mode-screen');

W$('wealth-starting-amount').addEventListener('input',e=>{
  const raw=e.target.value.replace(/[^0-9]/g,'');
  if(raw) e.target.value=Number(raw).toLocaleString('en-US');
});

W$('wealth-randomize-btn').onclick=()=>{
  const brackets=[[100,1000],[1000,10000],[10000,100000],[100000,1000000],[1000000,100000000]];
  const [a,b]=wpick(brackets);
  const raw=a+Math.random()*(b-a);
  const step=raw<10000?100:raw<100000?1000:raw<1000000?10000:100000;
  W$('wealth-starting-amount').value=(Math.max(100,Math.round(raw/step)*step)).toLocaleString('en-US');
};

function wealthNetWorth(){ return wealthState.cash+wealthState.investments+wealthState.businessValue-wealthState.debt; }

function scaleCost(pct,min=0,max=Infinity){ return Math.min(max,Math.max(min,wealthState.start*pct)); }

function wlog(name,text){
  wealthState.log.unshift({name,text});
  wealthState.log=wealthState.log.slice(0,7);
}

const wealthQuestions = [
  {id:'firstmove',cat:'STRATEGY',title:'What do you do with your starting money?',text:'Your first move determines what kind of opportunities you will see next.',cond:()=>true,opts:()=>[
    {t:'Start a service business',d:'Low overhead. Sell a skill before spending heavily.',fx:()=>{const c=scaleCost(.2,100,15000);wealthState.cash-=c;wealthState.businessValue+=c*.7;wealthState.annualProfit+=Math.max(1200,c*1.4);wealthState.risk+=4;wealthState.flags.service=true;return `You put ${wfmt(c)} into a service business and created your first source of operating profit.`;}},
    {t:'Start an online product business',d:'Inventory, ads, software, and fulfillment create more upside and more ways to fail.',fx:()=>{const c=scaleCost(.35,200,50000);wealthState.cash-=c;wealthState.businessValue+=c*.75;wealthState.annualProfit+=Math.max(800,c*1.1);wealthState.risk+=9;wealthState.flags.ecommerce=true;return `You committed ${wfmt(c)} to an online product business. The upside is higher, but so is the cash pressure.`;}},
    {t:'Invest first',d:'Use diversified investments while you wait for a better operating opportunity.',fx:()=>{const c=scaleCost(.6,100,5000000);wealthState.cash-=c;wealthState.investments+=c;wealthState.risk-=3;wealthState.flags.investor=true;return `You invested ${wfmt(c)} instead of forcing a business idea too early.`;}},
    {t:'Keep most of it liquid',d:'Protect your capital and look for a better opportunity later.',fx:()=>{wealthState.risk-=5;wealthState.reputation-=1;wealthState.flags.patient=true;return 'You kept your powder dry. You did not grow quickly, but you preserved flexibility.';}}
  ]},
  {id:'job',cat:'CASH FLOW',title:'Do you keep earning outside income?',text:'Early businesses fail partly because owners ask them to pay personal bills too soon.',cond:()=>true,opts:()=>[
    {t:'Keep my job or main income',d:'More time pressure, but your business gets room to breathe.',fx:()=>{wealthState.annualProfit+=30000;wealthState.risk-=5;wealthState.flags.job=true;return 'You kept outside income coming in, giving your investments and businesses more time to grow.';}},
    {t:'Go all in',d:'More focus, but the business has to support you.',fx:()=>{wealthState.annualProfit-=12000;wealthState.risk+=8;wealthState.flags.fulltime=true;return 'You went full time. Progress can move faster now, but every weak month matters more.';}},
    {t:'Part time only',d:'Split the difference.',fx:()=>{wealthState.annualProfit+=12000;wealthState.risk-=1;wealthState.flags.parttime=true;return 'You kept part time income while freeing more hours for growth.';}}
  ]},
  {id:'pricing',cat:'BUSINESS',title:'Customers are interested, but your pricing is unclear',text:'You can win on volume, margin, or positioning. Each path changes the business.',cond:()=>wealthState.flags.service||wealthState.flags.ecommerce,opts:()=>[
    {t:'Charge more and focus on quality',d:'Fewer customers, stronger margins, higher expectations.',fx:()=>{wealthState.annualProfit*=1.2;wealthState.businessValue*=1.08;wealthState.reputation+=6;wealthState.risk+=2;return 'Higher pricing improved margins and forced you to deliver at a higher level.';}},
    {t:'Price aggressively for growth',d:'Sacrifice margin to acquire customers quickly.',fx:()=>{wealthState.annualProfit*=1.08;wealthState.businessValue*=1.18;wealthState.cash-=scaleCost(.05,50,10000);wealthState.risk+=5;return 'You traded short term margin for faster customer growth and a larger operation.';}},
    {t:'Stay conservative',d:'Keep prices stable and avoid disrupting what already works.',fx:()=>{wealthState.reputation+=2;wealthState.risk-=2;return 'You protected a working model instead of chasing growth for its own sake.';}}
  ]},
  {id:'marketing',cat:'GROWTH',title:'How much do you spend to grow?',text:'Advertising can create momentum or turn into a very expensive lesson.',cond:()=>wealthState.businessValue>0,opts:()=>[
    {t:'Test small campaigns',d:'Measure before scaling.',fx:()=>{const c=scaleCost(.04,100,25000);wealthState.cash-=c;wealthState.annualProfit+=c*.7;wealthState.businessValue+=c*.5;wealthState.risk+=1;return `You spent ${wfmt(c)} testing marketing. The measured approach produced useful growth without betting the company.`;}},
    {t:'Scale hard',d:'Spend aggressively while momentum is available.',fx:()=>{const c=scaleCost(.12,300,100000);wealthState.cash-=c;const good=Math.random()>.35;if(good){wealthState.annualProfit+=c*1.7;wealthState.businessValue+=c*1.2;wealthState.reputation+=5;return `The ${wfmt(c)} campaign hit. Revenue accelerated and the business became substantially more valuable.`;}wealthState.annualProfit-=c*.35;wealthState.risk+=10;return `The ${wfmt(c)} campaign underperformed. You learned how quickly paid growth can eat cash.`;}},
    {t:'Grow organically',d:'Slower, cheaper, and dependent on execution.',fx:()=>{wealthState.annualProfit*=1.05;wealthState.reputation+=4;wealthState.risk-=1;return 'Organic growth was slower, but customer trust improved and cash stayed protected.';}}
  ]},
  {id:'reinvest',cat:'CAPITAL',title:'You finally have profit. What do you do with it?',text:'A profitable operation can pay you, compound, or become overextended.',cond:()=>wealthState.annualProfit>0,opts:()=>[
    {t:'Reinvest most of it',d:'Hire, market, improve systems, and expand capacity.',fx:()=>{const c=Math.min(wealthState.cash,Math.max(500,wealthState.annualProfit*.45));wealthState.cash-=c;wealthState.businessValue+=c*1.25;wealthState.annualProfit+=c*.35;wealthState.risk+=4;wealthState.flags.reinvested=true;return `You reinvested ${wfmt(c)}. Your business became larger and more capable, but also more demanding.`;}},
    {t:'Split profit between business and investments',d:'Build two engines instead of one.',fx:()=>{const c=Math.min(wealthState.cash,Math.max(300,wealthState.annualProfit*.3));wealthState.cash-=c;wealthState.investments+=c*.55;wealthState.businessValue+=c*.45;wealthState.risk-=1;return `You split ${wfmt(c)} between the business and long term investments.`;}},
    {t:'Take the money',d:'Enjoy the profit and protect liquidity.',fx:()=>{wealthState.risk-=2;wealthState.reputation-=1;wealthState.flags.tookProfit=true;return 'You resisted automatic expansion and kept the profit available.';}}
  ]},
  {id:'hire',cat:'OPERATIONS',title:'The workload is becoming too much for one person',text:'Hiring can unlock growth, but payroll continues even when sales slow down.',cond:()=>wealthState.businessValue>3000&&!wealthState.flags.hired,opts:()=>[
    {t:'Hire one strong person',d:'Add capacity without building a large payroll.',fx:()=>{const c=Math.min(wealthState.cash,Math.max(1000,scaleCost(.08,1000,30000)));wealthState.cash-=c;wealthState.annualProfit+=c*.55;wealthState.businessValue+=c*.6;wealthState.reputation+=3;wealthState.flags.hired=true;return `You invested ${wfmt(c)} into your first hire. Capacity and service quality improved.`;}},
    {t:'Build a team quickly',d:'Scale before demand gets away from you.',fx:()=>{const c=Math.min(wealthState.cash,Math.max(3000,scaleCost(.18,3000,100000)));wealthState.cash-=c;wealthState.annualProfit+=c*.75;wealthState.businessValue+=c*.8;wealthState.risk+=9;wealthState.flags.hired=true;wealthState.flags.team=true;return `You spent ${wfmt(c)} building a team. The company can handle more work, but payroll is now a serious obligation.`;}},
    {t:'Stay solo longer',d:'Protect margin and accept slower growth.',fx:()=>{wealthState.risk-=3;wealthState.annualProfit*=.98;wealthState.flags.solo=true;return 'You stayed lean. Growth slowed slightly, but fixed costs remained low.';}}
  ]},
  {id:'loan',cat:'FINANCE',title:'A lender offers you growth capital',text:'Debt can accelerate a good model or magnify a bad one.',cond:()=>wealthState.businessValue>5000&&wealthState.debt===0,opts:()=>[
    {t:'Take a conservative loan',d:'Use leverage, but keep the payment manageable.',fx:()=>{const amt=Math.min(250000,Math.max(5000,wealthNetWorth()*.2));wealthState.cash+=amt;wealthState.debt+=amt;wealthState.risk+=5;wealthState.flags.loan=true;return `You borrowed ${wfmt(amt)}. You have more capital, but future mistakes now come with a payment.`;}},
    {t:'Take the maximum offered',d:'Move faster with significantly more leverage.',fx:()=>{const amt=Math.min(1000000,Math.max(10000,wealthNetWorth()*.5));wealthState.cash+=amt;wealthState.debt+=amt;wealthState.risk+=14;wealthState.flags.loan=true;wealthState.flags.heavyDebt=true;return `You borrowed ${wfmt(amt)} and chose speed over safety.`;}},
    {t:'Stay debt free',d:'Grow only with money the operation actually earns.',fx:()=>{wealthState.risk-=5;wealthState.reputation+=2;wealthState.flags.noDebt=true;return 'You turned down leverage and kept full control of your downside.';}}
  ]},
  {id:'secondbiz',cat:'EXPANSION',title:'A second business opportunity appears',text:'Diversification sounds smart until two businesses need you at the same time.',cond:()=>wealthState.businessValue>15000&&!wealthState.flags.secondBusiness,opts:()=>[
    {t:'Launch the second business',d:'Create another income stream.',fx:()=>{const c=Math.min(wealthState.cash,Math.max(3000,wealthNetWorth()*.08));wealthState.cash-=c;wealthState.businessValue+=c*.9;wealthState.annualProfit+=c*.45;wealthState.risk+=8;wealthState.flags.secondBusiness=true;return `You invested ${wfmt(c)} into a second business. Diversification improved, but your attention is now split.`;}},
    {t:'Stay focused on the winner',d:'Make one company excellent before adding another.',fx:()=>{wealthState.businessValue*=1.07;wealthState.annualProfit*=1.05;wealthState.risk-=2;return 'You stayed focused. The existing company became more efficient instead of more complicated.';}},
    {t:'Invest outside the business instead',d:'Diversify without creating another operating job.',fx:()=>{const c=Math.min(wealthState.cash,Math.max(2000,wealthNetWorth()*.06));wealthState.cash-=c;wealthState.investments+=c;wealthState.risk-=2;return `You moved ${wfmt(c)} into investments instead of launching another company.`;}}
  ]},
  {id:'realestate',cat:'REAL ESTATE',title:'You have enough capital for a property investment',text:'Real estate can create leverage and cash flow, but it also locks up money.',cond:()=>wealthNetWorth()>75000&&!wealthState.flags.realestate,opts:()=>[
    {t:'Buy a small rental',d:'Add a tangible asset and another income stream.',fx:()=>{const down=Math.min(wealthState.cash,Math.max(15000,wealthNetWorth()*.15));wealthState.cash-=down;wealthState.businessValue+=down*1.4;wealthState.debt+=down*.9;wealthState.annualProfit+=down*.12;wealthState.risk+=4;wealthState.flags.realestate=true;return `You used ${wfmt(down)} as equity in a rental property. Cash flow improved, but leverage increased.`;}},
    {t:'Buy property with cash',d:'Lower risk, more money tied up.',fx:()=>{const c=Math.min(wealthState.cash,Math.max(50000,wealthNetWorth()*.3));wealthState.cash-=c;wealthState.businessValue+=c;wealthState.annualProfit+=c*.07;wealthState.risk-=1;wealthState.flags.realestate=true;return `You put ${wfmt(c)} into property without taking on new debt.`;}},
    {t:'Pass',d:'Keep capital liquid for the business.',fx:()=>{wealthState.risk-=1;return 'You passed on property and kept your capital flexible.';}}
  ]},
  {id:'acquire',cat:'ACQUISITION',title:'A smaller competitor wants to sell',text:'Buying revenue is faster than building it, but hidden problems come with the deal.',cond:()=>wealthNetWorth()>250000&&wealthState.businessValue>50000&&!wealthState.flags.acquired,opts:()=>[
    {t:'Buy the competitor',d:'Absorb their customers, staff, and problems.',fx:()=>{const c=Math.min(wealthState.cash,Math.max(50000,wealthNetWorth()*.18));wealthState.cash-=c;const good=Math.random()>.3;if(good){wealthState.businessValue+=c*1.35;wealthState.annualProfit+=c*.3;wealthState.reputation+=5;wealthState.flags.acquired=true;return `The ${wfmt(c)} acquisition worked. Customers and cash flow transferred better than expected.`;}wealthState.businessValue+=c*.55;wealthState.annualProfit-=c*.08;wealthState.risk+=10;wealthState.flags.acquired=true;return `The ${wfmt(c)} acquisition came with operational problems you did not fully see before closing.`;}},
    {t:'Offer a partnership instead',d:'Capture some upside without buying the whole company.',fx:()=>{wealthState.annualProfit*=1.07;wealthState.reputation+=4;wealthState.risk+=1;return 'The partnership expanded reach without tying up as much capital.';}},
    {t:'Walk away',d:'Growth is not automatically good growth.',fx:()=>{wealthState.risk-=3;return 'You walked away when the deal did not clearly improve the business.';}}
  ]},
  {id:'exit',cat:'EXIT',title:'Someone offers to buy your business',text:'A sale can lock in years of work, but it also ends future upside.',cond:()=>wealthState.businessValue>100000&&!wealthState.flags.exitDecision,opts:()=>[
    {t:'Sell the business',d:'Turn business value into liquid wealth.',fx:()=>{const sale=wealthState.businessValue*1.15;wealthState.cash+=sale;wealthState.businessValue=0;wealthState.annualProfit*=.25;wealthState.risk-=8;wealthState.flags.exitDecision=true;wealthState.flags.sold=true;return `You sold for about ${wfmt(sale)}. The operating risk disappeared and became cash.`;}},
    {t:'Sell a minority stake',d:'Take money off the table but keep control.',fx:()=>{const sale=wealthState.businessValue*.3;wealthState.cash+=sale;wealthState.businessValue*=.72;wealthState.annualProfit*=.88;wealthState.risk-=3;wealthState.flags.exitDecision=true;return `You sold a minority stake for roughly ${wfmt(sale)} while keeping control.`;}},
    {t:'Reject the offer',d:'You believe the business can still compound.',fx:()=>{wealthState.businessValue*=1.08;wealthState.annualProfit*=1.06;wealthState.risk+=3;wealthState.flags.exitDecision=true;return 'You rejected the offer and kept the upside—and the risk.';}}
  ]}
];

const repeatable = [
  {cat:'INVESTING',title:'Where do you put excess cash this year?',text:'Idle money gives you flexibility. Invested money gives you a chance to compound.',opts:()=>[
    {t:'Broad market investments',d:'Diversified and liquid.',fx:()=>{const c=Math.min(wealthState.cash*.25,Math.max(100,wealthNetWorth()*.05));wealthState.cash-=c;wealthState.investments+=c;wealthState.risk-=1;return `You invested ${wfmt(c)} into diversified markets.`;}},
    {t:'Put it back into the business',d:'Higher concentration, potentially higher return.',fx:()=>{const c=Math.min(wealthState.cash*.25,Math.max(100,wealthNetWorth()*.05));wealthState.cash-=c;wealthState.businessValue+=c*1.08;wealthState.annualProfit+=c*.16;wealthState.risk+=3;return `You reinvested ${wfmt(c)} into the operating business.`;}},
    {t:'Hold cash',d:'No return, but maximum flexibility.',fx:()=>{wealthState.risk-=2;return 'You held cash and preserved your ability to react to the next opportunity.';}}
  ]},
  {cat:'OPERATIONS',title:'A competitor starts undercutting your prices',text:'Their offer is cheaper and customers are noticing.',opts:()=>[
    {t:'Cut prices too',d:'Protect volume, sacrifice margin.',fx:()=>{wealthState.annualProfit*=.9;wealthState.businessValue*=1.03;wealthState.risk+=2;return 'You defended market share, but margins tightened.';}},
    {t:'Differentiate instead',d:'Improve service, quality, or positioning.',fx:()=>{const c=Math.min(wealthState.cash*.08,Math.max(100,wealthState.start*.02));wealthState.cash-=c;wealthState.reputation+=6;wealthState.annualProfit*=1.05;return `You spent ${wfmt(c)} improving the offer instead of racing to the bottom.`;}},
    {t:'Ignore them',d:'Trust your existing customers.',fx:()=>{if(Math.random()>.55){wealthState.annualProfit*=1.02;return 'The competitor faded and your customers stayed.';}wealthState.annualProfit*=.9;wealthState.reputation-=2;return 'The competitor took enough customers to hurt your revenue.';}}
  ]},
  {cat:'RISK',title:'A high return opportunity lands in your inbox',text:'The pitch looks convincing. The return is much higher than normal.',opts:()=>[
    {t:'Put 10% of my cash into it',d:'Take a controlled speculative shot.',fx:()=>{const c=wealthState.cash*.1;wealthState.cash-=c;if(Math.random()>.45){wealthState.investments+=c*1.8;return `The bet worked. ${wfmt(c)} grew sharply.`;}return `The ${wfmt(c)} speculative bet failed and most of the money disappeared.`;}},
    {t:'Go big',d:'Risk 30% of available cash.',fx:()=>{const c=wealthState.cash*.3;wealthState.cash-=c;wealthState.risk+=10;if(Math.random()>.55){wealthState.investments+=c*2.1;return `The aggressive bet paid off and created a major gain.`;}return `The aggressive bet failed. ${wfmt(c)} left your balance sheet.`;}},
    {t:'Pass',d:'If the return looks abnormal, the risk probably is too.',fx:()=>{wealthState.risk-=3;return 'You passed and protected your capital.';}}
  ]}
];

function availableWealthQuestions(){ return wealthQuestions.filter(q=>!wealthState.used.has(q.id)&&q.cond()); }

function renderWealth(){
  W$('wealth-networth').textContent=wfmt(wealthNetWorth());
  W$('wealth-cash').textContent=wfmt(wealthState.cash);
  W$('wealth-profit').textContent=wfmt(wealthState.annualProfit);
  W$('wealth-business-value').textContent=wfmt(wealthState.businessValue);
  W$('wealth-investments').textContent=wfmt(wealthState.investments);
  W$('wealth-debt').textContent=wfmt(wealthState.debt);
  W$('wealth-risk').textContent=Math.round(wealthState.risk)+'/100';
  W$('wealth-reputation').textContent=Math.round(wealthState.reputation)+'/100';
  const items=[];
  if(wealthState.flags.service) items.push(['Business','Service company']);
  if(wealthState.flags.ecommerce) items.push(['Business','Online products']);
  if(wealthState.flags.realestate) items.push(['Assets','Rental property']);
  if(wealthState.flags.team) items.push(['Team','Growing']); else if(wealthState.flags.hired) items.push(['Team','First hire']);
  if(wealthState.flags.loan) items.push(['Financing',wealthState.flags.heavyDebt?'Heavy leverage':'Business loan']);
  items.push(['Strategy',wealthState.style]);
  W$('wealth-summary').innerHTML=items.map(x=>`<div class="summary-row"><span>${x[0]}</span><span>${x[1]}</span></div>`).join('');
  W$('wealth-log').innerHTML=wealthState.log.length?wealthState.log.map(x=>`<div class="event-item"><strong>${x.name}</strong>${x.text}</div>`).join(''):'<div class="event-item">Your financial decisions will appear here.</div>';
}

function wealthChapter(){return ['Survive first. Scale second.','Your model starts getting tested.','Growth creates new problems.','The bigger you get, the bigger the stakes.','Now the outcome becomes clear.'][Math.min(4,wealthState.year-1)];}

function nextWealthQuestion(){
  if(wealthState.decision>=wealthState.maxDecisions||wealthState.year>5){finishWealth();return;}
  let q;
  const available=availableWealthQuestions();
  if(available.length && Math.random()>.28){q=wpick(available);wealthState.used.add(q.id);} else q=wpick(repeatable);
  W$('wealth-year').textContent=wealthState.year;
  W$('wealth-chapter').textContent=wealthChapter();
  W$('wealth-category').textContent=q.cat;
  W$('wealth-progress').textContent=`Decision ${wealthState.decision+1} of ${wealthState.maxDecisions}`;
  W$('wealth-question-title').textContent=q.title;
  W$('wealth-question-text').textContent=q.text;
  const wrap=W$('wealth-choices');wrap.innerHTML='';
  q.opts().forEach((o,i)=>{
    const b=document.createElement('button');b.className='choice';
    b.innerHTML=`<strong>${String.fromCharCode(65+i)}. ${o.t}</strong><span>${o.d}</span>`;
    b.onclick=()=>{const before=wealthNetWorth();const text=o.fx();wealthState.risk=wclamp(wealthState.risk,0,100);wealthState.reputation=wclamp(wealthState.reputation,0,100);wealthState.cash=Math.max(0,wealthState.cash);wealthState.history.push({year:wealthState.year,choice:o.t,text,before,after:wealthNetWorth()});wlog(o.t,text);wealthState.decision++;if(wealthState.decision%5===0){endWealthYear();wealthState.year++;}renderWealth();setTimeout(nextWealthQuestion,100);};
    wrap.appendChild(b);
  });
  renderWealth();
}

function endWealthYear(){
  const diff=wealthState.difficulty;
  const profitMultiplier=diff==='friendly'?1.08:diff==='brutal'?.9:1;
  const operating=wealthState.annualProfit*profitMultiplier;
  wealthState.cash+=operating;
  const market=(diff==='brutal'?-0.01:0.02)+(Math.random()*(diff==='brutal'?.14:.1)-(diff==='brutal'?.08:.04));
  wealthState.investments*=1+market;
  wealthState.businessValue*=1+(wealthState.annualProfit>0?.06:-.08);
  if(wealthState.debt>0){
    const interest=wealthState.debt*(diff==='brutal'?.09:.065);
    wealthState.cash-=Math.min(wealthState.cash,interest);
    if(wealthState.cash>wealthState.debt*.12){const pay=Math.min(wealthState.debt,wealthState.cash*.08);wealthState.cash-=pay;wealthState.debt-=pay;}
  }
  const roll=Math.random();
  if(roll<.18){const hit=Math.min(wealthState.cash,Math.max(100,wealthNetWorth()*.04));wealthState.cash-=hit;wlog('Unexpected setback',`A slow period, repair, refund, or operational problem cost about ${wfmt(hit)}.`);}
  else if(roll>.86){const gain=Math.max(100,wealthState.annualProfit*.18);wealthState.cash+=gain;wlog('Strong year',`Unexpected demand added roughly ${wfmt(gain)} in extra cash.`);}
}

function wealthEndingTitle(roi,nw){
  if(nw<=0||roi<=-80)return 'WIPED OUT.';
  if(roi<0)return 'THE LOSS.';
  if(roi<25)return 'STILL STANDING.';
  if(roi<100)return 'PROFITABLE.';
  if(roi<500)return 'THE BUILDER.';
  return 'THE MULTIPLIER.';
}

function finishWealth(){
  showOnly('wealth-end-screen');
  const nw=wealthNetWorth();const gain=nw-wealthState.start;const roi=wealthState.start?gain/wealthState.start*100:0;
  W$('wealth-ending-title').textContent=wealthEndingTitle(roi,nw);
  W$('wealth-end-start').textContent=wfmt(wealthState.start);
  W$('wealth-end-networth').textContent=wfmt(nw);
  W$('wealth-end-gain').textContent=(gain>=0?'+':'')+wfmt(gain);
  W$('wealth-end-roi').textContent=`${roi>=0?'+':''}${roi.toFixed(1)}%`;
  W$('wealth-end-profit').textContent=wfmt(wealthState.annualProfit);
  W$('wealth-end-debt').textContent=wfmt(wealthState.debt);

  const first=wealthState.history.slice(0,5);
  const middle=wealthState.history.slice(5,15);
  const last=wealthState.history.slice(15);
  const strongest=[...wealthState.history].sort((a,b)=>(b.after-b.before)-(a.after-a.before))[0];
  const weakest=[...wealthState.history].sort((a,b)=>(a.after-a.before)-(b.after-b.before))[0];
  let story=`You started with ${wfmt(wealthState.start)} and treated it as working capital rather than guaranteed security. `;
  if(first.length) story+=`In the beginning, ${first.map(x=>x.text).slice(0,2).join(' ')} `;
  if(middle.length) story+=`By the middle years, the operation had become more complicated. ${middle.map(x=>x.text).slice(-2).join(' ')} `;
  if(last.length) story+=`During the final stretch, ${last.map(x=>x.text).slice(-2).join(' ')} `;
  story+=`Five years later, your net worth is ${wfmt(nw)}, a ${roi>=0?'gain':'loss'} of ${wfmt(Math.abs(gain))} from where you began. `;
  if(wealthState.debt>0) story+=`You still carry ${wfmt(wealthState.debt)} in debt, so part of your growth came with leverage. `;
  if(wealthState.annualProfit>0) story+=`Your current operation is producing about ${wfmt(wealthState.annualProfit)} in annual profit before future changes in the economy.`;
  W$('wealth-ending-story').textContent=story;

  const impacts=[];
  if(strongest) impacts.push(`<div class="impact-card"><strong>Best move</strong><p>${strongest.choice}: ${strongest.text}</p></div>`);
  if(weakest) impacts.push(`<div class="impact-card"><strong>Most expensive move</strong><p>${weakest.choice}: ${weakest.text}</p></div>`);
  impacts.push(`<div class="impact-card"><strong>Capital result</strong><p>Your starting ${wfmt(wealthState.start)} became ${wfmt(nw)} after five years, for a total return of ${roi.toFixed(1)}%.</p></div>`);
  W$('wealth-ending-impacts').innerHTML=impacts.join('');
}

W$('wealth-start-btn').onclick=()=>{
  const amount=Number(W$('wealth-starting-amount').value.replace(/,/g,''));
  if(!Number.isFinite(amount)||amount<100||amount>100000000){alert('Enter an amount between $100 and $100 million.');return;}
  Object.assign(wealthState,{start:amount,cash:amount,investments:0,businessValue:0,debt:0,annualProfit:0,risk:25,reputation:25,year:1,decision:0,style:W$('wealth-style').value,difficulty:W$('wealth-difficulty').value,flags:{},used:new Set(),log:[],history:[]});
  if(wealthState.style==='investor')wealthState.risk=18;
  if(wealthState.style==='hustle')wealthState.reputation=30;
  if(wealthState.style==='balanced')wealthState.risk=22;
  showOnly('wealth-game-screen');
  nextWealthQuestion();
};

W$('wealth-restart-btn').onclick=()=>{if(confirm('Restart Build Wealth mode?'))showOnly('wealth-start-screen');};
W$('wealth-play-again-btn').onclick=()=>showOnly('wealth-start-screen');
W$('wealth-copy-result-btn').onclick=async()=>{const nw=wealthNetWorth();const roi=(nw-wealthState.start)/wealthState.start*100;const text=`Fortune Path Build Wealth: I started with ${wfmt(wealthState.start)} and finished five years later with ${wfmt(nw)} (${roi>=0?'+':''}${roi.toFixed(1)}%).`;await navigator.clipboard.writeText(text);W$('wealth-copy-result-btn').textContent='Copied';setTimeout(()=>W$('wealth-copy-result-btn').textContent='Copy Result',1300);};
