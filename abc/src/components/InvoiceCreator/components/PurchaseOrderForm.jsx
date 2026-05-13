import React from "react";

const PurchaseOrderForm = ({ 
  isPreviewMode, 
  setIsPreviewMode, 
  setIsPOPrinting, 
  poMeta, 
  setPoMeta, 
  poItems, 
  setPoItems, 
  products, 
  currency, 
  activePOSearchId, 
  setActivePOSearchId, 
  addPOItem, 
  handlePOPrint,
  renderPOPrintTemplate,
  editingPOId
}) => {
  if (isPreviewMode) {
    return (
      <div className="bg-slate-200/50 p-12 rounded-[3rem] shadow-inner border-4 border-white animate-in zoom-in-95 duration-300">
        <div className="bg-white px-10 py-6 border-b-4 border-slate-100 flex justify-between items-center rounded-t-[2.5rem]">
           <div className="flex items-center gap-4">
              <div className="w-3 h-3 bg-red-400 rounded-full"></div>
              <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
              <div className="w-3 h-3 bg-green-400 rounded-full"></div>
              <span className="ml-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">PO PREVIEW</span>
           </div>
            <button onClick={() => { setIsPreviewMode(false); setIsPOPrinting(false); }} className="bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest py-3 px-8 rounded-2xl transition-all shadow-lg shadow-slate-200">Close Preview</button>
        </div>
        <div className="overflow-auto max-h-[80vh] flex justify-center p-4 md:p-8 bg-slate-100/50">
           <div className="transform scale-[0.5] sm:scale-[0.7] md:scale-[0.75] origin-top bg-white shadow-2xl">
              {renderPOPrintTemplate()}
           </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-5 duration-700 pb-20">
      <div className="bg-white rounded-[3.5rem] p-16 border-4 border-slate-50 shadow-2xl bg-gradient-to-br from-white to-orange-50/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-orange-100/30 rounded-full blur-3xl -mr-32 -mt-32"></div>
        
        <div className="flex justify-between items-end mb-12 relative z-10">
          <div>
            <h2 className="text-5xl font-black text-slate-900 tracking-tighter mb-4">Create Purchase Order</h2>
            <p className="text-slate-400 font-bold text-xs uppercase tracking-[0.4em] flex items-center gap-3">
              <span className="w-8 h-[2px] bg-orange-500"></span>
              Official Procurement Terminal
            </p>
          </div>
          <div className="flex items-center gap-4">
             <button 
               onClick={() => {
                 setIsPOPrinting(true);
                 setIsPreviewMode(!isPreviewMode);
               }}
               className={`px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl transition-all ${isPreviewMode ? "bg-orange-600 text-white shadow-orange-200" : "bg-white text-slate-600 hover:bg-slate-50"}`}
             >
               {isPreviewMode ? "Close Preview" : "Live Preview"}
             </button>
             <div className="flex flex-col items-end">
                <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">System Status</span>
                <div className="bg-green-100 text-green-600 px-6 py-2 rounded-full font-black text-[10px] uppercase tracking-widest border border-green-200 shadow-sm">Ready</div>
             </div>
          </div>
        </div>

        <div className="mb-8 flex justify-end">
           <button 
             onClick={() => {
               const lowStock = products.filter(p => Number(p.stock) < 50);
               if (lowStock.length === 0) return alert("All products are well-stocked (>50)!");
               
               const existingNames = new Set(poItems.map(i => i.name.toUpperCase()));
               const itemsToAdd = lowStock
                 .filter(p => !existingNames.has(p.name.toUpperCase()))
                 .map(p => ({
                   id: Date.now() + Math.random(),
                   name: p.name,
                   hsn: p.hsn || "",
                   make: p.make || "",
                   quantity: 1,
                   price: parseFloat(p.price) || 0,
                   taxRate: p.tax_rate || 18
                 }));

               if (itemsToAdd.length === 0) return alert("All low stock items are already in the list!");
               
               // Remove empty rows first
               const filteredItems = poItems.filter(i => i.name.trim() !== "");
               setPoItems([...filteredItems, ...itemsToAdd]);
               alert(`✅ Added ${itemsToAdd.length} low stock items to your order!`);
             }}
             className="bg-red-50 text-red-600 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border-2 border-red-100 hover:bg-red-100 transition-all flex items-center gap-2"
           >
             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
             Auto-Fill Low Stock (&lt;50)
           </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          <div className="bg-slate-50/80 backdrop-blur-sm p-8 rounded-[2.5rem] border-2 border-white shadow-inner space-y-2 group transition-all hover:bg-white hover:shadow-xl">
             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Order Identifier</label>
             <input type="text" className="w-full text-lg font-black text-slate-800 outline-none bg-transparent" value={poMeta.poNumber} onChange={(e) => setPoMeta({...poMeta, poNumber: e.target.value})} />
          </div>
          <div className="bg-slate-50/80 backdrop-blur-sm p-8 rounded-[2.5rem] border-2 border-white shadow-inner space-y-2 group transition-all hover:bg-white hover:shadow-xl">
             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Document Date</label>
             <input type="date" className="w-full text-lg font-black text-slate-800 outline-none bg-transparent" value={poMeta.poDate} onChange={(e) => setPoMeta({...poMeta, poDate: e.target.value})} />
          </div>
          <div className="bg-slate-50/80 backdrop-blur-sm p-8 rounded-[2.5rem] border-2 border-white shadow-inner space-y-2 group transition-all hover:bg-white hover:shadow-xl">
             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Vendor / Supplier</label>
             <input type="text" placeholder="COMPANY NAME..." className="w-full text-lg font-black text-slate-800 outline-none bg-transparent uppercase placeholder:text-slate-300" value={poMeta.vendor} onChange={(e) => setPoMeta({...poMeta, vendor: e.target.value})} />
          </div>
        </div>

        <div className="bg-white rounded-[2.5rem] border-2 border-slate-50 overflow-hidden shadow-2xl mb-12">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900 text-white">
                <th className="px-10 py-7 w-20 text-center text-[10px] font-black uppercase tracking-[0.2em]">#</th>
                <th className="px-10 py-7 text-[10px] font-black uppercase tracking-[0.2em]">Item Specification</th>
                <th className="px-10 py-7 w-32 text-center text-[10px] font-black uppercase tracking-[0.2em]">Quantity</th>
                <th className="px-10 py-7 w-48 text-right text-[10px] font-black uppercase tracking-[0.2em]">Rate</th>
                <th className="px-10 py-7 w-48 text-right text-[10px] font-black uppercase tracking-[0.2em]">Extended Total</th>
                <th className="px-10 py-7 w-20"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {poItems.map((item, index) => (
                <tr key={item.id} className="hover:bg-orange-50/30 transition-all duration-300 group">
                  <td className="px-10 py-6 text-xs font-black text-slate-300 text-center">{index + 1}</td>
                  <td className="px-10 py-6 relative">
                    <div className="flex flex-col gap-2">
                      <div className="relative">
                        <input 
                          list="po-product-list"
                          type="text" 
                          placeholder="ITEM NAME..." 
                          className="w-full font-black text-sm uppercase text-slate-800 tracking-tight bg-transparent outline-none focus:bg-white px-2 py-1 rounded" 
                          value={item.name} 
                          onFocus={() => setActivePOSearchId(item.id)}
                          onBlur={() => {
                            setTimeout(() => setActivePOSearchId(null), 200);
                          }}
                          onChange={(e) => {
                            const val = e.target.value;
                            const newItems = poItems.map(i => i.id === item.id ? {...i, name: val} : i);
                            
                            const prod = products.find(p => p.name.toUpperCase() === val.toUpperCase());
                            if (prod) {
                              const alreadyExists = poItems.find(i => i.id !== item.id && i.name.toUpperCase() === prod.name.toUpperCase());
                              if (alreadyExists) {
                                alert(`⚠️ "${prod.name}" is already in your order! Use one entry.`);
                                return;
                              }
                              setPoItems(poItems.map(i => i.id === item.id ? {
                                ...i,
                                name: prod.name,
                                hsn: prod.hsn || "",
                                make: prod.make || "",
                                price: parseFloat(prod.price) || 0
                              } : i));
                            } else {
                              setPoItems(newItems);
                            }
                          }}
                        />
                        <datalist id="po-product-list">
                          {products.map(p => <option key={p.id} value={p.name} />)}
                        </datalist>
                        
                        {activePOSearchId === item.id && item.name.length > 0 && products.filter(p => p.name.toLowerCase().includes(item.name.toLowerCase())).length > 0 && !products.find(p => p.name.toUpperCase() === item.name.toUpperCase()) && (
                          <div className="absolute top-full left-0 w-full bg-white border-2 border-slate-100 rounded-2xl shadow-2xl z-50 mt-2 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                             {products
                               .filter(p => p.name.toLowerCase().includes(item.name.toLowerCase()))
                               .slice(0, 5)
                               .map(p => (
                                 <button 
                                   key={p.id}
                                   onClick={() => {
                                     const alreadyExists = poItems.find(i => i.id !== item.id && i.name.toUpperCase() === p.name.toUpperCase());
                                     if (alreadyExists) {
                                       alert(`⚠️ "${p.name}" is already in your order!`);
                                       setActivePOSearchId(null);
                                       return;
                                     }
                                     const newItems = poItems.map(i => i.id === item.id ? {
                                       ...i, 
                                       name: p.name,
                                       hsn: p.hsn || "",
                                       make: p.make || "",
                                       price: parseFloat(p.price) || 0
                                     } : i);
                                     setPoItems(newItems);
                                     setActivePOSearchId(null);
                                   }}
                                   className="w-full text-left px-6 py-4 hover:bg-orange-50 transition-colors flex flex-col border-b border-slate-50 last:border-none"
                                 >
                                    <span className="font-black text-xs uppercase text-slate-800">{p.name}</span>
                                    <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{p.make} | HSN: {p.hsn} | {currency}{p.price}</span>
                                 </button>
                               ))}
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2">
                         <input 
                           type="text" 
                           placeholder="MAKE..." 
                           className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em] bg-transparent outline-none focus:bg-white px-2 py-1 rounded w-24" 
                           value={item.make} 
                           onChange={(e) => {
                             const newItems = poItems.map(i => i.id === item.id ? {...i, make: e.target.value} : i);
                             setPoItems(newItems);
                           }}
                         />
                         <span className="text-slate-200 mt-1">•</span>
                         <input 
                           type="text" 
                           placeholder="HSN..." 
                           className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em] bg-transparent outline-none focus:bg-white px-2 py-1 rounded w-20" 
                           value={item.hsn} 
                           onChange={(e) => {
                             const newItems = poItems.map(i => i.id === item.id ? {...i, hsn: e.target.value} : i);
                             setPoItems(newItems);
                           }}
                         />
                      </div>
                    </div>
                  </td>
                  <td className="px-10 py-6">
                    <input 
                      type="number" 
                      className="w-full bg-slate-100 text-center py-3 rounded-xl font-black text-xs outline-none focus:ring-4 focus:ring-orange-100 transition-all" 
                      value={item.quantity} 
                      onChange={(e) => {
                        const newItems = poItems.map(i => i.id === item.id ? {...i, quantity: parseFloat(e.target.value) || 0} : i);
                        setPoItems(newItems);
                      }} 
                    />
                  </td>
                  <td className="px-10 py-6 text-right font-black text-sm text-slate-600">
                     <div className="flex items-center justify-end gap-2">
                        <span className="text-slate-300">{currency}</span>
                        <input 
                          type="number" 
                          className="w-24 bg-transparent text-right font-black outline-none focus:bg-white px-2 py-1 rounded" 
                          value={item.price} 
                          onChange={(e) => {
                            const newItems = poItems.map(i => i.id === item.id ? {...i, price: parseFloat(e.target.value) || 0} : i);
                            setPoItems(newItems);
                          }}
                        />
                     </div>
                  </td>
                  <td className="px-10 py-6 text-right font-black text-sm text-slate-900">
                     <div className="flex items-center justify-end gap-1">
                        <span className="text-[10px] text-slate-400">{currency}</span>
                        <span>{(item.quantity * item.price).toLocaleString()}</span>
                     </div>
                  </td>
                  <td className="px-10 py-6 text-center">
                    <button onClick={() => setPoItems(poItems.filter(i => i.id !== item.id))} className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-300 hover:bg-red-50 hover:text-red-500 transition-all active:scale-90"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"/></svg></button>
                  </td>
                </tr>
              ))}
              <tr className="bg-slate-50/50">
                <td className="px-10 py-6 text-center">
                  <button 
                     onClick={addPOItem}
                     className="w-12 h-12 mx-auto flex items-center justify-center rounded-2xl bg-orange-600 hover:bg-orange-500 transition-all active:scale-90 shadow-lg shadow-orange-900/40 text-white"
                     title="Add New Item"
                  >
                     <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/></svg>
                  </button>
                </td>
                <td colSpan="5" className="px-10 py-6">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Click plus to add more items to this order</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center gap-10 p-12 bg-slate-900 rounded-[3rem] shadow-[0_35px_60px_-15px_rgba(0,0,0,0.3)]">
           <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 mb-2">Aggregate Procurement Value</span>
              <span className="text-5xl font-black text-white tracking-tighter">{currency} {poItems.reduce((acc, item) => acc + (item.quantity * item.price), 0).toLocaleString()}</span>
           </div>
           <button 
             onClick={handlePOPrint}
             className="group relative bg-orange-600 text-white font-black uppercase tracking-[0.2em] py-7 px-16 rounded-3xl hover:bg-orange-500 transition-all active:scale-95 shadow-2xl shadow-orange-900/40 flex items-center gap-4 overflow-hidden"
           >
             <div className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-[200%] transition-transform duration-1000"></div>
             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/></svg>
             {editingPOId ? "UPDATE OFFICIAL ORDER" : "PRINT OFFICIAL ORDER"}
           </button>
        </div>
      </div>
    </div>
  );
};

export default PurchaseOrderForm;
