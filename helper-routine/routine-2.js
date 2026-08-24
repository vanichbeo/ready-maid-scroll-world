function inlineComputedStyles(source, target){
  var cs = window.getComputedStyle(source);
  for(var i=0;i<cs.length;i++){
    var prop=cs[i];
    target.style.setProperty(prop, cs.getPropertyValue(prop), cs.getPropertyPriority(prop));
  }
  var sc=source.children, tc=target.children;
  for(var j=0;j<sc.length;j++) inlineComputedStyles(sc[j],tc[j]);
}

function asciiBytes(str){
  var a=new Uint8Array(str.length);
  for(var i=0;i<str.length;i++) a[i]=str.charCodeAt(i)&255;
  return a;
}

function concatBytes(parts){
  var total=0;
  parts.forEach(function(p){total+=p.length});
  var out=new Uint8Array(total), off=0;
  parts.forEach(function(p){out.set(p,off);off+=p.length});
  return out;
}

function jpegPdfBytes(jpegBytes, imgW, imgH){
  var chunks=[], offsets=[0], size=0;
  function push(part){ if(typeof part==='string') part=asciiBytes(part); chunks.push(part); size+=part.length; }
  function obj(n, bodyParts){ offsets[n]=size; push(n+' 0 obj\n'); bodyParts.forEach(push); push('\nendobj\n'); }
  push('%PDF-1.4\n%ÿÿÿÿ\n');
  obj(1,['<< /Type /Catalog /Pages 2 0 R >>']);
  obj(2,['<< /Type /Pages /Kids [3 0 R] /Count 1 >>']);
  obj(3,['<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595.28 841.89] /Resources << /XObject << /Im0 4 0 R >> >> /Contents 5 0 R >>']);
  offsets[4]=size; push('4 0 obj\n<< /Type /XObject /Subtype /Image /Width '+imgW+' /Height '+imgH+' /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length '+jpegBytes.length+' >>\nstream\n'); push(jpegBytes); push('\nendstream\nendobj\n');
  var content='q\n595.28 0 0 841.89 0 0 cm\n/Im0 Do\nQ\n';
  obj(5,['<< /Length '+content.length+' >>\nstream\n'+content+'endstream']);
  var xref=size;
  push('xref\n0 6\n0000000000 65535 f \n');
  for(var i=1;i<=5;i++) push(String(offsets[i]).padStart(10,'0')+' 00000 n \n');
  push('trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n'+xref+'\n%%EOF');
  return concatBytes(chunks);
}

