import {Rig,buildRenderList,GlRenderer,ModelSchema} from './rev2d-web.js';
const host=document.querySelector('eileen-companion');
if(host&&!host.shadowRoot){const root=host.attachShadow({mode:'open'});root.innerHTML="<style>:host{--paper:#f6f3eb;--ink:#263d36;--line:#d8ddd3;--card:#fffdf8;color:var(--ink);font:14px/1.7 system-ui,sans-serif}:host([dark]){--paper:#1c2724;--ink:#e3e7dc;--line:#43534b;--card:#283630}*{box-sizing:border-box}[hidden]{display:none!important}button,input{font:inherit}button{cursor:pointer;border:0;border-radius:20px;color:inherit;background:transparent}button:focus-visible,input:focus-visible{outline:2px solid #b98b3d;outline-offset:2px}.pet{position:fixed;bottom:12px;left:30px;width:265px;height:330px;z-index:100;touch-action:none;cursor:grab;filter:drop-shadow(0 15px 15px #263d3622)}.pet:active{cursor:grabbing}.pet canvas{width:100%;height:100%;display:block}.bubble{position:absolute;bottom:305px;right:20px;width:220px;padding:13px 17px;background:var(--card);border:1px solid var(--line);border-radius:18px 18px 3px 18px;pointer-events:none;transition:opacity .3s}.bubble.hidden{opacity:0}.companion{position:fixed;width:min(300px,calc(100vw - 24px));z-index:101;background:var(--card);border:1px solid #b98b3d55;border-radius:22px 22px 5px 22px;box-shadow:0 12px 40px #263d361a;overflow:hidden}.companion-head{display:flex;align-items:center;justify-content:space-between;padding:13px 16px 0}.companion-head strong{font-size:13px}.companion-head strong:before{content:'✦';color:#b98b3d;margin-right:7px}.companion-head button{padding:0 7px;font-size:20px}.latest{padding:10px 17px 14px;max-height:180px;overflow:auto;white-space:pre-wrap}.companion form{display:flex;gap:8px;padding:10px 12px;border-top:1px solid #b98b3d22}.companion input{min-width:0;width:100%;border:0;border-radius:20px;background:var(--paper);color:var(--ink);padding:8px 11px;font-size:13px}.companion form button{flex-shrink:0;white-space:nowrap;background:var(--ink);color:var(--card);padding:5px 12px;font-size:13px}.panel{display:none}@media(max-width:650px){.pet{width:185px;height:235px;left:8px}.bubble{bottom:215px;right:5px;width:190px;font-size:13px}.latest{max-height:135px}}</style><section class=\"panel\" id=\"panel\" aria-label=\"管家对话\" hidden><div class=\"panel-head\"><div>✦ 船长的会客室<br><span>本地对话预览 · 聊天记录仅保留在当前页面</span></div><button id=\"close\" aria-label=\"收起完整对话\">↙</button></div><div class=\"messages\" id=\"messages\" role=\"log\" aria-live=\"polite\"><div class=\"message\">嗨，欢迎靠岸。我替 Eric 照看这里，闲聊不收泊位费。想聊点什么？</div></div><div class=\"choices\"><button data-say=\"你是谁？\">你是谁？</button><button data-say=\"有什么可以看看？\">随便逛逛</button><button data-say=\"我想请你代为传达\">请你代为传达</button></div><form id=\"chat\"><input aria-label=\"消息\" placeholder=\"和她说句话…\" maxlength=\"500\" autocomplete=\"off\"><button>发送</button></form></section>\n<section class=\"companion\" id=\"companion\" aria-label=\"和船长聊聊\" hidden><div class=\"companion-head\"><strong>艾琳在听</strong><button id=\"dismiss\" aria-label=\"收起气泡对话\">×</button></div><div class=\"latest\" id=\"latest\" role=\"status\">嗨，欢迎靠岸。我替 Eric 照看这里，闲聊不收泊位费。想聊点什么？</div><form id=\"quick-chat\"><input aria-label=\"气泡消息\" placeholder=\"和她说句话…\" maxlength=\"500\" autocomplete=\"off\"><button aria-label=\"发送气泡消息\">发送</button></form></section>\n<div class=\"pet\" id=\"pet\" role=\"button\" tabindex=\"0\" aria-label=\"打开管家对话，可拖动人物\"><div class=\"bubble\" id=\"bubble\">嗨，欢迎靠岸。我是艾琳。</div><canvas width=\"530\" height=\"660\" aria-label=\"金发商人船长\"></canvas></div>\n\n\n\n";const controller={};host.controller=controller;
const syncTheme=()=>host.toggleAttribute('dark',['dark','dim'].includes(document.documentElement.dataset.mode)||document.documentElement.classList.contains('dark')||document.body.classList.contains('dark'));syncTheme();new MutationObserver(syncTheme).observe(document.documentElement,{attributes:true,attributeFilter:['data-mode','class']});new MutationObserver(syncTheme).observe(document.body,{attributes:true,attributeFilter:['class']});
const pet=root.querySelector('#pet'),canvas=pet.querySelector('canvas'),bubble=root.querySelector('#bubble'),panel=root.querySelector('#panel'),messages=root.querySelector('#messages');
let timer,drag=null,suppress=false,responding=false;const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const companion=root.querySelector('#companion'),latest=root.querySelector('#latest');
function placeCompanion(){const r=pet.getBoundingClientRect(),w=companion.offsetWidth||300,h=companion.offsetHeight||220;let left=r.left-w+35,top=r.top+15;if(left<12){left=r.right-35;}if(left+w>innerWidth-12){left=innerWidth-w-12;top=r.top-h-10;}companion.style.left=Math.max(12,left)+'px';companion.style.top=Math.max(12,Math.min(innerHeight-h-12,top))+'px';}
function say(text){if(!companion.hidden||!panel.hidden){bubble.classList.add('hidden');return;}bubble.textContent=text;bubble.classList.remove('hidden');clearTimeout(timer);timer=setTimeout(()=>bubble.classList.add('hidden'),5500);}
let reactionTimer;
function react(kind='greet'){if(controller.motion&&!responding)controller.motion.play(kind==='greet'?'wave':kind==='happy'?'happy':'idle');clearTimeout(reactionTimer);pet.dataset.motion=kind;reactionTimer=setTimeout(()=>{delete pet.dataset.motion;},1200);}

function show(){panel.hidden=true;companion.hidden=false;clearTimeout(timer);bubble.classList.add('hidden');placeCompanion();react();companion.querySelector('input').focus();}
root.querySelector('#dismiss').onclick=()=>{companion.hidden=true;pet.focus();};
pet.addEventListener('pointerdown',e=>{if(e.button!==0)return;const r=pet.getBoundingClientRect();drag={x:e.clientX,y:e.clientY,left:r.left,top:r.top,moved:false};pet.setPointerCapture(e.pointerId);});
pet.addEventListener('pointermove',e=>{if(drag){const dx=e.clientX-drag.x,dy=e.clientY-drag.y;if(Math.hypot(dx,dy)>6)drag.moved=true;if(drag.moved){pet.style.right='auto';pet.style.bottom='auto';pet.style.left=Math.max(0,Math.min(innerWidth-pet.offsetWidth,drag.left+dx))+'px';pet.style.top=Math.max(0,Math.min(innerHeight-pet.offsetHeight,drag.top+dy))+'px';placeCompanion();}}else if(!reduced.matches){const r=pet.getBoundingClientRect();canvas.style.rotate=((e.clientX-r.left)/r.width-.5)*2+'deg';}});
pet.addEventListener('pointerup',()=>{suppress=!!drag?.moved;if(suppress){say('好，换个泊位。这次不收靠港费。');react('settle');}drag=null;});pet.addEventListener('pointercancel',()=>{drag=null;suppress=true;});pet.addEventListener('pointerleave',()=>canvas.style.rotate='');pet.addEventListener('click',()=>{if(suppress){suppress=false;return;}show();});pet.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();show();}});
root.querySelector('#close').onclick=show;document.addEventListener('keydown',e=>{if(e.key==='Escape'){panel.hidden=true;companion.hidden=true;pet.focus();}});
function append(text,user=false){const div=document.createElement('div');div.className='message'+(user?' user':'');div.textContent=text;messages.append(div);messages.scrollTop=messages.scrollHeight;return div;}
// Ordered local intents: specific meaning wins over incidental greetings.
function classifyMessage(raw){
 const text=raw.normalize('NFKC').trim().toLowerCase();
 if(/传达|联系|留言|告诉.*eric/.test(text))return 'contact';
 if(/你是谁|你叫什么|你的名字|介绍.*自己/.test(text))return 'identity';
 if(/再见|拜拜|晚安|先走/.test(text))return 'goodbye';
 if(/(?:不|没|并不|一点也不|不太)(?:怎么|那么|是很|很)?(?:漂亮|可爱|好看|喜欢你|厉害)|难看|丑|讨厌你/.test(text))return 'criticism';
 if(/难过|不开心|不高兴|心情不好|疲惫|好累|很累|累了|烦恼|烦死|伤心|焦虑/.test(text))return 'comfort';
 if(/夸夸我|夸我|表扬我/.test(text))return 'praiseVisitor';
 if(/为什么|怎么|如何|建议|主见|你觉得|怎么选|能不能|是否/.test(text))return 'advice';
 if(/不客气|不用谢/.test(text))return 'acknowledge';
 if(/谢谢|多谢|感谢|thank(?:s| you)/.test(text))return 'thanks';
 if(/漂亮|可爱|好看|喜欢你|真棒|厉害|好美|好温柔|夸你/.test(text)&&!/(?:他|她|它|这个项目|这篇文章).{0,4}(?:漂亮|可爱|好看)/.test(text))return 'compliment';
 if(/项目|文章|逛|看看/.test(text))return 'projects';
 if(/你好|嗨|哈喽|早上好|晚上好|下午好|早安|hello|\bhi\b/.test(text))return 'greeting';
 return 'unknown';
}
const localReplies={
 contact:['想让我带话给 Eric？传达服务还没接通，现在写下的话不会送出。我可不能把没交付的货记成已签收。'],
 identity:['我是艾琳·维恩，暮潮港出身的商人船长。算账、谈货价是我的拿手活。至于当好船长，我还在学——总不能只凭一顶帽子就算合格，对吧？'],
 goodbye:['好，路上顺利。没看完的留着下次，也不算欠账。'],
 criticism:['看来我们眼光有点不同。意见我收下了，不过这身打扮我自己还挺喜欢。'],
 comfort:['那就先歇一会儿，事情不用全挤在今天做完。靠岸休息也算航程的一部分。','先别急着给自己算亏账。喝点水，喘口气，再挑一件小事慢慢做。'],
 praiseVisitor:['愿意开口讨一句鼓励，也算坦率嘛。今天做成的小事都值得记一笔，可别只盯着还没完成的。'],
 advice:['我会先看目标，再算成本和风险，别一口气把货舱装满。不过具体方案还超出我目前的本地回复能力，我不想替你随便下结论。'],
 acknowledge:['那我就安心收下这份好意啦。'],
 thanks:['不客气，帮上忙就好。这笔人情不用记账。','收到了。能帮你省点力气，这趟就不算白跑。'],
 compliment:['谢谢，看来今天这顶帽子没白挑。眼光不错——这句夸奖我就收下啦。','被你这么一夸，今天的账本都顺眼了些。不过船长除了好看，也很会算账。','谢谢，我挺喜欢你这么直白。夸奖收下，泊位费就不收啦。'],
 projects:['我会先选海面与光影，先看效果，再研究它怎么做出来。只是文章入口还没接到正式主页，我先不乱指路。'],
 greeting:['嗨，欢迎靠岸。我替 Eric 照看这里，闲聊不收泊位费。你慢慢说，我听着。','又有客人靠岸啦。你好，我是艾琳，今天想聊些什么？'],
 unknown:['这句我还没接明白。可以换个说法，或聊聊我的来历、这里的项目。我现在用的是本地规则，不懂的事就不装懂。']
};
const replyCounts={};
function reply(text,intent=classifyMessage(text)){const options=localReplies[intent];const n=replyCounts[intent]||0;replyCounts[intent]=n+1;return options[n%options.length];}
function messageMotion(text,intent=classifyMessage(text)){return ['compliment','thanks','praiseVisitor'].includes(intent)?'happy':['greeting','goodbye'].includes(intent)?'wave':['advice','projects','contact','unknown'].includes(intent)?'thinking':'idle';}
async function send(text){text=text.trim();if(!text||responding)return;if(handleSiteControl(text)||handleDestination(text)||recommendProject(text)){append(text,true);return;}const intent=classifyMessage(text),motion=messageMotion(text,intent);responding=true;if(motion==='thinking'){pet.classList.add('thinking');controller.motion?.think();}else controller.motion?.play(motion);root.querySelectorAll('form button').forEach(b=>b.disabled=true);latest.textContent=motion==='happy'?'这话我听见啦。':motion==='wave'?'嗨，欢迎靠岸。':motion==='idle'?'嗯，我听着。':'稍等，我理一理这笔账…';placeCompanion();append(text,true);say(latest.textContent);const pending=append('…');await new Promise(r=>setTimeout(r,750));pending.textContent=reply(text,intent);latest.textContent=pending.textContent;placeCompanion();messages.scrollTop=messages.scrollHeight;say('这是我的看法，你也可以有不同的打算。');responding=false;pet.classList.remove('thinking');if(controller.motion){if(motion==='thinking')controller.motion.finishThinking('idle');}else react(motion==='happy'?'happy':motion==='wave'?'greet':'nod');root.querySelectorAll('form button').forEach(b=>b.disabled=false);}
root.querySelector('#chat').onsubmit=e=>{e.preventDefault();const input=e.currentTarget.querySelector('input');if(!responding){send(input.value);input.value='';}};root.querySelector('#quick-chat').onsubmit=root.querySelector('#chat').onsubmit;root.querySelectorAll('[data-say]').forEach(b=>b.onclick=()=>send(b.dataset.say));window.addEventListener('resize',()=>{placeCompanion();if(pet.style.left){pet.style.left=Math.max(0,Math.min(innerWidth-pet.offsetWidth,parseFloat(pet.style.left)))+'px';pet.style.top=Math.max(0,Math.min(innerHeight-pet.offsetHeight,parseFloat(pet.style.top)))+'px';}});timer=setTimeout(()=>bubble.classList.add('hidden'),6500);

