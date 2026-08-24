var currentLang = "en";
try { currentLang = localStorage.getItem("readymaid_routine_lang") || "en"; } catch(e) {}
if (currentLang !== "zh") currentLang = "en";

var contentZh = {
  "Prepare milk / breakfast":"准备奶 / 早餐",
  "Baby / child first":"宝宝 / 小孩优先",
  "Wash bottles / dishes":"清洗奶瓶 / 餐具",
  "Baby care / bathe child":"照顾宝宝 / 给小孩洗澡",
  "Baby nap / tidy room":"宝宝午睡 / 整理房间",
  "Laundry for baby clothes":"清洗宝宝衣物",
  "Prepare lunch":"准备午餐",
  "Child activity / watch child":"陪小孩活动 / 照看小孩",
  "Prepare dinner":"准备晚餐",
  "Wash dishes":"清洗餐具",
  "Prepare for tomorrow":"准备明天用品",
  "Prepare breakfast / medicine":"准备早餐 / 药物",
  "Check medicine":"检查药物",
  "Help elderly wash up":"协助老人梳洗",
  "Tidy bedroom":"整理卧室",
  "Companionship / light exercise":"陪伴 / 轻度运动",
  "Laundry":"洗衣",
  "Soft food if needed":"如有需要准备软食",
  "Tea / snacks / comfort check":"茶点 / 小吃 / 查看老人情况",
  "Evening medicine":"晚间药物",
  "If needed":"如有需要",
  "Prepare for sleep":"准备休息",
  "Prepare breakfast":"准备早餐",
  "Hang clothes":"晾衣服",
  "Tidy bedrooms":"整理卧室",
  "Clean living room":"清洁客厅",
  "Clean kitchen":"清洁厨房",
  "Fold / iron clothes":"折衣 / 熨衣",
  "Take out rubbish":"倒垃圾"
};
var contentEn = {};
Object.keys(contentZh).forEach(function(k){ contentEn[contentZh[k]] = k; });
function trContent(v){
  if (currentLang === "zh") return contentZh[v] || v;
  return contentEn[v] || v;
}

var artOriginal = getTemplateArt;
getTemplateArt = function(key){
  var art = artOriginal(key);
  if (currentLang !== "zh") return art;
  var map = {
    childcare:{title:"宝宝 / 儿童照顾",sub:"适合主要需要新生儿、宝宝或儿童照顾的家庭。"},
    elderly:{title:"老人照顾",sub:"适合陪伴、日常协助及老人照顾的家庭。"},
    housework:{title:"家务与烹饪",sub:"适合日常清洁、整理及烹饪工作的家庭。"}
  };
  var zh = map[key] || map.housework;
  return {cls:art.cls,emoji:art.emoji,title:zh.title,sub:zh.sub};
};