async function directDownloadPDF(){
  var status=document.getElementById('saveState');
  try{
    if(status) status.textContent='Creating PDF…';

    var W=1240,H=1754;
    var canvas=document.createElement('canvas');
    canvas.width=W; canvas.height=H;
    var ctx=canvas.getContext('2d');
    ctx.fillStyle='#ffffff'; ctx.fillRect(0,0,W,H);

    function roundRect(x,y,w,h,r,fill,stroke){
      ctx.beginPath();
      if(ctx.roundRect){ctx.roundRect(x,y,w,h,r);}
      else{
        ctx.moveTo(x+r,y);ctx.lineTo(x+w-r,y);ctx.quadraticCurveTo(x+w,y,x+w,y+r);
        ctx.lineTo(x+w,y+h-r);ctx.quadraticCurveTo(x+w,y+h,x+w-r,y+h);
        ctx.lineTo(x+r,y+h);ctx.quadraticCurveTo(x,y+h,x,y+h-r);
        ctx.lineTo(x,y+r);ctx.quadraticCurveTo(x,y,x+r,y);
      }
      if(fill){ctx.fillStyle=fill;ctx.fill();}
      if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=2;ctx.stroke();}
    }
    function wrap(text,x,y,maxWidth,lineHeight,maxLines){
      var words=String(text||'').split(/\s+/), line='', lines=[];
      for(var i=0;i<words.length;i++){
        var test=line?line+' '+words[i]:words[i];
        if(ctx.measureText(test).width>maxWidth && line){lines.push(line);line=words[i];}
        else line=test;
      }
      if(line) lines.push(line);
      if(maxLines) lines=lines.slice(0,maxLines);
      for(var j=0;j<lines.length;j++) ctx.fillText(lines[j],x,y+j*lineHeight);
      return y+lines.length*lineHeight;
    }
    function loadImg(src){
      return new Promise(function(resolve,reject){
        var im=new Image(); im.onload=function(){resolve(im)}; im.onerror=reject; im.src=src;
      });
    }
    function cleanLogoImage(im){
      var c=document.createElement('canvas'); c.width=im.naturalWidth||im.width; c.height=im.naturalHeight||im.height;
      var cctx=c.getContext('2d'); cctx.drawImage(im,0,0);
      var d=cctx.getImageData(0,0,c.width,c.height), px=d.data;
      for(var i=0;i<px.length;i+=4){
        var r=px[i],g=px[i+1],b=px[i+2],mx=Math.max(r,g,b),mn=Math.min(r,g,b),spread=mx-mn,avg=(r+g+b)/3;
        if(avg>=250 && spread<=6){px[i+3]=0;}
        else if(avg>=242 && spread<=9){px[i+3]=Math.round((250-avg)/8*255);}
      }
      cctx.putImageData(d,0,0); return c;
    }

    var logoEl=document.querySelector('.rmh-logo, .p-logo, .logo');
    if(!logoEl) throw new Error('Ready Maid logo element not found');
    var rawLogo=await loadImg(logoEl.src);
    var logo=cleanLogoImage(rawLogo);
    ctx.drawImage(logo,65,38,360,150);

    roundRect(930,60,245,58,18,'#fff','#cfdbeb');
    ctx.fillStyle='#0a2d66';ctx.font='700 24px Arial';
    ctx.fillText('Licence C · JTKSM',958,97);

    ctx.strokeStyle='#edf2f8';ctx.lineWidth=3;
    ctx.beginPath();ctx.moveTo(65,215);ctx.lineTo(1175,215);ctx.stroke();

    // Top left summary
    roundRect(65,245,520,282,24,'#f9fbfe','#dce6f2');
    ctx.fillStyle='#0a2d66';ctx.font='700 58px Arial';
    ctx.fillText('Daily Routine',95,327);
    ctx.fillStyle='#0b78d4';ctx.fillText('Overview',95,392);
    ctx.fillStyle='#66788f';ctx.font='19px Arial';
    wrap('This visual version is easier to share with the helper. The same timetable content is shown in a cleaner poster style.',95,423,440,24,2);

    roundRect(95,488,210,34,10,'#f7f9fd','#e4ebf4');
    roundRect(320,488,210,34,10,'#f7f9fd','#e4ebf4');
    ctx.fillStyle='#66788f';ctx.font='700 16px Arial';
    ctx.fillText('FAMILY',110,480);ctx.fillText('HELPER',335,480);
    ctx.fillStyle='#193862';ctx.font='700 21px Arial';
    ctx.fillText(state.meta.family||'—',110,514);
    ctx.fillText(state.meta.helper||'—',335,514);

    // Template visual block
    roundRect(610,245,565,282,24,'#eef7ff','#dce6f2');
    var art=getTemplateArt(currentTemplate);
    ctx.textAlign='center';
    ctx.font='78px Arial';ctx.fillText(art.emoji,892,348);
    ctx.fillStyle='#0a2d66';ctx.font='700 34px Arial';ctx.fillText(art.title,892,409);
    ctx.fillStyle='#66788f';ctx.font='20px Arial';
    wrap(art.sub,892,452,350,27,3);
    ctx.textAlign='left';

    // Four routine blocks
    var positions=[[65,555],[630,555],[65,930],[630,930]];
    var cardW=545,cardH=350;
    sectionNames.forEach(function(sec,idx){
      var x=positions[idx][0], y=positions[idx][1];
      roundRect(x,y,cardW,cardH,20,'#fff','#dce6f2');
      var grad=ctx.createLinearGradient(x,y,x+cardW,y);
      grad.addColorStop(0,'#0b78d4');grad.addColorStop(1,'#7446d8');
      ctx.fillStyle=grad;ctx.fillRect(x,y,cardW,62);
      ctx.fillStyle='#fff';ctx.font='700 27px Arial';
      ctx.fillText(sectionCN[sec]+' · '+sec,x+22,y+41);

      var rows=state.plans[currentPlan][sec].filter(function(r){return r.time||r.task||r.notes}).slice(0,5);
      var yy=y+105;
      rows.forEach(function(r){
        ctx.fillStyle='#0b78d4';ctx.font='700 22px Arial';
        ctx.fillText(r.time||'—',x+22,yy);
        ctx.fillStyle='#193862';ctx.font='700 21px Arial';
        wrap(r.task||'—',x+150,yy,340,27,2);
        if(r.notes){
          ctx.fillStyle='#66788f';ctx.font='18px Arial';
          wrap(r.notes,x+150,yy+29,340,22,1);
        }
        yy+=60;
      });
    });

    // Most important
    var band=ctx.createLinearGradient(65,1300,1175,1300);
    band.addColorStop(0,'#0a2d66');band.addColorStop(.55,'#0b78d4');band.addColorStop(1,'#7446d8');
    roundRect(65,1300,1110,105,18,band,null);
    ctx.fillStyle='#fff';ctx.font='700 26px Arial';ctx.fillText('Most important',85,1341);
    ctx.font='20px Arial';
    ctx.fillText('Build the habit first, then slowly reduce reminders. Keep the routine clear, simple and consistent.',85,1377);

    // Special notes
    roundRect(65,1425,1110,175,18,'#fff','#dce6f2');
    ctx.fillStyle='#193862';ctx.font='700 24px Arial';
    ctx.fillText('Special Notes / 特别备注',85,1465);
    ctx.font='20px Arial';wrap(state.meta.notes||'—',85,1503,1040,29,3);

    ctx.fillStyle='#66788f';ctx.font='18px Arial';ctx.textAlign='right';
    ctx.fillText('Ready Maid Agency · Chat with us on WhatsApp',1170,1645);
    ctx.textAlign='left';

    // Create one-page PDF with the rendered A4 image.
    var jpgData=canvas.toDataURL('image/jpeg',0.94).split(',')[1];
    var bin=atob(jpgData),jpg=new Uint8Array(bin.length);
    for(var k=0;k<bin.length;k++) jpg[k]=bin.charCodeAt(k);
    var pdfBytes=jpegPdfBytes(jpg,W,H);
    var pdfBlob=new Blob([pdfBytes],{type:'application/pdf'});
    var url=URL.createObjectURL(pdfBlob);
    var a=document.createElement('a');
    a.href=url;
    a.download='Ready_Maid_Helper_Routine.pdf';
    a.style.display='none';
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(function(){URL.revokeObjectURL(url)},3000);
    if(status) status.textContent='PDF downloaded';
  }catch(err){
    console.error(err);
    if(status) status.textContent='Download failed: '+(err&&err.message?err.message:'Unknown error');
  }
}
function bindClick(id, fn){
  var el = document.getElementById(id);
  if(el){ el.onclick = fn; }
}
