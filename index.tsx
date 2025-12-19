
import React, { useState, useMemo } from 'react';
import { createRoot } from 'react-dom/client';
import { 
  Search, 
  ChevronLeft,
  ChevronRight,
  Bell,
  Plus,
  FileSpreadsheet,
  Activity,
  Trash2,
  Edit,
  RefreshCw,
  UserPlus,
  Link,
  Info
} from 'lucide-react';

// --- 类型定义 ---

type TabType = '第三方店铺管理' | '评论管理' | '评价统计' | '商品管理' | '客服管理' | '京东订单' | '第三方订单同步管理';

// --- 配置项 (严格对照 1-7 图还原) ---

const TAB_CONFIGS: Record<TabType, { search: string[], headers: string[], buttons: string[] }> = {
  '第三方店铺管理': {
    search: ['店铺名称', '店铺负责人', '区域名称', '店铺所属平台', '是否自动录单', '是否新店'],
    headers: ['店铺名称', '店铺ID', '店铺负责人', '区域名称', '店铺所属平台', '店铺对应的订单来源', '是否自动录单', '是否新店'],
    buttons: ['新增', '更新负责人']
  },
  '评论管理': {
    search: ['负责人', '店铺名称', '第三方订单号/券码', '评论等级', '评论来源', '评论时间'],
    headers: ['店铺名称', '负责人', '评论来源', '第三方订单号', '评论用户昵称', '评价等级', '星级', '区域', '券码', '评价内容', '评论时间'],
    buttons: ['导出']
  },
  '评价统计': {
    search: ['负责人', '店铺名称', '评论来源', '评论时间'],
    headers: ['店铺名称', '负责人', '评论来源', '好评数量', '中评数量', '差评数量'],
    buttons: ['导出']
  },
  '商品管理': {
    search: ['商品名称', '店铺名称', 'SKU名称', '项目名称', 'skuid', '店铺来源'],
    headers: ['店铺名称', '商品名称', 'skuid', 'sku规格名称', '项目名称', '店铺来源'],
    buttons: ['同步店铺SKU', '自动匹配项目']
  },
  '客服管理': {
    search: ['系统用户名称', '客服名称', '店铺名称'],
    headers: ['客服名称', '客服编号', '系统用户名称', '店铺名称', '客服等级'],
    buttons: ['同步']
  },
  '京东订单': {
    search: ['订单来源', '客户名称', '京东订单id'],
    headers: ['店铺名称', '下单时间', '客户名称', '订单状态', '顾客申请退款', '京东订单id', '订单原价(元)', '结算金额(元)', '业务员操作时间', '业务员', '业务员选择状态', '业务员处理详情', '运营处理时间', '运营', '运营操作状态', '运营处理详情'],
    buttons: ['导出']
  },
  '第三方订单同步管理': {
    search: ['录单状态', '录单失败处理状态', '处理用户名称', '用户名', '店铺名称', '订单来源', '系统订单号', '商家订单号', '是否多SKU订单', '失败原因', '创建时间', '是否补单'],
    headers: ['订单来源', '重复订单来源', '系统订单号', '用户名', '商家订单号', '下单数量', '录单人', '录单状态', '录单失败原因', '录单失败处理人', '录单失败处理状态', '录单失败处理结果', '订单创建时间', '店铺名称', '虚拟号', '商家备注', '买家备注', '商品名称', '地址', '发票抬头', '纳税人识别号', '电子邮箱', '是否补单'],
    buttons: ['补录']
  }
};

// --- Mock Data 生成 ---