const projectIndex=JSON.parse(host.querySelector('[data-eileen-index]')?.textContent||'[]');
let lastProject=null,navigationTimer;
function navigateProject(item){const url=new URL(item.url,location.href);if(url.origin!==location.origin)return;if(window.pjax?.loadUrl)window.pjax.loadUrl(url.href);else location.assign(url.href);}
function recommendProject(text){
 clearTimeout(navigationTimer);text=text.normalize('NFKC').trim();
 const previewOnly=/先.*(?:推荐|介绍|说说)|只.*(?:推荐|介绍)|不(?:要|用|想|必).*?(?:打开|跳转)|别.*(?:打开|跳转)/.test(text);
 if(/不(?:要|用|想).*逛|别.*逛/.test(text))return false;
 const follow=/^(?:好的?[,， ]*)?(?:打开它?|带我去吧?|去看看吧?|就这个吧?|走吧|这个不错[,， ]*去看看)[!！。\s]*$/.test(text);
 if(follow&&lastProject&&!previewOnly){navigateProject(lastProject);latest.textContent='好，带你去看看 '+lastProject.title+'。';return true;}
 const newest=/最新|最近.*(?:做|作品|项目|更新)|新(?:作品|项目|东西)|刚.*(?:做|发布|更新)/.test(text);
 const wander=/逛|随便.*看|有什么好玩|带路|随机|随意.*看|有啥好玩/.test(text);
 const topic=/(?:想看|有没有|看看|看一下|找|推荐).*(?:海洋|海面|海水|游戏|渲染|模型|ocean|viewer)/i.test(text);
 if(!newest&&!wander&&!topic&&!follow&&!/推荐|最好|精选|打开|带我去/.test(text))return false;
 const autoNavigate=!previewOnly&&(newest||wander||topic||/打开|跳转|带我去|去看看/.test(text));
 const items=[...projectIndex].sort((a,b)=>b.date.localeCompare(a.date));
 let item,description;
 if(newest){item=items[0];description='最新靠岸的是';}
 else if(/最好|精选|最棒/.test(text)){const selected=items.filter(p=>p.featured);item=selected[0];description='我会先推荐这份精选';if(!item){latest.textContent='“最好”我可不想随便盖章。Eric 还没标记精选项目，要不要先看看最新的？';const b=document.createElement('button');b.textContent='看看最新项目';b.onclick=()=>recommendProject('推荐最新项目');latest.append(document.createElement('br'),b);placeCompanion();return true;}}
 else if(wander){const pool=items.filter(p=>p.url!==location.pathname&&p.url!==lastProject?.url);item=(pool.length?pool:items)[Math.floor(Math.random()*(pool.length||items.length))];description='这次带你看看';}
 else{
 const query=text.toLowerCase().replace(/请|帮我|给我|推荐|打开|带我去|看看|这里|一个|相关|的|项目|文章/g,'').replace(/[？?！!。，,\s]/g,'');
 const aliases=[[/海洋|海面|海水/,'ocean 海洋 海面'],[/游戏/,'game 游戏'],[/渲染/,'render shader 渲染'],[/模型/,'model viewer 模型']];
 const terms=[query,...aliases.filter(([re])=>re.test(query)).flatMap(([,v])=>v.split(' '))].filter(Boolean);
 const ranked=items.map(p=>({item:p,score:terms.reduce((n,t)=>n+(p.title.toLowerCase().includes(t)?5:0)+((p.tags||[]).join(' ').toLowerCase().includes(t)?3:0)+(p.summary.toLowerCase().includes(t)?1:0),0)})).sort((a,b)=>b.score-a.score);
 item=ranked[0]?.score?ranked[0].item:null;description='按你说的内容，我会选';
 }
 if(!item){latest.textContent='这趟暂时没找到匹配的项目。可以说“带我逛逛”或“推荐最新项目”。';placeCompanion();return true;}
 lastProject=item;controller.motion?.play('idle');
 const destination=item.title;
 const guideLine=newest?'最近的新作品是 '+destination+'。走，我带你去看看。':wander?'那就由我挑一站——'+destination+'。跟我来，看看合不合你的口味。':'你想看的内容，'+destination+' 里有。走，我们过去看看。';
 if(autoNavigate){
  latest.textContent=guideLine;placeCompanion();
  navigationTimer=setTimeout(()=>navigateProject(item),650);
  return true;
 }
 latest.textContent=description+' '+destination+'。你想去的时候，我来带路。';
 const link=document.createElement('a');link.href=item.url;link.textContent='带我去看看 →';link.style.cssText='display:block;color:inherit;margin-top:8px;text-decoration:underline';link.onclick=e=>{if(e.button!==0||e.ctrlKey||e.metaKey||e.shiftKey||e.altKey)return;e.preventDefault();navigateProject(item);};latest.append(link);placeCompanion();
 return true;
}

