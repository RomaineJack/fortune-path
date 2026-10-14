// Build Wealth v2: business-first setup, tailored no-repeat questions, and choice-built narrative endings.

const wealthV2Profiles = {
  service:{name:'Service Business',min:100,customer:'clients',work:'projects',growth:'referrals and repeat clients',risk:'scope creep and inconsistent demand'},
  content:{name:'Content Creation Business',min:100,customer:'viewers and supporters',work:'content',growth:'audience growth and monetization',risk:'platform volatility and burnout'},
  agency:{name:'Creative or Marketing Agency',min:500,customer:'clients',work:'campaigns and deliverables',growth:'retainers and referrals',risk:'client concentration and delivery quality'},
  ecommerce:{name:'E Commerce Brand',min:500,customer:'customers',work:'orders and products',growth:'repeat purchases and distribution',risk:'inventory and advertising costs'},
  cleaning:{name:'Cleaning Company',min:1000,customer:'households and commercial accounts',work:'cleaning jobs',growth:'recurring contracts and route density',risk:'staffing and service consistency'},
  saas:{name:'SaaS Startup',min:5000,customer:'subscribers',work:'product development',growth:'recurring subscriptions',risk:'churn, bugs, and acquisition cost'},
  foodtruck:{name:'Food Truck',min:15000,customer:'diners and event customers',work:'service days and events',growth:'repeat locations, catering, and events',risk:'food costs, permits, and equipment'},
  realestate:{name:'Real Estate Company',min:25000,customer:'tenants and buyers',work:'properties',growth:'cash flow, appreciation, and acquisitions',risk:'vacancies, repairs, and leverage'},
  trucking:{name:'Trucking Company',min:30000,customer:'shippers and brokers',work:'loads and routes',growth:'contracts, utilization, and fleet expansion',risk:'fuel, repairs, insurance, and downtime'},
  restaurant:{name:'Restaurant',min:50000,customer:'diners',work:'service shifts',growth:'repeat traffic, reputation, and additional locations',risk:'labor, food waste, rent, and thin margins'}
};

function wealthV2AddSetup(){
  const setup=W$('wealth-start-screen');
  if(!setup || W$('wealth-business-type')) return;
  const grid=setup.querySelector('.wealth-setup');
  if(!grid) return;
  const block=document.createElement('div');
  block.className='setup-block';
  block.innerHTML=`<label for="wealth-business-type">Business you want to build</label><select id="wealth-business-type"></select><p id="wealth-business-preview" class="helper"></p>`;
  grid.prepend(block);
  const select=W$('wealth-business-type');
  const refresh=()=>{
    const amount=Number((W$('wealth-starting-amount').value||'0').replace(/,/g,''))||0;
    const current=select.value;
    select.innerHTML=Object.entries(wealthV2Profiles).map(([key,p])=>`<option value="${key}" ${amount<p.min?'disabled':''}>${p.name}${amount<p.min?` · needs ${wfmt(p.min)}`:''}</option>`).join('');
    if(current && select.querySelector(`option[value="${current}"]:not(:disabled)`)) select.value=current;
    else { const first=[...select.options].find(o=>!o.disabled); if(first) select.value=first.value; }
    const p=wealthV2Profiles[select.value];
    W$('wealth-business-preview').textContent=p?`You will get questions built around ${p.name.toLowerCase()}: ${p.growth}, with real exposure to ${p.risk}.`:'';
  };
  select.addEventListener('change',refresh);
  W$('wealth-starting-amount').addEventListener('input',refresh);
  W$('wealth-randomize-btn').addEventListener('click',()=>setTimeout(refresh,0));
  refresh();
}
wealthV2AddSetup();

function wealthV2CommonQuestion(id,cat,title,text,options){
  return {id:`v2_${id}`,cat,title,text,cond:()=>true,opts:()=>options};
}
function wealthV2Effect(label,desc,fn){ return {t:label,d:desc,fx:fn}; }
function wealthV2Profile(){ return wealthV2Profiles[wealthState.flags.businessType]||wealthV2Profiles.service; }
function wealthV2Spend(pct,min,max){ const target=Math.min(max,Math.max(min,wealthState.start*pct)); return Math.min(wealthState.cash,target); }

