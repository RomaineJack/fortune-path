const $ = (id) => document.getElementById(id);
const fmt = (n) => new Intl.NumberFormat('en-US', { style:'currency', currency:'USD', maximumFractionDigits:0 }).format(Math.round(n));
const clamp = (v,min,max)=>Math.max(min,Math.min(max,v));
const pick = (arr)=>arr[Math.floor(Math.random()*arr.length)];

const state = {
  start: 0, cash: 0, assets: 0, debt: 0, income: 0, burn: 0,
  risk: 20, happiness: 50, reputation: 10,
  year: 1, decision: 0, maxDecisions: 20,
  flags: {}, used: new Set(), log: []
};

const q = (id, category, title, text, condition, options) => ({ id, category, title, text, condition, options });

const questions = [
  q('job','LIFE','What happens to your job?','The money is real. You could walk away tomorrow, or keep your routine while you adjust.',()=>true,[
    {t:'Quit immediately',d:'Your time belongs to you now.',e:{happiness:8,burn:20000},f:{retired:true}},
    {t:'Stay for six months',d:'Give yourself time to adjust before making a clean exit.',e:{cash:25000,happiness:2},f:{retiredLater:true}},
    {t:'Keep working',d:'You like the structure, even if the paycheck no longer matters.',e:{income:55000,happiness:-2},f:{stillWorking:true}}
  ]),
  q('home','PROPERTY','Where do you live?','Your current home suddenly feels like a choice instead of a constraint.',()=>!state.flags.ownsHome,[
    {t:'Stay where you are',d:'Upgrade a few things and keep life familiar.',e:{cash:-150000,happiness:2},f:{ownsHome:true,modestHome:true}},
    {t:'Buy a luxury home',d:'Move quickly into something finished and private.',ePct:{cash:-.035,assets:.03},minCost:1200000,e:{burn:140000,happiness:8},f:{ownsHome:true,luxuryHome:true}},
    {t:'Buy land and build',d:'Create a custom estate from scratch.',ePct:{cash:-.055,assets:.05},minCost:2500000,e:{burn:230000,happiness:12,risk:2},f:{ownsHome:true,estate:true}}
  ]),
  q('estateExtras','PROPERTY','How far do you take the estate?', 'The shell is impressive. Now comes everything that turns a big house into your place.',()=>state.flags.estate,[
    {t:'Keep it tasteful',d:'Pool, gym, office, theater, and a serious garage.',e:{cash:-1800000,assets:1200000,burn:70000,happiness:5}},
    {t:'Build the dream compound',d:'Guest house, studio, sports court, workshop, and full grounds.',e:{cash:-5000000,assets:3500000,burn:180000,happiness:9,risk:2}},
    {t:'Stop spending for now',d:'Move in first. Add more later if you still care.',e:{happiness:1}}
  ]),
  q('cars','LIFESTYLE','What does the garage look like?','Cars are one of the easiest places to turn “I can afford it” into “why did I buy all this?”',()=>true,[
    {t:'Two nice vehicles',d:'Comfortable, practical, still obviously successful.',e:{cash:-180000,assets:120000,burn:16000,happiness:4}},
    {t:'Build a 5 to 7 car collection',d:'Sports car, luxury SUV, daily driver, and a few wants.',e:{cash:-900000,assets:620000,burn:65000,happiness:8}},
    {t:'Go supercar crazy',d:'A showroom full of expensive toys.',e:{cash:-5500000,assets:3500000,burn:320000,happiness:10,risk:5},f:{flashy:true}}
  ]),
  q('family','FAMILY','How much do you change your family’s lives?','People you love now know you have more money than most families could spend in generations.',()=>!state.flags.familyPlan,[
    {t:'Help selectively',d:'Pay off some debts and handle real needs.',ePct:{cash:-.01},maxCost:3000000,e:{happiness:5,reputation:4},f:{familyPlan:true,boundaries:true}},
    {t:'Create a structured family fund',d:'A managed pool for housing, education, and emergencies.',ePct:{cash:-.04,assets:.03},maxCost:15000000,e:{happiness:8,reputation:7},f:{familyPlan:true,boundaries:true,trusts:true}},
    {t:'Make everyone rich',d:'Large cash gifts, homes, cars, and no real restrictions.',ePct:{cash:-.1},maxCost:40000000,e:{happiness:7,reputation:12,risk:10,burn:350000},f:{familyPlan:true,openWallet:true}}
  ]),
  q('boundaries','FAMILY','A relative asks for a major business loan','They want enough money to open a restaurant and insist the idea cannot fail.',()=>state.flags.familyPlan,[
    {t:'Require professional review',d:'If the numbers work, you will consider it.',e:{reputation:-1,risk:-3},f:{dueDiligence:true}},
    {t:'Give them the money',d:'Family is family.',e:{cash:-750000,happiness:2,reputation:5,risk:5}},
    {t:'Say no',d:'You are not becoming the family bank.',e:{happiness:-2,reputation:-2,risk:-2}}
  ]),
  q('business','BUSINESS','Do you build something bigger than yourself?','You have enough capital to become an owner instead of just an investor.',()=>!state.flags.businessMode,[
    {t:'Build a holding company',d:'Own businesses across several industries.',ePct:{cash:-.16,assets:.13},maxCost:80000000,e:{income:1800000,risk:10,reputation:7,burn:700000},f:{businessMode:true,holding:true}},
    {t:'Invest passively',d:'Broad markets, bonds, and real estate funds.',ePct:{cash:-.35,assets:.35},e:{income:1300000,risk:-4},f:{businessMode:true,passive:true}},
    {t:'Mostly stay liquid',d:'Keep flexibility and avoid becoming a full time operator.',ePct:{cash:-.08,assets:.08},e:{income:350000,risk:-7},f:{businessMode:true,conservative:true}}
  ]),
  q('businessRole','BUSINESS','How involved are you in your companies?','Ownership can become a second job if you let it.',()=>state.flags.holding,[
    {t:'Strategic owner',d:'Review performance and major moves while executives run the day to day.',e:{income:450000,burn:180000,risk:-2,happiness:4},f:{strategicOwner:true}},
    {t:'Hands on CEO',d:'You want control and you are willing to work for it.',e:{income:900000,burn:250000,happiness:-4,risk:3},f:{handsOn:true}},
    {t:'Mostly passive',d:'Hire great people and stay out of the way.',e:{income:150000,burn:420000,happiness:7,risk:4},f:{passiveOwner:true}}
  ]),
  q('realestate','BUSINESS','A real estate portfolio becomes available','Apartment and commercial properties are being sold as a package.',()=>state.flags.holding && !state.flags.realestate,[
    {t:'Buy it outright',d:'Use cash and take full control.',ePct:{cash:-.08,assets:.075},maxCost:25000000,e:{income:1300000,burn:450000,risk:5},f:{realestate:true}},
    {t:'Buy with partners',d:'Take a smaller stake and share the risk.',ePct:{cash:-.035,assets:.034},maxCost:12000000,e:{income:520000,burn:160000,risk:2},f:{realestate:true}},
    {t:'Pass',d:'You already have enough moving pieces.',e:{risk:-2}}
  ]),
  q('resort','BUSINESS','A luxury resort is for sale','It looks incredible, but hospitality can eat money fast when occupancy falls.',()=>state.flags.holding && state.cash > 15000000 && !state.flags.resort,[
    {t:'Buy it',d:'Add hospitality to the empire.',e:{cash:-35000000,assets:30000000,income:1600000,burn:2600000,risk:12,reputation:5},f:{resort:true}},
    {t:'Buy with partners',d:'Reduce your exposure and keep more liquidity.',e:{cash:-12000000,assets:10500000,income:600000,burn:800000,risk:6},f:{resort:true}},
    {t:'Pass',d:'A beautiful property can still be a bad business.',e:{risk:-3}}
  ]),
  q('resortTrouble','BUSINESS','The resort has a bad year','Occupancy misses projections and renovations go over budget.',()=>state.flags.resort && !state.flags.resortResolved,[
    {t:'Replace management',d:'Bring in experienced hospitality operators and set a hard deadline.',e:{cash:-2200000,income:500000,burn:-300000,risk:-2},f:{resortResolved:true}},
    {t:'Rebrand upmarket',d:'Fewer guests, higher prices, more exclusivity.',e:{cash:-8000000,assets:3000000,income:1400000,burn:350000,risk:5,reputation:4},f:{resortResolved:true,premiumResort:true}},
    {t:'Sell and take the loss',d:'Free the capital before this gets worse.',e:{cash:23000000,assets:-30000000,income:-1600000,burn:-2600000,risk:-7},f:{resortResolved:true,resortSold:true}}
  ]),
  q('publicBrand','MEDIA','People want to watch your life','Interviews, YouTube, podcasts, and sponsorship offers start showing up.',()=>!state.flags.publicBrand,[
    {t:'Build a public brand',d:'Turn your story into a media business.',e:{cash:-900000,income:1100000,burn:500000,reputation:12,risk:4,happiness:4},f:{publicBrand:true}},
    {t:'Stay selective',d:'Appear occasionally, but protect your privacy.',e:{income:150000,reputation:4,risk:-1},f:{privatePublic:true}},
    {t:'Disappear',d:'Privacy matters more than attention.',e:{reputation:-5,happiness:3,risk:-4},f:{veryPrivate:true}}
  ]),
  q('brandScale','MEDIA','Your personal brand takes off','Sponsors, appearances, and audience growth are accelerating.',()=>state.flags.publicBrand && !state.flags.brandScaled,[
    {t:'Monetize aggressively',d:'Products, sponsorships, memberships, and speaking.',e:{income:3500000,burn:1600000,reputation:7,risk:4},f:{brandScaled:true}},
    {t:'Keep it premium',d:'Fewer deals, higher trust, less noise.',e:{income:1300000,burn:400000,reputation:5,risk:-1},f:{brandScaled:true}},
    {t:'Keep it mostly for fun',d:'You already have money. The audience is enough.',e:{income:250000,burn:180000,happiness:5},f:{brandScaled:true}}
  ]),
  q('charity','LEGACY','How much do you give back?','You can make a permanent impact, but charitable money is no longer personal money.',()=>!state.flags.charity,[
    {t:'Give $100K a year',d:'Support causes without building an organization.',e:{burn:100000,reputation:3,happiness:3},f:{charity:true}},
    {t:'Create a $10M foundation',d:'Build something structured and long term.',e:{cash:-10000000,reputation:12,happiness:8},f:{charity:true,foundation:true}},
    {t:'Create a $25M foundation',d:'Make philanthropy one of the central parts of your legacy.',e:{cash:-25000000,reputation:18,happiness:12},f:{charity:true,foundation:true}}
  ]),
  q('travel','LIFESTYLE','How do you travel now?','You can afford almost anything. That does not mean you need to own it.',()=>!state.flags.travel,[
    {t:'First class and luxury hotels',d:'Comfort without private aviation overhead.',e:{burn:250000,happiness:5},f:{travel:true}},
    {t:'Charter private when useful',d:'Pay for convenience without owning the aircraft.',e:{burn:900000,happiness:7,risk:1},f:{travel:true}},
    {t:'Buy a private jet',d:'Maximum convenience. Maximum fixed cost.',e:{cash:-22000000,assets:13000000,burn:3200000,happiness:10,risk:7},f:{travel:true,jet:true}}
  ]),
  q('staff','LIFESTYLE','Who keeps your life running?','Large properties and multiple ventures create work whether you do it yourself or not.',()=>!state.flags.staff,[
    {t:'Minimal staff',d:'Housekeeping, maintenance, and occasional security.',e:{burn:220000,happiness:3},f:{staff:true}},
    {t:'Small household team',d:'Property manager, housekeeping, grounds, chef support, and security.',e:{burn:520000,happiness:7,risk:-1},f:{staff:true}},
    {t:'Full private staff',d:'Estate manager, chef, drivers, security, assistants, and more.',e:{burn:1600000,happiness:9,risk:2},f:{staff:true}}
  ]),
  q('security','LIFESTYLE','How seriously do you take security?','The richer and more public you become, the more your privacy matters.',()=>!state.flags.security,[
    {t:'Basic systems',d:'Gates, cameras, alarms, and normal precautions.',e:{burn:80000,risk:1},f:{security:true}},
    {t:'Professional security plan',d:'Cybersecurity, vetted staff, travel protocols, and on call protection.',e:{burn:300000,risk:-4},f:{security:true}},
    {t:'Full time protection',d:'Dedicated security around you and your family.',e:{burn:1100000,risk:-6,happiness:-1},f:{security:true}}
  ]),
  q('startup','INVESTING','A startup asks for serious money','The founders are impressive. The upside is huge. So is the chance of losing every dollar.',()=>state.cash>5000000 && !state.flags.startup,[
    {t:'Invest $2 million',d:'Enough upside without betting the house.',e:{cash:-2000000,assets:1800000,risk:3},f:{startup:true,startupSize:2}},
    {t:'Invest $10 million',d:'Take a real swing.',e:{cash:-10000000,assets:8500000,risk:10},f:{startup:true,startupSize:10}},
    {t:'Pass',d:'Not every opportunity deserves your money.',e:{risk:-2},f:{startup:true,startupSize:0}}
  ]),
  q('acquisition','BUSINESS','Someone wants to buy one of your companies','The offer is large enough to change your portfolio overnight.',()=>state.flags.holding && !state.flags.exit,[
    {t:'Take the guaranteed win',d:'Sell and lock in the gain.',e:{cash:32000000,assets:-14000000,income:-500000,burn:-250000,risk:-4},f:{exit:true}},
    {t:'Sell a minority stake',d:'Take cash off the table but keep control.',e:{cash:12000000,assets:-4000000,risk:-1},f:{exit:true}},
    {t:'Keep the company',d:'You think it can be worth much more later.',e:{income:500000,risk:5},f:{exit:true}}
  ]),
  q('friends','SOCIAL','Your social circle starts changing','Some people treat you exactly the same. Others suddenly have plans for your money.',()=>!state.flags.social,[
    {t:'Keep your circle, set boundaries',d:'Same people, clearer rules.',e:{happiness:6,risk:-3},f:{social:true,boundaries:true}},
    {t:'Pay for everybody',d:'Trips, dinners, cars, and “loans” become normal.',e:{burn:1200000,happiness:4,reputation:8,risk:7},f:{social:true,openWallet:true}},
    {t:'Pull back hard',d:'Protect your peace, even if some relationships fade.',e:{happiness:1,reputation:-3,risk:-5},f:{social:true}}
  ]),
  q('secondHomes','PROPERTY','Do you want homes in other places?','A beach house sounds great until you realize every house has taxes, insurance, repairs, and staff.',()=>state.flags.ownsHome && state.cash>5000000 && !state.flags.secondHomes,[
    {t:'No, one home is enough',d:'Travel when you want and keep your life simple.',e:{risk:-2},f:{secondHomes:true}},
    {t:'Buy one vacation home',d:'A place you will actually use.',e:{cash:-4000000,assets:3500000,burn:180000,happiness:6},f:{secondHomes:true}},
    {t:'Buy homes in several cities',d:'Build a personal property portfolio.',e:{cash:-18000000,assets:16000000,burn:700000,happiness:9,risk:4},f:{secondHomes:true}}
  ])
];

