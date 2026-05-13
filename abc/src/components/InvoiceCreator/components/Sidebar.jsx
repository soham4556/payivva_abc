import React from "react";

const Sidebar = ({
  activeTab,
  setActiveTab,
  setIsPreviewMode,
  logo,
  businessName,
}) => {
  const mainItems = [
    { id: "dashboard", label: "Dashboard", icon: "📊" },
    { id: "analytics", label: "Analytics", icon: "📈" },
    { id: "invoices", label: "Sales Invoice", icon: "📄" },
    { id: "inventory", label: "Inventory", icon: "📦" },
    { id: "purchase_orders", label: "Create Purchase Order", icon: "🛒" },
    { id: "expenses", label: "Expenses", icon: "💸" },
  ];

  const historyItems = [
    { id: "templates", label: "Invoice History", icon: "📚" },
    { id: "paid_history", label: "Paid History", icon: "✅" },
    { id: "po_history", label: "PO History", icon: "🕒" },
    { id: "daily_archives", label: "Daily Master Archives", icon: "🏛️" },
    { id: "recycle_bin", label: "Recycle Bin", icon: "♻️" },
  ];

  const NavItem = ({ item }) => (
    <button
      onClick={() => {
        setActiveTab(item.id);
        setIsPreviewMode(false);
      }}
      className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-300 font-black text-[9px] uppercase tracking-[0.2em] ${
        activeTab === item.id
          ? "bg-slate-900 text-white shadow-2xl shadow-slate-300 scale-105"
          : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
      }`}
    >
      <span className="text-sm opacity-70">{item.icon}</span>
      {item.label}
    </button>
  );

  return (
    <aside className="w-64 bg-white border-r-2 border-slate-100 flex flex-col fixed inset-y-0 left-0 z-50 no-print">
      <div className="p-10 flex items-center gap-4">
        <img src={logo} alt="L" className="w-10 h-10 object-contain" />
        <span className="font-black text-2xl tracking-tighter text-slate-900 italic">
          {businessName || "Payivva."}
        </span>
      </div>
      
      <nav className="flex-1 p-6 space-y-8 overflow-y-auto max-h-screen pb-20 custom-scrollbar">
        {/* Main Section */}
        <div>
          <p className="px-6 mb-4 text-[8px] font-black text-slate-300 uppercase tracking-[0.3em]">Main Console</p>
          <div className="space-y-2">
            {mainItems.map((item) => <NavItem key={item.id} item={item} />)}
          </div>
        </div>

        {/* Archives Section */}
        <div>
          <p className="px-6 mb-4 text-[8px] font-black text-slate-300 uppercase tracking-[0.3em]">Records & Archives</p>
          <div className="space-y-2">
            {historyItems.map((item) => <NavItem key={item.id} item={item} />)}
          </div>
        </div>
      </nav>
    </aside>
  );
};

export default Sidebar;
