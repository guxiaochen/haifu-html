/**
 * 平台端左侧菜单栏组件
 * 使用方式：
 *   <div id="sidebar-container"></div>
 *   <script src="sidebar.js"></script>
 * 修改菜单只需改此文件一处
 */

(function() {
    // 自动检测当前文件名（兼容 file:// 协议的中文编码）
    var path = window.location.pathname;
    var filename = decodeURIComponent(path.substring(path.lastIndexOf('/') + 1));
    var query = window.location.search;

    // 菜单配置
    var menus = [
        { type: 'group', label: '订单管理', icon: '📋' },
        { type: 'item', label: '销售订单', url: '销售订单列表.html', activeKeys: ['销售订单列表.html', '销售订单详情.html'] },
        { type: 'item', label: '平台询价单', url: '平台询价单列表.html', activeKeys: ['平台询价单列表.html', '平台询价单详情.html', '新建平台询价单.html', '邀请供应商报价-选择询价明细.html', '邀请供应商报价-选择供应商.html', '填写供应商询价.html', '供应商报价列表.html'] },
        { type: 'item', label: '报价单', url: '报价单列表.html', activeKeys: ['报价单列表.html', '平台报价单详情.html'] },
        { type: 'item', label: '待采订单', url: '销售订单审核.html', activeKeys: ['销售订单审核.html', '待采订单详情.html', '待采订单审核详情.html'] },
        { type: 'item', label: '采购订单', url: '采购订单列表.html', activeKeys: ['采购订单列表.html', '采购订单详情.html'] },

        { type: 'group', label: '合同管理', icon: '📄' },
        { type: 'item', label: '合同管理', url: '合同管理.html', activeKeys: ['合同管理.html'] },

        { type: 'group', label: '产品管理', icon: '📦' },
        { type: 'item', label: '产品库', url: '产品库.html', activeKeys: ['产品库.html'] },
        // { type: 'item', label: '销售价格公式', url: '#', activeKeys: [] },

        { type: 'group', label: '系统管理', icon: '⚙️' },
        { type: 'item', label: '用户管理', url: '用户管理.html', activeKeys: ['用户管理.html'] },
        { type: 'item', label: '角色管理', url: '角色管理.html', activeKeys: ['角色管理.html'] },
        { type: 'item', label: '菜单管理', url: '菜单管理.html', activeKeys: ['菜单管理.html'] },
        { type: 'item', label: '部门管理', url: '部门管理.html', activeKeys: ['部门管理.html'] },
    ];

    var html = '';

    menus.forEach(function(menu) {
        if (menu.type === 'group') {
            html += '<div class="menu-group-title"><span class="menu-group-icon">' + menu.icon + '</span>' + menu.label + '</div>';
        } else if (menu.type === 'item') {
            var isActive = menu.activeKeys && menu.activeKeys.indexOf(filename) >= 0;
            if (filename === '采购订单详情.html' && query.indexOf('order=%E5%BE%85%E9%87%87-') >= 0) isActive = menu.label === '待采订单';
            var onclick = menu.url && menu.url !== '#' ? ' onclick="location.href=\'' + menu.url + '\'"' : '';
            html += '<div class="menu-item' + (isActive ? ' active' : '') + '"' + onclick + '>' + menu.label + '</div>';
        }
    });

    // 注入到页面
    // 新页面使用 sidebar-container；旧原型过渡期间也统一接管页面左侧第一层菜单。
    // 这样不会把供应商报价页内的筛选栏误识别为系统菜单。
    var container = document.getElementById('sidebar-container') || document.querySelector('.layout > aside.side, .layout > aside.menu, .shell > aside.side');
    if (container) {
        container.id = 'sidebar-container';
        container.className = 'sidebar';
        container.innerHTML = html;
    }

    // 注入菜单所需 CSS（如果页面未包含则自动注入）
    if (!document.getElementById('sidebar-component-css')) {
        var css = document.createElement('style');
        css.id = 'sidebar-component-css';
        css.textContent = `
.sidebar {
    width: 200px; background: #fff;
    border-right: 1px solid #f0f0f0;
    flex-shrink: 0; padding: 12px 0;
}
.menu-item {
    padding: 10px 24px 10px 48px; color: #666; cursor: pointer;
    font-size: 13px; border-left: 3px solid transparent;
    transition: all 0.15s;
}
.menu-item:hover { background: #f5f5f5; color: #2BA471; }
.menu-item.active {
    color: #2BA471; border-left-color: #2BA471;
    background: #f0faf5; font-weight: 500;
}
.menu-group-title {
    padding: 10px 20px; color: #333;
    font-size: 15px; font-weight: 600; margin-top: 8px;
    display: flex; align-items: center; gap: 8px;
}
.menu-group-title:first-of-type { margin-top: 4px; }
.menu-group-icon { font-size: 16px; width: 20px; text-align: center; }
`;
        document.head.appendChild(css);
    }
})();
