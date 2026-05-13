import React, { useState, useEffect } from "react";

const GSTReports = ({ currency, myBusiness, archives, handleEmailGST }) => {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [gstData, setGstData] = useState(null);

  const signImg = <img src={myBusiness?.signature} alt="Sign" className="h-12 w-auto object-contain mx-auto" />;
  const logoImg = <img src={myBusiness?.logo} alt="Logo" className="h-14 w-auto object-contain" />;

  useEffect(() => {
    const fetchDataAndCalculate = async () => {
      try {
        let data = archives;
        if (!data || data.length === 0) {
          const res = await fetch("/api/archives");
          const summaries = await res.json();
          const detailedPromises = summaries.map(arc => fetch(`/api/archives/${arc.id}`).then(r => r.json()));
          data = await Promise.all(detailedPromises);
        }
        calculateGST(data);
      } catch (err) { console.error("GST Fetch Error:", err); }
    };
    fetchDataAndCalculate();
  }, [selectedMonth, selectedYear, archives]);

  const calculateGST = (data) => {
    const filtered = data.filter(arc => {
      const d = new Date(arc.archive_date);
      return d.getMonth() === parseInt(selectedMonth) && d.getFullYear() === parseInt(selectedYear);
    });

    let b2b = { taxable: 0, cgst: 0, sgst: 0, total: 0 };
    let b2c = { taxable: 0, cgst: 0, sgst: 0, total: 0 };

    let allInvoices = [];
    filtered.forEach(arc => {
      try {
        const snap = JSON.parse(arc.snapshot_data);
        if (snap.invoices) allInvoices = [...allInvoices, ...snap.invoices];
      } catch (e) {}
    });

    allInvoices.forEach(inv => {
      let fullData = {};
      try { fullData = typeof inv.data === 'string' ? JSON.parse(inv.data) : (inv.data || {}); } catch(e) {}
      const buyerGstin = inv.customer_gstin || inv.gstin || (fullData.customer && fullData.customer.gstin) || (fullData.customerGstin);
      const isB2B = buyerGstin && buyerGstin.trim().length > 5;
      const total = parseFloat(inv.total_amount || inv.total_value || fullData.totals?.grandTotal || 0);
      const taxableValue = total / 1.18;
      const cgst = (total - taxableValue) / 2;
      const sgst = (total - taxableValue) / 2;

      if (isB2B) {
        b2b.taxable += taxableValue; b2b.cgst += cgst; b2b.sgst += sgst; b2b.total += total;
      } else {
        b2c.taxable += taxableValue; b2c.cgst += cgst; b2c.sgst += sgst; b2c.total += total;
      }
    });

    setGstData({ b2b, b2c, totalTax: b2b.cgst + b2b.sgst + b2c.cgst + b2c.sgst });
  };

  if (!gstData) return null;

  return (
    <div className="bg-white p-0 space-y-8 font-sans print:p-0">
      {/* Controls - Hidden on Print */}
      <div className="flex justify-between items-center bg-slate-50 p-6 border border-slate-200 rounded-xl print:hidden">
        <div className="flex gap-4">
          <select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} className="bg-white border border-slate-300 rounded px-4 py-2 text-sm font-bold uppercase">
            {["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"].map((m, i) => (
              <option key={i} value={i}>{m}</option>
            ))}
          </select>
          <select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)} className="bg-white border border-slate-300 rounded px-4 py-2 text-sm font-bold uppercase">
            {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
        <div className="flex gap-4">
          <button onClick={() => handleEmailGST(gstData)} className="bg-indigo-600 text-white px-8 py-2 rounded font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
            Email to Accountant
          </button>
          <button onClick={() => window.print()} className="bg-slate-900 text-white px-8 py-2 rounded font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition-all">
            Print Professional Report
          </button>
        </div>
      </div>

      {/* Main Report Container - Simple & Flat */}
      <div className="max-w-[210mm] mx-auto print:max-w-none">
        
        {/* Professional Header */}
        <div className="flex justify-between items-start border-b-2 border-slate-900 pb-6 mb-8">
            <div>
                <h1 className="text-3xl font-black uppercase tracking-tight text-slate-900">GST Compliance Report</h1>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">GSTR-1 & 3B Periodic Summary</p>
                <div className="mt-4 flex gap-4 text-xs font-black uppercase">
                    <span className="bg-slate-900 text-white px-3 py-1">Period: {new Date(selectedYear, selectedMonth).toLocaleString('default', { month: 'long', year: 'numeric' })}</span>
                </div>
            </div>
            <div className="text-right">
                <div className="mb-2 flex justify-end">{logoImg}</div>
                <h2 className="text-xl font-black uppercase text-slate-900">{myBusiness?.name}</h2>
                <p className="text-[9px] font-bold text-slate-500 max-w-[250px] ml-auto leading-relaxed">{myBusiness?.address}</p>
                <p className="text-[11px] font-black text-slate-900 mt-2 border-t border-slate-200 pt-2 inline-block">GSTIN: {myBusiness?.gstin}</p>
            </div>
        </div>

        {/* Section 01: Sales Summary Table */}
        <div className="mb-10">
            <h3 className="text-sm font-black uppercase tracking-widest mb-4 flex items-center gap-2 border-l-4 border-slate-900 pl-3">
                01. Outward Supplies (Summary of Sales)
            </h3>
            <table className="w-full border-collapse border-2 border-slate-900 text-xs">
                <thead>
                    <tr className="bg-slate-100 font-black uppercase text-left border-b-2 border-slate-900">
                        <th className="p-3 border-r-2 border-slate-900">Category of Supply</th>
                        <th className="p-3 border-r-2 border-slate-900 text-right">Taxable Value</th>
                        <th className="p-3 border-r-2 border-slate-900 text-right">CGST (9%)</th>
                        <th className="p-3 border-r-2 border-slate-900 text-right">SGST (9%)</th>
                        <th className="p-3 text-right">Total Invoice Value</th>
                    </tr>
                </thead>
                <tbody className="font-bold">
                    <tr className="border-b border-slate-300">
                        <td className="p-3 border-r-2 border-slate-900 uppercase">B2B Supplies (Registered)</td>
                        <td className="p-3 border-r-2 border-slate-900 text-right">{currency} {gstData.b2b.taxable.toFixed(2)}</td>
                        <td className="p-3 border-r-2 border-slate-900 text-right">{currency} {gstData.b2b.cgst.toFixed(2)}</td>
                        <td className="p-3 border-r-2 border-slate-900 text-right">{currency} {gstData.b2b.sgst.toFixed(2)}</td>
                        <td className="p-3 text-right font-black">{currency} {gstData.b2b.total.toFixed(2)}</td>
                    </tr>
                    <tr className="border-b-2 border-slate-900">
                        <td className="p-3 border-r-2 border-slate-900 uppercase">B2C Supplies (Unregistered)</td>
                        <td className="p-3 border-r-2 border-slate-900 text-right">{currency} {gstData.b2c.taxable.toFixed(2)}</td>
                        <td className="p-3 border-r-2 border-slate-900 text-right">{currency} {gstData.b2c.cgst.toFixed(2)}</td>
                        <td className="p-3 border-r-2 border-slate-900 text-right">{currency} {gstData.b2c.sgst.toFixed(2)}</td>
                        <td className="p-3 text-right font-black">{currency} {gstData.b2c.total.toFixed(2)}</td>
                    </tr>
                </tbody>
                <tfoot className="bg-slate-50 font-black">
                    <tr>
                        <td className="p-3 border-r-2 border-slate-900 uppercase">Total Consolidated Sales</td>
                        <td className="p-3 border-r-2 border-slate-900 text-right">{currency} {(gstData.b2b.taxable + gstData.b2c.taxable).toFixed(2)}</td>
                        <td className="p-3 border-r-2 border-slate-900 text-right">{currency} {(gstData.b2b.cgst + gstData.b2c.cgst).toFixed(2)}</td>
                        <td className="p-3 border-r-2 border-slate-900 text-right">{currency} {(gstData.b2b.sgst + gstData.b2c.sgst).toFixed(2)}</td>
                        <td className="p-2 text-right text-sm text-blue-600 bg-blue-50/50">{(gstData.b2b.total + gstData.b2c.total).toFixed(2)}</td>
                    </tr>
                </tfoot>
            </table>
        </div>

        {/* Section 02: Tax Liability Summary */}
        <div className="mb-12">
            <h3 className="text-sm font-black uppercase tracking-widest mb-4 flex items-center gap-2 border-l-4 border-slate-900 pl-3">
                02. Consolidated Tax Liability (GSTR-3B)
            </h3>
            <div className="border-2 border-slate-900 p-6 flex justify-between items-center bg-slate-50/50">
                <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Net Tax Payable (Central + State)</p>
                    <p className="text-3xl font-black tracking-tighter text-slate-900">{currency} {gstData.totalTax.toFixed(2)}</p>
                </div>
                <div className="flex gap-10 text-right">
                    <div>
                        <p className="text-[8px] font-black text-slate-400 uppercase">CGST Payable</p>
                        <p className="text-lg font-black text-slate-900">{currency} {(gstData.b2b.cgst + gstData.b2c.cgst).toFixed(2)}</p>
                    </div>
                    <div>
                        <p className="text-[8px] font-black text-slate-400 uppercase">SGST Payable</p>
                        <p className="text-lg font-black text-slate-900">{currency} {(gstData.b2b.sgst + gstData.b2c.sgst).toFixed(2)}</p>
                    </div>
                </div>
            </div>
        </div>

        {/* Professional Footer & Signature */}
        <div className="pt-8 border-t-2 border-slate-900 flex justify-between items-end">
            <div className="space-y-2">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Self Declaration</p>
                <p className="text-[9px] font-bold text-slate-500 italic max-w-[400px] leading-relaxed">
                    I/We hereby declare that this report represents a true summary of outward taxable supplies for the mentioned period based on internal records.
                </p>
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.3em] mt-6 italic">Computer Generated Audit Report</p>
            </div>
            <div className="text-center min-w-[200px]">
                <p className="text-[10px] font-black uppercase text-slate-900 mb-2">For {myBusiness?.name}</p>
                <div className="mb-2">{signImg}</div>
                <div className="w-full border-t border-slate-900 pt-1">
                    <p className="text-[10px] font-black uppercase tracking-widest">Authorized Signatory</p>
                </div>
            </div>
        </div>

      </div>
    </div>
  );
};

export default GSTReports;