const generateRows = (tab: TabType): any[] => {
  const config = TAB_CONFIGS[tab];
  return Array.from({ length: 20 }).map((_, i) => {
    const row: any = { id: i + 1 };
    config.headers.forEach(h => {
      if (h.includes('时间') || h.includes('日期')) {
        row[h] = `2025-11-${String(17 - (i % 10)).padStart(2, '0')} 17:${String(10 + i).padStart(2, '0')}:${String(i % 60).padStart(2, '0')}`;
      } else if (h.includes('状态') || h.includes('是否')) {
        row[h] = i % 2 === 0 ? '是' : '否';
        if (h.includes('状态')) row[h] = i % 2 === 0 ? '完成' : '待处理';
      } else if (h.includes('负责人') || h.includes('人') || h.includes('业务员')) {
        row[h] = i % 3 === 0 ? '管理员' : (i % 3 === 1 ? '廖林峰' : '何旺1');
      } else if (h.includes('店铺名称')) {
        const names = ['鲸佳家家庭服务官方旗舰店', '极修辣家庭维修旗舰店', '帮帮佳BSKA旗舰店', '今帮手旗舰店'];
        row[h] = names[i % names.length];
      } else if (h.includes('平台') || h.includes('来源')) {
        row[h] = i % 2 === 0 ? '京东' : '拼多多';
      } else if (h.includes('金额') || h.includes('原价')) {
        row[h] = (Math.random() * 500).toFixed(2);
      } else if (h.includes('ID') || h.includes('单号') || h.includes('skuid')) {
        row[h] = (13444998 + i).toString();
      } else if (h === '星级') {
        row[h] = '5';
      } else if (h === '评价等级') {
        row[h] = '好评';
      } else if (h === '区域' || h === '区域名称') {
        row[h] = '赣州市';
      } else {
        row[h] = '--';
      }
    });
    return row;
  });
};

// --- 子组件 ---

const NotificationBar = () => (
  <div className="flex items-center gap-4 mb-2 px-4 py-2 bg-[#fff7e6] border border-[#ffd591] rounded-lg shadow-sm overflow-hidden shrink-0">
    <div className="flex items-center gap-2 text-[#d46b08] shrink-0">
      <Bell size={14} className="animate-pulse" />
      <span className="text-xs font-bold">系统公告</span>
    </div>
    <div className="flex-1 overflow-hidden relative h-5 flex items-center">
      <div className="whitespace-nowrap animate-[marquee_30s_linear_infinite] flex items-center gap-8 text-[11px] text-[#d46b08]">
        <span>📢 运营提醒：请各区域负责人核对“评价统计”中的中差评处理进度，确保“京东订单”及时核对支付金额。</span>
      </div>
    </div>
    <style>{`@keyframes marquee { 0% { transform: translateX(100%); } 100% { transform: translateX(-100%); } }`}</style>
  </div>
);

const TabSelector = ({ activeTab, onSelect }: { activeTab: TabType, onSelect: (t: TabType) => void }) => {
  const tabs: TabType[] = ['第三方店铺管理', '评论管理', '评价统计', '商品管理', '客服管理', '京东订单', '第三方订单同步管理'];
  return (
    <div className="grid grid-cols-7 gap-1 mb-2">
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => onSelect(tab)}
          className={`h-9 border border-slate-300 rounded-lg text-[11px] font-medium transition-all flex items-center justify-center px-1 text-center leading-tight ${
            activeTab === tab ? 'bg-[#1890ff] text-white border-[#1890ff] shadow-sm' : 'bg-white text-slate-600 hover:border-blue-400 hover:text-blue-500'
          }`}
        >
          {tab}
        </button>
      ))}
    </div>
  );
};

const DataOverview = () => (
  <div className="bg-[#f0f7ff] rounded-lg border border-[#d9d9d9] overflow-hidden flex items-center shadow-sm h-12 mb-2 shrink-0">
    <div className="flex items-center gap-3 px-4 flex-1">
      <div className="flex items-center gap-2 mr-8 shrink-0">
        <Activity size={18} className="text-[#1890ff]" />
        <span className="text-sm font-bold text-[#003a8c]">运营数据概览</span>
      </div>
      <div className="flex gap-12">
        {[['待处理评论', '310', '#f5222d'], ['今日同步订单', '1560', '#262626'], ['好评率', '98.5%', '#52c41a'], ['异常订单', '0', '#262626']].map(([label, val, color]) => (
          <div key={label} className="flex items-center gap-1.5">
            <span className="text-[12px] text-[#8c8c8c]">{label}:</span>
            <span className="text-base font-bold font-mono" style={{ color }}>{val}</span>
          </div>
        ))}
      </div>
    </div>
    <div className="h-full px-5 bg-[#e6f7ff] border-l border-[#d9d9d9] flex items-center gap-2 text-[#1890ff] font-medium text-xs cursor-pointer hover:bg-blue-100 transition-colors">
      <Search size={14} />
      <span>高级搜索</span>
    </div>
  </div>
);

