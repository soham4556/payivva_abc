import React from "react";

const Timeline = ({ savedInvoices, currency, updateStatus }) => {
  const pendingInvoices = savedInvoices.filter(
    (inv) => inv.status === "pending",
  );
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-left-4 duration-500">
      <div className="flex justify-between items-center bg-white p-8 rounded-[2.5rem] border-2 border-slate-100">
        <div>
          <h3 className="text-xl font-black text-slate-900 tracking-tighter">
            Payment Timeline
          </h3>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
            Expected Incoming Payments
          </p>
        </div>
        <div className="text-right">
          <span className="text-[10px] font-black text-orange-500 uppercase tracking-widest block">
            Total Pending
          </span>
          <span className="text-2xl font-black text-slate-900">
            {currency}{" "}
            {pendingInvoices
              .reduce((acc, inv) => acc + parseFloat(inv.grand_total), 0)
              .toLocaleString()}
          </span>
        </div>
      </div>

      <div className="relative pl-10 space-y-8 before:absolute before:left-[11px] before:top-4 before:bottom-4 before:w-[2px] before:bg-slate-100">
        {pendingInvoices.map((inv, idx) => (
          <div key={inv.id} className="relative group">
            <div className="absolute -left-[35px] top-4 w-4 h-4 rounded-full bg-white border-4 border-orange-500 group-hover:scale-125 transition-all"></div>
            <div className="bg-white p-8 rounded-[2rem] border-2 border-slate-50 shadow-sm hover:shadow-xl transition-all hover:-translate-y-1">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <span className="text-[10px] font-black text-slate-400 uppercase">
                    {new Date(inv.issue_date).toLocaleDateString(undefined, {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                  <h4 className="font-black text-slate-900 uppercase tracking-tight">
                    {inv.customer_name}
                  </h4>
                  <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                    Inv: {inv.invoice_number}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-lg font-black text-slate-900">
                    {currency} {inv.grand_total}
                  </span>
                  <button
                    onClick={() => updateStatus(inv.id, "paid")}
                    className="block mt-4 text-[9px] font-black text-green-600 border border-green-200 px-4 py-2 rounded-xl hover:bg-green-600 hover:text-white transition-all uppercase"
                  >
                    Mark as Paid
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
        {pendingInvoices.length === 0 && (
          <div className="p-20 text-center border-4 border-dashed border-slate-100 rounded-[3rem]">
            <p className="text-slate-300 font-black uppercase text-xs tracking-widest">
              No pending payments found.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Timeline;
