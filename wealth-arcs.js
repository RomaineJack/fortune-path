// Five-year business arcs layered on top of Build Wealth.
// Every arc milestone has a unique ID per business and year, so it can only appear once.

const wealthArcBlueprints = {
  service: [
    {title:'Year 1: What do you actually sell?',text:'A service business gets stronger when the offer is specific enough that customers immediately understand the value.',opts:[['Specialize in one high value service','Narrow the offer and become known for one thing.',1.14,1.08,4,-2],['Offer several services','Capture more types of customers, but make delivery more complicated.',1.09,1.12,2,3],['Stay flexible and custom','Take whatever profitable work appears while you learn the market.',1.05,1.04,1,1]]},
    {title:'Year 2: Demand is outrunning your time',text:'The business is no longer limited by leads. It is limited by how much work you can personally complete.',opts:[['Standardize packages','Turn custom work into repeatable packages and improve margins.',1.16,1.12,4,-2],['Hire contractors','Add capacity without committing to full payroll.',1.13,1.16,3,2],['Raise prices and stay small','Serve fewer customers at better margins.',1.18,1.08,5,-1]]},
    {title:'Year 3: A large client wants most of your capacity',text:'One contract could transform revenue, but depending on one client creates concentration risk.',opts:[['Take the contract','Accept the growth and manage the dependence.',1.22,1.2,4,7],['Negotiate a smaller scope','Take meaningful revenue without letting one client control the company.',1.14,1.13,5,0],['Pass and diversify','Keep building a wider customer base.',1.08,1.09,3,-3]]},
    {title:'Year 4: The company needs an operating system',text:'Sales, projects, billing, and customer communication are becoming too complicated for memory and spreadsheets alone.',opts:[['Invest in automation','Build systems that reduce owner involvement and mistakes.',1.12,1.18,4,-4],['Hire an operations manager','Add a management layer so you can focus on growth.',1.1,1.2,3,-3],['Keep doing it yourself','Protect cash, but accept that you remain the bottleneck.',1.03,1.02,0,4]]},
    {title:'Year 5: What does the service company become?',text:'You can keep a profitable owner led company, build a larger agency style operation, or prepare it for sale.',opts:[['Build a larger firm','Hire leadership and expand into multiple teams.',1.16,1.28,5,5],['Optimize for owner freedom','Reduce complexity and maximize cash flow without chasing size.',1.2,1.12,3,-4],['Prepare for a sale','Clean up contracts, reporting, and owner dependence to increase exit value.',1.08,1.35,4,-2]]}
  ],
  content: [
    {title:'Year 1: What makes people come back?',text:'Early audience growth is noisy. The real question is whether viewers remember why they followed you in the first place.',opts:[['Build a recognizable series','Create recurring formats viewers can identify immediately.',1.1,1.18,7,-1],['Chase trends aggressively','Prioritize reach and fast feedback while the audience is small.',1.13,1.14,4,5],['Build around personality','Make your point of view and presence the main reason people return.',1.08,1.16,8,2]]},
    {title:'Year 2: Your audience is becoming a business',text:'Views are growing enough that advertisers and paying supporters are starting to matter.',opts:[['Stack multiple revenue streams','Combine sponsors, ads, affiliates, and memberships.',1.24,1.2,5,4],['Protect trust and take fewer deals','Monetize carefully and keep the audience relationship strong.',1.15,1.14,8,-2],['Launch your own product','Use the audience to sell something you control.',1.22,1.24,4,6]]},
    {title:'Year 3: You cannot produce everything alone anymore',text:'Research, editing, thumbnails, sales, community, and publishing have turned the channel into an operation.',opts:[['Build a production team','Hire editors, producers, and support so output can scale.',1.18,1.3,5,4],['Stay creator led with freelancers','Add flexible help while keeping the brand centered on you.',1.14,1.18,6,-1],['Slow down and stay solo','Protect creative control and reduce overhead.',1.06,1.05,4,-4]]},
    {title:'Year 4: Your platform is bigger than one channel',text:'The audience now gives you enough leverage to expand beyond whichever platform originally made you successful.',opts:[['Launch a media brand','Build multiple shows, creators, or channels under one company.',1.2,1.34,7,7],['Build owned distribution','Prioritize email, community, website, and direct customer relationships.',1.16,1.22,8,-3],['Double down on the main platform','Concentrate resources where the audience is already strongest.',1.19,1.18,4,4]]},
    {title:'Year 5: What do you want the creator business to become?',text:'You can remain the face of everything, turn it into a broader media company, or position the brand for an acquisition.',opts:[['Become a full media company','Add talent, IP, production, products, and multiple revenue lines.',1.18,1.4,8,6],['Build a high profit personal brand','Keep the company compact and maximize income around your name.',1.28,1.18,7,0],['Prepare for acquisition','Reduce dependence on your personal output and make revenue easier for a buyer to value.',1.12,1.42,6,-2]]}
  ],
  agency: [
    {title:'Year 1: What kind of clients do you pursue?',text:'An agency can serve everyone, but positioning determines how quickly referrals and expertise compound.',opts:[['Pick one industry','Specialize deeply and build a clearer reputation.',1.14,1.15,6,-1],['Target larger retainers','Pursue fewer clients with larger monthly contracts.',1.18,1.12,4,3],['Stay broad','Take good work across several industries while learning what sells.',1.08,1.07,2,0]]},
    {title:'Year 2: Clients want more than you can personally deliver',text:'Your ability to sell has started outrunning your ability to execute every project yourself.',opts:[['Build a contractor bench','Add flexible capacity around proven demand.',1.15,1.14,3,1],['Hire full time specialists','Create a stronger delivery team and more fixed cost.',1.17,1.2,4,5],['Cap the client list','Keep the agency small and premium.',1.16,1.08,5,-3]]},
    {title:'Year 3: A major client offers a huge retainer',text:'The account would materially increase revenue, but it could become too large a percentage of the company.',opts:[['Take it and expand','Use the contract to finance a bigger agency.',1.24,1.22,4,7],['Take it with protections','Negotiate term commitments and keep prospecting elsewhere.',1.18,1.16,6,1],['Decline concentration risk','Keep a more balanced book of business.',1.1,1.1,4,-4]]},
    {title:'Year 4: Delivery quality is harder to control',text:'More people and more clients mean the founder can no longer personally review every detail.',opts:[['Install department leads','Create accountability and management under you.',1.12,1.22,5,-3],['Build stronger QA systems','Standardize reviews, checklists, and client reporting.',1.1,1.18,6,-4],['Stay involved in everything','Protect quality personally, but remain the bottleneck.',1.06,1.04,2,4]]},
    {title:'Year 5: What is the agency worth without you?',text:'The strongest agencies can generate revenue, retain clients, and deliver work even when the founder is not in every meeting.',opts:[['Build for acquisition','Lock in retainers, leadership, and clean financial reporting.',1.09,1.38,5,-2],['Build a national firm','Keep expanding teams, services, and markets.',1.16,1.3,6,6],['Stay boutique and profitable','Prioritize margin and owner freedom over headcount.',1.22,1.12,5,-4]]}
  ],
  ecommerce: [
    {title:'Year 1: Which product strategy do you use?',text:'Inventory businesses can die from buying too much before knowing what customers actually want.',opts:[['Start with one hero product','Concentrate inventory and marketing on one clear winner.',1.13,1.16,4,1],['Launch a broader catalog','Test more products but tie up more cash.',1.12,1.18,2,6],['Use preorders and small batches','Protect cash while gathering real demand data.',1.08,1.09,4,-3]]},
    {title:'Year 2: Paid ads are getting expensive',text:'Growth is working, but acquiring each customer now costs more than it did at launch.',opts:[['Improve repeat purchases','Invest in email, loyalty, bundles, and customer retention.',1.17,1.14,6,-2],['Scale ads anyway','Push for market share before competitors do.',1.22,1.2,3,8],['Build organic content','Trade speed for lower acquisition costs and stronger brand equity.',1.13,1.17,6,-1]]},
    {title:'Year 3: A retailer wants to carry your products',text:'Wholesale could create a large new channel, but margins and control would change.',opts:[['Take the retail deal','Accept lower unit margins for much larger distribution.',1.2,1.22,5,4],['Negotiate a limited launch','Test retail without committing the whole company.',1.15,1.15,5,0],['Stay direct to consumer','Protect margin and customer data.',1.12,1.1,4,-2]]},
    {title:'Year 4: Inventory complexity is becoming expensive',text:'More products, suppliers, warehouses, and forecasts are creating operational risk.',opts:[['Hire an operations leader','Professionalize inventory and supplier management.',1.11,1.2,4,-3],['Reduce the catalog','Cut weak SKUs and concentrate capital on winners.',1.16,1.12,5,-4],['Keep expanding selection','Bet that breadth will increase customer lifetime value.',1.18,1.22,2,7]]},
    {title:'Year 5: How does the brand create lasting value?',text:'You can keep scaling sales, expand into new channels, or position the company as an acquisition target.',opts:[['Expand into retail and wholesale','Build a larger omnichannel consumer brand.',1.17,1.3,5,5],['Maximize direct margins','Stay focused on profitable direct customer relationships.',1.23,1.15,5,-2],['Prepare the brand for sale','Clean up inventory, reporting, and customer metrics for buyers.',1.1,1.38,4,-2]]}
  ],
  cleaning: [
    {title:'Year 1: Which customers do you target?',text:'Residential and commercial cleaning behave like very different businesses.',opts:[['Residential recurring clients','Build route density and frequent repeat service.',1.12,1.1,4,-1],['Commercial contracts','Pursue larger recurring contracts with longer sales cycles.',1.16,1.14,4,2],['Mix both','Diversify revenue but manage more scheduling complexity.',1.13,1.13,3,3]]},
    {title:'Year 2: Scheduling is becoming chaotic',text:'More jobs mean more travel, supply coordination, cancellations, and employee scheduling.',opts:[['Invest in scheduling software','Automate routing, reminders, and recurring bookings.',1.12,1.16,4,-4],['Hire a coordinator','Add a person to own scheduling and customer communication.',1.1,1.17,5,-3],['Keep managing it yourself','Save overhead but remain the operational bottleneck.',1.05,1.03,1,4]]},
    {title:'Year 3: A property manager offers a large contract',text:'The contract could fill crews consistently, but they want discounted pricing.',opts:[['Take the contract','Trade margin for dependable volume.',1.2,1.19,4,4],['Negotiate better pricing','Protect margin even if some volume is lost.',1.15,1.12,5,0],['Pass','Keep a diversified customer base.',1.09,1.08,3,-3]]},
    {title:'Year 4: Quality varies between crews',text:'Customers are noticing that service depends too much on which team shows up.',opts:[['Create crew leaders and inspections','Build accountability and repeatable quality control.',1.11,1.19,6,-4],['Pay performance bonuses','Use incentives to improve retention and service ratings.',1.12,1.15,5,-2],['Replace weak workers aggressively','Protect standards but increase turnover risk.',1.1,1.12,2,3]]},
    {title:'Year 5: What kind of cleaning company do you own?',text:'The business can become a local cash machine, a multi city operation, or a franchisable system.',opts:[['Expand to another market','Replicate the operating model in a second city.',1.16,1.28,5,6],['Optimize the current market','Maximize route density, margins, and owner freedom.',1.22,1.14,5,-3],['Build a franchise model','Standardize everything so other operators can pay to use the system.',1.12,1.36,5,5]]}
  ],
  saas: [
    {title:'Year 1: What does the MVP focus on?',text:'Software startups lose time when they try to solve every customer problem before proving one core use case.',opts:[['Solve one painful problem','Launch a narrow MVP and get real users quickly.',1.12,1.18,4,-1],['Build a broader platform','Spend longer building more capability before launch.',1.08,1.22,2,7],['Sell before building more','Use early customer commitments to decide what to develop.',1.1,1.14,5,-2]]},
    {title:'Year 2: Customers are signing up, but some are leaving',text:'Growth means less if churn quietly replaces every new customer you acquire.',opts:[['Focus on retention','Improve onboarding, support, and the product areas users struggle with.',1.15,1.17,6,-3],['Push acquisition harder','Keep top line growth moving and address churn later.',1.2,1.2,3,7],['Move upmarket','Sell to fewer larger customers with higher contract values.',1.18,1.16,4,3]]},
    {title:'Year 3: Investors offer growth capital',text:'Outside funding could accelerate development and sales, but ownership and expectations would change.',opts:[['Raise the round','Take capital and pursue much faster growth.',1.22,1.32,6,9],['Raise a smaller round','Add fuel without completely changing the company.',1.16,1.22,6,3],['Stay bootstrapped','Keep control and force the company to live within its economics.',1.12,1.12,4,-4]]},
    {title:'Year 4: Enterprise customers demand reliability',text:'Bigger contracts bring security reviews, support expectations, uptime requirements, and longer sales cycles.',opts:[['Invest in infrastructure and support','Professionalize the product for enterprise buyers.',1.14,1.24,6,-2],['Stay focused on smaller customers','Keep the product simpler and sales cycles shorter.',1.13,1.12,4,-3],['Build a premium enterprise tier','Create higher pricing around stronger service and controls.',1.2,1.22,5,3]]},
    {title:'Year 5: What does the software company become?',text:'You now have enough traction to choose between profitability, aggressive scale, or an exit.',opts:[['Push toward category leadership','Reinvest heavily in product and sales.',1.18,1.35,6,7],['Optimize for profitability','Reduce burn and maximize durable recurring cash flow.',1.24,1.18,5,-4],['Prepare for acquisition','Make metrics, contracts, technology, and owner dependence buyer friendly.',1.12,1.4,5,-2]]}
  ],
  foodtruck: [
    {title:'Year 1: How focused is the menu?',text:'Every extra menu item creates ingredients, prep work, waste, and slower service.',opts:[['Keep a tight signature menu','Build the brand around a few items you can execute consistently.',1.14,1.14,5,-2],['Offer a broad menu','Serve more tastes but increase waste and operational complexity.',1.12,1.13,2,5],['Rotate specials frequently','Use novelty to keep customers returning.',1.13,1.12,4,2]]},
    {title:'Year 2: Events are becoming your best revenue days',text:'Festivals, corporate events, and private bookings can produce more volume than normal street service.',opts:[['Prioritize catering and events','Build scheduling and menus around higher value bookings.',1.18,1.16,5,2],['Stay focused on regular locations','Build predictable local demand and routine.',1.12,1.1,4,-2],['Mix both','Use events for spikes while protecting regular customer habits.',1.15,1.13,4,1]]},
    {title:'Year 3: The truck is reaching capacity',text:'There are only so many orders one kitchen on wheels can produce during a rush.',opts:[['Add a second truck','Duplicate the concept and hire another crew.',1.2,1.24,4,7],['Open a commissary kitchen','Increase prep capacity and add catering potential.',1.17,1.2,5,4],['Raise prices and stay one truck','Increase margin rather than footprint.',1.18,1.1,4,-1]]},
    {title:'Year 4: A permanent location becomes available',text:'A storefront could expand revenue, but rent and payroll would make the business much less flexible.',opts:[['Open the location','Turn the food truck brand into a restaurant concept.',1.17,1.28,5,8],['Use it as a prep and catering hub','Add capacity without becoming a full restaurant.',1.15,1.19,5,2],['Stay mobile','Protect the flexible cost structure that made the business work.',1.12,1.09,4,-3]]},
    {title:'Year 5: What is the food brand now?',text:'You can remain a profitable mobile operator, build several units, or package the concept for expansion.',opts:[['Build a fleet','Add trucks and crews across the market.',1.17,1.3,5,6],['Maximize one strong operation','Focus on margin, events, and owner income.',1.22,1.12,5,-3],['Create a franchiseable concept','Standardize menu, branding, training, and operations.',1.12,1.34,5,4]]}
  ],
  trucking: [
    {title:'Year 1: How do you get your first loads?',text:'Freight businesses live or die on utilization, rates, fuel, maintenance, and whether trucks spend time moving or sitting.',opts:[['Use load boards aggressively','Keep equipment moving while building relationships.',1.12,1.1,2,4],['Pursue dedicated contracts','Accept slower sales in exchange for more predictable freight.',1.15,1.14,4,-1],['Work through brokers selectively','Balance flexibility with better paying lanes.',1.13,1.12,3,1]]},
    {title:'Year 2: Your first truck is consistently booked',text:'Demand suggests you could add capacity, but one bad repair on multiple financed trucks can become painful quickly.',opts:[['Finance another truck','Expand capacity with leverage.',1.18,1.2,3,8],['Save and buy later','Delay growth until the balance sheet is stronger.',1.1,1.1,4,-4],['Lease additional capacity','Grow more flexibly but accept higher operating cost.',1.15,1.14,3,3]]},
    {title:'Year 3: Driver management becomes the hard part',text:'More trucks mean recruiting, safety, retention, scheduling, and insurance matter as much as finding freight.',opts:[['Pay for strong drivers','Use better compensation and culture to reduce turnover.',1.14,1.16,5,-2],['Build a contractor model','Expand with owner operators and lower fixed asset needs.',1.16,1.14,3,4],['Stay small and owner operated','Protect control and reduce people risk.',1.1,1.07,4,-3]]},
    {title:'Year 4: A shipper offers a dedicated lane contract',text:'The contract creates predictable revenue but reduces flexibility to chase higher spot rates.',opts:[['Lock in the contract','Trade upside for predictable utilization and cash flow.',1.17,1.18,5,-3],['Keep playing the spot market','Stay flexible and accept more rate volatility.',1.19,1.15,2,7],['Split the fleet','Put some capacity under contract and keep the rest flexible.',1.16,1.16,4,1]]},
    {title:'Year 5: What kind of carrier do you become?',text:'You can build a fleet, specialize in a profitable niche, or optimize a smaller operation for owner income.',opts:[['Build a regional fleet','Add equipment, dispatch, maintenance, and management.',1.16,1.28,5,6],['Specialize in premium freight','Use expertise and equipment to earn better rates.',1.2,1.18,6,1],['Stay lean and profitable','Keep a smaller fleet with tighter control and lower debt.',1.22,1.12,5,-4]]}
  ],
  restaurant: [
    {title:'Year 1: What does the restaurant become known for?',text:'Restaurants rarely win by being average at everything. A clear reason to visit matters.',opts:[['Build around signature dishes','Make a small number of items the identity of the restaurant.',1.14,1.15,6,-1],['Compete on atmosphere and experience','Invest in service, design, and a memorable visit.',1.12,1.17,5,3],['Compete on value','Drive traffic with strong portions and accessible pricing.',1.15,1.12,4,4]]},
    {title:'Year 2: Food and labor costs are squeezing margin',text:'Sales are growing, but percentage costs can quietly erase the profit behind a busy dining room.',opts:[['Engineer the menu','Remove weak items and promote higher margin sellers.',1.17,1.13,5,-2],['Raise prices','Protect margin and risk some customer pushback.',1.18,1.11,3,2],['Chase more volume','Keep prices stable and try to spread fixed costs over more sales.',1.14,1.15,2,5]]},
    {title:'Year 3: Demand is strong enough for expansion',text:'The first location is working. A second could multiply the brand or expose weaknesses that one store was hiding.',opts:[['Open location two','Commit capital and prove the concept can replicate.',1.18,1.26,5,8],['Add catering and delivery instead','Grow revenue without another full lease.',1.16,1.17,5,2],['Make location one exceptional','Keep improving the original before expanding.',1.14,1.12,6,-3]]},
    {title:'Year 4: Managers now determine the customer experience',text:'You cannot personally run every shift anymore. Leadership quality is becoming part of the product.',opts:[['Invest in management training','Build systems and leaders that protect standards.',1.12,1.2,6,-4],['Hire experienced operators','Pay more for leaders who have scaled restaurants before.',1.13,1.22,5,-3],['Stay hands on','Keep direct control but limit how large the company can become.',1.1,1.08,4,3]]},
    {title:'Year 5: What does the restaurant brand become?',text:'The concept can stay local, expand into multiple locations, or become something other operators can replicate.',opts:[['Build multiple locations','Keep expanding the company owned footprint.',1.16,1.3,6,7],['Maximize one flagship','Turn the original into a highly profitable destination.',1.22,1.13,6,-3],['Develop a franchise model','Package the systems, brand, recipes, and training for franchisees.',1.12,1.36,5,5]]}
  ],
  realestate: [
    {title:'Year 1: What is your first property strategy?',text:'The same capital can buy stability, appreciation potential, or a project that requires active work.',opts:[['Buy stable rentals','Prioritize occupancy and predictable cash flow.',1.11,1.14,4,-2],['Buy value add properties','Accept renovation risk for better upside.',1.15,1.18,3,5],['Focus on flips','Pursue faster gains with more timing risk.',1.18,1.14,2,7]]},
    {title:'Year 2: You have equity. Do you leverage it?',text:'Borrowing against appreciated property can accelerate the portfolio, but every new loan adds fixed obligations.',opts:[['Use conservative leverage','Add another property while protecting debt coverage.',1.15,1.18,4,2],['Leverage aggressively','Use equity to expand much faster.',1.2,1.24,2,9],['Stay mostly debt light','Let rents and appreciation build the balance sheet.',1.11,1.12,5,-4]]},
    {title:'Year 3: Property management is consuming your time',text:'Maintenance, tenants, leasing, collections, and contractors are turning the portfolio into an operating company.',opts:[['Hire property management','Trade some margin for scalability and owner freedom.',1.1,1.18,5,-4],['Build an internal management team','Create your own operating platform for the portfolio.',1.12,1.22,5,2],['Keep managing personally','Protect fees but keep the portfolio dependent on you.',1.12,1.08,3,3]]},
    {title:'Year 4: A larger multifamily deal appears',text:'The property is bigger than your usual purchases and would concentrate more capital in one asset.',opts:[['Buy with partners','Scale into the deal while sharing the risk.',1.16,1.24,5,3],['Buy aggressively yourself','Keep the upside but accept major concentration and leverage.',1.2,1.28,3,9],['Pass and keep diversifying','Stay with smaller properties and protect flexibility.',1.1,1.1,4,-3]]},
    {title:'Year 5: What kind of real estate company do you own?',text:'You can become a larger operator, prioritize cash flow, or build a platform that manages assets for other investors too.',opts:[['Build a larger portfolio','Keep acquiring and compounding equity.',1.16,1.3,5,5],['Optimize cash flow','Reduce weak assets and focus on durable income.',1.21,1.14,5,-4],['Launch an investment platform','Raise outside capital and earn fees alongside ownership.',1.14,1.34,5,6]]}
  ]
};

