import React, { useState, useMemo } from "react";

const Expenses = ({ expenses, currency, fetchExpenses, bulkClearExpenses }) => {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    expense_date: new Date().toISOString().split('T')[0],
    category: "Operations",
    vendor: "",
    description: "",
    amount: "",
    payment_method: "Bank Transfer"
  });

  const categories = [
    "Operations", "Marketing", "Salaries", "Rent", "Utilities", 
    "Travel", "Maintenance", "Software/SAAS", "Taxes", "Misc"
  ];

  const paymentMethods = ["Cash", "Bank Transfer", "UPI", "Credit Card", "Cheque"];

  const stats = useMemo(() => {
    const total = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
    const thisMonth = expenses
      .filter(e => new Date(e.expense_date).getMonth() === new Date().getMonth())
      .reduce((sum, e) => sum + Number(e.amount), 0);
    return { total, thisMonth };
  }, [expenses]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      if (res.ok) {
        alert("✅ Expense added successfully!");
        setForm({
          expense_date: new Date().toISOString().split('T')[0],
          category: "Operations",
          vendor: "",
          description: "",
          amount: "",
          payment_method: "Bank Transfer"
        });
        setShowForm(false);
        fetchExpenses();
      }
    } catch (err) { console.error(err); }
  };

  const deleteExpense = async (id) => {
    if (!window.confirm("♻️ Move this expense to Recycle Bin?")) return;
    try {
      const res = await fetch(`/api/expenses/${id}/status`, { 
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'trashed' })
      });
      if (res.ok) fetchExpenses();
    } catch (err) { console.error(err); }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-8 rounded-[2.5rem] border-2 border-slate-50 shadow-xl flex flex-col gap-2">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Monthly Burn</span>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-black text-slate-900 tracking-tighter">{currency} {stats.thisMonth.toLocaleString()}</span>
            <span className="text-[10px] font-bold text-green-500 uppercase">This Month</span>
          </div>
        </div>
        <div className="bg-slate-900 p-8 rounded-[2.5rem] shadow-2xl flex flex-col gap-2">
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Life-time Expenses</span>
          <span className="text-4xl font-black text-white tracking-tighter">{currency} {stats.total.toLocaleString()}</span>
        </div>
        <div className="bg-blue-600 p-8 rounded-[2.5rem] shadow-xl flex flex-col justify-center items-center gap-4 group cursor-pointer hover:bg-blue-500 transition-all" onClick={() => setShowForm(true)}>
          <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center text-white group-hover:scale-110 transition-transform">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/></svg>
          </div>
          <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Add New Expense</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-[3rem] border-2 border-slate-50 shadow-2xl overflow-hidden">
        <div className="p-10 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h3 className="font-black uppercase text-sm tracking-widest text-slate-800">Expense Ledger</h3>
          <button 
             onClick={bulkClearExpenses}
             className="bg-red-50 text-red-500 px-6 py-3 rounded-2xl text-[9px] font-black uppercase tracking-widest border border-red-100 hover:bg-red-500 hover:text-white transition-all flex items-center gap-2"
          >
             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
             Clear History
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900 text-white">
                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest">Date</th>
                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest">Category</th>
                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest">Vendor / Details</th>
                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest">Method</th>
                <th className="px-10 py-6 text-right text-[10px] font-black uppercase tracking-widest">Amount</th>
                <th className="px-10 py-6 w-20"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {expenses.filter(e => e.status !== 'trashed').length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-20 text-center">
                    <div className="flex flex-col items-center gap-4 opacity-20">
                      <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
                      <span className="font-black uppercase tracking-widest text-sm">No expenses logged yet</span>
                    </div>
                  </td>
                </tr>
              ) : (
                expenses.filter(e => e.status !== 'trashed').map(e => (
                  <tr key={e.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-10 py-6">
                      <span className="text-xs font-black text-slate-400">{new Date(e.expense_date).toLocaleDateString()}</span>
                    </td>
                    <td className="px-10 py-6">
                      <span className="bg-blue-50 text-blue-600 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border border-blue-100">{e.category}</span>
                    </td>
                    <td className="px-10 py-6">
                      <div className="flex flex-col">
                        <span className="text-sm font-black text-slate-800 uppercase tracking-tight">{e.vendor || "N/A"}</span>
                        <span className="text-[10px] font-bold text-slate-400 italic">{e.description}</span>
                      </div>
                    </td>
                    <td className="px-10 py-6">
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{e.payment_method}</span>
                    </td>
                    <td className="px-10 py-6 text-right">
                      <span className="text-sm font-black text-slate-900">{currency} {Number(e.amount).toLocaleString()}</span>
                    </td>
                    <td className="px-10 py-6 text-center">
                      <button onClick={() => deleteExpense(e.id)} className="w-8 h-8 rounded-lg bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all opacity-0 group-hover:opacity-100"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg></button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[9999] flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-2xl rounded-[3.5rem] shadow-2xl border-4 border-white overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-10 bg-slate-900 text-white flex justify-between items-center">
              <div>
                <h3 className="text-2xl font-black uppercase tracking-tighter">Log New Expense</h3>
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.3em] mt-1">Operational Outflow Record</p>
              </div>
              <button onClick={() => setShowForm(false)} className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"/></svg></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-12 grid grid-cols-2 gap-8 bg-gradient-to-br from-white to-slate-50/50">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Expense Date</label>
                <input type="date" required className="w-full bg-slate-100 p-4 rounded-2xl font-black text-xs outline-none focus:ring-4 focus:ring-blue-100 transition-all" value={form.expense_date} onChange={e => setForm({...form, expense_date: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Category</label>
                <select className="w-full bg-slate-100 p-4 rounded-2xl font-black text-xs outline-none focus:ring-4 focus:ring-blue-100 transition-all" value={form.category} onChange={e => setForm({...form, category: e.target.value})}>
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="space-y-2 col-span-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Payee / Vendor Name</label>
                <input type="text" placeholder="E.G. RELIANCE ENERGY, OFFICE RENT..." className="w-full bg-slate-100 p-4 rounded-2xl font-black text-xs outline-none focus:ring-4 focus:ring-blue-100 transition-all uppercase" value={form.vendor} onChange={e => setForm({...form, vendor: e.target.value})} />
              </div>
              <div className="space-y-2 col-span-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Description (Optional)</label>
                <textarea rows="2" className="w-full bg-slate-100 p-4 rounded-2xl font-black text-xs outline-none focus:ring-4 focus:ring-blue-100 transition-all" value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Amount ({currency})</label>
                <input type="number" required step="0.01" className="w-full bg-slate-100 p-4 rounded-2xl font-black text-xs outline-none focus:ring-4 focus:ring-blue-100 transition-all" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Payment Method</label>
                <select className="w-full bg-slate-100 p-4 rounded-2xl font-black text-xs outline-none focus:ring-4 focus:ring-blue-100 transition-all" value={form.payment_method} onChange={e => setForm({...form, payment_method: e.target.value})}>
                  {paymentMethods.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div className="col-span-2 pt-6">
                <button type="submit" className="w-full bg-slate-900 text-white font-black uppercase tracking-[0.3em] py-6 rounded-[2rem] shadow-2xl hover:scale-[1.02] transition-all">Record Expense</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Expenses;
