import React from "react";

const PaidHistory = ({ savedInvoices, currency, setActiveTab, updateStatus, loadInvoice, handleDownloadPDF, deleteInvoice, permanentDeleteInvoice, revenueLogs, handleEmail }) => {
  const paidInvoices = savedInvoices.filter(inv => inv.status === 'paid_archived');

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-end bg-white p-10 rounded-[3rem] border-2 border-slate-100 shadow-xl">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase leading-none mb-2">Paid Archives</h2>
          <div className="flex items-center gap-4">
             <span className="w-3 h-3 bg-green-500 rounded-full"></span>
             <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em]">Settled & Completed Records</p>
          </div>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={() => {
              if (paidInvoices.length === 0) return;
              if (window.confirm(`⚠️ WARNING: You are about to PERMANENTLY DELETE all ${paidInvoices.length} settled records.\n\nThis will NOT restore stock, but these records will be gone forever. Proceed?`)) {
                paidInvoices.forEach(inv => permanentDeleteInvoice(inv.id));
              }
            }}
            className="bg-red-50 text-red-600 px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all border border-red-100"
          >
            Clear All Permanently
          </button>
          <div className="bg-green-50 px-8 py-4 rounded-[1.5rem] border-2 border-green-100">
             <span className="text-[9px] font-black text-green-600 uppercase tracking-widest block mb-1">Total Settled (Lifetime)</span>
             <span className="text-xl font-black text-green-900">{currency} {revenueLogs.reduce((sum, rev) => sum + parseFloat(rev.amount), 0).toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[3.5rem] border-2 border-slate-100 overflow-hidden shadow-2xl">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50 border-b-2 border-slate-100">
              <th className="px-10 py-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Invoice #</th>
              <th className="px-10 py-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Date</th>
              <th className="px-10 py-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Client</th>
              <th className="px-10 py-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Total</th>
              <th className="px-10 py-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Status</th>
              <th className="px-10 py-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y-2 divide-slate-50">
            {paidInvoices.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-10 py-20 text-center">
                  <div className="flex flex-col items-center gap-4 opacity-30">
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-2xl">📁</div>
                    <p className="font-black text-[10px] uppercase tracking-widest">No Archived Paid Invoices</p>
                  </div>
                </td>
              </tr>
            ) : (
              paidInvoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-50/50 transition-all group">
                  <td className="px-10 py-8 font-black text-slate-900 text-sm">{inv.invoice_number}</td>
                  <td className="px-10 py-8 text-slate-500 font-bold text-xs">{new Date(inv.issue_date).toLocaleDateString()}</td>
                  <td className="px-10 py-8 font-black text-slate-700 text-sm uppercase">{inv.customer_name}</td>
                  <td className="px-10 py-8 font-black text-slate-900 text-sm whitespace-nowrap">
                    <span className="flex items-center gap-1">
                      <span className="text-[10px] text-slate-400 font-bold">{currency}</span>
                      <span>{parseFloat(inv.grand_total).toLocaleString()}</span>
                    </span>
                  </td>
                  <td className="px-10 py-8">
                    <span className="bg-green-100 text-green-600 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border border-green-200">
                      PAID (ARCHIVED)
                    </span>
                  </td>
                  <td className="px-10 py-8 text-right">
                    <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all">
                      <button 
                        onClick={() => {
                          loadInvoice(inv);
                          setTimeout(handleDownloadPDF, 500);
                        }} 
                        className="p-3 bg-blue-600 text-white rounded-xl shadow-lg hover:scale-110 transition-all" 
                        title="Download PDF"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                      </button>
                      <button 
                        onClick={() => handleEmail(inv)} 
                        className="p-3 bg-emerald-600 text-white rounded-xl shadow-lg hover:scale-110 transition-all"
                        title="Send Email"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                      </button>
                      <button onClick={() => updateStatus(inv.id, 'active')} className="bg-white border-2 border-slate-100 text-slate-400 p-3 rounded-xl hover:text-blue-600 hover:border-blue-100 transition-all" title="Restore to Active">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"></polyline><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path></svg>
                      </button>
                      <button onClick={() => permanentDeleteInvoice(inv.id)} className="bg-red-50 text-red-600 p-3 rounded-xl hover:bg-red-600 hover:text-white transition-all border border-red-100 shadow-sm" title="Delete Permanently">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
                      </button>
                    </div>
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

export default PaidHistory;
