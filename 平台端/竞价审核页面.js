(function(){
const kind=document.body.dataset.kind;
const $=s=>document.querySelector(s);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const customerStates=['审核中','竞价中','已驳回','已取消','已完成','已截止'];
const customer=customerStates.map((status,i)=>({id:'JJ20231025-00'+(i+1),title:'2023年度优质大米采购项目',buyer:'某某食品有限公司',type:'总价竞价',shipping:'配送到指定地点',settlement:'账期',deposit:'2000',publisher:'发布人',phone:'17661671817',time:'2026-07-01 17:31:20～2026-07-01 17:31:20',deadline:'2026-07-01',status,supplier:'供应商1、供应商2',address:'配送地点',remark:'备注说明',list:'大米 3,000 kg'}));
const application=Array.from({length:16},(_,i)=>({id:'BJ-SQ-20260624-'+(i+1),auction:'JJ20231025-001',title:'2023年度优质大米采购项目',origin:i<8?'客户竞价':'平台竞价',buyer:'某某食品有限公司',supplier:'豫农粮油供应链有限公司',time:'2026-06-24 10:56:56',reason:'我司长期从事粮油供应，在河南省有稳定的生产基地，年供货量超过2万吨，具备完整食品安全认证，希望参与本次竞价采购。',credential:'营业执照、食品安全认证',status:i%8<3?'待审核':i%8===7?'已拒绝':'已通过',reject:i%8===7?'供货地不符合要求':''}));
let tab='客户竞价',filtered=null,selected=null,page=1;
const rows=kind==='customer'?customer:application;
const credentialImages=['资质示例-营业执照.svg','资质示例-食品安全认证.svg'];
function credentialPreview(r){
 const names=String(r.credential||'').split('、').filter(Boolean);
 return '<div class="credential-images">'+names.map((name,i)=>'<img src="'+credentialImages[i%credentialImages.length]+'" alt="'+esc(name)+'演示图片" title="'+esc(name)+'">').join('')+'</div>';
}
function stateTag(status){
 const tone=status.includes('驳回')||status.includes('拒绝')?'red':status.includes('审核')?'orange':status.includes('截止')||status.includes('取消')?'gray':'';
 return '<span class="tag '+tone+'">'+esc(status)+'</span>';
}
function render(){
 const q=$('#q').value.trim(),s=$('#status').value,items=(filtered||rows).filter(r=>{
  if(kind==='application'&&r.origin!==tab)return false;
  if(q&&!r.title.includes(q))return false;
  if(s&&r.status!==s)return false;
  if(kind==='customer'){
   if($('#type').value&&r.type!==$('#type').value)return false;
   if($('#deposit').value&&($('#deposit').value==='是')===(r.deposit==='0'))return false;
   if($('#deadline').value&&r.deadline!==$('#deadline').value)return false;
  }
  return true;
 });
 const pageSize=5,totalPages=Math.max(1,Math.ceil(items.length/pageSize));
 page=Math.min(Math.max(page,1),totalPages);
 $('#rows').innerHTML=items.slice((page-1)*pageSize,page*pageSize).map(r=>{
  const i=rows.indexOf(r);
  if(kind==='customer')return '<tr data-row="'+i+'" tabindex="0" aria-label="查看'+esc(r.title)+'详情"><td>'+esc(r.id)+' '+esc(r.title)+'</td><td>'+esc(r.buyer)+'</td><td>'+esc(r.type)+'</td><td>'+esc(r.shipping)+'</td><td>'+esc(r.settlement)+'</td><td>'+esc(r.deposit)+'</td><td>'+esc(r.publisher)+'</td><td>'+esc(r.phone)+'</td><td>'+esc(r.time)+'</td><td>'+stateTag(r.status)+'</td></tr>';
  return '<tr data-row="'+i+'" tabindex="0" aria-label="查看'+esc(r.title)+'申请详情"><td>'+esc(r.auction)+' '+esc(r.title)+'</td><td>'+esc(r.buyer)+'</td><td>'+esc(r.supplier)+'</td><td>'+esc(r.time)+'</td><td>'+esc(r.reason)+'</td><td>'+credentialPreview(r)+'</td><td>'+stateTag(r.status)+'</td></tr>';
 }).join('')||'<tr><td colspan="'+(kind==='customer'?10:7)+'">暂无数据</td></tr>';
 $('#pageNav').innerHTML='<span class="page-total">共 '+items.length+' 条</span><button type="button" data-page="'+(page-1)+'" '+(page===1?'disabled':'')+' aria-label="上一页">‹</button>'
  +Array.from({length:totalPages},(_,i)=>'<button type="button" data-page="'+(i+1)+'" class="'+(page===i+1?'active':'')+'" '+(page===i+1?'aria-current="page"':'')+'>'+(i+1)+'</button>').join('')
  +'<button type="button" data-page="'+(page+1)+'" '+(page===totalPages?'disabled':'')+' aria-label="下一页">›</button>';
}
function show(title,body,foot=''){selected=selected||null;$('#modalTitle').textContent=title;$('#modalBody').innerHTML=body;$('#modalFoot').innerHTML=foot;$('#overlay').classList.add('show')}
function close(){selected=null;$('#overlay').classList.remove('show');$('#modalBody').innerHTML='';$('#modalFoot').innerHTML=''}
function audit(r){
 selected=r;
 const note=kind==='customer'?'<div class="design-modal-note">审核通过后，竞价状态变为“竞价中”，相关供应商将收到通知；驳回后采购方可修改后重新提交</div>':'';
 show(kind==='customer'?'竞价需求审核':'审核',note+'<div class="audit-options">审核结果： <label><input type="radio" name="decision" value="pass" checked> 审核通过</label><label><input type="radio" name="decision" value="reject"> 驳回</label></div><div class="audit-reason"><span>驳回原因：</span><textarea id="rejectReason"></textarea></div><p id="auditError" class="error"></p>','<button class="btn" data-action="close">取消</button><button class="btn" data-action="confirm">确认</button>');
}
function voucher(){
 const image='保证金凭证示例.svg';
 show('保证金凭证','<div class="hint">竞价编号：J202606240167123　|　保证金：¥2000</div><table class="voucher-table"><thead><tr><th>供应商</th><th>联系人</th><th>联系电话</th><th>凭证预览</th><th>上传时间</th><th>操作</th></tr></thead><tbody>'+[1,2].map(()=>'<tr><td>上海绿鲜供应链有限公司</td><td>xxxx</td><td>xxxxxxxxx</td><td><img class="voucher-thumb" src="'+image+'" alt="保证金凭证图片"></td><td>2026-07-06 15:30:22</td><td><a href="'+image+'" download>下载</a></td></tr>').join('')+'</tbody></table>');
}
function quotes(r,result=false){
 const caption=result?'中标结果':'查看报价';
 const table='<table class="voucher-table"><thead><tr><th>排名</th><th>供应商</th><th>报价总额</th><th>报价时间</th><th>备注</th><th>操作</th></tr></thead><tbody>'+['山东绿源农业','豫农集团','春晖蔬菜基地','华东生鲜配送'].map((name,i)=>'<tr><td>'+(i+1)+'</td><td>'+esc(name)+'</td><td>¥'+(128000+i*7500).toLocaleString()+'</td><td>2026-03-12 14:20<br>修改'+(i?1:2)+'次</td><td>备注备注备注</td><td>'+(result?(i?'落标':'中标'):'选为中标')+'</td></tr>').join('')+'</tbody></table>';
 show(caption,'<div class="stats modal-stats">'+[['参与供应商',6],['已提交报价',4],['未报价',2]].map(([n,v])=>'<div class="stat"><span>'+n+'</span><b>'+v+'</b></div>').join('')+'</div><div class="hint">总价竞价模式 · 按报价总额由低到高排名 · 实时更新</div>'+table);
}
document.addEventListener('click',e=>{
 const pageButton=e.target.closest('[data-page]');
 if(pageButton){if(!pageButton.disabled){page=Number(pageButton.dataset.page);render()}return}
 const tabButton=e.target.closest('[data-tab]');
 if(tabButton){tab=tabButton.dataset.tab;page=1;document.querySelectorAll('[data-tab]').forEach(b=>b.classList.toggle('active',b===tabButton));render();return}
 const b=e.target.closest('[data-action]');if(!b)return;
 const action=b.dataset.action,r=rows[Number(b.dataset.i)];
 if(action==='close'){close();return}
 if(action==='search'||action==='reset'){if(action==='reset')document.querySelectorAll('.filters input,.filters select').forEach(x=>{x.value='';if(x.id==='deadline')x.type='text'});page=1;render();return}
 if(action==='detail'){sessionStorage.setItem('竞价当前单据',JSON.stringify(r));location.href='竞价详情.html?kind=customer&id='+encodeURIComponent(r.id);return}
 if(action==='audit'){audit(r);return}
 if(action==='voucher'){voucher();return}
 if(action==='quotes'||action==='result'){quotes(r,action==='result');return}
 if(action==='reason'){show('取消原因','<p>采购方主动取消</p>');return}
 if(action==='confirm'&&selected){
  const decision=document.querySelector('input[name="decision"]:checked')?.value;
  const reason=$('#rejectReason').value.trim();
  if(decision==='reject'&&!reason){$('#auditError').textContent='请填写驳回原因';return}
  selected.status=decision==='reject'?(kind==='customer'?'已驳回':'已拒绝'):(kind==='customer'?'竞价中':'已通过');
  selected.reject=reason;close();render();
 }
});
function openRow(tr){
 const r=rows[Number(tr.dataset.row)];if(!r)return;
 sessionStorage.setItem('竞价当前单据',JSON.stringify(r));
 location.href='竞价详情.html?kind='+encodeURIComponent(kind)+'&id='+encodeURIComponent(r.id);
}
$('#rows').addEventListener('click',e=>{const tr=e.target.closest('tr[data-row]');if(tr)openRow(tr)});
$('#rows').addEventListener('keydown',e=>{if((e.key==='Enter'||e.key===' ')&&e.target.matches('tr[data-row]')){e.preventDefault();openRow(e.target)}});
$('#modalClose').addEventListener('click',close);
$('#overlay').addEventListener('click',e=>{if(e.target===$('#overlay'))close()});
render();
})();
