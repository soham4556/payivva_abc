import React, { useState } from "react";

const RecycleBin = ({ 
  savedInvoices, 
  savedPOs, 
  expenses, 
  currency, 
  updateStatus, 
  updatePOStatus,
  permanentDeleteInvoice, 
  fetchInvoices,
  fetchPOs,
  fetchExpenses
}) => {
  const [subTab, setSubTab] = useState("invoices");

  const trashedInvoices = savedInvoices.filter(inv => inv.status === 'trashed' || inv.status === 'cancelled');
  const trashedPOs = savedPOs.filter(po => po.status === 'trashed');
  const trashedExpenses = expenses.filter(exp => exp.status === 'trashed');

  const handleRestore = async (id, type) => {
    if (!window.confirm(`♻️ Restore this ${type} to active history?`)) return;
    
    try {
      if (type === 'invoice') {
        await updateStatus(id, 'pending');
        fetchInvoices();
      } else if (type === 'po') {
        await updatePOStatus(id, 'active');
        fetchPOs();
      } else if (type === 'expense') {
        await fetch(`/api/expenses/${id}/status`, { 
          method: 'PUT', 
          headers: { 'Content-Type': 'application/json' }, 
          body: JSON.stringify({ status: 'active' }) 
        });
        fetchExpenses();
      }
      alert(`✅ ${type.toUpperCase()} restored!`);
    } catch (e) { console.error(e); }
  };

  const handlePermanentDelete = async (id, type) => {
    if (!window.confirm("⚠️ CRITICAL: Permanently delete this item? This cannot be undone.")) return;
    
    try {
      let url = "";
      if (type === 'invoice') {
        await permanentDeleteInvoice(id);
        fetchInvoices();
      } else {
        url = type === 'po' ? `/api/purchase_orders/${id}` : `/api/expenses/${id}`;
        await fetch(url, { method: 'DELETE' });
        type === 'po' ? fetchPOs() : fetchExpenses();
      }
      alert("🗑️ Permanently deleted.");
    } catch (e) { console.error(e); }
  };

  const renderTable = (items, type) => (
    <div className="overflow-x-auto">
      <table className="w-full text-left">
         <thead>
            <tr className="text-[10px] font-black uppercase text-slate-400 bg-slate-50 border-b border-slate-100">
              <th className="px-8 py-6">{type === 'expense' ? 'Category' : 'Number'}</th>
              <th className="px-8 py-6">Date</th>
              <th className="px-8 py-6">{type === 'expense' ? 'Vendor' : 'Client/Vendor'}</th>
              <th className="px-8 py-6 text-right">Amount</th>
              <th className="px-8 py-6 text-center">Actions</th>
            </tr>
         </thead>
         <tbody className="divide-y divide-slate-100">
            {items.map(item => (
              <tr key={item.id} className="group hover:bg-red-50/30 transition-all">
                 <td className="px-8 py-6 font-black text-xs uppercase text-slate-400 line-through">
                   {type === 'invoice' ? item.invoice_number : type === 'po' ? item.po_number : item.category}
                 </td>
                 <td className="px-8 py-6 text-xs font-bold text-slate-400">
                   {new Date(type === 'expense' ? item.expense_date : item.created_at).toLocaleDateString()}
                 </td>
                 <td className="px-8 py-6 text-xs font-black uppercase text-slate-400">
                   {type === 'invoice' ? item.customer_name : type === 'po' ? item.vendor_name : item.vendor}
                 </td>
                 <td className="px-8 py-6 text-right font-black text-xs text-slate-400">
                   {currency} {type === 'invoice' ? item.grand_total : type === 'po' ? item.total_value : item.amount}
                 </td>
                 <td className="px-8 py-6 text-center space-x-2">
                    <button 
                      onClick={() => handleRestore(item.id, type)} 
                      className="bg-green-50 text-green-600 px-4 py-2 rounded-xl text-[9px] font-black uppercase hover:bg-green-600 hover:text-white transition-all shadow-sm border border-green-100"
                    >
                      Restore
                    </button>
                    <button 
                      onClick={() => handlePermanentDelete(item.id, type)} 
                      className="bg-red-50 text-red-600 px-4 py-2 rounded-xl text-[9px] font-black uppercase hover:bg-red-600 hover:text-white transition-all shadow-sm border border-red-100"
                    >
                      Delete
                    </button>
                 </td>
              </tr>
            ))}
         </tbody>
      </table>
      {items.length === 0 && (
        <div className="p-24 text-center space-y-4">
           <div className="text-6xl grayscale opacity-10">♻️</div>
           <p className="text-slate-300 font-black uppercase text-[10px] tracking-widest">No trashed {type}s found</p>
        </div>
      )}
    </div>
  );

  return (
    <div className="bg-white rounded-[3rem] border-2 border-slate-100 overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-500">
       <div className="p-10 border-b border-slate-100 flex flex-col gap-6 bg-slate-50/50">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-black uppercase text-sm tracking-widest text-slate-800 flex items-center gap-2">
                <span className="text-xl">♻️</span> Recycle Bin
              </h3>
              <p className="text-[10px] font-bold text-red-400 uppercase mt-1 italic">Note: All trashed items are automatically purged daily at 12:00 AM.</p>
            </div>
          </div>
          
          <div className="flex justify-between items-center">
            <div className="flex gap-2">
              {['invoices', 'purchase_orders', 'expenses'].map(tab => (
                <button 
                  key={tab}
                  onClick={() => setSubTab(tab)}
                  className={`px-6 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${subTab === tab ? 'bg-slate-900 text-white shadow-lg scale-105' : 'bg-white text-slate-400 border border-slate-100 hover:bg-slate-50'}`}
                >
                  {tab.replace('_', ' ')} 
                  <span className="ml-2 opacity-50">
                    ({tab === 'invoices' ? trashedInvoices.length : tab === 'purchase_orders' ? trashedPOs.length : trashedExpenses.length})
                  </span>
                </button>
              ))}
            </div>

            <button 
              onClick={async () => {
                if (!window.confirm(`⚠️ CRITICAL: Permanently delete ALL trashed ${subTab.replace('_', ' ')}? This action is irreversible!`)) return;
                try {
                  const res = await fetch(`/api/recycle-bin/clear/${subTab}`, { method: 'POST' });
                  if (res.ok) {
                    alert(`🗑️ ${subTab.toUpperCase()} Trash Emptied!`);
                    if (subTab === 'invoices') fetchInvoices();
                    else if (subTab === 'purchase_orders') fetchPOs();
                    else fetchExpenses();
                  }
                } catch (e) { console.error(e); }
              }}
              className="bg-red-600 text-white px-6 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-red-700 transition-all shadow-lg flex items-center gap-2"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
              Empty {subTab.replace('_', ' ')} Trash
            </button>
          </div>
       </div>

       {subTab === 'invoices' && renderTable(trashedInvoices, 'invoice')}
       {subTab === 'purchase_orders' && renderTable(trashedPOs, 'po')}
       {subTab === 'expenses' && renderTable(trashedExpenses, 'expense')}
    </div>
  );
};

export default RecycleBin;
