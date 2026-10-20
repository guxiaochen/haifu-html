/* ============================================================
 * 收货单列表（全部）演示脚本
 * 口径说明（已与客户确认）：
 *   1. 一次批量发货 → 客户端生成 1 张【合并收货单】，单内可含多个采购订单明细行；
 *   2. 收货状态按【商品数量】判定，与采购订单欠单逻辑一致：
 *        Σ收货 = Σ发货        → 已收货
 *        0 < Σ收货 < Σ发货     → 部分收货
 *        Σ收货 = 0            → 待收货
 *   3. 收货数量 < 发货数量时，按差额生成欠单（沿用采购订单既有欠单逻辑）。
 * 本页仅展示效果、不回写采购订单页面数据。
 * ============================================================ */

var RECEIPTS = [
  {
    no: 'SH202609001', batch: 'PC20260901', supplier: '海赋农产品供应商', date: '2026-09-15',
    lines: [
      { order: 'PO20260802003', product: '大蒜 4.0', shipped: 2, received: 0 },
      { order: 'PO20260802003', product: '洋葱 3.2', shipped: 1, received: 0 },
      { order: 'PO20260730004', product: '生姜 一级', shipped: 3, received: 0 }
    ]
  },
  {
    no: 'SH202609002', batch: 'PC20260902', supplier: '海赋农产品供应商', date: '2026-09-16',
    lines: [
      { order: 'PO20260802003', product: '生姜 一级', shipped: 3, received: 2 },
      { order: 'PO20260728005', product: '番茄 一级', shipped: 6, received: 4 }
    ]
  },
  {
    no: 'SH202609003', batch: 'PC20260903', supplier: '诺力叉车旗舰供应商', date: '2026-09-17',
    lines: [
      { order: 'PO20260802003', product: '锂电池电钻', shipped: 15, received: 0 }
    ]
  },
  {
    no: 'SH202608008', batch: 'PC20260808', supplier: '海赋农产品供应商', date: '2026-09-08',
    lines: [
      { order: 'PO20260728005', product: '仓储货架', shipped: 50, received: 50 }
    ]
  },
  {
    no: 'SH202608007', batch: 'PC20260807', supplier: '海赋农产品供应商', date: '2026-09-06',
    lines: [
      { order: 'PO20260728005', product: '塑料托盘', shipped: 18, received: 18 }
    ]
  }
];
var BASE_RECEIPTS = RECEIPTS.slice();

function loadRealtimeReceipts() {
  var runtime = [];
  try { runtime = JSON.parse(localStorage.getItem('haifu_customer_incoming_receipts') || '[]') || []; } catch (e) { runtime = []; }
  var map = {};
  BASE_RECEIPTS.concat(runtime).forEach(function (receipt) {
    if (!receipt || !receipt.no) return;
    var normalized = Object.assign({}, receipt);
    normalized.batch = normalized.batch || normalized.sourceBatch || '单张发货';
    normalized.supplier = normalized.supplier || '海赋农产品供应商';
    normalized.lines = (normalized.lines || []).map(function (line) {
      return Object.assign({}, line, {
        order: line.order || '—',
        product: line.product || line.name || '—',
        shipped: Number(line.shipped || line.qty || 0),
        received: Number(line.received || 0)
      });
    });
    map[normalized.no] = normalized;
  });
  RECEIPTS = Object.keys(map).map(function (key) { return map[key]; });
}
loadRealtimeReceipts();

var state = { order: '', status: '', keyword: '', page: 1, pageSize: 5, selected: {} };

function sumShipped(r) { return r.lines.reduce(function (s, l) { return s + l.shipped; }, 0); }
function sumReceived(r) { return r.lines.reduce(function (s, l) { return s + l.received; }, 0); }

function receiptStatus(r) {
  var shipped = sumShipped(r), received = sumReceived(r);
  if (shipped > 0 && received >= shipped) return 'received';
  if (received > 0) return 'partial';
  return 'pending';
}

var STATUS_TEXT = { pending: '待收货', partial: '部分收货', received: '已收货' };
var STATUS_CLS = { pending: 'status-pending', partial: 'status-partial', received: 'status-done' };

/* 采购订单收货状态聚合：仅本页展示，不改动采购订单页面 */
function orderRecvStatus(orderNo) {
  var shipped = 0, received = 0;
  RECEIPTS.forEach(function (r) {
    r.lines.forEach(function (l) {
      if (l.order !== orderNo) return;
      shipped += l.shipped;
      received += l.received;
    });
  });
  if (!shipped) return '';
  if (received >= shipped) return '全部收货';
  if (received > 0) return '部分收货';
  return '待收货';
}

function orderNos(r) {
  var list = [];
  r.lines.forEach(function (l) { if (list.indexOf(l.order) < 0) list.push(l.order); });
  return list;
}

