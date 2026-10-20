/**
 * 平台端库存模块共享数据脚本
 * ------------------------------------------------------------------
 * 只服务平台端「库存管理 - 入库单 / 出库单」两个页面，不修改客户端、供应商端。
 *
 * 两种交货方式：
 *   customer（直送）：供应商直接向客户发货，平台不产生真实库存变更。
 *                    入库单 = 供应商送货单镜像；出库单 = 客户收货单镜像；平台只查看。
 *   platform（中转）：供应商送货到平台，平台生成收货单并确认收货（真实入库），
 *                    确认收货后生成平台送货单并申请验收（真实出库）。
 *
 * 数据分两类：
 *   1. 内置初始演示数据（DEMO_SCENES）：页面刷新后按初始状态恢复，保证可重复演示。
 *   2. 运行期数据（localStorage）：平台端在原型中执行「确认收货 / 申请验收 / 创建欠单」
 *      后写入，刷新保留。
 *
 * localStorage key：
 *   haifu_inventory_receipts  入库单（平台收货单 + 直送镜像）
 *   haifu_inventory_shipments 出库单（平台送货单 + 直送镜像）
 *   haifu_inventory_owing     中转模式平台向供应商创建的欠单
 *
 * 物流信息（logistics）：每条记录为一次运输，含车牌号、司机姓名、司机手机号与附件。
 *   入库单（收货单）只展示供应商送货时提交的物流信息，平台不提供编辑入口。
 *   出库单（送货单）在申请验收前由平台自行上传/维护物流信息。
 */