function wealthV2ContextQuestions(){
  const p=wealthV2Profile();
  return [
    wealthV2CommonQuestion('customers','CUSTOMERS',`How do you get the next wave of ${p.customer}?`,`The business has proof of life, but ${p.growth} will not happen automatically.`,[
      wealthV2Effect('Build referrals and relationships','Grow through trust and repeat business.',()=>{wealthState.reputation+=6;wealthState.businessValue*=1.08;wealthState.risk-=2;return `You leaned on relationships and referrals. Growth was steadier, and ${p.customer} arrived with more trust already built in.`;}),
      wealthV2Effect('Spend on acquisition','Use paid growth to accelerate demand.',()=>{const c=wealthV2Spend(.05,100,25000);wealthState.cash-=c;const good=Math.random()>.3;if(good){wealthState.annualProfit+=c*.9;wealthState.businessValue+=c*.65;wealthState.reputation+=2;return `You spent ${wfmt(c)} acquiring demand and the campaign paid off.`;}wealthState.annualProfit-=c*.25;wealthState.risk+=6;return `You spent ${wfmt(c)} on growth, but the return came in weaker than expected.`;}),
      wealthV2Effect('Build an organic channel','Trade speed for content, search, community, or local visibility.',()=>{wealthState.businessValue*=1.1;wealthState.reputation+=5;return `You built an organic growth engine that made the business less dependent on paid demand.`;})
    ]),
    wealthV2CommonQuestion('reserve','CASH FLOW','How much cash do you keep untouched?',`Even a healthy ${p.name.toLowerCase()} can hit a bad month because of ${p.risk}.`,[
      wealthV2Effect('Keep a six month reserve','Protect the company from one bad stretch.',()=>{wealthState.risk-=6;return 'You protected a meaningful cash reserve, giving the company more room to survive a bad stretch without panic decisions.';}),
      wealthV2Effect('Keep a smaller reserve','Leave more capital available for growth.',()=>{wealthState.businessValue*=1.04;wealthState.risk+=2;return 'You kept a leaner reserve and left more money working inside the business.';}),
      wealthV2Effect('Put almost everything to work','Prioritize growth over liquidity.',()=>{wealthState.businessValue*=1.12;wealthState.annualProfit*=1.06;wealthState.risk+=8;return 'You kept very little idle cash. Growth accelerated, but the company became less forgiving of surprises.';})
    ]),
    wealthV2CommonQuestion('ownerpay','OWNER PAY','When do you start paying yourself?',`The company is making money, but taking too much out early can slow ${p.growth}.`,[
      wealthV2Effect('Pay myself modestly','Take enough to make the work sustainable.',()=>{wealthState.annualProfit*=.97;wealthState.risk-=1;return 'You began taking a modest owner income without draining the company.';}),
      wealthV2Effect('Reinvest nearly everything','Delay personal reward to compound faster.',()=>{wealthState.businessValue*=1.12;wealthState.annualProfit*=1.05;wealthState.risk+=2;wealthState.flags.reinvested=true;return 'You delayed paying yourself heavily and pushed more profit back into growth.';}),
      wealthV2Effect('Take a large draw','Reward yourself now.',()=>{const c=Math.min(wealthState.cash,Math.max(500,wealthState.annualProfit*.2));wealthState.cash-=c;wealthState.risk+=4;return `You pulled ${wfmt(c)} out for yourself. The money was yours, but the business had less room to compound.`;})
    ]),
    wealthV2CommonQuestion('systems','OPERATIONS',`How do you organize all the ${p.work}?`,`Growth is creating more moving parts than one person can reliably keep in their head.`,[
      wealthV2Effect('Build systems early','Document workflows, track numbers, and standardize recurring work.',()=>{const c=wealthV2Spend(.025,100,10000);wealthState.cash-=c;wealthState.businessValue*=1.11;wealthState.risk-=4;wealthState.flags.systems=true;return `You spent ${wfmt(c)} building systems that made the company more repeatable and less dependent on memory.`;}),
      wealthV2Effect('Hire help to run operations','Add someone who owns the details.',()=>{const c=wealthV2Spend(.06,500,25000);wealthState.cash-=c;wealthState.annualProfit+=c*.2;wealthState.businessValue+=c*.6;wealthState.risk-=2;wealthState.flags.hired=true;return `You invested ${wfmt(c)} in operational help and freed more owner attention for growth.`;}),
      wealthV2Effect('Keep doing it myself','Protect cash and stay hands on.',()=>{wealthState.annualProfit*=1.03;wealthState.risk+=5;return 'You stayed hands on. Cash stayed protected, but the business remained dependent on your attention.';})
    ]),
    wealthV2CommonQuestion('complaint','REPUTATION',`A ${p.customer.replace(/s$/,'')} has a serious complaint`,`One bad experience can become a small problem or a public reputation problem depending on how you handle it.`,[
      wealthV2Effect('Fix it immediately','Absorb the cost and protect trust.',()=>{const c=Math.min(wealthState.cash,Math.max(100,wealthState.businessValue*.01));wealthState.cash-=c;wealthState.reputation+=7;wealthState.risk-=2;return `You spent ${wfmt(c)} making the situation right. The short term cost protected the brand.`;}),
      wealthV2Effect('Offer a fair compromise','Share the cost and preserve the relationship.',()=>{wealthState.reputation+=3;return 'You found a middle ground that kept the issue from becoming bigger than it needed to be.';}),
      wealthV2Effect('Push back','Protect margin and defend the company.',()=>{wealthState.reputation-=6;wealthState.risk+=4;return 'You defended the company instead of conceding. You saved money, but the relationship and reputation took a hit.';})
    ]),
    wealthV2CommonQuestion('competition','COMPETITION','A competitor starts copying your strongest moves',`Competition is validating the market, but it also threatens the advantage that made your ${p.name.toLowerCase()} stand out.`,[
      wealthV2Effect('Differentiate harder','Improve the offer instead of racing them on price.',()=>{wealthState.businessValue*=1.1;wealthState.reputation+=5;return 'You sharpened the brand and offer instead of letting the competitor define the fight.';}),
      wealthV2Effect('Compete on price','Lower prices to defend volume.',()=>{wealthState.annualProfit*=.93;wealthState.businessValue*=1.05;wealthState.risk+=3;return 'You defended volume with price, but margins became thinner.';}),
      wealthV2Effect('Ignore them and execute','Stay focused on your own customers and economics.',()=>{wealthState.reputation+=2;wealthState.risk-=2;return 'You stayed focused on execution rather than reacting to every competitive move.';})
    ]),
    wealthV2CommonQuestion('insurance','RISK','How much protection do you buy?',`The downside in this business includes ${p.risk}. Some risks can be transferred; others have to be managed.`,[
      wealthV2Effect('Buy strong coverage','Spend more to reduce catastrophic downside.',()=>{const c=wealthV2Spend(.02,100,15000);wealthState.cash-=c;wealthState.risk-=7;return `You spent ${wfmt(c)} on stronger protection and reduced the chance that one incident destroys the business.`;}),
      wealthV2Effect('Carry basic coverage','Meet the basics without overinsuring.',()=>{wealthState.risk-=2;return 'You covered the core risks without spending heavily on protection.';}),
      wealthV2Effect('Keep coverage minimal','Protect cash and accept more exposure.',()=>{wealthState.risk+=7;return 'You kept insurance costs low, but more of the downside now sits directly on the company.';})
    ]),
    wealthV2CommonQuestion('hire','TEAM','The business needs more capacity',`Demand is starting to outrun how much ${p.work} you can personally handle.`,[
      wealthV2Effect('Hire one strong person','Add capacity carefully.',()=>{const c=wealthV2Spend(.07,500,30000);wealthState.cash-=c;wealthState.businessValue+=c*.7;wealthState.annualProfit+=c*.35;wealthState.flags.hired=true;return `You invested ${wfmt(c)} in your first meaningful hire and increased capacity without building a huge payroll.`;}),
      wealthV2Effect('Build a team quickly','Scale ahead of demand.',()=>{const c=wealthV2Spend(.16,1500,75000);wealthState.cash-=c;wealthState.businessValue+=c*.9;wealthState.annualProfit+=c*.5;wealthState.risk+=7;wealthState.flags.team=true;return `You spent ${wfmt(c)} building a team. The company can handle much more work, but payroll is now real risk.`;}),
      wealthV2Effect('Use contractors or vendors','Add flexible capacity without full payroll.',()=>{const c=wealthV2Spend(.04,250,20000);wealthState.cash-=c;wealthState.businessValue+=c*.5;wealthState.annualProfit+=c*.25;wealthState.risk+=1;return `You spent ${wfmt(c)} on flexible outside help and kept fixed overhead lower.`;})
    ]),
    wealthV2CommonQuestion('data','NUMBERS','Which number do you manage the business around?',`Revenue alone does not tell you whether the ${p.name.toLowerCase()} is getting healthier.`,[
      wealthV2Effect('Profit and cash flow','Protect the economics first.',()=>{wealthState.annualProfit*=1.08;wealthState.risk-=3;return 'You managed around profit and cash flow, which made growth more disciplined.';}),
      wealthV2Effect('Growth and market share','Optimize for getting bigger faster.',()=>{wealthState.businessValue*=1.14;wealthState.risk+=5;return 'You prioritized growth. The company became more valuable on paper, but the margin for error tightened.';}),
      wealthV2Effect('Customer retention','Build around repeat business and loyalty.',()=>{wealthState.businessValue*=1.09;wealthState.reputation+=6;return `You focused on keeping ${p.customer}, which improved the quality of future revenue.`;})
    ]),
    wealthV2CommonQuestion('secondrevenue','EXPANSION','Do you add another revenue stream?',`The core model works. A second revenue stream could diversify income or distract from the thing already working.`,[
      wealthV2Effect('Add a complementary offer','Sell something adjacent to existing customers.',()=>{const c=wealthV2Spend(.04,250,20000);wealthState.cash-=c;wealthState.annualProfit+=Math.max(500,c*.7);wealthState.businessValue+=c*.65;wealthState.risk+=2;wealthState.flags.secondRevenue=true;return `You invested ${wfmt(c)} in an adjacent revenue stream that used the customer base you already built.`;}),
      wealthV2Effect('Stay focused on the core','Improve the strongest engine instead of adding complexity.',()=>{wealthState.annualProfit*=1.08;wealthState.businessValue*=1.06;wealthState.risk-=2;return 'You stayed focused and made the existing model more efficient.';}),
      wealthV2Effect('Diversify outside the company','Move some money into investments instead.',()=>{const c=Math.min(wealthState.cash,Math.max(100,wealthState.cash*.12));wealthState.cash-=c;wealthState.investments+=c;wealthState.risk-=3;return `You moved ${wfmt(c)} outside the company and started building wealth that did not depend on the business.`;})
    ]),
    wealthV2CommonQuestion('debt','FINANCE','Do you use debt to accelerate growth?',`More capital could speed up ${p.growth}, but payments continue even when business slows down.`,[
      wealthV2Effect('Take a conservative loan','Use leverage without betting the company.',()=>{const amt=Math.min(250000,Math.max(1000,wealthNetWorth()*.15));wealthState.cash+=amt;wealthState.debt+=amt;wealthState.risk+=4;wealthState.flags.loan=true;return `You borrowed ${wfmt(amt)} and gained more room to invest in growth.`;}),
      wealthV2Effect('Borrow aggressively','Choose speed and accept more financial pressure.',()=>{const amt=Math.min(1000000,Math.max(2500,wealthNetWorth()*.35));wealthState.cash+=amt;wealthState.debt+=amt;wealthState.risk+=11;wealthState.flags.loan=true;return `You borrowed ${wfmt(amt)} and made leverage a major part of the growth strategy.`;}),
      wealthV2Effect('Stay debt free','Grow only from earned cash.',()=>{wealthState.risk-=5;wealthState.flags.noDebt=true;return 'You refused leverage and kept the downside easier to control.';})
    ]),
    wealthV2CommonQuestion('crisis','CRISIS',`A bad month hits the ${p.name.toLowerCase()}`,`Demand softens while one of the business's known risks—${p.risk}—shows up at the same time.`,[
      wealthV2Effect('Cut costs quickly','Protect survival first.',()=>{wealthState.annualProfit*=.96;wealthState.businessValue*=.98;wealthState.risk-=5;wealthState.flags.crisisResponse='Cut costs';return 'You reacted early, cut unnecessary spending, and protected the company before the problem became a cash emergency.';}),
      wealthV2Effect('Keep investing through it','Bet that the slowdown is temporary.',()=>{wealthState.cash-=wealthV2Spend(.04,100,20000);wealthState.businessValue*=1.05;wealthState.risk+=6;wealthState.flags.crisisResponse='Invested through downturn';return 'You kept investing while conditions were weak. It preserved momentum, but increased the downside if recovery took longer.';}),
      wealthV2Effect('Change the offer','Adapt the business to what customers need now.',()=>{wealthState.annualProfit*=1.05;wealthState.reputation+=4;wealthState.risk+=1;wealthState.flags.crisisResponse='Changed the offer';return 'You adjusted the offer instead of waiting for the market to return to normal.';})
    ]),
    wealthV2CommonQuestion('wealth','WEALTH','What do you do once the business creates real surplus?',`The company can keep absorbing every dollar, or it can start creating wealth outside itself.`,[
      wealthV2Effect('Build an investment portfolio','Move surplus into diversified assets.',()=>{const c=Math.min(wealthState.cash,Math.max(250,wealthState.cash*.2));wealthState.cash-=c;wealthState.investments+=c;wealthState.risk-=3;return `You moved ${wfmt(c)} into investments and began separating personal wealth from business risk.`;}),
      wealthV2Effect('Keep compounding the company','Push for a larger enterprise value.',()=>{wealthState.businessValue*=1.14;wealthState.annualProfit*=1.06;wealthState.risk+=3;wealthState.flags.reinvested=true;return 'You kept capital concentrated in the business because you believed the best return was still inside the company.';}),
      wealthV2Effect('Split the difference','Build both business value and outside assets.',()=>{const c=Math.min(wealthState.cash,Math.max(100,wealthState.cash*.1));wealthState.cash-=c;wealthState.investments+=c;wealthState.businessValue*=1.06;return `You moved ${wfmt(c)} outside the company while still leaving enough capital for growth.`;})
    ]),
    wealthV2CommonQuestion('exitprep','OWNER','Could this company run without you?',`By now, the difference between owning a business and owning a demanding job is becoming obvious.`,[
      wealthV2Effect('Build management and documentation','Make the company less founder dependent.',()=>{const c=wealthV2Spend(.04,500,25000);wealthState.cash-=c;wealthState.businessValue*=1.16;wealthState.risk-=4;wealthState.flags.management=true;return `You spent ${wfmt(c)} making the company easier to operate without you.`;}),
      wealthV2Effect('Stay central to everything','Keep direct control and personal influence.',()=>{wealthState.annualProfit*=1.04;wealthState.risk+=4;wealthState.flags.ownerDependent=true;return 'You stayed at the center of the operation. Performance remained strong, but the company still depended heavily on you.';}),
      wealthV2Effect('Automate aggressively','Use systems and technology to remove manual work.',()=>{const c=wealthV2Spend(.03,250,20000);wealthState.cash-=c;wealthState.businessValue*=1.12;wealthState.annualProfit*=1.04;wealthState.flags.automated=true;return `You spent ${wfmt(c)} automating repetitive work and improved scalability.`;})
    ])
  ];
}