function setText(sel, en, zh){
  var el=document.querySelector(sel); if(el) el.textContent=currentLang==="zh"?zh:en;
}
function setHtml(sel, en, zh){
  var el=document.querySelector(sel); if(el) el.innerHTML=currentLang==="zh"?zh:en;
}
function localizeStatic(){
  document.documentElement.lang=currentLang==="zh"?"zh-CN":"en";
  var toggle=document.getElementById("langToggle");
  if(toggle) toggle.innerHTML=currentLang==="zh"?'EN | <strong>中文</strong>':'<strong>EN</strong> | 中文';
  setText('.rmh-kicker','READY MAID CUSTOMER TOOL','READY MAID 客户工具');
  setText('.rmh-title','Helper Routine Planner','女佣日常时间表规划');
  setText('.rmh-subtitle','Build a clear daily routine for your helper, adjust it anytime, and download one clean Ready Maid customer PDF.','为女佣安排清楚的每日工作时间表，随时修改，并下载一份整洁的 Ready Maid 客户 PDF。');
  var reset=document.getElementById('resetBtn'); if(reset) reset.textContent=currentLang==='zh'?'重置':'Reset';
  var top=document.querySelector('#downloadBothTop span:last-child'); if(top) top.textContent=currentLang==='zh'?'下载 PDF':'Download PDF';
  setText('.hero h1','Single-page customer routine planner','单页客户日常时间表规划');
  setText('.hero p','Customer fills in the routine and downloads one clean visual Ready Maid routine page.','客户填写日常工作安排后，即可下载一页清楚的 Ready Maid 时间表。');
  var titles=document.querySelectorAll('.panel-title'); if(titles[0]) titles[0].textContent=currentLang==='zh'?'日常时间表设置':'Routine Builder'; if(titles[1]) titles[1].textContent=currentLang==='zh'?'预览':'Preview';
  var subs=document.querySelectorAll('.panel-sub'); if(subs[0]) subs[0].textContent=currentLang==='zh'?'选择模板后再调整时间表。海报视觉会根据所选模板自动固定。':'Choose a template, then adjust the timetable. The poster visual is fixed automatically by the selected template.'; if(subs[1]) subs[1].textContent=currentLang==='zh'?'最终结果为一页视觉化 A4 时间表。':'The final result is one visual A4 routine page.';
  var weekday=document.querySelector('[data-plan="weekday"]'), weekend=document.querySelector('[data-plan="weekend"]'); if(weekday) weekday.textContent=currentLang==='zh'?'平日':'Weekday'; if(weekend) weekend.textContent=currentLang==='zh'?'周末':'Weekend';
  var labels=document.querySelectorAll('.editor-panel label');
  if(labels[0]) labels[0].textContent=currentLang==='zh'?'家庭 / 客户姓名':'Family / Customer Name';
  if(labels[1]) labels[1].textContent=currentLang==='zh'?'女佣姓名':'Helper Name';
  if(labels[2]) labels[2].textContent=currentLang==='zh'?'快速模板':'Quick Template';
  if(labels[3]) labels[3].textContent=currentLang==='zh'?'特别备注':'Special Notes';
  var family=document.getElementById('familyInput'), helper=document.getElementById('helperInput'), notes=document.getElementById('notesInput');
  if(family) family.placeholder=currentLang==='zh'?'选填':'Optional'; if(helper) helper.placeholder=currentLang==='zh'?'选填':'Optional'; if(notes) notes.placeholder=currentLang==='zh'?'宝宝午睡时间、药物提醒、饮食偏好、重要规则...':'Baby nap time, medicine reminder, food preference, key rules...';
  var opts=document.querySelectorAll('#templateSelect option'); if(opts[0]) opts[0].textContent=currentLang==='zh'?'宝宝 / 儿童照顾':'Baby / Childcare'; if(opts[1]) opts[1].textContent=currentLang==='zh'?'老人照顾':'Elderly Care'; if(opts[2]) opts[2].textContent=currentLang==='zh'?'家务与烹饪':'Housework & Cooking';
  setHtml('.helper-note','<b>Owner tip:</b> keep roughly the same routine for 1–2 weeks. Once the helper remembers the flow, slowly reduce reminders. This tool saves on the same device whenever local browser storage is available.','<b>雇主提示：</b> 最初 1–2 周尽量保持相同的工作流程。女佣熟悉后，再慢慢减少提醒。只要浏览器允许，本工具会自动保存于同一设备。');
  var zoom=document.querySelector('.zoom-box span'); if(zoom) zoom.textContent=currentLang==='zh'?'缩放':'Zoom';
  var tableOnly=document.getElementById('tableOnlyBtn'),posterOnly=document.getElementById('posterOnlyBtn'),both=document.getElementById('bothBtn'),download=document.getElementById('downloadPdfBtn');
  if(tableOnly) tableOnly.textContent=currentLang==='zh'?'表格':'Table Only'; if(posterOnly) posterOnly.textContent=currentLang==='zh'?'海报':'Poster Only'; if(both) both.textContent=currentLang==='zh'?'全部':'Both'; if(download) download.textContent=currentLang==='zh'?'下载 PDF':'Download PDF';
  var h2=document.querySelector('.center-title h2'), zh=document.querySelector('.center-title .zh'); if(h2) h2.textContent=currentLang==='zh'?'女佣每日工作安排':'Helper Daily Routine'; if(zh) zh.textContent=currentLang==='zh'?'女佣日常时间表':'女佣日常时间表';
  var metas=document.querySelectorAll('.meta-panels b'); if(metas[0]) metas[0].textContent=currentLang==='zh'?'家庭':'FAMILY'; if(metas[1]) metas[1].textContent=currentLang==='zh'?'女佣':'HELPER';
  var sp=document.querySelector('.table-page .special-box b'); if(sp) sp.textContent=currentLang==='zh'?'特别备注':'Special Notes / 特别备注';
  var ph=document.querySelector('.poster-copy h3'); if(ph) ph.innerHTML=currentLang==='zh'?'每日工作 <span>总览</span>':'Daily Routine <span>Overview</span>';
  var pp=document.querySelector('.poster-copy p'); if(pp) pp.textContent=currentLang==='zh'?'这个视觉版本更方便与女佣分享。同一份时间表会以更清楚的海报方式呈现，并按时段分组。':'This visual version is easier to share with the helper. The same timetable content is shown in a cleaner poster style with a photo area and grouped routine blocks.';
  var infos=document.querySelectorAll('.info-card b'); if(infos[0]) infos[0].textContent=currentLang==='zh'?'家庭':'FAMILY'; if(infos[1]) infos[1].textContent=currentLang==='zh'?'女佣':'HELPER';
  var tipb=document.querySelector('.poster-tip b'),tipd=document.querySelector('.poster-tip div'); if(tipb) tipb.textContent=currentLang==='zh'?'最重要':'Most important'; if(tipd) tipd.textContent=currentLang==='zh'?'先建立习惯，再慢慢减少提醒。时间表要清楚、简单，并保持一致。':'Build the habit first, then slowly reduce reminders. Keep the routine clear, simple and consistent.';
  var psp=document.querySelector('.poster-page .special-box b'); if(psp) psp.textContent=currentLang==='zh'?'特别备注':'Special Notes / 特别备注';
  var foot=document.querySelector('.poster-footnote span:last-child'); if(foot) foot.textContent=currentLang==='zh'?'Ready Maid Agency · WhatsApp 联系我们':'Ready Maid Agency · Chat with us on WhatsApp';
}

