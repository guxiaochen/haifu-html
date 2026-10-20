(function(){
  var cfg=window.ContractAppConfig||{};
  var role=cfg.role||'client';
  var labels={client:'客户',platform:'平台',supplier:'供应商'};
  var ownLabel=labels[role],primary=role==='supplier'?'#1890ff':'#2BA471';
  var storage={platform:'platformContractTemplates',client:'clientContractTemplates',supplier:'supplierContractTemplates'};
  var contractKey=role+'BasicContractsV1';
  var templates={
    platform:[
      {id:'pt-framework',name:'平台框架合同模板',type:'framework',source:'平台',fileName:'平台框架合同模板.doc',content:'平台标准框架合同模板（演示文件）'},
      {id:'pt-purchase',name:'平台采购合同模板',type:'purchase',source:'平台',fileName:'平台采购合同模板.doc',content:'平台标准采购合同模板（演示文件）'}
    ],client:[],supplier:[]
  };
  var orders=cfg.orders||[];
  var demos=cfg.demoContracts||[];
  var selectedOrders=[], detailId='',pendingContract=null;
  function esc(v){return String(v==null?'':v).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
  function getStored(key){try{var v=JSON.parse(localStorage.getItem(key)||'[]');return Array.isArray(v)?v:[]}catch(e){return []}}
  function putStored(key,v){localStorage.setItem(key,JSON.stringify(v))}
  function getTemplates(){
    var list=templates.platform.slice().concat(getStored(storage.platform));
    if(role==='platform') list=list.concat(getStored(storage.client),getStored(storage.supplier));
    else list=list.concat(getStored(storage[role]));
    return list;
  }
  function getContracts(){return demos.concat(getStored(contractKey))}
  function setModal(id,show){document.getElementById(id).classList.toggle('show',!!show)}
  function typeName(v){return v==='framework'?'框架合同':'采购合同'}
  function statusTag(v){var map={draft:'草稿',uploaded:'已上传',signing:'待我签署',signed:'已签署'};return '<span class="tag tag-'+esc(v||'draft')+'">'+(map[v]||'草稿')+'</span>'}
  function actionText(c){if(c.status==='signing')return '<a onclick="ContractBasic.goSign(\''+c.id+'\')">去签署</a>';return '<a onclick="ContractBasic.previewContract(\''+c.id+'\')">预览</a><a onclick="ContractBasic.openDetail(\''+c.id+'\')">查看</a><a onclick="ContractBasic.download(\''+c.id+'\')">下载</a>'}
  function renderContracts(){
    var q=(document.getElementById('contractSearch').value||'').toLowerCase(), st=document.getElementById('contractStatus').value;
    var list=getContracts().filter(function(c){return (!q||(c.no+c.name+c.partyA+c.partyB+(c.orders||'')).toLowerCase().indexOf(q)>=0)&&(!st||c.status===st)});
    document.getElementById('contractBody').innerHTML=list.length?list.map(function(c){return '<tr><td>'+esc(c.no)+'</td><td>'+esc(c.name)+'</td><td>'+typeName(c.type)+'</td><td>'+esc(c.partyA)+' / '+esc(c.partyB)+'</td><td>'+esc(c.orders||'未关联订单')+'</td><td>'+esc(c.fileName||'未上传')+'</td><td>'+statusTag(c.status)+'</td><td>'+esc(c.updated)+'</td><td class="actions">'+actionText(c)+'</td></tr>'}).join(''):'<tr><td colspan="9" class="empty">暂无合同记录</td></tr>';
  }
  function renderTemplates(){
    var list=getTemplates();
    document.getElementById('templateGrid').innerHTML=list.map(function(t){var canDelete=t.source===ownLabel;return '<div class="template"><h3>'+esc(t.name)+'</h3><p>'+esc(t.source)+'上传 · '+typeName(t.type)+'</p><p class="file">'+esc(t.fileName||'未命名文件')+'</p><div class="template-foot"><span>支持在线预览</span><span class="template-actions"><a onclick="ContractBasic.previewTemplate(\''+t.id+'\')">预览</a><a onclick="ContractBasic.downloadTemplate(\''+t.id+'\')">下载</a>'+(canDelete?'<a onclick="ContractBasic.removeTemplate(\''+t.id+'\')">删除</a>':'')+'</span></div></div>'}).join('');
  }
  function syncOrderArea(){var type=document.getElementById('contractType').value;var wrap=document.getElementById('orderSelector');wrap.style.display=type==='purchase'?'block':'none';if(type!=='purchase')selectedOrders=[];renderOrderChoices()}
  function renderOrderChoices(){var target=document.getElementById('orderChoices');if(!target)return;var q=(document.getElementById('orderSearch').value||'').toLowerCase();var list=orders.filter(function(o){return !q||(o.no+o.name).toLowerCase().indexOf(q)>=0});target.innerHTML=list.map(function(o){return '<tr><td><input type="checkbox" '+(selectedOrders.indexOf(o.no)>=0?'checked':'')+' onchange="ContractBasic.toggleOrder(\''+o.no+'\',this.checked)"></td><td>'+esc(o.no)+'</td><td>'+esc(o.name)+'</td><td>'+esc(o.status)+'</td><td>'+esc(o.amount)+'</td></tr>'}).join('')||'<tr><td colspan="5" class="empty">暂无可关联订单</td></tr>'}
  function refreshPartyHint(){var rel=document.getElementById('contractRelation').value;var a=document.getElementById('partyA'),b=document.getElementById('partyB');if(rel==='customer-platform'){a.value=role==='client'?'当前客户':'客户企业';b.value='海赋（山东）数字产业发展有限公司'}else if(rel==='platform-supplier'){a.value='海赋（山东）数字产业发展有限公司';b.value=role==='supplier'?'当前供应商':'供应商企业'}else{a.value='甲方企业';b.value='乙方企业'}}
  function openCreate(){selectedOrders=[];pendingContract=null;document.getElementById('contractName').value='';document.getElementById('contractType').value='purchase';document.getElementById('contractRelation').value=role==='supplier'?'platform-supplier':'customer-platform';document.getElementById('contractFile').value='';document.getElementById('contractFileName').textContent='尚未选择文件';document.getElementById('orderSearch').value='';refreshPartyHint();syncOrderArea();var note=document.querySelector('#createModal .selection-note'),next=document.querySelector('#createModal .modal-foot .btn-primary');if(note)note.textContent='框架合同可不关联订单；采购合同需关联已确定的订单。下一步可在线编辑本次合同草稿，不会修改原合同模板。';if(next)next.textContent='下一步：在线编辑';setModal('createModal',true)}
  function fileSelected(input,textId){var f=input.files&&input.files[0];document.getElementById(textId).textContent=f?f.name:'尚未选择文件'}
  function createContract(){
    var name=document.getElementById('contractName').value.trim(),type=document.getElementById('contractType').value,a=document.getElementById('partyA').value.trim(),b=document.getElementById('partyB').value.trim(),file=document.getElementById('contractFile').files[0];
    if(!name||!a||!b){alert('请填写合同名称与甲乙方');return}
    if(type==='purchase'&&!selectedOrders.length){alert('采购合同请选择关联采购订单');return}
    if(!file){alert('请上传已填写完整的合同文件');return}
    pendingContract={id:'c-'+Date.now(),no:'HT'+Date.now().toString().slice(-8),name:name,type:type,partyA:a,partyB:b,orders:type==='purchase'?selectedOrders.join('、'):'',fileName:file.name,revisionFileName:'',bindings:[]};
    setModal('createModal',false);openEditor();
  }
  function editorStyles(){
    if(document.getElementById('contractEditorStyles'))return;
    var style=document.createElement('style');style.id='contractEditorStyles';style.textContent=''
      +'.contract-editor-modal{width:min(1180px,calc(100% - 28px))}.contract-editor-modal .modal-body{max-height:70vh;padding:0;overflow:hidden}.contract-editor-layout{display:grid;grid-template-columns:210px minmax(0,1fr);min-height:570px;background:#f7f9fb}.field-palette{padding:18px 15px;background:#fff;border-right:1px solid #e5eaf0}.field-palette h3{margin:0 0 7px;font-size:15px}.field-palette p{margin:0 0 14px;color:#98a2b3;font-size:12px;line-height:1.6}.drag-field{display:block;width:100%;padding:9px 10px;margin:8px 0;border:1px dashed #9dd9bd;border-radius:5px;background:#f0faf5;color:#237b58;text-align:left;cursor:grab;font:inherit}.drag-field:active{cursor:grabbing}.editor-workspace{padding:18px;overflow:auto}.editor-tip{margin-bottom:12px;padding:9px 12px;border-radius:5px;background:#eff8ff;color:#1769aa;font-size:12px}.contract-paper{width:min(760px,100%);min-height:480px;margin:0 auto;padding:42px 50px;background:#fff;border:1px solid #e2e8f0;box-shadow:0 3px 13px #172b4d12;color:#344054;line-height:2;outline:none}.contract-paper h2{text-align:center;margin:0 0 24px;font-size:22px;color:#243044}.contract-paper:focus{border-color:'+primary+'}.contract-token{display:inline-block;margin:0 2px;padding:1px 6px;border-radius:3px;background:#e8f7ef;color:#237b58;font-size:13px;line-height:1.7;vertical-align:baseline;user-select:none}.editor-file-line{margin-top:14px;font-size:12px;color:#667085}.editor-file-line input{margin-left:8px}.binding-count{margin-top:14px;padding-top:12px;border-top:1px solid #edf0f2;color:#667085;font-size:12px}@media(max-width:760px){.contract-editor-layout{grid-template-columns:1fr}.field-palette{border-right:0;border-bottom:1px solid #e5eaf0}.drag-field{display:inline-block;width:auto;margin:4px}.contract-paper{padding:28px 22px}}';document.head.appendChild(style);
  }
  function ensureEditor(){
    if(document.getElementById('contractEditorModal'))return;
    editorStyles();
    var mask=document.createElement('div');mask.className='modal-mask';mask.id='contractEditorModal';mask.innerHTML='<div class="modal contract-editor-modal"><div class="modal-head"><span>在线编辑合同 · 第二步</span><button class="close" onclick="ContractBasic.closeEditor()">×</button></div><div class="modal-body"><div class="contract-editor-layout"><aside class="field-palette"><h3>本次合同字段</h3><p>拖拽字段到右侧合同正文的具体位置；也可点击字段后插入光标处。</p><button class="drag-field" draggable="true" data-field="partyA">甲方名称</button><button class="drag-field" draggable="true" data-field="partyB">乙方名称</button><button class="drag-field" draggable="true" data-field="orders">订单明细</button><button class="drag-field" draggable="true" data-field="amount">合同金额</button><div class="binding-count" id="bindingCount">已绑定 0 个字段</div></aside><section class="editor-workspace"><div class="editor-tip">合同文件来自：<b id="editorSourceFile"></b>。正文仅编辑当前合同草稿，不会修改原合同模板。</div><article id="contractPaper" class="contract-paper" contenteditable="true" aria-label="合同正文编辑区"></article><div class="editor-file-line">下载后可线下修订并上传：<input id="editorRevisionFile" type="file" accept=".doc,.docx,.pdf,.jpg,.jpeg,.png" onchange="ContractBasic.editorRevisionSelected(this)"><span id="editorRevisionName">尚未上传修订稿</span></div></section></div></div><div class="modal-foot"><button class="btn" onclick="ContractBasic.backToCreate()">返回第一步</button><button class="btn" onclick="ContractBasic.downloadDraft()">下载本次草稿</button><button class="btn btn-primary" onclick="ContractBasic.finishCreate()">保存合同草稿</button></div></div>';
    document.body.appendChild(mask);
    document.querySelectorAll('#contractEditorModal .drag-field').forEach(function(button){button.addEventListener('dragstart',function(e){e.dataTransfer.setData('text/plain',button.dataset.field);e.dataTransfer.effectAllowed='copy'});button.addEventListener('click',function(){insertField(button.dataset.field)})});
    var paper=document.getElementById('contractPaper');paper.addEventListener('dragover',function(e){e.preventDefault();e.dataTransfer.dropEffect='copy'});paper.addEventListener('drop',function(e){e.preventDefault();insertField(e.dataTransfer.getData('text/plain'),e.clientX,e.clientY)});
  }
  function fieldLabel(field){return {partyA:'甲方名称',partyB:'乙方名称',orders:'订单明细',amount:'合同金额'}[field]||field}
  function fieldValue(field){if(!pendingContract)return '';if(field==='partyA')return pendingContract.partyA;if(field==='partyB')return pendingContract.partyB;if(field==='orders')return pendingContract.orders||'未关联订单';if(field==='amount')return pendingContract.orders?'关联订单金额':'待填写';return ''}
  function insertField(field,x,y){
    if(!field||!pendingContract)return;var paper=document.getElementById('contractPaper'),token=document.createElement('span');token.className='contract-token';token.contentEditable='false';token.dataset.field=field;token.textContent='【'+fieldLabel(field)+'：'+fieldValue(field)+'】';
    var range=null;if(typeof x==='number'&&document.caretRangeFromPoint)range=document.caretRangeFromPoint(x,y);else{var sel=window.getSelection();if(sel&&sel.rangeCount&&paper.contains(sel.getRangeAt(0).commonAncestorContainer))range=sel.getRangeAt(0)}
    if(range){range.insertNode(token);range.setStartAfter(token);range.collapse(true);var selection=window.getSelection();selection.removeAllRanges();selection.addRange(range)}else{paper.appendChild(token);paper.appendChild(document.createTextNode(' '))}
    pendingContract.bindings.push(field);updateBindingCount();paper.focus();
  }
  function updateBindingCount(){var el=document.getElementById('bindingCount');if(el)el.textContent='已绑定 '+(pendingContract?pendingContract.bindings.length:0)+' 个字段'}
  function editorContent(){return '<h2>'+esc(pendingContract.name)+'</h2><p>甲方：______________________________</p><p>乙方：______________________________</p><p>甲、乙双方经协商一致，就本次合作事项达成如下约定：</p><p>一、合同相关订单及产品明细：</p><p style="min-height:92px;border:1px dashed #d9e0e7;padding:12px;color:#98a2b3">将“订单明细”拖拽至此处，可按需编辑合同正文。</p><p>二、合同金额：______________________________</p><p>三、其他约定：</p><p style="min-height:72px">____________________________________________</p><p style="margin-top:50px">甲方（签章）：　　　　　　　　　乙方（签章）：</p>'}
  function openEditor(){ensureEditor();document.getElementById('editorSourceFile').textContent=pendingContract.fileName;document.getElementById('editorRevisionFile').value='';document.getElementById('editorRevisionName').textContent='尚未上传修订稿';document.getElementById('contractPaper').innerHTML=editorContent();updateBindingCount();setModal('contractEditorModal',true)}
  function closeEditor(){setModal('contractEditorModal',false);pendingContract=null}
  function backToCreate(){setModal('contractEditorModal',false);setModal('createModal',true)}
  function editorRevisionSelected(input){var f=input.files&&input.files[0];if(!pendingContract)return;pendingContract.revisionFileName=f?f.name:'';document.getElementById('editorRevisionName').textContent=f?'已选择修订稿：'+f.name:'尚未上传修订稿'}
  function draftText(){if(!pendingContract)return '';var paper=document.getElementById('contractPaper');return paper?paper.innerText:'合同草稿'}
  function downloadDraft(){if(!pendingContract)return;downloadText(pendingContract.name+'-合同草稿.doc',draftText())}
  function finishCreate(){
    if(!pendingContract)return;var list=getStored(contractKey),record={id:pendingContract.id,no:pendingContract.no,name:pendingContract.name,type:pendingContract.type,partyA:pendingContract.partyA,partyB:pendingContract.partyB,orders:pendingContract.orders,fileName:pendingContract.revisionFileName||pendingContract.fileName,content:draftText(),bindings:pendingContract.bindings,status:'draft',updated:new Date().toLocaleString('zh-CN')};
    list.push(record);putStored(contractKey,list);setModal('contractEditorModal',false);pendingContract=null;renderContracts();alert('合同草稿已保存，可在合同详情继续下载、上传修订稿并发起后续签署。');
  }
  function findContract(id){return getContracts().find(function(c){return c.id===id})}
  function openDetail(id){var c=findContract(id);if(!c)return;detailId=id;document.querySelector('#detailModal .modal-head span').textContent='合同详情';document.getElementById('detailBody').innerHTML='<div class="detail-grid"><div><label>合同编号</label><b>'+esc(c.no)+'</b></div><div><label>合同类型</label><b>'+typeName(c.type)+'</b></div><div><label>甲方</label><b>'+esc(c.partyA)+'</b></div><div><label>乙方</label><b>'+esc(c.partyB)+'</b></div><div><label>关联订单</label><b>'+esc(c.orders||'未关联订单（框架合同）')+'</b></div><div><label>当前文件</label><b>'+esc(c.fileName||'未上传')+'</b></div></div><div class="file-panel"><div><strong>合同文件</strong><p>'+esc(c.fileName||'未上传合同文件')+'</p></div><span><button class="btn" onclick="ContractBasic.previewContract(\''+c.id+'\')">在线预览</button><button class="btn" onclick="ContractBasic.download(\''+c.id+'\')">下载文件</button></span></div><div class="replace-file"><label>上传修改后的合同文件</label><input id="replaceFile" type="file" accept=".doc,.docx,.pdf,.jpg,.jpeg,.png"><button class="btn btn-primary" onclick="ContractBasic.replaceFile()">上传并替换</button></div>';
    setModal('detailModal',true);
  }
  function replaceFile(){var f=document.getElementById('replaceFile').files[0];if(!f){alert('请选择修改后的合同文件');return}var list=getStored(contractKey),c=list.find(function(x){return x.id===detailId});if(!c){alert('演示合同不可替换文件');return}c.fileName=f.name;c.content='已上传合同文件：'+f.name;c.status='uploaded';c.updated=new Date().toLocaleString('zh-CN');putStored(contractKey,list);setModal('detailModal',false);renderContracts();alert('合同文件已更新。')}
  function previewFile(title,fileName,meta){document.querySelector('#detailModal .modal-head span').textContent='在线预览';document.getElementById('detailBody').innerHTML='<div style="background:#f7f8fa;padding:18px"><div style="max-width:620px;min-height:430px;margin:auto;padding:42px;background:#fff;border:1px solid #e5e7eb;box-shadow:0 2px 9px #172b4d10"><div style="display:flex;justify-content:space-between;border-bottom:2px solid '+primary+';padding-bottom:12px;color:'+primary+'"><b>合同文件预览</b><span style="font-size:12px;color:#98a2b3">原型演示</span></div><h2 style="text-align:center;margin:42px 0 28px;font-size:21px;color:#243044">'+esc(title)+'</h2><p style="line-height:2;color:#475467"><b>文件名称：</b>'+esc(fileName||'未上传合同文件')+'</p><p style="line-height:2;color:#475467">'+esc(meta||'当前合同文件')+'</p><div style="margin-top:42px;padding:14px;background:#f8fafc;color:#667085;line-height:1.8">当前原型以合同文件页形式模拟在线预览。实际系统接入文件预览服务后，可展示 Word、PDF 或图片的真实内容。</div></div></div>';setModal('detailModal',true)}
  function previewContract(id){var c=findContract(id);if(c)previewFile(c.name,c.fileName,'合同编号：'+c.no+'　｜　'+typeName(c.type))}
  function downloadText(fileName,content){var blob=new Blob([content||'合同文件（原型演示）'],{type:'text/plain;charset=utf-8'}),url=URL.createObjectURL(blob),a=document.createElement('a'),safe=String(fileName||'合同文件').replace(/\.[^.]+$/,'')+'-演示下载.txt';a.href=url;a.download=safe;document.body.appendChild(a);a.click();a.remove();setTimeout(function(){URL.revokeObjectURL(url)},600)}
  function download(id){var c=findContract(id);if(c)downloadText(c.fileName||c.no+'.txt',c.content)}
  function openTemplate(){document.getElementById('templateName').value='';document.getElementById('templateType').value='purchase';document.getElementById('templateFile').value='';document.getElementById('templateFileName').textContent='尚未选择文件';setModal('templateModal',true)}
  function saveTemplate(){var name=document.getElementById('templateName').value.trim(),type=document.getElementById('templateType').value,file=document.getElementById('templateFile').files[0];if(!name||!file){alert('请填写模板名称并选择模板文件');return}var list=getStored(storage[role]);list.push({id:'t-'+Date.now(),name:name,type:type,source:ownLabel,fileName:file.name,content:'合同模板文件：'+file.name});putStored(storage[role],list);setModal('templateModal',false);renderTemplates()}
  function previewTemplate(id){var t=getTemplates().find(function(x){return x.id===id});if(t)previewFile(t.name,t.fileName,t.source+'上传　｜　'+typeName(t.type)+'模板')}
  function downloadTemplate(id){var t=getTemplates().find(function(x){return x.id===id});if(t)downloadText(t.fileName||t.name+'.txt',t.content)}
  function removeTemplate(id){var list=getStored(storage[role]).filter(function(t){return t.id!==id});putStored(storage[role],list);renderTemplates()}
  function switchTab(name,el){document.querySelectorAll('.tab').forEach(function(t){t.classList.toggle('active',t===el)});document.getElementById('contractsPanel').style.display=name==='contracts'?'block':'none';document.getElementById('templatesPanel').style.display=name==='templates'?'block':'none';if(name==='templates')renderTemplates()}
  function goSign(id){openDetail(id)}
  window.ContractBasic={renderContracts:renderContracts,renderTemplates:renderTemplates,openCreate:openCreate,close:function(id){setModal(id,false)},switchTab:switchTab,syncOrderArea:syncOrderArea,refreshPartyHint:refreshPartyHint,renderOrderChoices:renderOrderChoices,toggleOrder:function(no,on){if(on&&selectedOrders.indexOf(no)<0)selectedOrders.push(no);if(!on)selectedOrders=selectedOrders.filter(function(x){return x!==no})},fileSelected:fileSelected,createContract:createContract,closeEditor:closeEditor,backToCreate:backToCreate,editorRevisionSelected:editorRevisionSelected,downloadDraft:downloadDraft,finishCreate:finishCreate,openDetail:openDetail,previewContract:previewContract,previewTemplate:previewTemplate,replaceFile:replaceFile,download:download,openTemplate:openTemplate,saveTemplate:saveTemplate,downloadTemplate:downloadTemplate,removeTemplate:removeTemplate,goSign:goSign};
  renderContracts();
})();
