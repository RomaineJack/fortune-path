// Permanent Build Wealth business picker UI.
(function(){
  const $ = (id)=>document.getElementById(id);
  const profiles = [
    {value:'content',label:'Content Creator / Media Business',min:100,desc:'Build an audience through YouTube, streaming, short form, podcasts, newsletters, sponsors, memberships, products, and media expansion.'},
    {value:'service',label:'Service Business',min:100,desc:'Start with a skill such as web design, consulting, repair, freelancing, or another low overhead service.'},
    {value:'agency',label:'Creative or Marketing Agency',min:500,desc:'Win clients, build retainers, hire specialists, manage delivery, and grow an agency that can operate beyond you.'},
    {value:'ecommerce',label:'E Commerce Brand',min:500,desc:'Launch products, manage inventory, advertising, fulfillment, repeat purchases, and retail expansion.'},
    {value:'cleaning',label:'Cleaning Company',min:1000,desc:'Build residential or commercial routes, hire crews, win recurring contracts, and expand into new markets.'},
    {value:'saas',label:'Tech Company / SaaS Startup',min:5000,desc:'Build software, find product market fit, manage subscriptions and churn, raise capital, and scale a technology company.'},
    {value:'foodtruck',label:'Food Truck',min:15000,desc:'Handle permits, menu strategy, food costs, locations, catering, staffing, equipment, and expansion.'},
    {value:'realestate',label:'Real Estate Company',min:25000,desc:'Acquire properties, use or avoid leverage, manage tenants and vacancies, and grow a real estate portfolio.'},
    {value:'trucking',label:'Trucking Company',min:30000,desc:'Manage trucks, drivers, fuel, maintenance, insurance, freight contracts, dispatching, and fleet growth.'},
    {value:'restaurant',label:'Restaurant',min:50000,desc:'Build a restaurant around menu economics, labor, food costs, reviews, operations, and possible additional locations.'}
  ];

  function money(n){return new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:0}).format(n);}

  function setup(){
    const grid=document.querySelector('#wealth-start-screen .wealth-setup');
    const style=$('wealth-style');
    const amount=$('wealth-starting-amount');
    if(!grid || !style || !amount) return;

    let block=$('wealth-business-block');
    let select=$('wealth-business-type');
    let preview=$('wealth-business-preview');

    if(!block){
      block=document.createElement('div');
      block.className='setup-block business-picker-block';
      block.id='wealth-business-block';
      block.innerHTML='<label for="wealth-business-type">Which business do you want to build?</label><select id="wealth-business-type"></select><p id="wealth-business-preview" class="helper"></p>';
      grid.insertBefore(block, grid.children[1] || null);
      select=$('wealth-business-type');
      preview=$('wealth-business-preview');
    }

    // Keep the main strategy wording clear.
    const labels={business:'Build a business',balanced:'Build a business + invest',investor:'Protect outside wealth while building',hustle:'Start lean and hustle'};
    [...style.options].forEach(o=>{if(labels[o.value])o.textContent=labels[o.value];});

    function refresh(){
      const capital=Number(String(amount.value||'0').replace(/,/g,''))||0;
      const previous=select.value;
      select.innerHTML=profiles.map(p=>`<option value="${p.value}" ${capital<p.min?'disabled':''}>${p.label}${capital<p.min?` — needs at least ${money(p.min)}`:''}</option>`).join('');
      const previousOption=[...select.options].find(o=>o.value===previous&&!o.disabled);
      if(previousOption) select.value=previous;
      else {
        const first=[...select.options].find(o=>!o.disabled);
        if(first) select.value=first.value;
      }
      const profile=profiles.find(p=>p.value===select.value);
      preview.textContent=profile?profile.desc:'Increase your starting capital to unlock more business types.';
      block.style.display='block';
    }

    select.addEventListener('change',refresh);
    amount.addEventListener('input',refresh);
    style.addEventListener('change',refresh);
    const random=$('wealth-randomize-btn');
    if(random) random.addEventListener('click',()=>setTimeout(refresh,0));
    refresh();
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',setup);
  else setup();
})();