(function (global) {
  'use strict';

  var STORE_KEY = 'haifu_inventory_receipts';
  var SHIP_KEY = 'haifu_inventory_shipments';
  var OWING_KEY = 'haifu_inventory_owing';
  // 平台入库欠单 → 供应商端自动生成的欠单送货单（供应商按欠单数量补发到平台）
  var SUPPLIER_OWING_KEY = 'haifu_supplier_owing_shipments';
  // 平台出库少发后生成的平台补发送货单
  var PLATFORM_OWING_KEY = 'haifu_platform_owing_shipments';
  // 平台申请验收后实时同步到客户端的收货单（单张及批量合并）
  var CUSTOMER_RECEIPT_KEY = 'haifu_customer_incoming_receipts';
  // 目的位置字典（平台在「库存管理 - 目的位置维护」中自行维护）
  var LOCATION_KEY = 'haifu_inventory_locations';

  var PLATFORM_RECEIVERS = [
    { name: '仓储中心-周师傅', phone: '13800000007', address: '海赋科技仓储物流中心' },
    { name: '济南仓-王经理', phone: '13800000002', address: '济南总公司仓库' },
    { name: '青岛仓-李经理', phone: '13800000003', address: '青岛分公司仓库' }
  ];

  var CUSTOMER_RECEIVER = { name: '侯振鲁', phone: '17505308090', address: '兰州路66号' };

  // 演示用两个产品（与采购订单 / 销售订单明细保持一致）
  var PRODUCT_A = {
    code: '0000807',
    name: 'BAITESI/伯特斯 手动液压堆高车',
    spec: 'CTY-1 载重1t 货叉...',
    brand: 'BAITESI/佰...',
    unit: '台',
    price: 3170.59
  };
  var PRODUCT_B = {
    code: '0000808',
    name: 'BAITESI/伯特斯 电动液压搬运车',
    spec: 'CBD-2 载重2t...',
    brand: 'BAITESI/佰...',
    unit: '台',
    price: 5800
  };

  /** 演示物流信息（一次运输一条）：车牌号、司机姓名、司机手机号 + 附件 */
  function makeLogistics(plate, driver, phone, files) {
    return {
      id: 'LG-' + plate.replace(/[^0-9A-Za-z]/g, ''),
      plate: plate,
      driver: driver,
      phone: phone,
      headPhoto: [{ name: (files && files.headPhoto) || '车头照片.jpg' }],
      tailPhoto: [{ name: (files && files.tailPhoto) || '车尾照片.jpg' }],
      video: files && files.video ? [{ name: files.video }] : [],
      excel: files && files.excel ? [{ name: files.excel }] : []
    };
  }

  function makeItem(product, orderQty, sentQty, receivedQty) {
    return {
      code: product.code,
      name: product.name,
      spec: product.spec,
      brand: product.brand,
      unit: product.unit,
      price: product.price,
      orderQty: orderQty,
      sentQty: sentQty,
      receivedQty: receivedQty
    };
  }

  /**
   * 初始演示场景
   * 直送 2 组（已收货 / 已发货）+ 中转 1 组，覆盖「待收货 / 已发货 / 已收货」全部状态。
   * 演示口径：
   *   入库单（供应商 → 平台/客户）——客户直送 1 条待收货 + 1 条已收货、平台中转 2 条待收货 + 2 条已收货；
   *   出库单（平台 → 客户）      ——客户直送 1 条已发货 + 1 条已收货、平台中转 1 条已发货 + 1 条已收货。
   */
  var DEMO_SCENES = [
    // ================= 直送场景（平台只查看） =================
    // 客户已收货：入库单 / 出库单均为「已收货」
    {
      receipt: {
        id: 'RK-DS-F001',
        bizNo: 'RK2026090001',
        kind: 'mirror',
        bizType: 'inbound',
        sourceDocType: '供应商送货单',
        sourceDocNo: 'DS2026090001',
        sourceOrderNo: 'P000015',
        orderLabel: '平台采购订单号',
        orderNo: 'P000015',
        counterparty: 'aqtest海赋（山东）数字产业发展有限公司HZ',
        counterpartyLabel: '供应商',
        deliveryMode: 'customer',
        modeLabel: '客户直送',
        status: 'received',
        receivedAt: '2026年09月18日 10时20分',
        createdAt: '2026年09月16日 09时00分',
        shipmentAt: '2026年09月17日 15时30分',
        receiverName: CUSTOMER_RECEIVER.name,
        receiverPhone: CUSTOMER_RECEIVER.phone,
        receiverAddress: CUSTOMER_RECEIVER.address,
        items: [
          makeItem(PRODUCT_A, 2, 2, 2),
          makeItem(PRODUCT_B, 1, 1, 1)
        ],
        // 直送：由供应商提交，平台只读
        logistics: [
          makeLogistics('鲁H·9D316', '孙师傅', '13805317766', { excel: '直送运输明细.xlsx' })
        ]
      },
      shipment: {
        id: 'CK-DS-F001',
        bizNo: 'CK2026090001',
        kind: 'mirror',
        bizType: 'outbound',
        sourceDocType: '客户收货单',
        sourceDocNo: 'SH2026090001',
        sourceOrderNo: 'SO000205',
        orderLabel: '平台销售订单号',
        orderNo: 'SO000205',
        counterparty: 'agtest淘宝（山东）数字产业发展有限公司LL',
        counterpartyLabel: '客户',
        deliveryMode: 'customer',
        modeLabel: '客户直送',
        status: 'received',
        receivedAt: '2026年09月18日 10时20分',
        createdAt: '2026年09月16日 09时00分',
        shipmentAt: '2026年09月17日 15时30分',
        receiverName: CUSTOMER_RECEIVER.name,
        receiverPhone: CUSTOMER_RECEIVER.phone,
        receiverAddress: CUSTOMER_RECEIVER.address,
        items: [
          makeItem(PRODUCT_A, 2, 2, 2),
          makeItem(PRODUCT_B, 1, 1, 1)
        ],
        logistics: [
          makeLogistics('鲁H·9D316', '孙师傅', '13805317766', { excel: '直送运输明细.xlsx' })
        ]
      }
    },
    // 客户直送待收货：供应商已发货、客户尚未确认收货（平台可演示查看待收货数据）
    {
      receipt: {
        id: 'RK-DS-F002',
        bizNo: 'RK2026090002',
        kind: 'mirror',
        bizType: 'inbound',
        sourceDocType: '供应商送货单',
        sourceDocNo: 'DS2026090002',
        sourceOrderNo: 'P000016',
        orderLabel: '平台采购订单号',
        orderNo: 'P000016',
        counterparty: '菏泽牡丹食品加工厂',
        counterpartyLabel: '供应商',
        deliveryMode: 'customer',
        modeLabel: '客户直送',
        status: 'pending',
        receivedAt: '',
        createdAt: '2026年09月22日 14时10分',
        shipmentAt: '2026年09月23日 08时40分',
        receiverName: CUSTOMER_RECEIVER.name,
        receiverPhone: CUSTOMER_RECEIVER.phone,
        receiverAddress: CUSTOMER_RECEIVER.address,
        items: [makeItem(PRODUCT_A, 5, 4, 0)]
      },
      shipment: {
        id: 'CK-DS-F002',
        bizNo: 'CK2026090002',
        kind: 'mirror',
        bizType: 'outbound',
        sourceDocType: '客户收货单',
        sourceDocNo: 'SH2026090002',
        sourceOrderNo: 'SO000206',
        orderLabel: '平台销售订单号',
        orderNo: 'SO000206',
        counterparty: '菏泽牡丹食品有限公司LL',
        counterpartyLabel: '客户',
        deliveryMode: 'customer',
        modeLabel: '客户直送',
        status: 'sent',
        receivedAt: '',
        createdAt: '2026年09月22日 14时10分',
        shipmentAt: '2026年09月23日 08时40分',
        receiverName: CUSTOMER_RECEIVER.name,
        receiverPhone: CUSTOMER_RECEIVER.phone,
        receiverAddress: CUSTOMER_RECEIVER.address,
        items: [makeItem(PRODUCT_A, 5, 4, 0)]
      }
    },

    // ================= 中转场景（平台真实出入库） =================
    {
      // 供应商已送货到平台，等待平台确认收货
      receipt: {
        id: 'RK2026090003',
        bizNo: 'RK2026090003',
        kind: 'real',
        bizType: 'inbound',
        sourceDocType: '供应商送货单',
        sourceDocNo: 'DS2026090003',
        sourceOrderNo: 'P000017',
        orderLabel: '平台采购订单号',
        orderNo: 'P000017',
        counterparty: '青岛海尔智能家电有限公司',
        counterpartyLabel: '供应商',
        deliveryMode: 'platform',
        modeLabel: '平台中转',
        status: 'pending',
        receivedAt: '',
        createdAt: '2026年09月25日 09时30分',
        shipmentAt: '2026年09月26日 16时00分',
        receiverName: PLATFORM_RECEIVERS[0].name,
        receiverPhone: PLATFORM_RECEIVERS[0].phone,
        receiverAddress: PLATFORM_RECEIVERS[0].address,
        items: [
          makeItem(PRODUCT_A, 3, 3, 0),
          makeItem(PRODUCT_B, 2, 2, 0)
        ],
        // 供应商送货到平台时提交的物流信息，平台只读
        logistics: [
          makeLogistics('鲁B·6M219', '李师傅', '13905312266', { video: '到货卸车.mp4', excel: '送货明细.xlsx' })
        ]
      },
      // 供应商已送货到平台、平台已确认收货，等待平台申请验收
      receiptDone: {
        id: 'RK2026090004',
        bizNo: 'RK2026090004',
        kind: 'real',
        bizType: 'inbound',
        sourceDocType: '供应商送货单',
        sourceDocNo: 'DS2026090004',
        sourceOrderNo: 'P000018',
        orderLabel: '平台采购订单号',
        orderNo: 'P000018',
        counterparty: '菏泽牡丹食品加工厂',
        counterpartyLabel: '供应商',
        deliveryMode: 'platform',
        modeLabel: '平台中转',
        status: 'received',
        receivedAt: '2026年09月27日 11时05分',
        createdAt: '2026年09月24日 10时00分',
        shipmentAt: '2026年09月25日 14时20分',
        receiverName: PLATFORM_RECEIVERS[1].name,
        receiverPhone: PLATFORM_RECEIVERS[1].phone,
        receiverAddress: PLATFORM_RECEIVERS[1].address,
        items: [
          makeItem(PRODUCT_A, 6, 6, 6),
          makeItem(PRODUCT_B, 2, 2, 2)
        ],
        logistics: [
          makeLogistics('鲁A·8K520', '王师傅', '13805310088', { video: '到货卸车.mp4', excel: '入库明细.xlsx' })
        ]
      },
      // 平台确认收货后生成的平台送货单，平台已申请验收、客户尚未确认收货
      shipmentPending: {
        id: 'CK2026090003',
        bizNo: 'CK2026090003',
        kind: 'real',
        bizType: 'outbound',
        sourceDocType: '平台收货单',
        sourceDocNo: 'RK2026090004',
        sourceOrderNo: 'SO000208',
        orderLabel: '平台销售订单号',
        orderNo: 'SO000208',
        counterparty: 'agtest淘宝（山东）数字产业发展有限公司LL',
        counterpartyLabel: '客户',
        deliveryMode: 'platform',
        modeLabel: '平台中转',
        status: 'sent',
        receivedAt: '',
        createdAt: '2026年09月27日 11时05分',
        shipmentAt: '2026年09月27日 11时05分',
        purposeLocation: '海赋科技仓储物流中心',
        receiverName: CUSTOMER_RECEIVER.name,
        receiverPhone: CUSTOMER_RECEIVER.phone,
        receiverAddress: CUSTOMER_RECEIVER.address,
        items: [
          makeItem(PRODUCT_A, 6, 6, 6),
          makeItem(PRODUCT_B, 2, 2, 2)
        ],
        // 平台填写：本次分两车发出
        logistics: [
          makeLogistics('鲁A·8K520', '王师傅', '13805310088', { excel: '第一车运输明细.xlsx' }),
          makeLogistics('鲁C·3P708', '赵师傅', '13705314588', { video: '第二车装车.mp4', excel: '第二车运输明细.xlsx' })
        ]
      },
      // 平台已申请验收，客户已确认收货
      shipmentDone: {
        id: 'CK2026090004',
        bizNo: 'CK2026090004',
        kind: 'real',
        bizType: 'outbound',
        sourceDocType: '平台收货单',
        sourceDocNo: 'RK2026090005',
        sourceOrderNo: 'SO000209',
        orderLabel: '平台销售订单号',
        orderNo: 'SO000209',
        counterparty: '海赋（山东）数字产业发展有限公司LL',
        counterpartyLabel: '客户',
        deliveryMode: 'platform',
        modeLabel: '平台中转',
        status: 'received',
        receivedAt: '2026年09月28日 09时40分',
        createdAt: '2026年09月20日 15时00分',
        shipmentAt: '2026年09月21日 09时15分',
        receiverName: CUSTOMER_RECEIVER.name,
        receiverPhone: CUSTOMER_RECEIVER.phone,
        receiverAddress: CUSTOMER_RECEIVER.address,
        items: [makeItem(PRODUCT_B, 4, 4, 4)]
      },
      receiptForDone: {
        id: 'RK2026090005',
        bizNo: 'RK2026090005',
        kind: 'real',
        bizType: 'inbound',
        sourceDocType: '供应商送货单',
        sourceDocNo: 'DS2026090005',
        sourceOrderNo: 'P000019',
        orderLabel: '平台采购订单号',
        orderNo: 'P000019',
        counterparty: '菏泽牡丹食品加工厂',
        counterpartyLabel: '供应商',
        deliveryMode: 'platform',
        modeLabel: '平台中转',
        status: 'received',
        receivedAt: '2026年09月20日 15时00分',
        createdAt: '2026年09月19日 09时00分',
        shipmentAt: '2026年09月20日 08时30分',
        receiverName: PLATFORM_RECEIVERS[0].name,
        receiverPhone: PLATFORM_RECEIVERS[0].phone,
        receiverAddress: PLATFORM_RECEIVERS[0].address,
        items: [makeItem(PRODUCT_B, 4, 4, 4)]
      }
    },
    // ================= 中转场景补充：可模拟的待收货入库单 =================
    // 独立于上面三组链路，始终保持「待收货」，供随时演示确认收货 / 欠单流程；
    // 确认收货后会实时生成对应的平台出库单（待发货）。
    {
      receipt: {
        id: 'RK2026090006',
        bizNo: 'RK2026090006',
        kind: 'real',
        bizType: 'inbound',
        sourceDocType: '供应商送货单',
        sourceDocNo: 'DS2026090006',
        sourceOrderNo: 'P000020',
        orderLabel: '平台采购订单号',
        orderNo: 'P000020',
        counterparty: '青岛海尔智能家电有限公司',
        counterpartyLabel: '供应商',
        deliveryMode: 'platform',
        modeLabel: '平台中转',
        status: 'pending',
        receivedAt: '',
        createdAt: '2026年09月28日 10时20分',
        shipmentAt: '2026年09月28日 09时05分',
        receiverName: PLATFORM_RECEIVERS[2].name,
        receiverPhone: PLATFORM_RECEIVERS[2].phone,
        receiverAddress: PLATFORM_RECEIVERS[2].address,
        items: [
          makeItem(PRODUCT_A, 4, 4, 0),
          makeItem(PRODUCT_B, 2, 2, 0)
        ],
        // 供应商送货到平台时提交的物流信息，平台只读
        logistics: [
          makeLogistics('鲁U·7K365', '孙师傅', '13805316677', { video: '到货卸车.mp4', excel: '送货明细.xlsx' })
        ]
      }
    },
    // ================= 中转批量发货：同一客户、同一地址、跨销售订单 =================
    {
      shipment: {
        id: 'CK2026090010', bizNo: 'CK2026090010', kind: 'real', bizType: 'outbound',
        sourceDocType: '平台收货单', sourceDocNo: 'RK2026090010', sourceOrderNo: 'SO000210',
        orderLabel: '平台销售订单号', orderNo: 'SO000210',
        counterparty: '海赋（山东）数字产业发展有限公司LL', counterpartyLabel: '客户',
        deliveryMode: 'platform', modeLabel: '平台中转', status: 'pending', receivedAt: '',
        createdAt: '2026年09月29日 09时00分', shipmentAt: '', purposeLocation: '海赋科技仓储物流中心',
        receiverName: CUSTOMER_RECEIVER.name, receiverPhone: CUSTOMER_RECEIVER.phone, receiverAddress: CUSTOMER_RECEIVER.address,
        items: [makeItem(PRODUCT_A, 3, 3, 0)]
      }
    },
    {
      shipment: {
        id: 'CK2026090011', bizNo: 'CK2026090011', kind: 'real', bizType: 'outbound',
        sourceDocType: '平台收货单', sourceDocNo: 'RK2026090011', sourceOrderNo: 'SO000211',
        orderLabel: '平台销售订单号', orderNo: 'SO000211',
        counterparty: '海赋（山东）数字产业发展有限公司LL', counterpartyLabel: '客户',
        deliveryMode: 'platform', modeLabel: '平台中转', status: 'pending', receivedAt: '',
        createdAt: '2026年09月29日 09时15分', shipmentAt: '', purposeLocation: '济南总公司仓库',
        receiverName: CUSTOMER_RECEIVER.name, receiverPhone: CUSTOMER_RECEIVER.phone, receiverAddress: CUSTOMER_RECEIVER.address,
        items: [makeItem(PRODUCT_B, 2, 2, 0)]
      }
    }
  ];

  /**
   * 目的位置初始演示数据
   * 字段：位置、位置类型、公司（三项均非必填，由平台在维护页自行增删改）
   */
  var LOCATION_SEED = [
    { id: 'LOC-001', location: '海赋科技仓储物流中心', type: '自有仓库', company: '海赋科技（山东）数字产业发展有限公司' },
    { id: 'LOC-002', location: '济南总公司仓库', type: '自有仓库', company: '海赋科技（山东）数字产业发展有限公司' },
    { id: 'LOC-003', location: '青岛分公司仓库', type: '分公司仓库', company: '海赋科技（山东）数字产业发展有限公司' },
    { id: 'LOC-004', location: '兰州路66号中转点', type: '中转点', company: '' },
    { id: 'LOC-005', location: '菏泽牡丹食品加工厂', type: '供应商仓库', company: '菏泽牡丹食品加工厂' }
  ];

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function flatten(key) {
    var list = [];
    DEMO_SCENES.forEach(function (scene) {
      if (scene[key]) list.push(clone(scene[key]));
    });
    return list;
  }

  function read(key) {
    try {
      var raw = localStorage.getItem(key);
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    return null;
  }

  function write(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {}
  }

  /**
   * 合并「内置演示数据 + 运行期数据」：
   * 运行期数据（localStorage）代表页面操作后的最新结果，同一 id 时覆盖内置演示数据，
   * 保证刷新后仍能按最新状态复现，且不会在列表中重复出现同一单据。
   */
  function merge(builtin, runtime) {
    var map = {};
    var order = [];
    builtin.concat(runtime).forEach(function (row) {
      if (!row) return;
      if (!map[row.id]) order.push(row.id);
      map[row.id] = row;
    });
    return order.map(function (id) { return map[id]; });
  }

  function directMirrorRecords(type) {
    var incoming = read(CUSTOMER_RECEIPT_KEY) || [];
    return incoming.filter(function (row) {
      return row && String(row.sourceType || '').indexOf('platform-') !== 0;
    }).map(function (row) {
      var lines = row.lines || [];
      var orders = [];
      lines.forEach(function (line) { if (line.order && orders.indexOf(line.order) < 0) orders.push(line.order); });
      var isInbound = type === 'inbound';
      return {
        id: (isInbound ? 'RK-MIRROR-' : 'CK-MIRROR-') + (row.sourceKey || row.no),
        bizNo: (isInbound ? 'RK' : 'CK') + String(row.no || '').replace(/[^0-9A-Za-z]/g, ''),
        kind: 'mirror', bizType: type,
        sourceDocType: isInbound ? '供应商送货单' : '客户收货单',
        sourceDocNo: isInbound ? (row.sourceBatch || row.sourceDelivery || row.no) : row.no,
        sourceOrderNo: orders[0] || row.order || '',
        orderLabel: isInbound ? '平台采购订单号' : '平台销售订单号',
        orderNo: orders.join('、') || row.order || '',
        counterparty: isInbound ? (row.supplier || '供应商') : (row.customer || '客户'),
        counterpartyLabel: isInbound ? '供应商' : '客户',
        deliveryMode: 'customer', modeLabel: '客户直送',
        status: row.status === 'received' ? 'received' : (isInbound ? 'pending' : 'sent'),
        receivedAt: row.receivedAt || '', createdAt: row.date || '', shipmentAt: row.date || '',
        receiverName: row.receiverName || CUSTOMER_RECEIVER.name,
        receiverPhone: row.receiverPhone || CUSTOMER_RECEIVER.phone,
        receiverAddress: row.address || CUSTOMER_RECEIVER.address,
        logistics: row.logistics || [],
        items: lines.map(function (line) {
          return makeItem({ code: line.code, name: line.product, spec: line.spec || '—', brand: line.brand || '—', unit: line.unit || '', price: line.price || 0 }, Number(line.ordered || line.shipped || 0), Number(line.shipped || 0), Number(line.received || 0));
        })
      };
    });
  }

  /** 入库单列表：内置演示数据 + 运行期数据（运行期覆盖同 id 的演示数据） */
  function getReceipts() {
    return merge(
      flatten('receipt').concat(flatten('receiptDone')).concat(flatten('receiptForDone')).concat(directMirrorRecords('inbound')),
      read(STORE_KEY) || []
    );
  }

  /** 出库单列表：内置演示数据 + 运行期数据（运行期覆盖同 id 的演示数据） */
  function getShipments() {
    return merge(
      flatten('shipment').concat(flatten('shipmentPending')).concat(flatten('shipmentDone')).concat(directMirrorRecords('outbound')),
      read(SHIP_KEY) || []
    );
  }

  function getReceipt(id) {
    return getReceipts().filter(function (row) { return row.id === id || row.bizNo === id; })[0] || null;
  }

  function getShipment(id) {
    return getShipments().filter(function (row) { return row.id === id || row.bizNo === id; })[0] || null;
  }

  function saveReceipt(receipt) {
    var list = read(STORE_KEY) || [];
    var index = list.findIndex(function (row) {
      return row.id === receipt.id || (row.bizNo && row.bizNo === receipt.bizNo);
    });
    if (index >= 0) list[index] = receipt;
    else list.push(receipt);
    write(STORE_KEY, list);
  }

  function saveShipment(shipment) {
    var list = read(SHIP_KEY) || [];
    var index = list.findIndex(function (row) {
      return row.id === shipment.id || (row.bizNo && row.bizNo === shipment.bizNo);
    });
    if (index >= 0) list[index] = shipment;
    else list.push(shipment);
    write(SHIP_KEY, list);
  }

  function purchaseToSalesOrder(receipt) {
    if (receipt.salesOrderNo) return receipt.salesOrderNo;
    var map = {
      P000015: 'SO000205', P000016: 'SO000206', P000017: 'SO000207',
      P000018: 'SO000208', P000019: 'SO000209', P000020: 'SO000210'
    };
    return map[receipt.orderNo] || receipt.sourceOrderNo || receipt.orderNo;
  }

  function getOwings() {
    return read(OWING_KEY) || [];
  }

  function addOwing(owing) {
    var list = getOwings();
    list.push(owing);
    write(OWING_KEY, list);
  }

  /**
   * 状态文案按单据类型区分：
   *   入库单（inbound）——待收货 / 已收货（不做「已发货」，供应商送达即进入待收货）；
   *   出库单（outbound）——待发货 / 已发货 / 已收货（与供应商端送货单口径一致）。
   */
  var RECEIPT_STATUS_TEXT = {
    pending: '待收货',
    received: '已收货'
  };
  var SHIPMENT_STATUS_TEXT = {
    pending: '待发货',
    sent: '已发货',
    received: '已收货'
  };

  function statusText(status) {
    return RECEIPT_STATUS_TEXT[status] || SHIPMENT_STATUS_TEXT[status] || status;
  }

  /** 按单据类型取状态文案：类型缺省时按入库单口径（兼容旧调用） */
  function statusTextOf(bizType, status) {
    var map = bizType === 'outbound' ? SHIPMENT_STATUS_TEXT : RECEIPT_STATUS_TEXT;
    return map[status] || SHIPMENT_STATUS_TEXT[status] || RECEIPT_STATUS_TEXT[status] || status;
  }

  function statusClass(status) {
    if (status === 'received') return 'status-done';
    if (status === 'sent') return 'status-confirm';
    return 'status-pending';
  }

  /** 状态步骤条下标：入库单 待收货 0 / 已收货 1；出库单 待发货 0 / 已发货 1 / 已收货 2 */
  function statusStepIndex(bizType, status) {
    if (bizType === 'outbound') {
      return status === 'received' ? 2 : (status === 'sent' ? 1 : 0);
    }
    return status === 'received' ? 1 : 0;
  }

  function nowText() {
    var d = new Date();
    function pad(n) { return n < 10 ? '0' + n : '' + n; }
    return d.getFullYear() + '年' + pad(d.getMonth() + 1) + '月' + pad(d.getDate()) + '日 ' +
      pad(d.getHours()) + '时' + pad(d.getMinutes()) + '分';
  }

  /**
   * 目的位置字典：
   * 内置演示数据 + 运行期数据（localStorage）合并，同一 id 时运行期覆盖内置，
   * 删除内置项时记录到已删除集合，保证刷新后仍按维护结果展示。
   */
  function getLocations() {
    var runtime = read(LOCATION_KEY) || {};
    var list = clone(LOCATION_SEED).filter(function (row) {
      return !(runtime.removed || []).some(function (id) { return id === row.id; });
    });
    return merge(list, runtime.items || []);
  }

  function nextLocationId() {
    var max = 0;
    getLocations().forEach(function (row) {
      var num = parseInt(String(row.id || '').replace(/[^0-9]/g, ''), 10);
      if (num > max) max = num;
    });
    return 'LOC-' + String(max + 1).padStart(3, '0');
  }

  /** 新增目的位置（位置、位置类型、公司均非必填，由维护页自行填写） */
  function addLocation(data) {
    var record = {
      id: nextLocationId(),
      location: (data && data.location) || '',
      type: (data && data.type) || '',
      company: (data && data.company) || ''
    };
    var runtime = read(LOCATION_KEY) || {};
    runtime.items = runtime.items || [];
    runtime.items.push(record);
    write(LOCATION_KEY, runtime);
    return record;
  }

  /** 修改目的位置 */
  function updateLocation(id, data) {
    var runtime = read(LOCATION_KEY) || {};
    runtime.items = runtime.items || [];
    var index = runtime.items.findIndex(function (row) { return row.id === id; });
    var record = {
      id: id,
      location: (data && data.location) || '',
      type: (data && data.type) || '',
      company: (data && data.company) || ''
    };
    if (index >= 0) runtime.items[index] = record;
    else runtime.items.push(record);
    write(LOCATION_KEY, runtime);
    return record;
  }

  /** 删除目的位置：内置项记入已删除集合，运行期项直接移除 */
  function removeLocation(id) {
    var runtime = read(LOCATION_KEY) || {};
    runtime.items = (runtime.items || []).filter(function (row) { return row.id !== id; });
    runtime.removed = runtime.removed || [];
    var isSeed = LOCATION_SEED.some(function (row) { return row.id === id; });
    if (isSeed && runtime.removed.indexOf(id) < 0) runtime.removed.push(id);
    write(LOCATION_KEY, runtime);
    return true;
  }

  /** 按名称取目的位置（单据保存后回显用） */
  function getLocationByName(name) {
    if (!name) return null;
    return getLocations().filter(function (row) { return row.location === name; })[0] || null;
  }

  function money(n) {
    return '¥ ' + Number(n || 0).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  function qty(n) {
    var num = Number(n || 0);
    return Number.isInteger(num) ? String(num) : num.toFixed(2);
  }

  /** 剩余发货数量：出库单尚待发货的数量 = 发货数量 - 已发货数量 */
  function remainQty(item) {
    var remain = Number(item.sentQty) - Number(item.shippedQty || 0);
    return remain > 0 ? remain : 0;
  }

  /** 单据总发货数量（出库单用于判断是否已发货） */
  function totalQty(record) {
    return (record.items || []).reduce(function (sum, item) {
      return sum + Number(item.sentQty || 0);
    }, 0);
  }

  /**
   * 平台确认收货：逐产品录入实际收货数量，保存为「已收货」
   * 收货量 < 发货量 且 withOwing=true 时，按欠单数量生成欠单（要求供应商补发到平台）。
   *
   * owingMap：欠单数量由平台在「编辑欠单」弹窗中逐产品确认，取值范围 1 ~ 差额；
   *   未传入或未填写的产品按差额（发货数量 - 收货数量）取整作为欠单数量。
   *   欠单数量小于差额的部分视为平台放弃补发，未足量补货部分线下处理。
   *   该数量同时决定供应商端欠单送货单的发货数量，保证两端一致。
   *
   * 返回 { receipt, owing }，owing 为本次生成的欠单，未生成时为 null。
   */
  function confirmReceipt(receiptId, receivedMap, withOwing, owingMap) {
    var receipt = getReceipt(receiptId);
    if (!receipt || receipt.kind !== 'real' || receipt.status === 'received') return null;

    var shorts = [];
    receipt.items.forEach(function (item, index) {
      var key = String(index);
      if (receivedMap && receivedMap[key] !== undefined) {
        item.receivedQty = Number(receivedMap[key]) || 0;
      }
      var gap = Number(item.sentQty) - Number(item.receivedQty || 0);
      if (gap <= 0) return;
      // 欠单数量：默认取整后的差额，可人工调小；下限 1、上限差额（防止部分补发时取到 0 或超出）
      var qty = gap;
      if (owingMap && owingMap[key] !== undefined && owingMap[key] !== '') {
        qty = Math.floor(Number(owingMap[key]));
      }
      if (!(qty > 0)) qty = gap;
      if (qty > gap) qty = gap;
      // 记录本次实际生成的欠单数量，便于收货单详情回看
      item.owingQty = qty;
      shorts.push({ index: index, qty: qty });
    });

    var owing = null;
    if (withOwing && shorts.length) {
      owing = createSupplierReplenishmentReceipt(receipt, shorts);
      // 平台收货不足创建欠单后，供应商端同步生成对应的欠单送货单（待供应商补发到平台）
      createSupplierOwingShipment(receipt, owing, shorts);
    }

    receipt.status = 'received';
    receipt.receivedAt = nowText();
    saveReceipt(receipt);

    // 确认收货完成后生成平台送货单；平台可发数量必须以实际入库数量为准。
    var existing = getShipments().filter(function (row) {
      return row.sourceDocNo === receipt.bizNo;
    })[0];
    if (!existing) {
      var shipment = {
        id: 'CK' + String(Date.now()).slice(-8),
        bizNo: 'CK2026' + String(Date.now()).slice(-6),
        kind: 'real',
        bizType: 'outbound',
        sourceDocType: '平台收货单',
        sourceDocNo: receipt.bizNo,
        sourceOrderNo: purchaseToSalesOrder(receipt),
        orderLabel: '平台销售订单号',
        orderNo: purchaseToSalesOrder(receipt),
        counterparty: receipt.customer || '海赋（山东）数字产业发展有限公司LL',
        counterpartyLabel: '客户',
        deliveryMode: 'platform',
        modeLabel: '平台中转',
        status: 'pending',
        receivedAt: '',
        createdAt: nowText(),
        shipmentAt: nowText(),
        receiverName: CUSTOMER_RECEIVER.name,
        receiverPhone: CUSTOMER_RECEIVER.phone,
        receiverAddress: CUSTOMER_RECEIVER.address,
        items: receipt.items.map(function (item) {
          return makeItem(
            { code: item.code, name: item.name, spec: item.spec, brand: item.brand, unit: item.unit, price: item.price },
            item.orderQty,
            item.receivedQty,
            item.receivedQty
          );
        })
      };
      saveShipment(shipment);
    }
    return { receipt: receipt, owing: owing };
  }

  /** 平台出库单【申请验收】：状态由待收货变为已发货
   *  参照供应商端送货单「申请验收」口径：
   *    1. 仅待收货时录入发货数量，申请验收后不可再修改；
   *    2. 录入的发货数量小于剩余可发货数量时，按差额生成对应欠单；
   *    3. 数量拆成两份记录、互不覆盖：sentQty=原始可发货数量、shippedQty=本次已发货、
   *       owingQty=本次生成欠单的数量；shippedQty + owingQty 恒等于 sentQty，刷新后可复现。
   *  sentMap：逐产品本次发货数量；不传则按剩余可发货数量（即该单可发货数量）申请验收。
   */
  function applyAcceptance(shipmentId, sentMap) {
    var shipment = getShipment(shipmentId);
    if (!shipment || shipment.kind !== 'real' || shipment.status !== 'pending') return null;

    var plannedTotal = (shipment.items || []).reduce(function (sum, item, index) {
      var remain = Math.max(Number(item.sentQty) - Number(item.shippedQty || 0), 0);
      var value = sentMap && sentMap[String(index)] !== undefined ? Number(sentMap[String(index)]) : remain;
      return sum + (isFinite(value) && value > 0 ? value : 0);
    }, 0);
    if (plannedTotal <= 0) return null;

    var owes = [];
    (shipment.items || []).forEach(function (item, index) {
      var key = String(index);
      // 剩余可发货数量 = 原始可发货数量 - 之前已发货数量
      var remain = Math.max(Number(item.sentQty) - Number(item.shippedQty || 0), 0);
      var sent = sentMap && sentMap[key] !== undefined
        ? (Number(sentMap[key]) || 0)
        : remain;
      var short = remain - sent;
      if (short > 0) owes.push({ index: index, qty: short });
      item.owingQty = short > 0 ? short : 0;
      // 本次已发货累加，sentQty 始终保留原始可发货数量
      item.shippedQty = Number(item.shippedQty || 0) + sent;
    });

    shipment.status = 'sent';
    shipment.shipmentAt = nowText();
    shipment.logistics = shipment.logistics || [];
    saveShipment(shipment);

    var result = { shipment: shipment, owing: null };
    if (owes.length) {
      result.owing = createPlatformReplenishmentShipment(shipment, owes);
      // 平台补发送货单已承接差额，原出库单不再保留「剩余可发货数量」
      shipment.owingQty = 0;
      saveShipment(shipment);
      result.shipment = shipment;
    }
    result.customerReceipt = createCustomerReceipt([shipment], null);
    return result;
  }

  /** 平台入库少收：生成供应商补发欠单，继续作为平台待收货入库单展示。 */
  function createSupplierReplenishmentReceipt(receipt, shorts) {
    var stamp = String(Date.now()).slice(-6);
    var owing = {
      id: 'RK-SUP-' + stamp,
      bizNo: 'RKS' + stamp,
      kind: 'real',
      bizType: 'inbound',
      isOwing: true,
      owingType: 'supplier_replenishment',
      owingLabel: '供应商补发欠单',
      sourceDocType: '平台入库单',
      sourceDocNo: receipt.bizNo,
      sourceOrderNo: receipt.orderNo,
      orderLabel: '平台采购订单号',
      orderNo: receipt.orderNo,
      salesOrderNo: purchaseToSalesOrder(receipt),
      counterparty: receipt.counterparty,
      counterpartyLabel: '供应商',
      deliveryMode: 'platform',
      modeLabel: '平台中转',
      status: 'pending',
      receivedAt: '',
      createdAt: nowText(),
      shipmentAt: '',
      receiverName: receipt.receiverName,
      receiverPhone: receipt.receiverPhone,
      receiverAddress: receipt.receiverAddress,
      items: shorts.map(function (row) {
        var item = receipt.items[row.index];
        return makeItem(item, item.orderQty, row.qty, 0);
      })
    };
    saveReceipt(owing);
    shorts.forEach(function (row) {
      addOwing({ type: 'supplier_replenishment', receiptId: receipt.id, bizNo: receipt.bizNo, owingNo: owing.bizNo, orderNo: receipt.orderNo, createdAt: nowText(), qty: row.qty });
    });
    return owing;
  }

  /** 平台出库少发：差额由平台继续补发，生成新的待发货出库单。 */
  function createPlatformReplenishmentShipment(shipment, owes) {
    var stamp = String(Date.now()).slice(-6);
    var owing = {
      id: 'CK-PLT-' + stamp,
      bizNo: 'CKP' + stamp,
      kind: 'real',
      bizType: 'outbound',
      isOwing: true,
      owingType: 'platform_replenishment',
      owingLabel: '平台补发欠单',
      sourceDocType: '平台出库单',
      sourceDocNo: shipment.bizNo,
      sourceOrderNo: shipment.orderNo,
      orderLabel: '平台销售订单号',
      orderNo: shipment.orderNo,
      counterparty: shipment.counterparty,
      counterpartyLabel: '客户',
      deliveryMode: 'platform',
      modeLabel: '平台中转',
      status: 'pending',
      receivedAt: '',
      createdAt: nowText(),
      shipmentAt: '',
      purposeLocation: shipment.purposeLocation || '',
      receiverName: shipment.receiverName,
      receiverPhone: shipment.receiverPhone,
      receiverAddress: shipment.receiverAddress,
      items: owes.map(function (row) {
        var item = shipment.items[row.index];
        return makeItem(item, item.orderQty, row.qty, 0);
      })
    };
    saveShipment(owing);
    var list = read(PLATFORM_OWING_KEY) || [];
    list.push(owing);
    write(PLATFORM_OWING_KEY, list);
    owes.forEach(function (row) {
      addOwing({ type: 'platform_replenishment', shipmentId: shipment.id, bizNo: shipment.bizNo, owingNo: owing.bizNo, orderNo: shipment.orderNo, createdAt: nowText(), qty: row.qty });
    });
    return owing;
  }

  function customerReceiptLines(shipments) {
    var lines = [];
    shipments.forEach(function (shipment) {
      (shipment.items || []).forEach(function (item) {
        var shipped = Number(item.shippedQty !== undefined ? item.shippedQty : (item.sentQty || 0));
        if (shipped <= 0) return;
        lines.push({
          order: shipment.orderNo,
          shipment: shipment.bizNo,
          code: item.code,
          product: item.name,
          spec: item.spec,
          unit: item.unit,
          ordered: Number(item.orderQty || 0),
          shipped: shipped,
          received: 0
        });
      });
    });
    return lines;
  }

  /** 平台申请验收后实时生成客户端收货单；批量发货只生成一张合并收货单。 */
  function createCustomerReceipt(shipments, batchNo) {
    var list = read(CUSTOMER_RECEIPT_KEY) || [];
    var sourceKey = batchNo ? 'platform_batch_' + batchNo : 'platform_' + shipments[0].id;
    var stamp = String(Date.now()).slice(-8);
    var receipt = {
      no: 'SH' + stamp,
      batch: batchNo || '',
      sourceType: batchNo ? 'platform-batch' : 'platform-single',
      sourceKey: sourceKey,
      supplier: '海赋科技（山东）数字产业发展有限公司',
      customer: shipments[0].counterparty,
      address: shipments[0].receiverAddress,
      date: new Date().toISOString().slice(0, 10),
      status: 'pending',
      logistics: shipments[0].logistics || [],
      lines: customerReceiptLines(shipments)
    };
    list = list.filter(function (row) { return row && row.sourceKey !== sourceKey; });
    if (receipt.lines.length) list.push(receipt);
    write(CUSTOMER_RECEIPT_KEY, list);
    return receipt;
  }

  function validateBatchShipments(ids) {
    var rows = ids.map(getShipment).filter(Boolean);
    if (!rows.length) return { ok: false, message: '请先选择待发货出库单', rows: [] };
    if (rows.some(function (row) { return row.kind !== 'real' || row.status !== 'pending' || row.batchNo; })) return { ok: false, message: '仅未加入批次的平台中转待发货出库单可批量发货', rows: rows };
    var customer = rows[0].counterparty || '';
    var address = rows[0].receiverAddress || '';
    if (rows.some(function (row) { return (row.counterparty || '') !== customer; })) return { ok: false, message: '批量发货必须属于同一客户', rows: rows };
    if (rows.some(function (row) { return (row.receiverAddress || '') !== address; })) return { ok: false, message: '批量发货必须使用同一收货地址', rows: rows };
    return { ok: true, rows: rows, customer: customer, address: address };
  }

  /** 创建批量发货单：只保存分摊数量，物流信息和申请验收在批量详情页完成。 */
  function createBatchDraft(ids, sentMaps) {
    var check = validateBatchShipments(ids);
    if (!check.ok) return check;
    var batchNo = 'PCK' + String(Date.now()).slice(-8);
    var total = 0;
    check.rows.forEach(function (row) {
      var map = sentMaps && sentMaps[row.id] ? sentMaps[row.id] : {};
      (row.items || []).forEach(function (item, index) {
        var remain = remainQty(item);
        var value = map[String(index)] !== undefined ? Number(map[String(index)]) : remain;
        if (!isFinite(value) || value < 0 || value > remain) value = remain;
        item.batchPlannedQty = value;
        total += value;
      });
      row.batchNo = batchNo;
      row.batchStatus = 'draft';
      saveShipment(row);
    });
    if (total <= 0) {
      check.rows.forEach(function (row) {
        (row.items || []).forEach(function (item) { delete item.batchPlannedQty; });
        delete row.batchNo;
        delete row.batchStatus;
        saveShipment(row);
      });
      return { ok: false, message: '本次发货数量不能全部为0', rows: check.rows };
    }
    return { ok: true, batchNo: batchNo, shipments: check.rows };
  }

  function getBatchShipments(batchNo) {
    return getShipments().filter(function (row) { return row.batchNo === batchNo; });
  }

  /** 批量详情申请验收：锁定统一物流，生成平台补发欠单和一张客户端合并收货单。 */
  function applyBatchDraft(batchNo, logistics) {
    var rows = getBatchShipments(batchNo);
    if (!rows.length || rows.some(function (row) { return row.status !== 'pending'; })) return { ok: false, message: '当前批量发货单不可申请验收' };
    var owings = [];
    rows.forEach(function (row) {
      var shortRows = [];
      (row.items || []).forEach(function (item, index) {
        var remain = remainQty(item);
        var sent = item.batchPlannedQty === undefined ? remain : Number(item.batchPlannedQty);
        var short = Math.max(0, remain - sent);
        item.shippedQty = Number(item.shippedQty || 0) + sent;
        item.owingQty = short;
        delete item.batchPlannedQty;
        if (short > 0) shortRows.push({ index: index, qty: short });
      });
      row.status = 'sent';
      row.batchStatus = 'sent';
      row.shipmentAt = nowText();
      row.logistics = clone(logistics || []);
      saveShipment(row);
      if (shortRows.length) owings.push(createPlatformReplenishmentShipment(row, shortRows));
    });
    var receipt = createCustomerReceipt(rows, batchNo);
    return { ok: true, batchNo: batchNo, shipments: rows, customerReceipt: receipt, owings: owings };
  }

  /** 兼容既有调用：创建批次后立即申请验收。 */
  function applyBatchAcceptance(ids, logistics) {
    var draft = createBatchDraft(ids, null);
    if (!draft.ok) return draft;
    return applyBatchDraft(draft.batchNo, logistics);
  }

  /** 读取供应商端欠单送货单（平台入库欠单创建后生成） */
  function getSupplierOwings() {
    var data = read(SUPPLIER_OWING_KEY);
    return Array.isArray(data) ? data : [];
  }

  /**
   * 生成供应商端欠单送货单：
   * 平台收货单收货数量小于发货数量并创建欠单后，供应商端自动生成对应的欠单送货单
   * （仅包含欠单差额明细，状态待发货，供应商申请验收补发到平台）。
   * 数据写入共享 localStorage，供应商端送货单列表 / 详情按订单号读取展示。
   */
  function createSupplierOwingShipment(receipt, owing, shorts) {
    var stamp = String(Date.now()).slice(-6);
    var day = nowText().split(' ')[0];
    var shipment = {
      id: 'DS-Q' + stamp,
      delivery: 'DS/Q' + stamp,
      order: receipt.orderNo,
      customer: '海赋科技仓储物流中心',
      address: receipt.receiverAddress || '海赋科技仓储物流中心',
      receiverName: receipt.receiverName || '',
      receiverPhone: receipt.receiverPhone || '',
      sourceDocType: '平台收货单',
      sourceDocNo: receipt.bizNo,
      owingNo: owing.bizNo,
      orderDate: day,
      arrangeDate: day,
      createdAt: nowText(),
      status: 'pending',
      items: shorts.map(function (o) {
        var item = receipt.items[o.index];
        return {
          code: item.code,
          name: item.name,
          spec: item.spec,
          brand: item.brand,
          unit: item.unit,
          price: item.price,
          orderQty: item.orderQty,
          qty: o.qty
        };
      })
    };
    var list = getSupplierOwings();
    list.push(shipment);
    write(SUPPLIER_OWING_KEY, list);
    return shipment;
  }

  function totalAmount(record) {
    return (record.items || []).reduce(function (sum, item) {
      return sum + Number(item.price || 0) * Number(item.orderQty || 0);
    }, 0);
  }

  /** 读取单据的物流信息（一次运输一条记录） */
  function getLogistics(record) {
    return (record && record.logistics) || [];
  }

  /** 保存单据的物流信息：入库单只读，出库单在申请验收前可编辑 */
  function saveLogistics(recordId, records) {
    var record = getShipment(recordId) || getReceipt(recordId);
    if (!record) return null;
    record.logistics = records || [];
    if (record.bizType === 'outbound') saveShipment(record);
    else saveReceipt(record);
    return record;
  }

  /** 出库单是否需要上传物流信息（待发货、未上传时平台需自行维护） */
  function canEditLogistics(record) {
    return !!(record && record.bizType === 'outbound' && record.kind === 'real' && record.status === 'pending');
  }

  /**
   * 恢复初始演示状态：清空库存模块在原型中产生的运行期数据（确认收货 / 申请验收 / 欠单等），
   * 回到内置演示数据的初始状态。目的位置字典（平台自行维护的配置）不在此范围内。
   */
  function resetDemoData() {
    [STORE_KEY, SHIP_KEY, OWING_KEY, SUPPLIER_OWING_KEY, PLATFORM_OWING_KEY, CUSTOMER_RECEIPT_KEY].forEach(function (key) {
      try { localStorage.removeItem(key); } catch (e) {}
    });
  }

  /**
   * 入库单、出库单共用的演示重置入口。
   * 放在页面右侧固定位置，详情页、列表页和批量详情页都可直接恢复初始演示数据。
   */
  function mountDemoResetButton() {
    if (typeof document === 'undefined' || typeof location === 'undefined') return;
    var fileName = '';
    try { fileName = decodeURIComponent(location.pathname.split('/').pop() || ''); } catch (e) { fileName = location.pathname || ''; }
    if (fileName.indexOf('入库单') < 0 && fileName.indexOf('出库单') < 0) return;
    if (document.getElementById('inventory-demo-reset')) return;

    var style = document.createElement('style');
    style.textContent =
      '#inventory-demo-reset{position:fixed;right:18px;top:50%;z-index:9999;display:flex;align-items:center;gap:7px;' +
      'transform:translateY(-50%);padding:11px 14px;border:1px solid #2BA471;border-radius:22px 0 0 22px;' +
      'background:#fff;color:#2BA471;box-shadow:0 5px 18px rgba(0,0,0,.14);cursor:pointer;font:13px -apple-system,BlinkMacSystemFont,"Segoe UI","PingFang SC","Microsoft YaHei",sans-serif}' +
      '#inventory-demo-reset:hover{background:#2BA471;color:#fff}' +
      '#inventory-demo-reset:focus{outline:2px solid rgba(43,164,113,.24);outline-offset:2px}' +
      '@media(max-width:760px){#inventory-demo-reset{right:8px;padding:10px 12px}.inventory-demo-reset-text{display:none}}';
    document.head.appendChild(style);

    var button = document.createElement('button');
    button.type = 'button';
    button.id = 'inventory-demo-reset';
    button.title = '清空本轮演示操作，恢复入库单和出库单初始数据';
    button.setAttribute('aria-label', '重置演示数据');
    button.innerHTML = '<span aria-hidden="true">↺</span><span class="inventory-demo-reset-text">重置演示数据</span>';
    button.addEventListener('click', function () {
      if (!global.confirm('将清空本轮入库、出库演示操作，恢复到初始数据。是否继续？')) return;
      resetDemoData();
      global.location.href = fileName.indexOf('入库单') >= 0 ? '入库单列表.html' : '出库单列表.html';
    });
    document.body.appendChild(button);
  }

  global.HaifuInventory = {
    PLATFORM_RECEIVERS: PLATFORM_RECEIVERS,
    CUSTOMER_RECEIVER: CUSTOMER_RECEIVER,
    getReceipts: getReceipts,
    getShipments: getShipments,
    getReceipt: getReceipt,
    getShipment: getShipment,
    saveReceipt: saveReceipt,
    saveShipment: saveShipment,
    getOwings: getOwings,
    addOwing: addOwing,
    getSupplierOwings: getSupplierOwings,
    getLocations: getLocations,
    addLocation: addLocation,
    updateLocation: updateLocation,
    removeLocation: removeLocation,
    getLocationByName: getLocationByName,
    confirmReceipt: confirmReceipt,
    applyAcceptance: applyAcceptance,
    applyBatchAcceptance: applyBatchAcceptance,
    createBatchDraft: createBatchDraft,
    getBatchShipments: getBatchShipments,
    applyBatchDraft: applyBatchDraft,
    validateBatchShipments: validateBatchShipments,
    getLogistics: getLogistics,
    saveLogistics: saveLogistics,
    canEditLogistics: canEditLogistics,
    statusText: statusText,
    statusTextOf: statusTextOf,
    statusClass: statusClass,
    statusStepIndex: statusStepIndex,
    totalAmount: totalAmount,
    remainQty: remainQty,
    totalQty: totalQty,
    money: money,
    qty: qty,
    nowText: nowText,
    resetDemoData: resetDemoData
  };

  // 浮动「重置演示数据」按钮按需求下线（入库单/出库单页面不再展示演示重置入口）
  // 如需恢复：取消下面三行注释即可
  // if (typeof document !== 'undefined') {
  //   if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mountDemoResetButton);
  //   else mountDemoResetButton();
  // }
})(window);