function handleSiteControl(text){
 if(/(?:不要|别|不用)(?:播放|放|开)(?:音乐|歌)/.test(text))text='停止音乐';
 const music=/(?:音乐|背景音|bgm|歌)/i.test(text),stop=/(?:停止|暂停|关掉|关闭|别放|安静)/.test(text),play=/(?:播放|放点|放个|来点|来首|打开|开启|听)/.test(text);
 if(music&&(stop||play)){
  clearTimeout(navigationTimer);controller.motion?.play('idle');
  if(!window.eileenMusic){latest.textContent='音乐控件还没准备好，稍等再试一下。';return true;}
  if(stop){window.eileenMusic.stop();latest.textContent='好，音乐停下了。安静听一会儿风声也不错。';}
  else{latest.textContent='好，给这趟航程添点音乐。';window.eileenMusic.play().then(()=>{latest.textContent='音乐响起来了。你慢慢逛，我陪着。';}).catch(()=>{latest.textContent='音乐暂时没能播放，请点一下页面上的音乐按钮再试试。';});}
  placeCompanion();return true;
 }
 const dark=/(?:夜间|夜晚|晚上|深色|暗色|黑夜)/.test(text),light=/(?:白天|日间|浅色|亮色)/.test(text),toggle=/(?:切换|换|开启|打开|改成|调成|变成)/.test(text);
 if((dark||light)&&toggle||/切换(?:日夜|明暗)|换个主题/.test(text)){
  clearTimeout(navigationTimer);const isDark=dark?true:light?false:document.documentElement.dataset.mode!=='dim';
  document.documentElement.dataset.mode=isDark?'dim':'lit';try{localStorage.setItem('colorMode',isDark?'dim':'lit');}catch{}
  latest.textContent=isDark?'夜色换好了。光线柔和些，慢慢看。':'换回白天啦。视野敞亮，适合继续逛逛。';controller.motion?.play('idle');placeCompanion();return true;
 }
 return false;
}