const wealthV2Specific = {
  content:[
    ['format','CONTENT','What kind of content becomes your signature?','The audience needs a reason to recognize you before it can become a durable business.',[['Recurring series','Build recognizable formats that viewers expect.'],['Personality driven videos','Make your point of view the center of the brand.'],['Searchable evergreen content','Create videos and posts that can keep finding viewers for months.']]],
    ['platform','CONTENT','Which platform gets your best work?','Trying to dominate every platform at once can dilute a small creator operation.',[['YouTube','Build around long form, search, sponsors, and a back catalog.'],['Short form','Prioritize fast reach through Shorts, TikTok, and Reels.'],['Live streaming','Build a smaller but more loyal live community.']]],
    ['monetization','CONTENT','Which revenue stream do you build first?','Audience size matters less once the business can convert attention into revenue.',[['Sponsors and ads','Monetize reach with brand deals and platform revenue.'],['Memberships','Build recurring revenue from the most loyal supporters.'],['Digital products','Sell something you own with stronger margins.']]],
    ['sponsor','CONTENT','A large sponsor wants a long contract','The money is meaningful, but the deal would shape what the audience sees for months.',[['Take the deal','Lock in meaningful revenue and accept more sponsor influence.'],['Negotiate fewer integrations','Protect the audience experience while keeping the relationship.'],['Pass','Protect independence and wait for a better fit.']]],
    ['team','CONTENT','Editing is consuming more time than creating','Production has become the bottleneck.',[['Hire an editor','Free your time for ideas, recording, and strategy.'],['Build a production team','Scale output with editing, thumbnails, research, and coordination.'],['Stay solo','Keep the creative process fully under your control.']]],
    ['ip','CONTENT','Do you build something bigger than your personal channel?','A creator can remain the entire product or start creating assets that survive beyond each upload.',[['Launch a media brand','Add shows, channels, talent, or original IP.'],['Build products around the audience','Create owned products and services.'],['Keep a high margin personal brand','Stay small, focused, and profitable.']]]
  ],
  trucking:[
    ['trucktype','TRUCKING','What kind of freight do you target?','The equipment and contracts you pursue will shape margins and operating risk.',[['Dry van','Choose the broadest freight market and simpler equipment.'],['Reefer','Chase stronger rates with more equipment risk.'],['Specialized freight','Target higher rates with stricter requirements.']]],
    ['dispatch','TRUCKING','How do you find loads?','Empty miles and poor load selection can erase profit quickly.',[['Use a dispatcher','Pay for help keeping the truck moving.'],['Build direct shipper relationships','Spend time winning better contracts.'],['Use load boards yourself','Keep control and avoid another fee.']]],
    ['maintenance','TRUCKING','How aggressive is your maintenance plan?','Downtime can cost more than preventive work.',[['Preventive maintenance first','Spend early to reduce catastrophic downtime.'],['Repair as needed','Balance maintenance cost with utilization.'],['Stretch maintenance intervals','Keep cash today and accept more breakdown risk.']]],
    ['driver','TRUCKING','Do you add another driver?','A second truck can grow revenue, but a weak hire can destroy equipment and service quality.',[['Hire an experienced driver','Pay more for lower operational risk.'],['Train a newer driver','Save labor cost and accept more training burden.'],['Stay owner operator','Keep control and grow more slowly.']]],
    ['contract','TRUCKING','A shipper offers a dedicated lane','The contract reduces uncertainty but may cap your upside during strong spot markets.',[['Take the dedicated lane','Choose predictable utilization.'],['Keep chasing spot rates','Accept volatility for more upside.'],['Split capacity','Use contracts for stability and spot freight for upside.']]],
    ['fleet','TRUCKING','Do you build a fleet or keep one strong operation?','More trucks create scale and more ways for costs to multiply.',[['Expand the fleet','Add equipment and drivers aggressively.'],['Grow one truck at a time','Scale only when the last truck is stable.'],['Stay small and profitable','Maximize owner economics instead of fleet size.']]]
  ],
  restaurant:[
    ['concept','RESTAURANT','How focused is the concept?','Restaurants get harder to operate when the menu and identity try to satisfy everyone.',[['Tight signature menu','Build the restaurant around a small number of standout items.'],['Broad menu','Serve more tastes and accept more operational complexity.'],['Seasonal rotating menu','Use change and novelty as part of the brand.']]],
    ['labor','RESTAURANT','Labor costs are climbing','Service quality matters, but payroll can erase already thin margins.',[['Invest in training and retention','Pay for a stronger, more stable team.'],['Reduce staffing during slow periods','Protect margins with tighter scheduling.'],['Automate where possible','Use technology to reduce repetitive labor.']]],
    ['reviews','RESTAURANT','Online reviews are becoming a major traffic source','A few weak service nights are showing up publicly.',[['Fix operations first','Treat reviews as operating data.'],['Launch a reputation campaign','Encourage happy customers to review.'],['Ignore the noise','Trust that good food will win over time.']]],
    ['delivery','RESTAURANT','Delivery apps offer more volume','The extra orders come with fees and less control over the customer experience.',[['Use the major apps','Trade margin for reach.'],['Build direct pickup and delivery','Invest in keeping more of each order.'],['Stay dine in focused','Protect the in person experience.']]],
    ['secondlocation','RESTAURANT','A second location becomes possible','The first store works, but duplicating success is never automatic.',[['Open location two','Use the brand momentum to scale.'],['Wait and strengthen store one','Protect the model before duplicating it.'],['License the concept','Let another operator take more of the execution risk.']]],
    ['chefbrand','RESTAURANT','Do you expand beyond the dining room?','The restaurant name could become products, catering, or media.',[['Launch packaged products','Turn signature items into retail products.'],['Build catering and events','Use the kitchen for higher value booked revenue.'],['Stay focused on restaurant operations','Avoid adding another business inside the business.']]]
  ],
  saas:[
    ['mvp','SAAS','How narrow is the first product?','The faster you prove a painful use case, the less money you waste building features nobody needs.',[['Solve one painful problem','Launch a narrow product and learn quickly.'],['Build a broad platform','Spend more time creating a larger initial product.'],['Sell before building more','Use commitments to decide what gets developed.']]],
    ['churn','SAAS','Users are signing up, but some are leaving','Acquisition cannot save a subscription business with weak retention.',[['Fix onboarding and retention','Make the existing product stickier.'],['Push acquisition harder','Keep top line growth moving.'],['Move upmarket','Sell to fewer customers at higher contract values.']]],
    ['pricingmodel','SAAS','How do you price the software?','Pricing changes who buys, how much support they expect, and how quickly revenue scales.',[['Simple monthly tiers','Make the product easy to understand and buy.'],['Usage based pricing','Let revenue grow with customer activity.'],['Annual contracts','Trade flexibility for stronger retention and cash flow.']]],
    ['funding','SAAS','Investors offer growth capital','Funding could accelerate product and sales, but ownership and expectations would change.',[['Raise the round','Choose faster growth and dilution.'],['Raise a smaller round','Add fuel without completely changing the company.'],['Stay bootstrapped','Protect control and force strong economics.']]],
    ['enterprise','SAAS','A large company wants enterprise features','The contract is large enough to matter, but security and support demands are substantial.',[['Build enterprise capability','Invest in infrastructure and support.'],['Offer a premium tier only','Charge enough to justify the complexity.'],['Stay focused on smaller customers','Protect product simplicity.']]],
    ['roadmap','SAAS','Who controls the roadmap now?','More customers are asking for different things.',[['Follow customer requests','Use demand to drive product development.'],['Protect a strong product vision','Say no more often and keep the product coherent.'],['Use data and experiments','Let usage determine priorities.']]]
  ],
  ecommerce:[
    ['hero','E COMMERCE','How many products do you launch with?','Inventory can become dead cash if you buy breadth before proving demand.',[['One hero product','Concentrate capital and marketing on one winner.'],['Small collection','Test several products without building a huge catalog.'],['Broad catalog','Maximize choice and accept more inventory risk.']]],
    ['supplier','E COMMERCE','Your supplier offers a volume discount','The unit economics improve only if the inventory actually sells.',[['Place the large order','Bet on demand and improve margins.'],['Negotiate a smaller commitment','Keep flexibility while improving cost somewhat.'],['Stay with small batches','Protect cash and accept higher unit cost.']]],
    ['returns','E COMMERCE','Returns are eating margin','Customer experience and product expectations are not lining up perfectly.',[['Improve product pages and quality','Reduce the reasons people return orders.'],['Tighten the return policy','Protect margin and risk customer frustration.'],['Make returns extremely easy','Use service as a brand advantage.']]],
    ['fulfillment','E COMMERCE','Shipping volume is becoming operationally heavy','Packing orders yourself is no longer the best use of owner time.',[['Use a fulfillment partner','Pay for scale and free internal capacity.'],['Build a small warehouse operation','Keep control and add fixed overhead.'],['Keep fulfillment in house longer','Protect margin and grow more slowly.']]],
    ['wholesale','E COMMERCE','A retailer wants to carry the brand','Wholesale can create volume while reducing unit margins and customer ownership.',[['Take the retail deal','Trade margin for distribution.'],['Run a limited test','Try retail without changing the whole business.'],['Stay direct to consumer','Protect margin and customer data.']]],
    ['brand','E COMMERCE','Is this a product or a real brand?','Long term value depends on whether customers remember more than the item they bought.',[['Invest heavily in brand identity','Create stronger loyalty and differentiation.'],['Compete on product and price','Keep the value proposition practical.'],['Build a community around the category','Make customers part of the marketing engine.']]]
  ],
  cleaning:[
    ['market','CLEANING','Which customers do you build around?','Residential and commercial cleaning behave like different businesses.',[['Recurring residential','Build route density and repeat bookings.'],['Commercial contracts','Pursue larger recurring accounts.'],['Mix both','Diversify revenue and accept more scheduling complexity.']]],
    ['schedule','CLEANING','Scheduling is getting messy','Cancellations, travel, supplies, and crew availability are colliding.',[['Use scheduling software','Automate routing and reminders.'],['Hire a coordinator','Put one person in charge of the schedule.'],['Keep managing it personally','Protect overhead and stay close to customers.']]],
    ['crew','CLEANING','Service quality varies by crew','Customers notice when one team is excellent and another is average.',[['Create crew leaders and inspections','Build quality control into operations.'],['Use performance bonuses','Pay for strong reviews and retention.'],['Replace weak workers faster','Protect standards and accept turnover.']]],
    ['supplies','CLEANING','Do you standardize equipment and supplies?','Consistency can reduce training time and purchasing waste.',[['Standardize everything','Use approved tools and chemicals across crews.'],['Let crews choose','Give teams flexibility around how they work.'],['Create premium green packages','Differentiate with specialty products and pricing.']]],
    ['propertymanager','CLEANING','A property manager offers a large contract','The volume is attractive, but they want discounted pricing.',[['Take the contract','Trade margin for dependable volume.'],['Negotiate harder','Protect margin even if volume falls.'],['Pass','Keep a more diversified customer base.']]],
    ['territory','CLEANING','How far do you expand geographically?','Travel time can quietly destroy labor efficiency.',[['Own one dense territory','Maximize route efficiency.'],['Add a second territory','Grow carefully into another area.'],['Expand across the metro quickly','Prioritize market share and accept complexity.']]]
  ],
  foodtruck:[
    ['menu','FOOD TRUCK','How focused is the menu?','Every extra item creates prep work, ingredients, waste, and slower service.',[['Tight signature menu','Build around a few items you can execute extremely well.'],['Broad menu','Serve more tastes and accept more complexity.'],['Rotate specials','Use novelty to create repeat visits.']]],
    ['location','FOOD TRUCK','Where do you spend most service days?','A great menu still needs dependable foot traffic.',[['Build recurring weekday stops','Create predictable local demand.'],['Chase events and festivals','Pursue bigger revenue days with more variability.'],['Prioritize private catering','Book revenue before the truck leaves the lot.']]],
    ['prep','FOOD TRUCK','Prep capacity is limiting sales','The truck can sell faster than the current kitchen setup can prepare.',[['Rent commissary kitchen space','Add preparation capacity without another truck.'],['Simplify the menu','Remove the slowest items.'],['Hire prep staff','Add labor to protect the menu.']]],
    ['weather','FOOD TRUCK','Bad weather wipes out several service days','The business needs revenue that does not depend entirely on street traffic.',[['Push catering hard','Use booked events to stabilize revenue.'],['Add delivery and pickup','Create another way to reach customers.'],['Accept seasonality and cut costs','Stay lean through weaker periods.']]],
    ['secondtruck','FOOD TRUCK','Demand can support a second truck','A second unit can double reach and double operational headaches.',[['Buy the second truck','Scale locations and event coverage.'],['Use a trailer or pop up first','Test expansion with less capital.'],['Keep one truck excellent','Maximize the first unit before duplicating it.']]],
    ['brick','FOOD TRUCK','Customers ask for a permanent location','The truck has become a recognizable brand.',[['Open a small restaurant','Turn the concept into a permanent location.'],['Build multiple trucks','Stay mobile and scale the proven format.'],['Remain one premium truck','Keep overhead and complexity controlled.']]]
  ],
  realestate:[
    ['strategy','REAL ESTATE','Which real estate strategy do you start with?','The risk profile changes depending on whether you prioritize cash flow, appreciation, or active projects.',[['Long term rentals','Build recurring cash flow and hold assets.'],['Fix and flip','Pursue faster gains with project risk.'],['Small multifamily','Combine scale, leverage, and rental income.']]],
    ['finance','REAL ESTATE','How much leverage do you use?','Debt can accelerate acquisitions and magnify bad deals.',[['Low leverage','Grow more slowly with stronger safety margins.'],['Moderate leverage','Balance growth and debt service.'],['Aggressive leverage','Acquire faster and accept more downside.']]],
    ['tenant','REAL ESTATE','A tenant stops paying','Cash flow and legal process collide.',[['Work out a payment plan','Preserve occupancy and try to recover revenue.'],['Follow the formal process quickly','Protect the business and accept turnover.'],['Offer cash for keys','Pay for a faster clean exit.']]],
    ['repair','REAL ESTATE','A property needs a major repair','Ignoring it risks a larger problem; fixing it ties up cash.',[['Repair it properly now','Protect the asset and tenant experience.'],['Do the minimum safe repair','Preserve liquidity.'],['Renovate beyond the repair','Use the problem as an opportunity to reposition the unit.']]],
    ['management','REAL ESTATE','Do you manage properties yourself?','Management can save fees while turning the portfolio into a demanding job.',[['Hire property management','Trade margin for owner freedom.'],['Self manage','Keep control and more cash flow.'],['Build an internal management team','Create a platform for a larger portfolio.']]],
    ['market','REAL ESTATE','Prices jump and deals look expensive','The easiest time to overpay is when everyone expects values to keep rising.',[['Keep buying selectively','Stay active but require stronger numbers.'],['Pause acquisitions','Let cash build while prices are stretched.'],['Sell weaker properties','Harvest gains and improve portfolio quality.']]]
  ],
  service:[
    ['offer','SERVICE','What exactly do you sell?','The clearer the offer, the easier it is for potential clients to understand why they should hire you.',[['Specialize in one high value service','Become known for one clear outcome.'],['Offer several related services','Capture more opportunities from each client.'],['Stay fully custom','Adapt every project to the client.']]],
    ['portfolio','SERVICE','How do you prove you can deliver?','New clients need evidence before reputation is established.',[['Build strong case studies','Turn results into proof.'],['Discount early projects','Use price to win initial customers faster.'],['Partner with established businesses','Borrow credibility through relationships.']]],
    ['scope','SERVICE','A client keeps adding work without adding budget','Scope creep is turning a profitable project into a time sink.',[['Enforce the contract','Charge for added work.'],['Absorb it to protect the relationship','Take the margin hit this time.'],['Convert the client to a larger package','Use the added needs to expand the deal.']]],
    ['retainer','SERVICE','Can you turn project work into recurring revenue?','Starting from zero every month makes forecasting difficult.',[['Offer monthly retainers','Create predictable recurring work.'],['Sell maintenance packages','Add recurring support around completed projects.'],['Stay project based','Protect flexibility and premium project pricing.']]],
    ['referral','SERVICE','A partner can send you steady leads','They want a percentage of every deal they refer.',[['Accept the referral fee','Trade margin for a dependable pipeline.'],['Negotiate a smaller fee','Protect economics while keeping the partnership.'],['Build your own pipeline','Keep full margin and own customer acquisition.']]],
    ['productize','SERVICE','Do you productize part of the service?','Repeatable packages can scale better than fully custom work.',[['Create fixed packages','Standardize scope and delivery.'],['Build a digital product','Turn expertise into something sellable without your time.'],['Stay high touch and custom','Keep the business premium and personal.']]]
  ],
  agency:[
    ['niche','AGENCY','Which clients does the agency pursue?','Positioning affects sales, referrals, pricing, and how quickly expertise compounds.',[['Pick one industry','Specialize deeply.'],['Target larger retainers','Pursue fewer, bigger accounts.'],['Stay broad','Take good work across several industries.']]],
    ['retainer','AGENCY','How do you structure client revenue?','Projects create spikes; retainers create predictability.',[['Push monthly retainers','Build recurring client revenue.'],['Keep project pricing','Protect flexibility and premium scopes.'],['Use hybrid contracts','Combine base retainers with project work.']]],
    ['talent','AGENCY','How do you add delivery capacity?','The agency can only sell work it can deliver well.',[['Build a contractor bench','Keep capacity flexible.'],['Hire full time specialists','Build a more durable internal team.'],['Cap the client list','Stay boutique and protect quality.']]],
    ['bigclient','AGENCY','One client could become 40% of revenue','The account would transform the P&L and increase concentration risk.',[['Take the account','Use the revenue to grow faster.'],['Take it with contract protections','Reduce the downside of dependence.'],['Decline and diversify','Protect the client mix.']]],
    ['qa','AGENCY','Quality gets harder to control as the team grows','The founder can no longer personally review every deliverable.',[['Build formal QA','Use reviews, checklists, and standards.'],['Create department leads','Move quality ownership into management.'],['Stay personally involved','Protect quality but remain the bottleneck.']]],
    ['services','AGENCY','Clients ask for a new service line','The demand is real, but every new service adds staffing and delivery complexity.',[['Launch the new service','Expand wallet share from existing clients.'],['Partner with another specialist','Capture demand without building internally.'],['Stay focused','Protect the services you already do well.']]]
  ]
};

