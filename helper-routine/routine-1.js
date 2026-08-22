var planButtons, currentPlan = "weekday", currentTemplate = "housework";
var sectionNames = ["Morning","Late Morning","Afternoon","Evening"];
var sectionCN = {Morning:"早上", "Late Morning":"上午", Afternoon:"下午", Evening:"晚上"};

var templateData = {
  childcare: {
    Morning:[
      {time:"6:30 AM",task:"Prepare milk / breakfast",notes:"Baby / child first"},
      {time:"7:30 AM",task:"Wash bottles / dishes",notes:""},
      {time:"8:00 AM",task:"Baby care / bathe child",notes:""},
      {time:"",task:"",notes:""},{time:"",task:"",notes:""},{time:"",task:"",notes:""}
    ],
    "Late Morning":[
      {time:"9:30 AM",task:"Baby nap / tidy room",notes:""},
      {time:"10:30 AM",task:"Laundry for baby clothes",notes:""},
      {time:"",task:"",notes:""},{time:"",task:"",notes:""},{time:"",task:"",notes:""},{time:"",task:"",notes:""}
    ],
    Afternoon:[
      {time:"1:00 PM",task:"Prepare lunch",notes:""},
      {time:"2:00 PM",task:"Child activity / watch child",notes:""},
      {time:"",task:"",notes:""},{time:"",task:"",notes:""},{time:"",task:"",notes:""},{time:"",task:"",notes:""}
    ],
    Evening:[
      {time:"5:30 PM",task:"Prepare dinner",notes:""},
      {time:"7:00 PM",task:"Wash dishes",notes:""},
      {time:"8:00 PM",task:"Prepare for tomorrow",notes:""},
      {time:"",task:"",notes:""},{time:"",task:"",notes:""},{time:"",task:"",notes:""}
    ]
  },
  elderly: {
    Morning:[
      {time:"6:30 AM",task:"Prepare breakfast / medicine",notes:"Check medicine"},
      {time:"8:00 AM",task:"Help elderly wash up",notes:""},
      {time:"9:00 AM",task:"Tidy bedroom",notes:""},
      {time:"",task:"",notes:""},{time:"",task:"",notes:""},{time:"",task:"",notes:""}
    ],
    "Late Morning":[
      {time:"10:00 AM",task:"Companionship / light exercise",notes:""},
      {time:"11:00 AM",task:"Laundry",notes:""},
      {time:"",task:"",notes:""},{time:"",task:"",notes:""},{time:"",task:"",notes:""},{time:"",task:"",notes:""}
    ],
    Afternoon:[
      {time:"1:00 PM",task:"Prepare lunch",notes:"Soft food if needed"},
      {time:"3:00 PM",task:"Tea / snacks / comfort check",notes:""},
      {time:"",task:"",notes:""},{time:"",task:"",notes:""},{time:"",task:"",notes:""},{time:"",task:"",notes:""}
    ],
    Evening:[
      {time:"5:30 PM",task:"Prepare dinner",notes:""},
      {time:"7:30 PM",task:"Evening medicine",notes:"If needed"},
      {time:"8:00 PM",task:"Prepare for sleep",notes:""},
      {time:"",task:"",notes:""},{time:"",task:"",notes:""},{time:"",task:"",notes:""}
    ]
  },
  housework: {
    Morning:[
      {time:"7:00 AM",task:"Prepare breakfast",notes:""},
      {time:"8:00 AM",task:"Wash dishes",notes:""},
      {time:"8:30 AM",task:"Laundry",notes:""},
      {time:"",task:"",notes:""},{time:"",task:"",notes:""},{time:"",task:"",notes:""}
    ],
    "Late Morning":[
      {time:"9:30 AM",task:"Tidy bedrooms",notes:""},
      {time:"10:30 AM",task:"Clean living room",notes:""},
      {time:"11:00 AM",task:"Hang clothes",notes:""},
      {time:"",task:"",notes:""},{time:"",task:"",notes:""},{time:"",task:"",notes:""}
    ],
    Afternoon:[
      {time:"1:00 PM",task:"Prepare lunch",notes:""},
      {time:"2:00 PM",task:"Clean kitchen",notes:""},
      {time:"3:00 PM",task:"Fold / iron clothes",notes:""},
      {time:"",task:"",notes:""},{time:"",task:"",notes:""},{time:"",task:"",notes:""}
    ],
    Evening:[
      {time:"5:30 PM",task:"Prepare dinner",notes:""},
      {time:"7:00 PM",task:"Wash dishes",notes:""},
      {time:"7:30 PM",task:"Take out rubbish",notes:""},
      {time:"",task:"",notes:""},{time:"",task:"",notes:""},{time:"",task:"",notes:""}
    ]
  }
};