function makeArcQuestion(type, year){
  const blueprint=(wealthArcBlueprints[type]||wealthArcBlueprints.service)[year-1];
  if(!blueprint) return null;
  return {
    id:`arc_${type}_${year}`,
    cat:`${(wealthState.flags.businessName||type).toUpperCase()} · YEAR ${year}`,
    title:blueprint.title,
    text:blueprint.text,
    cond:()=>wealthState.flags.businessType===type&&wealthState.year===year,
    opts:()=>blueprint.opts.map(([t,d,profitMult,valueMult,rep,risk])=>({
      t,d,
      fx:()=>{
        wealthState.annualProfit*=profitMult;
        wealthState.businessValue*=valueMult;
        wealthState.reputation+=rep;
        wealthState.risk+=risk;
        wealthState.flags[`arc_${type}_${year}`]=t;
        return `${t} changed the trajectory of the company. Annual profit capacity shifted to ${wfmt(wealthState.annualProfit)} and the business is now valued around ${wfmt(wealthState.businessValue)}.`;
      }
    }))
  };
}

Object.keys(wealthArcBlueprints).forEach(type=>{
  for(let year=1;year<=5;year++) wealthQuestions.push(makeArcQuestion(type,year));
});

const originalChooseWealthQuestion=chooseWealthQuestion;
chooseWealthQuestion=function(){
  if(wealthState.decision>=wealthState.maxDecisions||wealthState.year>5){finishWealthGame();return;}
  const eligible=eligibleWealthQuestions();
  if(!eligible.length){finishWealthGame();return;}

  // Guarantee each year includes that business's milestone before generic questions can consume the whole year.
  const arcId=`arc_${wealthState.flags.businessType}_${wealthState.year}`;
  const arc=eligible.find(q=>q.id===arcId);
  const decisionsIntoYear=wealthState.decision%6;
  let item;
  if(arc && decisionsIntoYear>=1) item=arc;
  else {
    const specific=eligible.filter(q=>['CONTENT','AGENCY','E COMMERCE','CLEANING','SAAS','FOOD TRUCK','FOOD BUSINESS','RESTAURANT','TRUCKING','REAL ESTATE'].includes(q.cat));
    item=specific.length&&Math.random()<.55?wpick(specific):wpick(eligible.filter(q=>q.id!==arcId));
    if(!item&&arc)item=arc;
  }
  wealthState.used.add(item.id);
  renderWealthQuestion(item);
};

