import React from "react";

const PurchaseOrderHistory = ({ savedPOs, currency, setActiveTab, reprintPO, loadPO, updatePOStatus, bulkClearPOHistory, handleEmailPO }) => {
  return (
    <div className="bg-white rounded-[3rem] border-2 border-slate-100 overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-500">
       <div className="p-10 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h3 className="font-black uppercase text-sm tracking-widest text-slate-800">Purchase Orders History</h3>
          <div className="flex items-center gap-4">
             <button 
               onClick={bulkClearPOHistory}
               className="bg-red-50 text-red-600 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest border-2 border-red-100 hover:bg-red-100 transition-all flex items-center gap-2"
             >
               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
               Clear History (ZIP Backup)
             </button>
             <button onClick={() => setActiveTab("purchase_orders")} className="bg-slate-900 text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl hover:scale-105 transition-all">+ Create Purchase Order</button>
          </div>
       </div>
       <div className="overflow-x-auto">
          <table className="w-full text-left">
             <thead>
                <tr className="text-[10px] font-black uppercase text-slate-400 bg-slate-50/50 border-b border-slate-100">
                  <th className="px-8 py-6">PO #</th>
                  <th className="px-8 py-6">Date</th>
                  <th className="px-8 py-6">Vendor</th>
                  <th className="px-8 py-6 text-center">Status</th>
                  <th className="px-8 py-6 text-right">Total Value</th>
                  <th className="px-8 py-6 text-center">Actions</th>
                </tr>
             </thead>
             <tbody className="divide-y divide-slate-100">
                {savedPOs.filter(po => po.status !== 'trashed').map(po => (
                  <tr key={po.id} className="group hover:bg-slate-50 transition-all">
                     <td className="px-8 py-6 font-black text-xs uppercase text-blue-600">{po.po_number}</td>
                     <td className="px-8 py-6 text-xs font-bold text-slate-500">{new Date(po.po_date).toLocaleDateString()}</td>
                     <td className="px-8 py-6 text-xs font-black uppercase text-slate-700">{po.vendor_name}</td>
                     <td className="px-8 py-6 text-center">
                        <span className={`px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest ${
                          po.status === 'received' ? 'bg-green-100 text-green-600' : 
                          po.status === 'cancelled' ? 'bg-red-100 text-red-600' : 
                          'bg-blue-100 text-blue-600'
                        }`}>
                          {po.status || 'active'}
                        </span>
                      </td>
                     <td className="px-8 py-6 text-right font-black text-xs">
                        <div className="flex items-center justify-end gap-1">
                           <span className="text-[9px] text-slate-400">{currency}</span>
                           <span>{po.total_value}</span>
                        </div>
                     </td>
                     <td className="px-8 py-6">
                         <div className="flex items-center justify-center gap-3">
                            {po.status !== 'received' && (
                              <button 
                                onClick={() => updatePOStatus(po.id, 'received')} 
                                title="Mark as Received"
                                className="bg-green-600 text-white p-2.5 rounded-xl hover:bg-green-700 transition-all shadow-sm"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"/></svg>
                              </button>
                            )}
                            <button 
                              onClick={() => loadPO(po)} 
                              title="Edit PO"
                              className="bg-slate-900 text-white p-2.5 rounded-xl hover:bg-slate-800 transition-all shadow-sm"
                            >
                               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                            </button>
                            <button 
                              onClick={() => reprintPO(po)} 
                              title="Reprint PDF"
                              className="bg-blue-600 text-white p-2.5 rounded-xl hover:bg-blue-700 transition-all shadow-sm"
                            >
                               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/></svg>
                            </button>
                            <button 
                              onClick={() => handleEmailPO(po)} 
                              title="Send Email"
                              className="bg-emerald-600 text-white p-2.5 rounded-xl hover:bg-emerald-700 transition-all shadow-sm"
                            >
                               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                            </button>
                         </div>
                      </td>
                  </tr>
                ))}
             </tbody>
          </table>
       </div>
       {savedPOs.length === 0 && (
         <div className="p-20 text-center">
            <p className="text-slate-300 font-black uppercase text-xs tracking-widest">No purchase history found.</p>
         </div>
       )}
    </div>
  );
};

export default PurchaseOrderHistory;
