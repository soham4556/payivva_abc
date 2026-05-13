import React, { useState, useMemo, useEffect } from "react";
import Sidebar from "./InvoiceCreator/components/Sidebar";
import Dashboard from "./InvoiceCreator/components/Dashboard";
import InvoiceList from "./InvoiceCreator/components/InvoiceList";
import CancelledInvoices from "./InvoiceCreator/components/CancelledInvoices";
import Timeline from "./InvoiceCreator/components/Timeline";
import Inventory from "./InvoiceCreator/components/Inventory";
import PurchaseOrderForm from "./InvoiceCreator/components/PurchaseOrderForm";
import PurchaseOrderHistory from "./InvoiceCreator/components/PurchaseOrderHistory";
import InvoiceForm from "./InvoiceCreator/components/InvoiceForm";
import TaxInvoiceTemplate from "./InvoiceCreator/templates/TaxInvoiceTemplate";
import POTemplate from "./InvoiceCreator/templates/POTemplate";
import Expenses from "./InvoiceCreator/components/Expenses";
import RecycleBin from "./InvoiceCreator/components/RecycleBin";
import Analytics from "./InvoiceCreator/components/Analytics";
import AuditTemplate from "./InvoiceCreator/templates/AuditTemplate";
import PaidHistory from "./InvoiceCreator/components/PaidHistory";
import DailyArchives from "./InvoiceCreator/components/DailyArchives";

