import React, { useMemo, useState } from "react";

const Analytics = ({ savedInvoices, savedPOs, expenses, products, currency, handleDownloadAudit, revenueLogs }) => {
  const [timeframe, setTimeframe] = useState("monthly");

  const activeInvoicesForItems = useMemo(() => savedInvoices.filter(inv => inv.status !== 'cancelled'), [savedInvoices]);
  const activePOs = useMemo(() => savedPOs.filter(po => po.status !== 'cancelled' && po.status !== 'trashed'), [savedPOs]);
  const activeExpenses = useMemo(() => expenses.filter(exp => exp.status !== 'trashed'), [expenses]);

  const masterData = useMemo(() => {
    const stats = {};
    
    const getKey = (dateStr) => {
      const d = new Date(dateStr);
      if (timeframe === "daily") return d.toLocaleDateString();
      if (timeframe === "monthly") return `${d.toLocaleString('default', { month: 'short' })} ${d.getFullYear()}`;
      return `${d.getFullYear()}`;
    };

    const initEntry = (key) => ({
      key,
      sales: 0, purchase: 0, expense: 0,
      taxCollected: 0, taxPaid: 0,
      topCustomers: {}, topVendors: {},
      topProductsSold: {}, topProductsBought: {},
      expenseCategories: {},
      orderCount: 0
    });

    // Process Sales (Persistent Revenue Log)
    revenueLogs.forEach(rev => {
      const key = getKey(rev.entry_date);
      if (!stats[key]) stats[key] = initEntry(key);
      
      const total = parseFloat(rev.amount) || 0;
      stats[key].sales += total;
      stats[key].taxCollected += parseFloat(rev.tax_collected) || 0;
      stats[key].orderCount += 1;
      
      const cust = rev.customer_name || "Guest";
      stats[key].topCustomers[cust] = (stats[key].topCustomers[cust] || 0) + total;
    });

    // Process Top Products (from available invoices)
    activeInvoicesForItems.forEach(inv => {
      const key = getKey(inv.issue_date);
      if (!stats[key]) stats[key] = initEntry(key);
      
      try {
        const invoiceData = typeof inv.data === 'string' ? JSON.parse(inv.data) : inv.data;
        const items = invoiceData.items || [];
        items.forEach(item => {
          const name = item.name || "Unknown";
          stats[key].topProductsSold[name] = (stats[key].topProductsSold[name] || 0) + (Number(item.quantity) || 0);
        });
      } catch (e) { console.error("Error parsing items for analytics:", e); }
    });

    // Process Purchases
    activePOs.forEach(po => {
      const key = getKey(po.po_date || po.created_at);
      if (!stats[key]) stats[key] = initEntry(key);
      
      const total = parseFloat(po.total_value) || 0;
      stats[key].purchase += total;
      stats[key].taxPaid += (total * 0.18);
      
      const vendor = po.vendor_name || "Unknown Vendor";
      stats[key].topVendors[vendor] = (stats[key].topVendors[vendor] || 0) + total;

      try {
        const poItems = typeof po.items === 'string' ? JSON.parse(po.items) : po.items;
        (poItems || []).forEach(item => {
          const name = item.name || "Unknown";
          stats[key].topProductsBought[name] = (stats[key].topProductsBought[name] || 0) + (Number(item.quantity) || 0);
        });
      } catch (e) {}
    });

    // Process Expenses
    activeExpenses.forEach(exp => {
      const key = getKey(exp.expense_date || exp.created_at);
      if (!stats[key]) stats[key] = initEntry(key);
      
      const amount = parseFloat(exp.amount) || 0;
      stats[key].expense += amount;
      
      const category = exp.category || "General";
      stats[key].expenseCategories[category] = (stats[key].expenseCategories[category] || 0) + amount;
    });

    return Object.values(stats).sort((a, b) => {
        if (timeframe === 'daily') return new Date(b.key) - new Date(a.key);
        return 0; // Simple sort for others
    });
  }, [activeInvoicesForItems, activePOs, activeExpenses, timeframe, revenueLogs]);

  const lowStockItems = useMemo(() => products.filter(p => p.stock <= 10), [products]);

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      {/* Dashboard Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-white p-12 rounded-[3rem] border-2 border-slate-100 shadow-xl">
        <div className="space-y-2">
          <h2 className="text-5xl font-black text-slate-900 tracking-tighter uppercase leading-none">Intelligence Hub</h2>
          <div className="flex items-center gap-4">
             <span className="w-3 h-3 bg-blue-600 rounded-full animate-pulse"></span>
             <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em]">Master Audit & Growth Analytics</p>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
            <div className="flex gap-2 bg-slate-100 p-2 rounded-[2rem]">
              {['daily', 'monthly', 'yearly'].map(t => (
                <button 
                  key={t}
                  onClick={() => setTimeframe(t)}
                  className={`px-8 py-4 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all ${timeframe === t ? 'bg-white text-slate-900 shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  {t}
                </button>
              ))}
            </div>
            <button 
              onClick={() => handleDownloadAudit(masterData, timeframe)}
              className="bg-slate-900 text-white px-10 py-5 rounded-[2rem] text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-2xl"
            >
              Download PDF Audit
            </button>
        </div>
      </div>

      {/* Low Stock Banner */}
      {lowStockItems.length > 0 && (
        <div className="bg-orange-50 border-2 border-orange-100 p-8 rounded-[3rem] flex justify-between items-center animate-bounce">
           <div className="flex items-center gap-6">
              <span className="text-3xl">⚠️</span>
              <div>
                 <h4 className="text-orange-900 font-black uppercase text-sm tracking-tight">Critical Stock Alert!</h4>
                 <p className="text-orange-700 text-[10px] font-bold uppercase">{lowStockItems.length} products are running low on stock.</p>
              </div>
           </div>
           <div className="flex gap-2">
              {lowStockItems.slice(0,3).map(p => (
                <span key={p.id} className="bg-orange-200 text-orange-900 px-4 py-2 rounded-xl text-[9px] font-black">{p.name} ({p.stock})</span>
              ))}
           </div>
        </div>
      )}

      {/* Summary Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white p-10 rounded-[3rem] border-2 border-slate-100 shadow-xl flex justify-between items-center">
           <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Total Life Sales</p>
              <h3 className="text-3xl font-black text-slate-900">{currency} {masterData.reduce((acc, r) => acc + r.sales, 0).toLocaleString()}</h3>
           </div>
           <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center text-2xl">💰</div>
        </div>
        <div className="bg-white p-10 rounded-[3rem] border-2 border-slate-100 shadow-xl flex justify-between items-center">
           <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Total Transactions</p>
              <h3 className="text-3xl font-black text-slate-900">{masterData.reduce((acc, r) => acc + r.orderCount, 0)} Orders</h3>
           </div>
           <div className="w-16 h-16 bg-green-50 text-green-600 rounded-3xl flex items-center justify-center text-2xl">📦</div>
        </div>
        <div className="bg-white p-10 rounded-[3rem] border-2 border-slate-100 shadow-xl flex justify-between items-center">
           <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Total Tax Output</p>
              <h3 className="text-3xl font-black text-slate-900">{currency} {masterData.reduce((acc, r) => acc + r.taxCollected, 0).toLocaleString(undefined, {maximumFractionDigits:0})}</h3>
           </div>
           <div className="w-16 h-16 bg-purple-50 text-purple-600 rounded-3xl flex items-center justify-center text-2xl">🏛️</div>
        </div>
      </div>

      {/* Main Reports */}
      <div className="space-y-12">
        {masterData.map((report, idx) => (
          <div key={idx} className="bg-white rounded-[4rem] border-2 border-slate-100 overflow-hidden shadow-2xl">
            {/* Report Header */}
            <div className="p-12 bg-slate-900 text-white flex justify-between items-center">
               <div>
                  <h3 className="text-3xl font-black tracking-tighter uppercase">{report.key} Report</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Audit Log ID: #INTEL-{report.key.replace(' ', '-')}</p>
               </div>
               <div className="text-right">
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Orders Processed</div>
                  <div className="text-4xl font-black">{report.orderCount}</div>
               </div>
            </div>

            {/* Financial Summary */}
            <div className="p-12 grid grid-cols-1 md:grid-cols-4 gap-8 border-b border-slate-50">
               <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Total Sales</p>
                  <h4 className="text-2xl font-black text-slate-900">{currency} {report.sales.toLocaleString()}</h4>
               </div>
               <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Total Purchase</p>
                  <h4 className="text-2xl font-black text-slate-900">{currency} {report.purchase.toLocaleString()}</h4>
               </div>
               <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Expenses</p>
                  <h4 className="text-2xl font-black text-red-600">{currency} {report.expense.toLocaleString()}</h4>
               </div>
               <div className="p-8 bg-blue-900 text-white rounded-[2.5rem] shadow-2xl">
                  <p className="text-[10px] font-black opacity-50 uppercase tracking-widest mb-2">Net Profit</p>
                  <h4 className="text-2xl font-black">{currency} {(report.sales - report.purchase - report.expense).toLocaleString()}</h4>
               </div>
            </div>

            {/* Tax Intelligence */}
            <div className="p-12 bg-slate-50/50 grid grid-cols-1 md:grid-cols-2 gap-8 border-b border-slate-50">
               <div className="flex items-center gap-6">
                  <div className="w-12 h-12 bg-green-100 text-green-700 rounded-2xl flex items-center justify-center font-black text-xs">GST</div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tax Collected (Output)</p>
                    <h5 className="text-xl font-black text-slate-900">{currency} {report.taxCollected.toLocaleString(undefined, {maximumFractionDigits:0})}</h5>
                  </div>
               </div>
               <div className="flex items-center gap-6">
                  <div className="w-12 h-12 bg-blue-100 text-blue-700 rounded-2xl flex items-center justify-center font-black text-xs">ITC</div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tax Paid (Input Credit)</p>
                    <h5 className="text-xl font-black text-slate-900">{currency} {report.taxPaid.toLocaleString(undefined, {maximumFractionDigits:0})}</h5>
                  </div>
               </div>
            </div>

            {/* Deep Analysis Grids */}
            <div className="p-12 grid grid-cols-1 md:grid-cols-2 gap-16">
               {/* Left Column: Customers & Products */}
               <div className="space-y-12">
                  <section>
                    <h5 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.3em] mb-6 flex items-center gap-3">
                       <div className="w-2 h-2 rounded-full bg-blue-600"></div> Top Customers (Revenue)
                    </h5>
                    <div className="space-y-4">
                      {Object.entries(report.topCustomers).sort((a,b)=>b[1]-a[1]).slice(0,5).map(([name, val], i) => (
                        <div key={i} className="flex justify-between items-center bg-slate-50 p-6 rounded-3xl border border-slate-100">
                          <span className="text-[10px] font-black text-slate-700 uppercase">{name}</span>
                          <span className="text-xs font-black text-slate-900">{currency} {val.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </section>
                  <section>
                    <h5 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.3em] mb-6 flex items-center gap-3">
                       <div className="w-2 h-2 rounded-full bg-green-600"></div> Top Selling Items
                    </h5>
                    <div className="grid grid-cols-1 gap-4">
                      {Object.entries(report.topProductsSold).sort((a,b)=>b[1]-a[1]).slice(0,5).map(([name, qty], i) => (
                        <div key={i} className="flex justify-between items-center bg-green-50/50 p-6 rounded-3xl border border-green-100">
                          <span className="text-[10px] font-black text-green-900 uppercase">{name}</span>
                          <span className="bg-green-600 text-white px-4 py-2 rounded-xl text-[10px] font-black">{qty} Units</span>
                        </div>
                      ))}
                    </div>
                  </section>
               </div>

               {/* Right Column: Vendors & Expenses */}
               <div className="space-y-12">
                  <section>
                    <h5 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.3em] mb-6 flex items-center gap-3">
                       <div className="w-2 h-2 rounded-full bg-purple-600"></div> Top Vendors (Purchases)
                    </h5>
                    <div className="space-y-4">
                      {Object.entries(report.topVendors).sort((a,b)=>b[1]-a[1]).slice(0,5).map(([name, val], i) => (
                        <div key={i} className="flex justify-between items-center bg-purple-50 p-6 rounded-3xl border border-purple-100">
                          <span className="text-[10px] font-black text-purple-900 uppercase">{name}</span>
                          <span className="text-xs font-black text-purple-900">{currency} {val.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </section>
                  <section>
                    <h5 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.3em] mb-6 flex items-center gap-3">
                       <div className="w-2 h-2 rounded-full bg-red-600"></div> Expense Categories
                    </h5>
                    <div className="space-y-4">
                      {Object.entries(report.expenseCategories).sort((a,b)=>b[1]-a[1]).map(([cat, val], i) => (
                        <div key={i} className="flex justify-between items-center bg-red-50 p-6 rounded-3xl border border-red-100">
                          <span className="text-[10px] font-black text-red-900 uppercase">{cat}</span>
                          <span className="text-xs font-black text-red-900">{currency} {val.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </section>
               </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Analytics;
