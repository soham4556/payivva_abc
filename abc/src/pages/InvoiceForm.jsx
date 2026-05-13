import React, { useState, useMemo, useEffect } from "react";

const InvoiceCreator = () => {
  const [docType, setDocType] = useState("invoice");
  const [currency, setCurrency] = useState("₹");
  const [activeTab, setActiveTab] = useState("invoices");
  const [selectedTemplate, setSelectedTemplate] = useState("modern");
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [showAnnexure, setShowAnnexure] = useState(false);
  


  const [invoiceMeta, setInvoiceMeta] = useState({
    invoiceNumber: "INV/2026/042",
    issueDate: new Date().toISOString().split("T")[0],
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    poNumber: "PO-BMI-9921",
    poDate: "2026-05-10",
    transport: "By Road",
    vehicleNumber: "MH-12-AB-1234",
    lrNumber: "",
    dispatchThrough: "",
    validity: "15 Days",
    state: "Maharashtra",
    stateCode: "27"
  });

  const [myBusiness, setMyBusiness] = useState({
    name: "PAYIVVA TECHNOLOGIES (OPC) PRIVATE LIMITED",
    address: "House no.105, Green Park - Venkatesh Properties, Undri Pune City, MAHARASHTRA, 411060",
    phone: "8287958096",
    email: "info@payivva.com",
    website: "www.payivvatechnologies.in",
    pan: "AANCP4549F",
    gstin: "27AANCP4549F1Z2",
    bankName: "ICICI BANK LTD",
    accountNumber: "66789999222",
    ifscCode: "ICIC000123",
    branch: "Undri, Pune",
    logo: "/logo.png",
    signature: "/digital_sign.png"
  });

  const [terms, setTerms] = useState([
    "Payment in favor of PAYIVVA TECHNOLOGIES (OPC) PRIVATE LIMITED",
    "Interest @ 24% for delayed payment.",
    "Subject to Pune Jurisdiction only."
  ]);

  const [taxType, setTaxType] = useState("igst"); // Default to IGST as per current layout

  const [customer, setCustomer] = useState({
    name: "",
    address: "",
    gstin: "",
    site: "",
    contactPerson: "",
    phone: ""
  });

  const [discountPercent, setDiscountPercent] = useState(0);
  const [savedInvoices, setSavedInvoices] = useState([]);
  const [clients, setClients] = useState([]);
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchInvoices = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/invoices');
      const data = await response.json();
      setSavedInvoices(data);
    } catch (err) {
      console.error("Error fetching invoices:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchClients = async () => {
    try {
      const response = await fetch('/api/clients');
      const data = await response.json();
      setClients(data);
    } catch (err) {
      console.error("Error fetching clients:", err);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products');
      const data = await response.json();
      setProducts(data);
    } catch (err) {
      console.error("Error fetching products:", err);
    }
  };

  useEffect(() => {
    fetchInvoices();
    fetchClients();
    fetchProducts();
  }, [activeTab]);

  const saveClientToDB = async () => {
    try {
      const response = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(customer)
      });
      if (response.ok) {
        alert("Client saved to database!");
        fetchClients();
      }
    } catch (err) {
      console.error("Error saving client:", err);
    }
  };

  const selectClient = (client) => {
    setCustomer({
      name: client.name,
      address: client.address,
      gst: client.gst,
      site: client.site,
      phone: client.phone
    });
  };

  const selectProduct = (itemId, product) => {
    handleItemChange(itemId, "name", product.name);
    handleItemChange(itemId, "hsn", product.hsn);
    handleItemChange(itemId, "make", product.make);
    handleItemChange(itemId, "price", product.price);
    handleItemChange(itemId, "taxRate", product.tax_rate);
  };


  const updateStatus = async (id, newStatus) => {
    try {
      const response = await fetch(`/api/invoices/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (response.ok) fetchInvoices();
    } catch (err) {
      console.error("Error updating status:", err);
    }
  };

  const loadInvoice = (invoice) => {
    const data = JSON.parse(invoice.data);
    setInvoiceMeta(data.invoiceMeta);
    setCustomer(data.customer);
    setItems(data.items);
    setAnnexureItems(data.annexureItems);
    setDocType(data.docType);
    setTerms(data.terms || []);
    setTaxType(data.taxType || "gst");
    setActiveTab("invoices");
    setIsPreviewMode(true);
  };

  const [items, setItems] = useState([
    {
      id: Date.now(),
      name: "",
      hsn: "",
      make: "",
      quantity: 1,
      price: 0,
      taxRate: 18,
    },
  ]);

  const [annexureItems, setAnnexureItems] = useState([
    { id: Date.now(), name: "", hsn: "", make: "", quantity: 1, price: 0, taxRate: 18 }
  ]);

  const addItem = () =>
    setItems([
      ...items,
      { id: Date.now(), name: "", hsn: "", make: "", quantity: 1, price: 0, taxRate: 18 },
    ]);
  const removeItem = (id) => setItems(items.filter((item) => item.id !== id));

  const addAnnexureItem = () =>
    setAnnexureItems([
      ...annexureItems,
      { id: Date.now(), name: "", hsn: "", make: "", quantity: 1, price: 0, taxRate: 18 },
    ]);
  const removeAnnexureItem = (id) => setAnnexureItems(annexureItems.filter((item) => item.id !== id));

  const handleItemChange = (id, field, value) => {
    setItems(items.map((item) => item.id === id ? { ...item, [field]: value } : item));
  };

  const handleAnnexureItemChange = (id, field, value) => {
    setAnnexureItems(annexureItems.map((item) => item.id === id ? { ...item, [field]: value } : item));
  };

  const annexureTotal = useMemo(() => {
    return annexureItems.reduce((acc, item) => {
      const itemTotal = item.quantity * item.price;
      const taxAmount = itemTotal * (item.taxRate / 100);
      return acc + itemTotal + taxAmount;
    }, 0).toLocaleString(undefined, {minimumFractionDigits: 2});
  }, [annexureItems]);

  const handleMetaChange = (field, value) => setInvoiceMeta({ ...invoiceMeta, [field]: value });
  const handleCustomerChange = (field, value) => setCustomer({ ...customer, [field]: value });
  const handleBusinessChange = (field, value) => setMyBusiness({ ...myBusiness, [field]: value });

  const getDocTypeDisplayName = () => {
    switch (docType) {
      case "invoice": return "TAX INVOICE";
      case "quotation": return "QUOTATION";
      case "proforma": return "PROFORMA INVOICE";
      case "delivery_challan": return "DELIVERY CHALLAN";
      case "work_order": return "WORK ORDER";
      default: return "DOCUMENT";
    }
  };

  const totals = useMemo(() => {
    let subtotal = 0;
    let totalTax = 0;
    items.forEach((item) => {
      subtotal += item.quantity * item.price;
    });
    const discountAmount = subtotal * (discountPercent / 100);
    const taxableAmount = subtotal - discountAmount;
    
    items.forEach((item) => {
      const itemTotal = item.quantity * item.price;
      const itemRatio = subtotal > 0 ? itemTotal / subtotal : 0;
      const itemTaxable = taxableAmount * itemRatio;
      totalTax += itemTaxable * (item.taxRate / 100);
    });

    const grandTotal = taxableAmount + totalTax;

    return {
      subtotal: Number(subtotal).toFixed(2),
      discountAmount: Number(discountAmount).toFixed(2),
      taxableAmount: Number(taxableAmount).toFixed(2),
      cgst: Number(totalTax / 2).toFixed(2),
      sgst: Number(totalTax / 2).toFixed(2),
      igst: Number(totalTax).toFixed(2),
      totalTax: Number(totalTax).toFixed(2),
      grandTotal: Number(grandTotal).toFixed(2),
      grandTotalInt: Math.round(grandTotal),
      totalQty: items.reduce((sum, item) => sum + Number(item.quantity || 0), 0)
    };
  }, [items, discountPercent]);

  useEffect(() => {
    const docTitle = isPreviewMode 
      ? `${customer.name} - ${getDocTypeDisplayName()} - ${invoiceMeta.invoiceNumber}`
      : "Payivva | Invoice Creator";
    document.title = docTitle;
  }, [customer.name, invoiceMeta.invoiceNumber, docType, isPreviewMode]);

  const numberToWords = (num) => {
    const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
    const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    
    const inWords = (n) => {
      if (n < 20) return a[n];
      if (n < 100) return b[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + a[n % 10] : '');
      if (n < 1000) return a[Math.floor(n / 100)] + 'Hundred ' + (n % 100 !== 0 ? inWords(n % 100) : '');
      if (n < 100000) return inWords(Math.floor(n / 1000)) + 'Thousand ' + (n % 1000 !== 0 ? inWords(n % 1000) : '');
      if (n < 10000000) return inWords(Math.floor(n / 100000)) + 'Lakh ' + (n % 100000 !== 0 ? inWords(n % 100000) : '');
      return '';
    };
    
    return inWords(Math.floor(num)) + 'Only';
  };

  const saveInvoiceToDB = async (data) => {
    try {
      const response = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const result = await response.json();
      if (result.success) {
        console.log("Invoice saved with ID:", result.id);
        return true;
      }
      return false;
    } catch (err) {
      console.error("Failed to save to DB:", err);
      return false;
    }
  };

  const handleDownloadPDF = () => {
    const element = document.getElementById('print-template');
    const opt = {
      margin: 10,
      filename: `${invoiceMeta.invoiceNumber}_${customer.name}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, letterRendering: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    // New version: just use the hidden print-template
    html2pdf().from(element).save();
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    
    // Save to DB first
    const dataToSave = {
      invoiceMeta,
      customer,
      totals,
      items,
      annexureItems,
      docType,
      terms,
      taxType,
      currency
    };

    const isSaved = await saveInvoiceToDB(dataToSave);
    if (isSaved) {
       alert("Invoice saved to Database successfully!");
    } else {
       alert("Note: Could not save to Database. Printing anyway...");
    }

    window.print();
  };

  const templates = [
    { id: "modern", name: "Proper GST", desc: "Industrial Tax Invoice", icon: "🧾" },
    { id: "classic", name: "Classic", desc: "Corporate Layout", icon: "🏛️" },
    { id: "minimal", name: "Minimal", desc: "Modern Clean", icon: "📄" },
    { id: "colorful", name: "Colorful", desc: "Creative SaaS", icon: "🎨" },
  ];

  const renderPrintTemplate = () => {
    const logoImg = <img src={myBusiness.logo} alt="Logo" className="h-16 w-auto object-contain" />;
    const signImg = <img src={myBusiness.signature} alt="Sign" className="h-16 w-auto object-contain mx-auto" />;

    const commonClasses = "bg-white text-slate-900 font-sans print:p-0";
    const templateWidth = "w-[210mm] min-h-[297mm] mx-auto";

    switch (selectedTemplate) {
      case "modern":
        return (
          <div className={`${commonClasses} ${templateWidth} p-10 border border-slate-300 print:border-none shadow-lg print:shadow-none`}>
            {/* Header */}
            <div className="flex justify-between items-start border-b-2 border-slate-900 pb-10 mb-10">
              <div className="flex gap-6">
                {logoImg}
                <div>
                  <h1 className="text-xl font-black leading-tight uppercase">{myBusiness.name}</h1>
                  <p className="max-w-md mt-2 text-[10px] leading-relaxed">{myBusiness.address}</p>
                  <p className="font-bold mt-2 text-[11px]">GSTIN: {myBusiness.gstin} | PAN: {myBusiness.pan}</p>
                </div>
              </div>
              <div className="text-right">
                <h2 className="text-3xl font-black tracking-tighter text-slate-900 mb-2 uppercase">{getDocTypeDisplayName()}</h2>
                <span className="border-2 border-slate-900 px-3 py-1 text-[10px] font-black uppercase">Original for Recipient</span>
              </div>
            </div>

            {/* Info Grid - No Boxes */}
            <div className="grid grid-cols-2 mb-10 text-[10px] border-t-2 border-b-2 border-slate-900 py-6">
              <div className="p-0 space-y-2">
                <p className="font-black uppercase text-slate-400 text-[8px] tracking-widest border-b pb-1 mb-2">Details of Buyer | Billed To:</p>
                <p className="text-sm font-black uppercase">{customer.name}</p>
                <p className="leading-relaxed">{customer.address}</p>
                <p className="font-bold text-[11px] mt-2">GSTIN: {customer.gstin}</p>
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
              <div className="mb-10 py-4 text-[10px] border-b border-slate-200">
                 <p className="font-black uppercase text-slate-400 text-[8px] tracking-widest mb-2">Consignee | Site Address:</p>
                 <p className="font-bold italic text-[11px]">{customer.site}</p>
              </div>
            )}

            {/* Compact Table */}
            <table className="w-full border-collapse border-2 border-slate-900 text-[10px] mb-10">
              <thead>
                <tr className="border-b-2 border-slate-900 font-black uppercase tracking-wider">
                  <th className="border-r-2 border-slate-900 p-3 text-center w-12">Sr.</th>
                  <th className="border-r-2 border-slate-900 p-3 text-left">Description of Goods</th>
                  <th className="border-r-2 border-slate-900 p-3 text-center w-24">HSN/SAC</th>
                  <th className="border-r-2 border-slate-900 p-3 text-center w-20">Make</th>
                  <th className="border-r-2 border-slate-900 p-3 text-center w-16">Qty</th>
                  {docType !== "delivery_challan" && (
                    <>
                      <th className="border-r-2 border-slate-900 p-3 text-center w-16">Tax%</th>
                      <th className="border-r-2 border-slate-900 p-3 text-right w-28">Price</th>
                      <th className="p-3 text-right w-32">Total</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-300">
                {items.map((item, i) => (
                  <tr key={item.id}>
                    <td className="border-r-2 border-slate-900 p-3 text-center font-bold">{i + 1}</td>
                    <td className="border-r-2 border-slate-900 p-3 font-black uppercase leading-tight">{item.name}</td>
                    <td className="border-r-2 border-slate-900 p-3 text-center font-bold">{item.hsn}</td>
                    <td className="border-r-2 border-slate-900 p-3 text-center font-bold">{item.make}</td>
                    <td className="border-r-2 border-slate-900 p-3 text-center font-bold">{item.quantity}</td>
                    {docType !== "delivery_challan" && (
                      <>
                        <td className="border-r-2 border-slate-900 p-3 text-center font-bold">{item.taxRate}%</td>
                        <td className="border-r-2 border-slate-900 p-3 text-right font-bold">{item.price.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                        <td className="p-3 text-right font-black">{(item.quantity * item.price).toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
              <tfoot className="border-t-2 border-slate-900 bg-slate-50 font-black uppercase text-[9px]">
                <tr>
                  <td colSpan="4" className="border-r-2 border-slate-900 p-3 text-right">
                    {docType === "delivery_challan" ? "Total Quantity" : "Total Before Tax"}
                  </td>
                  <td className="border-r-2 border-slate-900 p-3 text-center">{totals.totalQty}</td>
                  {docType !== "delivery_challan" && (
                    <>
                      <td className="border-r-2 border-slate-900"></td>
                      <td className="border-r-2 border-slate-900"></td>
                      <td className="p-3 text-right text-[11px]">{totals.subtotal}</td>
                    </>
                  )}
                </tr>
              </tfoot>
            </table>

            {/* Summary Section - AVOID SPLIT */}
            <div className="mt-12 grid grid-cols-2 gap-10 print:break-inside-avoid">
              <div className="space-y-6 text-[10px]">
                <div className="p-2 h-fit bg-white">
                  <p className="font-black uppercase text-[9px] text-slate-400 mb-4 border-b border-slate-100 pb-2 tracking-[0.2em]">Bank Account Details:</p>
                  <div className="space-y-2">
                    <p className="flex justify-between"><span>Bank Name:</span> <span className="font-black uppercase">{myBusiness.bankName}</span></p>
                    <p className="flex justify-between"><span>A/c Number:</span> <span className="font-black uppercase tracking-widest">{myBusiness.accountNumber}</span></p>
                    <p className="flex justify-between"><span>IFSC Code:</span> <span className="font-black uppercase">{myBusiness.ifscCode}</span></p>
                    <p className="flex justify-between"><span>Branch:</span> <span className="font-bold">{myBusiness.branch}</span></p>
                  </div>
                </div>
                <div className="p-2 h-fit bg-white">
                   <p className="font-black uppercase text-[9px] text-slate-400 mb-4 border-b border-slate-100 pb-2 tracking-[0.2em]">Terms & Conditions:</p>
                   <ul className="list-decimal list-inside space-y-2 font-bold text-slate-700">
                      {terms.map((term, i) => term && <li key={i}>{term}</li>)}
                   </ul>
                </div>
              </div>
              <div className="relative">
                {docType === "proforma" && (
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-45 pointer-events-none opacity-[0.03] select-none">
                    <span className="text-8xl font-black whitespace-nowrap">PROFORMA INVOICE</span>
                  </div>
                )}
                
                {docType !== "delivery_challan" ? (
                  <div className="divide-y-2 divide-slate-900 overflow-hidden text-[11px] h-fit bg-white relative">
                    <div className="p-6 flex justify-between items-center">
                      <span className="font-bold text-slate-500 uppercase tracking-widest text-[9px]">Taxable Amount</span>
                      <span className="font-black text-lg">{totals.taxableAmount}</span>
                    </div>
                    {taxType === "gst" ? (
                      <>
                        <div className="p-6 flex justify-between items-center bg-slate-50/50">
                          <span className="font-bold text-slate-500 uppercase tracking-widest text-[9px]">CGST</span>
                          <span className="font-black text-lg">{totals.cgst}</span>
                        </div>
                        <div className="p-6 flex justify-between items-center">
                          <span className="font-bold text-slate-500 uppercase tracking-widest text-[9px]">SGST</span>
                          <span className="font-black text-lg">{totals.sgst}</span>
                        </div>
                      </>
                    ) : (
                      <div className="p-6 flex justify-between items-center bg-slate-50/50">
                        <span className="font-bold text-slate-500 uppercase tracking-widest text-[9px]">IGST</span>
                        <span className="font-black text-lg">{totals.igst}</span>
                      </div>
                    )}
                    <div className="p-6 bg-white border-t-2 border-slate-900 flex justify-between items-center">
                      <div className="text-[10px] uppercase tracking-[0.3em] font-black text-slate-400">Grand Total</div>
                      <div className="text-3xl font-black tracking-tighter text-slate-900">{currency} {totals.grandTotal}</div>
                    </div>
                    <div className="p-7 bg-slate-50 border-t-4 border-slate-100">
                       <span className="font-black text-[9px] uppercase block mb-2 text-slate-400 tracking-[0.2em]">Amount in Words:</span>
                       <p className="font-black text-slate-800 leading-tight text-[13px] uppercase italic">{numberToWords(totals.grandTotalInt)} Only</p>
                    </div>
                  </div>
                ) : (
                  <div className="border-2 border-slate-900 p-8 rounded-[2.5rem] bg-slate-50/50 flex flex-col justify-center items-center text-center space-y-4">
                     <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center">
                        <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                     </div>
                     <p className="font-black uppercase text-[10px] tracking-[0.3em] text-slate-400">Values Hidden for Challan</p>
                     <p className="text-xs font-bold text-slate-500 max-w-[200px]">This document is for transport purposes only and does not contain commercial values.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Signature Area - STRICT AVOID SPLIT */}
            <div className="mt-16 grid grid-cols-2 border-t-2 border-b-2 border-slate-900 h-48 overflow-hidden print:break-inside-avoid bg-white">
              <div className="p-5 border-r-2 border-slate-900 flex flex-col justify-between bg-white">
                 <p className="font-black uppercase text-[10px] tracking-widest">
                    {docType === "delivery_challan" ? "Receiver's Signature:" : "Customer's Acceptance:"}
                 </p>
                 <div className="text-right italic text-slate-300 text-[10px] mb-2 border-b border-dashed border-slate-300 pb-2">Seal & Signature</div>
              </div>
              <div className="p-5 text-center flex flex-col justify-between items-center bg-white relative">
                 <p className="font-black uppercase text-[10px] tracking-tight text-slate-800">For {myBusiness.name}</p>
                 <div className="my-2">
                    {signImg}
                 </div>
                 <div className="w-full flex flex-col items-center">
                    <div className="w-64 border-t-2 border-slate-900 mb-1"></div>
                    <p className="font-black uppercase tracking-widest text-[10px]">Authorized Signatory</p>
                 </div>
              </div>
            </div>
            
            <p className="text-center mt-8 text-[9px] text-slate-400 font-black uppercase tracking-[0.3em]">Computer Generated Document</p>
            
            {/* Custom Footer to replace browser default URL if possible, or just add branding */}
            <div className="hidden print:flex fixed bottom-4 left-0 right-0 justify-between px-10 text-[8px] font-bold text-slate-400 uppercase tracking-widest pointer-events-none">
              <span>Created by PAYIVVA TECHNOLOGIES (OPC) PRIVATE LIMITED</span>
              <span>{customer.name} | {invoiceMeta.invoiceNumber}</span>
            </div>

            {/* Annexure Section - Optional */}
            {showAnnexure && (
              <div className="mt-20 print:break-before-page pt-10">
                <div className="bg-slate-100 p-6 mb-8 border-2 border-slate-900 rounded-2xl">
                   <h2 className="text-2xl font-black text-center uppercase tracking-[0.2em]">Annexure - A</h2>
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
                      <th className="p-3 border-r-2 border-slate-900 text-right w-28">Unit Price (Inc. GST)</th>
                      <th className="p-3 text-right w-32">Total (Inc. GST)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-300">
                    {annexureItems.map((item, i) => (
                      <tr key={item.id} className="font-bold">
                        <td className="p-3 border-r-2 border-slate-900 text-center">{i + 1}</td>
                        <td className="p-3 border-r-2 border-slate-900 uppercase leading-tight">{item.name}</td>
                        <td className="p-3 border-r-2 border-slate-900 text-center uppercase">{item.make}</td>
                        <td className="p-3 border-r-2 border-slate-900 text-center">{item.quantity}</td>
                        <td className="p-3 border-r-2 border-slate-900 text-right">{(item.price * (1 + item.taxRate/100)).toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                        <td className="p-3 text-right font-black">{(item.quantity * item.price * (1 + item.taxRate/100)).toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-slate-900 font-black bg-slate-50">
                      <td colSpan="5" className="p-3 border-r-2 border-slate-900 text-right uppercase tracking-widest">Grand Total</td>
                      <td className="p-3 text-right text-sm">{currency} {annexureTotal}</td>
                    </tr>
                  </tfoot>
                </table>
                <div className="mt-8 text-[9px] text-slate-400 font-bold italic">
                   Note: This Annexure is part of {getDocTypeDisplayName()} {invoiceMeta.invoiceNumber} and should be read in conjunction with the same.
                </div>
              </div>
            )}
          </div>
        );
      default:
        return <div className="p-20 text-center uppercase opacity-10 font-black">Template Coming Soon</div>;
    }
  };

  const renderDashboard = () => {
    const stats = {
      total: savedInvoices.reduce((acc, inv) => acc + parseFloat(inv.grand_total), 0),
      paid: savedInvoices.filter(inv => inv.status === 'paid').reduce((acc, inv) => acc + parseFloat(inv.grand_total), 0),
      pending: savedInvoices.filter(inv => inv.status === 'pending').reduce((acc, inv) => acc + parseFloat(inv.grand_total), 0),
      count: savedInvoices.length
    };

    return (
      <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
           <div className="bg-white p-8 rounded-[2.5rem] border-2 border-slate-100 shadow-sm">
              <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2">Total Billed</p>
              <h3 className="text-3xl font-black text-slate-900">{currency} {stats.total.toLocaleString()}</h3>
           </div>
           <div className="bg-green-50 p-8 rounded-[2.5rem] border-2 border-green-100 shadow-sm">
              <p className="text-[10px] font-black uppercase text-green-600 tracking-widest mb-2">Received (Paid)</p>
              <h3 className="text-3xl font-black text-green-900">{currency} {stats.paid.toLocaleString()}</h3>
           </div>
           <div className="bg-orange-50 p-8 rounded-[2.5rem] border-2 border-orange-100 shadow-sm">
              <p className="text-[10px] font-black uppercase text-orange-600 tracking-widest mb-2">Pending</p>
              <h3 className="text-3xl font-black text-orange-900">{currency} {stats.pending.toLocaleString()}</h3>
           </div>
           <div className="bg-blue-50 p-8 rounded-[2.5rem] border-2 border-blue-100 shadow-sm">
              <p className="text-[10px] font-black uppercase text-blue-600 tracking-widest mb-2">Docs Generated</p>
              <h3 className="text-3xl font-black text-blue-900">{stats.count}</h3>
           </div>
        </div>

        <div className="bg-white rounded-[3rem] border-2 border-slate-100 overflow-hidden shadow-xl">
           <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="font-black uppercase text-xs tracking-widest text-slate-800">Recent Activity</h3>
              <button onClick={() => setActiveTab("templates")} className="text-[10px] font-black text-blue-600 uppercase">View All Invoices</button>
           </div>
           <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[10px] font-black uppercase text-slate-400 bg-slate-50 border-b border-slate-100">
                    <th className="px-8 py-5">Date</th>
                    <th className="px-8 py-5">Invoice #</th>
                    <th className="px-8 py-5">Customer</th>
                    <th className="px-8 py-5 text-right">Amount</th>
                    <th className="px-8 py-5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {savedInvoices.slice(0, 5).map(inv => (
                    <tr key={inv.id} className="text-xs font-bold hover:bg-slate-50/50 transition-colors">
                       <td className="px-8 py-5 text-slate-500">{new Date(inv.issue_date).toLocaleDateString()}</td>
                       <td className="px-8 py-5 uppercase font-black">{inv.invoice_number}</td>
                       <td className="px-8 py-5 uppercase">{inv.customer_name}</td>
                       <td className="px-8 py-5 text-right font-black">{currency} {inv.grand_total}</td>
                       <td className="px-8 py-5">
                          <span className={`px-4 py-2 rounded-full text-[9px] uppercase font-black ${inv.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                            {inv.status}
                          </span>
                       </td>
                    </tr>
                  ))}
                </tbody>
              </table>
           </div>
        </div>
      </div>
    );
  };

  const renderInvoicesList = () => {
    return (
      <div className="bg-white rounded-[3rem] border-2 border-slate-100 overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-500">
         <div className="p-10 border-b border-slate-100 flex justify-between items-center">
            <h3 className="font-black uppercase text-sm tracking-widest">Invoices History</h3>
            <button onClick={() => setActiveTab("invoices")} className="bg-slate-900 text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest">+ New Invoice</button>
         </div>
         <div className="overflow-x-auto">
            <table className="w-full text-left">
               <thead>
                  <tr className="text-[10px] font-black uppercase text-slate-400 bg-slate-50/50 border-b border-slate-100">
                    <th className="px-8 py-6">Invoice #</th>
                    <th className="px-8 py-6">Date</th>
                    <th className="px-8 py-6">Client</th>
                    <th className="px-8 py-6">Type</th>
                    <th className="px-8 py-6 text-right">Total</th>
                    <th className="px-8 py-6">Status</th>
                    <th className="px-8 py-6 text-center">Actions</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-100">
                  {savedInvoices.map(inv => (
                    <tr key={inv.id} className="group hover:bg-slate-50 transition-all">
                       <td className="px-8 py-6 font-black text-xs uppercase">{inv.invoice_number}</td>
                       <td className="px-8 py-6 text-xs font-bold text-slate-500">{new Date(inv.issue_date).toLocaleDateString()}</td>
                       <td className="px-8 py-6 text-xs font-black uppercase text-slate-700">{inv.customer_name}</td>
                       <td className="px-8 py-6"><span className="text-[9px] font-black uppercase bg-slate-100 px-3 py-1 rounded-lg text-slate-500">{inv.doc_type.replace('_', ' ')}</span></td>
                       <td className="px-8 py-6 text-right font-black text-xs">{currency} {inv.grand_total}</td>
                       <td className="px-8 py-6">
                          <select 
                            value={inv.status} 
                            onChange={(e) => updateStatus(inv.id, e.target.value)}
                            className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase outline-none border-none cursor-pointer ${inv.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}
                          >
                             <option value="pending">Pending</option>
                             <option value="paid">Paid</option>
                             <option value="cancelled">Cancelled</option>
                          </select>
                       </td>
                       <td className="px-8 py-6 text-center space-x-2 flex items-center justify-center">
                          <button onClick={() => loadInvoice(inv)} className="bg-white border border-slate-200 text-slate-600 px-4 py-2 rounded-xl text-[9px] font-black uppercase hover:bg-slate-900 hover:text-white transition-all shadow-sm">View / Edit</button>
                          <button 
                            onClick={() => {
                              loadInvoice(inv);
                              setTimeout(handleDownloadPDF, 500);
                            }} 
                            className="bg-blue-600 text-white px-4 py-2 rounded-xl text-[9px] font-black uppercase hover:bg-blue-700 transition-all shadow-sm"
                          >
                            PDF
                          </button>
                       </td>
                    </tr>
                  ))}
               </tbody>
            </table>
         </div>
         {savedInvoices.length === 0 && (
           <div className="p-20 text-center space-y-4">
              <p className="text-slate-400 font-black uppercase text-xs tracking-widest">No invoices found yet.</p>
              <button onClick={() => setActiveTab("invoices")} className="text-blue-600 font-black text-xs uppercase underline">Create your first bill</button>
           </div>
         )}
      </div>
    );
  };

  const renderTimeline = () => {
    const pendingInvoices = savedInvoices.filter(inv => inv.status === 'pending');
    return (
      <div className="space-y-8 animate-in fade-in slide-in-from-left-4 duration-500">
        <div className="flex justify-between items-center bg-white p-8 rounded-[2.5rem] border-2 border-slate-100">
           <div>
              <h3 className="text-xl font-black text-slate-900 tracking-tighter">Payment Timeline</h3>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Expected Incoming Payments</p>
           </div>
           <div className="text-right">
              <span className="text-[10px] font-black text-orange-500 uppercase tracking-widest block">Total Pending</span>
              <span className="text-2xl font-black text-slate-900">{currency} {pendingInvoices.reduce((acc, inv) => acc + parseFloat(inv.grand_total), 0).toLocaleString()}</span>
           </div>
        </div>

        <div className="relative pl-10 space-y-8 before:absolute before:left-[11px] before:top-4 before:bottom-4 before:w-[2px] before:bg-slate-100">
           {pendingInvoices.map((inv, idx) => (
             <div key={inv.id} className="relative group">
                <div className="absolute -left-[35px] top-4 w-4 h-4 rounded-full bg-white border-4 border-orange-500 group-hover:scale-125 transition-all"></div>
                <div className="bg-white p-8 rounded-[2rem] border-2 border-slate-50 shadow-sm hover:shadow-xl transition-all hover:-translate-y-1">
                   <div className="flex justify-between items-start">
                      <div className="space-y-1">
                         <span className="text-[10px] font-black text-slate-400 uppercase">{new Date(inv.issue_date).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                         <h4 className="font-black text-slate-900 uppercase tracking-tight">{inv.customer_name}</h4>
                         <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Inv: {inv.invoice_number}</p>
                      </div>
                      <div className="text-right">
                         <span className="text-lg font-black text-slate-900">{currency} {inv.grand_total}</span>
                         <button onClick={() => updateStatus(inv.id, 'paid')} className="block mt-4 text-[9px] font-black text-green-600 border border-green-200 px-4 py-2 rounded-xl hover:bg-green-600 hover:text-white transition-all uppercase">Mark as Paid</button>
                      </div>
                   </div>
                </div>
             </div>
           ))}
           {pendingInvoices.length === 0 && (
             <div className="p-20 text-center border-4 border-dashed border-slate-100 rounded-[3rem]">
                <p className="text-slate-300 font-black uppercase text-xs tracking-widest">No pending payments found.</p>
             </div>
           )}
        </div>
      </div>
    );
  };

  const renderPlaceholder = (title) => (
    <div className="p-20 text-center space-y-6 animate-in zoom-in-95 duration-500">
       <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto">
          <svg className="w-10 h-10 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
       </div>
       <div className="space-y-2">
          <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">{title}</h2>
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest">This module is under development</p>
       </div>
       <button onClick={() => setActiveTab("invoices")} className="bg-slate-900 text-white px-10 py-5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-blue-600 transition-all">Go back to Invoices</button>
    </div>
  );

  const renderContent = () => {
    if (activeTab === "dashboard") return renderDashboard();
    if (activeTab === "templates") return renderInvoicesList();
    if (activeTab === "timeline") return renderTimeline();
    if (["purchase", "credit_note", "purchase_orders", "expenses"].includes(activeTab)) {
      return renderPlaceholder(activeTab.replace('_', ' '));
    }
    if (activeTab === "invoices") {
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
                { id: "delivery_challan", label: "Challan" }
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
                   <select 
                     className="w-full text-xs font-bold bg-white p-3 rounded-xl border border-slate-200 outline-none"
                     onChange={(e) => {
                       const client = clients.find(c => c.id == e.target.value);
                       if (client) selectClient(client);
                     }}
                   >
                     <option value="">-- Search / Choose Client --</option>
                     {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                   </select>
                </div>
                <input type="text" placeholder="Buyer Name" className="w-full font-black text-md text-slate-800 outline-none uppercase" value={customer.name} onChange={(e) => handleCustomerChange("name", e.target.value)} />
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
                    <th className="px-8 py-5 w-24 text-center">HSN</th>
                    <th className="px-8 py-5 w-16 text-center">Qty</th>
                    <th className="px-8 py-5 w-24 text-center">Tax %</th>
                    <th className="px-8 py-5 w-32 text-right">Price</th>
                    <th className="px-8 py-5 w-32 text-right">Total</th>
                    <th className="px-8 py-5 w-12"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {items.map((item, index) => (
                    <tr key={item.id} className="group hover:bg-blue-50/30 transition-colors">
                      <td className="px-8 py-5 text-xs font-black text-slate-400 text-center">{index + 1}</td>
                      <td className="px-8 py-5">
                        <div className="space-y-2">
                          <input type="text" className="w-full bg-transparent border-none outline-none text-xs font-black text-slate-800 uppercase" placeholder="Product..." value={item.name} onChange={(e) => handleItemChange(item.id, "name", e.target.value)} />
                          <select 
                            className="w-full text-[9px] bg-slate-50 border-none outline-none text-slate-400"
                            onChange={(e) => {
                              const prod = products.find(p => p.id == e.target.value);
                              if (prod) selectProduct(item.id, prod);
                            }}
                          >
                            <option value="">-- Select Product --</option>
                            {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                          </select>
                        </div>
                      </td>
                      <td className="px-8 py-5"><input type="text" className="w-full bg-transparent border-none outline-none text-xs text-center font-bold" placeholder="HSN" value={item.hsn} onChange={(e) => handleItemChange(item.id, "hsn", e.target.value)} /></td>
                      <td className="px-8 py-5"><input type="number" className="w-full bg-transparent border-none text-center outline-none text-xs font-black" value={item.quantity} onChange={(e) => handleItemChange(item.id, "quantity", parseFloat(e.target.value) || 0)} /></td>
                      <td className="px-8 py-5"><input type="number" className="w-full bg-transparent border-none text-center outline-none text-xs font-bold text-blue-600" value={item.taxRate} onChange={(e) => handleItemChange(item.id, "taxRate", parseFloat(e.target.value) || 0)} /></td>
                      <td className="px-8 py-5"><input type="number" className="w-full bg-transparent border-none text-right outline-none text-xs font-black" value={item.price} onChange={(e) => handleItemChange(item.id, "price", parseFloat(e.target.value) || 0)} /></td>
                      <td className="px-8 py-5 text-xs font-black text-slate-900 text-right">{(item.quantity * item.price).toLocaleString()}</td>
                      <td className="px-8 py-5 text-center"><button type="button" onClick={() => removeItem(item.id)} disabled={items.length === 1} className="text-slate-300 hover:text-red-500 disabled:hidden transition-colors"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="p-6 border-t border-slate-50 bg-slate-50/30"><button type="button" onClick={addItem} className="flex items-center gap-3 text-[10px] font-black uppercase text-blue-600 hover:text-blue-700 transition-all hover:translate-x-1"><div className="w-6 h-6 bg-blue-600 text-white rounded-lg flex items-center justify-center">+</div>Add Item Row</button></div>
          </div>

          {showAnnexure && (
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden animate-in slide-in-from-top-4 duration-500">
               <div className="px-8 py-5 border-b border-slate-100 bg-slate-900 flex justify-between items-center">
                  <h3 className="font-black text-white uppercase text-[10px] tracking-[0.3em]">Annexure Details (BOQ)</h3>
                  <span className="text-[10px] font-bold text-slate-400 italic">This list will appear on a separate page</span>
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
                        <th className="px-4 py-5 w-12"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {annexureItems.map((item, i) => (
                        <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-4 py-5 text-center text-xs font-black text-slate-300">{i + 1}</td>
                          <td className="px-4 py-5"><input type="text" className="w-full bg-transparent border-none outline-none text-xs font-black text-slate-800 uppercase" placeholder="Detailed Item..." value={item.name} onChange={(e) => handleAnnexureItemChange(item.id, "name", e.target.value)} /></td>
                          <td className="px-4 py-5"><input type="text" className="w-full bg-transparent border-none outline-none text-xs text-center font-bold" placeholder="Make" value={item.make} onChange={(e) => handleAnnexureItemChange(item.id, "make", e.target.value)} /></td>
                          <td className="px-4 py-5"><input type="number" className="w-full bg-transparent border-none text-center outline-none text-xs font-black" value={item.quantity} onChange={(e) => handleAnnexureItemChange(item.id, "quantity", parseFloat(e.target.value) || 0)} /></td>
                          <td className="px-4 py-5"><input type="number" className="w-full bg-transparent border-none text-center outline-none text-xs font-bold text-blue-600" value={item.taxRate} onChange={(e) => handleAnnexureItemChange(item.id, "taxRate", parseFloat(e.target.value) || 0)} /></td>
                          <td className="px-4 py-5"><input type="number" className="w-full bg-transparent border-none text-right outline-none text-xs font-black" value={item.price} onChange={(e) => handleAnnexureItemChange(item.id, "price", parseFloat(e.target.value) || 0)} /></td>
                          <td className="px-4 py-5 text-center"><button type="button" onClick={() => removeAnnexureItem(item.id)} disabled={annexureItems.length === 1} className="text-slate-300 hover:text-red-500 disabled:hidden transition-colors"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"/></svg></button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
               </div>
               <div className="p-6 border-t border-slate-50 bg-slate-50/30">
                  <button type="button" onClick={addAnnexureItem} className="flex items-center gap-3 text-[10px] font-black uppercase text-blue-600 hover:text-blue-700 transition-all hover:translate-x-1">
                    <div className="w-6 h-6 bg-slate-900 text-white rounded-lg flex items-center justify-center">+</div>
                    Add Annexure Row
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

          <div className="flex flex-col md:flex-row justify-end items-center gap-6 mt-10 p-10 bg-white rounded-3xl border border-slate-100">
             <div className="flex flex-col items-end">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Total Amount Payable</span>
                <span className="text-4xl font-black text-slate-900">{currency} {totals.grandTotal}</span>
             </div>
             <button type="submit" className="w-full md:w-auto bg-slate-900 text-white font-black uppercase tracking-widest py-6 px-12 rounded-2xl hover:bg-blue-600 transition-all active:scale-95">Download PDF</button>
          </div>
        </form>
      );
    }
    return <div className="p-20 text-center uppercase opacity-10 font-black tracking-widest text-4xl">Coming Soon</div>;
  };

  return (
    <div className="flex min-h-screen bg-[#F1F5F9] font-sans text-slate-900">
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          @page { 
            size: A4; 
            margin: 15mm 15mm 20mm 15mm; 
          }
          body { background: white !important; }
          .print-container { 
            width: 210mm !important; 
            padding: 0 !important; 
            margin: 0 !important; 
            border: none !important; 
            box-shadow: none !important; 
          }
          .no-print { display: none !important; }
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          .print-break-inside-avoid { break-inside: avoid !important; page-break-inside: avoid !important; }
          
          /* Prevent table header and footer from repeating on every page as per user feedback */
          thead, tfoot { display: table-row-group; }
          
          /* Ensure smooth page transitions */
          table { page-break-inside: auto; }
          tr { page-break-inside: avoid; page-break-after: auto; }
        }
      `}} />

      <aside className="w-64 bg-white border-r-2 border-slate-100 flex flex-col fixed inset-y-0 left-0 z-50 no-print">
        <div className="p-10 flex items-center gap-4">
          <img src={myBusiness.logo} alt="L" className="w-10 h-10 object-contain" />
          <span className="font-black text-2xl tracking-tighter text-slate-900 italic">Payivva.</span>
        </div>
        <nav className="flex-1 p-8 space-y-3 overflow-y-auto max-h-screen pb-20">
          {[
            { id: "dashboard", label: "Dashboard" },
            { id: "invoices", label: "Sales Invoice" },
            { id: "templates", label: "Invoice History" },
            { id: "purchase", label: "Purchase" },
            { id: "credit_note", label: "Credit Note" },
            { id: "purchase_orders", label: "Purchase Orders" },
            { id: "expenses", label: "Expenses" },
            { id: "timeline", label: "Payment Timeline" }
          ].map(item => (
            <button key={item.id} onClick={() => { setActiveTab(item.id); setIsPreviewMode(false); }} className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-300 font-black text-[9px] uppercase tracking-[0.2em] ${activeTab === item.id ? "bg-slate-900 text-white shadow-2xl shadow-slate-300 scale-105" : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"}`}>
              {item.label}
            </button>
          ))}
        </nav>
      </aside>

      <main className="flex-1 ml-64 no-print transition-all duration-300">
        <header className="h-24 bg-white/80 backdrop-blur-xl border-b-2 border-slate-100 px-12 flex items-center justify-between sticky top-0 z-40">
          <h2 className="text-2xl font-black text-slate-900 tracking-tighter capitalize">{activeTab}</h2>
          <div className="flex items-center gap-4">
            {activeTab === "invoices" && (
              <button onClick={() => setIsPreviewMode(!isPreviewMode)} className={`px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl transition-all ${isPreviewMode ? "bg-blue-600 text-white shadow-blue-200" : "bg-white text-slate-600 hover:bg-slate-50"}`}>
                {isPreviewMode ? "Edit Form" : "Live Preview"}
              </button>
            )}
            <button onClick={activeTab === "invoices" ? handleSubmit : () => {}} className="bg-slate-900 text-white font-black text-[10px] uppercase tracking-[0.2em] py-4 px-10 rounded-2xl shadow-2xl shadow-slate-300 transition-all hover:scale-105 flex items-center gap-3">
              {activeTab === "invoices" ? "Save & Print" : `Add New`}
            </button>
          </div>
        </header>
        <div className="p-12 max-w-7xl mx-auto">{renderContent()}</div>
      </main>

      <div id="print-template" className="hidden print:block print-container">
         {renderPrintTemplate()}
      </div>
    </div>
  );
};

export default InvoiceCreator;