function wealthV2MakeSpecific(type,row,index){
  const [slug,cat,title,text,choices]=row;
  return {id:`v2_${type}_${slug}_${index}`,cat,title,text,cond:()=>wealthState.flags.businessType===type,opts:()=>choices.map(([t,d],i)=>wealthV2Effect(t,d,()=>{
    const profit=[1.12,1.06,1.03][i]||1.03;
    const value=[1.1,1.07,1.04][i]||1.04;
    const rep=[4,2,1][i]||1;
    const risk=[2,0,-1][i]||0;
    wealthState.annualProfit*=profit;wealthState.businessValue*=value;wealthState.reputation+=rep;wealthState.risk+=risk;
    wealthState.flags[`choice_${slug}`]=t;
    return `${t} became part of your operating model. It changed both the economics and the direction of the company.`;
  }))};
}

function wealthV2Pool(){
  const type=wealthState.flags.businessType;
  const contextual=wealthV2ContextQuestions();
  const specific=(wealthV2Specific[type]||[]).map((r,i)=>wealthV2MakeSpecific(type,r,i));
  const arcs=wealthQuestions.filter(q=>q.id&&q.id.startsWith(`arc_${type}_`));
  return [...contextual,...specific,...arcs];
}

eligibleWealthQuestions=function(){ return wealthV2Pool().filter(q=>!wealthState.used.has(q.id)&&q.cond()); };