function handleDestination(text){
 const t=text.normalize('NFKC').trim().toLowerCase();
 if(/不要|不用|别|不想/.test(t))return false;
 const rules=[
  {test:/主页|首页|主站|回家/,selector:'.nav-brand',name:'主页',line:'好，回到主页。新的航程也可以从这里开始。',internal:true},
  {test:/github|代码仓库|源码仓库/,selector:'header a[href*="github.com/"]',name:'GitHub',line:'走，去 Eric 的 GitHub 看看，作品背后的代码都在那边。'},
  {test:/game[\s-]*lab|游戏实验室|游戏页面|玩游戏/,selector:'header a[href*="/game-lab/"]',name:'游戏实验室',line:'想玩点什么？走，带你去游戏实验室。'},
  {test:/audio[\s-]*lab|音频实验室|音频页面|音频工具/,selector:'header a[href*="/audio-lab/"]',name:'音频实验室',line:'好，去音频实验室。这一站，交给耳朵来挑货。'},
  {test:/story[\s-]*lab|故事实验室|故事页面|看故事|读故事/,selector:'header a[href*="/story-lab/"]',name:'故事实验室',line:'走，去故事实验室。那边还有些航程，等你慢慢读。'}
 ];
 const rule=rules.find(r=>r.test.test(t));if(!rule)return false;
 // Destination names alone are shortcuts; ordinary questions about them stay in chat.
 if(/是什么|介绍|怎么做|如何|为什么|先.*推荐|只.*介绍/.test(t)&&!/打开|带我去|进入|跳转/.test(t))return false;
 const anchor=document.querySelector(rule.selector);if(!anchor)return false;
 const url=new URL(anchor.href,location.href);if(!['http:','https:'].includes(url.protocol))return false;
 clearTimeout(navigationTimer);controller.motion?.play('idle');latest.textContent=rule.line;placeCompanion();
 navigationTimer=setTimeout(()=>{if(rule.internal&&url.origin===location.origin&&window.pjax?.loadUrl)window.pjax.loadUrl(url.href);else location.assign(url.href);},650);
 return true;
}

