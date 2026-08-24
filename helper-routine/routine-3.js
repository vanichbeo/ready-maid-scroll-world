function setup(){
  load();renderEditor();renderPreview();bindMeta("familyInput","family");bindMeta("helperInput","helper");bindMeta("notesInput","notes");
  Array.prototype.forEach.call(document.querySelectorAll("[data-plan]"),function(btn){btn.onclick=function(){currentPlan=btn.getAttribute("data-plan");renderEditor();renderPreview()}});
  bindClick("resetBtn",function(){if(confirm("Reset the whole planner?")){state=defaultState();currentPlan="weekday";try{localStorage.removeItem("readymaid_routine_planner_v11")}catch(e){}renderEditor();renderPreview();save()}});
  document.getElementById("templateSelect").onchange=function(){var v=this.value;currentTemplate=v;state.currentTemplate=currentTemplate;state.plans[currentPlan]=clone(templateData[v]);save();renderEditor();renderPreview()};
  document.getElementById("zoomSelect").onchange=function(){document.getElementById("previewStack").style.transform="scale("+this.value+")"};document.getElementById("previewStack").style.transform="scale(0.9)";
  bindClick("bothBtn",function(){setPrintMode("both")});bindClick("tableOnlyBtn",function(){setPrintMode("table")});bindClick("posterOnlyBtn",function(){setPrintMode("poster")});
  bindClick("downloadBothTop",directDownloadPDF);bindClick("downloadPdfBtn",directDownloadPDF);
}
setup();
