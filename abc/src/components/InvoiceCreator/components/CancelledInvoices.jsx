import React from "react";

const CancelledInvoices = ({ savedInvoices, currency, fetchInvoices }) => {
  const cancelledInvoices = savedInvoices.filter(
    (inv) => inv.status === "cancelled" || inv.status === "trashed",
  );

  const handleClearAll = async () => {
    if (
      !window.confirm(
        "⚠️ CRITICAL: Permanently delete ALL cancelled orders? This action cannot be undone!",
      )
    )
      return;
    try {
      const res = await fetch("/api/recycle-bin/clear/invoices", {
        method: "POST",
      });
      if (res.ok) {
        alert("🗑️ All Cancelled Orders Deleted Permanently.");
        fetchInvoices();
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="bg-white rounded-[3rem] border-2 border-slate-100 overflow-hidden shadow-2xl animate-in fade-in slide-in-from-top-4 duration-500">
      <div className="p-10 border-b border-slate-100 bg-red-50/50 flex justify-between items-center">
        <div>
          <h3 className="font-black uppercase text-sm tracking-widest text-red-700">
            Cancelled Orders (Stock Restored)
          </h3>
          <p className="text-[10px] font-bold text-red-400 uppercase mt-1">
            These invoices were removed from active sales and stock was added
            back.
          </p>
        </div>
        {cancelledInvoices.length > 0 && (
          <button
            onClick={handleClearAll}
            className="bg-red-600 text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl hover:bg-red-700 transition-all"
          >
            Clear All Permanently
          </button>
        )}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="text-[10px] font-black uppercase text-slate-400 bg-slate-50 border-b border-slate-100">
              <th className="px-8 py-6">Invoice #</th>
              <th className="px-8 py-6">Date</th>
              <th className="px-8 py-6">Client</th>
              <th className="px-8 py-6 text-right">Total</th>
              <th className="px-8 py-6">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {cancelledInvoices.map((inv) => (
              <tr key={inv.id} className="bg-slate-50/30 opacity-70">
                <td className="px-8 py-6 font-black text-xs uppercase line-through text-slate-400">
                  {inv.invoice_number}
                </td>
                <td className="px-8 py-6 text-xs font-bold text-slate-400">
                  {new Date(inv.issue_date).toLocaleDateString()}
                </td>
                <td className="px-8 py-6 text-xs font-black uppercase text-slate-400">
                  {inv.customer_name}
                </td>
                <td className="px-8 py-6 text-right font-black text-xs text-slate-400">
                  {currency} {inv.grand_total}
                </td>
                <td className="px-8 py-6">
                  <span className="px-4 py-2 rounded-xl text-[9px] font-black uppercase bg-red-100 text-red-700">
                    Cancelled
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {cancelledInvoices.length === 0 && (
        <div className="p-20 text-center">
          <p className="text-slate-300 font-black uppercase text-xs tracking-widest">
            No cancelled orders found.
          </p>
        </div>
      )}
    </div>
  );
};

export default CancelledInvoices;