chooseWealthQuestion=function(){
  if(wealthState.decision>=wealthState.maxDecisions||wealthState.year>5){finishWealthGame();return;}
  const eligible=eligibleWealthQuestions();
  if(!eligible.length){finishWealthGame();return;}
  const arcId=`arc_${wealthState.flags.businessType}_${wealthState.year}`;
  const arc=eligible.find(q=>q.id===arcId);
  const into=wealthState.decision%5;
  let item;
  if(arc&&into>=1)item=arc;
  else {
    const businessSpecific=eligible.filter(q=>q.id.startsWith(`v2_${wealthState.flags.businessType}_`));
    const nonArc=eligible.filter(q=>!q.id.startsWith('arc_'));
    item=(businessSpecific.length&&Math.random()<.55)?wpick(businessSpecific):wpick(nonArc.length?nonArc:eligible);
  }
  wealthState.used.add(item.id);renderWealthQuestion(item);
};

renderWealthQuestion=function(item){
  W$('wealth-category').textContent=item.cat;W$('wealth-progress').textContent=`Decision ${wealthState.decision+1} of ${wealthState.maxDecisions}`;W$('wealth-question-title').textContent=item.title;W$('wealth-question-text').textContent=item.text;W$('wealth-year').textContent=wealthState.year;
  W$('wealth-chapter').textContent=['Prove the model.','Make the business repeatable.','Scale without losing control.','Survive complexity and competition.','Turn the company into lasting wealth.'][Math.min(wealthState.year-1,4)];
  const wrap=W$('wealth-choices');wrap.innerHTML='';
  item.opts().forEach((o,i)=>{const b=document.createElement('button');b.className='choice';b.innerHTML=`<strong>${String.fromCharCode(65+i)}. ${o.t}</strong><span>${o.d}</span>`;b.onclick=()=>{const before=wealthNetWorth();const result=o.fx();wealthState.risk=wclamp(wealthState.risk,0,100);wealthState.reputation=wclamp(wealthState.reputation,0,100);wealthState.cash=Math.max(0,wealthState.cash);wlog(o.t,result);wealthState.history.push({year:wealthState.year,question:item.title,option:o.t,result,category:item.cat,before,after:wealthNetWorth()});wealthState.decision++;if(wealthState.decision%5===0){endWealthYear();wealthState.year++;}setTimeout(chooseWealthQuestion,100);};wrap.appendChild(b);});
  renderWealthStats();
};

