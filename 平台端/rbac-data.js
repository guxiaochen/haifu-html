/**
 * RBAC 权限管理 - 共享数据层
 * 提供 localStorage 持久化 + 预置数据初始化
 * 依赖：无
 *
 * 数据结构：
 *   部门(dept): { id, parentId, name, leader, phone, email, sort, status }
 *   菜单(menu): { id, parentId, name, type('M'目录/'C'菜单/'F'按钮), icon, path, perms, sort, visible, status }
 *   角色(role): { id, name, roleKey, sort, status, remark, menuIds[] }
 *   用户(user): { id, deptId, loginName, userName, phone, email, sex, status, roleIds[], pwd }
 *
 * 存储 key：
 *   rbac_depts / rbac_menus / rbac_roles / rbac_users
 */
(function (window) {
    var STORAGE_KEYS = {
        depts: 'rbac_depts',
        menus: 'rbac_menus',
        roles: 'rbac_roles',
        users: 'rbac_users'
    };

    /* ===== 通用读写 ===== */
    function read(key) {
        try {
            var raw = localStorage.getItem(key);
            return raw ? JSON.parse(raw) : [];
        } catch (e) { return []; }
    }
    function write(key, data) {
        localStorage.setItem(key, JSON.stringify(data));
    }
    function genId(prefix) {
        return (prefix || 'id') + '_' + Date.now() + '_' + Math.floor(Math.random() * 10000);
    }

    /* ===== 预置数据 ===== */
    function initDepts() {
        var data = read(STORAGE_KEYS.depts);
        if (data.length) return data;
        data = [
            { id: 'D100', parentId: '0',  name: '海赋科技',       leader: '张总', phone: '13800000001', email: 'zhang@haifu.com',   sort: 1, status: '0' },
            { id: 'D101', parentId: 'D100', name: '济南总公司',     leader: '王经理', phone: '13800000002', email: 'wang@haifu.com',    sort: 1, status: '0' },
            { id: 'D102', parentId: 'D100', name: '青岛分公司',     leader: '李经理', phone: '13800000003', email: 'li@haifu.com',      sort: 2, status: '0' },
            { id: 'D103', parentId: 'D101', name: '销售部',         leader: '赵主管', phone: '13800000004', email: 'zhao@haifu.com',    sort: 1, status: '0' },
            { id: 'D104', parentId: 'D101', name: '采购部',         leader: '钱主管', phone: '13800000005', email: 'qian@haifu.com',    sort: 2, status: '0' },
            { id: 'D105', parentId: 'D101', name: '财务部',         leader: '孙主管', phone: '13800000006', email: 'sun@haifu.com',     sort: 3, status: '0' },
            { id: 'D106', parentId: 'D101', name: '仓储物流部',     leader: '周主管', phone: '13800000007', email: 'zhou@haifu.com',    sort: 4, status: '0' },
            { id: 'D107', parentId: 'D102', name: '青岛销售组',     leader: '吴组长', phone: '13800000008', email: 'wu@haifu.com',      sort: 1, status: '0' },
            { id: 'D108', parentId: 'D102', name: '青岛采购组',     leader: '郑组长', phone: '13800000009', email: 'zheng@haifu.com',   sort: 2, status: '0' },
        ];
        write(STORAGE_KEYS.depts, data);
        return data;
    }

    function initMenus() {
        var data = read(STORAGE_KEYS.menus);
        if (data.length) {
            var removed = ['M1105', 'M1106', 'M1107', 'M12', 'M13', 'M14', 'M15', 'M16', 'M1201', 'M1202', 'M1203', 'M1204'];
            data = data.filter(function (menu) {
                return removed.indexOf(menu.id) < 0 && menu.path !== '销售订单审核.html' && menu.path !== '销售订单审核详情.html';
            });
            data.push(
                { id: 'M12', parentId: 'M1', name: '待采订单', type: 'C', icon: '', path: '销售订单审核.html', perms: 'order:pending:list', sort: 2, visible: '0', status: '0' },
                { id: 'M1201', parentId: 'M12', name: '待采订单查看', type: 'F', icon: '', path: '', perms: 'order:pending:query', sort: 1, visible: '0', status: '0' },
                { id: 'M1202', parentId: 'M12', name: '供应商分配', type: 'F', icon: '', path: '', perms: 'order:pending:assign', sort: 2, visible: '0', status: '0' },
                { id: 'M1203', parentId: 'M12', name: '提交待采审核', type: 'F', icon: '', path: '', perms: 'order:pending:submit', sort: 3, visible: '0', status: '0' },
                { id: 'M13', parentId: 'M1', name: '待采订单审核', type: 'C', icon: '', path: '待采订单审核.html', perms: 'order:pending:audit:list', sort: 3, visible: '0', status: '0' },
                { id: 'M1301', parentId: 'M13', name: '待采订单审核操作', type: 'F', icon: '', path: '', perms: 'order:pending:audit', sort: 1, visible: '0', status: '0' },
                { id: 'M14', parentId: 'M1', name: '采购订单', type: 'C', icon: '', path: '采购订单列表.html', perms: 'order:purchase:list', sort: 4, visible: '0', status: '0' },
                { id: 'M1401', parentId: 'M14', name: '采购订单查看', type: 'F', icon: '', path: '', perms: 'order:purchase:query', sort: 1, visible: '0', status: '0' },
                { id: 'M1402', parentId: 'M14', name: '采购订单导出', type: 'F', icon: '', path: '', perms: 'order:purchase:export', sort: 2, visible: '0', status: '0' }
            );
            write(STORAGE_KEYS.menus, data);
            return data;
        }
        data = [
            // ===== 订单管理 =====
            { id: 'M1',  parentId: '0',  name: '订单管理', type: 'M', icon: '📋', path: '',            perms: '',                  sort: 1, visible: '0', status: '0' },
            { id: 'M11', parentId: 'M1', name: '销售订单', type: 'C', icon: '',    path: '销售订单列表.html', perms: 'order:sales:list',  sort: 1, visible: '0', status: '0' },
            { id: 'M1101', parentId: 'M11', name: '销售订单查看', type: 'F', icon: '', path: '', perms: 'order:sales:query', sort: 1, visible: '0', status: '0' },
            { id: 'M1102', parentId: 'M11', name: '销售订单新增', type: 'F', icon: '', path: '', perms: 'order:sales:add',   sort: 2, visible: '0', status: '0' },
            { id: 'M1103', parentId: 'M11', name: '销售订单编辑', type: 'F', icon: '', path: '', perms: 'order:sales:edit',  sort: 3, visible: '0', status: '0' },
            { id: 'M1104', parentId: 'M11', name: '销售订单导出', type: 'F', icon: '', path: '', perms: 'order:sales:export',sort: 4, visible: '0', status: '0' },
            { id: 'M1108', parentId: 'M11', name: '确认销售订单', type: 'F', icon: '', path: '', perms: 'order:sales:confirm', sort: 5, visible: '0', status: '0' },
            { id: 'M12', parentId: 'M1', name: '待采订单', type: 'C', icon: '', path: '销售订单审核.html', perms: 'order:pending:list', sort: 2, visible: '0', status: '0' },
            { id: 'M1201', parentId: 'M12', name: '待采订单查看', type: 'F', icon: '', path: '', perms: 'order:pending:query', sort: 1, visible: '0', status: '0' },
            { id: 'M1202', parentId: 'M12', name: '供应商分配', type: 'F', icon: '', path: '', perms: 'order:pending:assign', sort: 2, visible: '0', status: '0' },
            { id: 'M1203', parentId: 'M12', name: '提交待采审核', type: 'F', icon: '', path: '', perms: 'order:pending:submit', sort: 3, visible: '0', status: '0' },
            { id: 'M13', parentId: 'M1', name: '待采订单审核', type: 'C', icon: '', path: '待采订单审核.html', perms: 'order:pending:audit:list', sort: 3, visible: '0', status: '0' },
            { id: 'M1301', parentId: 'M13', name: '待采订单审核操作', type: 'F', icon: '', path: '', perms: 'order:pending:audit', sort: 1, visible: '0', status: '0' },
            { id: 'M14', parentId: 'M1', name: '采购订单', type: 'C', icon: '', path: '采购订单列表.html', perms: 'order:purchase:list', sort: 4, visible: '0', status: '0' },
            { id: 'M1401', parentId: 'M14', name: '采购订单查看', type: 'F', icon: '', path: '', perms: 'order:purchase:query', sort: 1, visible: '0', status: '0' },
            { id: 'M1402', parentId: 'M14', name: '采购订单导出', type: 'F', icon: '', path: '', perms: 'order:purchase:export', sort: 2, visible: '0', status: '0' },

            { id: 'M15', parentId: 'M1', name: '询价单', type: 'C', icon: '', path: '#', perms: 'order:inquiry:list', sort: 5, visible: '0', status: '0' },
            { id: 'M16', parentId: 'M1', name: '报价单', type: 'C', icon: '', path: '#', perms: 'order:quote:list', sort: 6, visible: '0', status: '0' },

            // ===== 产品管理 =====
            { id: 'M2',  parentId: '0',  name: '产品管理', type: 'M', icon: '📦', path: '', perms: '', sort: 2, visible: '0', status: '0' },
            { id: 'M21', parentId: 'M2', name: '产品库',       type: 'C', icon: '', path: '#', perms: 'product:list',     sort: 1, visible: '0', status: '0' },
            { id: 'M2101', parentId: 'M21', name: '产品查看', type: 'F', icon: '', path: '', perms: 'product:query',  sort: 1, visible: '0', status: '0' },
            { id: 'M2102', parentId: 'M21', name: '产品新增', type: 'F', icon: '', path: '', perms: 'product:add',    sort: 2, visible: '0', status: '0' },
            { id: 'M2103', parentId: 'M21', name: '产品编辑', type: 'F', icon: '', path: '', perms: 'product:edit',   sort: 3, visible: '0', status: '0' },
            { id: 'M22', parentId: 'M2', name: '销售价格公式', type: 'C', icon: '', path: '#', perms: 'product:price:list', sort: 2, visible: '0', status: '0' },

            // ===== 结算付款 =====
            { id: 'M4',  parentId: '0',  name: '结算付款', type: 'M', icon: '💰', path: '', perms: '', sort: 4, visible: '0', status: '0' },
            { id: 'M41', parentId: 'M4', name: '结算管理', type: 'C', icon: '', path: '../结算付款流程图.html', perms: 'settle:list', sort: 1, visible: '0', status: '0' },

            // ===== 系统管理（权限模块自身） =====
            { id: 'M9',  parentId: '0',  name: '系统管理', type: 'M', icon: '⚙️', path: '', perms: '', sort: 9, visible: '0', status: '0' },
            { id: 'M91', parentId: 'M9', name: '用户管理', type: 'C', icon: '', path: '用户管理.html', perms: 'system:user:list',   sort: 1, visible: '0', status: '0' },
            { id: 'M9101', parentId: 'M91', name: '用户查看',   type: 'F', icon: '', path: '', perms: 'system:user:query',  sort: 1, visible: '0', status: '0' },
            { id: 'M9102', parentId: 'M91', name: '用户新增',   type: 'F', icon: '', path: '', perms: 'system:user:add',    sort: 2, visible: '0', status: '0' },
            { id: 'M9103', parentId: 'M91', name: '用户编辑',   type: 'F', icon: '', path: '', perms: 'system:user:edit',   sort: 3, visible: '0', status: '0' },
            { id: 'M9104', parentId: 'M91', name: '用户删除',   type: 'F', icon: '', path: '', perms: 'system:user:remove', sort: 4, visible: '0', status: '0' },
            { id: 'M9105', parentId: 'M91', name: '重置密码',   type: 'F', icon: '', path: '', perms: 'system:user:reset',  sort: 5, visible: '0', status: '0' },
            { id: 'M9106', parentId: 'M91', name: '导入用户',   type: 'F', icon: '', path: '', perms: 'system:user:import', sort: 6, visible: '0', status: '0' },
            { id: 'M9107', parentId: 'M91', name: '导出用户',   type: 'F', icon: '', path: '', perms: 'system:user:export', sort: 7, visible: '0', status: '0' },

            { id: 'M92', parentId: 'M9', name: '角色管理', type: 'C', icon: '', path: '角色管理.html', perms: 'system:role:list',   sort: 2, visible: '0', status: '0' },
            { id: 'M9201', parentId: 'M92', name: '角色查看',   type: 'F', icon: '', path: '', perms: 'system:role:query',  sort: 1, visible: '0', status: '0' },
            { id: 'M9202', parentId: 'M92', name: '角色新增',   type: 'F', icon: '', path: '', perms: 'system:role:add',    sort: 2, visible: '0', status: '0' },
            { id: 'M9203', parentId: 'M92', name: '角色编辑',   type: 'F', icon: '', path: '', perms: 'system:role:edit',   sort: 3, visible: '0', status: '0' },
            { id: 'M9204', parentId: 'M92', name: '角色删除',   type: 'F', icon: '', path: '', perms: 'system:role:remove', sort: 4, visible: '0', status: '0' },

            { id: 'M93', parentId: 'M9', name: '菜单管理', type: 'C', icon: '', path: '菜单管理.html', perms: 'system:menu:list',   sort: 3, visible: '0', status: '0' },
            { id: 'M9301', parentId: 'M93', name: '菜单查看',   type: 'F', icon: '', path: '', perms: 'system:menu:query',  sort: 1, visible: '0', status: '0' },
            { id: 'M9302', parentId: 'M93', name: '菜单新增',   type: 'F', icon: '', path: '', perms: 'system:menu:add',    sort: 2, visible: '0', status: '0' },
            { id: 'M9303', parentId: 'M93', name: '菜单编辑',   type: 'F', icon: '', path: '', perms: 'system:menu:edit',   sort: 3, visible: '0', status: '0' },
            { id: 'M9304', parentId: 'M93', name: '菜单删除',   type: 'F', icon: '', path: '', perms: 'system:menu:remove', sort: 4, visible: '0', status: '0' },

            { id: 'M94', parentId: 'M9', name: '部门管理', type: 'C', icon: '', path: '部门管理.html', perms: 'system:dept:list',   sort: 4, visible: '0', status: '0' },
            { id: 'M9401', parentId: 'M94', name: '部门查看',   type: 'F', icon: '', path: '', perms: 'system:dept:query',  sort: 1, visible: '0', status: '0' },
            { id: 'M9402', parentId: 'M94', name: '部门新增',   type: 'F', icon: '', path: '', perms: 'system:dept:add',    sort: 2, visible: '0', status: '0' },
            { id: 'M9403', parentId: 'M94', name: '部门编辑',   type: 'F', icon: '', path: '', perms: 'system:dept:edit',   sort: 3, visible: '0', status: '0' },
            { id: 'M9404', parentId: 'M94', name: '部门删除',   type: 'F', icon: '', path: '', perms: 'system:dept:remove', sort: 4, visible: '0', status: '0' },
        ];
        write(STORAGE_KEYS.menus, data);
        return data;
    }

    function initRoles() {
        var data = read(STORAGE_KEYS.roles);
        if (data.length) {
            data.forEach(function (role) {
                role.menuIds = (role.menuIds || []).filter(function (id) { return ['M1105', 'M1106', 'M1107', 'M1202', 'M1204'].indexOf(id) < 0; });
                if (role.roleKey === 'sales') {
                    ['M1', 'M11', 'M1101', 'M1104', 'M1108', 'M12', 'M1201'].forEach(function (id) { if (role.menuIds.indexOf(id) < 0) role.menuIds.push(id); });
                }
                if (role.roleKey === 'purchase') {
                    ['M1', 'M12', 'M1201', 'M1202', 'M1203', 'M13', 'M1301', 'M14', 'M1401', 'M1402'].forEach(function (id) { if (role.menuIds.indexOf(id) < 0) role.menuIds.push(id); });
                }
            });
            write(STORAGE_KEYS.roles, data);
            return data;
        }
        // 超级管理员拥有所有菜单权限
        var allMenuIds = initMenus().map(function (m) { return m.id; });
        data = [
            { id: 'R1', name: '超级管理员', roleKey: 'admin',    sort: 1, status: '0', remark: '拥有所有权限', menuIds: allMenuIds },
            { id: 'R2', name: '销售专员',   roleKey: 'sales',    sort: 2, status: '0', remark: '负责销售订单管理', menuIds: ['M1','M11','M1101','M1104','M12','M1201','M1202','M1203','M2','M21','M2101','M22'] },
            { id: 'R3', name: '采购专员',   roleKey: 'purchase', sort: 3, status: '0', remark: '负责待采订单和采购订单管理', menuIds: ['M1','M12','M1201','M1202','M1203','M13','M1301','M14','M1401','M1402'] },
            { id: 'R4', name: '财务专员',   roleKey: 'finance',  sort: 4, status: '0', remark: '负责结算付款',     menuIds: ['M1','M11','M1101','M12','M1201','M4','M41'] },
            { id: 'R5', name: '仓储物流',   roleKey: 'logistics',sort: 5, status: '0', remark: '负责仓储发货',     menuIds: ['M1','M11','M1101','M12','M1201'] },
        ];
        write(STORAGE_KEYS.roles, data);
        return data;
    }

    function initUsers() {
        var data = read(STORAGE_KEYS.users);
        if (data.length) return data;
        data = [
            { id: 'U1', deptId: 'D101', loginName: 'admin',   userName: 'Administrator', phone: '13800000001', email: 'admin@haifu.com',  sex: '0', status: '0', roleIds: ['R1'], pwd: 'admin123' },
            { id: 'U2', deptId: 'D103', loginName: 'zhangsan', userName: '张三',          phone: '13800000002', email: 'zhangsan@haifu.com', sex: '0', status: '0', roleIds: ['R2'], pwd: '123456' },
            { id: 'U3', deptId: 'D104', loginName: 'lisi',     userName: '李四',          phone: '13800000003', email: 'lisi@haifu.com',     sex: '1', status: '0', roleIds: ['R3'], pwd: '123456' },
            { id: 'U4', deptId: 'D105', loginName: 'wangwu',   userName: '王五',          phone: '13800000004', email: 'wangwu@haifu.com',   sex: '0', status: '0', roleIds: ['R4'], pwd: '123456' },
            { id: 'U5', deptId: 'D106', loginName: 'zhaoliu',  userName: '赵六',          phone: '13800000005', email: 'zhaoliu@haifu.com',  sex: '1', status: '0', roleIds: ['R5'], pwd: '123456' },
            { id: 'U6', deptId: 'D103', loginName: 'qianqi',   userName: '钱七',          phone: '13800000006', email: 'qianqi@haifu.com',   sex: '0', status: '1', roleIds: ['R2'], pwd: '123456' },
        ];
        write(STORAGE_KEYS.users, data);
        return data;
    }

    /* ===== 对外 API ===== */
    window.RBAC = {
        KEYS: STORAGE_KEYS,
        genId: genId,

        init: function () {
            initDepts();
            initMenus();
            initRoles();
            initUsers();
        },

        // ---- 部门 ----
        getDepts:    function () { return read(STORAGE_KEYS.depts); },
        saveDepts:   function (d) { write(STORAGE_KEYS.depts, d); },
        getDeptById: function (id) { return read(STORAGE_KEYS.depts).find(function (x) { return x.id === id; }); },
        // 获取部门树（含 children）
        getDeptTree: function () {
            var all = read(STORAGE_KEYS.depts);
            function build(parentId) {
                return all.filter(function (d) { return d.parentId === parentId; })
                    .sort(function (a, b) { return a.sort - b.sort; })
                    .map(function (d) {
                        var node = Object.assign({}, d);
                        node.children = build(d.id);
                        return node;
                    });
            }
            return build('0');
        },
        // 获取某部门及所有子部门 ID（含自身）
        getDeptChildIds: function (deptId) {
            var all = read(STORAGE_KEYS.depts);
            var ids = [deptId];
            function collect(pid) {
                all.filter(function (d) { return d.parentId === pid; }).forEach(function (d) {
                    ids.push(d.id);
                    collect(d.id);
                });
            }
            collect(deptId);
            return ids;
        },

        // ---- 菜单 ----
        getMenus:    function () { return read(STORAGE_KEYS.menus); },
        saveMenus:   function (m) { write(STORAGE_KEYS.menus, m); },
        getMenuById: function (id) { return read(STORAGE_KEYS.menus).find(function (x) { return x.id === id; }); },
        getMenuTree: function () {
            var all = read(STORAGE_KEYS.menus).sort(function (a, b) { return a.sort - b.sort; });
            function build(parentId) {
                return all.filter(function (m) { return m.parentId === parentId; })
                    .map(function (m) {
                        var node = Object.assign({}, m);
                        node.children = build(m.id);
                        return node;
                    });
            }
            return build('0');
        },

        // ---- 角色 ----
        getRoles:    function () { return read(STORAGE_KEYS.roles); },
        saveRoles:   function (r) { write(STORAGE_KEYS.roles, r); },
        getRoleById: function (id) { return read(STORAGE_KEYS.roles).find(function (x) { return x.id === id; }); },

        // ---- 用户 ----
        getUsers:    function () { return read(STORAGE_KEYS.users); },
        saveUsers:   function (u) { write(STORAGE_KEYS.users, u); },
        getUserById: function (id) { return read(STORAGE_KEYS.users).find(function (x) { return x.id === id; }); },

        /* ===== 通用工具 ===== */
        // 将树渲染为 <option> 下拉，带缩进
        renderTreeOptions: function (tree, labelKey, valueKey, selectedId, level) {
            level = level || 0;
            var html = '';
            tree.forEach(function (node) {
                var indent = '';
                for (var i = 0; i < level; i++) indent += '　';
                var sel = node[valueKey] === selectedId ? ' selected' : '';
                html += '<option value="' + node[valueKey] + '"' + sel + '>' + indent + (level > 0 ? '├ ' : '') + node[labelKey] + '</option>';
                if (node.children && node.children.length) {
                    html += window.RBAC.renderTreeOptions(node.children, labelKey, valueKey, selectedId, level + 1);
                }
            });
            return html;
        },

        // 菜单类型文本
        menuTypeText: function (type) {
            return type === 'M' ? '目录' : type === 'C' ? '菜单' : '按钮';
        },
        menuTypeTag: function (type) {
            var cls = type === 'M' ? 'tag-dir' : type === 'C' ? 'tag-menu' : 'tag-btn';
            var txt = window.RBAC.menuTypeText(type);
            return '<span class="rbac-tag ' + cls + '">' + txt + '</span>';
        },

        // 状态文本/标签
        statusTag: function (status) {
            if (status === '0') return '<span class="rbac-tag tag-ok">正常</span>';
            return '<span class="rbac-tag tag-stop">停用</span>';
        }
    };

    // 自动初始化
    window.RBAC.init();

})(window);