const yearlyEvents = [
  {name:'Market rally',text:'Public markets surge and lift your investment assets.',apply:s=>{const g=s.assets*.06; s.assets+=g; s.log.unshift({name:'Market rally',text:`Your assets gained about ${fmt(g)}.`});}},
  {name:'Market drop',text:'Markets fall sharply this year.',apply:s=>{const l=s.assets*.045; s.assets-=l; s.log.unshift({name:'Market drop',text:`Your assets fell about ${fmt(l)}.`});}},
  {name:'Unexpected tax bill',text:'A complicated filing ends with more taxes than expected.',apply:s=>{const l=Math.min(s.cash*.015,3000000); s.cash-=l; s.log.unshift({name:'Tax surprise',text:`You paid an extra ${fmt(l)}.`});}},
  {name:'Strong business year',text:'Several operating companies beat their targets.',cond:s=>s.flags.holding,apply:s=>{const g=Math.max(500000,s.income*.4); s.cash+=g; s.log.unshift({name:'Business breakout',text:`Your companies generated an extra ${fmt(g)}.`});}},
  {name:'Startup outcome',text:'Your startup investment gets repriced after a funding round.',cond:s=>s.flags.startupSize>0,apply:s=>{const good=Math.random()>.45; const base=s.flags.startupSize*1000000; const delta=good?base*1.7:-base*.65; s.assets+=delta; s.log.unshift({name:good?'Startup jumps':'Startup struggles',text:`Your private investment changed by ${fmt(delta)}.`});}},
  {name:'Quiet year',text:'Nothing dramatic happens. Sometimes that is the best outcome.',apply:s=>s.log.unshift({name:'Quiet year',text:'Your plan stays on track with no major shock.'})}
];