function localizeEditor(){
  var heads=document.querySelectorAll('.section-head strong');
  for(var i=0;i<heads.length;i++) heads[i].textContent=currentLang==='zh'?sectionCN[sectionNames[i]]:(sectionCN[sectionNames[i]]+' · '+sectionNames[i]);
  Array.prototype.forEach.call(document.querySelectorAll('.add-btn'),function(b){b.textContent=currentLang==='zh'?'+ 添加任务':'+ Add task'});
  Array.prototype.forEach.call(document.querySelectorAll('.time-input'),function(i){i.placeholder=currentLang==='zh'?'时间':'Time'});
  Array.prototype.forEach.call(document.querySelectorAll('.task-input'),function(i){i.placeholder=currentLang==='zh'?'工作内容':'Task';i.value=trContent(i.value)});
  Array.prototype.forEach.call(document.querySelectorAll('.notes-input'),function(i){i.placeholder=currentLang==='zh'?'备注（选填）':'Notes (optional)';i.value=trContent(i.value)});
  Array.prototype.forEach.call(document.querySelectorAll('.section'),function(s){var d=s.querySelector('div[style*="padding:12px"]');if(d) d.textContent=currentLang==='zh'?'暂无任务。点击 + 添加任务。':'No tasks yet. Click + Add task.'});
}