const InvoiceCreator = () => {
  const [docType, setDocType] = useState("invoice");
  const [currency, setCurrency] = useState("₹");
  const [activeTab, setActiveTab] = useState("dashboard");
  const [poItems, setPoItems] = useState([]);
  const [poMeta, setPoMeta] = useState({
    poNumber:
      "PO/" +
      new Date().getFullYear() +
      "/" +
      Math.floor(Math.random() * 1000)
        .toString()
        .padStart(3, "0"),
    poDate: new Date().toISOString().split("T")[0],
    vendor: "",
    address: "",
    gstin: "",
  });
  const [selectedTemplate, setSelectedTemplate] = useState("modern");
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [isPOPrinting, setIsPOPrinting] = useState(false);
  const [activePOSearchId, setActivePOSearchId] = useState(null);
  const [showAnnexure, setShowAnnexure] = useState(false);
  const [editingPOId, setEditingPOId] = useState(null);
  const [isClearingHistory, setIsClearingHistory] = useState(false);
  const [clearProgress, setClearProgress] = useState({ current: 0, total: 0 });
  const [expenses, setExpenses] = useState([]);
  const [revenueLogs, setRevenueLogs] = useState([]);
  const [isAuditPrinting, setIsAuditPrinting] = useState(false);
  const [auditReportData, setAuditReportData] = useState([]);
  const [auditTimeframe, setAuditTimeframe] = useState("monthly");

  const [invoiceMeta, setInvoiceMeta] = useState({
    invoiceNumber: "INV/2026/042",
    issueDate: new Date().toISOString().split("T")[0],
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    poNumber: "PO-BMI-9921",
    poDate: "2026-05-10",
    transport: "By Road",
    vehicleNumber: "MH-12-AB-1234",
    lrNumber: "",
    dispatchThrough: "",
    validity: "15 Days",
    state: "Maharashtra",
    stateCode: "27",
  });

  const [myBusiness, setMyBusiness] = useState({
    name: "PAYIVVA TECHNOLOGIES (OPC) PRIVATE LIMITED",
    address:
      "House no.105, Green Park - Venkatesh Properties, Undri Pune City, MAHARASHTRA, 411060",
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
    signature: "/digital_sign.png",
  });

  const [terms, setTerms] = useState([
    "Payment in favor of PAYIVVA TECHNOLOGIES (OPC) PRIVATE LIMITED",
    "Interest @ 24% for delayed payment.",
    "Subject to Pune Jurisdiction only.",
  ]);

  const [taxType, setTaxType] = useState("igst");
  const [customer, setCustomer] = useState({
    name: "",
    address: "",
    gstin: "",
    site: "",
    contactPerson: "",
    phone: "",
  });
  const [discountPercent, setDiscountPercent] = useState(0);
  const [savedInvoices, setSavedInvoices] = useState([]);
  const [clients, setClients] = useState([]);
  const [products, setProducts] = useState([]);
  const [inventoryForm, setInventoryForm] = useState({
    name: "",
    hsn: "",
    make: "",
    price: "",
    stock: 0,
    min_stock: 5,
  });
  const [editingProductId, setEditingProductId] = useState(null);
  const [savedPOs, setSavedPOs] = useState([]);
  const [inventorySearch, setInventorySearch] = useState("");
  const [isLoading, setIsLoading] = useState(false);
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
  const [annexures, setAnnexures] = useState([
    {
      id: Date.now(),
      title: "Annexure - A",
      items: [
        {
          id: Date.now() + 1,
          name: "",
          make: "",
          quantity: 1,
          price: 0,
          taxRate: 18,
        },
      ],
    },
  ]);

  // API Methods
  const fetchInvoices = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/invoices");
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
      const response = await fetch("/api/clients");
      const data = await response.json();
      setClients(data);
    } catch (err) {
      console.error("Error fetching clients:", err);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await fetch("/api/products");
      const data = await response.json();
      setProducts(data);
    } catch (err) {
      console.error("Error fetching products:", err);
    }
  };

  const fetchExpenses = async () => {
    try {
      const response = await fetch("/api/expenses");
      const data = await response.json();
      setExpenses(data);
    } catch (err) {
      console.error("Error fetching expenses:", err);
    }
  };

  const fetchRevenue = async () => {
    try {
      const response = await fetch("/api/revenue");
      const data = await response.json();
      setRevenueLogs(data);
    } catch (err) {
      console.error("Error fetching revenue:", err);
    }
  };

  const fetchPOs = async () => {
    try {
      const response = await fetch("/api/purchase_orders");
      if (response.ok) {
        const data = await response.json();
        setSavedPOs(data);
      }
    } catch (err) {
      console.error("Error fetching POs:", err);
    }
  };

  useEffect(() => {
    fetchInvoices();
    fetchClients();
    fetchProducts();
    fetchExpenses();
    fetchPOs();
    fetchRevenue();

    // Auto-Purge Recycle Bin Check
    const checkAutoPurge = async () => {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();

      // If it's between 12:00 AM and 12:10 AM, trigger the purge
      if (hours === 0 && minutes <= 10) {
        try {
          await fetch("/api/recycle-bin/purge", { method: "POST" });
          console.log("♻️ Midnight Auto-Purge Complete");
        } catch (e) {
          console.error("Auto-purge failed", e);
        }
      }
    };
    checkAutoPurge();
  }, []);

  useEffect(() => {
    if (activeTab === "purchase_orders" && poItems.length === 0) {
      const lowStock = products.filter((p) => p.stock <= 50);
      if (lowStock.length > 0) {
        setPoItems(
          lowStock.map((p) => ({
            id: Date.now() + Math.random(),
            name: p.name,
            hsn: p.hsn || "",
            make: p.make || "",
            quantity: 1,
            price: parseFloat(p.price) || 0,
            taxRate: parseFloat(p.tax_rate) || 18,
          })),
        );
      }
    }
  }, [activeTab, products]);

  const saveClientToDB = async () => {
    try {
      const response = await fetch("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(customer),
      });
      if (response.ok) {
        alert("Client saved to database!");
        fetchClients();
      }
    } catch (err) {
      console.error("Error saving client:", err);
    }
  };

  const deleteClient = async (id) => {
    if (!window.confirm("🗑️ Are you sure you want to delete this saved client?"))
      return;
    try {
      const response = await fetch(`/api/clients/${id}`, { method: "DELETE" });
      if (response.ok) {
        fetchClients();
        setCustomer({
          name: "",
          address: "",
          gstin: "",
          site: "",
          phone: "",
          email: "",
          state: "Maharashtra",
        });
        alert("Client deleted successfully!");
      }
    } catch (err) {
      console.error("Error deleting client:", err);
    }
  };

  const selectClient = (client) => {
    if (!client) return;
    setCustomer({
      name: client.name || "",
      address: client.address || "",
      gstin: client.gst || "",
      site: client.site || "",
      phone: client.phone || "",
      email: client.email || "",
      state: client.state || "Maharashtra",
    });
  };

  const selectProduct = (itemId, product) => {
    if (product.stock <= 0)
      alert(`⚠️ STOCK ALERT: "${product.name.toUpperCase()}" is OUT OF STOCK!`);
    else if (product.stock <= 50)
      alert(
        `💡 LOW STOCK: Only ${product.stock} items left for "${product.name.toUpperCase()}".`,
      );

    setItems((prevItems) =>
      prevItems.map((item) =>
        item.id === itemId
          ? {
              ...item,
              name: product.name,
              hsn: product.hsn || "",
              make: product.make || "",
              price: parseFloat(product.price) || 0,
              taxRate: parseFloat(product.tax_rate) || 18,
              stockHint: product.stock,
            }
          : item,
      ),
    );
  };

  const selectAnnexureProduct = (sectionId, itemId, product) => {
    if (product.stock <= 0)
      alert(`⚠️ STOCK ALERT: "${product.name.toUpperCase()}" is OUT OF STOCK!`);
    setAnnexures(
      annexures.map((ann) =>
        ann.id === sectionId
          ? {
              ...ann,
              items: ann.items.map((i) =>
                i.id === itemId
                  ? {
                      ...i,
                      name: product.name,
                      make: product.make || "",
                      price: parseFloat(product.price) || 0,
                      taxRate: parseFloat(product.tax_rate) || 18,
                    }
                  : i,
              ),
            }
          : ann,
      ),
    );
  };

  const deleteProduct = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?"))
      return;
    try {
      const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
      if (res.ok) fetchProducts();
    } catch (err) {
      console.error("Error deleting product:", err);
    }
  };

  const startEditProduct = (product) => {
    setEditingProductId(product.id);
    setInventoryForm({
      name: product.name,
      hsn: product.hsn,
      make: product.make,
      price: product.price,
      stock: product.stock,
      min_stock: product.min_stock,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cancelEdit = () => {
    setEditingProductId(null);
    setInventoryForm({
      name: "",
      hsn: "",
      make: "",
      price: "",
      stock: 0,
      min_stock: 5,
    });
  };

  const saveOrUpdateProduct = async () => {
    if (!inventoryForm.name) return alert("Product name is required!");
    try {
      const url = editingProductId
        ? `/api/products/${editingProductId}`
        : "/api/products";
      const method = editingProductId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...inventoryForm, tax_rate: 18 }),
      });
      if (res.ok) {
        fetchProducts();
        cancelEdit();
        alert("Product saved/updated successfully!");
      }
    } catch (err) {
      console.error("Save error:", err);
    }
  };

  const updateStatus = async (id, newStatus) => {
    const currentInvoice = savedInvoices.find((inv) => inv.id === id);
    const oldStatus = currentInvoice ? currentInvoice.status : "";
    let finalStatus = newStatus;

    if (newStatus === "paid") {
      if (!window.confirm("✅ Mark as PAID? (This will deduct STOCK)")) return;

      const shouldArchive = window.confirm(
        "📁 Move this to 'Paid History' Archives?\n\n(Yes = Move to Paid Section, No = Keep in Active History)",
      );
      if (shouldArchive) {
        finalStatus = "paid_archived";
      }
    } else if (
      (oldStatus === "paid" || oldStatus === "paid_archived") &&
      (newStatus === "pending" || newStatus === "active")
    ) {
      alert(
        "♻️ Status changed back to PENDING. Stock will be RESTORED and Revenue record will be removed.",
      );
    }

    try {
      const response = await fetch(`/api/invoices/${id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: finalStatus }),
      });
      if (response.ok) {
        fetchInvoices();
        fetchProducts();
        fetchRevenue();
      }
    } catch (err) {
      console.error("Error updating status:", err);
    }
  };

  const reprintPO = (po) => {
    setPoMeta({
      poNumber: po.po_number,
      poDate: po.po_date,
      vendor: po.vendor_name,
    });
    setPoItems(JSON.parse(po.items));
    setIsPOPrinting(true);
    setTimeout(() => {
      window.print();
      setIsPOPrinting(false);
    }, 500);
  };

  const loadPO = (po) => {
    setPoMeta({
      poNumber: po.po_number,
      poDate: po.po_date,
      vendor: po.vendor_name,
    });
    setPoItems(JSON.parse(po.items));
    setEditingPOId(po.id);
    setActiveTab("purchase_orders");
    setIsPreviewMode(false);
  };

  const updatePOStatus = async (id, newStatus) => {
    if (newStatus === "received") {
      if (
        !window.confirm(
          "📦 Marking as RECEIVED will automatically ADD these items to your Inventory Stock. Proceed?",
        )
      )
        return;
    }
    try {
      const response = await fetch(`/api/purchase_orders/${id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (response.ok) {
        alert(`✅ Status updated to ${newStatus.toUpperCase()}`);
        fetchPOs();
        if (newStatus === "received") fetchProducts(); // Refresh stock
      }
    } catch (err) {
      console.error("Error updating PO status:", err);
    }
  };

  const bulkClearPOHistory = async () => {
    if (savedPOs.length === 0) return alert("No history to move!");
    if (
      !window.confirm(
        `⚠️ Move all ${savedPOs.length} Purchase Orders to the Recycle Bin?`,
      )
    )
      return;

    setIsClearingHistory(true);
    try {
      const res = await fetch("/api/purchase_orders/bulk-trash", {
        method: "POST",
      });
      const result = await res.json();
      if (result.success) {
        setSavedPOs([]);
        alert("✅ SUCCESS: All POs moved to Recycle Bin.");
        fetchPOs();
      } else {
        alert("❌ Error: " + (result.error || "Failed to move records"));
      }
    } catch (err) {
      console.error("Bulk clear error:", err);
      alert("❌ Operation Failed.");
    } finally {
      setIsClearingHistory(false);
    }
  };

  const cancelInvoice = async (id) => {
    if (!window.confirm("♻️ Cancel this invoice? This will RESTORE STOCK and REMOVE REVENUE from Analytics.")) return;
    try {
      const response = await fetch(`/api/invoices/${id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "cancelled" }),
      });
      if (response.ok) {
        fetchInvoices();
        fetchProducts();
        fetchRevenue();
        alert("✅ Invoice Cancelled! Stock restored and Revenue removed.");
      }
    } catch (err) {
      console.error("Error cancelling invoice:", err);
    }
  };

  const deleteInvoice = async (id) => {
    if (!window.confirm("🗑️ Move to Recycle Bin? Stock will NOT be affected."))
      return;
    try {
      const response = await fetch(`/api/invoices/${id}?restore=false`, {
        method: "DELETE",
      });
      const result = await response.json();
      if (result.success) {
        fetchInvoices();
        fetchRevenue();
        alert("🗑️ Entry moved to Recycle Bin.");
      }
    } catch (err) {
      console.error("Error moving to trash:", err);
    }
  };

  const permanentDeleteInvoice = async (id) => {
    if (
      !window.confirm(
        "⚠️ PERMANENT DELETE: This record will be erased forever from the database. This action cannot be undone. Proceed?",
      )
    )
      return;
    try {
      const response = await fetch(`/api/invoices/${id}?permanent=true`, {
        method: "DELETE",
      });
      const result = await response.json();
      if (result.success) {
        fetchInvoices();
        fetchProducts();
        fetchRevenue();
        alert("✅ Record permanently deleted.");
      } else alert("❌ Error: " + (result.error || "Failed to delete"));
    } catch (err) {
      console.error("Error deleting invoice:", err);
    }
  };

  const clearForm = () => {
    if (!window.confirm("🧹 Are you sure you want to clear the screen?"))
      return;
    resetFormOnly();
  };

  const resetFormOnly = () => {
    setDocType("invoice");
    setInvoiceMeta({
      invoiceNumber:
        "INV/" +
        new Date().getFullYear() +
        "/" +
        Math.floor(Math.random() * 1000)
          .toString()
          .padStart(3, "0"),
      issueDate: new Date().toISOString().split("T")[0],
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
      poNumber: "",
      poDate: "",
      transport: "By Road",
      vehicleNumber: "",
      lrNumber: "",
      dispatchThrough: "",
      validity: "15 Days",
      state: "Maharashtra",
      stateCode: "27",
    });
    setCustomer({
      name: "",
      address: "",
      phone: "",
      email: "",
      gstin: "",
      state: "Maharashtra",
      site: "",
    });
    setItems([
      {
        id: Date.now(),
        name: "",
        hsn: "",
        quantity: 1,
        price: 0,
        taxRate: 18,
        make: "",
      },
    ]);
    setAnnexures([]);
    setShowAnnexure(false);
    setIsPreviewMode(false);
  };

  const bulkClearHistory = async () => {
    if (savedInvoices.length === 0) return alert("No records to move!");

    if (
      !window.confirm(
        `⚠️ Are you sure? All ${savedInvoices.length} invoices will be moved to the Recycle Bin. You can restore them later.`,
      )
    )
      return;

    setIsClearingHistory(true);
    try {
      const res = await fetch("/api/invoices/bulk-trash", { method: "POST" });
      const result = await res.json();
      if (result.success) {
        setSavedInvoices([]);
        alert(`✅ SUCCESS: All invoices moved to Recycle Bin.`);
        fetchInvoices();
      } else {
        alert("❌ Error: " + (result.error || "Failed to move records"));
      }
    } catch (err) {
      console.error("Archival Error:", err);
      alert(`❌ Error: ${err.message}`);
    } finally {
      setIsClearingHistory(false);
      resetFormOnly();
    }
  };

  const bulkClearExpenses = async () => {
    if (expenses.length === 0) return alert("No expenses to move!");
    if (
      !window.confirm(
        `⚠️ Move all ${expenses.length} expenses to the Recycle Bin?`,
      )
    )
      return;

    setIsClearingHistory(true);
    try {
      const res = await fetch("/api/expenses/bulk-trash", { method: "POST" });
      const result = await res.json();
      if (result.success) {
        setExpenses([]);
        alert("✅ SUCCESS: All expenses moved to Recycle Bin.");
        fetchExpenses();
      } else {
        alert("❌ Error: " + (result.error || "Failed to move records"));
      }
    } catch (err) {
      console.error("Bulk clear error:", err);
      alert("❌ Operation Failed.");
    } finally {
      setIsClearingHistory(false);
    }
  };

  const handleMasterReset = async () => {
    if (
      !window.confirm(
        "🚨 DANGER: This will PERMANENTLY DELETE all Invoices, Revenue Logs, Expenses, and PO History.\n\nEverything will be reset to 0. Stock will NOT be affected. Proceed?",
      )
    )
      return;
    if (
      !window.confirm(
        "⚠️ FINAL WARNING: This action CANNOT BE UNDONE. Are you absolutely sure?",
      )
    )
      return;

    try {
      const res = await fetch("/api/system/master-reset", { method: "POST" });
      const result = await res.json();
      if (result.success) {
        alert("✅ System Reset Successful. Everything is now at 0.");
        window.location.reload();
      } else {
        alert("❌ Error: " + result.error);
      }
    } catch (err) {
      console.error(err);
      alert("❌ Reset Failed.");
    }
  };

  const handleAnalyticsReset = async () => {
    if (
      !window.confirm(
        "⚠️ DANGER: This will PERMANENTLY DELETE all Analytics, Life-time Sales, and Dashboard Revenue history.\n\nEverything will be wiped clean to 0. This cannot be undone. Proceed?"
      )
    )
      return;

    if (!window.confirm("🔥 FINAL CONFIRMATION: Are you absolutely sure?")) return;

    try {
      const res = await fetch("/api/system/analytics-reset", { method: "POST" });
      const result = await res.json();
      if (result.success) {
        alert("✅ Analytics Reset Successful. Dashboard is now at 0.");
        window.location.reload();
      } else {
        alert("❌ Error: " + result.error);
      }
    } catch (err) {
      console.error(err);
      alert("❌ Reset Failed.");
    }
  };

  const loadInvoice = (invoice) => {
    const data = JSON.parse(invoice.data);
    setInvoiceMeta(data.invoiceMeta);
    setCustomer(data.customer);
    setItems(data.items);
    if (data.annexures) setAnnexures(data.annexures);
    else if (data.annexureItems)
      setAnnexures([
        { id: Date.now(), title: "Annexure - A", items: data.annexureItems },
      ]);
    setDocType(data.docType);
    setTerms(data.terms || []);
    setTaxType(data.taxType || "gst");
    setActiveTab("invoices");
    setIsPreviewMode(true);
  };

  const addItem = () =>
    setItems([
      ...items,
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
  const removeItem = (id) => setItems(items.filter((item) => item.id !== id));
  const handleItemChange = (id, field, value) =>
    setItems(
      items.map((item) =>
        item.id === id ? { ...item, [field]: value } : item,
      ),
    );

  const addAnnexureSection = () => {
    const nextLetter = String.fromCharCode(65 + annexures.length);
    setAnnexures([
      ...annexures,
      {
        id: Date.now(),
        title: `Annexure - ${nextLetter}`,
        items: [
          {
            id: Date.now() + 1,
            name: "",
            make: "",
            quantity: 1,
            price: 0,
            taxRate: 18,
          },
        ],
      },
    ]);
  };

  const removeAnnexureSection = (sectionId) => {
    if (annexures.length > 1)
      setAnnexures(annexures.filter((a) => a.id !== sectionId));
  };

  const addAnnexureItem = (sectionId) => {
    setAnnexures(
      annexures.map((ann) =>
        ann.id === sectionId
          ? {
              ...ann,
              items: [
                ...ann.items,
                {
                  id: Date.now(),
                  name: "",
                  make: "",
                  quantity: 1,
                  price: 0,
                  taxRate: 18,
                },
              ],
            }
          : ann,
      ),
    );
  };

  const removeAnnexureItem = (sectionId, itemId) => {
    setAnnexures(
      annexures.map((ann) =>
        ann.id === sectionId
          ? { ...ann, items: ann.items.filter((i) => i.id !== itemId) }
          : ann,
      ),
    );
  };

  const handleAnnexureItemChange = (sectionId, itemId, field, value) => {
    setAnnexures(
      annexures.map((ann) =>
        ann.id === sectionId
          ? {
              ...ann,
              items: ann.items.map((i) =>
                i.id === itemId ? { ...i, [field]: value } : i,
              ),
            }
          : ann,
      ),
    );
  };

  const handleAnnexureTitleChange = (sectionId, title) =>
    setAnnexures(
      annexures.map((ann) => (ann.id === sectionId ? { ...ann, title } : ann)),
    );

  const syncAnnexureToMain = (section) => {
    const taxableTotal = section.items.reduce(
      (acc, item) => acc + item.quantity * item.price,
      0,
    );
    setItems([
      ...items,
      {
        id: Date.now(),
        name: `${section.title.toUpperCase()} (AS PER ANNEXURE)`,
        hsn: "AS PER BOQ",
        make: "MULTIPLE",
        quantity: 1,
        price: taxableTotal,
        taxRate: 18,
      },
    ]);
    alert(`✅ ${section.title} added to Main Invoice!`);
  };

  const totals = useMemo(() => {
    let subtotal = 0,
      totalTax = 0;
    items.forEach((item) => {
      subtotal += item.quantity * item.price;
    });
    const discountAmount = subtotal * (discountPercent / 100);
    const taxableAmount = subtotal - discountAmount;
    items.forEach((item) => {
      const itemTotal = item.quantity * item.price;
      const itemRatio = subtotal > 0 ? itemTotal / subtotal : 0;
      totalTax += taxableAmount * itemRatio * (item.taxRate / 100);
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
      totalQty: items.reduce(
        (sum, item) => sum + Number(item.quantity || 0),
        0,
      ),
    };
  }, [items, discountPercent]);

  const numberToWords = (num) => {
    const a = [
      "",
      "One ",
      "Two ",
      "Three ",
      "Four ",
      "Five ",
      "Six ",
      "Seven ",
      "Eight ",
      "Nine ",
      "Ten ",
      "Eleven ",
      "Twelve ",
      "Thirteen ",
      "Fourteen ",
      "Fifteen ",
      "Sixteen ",
      "Seventeen ",
      "Eighteen ",
      "Nineteen ",
    ];
    const b = [
      "",
      "",
      "Twenty",
      "Thirty",
      "Forty",
      "Fifty",
      "Sixty",
      "Seventy",
      "Eighty",
      "Ninety",
    ];
    const inWords = (n) => {
      if (n < 20) return a[n];
      if (n < 100)
        return b[Math.floor(n / 10)] + (n % 10 !== 0 ? " " + a[n % 10] : "");
      if (n < 1000)
        return (
          a[Math.floor(n / 100)] +
          "Hundred " +
          (n % 100 !== 0 ? inWords(n % 100) : "")
        );
      if (n < 100000)
        return (
          inWords(Math.floor(n / 1000)) +
          "Thousand " +
          (n % 1000 !== 0 ? inWords(n % 1000) : "")
        );
      if (n < 10000000)
        return (
          inWords(Math.floor(n / 100000)) +
          "Lakh " +
          (n % 100000 !== 0 ? inWords(n % 100000) : "")
        );
      return "";
    };
    return inWords(Math.floor(num)) + "Only";
  };

  const handleDownloadPDF = () => {
    setIsPOPrinting(false);
    setIsAuditPrinting(true); // Temporarily true? No, that's for Audit.
    // Wait, for Tax Invoice it should be both FALSE.
    setIsPOPrinting(false);
    setIsAuditPrinting(false);
    window.print();
  };

  const handleDownloadAudit = (data, timeframe) => {
    setAuditReportData(data);
    setAuditTimeframe(timeframe);
    setIsAuditPrinting(true);
    setIsPOPrinting(false); // Ensure PO mode is off
    setTimeout(() => {
      window.print();
      setIsAuditPrinting(false);
    }, 500);
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    const dataToSave = {
      invoiceMeta,
      customer,
      totals,
      items,
      annexures,
      docType,
      terms,
      taxType,
      currency,
    };
    const response = await fetch("/api/invoices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dataToSave),
    });
    if (response.ok) {
      alert("Invoice saved successfully!");
      window.print();
      resetFormOnly();
      fetchInvoices();
    }
  };

  const handlePOPrint = async () => {
    if (poItems.length === 0) return alert("Add items first!");

    try {
      // Auto-save new products to inventory
      for (const item of poItems) {
        const exists = products.find(
          (p) => p.name.toUpperCase() === item.name.toUpperCase(),
        );
        if (!exists && item.name) {
          await fetch("/api/products", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: item.name,
              hsn: item.hsn || "",
              price: item.price || 0,
              tax_rate: item.taxRate || 18,
              stock: 0, // Initial stock is 0 until PO is "received"
              make: item.make || "",
            }),
          });
        }
      }
      fetchProducts(); // Refresh product list

      const poData = {
        po_number: poMeta.poNumber,
        po_date: poMeta.poDate,
        vendor_name: poMeta.vendor,
        items: JSON.stringify(poItems),
        total_value: poItems.reduce((acc, i) => acc + i.quantity * i.price, 0),
        status: editingPOId ? undefined : "active", // Don't reset status if editing
      };

      const url = editingPOId
        ? `/api/purchase_orders/${editingPOId}`
        : "/api/purchase_orders";
      const method = editingPOId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(poData),
      });

      if (res.ok) {
        fetchPOs();
        setIsPOPrinting(true);
        setTimeout(() => {
          window.print();
          setIsPOPrinting(false);
          setIsPreviewMode(false);
          setPoItems([]);
          setEditingPOId(null);
          alert(
            editingPOId
              ? "✅ PO Updated & Print Dialog Opened!"
              : "✅ PO Saved & Print Dialog Opened!",
          );
          setActiveTab("po_history");
        }, 500);
      } else {
        alert("❌ Error saving PO to database.");
      }
    } catch (e) {
      console.error("PO Print Error:", e);
      alert("❌ System Error.");
    }
  };

  const addPOItem = () =>
    setPoItems([
      ...poItems,
      {
        id: Date.now() + Math.random(),
        name: "",
        hsn: "",
        make: "",
        quantity: 1,
        price: 0,
        taxRate: 18,
      },
    ]);
  const handleMetaChange = (field, value) =>
    setInvoiceMeta({ ...invoiceMeta, [field]: value });
  const handleCustomerChange = (field, value) =>
    setCustomer({ ...customer, [field]: value });
  const handleBusinessChange = (field, value) =>
    setMyBusiness({ ...myBusiness, [field]: value });
  const getDocTypeDisplayName = () => {
    const names = {
      invoice: "TAX INVOICE",
      quotation: "QUOTATION",
      proforma: "PROFORMA INVOICE",
      delivery_challan: "DELIVERY CHALLAN",
      work_order: "WORK ORDER",
    };
    return names[docType] || "DOCUMENT";
  };

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return (
          <Dashboard
            savedInvoices={savedInvoices}
            currency={currency}
            setActiveTab={setActiveTab}
            revenueLogs={revenueLogs}
          />
        );
      case "analytics":
        return (
          <Analytics
            savedInvoices={savedInvoices}
            savedPOs={savedPOs}
            expenses={expenses}
            products={products}
            currency={currency}
            handleDownloadAudit={handleDownloadAudit}
            revenueLogs={revenueLogs}
          />
        );
      case "templates":
        return (
          <InvoiceList
            savedInvoices={savedInvoices}
            currency={currency}
            bulkClearHistory={bulkClearHistory}
            setActiveTab={setActiveTab}
            updateStatus={updateStatus}
            loadInvoice={loadInvoice}
            handleDownloadPDF={handleDownloadPDF}
            cancelInvoice={cancelInvoice}
            deleteInvoice={deleteInvoice}
          />
        );
      case "paid_history":
        return (
          <PaidHistory
            savedInvoices={savedInvoices}
            currency={currency}
            setActiveTab={setActiveTab}
            updateStatus={updateStatus}
            loadInvoice={loadInvoice}
            handleDownloadPDF={handleDownloadPDF}
            deleteInvoice={deleteInvoice}
            permanentDeleteInvoice={permanentDeleteInvoice}
            revenueLogs={revenueLogs}
          />
        );
      case "cancelled":
        return (
          <CancelledInvoices
            savedInvoices={savedInvoices}
            currency={currency}
            fetchInvoices={fetchInvoices}
          />
        );
      case "timeline":
        return (
          <Timeline
            savedInvoices={savedInvoices}
            currency={currency}
            updateStatus={updateStatus}
          />
        );
      case "inventory":
        return (
          <Inventory
            inventorySearch={inventorySearch}
            setInventorySearch={setInventorySearch}
            inventoryForm={inventoryForm}
            setInventoryForm={setInventoryForm}
            saveOrUpdateProduct={saveOrUpdateProduct}
            editingProductId={editingProductId}
            cancelEdit={cancelEdit}
            products={products}
            currency={currency}
            startEditProduct={startEditProduct}
            deleteProduct={deleteProduct}
            fetchProducts={fetchProducts}
          />
        );
      case "po_history":
        return (
          <PurchaseOrderHistory
            savedPOs={savedPOs}
            currency={currency}
            setActiveTab={setActiveTab}
            reprintPO={reprintPO}
            loadPO={loadPO}
            updatePOStatus={updatePOStatus}
            bulkClearPOHistory={bulkClearPOHistory}
          />
        );
      case "expenses":
        return (
          <Expenses
            expenses={expenses}
            currency={currency}
            fetchExpenses={fetchExpenses}
            bulkClearExpenses={bulkClearExpenses}
          />
        );
      case "daily_archives":
        return <DailyArchives currency={currency} />;
      case "recycle_bin":
        return (
          <RecycleBin
            savedInvoices={savedInvoices}
            savedPOs={savedPOs}
            expenses={expenses}
            currency={currency}
            updateStatus={updateStatus}
            updatePOStatus={updatePOStatus}
            permanentDeleteInvoice={permanentDeleteInvoice}
            fetchInvoices={fetchInvoices}
            fetchPOs={fetchPOs}
            fetchExpenses={fetchExpenses}
          />
        );
      case "purchase_orders":
        return (
          <PurchaseOrderForm
            isPreviewMode={isPreviewMode}
            setIsPreviewMode={setIsPreviewMode}
            setIsPOPrinting={setIsPOPrinting}
            editingPOId={editingPOId}
            poMeta={poMeta}
            setPoMeta={setPoMeta}
            poItems={poItems}
            setPoItems={setPoItems}
            products={products}
            currency={currency}
            activePOSearchId={activePOSearchId}
            setActivePOSearchId={setActivePOSearchId}
            addPOItem={addPOItem}
            handlePOPrint={handlePOPrint}
            renderPOPrintTemplate={() => (
              <POTemplate
                myBusiness={myBusiness}
                poMeta={poMeta}
                poItems={poItems}
                currency={currency}
              />
            )}
          />
        );
      case "invoices":
        return (
          <InvoiceForm
            isPreviewMode={isPreviewMode}
            setIsPreviewMode={setIsPreviewMode}
            handleSubmit={handleSubmit}
            docType={docType}
            setDocType={setDocType}
            invoiceMeta={invoiceMeta}
            handleMetaChange={handleMetaChange}
            myBusiness={myBusiness}
            handleBusinessChange={handleBusinessChange}
            customer={customer}
            handleCustomerChange={handleCustomerChange}
            clients={clients}
            selectClient={selectClient}
            saveClientToDB={saveClientToDB}
            deleteClient={deleteClient}
            items={items}
            addItem={addItem}
            removeItem={removeItem}
            handleItemChange={handleItemChange}
            products={products}
            selectProduct={selectProduct}
            fetchProducts={fetchProducts}
            showAnnexure={showAnnexure}
            setShowAnnexure={setShowAnnexure}
            annexures={annexures}
            handleAnnexureTitleChange={handleAnnexureTitleChange}
            syncAnnexureToMain={syncAnnexureToMain}
            removeAnnexureSection={removeAnnexureSection}
            handleAnnexureItemChange={handleAnnexureItemChange}
            selectAnnexureProduct={selectAnnexureProduct}
            removeAnnexureItem={removeAnnexureItem}
            addAnnexureItem={addAnnexureItem}
            addAnnexureSection={addAnnexureSection}
            terms={terms}
            setTerms={setTerms}
            taxType={taxType}
            setTaxType={setTaxType}
            totals={totals}
            currency={currency}
            renderPrintTemplate={() => (
              <TaxInvoiceTemplate
                myBusiness={myBusiness}
                customer={customer}
                invoiceMeta={invoiceMeta}
                docType={docType}
                getDocTypeDisplayName={getDocTypeDisplayName}
                items={items}
                totals={totals}
                taxType={taxType}
                currency={currency}
                numberToWords={numberToWords}
                terms={terms}
                showAnnexure={showAnnexure}
                annexures={annexures}
              />
            )}
          />
        );
      default:
        return (
          <div className="p-20 text-center uppercase opacity-10 font-black">
            Coming Soon
          </div>
        );
    }
  };

  return (
    <div className="flex min-h-screen bg-[#F1F5F9] font-sans text-slate-900">
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @media print {
          @page { size: A4; margin: 15mm 15mm 20mm 15mm; }
          body { background: white !important; }
          .no-print { display: none !important; }
          #print-template { 
            display: block !important; 
            position: static !important; 
            width: 100% !important; 
            opacity: 1 !important; 
            visibility: visible !important;
            z-index: 9999 !important;
          }
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          thead, tfoot { display: table-row-group; }
          table { page-break-inside: auto; }
          tr { page-break-inside: avoid; page-break-after: auto; }
        }
      `,
        }}
      />

      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        setIsPreviewMode={setIsPreviewMode}
        logo={myBusiness.logo}
        businessName="Payivva."
      />

      <main className="flex-1 ml-64 no-print transition-all duration-300">
        <header className="h-24 bg-white/80 backdrop-blur-xl border-b-2 border-slate-100 px-12 flex items-center justify-between sticky top-0 z-40">
          <h2 className="text-2xl font-black text-slate-900 tracking-tighter capitalize">
            {activeTab.replace("_", " ")}
          </h2>
          <div className="flex items-center gap-4">
            {activeTab === "invoices" && (
              <>
                <button
                  onClick={clearForm}
                  className="bg-white border-2 border-red-100 text-red-500 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-50 transition-all flex items-center gap-2"
                >
                  Clear Screen
                </button>
                <button
                  onClick={() => setIsPreviewMode(!isPreviewMode)}
                  className={`px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl transition-all ${isPreviewMode ? "bg-blue-600 text-white shadow-blue-200" : "bg-white text-slate-600 hover:bg-slate-50"}`}
                >
                  {isPreviewMode ? "Edit Form" : "Live Preview"}
                </button>
              </>
            )}
            <button
              onClick={handleMasterReset}
              className="px-6 py-4 rounded-2xl bg-white border-2 border-red-100 text-red-600 hover:bg-red-600 hover:text-white transition-all duration-500 shadow-xl flex items-center gap-3 font-black text-[9px] uppercase tracking-[0.2em]"
              title="Master System Reset (Clear All Active Records)"
            >
              <span className="text-lg">⚡</span>
              Master System Reset
            </button>

            <button
              onClick={handleAnalyticsReset}
              className="px-6 py-4 rounded-2xl bg-white border-2 border-blue-100 text-blue-600 hover:bg-blue-600 hover:text-white transition-all duration-500 shadow-xl flex items-center gap-3 font-black text-[9px] uppercase tracking-[0.2em]"
              title="Reset All Analytics & Lifetime Revenue"
            >
              <span className="text-lg">📊</span>
              Analytics Reset
            </button>
            <button
              onClick={() => setActiveTab("recycle_bin")}
              className={`p-4 rounded-2xl transition-all duration-300 flex items-center justify-center shadow-xl border-2 ${activeTab === "recycle_bin" ? "bg-red-600 border-red-500 text-white" : "bg-white border-slate-100 text-slate-400 hover:text-red-500 hover:bg-red-50"}`}
              title="Recycle Bin"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 6h18"></path>
                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                <line x1="10" y1="11" x2="10" y2="17"></line>
                <line x1="14" y1="11" x2="14" y2="17"></line>
              </svg>
            </button>
            <button
              onClick={activeTab === "invoices" ? handleSubmit : () => {}}
              className="bg-slate-900 text-white font-black text-[10px] uppercase tracking-[0.2em] py-4 px-10 rounded-2xl shadow-2xl shadow-slate-300 transition-all hover:scale-105"
            >
              {activeTab === "invoices" ? "Save & Print" : `Add New`}
            </button>
          </div>
        </header>
        <div className="p-12 max-w-7xl mx-auto">{renderContent()}</div>
      </main>

      <div
        id="print-template"
        style={{
          position: "fixed",
          left: "0",
          top: "0",
          width: "210mm",
          zIndex: "-1",
          opacity: "0.01",
          pointerEvents: "none",
          background: "white",
        }}
      >
        {isAuditPrinting ? (
          <AuditTemplate
            myBusiness={myBusiness}
            reportData={auditReportData}
            timeframe={auditTimeframe}
            currency={currency}
          />
        ) : isPOPrinting ? (
          <POTemplate
            myBusiness={myBusiness}
            poMeta={poMeta}
            poItems={poItems}
            currency={currency}
          />
        ) : (
          <TaxInvoiceTemplate
            myBusiness={myBusiness}
            customer={customer}
            invoiceMeta={invoiceMeta}
            docType={docType}
            getDocTypeDisplayName={getDocTypeDisplayName}
            items={items}
            totals={totals}
            taxType={taxType}
            currency={currency}
            numberToWords={numberToWords}
            terms={terms}
            showAnnexure={showAnnexure}
            annexures={annexures}
          />
        )}
      </div>

      {isClearingHistory && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[9999] flex flex-col items-center justify-center animate-in fade-in duration-300">
          <div className="bg-white p-12 rounded-[3rem] shadow-2xl border-4 border-blue-500 flex flex-col items-center gap-6 max-w-md w-full mx-4">
            <div className="w-16 h-16 border-8 border-slate-100 border-t-blue-500 rounded-full animate-spin"></div>
            <div className="text-center">
              <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">
                Secure Backup in Progress
              </h3>
              <p className="text-blue-600 font-black text-lg mt-2">
                Processing {clearProgress.current} of {clearProgress.total}
              </p>
              <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mt-1">
                Preparing secure ZIP archive...
              </p>
              <div className="mt-4 p-4 bg-blue-50 rounded-2xl border border-blue-100 w-full">
                <p className="text-[10px] font-black text-blue-600 uppercase italic">
                  Do not close this tab. Your data is being secured.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvoiceCreator;
