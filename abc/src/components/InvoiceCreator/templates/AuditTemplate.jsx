import React from "react";

const AuditTemplate = ({ myBusiness, reportData, timeframe, currency }) => {
  return (
    <div className="bg-white text-slate-900 font-sans p-10 w-[210mm] mx-auto min-h-[290mm] border border-slate-200">
      {/* Header */}
      <div className="flex justify-between items-center border-b-4 border-slate-900 pb-6 mb-8">
        <div className="flex gap-8 items-center">
          {myBusiness.logo && <img src={myBusiness.logo} alt="Logo" className="h-20 w-auto object-contain" />}
          <div>
            <h1 className="text-2xl font-black uppercase leading-tight">{myBusiness.name}</h1>
            <p className="text-[10px] max-w-md mt-1 font-bold text-slate-500 uppercase">{myBusiness.address}</p>
            <p className="text-[11px] font-black mt-2">GSTIN: {myBusiness.gstin} | PAN: {myBusiness.pan}</p>
          </div>
        </div>
        <div className="text-right">
           <h2 className="text-3xl font-black tracking-tighter uppercase text-slate-900">Financial Audit</h2>
           <span className="bg-slate-900 text-white px-4 py-1 text-[10px] font-black uppercase tracking-widest">{timeframe} Report</span>
        </div>
      </div>

      <div className="mb-10 p-6 bg-slate-50 border-2 border-slate-100 rounded-3xl">
         <div className="flex justify-between items-center">
            <div>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Document Title</p>
               <h3 className="text-xl font-black uppercase tracking-tight">Consolidated Business Audit Log</h3>
            </div>
            <div className="text-right">
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Generation Date</p>
               <h3 className="text-xl font-black uppercase tracking-tight">{new Date().toLocaleDateString()}</h3>
            </div>
         </div>
      </div>

      {/* Reports Table */}
      <div className="space-y-12">
        {reportData.map((report, idx) => (
          <div key={idx} className="page-break-after-auto">
            <div className="bg-slate-900 text-white p-4 text-center font-black uppercase tracking-[0.3em] text-xs mb-6">
               Analysis Period: {report.key}
            </div>

            <div className="grid grid-cols-4 gap-4 mb-8">
               <div className="p-4 border-2 border-slate-100 rounded-2xl text-center">
                  <p className="text-[8px] font-black text-slate-400 uppercase mb-1">Revenue</p>
                  <p className="text-sm font-black">{currency}{report.sales.toLocaleString()}</p>
               </div>
               <div className="p-4 border-2 border-slate-100 rounded-2xl text-center">
                  <p className="text-[8px] font-black text-slate-400 uppercase mb-1">Purchases</p>
                  <p className="text-sm font-black">{currency}{report.purchase.toLocaleString()}</p>
               </div>
               <div className="p-4 border-2 border-slate-100 rounded-2xl text-center">
                  <p className="text-[8px] font-black text-slate-400 uppercase mb-1">Expenses</p>
                  <p className="text-sm font-black">{currency}{report.expense.toLocaleString()}</p>
               </div>
               <div className="p-4 bg-blue-50 border-2 border-blue-100 rounded-2xl text-center">
                  <p className="text-[8px] font-black text-blue-600 uppercase mb-1">Net Profit</p>
                  <p className="text-sm font-black text-blue-900">{currency}{(report.sales - report.purchase - report.expense).toLocaleString()}</p>
               </div>
            </div>

            <div className="grid grid-cols-2 gap-8 mb-10">
               <div>
                  <h5 className="text-[10px] font-black uppercase tracking-widest border-b-2 border-slate-900 pb-2 mb-4">Top 5 Products (Sales)</h5>
                  <table className="w-full text-[10px]">
                     <tbody className="divide-y divide-slate-100">
                        {Object.entries(report.topProductsSold).sort((a,b)=>b[1]-a[1]).slice(0,5).map(([name, qty], i) => (
                          <tr key={i}>
                             <td className="py-2 font-bold uppercase">{name}</td>
                             <td className="py-2 text-right font-black">{qty} QTY</td>
                          </tr>
                        ))}
                     </tbody>
                  </table>
               </div>
               <div>
                  <h5 className="text-[10px] font-black uppercase tracking-widest border-b-2 border-slate-900 pb-2 mb-4">Top 5 Customers</h5>
                  <table className="w-full text-[10px]">
                     <tbody className="divide-y divide-slate-100">
                        {Object.entries(report.topCustomers).sort((a,b)=>b[1]-a[1]).slice(0,5).map(([name, val], i) => (
                          <tr key={i}>
                             <td className="py-2 font-bold uppercase">{name}</td>
                             <td className="py-2 text-right font-black">{currency}{val.toLocaleString()}</td>
                          </tr>
                        ))}
                     </tbody>
                  </table>
               </div>
            </div>
            
            <div className="h-px bg-slate-100 w-full mb-10"></div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="mt-auto pt-10 border-t-2 border-slate-900">
         <div className="flex justify-between items-end">
            <div className="text-[10px] font-bold text-slate-400 uppercase">
               <p>Certified Business Audit Document</p>
               <p>Generated by Payivva ERP Intelligence</p>
            </div>
            <div className="text-center">
               <div className="w-48 border-b-2 border-slate-900 mb-2"></div>
               <p className="text-[10px] font-black uppercase">Authorized Signatory</p>
            </div>
         </div>
      </div>
    </div>
  );
};

export default AuditTemplate;
