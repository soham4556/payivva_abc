import React from "react";

const InvoiceList = ({ savedInvoices, currency, bulkClearHistory, setActiveTab, updateStatus, loadInvoice, handleDownloadPDF, cancelInvoice, deleteInvoice }) => {
  const activeInvoices = savedInvoices.filter(inv => inv.status !== 'cancelled' && inv.status !== 'trashed' && inv.status !== 'paid_archived');
  return (
    <div className="bg-white rounded-[3rem] border-2 border-slate-100 overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-500">
       <div className="p-10 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h3 className="font-black uppercase text-sm tracking-widest text-slate-800">Invoices History (Active)</h3>
          <div className="flex gap-4">
             <button 
               onClick={bulkClearHistory} 
               className="bg-red-50 text-red-600 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all shadow-sm border border-red-100"
             >
               Purge All History
             </button>
             <button onClick={() => setActiveTab("invoices")} className="bg-slate-900 text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl hover:scale-105 transition-all">+ New Invoice</button>
          </div>
       </div>
       <div className="overflow-x-auto">
          <table className="w-full text-left">
             <thead>
                <tr className="text-[10px] font-black uppercase text-slate-400 bg-slate-50/50 border-b border-slate-100">
                  <th className="px-8 py-6">Invoice #</th>
                  <th className="px-8 py-6">Date</th>
                  <th className="px-8 py-6">Client</th>
                  <th className="px-8 py-6">Type</th>
                  <th className="px-8 py-6 text-right">Total</th>
                  <th className="px-8 py-6">Status</th>
                  <th className="px-8 py-6 text-center">Actions</th>
                </tr>
             </thead>
             <tbody className="divide-y divide-slate-100">
                {activeInvoices.map(inv => (
                  <tr key={inv.id} className="group hover:bg-slate-50 transition-all">
                     <td className="px-8 py-6 font-black text-xs uppercase">{inv.invoice_number}</td>
                     <td className="px-8 py-6 text-xs font-bold text-slate-500">{new Date(inv.issue_date).toLocaleDateString()}</td>
                     <td className="px-8 py-6 text-xs font-black uppercase text-slate-700">{inv.customer_name}</td>
                     <td className="px-8 py-6"><span className="text-[9px] font-black uppercase bg-slate-100 px-3 py-1 rounded-lg text-slate-500">{inv.doc_type?.replace('_', ' ')}</span></td>
                     <td className="px-8 py-6 text-right font-black text-xs whitespace-nowrap">
                        <span className="flex items-center justify-end gap-1">
                           <span className="text-[10px] text-slate-400 font-bold">{currency}</span>
                           <span>{inv.grand_total}</span>
                        </span>
                     </td>
                     <td className="px-8 py-6">
                        <select 
                          value={inv.status} 
                          onChange={(e) => updateStatus(inv.id, e.target.value)}
                          className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase outline-none border-none cursor-pointer ${
                            inv.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                          }`}
                        >
                           <option value="pending">Pending</option>
                           <option value="paid">Paid</option>
                        </select>
                     </td>
                     <td className="px-8 py-6 text-center space-x-2 flex items-center justify-center">
                        <button onClick={() => loadInvoice(inv)} className="bg-white border border-slate-200 text-slate-600 px-4 py-2 rounded-xl text-[9px] font-black uppercase hover:bg-slate-900 hover:text-white transition-all shadow-sm">View / Edit</button>
                        <button 
                          onClick={() => {
                            loadInvoice(inv);
                            setTimeout(handleDownloadPDF, 500);
                          }} 
                          className="bg-blue-600 text-white px-4 py-2 rounded-xl text-[9px] font-black uppercase hover:bg-blue-700 transition-all shadow-sm"
                        >
                          PDF
                        </button>
                        <button 
                          onClick={() => cancelInvoice(inv.id)} 
                          className="bg-orange-50 text-orange-600 px-4 py-2 rounded-xl text-[9px] font-black uppercase hover:bg-orange-600 hover:text-white transition-all shadow-sm border border-orange-100"
                          title="Cancel & Restore Stock"
                        >
                          Cancel
                        </button>
                        <button 
                          onClick={() => deleteInvoice(inv.id)} 
                          className="bg-red-50 text-red-600 px-4 py-2 rounded-xl text-[9px] font-black uppercase hover:bg-red-600 hover:text-white transition-all shadow-sm border border-red-100"
                          title="Delete (No Stock Restore)"
                        >
                          Delete
                        </button>
                     </td>
                  </tr>
                ))}
             </tbody>
          </table>
       </div>
       {activeInvoices.length === 0 && (
         <div className="p-20 text-center space-y-4">
            <p className="text-slate-400 font-black uppercase text-xs tracking-widest">No active invoices found.</p>
            <button onClick={() => setActiveTab("invoices")} className="text-blue-600 font-black text-xs uppercase underline">Create your first bill</button>
         </div>
       )}
    </div>
  );
};

export default InvoiceList;
