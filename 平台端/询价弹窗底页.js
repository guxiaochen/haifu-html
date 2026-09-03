/*
 * 询价工作台弹窗共用底页规则：
 * 1. 弹窗展示时，详情页仅作视觉背景，不接收点击；
 * 2. 关闭弹窗时，回到新加载的真实询价详情页。
 * 不把 iframe 作为关闭后的交互页，避免页面层级截获点击导致按钮失效。
 */
(function () {
  var backdrop = document.createElement('iframe');
  backdrop.id = 'inquiry-detail-backdrop';
  backdrop.src = '平台询价单详情.html';
  backdrop.title = '平台询价单详情背景';
  backdrop.style.cssText = 'position:fixed;inset:0;z-index:1;width:100%;height:100%;border:0;pointer-events:none';
  document.body.prepend(backdrop);

  // 询价数量全平台按整数显示，避免同一询价在不同步骤出现不同精度。
  var walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  var node;
  while ((node = walker.nextNode())) {
    node.nodeValue = node.nodeValue.replace(/(\d{1,3}(?:,\d{3})*)\.00000/g, '$1');
  }

  window.restoreInquiryDetail = function () {
    // replace 不保留弹窗页历史，关闭后始终得到可交互的详情工作台新实例。
    window.location.replace('平台询价单详情.html?modalClosed=' + Date.now());
  };
}());
