import React from "react";
import TaxInvoiceTemplate from "../templates/TaxInvoiceTemplate";
import POTemplate from "../templates/POTemplate";

const InvoiceForm = ({ 
  isPreviewMode, 
  setIsPreviewMode, 
  handleSubmit, 
  docType, 
  setDocType, 
  invoiceMeta, 
  handleMetaChange, 
  myBusiness, 
  handleBusinessChange, 
  customer, 
  handleCustomerChange, 
  clients, 
  selectClient, 
  saveClientToDB, 
  deleteClient,
  items, 
  addItem, 
  removeItem, 
  handleItemChange, 
  products, 
  selectProduct, 
  fetchProducts,
  showAnnexure, 
  setShowAnnexure, 
  annexures, 
  handleAnnexureTitleChange, 
  syncAnnexureToMain, 
  removeAnnexureSection, 
  handleAnnexureItemChange, 
  selectAnnexureProduct, 
  removeAnnexureItem, 
  addAnnexureItem, 
  addAnnexureSection, 
  terms, 
  setTerms, 
  taxType, 
  setTaxType, 
  totals, 
  currency, 
  renderPrintTemplate,
  paymentStatus,
  setPaymentStatus,
  pendingAmount,
  setPendingAmount
}) => {
  const handleEmailInvoice = async () => {
    const customerEmail = prompt("Please enter the customer's email address:", customer.email || "");
    if (!customerEmail) return;

    console.log("Starting email generation process for new invoice...");

    try {
      // 1. Generate PDF for attachment
      console.log("Importing PDF libraries...");
      const jsPDF = (await import("jspdf")).default;
      const html2canvas = (await import("html2canvas")).default;
      
      console.log("Rendering hidden template...");
      const printDiv = document.createElement("div");
      printDiv.style.position = "fixed";
      printDiv.style.left = "0";
      printDiv.style.top = "0";
      printDiv.style.width = "850px";
      printDiv.style.opacity = "0";
      printDiv.style.zIndex = "-1";
      document.body.appendChild(printDiv);

      const root = (await import("react-dom/client")).createRoot(printDiv);
      const styleTag = document.createElement("style");
      styleTag.innerHTML = `
        .flex { display: flex !important; }
        .justify-between { justify-content: space-between !important; }
        .grid { display: grid !important; }
        .grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; }
        .gap-4 { gap: 1rem !important; }
        .gap-6 { gap: 1.5rem !important; }
        .text-right { text-align: right !important; }
        .text-center { text-align: center !important; }
        .uppercase { text-transform: uppercase !important; }
        .font-black { font-weight: 900 !important; }
        .font-bold { font-weight: 700 !important; }
        .w-full { width: 100% !important; }
        .mx-auto { margin-left: auto !important; margin-right: auto !important; }
        table { width: 100% !important; border-collapse: collapse !important; }
      `;
      printDiv.appendChild(styleTag);

      await new Promise(resolve => {
        root.render(
          <div style={{ padding: '40px', background: 'white' }}>
            <TaxInvoiceTemplate 
              invoiceMeta={invoiceMeta} 
              customer={customer} 
              items={items} 
              totals={totals} 
              myBusiness={myBusiness} 
              currency={currency}
              getDocTypeDisplayName={() => (invoiceMeta.docType === 'quotation' ? 'QUOTATION' : 'TAX INVOICE')}
              numberToWords={() => ""}
              terms={terms || []}
              taxType="gst"
              annexures={annexures || []}
            />
          </div>
        );
        setTimeout(resolve, 2000);
      });

      const canvas = await html2canvas(printDiv, { 
        scale: 1.5,
        useCORS: true,
        logging: true,
        allowTaint: true,
        onclone: (clonedDoc) => {
          const styles = clonedDoc.querySelectorAll('style');
          styles.forEach(s => {
            if (s.textContent?.includes('oklch')) {
               s.textContent = s.textContent.replace(/oklch\([^)]+\)/g, '#000000');
            }
          });
        }
      });
      
      const imgData = canvas.toDataURL("image/jpeg", 0.8);
      if (imgData.length < 100) throw new Error("Canvas capture failed");

      const pdf = new jsPDF("p", "mm", "a4");
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      pdf.addImage(imgData, "JPEG", 0, 0, pdfWidth, pdfHeight);
      const pdfBase64 = pdf.output('datauristring');
      document.body.removeChild(printDiv);
      console.log("PDF generated. Size:", Math.round(pdfBase64.length / 1024), "KB");

      // 2. Prepare logo
      let logoBase64 = myBusiness.logo;
      if (myBusiness.logo && !myBusiness.logo.startsWith('data:')) {
         try {
           const response = await fetch(myBusiness.logo);
           const blob = await response.blob();
           logoBase64 = await new Promise(r => {
             const reader = new FileReader();
             reader.onloadend = () => r(reader.result);
             reader.readAsDataURL(blob);
           });
         } catch (e) { console.warn(e); }
      }

      const response = await fetch("http://localhost:3001/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: customerEmail,
          invoiceData: { invoiceMeta, customer, items, totals, currency, pendingAmount: totals?.grandTotal },
          myBusiness: { ...myBusiness, logo: logoBase64 },
          pdfBase64
        }),
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Server responded with ${response.status}: ${text.substring(0, 100)}`);
      }

      const data = await response.json();
      if (data.success) {
        alert("✅ Professional Invoice with PDF emailed successfully!");
      } else {
        console.error("Server-side email error:", data.error);
        alert("❌ Error: " + data.error);
      }
    } catch (e) {
      console.error("Frontend email generation error:", e);
      alert("❌ Failed to generate or send email: " + e.message);
    }
  };

  if (isPreviewMode) {
    return (
      <div className="bg-slate-200/50 p-12 rounded-[3rem] shadow-inner border-4 border-white animate-in zoom-in-95 duration-300">
        <div className="bg-white px-10 py-6 border-b-4 border-slate-100 flex justify-between items-center rounded-t-[2.5rem]">
           <div className="flex items-center gap-4">
              <div className="w-3 h-3 bg-red-400 rounded-full"></div>
              <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
              <div className="w-3 h-3 bg-green-400 rounded-full"></div>
              <span className="ml-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">HIFI PREVIEW (A4 SCALE)</span>
           </div>
           <button onClick={() => setIsPreviewMode(false)} className="bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest py-3 px-8 rounded-2xl transition-all shadow-lg shadow-slate-200">Exit Preview</button>
        </div>
        <div className="overflow-auto max-h-[80vh] flex justify-center p-4 md:p-8 bg-slate-100/50">
           <div className="transform scale-[0.5] sm:scale-[0.7] md:scale-[0.75] origin-top bg-white shadow-2xl">
              {renderPrintTemplate()}
           </div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="bg-white p-8 rounded-[2.5rem] border-4 border-slate-50 shadow-xl flex flex-wrap gap-4 items-center justify-between">
        <div className="flex flex-col gap-1">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Document Category</h3>
          <p className="text-xs font-bold text-slate-600 italic">Select the type of document you want to generate</p>
        </div>
        <div className="flex bg-slate-100 p-2 rounded-2xl gap-2">
          {[
            { id: "invoice", label: "Tax Invoice" },
            { id: "quotation", label: "Quotation" },
            { id: "proforma", label: "Proforma" },
            { id: "delivery_challan", label: "Challan" },
            { id: "purchase", label: "Purchase Order" }
          ].map(type => (
            <button
              key={type.id}
              type="button"
              onClick={() => setDocType(type.id)}
              className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${docType === type.id ? "bg-slate-900 text-white shadow-lg scale-105" : "text-slate-400 hover:text-slate-600"}`}
            >
              {type.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <div className="bg-white p-5 md:p-6 rounded-3xl shadow-sm border border-slate-100 space-y-1">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Invoice #</label>
          <input type="text" className="w-full text-sm font-black text-slate-800 outline-none" value={invoiceMeta.invoiceNumber} onChange={(e) => handleMetaChange("invoiceNumber", e.target.value)} />
        </div>
        <div className="bg-white p-5 md:p-6 rounded-3xl shadow-sm border border-slate-100 space-y-1">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</label>
          <input type="date" className="w-full text-sm font-black text-slate-800 outline-none" value={invoiceMeta.issueDate} onChange={(e) => handleMetaChange("issueDate", e.target.value)} />
        </div>
        <div className="bg-white p-5 md:p-6 rounded-3xl shadow-sm border border-slate-100 space-y-1">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">PO #</label>
          <input type="text" className="w-full text-sm font-black text-slate-800 outline-none" value={invoiceMeta.poNumber} onChange={(e) => handleMetaChange("poNumber", e.target.value)} />
        </div>
        <div className="bg-white p-5 md:p-6 rounded-3xl shadow-sm border border-slate-100 space-y-1">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Vehicle #</label>
          <input type="text" className="w-full text-sm font-black text-slate-800 outline-none" value={invoiceMeta.vehicleNumber} onChange={(e) => handleMetaChange("vehicleNumber", e.target.value)} />
        </div>
        {docType === "delivery_challan" && (
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">LR / Dispatch #</label>
            <input type="text" className="w-full text-sm font-black text-slate-800 outline-none" value={invoiceMeta.lrNumber} onChange={(e) => handleMetaChange("lrNumber", e.target.value)} />
          </div>
        )}
        {docType === "quotation" && (
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Price Validity</label>
            <input type="text" className="w-full text-sm font-black text-slate-800 outline-none" value={invoiceMeta.validity} onChange={(e) => handleMetaChange("validity", e.target.value)} />
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="bg-slate-50 px-8 py-5 border-b border-slate-200"><h3 className="font-black text-slate-800 uppercase text-[10px] tracking-widest">Seller (From)</h3></div>
          <div className="p-8 space-y-5">
            <div className="flex items-center gap-5">
               <img src={myBusiness.logo} alt="Logo" className="h-14 w-14 object-contain bg-slate-50 p-2 rounded-2xl border" />
               <input type="text" className="flex-1 font-black text-md text-slate-800 outline-none uppercase" value={myBusiness.name} onChange={(e) => handleBusinessChange("name", e.target.value)} />
            </div>
            <textarea className="w-full text-xs text-slate-500 bg-slate-50 rounded-2xl p-4 border-none outline-none resize-none font-medium mb-4" rows="3" value={myBusiness.address} onChange={(e) => handleBusinessChange("address", e.target.value)} />
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Bank Name</label>
                <input type="text" className="w-full text-[10px] font-black text-slate-800 bg-slate-50 p-3 rounded-xl outline-none" value={myBusiness.bankName} onChange={(e) => handleBusinessChange("bankName", e.target.value)} />
              </div>
              <div className="space-y-1">
                <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest">A/c Number</label>
                <input type="text" className="w-full text-[10px] font-black text-slate-800 bg-slate-50 p-3 rounded-xl outline-none" value={myBusiness.accountNumber} onChange={(e) => handleBusinessChange("accountNumber", e.target.value)} />
              </div>
              <div className="space-y-1">
                <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest">IFSC Code</label>
                <input type="text" className="w-full text-[10px] font-black text-slate-800 bg-slate-50 p-3 rounded-xl outline-none" value={myBusiness.ifscCode} onChange={(e) => handleBusinessChange("ifscCode", e.target.value)} />
              </div>
              <div className="space-y-1">
                <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Branch</label>
                <input type="text" className="w-full text-[10px] font-black text-slate-800 bg-slate-50 p-3 rounded-xl outline-none" value={myBusiness.branch} onChange={(e) => handleBusinessChange("branch", e.target.value)} />
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="bg-blue-600 px-8 py-5 border-b border-blue-700"><h3 className="font-black text-white uppercase text-[10px] tracking-widest">Buyer (To)</h3></div>
          <div className="p-8 space-y-5">
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-3">
               <div className="flex justify-between items-center">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Select Saved Client</label>
                  <button type="button" onClick={saveClientToDB} className="text-[9px] font-black text-blue-600 uppercase hover:underline">+ Save Current</button>
               </div>
               <div className="flex gap-2">
                 <select 
                   className="flex-1 text-xs font-bold bg-white p-3 rounded-xl border border-slate-200 outline-none"
                   onChange={(e) => {
                     const val = e.target.value;
                     const client = clients.find(c => String(c.id) === String(val));
                     if (client) selectClient(client);
                   }}
                   defaultValue=""
                 >
                   <option value="" disabled>-- Search / Choose Client --</option>
                   {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                 </select>
                 <button
                   type="button"
                   onClick={() => {
                     const selectEl = document.querySelector('select'); // Simplistic, but likely only one client select here
                     const val = selectEl.value;
                     if (val) deleteClient(val);
                     else alert("Please select a client to delete");
                   }}
                   className="p-3 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all border border-red-100"
                   title="Delete Selected Client"
                 >
                   <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                 </button>
               </div>
            </div>
            <input type="text" placeholder="Buyer Name" className="w-full font-black text-md text-slate-800 outline-none uppercase" value={customer.name} onChange={(e) => handleCustomerChange("name", e.target.value)} />
            <input 
              type="text" 
              placeholder="Buyer GSTIN (Optional)" 
              className="w-full text-xs font-bold text-blue-600 bg-slate-50 rounded-xl p-4 border-none outline-none uppercase placeholder:text-blue-300" 
              value={customer.gstin || ""} 
              onChange={(e) => handleCustomerChange("gstin", e.target.value)} 
            />
            <textarea placeholder="Billing Address..." className="w-full text-xs text-slate-500 bg-slate-50 rounded-2xl p-4 border-none outline-none resize-none font-medium" rows="3" value={customer.address} onChange={(e) => handleCustomerChange("address", e.target.value)} />
            <div className="space-y-1">
               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Consignee | Site Address</label>
               <textarea placeholder="Delivery/Site Address (Optional)..." className="w-full text-xs text-slate-500 bg-blue-50/50 rounded-2xl p-4 border-none outline-none resize-none font-medium" rows="3" value={customer.site} onChange={(e) => handleCustomerChange("site", e.target.value)} />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-8 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
           <h3 className="font-black text-slate-800 uppercase text-[10px] tracking-widest">Items & Pricing</h3>
           <div className="flex items-center gap-3">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Include Annexure</span>
              <button type="button" onClick={() => setShowAnnexure(!showAnnexure)} className={`w-12 h-6 rounded-full transition-all relative ${showAnnexure ? "bg-blue-600" : "bg-slate-200"}`}>
                 <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-all ${showAnnexure ? "translate-x-6" : ""}`}></div>
              </button>
           </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50 border-b border-slate-100">
              <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <th className="px-8 py-5 w-16 text-center">Sr.</th>
                <th className="px-8 py-5">Item Description</th>
                <th className="px-8 py-5 w-32 text-center">HSN</th>
                <th className="px-8 py-5 w-24 text-center">Qty</th>
                <th className="px-8 py-5 w-24 text-center">Tax %</th>
                <th className="px-8 py-5 w-40 text-right">Price</th>
                <th className="px-8 py-5 w-40 text-right">Total</th>
                <th className="px-8 py-5 w-12"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.map((item, index) => (
                <tr key={item.id} className="group hover:bg-blue-50/30 transition-colors">
                  <td className="px-8 py-5 text-xs font-black text-slate-400 text-center">{index + 1}</td>
                  <td className="px-8 py-5">
                    <div className="relative">
                      <input 
                        list="product-list"
                        type="text" 
                        className="w-full bg-transparent border-none outline-none text-xs font-black text-slate-800 uppercase" 
                        placeholder="Type product name..." 
                        value={item.name} 
                        onChange={(e) => {
                          handleItemChange(item.id, "name", e.target.value);
                          const prod = products.find(p => p.name.toUpperCase() === e.target.value.toUpperCase());
                          if (prod) selectProduct(item.id, prod);
                        }} 
                      />
                      <datalist id="product-list">
                        {products.map(p => <option key={p.id} value={p.name} />)}
                      </datalist>
                    </div>
                  </td>
                  <td className="px-8 py-5"><input type="text" className="w-full bg-transparent border-none outline-none text-xs text-center font-bold text-slate-500" placeholder="HSN" value={item.hsn} onChange={(e) => handleItemChange(item.id, "hsn", e.target.value)} /></td>
                  <td className="px-8 py-5"><input type="number" className="w-full bg-transparent border-none text-center outline-none text-xs font-black text-slate-800 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" value={item.quantity} onChange={(e) => handleItemChange(item.id, "quantity", parseFloat(e.target.value) || 0)} /></td>
                  <td className="px-8 py-5"><input type="number" className="w-full bg-transparent border-none text-center outline-none text-xs font-black text-blue-600 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" value={item.taxRate} onChange={(e) => handleItemChange(item.id, "taxRate", parseFloat(e.target.value) || 0)} /></td>
                  <td className="px-8 py-5"><input type="number" className="w-full bg-transparent border-none text-right outline-none text-xs font-black text-slate-800 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" value={item.price} onChange={(e) => handleItemChange(item.id, "price", parseFloat(e.target.value) || 0)} /></td>
                  <td className="px-8 py-5 text-xs font-black text-slate-900 text-right">{(item.quantity * item.price).toLocaleString()}</td>
                   <td className="px-8 py-5 text-center">
                      <div className="flex gap-2 justify-center">
                        {!products.find(p => p.name.toUpperCase() === item.name.toUpperCase()) && item.name && (
                           <button 
                             type="button" 
                             title="Save to Inventory"
                             onClick={async () => {
                               const res = await fetch('/api/products', {
                                 method: 'POST',
                                 headers: {'Content-Type': 'application/json'},
                                 body: JSON.stringify({ name: item.name, hsn: item.hsn, price: item.price, tax_rate: item.taxRate })
                               });
                               if (res.ok) fetchProducts();
                             }}
                             className="text-blue-500 hover:text-blue-700"
                           >
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M7.707 10.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V4a1 1 0 10-2 0v7.586l-1.293-1.293z"/><path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v10a2 2 0 01-2 2H7a2 2 0 01-2-2V5z"/></svg>
                           </button>
                        )}
                        <button type="button" onClick={() => removeItem(item.id)} disabled={items.length === 1} className="text-slate-300 hover:text-red-500 disabled:hidden transition-colors"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg></button>
                      </div>
                   </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-6 border-t border-slate-50 bg-slate-50/30"><button type="button" onClick={addItem} className="flex items-center gap-3 text-[10px] font-black uppercase text-blue-600 hover:text-blue-700 transition-all hover:translate-x-1"><div className="w-6 h-6 bg-blue-600 text-white rounded-lg flex items-center justify-center">+</div>Add Item Row</button></div>
      </div>

      {showAnnexure && (
        <div className="space-y-10">
          {annexures.map((ann, sIdx) => (
            <div key={ann.id} className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden animate-in slide-in-from-top-4 duration-500">
              <div className="px-8 py-5 border-b border-slate-100 bg-slate-900 flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <span className="text-white font-black text-[10px] tracking-widest">{sIdx + 1}.</span>
                  <input 
                    type="text" 
                    className="bg-transparent border-none outline-none text-white font-black uppercase text-[10px] tracking-[0.3em] w-64 focus:bg-slate-800 px-2 py-1 rounded transition-all" 
                    value={ann.title} 
                    onChange={(e) => handleAnnexureTitleChange(ann.id, e.target.value)} 
                  />
                </div>
                <div className="flex items-center gap-6">
                  <button 
                    type="button" 
                    onClick={() => syncAnnexureToMain(ann)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-2 shadow-lg shadow-blue-200"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4"/></svg>
                    Add to Main Invoice
                  </button>
                  <span className="text-[10px] font-bold text-slate-400 italic hidden md:block">Will appear on a separate page</span>
                  {annexures.length > 1 && (
                    <button type="button" onClick={() => removeAnnexureSection(ann.id)} className="text-red-400 hover:text-red-500 transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                    </button>
                  )}
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 border-b border-slate-100">
                    <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      <th className="px-4 py-5 w-16 text-center">Sr.</th>
                      <th className="px-4 py-5">Detailed Description</th>
                      <th className="px-4 py-5 w-32 text-center">Make</th>
                      <th className="px-4 py-5 w-24 text-center">Qty</th>
                      <th className="px-4 py-5 w-24 text-center">GST %</th>
                      <th className="px-4 py-5 w-40 text-right">Unit Price (Excl.)</th>
                      <th className="px-4 py-5 w-12 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {ann.items.map((item, i) => (
                      <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-4 py-5 text-center text-xs font-black text-slate-300">{i + 1}</td>
                        <td className="px-4 py-5">
                          <div className="relative">
                            <input 
                              list="product-list"
                              type="text" 
                              className="w-full bg-transparent border-none outline-none text-xs font-black text-slate-800 uppercase" 
                              placeholder="Detailed Item..." 
                              value={item.name} 
                              onChange={(e) => {
                                handleAnnexureItemChange(ann.id, item.id, "name", e.target.value);
                                const prod = products.find(p => p.name.toUpperCase() === e.target.value.toUpperCase());
                                if (prod) selectAnnexureProduct(ann.id, item.id, prod);
                              }} 
                            />
                          </div>
                        </td>
                        <td className="px-4 py-5"><input type="text" className="w-full bg-transparent border-none outline-none text-xs text-center font-bold uppercase" placeholder="Make" value={item.make} onChange={(e) => handleAnnexureItemChange(ann.id, item.id, "make", e.target.value)} /></td>
                        <td className="px-4 py-5"><input type="number" className="w-full bg-transparent border-none text-center outline-none text-xs font-black" value={item.quantity} onChange={(e) => handleAnnexureItemChange(ann.id, item.id, "quantity", parseFloat(e.target.value) || 0)} /></td>
                        <td className="px-4 py-5"><input type="number" className="w-full bg-transparent border-none text-center outline-none text-xs font-bold text-blue-600" value={item.taxRate} onChange={(e) => handleAnnexureItemChange(ann.id, item.id, "taxRate", parseFloat(e.target.value) || 0)} /></td>
                        <td className="px-4 py-5"><input type="number" className="w-full bg-transparent border-none text-right outline-none text-xs font-black" value={item.price} onChange={(e) => handleAnnexureItemChange(ann.id, item.id, "price", parseFloat(e.target.value) || 0)} /></td>
                        <td className="px-4 py-5 text-center text-slate-300">
                           <button type="button" onClick={() => removeAnnexureItem(ann.id, item.id)} disabled={ann.items.length === 1} className="hover:text-red-500 transition-colors disabled:opacity-0">
                             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
                           </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="p-6 border-t border-slate-50 bg-slate-50/30">
                <button type="button" onClick={() => addAnnexureItem(ann.id)} className="flex items-center gap-3 text-[10px] font-black uppercase text-blue-600 hover:text-blue-700 transition-all">
                  <div className="w-6 h-6 bg-slate-900 text-white rounded-lg flex items-center justify-center">+</div>
                  Add Annexure Row
                </button>
              </div>
            </div>
          ))}
          
          <div className="flex justify-center pt-4">
            <button 
              type="button" 
              onClick={addAnnexureSection} 
              className="bg-white hover:bg-slate-50 text-blue-600 px-8 py-5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center gap-3 border-2 border-dashed border-slate-200"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4"/></svg>
              Add New Annexure Section
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
           <div className="bg-slate-50 px-8 py-5 border-b border-slate-200 flex justify-between items-center">
              <h3 className="font-black text-slate-800 uppercase text-[10px] tracking-widest">Terms & Conditions</h3>
              <button type="button" onClick={() => setTerms([...terms, ""])} className="text-[10px] font-black text-blue-600 hover:text-blue-700">+ Add Term</button>
           </div>
           <div className="p-8 space-y-4">
              {terms.map((term, i) => (
                <div key={i} className="flex gap-4">
                  <span className="text-xs font-black text-slate-300 mt-2">{i+1}.</span>
                  <textarea className="flex-1 text-xs text-slate-600 bg-slate-50 rounded-xl p-3 border-none outline-none resize-none font-medium" rows="2" value={term} onChange={(e) => setTerms(terms.map((t, idx) => idx === i ? e.target.value : t))} />
                  <button type="button" onClick={() => setTerms(terms.filter((_, idx) => idx !== i))} className="text-slate-300 hover:text-red-500"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"/></svg></button>
                </div>
              ))}
           </div>
        </div>
        
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
           <div className="bg-slate-50 px-8 py-5 border-b border-slate-200"><h3 className="font-black text-slate-800 uppercase text-[10px] tracking-widest">Taxation Mode</h3></div>
           <div className="p-8 space-y-6">
              <div className="flex gap-4">
                <button type="button" onClick={() => setTaxType("gst")} className={`flex-1 py-4 px-6 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${taxType === "gst" ? "bg-slate-900 text-white shadow-xl" : "bg-slate-50 text-slate-400 hover:bg-slate-100"}`}>CGST + SGST</button>
                <button type="button" onClick={() => setTaxType("igst")} className={`flex-1 py-4 px-6 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${taxType === "igst" ? "bg-slate-900 text-white shadow-xl" : "bg-slate-50 text-slate-400 hover:bg-slate-100"}`}>IGST (Outer State)</button>
              </div>
              <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
                <p className="text-[10px] font-bold text-blue-600 leading-relaxed uppercase tracking-wide italic">
                  Note: You can edit the tax percentage for each item individually in the table above. The total tax will be calculated based on your selection.
                </p>
              </div>
           </div>
        </div>
      </div>

      {/* Internal Payment Tracking - Hidden on Print */}
      <div className="bg-slate-900 p-8 rounded-[2.5rem] shadow-2xl flex flex-col md:flex-row gap-8 items-center justify-between border-4 border-slate-800 print:hidden no-print animate-in slide-in-from-bottom-4 duration-700">
         <div className="flex items-center gap-6">
            <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
               <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
            </div>
            <div>
               <h4 className="text-white font-black uppercase text-[10px] tracking-[0.3em]">Internal Payment Tracking</h4>
               <p className="text-slate-400 text-[10px] font-bold italic">Mark if this invoice is paid or has a pending balance (Udhaari)</p>
            </div>
         </div>
         
         <div className="flex items-center gap-4 bg-slate-800 p-2 rounded-2xl">
            <button 
               type="button" 
               onClick={() => { setPaymentStatus("paid"); setPendingAmount(0); }}
               className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${paymentStatus === "paid" ? "bg-green-500 text-white shadow-lg scale-105" : "text-slate-500 hover:text-slate-400"}`}
            >
               Full Payment Received
            </button>
            <button 
               type="button" 
               onClick={() => setPaymentStatus("pending")}
               className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${paymentStatus === "pending" ? "bg-red-500 text-white shadow-lg scale-105" : "text-slate-500 hover:text-slate-400"}`}
            >
               Pending / Udhaari
            </button>
         </div>

         {paymentStatus === "pending" && (
            <div className="bg-slate-800 p-4 rounded-2xl border border-slate-700 flex flex-col gap-1 animate-in zoom-in-95">
               <label className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Balance Amount Due</label>
               <div className="flex items-center gap-2">
                  <span className="text-white font-black text-sm">{currency}</span>
                  <input 
                     type="number" 
                     className="bg-transparent border-none outline-none text-white font-black text-xl w-32 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" 
                     placeholder="0.00"
                     value={pendingAmount}
                     onChange={(e) => setPendingAmount(parseFloat(e.target.value) || 0)}
                  />
               </div>
            </div>
         )}
      </div>

      <div className="flex flex-col md:flex-row justify-end items-center gap-6 mt-10 p-10 bg-white rounded-3xl border border-slate-100">
         <div className="flex flex-col items-end">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Total Amount Payable</span>
            <span className="text-4xl font-black text-slate-900">{currency} {totals.grandTotal}</span>
         </div>
         <div className="flex gap-4 w-full md:w-auto">
            <button type="submit" className="flex-1 bg-slate-900 text-white font-black uppercase tracking-widest py-6 px-12 rounded-2xl hover:bg-blue-600 transition-all active:scale-95 shadow-xl shadow-slate-100">Download PDF</button>
         </div>
      </div>
    </form>
  );
};

export default InvoiceForm;
