(function(){
const kind=document.body.dataset.kind;
const platform=[
 {id:'PT-JJ-20261106001',title:'平台自采蔬菜配送竞价',buyer:'海赋运营平台',type:'总价竞价',shipping:'配送到指定地点',settlement:'账期',deposit:'¥5,000',publisher:'平台采购部',phone:'13800000001',time:'2026-11-06 09:00 ～ 2026-11-12 18:00',deadline:'2026-11-12',status:'竞价中',supplier:'开放申请',address:'济南市历下区',remark:'按采购清单配送，需提供产地证明',list:'白菜 3,000 kg；土豆 2,000 kg'},
 {id:'PT-JJ-20261105002',title:'平台自采蔬果逐条竞价',buyer:'海赋运营平台',type:'逐条竞价',shipping:'自提',settlement:'款到发货',deposit:'¥2,000',publisher:'平台采购部',phone:'13800000002',time:'2026-11-05 10:00 ～ 2026-11-08 17:00',deadline:'2026-11-08',status:'已截止',supplier:'山东绿源农业',address:'—',remark:'各采购品类独立排名',list:'白菜 3,000 kg；白菜 3,000 kg；香蕉 3,000 kg'},
 {id:'PT-JJ-20261028003',title:'秋季粮油采购竞价',buyer:'海赋运营平台',type:'总价竞价',shipping:'配送到指定地点',settlement:'款到发货',deposit:'¥2,000',publisher:'平台采购部',phone:'13800000003',time:'2026-10-28 09:00 ～ 2026-11-02 18:00',deadline:'2026-11-02',status:'已完成',winner:'山东绿源农业',supplier:'指定供应商',address:'济南仓',remark:'—',list:'大米 5,000 kg'},
 {id:'PT-JJ-20261106004',title:'平台自采鸡蛋竞价待审核',buyer:'海赋运营平台',type:'总价竞价',shipping:'配送到指定地点',settlement:'账期',deposit:'¥3,000',publisher:'平台采购部',phone:'13800000004',time:'2026-11-06 09:00 ～ 2026-11-16 18:00',deadline:'2026-11-16',status:'审核中',supplier:'开放申请',address:'济南市历下区',remark:'待审核采购需求',list:'鸡蛋 1,000 箱'},
 {id:'PT-JJ-20261020005',title:'平台自采根茎菜竞价（已取消）',buyer:'海赋运营平台',type:'总价竞价',shipping:'自提',settlement:'款到发货',deposit:'不需要',publisher:'平台采购部',phone:'13800000005',time:'2026-10-20 09:00 ～ 2026-10-28 18:00',deadline:'2026-10-28',status:'已取消',cancelReason:'采购计划调整，本次竞价取消。',supplier:'开放申请',address:'—',remark:'—',list:'土豆 2,000 kg'},
 {id:'PT-JJ-20261015006',title:'平台自采蔬果逐条竞价（已完成）',buyer:'海赋运营平台',type:'逐条竞价',shipping:'自提',settlement:'账期',deposit:'¥2,000',publisher:'平台采购部',phone:'13800000006',time:'2026-10-15 09:00 ～ 2026-10-22 18:00',deadline:'2026-10-22',status:'已完成',winners:{'白菜-0':'山东绿源农业','白菜-1':'豫农集团'},supplier:'开放申请',address:'—',remark:'各采购品类独立排名',list:'白菜 3,000 kg；白菜 3,000 kg；香蕉 3,000 kg'},
 {id:'PT-JJ-20261010007',title:'平台自采蔬菜竞价（已驳回）',buyer:'海赋运营平台',type:'总价竞价',shipping:'自提',settlement:'款到发货',deposit:'不需要',publisher:'平台采购部',phone:'13800000007',time:'2026-10-10 09:00 ～ 2026-10-18 18:00',deadline:'2026-10-18',status:'已驳回',reject:'采购清单缺少交货规格及数量说明，请补充后重新发布。',supplier:'开放申请',address:'—',remark:'—',list:'白菜 1,000 kg'},
 {id:'PT-JJ-20261009008',title:'平台自采叶菜总价竞价（已截止）',buyer:'海赋运营平台',type:'总价竞价',shipping:'配送到指定地点',settlement:'账期',deposit:'¥2,000',publisher:'平台采购部',phone:'13800000008',time:'2026-10-09 09:00 ～ 2026-10-17 18:00',deadline:'2026-10-17',status:'已截止',supplier:'开放申请',address:'济南仓',remark:'按报价总额排名',list:'白菜 3,000 kg；生菜 1,000 kg'}
];
const customer=[
 {id:'KH-JJ-20261106001',title:'上海商超叶菜联合采购',buyer:'上海绿鲜供应链有限公司',type:'总价竞价',shipping:'配送到指定地点',settlement:'账期',deposit:'¥2,000',publisher:'王经理',phone:'13900000001',time:'2026-11-06 09:00 ～ 2026-11-15 18:00',deadline:'2026-11-15',status:'审核中',supplier:'开放申请',address:'上海市浦东新区',remark:'需保证每日供货',list:'白菜 3,000 kg；生菜 1,500 kg'},
 {id:'KH-JJ-20261103002',title:'食堂蔬菜采购',buyer:'济南市某餐饮公司',type:'逐条竞价',shipping:'自提',settlement:'款到发货',deposit:'不需要',publisher:'李经理',phone:'13900000002',time:'2026-11-03 10:00 ～ 2026-11-11 18:00',deadline:'2026-11-11',status:'竞价中',supplier:'指定供应商',address:'—',remark:'—',list:'土豆 2,000 kg；白菜 1,000 kg'},
 {id:'KH-JJ-20261030003',title:'冬季农产品联合采购',buyer:'上海绿鲜供应链有限公司',type:'总价竞价',shipping:'配送到指定地点',settlement:'账期',deposit:'¥3,000',publisher:'王经理',phone:'13900000001',time:'2026-10-30 09:00 ～ 2026-11-09 18:00',deadline:'2026-11-09',status:'已驳回',supplier:'开放申请',address:'上海仓',remark:'采购清单缺少数量说明',list:'萝卜 2,000 kg'}
];
const applications=[
 {id:'BJ-SQ-20261106001',auction:'PT-JJ-20261106001',title:'平台自采蔬菜配送竞价',origin:'平台竞价',buyer:'海赋运营平台',supplier:'山东绿源农业有限公司',time:'2026-11-06 10:56:56',reason:'有稳定蔬菜生产基地和配送能力，希望参与本次竞价。',credential:'营业执照、产地证明',status:'待平台审核'},
 {id:'BJ-SQ-20261106002',auction:'KH-JJ-20261106001',title:'上海商超叶菜联合采购',origin:'客户竞价',buyer:'上海绿鲜供应链有限公司',supplier:'豫农粮油供应链有限公司',time:'2026-11-06 11:30:12',reason:'具备长期供货经验，可按要求配送。',credential:'营业执照、食品经营许可证',status:'待平台审核'},
 {id:'BJ-SQ-20261105003',auction:'KH-JJ-20261103002',title:'食堂蔬菜采购',origin:'客户竞价',buyer:'济南市某餐饮公司',supplier:'华东生鲜配送中心',time:'2026-11-05 09:10:00',reason:'有区域配送网络。',credential:'营业执照',status:'待客户确认'},
 {id:'BJ-SQ-20261104004',auction:'PT-JJ-20261105002',title:'平台自采水果分类竞价',origin:'平台竞价',buyer:'海赋运营平台',supplier:'春晖蔬菜基地',time:'2026-11-04 15:20:00',reason:'希望参与水果品类竞价。',credential:'营业执照',status:'已拒绝',reject:'供货资质与本次采购要求不符'},
 {id:'BJ-SQ-20261106005',auction:'PT-JJ-20261106001',title:'平台自采蔬菜配送竞价',origin:'平台竞价',buyer:'海赋运营平台',supplier:'豫农粮油供应链有限公司',time:'2026-11-06 11:20:00',reason:'长期从事粮油蔬菜供应，具备稳定的生产基地和配送能力。',credential:'营业执照、食品安全认证',status:'已通过'},
 {id:'BJ-SQ-20261106006',auction:'PT-JJ-20261106001',title:'平台自采蔬菜配送竞价',origin:'平台竞价',buyer:'海赋运营平台',supplier:'华东生鲜配送中心',time:'2026-11-06 12:05:00',reason:'主要经营蔬菜批发，希望拓展新客户。',credential:'营业执照',status:'已拒绝',reject:'供货地不符合要求，且未提供相关资质证明。'}
];
window.竞价演示数据={platform,customer,applications};
if(kind==='detail')return;
let rows=kind==='platform'?platform:kind==='customer'?customer:applications;
try{const saved=JSON.parse(sessionStorage.getItem('竞价当前单据')||'null');const navigation=performance.getEntriesByType('navigation')[0];if(navigation&&navigation.type==='reload')sessionStorage.removeItem('竞价当前单据');else if(saved){const pos=rows.findIndex(x=>x.id===saved.id);if(pos>=0)rows[pos]=saved}}catch(e){}
const $=s=>document.querySelector(s);const esc=s=>String(s??'—').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const tag=s=>'<span class="tag '+(s.includes('驳回')||s.includes('拒绝')?'red':s.includes('审核')?'orange':s.includes('截止')||s.includes('取消')?'gray':'')+'">'+esc(s)+'</span>';
let shown=rows.slice(),selected=null,uploadedMaterials=[],page=1;
if(kind==='platform')$('#status').insertAdjacentHTML('beforeend','<option>审核中</option><option>已驳回</option>');
function render(){
 const body=$('#rows');body.innerHTML=shown.length?shown.map((r,i)=>kind==='application'?`<tr><td>${esc(r.id)}<br><span class="muted">${esc(r.title)}</span></td><td>${esc(r.origin)}</td><td>${esc(r.buyer)}</td><td>${esc(r.supplier)}</td><td>${esc(r.time)}</td><td class="wrap">${esc(r.reason)}</td><td class="wrap">${esc(r.credential)}</td><td>${tag(r.status)}</td><td><button class="link" data-action="detail" data-i="${i}">详情</button>${r.status==='待平台审核'?`<button class="link" data-action="audit" data-i="${i}">审核</button>`:''}</td></tr>`:`<tr><td>${esc(r.id)}<br><span class="muted">${esc(r.title)}</span></td><td class="wrap">${esc(r.buyer)}</td><td>${esc(r.type)}</td><td>${esc(r.shipping)}</td><td>${esc(r.settlement)}</td><td>${esc(r.deposit)}</td><td>${esc(r.publisher)}</td><td>${esc(r.phone)}</td><td>${esc(r.time)}</td><td>${tag(r.status)}</td><td><button class="link" data-action="detail" data-i="${i}">详情</button>${kind==='customer'&&r.status==='审核中'?`<button class="link" data-action="audit" data-i="${i}">审核</button>`:''}${r.status==='已截止'?`<button class="link" data-action="rank" data-i="${i}">查看报价</button>`:''}</td></tr>`).join(''):'<tr><td colspan="11" class="empty">当前筛选条件下暂无数据</td></tr>';
 if($('#count'))$('#count').textContent=`共 ${shown.length} 条`;
 if($('#stats')){const names=kind==='application'?['申请总数','待平台审核','待客户确认','已通过','已拒绝']:kind==='platform'?['全部竞价','竞价中','已截止','已完成','审核中','已取消','已驳回']:['全部竞价','审核中','已驳回','竞价中','已截止','已完成'];$('#stats').innerHTML=names.map(n=>`<div class="stat"><b>${n===names[0]?rows.length:rows.filter(x=>x.status===n).length}</b><span>${n}</span></div>`).join('')}
}
function modal(title,content,buttons,small=false){$('#modalTitle').textContent=title;$('#modalBody').innerHTML=content;$('#modalFoot').innerHTML=buttons;$('#overlay').classList.add('show');$('#dialog').classList.toggle('small',small)}
function close(){ $('#overlay').classList.remove('show');$('#modalBody').innerHTML='';$('#dialog').classList.remove('publish-modal');selected=null;uploadedMaterials=[] }
function detail(r){modal(kind==='application'?'报价申请详情':'竞价详情',kind==='application'?`<dl class="detailgrid"><dt>申请编号</dt><dd>${esc(r.id)}</dd><dt>来源竞价</dt><dd>${esc(r.origin)}</dd><dt>竞价标题</dt><dd>${esc(r.title)}</dd><dt>竞价编号</dt><dd>${esc(r.auction)}</dd><dt>采购方</dt><dd>${esc(r.buyer)}</dd><dt>申请供应商</dt><dd>${esc(r.supplier)}</dd><dt>申请时间</dt><dd>${esc(r.time)}</dd><dt>申请状态</dt><dd>${tag(r.status)}</dd><dt>申请理由</dt><dd>${esc(r.reason)}</dd><dt>已有资质</dt><dd>${esc(r.credential)}</dd>${r.reject?`<dt>驳回原因</dt><dd>${esc(r.reject)}</dd>`:''}</dl>`:`<dl class="detailgrid"><dt>竞价编号</dt><dd>${esc(r.id)}</dd><dt>竞价标题</dt><dd>${esc(r.title)}</dd><dt>采购方</dt><dd>${esc(r.buyer)}</dd><dt>竞价状态</dt><dd>${tag(r.status)}</dd><dt>竞价类型</dt><dd>${esc(r.type)}</dd><dt>竞价时间</dt><dd>${esc(r.time)}</dd><dt>运输方式</dt><dd>${esc(r.shipping)}</dd><dt>配送地点</dt><dd>${esc(r.address)}</dd><dt>结算方式</dt><dd>${esc(r.settlement)}</dd><dt>保证金金额</dt><dd>${esc(r.deposit)}</dd><dt>需求发布人</dt><dd>${esc(r.publisher)}</dd><dt>联系电话</dt><dd>${esc(r.phone)}</dd><dt>指定供应商</dt><dd>${esc(r.supplier)}</dd><dt>备注说明</dt><dd>${esc(r.remark)}</dd></dl><div class="sectiontitle">采购清单</div><p>${esc(r.list)}</p>`,`<button class="btn" data-action="close">关闭</button>`,false)}
function audit(r){selected=r;const app=kind==='application';modal(app?'审核参与申请':'审核客户竞价需求',`<p class="hint">${app?`供应商“${esc(r.supplier)}”申请参与“${esc(r.title)}”。平台竞价审核通过后直接获得参与资格；客户竞价还需客户确认。`:`审核客户“${esc(r.buyer)}”发布的“${esc(r.title)}”。通过后进入竞价中；驳回后退回客户修改。`}</p><div class="radio-row"><label><input type="radio" name="decision" value="pass" checked> 审核通过</label><label><input type="radio" name="decision" value="reject"> 驳回</label></div><div class="field"><label>驳回原因（驳回时必填）</label><textarea id="rejectReason" placeholder="请输入驳回原因"></textarea></div><p class="error" id="error"></p>`,`<button class="btn" data-action="close">取消</button><button class="btn primary" data-action="confirmAudit">确认</button>`,true)}
function publish(){
 const body=`<div class="publish-form">
  <div class="grid publish-grid">
   <div class="field full"><label for="fTitle">竞价标题 *</label><input id="fTitle" placeholder="请输入竞价标题"></div>
   <div class="field"><label for="fType">竞价类型 *</label><select id="fType"><option>总价竞价</option><option>逐条竞价</option></select></div>
   <div class="field"><label>竞价时间 *</label><div class="time-range"><input id="fStart" type="datetime-local" step="1" aria-label="开始时间"><span>至</span><input id="fEnd" type="datetime-local" step="1" aria-label="结束时间"></div></div>
   <div class="field"><label for="fShipping">运输方式</label><select id="fShipping"><option>自提</option><option>配送到指定地点</option></select></div>
   <div class="field"><label for="fAddress">配送地点</label><input id="fAddress" placeholder="选择配送到指定地点后填写" disabled></div>
   <div class="field"><label for="fSettlement">结算方式</label><select id="fSettlement"><option>款到发货</option><option>货到付款</option><option>账期</option></select></div>
   <div class="field"><label>账期时间</label><div class="compound-field"><input id="fCredit" type="number" min="1" placeholder="数字" disabled><select id="fCreditUnit" disabled aria-label="账期单位"><option>天</option><option>月</option></select></div></div>
   <div class="field"><label for="fDeposit">是否支付保证金</label><select id="fDeposit"><option>是</option><option>否</option></select></div>
   <div class="field"><label for="fDepositAmount">保证金金额（元）</label><input id="fDepositAmount" type="number" min="0" placeholder="请输入保证金金额"></div>
   <div class="field"><label for="fPublisher">需求发布人</label><input id="fPublisher" placeholder="请输入需求发布人"></div>
   <div class="field"><label for="fPhone">联系电话</label><input id="fPhone" placeholder="请输入联系电话"></div>
   <div class="field"><label for="fSuppliers">指定供应商报价</label><select id="fSuppliers"><option value="">开放申请</option><option>供应商1</option><option>山东绿源农业</option><option>豫农集团</option></select></div>
   <div class="field full"><label for="fRemark">备注说明</label><textarea id="fRemark" placeholder="供货地要求、供货商能力要求、竞价要求说明"></textarea></div>
  </div>
  <section class="purchase-list">
   <div class="purchase-list-head"><strong>采购清单</strong><div><label class="upload-link">↑ 上传物料清单<input id="fFile" type="file" accept=".csv" hidden></label><a class="download-link" href="竞价物料清单模板.csv" download>↓ 下载物料清单模板</a></div></div>
   <div id="uploadName" class="upload-name" aria-live="polite"></div>
   <div class="tablewrap"><table class="purchase-table"><thead><tr><th>序号</th><th>商品代码</th><th>商品名称</th><th>商品分类</th><th>品牌</th><th>规格</th><th>产地</th><th>单位</th><th>数量</th><th>参考价单价</th><th>出价</th><th>小计</th><th>竞价内容</th><th>图片</th><th>视频</th><th>联系人</th><th>联系电话</th></tr></thead><tbody id="fListRows">${Array.from({length:4},(_,i)=>'<tr><td>'+(i+1)+'</td>'+Array.from({length:16},()=>'<td></td>').join('')+'</tr>').join('')}</tbody></table></div>
  </section>
  <p class="error" id="error"></p>
 </div>`;
 modal('创建竞价采购需求',body,'<button class="btn" data-action="close">取消</button><button class="btn primary" data-action="confirmPublish">发布竞价</button>');
 $('#dialog').classList.add('publish-modal');
}
function parseCsv(text){
 const records=[];let row=[],cell='',quoted=false;
 for(let i=0;i<text.length;i++){
  const ch=text[i];
  if(ch==='"'){if(quoted&&text[i+1]==='"'){cell+='"';i++}else quoted=!quoted}
  else if(ch===','&&!quoted){row.push(cell);cell=''}
  else if((ch==='\n'||ch==='\r')&&!quoted){if(ch==='\r'&&text[i+1]==='\n')i++;row.push(cell);if(row.some(value=>value.trim()))records.push(row);row=[];cell=''}
  else cell+=ch;
 }
 row.push(cell);if(row.some(value=>value.trim()))records.push(row);
 return records;
}
function refreshPublishDependencies(){
 const shipping=$('#fShipping'),settlement=$('#fSettlement'),deposit=$('#fDeposit');
 if(!shipping)return;
 const delivery=shipping.value==='配送到指定地点',credit=settlement.value==='账期',requiredDeposit=deposit.value==='是';
 $('#fAddress').disabled=!delivery;if(!delivery)$('#fAddress').value='';
 $('#fCredit').disabled=!credit;$('#fCreditUnit').disabled=!credit;if(!credit)$('#fCredit').value='';
 $('#fDepositAmount').disabled=!requiredDeposit;if(!requiredDeposit)$('#fDepositAmount').value='';
}
function showMaterialRows(){
 const cells=uploadedMaterials.map((row,i)=>'<tr>'+Array.from({length:17},(_,j)=>'<td>'+esc(j===0?i+1:row[j]||'')+'</td>').join('')+'</tr>').join('');
 $('#fListRows').innerHTML=cells||Array.from({length:4},(_,i)=>'<tr><td>'+(i+1)+'</td>'+Array.from({length:16},()=>'<td></td>').join('')+'</tr>').join('');
}
function confirmPublish(){
 const title=$('#fTitle').value.trim(),start=$('#fStart').value,end=$('#fEnd').value;
 if(!title||!start||!end||!uploadedMaterials.length){$('#error').textContent='请填写竞价标题、竞价时间并上传采购清单';return}
 if(new Date(start)>=new Date(end)||new Date(end)<=new Date()){$('#error').textContent='结束时间须晚于开始时间和当前时间';return}
 if($('#fShipping').value==='配送到指定地点'&&!$('#fAddress').value.trim()){$('#error').textContent='请填写配送地点';return}
 if($('#fSettlement').value==='账期'&&!$('#fCredit').value){$('#error').textContent='请填写账期时间';return}
 if($('#fDeposit').value==='是'&&!$('#fDepositAmount').value){$('#error').textContent='请填写保证金金额';return}
 const date=new Date(),id='PT-JJ-'+date.toISOString().slice(0,10).replaceAll('-','')+String(rows.length+1).padStart(3,'0');
 const list=uploadedMaterials.map(m=>[m[2],m[8],m[7]].filter(Boolean).join(' ')).join('；');
 rows.unshift({id,title,buyer:'海赋运营平台',type:$('#fType').value,shipping:$('#fShipping').value,settlement:$('#fSettlement').value,deposit:$('#fDeposit').value==='是'?'¥'+$('#fDepositAmount').value:'不需要',publisher:$('#fPublisher').value.trim()||'平台采购方',phone:$('#fPhone').value.trim()||'—',time:start.replace('T',' ')+' ～ '+end.replace('T',' '),deadline:end.slice(0,10),status:'竞价中',supplier:$('#fSuppliers').value||'开放申请',address:$('#fAddress').value.trim()||'—',remark:$('#fRemark').value.trim()||'—',credit:$('#fSettlement').value==='账期'?$('#fCredit').value+$('#fCreditUnit').value:'—',list,materials:uploadedMaterials.map(x=>x.slice())});
 close();shown=rows.slice();page=1;render();
}
document.addEventListener('change',async e=>{
 if(['fShipping','fSettlement','fDeposit'].includes(e.target.id)){refreshPublishDependencies();return}
 if(e.target.id!=='fFile')return;
 const file=e.target.files[0];if(!file)return;
 const records=parseCsv((await file.text()).replace(/^\uFEFF/,''));
 const header=['序号','商品代码','商品名称','商品分类','品牌','规格','产地','单位','数量','参考价单价','出价','小计','竞价内容','图片','视频','联系人','联系电话'];
 if(!records.length||header.some((name,i)=>records[0][i]?.trim()!==name)){$('#error').textContent='清单表头与模板不一致，请下载模板后填写';uploadedMaterials=[];showMaterialRows();return}
 uploadedMaterials=records.slice(1).filter(row=>row.some(value=>value.trim())).map(row=>header.map((_,i)=>row[i]?.trim()||''));
 $('#uploadName').textContent=uploadedMaterials.length?'已上传：'+file.name+'（'+uploadedMaterials.length+' 条）':'文件中没有采购明细';
 $('#error').textContent=uploadedMaterials.length?'':'请在模板中填写采购明细后上传';
 showMaterialRows();
});
document.addEventListener('click',e=>{let b=e.target.closest('[data-action]');if(!b)return;const a=b.dataset.action,r=shown[Number(b.dataset.i)];if(a==='close')close();if(a==='reset'){document.querySelectorAll('.filters input,.filters select').forEach(x=>x.value='');shown=rows.slice();render()}if(a==='search'){const q=($('#q')?.value||'').trim(),status=$('#status')?.value||'',type=$('#type')?.value||'',origin=$('#origin')?.value||'';shown=rows.filter(x=>(!q||(x.title+x.id+x.supplier).includes(q))&&(!status||x.status===status)&&(!type||x.type===type)&&(!origin||x.origin===origin));render()}if(a==='detail')detail(r);if(a==='audit')audit(r);if(a==='publish')publish();if(a==='rank')modal('查看报价与排名',`<p class="hint">竞价截止后，采购方可查看报价及排名并选定中标供应商。此处为演示数据。</p><p>竞价：${esc(r.title)}　类型：${esc(r.type)}</p><table><tr><th>排名</th><th>供应商</th><th>报价总额</th><th>报价时间</th></tr><tr><td>1</td><td>山东绿源农业</td><td>¥128,000</td><td>2026-11-07 14:20</td></tr><tr><td>2</td><td>豫农集团</td><td>¥135,500</td><td>2026-11-07 10:05</td></tr></table>`,`<button class="btn" data-action="close">关闭</button>`);if(a==='confirmAudit'&&selected){const decision=document.querySelector('input[name="decision"]:checked').value,reason=$('#rejectReason').value.trim();if(decision==='reject'&&!reason){$('#error').textContent='请填写驳回原因';return}selected.status=decision==='pass'?(kind==='application'?(selected.origin==='客户竞价'?'待客户确认':'已通过'):'竞价中'):(kind==='application'?'已拒绝':'已驳回');if(reason)selected.reject=reason;close();shown=rows.slice();render()}if(a==='confirmPublish')confirmPublish()});
$('#modalClose').addEventListener('click',close);$('#overlay').addEventListener('click',e=>{if(e.target.id==='overlay')close()});render();
// 列表只负责定位单据；操作统一移到详情页。
const listStyle=document.createElement('style');listStyle.textContent='#rows tr{cursor:pointer}#rows tr:hover{background:#f7fcf9}#rows tr:focus{outline:2px solid #2ba471;outline-offset:-2px}';document.head.appendChild(listStyle);
function openRow(tr){const id=tr.cells[0].firstChild.textContent.trim();const r=rows.find(item=>item.id===id);if(!r)return;sessionStorage.setItem('竞价当前单据',JSON.stringify(r));location.href='竞价详情.html?kind='+encodeURIComponent(kind)+'&id='+encodeURIComponent(id)}
$('#rows').addEventListener('click',e=>{const tr=e.target.closest('tr');if(tr&&tr.cells.length>1)openRow(tr)});
$('#rows').addEventListener('keydown',e=>{if((e.key==='Enter'||e.key===' ')&&e.target.tagName==='TR'){e.preventDefault();openRow(e.target)}});
const originalRender=render;
render=function(){
 originalRender();
 const actionHead=document.querySelector('thead th:last-child');
 if(actionHead?.textContent==='操作')actionHead.remove();
 const pageSize=5,totalPages=Math.max(1,Math.ceil(shown.length/pageSize));
 page=Math.min(Math.max(page,1),totalPages);
 $('#rows').querySelectorAll('tr').forEach((tr,index)=>{
  if(tr.cells.length>1){
   tr.lastElementChild.remove();tr.tabIndex=0;
   tr.setAttribute('aria-label','查看'+tr.cells[0].innerText+'详情');
   tr.hidden=index<(page-1)*pageSize||index>=page*pageSize;
  }else tr.cells[0].colSpan=document.querySelectorAll('thead th').length;
 });
 const nav=$('#pageNav');
 if(nav)nav.innerHTML='<span class="page-total">共 '+shown.length+' 条</span><button type="button" data-page="'+(page-1)+'" '+(page===1?'disabled':'')+' aria-label="上一页">‹</button>'
  +Array.from({length:totalPages},(_,i)=>'<button type="button" data-page="'+(i+1)+'" class="'+(page===i+1?'active':'')+'" '+(page===i+1?'aria-current="page"':'')+'>'+(i+1)+'</button>').join('')
  +'<button type="button" data-page="'+(page+1)+'" '+(page===totalPages?'disabled':'')+' aria-label="下一页">›</button>';
};
$('#pageNav')?.addEventListener('click',e=>{const button=e.target.closest('[data-page]');if(!button||button.disabled)return;page=Number(button.dataset.page);render()});
document.addEventListener('click',e=>{if(e.target.closest('[data-action="search"],[data-action="reset"]'))page=1},true);
const auctionFilter=new URLSearchParams(location.search).get('auction');
if(kind==='application'&&auctionFilter)shown=rows.filter(x=>x.auction===auctionFilter);
render();
})();
