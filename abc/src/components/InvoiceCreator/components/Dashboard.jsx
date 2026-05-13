import React from "react";

const Dashboard = ({ savedInvoices, currency, setActiveTab, revenueLogs = [] }) => {
  const today = new Date().toLocaleDateString('en-CA');
  const activeInvoices = savedInvoices.filter(inv => inv.status !== 'trashed');
  
  const todayRevenue = revenueLogs.filter(rev => {
    const entryDate = new Date(rev.entry_date).toLocaleDateString('en-CA');
    return entryDate === today;
  });

  const todayInvoices = activeInvoices.filter(inv => {
    const invDate = new Date(inv.issue_date).toLocaleDateString('en-CA');
    return invDate === today;
  });

  const stats = {
    todayTotal: todayRevenue.reduce((acc, rev) => acc + parseFloat(rev.amount || 0), 0),
    todayCount: todayRevenue.length,
    lifeTotal: revenueLogs.reduce((acc, rev) => acc + parseFloat(rev.amount || 0), 0),
    lifeCount: revenueLogs.length,
    pending: activeInvoices
      .filter(inv => inv.status === 'pending')
      .reduce((acc, inv) => acc + parseFloat(inv.grand_total || 0), 0),
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
         <div className="bg-slate-900 p-8 rounded-[2.5rem] shadow-2xl shadow-slate-200 border-4 border-white transform hover:scale-105 transition-all">
            <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-2">Today's Revenue</p>
            <h3 className="text-4xl font-black text-white tracking-tighter">{currency} {stats.todayTotal.toLocaleString()}</h3>
            <span className="text-[9px] font-bold text-blue-400 uppercase tracking-widest mt-2 block">Resets at 12 AM</span>
         </div>
         <div className="bg-white p-8 rounded-[2.5rem] border-2 border-slate-100 shadow-sm">
            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2">Today's Orders</p>
            <h3 className="text-3xl font-black text-slate-900">{stats.todayCount}</h3>
         </div>
         <div className="bg-white p-8 rounded-[2.5rem] border-2 border-slate-100 shadow-sm">
            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2">Pending Payments</p>
            <h3 className="text-3xl font-black text-orange-600">{currency} {stats.pending.toLocaleString()}</h3>
         </div>
         <div className="bg-blue-600 p-8 rounded-[2.5rem] shadow-xl text-white cursor-pointer hover:bg-blue-500 transition-all" onClick={() => setActiveTab("analytics")}>
            <p className="text-[10px] font-black uppercase text-blue-200 tracking-widest mb-2">Life-time Sales</p>
            <h3 className="text-3xl font-black">{currency} {stats.lifeTotal.toLocaleString()}</h3>
            <span className="text-[9px] font-bold text-white/50 uppercase tracking-widest mt-2 block">View Full Reports →</span>
         </div>
      </div>

      <div className="bg-white rounded-[3rem] border-2 border-slate-100 overflow-hidden shadow-xl">
         <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <h3 className="font-black uppercase text-xs tracking-widest text-slate-800">Recent Activity</h3>
            <button onClick={() => setActiveTab("templates")} className="text-[10px] font-black text-blue-600 uppercase">View All Invoices</button>
         </div>
         <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] font-black uppercase text-slate-400 bg-slate-50 border-b border-slate-100">
                  <th className="px-8 py-5">Date</th>
                  <th className="px-8 py-5">Invoice #</th>
                  <th className="px-8 py-5">Customer</th>
                  <th className="px-8 py-5 text-right">Amount</th>
                  <th className="px-8 py-5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {todayInvoices.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-8 py-20 text-center text-slate-300 font-black uppercase text-xs tracking-widest">No Activity Recorded Today</td>
                  </tr>
                ) : (
                  todayInvoices.slice(0, 5).map(inv => (
                    <tr key={inv.id} className="text-xs font-bold hover:bg-slate-50/50 transition-colors">
                       <td className="px-8 py-5 text-slate-500">{new Date(inv.issue_date).toLocaleDateString()}</td>
                       <td className="px-8 py-5 uppercase font-black">{inv.invoice_number}</td>
                       <td className="px-8 py-5 uppercase">{inv.customer_name}</td>
                       <td className="px-8 py-5 text-right font-black whitespace-nowrap">
                         <span className="flex items-center justify-end gap-1">
                            <span className="text-[10px] text-slate-400 font-bold">{currency}</span>
                            <span>{inv.grand_total}</span>
                         </span>
                       </td>
                       <td className="px-8 py-5">
                          <span className={`px-4 py-2 rounded-full text-[9px] uppercase font-black ${
                            inv.status === 'paid' ? 'bg-green-100 text-green-700' : 
                            'bg-orange-100 text-orange-700'
                          }`}>
                            {inv.status}
                          </span>
                       </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
         </div>
      </div>
    </div>
  );
};

export default Dashboard;