const SearchPanel = ({ tab }: { tab: TabType }) => {
  const config = TAB_CONFIGS[tab];

  const renderField = (field: string) => (
    <div key={field} className="flex items-center gap-2 min-w-[220px]">
      <span className="text-[11px] text-slate-500 shrink-0 whitespace-nowrap">{field}</span>
      {field.includes('时间') || field.includes('日期') ? (
        <div className="flex items-center gap-1 flex-1">
          <input type="date" className="flex-1 border border-slate-200 rounded h-7 px-1 text-[10px] outline-none focus:border-blue-300" />
          <span className="text-slate-300">-</span>
          <input type="date" className="flex-1 border border-slate-200 rounded h-7 px-1 text-[10px] outline-none focus:border-blue-300" />
        </div>
      ) : field.includes('状态') || field.includes('来源') || field.includes('平台') || field.includes('是否') || field === '评论等级' ? (
        <select className="flex-1 border border-slate-200 rounded h-7 px-1 text-[11px] outline-none bg-white text-slate-400">
          <option>请选择</option>
        </select>
      ) : (
        <input type="text" placeholder="请输入内容" className="flex-1 border border-slate-200 rounded h-7 px-2 text-[11px] outline-none focus:border-blue-400" />
      )}
    </div>
  );

  return (
    <div className="bg-white p-4 border border-slate-200 rounded-lg shadow-sm mb-2 overflow-x-auto">
      <div className="flex flex-nowrap gap-x-6 items-center min-w-max pr-4">
        {/* 所有筛选项 */}
        <div className="flex flex-nowrap gap-x-6 items-center">
          {config.search.map(renderField)}
        </div>
        
        {/* 搜索和重置按钮 */}
        <div className="flex gap-2 shrink-0 border-l border-slate-100 pl-6">
          <button className="h-7 px-4 bg-[#1890ff] text-white rounded text-[11px] hover:bg-blue-600 transition-colors">搜索</button>
          <button className="h-7 px-4 bg-white border border-slate-200 text-slate-600 rounded text-[11px] hover:bg-slate-50 transition-colors">重置</button>
        </div>

        {/* 板块特定功能按钮 - 放在重置后面 */}
        <div className="flex gap-2 shrink-0 border-l border-slate-100 pl-6">
          {config.buttons.map(btn => (
            <button 
              key={btn} 
              className={`h-7 px-3 rounded text-[11px] flex items-center gap-1 transition-colors text-white ${
                btn === '新增' || btn === '同步' || btn === '自动匹配项目' || btn === '补录' ? 'bg-[#1890ff] hover:bg-blue-600' : 
                btn === '更新负责人' || btn === '同步店铺SKU' ? 'bg-[#52c41a] hover:bg-green-600' : 'bg-blue-500'
              }`}
            >
              {btn === '新增' && <Plus size={14}/>}
              {btn === '同步' && <RefreshCw size={14}/>}
              {btn === '导出' && <FileSpreadsheet size={14}/>}
              {btn === '更新负责人' && <UserPlus size={14}/>}
              {btn}
            </button>
          ))}
          {tab === '京东订单' && (
            <div className="relative flex items-center bg-[#1890ff] text-white h-7 px-3 rounded text-[11px] cursor-pointer">
               待出库订单
               <span className="absolute -top-1 -right-1 bg-red-500 text-[9px] w-4 h-4 flex items-center justify-center rounded-full border-2 border-white">0</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const App = () => {
  const [activeTab, setActiveTab] = useState<TabType>('第三方店铺管理');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;

  const config = TAB_CONFIGS[activeTab];
  const data = useMemo(() => generateRows(activeTab), [activeTab]);

  return (
    <div className="h-screen bg-[#f8fafc] p-3 flex flex-col overflow-hidden font-sans text-slate-800">
      <NotificationBar />
      <TabSelector activeTab={activeTab} onSelect={(t) => { setActiveTab(t); setCurrentPage(1); }} />
      <DataOverview />
      <SearchPanel tab={activeTab} />
      
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 flex-1 flex flex-col overflow-hidden">
        <div className="overflow-auto flex-1">
          <table className="w-full text-left border-collapse min-w-[2000px]">
            <thead className="sticky top-0 z-20 bg-slate-50 border-b border-slate-200">
              <tr className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="px-3 py-3 text-center w-14 border-r border-slate-100">序号</th>
                {config.headers.map(h => (
                  <th key={h} className={`px-3 py-3 border-r border-slate-100 ${h.length > 8 ? 'min-w-[180px]' : 'min-w-[120px]'}`}>{h}</th>
                ))}
                <th className="px-3 py-3 w-32 text-center sticky right-0 bg-slate-50 shadow-[-4px_0_4px_rgba(0,0,0,0.02)]">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.map((row, idx) => (
                <tr 
                  key={idx} 
                  className={`hover:bg-blue-50/40 transition-colors text-[11px] text-slate-600 h-11 ${idx % 2 === 1 ? 'bg-blue-50/50' : 'bg-white'}`}
                >
                  <td className="px-3 py-1 text-center border-r border-slate-100">{(currentPage - 1) * pageSize + idx + 1}</td>
                  {config.headers.map(h => (
                    <td key={h} className={`px-3 py-1 border-r border-slate-100 truncate max-w-[300px] ${h.includes('数量') || h === '星级' ? 'text-center' : ''}`}>
                      {h === '评价等级' ? (
                        <span className="bg-green-100 text-green-600 px-1.5 py-0.5 rounded text-[10px]">好评</span>
                      ) : row[h]}
                    </td>
                  ))}
                  <td className={`px-3 py-1 text-center sticky right-0 group-hover:bg-blue-50/40 shadow-[-4px_0_4px_rgba(0,0,0,0.02)] ${idx % 2 === 1 ? 'bg-[#f8fcff]' : 'bg-white'}`}>
                    <div className="flex justify-center gap-3">
                      <button className="text-[#1890ff] hover:text-blue-700 flex items-center gap-0.5 transition-colors font-medium">
                        {activeTab === '客服管理' ? '绑定系统用户' : (activeTab.includes('管理') ? '修改' : '详情')}
                      </button>
                      {activeTab !== '评价统计' && activeTab !== '客服管理' && (
                        <button className="text-[#ff4d4f] hover:text-red-700 flex items-center gap-0.5 transition-colors font-medium">
                          <Trash2 size={12}/> 删除
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 分页组件 */}
        <div className="px-4 py-2 border-t border-slate-200 flex items-center justify-center gap-4 text-[11px] bg-slate-50">
          <span className="text-slate-500">共 623 条</span>
          <div className="flex gap-1">
            <button className="w-6 h-6 border border-slate-200 rounded flex items-center justify-center bg-white hover:bg-slate-50"><ChevronLeft size={12}/></button>
            <button className="w-6 h-6 border rounded font-medium bg-[#1890ff] text-white border-[#1890ff]">1</button>
            <button className="w-6 h-6 border border-slate-200 rounded flex items-center justify-center bg-white hover:bg-slate-50">2</button>
            <button className="w-6 h-6 border border-slate-200 rounded flex items-center justify-center bg-white hover:bg-slate-50">3</button>
            <button className="w-6 h-6 border border-slate-200 rounded flex items-center justify-center bg-white hover:bg-slate-50">...</button>
            <button className="w-6 h-6 border border-slate-200 rounded flex items-center justify-center bg-white hover:bg-slate-50">63</button>
            <button className="w-6 h-6 border border-slate-200 rounded flex items-center justify-center bg-white hover:bg-slate-50"><ChevronRight size={12}/></button>
          </div>
          <div className="flex items-center gap-1">
            <span>前往</span>
            <input type="number" defaultValue={1} className="w-8 h-6 border border-slate-200 rounded text-center outline-none" />
            <span>页</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const container = document.getElementById('root');
if (container) { const root = createRoot(container); root.render(<App />); }