function wealthV2Start(){
  const amount=Number((W$('wealth-starting-amount').value||'').replace(/,/g,''));
  const type=W$('wealth-business-type')?.value;
  if(!Number.isFinite(amount)||amount<100||amount>100000000){alert('Enter an amount between $100 and $100 million.');return;}
  if(!type||!wealthV2Profiles[type]){alert('Choose a business to build.');return;}
  const p=wealthV2Profiles[type];if(amount<p.min){alert(`${p.name} needs at least ${wfmt(p.min)} to start in this simulation.`);return;}
  Object.assign(wealthState,{start:amount,cash:amount,investments:0,businessValue:0,debt:0,annualProfit:0,risk:25,reputation:25,year:1,decision:0,maxDecisions:25,style:W$('wealth-style').value,difficulty:W$('wealth-difficulty').value,flags:{},used:new Set(),usedEvents:new Set(),log:[],history:[]});
  const setupResult=startBusiness(type);
  wealthState.history.push({year:1,question:'Business selected',option:p.name,result:setupResult,category:'SETUP',before:amount,after:wealthNetWorth()});
  wlog(p.name,setupResult);showOnly('wealth-game-screen');chooseWealthQuestion();
}
W$('wealth-start-btn').onclick=wealthV2Start;

function wealthV2SentenceFromChoice(h,index){
  const openers=['You decided to','You chose to','The next turning point came when you decided to','Instead of standing still, you chose to','When the business demanded a decision, you chose to'];
  return `${openers[index%openers.length]} ${h.option.toLowerCase()}. ${h.result}`;
}
function wealthV2YearNarrative(year){
  const entries=wealthState.history.filter(h=>h.year===year&&h.question!=='Business selected');
  const choices=entries.filter(h=>h.question!=='Yearly event');
  const event=entries.find(h=>h.question==='Yearly event');
  const arc=choices.find(h=>String(h.question).startsWith(`Year ${year}:`));
  const regular=choices.filter(h=>h!==arc);
  const phase=[
    'The first year was about proving that the idea could become a real business.',
    'By the second year, survival was no longer the only question. The challenge was making the operation repeatable.',
    'Year three was where the company started behaving less like a hustle and more like an organization.',
    'In year four, growth brought complexity. The decisions were less about starting and more about protecting what had been built.',
    'The fifth year forced a final question: was this just a business that made money, or an asset that could create lasting wealth?'
  ][year-1];
  let out=phase+' ';
  if(regular.length) out+=regular.slice(0,3).map((h,i)=>wealthV2SentenceFromChoice(h,i)).join(' ')+' ';
  if(arc) out+=`The year's defining decision was ${arc.option.toLowerCase()}. ${arc.result} `;
  if(event) out+=`Then ${event.option.toLowerCase()} hit the business. ${event.result}`;
  return out.trim();
}

