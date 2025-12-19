
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
  ChevronDown, 
  ChevronUp 
} from 'lucide-react';

// --- 类型定义 ---

type TabType = '第三方店铺管理' | '评论管理' | '评价统计' | '商品管理' | '客服管理' | '京东订单' | '第三方订单同步管理';

// 样式配置：参考图中色彩体系 (Ant Design Palette)
const TAB_THEMES: Record<TabType, { base: string, light: string, border: string, text: string }> = {
  '第三方店铺管理': { base: '#ff4d4f', light: '#fff1f0', border: '#ffa39e', text: '#cf1322' }, // 红
  '评论管理': { base: '#faad14', light: '#fffbe6', border: '#ffe58f', text: '#d46b08' },      // 黄
  '评价统计': { base: '#1890ff', light: '#e6f7ff', border: '#91d5ff', text: '#096dd9' },      // 蓝
  '商品管理': { base: '#52c41a', light: '#f6ffed', border: '#b7eb8f', text: '#389e0d' },      // 绿
  '客服管理': { base: '#13c2c2', light: '#e6fffb', border: '#87e8de', text: '#08979c' },      // 青
  '京东订单': { base: '#722ed1', light: '#f9f0ff', border: '#d3adf7', text: '#531dab' },      // 紫
  '第三方订单同步管理': { base: '#eb2f96', light: '#fff0f6', border: '#ffadd2', text: '#c41d7f' } // 粉
};

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
  <div className="flex items-center gap-4 mb-3 px-6 py-4 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-slate-700 rounded-xl shadow-lg overflow-hidden shrink-0">
    <div className="flex items-center gap-3 shrink-0">
      <div className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
        <Bell size={10} /> 重要公告
      </div>
      <span className="text-slate-400 text-xs">2025-11-19</span>
    </div>
    <div className="flex-1 overflow-hidden relative h-6 flex items-center">
      <div className="whitespace-nowrap animate-[marquee_40s_linear_infinite] flex items-center gap-8 text-[13px] text-white font-medium">
        <span>📢 关于 2025 年度秋季职级晋升评审的通知：请相关人员务必在截止日期前完成确认，相关政策调整将于下月正式生效。</span>
      </div>
    </div>
    <style>{`@keyframes marquee { 0% { transform: translateX(100%); } 100% { transform: translateX(-100%); } }`}</style>
  </div>
);

const TabSelector = ({ activeTab, onSelect }: { activeTab: TabType, onSelect: (t: TabType) => void }) => {
  const tabs: TabType[] = ['第三方店铺管理', '评论管理', '评价统计', '商品管理', '客服管理', '京东订单', '第三方订单同步管理'];
  return (
    <div className="grid grid-cols-7 gap-3 mb-4">
      {tabs.map((tab) => {
        const theme = TAB_THEMES[tab];
        const isActive = activeTab === tab;
        return (
          <button
            key={tab}
            onClick={() => onSelect(tab)}
            style={{
              backgroundColor: isActive ? theme.base : theme.light,
              borderColor: isActive ? 'transparent' : theme.border,
              color: isActive ? '#fff' : theme.text
            }}
            className={`h-11 rounded-xl text-[12px] font-bold transition-all duration-200 flex items-center justify-center px-2 text-center leading-tight border shadow-sm hover:opacity-90 active:scale-95 ${
              isActive ? 'shadow-md scale-[1.02]' : ''
            }`}
          >
            {tab}
          </button>
        );
      })}
    </div>
  );
};

const DataOverview = ({ toggleFilters, showFilters }: { toggleFilters: () => void, showFilters: boolean }) => (
  <div className="bg-white rounded-xl border border-slate-200 overflow-hidden flex items-center shadow-sm h-14 mb-3 shrink-0">
    <div className="flex items-center gap-4 px-6 flex-1">
      <div className="flex items-center gap-2 mr-10 shrink-0">
        <Activity size={20} className="text-indigo-500" />
        <span className="text-sm font-bold text-slate-800 uppercase tracking-tight">核心数据面板</span>
      </div>
      <div className="flex gap-16">
        {[['待处理评论', '310', '#ef4444'], ['今日同步', '1560', '#334155'], ['平均好评', '98.5%', '#22c55e'], ['同步状态', '正常', '#334155']].map(([label, val, color]) => (
          <div key={label} className="flex flex-col">
            <span className="text-[10px] text-slate-400 font-bold uppercase">{label}</span>
            <span className="text-sm font-bold font-mono" style={{ color }}>{val}</span>
          </div>
        ))}
      </div>
    </div>
    <div 
      onClick={toggleFilters}
      className="h-full px-6 bg-indigo-50 border-l border-slate-200 flex items-center gap-2 text-indigo-600 font-bold text-xs cursor-pointer hover:bg-indigo-100 transition-all select-none"
    >
      <Search size={14} />
      <span>点这高级筛选</span>
      {showFilters ? <ChevronUp size={14}/> : <ChevronDown size={14}/>}
    </div>
  </div>
);

