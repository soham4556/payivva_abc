# Payivva ERP - Advanced Invoice & Inventory Management System

Welcome to the **Payivva ERP** system. This industrial-grade application is designed to streamline your billing, inventory, and financial auditing processes with a focus on accuracy, auditability, and ease of use.

---

## 🚀 Key Modules & Features

### 1. Sales & Invoice Management

- **Professional GST Invoices**: Create Tax Invoices, Quotations, and Proforma Invoices with automated tax calculations.
- **Dynamic Status Tracking**: Manage invoices through `Pending`, `Paid`, `Cancelled`, and `Trashed` statuses.
- **Stock Integration**: Invoices automatically deduct stock only when marked as **PAID**, ensuring your inventory is always accurate.

### 2. Inventory & Stock Control

- **Real-time Tracking**: Monitor current stock levels for all products.
- **Low Stock Alerts**: Automatic visual warnings when products fall below a critical threshold.
- **Automatic Restoration**: If a 'Paid' invoice is moved back to 'Pending' or is 'Cancelled', the system automatically restores the stock back to the inventory.

### 3. Purchase Order (PO) Module

- **Procurement Workflow**: Generate professional Purchase Orders for vendors.
- **PO History**: Dedicated section to track all previous procurement records.
- **Stock Linking**: POs help you manage incoming inventory.

### 4. Intelligence Hub (Analytics)

- **Financial Snapshots**: View Life-time Sales, Total Transactions, and Tax Collected at a glance.
- **Deep Insights**: Track top-performing products, your best customers, and expense categories.
- **Real-time Sync**: Analytics update instantly as you mark bills as paid or cancelled.

---

## 🏛️ Advanced Archival & Data Management

### The "Morning Reset" Workflow

To keep your dashboard clean and ready for a new day, the system features a **Master Reset** button (Trash icon in the header):

1. **Snapshot**: Before clearing any data, the system takes a complete snapshot of all active Invoices, POs, Revenue, and Expenses.
2. **Daily Archives**: This snapshot is saved in the **Daily Master Archives** section with the current date.
3. **Fresh Start**: All active tables are reset to zero, but your **Stock remains safe** and unaffected.
4. **Historical Audit**: You can visit the Archives at any time to see the full financial breakdown of any previous day.

### Record Handling Logic (Crucial)

- **Cancel ♻️**: Use this if a transaction was a mistake or was returned. It will **Restore Stock** and **Remove Revenue** from Analytics.
- **Delete 🗑️**: Moves the record to the Recycle Bin. It **Keeps the Revenue** in your analytics (as it was a successful sale) and does not restore stock.
- **Recycle Bin**: A safety net for all deleted records. You can restore them or purge them permanently.

---

## 🛠️ Getting Started

### Installation

1. **Database**: Ensure MySQL is running. The system will automatically create required tables (`invoices`, `products`, `revenue_log`, `daily_archives`, etc.) on the first run.
2. **Backend**:
   ```bash
   cd api
   npm install
   node index.js
   ```
3. **Frontend**:
   ```bash
   cd abc
   npm install
   npm run dev
   ```

### Daily Usage Tip

Every morning, click the **Master Reset** icon to archive yesterday's work and start with a clean 0-revenue dashboard. All your historical documents are safely tucked away in the **Daily Master Archives** section for your accountant.

---

## 📜 Audit & Compliance

The system maintains a **Persistent Revenue Log** that records every successful transaction for GST and tax compliance. Even if an invoice record is archived or moved, the financial log remains immutable for auditing purposes unless explicitly cancelled.

---

**Developed with focus on reliability and precision.**
