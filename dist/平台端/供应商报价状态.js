/* 供应商报价页面按询价状态切换为进度、采用或只读结果视图。 */
(function () {
  var status = new URLSearchParams(window.location.search).get('status') || '待采用';
  var title = document.querySelector('.intro h1');
  var intro = document.querySelector('.intro p');
  var submit = document.getElementById('submit');
  var hint = document.getElementById('hint');
  var buttons = document.querySelectorAll('.adopt');
  if (status === '报价收集中') {
    title.textContent = '供应商询价进度';
    intro.textContent = '当前处于报价收集中：可查看每个产品已收到的报价，待报价截止后再进入采用。';
    buttons.forEach(function (button) { button.style.display = 'none'; });
    submit.style.display = 'none';
    hint.textContent = '已收到 5 条报价，仍有供应商待提交报价';
  } else if (status === '已完成') {
    title.textContent = '供应商报价 · 最终采用结果';
    intro.textContent = '当前询价已完成，以下为各产品最终采用的供应商报价，仅供查看。';
    window.choose('garlic', document.querySelector('[data-p="garlic"] .adopt'), 'aqtest海赋供应链', 10000);
    window.choose('onion', document.querySelector('[data-p="onion"] .adopt'), '金乡鲜蒜产销合作社', 8860);
    buttons.forEach(function (button) { button.style.display = 'none'; });
    submit.style.display = 'none';
    hint.textContent = '询价已完成，当前页面为只读结果';
  }
}());
