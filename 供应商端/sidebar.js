/* ============================================================
 * 供应商端公共侧边栏组件（唯一数据源）
 * 增删改菜单只需修改下面的 SIDEBAR_MENU 即可，全站自动同步。
 * 每个页面在 <body> 开头引入：<script src="sidebar.js"></script>
 * ============================================================ */
(function () {
  // ===== 菜单数据（唯一数据源）=====
  // group: 分组标题；items: 菜单项
  //   text  : 显示文字
  //   href  : 跳转地址（为空则不跳转）
  //   page  : 命中此文件名时高亮（用于自动标记当前页 active）
  var SIDEBAR_MENU = [
    {
      standalone: true,
      items: [
        { text: "工作台", href: "", page: "" }
      ]
    },
    {
      title: "采购管理",
      items: [
        { text: "订货单", href: "鸡蛋-订货单列表.html", page: "鸡蛋-订货单列表.html,鸡蛋-订货单.html" },
        { text: "销售订单", href: "销售订单列表.html", page: "销售订单列表.html,销售订单详情.html,送货单列表.html,鸡蛋-销售订单列表.html,鸡蛋-销售订单详情.html" },
        { text: "发货单", href: "送货单列表（全部）.html", page: "送货单列表（全部）.html,送货单详情.html,批量发货.html,批量送货单详情.html,批量发货-方案二.html,批量发货-方案三.html,鸡蛋-发货确认单列表.html,鸡蛋-发货确认单详情.html" },
        { text: "收货单", href: "鸡蛋-收货确认单列表.html", page: "鸡蛋-收货确认单列表.html,鸡蛋-收货确认单详情.html" },
      ]
    },
    {
      title: "询价单",
      items: [
        { text: "供应商报价", href: "供应商报价列表.html", page: "供应商报价列表.html,供应商报价详情.html" }
      ]
    },
    {
      title: "合同管理",
      items: [
        { text: "合同管理", href: "合同管理.html", page: "合同管理.html" }
      ]
    },
    {
      title: "店铺与资质",
      items: [
        { text: "商家入驻", href: "商家入驻.html", page: "商家入驻.html,企业开店.html,企业开店详情.html" },
        { text: "企业认证", href: "企业认证.html", page: "企业认证.html" },
        { text: "账号设置", href: "", page: "" }
      ]
    },
    {
      title: "财务中心",
      items: [
        { text: "发票", href: "鸡蛋-发票列表.html", page: "鸡蛋-发票列表.html,鸡蛋-发票详情.html" },
        { text: "结算单", href: "鸡蛋-预付款列表.html", page: "鸡蛋-预付款列表.html,鸡蛋-预付款详情.html" }
      ]
    }
  ];

  // 当前页面文件名（如 销售订单详情.html）
  var rawPage = location.pathname.split("/").pop();
  var currentPage = rawPage;
  try { currentPage = decodeURIComponent(rawPage); } catch (e) {}
  // 送货单详情有两个入口，左侧菜单高亮跟随进入来源。
  if (currentPage === "送货单详情.html") {
    var detailSource = "";
    try { detailSource = new URLSearchParams(location.search).get("source") || ""; } catch (e) {}
    if (detailSource === "order") currentPage = "送货单列表.html";
    if (detailSource === "delivery-menu") currentPage = "送货单列表（全部）.html";
  }

  // ===== 统一样式（注入一次）=====
  var css = [
    ".sidebar{width:200px;background:#001529;color:#fff;position:fixed;inset:0 auto 0 0;z-index:20;overflow-y:auto}",
    ".sidebar-header{height:64px;padding:16px 22px;display:flex;align-items:center;gap:10px;border-bottom:1px solid rgba(255,255,255,.08);font-size:16px;font-weight:600}",
    ".sidebar .logo-icon{width:30px;height:30px;background:#1890ff;border-radius:5px;display:flex;align-items:center;justify-content:center;font-size:14px;color:#fff;box-shadow:0 5px 14px rgba(24,144,255,.35)}",
    ".sidebar .menu-item,.sidebar .menu-group-title{transition:all .2s}",
    ".sidebar .menu-item{height:40px;padding:11px 24px 11px 34px;color:#c7d0da;cursor:pointer;font-size:13px;display:flex;align-items:center}",
    ".sidebar .menu-item:hover{background:#002140;color:#fff}",
    ".sidebar .menu-item.active{background:linear-gradient(90deg,#1890ff,#1677d2);color:#fff;box-shadow:inset 3px 0 #91d5ff}",
    ".sidebar .menu-group-title{padding:18px 24px 10px;color:#9fb0c0;font-size:15px;font-weight:600;letter-spacing:.04em;display:flex;align-items:center;gap:8px}",
    ".sidebar .menu-group-title.active{color:#91d5ff}",
    ".sidebar .menu-subtitle{padding:14px 24px 6px 22px;color:#6b7c8f;font-size:12px;font-weight:600;letter-spacing:.05em}",
    ".sidebar .menu-group-title .arrow{margin-left:auto;font-size:11px;color:#60758a}"
  ].join("");

  var styleEl = document.createElement("style");
  styleEl.id = "common-sidebar-style";
  styleEl.textContent = css;
  document.head.appendChild(styleEl);

  // ===== 渲染侧边栏 =====
  function buildItem(it) {
    if (it.sub) {
      return '<div class="menu-subtitle">' + it.text + "</div>";
    }
    var pages = (it.page || "").split(",").map(function (s) { return s.trim(); });
    var active = pages.indexOf(currentPage) !== -1;
    var cls = "menu-item" + (active ? " active" : "");
    var attr = it.href
      ? ' onclick="location.href=\'' + it.href + '\'"'
      : "";
    return '<div class="' + cls + '"' + attr + ">" + it.text + "</div>";
  }

  function buildGroup(g) {
    if (g.standalone) {
      return g.items.map(buildItem).join("");
    }
    var groupActive = g.items.some(function (it) {
      return (it.page || "").split(",").map(function (s) { return s.trim(); })
        .indexOf(currentPage) !== -1;
    });
    return (
      '<div class="menu-group-title' + (groupActive ? " active" : "") + '">' + g.title +
      ' <span class="arrow">⌃</span></div>' +
      g.items.map(buildItem).join("")
    );
  }

  var html =
    '<aside class="sidebar">' +
    '<div class="sidebar-header"><span class="logo-icon">商</span><span>商家管理平台</span></div>' +
    SIDEBAR_MENU.map(buildGroup).join("") +
    "</aside>";

  document.body.insertAdjacentHTML("afterbegin", html);
})();