const status=controller.status={state:'loading',engine:'rev2d'};
(async()=>{
 try{
 const url=new URL('./model/eileen.r2d.json',import.meta.url);
 const response=await fetch(url);if(!response.ok)throw Error('Model '+response.status);
 const model=ModelSchema.parse(await response.json()),rig=new Rig(model),renderer=new GlRenderer(canvas,()=>renderer.setTextures(textures,++textureVersion));
 let textureVersion=1;const textures=new Map();
 await Promise.all(model.textures.map(async t=>{const r=await fetch(new URL(t.path,url));if(!r.ok)throw Error('Texture '+t.id);textures.set(t.id,{bitmap:await createImageBitmap(await r.blob(),{premultiplyAlpha:'premultiply'})});}));
 renderer.setTextures(textures,textureVersion);
 let motion='idle',started=performance.now(),ending=false,next='idle',gazeX=0,gazeY=0,finishTimer,lastParams=null,transition=null;
 const play=id=>{clearTimeout(finishTimer);const now=performance.now();transition=lastParams?{from:{...lastParams},start:now}:null;motion=id;started=now;ending=false;status.motion=id;};
 controller.motion={play,think:()=>play('thinking'),finishThinking:(after='idle')=>{
 if(motion!=='thinking'){play(after);return;}
 clearTimeout(finishTimer);
 const phase=(performance.now()-started)%9000;
 // Let the actual reading timeline reach its closing segment. Never seek across poses.
 finishTimer=setTimeout(()=>{if(motion!=='thinking')return;const now=performance.now(),phase=(now-started)%9000;motion='thinking_once';started=now-phase;ending=true;next=after;},Math.max(0,6000-phase));
 }};
 window.addEventListener('pointermove',e=>{const r=canvas.getBoundingClientRect();gazeX=Math.max(-1,Math.min(1,(e.clientX-r.left-r.width/2)/300));gazeY=Math.max(-1,Math.min(1,-(e.clientY-r.top-r.height*.3)/300));});
 const colors={workspace:[0,0,0,0],checkA:[0,0,0,0],checkB:[0,0,0,0],darkBackdrop:[0,0,0,0],lightBackdrop:[0,0,0,0]};
 let hiddenAt=null;
 document.addEventListener('visibilitychange',()=>{if(document.hidden)hiddenAt=performance.now();else if(hiddenAt!==null){const pause=performance.now()-hiddenAt;started+=pause;if(transition)transition.start+=pause;hiddenAt=null;requestAnimationFrame(frame);}});
 function frame(now){if(document.hidden)return;
 let time=(now-started)/1000;const a=model.animations.find(a=>a.id===motion);
 if((ending||!['idle','thinking'].includes(motion))&&time>=a.duration){play(ending?next:'idle');time=0;}
 const params=motion==='idle'?{GazeX:gazeX,GazeY:gazeY}:{};
 let pose=rig.pose({animations:[motion],time,params});
 if(transition){const u=Math.min(1,(now-transition.start)/400),w=u*u*(3-2*u),blended={};for(const p of model.parameters)blended[p.id]=transition.from[p.id]+(pose.params[p.id]-transition.from[p.id])*w;pose=rig.pose({params:blended});if(u===1)transition=null;}
 lastParams={...pose.params};status.transitioning=!!transition;
 const r=canvas.getBoundingClientRect();renderer.render({list:buildRenderList(rig,pose),camera:{cx:565,cy:696,zoom:Math.min(r.width/1130,r.height/1392)},viewport:{width:r.width,height:r.height},dpr:Math.min(devicePixelRatio,2),background:'transparent',hidden:new Set(),colors});
 status.motion=motion;status.time=time;status.frames=(status.frames||0)+1;status.eyeOpen=pose.params.EyeOpen;status.breath=pose.params.Breath;requestAnimationFrame(frame);
 }
 pet.dataset.renderer='rev2d';status.state='ready';canvas.dataset.live2d='ready';requestAnimationFrame(frame);say('嗨，我是艾琳。暂时替 Eric 照看这里，点我就好。');
 }catch(error){status.state='error';status.error=String(error);console.error(error);canvas.style.background="center / contain no-repeat url('./fallback.png')";say('登场时遇到一点小麻烦，请刷新试试。');}
})();

}