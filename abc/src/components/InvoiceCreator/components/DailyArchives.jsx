import React, { useState, useEffect, useMemo } from "react";

const DailyArchives = ({ currency, onViewAnalytics }) => {
  const [archives, setArchives] = useState([]);
  const [selectedArchive, setSelectedArchive] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchArchives();
  }, []);

  const fetchArchives = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/archives");
      const data = await res.json();
      setArchives(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const viewDetails = async (id) => {
    try {
      const res = await fetch(`/api/archives/${id}`);
      const data = await res.json();
      setSelectedArchive(data);
    } catch (err) {
      console.error(err);
      alert("Error loading details");
    }
  };

  const totalLifetimeRevenue = useMemo(() => {
    return archives.reduce((acc, curr) => acc + (parseFloat(curr.total_revenue) || 0), 0);
  }, [archives]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-12 h-12 border-4 border-slate-100 border-t-blue-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (selectedArchive) {
    const data = JSON.parse(selectedArchive.snapshot_data);
    return (
      <div className="space-y-8 animate-in fade-in zoom-in-95 duration-300">
        <button 
          onClick={() => setSelectedArchive(null)}
          className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 hover:text-slate-900 transition-colors"
        >
          ← Back to List
        </button>

        <div className="bg-slate-900 p-12 rounded-[3rem] text-white flex justify-between items-center shadow-2xl">
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-2">Snapshot for Date</p>
            <h2 className="text-4xl font-black italic tracking-tighter uppercase">{new Date(selectedArchive.archive_date).toLocaleDateString()}</h2>
          </div>
          <div className="text-right">
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-2">Total Revenue Archived</p>
             <h2 className="text-4xl font-black text-blue-400 whitespace-nowrap">
               <span className="flex items-center justify-end gap-2">
                 <span className="text-2xl opacity-60 italic">{currency}</span>
                 <span>{selectedArchive.total_revenue?.toLocaleString()}</span>
               </span>
             </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <div className="bg-white p-8 rounded-[2rem] border-2 border-slate-100 shadow-sm">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Total Invoices</p>
              <h3 className="text-3xl font-black text-slate-900">{data.invoices?.length || 0}</h3>
           </div>
           <div className="bg-white p-8 rounded-[2rem] border-2 border-slate-100 shadow-sm">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Total POs</p>
              <h3 className="text-3xl font-black text-slate-900">{data.purchase_orders?.length || 0}</h3>
           </div>
           <div className="bg-white p-8 rounded-[2rem] border-2 border-slate-100 shadow-sm">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Total Expenses</p>
              <h3 className="text-3xl font-black text-red-600 whitespace-nowrap">
                <span className="flex items-center gap-1">
                  <span className="text-lg opacity-40">{currency}</span>
                  <span>{selectedArchive.total_expenses?.toLocaleString()}</span>
                </span>
              </h3>
           </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
           <div className="bg-white rounded-[2rem] border-2 border-slate-100 overflow-hidden shadow-lg">
              <div className="p-8 border-b border-slate-100 bg-slate-50/50">
                 <h3 className="font-black text-xs uppercase tracking-widest">Archived Invoices</h3>
              </div>
              <div className="overflow-x-auto">
                 <table className="w-full text-left">
                   <thead>
                     <tr className="text-[10px] font-black uppercase text-slate-400 bg-slate-50 border-b border-slate-100">
                       <th className="px-8 py-5">#</th>
                       <th className="px-8 py-5">Customer</th>
                       <th className="px-8 py-5 text-right">Amount</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-50">
                     {data.invoices?.map(inv => (
                       <tr key={inv.id} className="text-xs font-bold hover:bg-slate-50/50 transition-colors">
                         <td className="px-8 py-5 uppercase font-black">{inv.invoice_number}</td>
                         <td className="px-8 py-5 uppercase text-slate-500">{inv.customer_name}</td>
                         <td className="px-8 py-5 text-right font-black whitespace-nowrap">
                           {currency} {inv.grand_total}
                         </td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
              </div>
           </div>

           <div className="bg-white rounded-[2rem] border-2 border-slate-100 overflow-hidden shadow-lg">
              <div className="p-8 border-b border-slate-100 bg-blue-50/50">
                 <h3 className="font-black text-xs uppercase tracking-widest text-blue-900">Revenue Breakdown (Paid)</h3>
              </div>
              <div className="overflow-x-auto">
                 <table className="w-full text-left">
                   <thead>
                     <tr className="text-[10px] font-black uppercase text-slate-400 bg-slate-50 border-b border-slate-100">
                       <th className="px-8 py-5">Customer</th>
                       <th className="px-8 py-5 text-right">Net Collection</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-50">
                     {(data.revenue_snapshot || data.revenue_log || []).map((rev, i) => (
                       <tr key={i} className="text-xs font-bold hover:bg-blue-50/30 transition-colors">
                         <td className="px-8 py-5 uppercase font-black text-blue-900">{rev.customer_name}</td>
                         <td className="px-8 py-5 text-right font-black text-blue-600 whitespace-nowrap">
                           {currency} {rev.amount}
                         </td>
                       </tr>
                     ))}
                     {(data.revenue_snapshot || data.revenue_log || []).length === 0 && (
                       <tr><td colSpan="2" className="p-10 text-center text-[10px] uppercase font-black text-slate-300">No paid collections archived</td></tr>
                     )}
                   </tbody>
                 </table>
              </div>
           </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-end bg-white p-10 rounded-[3rem] border-2 border-slate-100 shadow-xl">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic">Daily Master Archives</h2>
          <p className="text-slate-400 font-bold text-xs mt-2 uppercase tracking-widest">Historical snapshots of all transaction data</p>
        </div>
        <div className="text-right">
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-2">Lifetime Total Revenue</p>
           <h2 className="text-4xl font-black text-blue-600 tracking-tighter">
             {currency} {totalLifetimeRevenue.toLocaleString()}
           </h2>
        </div>
      </div>

      <div className="bg-white rounded-[3rem] border-2 border-slate-100 overflow-hidden shadow-2xl">
        <table className="w-full text-left">
          <thead>
            <tr className="text-[10px] font-black uppercase text-slate-400 bg-slate-50 border-b border-slate-100">
              <th className="px-8 py-6">Archive Date</th>
              <th className="px-8 py-6">Total Orders</th>
              <th className="px-8 py-6">Archived Revenue</th>
              <th className="px-8 py-6">Expenses</th>
              <th className="px-8 py-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {archives.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-8 py-32 text-center text-slate-300 font-black uppercase text-xs tracking-[0.3em]">No Archives Found</td>
              </tr>
            ) : (
              archives.map((arc) => (
                <tr key={arc.id} className="group hover:bg-slate-50/80 transition-all cursor-pointer" onClick={() => viewDetails(arc.id)}>
                  <td className="px-8 py-6">
                    <span className="text-sm font-black text-slate-900 uppercase italic">{new Date(arc.archive_date).toLocaleDateString()}</span>
                  </td>
                  <td className="px-8 py-6">
                    <span className="text-xs font-bold text-slate-500">{arc.total_orders} Orders</span>
                  </td>
                  <td className="px-8 py-6">
                    <span className="text-sm font-black text-blue-600 whitespace-nowrap">
                      <span className="flex items-center gap-1">
                        <span className="text-[10px] opacity-40">{currency}</span>
                        <span>{arc.total_revenue?.toLocaleString()}</span>
                      </span>
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <span className="text-xs font-bold text-red-500 whitespace-nowrap">
                      <span className="flex items-center gap-1">
                        <span className="text-[10px] opacity-40">{currency}</span>
                        <span>{arc.total_expenses?.toLocaleString()}</span>
                      </span>
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right flex items-center justify-end gap-4">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        onViewAnalytics(arc);
                      }}
                      className="p-3 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                      title="Day-wise Advanced Analytics"
                    >
                      📊
                    </button>
                    <button className="text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover:text-blue-600 transition-colors">View Details →</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DailyArchives;
