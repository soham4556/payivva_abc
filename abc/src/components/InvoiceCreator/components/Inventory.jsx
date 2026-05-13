import React from "react";

const Inventory = ({ 
  inventorySearch, 
  setInventorySearch, 
  inventoryForm, 
  setInventoryForm, 
  saveOrUpdateProduct, 
  editingProductId, 
  cancelEdit, 
  products, 
  currency, 
  startEditProduct, 
  deleteProduct,
  fetchProducts
}) => {
  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="bg-white p-10 rounded-[3rem] border-2 border-slate-100 shadow-xl">
         <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-10">
            <h3 className="text-2xl font-black text-slate-900 tracking-tighter uppercase italic">Inventory Management</h3>
            <div className="relative w-full md:w-96 group">
              <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
              </div>
              <input 
                type="text" 
                placeholder="Quick search products..." 
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl pl-12 pr-6 py-4 text-[10px] font-black uppercase tracking-widest outline-none focus:bg-white focus:border-blue-500 transition-all shadow-sm focus:shadow-xl"
                value={inventorySearch}
                onChange={(e) => setInventorySearch(e.target.value)}
              />
            </div>
         </div>
         
         <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-12 bg-slate-50/50 p-8 rounded-[2rem] border-2 border-white shadow-inner">
            <div className="space-y-2">
               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Product Name</label>
               <input 
                 type="text" 
                 className="w-full bg-white border-2 border-slate-100 rounded-2xl px-6 py-4 text-xs font-black uppercase outline-none focus:border-blue-500 transition-all shadow-sm" 
                 placeholder="Item Name..." 
                 value={inventoryForm.name}
                 onChange={(e) => setInventoryForm({...inventoryForm, name: e.target.value})}
               />
            </div>
            <div className="space-y-2">
               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">HSN Code</label>
               <input 
                 type="text" 
                 className="w-full bg-white border-2 border-slate-100 rounded-2xl px-6 py-4 text-xs font-black outline-none focus:border-blue-500 transition-all shadow-sm" 
                 placeholder="8415..." 
                 value={inventoryForm.hsn}
                 onChange={(e) => setInventoryForm({...inventoryForm, hsn: e.target.value})}
               />
            </div>
            <div className="space-y-2">
               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Make / Brand</label>
               <input 
                 type="text" 
                 className="w-full bg-white border-2 border-slate-100 rounded-2xl px-6 py-4 text-xs font-black uppercase outline-none focus:border-blue-500 transition-all shadow-sm" 
                 placeholder="Brand Name..." 
                 value={inventoryForm.make}
                 onChange={(e) => setInventoryForm({...inventoryForm, make: e.target.value})}
               />
            </div>
            <div className="space-y-2">
               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Current Stock</label>
               <input 
                 type="number" 
                 className="w-full bg-white border-2 border-slate-100 rounded-2xl px-6 py-4 text-xs font-black outline-none focus:border-blue-500 transition-all shadow-sm" 
                 placeholder="0" 
                 value={inventoryForm.stock}
                 onChange={(e) => setInventoryForm({...inventoryForm, stock: e.target.value})}
               />
            </div>
            <div className="space-y-2">
               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Price (Base)</label>
               <input 
                 type="number" 
                 className="w-full bg-white border-2 border-slate-100 rounded-2xl px-6 py-4 text-xs font-black outline-none focus:border-blue-500 transition-all shadow-sm" 
                 placeholder="0.00" 
                 value={inventoryForm.price}
                 onChange={(e) => setInventoryForm({...inventoryForm, price: e.target.value})}
               />
            </div>
            <div className="flex items-end gap-3">
              <button 
                onClick={saveOrUpdateProduct}
                className={`w-full ${editingProductId ? 'bg-orange-500 hover:bg-orange-600 shadow-orange-100' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-200'} text-white font-black uppercase text-[10px] tracking-widest py-5 rounded-2xl shadow-xl hover:-translate-y-1 active:scale-95 transition-all`}
              >
                {editingProductId ? "Update" : "Save Product"}
              </button>
              {editingProductId && (
                <button onClick={cancelEdit} className="bg-slate-200 text-slate-600 p-5 rounded-2xl hover:bg-slate-300 transition-all">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
                </button>
              )}
            </div>
         </div>

         <div className="overflow-x-auto">
            <table className="w-full text-left">
               <thead>
                  <tr className="text-[10px] font-black uppercase text-slate-400 bg-slate-50/50 border-b border-slate-100">
                     <th className="px-8 py-5">Product Name</th>
                     <th className="px-8 py-5">HSN</th>
                     <th className="px-8 py-5">Make</th>
                     <th className="px-8 py-5 text-center">In Stock</th>
                     <th className="px-8 py-5 text-right">Price</th>
                     <th className="px-8 py-5 text-center">Action</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-50">
                  {products
                    .filter(p => p.name.toLowerCase().includes(inventorySearch.toLowerCase()))
                    .map(p => {
                    const isLowStock = p.stock <= 50;
                    return (
                      <tr key={p.id} className={`hover:bg-slate-50/50 transition-all ${isLowStock ? 'bg-red-50/30' : ''}`}>
                         <td className="px-8 py-5 font-black text-xs uppercase text-slate-700">
                           {p.name}
                           {isLowStock && <span className="ml-3 bg-red-500 text-white text-[8px] px-2 py-1 rounded-full animate-pulse">LOW</span>}
                         </td>
                         <td className="px-8 py-5 font-bold text-xs text-slate-400">{p.hsn || '---'}</td>
                         <td className="px-8 py-5 font-bold text-xs text-blue-500 uppercase">{p.make || '---'}</td>
                         <td className={`px-8 py-5 text-center font-black text-xs ${isLowStock ? 'text-red-600' : 'text-slate-700'}`}>{p.stock}</td>
                         <td className="px-8 py-5 text-right font-black text-xs">{currency} {p.price}</td>
                       <td className="px-8 py-5 text-center">
                          <div className="flex items-center justify-center gap-3">
                             <button 
                               onClick={() => startEditProduct(p)}
                               className="text-blue-500 hover:text-blue-700 font-black text-[9px] uppercase border border-blue-100 px-3 py-1 rounded-lg hover:bg-blue-50 transition-all"
                             >
                               Edit
                             </button>
                             <button 
                               onClick={() => deleteProduct(p.id)}
                               className="text-red-400 hover:text-red-600 font-black text-[9px] uppercase border border-red-100 px-3 py-1 rounded-lg hover:bg-red-50 transition-all"
                             >
                               Delete
                             </button>
                          </div>
                       </td>
                    </tr>
                  );
                })}
               </tbody>
            </table>
         </div>

         <div className="mt-12 pt-8 border-t border-slate-100 flex justify-center">
            <button 
              onClick={async (e) => {
                const btn = e.currentTarget;
                const originalText = btn.innerHTML;
                btn.innerHTML = 'Syncing...';
                btn.disabled = true;
                
                await fetchProducts();
                
                setTimeout(() => {
                  btn.innerHTML = 'Synced Successfully';
                  setTimeout(() => {
                    btn.innerHTML = originalText;
                    btn.disabled = false;
                  }, 2000);
                }, 800);
              }}
              className="bg-slate-900 text-white px-12 py-5 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] shadow-2xl shadow-slate-200 hover:scale-105 transition-all flex items-center gap-4 min-w-[280px] justify-center"
            >
               Save Current Inventory
            </button>
         </div>
      </div>
    </div>
  );
};

export default Inventory;