function visibleRows() {
  return RECEIPTS.filter(function (r) {
    if (state.order && orderNos(r).indexOf(state.order) < 0) return false;
    if (state.status && receiptStatus(r) !== state.status) return false;
    if (state.keyword && r.no.toLowerCase().indexOf(state.keyword) < 0) return false;
    return true;
  });
}

function currentPageRows() {
  var list = visibleRows();
  return list.slice((state.page - 1) * state.pageSize, state.page * state.pageSize);
}

function render() {
  var list = visibleRows();
  var maxPage = Math.max(1, Math.ceil(list.length / state.pageSize));
  if (state.page > maxPage) state.page = maxPage;
  var rows = currentPageRows();
  var body = document.getElementById('receiptBody');

  if (!rows.length) {
    body.innerHTML = '<tr><td colspan="8" class="empty">暂无收货单数据</td></tr>';
  } else {
    body.innerHTML = rows.map(function (r) {
      var st = receiptStatus(r);
      var orders = orderNos(r);
      var orderCell = orders.map(function (o) {
        return '<span class="link" onclick="goOrder(\'' + o + '\',\'' + r.no + '\')">' + o + '</span>';
      }).join('<br />');
      var recvCell = st === 'pending' ? '<span class="muted">—</span>'
        : '<b style="color:#2BA471;">' + sumReceived(r) + '</b>';
      return '<tr>' +
        '<td><span class="link" onclick="openDetail(\'' + r.no + '\')">' + r.no + '</span>' + (orders.length > 1 ? '<span class="badge-merge">合并单</span>' : '') + '</td>' +
        '<td>' + orderCell + '</td>' +
        '<td>' + r.supplier + '</td>' +
        '<td class="muted">' + r.batch + '</td>' +
        '<td class="qty">' + sumShipped(r) + '</td>' +
        '<td class="qty">' + recvCell + '</td>' +
        '<td class="muted">' + r.date + '</td>' +
        '<td><span class="status-tag ' + STATUS_CLS[st] + '">' + STATUS_TEXT[st] + '</span></td>' +
        '</tr>';
    }).join('');
  }

  document.getElementById('tableCount').textContent = '共 ' + list.length + ' 条';
  document.getElementById('pageInfo').textContent = '共 ' + list.length + ' 条';
  renderPager(maxPage);
}

function renderPager(maxPage) {
  var html = '';
  for (var i = 1; i <= maxPage; i++) {
    html += '<button class="page-btn ' + (i === state.page ? 'active' : '') + '" onclick="goPage(' + i + ')">' + i + '</button>';
  }
  document.getElementById('pageButtons').innerHTML = html;
  document.getElementById('prevPage').disabled = state.page === 1;
  document.getElementById('nextPage').disabled = state.page === maxPage;

}

function goPage(n) {
  var maxPage = Math.max(1, Math.ceil(visibleRows().length / state.pageSize));
  state.page = Math.max(1, Math.min(maxPage, n));
  render();
}

function applyFilter() {
  state.order = document.getElementById('orderFilter').value;
  state.status = document.getElementById('statusFilter').value;
  state.keyword = document.getElementById('keyword').value.trim();
  state.page = 1;
  render();
  showToast('已按条件筛选，共 ' + visibleRows().length + ' 张收货单');
}

function resetFilter() {
  document.getElementById('orderFilter').value = '';
  document.getElementById('statusFilter').value = '';
  document.getElementById('keyword').value = '';
  state.order = '';
  state.status = '';
  state.keyword = '';
  state.page = 1;
  render();
  showToast('筛选条件已重置');
}

function openDetail(no) { location.href = '收货单详情.html?source=receipt-menu&receipt=' + encodeURIComponent(no); }
function goOrder(no, receiptNo) { location.href = '采购订单详情.html?source=receipt-menu&receipt=' + encodeURIComponent(receiptNo) + '&order=' + encodeURIComponent(no); }

function showToast(msg) {
  var el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(window.tt);
  window.tt = setTimeout(function () { el.classList.remove('show'); }, 3000);
}

(function init() {
  var orders = [];
  RECEIPTS.forEach(function (r) {
    orderNos(r).forEach(function (o) { if (orders.indexOf(o) < 0) orders.push(o); });
  });
  var sel = document.getElementById('orderFilter');
  sel.innerHTML = '<option value="">全部采购订单</option>' +
    orders.map(function (o) { return '<option value="' + o + '">' + o + '</option>'; }).join('');

  var m = location.search.match(/[?&]order=([^&]*)/);
  var preset = m ? decodeURIComponent(m[1]) : '';
  if (preset && orders.indexOf(preset) >= 0) { sel.value = preset; state.order = preset; }

  render();
})();

window.addEventListener('storage', function (event) {
  if (event.key !== 'haifu_customer_incoming_receipts') return;
  loadRealtimeReceipts();
  render();
});