function localizePreview(){
  var titles=document.querySelectorAll('.table-title');
  for(var i=0;i<titles.length;i++) titles[i].textContent=currentLang==='zh'?sectionCN[sectionNames[i]]:(sectionCN[sectionNames[i]]+' · '+sectionNames[i]);
  Array.prototype.forEach.call(document.querySelectorAll('.table thead tr'),function(tr){var th=tr.querySelectorAll('th');if(th[0])th[0].textContent=currentLang==='zh'?'时间':'Time';if(th[1])th[1].textContent=currentLang==='zh'?'工作内容':'Task';if(th[2])th[2].textContent=currentLang==='zh'?'备注':'Notes'});
  Array.prototype.forEach.call(document.querySelectorAll('.table tbody tr'),function(tr){var td=tr.querySelectorAll('td');if(td[1])td[1].textContent=trContent(td[1].textContent);if(td[2])td[2].textContent=trContent(td[2].textContent)});
  var heads=document.querySelectorAll('.poster-card .head');for(var j=0;j<heads.length;j++) heads[j].textContent=currentLang==='zh'?sectionCN[sectionNames[j]]:(sectionCN[sectionNames[j]]+' · '+sectionNames[j]);
  Array.prototype.forEach.call(document.querySelectorAll('.poster-task,.poster-notes'),function(el){el.textContent=trContent(el.textContent)});
  Array.prototype.forEach.call(document.querySelectorAll('.poster-card .body > div[style*="color:#66788f"]'),function(el){el.textContent=currentLang==='zh'?'暂无任务。':'No tasks yet.'});
}

var originalRenderEditor=renderEditor;
renderEditor=function(){ originalRenderEditor(); localizeStatic(); localizeEditor(); };
var originalRenderPreview=renderPreview;
renderPreview=function(){ originalRenderPreview(); localizeStatic(); localizePreview(); };

function applyLanguage(lang){
  currentLang=lang==='zh'?'zh':'en';
  try{localStorage.setItem('readymaid_routine_lang',currentLang)}catch(e){}
  localizeStatic();renderEditor();renderPreview();
}

