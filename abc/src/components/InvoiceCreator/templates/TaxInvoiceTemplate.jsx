import React from "react";

const TaxInvoiceTemplate = ({ 
  myBusiness, 
  customer, 
  invoiceMeta, 
  docType, 
  getDocTypeDisplayName, 
  items, 
  totals, 
  taxType, 
  currency, 
  numberToWords, 
  terms, 
  showAnnexure, 
  annexures 
}) => {
  const logoImg = <img src={myBusiness.logo} alt="Logo" className="h-16 w-auto object-contain" />;
  const signImg = <img src={myBusiness.signature} alt="Sign" className="h-16 w-auto object-contain mx-auto" />;

  return (
    <div style={{ backgroundColor: '#ffffff', color: '#0f172a' }} className="font-sans print:p-0 w-[210mm] min-h-[280mm] mx-auto p-8 border border-[#cbd5e1] print:border-none shadow-lg print:shadow-none overflow-hidden text-black">
      {/* Header */}
      <div style={{ borderBottom: '2px solid #0f172a' }} className="flex justify-between items-start pb-2 mb-4">
        <div className="flex gap-6">
          {logoImg}
          <div>
            <h1 className="text-xl font-black leading-tight uppercase">{myBusiness.name}</h1>
            <p className="max-w-md mt-2 text-[10px] leading-relaxed">{myBusiness.address}</p>
            <p className="font-bold mt-2 text-[11px]">GSTIN: {myBusiness.gstin} | PAN: {myBusiness.pan}</p>
          </div>
        </div>
        <div className="text-right">
          <h2 style={{ color: '#0f172a' }} className="text-3xl font-black tracking-tighter mb-2 uppercase">{getDocTypeDisplayName()}</h2>
          <span style={{ borderColor: '#0f172a' }} className="border-2 px-3 py-1 text-[10px] font-black uppercase">Original for Recipient</span>
        </div>
      </div>

      {/* Info Grid */}
      <div style={{ borderTop: '2px solid #0f172a', borderBottom: '2px solid #0f172a' }} className="grid grid-cols-2 mb-4 text-[10px] py-2">
        <div className="p-0 space-y-2">
          <p className="font-black uppercase text-slate-400 text-[8px] tracking-widest border-b pb-1 mb-2">Details of Buyer | Billed To:</p>
          <p className="text-sm font-black uppercase">{customer.name}</p>
          <p className="leading-relaxed">{customer.address}</p>
          {customer.gstin && <p className="font-bold text-[11px] mt-2">GSTIN: {customer.gstin}</p>}
        </div>
        <div className="p-0 pl-10 grid grid-cols-2 gap-x-4 gap-y-3">
          <div className="col-span-2 font-black uppercase text-slate-400 text-[8px] tracking-widest border-b pb-1 mb-1">Invoice Details:</div>
          <div className="font-bold">Invoice No:</div><div className="font-black">{invoiceMeta.invoiceNumber}</div>
          <div className="font-bold">Dated:</div><div className="font-black">{invoiceMeta.issueDate}</div>
          {docType !== "quotation" && <><div className="font-bold">PO No:</div><div className="font-black">{invoiceMeta.poNumber}</div></>}
          <div className="font-bold">Transport:</div><div className="font-black">{invoiceMeta.transport}</div>
          <div className="font-bold">Vehicle No:</div><div className="font-black">{invoiceMeta.vehicleNumber}</div>
          {invoiceMeta.lrNumber && <><div className="font-bold">LR No:</div><div className="font-black">{invoiceMeta.lrNumber}</div></>}
          {docType === "quotation" && <><div className="font-bold">Validity:</div><div className="font-black text-blue-600">{invoiceMeta.validity}</div></>}
        </div>
      </div>

      {customer.site && (
        <div className="mb-4 py-2 text-[10px] border-b border-slate-200">
           <p className="font-black uppercase text-slate-400 text-[8px] tracking-widest mb-2">Consignee | Site Address:</p>
           <p className="font-bold italic text-[11px]">{customer.site}</p>
        </div>
      )}

      {/* Table */}
      <table style={{ borderCollapse: 'collapse', border: '2px solid #0f172a' }} className="w-full text-[9px] mb-4">
        <thead>
          <tr style={{ borderBottom: '2px solid #0f172a' }} className="font-black uppercase tracking-wider">
            <th style={{ borderRight: '2px solid #0f172a' }} className="p-2 text-center w-12">Sr.</th>
            <th style={{ borderRight: '2px solid #0f172a' }} className="p-2 text-left">Description of Goods</th>
            <th style={{ borderRight: '2px solid #0f172a' }} className="p-2 text-center w-24">HSN/SAC</th>
            <th style={{ borderRight: '2px solid #0f172a' }} className="p-2 text-center w-16">Qty</th>
            {docType !== "delivery_challan" && (
              <>
                <th style={{ borderRight: '2px solid #0f172a' }} className="p-2 text-center w-16">Tax%</th>
                <th style={{ borderRight: '2px solid #0f172a' }} className="p-2 text-right w-28">Price</th>
                <th className="p-2 text-right w-32">Total</th>
              </>
            )}
          </tr>
        </thead>
        <tbody style={{ borderBottom: '2px solid #0f172a' }} className="divide-y divide-[#cbd5e1]">
          {items.map((item, i) => (
            <tr key={item.id}>
              <td style={{ borderRight: '2px solid #0f172a' }} className="p-1 text-center font-bold">{i + 1}</td>
              <td style={{ borderRight: '2px solid #0f172a' }} className="p-1 font-black uppercase leading-tight">{item.name}</td>
              <td style={{ borderRight: '2px solid #0f172a' }} className="p-1 text-center font-bold">{item.hsn}</td>
              <td style={{ borderRight: '2px solid #0f172a' }} className="p-1 text-center font-bold">{item.quantity}</td>
              {docType !== "delivery_challan" && (
                <>
                  <td style={{ borderRight: '2px solid #0f172a' }} className="p-1 text-center font-bold">{item.taxRate}%</td>
                  <td style={{ borderRight: '2px solid #0f172a' }} className="p-1 text-right font-bold">{item.price.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                  <td className="p-1 text-right font-black">{(item.quantity * item.price).toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                </>
              )}
            </tr>
          ))}
        </tbody>
        <tfoot style={{ borderTop: '2px solid #0f172a', backgroundColor: '#f8fafc' }} className="font-black uppercase text-[9px]">
          <tr>
            <td style={{ borderRight: '2px solid #0f172a' }} colSpan="3" className="p-2 text-right">
              {docType === "delivery_challan" ? "Total Quantity" : "Total Before Tax"}
            </td>
            <td style={{ borderRight: '2px solid #0f172a' }} className="p-2 text-center">{totals.totalQty}</td>
            {docType !== "delivery_challan" && (
              <>
                <td style={{ borderRight: '2px solid #0f172a' }}></td>
                <td style={{ borderRight: '2px solid #0f172a' }}></td>
                <td className="p-2 text-right text-[11px]">{totals.subtotal}</td>
              </>
            )}
          </tr>
        </tfoot>
      </table>

      {/* Summary */}
      <div className="mt-4 grid grid-cols-2 gap-4 print:break-inside-avoid">
        <div className="space-y-6 text-[10px]">
          <div style={{ backgroundColor: '#ffffff' }} className="p-2 h-fit">
            <p style={{ color: '#94a3b8', borderBottom: '1px solid #f1f5f9' }} className="font-black uppercase text-[9px] mb-4 pb-2 tracking-[0.2em]">Bank Account Details:</p>
            <div className="space-y-2">
              <p className="flex justify-between"><span>Bank Name:</span> <span className="font-black uppercase">{myBusiness.bankName}</span></p>
              <p className="flex justify-between"><span>A/c Number:</span> <span className="font-black uppercase tracking-widest">{myBusiness.accountNumber}</span></p>
              <p className="flex justify-between"><span>IFSC Code:</span> <span className="font-black uppercase">{myBusiness.ifscCode}</span></p>
              <p className="flex justify-between"><span>Branch:</span> <span className="font-bold">{myBusiness.branch}</span></p>
            </div>
          </div>
          <div style={{ backgroundColor: '#ffffff' }} className="p-2 h-fit">
             <p style={{ color: '#94a3b8', borderBottom: '1px solid #f1f5f9' }} className="font-black uppercase text-[9px] mb-4 pb-2 tracking-[0.2em]">Terms & Conditions:</p>
             <ul style={{ color: '#334155' }} className="list-decimal list-inside space-y-2 font-bold">
                {terms.map((term, i) => term && <li key={i}>{term}</li>)}
             </ul>
          </div>
        </div>
        <div className="relative">
          {docType !== "delivery_challan" ? (
            <div style={{ borderCollapse: 'collapse', border: '2px solid #0f172a', backgroundColor: '#ffffff' }} className="divide-y-2 divide-[#0f172a] overflow-hidden text-[10px] h-fit relative">
              <div className="p-2 flex justify-between items-center">
                <span style={{ color: '#64748b' }} className="font-bold uppercase tracking-widest text-[8px]">Taxable Amount</span>
                <span className="font-black text-sm">{totals.taxableAmount}</span>
              </div>
              {taxType === "gst" ? (
                <>
                  <div style={{ backgroundColor: '#f8fafc' }} className="p-2 flex justify-between items-center">
                    <span style={{ color: '#64748b' }} className="font-bold uppercase tracking-widest text-[8px]">CGST</span>
                    <span className="font-black text-sm">{totals.cgst}</span>
                  </div>
                  <div className="p-2 flex justify-between items-center">
                    <span style={{ color: '#64748b' }} className="font-bold uppercase tracking-widest text-[8px]">SGST</span>
                    <span className="font-black text-sm">{totals.sgst}</span>
                  </div>
                </>
              ) : (
                <div style={{ backgroundColor: '#f8fafc' }} className="p-2 flex justify-between items-center">
                  <span style={{ color: '#64748b' }} className="font-bold uppercase tracking-widest text-[8px]">IGST</span>
                  <span className="font-black text-sm">{totals.igst}</span>
                </div>
              )}
              <div style={{ borderTop: '2px solid #0f172a', backgroundColor: '#ffffff' }} className="p-2 flex justify-between items-center">
                <div style={{ color: '#94a3b8' }} className="text-[9px] uppercase tracking-[0.3em] font-black">Grand Total</div>
                <div style={{ color: '#0f172a' }} className="text-xl font-black tracking-tighter">{currency} {totals.grandTotal}</div>
              </div>
              <div style={{ borderTop: '4px solid #f1f5f9', backgroundColor: '#f8fafc' }} className="p-2">
                 <span style={{ color: '#94a3b8' }} className="font-black text-[8px] uppercase block mb-1 tracking-[0.2em]">Amount in Words:</span>
                 <p style={{ color: '#1e293b' }} className="font-black leading-tight text-[11px] uppercase italic">{numberToWords(totals.grandTotalInt)} Only</p>
              </div>
            </div>
          ) : (
            <div className="border-2 border-slate-900 p-8 rounded-[2.5rem] bg-slate-50/50 flex flex-col justify-center items-center text-center space-y-4">
               <p className="font-black uppercase text-[10px] tracking-[0.3em] text-slate-400">Values Hidden for Challan</p>
            </div>
          )}
        </div>
      </div>

      {/* Signature Area */}
      <div style={{ borderTop: '2px solid #0f172a', borderBottom: '2px solid #0f172a', backgroundColor: '#ffffff' }} className="mt-4 grid grid-cols-2 h-28 overflow-hidden print:break-inside-avoid">
        <div style={{ borderRight: '2px solid #0f172a', backgroundColor: '#ffffff' }} className="p-5 flex flex-col justify-between">
           <p className="font-black uppercase text-[10px] tracking-widest">
              {docType === "delivery_challan" ? "Receiver's Signature:" : "Customer's Acceptance:"}
           </p>
           <div style={{ color: '#cbd5e1', borderBottom: '1px dashed #cbd5e1' }} className="text-right italic text-[10px] mb-2 pb-2">Seal & Signature</div>
        </div>
        <div style={{ backgroundColor: '#ffffff' }} className="p-5 text-center flex flex-col justify-between items-center relative">
           <p style={{ color: '#1e293b' }} className="font-black uppercase text-[10px] tracking-tight">For {myBusiness.name}</p>
           <div className="my-2">
              {signImg}
           </div>
           <div className="w-full flex flex-col items-center">
              <div style={{ borderTop: '2px solid #0f172a' }} className="w-64 mb-1"></div>
              <p className="font-black uppercase tracking-widest text-[10px]">Authorized Signatory</p>
           </div>
        </div>
      </div>
      
      <p style={{ color: '#94a3b8' }} className="text-center mt-4 text-[8px] font-black uppercase tracking-[0.3em]">Computer Generated Document</p>

      {/* Annexure Section */}
      {showAnnexure && annexures.map((ann, idx) => {
        const subTotal = ann.items.reduce((acc, item) => {
          const itemTotal = item.quantity * item.price * (1 + item.taxRate/100);
          return acc + itemTotal;
        }, 0).toLocaleString(undefined, {minimumFractionDigits: 2});

        return (
          <div key={ann.id} className="mt-20 print:break-before-page pt-10">
            <div className="bg-slate-100 p-6 mb-8 border-2 border-slate-900 rounded-2xl">
               <h2 className="text-2xl font-black text-center uppercase tracking-[0.2em]">{ann.title}</h2>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-6 text-[11px] font-bold">
               <div className="space-y-1">
                  <div className="bg-slate-50 p-2 border border-slate-200"><span className="text-slate-400 mr-2">CLIENT:</span> {customer.name}</div>
                  <div className="bg-slate-50 p-2 border border-slate-200"><span className="text-slate-400 mr-2">SITE:</span> {customer.site || "N/A"}</div>
               </div>
               <div className="space-y-1">
                  <div className="bg-slate-50 p-2 border border-slate-200"><span className="text-slate-400 mr-2">LOCATION:</span> {invoiceMeta.state}</div>
                  <div className="bg-slate-50 p-2 border border-slate-200"><span className="text-slate-400 mr-2">DOC NO:</span> {invoiceMeta.invoiceNumber}</div>
               </div>
            </div>

            <table className="w-full border-collapse border-2 border-slate-900 text-[10px]">
              <thead>
                <tr className="bg-slate-100 font-black uppercase border-b-2 border-slate-900">
                  <th className="p-3 border-r-2 border-slate-900 w-12">Sr. No</th>
                  <th className="p-3 border-r-2 border-slate-900 text-left">Item Description</th>
                  <th className="p-3 border-r-2 border-slate-900 text-center w-32">Make</th>
                  <th className="p-3 border-r-2 border-slate-900 text-center w-16">Qty</th>
                  <th className="p-3 border-r-2 border-slate-900 text-right w-28">Unit Price</th>
                  <th className="p-3 text-right w-32">Total (Inc. GST)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-300">
                {ann.items.map((item, i) => (
                  <tr key={item.id} className="font-bold">
                    <td className="p-3 border-r-2 border-slate-900 text-center">{i + 1}</td>
                    <td className="p-3 border-r-2 border-slate-900 uppercase leading-tight">{item.name}</td>
                    <td className="p-3 border-r-2 border-slate-900 text-center uppercase">{item.make}</td>
                    <td className="p-3 border-r-2 border-slate-900 text-center">{item.quantity}</td>
                    <td className="p-3 border-r-2 border-slate-900 text-right">{parseFloat(item.price).toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                    <td className="p-3 text-right font-black">{(item.quantity * item.price * (1 + item.taxRate/100)).toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-slate-900 font-black bg-slate-50">
                  <td colSpan="5" className="p-3 border-r-2 border-slate-900 text-right uppercase tracking-widest">Section Total</td>
                  <td className="p-3 text-right text-sm">{currency} {subTotal}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        );
      })}
    </div>
  );
};

export default TaxInvoiceTemplate;