function wealthYearStory(year){
  const entries=wealthState.history.filter(h=>h.year===year);
  const choices=entries.filter(h=>h.question!=='Yearly event');
  const event=entries.find(h=>h.question==='Yearly event');
  const type=wealthState.flags.businessName||'business';
  const phases=['finding a workable model','turning the idea into a repeatable operation','scaling without breaking the company','protecting the business from its own complexity','turning the company into lasting wealth'];
  let text=`Year ${year} was about ${phases[year-1]}. `;
  const arcChoice=choices.find(h=>String(h.question).startsWith(`Year ${year}:`));
  if(arcChoice) text+=`${arcChoice.result} `;
  const supporting=choices.filter(h=>h!==arcChoice).slice(-2);
  if(supporting.length){
    text+=supporting.map((h,i)=>i===0?`Another important move was ${h.option.toLowerCase()}. ${h.result}`:`Later, ${h.option.toLowerCase()} also changed the business. ${h.result}`).join(' ')+ ' ';
  }
  if(event) text+=`The year also brought ${event.option.toLowerCase()}. ${event.result}`;
  if(!choices.length&&!event) text+=`The ${type} kept operating, but there were fewer major strategic changes than in the surrounding years.`;
  return text.trim();
}

finishWealthGame=function(){
  showOnly('wealth-end-screen');
  const nw=wealthNetWorth(),gain=nw-wealthState.start,roi=wealthState.start?gain/wealthState.start*100:0;
  let title='STILL STANDING.';
  if(nw<=0||roi<-80)title='WIPED OUT.';
  else if(roi<0)title='THE BUSINESS LOST MONEY.';
  else if(roi<25)title='SMALL WIN.';
  else if(roi<100)title='PROFITABLE.';
  else if(roi<500)title='SERIOUS GROWTH.';
  else title='WEALTH BUILDER.';
  W$('wealth-ending-title').textContent=title;

  const type=wealthState.flags.businessName||'business';
  const intro=`You started with ${wfmt(wealthState.start)} and chose to build a ${type}. What followed was not one lucky decision. It was five years of pricing, customers, hiring, risk, reinvestment, setbacks, and choices about how big the company should become.`;
  const yearly=[1,2,3,4,5].map(y=>`<div class="story-year"><span class="story-year-label">YEAR ${y}</span><p>${wealthYearStory(y)}</p></div>`).join('');
  const closing=`<p class="story-close">By the end of Year 5, the business was worth about ${wfmt(wealthState.businessValue)}, you had ${wfmt(wealthState.cash)} in cash and ${wfmt(wealthState.investments)} invested outside the company. ${wealthState.debt>0?`You still carried ${wfmt(wealthState.debt)} in debt. `:''}Your final estimated net worth was ${wfmt(nw)}. Compared with the ${wfmt(wealthState.start)} you began with, that was a ${roi>=0?'gain':'loss'} of ${wfmt(Math.abs(gain))}, or ${Math.abs(roi).toFixed(1)}%. ${roi>=100?'The original capital did more than survive; it became a much larger base of wealth.':roi>=0?'The business produced a positive result, although the size of the win depended heavily on how aggressively you scaled and how much risk you carried.':'The company did not create more wealth than you started with, showing how quickly operating risk and capital decisions can work against an owner.'}</p>`;
  W$('wealth-ending-story').innerHTML=`<p class="story-intro">${intro}</p>${yearly}${closing}`;

  W$('wealth-end-start').textContent=wfmt(wealthState.start);
  W$('wealth-end-networth').textContent=wfmt(nw);
  W$('wealth-end-gain').textContent=(gain>=0?'+':'-')+wfmt(Math.abs(gain));
  W$('wealth-end-roi').textContent=`${roi>=0?'+':''}${roi.toFixed(1)}%`;
  W$('wealth-end-profit').textContent=wfmt(wealthState.annualProfit);
  W$('wealth-end-debt').textContent=wfmt(wealthState.debt);

  const highlights=[];
  for(let y=1;y<=5;y++){
    const arc=wealthState.history.find(h=>h.year===y&&String(h.question).startsWith(`Year ${y}:`));
    if(arc) highlights.push(`<div class="impact-card"><span>YEAR ${y} MILESTONE</span><strong>${arc.option}</strong><p>${arc.result}</p></div>`);
  }
  const events=wealthState.history.filter(h=>h.question==='Yearly event').slice(0,3).map(h=>`<div class="impact-card"><span>MARKET OR OPERATING EVENT</span><strong>${h.option}</strong><p>${h.result}</p></div>`);
  W$('wealth-ending-impacts').innerHTML=[...highlights,...events].join('');
};