const SearchPanel = ({ tab, isVisible }: { tab: TabType, isVisible: boolean }) => {
  const config = TAB_CONFIGS[tab];

  if (!isVisible) return null;

  const renderField = (field: string) => (
    <div key={field} className="flex flex-col gap-1 min-w-[200px]">
      <span className="text-[10px] text-slate-400 font-bold uppercase shrink-0 whitespace-nowrap">{field}</span>
      {field.includes('时间') || field.includes('日期') ? (
        <div className="flex items-center gap-1 flex-1">
          <input type="date" className="flex-1 border border-slate-200 rounded-lg h-8 px-2 text-[11px] outline-none focus:border-indigo-400 bg-slate-50" />
          <span className="text-slate-300">至</span>
          <input type="date" className="flex-1 border border-slate-200 rounded-lg h-8 px-2 text-[11px] outline-none focus:border-indigo-400 bg-slate-50" />
        </div>
      ) : field.includes('状态') || field.includes('来源') || field.includes('平台') || field.includes('是否') || field === '评论等级' ? (
        <select className="flex-1 border border-slate-200 rounded-lg h-8 px-2 text-[11px] outline-none bg-slate-50 text-slate-600 cursor-pointer">
          <option>请选择{field}</option>
        </select>
      ) : (
        <input type="text" placeholder={`输入${field}`} className="flex-1 border border-slate-200 rounded-lg h-8 px-3 text-[11px] outline-none focus:border-indigo-400 bg-slate-50" />
      )}
    </div>
  );

  return (
    <div className="bg-white p-5 border border-slate-200 rounded-xl shadow-sm mb-3 animate-in fade-in slide-in-from-top-2 duration-300">
      <div className="flex flex-nowrap gap-x-8 items-end min-w-max pb-1">
        {/* 所有筛选项 */}
        <div className="flex flex-nowrap gap-x-6 items-center">
          {config.search.map(renderField)}
        </div>
        
        {/* 搜索和重置按钮 */}
        <div className="flex gap-2 shrink-0 border-l border-slate-100 pl-8">
          <button className="h-8 px-5 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 shadow-sm transition-all active:scale-95">搜索</button>
          <button className="h-8 px-5 bg-white border border-slate-200 text-slate-500 rounded-lg text-xs font-bold hover:bg-slate-50 transition-all">重置</button>
        </div>

        {/* 功能操作按钮 */}
        <div className="flex gap-2 shrink-0 border-l border-slate-100 pl-8">
          {config.buttons.map(btn => (
            <button 
              key={btn} 
              className={`h-8 px-4 rounded-lg text-xs font-bold flex items-center gap-2 transition-all shadow-sm text-white active:scale-95 ${
                btn === '新增' || btn === '同步' || btn === '自动匹配项目' || btn === '补录' ? 'bg-indigo-600 hover:bg-indigo-700' : 
                btn === '更新负责人' || btn === '同步店铺SKU' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-slate-800 hover:bg-slate-900'
              }`}
            >
              {btn === '新增' && <Plus size={14}/>}
              {btn === '同步' && <RefreshCw size={14}/>}
              {btn === '导出' && <FileSpreadsheet size={14}/>}
              {btn}
            </button>
          ))}
          {tab === '京东订单' && (
            <div className="relative flex items-center bg-red-600 text-white h-8 px-4 rounded-lg text-xs font-bold cursor-pointer hover:bg-red-700 shadow-sm transition-all active:scale-95">
               待出库订单
               <span className="absolute -top-1 -right-1 bg-white text-red-600 text-[9px] w-4 h-4 flex items-center justify-center rounded-full font-black border border-red-200">0</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const App = () => {
  const [activeTab, setActiveTab] = useState<TabType>('第三方店铺管理');
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;

  const config = TAB_CONFIGS[activeTab];
  const data = useMemo(() => generateRows(activeTab), [activeTab]);

  return (
    <div className="h-screen bg-slate-50 p-4 flex flex-col overflow-hidden font-sans text-slate-600 antialiased">
      <NotificationBar />
      <TabSelector activeTab={activeTab} onSelect={(t) => { setActiveTab(t); setCurrentPage(1); }} />
      <DataOverview showFilters={showFilters} toggleFilters={() => setShowFilters(!showFilters)} />
      <SearchPanel tab={activeTab} isVisible={showFilters} />
      
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex-1 flex flex-col overflow-hidden">
        <div className="overflow-auto flex-1">
          <table className="w-full text-left border-collapse min-w-[2200px]">
            <thead className="sticky top-0 z-20 bg-slate-50/90 backdrop-blur-sm border-b border-slate-200">
              <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <th className="px-5 py-4 text-center w-16 border-r border-slate-100">NO.</th>
                {config.headers.map(h => (
                  <th key={h} className={`px-5 py-4 border-r border-slate-100 ${h.length > 8 ? 'min-w-[200px]' : 'min-w-[140px]'}`}>{h}</th>
                ))}
                <th className="px-5 py-4 w-36 text-center sticky right-0 bg-slate-50 shadow-[-8px_0_15px_-5px_rgba(0,0,0,0.05)]">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.map((row, idx) => (
                <tr 
                  key={idx} 
                  className={`group transition-colors text-[12px] h-12 ${idx % 2 === 1 ? 'bg-slate-50/50' : 'bg-white'} hover:bg-indigo-50/30`}
                >
                  <td className="px-5 py-2 text-center border-r border-slate-100 text-slate-400 font-mono">
                    {String((currentPage - 1) * pageSize + idx + 1).padStart(2, '0')}
                  </td>
                  {config.headers.map(h => (
                    <td key={h} className={`px-5 py-2 border-r border-slate-100 truncate max-w-[350px] text-slate-600 font-medium ${h.includes('数量') || h === '星级' ? 'text-center' : ''}`}>
                      {h === '评价等级' ? (
                        <span className="bg-emerald-100 text-emerald-700 font-bold px-2 py-0.5 rounded-full text-[10px]">好评</span>
                      ) : (
                        row[h]
                      )}
                    </td>
                  ))}
                  <td className={`px-5 py-2 text-center sticky right-0 shadow-[-8px_0_15px_-5px_rgba(0,0,0,0.05)] ${idx % 2 === 1 ? 'bg-slate-50' : 'bg-white'} group-hover:bg-indigo-50/30 transition-colors`}>
                    <div className="flex justify-center gap-4">
                      <button className="text-indigo-600 hover:text-indigo-800 font-bold transition-all hover:underline decoration-2 underline-offset-4">
                        {activeTab === '客服管理' ? '绑定系统' : (activeTab.includes('管理') ? '修改' : '详情')}
                      </button>
                      {activeTab !== '评价统计' && activeTab !== '客服管理' && (
                        <button className="text-rose-500 hover:text-rose-700 font-bold transition-all hover:underline decoration-2 underline-offset-4 flex items-center gap-1">
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
        <div className="px-6 py-3 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="text-[11px] text-slate-400 font-bold">
            Total Records: <span className="text-slate-600">623</span>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-1.5">
              <button className="w-8 h-8 border border-slate-200 rounded-lg flex items-center justify-center bg-white hover:bg-slate-50 transition-all active:scale-90 text-slate-400"><ChevronLeft size={16}/></button>
              <button className="w-8 h-8 rounded-lg font-black text-xs bg-indigo-600 text-white shadow-md">1</button>
              <button className="w-8 h-8 border border-slate-200 rounded-lg text-xs font-bold bg-white text-slate-500 hover:bg-slate-50">2</button>
              <button className="w-8 h-8 border border-slate-200 rounded-lg text-xs font-bold bg-white text-slate-500 hover:bg-slate-50">3</button>
              <span className="text-slate-300 mx-1">...</span>
              <button className="w-8 h-8 border border-slate-200 rounded-lg text-xs font-bold bg-white text-slate-500 hover:bg-slate-50">63</button>
              <button className="w-8 h-8 border border-slate-200 rounded-lg flex items-center justify-center bg-white hover:bg-slate-50 transition-all active:scale-90 text-slate-400"><ChevronRight size={16}/></button>
            </div>
            <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400">
              <span>Go to</span>
              <input type="number" defaultValue={1} className="w-10 h-8 border border-slate-200 rounded-lg text-center outline-none bg-white text-slate-600 focus:border-indigo-400" />
              <span>Page</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const container = document.getElementById('root');
if (container) { const root = createRoot(container); root.render(<App />); }