async function directDownloadPDF(){
  var status=document.getElementById('saveState');
  try{
    if(status) status.textContent=currentLang==='zh'?'正在制作 PDF…':'Creating PDF…';
    var W=1240,H=1754,canvas=document.createElement('canvas');canvas.width=W;canvas.height=H;
    var ctx=canvas.getContext('2d');ctx.fillStyle='#ffffff';ctx.fillRect(0,0,W,H);
    function roundRect(x,y,w,h,r,fill,stroke){ctx.beginPath();if(ctx.roundRect){ctx.roundRect(x,y,w,h,r)}else{ctx.moveTo(x+r,y);ctx.lineTo(x+w-r,y);ctx.quadraticCurveTo(x+w,y,x+w,y+r);ctx.lineTo(x+w,y+h-r);ctx.quadraticCurveTo(x+w,y+h,x+w-r,y+h);ctx.lineTo(x+r,y+h);ctx.quadraticCurveTo(x,y+h,x,y+h-r);ctx.lineTo(x,y+r);ctx.quadraticCurveTo(x,y,x+r,y)}if(fill){ctx.fillStyle=fill;ctx.fill()}if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=2;ctx.stroke()}}
    function wrap(text,x,y,maxWidth,lineHeight,maxLines){var words=String(text||'').split(/\s+/),line='',lines=[];for(var i=0;i<words.length;i++){var test=line?line+' '+words[i]:words[i];if(ctx.measureText(test).width>maxWidth&&line){lines.push(line);line=words[i]}else line=test}if(line)lines.push(line);if(maxLines)lines=lines.slice(0,maxLines);for(var j=0;j<lines.length;j++)ctx.fillText(lines[j],x,y+j*lineHeight);return y+lines.length*lineHeight}
    function wrapCJK(text,x,y,maxWidth,lineHeight,maxLines){var chars=Array.from(String(text||'')),line='',lines=[];for(var i=0;i<chars.length;i++){var test=line+chars[i];if(ctx.measureText(test).width>maxWidth&&line){lines.push(line);line=chars[i]}else line=test}if(line)lines.push(line);if(maxLines)lines=lines.slice(0,maxLines);for(var j=0;j<lines.length;j++)ctx.fillText(lines[j],x,y+j*lineHeight);return y+lines.length*lineHeight}
    function loadImg(src){return new Promise(function(resolve,reject){var im=new Image();im.onload=function(){resolve(im)};im.onerror=reject;im.src=src})}
    function cleanLogoImage(im){var c=document.createElement('canvas');c.width=im.naturalWidth||im.width;c.height=im.naturalHeight||im.height;var cctx=c.getContext('2d');cctx.drawImage(im,0,0);var d=cctx.getImageData(0,0,c.width,c.height),px=d.data;for(var i=0;i<px.length;i+=4){var r=px[i],g=px[i+1],b=px[i+2],mx=Math.max(r,g,b),mn=Math.min(r,g,b),spread=mx-mn,avg=(r+g+b)/3;if(avg>=250&&spread<=6){px[i+3]=0}else if(avg>=242&&spread<=9){px[i+3]=Math.round((250-avg)/8*255)}}cctx.putImageData(d,0,0);return c}
    var logoEl=document.querySelector('.rmh-logo, .p-logo, .logo');if(!logoEl)throw new Error('Ready Maid logo element not found');var rawLogo=await loadImg(logoEl.src),logo=cleanLogoImage(rawLogo);ctx.drawImage(logo,65,38,360,150);
    roundRect(930,60,245,58,18,'#fff','#cfdbeb');ctx.fillStyle='#0a2d66';ctx.font='700 24px Arial';ctx.fillText('Licence C · JTKSM',958,97);
    ctx.strokeStyle='#edf2f8';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(65,215);ctx.lineTo(1175,215);ctx.stroke();
    roundRect(65,245,520,282,24,'#f9fbfe','#dce6f2');ctx.fillStyle='#0a2d66';ctx.font='700 58px Arial';ctx.fillText(currentLang==='zh'?'每日工作':'Daily Routine',95,327);ctx.fillStyle='#0b78d4';ctx.fillText(currentLang==='zh'?'总览':'Overview',95,392);ctx.fillStyle='#66788f';ctx.font='19px Arial';var intro=currentLang==='zh'?'这个视觉版本更方便与女佣分享。同一份时间表会以更清楚的海报方式呈现。':'This visual version is easier to share with the helper. The same timetable content is shown in a cleaner poster style.';(currentLang==='zh'?wrapCJK:wrap)(intro,95,423,440,24,2);
    roundRect(95,488,210,34,10,'#f7f9fd','#e4ebf4');roundRect(320,488,210,34,10,'#f7f9fd','#e4ebf4');ctx.fillStyle='#66788f';ctx.font='700 16px Arial';ctx.fillText(currentLang==='zh'?'家庭':'FAMILY',110,480);ctx.fillText(currentLang==='zh'?'女佣':'HELPER',335,480);ctx.fillStyle='#193862';ctx.font='700 21px Arial';ctx.fillText(state.meta.family||'—',110,514);ctx.fillText(state.meta.helper||'—',335,514);
    roundRect(610,245,565,282,24,'#eef7ff','#dce6f2');var art=getTemplateArt(currentTemplate);ctx.textAlign='center';ctx.font='78px Arial';ctx.fillText(art.emoji,892,348);ctx.fillStyle='#0a2d66';ctx.font='700 34px Arial';ctx.fillText(art.title,892,409);ctx.fillStyle='#66788f';ctx.font='20px Arial';(currentLang==='zh'?wrapCJK:wrap)(art.sub,892,452,350,27,3);ctx.textAlign='left';
    var positions=[[65,555],[630,555],[65,930],[630,930]],cardW=545,cardH=350;sectionNames.forEach(function(sec,idx){var x=positions[idx][0],y=positions[idx][1];roundRect(x,y,cardW,cardH,20,'#fff','#dce6f2');var grad=ctx.createLinearGradient(x,y,x+cardW,y);grad.addColorStop(0,'#0b78d4');grad.addColorStop(1,'#7446d8');ctx.fillStyle=grad;ctx.fillRect(x,y,cardW,62);ctx.fillStyle='#fff';ctx.font='700 27px Arial';ctx.fillText(currentLang==='zh'?sectionCN[sec]:(sectionCN[sec]+' · '+sec),x+22,y+41);var rows=state.plans[currentPlan][sec].filter(function(r){return r.time||r.task||r.notes}).slice(0,5),yy=y+105;rows.forEach(function(r){ctx.fillStyle='#0b78d4';ctx.font='700 22px Arial';ctx.fillText(r.time||'—',x+22,yy);ctx.fillStyle='#193862';ctx.font='700 21px Arial';(currentLang==='zh'?wrapCJK:wrap)(trContent(r.task||'—'),x+150,yy,340,27,2);if(r.notes){ctx.fillStyle='#66788f';ctx.font='18px Arial';(currentLang==='zh'?wrapCJK:wrap)(trContent(r.notes),x+150,yy+29,340,22,1)}yy+=60})});
    var band=ctx.createLinearGradient(65,1300,1175,1300);band.addColorStop(0,'#0a2d66');band.addColorStop(.55,'#0b78d4');band.addColorStop(1,'#7446d8');roundRect(65,1300,1110,105,18,band,null);ctx.fillStyle='#fff';ctx.font='700 26px Arial';ctx.fillText(currentLang==='zh'?'最重要':'Most important',85,1341);ctx.font='20px Arial';var tip=currentLang==='zh'?'先建立习惯，再慢慢减少提醒。时间表要清楚、简单，并保持一致。':'Build the habit first, then slowly reduce reminders. Keep the routine clear, simple and consistent.';(currentLang==='zh'?wrapCJK:wrap)(tip,85,1377,1040,26,2);
    roundRect(65,1425,1110,175,18,'#fff','#dce6f2');ctx.fillStyle='#193862';ctx.font='700 24px Arial';ctx.fillText(currentLang==='zh'?'特别备注':'Special Notes / 特别备注',85,1465);ctx.font='20px Arial';(currentLang==='zh'?wrapCJK:wrap)(state.meta.notes||'—',85,1503,1040,29,3);
    ctx.fillStyle='#66788f';ctx.font='18px Arial';ctx.textAlign='right';ctx.fillText(currentLang==='zh'?'Ready Maid Agency · WhatsApp 联系我们':'Ready Maid Agency · Chat with us on WhatsApp',1170,1645);ctx.textAlign='left';
    var jpgData=canvas.toDataURL('image/jpeg',0.94).split(',')[1],bin=atob(jpgData),jpg=new Uint8Array(bin.length);for(var k=0;k<bin.length;k++)jpg[k]=bin.charCodeAt(k);var pdfBytes=jpegPdfBytes(jpg,W,H),pdfBlob=new Blob([pdfBytes],{type:'application/pdf'}),url=URL.createObjectURL(pdfBlob),a=document.createElement('a');a.href=url;a.download=currentLang==='zh'?'Ready_Maid_Helper_Routine_CN.pdf':'Ready_Maid_Helper_Routine.pdf';a.style.display='none';document.body.appendChild(a);a.click();a.remove();setTimeout(function(){URL.revokeObjectURL(url)},3000);if(status)status.textContent=currentLang==='zh'?'PDF 已下载':'PDF downloaded';
  }catch(err){console.error(err);if(status)status.textContent=(currentLang==='zh'?'下载失败：':'Download failed: ')+(err&&err.message?err.message:'Unknown error')}
}

var langToggle=document.getElementById('langToggle');
if(langToggle){langToggle.onclick=function(){applyLanguage(currentLang==='zh'?'en':'zh')}}
localizeStatic();
