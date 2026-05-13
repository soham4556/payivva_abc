import React from "react";

const POTemplate = ({ myBusiness, poMeta, poItems, currency }) => {
  const logoImg = <img src={myBusiness.logo} alt="Logo" className="h-14 w-auto object-contain" />;
  
  return (
    <div style={{ backgroundColor: '#ffffff', color: '#0f172a' }} className="font-sans p-10 w-[210mm] min-h-[297mm] mx-auto border border-[#cbd5e1] shadow-lg print:border-none print:shadow-none">
      {/* Header */}
      <div style={{ borderBottom: '2px solid #0f172a' }} className="flex justify-between items-start pb-6 mb-6">
        <div className="flex gap-6">
          {logoImg}
          <div>
            <h1 className="text-xl font-black leading-tight uppercase" style={{ color: '#0f172a' }}>{myBusiness.name}</h1>
            <p className="max-w-md mt-2 text-[10px] leading-relaxed font-bold" style={{ color: '#475569' }}>{myBusiness.address}</p>
            <p className="font-black mt-3 text-[11px] inline-block px-3 py-1" style={{ backgroundColor: '#0f172a', color: '#ffffff' }}>GSTIN: {myBusiness.gstin} | PAN: {myBusiness.pan}</p>
          </div>
        </div>
        <div className="text-right">
          <h2 className="text-4xl font-black tracking-tighter mb-2 uppercase" style={{ color: '#0f172a' }}>PURCHASE ORDER</h2>
          <div className="flex flex-col items-end gap-1">
            <span style={{ backgroundColor: '#ea580c', color: '#ffffff' }} className="px-4 py-1 text-[10px] font-black uppercase tracking-widest">Official Procurement</span>
            <span style={{ color: '#94a3b8' }} className="text-[10px] font-bold">Confidential Document</span>
          </div>
        </div>
      </div>

      {/* Info Grid */}
      <div style={{ borderTop: '2px solid #0f172a', borderBottom: '2px solid #0f172a' }} className="grid grid-cols-2 mb-6 text-[10px] py-4 gap-10">
        <div className="space-y-3">
          <p style={{ borderBottomColor: '#e2e8f0', color: '#94a3b8' }} className="font-black uppercase text-[8px] tracking-[0.3em] border-b pb-2 mb-2">Vendor / Supplier Details:</p>
          <p style={{ color: '#1e293b' }} className="text-lg font-black uppercase">{poMeta.vendor}</p>
          <p style={{ color: '#64748b' }} className="font-bold leading-relaxed italic">Subject: Procurement of materials for project requirements.</p>
        </div>
        <div className="grid grid-cols-2 gap-x-6 gap-y-4">
          <div style={{ borderBottomColor: '#e2e8f0', color: '#94a3b8' }} className="col-span-2 font-black uppercase text-[8px] tracking-[0.3em] border-b pb-2 mb-1">Order Details:</div>
          <div style={{ color: '#64748b' }} className="font-bold uppercase">PO Number:</div><div className="font-black text-xs">{poMeta.poNumber}</div>
          <div style={{ color: '#64748b' }} className="font-bold uppercase">Order Date:</div><div className="font-black text-xs">{poMeta.poDate}</div>
          <div style={{ color: '#64748b' }} className="font-bold uppercase">Currency:</div><div className="font-black text-xs">INR (₹)</div>
          <div style={{ color: '#64748b' }} className="font-bold uppercase">Terms:</div><div className="font-black text-xs uppercase">Net 30 Days</div>
        </div>
      </div>

      {/* Table */}
      <table style={{ borderCollapse: 'collapse', border: '2px solid #0f172a' }} className="w-full text-[10px] mb-6">
        <thead>
          <tr style={{ borderBottom: '2px solid #0f172a', backgroundColor: '#f8fafc' }} className="font-black uppercase tracking-wider">
            <th style={{ borderRight: '2px solid #0f172a' }} className="p-2 text-center w-12">#</th>
            <th style={{ borderRight: '2px solid #0f172a' }} className="p-2 text-left">Description / Specification</th>
            <th style={{ borderRight: '2px solid #0f172a' }} className="p-2 text-center w-24">HSN</th>
            <th style={{ borderRight: '2px solid #0f172a' }} className="p-2 text-center w-24">Quantity</th>
            <th style={{ borderRight: '2px solid #0f172a' }} className="p-2 text-right w-32">Unit Price</th>
            <th className="p-2 text-right w-40">Ext. Total</th>
          </tr>
        </thead>
        <tbody style={{ borderBottom: '2px solid #0f172a' }} className="divide-y divide-[#0f172a]">
          {poItems.map((item, i) => (
            <tr key={item.id}>
              <td style={{ borderRight: '2px solid #0f172a' }} className="p-2 text-center font-bold">{i + 1}</td>
              <td style={{ borderRight: '2px solid #0f172a' }} className="p-2">
                <p style={{ color: '#0f172a' }} className="font-black uppercase text-xs">{item.name}</p>
                <p style={{ color: '#64748b' }} className="text-[8px] font-bold mt-0.5 uppercase tracking-tighter">{item.make}</p>
              </td>
              <td style={{ borderRight: '2px solid #0f172a' }} className="p-2 text-center">{item.hsn}</td>
              <td style={{ borderRight: '2px solid #0f172a' }} className="p-2 text-center font-black">{item.quantity}</td>
              <td style={{ borderRight: '2px solid #0f172a' }} className="p-2 text-right font-bold">{currency} {item.price.toLocaleString()}</td>
              <td className="p-2 text-right font-black text-xs">
                <div className="flex items-center justify-end gap-1">
                  <span style={{ color: '#94a3b8' }} className="text-[8px]">{currency}</span>
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
          <p style={{ borderBottom: '2px solid #0f172a', color: '#94a3b8' }} className="font-black uppercase text-[8px] tracking-[0.3em] pb-1 mb-2">Declaration & Procurement Terms:</p>
          <div style={{ color: '#334155' }} className="space-y-1.5 font-bold leading-relaxed">
            <p>1. Please supply the above materials within the stipulated time frame.</p>
            <p>2. Goods must strictly adhere to the specifications and quality standards mentioned.</p>
            <p>3. Official Invoice must accompany the delivery with the PO Number referenced clearly.</p>
            <p>4. This order is subject to inspection and approval upon arrival at our facility.</p>
          </div>
          
          <div style={{ borderTop: '2px solid #f1f5f9' }} className="mt-8 flex items-center gap-10 pt-4">
             <div className="text-center">
                <p style={{ color: '#94a3b8' }} className="text-[8px] font-black uppercase tracking-widest mb-2">Authorized Signature</p>
                <div className="h-14 flex items-center justify-center">
                   <img src={myBusiness.signature} alt="Digital Signature" className="h-14 w-auto object-contain" />
                </div>
                <div style={{ borderTop: '2px solid #0f172a' }} className="w-40 mt-1"></div>
                <p className="text-[9px] font-black uppercase mt-1">For {myBusiness.name}</p>
             </div>
          </div>
        </div>
        <div className="w-1/3">
          <div style={{ border: '2px solid #0f172a', borderTop: '0' }} className="font-bold text-[10px]">
             <div style={{ borderTop: '2px solid #0f172a' }} className="flex justify-between p-2">
               <span style={{ color: '#64748b' }} className="uppercase">Taxable Amount</span>
               <span>{currency} {poItems.reduce((acc, i) => acc + (i.quantity * i.price), 0).toLocaleString()}</span>
             </div>
             <div style={{ borderTop: '2px solid #0f172a', backgroundColor: '#f8fafc' }} className="flex justify-between p-2 text-base font-black">
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
