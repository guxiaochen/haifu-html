(function () {
  var file = decodeURIComponent(location.pathname.split('/').pop() || '');
  var inquiryFiles = ['平台询价单列表.html', '平台询价单详情.html', '邀请供应商报价-选择询价明细.html', '邀请供应商报价-选择供应商.html', '填写供应商询价.html', '供应商报价列表.html'];
  var quoteFiles = ['报价单列表.html', '平台报价单详情.html'];
  var active = inquiryFiles.indexOf(file) >= 0 ? '平台询价单' : (quoteFiles.indexOf(file) >= 0 ? '报价单' : '');
  var target = document.querySelector('aside.sidebar, aside.side, aside.menu');
  if (!target) return;
  target.className = 'quotation-sidebar';
  target.innerHTML = [
    '<div class="q-group">📋 <span>订单管理</span></div>',
    item('销售订单', '销售订单列表.html'),
    item('平台询价单', '平台询价单列表.html'),
    item('报价单', '报价单列表.html'),
    item('待采订单', '销售订单审核.html'),
    item('采购订单', '采购订单列表.html'),
    '<div class="q-group">📄 <span>合同管理</span></div>',
    item('合同管理', '合同管理.html'),
    '<div class="q-group">📦 <span>产品管理</span></div>',
    item('产品库', '产品库.html'),
    '<div class="q-group">⚙️ <span>系统管理</span></div>',
    item('用户管理', '用户管理.html'),
    item('角色管理', '角色管理.html'),
    item('菜单管理', '菜单管理.html'),
    item('部门管理', '部门管理.html')
  ].join('');
  var style = document.createElement('style');
  style.textContent = '.quotation-sidebar{width:200px!important;flex:0 0 200px!important;padding:12px 0!important;background:#fff!important;border-right:1px solid #f0f0f0!important}.quotation-sidebar .q-group{display:flex!important;align-items:center!important;gap:8px!important;margin-top:8px!important;padding:10px 20px!important;background:transparent!important;border:0!important;color:#333!important;font-size:15px!important;font-weight:600!important;cursor:default!important}.quotation-sidebar .q-item{display:block!important;padding:10px 24px 10px 48px!important;border-left:3px solid transparent!important;background:#fff!important;color:#666!important;font-size:13px!important;font-weight:400!important;cursor:pointer!important}.quotation-sidebar .q-item:hover{background:#f5f5f5!important;color:#2BA471!important}.quotation-sidebar .q-item.active{border-left-color:#2BA471!important;background:#f0faf5!important;color:#2BA471!important;font-weight:500!important}';
  document.head.appendChild(style);
  function item(label, url) { return '<div class="q-item' + (active === label ? ' active' : '') + '" onclick="location.href=\'' + url + '\'">' + label + '</div>'; }
})();