function blankRows(){return [{time:"",task:"",notes:""},{time:"",task:"",notes:""},{time:"",task:"",notes:""},{time:"",task:"",notes:""},{time:"",task:"",notes:""},{time:"",task:"",notes:""}]}
function blankPlan(){return {Morning:blankRows(),"Late Morning":blankRows(),Afternoon:blankRows(),Evening:blankRows()}}
function getTemplateArt(key){var map={childcare:{cls:"childcare",emoji:"🍼",title:"Baby / Childcare",sub:"Fixed visual for families who mainly need newborn, baby or child support."},elderly:{cls:"elderly",emoji:"👵",title:"Elderly Care",sub:"Fixed visual for companionship, daily support and elderly-care routines."},housework:{cls:"housework",emoji:"🧹",title:"Housework & Cooking",sub:"Fixed visual for cleaning, organising and daily cooking routines."}};return map[key]||map.housework}
function defaultState(){return {currentTemplate:"housework",meta:{family:"",helper:"",notes:""},plans:{weekday:JSON.parse(JSON.stringify(templateData.housework)),weekend:blankPlan()}}}
var state=defaultState();
function save(){try{state.currentTemplate=currentTemplate;localStorage.setItem("readymaid_routine_planner_v11",JSON.stringify(state));document.getElementById("saveState").textContent="Saved"}catch(e){document.getElementById("saveState").textContent="Not saved"}}
function load(){try{var raw=localStorage.getItem("readymaid_routine_planner_v11");if(raw){state=JSON.parse(raw)}}catch(e){}currentTemplate=state.currentTemplate||"housework"}
function clone(x){return JSON.parse(JSON.stringify(x))}
function esc(v){return String(v==null?"":v).replace(/[&<>"']/g,function(ch){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]})}
function bindMeta(id,key){document.getElementById(id).addEventListener("input",function(){state.meta[key]=this.value;save();renderPreview()})}
function renderEditor(){
  document.getElementById("familyInput").value=state.meta.family||"";document.getElementById("helperInput").value=state.meta.helper||"";document.getElementById("notesInput").value=state.meta.notes||"";document.getElementById("templateSelect").value=currentTemplate;
  var html="";sectionNames.forEach(function(sec){var rows=state.plans[currentPlan][sec]||[];html+='<div class="section"><div class="section-head"><strong>'+sectionCN[sec]+' · '+sec+'</strong><button class="small-btn add-btn" data-sec="'+sec+'">+ Add task</button></div>';if(!rows.length){html+='<div style="padding:12px;color:#66788f;font-size:13px">No tasks yet. Click + Add task.</div>'}else{rows.forEach(function(row,i){html+='<div class="task-row"><input class="time-input" data-sec="'+sec+'" data-i="'+i+'" placeholder="Time" value="'+esc(row.time)+'"><input class="task-input" data-sec="'+sec+'" data-i="'+i+'" placeholder="Task" value="'+esc(row.task)+'"><input class="notes-input" data-sec="'+sec+'" data-i="'+i+'" placeholder="Notes (optional)" value="'+esc(row.notes)+'"><button class="delete-btn del-btn" data-sec="'+sec+'" data-i="'+i+'">×</button></div>'})}html+='</div>'});document.getElementById("sectionRoot").innerHTML=html;
  Array.prototype.forEach.call(document.querySelectorAll(".add-btn"),function(btn){btn.onclick=function(){var sec=btn.getAttribute("data-sec");state.plans[currentPlan][sec].push({time:"",task:"",notes:""});save();renderEditor()}});
  Array.prototype.forEach.call(document.querySelectorAll(".del-btn"),function(btn){btn.onclick=function(){var sec=btn.getAttribute("data-sec"),i=parseInt(btn.getAttribute("data-i"),10);state.plans[currentPlan][sec].splice(i,1);save();renderEditor()}});
  [[".time-input","time"],[".task-input","task"],[".notes-input","notes"]].forEach(function(pair){Array.prototype.forEach.call(document.querySelectorAll(pair[0]),function(inp){inp.oninput=function(){var sec=inp.getAttribute("data-sec"),i=parseInt(inp.getAttribute("data-i"),10);state.plans[currentPlan][sec][i][pair[1]]=inp.value;save();renderPreview()}})});
  Array.prototype.forEach.call(document.querySelectorAll("[data-plan]"),function(btn){if(btn.getAttribute("data-plan")===currentPlan){btn.style.background="linear-gradient(135deg,var(--blue),var(--purple))";btn.style.color="#fff";btn.style.borderColor="transparent"}else{btn.style.background="#fff";btn.style.color="var(--navy)";btn.style.borderColor="var(--line)"}})
}
function renderPreview(){
  var family=state.meta.family||"—",helper=state.meta.helper||"—",notes=state.meta.notes||"—";document.getElementById("tableFamily").textContent=family;document.getElementById("tableHelper").textContent=helper;document.getElementById("tableNotes").textContent=notes;document.getElementById("posterFamily").textContent=family;document.getElementById("posterHelper").textContent=helper;document.getElementById("posterNotes").textContent=notes;
  var tableHtml="",posterHtml="";sectionNames.forEach(function(sec){var rows=(state.plans[currentPlan][sec]||[]).filter(function(r){return r.time||r.task||r.notes});tableHtml+='<div class="table-section"><div class="table-title">'+sectionCN[sec]+' · '+sec+'</div><table class="table"><thead><tr><th>Time</th><th>Task</th><th>Notes</th></tr></thead><tbody>';if(rows.length){rows.forEach(function(r){tableHtml+='<tr><td>'+esc(r.time||"—")+'</td><td>'+esc(r.task||"—")+'</td><td>'+esc(r.notes||"")+'</td></tr>'})}else{tableHtml+='<tr><td>—</td><td>—</td><td></td></tr><tr><td>—</td><td>—</td><td></td></tr>'}tableHtml+='</tbody></table></div>';posterHtml+='<div class="poster-card"><div class="head">'+sectionCN[sec]+' · '+sec+'</div><div class="body">';if(rows.length){rows.forEach(function(r){posterHtml+='<div class="poster-item"><div class="poster-time">'+esc(r.time||"—")+'</div><div><div class="poster-task">'+esc(r.task||"—")+'</div>'+(r.notes?'<div class="poster-notes">'+esc(r.notes)+'</div>':'')+'</div></div>'})}else{posterHtml+='<div style="color:#66788f;font-size:12px">No tasks yet.</div>'}posterHtml+='</div></div>'});document.getElementById("tableSections").innerHTML=tableHtml;document.getElementById("posterSections").innerHTML=posterHtml;var box=document.getElementById("posterPhotoBox"),art=getTemplateArt(currentTemplate);box.innerHTML='<div class="template-art '+art.cls+'"><div class="emoji">'+art.emoji+'</div><div class="title">'+art.title+'</div><div class="sub">'+art.sub+'</div></div>'
}
function setPrintMode(mode){var stack=document.getElementById("previewStack");stack.classList.remove("only-table","only-poster");if(mode==="table")stack.classList.add("only-table");if(mode==="poster")stack.classList.add("only-poster")}
