// Supabase client: keep the official browser fetch path untouched.
// A custom global fetch wrapper can turn normal Auth/network failures into
// generic "Failed to fetch" errors on some mobile browsers/WebViews.
const sb=(window.supabase&&window.SUPABASE_URL&&window.SUPABASE_ANON_KEY)
  ?window.supabase.createClient(window.SUPABASE_URL,window.SUPABASE_ANON_KEY,{
      auth:{autoRefreshToken:true,persistSession:true,detectSessionInUrl:true}
    }):null;

const months=['জানুয়ারি','ফেব্রুয়ারি','মার্চ','এপ্রিল','মে','জুন','জুলাই','আগস্ট','সেপ্টেম্বর','অক্টোবর','নভেম্বর','ডিসেম্বর'];
const money=n=>`৳ ${Number(n||0).toLocaleString('bn-BD')}`;
const esc=s=>String(s??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
const q=id=>document.getElementById(id);
let members=[],payments=[],profits=[],expenses=[],assets=[],notices=[],dividendVisibility=[],adminUser=null,years=[];
const DEFAULT_LAUNCH_BACKGROUND='#ffffff';
let appSettings={launch_background_color:DEFAULT_LAUNCH_BACKGROUND};
const DEFAULT_WEB_SETTINGS={
  site_name:'স্বপ্ননীড় উলামা সংঘ',site_tagline:'সংস্থার হিসাব অনলাইনে দেখুন',site_address:'মোমেনশাহী, ঢাকা, বাংলাদেশ',site_phone:'',site_email:'',site_facebook:'',site_youtube:'',site_website:'',site_logo:'',
  colors:{primary:'#0b6b4b',secondary:'#d6a21a',background:'#f4f8f6',header:'#0b6b4b',footer:'#075238',button:'#0b6b4b',text:'#1d2925',launch:'#ffffff'},
  menu:[
    {id:'personal',icon:'👤',label:'সদস্যদের ব্যক্তিগত হিসাব',enabled:true},{id:'members',icon:'👥',label:'সকল সদস্যদের হিসাব',enabled:true},{id:'due',icon:'📊',label:'সংস্থার মোট হিসাব',enabled:true},{id:'profitExpenseDetails',icon:'📋',label:'লভ্যাংশ ও খরচের বিবরণ',enabled:true},{id:'fund',icon:'💰',label:'অবশিষ্ট তহবিলের খাত',enabled:true},{id:'notices',icon:'📢',label:'নোটিশ',enabled:true},{id:'admin',icon:'🔐',label:'এডমিন প্যানেল',enabled:true}
  ],
  add_options:[
    {id:'member',label:'নতুন সদস্য',enabled:true},{id:'payment',label:'মাসিক জমা',enabled:true},{id:'profit',label:'লভ্যাংশ',enabled:true},{id:'expense',label:'বিবিধ খরচ',enabled:true},{id:'asset',label:'অবশিষ্ট তহবিলের খাত',enabled:true},{id:'notice',label:'নোটিশ',enabled:true}
  ],
  manage_options:[
    {id:'members',label:'সদস্য ব্যবস্থাপনা',enabled:true},{id:'payments',label:'জমা ব্যবস্থাপনা',enabled:true},{id:'profits',label:'লভ্যাংশ ব্যবস্থাপনা',enabled:true},{id:'expenses',label:'খরচ ব্যবস্থাপনা',enabled:true},{id:'assets',label:'অবশিষ্ট তহবিলের খাত ব্যবস্থাপনা',enabled:true},{id:'notices',label:'নোটিশ ব্যবস্থাপনা',enabled:true},{id:'dividends',label:'সদস্য লভ্যাংশ প্রকাশ/গোপন',enabled:true},{id:'settings',label:'⚙️ সফটওয়্যার সেটিংস',enabled:true}
  ],
  footer_text:'সকল অধিকার সংরক্ষিত'
};
const COLOR_PALETTE=[
['Swapnoneer Green','#0b6b4b'],['Deep Green','#075238'],['Emerald','#10b981'],['Forest Green','#228b22'],['Mint','#3eb489'],['Sage','#9caf88'],['Olive','#808000'],['Lime','#84cc16'],
['Blue','#0000ff'],['Royal Blue','#4169e1'],['Cobalt','#0047ab'],['Sky Blue','#38bdf8'],['Light Blue','#87ceeb'],['Navy Blue','#1455a8'],['Teal','#008080'],['Turquoise','#40e0d0'],['Cyan','#00d9e8'],['Aqua','#00ffff'],
['Purple','#800080'],['Royal Purple','#7851a9'],['Violet','#ee55ee'],['Lavender','#e6e6fa'],['Mauve','#b784a7'],['Indigo','#4b0082'],['Magenta','#ff00ff'],['Plum','#8e4585'],
['Red','#ff1b1b'],['Crimson','#dc143c'],['Scarlet','#ff2400'],['Maroon','#a00000'],['Burgundy','#800020'],['Rose','#e11d48'],['Pink','#f45cae'],['Hot Pink','#ff69b4'],['Coral','#ff7f50'],['Salmon','#fa8072'],
['Orange','#ffa500'],['Tangerine','#f97316'],['Peach','#ffdab9'],['Amber','#f59e0b'],['Gold','#ffd700'],['Mustard','#ffcc33'],['Yellow','#fff000'],['Lemon','#fff44f'],['Cream','#fffdd0'],
['Brown','#8b4513'],['Chocolate','#7b3f00'],['Bronze','#cd7f32'],['Copper','#b87333'],['Rust','#b7410e'],['Tan','#d2b48c'],['Beige','#f5f5dc'],
['Black','#000000'],['Charcoal','#36454f'],['Dark Gray','#4b5563'],['Gray','#bdbdbd'],['Silver','#c0c0c0'],['Light Gray','#e5e7eb'],['White','#ffffff'],
['Deep Sea','#0f4c5c'],['Petrol Blue','#006b78'],['Ocean','#0077b6'],['Denim','#1560bd'],['Periwinkle','#ccccff'],['Lilac','#c8a2c8'],['Raspberry','#e30b5c'],['Terracotta','#e2725b'],['Apricot','#fbceb1'],['Khaki','#c3b091'],['Midnight','#191970'],['Slate','#708090'],['Graphite','#41424c'],['Ivory','#fffff0']
];
function deepCloneSettings(){return JSON.parse(JSON.stringify(DEFAULT_WEB_SETTINGS))}
function mergeSettings(raw){const out=deepCloneSettings();if(raw&&typeof raw==='object'){Object.keys(out).forEach(k=>{if(k==='colors'&&raw.colors)Object.assign(out.colors,raw.colors);else if(Array.isArray(out[k])&&Array.isArray(raw[k])){const map=new Map(raw[k].map(x=>[String(x.id),x]));out[k]=out[k].map(x=>({...x,...(map.get(String(x.id))||{})}));}else if(typeof raw[k]==='string')out[k]=raw[k]});if(raw.launch_background_color)out.colors.launch=raw.launch_background_color}return out}
function applyWebSettings(raw){appSettings=mergeSettings(raw);const c=appSettings.colors;const root=document.documentElement;root.style.setProperty('--green',c.primary);root.style.setProperty('--green-dark',c.primary);root.style.setProperty('--green-soft',c.primary+'18');root.style.setProperty('--gold',c.secondary);root.style.setProperty('--gold-soft',c.secondary+'18');root.style.setProperty('--site-header',c.header);root.style.setProperty('--site-bg',c.background);root.style.setProperty('--site-footer',c.footer);root.style.setProperty('--site-button',c.button);root.style.setProperty('--text',c.text);root.style.setProperty('--launch-bg',c.launch);
document.body.style.backgroundColor=c.background;document.title=appSettings.site_name+' — হিসাব';document.querySelectorAll('#siteNameHeader,#siteNameHero,#footerSiteName').forEach(e=>e.textContent=appSettings.site_name);if(q('siteTaglineHeader'))q('siteTaglineHeader').textContent=appSettings.site_tagline;if(q('siteAddressHero'))q('siteAddressHero').textContent=appSettings.site_address;if(q('footerSub'))q('footerSub').textContent=appSettings.footer_text;if(q('footerContact')){const parts=[];if(appSettings.site_phone)parts.push('📞 '+esc(appSettings.site_phone));if(appSettings.site_email)parts.push('✉️ '+esc(appSettings.site_email));q('footerContact').innerHTML=parts.join(' · ')}if(q('footerSocial')){const links=[];if(appSettings.site_facebook)links.push(`<a href="${esc(appSettings.site_facebook)}" target="_blank" rel="noopener noreferrer">Facebook</a>`);if(appSettings.site_youtube)links.push(`<a href="${esc(appSettings.site_youtube)}" target="_blank" rel="noopener noreferrer">YouTube</a>`);if(appSettings.site_website)links.push(`<a href="${esc(appSettings.site_website)}" target="_blank" rel="noopener noreferrer">Website</a>`);q('footerSocial').innerHTML=links.join(' · ')}const logo=appSettings.site_logo||'Swapnoneer logo.png';['siteLogoImg','siteLogoDrawer','appLaunchLogo'].forEach(id=>{if(q(id))q(id).src=logo});applyLaunchBackground(c.launch);applyMenuSettings();applyAdminOptionSettings();fillSettingsEditor()}
function applyMenuSettings(){const menuMap=new Map((appSettings.menu||[]).map(x=>[x.id,x]));document.querySelectorAll('#mobileMenu a[data-view]').forEach(a=>{const x=menuMap.get(a.dataset.view);if(!x)return;a.style.display=x.enabled?'flex':'none';const icon=a.querySelector('span');if(icon)icon.textContent=x.icon||'';const label=a.querySelector('.menu-label');if(label)label.textContent=x.label||'';a.href='#'+a.dataset.view});route()}
function applyAdminOptionSettings(){[['add_options','addSelect'],['manage_options','manageSelect']].forEach(([key,id])=>{const map=new Map((appSettings[key]||[]).map(x=>[x.id,x]));document.querySelectorAll('#'+id+' option[data-setting-key]').forEach(o=>{const x=map.get(o.dataset.settingKey);if(x){const enabled=(x.id==='settings'&&id==='manageSelect')?true:!!x.enabled;o.textContent=x.label;o.hidden=!enabled;o.disabled=!enabled}})});}
function fillSettingsEditor(){const fields={siteName:'site_name',siteTagline:'site_tagline',siteAddress:'site_address',sitePhone:'site_phone',siteEmail:'site_email',siteFacebook:'site_facebook',siteYoutube:'site_youtube',siteWebsite:'site_website',siteLogo:'site_logo'};Object.entries(fields).forEach(([id,k])=>{if(q(id))q(id).value=appSettings[k]||''});const labels={primary:'প্রধান রং',secondary:'দ্বিতীয় রং',background:'পেজের ব্যাকগ্রাউন্ড',header:'Header রং',footer:'Footer রং',button:'Button রং',text:'Text রং',launch:'Launch Screen রং'};if(q('colorSettingsGrid'))q('colorSettingsGrid').innerHTML=Object.entries(labels).map(([key,label])=>{const value=String(appSettings.colors[key]||'#ffffff').toLowerCase();const name=(COLOR_PALETTE.find(([n,v])=>v===value)||['Custom',value])[0];return `<div class="color-setting-block"><div class="color-setting-head"><b>${label}</b><span class="color-name">${name}</span></div><button type="button" class="color-open-btn" data-open-color="${key}"><span class="color-preview" style="background:${value}"></span><span><strong>${name}</strong><small>${value}</small></span><span class="color-open-arrow">🎨 পরিবর্তন</span></button><input type="hidden" data-color-text="${key}" value="${value}"></div>`}).join('');q('menuSettingsList').innerHTML=(appSettings.menu||[]).map(x=>`<div class="setting-row" data-id="${x.id}"><span class="setting-fixed">${x.id}</span><input data-setting-label value="${esc(x.label)}"><input data-setting-icon class="icon-input" value="${esc(x.icon)}" maxlength="4"><label class="switch"><input type="checkbox" data-setting-enabled ${x.enabled?'checked':''}><span></span></label></div>`).join('');q('addOptionsSettingsList').innerHTML=(appSettings.add_options||[]).map(x=>`<div class="setting-row" data-id="${x.id}"><span class="setting-fixed">${x.id}</span><input data-setting-label value="${esc(x.label)}"><label class="switch"><input type="checkbox" data-setting-enabled ${x.enabled?'checked':''}><span></span></label></div>`).join('');q('manageOptionsSettingsList').innerHTML=(appSettings.manage_options||[]).map(x=>`<div class="setting-row" data-id="${x.id}"><span class="setting-fixed">${x.id}</span><input data-setting-label value="${esc(x.label)}"><label class="switch"><input type="checkbox" data-setting-enabled ${x.enabled?'checked':''}><span></span></label></div>`).join('');}
function openColorPalette(key){const current=String(appSettings.colors[key]||'#ffffff').toLowerCase();const labels={primary:'প্রধান রং',secondary:'দ্বিতীয় রং',background:'পেজের ব্যাকগ্রাউন্ড',header:'Header রং',footer:'Footer রং',button:'Button রং',text:'Text রং',launch:'Launch Screen রং'};let modal=q('colorPaletteModal');if(!modal){modal=document.createElement('div');modal.id='colorPaletteModal';modal.className='color-modal-backdrop';document.body.appendChild(modal)}modal.innerHTML=`<div class="color-modal" role="dialog" aria-modal="true"><div class="color-modal-head"><div><h3>🎨 ${labels[key]||'রং নির্বাচন'}</h3><p>নিচ থেকে পছন্দের রং নির্বাচন করুন</p></div><button type="button" class="color-modal-close" data-color-cancel>×</button></div><div class="color-modal-grid">${COLOR_PALETTE.map(([n,v])=>`<button type="button" class="modal-palette-swatch ${current===v?'selected':''}" data-modal-color="${v}" title="${n}"><span style="background:${v}"></span><small>${n}</small></button>`).join('')}</div><div class="color-custom-row"><label>নিজের রং <input id="modalCustomColor" type="color" value="${validHexColor(current)?current:'#ffffff'}"></label><input id="modalHexColor" type="text" value="${current}" maxlength="7" placeholder="#000000"><button type="button" class="color-modal-preview" id="modalPreview" style="background:${current}"></button></div><div class="color-modal-actions"><button type="button" class="btn btn-light" data-color-cancel>বাতিল</button><button type="button" class="btn btn-primary" data-color-apply>রং নির্বাচন</button></div></div>`;modal.hidden=false;const hex=q('modalHexColor'),custom=q('modalCustomColor'),preview=q('modalPreview');let chosen=current;const update=v=>{if(!validHexColor(v))return;chosen=v.toLowerCase();hex.value=chosen;custom.value=chosen;preview.style.background=chosen;modal.querySelectorAll('.modal-palette-swatch').forEach(b=>b.classList.toggle('selected',b.dataset.modalColor===chosen))};modal.querySelectorAll('[data-modal-color]').forEach(b=>b.addEventListener('click',()=>update(b.dataset.modalColor)));custom.addEventListener('input',()=>update(custom.value));hex.addEventListener('input',()=>{if(validHexColor(hex.value))update(hex.value)});modal.querySelectorAll('[data-color-cancel]').forEach(b=>b.addEventListener('click',()=>{modal.hidden=true}));modal.querySelector('[data-color-apply]').addEventListener('click',()=>{const input=document.querySelector(`[data-color-text="${key}"]`);if(input)input.value=chosen;const block=input?.closest('.color-setting-block');if(block){const sw=block.querySelector('.color-preview');const title=block.querySelector('.color-name');const nm=(COLOR_PALETTE.find(([n,v])=>v===chosen)||['Custom'])[0];if(sw)sw.style.background=chosen;if(title)title.textContent=nm;const strong=block.querySelector('.color-open-btn strong');const small=block.querySelector('.color-open-btn small');if(strong)strong.textContent=nm;if(small)small.textContent=chosen}modal.hidden=true});}

function readSettingsEditor(){const out=mergeSettings(appSettings);const fields={siteName:'site_name',siteTagline:'site_tagline',siteAddress:'site_address',sitePhone:'site_phone',siteEmail:'site_email',siteFacebook:'site_facebook',siteYoutube:'site_youtube',siteWebsite:'site_website',siteLogo:'site_logo'};Object.entries(fields).forEach(([id,k])=>{out[k]=q(id)?.value.trim()||''});document.querySelectorAll('[data-color-text]').forEach(i=>{if(validHexColor(i.value))out.colors[i.dataset.colorText]=i.value.toLowerCase()});document.querySelectorAll('#menuSettingsList .setting-row').forEach(r=>{const x=out.menu.find(a=>a.id===r.dataset.id);if(x){x.label=r.querySelector('[data-setting-label]').value.trim()||x.label;x.icon=r.querySelector('.icon-input').value.trim()||x.icon;x.enabled=r.querySelector('[data-setting-enabled]').checked}});[['add_options','addOptionsSettingsList'],['manage_options','manageOptionsSettingsList']].forEach(([key,id])=>document.querySelectorAll('#'+id+' .setting-row').forEach(r=>{const x=out[key].find(a=>a.id===r.dataset.id);if(x){x.label=r.querySelector('[data-setting-label]').value.trim()||x.label;x.enabled=x.id==='settings'?true:r.querySelector('[data-setting-enabled]').checked}}));return out}
async function loadAppSettings(){let raw=null;try{const local=localStorage.getItem('swapnoneer_web_settings');if(local)raw=JSON.parse(local)}catch(e){}applyWebSettings(raw||{});if(sb){try{const {data,error}=await sb.from('app_settings').select('settings').eq('id',1).maybeSingle();if(!error&&data&&data.settings)applyWebSettings(data.settings)}catch(e){console.warn('Web settings load skipped:',e)}}}
async function uploadWebsiteLogo(file){
  if(!adminUser){showMessage('অ্যাডমিন হিসেবে লগইন করুন।',false,'settingsMsg');return null}
  if(!file)return null;
  const allowed=['image/png','image/jpeg','image/webp'];
  if(!allowed.includes(file.type)){showMessage('লোগোর জন্য PNG, JPG/JPEG অথবা WebP ছবি দিন।',false,'settingsMsg');return null}
  if(file.size>3*1024*1024){showMessage('লোগোর ছবির সাইজ সর্বোচ্চ 3 MB হতে পারবে।',false,'settingsMsg');return null}
  if(!sb){showMessage('Supabase সংযোগ পাওয়া যায়নি।',false,'settingsMsg');return null}
  const ext=(file.type==='image/png'?'png':file.type==='image/webp'?'webp':'jpg');
  const path='branding/logo-'+Date.now()+'.'+ext;
  const btn=q('uploadLogoBtn');if(btn){btn.disabled=true;btn.textContent='⏳ লোগো আপলোড হচ্ছে...'}
  try{
    const {error}=await sb.storage.from('website-assets').upload(path,file,{upsert:false,cacheControl:'3600',contentType:file.type});
    if(error)throw error;
    const {data}=sb.storage.from('website-assets').getPublicUrl(path);
    const url=data?.publicUrl||'';
    if(!url)throw new Error('Public logo URL পাওয়া যায়নি।');
    q('siteLogo').value=url;
    ['logoPreview','siteLogoImg','siteLogoDrawer','appLaunchLogo'].forEach(id=>{if(q(id))q(id).src=url});
    appSettings.site_logo=url;
    showMessage('লোগো সফলভাবে আপলোড হয়েছে। এখন “সব ওয়েব সেটিংস সংরক্ষণ” চাপুন।',true,'settingsMsg');
    return url;
  }catch(error){
    console.error('Logo upload failed:',error);
    showMessage('লোগো আপলোড হয়নি: '+String(error?.message||error),false,'settingsMsg');
    return null;
  }finally{if(btn){btn.disabled=false;btn.textContent='⬆️ লোগো আপলোড'}}
}

async function saveWebSettings(){if(!adminUser){showMessage('অ্যাডমিন হিসেবে লগইন করুন।',false,'settingsMsg');return}const next=readSettingsEditor();next.launch_background_color=next.colors.launch;let serverSaved=false;let serverError=null;if(sb){try{const result=await sb.from('app_settings').upsert({id:1,settings:next,launch_background_color:next.colors.launch,updated_at:new Date().toISOString()},{onConflict:'id'});serverError=result.error;serverSaved=!serverError}catch(e){serverError=e}}try{localStorage.setItem('swapnoneer_web_settings',JSON.stringify(next))}catch(e){}appSettings=next;applyWebSettings(next);if(serverSaved){showMessage('সব ওয়েব সেটিংস সফলভাবে সংরক্ষণ হয়েছে ✓',true,'settingsMsg')}else{console.warn('Web settings server save failed:',serverError);const msg=String(serverError?.message||serverError||'').toLowerCase();if(msg.includes('app_settings')||msg.includes('relation')||msg.includes('42p01')||msg.includes('pgrst205'))showMessage('সেটিংস এই ডিভাইসে সংরক্ষণ হয়েছে ✓। সব ডিভাইসে একসাথে দেখাতে Supabase-এ app_settings.sql একবার চালাতে হবে।',true,'settingsMsg');else if(msg.includes('permission')||msg.includes('42501')||msg.includes('row-level'))showMessage('সেটিংস এই ডিভাইসে সংরক্ষণ হয়েছে ✓, কিন্তু Supabase permission-এর কারণে server-এ সংরক্ষণ হয়নি।',false,'settingsMsg');else showMessage('সেটিংস এই ডিভাইসে সংরক্ষণ হয়েছে ✓, কিন্তু Supabase server sync হয়নি।',false,'settingsMsg')}}

function resetWebSettings(){if(!confirm('সব ওয়েব সেটিংস ডিফল্টে ফিরিয়ে দিতে চান?'))return;applyWebSettings(DEFAULT_WEB_SETTINGS);fillSettingsEditor();showMessage('ডিফল্ট সেটিংস নির্বাচন করা হয়েছে। সংরক্ষণ চাপুন।',true,'settingsMsg')}
function validHexColor(v){return /^#[0-9A-Fa-f]{6}$/.test(String(v||'').trim())}
function applyLaunchBackground(color){const c=validHexColor(color)?String(color).trim().toLowerCase():DEFAULT_LAUNCH_BACKGROUND;appSettings.launch_background_color=c;document.documentElement.style.setProperty('--launch-bg',c);const launch=q('appLaunchScreen');if(launch)launch.style.backgroundColor=c;try{localStorage.setItem('swapnoneer_launch_background_color',c)}catch(e){}}
function fillSettingsForm(){fillSettingsEditor()}
function hideLaunchScreen(){const el=q('appLaunchScreen');if(!el)return;el.classList.add('hide');el.remove();}
// বার্ষিক হিসাবের মূল নিয়ম: প্রতি সদস্যের জন্য বছরে ১২ মাস × ৳৫০০ = ৳৬,০০০।
// বকেয়া সবসময় বার্ষিক মোট পাওনা থেকে প্রকৃত পরিশোধ বাদ দিয়ে অটোমেটিক গণনা হবে।
const MONTHLY_REQUIRED=500;
const MONTHS_PER_YEAR=12;
function monthlyRequired(){
  const rows=payments.filter(p=>Number(p.paid_amount||0)>0 && Number(p.required_amount||0)>0).slice().sort((a,b)=>{
    const ay=Number(normalizeYear(a.year)), by=Number(normalizeYear(b.year));
    if(ay!==by)return ay-by;
    return Number(a.month||0)-Number(b.month||0);
  });
  return rows.length ? Number(rows[0].required_amount||MONTHLY_REQUIRED) : MONTHLY_REQUIRED;
}
function yearlyRequired(){return monthlyRequired()*MONTHS_PER_YEAR;}

function getYears(){
  const found=new Set();
  const addYear=y=>{
    const year=String(y??'').trim();
    if(year)found.add(year);
  };
  // সাল শুধু প্রকৃত মাসিক জমা থেকে আসবে। কোনো জমা না থাকলে
  // সেই সাল সিলেকশন বক্সে থাকবে না। ২০২২-ও এর ব্যতিক্রম নয়।
  // তাই ২০২১, ২০২২, ২০২৩ বা অন্য যেকোনো ৪ সংখ্যার জমার সাল
  // স্বয়ংক্রিয়ভাবে সব সাল নির্বাচন বক্সে যুক্ত হবে।
  payments.forEach(p=>{
    if(Number(p.paid_amount||0)>0) addYear(p.year);
  });
  return [...found].sort((a,b)=>Number(a)-Number(b));
}
function fillYearSelect(el,includeAll=false){
  if(!el)return;
  const placeholder='<option value="">-- সাল নির্বাচন করুন --</option>';
  const all=includeAll?'<option value="all">সকল বছর</option>':'';
  el.innerHTML=placeholder+all+years.map(y=>`<option value="${esc(y)}">${esc(y)}</option>`).join('');
}
function fillYearSelectors(){
  years=getYears();
  fillYearSelect(q('personalYear'),true);
  fillYearSelect(q('allMembersYear'),true);
  fillYearSelect(q('paymentManageYear'),true);
  // মাসিক জমার বছর এখানে নির্বাচন নয়—প্রতিবার নতুন/পুরোনো জমার সময় বছর লিখতে হবে।
  fillYearSelect(q('profitYear'),false);
  fillYearSelect(q('expenseYear'),false);
  fillYearSelect(q('assetYear'),false);
  if(q('paymentManageMonth')) q('paymentManageMonth').value='';
  if(q('paymentManageMember')) q('paymentManageMember').value='';
}
function memberSort(a,b){
  const sa=Number(a.serial_no), sb=Number(b.serial_no);
  const aHas=Number.isFinite(sa)&&sa>0, bHas=Number.isFinite(sb)&&sb>0;
  if(aHas&&bHas&&sa!==sb)return sa-sb;
  if(aHas!==bHas)return aHas?-1:1;
  return String(a.name||'').localeCompare(String(b.name||''),'bn');
}
function fillMemberSelectors(){
  const orderedMembers=members.slice().sort(memberSort);
  const opts=orderedMembers.map((m,i)=>`<option value="${esc(m.id)}">${Number(m.serial_no||i+1).toLocaleString('bn-BD')}. ${esc(m.name)}</option>`).join('');
  q('personalMember').innerHTML='<option value="">-- সদস্য নির্বাচন করুন --</option>'+opts;
  q('payMember').innerHTML='<option value="">-- সদস্য নির্বাচন করুন --</option>'+opts;
  const manageMember=q('paymentManageMember');
  if(manageMember){const prev=manageMember.value; manageMember.innerHTML='<option value="">-- সদস্য নির্বাচন করুন --</option>'+opts; if(orderedMembers.some(m=>String(m.id)===String(prev))) manageMember.value=prev;}
}
function selectedYears(year){
  if(year==='all'||!year) return years;
  return [String(year)];
}
// Excel-এর বার্ষিক হিসাব অনুযায়ী প্রতিটি সদস্যের প্রত্যেক হিসাব বছরে
// ১২ মাস × ৳৫০০ = ৳৬,০০০ পাওনা। বকেয়া কখনো Database-এর কোনো
// পুরোনো/ফাঁকা due ফিল্ড থেকে নেওয়া হবে না; প্রকৃত মাসিক জমা থেকেই হিসাব হবে।
function normalizeYear(v){
  return String(v ?? '').trim().replace(/[০-৯]/g,d=>String('০১২৩৪৫৬৭৮৯'.indexOf(d)));
}

// ২০২৫ সালে কোনো সদস্যের মাসিক জমা হয়নি। Database-এ থাকা পুরোনো/ভুল ২০২৫
// payment record যেন কোনো হিসাব বা প্রদর্শনীতে জমা হিসেবে না আসে, তাই শুধু
// হিসাবের স্তরে ২০২৫ সালের payment বাদ দেওয়া হচ্ছে; Database-এর কোনো data
// পরিবর্তন বা delete করা হচ্ছে না।
function isCountablePayment(p){
  // সকল প্রকৃত payment record হিসাবের অংশ। কোনো নির্দিষ্ট বছর
  // (যেমন ২০২৫) আলাদা করে বাদ দেওয়া হবে না।
  return Number(p.paid_amount||0) > 0;
}
function memberPaid(m,year){
  const target = year==='all'||!year ? null : normalizeYear(year);
  return payments
    .filter(p=>isCountablePayment(p) && String(p.member_id)===String(m.id) && (target===null || normalizeYear(p.year)===target))
    .reduce((s,p)=>s+Number(p.paid_amount||0),0);
}
function memberRequired(m,year){
  return selectedYears(year).length * yearlyRequired();
}
function memberDue(m,year){
  const paid=memberPaid(m,year);
  return Math.max(memberRequired(m,year)-paid,0);
}
function totalPaid(year){
  const target=year==='all'||!year?null:normalizeYear(year);
  return payments.filter(p=>isCountablePayment(p) && (target===null||normalizeYear(p.year)===target))
    .reduce((s,p)=>s+Number(p.paid_amount||0),0);
}
function totalRequired(year){return members.length*selectedYears(year).length*yearlyRequired()}
function totalDue(year){return Math.max(totalRequired(year)-totalPaid(year),0)}
function totalExpense(year){return expenses.filter(e=>!year||year==='all'||Number(normalizeYear(e.year))===Number(normalizeYear(year))).reduce((s,e)=>s+Number(e.amount||0),0)}
function totalProfit(year){return profits.filter(p=>!year||year==='all'||Number(normalizeYear(p.year))===Number(normalizeYear(year))).reduce((s,p)=>s+Number(p.total_profit||0),0)}
function totalAssets(year){return assets.filter(a=>!year||year==='all'||Number(normalizeYear(a.year))===Number(normalizeYear(year))).reduce((s,a)=>s+Number(a.amount||0),0)}
function remainingFund(){return totalPaid('all')+totalProfit('all')-totalExpense('all')}
function currentFund(){return remainingFund()-totalAssets('all')}
function downloadButton(kind){return `<div class="result-download"><button class="download-btn" type="button" onclick="${kind==='personal'?'downloadPersonalReport()':'downloadAllMembersReport()'}">⬇️ বিস্তারিত হিসাব ডাউনলোড</button></div>`}

let dataLoadPromise=null;
let dataLoaded=false;

async function load(){
  // Apply cached/local settings immediately; remote settings load in the background.
  loadAppSettings().catch(()=>{});
  if(!sb){q('totalResult').innerHTML='<div class="empty-state">Supabase configuration পাওয়া যায়নি।</div>';hideLaunchScreen();return;}
  q('totalResult').innerHTML='<div class="loading">ডাটা লোড হচ্ছে...</div>';

  const fetchAllPayments=async()=>{
    const rows=[];
    const pageSize=1000;
    for(let from=0;;from+=pageSize){
      const {data,error}=await sb.from('payments').select('*').order('year').order('month').range(from,from+pageSize-1);
      if(error)return {data:null,error};
      rows.push(...(data||[]));
      if(!data||data.length<pageSize)break;
    }
    return {data:rows,error:null};
  };

  try{
    const [m,p,pr,e,a,n,dv]=await Promise.all([
      sb.from('members').select('*').eq('status','active').order('serial_no',{ascending:true,nullsFirst:false}).order('created_at'),
      fetchAllPayments(),
      sb.from('profits').select('*').order('year'),
      sb.from('expenses').select('*').order('date',{ascending:false}),
      sb.from('assets').select('*').eq('status','active').order('date',{ascending:false}),
      sb.from('notices').select('*').eq('status','published').order('publish_date',{ascending:false}),
      sb.from('member_dividend_visibility').select('member_id,is_public')
    ]);
    const errors=[m,p,pr,e,a,n].filter(x=>x.error && x.error.code!=='42P01');
    if(errors.length){
      console.error(...errors.map(x=>x.error));
      q('totalResult').innerHTML='<div class="empty-state">ডাটা লোড করতে সমস্যা হয়েছে। Supabase/RLS সেটিংস পরীক্ষা করুন।</div>';
      return;
    }
    members=m.data||[];payments=p.data||[];profits=pr.data||[];expenses=e.data||[];assets=a.data||[];notices=n.data||[];dividendVisibility=dv?.data||[];
    fillYearSelectors();fillMemberSelectors();
    renderTotal();renderPersonalTotal();renderProfitExpenseDetails();renderFund();renderNotices();renderAllMembersPreview();
    dataLoaded=true;
  }catch(error){
    console.error('Initial data load failed:',error);
    q('totalResult').innerHTML='<div class="empty-state">Supabase থেকে তথ্য আনা যাচ্ছে না। Internet/Project connection পরীক্ষা করুন।</div>';
  }
}


function renderPersonalTotal(){
  const deposit=totalPaid('all'),profit=totalProfit('all'),expense=totalExpense('all'),remaining=deposit+profit-expense;
  q('personalTotalResult').innerHTML=`<div class="report-title"><h3>সংস্থার মোট হিসাব</h3><p>প্রতিষ্ঠার শুরু থেকে সকল বছরের সমন্বিত হিসাব</p></div>
  <div class="summary-grid total-summary">
    <article><span>মোট জমা</span><strong>${money(deposit)}</strong></article>
    <article><span>মোট লভ্যাংশ</span><strong>${money(profit)}</strong></article>
    <article><span>মোট বিবিধ খরচ</span><strong>${money(expense)}</strong></article>
    <article class="highlight"><span>অবশিষ্ট তহবিল</span><strong>${money(remaining)}</strong></article>
  </div>`;
}

function renderPersonal(){
  const y=q('personalYear').value,id=q('personalMember').value;
  q('personalMessage').className='message hidden';
  if(!y||!id){q('personalMessage').textContent='সাল ও সদস্য নির্বাচন করুন।';q('personalMessage').className='message error';return;}
  const m=members.find(x=>String(x.id)===String(id));if(!m)return;
  const label=y==='all'?'সকল বছরের মোট হিসাব':`${y} সালের হিসাব`;
  const detailYears=selectedYears(y);
  const detailRows=detailYears.flatMap(yr=>months.map((monthName,idx)=>{
    const paid=memberMonthPaid(m,yr,idx+1);
    const due=Math.max(monthlyRequired()-paid,0);
    return `<tr><td>${esc(yr)}</td><td>${monthName}</td><td>${paid>0?money(paid):'৳ ০'}</td><td>${money(due)}</td></tr>`;
  })).join('');
  const publicDividend=isDividendPublic(m.id);
  const allYear=String(y)==='all';
  const paidTotal=memberPaid(m,y), dueTotal=memberDue(m,y);
  const dividend=publicDividend?memberDividend(m):0;
  const grandTotal=publicDividend?paidTotal+dividend:0;
  const summary=allYear
    ? `<div class="summary-grid total-summary personal-total-summary">
        <article><span>মোট পরিশোধ</span><strong>${money(paidTotal)}</strong></article>
        <article><span>মোট বাকি</span><strong>${money(dueTotal)}</strong></article>
        <article><span>${publicDividend?'মোট লভ্যাংশ':'লভ্যাংশ'}</span><strong>${publicDividend?money(dividend):'গোপন'}</strong></article>
        <article class="highlight"><span>${publicDividend?'সর্বমোট প্রাপ্য':'সর্বমোট প্রাপ্য'}</span><strong>${publicDividend?money(grandTotal):'—'}</strong></article>
      </div>`
    : `<div class="member-summary compact-summary">
        <div>মোট পরিশোধ<strong>${money(paidTotal)}</strong></div>
        <div>মোট বাকি<strong>${money(dueTotal)}</strong></div>
      </div>`;
  q('personalResult').innerHTML=`<div class="report-title"><h3>${esc(m.name)}</h3><p>${label}</p></div>
    <div class="print-only personal-print-details"><h4>মাসভিত্তিক বিস্তারিত হিসাব</h4><div class="table-wrap"><table><thead><tr><th>সাল</th><th>মাস</th><th>পরিশোধ</th><th>বাকি</th></tr></thead><tbody>${detailRows}</tbody></table></div></div>
    ${summary}
    ${downloadButton('personal')}`;
  q('personalResult').scrollIntoView({behavior:'smooth',block:'start'});
}

function memberMonthPaid(m,y,month){
  return payments.filter(p=>isCountablePayment(p)&&String(p.member_id)===String(m.id)&&Number(normalizeYear(p.year))===Number(normalizeYear(y))&&Number(p.month)===month).reduce((s,p)=>s+Number(p.paid_amount||0),0);
}
function paidCell(m,y,month){
  const amount=memberMonthPaid(m,y,month);
  return amount>0?Number(amount).toLocaleString('bn-BD'):'';
}
function renderAllMembers(){
  const y=q('allMembersYear').value||'all';
  if(!y){q('allMembersResult').innerHTML='<div class="empty-state">একটি বছর নির্বাচন করে হিসাব দেখুন।</div>';return;}
  if(y==='all'){
    let h=`<div class="report-title"><h3>সকল বছরের সকল সদস্যদের হিসাব</h3><p>যে মাসে টাকা দেওয়া হয়েছে শুধু সেই টাকাই দেখানো হয়েছে</p></div><div class="table-wrap"><table class="member-report-table"><thead><tr><th>ক্রমিক</th><th class="name nowrap">সদস্যের নাম</th>${years.map(v=>`<th>${esc(v)}</th>`).join('')}<th>মোট পরিশোধ</th><th>মোট বাকি</th></tr></thead><tbody>`;
    members.forEach((m,i)=>{h+=`<tr><td>${Number(m.serial_no||i+1).toLocaleString('bn-BD')}</td><td class="name nowrap">${esc(m.name)}</td>`+years.map(v=>`<td>${memberPaid(m,v)>0?Number(memberPaid(m,v)).toLocaleString('bn-BD'):''}</td>`).join('')+`<td>${Number(memberPaid(m,'all')).toLocaleString('bn-BD')}</td><td>${Number(memberDue(m,'all')).toLocaleString('bn-BD')}</td></tr>`});
    h+=`</tbody><tfoot><tr class="total-row"><td colspan="2">সর্বমোট</td>${years.map(v=>`<td>${totalPaid(v)>0?Number(totalPaid(v)).toLocaleString('bn-BD'):''}</td>`).join('')}<td>${money(totalPaid('all'))}</td><td>${money(totalDue('all'))}</td></tr></tfoot></table></div>${downloadButton('allMembers')}`;
    q('allMembersResult').innerHTML=h;return;
  }
  let h=`<div class="report-title"><h3>${esc(y)} সালের সকল সদস্যদের হিসাব</h3><p>প্রতি মাসে শুধু পরিশোধের পরিমাণ দেখানো হয়েছে</p></div><div class="table-wrap"><table class="member-report-table"><thead><tr><th>ক্রমিক</th><th class="name nowrap">সদস্যের নাম</th>${months.map(m=>`<th>${m}</th>`).join('')}<th>মোট পরিশোধ</th><th>মোট বাকি</th></tr></thead><tbody>`;
  members.forEach((m,i)=>{h+=`<tr><td>${Number(m.serial_no||i+1).toLocaleString('bn-BD')}</td><td class="name nowrap">${esc(m.name)}</td>`+months.map((_,mi)=>`<td>${paidCell(m,y,mi+1)}</td>`).join('')+`<td>${Number(memberPaid(m,y)).toLocaleString('bn-BD')}</td><td>${Number(memberDue(m,y)).toLocaleString('bn-BD')}</td></tr>`});
  h+=`</tbody><tfoot><tr class="total-row"><td colspan="2">সর্বমোট</td>${months.map((_,mi)=>{const x=payments.filter(p=>isCountablePayment(p)&&Number(normalizeYear(p.year))===Number(normalizeYear(y))&&Number(p.month)===mi+1).reduce((s,p)=>s+Number(p.paid_amount||0),0);return `<td>${x>0?Number(x).toLocaleString('bn-BD'):''}</td>`}).join('')}<td>${money(totalPaid(y))}</td><td>${money(totalDue(y))}</td></tr></tfoot></table></div>
  <div class="member-summary"><div>মোট পরিশোধ<strong>${money(totalPaid(y))}</strong></div><div>মোট বাকি<strong>${money(totalDue(y))}</strong></div></div>${downloadButton('allMembers')}`;
  q('allMembersResult').innerHTML=h;
}
function renderAllMembersPreview(){
  const rows=years.map(y=>`<tr><td>${esc(y)}</td><td>${money(totalPaid(y))}</td><td>${money(totalDue(y))}</td></tr>`).join('');
  q('allMembersResult').innerHTML=`<div class="report-title"><h3>সকল সদস্যদের হিসাব</h3><p>সাল নির্বাচন করে বিস্তারিত হিসাব দেখুন</p></div><div class="table-wrap"><table><thead><tr><th>সাল</th><th>মোট পরিশোধ</th><th>মোট বাকি</th></tr></thead><tbody>${rows}</tbody></table></div>`;
}

function renderTotal(){
  const deposit=totalPaid('all'),profit=totalProfit('all'),expense=totalExpense('all'),remaining=deposit+profit-expense;
  q('totalResult').innerHTML=`<div class="report-title"><h3>সংস্থার মোট হিসাব</h3><p>প্রতিষ্ঠার শুরু থেকে সকল বছরের সমন্বিত হিসাব</p></div>
  <div class="summary-grid total-summary">
    <article><span>মোট জমা</span><strong>${money(deposit)}</strong></article>
    <article><span>মোট লভ্যাংশ</span><strong>${money(profit)}</strong></article>
    <article><span>মোট বিবিধ খরচ</span><strong>${money(expense)}</strong></article>
    <article class="highlight"><span>অবশিষ্ট তহবিল</span><strong>${money(remaining)}</strong></article>
  </div>`;
}
function remainingDividend(){return Math.max(totalProfit('all')-totalExpense('all'),0)}
function memberDividend(m){
  const total=totalPaid('all');
  if(total<=0)return 0;
  return remainingDividend()*(memberPaid(m,'all')/total);
}
function isDividendPublic(memberId){
  const row=dividendVisibility.find(x=>String(x.member_id)===String(memberId));
  return !!row?.is_public;
}
function renderDividendSummary(){
  const profit=totalProfit('all'),expense=totalExpense('all'),remaining=remainingDividend();
  return `<div class="detail-block dividend-summary"><div class="detail-heading"><span>💰</span><h3>লভ্যাংশের সংক্ষিপ্ত হিসাব</h3></div><div class="table-wrap"><table class="detail-table fund-summary-table dividend-summary-table"><tbody>
    <tr><th>মোট লভ্যাংশ</th><td>${money(profit)}</td></tr>
    <tr><th>মোট খরচ</th><td>${money(expense)}</td></tr>
    <tr class="highlight-row"><th>অবশিষ্ট লভ্যাংশ</th><td><b>${money(remaining)}</b></td></tr>
  </tbody></table></div></div>`;
}

function renderProfitExpenseDetails(){
  const profitTotal=totalProfit('all'),expenseTotal=totalExpense('all');
  const profitRows=profits.slice().sort((a,b)=>Number(a.year)-Number(b.year)).map((x,i)=>`<tr><td>${(i+1).toLocaleString('bn-BD')}</td><td>${esc(x.year)}</td><td class="detail-text">${esc(x.description||'-')}</td><td>${money(x.total_profit)}</td></tr>`).join('');
  const expenseRows=expenses.slice().sort((a,b)=>Number(a.year||0)-Number(b.year||0)).map((x,i)=>`<tr><td>${(i+1).toLocaleString('bn-BD')}</td><td>${esc(x.year)}</td><td class="detail-text">${esc(x.description||'-')}</td><td>${money(x.amount)}</td></tr>`).join('');
  q('profitExpenseDetailsResult').innerHTML=`
    <div class="detail-block profit-detail"><div class="detail-heading"><span>📈</span><h3>লভ্যাংশের বিস্তারিত বিবরণ</h3></div><div class="table-wrap"><table class="detail-table"><thead><tr><th>ক্রমিক</th><th>সাল</th><th class="detail-text">বিবরণ</th><th>পরিমাণ</th></tr></thead><tbody>${profitRows||'<tr><td colspan="4">কোনো লভ্যাংশের তথ্য নেই।</td></tr>'}</tbody><tfoot><tr class="total-row"><td colspan="3">মোট লভ্যাংশ</td><td>${money(profitTotal)}</td></tr></tfoot></table></div></div>
    <div class="detail-block expense-detail"><div class="detail-heading"><span>🧾</span><h3>খরচের বিস্তারিত বিবরণ</h3></div><div class="table-wrap"><table class="detail-table"><thead><tr><th>ক্রমিক</th><th>সাল</th><th class="detail-text">বিবরণ</th><th>পরিমাণ</th></tr></thead><tbody>${expenseRows||'<tr><td colspan="4">কোনো খরচের তথ্য নেই।</td></tr>'}</tbody><tfoot><tr class="total-row"><td colspan="3">মোট খরচ</td><td>${money(expenseTotal)}</td></tr></tfoot></table></div></div>
    ${renderDividendSummary()}
    `;
}
function renderFund(){
  const deposit=totalPaid('all'),profit=totalProfit('all'),expense=totalExpense('all'),allocated=totalAssets('all'),remaining=currentFund();
  const body=assets.map((a,i)=>`<tr><td>${(i+1).toLocaleString('bn-BD')}</td><td>${esc(a.year)}</td><td>${esc(a.category)}</td><td class="detail-text">${esc(a.description)}</td><td>${money(a.amount)}</td><td>${esc(a.date||'')}</td></tr>`).join('');
  q('fundResult').innerHTML=`<div class="report-title"><h3>তহবিল ব্যবহারের খাতসমূহ</h3><p>যে সকল খাতে তহবিল ব্যবহার করা হয়েছে</p></div>
  <div class="detail-block fund-detail"><div class="detail-heading"><span>🏦</span><h3>তহবিল ব্যবহারের খাতসমূহ</h3></div><div class="table-wrap"><table class="detail-table"><thead><tr><th>ক্রমিক</th><th>সাল</th><th>খাত</th><th class="detail-text">বিস্তারিত</th><th>পরিমাণ</th><th>তারিখ</th></tr></thead><tbody>${body||'<tr><td colspan="6">এখনও কোনো খাত যোগ করা হয়নি।</td></tr>'}</tbody><tfoot><tr class="total-row"><td colspan="4">বিভিন্ন খাতে ব্যবহার করা মোট</td><td>${money(allocated)}</td><td></td></tr></tfoot></table></div></div>
  <div class="detail-block fund-summary-detail"><div class="detail-heading"><span>💰</span><h3>তহবিলের সংক্ষিপ্ত হিসাব</h3></div><div class="table-wrap"><table class="detail-table fund-summary-table"><tbody>
    <tr><th>মোট অবশিষ্ট তহবিল</th><td>${money(remainingFund())}</td></tr><tr><th>বিভিন্ন খাতে ব্যবহার</th><td>${money(allocated)}</td></tr><tr class="highlight-row"><th>বর্তমান অবশিষ্ট তহবিল</th><td><b>${money(currentFund())}</b></td></tr>
  </tbody></table></div></div>`;
}
function renderNotices(){
  const html=notices.map(n=>`<article class="notice"><h3>${esc(n.title)}</h3><p>${esc(n.description)}</p><small>${esc(n.publish_date||'')}</small></article>`).join('');
  q('noticeResult').innerHTML=html||'<div class="empty-state">কোনো প্রকাশিত নোটিশ নেই।</div>';
}
function showMessage(text,ok=false,target='adminMsg'){const el=q(target);if(!el)return;el.textContent=text;el.className='message '+(ok?'success':'error')}
function resetForm(id){const f=q(id);if(!f)return;f.reset();const h=f.querySelector('[name=id]');if(h)h.value=''}
async function saveOrUpdate(table,form,make){const d=Object.fromEntries(new FormData(form).entries()),id=d.id,row=make(d);const res=id?await sb.from(table).update(row).eq('id',id):await sb.from(table).insert(row);if(res.error){showMessage(res.error.message,false);return false}showMessage('সফলভাবে সংরক্ষণ হয়েছে ✓',true);resetForm(form.id);await load();return true}
async function saveMember(){
  const f=q('memberForm'),d=Object.fromEntries(new FormData(f).entries()),id=d.id;
  const maxSerial=members.reduce((mx,m)=>Math.max(mx,Number(m.serial_no)||0),0);
  const row={name:d.name.trim(),address:d.address?.trim()||null,mobile:d.mobile||null,status:'active'};
  if(!id) row.serial_no=maxSerial+1;
  const res=id?await sb.from('members').update(row).eq('id',id).select('*').maybeSingle():await sb.from('members').insert(row).select('*').maybeSingle();
  if(res.error){showMessage(res.error.message,false);return false}
  if(res.data){
    const idx=members.findIndex(m=>String(m.id)===String(res.data.id));
    if(idx>=0) members[idx]=res.data; else members.push(res.data);
    fillMemberSelectors();
  }
  showMessage('সদস্য সফলভাবে সংরক্ষণ হয়েছে ✓',true);resetForm('memberForm');
  await load();
  return true;
}
async function savePayment(){
  const f=q('paymentForm'),d=Object.fromEntries(new FormData(f).entries());
  const typedYear=normalizeYear(d.year);
  if(!/^\d{4}$/.test(typedYear)){showMessage('সঠিক ৪ সংখ্যার সাল লিখুন, যেমন ২০২১ বা ২০২৩।',false);return}
  f.year.value=typedYear;
  const startMonth=Number(d.month),monthCount=Math.max(1,Number(d.month_count||1)),totalAmount=Number(d.paid_amount||0),year=Number(typedYear);
  const monthlyRate=monthCount>0?totalAmount/monthCount:monthlyRequired();
  if(!(monthlyRate>0)){showMessage('মাসিক জমার পরিমাণ সঠিকভাবে দিন।',false);return}
  if(!d.id && startMonth+monthCount-1>12){showMessage('নির্বাচিত মাস থেকে যত মাস দিয়েছেন তা একই বছরের ডিসেম্বরের মধ্যে হতে হবে।',false);return}
  if(d.id){
    const row={member_id:d.member_id,year,month:startMonth,required_amount:monthlyRate,paid_amount:totalAmount,payment_date:null};
    const res=await sb.from('payments').update(row).eq('id',d.id);
    if(res.error){showMessage(res.error.message,false);return}
    showMessage('মাসিক জমা সংরক্ষণ হয়েছে ✓',true);resetForm('paymentForm');await load();return;
  }
  const monthList=Array.from({length:monthCount},(_,i)=>startMonth+i);
  const existing=await sb.from('payments').select('id,month,paid_amount').eq('member_id',d.member_id).eq('year',year).in('month',monthList);
  if(existing.error){showMessage(existing.error.message,false);return}
  const existingRows=existing.data||[];
  const paidExisting=existingRows.filter(x=>Number(x.paid_amount||0)>0);
  if(paidExisting.length){
    const names=paidExisting.map(x=>months[Number(x.month)-1]).join(', ');
    showMessage(`এই সদস্যের ${year} সালের ${names} মাসের জমা আগে থেকেই আছে। কোনো তথ্য পরিবর্তন করা হয়নি।`,false);return;
  }
  const totalCents=Math.round(totalAmount*100),baseCents=Math.floor(totalCents/monthCount),remainder=totalCents-baseCents*monthCount;
  const updateRows=[],insertRows=[];
  monthList.forEach((month,i)=>{
    const amount=(baseCents+(i===monthCount-1?remainder:0))/100;
    const found=existingRows.find(x=>Number(x.month)===month);
    const row={member_id:d.member_id,year,month,required_amount:monthlyRate,paid_amount:amount,payment_date:null};
    if(found) updateRows.push({id:found.id,row});
    else insertRows.push(row);
  });
  for(const item of updateRows){
    const res=await sb.from('payments').update(item.row).eq('id',item.id);
    if(res.error){showMessage(res.error.message,false);return}
  }
  if(insertRows.length){
    const res=await sb.from('payments').insert(insertRows);
    if(res.error){showMessage(res.error.message,false);return}
  }
  showMessage(`${monthCount} মাসের জমা একসাথে সংরক্ষণ হয়েছে ✓`,true);resetForm('paymentForm');await load();
}
async function saveProfit(){
  const d=Object.fromEntries(new FormData(q('profitForm')).entries());
  const typedYear=normalizeYear(d.year);
  if(!/^\d{4}$/.test(typedYear)){showMessage('সঠিক ৪ সংখ্যার সাল লিখুন, যেমন ২০২১ বা ২০২৩।',false);return}
  const row={year:Number(typedYear),description:d.description.trim(),total_profit:+d.total_profit};
  const res=d.id?await sb.from('profits').update(row).eq('id',d.id):await sb.from('profits').insert(row).select('*').maybeSingle();
  if(res.error){showMessage(res.error.message,false);return}
  showMessage('লভ্যাংশ সংরক্ষণ হয়েছে ✓',true);resetForm('profitForm');await load();
}
async function saveExpense(){
  const d=Object.fromEntries(new FormData(q('expenseForm')).entries());
  const typedYear=normalizeYear(d.year);
  if(!/^\d{4}$/.test(typedYear)){showMessage('সঠিক ৪ সংখ্যার সাল লিখুন, যেমন ২০২১ বা ২০২৩।',false);return}
  const row={year:Number(typedYear),description:d.description.trim(),amount:+d.amount};
  const res=d.id?await sb.from('expenses').update(row).eq('id',d.id):await sb.from('expenses').insert(row);
  if(res.error){showMessage(res.error.message,false);return}
  showMessage('সফলভাবে সংরক্ষণ হয়েছে ✓',true);resetForm('expenseForm');await load();
}
async function saveAsset(){await saveOrUpdate('assets',q('assetForm'),d=>({year:+d.year,date:d.date,category:d.category.trim(),description:d.description.trim(),amount:+d.amount,status:'active'}))}
async function saveNotice(){await saveOrUpdate('notices',q('noticeForm'),d=>({title:d.title.trim(),description:d.description.trim(),status:'published'}))}
async function del(table,id){if(!confirm('এই তথ্যটি মুছে ফেলতে চান?'))return;const {error}=await sb.from(table).delete().eq('id',id);if(error){showMessage(error.message,false);return}showMessage('তথ্য মুছে ফেলা হয়েছে ✓',true);await load()}
function editMember(id){const m=members.find(x=>String(x.id)===String(id));if(!m)return;const f=q('memberForm');f.id.value=m.id;f.name.value=m.name;f.address.value=m.address||'';f.mobile.value=m.mobile||'';openForm('member');f.scrollIntoView({behavior:'smooth',block:'start'})}
function editPayment(id){const p=payments.find(x=>String(x.id)===String(id));if(!p)return;const f=q('paymentForm');f.id.value=p.id;f.member_id.value=p.member_id;f.year.value=p.year;f.month.value=p.month;if(f.month_count)f.month_count.value=1;f.paid_amount.value=p.paid_amount;openForm('payment');f.scrollIntoView({behavior:'smooth',block:'start'})}
function editProfit(id){const x=profits.find(x=>String(x.id)===String(id));if(!x)return;const f=q('profitForm');f.id.value=x.id;f.year.value=x.year;f.description.value=x.description||'';f.total_profit.value=x.total_profit;openForm('profit');f.scrollIntoView({behavior:'smooth',block:'start'})}
function editExpense(id){const x=expenses.find(x=>String(x.id)===String(id));if(!x)return;const f=q('expenseForm');f.id.value=x.id;f.year.value=x.year;f.description.value=x.description;f.amount.value=x.amount;openForm('expense');f.scrollIntoView({behavior:'smooth',block:'start'})}
function editAsset(id){const x=assets.find(x=>String(x.id)===String(id));if(!x)return;const f=q('assetForm');f.id.value=x.id;f.year.value=x.year;f.date.value=x.date;f.category.value=x.category;f.description.value=x.description;f.amount.value=x.amount;openForm('asset');f.scrollIntoView({behavior:'smooth',block:'start'})}
function editNotice(id){const x=notices.find(x=>String(x.id)===String(id));if(!x)return;const f=q('noticeForm');f.id.value=x.id;f.title.value=x.title;f.description.value=x.description;openForm('notice');f.scrollIntoView({behavior:'smooth',block:'start'})}
function renderAdminData(){
  const orderedMembers=members.slice().sort(memberSort);
  q('adminMembers').innerHTML=`<table><thead><tr><th>ক্রম</th><th class="name">নাম</th><th>মোবাইল</th><th>অ্যাকশন</th></tr></thead><tbody>`+orderedMembers.map((m,i)=>`<tr><td>${Number(m.serial_no||i+1).toLocaleString('bn-BD')}</td><td class="name">${esc(m.name)}</td><td>${esc(m.mobile||'-')}</td><td class="row-actions"><button class="small-btn edit" onclick="editMember('${esc(m.id)}')">Edit</button><button class="small-btn del" onclick="del('members','${esc(m.id)}')">Delete</button></td></tr>`).join('')+`</tbody></table>`;
  const selectedYear=q('paymentManageYear').value||'all';
  const selectedMonth=q('paymentManageMonth')?.value||'all';
  const selectedMember=q('paymentManageMember')?.value||'';
  const paymentRows=payments.filter(p=>{
    // ০ টাকার placeholder record database-এ থাকবে, কিন্তু Excel-এর প্রকৃত জমার
    // তালিকার সঙ্গে মিল রেখে Admin management-এ শুধু বাস্তব জমা দেখানো হবে।
    if(Number(p.paid_amount||0)<=0)return false;
    if(selectedYear!=='all' && String(p.year)!==String(selectedYear))return false;
    if(selectedMonth!=='all' && Number(p.month)!==Number(selectedMonth))return false;
    if(selectedMember && String(p.member_id)!==String(selectedMember))return false;
    return true;
  }).slice().sort((a,b)=>{
    const ma=members.find(m=>String(m.id)===String(a.member_id))||{};
    const mb=members.find(m=>String(m.id)===String(b.member_id))||{};
    return memberSort(ma,mb)||Number(a.year)-Number(b.year)||Number(a.month)-Number(b.month);
  });
  q('adminPayments').innerHTML=`<table><thead><tr><th>ক্রম</th><th class="name">সদস্য</th><th>সাল</th><th>মাস</th><th>জমা</th><th>অ্যাকশন</th></tr></thead><tbody>`+paymentRows.map((p,i)=>{const m=members.find(x=>String(x.id)===String(p.member_id))||{};return `<tr><td>${Number(m.serial_no||i+1).toLocaleString('bn-BD')}</td><td class="name">${esc(m.name||'')}</td><td>${esc(p.year)}</td><td>${months[Number(p.month)-1]||''}</td><td>${money(p.paid_amount)}</td><td class="row-actions"><button class="small-btn edit" onclick="editPayment('${esc(p.id)}')">Edit</button><button class="small-btn del" onclick="del('payments','${esc(p.id)}')">Delete</button></td></tr>`}).join('')+`</tbody></table>`;
  q('adminProfits').innerHTML=`<table><thead><tr><th>বছর</th><th class="name">বিবরণ</th><th>মোট লভ্যাংশ</th><th>অ্যাকশন</th></tr></thead><tbody>`+profits.map(x=>`<tr><td>${esc(x.year)}</td><td class="name">${esc(x.description||'')}</td><td>${money(x.total_profit)}</td><td class="row-actions"><button class="small-btn edit" onclick="editProfit('${esc(x.id)}')">Edit</button><button class="small-btn del" onclick="del('profits','${esc(x.id)}')">Delete</button></td></tr>`).join('')+`</tbody></table>`;
  q('adminExpenses').innerHTML=`<table><thead><tr><th>বছর</th><th class="name">বিবরণ</th><th>পরিমাণ</th><th>অ্যাকশন</th></tr></thead><tbody>`+expenses.map(x=>`<tr><td>${esc(x.year)}</td><td class="name">${esc(x.description)}</td><td>${money(x.amount)}</td><td class="row-actions"><button class="small-btn edit" onclick="editExpense('${esc(x.id)}')">Edit</button><button class="small-btn del" onclick="del('expenses','${esc(x.id)}')">Delete</button></td></tr>`).join('')+`</tbody></table>`;
  q('adminAssets').innerHTML=`<table><thead><tr><th>বছর</th><th>খাত</th><th class="name">বিবরণ</th><th>পরিমাণ</th><th>অ্যাকশন</th></tr></thead><tbody>`+assets.map(x=>`<tr><td>${esc(x.year)}</td><td>${esc(x.category)}</td><td class="name">${esc(x.description)}</td><td>${money(x.amount)}</td><td class="row-actions"><button class="small-btn edit" onclick="editAsset('${esc(x.id)}')">Edit</button><button class="small-btn del" onclick="del('assets','${esc(x.id)}')">Delete</button></td></tr>`).join('')+`</tbody></table>`;
  q('adminNotices').innerHTML=`<table><thead><tr><th>শিরোনাম</th><th class="name">বিবরণ</th><th>তারিখ</th><th>অ্যাকশন</th></tr></thead><tbody>`+notices.map(x=>`<tr><td>${esc(x.title)}</td><td class="name">${esc(x.description)}</td><td>${esc(x.publish_date||'')}</td><td class="row-actions"><button class="small-btn edit" onclick="editNotice('${esc(x.id)}')">Edit</button><button class="small-btn del" onclick="del('notices','${esc(x.id)}')">Delete</button></td></tr>`).join('')+`</tbody></table>`;
  q('adminDividends').innerHTML=`<div class="dividend-admin-tools"><button type="button" class="btn btn-primary" onclick="makeAllDividendsPublic()">🟢 সকল সদস্যের লভ্যাংশ Public করুন</button></div><div class="dividend-admin-tools"><button type="button" class="btn danger" onclick="makeAllDividendsHidden()">🔴 সকল সদস্যের লভ্যাংশ Hide করুন</button></div><table><thead><tr><th>ক্রমিক</th><th class="name">সদস্য</th><th>সকল বছরের জমা</th><th>লভ্যাংশ</th><th>অবস্থা</th><th>অ্যাকশন</th></tr></thead><tbody>`+orderedMembers.map((m,i)=>{const pub=isDividendPublic(m.id);return `<tr><td>${Number(m.serial_no||i+1).toLocaleString('bn-BD')}</td><td class="name">${esc(m.name||'')}</td><td>${money(memberPaid(m,'all'))}</td><td>${money(memberDividend(m))}</td><td>${pub?'Public':'Hidden'}</td><td class="row-actions"><button class="small-btn ${pub?'del':'edit'}" onclick="toggleDividendVisibility('${esc(m.id)}',${!pub})">${pub?'Hide':'Public'}</button></td></tr>`}).join('')+`</tbody></table>`;

  fillSettingsForm();
}
async function checkAdmin(){if(!sb)return;try{const {data:{session},error:sessionError}=await sb.auth.getSession();if(sessionError)throw sessionError;adminUser=session?.user||null;if(!adminUser){q('loginBox').hidden=false;q('adminBox').hidden=true;return}const {data,error}=await sb.from('admin_users').select('user_id').eq('user_id',adminUser.id).maybeSingle();if(error||!data){q('loginBox').hidden=false;q('adminBox').hidden=true;q('loginMsg').textContent=error?'অ্যাডমিন অনুমতি যাচাই করা যায়নি।':'এই অ্যাকাউন্টে অ্যাডমিন অনুমতি নেই।';return}q('loginBox').hidden=true;q('adminBox').hidden=false;q('adminUser').textContent=adminUser.email||'Admin';if(dataLoaded)await renderAdminData()}catch(error){console.error('Admin check failed:',error);adminUser=null;q('loginBox').hidden=false;q('adminBox').hidden=true;showMessage(formatSupabaseAuthError(error),false,'loginMsg')}}
function formatSupabaseAuthError(error){const message=String(error?.message||error||'').trim();const status=Number(error?.status||0);if(error?.name==='AbortError')return 'Supabase উত্তর দিতে বেশি সময় নিচ্ছে। Internet বা Supabase Project connection পরীক্ষা করুন।';if(!message)return 'Supabase-এর সাথে সংযোগ করা যাচ্ছে না।';if(status===429)return 'অনেকবার চেষ্টা হয়েছে। কিছুক্ষণ পর আবার চেষ্টা করুন।';if(status===400)return /invalid login credentials/i.test(message)?'ইমেইল বা পাসওয়ার্ড সঠিক নয়।':'Supabase Auth request গ্রহণ করেনি: '+message;if(status>=500)return 'Supabase Auth সার্ভার থেকে উত্তর পাওয়া যাচ্ছে না। Project-এর Auth service পরীক্ষা করুন।';if(/failed to fetch|network|fetch|cors|load failed/i.test(message))return 'Supabase Auth request পাঠানো যাচ্ছে না। Internet, Project URL/Publishable Key, অথবা Auth service পরীক্ষা করুন।';return message}
async function login(){if(!sb){showMessage('Supabase configuration পাওয়া যায়নি।',false,'loginMsg');return}const email=q('adminEmail').value.trim();const password=q('adminPassword').value;if(!email||!password){showMessage('ইমেইল ও পাসওয়ার্ড দিন।',false,'loginMsg');return}const btn=q('loginBtn');if(btn){btn.disabled=true;btn.dataset.oldText=btn.textContent;btn.textContent='লগইন হচ্ছে...'}showMessage('লগইন হচ্ছে...',true,'loginMsg');try{const {data,error}=await sb.auth.signInWithPassword({email,password});if(error){showMessage(formatSupabaseAuthError(error),false,'loginMsg');return}adminUser=data?.user||null;q('loginBox').hidden=true;q('adminBox').hidden=false;q('adminUser').textContent=adminUser?.email||email;showMessage('লগইন সফল হয়েছে।',true,'loginMsg');if(!dataLoaded){showMessage('তথ্য লোড হচ্ছে, অনুগ্রহ করে এক মুহূর্ত অপেক্ষা করুন।',true,'loginMsg');}else await renderAdminData();q('adminPassword').value=''}catch(error){console.error('Admin login failed:',error);showMessage(formatSupabaseAuthError(error),false,'loginMsg')}finally{if(btn){btn.disabled=false;btn.textContent=btn.dataset.oldText||'লগইন'}}}
async function logout(){await sb.auth.signOut();location.hash='admin';location.reload()}
function openForm(name){document.querySelectorAll('.admin-form').forEach(f=>f.classList.remove('active'));const f=q(name+'Form');if(f)f.classList.add('active')}
async function toggleDividendVisibility(memberId,isPublic){
  const row={member_id:memberId,is_public:isPublic};
  const existing=dividendVisibility.find(x=>String(x.member_id)===String(memberId));
  const res=existing?await sb.from('member_dividend_visibility').update({is_public:isPublic}).eq('member_id',memberId):await sb.from('member_dividend_visibility').insert(row);
  if(res.error){showMessage(res.error.message,false);return}
  const idx=dividendVisibility.findIndex(x=>String(x.member_id)===String(memberId));
  if(idx>=0)dividendVisibility[idx].is_public=isPublic; else dividendVisibility.push(row);
  renderPersonal();renderAllMembersPreview();renderAdminData();showMessage(isPublic?'সদস্যের লভ্যাংশ Public করা হয়েছে ✓':'সদস্যের লভ্যাংশ Hidden করা হয়েছে ✓',true);
}
async function makeAllDividendsPublic(){
  if(!adminUser){showMessage('অ্যাডমিন হিসেবে লগইন করুন।',false);return}
  if(!members.length){showMessage('কোনো সক্রিয় সদস্য পাওয়া যায়নি।',false);return}
  if(!confirm('সকল সদস্যের লভ্যাংশ Public করতে চান?'))return;
  const rows=members.map(m=>({member_id:m.id,is_public:true}));
  const res=await sb.from('member_dividend_visibility').upsert(rows,{onConflict:'member_id'});
  if(res.error){showMessage(res.error.message,false);return}
  dividendVisibility=members.map(m=>({member_id:m.id,is_public:true}));
  renderPersonal();renderAllMembersPreview();renderAdminData();
  showMessage('সকল সদস্যের লভ্যাংশ Public করা হয়েছে ✓',true);
}
async function makeAllDividendsHidden(){
  if(!adminUser){showMessage('অ্যাডমিন হিসেবে লগইন করুন।',false);return}
  if(!members.length){showMessage('কোনো সক্রিয় সদস্য পাওয়া যায়নি।',false);return}
  if(!confirm('সকল সদস্যের লভ্যাংশ Hide করতে চান?'))return;
  const rows=members.map(m=>({member_id:m.id,is_public:false}));
  const res=await sb.from('member_dividend_visibility').upsert(rows,{onConflict:'member_id'});
  if(res.error){showMessage(res.error.message,false);return}
  dividendVisibility=members.map(m=>({member_id:m.id,is_public:false}));
  renderPersonal();renderAllMembersPreview();renderAdminData();
  showMessage('সকল সদস্যের লভ্যাংশ Hidden করা হয়েছে ✓',true);
}
function openManagement(name){document.querySelectorAll('.admin-data').forEach(x=>x.classList.remove('active'));q('managementArea').style.display='block';const target=q('manage'+name.charAt(0).toUpperCase()+name.slice(1));if(target)target.classList.add('active');renderAdminData()}
function setMenu(open){const menu=q('mobileMenu'),overlay=q('menuOverlay'),btn=q('menuBtn');menu.classList.toggle('open',open);overlay.classList.toggle('show',open);btn.setAttribute('aria-expanded',String(open));document.body.classList.toggle('menu-open',open)}
function openMainMenu(){setMenu(true)}
function route(){const id=(location.hash||'#personal').slice(1);const valid=['personal','members','due','profitExpenseDetails','fund','notices','admin'];const enabled=new Set((appSettings.menu||[]).filter(x=>x.enabled).map(x=>x.id));const active=valid.includes(id)&&enabled.has(id)?id:(enabled.has('personal')?'personal':'admin');document.querySelectorAll('.page-section').forEach(s=>s.classList.toggle('active',s.id===active));document.querySelectorAll('#mobileMenu a[data-view]').forEach(a=>a.classList.toggle('active',a.dataset.view===active));setMenu(false)}
function printSection(id){
  const target=q(id);
  if(!target)return;

  // Build a dedicated report-only print root directly under <body>.
  // Android Chrome can snapshot the normal page if the print DOM is nested
  // inside <main>, so the non-report body children are also hidden inline.
  document.querySelectorAll('.print-section').forEach(x=>x.remove());

  const printSectionEl=document.createElement('section');
  printSectionEl.id='__printRoot';
  printSectionEl.className='print-section';
  const clone=target.cloneNode(true);
  clone.removeAttribute('id');
  clone.classList.add('print-target');
  clone.querySelectorAll('.result-print').forEach(x=>x.remove());

  if(id==='personalResult'){
    const summary=clone.querySelector('.compact-summary');
    const details=clone.querySelector('.personal-print-details');
    if(summary&&details)details.after(summary);
  }

  const header=document.createElement('div');
  header.className='print-header-generated';
  header.innerHTML='<h1>স্বপ্ননীড় উলামা সংঘ</h1><p>মোমেনশাহী, ঢাকা, বাংলাদেশ</p>';
  clone.prepend(header);
  printSectionEl.appendChild(clone);
  document.body.appendChild(printSectionEl);

  const bodyChildren=Array.from(document.body.children);
  const hiddenChildren=[];
  bodyChildren.forEach(el=>{
    if(el===printSectionEl)return;
    hiddenChildren.push({el,display:el.style.display});
    el.style.display='none';
  });
  printSectionEl.style.display='block';
  document.body.classList.add('printing-report');

  let cleaned=false;
  const cleanup=()=>{
    if(cleaned)return;
    cleaned=true;
    hiddenChildren.forEach(item=>{item.el.style.display=item.display});
    try{printSectionEl.remove()}catch(e){}
    document.body.classList.remove('printing-report');
  };

  const waitForReady=async()=>{
    try{if(document.fonts&&document.fonts.ready)await document.fonts.ready}catch(e){}
    const images=Array.from(clone.querySelectorAll('img'));
    await Promise.all(images.map(img=>{
      if(img.complete)return Promise.resolve();
      return new Promise(resolve=>{
        const done=()=>{img.removeEventListener('load',done);img.removeEventListener('error',done);resolve()};
        img.addEventListener('load',done,{once:true});
        img.addEventListener('error',done,{once:true});
      });
    }));
    await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
  };

  waitForReady().then(()=>{
    void printSectionEl.offsetHeight;
    setTimeout(()=>{
      try{
        window.focus();
        window.print();
        // Keep the print-only DOM alive briefly because Android Chrome may
        // fire afterprint before its preview snapshot has fully completed.
        setTimeout(cleanup,12000);
      }catch(e){
        cleanup();
        showMessage('PDF/Print চালু করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।',false);
      }
    },500);
  });
}

function reportShell(title,subtitle,body,landscape=false){
  return `<!doctype html><html lang="bn"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(title)}</title><style>
  *{box-sizing:border-box}body{margin:0;padding:24px;background:#fff;color:#17221f;font-family:Arial,"Noto Sans Bengali","Noto Sans",sans-serif}
  .report{max-width:${landscape?'1400px':'900px'};margin:0 auto}.head{text-align:center;margin-bottom:18px}.head h1{margin:0;font-size:28px;font-weight:800}.head p{margin:5px 0 0;font-size:13px;color:#65736e}.title{text-align:center;margin-bottom:18px}.title h2{margin:0 0 5px;font-size:22px}.title p{margin:0;font-size:13px;color:#65736e}
  .meta{display:grid;grid-template-columns:2fr 1fr;gap:10px;margin-bottom:14px}.meta>div{border:1px solid #d6e2dd;padding:8px 10px;border-radius:6px}.meta span{display:block;font-size:11px;color:#687772}.meta strong{display:block;margin-top:2px;font-size:14px}
  .table-wrap{width:100%;overflow-x:auto;-webkit-overflow-scrolling:touch}table{width:max-content;min-width:100%;border-collapse:collapse;table-layout:auto;background:#fff}th,td{border:1px solid #c9d6d1;text-align:center;padding:6px 5px;font-size:12px;line-height:1.3;white-space:nowrap;overflow:visible;text-overflow:clip;overflow-wrap:normal;word-break:normal;vertical-align:middle}th{font-weight:800;background:#f0f6f3}td.name,th.name{text-align:left;white-space:nowrap;overflow:visible;text-overflow:clip;overflow-wrap:normal;word-break:normal}.total-row td{font-weight:800;background:#f6faf8}.personal-report-table th,.personal-report-table td{padding:8px 5px;line-height:1.45}.all-years-report-table,.monthly-report-table{table-layout:auto!important;width:max-content!important;min-width:100%!important}.all-years-report-table col.equal-col,.monthly-report-table col.equal-col,.all-years-report-table col.serial-col,.monthly-report-table col.serial-col,.all-years-report-table col.name-col,.monthly-report-table col.name-col{width:auto!important}.personal-all-years-table{table-layout:fixed!important;width:max-content!important;min-width:794px!important}.personal-all-years-table .serial-col{width:45px}.personal-all-years-table .year-col{width:45px}.personal-all-years-table .month-col{width:47px}.personal-all-years-table .total-col{width:70px}.personal-all-years-table .due-col{width:70px}.personal-all-years-table th,.personal-all-years-table td{white-space:nowrap;overflow:visible;text-overflow:clip}
  @media print{ @page{size:A4 landscape;margin:6mm} body{padding:0!important} .report{max-width:none!important;width:100%!important} .table-wrap{overflow:visible!important} .personal-all-years-table{width:100%!important;min-width:0!important;table-layout:fixed!important} .personal-all-years-table .serial-col{width:6%!important}.personal-all-years-table .year-col{width:6%!important}.personal-all-years-table .month-col{width:5.4%!important}.personal-all-years-table .total-col{width:7%!important}.personal-all-years-table .due-col{width:7%!important} .personal-all-years-table th,.personal-all-years-table td{font-size:8px!important;padding:3px 2px!important;line-height:1.1!important} .personal-all-years-table th{font-weight:800!important} }
  .summary{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:16px}.summary>div{border:1px solid #cfded8;border-radius:7px;padding:9px;text-align:center;background:#f7fbf9}.summary span{display:block;font-size:11px;color:#63716c}.summary strong{display:block;margin-top:3px;font-size:17px}
  .download-note{margin-top:16px;text-align:center;font-size:11px;color:#687772}@media(max-width:600px){body{padding:12px}.head h1{font-size:22px}.title h2{font-size:18px}.meta{grid-template-columns:1fr}.report{max-width:none}th,td{font-size:11px;padding:5px 4px}}
</style></head><body><main class="report"><div class="head"><h1>স্বপ্ননীড় উলামা সংঘ</h1><p>মোমেনশাহী, ঢাকা, বাংলাদেশ</p></div><div class="title"><h2>${esc(title)}</h2><p>${esc(subtitle)}</p></div>${body}</main></body></html>`;
}
function downloadHtmlFile(filename,html){
  const blob=new Blob([html],{type:'text/html;charset=utf-8'});
  const url=URL.createObjectURL(blob);
  const a=document.createElement('a');a.href=url;a.download=filename;a.rel='noopener';document.body.appendChild(a);a.click();a.remove();
  setTimeout(()=>URL.revokeObjectURL(url),2000);
}
function downloadPersonalReport(){
  const y=q('personalYear').value,id=q('personalMember').value;
  if(!y||!id){showMessage('আগে সাল ও সদস্য নির্বাচন করে অনুসন্ধান করুন।',false);return;}
  const m=members.find(x=>String(x.id)===String(id));if(!m)return;
  const detailYears=selectedYears(y);
  const title=`${m.name} — ব্যক্তিগত হিসাব`;
  const subtitle=y==='all'?'সকল বছরের বিস্তারিত মাসভিত্তিক হিসাব':`${y} সালের বিস্তারিত মাসভিত্তিক হিসাব`;
  const paidTotal=memberPaid(m,y), dueTotal=memberDue(m,y);
  const dividend=memberDividend(m);
  const grandTotal=paidTotal+dividend;
  const summary=y==='all'
    ? `<div class="summary"><div><span>মোট পরিশোধ</span><strong>${money(paidTotal)}</strong></div><div><span>মোট বাকি</span><strong>${money(dueTotal)}</strong></div><div><span>মোট লভ্যাংশ</span><strong>${money(dividend)}</strong></div><div><span>সর্বমোট প্রাপ্য</span><strong>${money(grandTotal)}</strong></div></div>`
    : `<div class="summary"><div><span>মোট পরিশোধ</span><strong>${money(paidTotal)}</strong></div><div><span>মোট বাকি</span><strong>${money(dueTotal)}</strong></div></div>`;
  let body;
  if(y==='all'){
    const allRows=detailYears.map((yr,rowIdx)=>{
      const monthCells=months.map((monthName,idx)=>{
        const paid=memberMonthPaid(m,yr,idx+1);
        return `<td>${paid>0?Number(paid).toLocaleString('bn-BD'):''}</td>`;
      }).join('');
      const yearPaid=memberPaid(m,yr),yearDue=memberDue(m,yr);
      return `<tr><td>${Number(rowIdx+1).toLocaleString('bn-BD')}</td><td>${esc(yr)}</td>${monthCells}<td>${Number(yearPaid).toLocaleString('bn-BD')}</td><td>${Number(yearDue).toLocaleString('bn-BD')}</td></tr>`;
    }).join('');
    body=`<div class="table-wrap"><table class="personal-report-table personal-all-years-table"><colgroup><col class="serial-col"><col class="year-col">${months.map(()=>'<col class="month-col">').join('')}<col class="total-col"><col class="due-col"></colgroup><thead><tr><th>ক্রমিক নং</th><th>সাল</th>${months.map(monthName=>`<th>${monthName}</th>`).join('')}<th>মোট পরিশোধ</th><th>মোট বাকি</th></tr></thead><tbody>${allRows}</tbody></table></div>${summary}`;
  }else{
    const detailRows=detailYears.flatMap(yr=>months.map((monthName,idx)=>{
      const paid=memberMonthPaid(m,yr,idx+1),due=Math.max(monthlyRequired()-paid,0);
      return `<tr><td>${esc(yr)}</td><td>${monthName}</td><td>${paid>0?Number(paid).toLocaleString('bn-BD'):'০'}</td><td>${Number(due).toLocaleString('bn-BD')}</td></tr>`;
    })).join('');
    body=`<div class="table-wrap"><table class="personal-report-table"><thead><tr><th>সাল</th><th>মাস</th><th>পরিশোধ</th><th>বাকি</th></tr></thead><tbody>${detailRows}</tbody></table></div>${summary}`;
  }
  downloadHtmlFile(`personal-${String(y).replace(/[^0-9a-zA-Z_-]/g,'')}-${String(m.name).replace(/[^\u0980-\u09FFa-zA-Z0-9_-]+/g,'-')}.html`,reportShell(title,subtitle,body,false));
}
function downloadAllMembersReport(){
  const y=q('allMembersYear').value||'all';
  if(!y){showMessage('আগে একটি সাল নির্বাচন করে হিসাব দেখুন।',false);return;}
  if(y==='all'){
    let rows='';
    members.forEach((m,i)=>{rows+=`<tr><td>${Number(m.serial_no||i+1).toLocaleString('bn-BD')}</td><td class="name">${esc(m.name)}</td>`+years.map(v=>`<td>${memberPaid(m,v)>0?Number(memberPaid(m,v)).toLocaleString('bn-BD'):''}</td>`).join('')+`<td>${Number(memberPaid(m,'all')).toLocaleString('bn-BD')}</td><td>${Number(memberDue(m,'all')).toLocaleString('bn-BD')}</td></tr>`});
    const totalCells=years.map(v=>`<td>${totalPaid(v)>0?Number(totalPaid(v)).toLocaleString('bn-BD'):''}</td>`).join('');
    const equalColWidth=(75/(years.length+2)).toFixed(4);
    const equalCols=years.length+2;
    const body=`<div class="table-wrap"><table class="all-years-report-table" style="--equal-col-width:${equalColWidth}%"><colgroup><col class="serial-col"><col class="name-col">${Array.from({length:equalCols},()=>'<col class="equal-col">').join('')}</colgroup><thead><tr><th>ক্রমিক</th><th class="name">সদস্যের নাম</th>${years.map(v=>`<th>${esc(v)}</th>`).join('')}<th>মোট পরিশোধ</th><th>মোট বাকি</th></tr></thead><tbody>${rows}</tbody><tfoot><tr class="total-row"><td colspan="2">সর্বমোট</td>${totalCells}<td>${Number(totalPaid('all')).toLocaleString('bn-BD')}</td><td>${Number(totalDue('all')).toLocaleString('bn-BD')}</td></tr></tfoot></table></div>`;
    downloadHtmlFile('all-members-all-years.html',reportShell('সকল বছরের সকল সদস্যদের হিসাব','সকল বছরের বিস্তারিত হিসাব',body,true));return;
  }
  let rows='';
  members.forEach((m,i)=>{rows+=`<tr><td>${Number(m.serial_no||i+1).toLocaleString('bn-BD')}</td><td class="name">${esc(m.name)}</td>`+months.map((_,mi)=>`<td>${paidCell(m,y,mi+1)}</td>`).join('')+`<td>${Number(memberPaid(m,y)).toLocaleString('bn-BD')}</td><td>${Number(memberDue(m,y)).toLocaleString('bn-BD')}</td></tr>`});
  const monthTotals=months.map((_,mi)=>{const x=payments.filter(p=>isCountablePayment(p)&&Number(normalizeYear(p.year))===Number(normalizeYear(y))&&Number(p.month)===mi+1).reduce((s,p)=>s+Number(p.paid_amount||0),0);return `<td>${x>0?Number(x).toLocaleString('bn-BD'):''}</td>`}).join('');
  const equalColWidth=(75/14).toFixed(4);
  const body=`<div class="table-wrap"><table class="monthly-report-table" style="--equal-col-width:${equalColWidth}%"><colgroup><col class="serial-col"><col class="name-col">${Array.from({length:14},()=>'<col class="equal-col">').join('')}</colgroup><thead><tr><th>ক্রমিক</th><th class="name">সদস্যের নাম</th>${months.map(m=>`<th>${m}</th>`).join('')}<th>মোট পরিশোধ</th><th>মোট বাকি</th></tr></thead><tbody>${rows}</tbody><tfoot><tr class="total-row"><td colspan="2">সর্বমোট</td>${monthTotals}<td>${Number(totalPaid(y)).toLocaleString('bn-BD')}</td><td>${Number(totalDue(y)).toLocaleString('bn-BD')}</td></tr></tfoot></table></div>`;
  downloadHtmlFile(`all-members-${y}.html`,reportShell(`${y} সালের সকল সদস্যদের হিসাব`,'প্রতি মাসে শুধু পরিশোধের পরিমাণ দেখানো হয়েছে',body,true));
}
function csvDownload(name,rows){const csv='\ufeff'+rows.map(r=>r.map(v=>`"${String(v??'').replaceAll('"','""')}"`).join(',')).join('\n');const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000)}
function downloadAllMembersCSV(){const y=q('allMembersYear').value||'all';const rows=[['ক্রমিক','সদস্যের নাম',...(y==='all'?years:months),'মোট পরিশোধ','মোট বাকি']];members.forEach((m,i)=>rows.push([m.serial_no||i+1,m.name,...(y==='all'?years.map(v=>memberPaid(m,v)):months.map((_,mi)=>payments.filter(p=>isCountablePayment(p)&&String(p.member_id)===String(m.id)&&Number(normalizeYear(p.year))===Number(normalizeYear(y))&&Number(p.month)===mi+1).reduce((s,p)=>s+Number(p.paid_amount||0),0))),memberPaid(m,y),memberDue(m,y)]));csvDownload(`members-${y}.csv`,rows)}
function downloadAssetsCSV(){csvDownload('fund-assets.csv',[['বছর','খাত','বিস্তারিত','পরিমাণ','তারিখ'],...assets.map(a=>[a.year,a.category,a.description,a.amount,a.date])])}

document.addEventListener('DOMContentLoaded',()=>{
  q('footerYear').textContent=new Date().getFullYear();
  q('menuBtn').addEventListener('click',()=>setMenu(true));q('menuClose').addEventListener('click',()=>setMenu(false));q('menuOverlay').addEventListener('click',()=>setMenu(false));document.querySelectorAll('#mobileMenu a').forEach(a=>a.addEventListener('click',()=>setMenu(false)));window.addEventListener('hashchange',route);
  q('personalForm').addEventListener('submit',e=>{e.preventDefault();renderPersonal()});q('membersForm').addEventListener('submit',e=>{e.preventDefault();renderAllMembers()});q('paymentManageYear').addEventListener('change',()=>renderAdminData());q('paymentManageMonth').addEventListener('change',()=>renderAdminData());q('paymentManageMember').addEventListener('change',()=>renderAdminData());
  q('loginBtn').addEventListener('click',login);q('logoutBtn').addEventListener('click',logout);
  q('addOpen').addEventListener('click',()=>{const value=q('addSelect').value;if(!value){showMessage('আগে একটি যুক্ত করার বিষয় নির্বাচন করুন।',false);return}openForm(value);q('addArea').scrollIntoView({behavior:'smooth',block:'start'})});
  q('manageOpen').addEventListener('click',()=>{const value=q('manageSelect').value;if(!value){showMessage('আগে একটি সম্পাদনার বিষয় নির্বাচন করুন।',false);return}openManagement(value);q('managementArea').scrollIntoView({behavior:'smooth',block:'start'})});
  q('saveWebSettings').addEventListener('click',saveWebSettings);q('resetWebSettings').addEventListener('click',resetWebSettings);q('logoFileInput').addEventListener('change',e=>uploadWebsiteLogo(e.target.files?.[0]||null));
  q('colorSettingsGrid').addEventListener('click',e=>{const b=e.target.closest('[data-open-color]');if(b)openColorPalette(b.dataset.openColor)});
  q('memberForm').addEventListener('submit',e=>{e.preventDefault();saveMember()});q('paymentForm').addEventListener('submit',e=>{e.preventDefault();savePayment()});q('profitForm').addEventListener('submit',e=>{e.preventDefault();saveProfit()});q('expenseForm').addEventListener('submit',e=>{e.preventDefault();saveExpense()});q('assetForm').addEventListener('submit',e=>{e.preventDefault();saveAsset()});q('noticeForm').addEventListener('submit',e=>{e.preventDefault();saveNotice()});
  applyWebSettings(DEFAULT_WEB_SETTINGS);
  route();
  // Never make startup wait for Supabase/database. The interface is usable immediately.
  hideLaunchScreen();
  // Give the browser one paint cycle before starting large database reads.
  setTimeout(()=>{ dataLoadPromise=load().then(()=>{if(adminUser&&dataLoaded)renderAdminData();}); },0);
  // Auth/session check runs independently of public-data loading.
  checkAdmin();
});
