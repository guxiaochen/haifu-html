/* 供应商端发票（供应商 → 平台）演示台账
   共用方：鸡蛋-发票列表.html（台账与上传）、鸡蛋-发票详情.html（只读）、
   鸡蛋-销售订单详情.html（订单「发票」页签上传）、销售订单列表（发票状态派生） */
window.EggInv = (function () {
    var KEY = 'egg_supplier_invoices_v1';
    var BUYER = '焱丰（山东）供应链管理有限公司';
    var KIND = '增值税普通发票（免税）';

    // 销售订单主数据（供应商视角：本方为销方，焱丰为购方）
    var ORDERS = [
        { no: 'EGG-SO-20260905001', name: '9月鲜鸡蛋供货单·第1批', seller: '平原县蛋鸡养殖合作社',     amount: 0,         date: '2026-09-05', label: '待确认 · 未发货' },
        { no: 'EGG-SO-20260901002', name: '9月鲜鸡蛋供货单·第2批', seller: '平原县蛋鸡养殖合作社',     amount: 128587.20, date: '2026-09-01', label: '已确认 · 已发货' },
        { no: 'EGG-SO-20260828003', name: '8月鲜鸡蛋供货单·第3批', seller: '夏津县绿源养殖专业合作社', amount: 196465.72, date: '2026-08-28', label: '已确认 · 全部收货' }
    ];

    var SEED = [
        { no: 'FP20260908001', code: '310023451300', date: '2026-09-08', so: 'EGG-SO-20260901002', amount: 50000, files: ['发票_FP20260908001.pdf'], remark: '对应结算单 EGG-PP-20260906001', by: '供应商上传' },
        { no: 'FP20260910001', code: '310023451300', date: '2026-09-10', so: 'EGG-SO-20260828003', amount: 60000, files: ['发票_FP20260910001.pdf'], remark: '对应结算单 EGG-PP-20260909004', by: '供应商上传' }
    ];

    function norm(list) {
        return (list || []).map(function (x) {
            var o = order(x.so);
            return {
                no: x.no, code: x.code || '', date: x.date || '', so: x.so || '',
                kind: x.kind || KIND, tax: (x.tax === undefined || x.tax === null) ? 0 : Number(x.tax) || 0,
                amount: Number(x.amount) || 0,
                seller: x.seller || (o ? o.seller : ''), buyer: x.buyer || BUYER,
                files: x.files || [], remark: x.remark || '', by: x.by || '供应商上传'
            };
        });
    }
    function load() {
        var raw = null;
        try {
            var v = JSON.parse(localStorage.getItem(KEY));
            if (v && v.length) raw = v;
        } catch (e) {}
        return norm(raw || SEED);
    }
    function save(list) { try { localStorage.setItem(KEY, JSON.stringify(list)); } catch (e) {} }
    function all() {
        return load().slice().sort(function (a, b) { return a.date < b.date ? 1 : (a.date > b.date ? -1 : 0); });
    }
    function forOrder(so) { return load().filter(function (x) { return x.so === so; }); }
    function find(no) {
        var l = load();
        for (var i = 0; i < l.length; i++) { if (l[i].no === no) return l[i]; }
        return null;
    }
    function order(no) {
        for (var i = 0; i < ORDERS.length; i++) { if (ORDERS[i].no === no) return ORDERS[i]; }
        return null;
    }
    function invoiced(so) { return forOrder(so).reduce(function (s, x) { return s + (Number(x.amount) || 0); }, 0); }
    function todo(so) { var o = order(so); return Math.max(0, (o ? Number(o.amount) || 0 : 0) - invoiced(so)); }
    function add(inv) { var l = load(); l.push(inv); save(l); return inv; }
    // 销售订单页签内上传后整单回写，保证台账与订单两处数据一致
    function sync(so, list) {
        var rest = load().filter(function (x) { return x.so !== so; });
        save(rest.concat(norm(list)));
    }
    function nextNo() {
        var d = new Date(), ymd = '' + d.getFullYear() + ('0' + (d.getMonth() + 1)).slice(-2) + ('0' + d.getDate()).slice(-2);
        var seq = load().filter(function (x) { return x.no.indexOf('FP' + ymd) === 0; }).length + 1;
        return 'FP' + ymd + ('00' + seq).slice(-3);
    }
    function toInvoiceDb() {
        var db = {};
        ORDERS.forEach(function (o) { db[o.no] = []; });
        load().forEach(function (x) { if (!db[x.so]) db[x.so] = []; db[x.so].push(x); });
        return db;
    }
    function money(n) { return '¥ ' + Number(n || 0).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
    function num(n) { return Number(n || 0).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
    function cnDate(d) { var p = String(d || '').split('-'); return p.length === 3 ? p[0] + '年' + p[1] + '月' + p[2] + '日' : (d || '—'); }
    function statusOf(so) {
        var done = invoiced(so), total = order(so) ? Number(order(so).amount) : 0;
        if (!done) return { text: '未开票', cls: 'status-pending', style: '' };
        if (total && done + 0.005 < total) return { text: '部分开票', cls: '', style: 'background:#fff7e6;color:#d46b08;border:1px solid #ffd591;' };
        return { text: '已开票', cls: 'status-confirmed', style: '' };
    }
    // 列表页「发票状态」按台账派生（只命中单号所在单元格，避免串行误判）
    function paintListStatus() {
        Array.prototype.forEach.call(document.querySelectorAll('tbody tr'), function (tr) {
            var so = '';
            for (var i = 0; i < tr.cells.length; i++) {
                var t = (tr.cells[i].textContent || '').trim();
                if (/^EGG-SO-\d+$/.test(t)) { so = t; break; }
            }
            if (!so || !order(so)) return;
            var table = tr.closest('table');
            if (!table || !table.tHead) return;
            var heads = Array.prototype.map.call(table.tHead.rows[0].cells, function (c) { return c.textContent.trim(); });
            var idx = heads.indexOf('发票状态');
            if (idx < 0 || !tr.cells[idx]) return;
            var st = statusOf(so);
            tr.cells[idx].innerHTML = '<span class="status ' + st.cls + '"' + (st.style ? ' style="' + st.style + '"' : '') + '>' + st.text + '</span>';
        });
    }

    return {
        ORDERS: ORDERS, BUYER: BUYER, KIND: KIND,
        all: all, forOrder: forOrder, find: find, order: order, norm: norm,
        invoiced: invoiced, todo: todo, add: add, sync: sync, nextNo: nextNo,
        toInvoiceDb: toInvoiceDb, money: money, num: num, cnDate: cnDate,
        statusOf: statusOf, paintListStatus: paintListStatus
    };
})();
