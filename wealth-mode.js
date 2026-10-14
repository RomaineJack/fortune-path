const W$ = (id) => document.getElementById(id);
const wfmt = (n) => new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:0}).format(Math.round(n));
const wpick = (arr) => arr[Math.floor(Math.random()*arr.length)];
const wclamp = (v,min,max)=>Math.max(min,Math.min(max,v));

const wealthState = {
  start:0,cash:0,investments:0,businessValue:0,debt:0,annualProfit:0,
  risk:25,reputation:25,year:1,decision:0,maxDecisions:30,
  style:'business',difficulty:'realistic',flags:{},used:new Set(),usedEvents:new Set(),log:[],history:[]
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
function availableCashCost(target){ return Math.min(Math.max(0,wealthState.cash),target); }
function businessIs(...types){ return types.includes(wealthState.flags.businessType); }
function wlog(name,text){ wealthState.log.unshift({name,text}); wealthState.log=wealthState.log.slice(0,7); }
function pushHistory(question,option,result){ wealthState.history.push({year:wealthState.year,question,option,result}); }
function addProfit(v){ wealthState.annualProfit+=v; }
function addValue(v){ wealthState.businessValue=Math.max(0,wealthState.businessValue+v); }

const businesses = {
  service:{name:'Service Business',min:100,setup:.16,profit:.9,risk:3,desc:'Freelancing, web design, consulting, repair, or another skill based service.'},
  content:{name:'Content Creation Business',min:100,setup:.18,profit:.45,risk:5,desc:'YouTube, streaming, podcasts, newsletters, short form content, sponsorships, and digital products.'},
  ecommerce:{name:'E Commerce Brand',min:500,setup:.34,profit:.55,risk:8,desc:'Products, inventory, fulfillment, paid ads, customer support, and brand building.'},
  cleaning:{name:'Cleaning Company',min:1000,setup:.28,profit:.65,risk:4,desc:'Residential or commercial cleaning with crews, equipment, scheduling, and recurring contracts.'},
  foodtruck:{name:'Food Truck',min:15000,setup:.45,profit:.38,risk:9,desc:'A mobile food business with permits, food costs, staffing, location risk, and event revenue.'},
  trucking:{name:'Trucking Company',min:30000,setup:.48,profit:.28,risk:10,desc:'Commercial vehicles, insurance, maintenance, fuel, freight contracts, and drivers.'},
  saas:{name:'SaaS Startup',min:5000,setup:.4,profit:.3,risk:12,desc:'Software subscriptions with product development, churn, customer acquisition, and scalability.'},
  restaurant:{name:'Restaurant',min:50000,setup:.52,profit:.2,risk:14,desc:'A physical restaurant with rent, equipment, labor, food waste, reviews, and thin margins.'},
  realestate:{name:'Real Estate Company',min:25000,setup:.42,profit:.24,risk:8,desc:'Rental properties, flips, property management, leverage, vacancies, and appreciation.'},
  agency:{name:'Creative or Marketing Agency',min:500,setup:.22,profit:.75,risk:5,desc:'Client services with retainers, contractors, project delivery, and account growth.'}
};

function startBusiness(type){
  const b=businesses[type];
  const raw=Math.max(b.min,scaleCost(b.setup,b.min,wealthState.start*.7));
  const cost=availableCashCost(raw);
  wealthState.cash-=cost;
  wealthState.businessValue+=cost*.72;
  wealthState.annualProfit+=Math.max(200,cost*b.profit);
  wealthState.risk+=b.risk;
  wealthState.flags.businessType=type;
  wealthState.flags.businessName=b.name;
  return `You committed ${wfmt(cost)} to ${b.name}. ${b.desc}`;
}

function businessOptions(){
  const order=['service','content','agency','ecommerce','cleaning','saas','foodtruck','realestate','trucking','restaurant'];
  return order.filter(k=>wealthState.start>=businesses[k].min).map(k=>({t:businesses[k].name,d:businesses[k].desc,fx:()=>startBusiness(k)}));
}

const wealthQuestions = [
  {id:'businessChoice',cat:'STARTUP',title:'What kind of business do you build?',text:'Your starting capital changes what is realistic. Pick the business you actually want to try to grow over the next five years.',cond:()=>!wealthState.flags.businessType,opts:()=>businessOptions()},
  {id:'outsideIncome',cat:'CASH FLOW',title:'Do you keep outside income while the business grows?',text:'A young business is under less pressure when it does not have to immediately pay all of your personal bills.',cond:()=>true,opts:()=>[
    {t:'Keep my main job',d:'Less time, more financial stability.',fx:()=>{addProfit(32000);wealthState.risk-=4;wealthState.flags.job=true;return 'You kept outside income coming in, which gave the business breathing room during slow months.';}},
    {t:'Work part time',d:'Create more time without losing all outside cash flow.',fx:()=>{addProfit(15000);wealthState.risk-=1;wealthState.flags.parttime=true;return 'Part time income helped cover personal costs while leaving more hours for the business.';}},
    {t:'Go all in',d:'Maximum focus, maximum dependence on the business.',fx:()=>{addProfit(-12000);wealthState.risk+=7;wealthState.flags.fulltime=true;return 'You went full time. Growth could move faster, but weak months now hit you directly.';}}
  ]},
  {id:'banking',cat:'FOUNDATION',title:'How do you handle the money from day one?',text:'Mixing personal and business money makes it harder to know whether you are actually profitable.',cond:()=>!!wealthState.flags.businessType,opts:()=>[
    {t:'Separate everything',d:'Business account, bookkeeping, taxes, and clean records.',fx:()=>{wealthState.cash-=Math.min(wealthState.cash,300);wealthState.reputation+=3;wealthState.risk-=3;wealthState.flags.cleanBooks=true;return 'You separated the finances and built clean books. It cost a little money but reduced future headaches.';}},
    {t:'Keep it simple for now',d:'Use spreadsheets and handle it yourself.',fx:()=>{wealthState.risk+=2;return 'You kept the system informal. It saved money now, but errors will be easier to make later.';}},
    {t:'Hire professional help early',d:'Bookkeeping and tax help from the start.',fx:()=>{const c=Math.min(wealthState.cash,1200);wealthState.cash-=c;wealthState.reputation+=4;wealthState.risk-=5;wealthState.flags.proBooks=true;return `You spent ${wfmt(c)} on professional financial setup and reduced administrative risk.`;}}
  ]},
  {id:'pricing',cat:'PRICING',title:'How do you price the business?',text:'Low prices can attract customers quickly, but poor margins can quietly kill a growing company.',cond:()=>!!wealthState.flags.businessType,opts:()=>[
    {t:'Premium positioning',d:'Fewer customers, stronger margins, higher expectations.',fx:()=>{wealthState.annualProfit*=1.18;wealthState.businessValue*=1.06;wealthState.reputation+=5;wealthState.risk+=1;return 'You moved upmarket. Margins improved, but customers became less forgiving of mistakes.';}},
    {t:'Competitive middle',d:'Balance affordability with healthy margins.',fx:()=>{wealthState.annualProfit*=1.1;wealthState.businessValue*=1.05;wealthState.reputation+=2;return 'Balanced pricing gave you room to grow without turning every sale into a race to the bottom.';}},
    {t:'Undercut competitors',d:'Win customers quickly and worry about margins later.',fx:()=>{wealthState.businessValue*=1.13;wealthState.annualProfit*=.94;wealthState.risk+=5;return 'Volume increased, but your margin tightened. Growth looked good on the surface while cash flow became more fragile.';}}
  ]},
  {id:'contentPlatform',cat:'CONTENT',title:'Where do you build your audience first?',text:'Content creation becomes a business only when attention turns into repeatable revenue.',cond:()=>businessIs('content'),opts:()=>[
    {t:'YouTube first',d:'Longer videos, searchable content, ad revenue, sponsors, and a deep back catalog.',fx:()=>{wealthState.cash-=Math.min(wealthState.cash,800);addValue(1200);addProfit(1800);wealthState.risk+=2;wealthState.flags.youtube=true;return 'You built around YouTube. Growth started slower, but each good video had a longer shelf life.';}},
    {t:'Short form first',d:'TikTok, Reels, and Shorts for faster reach.',fx:()=>{wealthState.cash-=Math.min(wealthState.cash,500);addValue(900);addProfit(900);wealthState.reputation+=5;wealthState.risk+=5;wealthState.flags.shortform=true;return 'Short form gave you faster reach, but the audience was more volatile and harder to monetize deeply.';}},
    {t:'Streaming first',d:'Build a live community around personality and consistency.',fx:()=>{wealthState.cash-=Math.min(wealthState.cash,1200);addValue(1100);addProfit(1400);wealthState.reputation+=4;wealthState.flags.streaming=true;return 'You focused on live content. A smaller but more loyal community began forming around you.';}},
    {t:'Podcast or newsletter',d:'Build a direct audience around expertise and recurring attention.',fx:()=>{wealthState.cash-=Math.min(wealthState.cash,600);addValue(700);addProfit(1100);wealthState.risk-=1;wealthState.flags.directAudience=true;return 'You chose a direct audience model that grew slowly but gave you more control over distribution.';}}
  ]},
  {id:'contentNiche',cat:'CONTENT',title:'What kind of creator do you become?',text:'Your niche affects sponsorship demand, audience loyalty, competition, and how easy it is to sell something later.',cond:()=>businessIs('content'),opts:()=>[
    {t:'Gaming and entertainment',d:'Large audience, high competition, lots of sponsorship categories.',fx:()=>{wealthState.businessValue*=1.12;wealthState.reputation+=5;wealthState.risk+=4;wealthState.flags.niche='Gaming & Entertainment';return 'You entered gaming and entertainment, where audience potential was huge but standing out required consistency.';}},
    {t:'Business and money',d:'Higher value audience and stronger sponsor rates, but credibility matters.',fx:()=>{wealthState.annualProfit*=1.18;wealthState.reputation+=3;wealthState.risk+=3;wealthState.flags.niche='Business & Money';return 'A business focused audience monetized well, but every claim you made carried more reputational weight.';}},
    {t:'Tech and products',d:'Reviews, opinions, affiliate revenue, and brand partnerships.',fx:()=>{wealthState.annualProfit*=1.13;wealthState.businessValue*=1.08;wealthState.flags.niche='Tech';return 'Tech content opened several monetization paths beyond ads, especially affiliates and brand partnerships.';}},
    {t:'Personality and lifestyle',d:'You become the product. Flexible, but heavily dependent on your personal brand.',fx:()=>{wealthState.reputation+=8;wealthState.risk+=5;wealthState.flags.niche='Lifestyle';return 'The brand centered on you. That created flexibility, but business performance became tied closely to your public image.';}}
  ]},
  {id:'contentCadence',cat:'CONTENT',title:'How hard do you push your upload schedule?',text:'More content can accelerate growth, but burnout and weaker quality can damage the business.',cond:()=>businessIs('content'),opts:()=>[
    {t:'Quality over quantity',d:'Publish less often, but make every piece count.',fx:()=>{wealthState.reputation+=7;wealthState.businessValue*=1.08;wealthState.risk-=2;return 'You built a reputation for quality. Growth was steadier than explosive, but the audience trusted the work.';}},
    {t:'Post constantly',d:'Flood the platforms and learn fast.',fx:()=>{wealthState.businessValue*=1.2;wealthState.annualProfit*=1.08;wealthState.risk+=8;return 'Volume accelerated discovery, but the workload became difficult to sustain.';}},
    {t:'Build a repeatable schedule',d:'Use a realistic cadence and stick to it.',fx:()=>{wealthState.businessValue*=1.13;wealthState.reputation+=5;wealthState.risk-=1;return 'Consistency became an advantage. The audience knew when to expect you and production stayed manageable.';}}
  ]},
  {id:'contentMonetize',cat:'CONTENT',title:'Your audience is growing. How do you monetize it?',text:'Ad revenue is only one option. The strongest creator businesses usually stack several revenue streams.',cond:()=>businessIs('content')&&wealthState.businessValue>500,opts:()=>[
    {t:'Sponsors and ads',d:'Simple and scalable, but dependent on audience size and brand demand.',fx:()=>{addProfit(Math.max(1200,wealthState.businessValue*.32));wealthState.reputation+=2;wealthState.flags.sponsors=true;return 'Sponsorships and platform revenue became the first serious income stream from your audience.';}},
    {t:'Memberships and community',d:'Convert loyal viewers into recurring monthly revenue.',fx:()=>{addProfit(Math.max(1000,wealthState.businessValue*.24));wealthState.businessValue*=1.1;wealthState.reputation+=5;wealthState.flags.membership=true;return 'A paid community created recurring revenue and made the business less dependent on viral performance.';}},
    {t:'Digital products',d:'Courses, guides, templates, tools, or other high margin products.',fx:()=>{const c=Math.min(wealthState.cash,2000);wealthState.cash-=c;addProfit(Math.max(1500,c*1.6));wealthState.businessValue+=c*.8;wealthState.risk+=3;wealthState.flags.digitalProducts=true;return `You invested ${wfmt(c)} into digital products and added a higher margin revenue stream.`;}},
    {t:'Merchandise',d:'Turn audience identity into physical products.',fx:()=>{const c=Math.min(wealthState.cash,3500);wealthState.cash-=c;const win=Math.random()>.35;if(win){addProfit(c*1.2);addValue(c*.7);return `Your ${wfmt(c)} merch launch worked and created both cash flow and brand loyalty.`;}addProfit(-c*.25);wealthState.risk+=4;return 'The merch launch tied up cash in products that moved slower than expected.';}}
  ]},
  {id:'contentTeam',cat:'CONTENT',title:'Do you keep creating everything yourself?',text:'Editing, thumbnails, research, sponsorships, and publishing can become a full company before you realize it.',cond:()=>businessIs('content')&&wealthState.businessValue>2500,opts:()=>[
    {t:'Hire an editor',d:'Free your time for ideas and recording.',fx:()=>{const c=Math.min(wealthState.cash,5000);wealthState.cash-=c;addProfit(c*.35);addValue(c*.6);wealthState.risk+=1;wealthState.flags.hired=true;return `You spent ${wfmt(c)} adding editing support. Output became easier to sustain.`;}},
    {t:'Build a small production team',d:'Editor, thumbnail support, research, and sponsor management.',fx:()=>{const c=Math.min(wealthState.cash,12000);wealthState.cash-=c;addProfit(c*.55);addValue(c*.9);wealthState.risk+=6;wealthState.flags.team=true;return `You invested ${wfmt(c)} in a production team. Capacity increased, but payroll became real.`;}},
    {t:'Stay solo',d:'Keep margins high and control every creative decision.',fx:()=>{wealthState.annualProfit*=1.03;wealthState.risk+=2;return 'You stayed solo. Margins remained strong, but your own time became the growth ceiling.';}}
  ]},
  {id:'agencyRetainer',cat:'AGENCY',title:'A client offers a long term retainer',text:'Retainers stabilize revenue, but one large client can become dangerous if they make up too much of the business.',cond:()=>businessIs('agency','service'),opts:()=>[
    {t:'Take the retainer',d:'Stable monthly revenue and deeper client dependence.',fx:()=>{addProfit(Math.max(5000,wealthState.businessValue*.35));wealthState.businessValue*=1.12;wealthState.risk+=4;wealthState.flags.bigClient=true;return 'The retainer stabilized cash flow, but the client became important enough that losing them would hurt.';}},
    {t:'Take it but keep prospecting',d:'Use the stability without becoming dependent.',fx:()=>{addProfit(Math.max(3500,wealthState.businessValue*.25));wealthState.businessValue*=1.09;wealthState.reputation+=4;return 'You took the recurring revenue while continuing to diversify the client base.';}},
    {t:'Stay project based',d:'More freedom and more sales pressure.',fx:()=>{wealthState.reputation+=3;wealthState.risk+=2;return 'You kept flexibility, but every month still required fresh selling.';}}
  ]},
  {id:'agencyScope',cat:'AGENCY',title:'Clients keep asking for more than they paid for',text:'Scope creep can make a busy agency look successful while margins quietly collapse.',cond:()=>businessIs('agency','service'),opts:()=>[
    {t:'Enforce scope tightly',d:'Charge for every additional request.',fx:()=>{wealthState.annualProfit*=1.12;wealthState.reputation+=2;wealthState.risk-=2;return 'Clear boundaries protected your margins and trained clients to respect the agreement.';}},
    {t:'Overdeliver strategically',d:'Do extra work for the clients most likely to refer or renew.',fx:()=>{wealthState.reputation+=7;wealthState.businessValue*=1.08;wealthState.annualProfit*=1.03;return 'Selective overdelivery created goodwill without turning every project into unpaid labor.';}},
    {t:'Say yes to everything',d:'Keep clients happy now and deal with capacity later.',fx:()=>{wealthState.reputation+=4;wealthState.annualProfit*=.92;wealthState.risk+=6;return 'Clients loved the flexibility, but the business became busier without becoming proportionally more profitable.';}}
  ]},
  {id:'ecomInventory',cat:'E COMMERCE',title:'Your best product is selling faster than expected',text:'Inventory is both an opportunity and a trap. Too little loses sales. Too much traps cash.',cond:()=>businessIs('ecommerce'),opts:()=>[
    {t:'Reorder aggressively',d:'Bet on demand continuing.',fx:()=>{const c=Math.min(wealthState.cash,Math.max(500,wealthState.start*.12));wealthState.cash-=c;const good=Math.random()>.3;if(good){addProfit(c*1.4);addValue(c*.8);return `You put ${wfmt(c)} into inventory and demand held up. The bet paid off.`;}addValue(c*.35);wealthState.risk+=7;return 'Demand cooled and too much of your cash ended up sitting on shelves.';}},
    {t:'Reorder conservatively',d:'Protect cash and accept some stockouts.',fx:()=>{const c=Math.min(wealthState.cash,Math.max(200,wealthState.start*.05));wealthState.cash-=c;addProfit(c*.75);addValue(c*.4);wealthState.risk-=1;return `A smaller ${wfmt(c)} reorder preserved flexibility while still capturing some demand.`;}},
    {t:'Move to preorder',d:'Let customers fund production before you commit.',fx:()=>{wealthState.annualProfit*=1.08;wealthState.risk-=3;wealthState.reputation-=1;return 'Preorders reduced inventory risk, although some customers disliked waiting.';}}
  ]},
  {id:'cleaningContracts',cat:'CLEANING',title:'A commercial property manager offers you a large contract',text:'The contract could transform revenue, but you will need more workers and equipment immediately.',cond:()=>businessIs('cleaning'),opts:()=>[
    {t:'Take the contract and hire',d:'Scale operations around guaranteed work.',fx:()=>{const c=Math.min(wealthState.cash,8000);wealthState.cash-=c;addProfit(c*.85+8000);addValue(c*.7);wealthState.risk+=4;wealthState.flags.team=true;return 'The commercial contract created recurring revenue and pushed the company beyond small residential jobs.';}},
    {t:'Negotiate a smaller rollout',d:'Start with fewer properties and prove capacity.',fx:()=>{addProfit(4500);wealthState.reputation+=5;wealthState.risk-=1;return 'A phased rollout protected service quality and still opened the commercial market.';}},
    {t:'Pass for now',d:'Stay within current capacity.',fx:()=>{wealthState.reputation+=1;wealthState.risk-=3;return 'You protected the operation from growing faster than the team could handle.';}}
  ]},
  {id:'saasMvp',cat:'SAAS',title:'The first version of your software is ready',text:'You can launch early and learn from users, or spend more time polishing before anyone sees it.',cond:()=>businessIs('saas'),opts:()=>[
    {t:'Launch the MVP now',d:'Get real users and real feedback quickly.',fx:()=>{wealthState.businessValue*=1.18;addProfit(2500);wealthState.reputation+=3;wealthState.risk+=4;return 'Launching early exposed flaws, but real customers showed you what actually mattered.';}},
    {t:'Polish before launch',d:'Spend more time improving the product experience.',fx:()=>{const c=Math.min(wealthState.cash,6000);wealthState.cash-=c;addValue(c*.9);wealthState.reputation+=6;return `You spent ${wfmt(c)} improving the product before launch. Growth started later but with a stronger first impression.`;}},
    {t:'Invite only beta',d:'Control the rollout and learn from a small group.',fx:()=>{wealthState.businessValue*=1.1;wealthState.risk-=2;wealthState.reputation+=4;return 'The private beta uncovered problems before they reached a larger market.';}}
  ]},
  {id:'foodMenu',cat:'FOOD BUSINESS',title:'Your menu is getting too complicated',text:'More options attract more customers, but inventory, prep time, and waste increase quickly.',cond:()=>businessIs('foodtruck','restaurant'),opts:()=>[
    {t:'Cut down to best sellers',d:'Simplify operations around what customers already love.',fx:()=>{wealthState.annualProfit*=1.13;wealthState.reputation+=4;wealthState.risk-=3;return 'A tighter menu reduced waste and made the kitchen faster.';}},
    {t:'Keep the broad menu',d:'Serve more tastes and accept the complexity.',fx:()=>{wealthState.businessValue*=1.05;wealthState.annualProfit*=.98;wealthState.risk+=3;return 'Variety helped attract different customers, but complexity continued eating into margins.';}},
    {t:'Add premium specials',d:'Keep the core menu simple and rotate higher margin limited items.',fx:()=>{wealthState.annualProfit*=1.1;wealthState.reputation+=6;wealthState.risk+=1;return 'Premium specials improved margins without permanently bloating the menu.';}}
  ]},
  {id:'truckingFleet',cat:'TRUCKING',title:'Do you add another truck?',text:'A second vehicle can grow revenue quickly, but payments, insurance, repairs, and driver availability grow with it.',cond:()=>businessIs('trucking'),opts:()=>[
    {t:'Finance another truck',d:'Scale the fleet with debt.',fx:()=>{const equity=Math.min(wealthState.cash,20000);wealthState.cash-=equity;wealthState.debt+=60000;addValue(70000);addProfit(18000);wealthState.risk+=8;return 'You added another truck using leverage. Revenue capacity rose, but so did fixed obligations.';}},
    {t:'Buy used with cash',d:'Lower payment pressure with more maintenance uncertainty.',fx:()=>{const c=Math.min(wealthState.cash,45000);wealthState.cash-=c;addValue(c*.85);addProfit(c*.25);wealthState.risk+=4;return `You spent ${wfmt(c)} on used equipment and avoided a large new payment.`;}},
    {t:'Stay with one truck',d:'Protect cash and optimize current routes.',fx:()=>{wealthState.annualProfit*=1.07;wealthState.risk-=3;return 'You focused on utilization instead of expanding the fleet too early.';}}
  ]},
  {id:'realEstateDeal',cat:'REAL ESTATE',title:'A small rental property becomes available',text:'The numbers are decent, but buying property will tie up a meaningful part of your capital.',cond:()=>businessIs('realestate'),opts:()=>[
    {t:'Buy with financing',d:'Use leverage and preserve some cash.',fx:()=>{const down=Math.min(wealthState.cash,Math.max(5000,wealthState.start*.15));wealthState.cash-=down;wealthState.debt+=down*3;addValue(down*3.7);addProfit(down*.18);wealthState.risk+=6;return `You used ${wfmt(down)} as a down payment and used leverage to control a larger asset.`;}},
    {t:'Buy mostly with cash',d:'Lower risk but tie up more capital.',fx:()=>{const c=Math.min(wealthState.cash,Math.max(10000,wealthState.start*.3));wealthState.cash-=c;addValue(c);addProfit(c*.07);wealthState.risk-=2;return `You put ${wfmt(c)} into property with minimal leverage.`;}},
    {t:'Pass and wait',d:'Keep cash ready for a stronger deal.',fx:()=>{wealthState.risk-=2;return 'You passed on an acceptable deal rather than confusing activity with opportunity.';}}
  ]},
  {id:'generalMarketing',cat:'GROWTH',title:'How do you acquire more customers?',text:'Every business needs a repeatable way to generate demand.',cond:()=>!!wealthState.flags.businessType,opts:()=>[
    {t:'Test small paid campaigns',d:'Measure results before scaling.',fx:()=>{const c=Math.min(wealthState.cash,Math.max(100,wealthState.start*.04));wealthState.cash-=c;addProfit(c*.55);addValue(c*.45);wealthState.risk+=1;return `You spent ${wfmt(c)} testing customer acquisition and learned which channels actually worked.`;}},
    {t:'Spend aggressively',d:'Push hard while the business has momentum.',fx:()=>{const c=Math.min(wealthState.cash,Math.max(300,wealthState.start*.1));wealthState.cash-=c;const good=Math.random()>.38;if(good){addProfit(c*1.25);addValue(c);wealthState.reputation+=4;return `The ${wfmt(c)} growth push worked and accelerated the company.`;}addProfit(-c*.25);wealthState.risk+=9;return `The ${wfmt(c)} campaign missed. Growth spending turned into an expensive lesson.`;}},
    {t:'Grow organically',d:'Use referrals, networking, content, and word of mouth.',fx:()=>{wealthState.businessValue*=1.06;wealthState.reputation+=5;wealthState.risk-=1;return 'Organic growth was slower but built stronger customer trust and protected cash.';}}
  ]},
  {id:'firstHire',cat:'OPERATIONS',title:'The workload is becoming too much for one person',text:'Hiring can unlock growth, but payroll does not disappear when sales slow down.',cond:()=>wealthState.businessValue>2500&&!wealthState.flags.hired,opts:()=>[
    {t:'Hire one strong person',d:'Add capacity without building a large payroll.',fx:()=>{const c=Math.min(wealthState.cash,Math.max(1000,wealthState.start*.06));wealthState.cash-=c;addProfit(c*.45);addValue(c*.6);wealthState.reputation+=3;wealthState.flags.hired=true;return `You invested ${wfmt(c)} into your first hire and increased capacity.`;}},
    {t:'Use contractors',d:'Flexible labor without committing to full payroll.',fx:()=>{wealthState.annualProfit*=1.06;wealthState.risk+=2;wealthState.flags.contractors=true;return 'Contractors increased flexibility, though quality control required more attention.';}},
    {t:'Stay solo',d:'Protect margins and accept slower growth.',fx:()=>{wealthState.risk-=2;wealthState.annualProfit*=.99;wealthState.flags.solo=true;return 'You stayed lean and protected fixed costs, but your own time remained the bottleneck.';}}
  ]},
  {id:'systems',cat:'OPERATIONS',title:'The business is getting messy behind the scenes',text:'More customers create more invoices, messages, scheduling, support, and mistakes.',cond:()=>wealthState.businessValue>5000,opts:()=>[
    {t:'Invest in systems and automation',d:'Spend money to make the company less dependent on memory and manual work.',fx:()=>{const c=Math.min(wealthState.cash,Math.max(500,wealthState.start*.03));wealthState.cash-=c;addValue(c*.9);wealthState.annualProfit*=1.06;wealthState.risk-=3;return `You spent ${wfmt(c)} on systems that improved efficiency and reduced errors.`;}},
    {t:'Hire an operations person',d:'Put a human in charge of keeping everything organized.',fx:()=>{const c=Math.min(wealthState.cash,6000);wealthState.cash-=c;addProfit(c*.25);addValue(c*.55);wealthState.risk-=2;return 'Operations support reduced chaos and gave you more time to focus on growth.';}},
    {t:'Keep doing it manually',d:'Save money and accept more complexity.',fx:()=>{wealthState.risk+=6;return 'You saved the cash, but operational mistakes became more likely as volume increased.';}}
  ]},
  {id:'loan',cat:'FINANCE',title:'A lender offers growth capital',text:'Debt can accelerate a good model or magnify a bad one.',cond:()=>wealthState.businessValue>5000&&wealthState.debt===0,opts:()=>[
    {t:'Take a conservative loan',d:'Use leverage without making the payment overwhelming.',fx:()=>{const amt=Math.min(250000,Math.max(5000,wealthNetWorth()*.18));wealthState.cash+=amt;wealthState.debt+=amt;wealthState.risk+=5;wealthState.flags.loan=true;return `You borrowed ${wfmt(amt)} and added capital without maxing out your borrowing capacity.`;}},
    {t:'Take the maximum offered',d:'Move much faster with much more leverage.',fx:()=>{const amt=Math.min(1000000,Math.max(10000,wealthNetWorth()*.45));wealthState.cash+=amt;wealthState.debt+=amt;wealthState.risk+=13;wealthState.flags.loan=true;wealthState.flags.heavyDebt=true;return `You borrowed ${wfmt(amt)} and chose speed over safety.`;}},
    {t:'Stay debt free',d:'Grow only with money the business actually earns.',fx:()=>{wealthState.risk-=5;wealthState.reputation+=2;wealthState.flags.noDebt=true;return 'You rejected leverage and kept the downside under tighter control.';}}
  ]},
  {id:'reinvest',cat:'CAPITAL',title:'The business is finally producing meaningful profit',text:'You can take the money, reinvest it, or diversify outside the company.',cond:()=>wealthState.annualProfit>1000,opts:()=>[
    {t:'Reinvest heavily',d:'Put profit back into growth.',fx:()=>{const c=Math.min(wealthState.cash,Math.max(300,wealthState.annualProfit*.3));wealthState.cash-=c;addValue(c*1.15);addProfit(c*.28);wealthState.risk+=4;wealthState.flags.reinvested=true;return `You reinvested ${wfmt(c)} and increased the business's earning capacity.`;}},
    {t:'Split between business and investments',d:'Build two engines instead of one.',fx:()=>{const c=Math.min(wealthState.cash,Math.max(200,wealthState.annualProfit*.22));wealthState.cash-=c;wealthState.investments+=c*.55;addValue(c*.45);wealthState.risk-=1;return `You split ${wfmt(c)} between the company and outside investments.`;}},
    {t:'Keep the profit liquid',d:'Preserve flexibility and reduce pressure.',fx:()=>{wealthState.risk-=2;wealthState.flags.tookProfit=true;return 'You kept profit available instead of automatically chasing more growth.';}}
  ]},
  {id:'secondBusiness',cat:'EXPANSION',title:'Do you start another business?',text:'A second company can diversify income or divide your attention at exactly the wrong time.',cond:()=>wealthState.businessValue>20000&&!wealthState.flags.secondBusiness,opts:()=>[
    {t:'Launch a second company',d:'Create another operating income stream.',fx:()=>{const c=Math.min(wealthState.cash,Math.max(2500,wealthNetWorth()*.07));wealthState.cash-=c;addValue(c*.85);addProfit(c*.35);wealthState.risk+=7;wealthState.flags.secondBusiness=true;return `You invested ${wfmt(c)} into another company and increased both diversification and complexity.`;}},
    {t:'Stay focused on the winner',d:'Make the first company stronger instead.',fx:()=>{wealthState.businessValue*=1.08;wealthState.annualProfit*=1.05;wealthState.risk-=2;return 'Focus improved execution and made the existing business more efficient.';}},
    {t:'Invest outside the business',d:'Diversify without adding another operating job.',fx:()=>{const c=Math.min(wealthState.cash,Math.max(1000,wealthNetWorth()*.05));wealthState.cash-=c;wealthState.investments+=c;wealthState.risk-=2;return `You moved ${wfmt(c)} into outside investments rather than another business.`;}}
  ]},
  {id:'competitor',cat:'COMPETITION',title:'A competitor starts undercutting your prices',text:'They are openly targeting your customers and promising similar service for less.',cond:()=>wealthState.businessValue>8000,opts:()=>[
    {t:'Compete on quality',d:'Refuse the price war and strengthen the offer.',fx:()=>{wealthState.reputation+=7;wealthState.businessValue*=1.06;wealthState.risk-=1;return 'You protected positioning instead of training customers to choose only on price.';}},
    {t:'Match their prices',d:'Protect market share even if margins shrink.',fx:()=>{wealthState.businessValue*=1.08;wealthState.annualProfit*=.94;wealthState.risk+=2;return 'You held more customers, but lower pricing weakened margins.';}},
    {t:'Outspend them on growth',d:'Use marketing and sales to overwhelm the challenge.',fx:()=>{const c=Math.min(wealthState.cash,5000);wealthState.cash-=c;addValue(c*.7);addProfit(c*.25);wealthState.risk+=5;return `You spent ${wfmt(c)} defending market share and pushed the fight into customer acquisition.`;}}
  ]},
  {id:'acquisition',cat:'ACQUISITION',title:'A smaller competitor wants to sell',text:'Buying revenue is faster than building it, but hidden problems come with the deal.',cond:()=>wealthNetWorth()>150000&&wealthState.businessValue>40000&&!wealthState.flags.acquired,opts:()=>[
    {t:'Buy the competitor',d:'Absorb customers, staff, systems, and hidden problems.',fx:()=>{const c=Math.min(wealthState.cash,Math.max(25000,wealthNetWorth()*.14));wealthState.cash-=c;const good=Math.random()>.33;if(good){addValue(c*1.25);addProfit(c*.24);wealthState.reputation+=5;wealthState.flags.acquired=true;return `The ${wfmt(c)} acquisition worked and accelerated scale.`;}addValue(c*.5);addProfit(-c*.07);wealthState.risk+=10;wealthState.flags.acquired=true;return `The ${wfmt(c)} deal came with more operational problems than the seller disclosed.`;}},
    {t:'Offer a partnership',d:'Capture some upside without buying the whole company.',fx:()=>{wealthState.annualProfit*=1.07;wealthState.reputation+=4;wealthState.risk+=1;wealthState.flags.acquired=true;return 'A partnership expanded reach without putting as much capital at risk.';}},
    {t:'Walk away',d:'Keep building what you already understand.',fx:()=>{wealthState.risk-=2;wealthState.flags.acquired=true;return 'You passed on the deal and protected focus and liquidity.';}}
  ]},
  {id:'investments',cat:'INVESTING',title:'Do you move some money outside the business?',text:'A company can make you wealthy, but concentration can also make one bad year devastating.',cond:()=>wealthState.cash>1000,opts:()=>[
    {t:'Build a diversified portfolio',d:'Move part of cash into long term investments.',fx:()=>{const c=Math.min(wealthState.cash,Math.max(500,wealthState.cash*.2));wealthState.cash-=c;wealthState.investments+=c;wealthState.risk-=4;return `You moved ${wfmt(c)} into diversified investments and reduced dependence on the business.`;}},
    {t:'Keep everything in the company',d:'Concentrate capital where you have the most control.',fx:()=>{wealthState.businessValue*=1.05;wealthState.risk+=4;return 'You stayed concentrated. The upside increased, but so did dependence on one company.';}},
    {t:'Keep cash reserves',d:'Prioritize liquidity over returns.',fx:()=>{wealthState.risk-=3;return 'You kept a larger cash cushion for opportunities and emergencies.';}}
  ]},
  {id:'exitOffer',cat:'EXIT',title:'Someone offers to buy your business',text:'The offer is large enough to turn years of work into cash today, but selling ends some of your future upside.',cond:()=>wealthState.businessValue>50000&&!wealthState.flags.exitDecision,opts:()=>[
    {t:'Sell the business',d:'Lock in the value and convert the company into cash.',fx:()=>{const sale=wealthState.businessValue*1.08;wealthState.cash+=sale;wealthState.businessValue=0;wealthState.annualProfit*=.45;wealthState.risk-=8;wealthState.flags.exitDecision=true;wealthState.flags.soldBusiness=true;return `You sold for roughly ${wfmt(sale)} and converted years of operating risk into liquid wealth.`;}},
    {t:'Sell a minority stake',d:'Take money off the table while keeping control.',fx:()=>{const proceeds=wealthState.businessValue*.28;wealthState.cash+=proceeds;wealthState.businessValue*=.78;wealthState.risk-=3;wealthState.flags.exitDecision=true;return `You took ${wfmt(proceeds)} off the table while keeping control of the company.`;}},
    {t:'Keep building',d:'Reject the offer and bet on a larger future outcome.',fx:()=>{wealthState.businessValue*=1.07;wealthState.risk+=4;wealthState.flags.exitDecision=true;return 'You rejected the offer and kept betting on the company you built.';}}
  ]},
  {id:'succession',cat:'OWNER',title:'How dependent is the business on you?',text:'A company that stops when you stop is closer to a job than an asset.',cond:()=>wealthState.businessValue>30000,opts:()=>[
    {t:'Build management underneath me',d:'Train people to run the operation without you.',fx:()=>{const c=Math.min(wealthState.cash,8000);wealthState.cash-=c;wealthState.businessValue*=1.13;wealthState.risk-=5;wealthState.flags.management=true;return `You spent ${wfmt(c)} building management depth and made the company more valuable without your daily presence.`;}},
    {t:'Stay deeply involved',d:'Keep control and maximize your personal influence.',fx:()=>{wealthState.annualProfit*=1.04;wealthState.risk+=3;return 'You kept strong control, but the company remained dependent on you.';}},
    {t:'Automate aggressively',d:'Use systems and software to reduce owner dependence.',fx:()=>{const c=Math.min(wealthState.cash,6000);wealthState.cash-=c;wealthState.businessValue*=1.1;wealthState.annualProfit*=1.06;wealthState.risk+=1;return `You spent ${wfmt(c)} reducing manual work and improving scalability.`;}}
  ]}
];

const wealthEvents = [
  {id:'greatYear',name:'Strong economy',text:'Customer demand runs hotter than expected.',apply:()=>{wealthState.annualProfit*=1.12;wealthState.businessValue*=1.08;}},
  {id:'recession',name:'Economic slowdown',text:'Customers cut spending and sales become harder.',apply:()=>{const mult=wealthState.difficulty==='brutal'?.74:.84;wealthState.annualProfit*=mult;wealthState.businessValue*=.92;wealthState.risk+=4;}},
  {id:'referral',name:'Major referral',text:'One happy customer sends a wave of new business.',apply:()=>{addProfit(Math.max(500,wealthState.businessValue*.08));wealthState.reputation+=4;}},
  {id:'taxBill',name:'Tax surprise',text:'You owe more than expected after a profitable stretch.',apply:()=>{const c=Math.min(wealthState.cash,Math.max(200,Math.abs(wealthState.annualProfit)*.08));wealthState.cash-=c;}},
  {id:'marketGain',name:'Investment markets rise',text:'Your diversified investments have a strong year.',cond:()=>wealthState.investments>0,apply:()=>{wealthState.investments*=1.1;}},
  {id:'marketDrop',name:'Market correction',text:'Outside investments fall temporarily.',cond:()=>wealthState.investments>0,apply:()=>{wealthState.investments*=.9;}},
  {id:'employeeIssue',name:'Staffing problem',text:'An unexpected employee issue disrupts operations.',cond:()=>wealthState.flags.hired||wealthState.flags.team,apply:()=>{addProfit(-Math.max(500,wealthState.businessValue*.025));wealthState.reputation-=2;}},
  {id:'viral',name:'Unexpected attention',text:'Something about your business catches public attention and demand spikes.',apply:()=>{wealthState.businessValue*=1.1;addProfit(Math.max(400,wealthState.businessValue*.04));wealthState.reputation+=5;}},
  {id:'platformChange',name:'Platform algorithm shift',text:'A major platform changes distribution and your reach becomes less predictable.',cond:()=>businessIs('content'),apply:()=>{wealthState.annualProfit*=.9;wealthState.risk+=4;}},
  {id:'sponsorWin',name:'Major sponsor arrives',text:'A brand offers a larger than normal creator partnership.',cond:()=>businessIs('content'),apply:()=>{addProfit(Math.max(2000,wealthState.businessValue*.12));wealthState.reputation+=3;}},
  {id:'chargeback',name:'Customer dispute wave',text:'Refunds or chargebacks hurt a month of sales.',cond:()=>businessIs('ecommerce'),apply:()=>{addProfit(-Math.max(500,wealthState.businessValue*.035));wealthState.reputation-=3;}},
  {id:'commercialLead',name:'Commercial lead',text:'A larger company asks about a recurring service contract.',cond:()=>businessIs('service','agency','cleaning'),apply:()=>{addProfit(Math.max(1200,wealthState.businessValue*.06));wealthState.reputation+=3;}},
  {id:'fuelSpike',name:'Fuel prices spike',text:'Operating costs jump unexpectedly.',cond:()=>businessIs('trucking','foodtruck'),apply:()=>{wealthState.annualProfit*=.9;}},
  {id:'vacancy',name:'Property vacancy',text:'A unit sits empty longer than planned.',cond:()=>businessIs('realestate'),apply:()=>{addProfit(-Math.max(1000,wealthState.businessValue*.025));}},
  {id:'reviewBoost',name:'Excellent reviews',text:'A run of strong customer reviews increases trust and conversion.',apply:()=>{wealthState.reputation+=6;wealthState.businessValue*=1.04;}},
  {id:'softwareBug',name:'Production bug',text:'A software issue disrupts customers and support volume jumps.',cond:()=>businessIs('saas'),apply:()=>{addProfit(-Math.max(1000,wealthState.businessValue*.03));wealthState.reputation-=4;}},
  {id:'equipment',name:'Equipment failure',text:'Essential equipment needs an unexpected replacement.',cond:()=>businessIs('cleaning','foodtruck','restaurant','trucking'),apply:()=>{wealthState.cash-=Math.min(wealthState.cash,Math.max(600,wealthState.businessValue*.02));}},
  {id:'competitorCloses',name:'Competitor closes',text:'A nearby competitor exits the market and customers start looking for alternatives.',apply:()=>{wealthState.businessValue*=1.07;addProfit(Math.max(500,wealthState.businessValue*.035));}}
];

function eligibleWealthQuestions(){ return wealthQuestions.filter(q=>!wealthState.used.has(q.id)&&q.cond()); }

function chooseWealthQuestion(){
  if(wealthState.decision>=wealthState.maxDecisions||wealthState.year>5){ finishWealthGame(); return; }
  const eligible=eligibleWealthQuestions();
  if(!eligible.length){ finishWealthGame(); return; }
  const specific=eligible.filter(q=>['CONTENT','AGENCY','E COMMERCE','CLEANING','SAAS','FOOD TRUCK','FOOD BUSINESS','RESTAURANT','TRUCKING','REAL ESTATE'].includes(q.cat));
  const item=specific.length&&Math.random()<.6?wpick(specific):wpick(eligible);
  wealthState.used.add(item.id);
  renderWealthQuestion(item);
}

function renderWealthQuestion(item){
  W$('wealth-category').textContent=item.cat;
  W$('wealth-progress').textContent=`Decision ${wealthState.decision+1} of ${wealthState.maxDecisions}`;
  W$('wealth-question-title').textContent=item.title;
  W$('wealth-question-text').textContent=item.text;
  W$('wealth-year').textContent=wealthState.year;
  W$('wealth-chapter').textContent=['Find the model.','Make it repeatable.','Scale without breaking it.','Protect what you built.','Turn the business into wealth.'][Math.min(wealthState.year-1,4)];
  const wrap=W$('wealth-choices');wrap.innerHTML='';
  item.opts().forEach((o,i)=>{
    const b=document.createElement('button');b.className='choice';
    b.innerHTML=`<strong>${String.fromCharCode(65+i)}. ${o.t}</strong><span>${o.d}</span>`;
    b.onclick=()=>{
      const result=o.fx();
      wealthState.risk=wclamp(wealthState.risk,0,100);wealthState.reputation=wclamp(wealthState.reputation,0,100);wealthState.cash=Math.max(0,wealthState.cash);
      wlog(o.t,result);pushHistory(item.title,o.t,result);wealthState.decision++;
      if(wealthState.decision%6===0){ endWealthYear();wealthState.year++; }
      setTimeout(chooseWealthQuestion,100);
    };
    wrap.appendChild(b);
  });
  renderWealthStats();
}

function endWealthYear(){
  const difficulty=wealthState.difficulty==='friendly'?1.08:wealthState.difficulty==='brutal'?.88:1;
  const operating=wealthState.annualProfit*difficulty;
  wealthState.cash+=operating;
  if(wealthState.debt>0){const interest=wealthState.debt*(wealthState.difficulty==='brutal'?.095:.07);wealthState.cash-=Math.min(wealthState.cash,interest);}
  if(wealthState.investments>0) wealthState.investments*=wealthState.difficulty==='brutal'?1.025:1.05;
  wealthState.businessValue*=1+(Math.max(-.05,Math.min(.12,operating/Math.max(1,wealthState.businessValue)*.08)));
  const available=wealthEvents.filter(e=>!wealthState.usedEvents.has(e.id)&&(!e.cond||e.cond()));
  if(available.length){const e=wpick(available);wealthState.usedEvents.add(e.id);e.apply();wlog(e.name,e.text);wealthState.history.push({year:wealthState.year,question:'Yearly event',option:e.name,result:e.text});}
  if(wealthState.cash<0){wealthState.debt+=Math.abs(wealthState.cash);wealthState.cash=0;}
  wealthState.risk=wclamp(wealthState.risk,0,100);wealthState.reputation=wclamp(wealthState.reputation,0,100);
}

function renderWealthStats(){
  W$('wealth-networth').textContent=wfmt(wealthNetWorth());W$('wealth-cash').textContent=wfmt(wealthState.cash);W$('wealth-profit').textContent=wfmt(wealthState.annualProfit);W$('wealth-business-value').textContent=wfmt(wealthState.businessValue);W$('wealth-investments').textContent=wfmt(wealthState.investments);W$('wealth-debt').textContent=wfmt(wealthState.debt);W$('wealth-risk').textContent=Math.round(wealthState.risk)+'/100';W$('wealth-reputation').textContent=Math.round(wealthState.reputation)+'/100';
  const rows=[];
  if(wealthState.flags.businessName) rows.push(['Business',wealthState.flags.businessName]);if(wealthState.flags.niche) rows.push(['Niche',wealthState.flags.niche]);if(wealthState.flags.job) rows.push(['Outside income','Full time job']);else if(wealthState.flags.parttime) rows.push(['Outside income','Part time']);else if(wealthState.flags.fulltime) rows.push(['Owner status','Full time']);if(wealthState.flags.hired||wealthState.flags.team) rows.push(['Team',wealthState.flags.team?'Growing team':'First hire']);if(wealthState.flags.loan) rows.push(['Financing','Business debt']);if(wealthState.flags.management) rows.push(['Operations','Management layer']);rows.push(['Questions used',`${wealthState.used.size} unique`]);
  W$('wealth-summary').innerHTML=rows.map(r=>`<div class="summary-row"><span>${r[0]}</span><span>${r[1]}</span></div>`).join('');
  W$('wealth-log').innerHTML=wealthState.log.length?wealthState.log.map(x=>`<div class="event-item"><strong>${x.name}</strong>${x.text}</div>`).join(''):'<div class="event-item">Your business decisions will appear here.</div>';
}

function finishWealthGame(){
  showOnly('wealth-end-screen');
  const nw=wealthNetWorth(),gain=nw-wealthState.start,roi=wealthState.start?gain/wealthState.start*100:0;
  let title='STILL STANDING.';if(nw<=0||roi<-80)title='WIPED OUT.';else if(roi<0)title='THE BUSINESS LOST MONEY.';else if(roi<25)title='SMALL WIN.';else if(roi<100)title='PROFITABLE.';else if(roi<500)title='SERIOUS GROWTH.';else title='WEALTH BUILDER.';
  W$('wealth-ending-title').textContent=title;
  const type=wealthState.flags.businessName||'business';const path=[`You started with ${wfmt(wealthState.start)} and chose to build a ${type}.`];
  if(wealthState.flags.niche)path.push(`Your content focused on ${wealthState.flags.niche}, which shaped the audience and monetization options available to you.`);if(wealthState.flags.job)path.push('Keeping outside income reduced pressure on the company during its early stages.');if(wealthState.flags.fulltime)path.push('Going full time increased both your focus and the consequences of weak business months.');if(wealthState.flags.hired||wealthState.flags.team)path.push('Hiring increased capacity, but it also turned payroll into a permanent responsibility.');if(wealthState.flags.loan)path.push(`Debt helped you move faster, but you finished with ${wfmt(wealthState.debt)} still owed.`);if(wealthState.flags.reinvested)path.push('Reinvesting profit increased the value of the company instead of treating every good month as spending money.');if(wealthState.flags.soldBusiness)path.push('Eventually you converted the business itself into cash by accepting an exit offer.');path.push(`Five years later your estimated net worth is ${wfmt(nw)}, a ${roi>=0?'gain':'loss'} of ${wfmt(Math.abs(gain))}, or ${Math.abs(roi).toFixed(1)}%.`);
  W$('wealth-ending-story').textContent=path.join(' ');
  W$('wealth-end-start').textContent=wfmt(wealthState.start);W$('wealth-end-networth').textContent=wfmt(nw);W$('wealth-end-gain').textContent=(gain>=0?'+':'-')+wfmt(Math.abs(gain));W$('wealth-end-roi').textContent=`${roi>=0?'+':''}${roi.toFixed(1)}%`;W$('wealth-end-profit').textContent=wfmt(wealthState.annualProfit);W$('wealth-end-debt').textContent=wfmt(wealthState.debt);
  const selected=wealthState.history.filter(x=>x.question!=='Yearly event').slice(0,8);
  W$('wealth-ending-impacts').innerHTML=selected.map(h=>`<div class="impact-card"><span>YEAR ${h.year}</span><strong>${h.option}</strong><p>${h.result}</p></div>`).join('');
}

W$('wealth-start-btn').onclick=()=>{
  const amount=Number(W$('wealth-starting-amount').value.replace(/,/g,''));if(!Number.isFinite(amount)||amount<100||amount>100000000){alert('Enter an amount between $100 and $100 million.');return;}
  Object.assign(wealthState,{start:amount,cash:amount,investments:0,businessValue:0,debt:0,annualProfit:0,risk:25,reputation:25,year:1,decision:0,maxDecisions:30,style:W$('wealth-style').value,difficulty:W$('wealth-difficulty').value,flags:{},used:new Set(),usedEvents:new Set(),log:[],history:[]});showOnly('wealth-game-screen');chooseWealthQuestion();
};
W$('wealth-restart-btn').onclick=()=>{if(confirm('Restart Build Wealth and choose a new amount?'))showOnly('wealth-start-screen');};
W$('wealth-play-again-btn').onclick=()=>showOnly('wealth-start-screen');
W$('wealth-copy-result-btn').onclick=async()=>{const nw=wealthNetWorth(),roi=(nw-wealthState.start)/wealthState.start*100;const text=`Fortune Path Build Wealth: I started with ${wfmt(wealthState.start)} in ${wealthState.flags.businessName||'a business'} and finished five years later with ${wfmt(nw)} (${roi>=0?'+':''}${roi.toFixed(1)}%).`;await navigator.clipboard.writeText(text);W$('wealth-copy-result-btn').textContent='Copied';setTimeout(()=>W$('wealth-copy-result-btn').textContent='Copy Result',1300);};