finishWealthGame=function(){
  showOnly('wealth-end-screen');
  const nw=wealthNetWorth(),gain=nw-wealthState.start,roi=wealthState.start?gain/wealthState.start*100:0;
  let title='STILL STANDING.';if(nw<=0||roi<-80)title='WIPED OUT.';else if(roi<0)title='THE BUSINESS LOST MONEY.';else if(roi<25)title='SMALL WIN.';else if(roi<100)title='PROFITABLE.';else if(roi<500)title='SERIOUS GROWTH.';else title='WEALTH BUILDER.';
  W$('wealth-ending-title').textContent=title;
  const p=wealthV2Profile();const setup=wealthState.history.find(h=>h.question==='Business selected');
  const intro=`You began with ${wfmt(wealthState.start)} and used it to start ${p.name.toLowerCase()}. ${setup?setup.result:''} From that point forward, the business became a product of the choices you made: how you found ${p.customer}, what you protected, what you risked, and how you reacted when growth made the company harder to control.`;
  const years=[1,2,3,4,5].map(y=>`<div class="story-year"><span class="story-year-label">YEAR ${y}</span><p>${wealthV2YearNarrative(y)}</p></div>`).join('');
  let fate;
  if(roi>=500)fate=`What started as ${wfmt(wealthState.start)} became a serious wealth engine. The company was no longer simply paying you; it had become an asset capable of changing your financial life.`;
  else if(roi>=100)fate='By the end, the business had clearly created more than income. It had multiplied the capital you started with and given you a much larger financial base.';
  else if(roi>=0)fate='The company survived and created value, but the result came from discipline more than explosive growth. You finished ahead, with lessons about which parts of the model were actually worth scaling.';
  else fate='The business never turned the original capital into more wealth. Some decisions created momentum, but the combination of operating costs, risk, and setbacks outweighed the wins.';
  const close=`Five years later, the business is valued around ${wfmt(wealthState.businessValue)}. You hold ${wfmt(wealthState.cash)} in cash and ${wfmt(wealthState.investments)} outside the company${wealthState.debt>0?`, while still carrying ${wfmt(wealthState.debt)} in debt`:''}. Your estimated net worth is ${wfmt(nw)}, a ${roi>=0?'gain':'loss'} of ${wfmt(Math.abs(gain))} from where you began. ${fate}`;
  W$('wealth-ending-story').innerHTML=`<p class="story-intro">${intro}</p>${years}<p class="story-close">${close}</p>`;
  W$('wealth-end-start').textContent=wfmt(wealthState.start);W$('wealth-end-networth').textContent=wfmt(nw);W$('wealth-end-gain').textContent=(gain>=0?'+':'-')+wfmt(Math.abs(gain));W$('wealth-end-roi').textContent=`${roi>=0?'+':''}${roi.toFixed(1)}%`;W$('wealth-end-profit').textContent=wfmt(wealthState.annualProfit);W$('wealth-end-debt').textContent=wfmt(wealthState.debt);
  const pivotal=wealthState.history.filter(h=>h.question!=='Business selected'&&h.question!=='Yearly event').sort((a,b)=>Math.abs((b.after||0)-(b.before||0))-Math.abs((a.after||0)-(a.before||0))).slice(0,5);
  const events=wealthState.history.filter(h=>h.question==='Yearly event').slice(0,3);
  W$('wealth-ending-impacts').innerHTML=[...pivotal,...events].map(h=>`<div class="impact-card"><span>YEAR ${h.year}</span><strong>${h.option}</strong><p>${h.result}</p></div>`).join('');
};
