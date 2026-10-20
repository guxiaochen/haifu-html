/**
 * 客户端左侧菜单栏组件
 * 使用方式：
 *   <div id="sidebar-container"></div>
 *   <script src="sidebar.js"></script>
 * 修改菜单只需改此文件一处
 */

(function() {
    var baseURL = '';
    // 自动检测相对路径前缀（根据当前页面所在层级）
    var path = window.location.pathname;
    var dir = path.substring(0, path.lastIndexOf('/'));
    var filename = decodeURIComponent(path.substring(path.lastIndexOf('/') + 1));

    // 菜单配置：key=菜单标识, label=显示名称, icon=图标, url=跳转地址, active=当前页是否激活
    var menus = [
        { type: 'standalone', label: '工作台', icon: '📋', url: '#' },

        { type: 'group', label: '商城购物', icon: '🛍️' },
        { type: 'item', label: '快捷下单', url: '#' },
        { type: 'item', label: '我的订单', url: '#' },
        { type: 'item', label: '购物车', url: '#' },

        { type: 'group', label: '采购管理', icon: '📋' },
        { type: 'item', label: '订货单', url: '鸡蛋-订货单列表.html', activeKeys: ['鸡蛋-订货单列表.html', '鸡蛋-新建订货单.html', '鸡蛋-订货单详情.html'] },
        { type: 'item', label: '采购订单', url: '采购订单列表.html',  activeKeys: ['采购订单列表.html', '采购订单详情.html', '新建采购订单.html', '鸡蛋-采购订单列表.html', '鸡蛋-采购订单详情.html'] },
        { type: 'item', label: '发货单', url: '鸡蛋-发货单列表.html',  activeKeys: ['鸡蛋-发货单列表.html', '鸡蛋-发货确认单详情.html'] },
        { type: 'item', label: '收货单', url: '收货单列表（全部）.html',  activeKeys: ['收货单列表（全部）.html', '收货单列表.html', '收货单详情.html', '鸡蛋-收货单列表.html', '鸡蛋-收货单详情.html'] },
        { type: 'item', label: '询价单', url: '询价单列表.html', activeKeys: ['询价单列表.html', '询价单详情.html', '平台报价单列表.html', '平台报价单详情.html'] },
        { type: 'item', label: '我的产品库', url: '我的产品库.html',  activeKeys: ['我的产品库.html'] },
        { type: 'item', label: '收货人管理', url: '联系人管理.html',  activeKeys: ['联系人管理.html'] },

        { type: 'group', label: '账号管理', icon: '👥' },
        { type: 'item', label: '登录账号', url: '账号管理.html', activeKeys: ['账号管理.html'] },

        { type: 'group', label: '竞价管理', icon: '🏆' },
        { type: 'item', label: '发布竞价', url: '#' },
        { type: 'item', label: '竞价列表', url: '#' },

        { type: 'group', label: '合同管理', icon: '📄' },
        { type: 'item', label: '合同管理', url: '合同管理.html', activeKeys: ['合同管理.html'] },

    ];

    // 判断当前页面应该激活哪个菜单项
    var currentFile = filename;
    var source = '';
    try { source = new URLSearchParams(location.search).get('source') || ''; } catch (e) {}
    if (filename === '收货单详情.html') {
        currentFile = source === 'receipt-menu' ? '收货单列表（全部）.html' : '收货单列表.html';
    }
    if (filename === '采购订单详情.html' && source === 'receipt-menu') {
        currentFile = '收货单列表（全部）.html';
    }

    var html = '';

    menus.forEach(function(menu) {
        if (menu.type === 'standalone') {
            html += '<div class="menu-item standalone"' +
                (menu.url !== '#' ? ' onclick="location.href=\'' + menu.url + '\'"' : '') +
                '>' + menu.icon + ' ' + menu.label + '</div>';
        } else if (menu.type === 'group') {
            html += '<div class="menu-group-title"><span class="menu-group-icon">' + menu.icon + '</span>' + menu.label + '</div>';
        } else if (menu.type === 'subtitle') {
            html += '<div class="menu-subtitle">' + menu.label + '</div>';
        } else if (menu.type === 'divider') {
            html += '<div class="menu-divider"></div>';
        } else if (menu.type === 'item') {
            var isActive = menu.activeKeys && menu.activeKeys.indexOf(currentFile) >= 0;
            var onclick = menu.url && menu.url !== '#' ? ' onclick="location.href=\'' + menu.url + '\'"' : '';
            var cls = 'menu-item' + (isActive ? ' active' : '') + (menu.top ? ' top-level' : '');
            html += '<div class="' + cls + '"' + onclick + '>' + menu.label + '</div>';
        }
    });

    // 注入到页面
    var container = document.getElementById('sidebar-container');
    if (container) {
        container.className = 'sidebar';
        container.innerHTML = html;
    }

    // 注入菜单所需CSS（如果页面未包含则自动注入）
    if (!document.getElementById('sidebar-component-css')) {
        var css = document.createElement('style');
        css.id = 'sidebar-component-css';
        css.textContent = `
.sidebar {
    width: 180px; background: #fff;
    border-right: 1px solid #f0f0f0;
    flex-shrink: 0; padding: 12px 0;
}
.menu-item {
    padding: 10px 24px 10px 48px; color: #666; cursor: pointer;
    font-size: 13px;
    border-left: 3px solid transparent;
    transition: all 0.15s;
}
.menu-item:hover { background: #f5f5f5; color: #2BA471; }
.menu-item.active {
    color: #2BA471; border-left-color: #2BA471;
    background: #f0faf5; font-weight: 500;
}
.menu-item.top-level { padding-left: 30px; }
.menu-group-title {
    padding: 10px 20px; color: #333;
    font-size: 15px; font-weight: 600; margin-top: 8px;
    display: flex; align-items: center; gap: 8px;
}
.menu-group-title:first-of-type { margin-top: 4px; }
.menu-group-icon { font-size: 16px; width: 20px; text-align: center; }
.menu-subtitle {
    padding: 9px 20px 5px 22px; color: #9aa3ad;
    font-size: 12px; font-weight: 600; margin-top: 8px;
    letter-spacing: .03em;
}
.menu-item.standalone {
    padding-left: 24px; font-size: 15px; font-weight: 600; color: #333;
}
`;
        document.head.appendChild(css);
    }
})();
