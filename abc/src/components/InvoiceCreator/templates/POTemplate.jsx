import React from "react";

const POTemplate = ({ myBusiness, poMeta, poItems, currency }) => {
  const logoImg = <img src={myBusiness.logo} alt="Logo" className="h-14 w-auto object-contain" />;
  
  return (
    <div className="bg-white text-slate-900 font-sans p-10 w-[210mm] min-h-[297mm] mx-auto border border-slate-300 shadow-lg print:border-none print:shadow-none">
      {/* Header */}
      <div className="flex justify-between items-start border-b-2 border-slate-900 pb-6 mb-6" style={{ borderBottomColor: '#0f172a' }}>
        <div className="flex gap-6">
          {logoImg}
          <div>
            <h1 className="text-xl font-black leading-tight uppercase" style={{ color: '#0f172a' }}>{myBusiness.name}</h1>
            <p className="max-w-md mt-2 text-[10px] leading-relaxed font-bold text-slate-600" style={{ color: '#475569' }}>{myBusiness.address}</p>
            <p className="font-black mt-3 text-[11px] bg-slate-900 text-white inline-block px-3 py-1" style={{ backgroundColor: '#0f172a', color: '#ffffff' }}>GSTIN: {myBusiness.gstin} | PAN: {myBusiness.pan}</p>
          </div>
        </div>
        <div className="text-right">
          <h2 className="text-4xl font-black tracking-tighter text-slate-900 mb-2 uppercase" style={{ color: '#0f172a' }}>PURCHASE ORDER</h2>
          <div className="flex flex-col items-end gap-1">
            <span className="bg-orange-600 text-white px-4 py-1 text-[10px] font-black uppercase tracking-widest" style={{ backgroundColor: '#ea580c', color: '#ffffff' }}>Official Procurement</span>
            <span className="text-[10px] font-bold text-slate-400" style={{ color: '#94a3b8' }}>Confidential Document</span>
          </div>
        </div>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-2 mb-6 text-[10px] border-t-2 border-b-2 border-slate-900 py-4 gap-10" style={{ borderTopColor: '#0f172a', borderBottomColor: '#0f172a' }}>
        <div className="space-y-3">
          <p className="font-black uppercase text-slate-400 text-[8px] tracking-[0.3em] border-b pb-2 mb-2" style={{ borderBottomColor: '#e2e8f0', color: '#94a3b8' }}>Vendor / Supplier Details:</p>
          <p className="text-lg font-black uppercase text-slate-800" style={{ color: '#1e293b' }}>{poMeta.vendor}</p>
          <p className="text-slate-500 font-bold leading-relaxed italic" style={{ color: '#64748b' }}>Subject: Procurement of materials for project requirements.</p>
        </div>
        <div className="grid grid-cols-2 gap-x-6 gap-y-4">
          <div className="col-span-2 font-black uppercase text-slate-400 text-[8px] tracking-[0.3em] border-b pb-2 mb-1" style={{ borderBottomColor: '#e2e8f0', color: '#94a3b8' }}>Order Details:</div>
          <div className="font-bold uppercase text-slate-500" style={{ color: '#64748b' }}>PO Number:</div><div className="font-black text-xs">{poMeta.poNumber}</div>
          <div className="font-bold uppercase text-slate-500" style={{ color: '#64748b' }}>Order Date:</div><div className="font-black text-xs">{poMeta.poDate}</div>
          <div className="font-bold uppercase text-slate-500" style={{ color: '#64748b' }}>Currency:</div><div className="font-black text-xs">INR (₹)</div>
          <div className="font-bold uppercase text-slate-500" style={{ color: '#64748b' }}>Terms:</div><div className="font-black text-xs uppercase">Net 30 Days</div>
        </div>
      </div>

      {/* Table */}
      <table className="w-full border-collapse border-2 border-slate-900 text-[10px] mb-6" style={{ borderColor: '#0f172a' }}>
        <thead>
          <tr className="border-b-2 border-slate-900 font-black uppercase tracking-wider bg-slate-50" style={{ borderBottomColor: '#0f172a', backgroundColor: '#f8fafc' }}>
            <th className="border-r-2 border-slate-900 p-2 text-center w-12" style={{ borderRightColor: '#0f172a' }}>#</th>
            <th className="border-r-2 border-slate-900 p-2 text-left" style={{ borderRightColor: '#0f172a' }}>Description / Specification</th>
            <th className="border-r-2 border-slate-900 p-2 text-center w-24" style={{ borderRightColor: '#0f172a' }}>HSN</th>
            <th className="border-r-2 border-slate-900 p-2 text-center w-24" style={{ borderRightColor: '#0f172a' }}>Quantity</th>
            <th className="border-r-2 border-slate-900 p-2 text-right w-32" style={{ borderRightColor: '#0f172a' }}>Unit Price</th>
            <th className="p-2 text-right w-40">Ext. Total</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-900" style={{ borderBottomColor: '#0f172a' }}>
          {poItems.map((item, i) => (
            <tr key={item.id}>
              <td className="border-r-2 border-slate-900 p-2 text-center font-bold" style={{ borderRightColor: '#0f172a' }}>{i + 1}</td>
              <td className="border-r-2 border-slate-900 p-2" style={{ borderRightColor: '#0f172a' }}>
                <p className="font-black uppercase text-xs" style={{ color: '#0f172a' }}>{item.name}</p>
                <p className="text-[8px] text-slate-500 font-bold mt-0.5 uppercase tracking-tighter" style={{ color: '#64748b' }}>{item.make}</p>
              </td>
              <td className="border-r-2 border-slate-900 p-2 text-center" style={{ borderRightColor: '#0f172a' }}>{item.hsn}</td>
              <td className="border-r-2 border-slate-900 p-2 text-center font-black" style={{ borderRightColor: '#0f172a' }}>{item.quantity}</td>
              <td className="border-r-2 border-slate-900 p-2 text-right font-bold" style={{ borderRightColor: '#0f172a' }}>{currency} {item.price.toLocaleString()}</td>
              <td className="p-2 text-right font-black text-xs">
                <div className="flex items-center justify-end gap-1">
                  <span className="text-[8px] text-slate-400" style={{ color: '#94a3b8' }}>{currency}</span>
                  <span>{(item.quantity * item.price).toLocaleString()}</span>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Footer */}
      <div className="flex justify-between items-start mb-6">
        <div className="w-2/3 pr-10 text-[9px]">
          <p className="font-black uppercase text-slate-400 text-[8px] tracking-[0.3em] border-b-2 border-slate-900 pb-1 mb-2">Declaration & Procurement Terms:</p>
          <div className="space-y-1.5 font-bold text-slate-700 leading-relaxed">
            <p>1. Please supply the above materials within the stipulated time frame.</p>
            <p>2. Goods must strictly adhere to the specifications and quality standards mentioned.</p>
            <p>3. Official Invoice must accompany the delivery with the PO Number referenced clearly.</p>
            <p>4. This order is subject to inspection and approval upon arrival at our facility.</p>
          </div>
          
          <div className="mt-8 flex items-center gap-10 border-t-2 border-slate-100 pt-4">
             <div className="text-center">
                <p className="text-[8px] font-black uppercase tracking-widest text-slate-400 mb-2">Authorized Signature</p>
                <div className="h-14 flex items-center justify-center">
                   <img src={myBusiness.signature} alt="Digital Signature" className="h-14 w-auto object-contain mix-blend-multiply" />
                </div>
                <div className="w-40 border-t-2 border-slate-900 mt-1"></div>
                <p className="text-[9px] font-black uppercase mt-1">For {myBusiness.name}</p>
             </div>
          </div>
        </div>
        <div className="w-1/3">
          <div className="border-2 border-slate-900 border-t-0 font-bold text-[10px]">
             <div className="flex justify-between p-2 border-t-2 border-slate-900">
               <span className="uppercase text-slate-500">Taxable Amount</span>
               <span>{currency} {poItems.reduce((acc, i) => acc + (i.quantity * i.price), 0).toLocaleString()}</span>
             </div>
             <div className="flex justify-between p-2 border-t-2 border-slate-900 bg-slate-50 text-base font-black">
               <span className="uppercase">Total</span>
               <span>{currency} {poItems.reduce((acc, i) => acc + (i.quantity * i.price), 0).toLocaleString()}</span>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default POTemplate;
