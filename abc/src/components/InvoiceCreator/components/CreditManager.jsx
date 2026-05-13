import React, { useState, useEffect } from "react";
import TaxInvoiceTemplate from "../templates/TaxInvoiceTemplate";
import POTemplate from "../templates/POTemplate";

const CreditManager = ({ currency, fetchInvoices, myBusiness, handleEmail, loadInvoice, handleDownloadPDF }) => {
  const [credits, setCredits] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCredits = async () => {
    setIsLoading(true);
    try {
      // Fetch active invoices with pending payment
      const response = await fetch("/api/invoices");
      const allInvoices = await response.json();
      
      const pendingInvoices = allInvoices
        .filter(inv => {
          const status = String(inv.payment_status).toLowerCase();
          const amount = parseFloat(inv.pending_amount) || 0;
          return status === "pending" || amount > 0;
        })
        .map(inv => ({
          ...inv, // Keep full original invoice object
          id: inv.id,
          date: inv.issue_date,
          customerName: inv.customer_name,
          total: inv.grand_total,
          pending: inv.pending_amount,
          invoiceNumber: inv.invoice_number
        }));
      
      setCredits(pendingInvoices);
    } catch (err) {
      console.error("Error fetching credits:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCredits();
  }, []);


  const handleMarkAsPaid = async (id) => {
    if (!window.confirm("✅ Mark this Credit as FULLY PAID?")) return;
    try {
        const res = await fetch(`/api/invoices/${id}/payment-status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ payment_status: 'paid', pending_amount: 0 })
        });
        if (res.ok) {
            alert("Payment Received! Balance Updated.");
            fetchCredits();
            if (fetchInvoices) fetchInvoices();
        }
    } catch (e) { console.error(e); }
  };

  const sendReminder = (credit) => {
    const text = `Hi ${credit.customerName}, this is a friendly reminder regarding your pending payment of ${currency}${credit.pending} for Invoice #${credit.invoiceNumber}. Please settle at your earliest convenience. Thank you!`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const totalOutstanding = credits.reduce((acc, curr) => acc + parseFloat(curr.pending), 0);

  if (isLoading) return <div className="p-20 text-center animate-pulse font-black uppercase text-slate-400">Loading Credit Ledger...</div>;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-700 pb-20">
      {/* Header Stat */}
      <div className="bg-slate-900 p-10 rounded-[3rem] shadow-2xl flex justify-between items-center border-4 border-slate-800 relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-[10px] font-black text-blue-400 uppercase tracking-[0.4em] mb-2">Market Credit Exposure</h2>
          <div className="flex items-center gap-6">
            <p className="text-5xl font-black text-white tracking-tighter italic">
                {currency} {totalOutstanding.toLocaleString()}
            </p>
            <button 
                onClick={fetchCredits}
                className="bg-white/10 hover:bg-white/20 p-3 rounded-full transition-all group"
                title="Refresh Ledger"
            >
                <svg className={`w-5 h-5 text-blue-400 ${isLoading ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                </svg>
            </button>
          </div>
          <p className="text-slate-400 text-[10px] font-bold mt-4 uppercase tracking-widest">Total Outstanding Balance from {credits.length} Customers</p>
        </div>
        <div className="absolute right-[-5%] top-[-20%] text-[200px] font-black text-white/[0.03] -rotate-12 pointer-events-none">
          CREDIT
        </div>
      </div>

      {/* List */}
      <div className="grid grid-cols-1 gap-4">
        {credits.length === 0 ? (
          <div className="bg-white p-20 rounded-[3rem] border-4 border-dashed border-slate-100 text-center">
            <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Great! No pending payments in the market.</p>
          </div>
        ) : (
          credits.map(credit => (
            <div key={credit.id} className="bg-white p-8 rounded-[2.5rem] border-2 border-slate-50 shadow-xl flex flex-wrap gap-8 items-center justify-between hover:border-blue-100 transition-all group">
              <div className="flex gap-6 items-center">
                <div className="w-14 h-14 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center font-black text-xl shadow-sm">
                  {credit.customerName.charAt(0)}
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 uppercase leading-none mb-1">{credit.customerName}</h3>
                  <div className="flex gap-4 items-center">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Inv #{credit.invoiceNumber}</span>
                    <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
                    <span className="text-[10px] font-bold text-slate-400 italic">{new Date(credit.date).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-12 items-center">
                <div className="text-right">
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Bill</p>
                    <p className="text-sm font-black text-slate-400">{currency} {credit.total}</p>
                </div>
                <div className="bg-red-50 px-6 py-3 rounded-2xl border border-red-100">
                    <p className="text-[8px] font-black text-red-400 uppercase tracking-widest mb-1 italic underline">Pending Balance</p>
                    <p className="text-2xl font-black text-red-600 tracking-tighter">{currency} {credit.pending}</p>
                </div>
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={() => {
                    loadInvoice(credit);
                    setTimeout(handleDownloadPDF, 500);
                  }}
                  className="bg-blue-600 text-white p-3 rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
                  title="View/Print Original Invoice"
                >
                   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2-2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
                </button>
                <button 
                  onClick={() => sendReminder(credit)}
                  className="bg-green-600 text-white px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-green-700 transition-all flex items-center gap-2 shadow-lg shadow-green-100"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.025 3.12l-1.02 3.71 3.734-1.001c.851.531 1.832.83 2.829.831h.001c3.182 0 5.767-2.587 5.768-5.766 0-3.18-2.585-5.764-5.769-5.764zm3.377 8.272c-.14.393-.812.756-1.121.802-.303.046-.689.066-1.13-.086-.279-.096-.63-.231-1.085-.429-1.936-.843-3.195-2.825-3.292-2.953-.097-.128-.79-.979-.812-1.94-.022-.961.464-1.442.63-1.666.166-.224.364-.282.485-.282.121 0 .243.001.348.005.111.005.259-.042.406.312.146.353.504 1.228.549 1.317.045.089.075.193.015.312-.06.118-.112.21-.218.329-.105.118-.218.261-.311.352-.105.105-.214.218-.093.428.121.21.536.883 1.144 1.425.782.698 1.441.916 1.651 1.021.21.105.334.089.458-.046.124-.134.536-.612.679-.824.143-.21.286-.178.485-.105.199.074 1.258.594 1.474.702.215.108.358.163.411.252.053.089.053.518-.087.91z"/></svg>
                  Remind
                </button>
                <button 
                  onClick={() => handleEmail(credit)}
                  className="bg-green-600 text-white px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-green-700 transition-all flex items-center gap-2 shadow-lg shadow-green-100"
                >
                   <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                   Email
                </button>
                <button 
                  onClick={() => handleMarkAsPaid(credit.id)}
                  className="bg-slate-900 text-white px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg"
                >
                  Mark as Paid
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default CreditManager;
