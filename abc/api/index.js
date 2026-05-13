import express from 'express';
import mysql from 'mysql2/promise';
import cors from 'cors';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';

dotenv.config();

const app = express();
app.use(cors());

// Diagnostic logging to see request size
app.use((req, res, next) => {
  if (req.method === 'POST') {
    console.log(`[API] ${req.method} ${req.url} - Body size: ${req.headers['content-length']} bytes`);
  }
  next();
});

app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb', extended: true, parameterLimit: 100000 }));

import { getProfessionalEmailTemplate } from './templates/ProfessionalEmail.js';
import { getPurchaseOrderEmailTemplate } from './templates/PurchaseOrderEmail.js';
import { getGSTReportEmailTemplate } from './templates/GSTReportEmail.js';

// MySQL Connection Pool
const pool = mysql.createPool(process.env.DATABASE_URL || {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

let isDBInitialized = false;

// Initialize Database Table
const initDB = async () => {
  if (isDBInitialized) return;
  let connection;
  try {
    connection = await pool.getConnection();
    console.log('--- Database Initialization Started ---');
    
    // 1. Invoices Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS invoices (
        id INT AUTO_INCREMENT PRIMARY KEY,
        invoice_number VARCHAR(50) NOT NULL,
        doc_type VARCHAR(50) NOT NULL,
        issue_date DATE,
        customer_name VARCHAR(255),
        grand_total DECIMAL(15, 2),
        status VARCHAR(20) DEFAULT 'pending',
        payment_status VARCHAR(20) DEFAULT 'paid',
        pending_amount DECIMAL(15, 2) DEFAULT 0,
        data JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✔ Invoices table ready');

    // 2. Clients Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS clients (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        address TEXT,
        gst VARCHAR(50),
        site TEXT,
        phone VARCHAR(20),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 3. Revenue Log (Persistent financial records)
    await connection.query(`
      CREATE TABLE IF NOT EXISTS revenue_log (
        id INT AUTO_INCREMENT PRIMARY KEY,
        invoice_id INT,
        invoice_number VARCHAR(50),
        amount DECIMAL(15, 2),
        tax_collected DECIMAL(15, 2),
        customer_name VARCHAR(255),
        entry_date DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY (invoice_id)
      )
    `);
    // 4. Daily Archives (Morning Reset Backups)
    await connection.query(`
      CREATE TABLE IF NOT EXISTS daily_archives (
        id INT AUTO_INCREMENT PRIMARY KEY,
        archive_date DATE NOT NULL,
        total_revenue DECIMAL(15, 2),
        total_orders INT,
        total_expenses DECIMAL(15, 2),
        snapshot_data LONGTEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY (archive_date)
      )
    `);
    console.log('✔ Daily Archives table ready');

    // Ensure columns exist (Migration for existing tables)
    try {
      await connection.query("ALTER TABLE clients ADD COLUMN IF NOT EXISTS gst VARCHAR(50)");
      await connection.query("ALTER TABLE clients ADD COLUMN IF NOT EXISTS site TEXT");
      await connection.query("ALTER TABLE clients ADD COLUMN IF NOT EXISTS phone VARCHAR(20)");
    } catch (e) {
      // Some versions of MySQL don't support ADD COLUMN IF NOT EXISTS, ignore if already exists
    }

    console.log('✔ Clients table ready');

    // 3. Products Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS products (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        hsn VARCHAR(50),
        make VARCHAR(255),
        price DECIMAL(15, 2) DEFAULT 0.00,
        tax_rate DECIMAL(5, 2) DEFAULT 18.00,
        stock DECIMAL(15, 2) DEFAULT 0.00,
        min_stock DECIMAL(15, 2) DEFAULT 5.00,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Migration for invoices
    try {
      const columns = await connection.query("SHOW COLUMNS FROM invoices");
      const colNames = columns[0].map(c => c.Field);
      
      if (!colNames.includes('payment_status')) {
        await connection.query("ALTER TABLE invoices ADD COLUMN payment_status VARCHAR(20) DEFAULT 'paid'");
      }
      if (!colNames.includes('pending_amount')) {
        await connection.query("ALTER TABLE invoices ADD COLUMN pending_amount DECIMAL(15, 2) DEFAULT 0");
      }
      if (!colNames.includes('status')) {
        await connection.query("ALTER TABLE invoices ADD COLUMN status VARCHAR(20) DEFAULT 'pending'");
      }
      if (!colNames.includes('data')) {
        await connection.query("ALTER TABLE invoices ADD COLUMN data JSON");
      }
    } catch (e) {
      console.error("Invoices migration error:", e);
    }

    // Migration for products
    try {
      await connection.query("ALTER TABLE products ADD COLUMN IF NOT EXISTS make VARCHAR(255)");
      await connection.query("ALTER TABLE products ADD COLUMN IF NOT EXISTS tax_rate DECIMAL(5, 2) DEFAULT 18.00");
      await connection.query("ALTER TABLE products ADD COLUMN IF NOT EXISTS stock DECIMAL(15, 2) DEFAULT 0.00");
      await connection.query("ALTER TABLE products ADD COLUMN IF NOT EXISTS min_stock DECIMAL(15, 2) DEFAULT 5.00");
    } catch (e) {}

    // 4. Purchase Orders Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS purchase_orders (
        id INT AUTO_INCREMENT PRIMARY KEY,
        po_number VARCHAR(50) NOT NULL,
        po_date DATE,
        vendor_name VARCHAR(255),
        total_value DECIMAL(15, 2),
        items JSON,
        status VARCHAR(20) DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✔ Purchase Orders table ready');
    
    // 5. Expenses Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS expenses (
        id INT AUTO_INCREMENT PRIMARY KEY,
        expense_date DATE NOT NULL,
        category VARCHAR(100),
        vendor VARCHAR(255),
        description TEXT,
        amount DECIMAL(15, 2) NOT NULL,
        payment_method VARCHAR(50),
        status VARCHAR(20) DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✔ Expenses table ready');

    // Ensure status column exists in expenses
    try {
      await connection.query("ALTER TABLE expenses ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active'");
    } catch (e) {}

    isDBInitialized = true;
    console.log('--- Database Initialization Complete ---');
  } catch (err) {
    console.error('❌ Database Initialization Error:', err);
  } finally {
    if (connection) connection.release();
  }
};

// Global Middleware to ensure DB is ready
app.use(async (req, res, next) => {
  try {
    await initDB();
    next();
  } catch (err) {
    res.status(500).json({ error: "Database Initialization Failed" });
  }
});

initDB();

// Endpoints
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Save Invoice
app.post('/api/invoices', async (req, res) => {
  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    // ON-THE-FLY MIGRATION: Ensure columns exist before saving
    const [columns] = await connection.query("SHOW COLUMNS FROM invoices");
    const colNames = columns.map(c => c.Field);
    
    if (!colNames.includes('payment_status')) {
      await connection.query("ALTER TABLE invoices ADD COLUMN payment_status VARCHAR(20) DEFAULT 'paid'");
    }
    if (!colNames.includes('pending_amount')) {
      await connection.query("ALTER TABLE invoices ADD COLUMN pending_amount DECIMAL(15, 2) DEFAULT 0");
    }

    const { invoiceMeta, customer, totals, items, annexures, docType } = req.body;
    
    const query = `
      INSERT INTO invoices (invoice_number, doc_type, issue_date, customer_name, grand_total, payment_status, pending_amount, data)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const values = [
      invoiceMeta.invoiceNumber,
      docType,
      invoiceMeta.issueDate,
      customer.name,
      parseFloat(totals.grandTotal),
      req.body.payment_status || 'paid',
      parseFloat(req.body.pending_amount) || 0,
      JSON.stringify(req.body)
    ];

    const [result] = await connection.execute(query, values);

    // Stock deduction removed from here. Now only happens when status is set to 'paid' via status update endpoint.
    
    await connection.commit();
    res.status(201).json({ success: true, id: result.insertId });
  } catch (err) {
    if (connection) await connection.rollback();
    console.error('Error saving invoice:', err);
    res.status(500).json({ success: false, error: err.message });
  } finally {
    if (connection) connection.release();
  }
});

// Cancel/Delete Invoice & Restore Stock
app.delete('/api/invoices/:id', async (req, res) => {
  let connection;
  try {
    const { id } = req.params;
    const { permanent } = req.query;
    connection = await pool.getConnection();
    await connection.beginTransaction();

    // 1. Get the invoice data first
    const [rows] = await connection.query('SELECT status, data FROM invoices WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }

    const invoiceStatus = rows[0].status;
    const rawData = rows[0].data;
    const invoiceData = typeof rawData === 'string' ? JSON.parse(rawData) : rawData;
    const { items, annexures } = invoiceData;

    // Helper to update stock
    const updateStock = async (productList, multiplier) => {
      for (const item of productList) {
        if (item.name && item.quantity) {
          await connection.execute(
            'UPDATE products SET stock = stock + ? WHERE TRIM(UPPER(name)) = TRIM(UPPER(?))',
            [(parseFloat(item.quantity) || 0) * multiplier, item.name]
          );
        }
      }
    };

    // 3. Mark as trashed OR Permanent Delete
    if (permanent === 'true') {
      await connection.execute('DELETE FROM invoices WHERE id = ?', [id]);
      await connection.commit();
      return res.json({ success: true, message: 'Invoice permanently deleted' });
    } else {
      // Permanent decision: Stock is NEVER restored on delete/cancel per user request
      await connection.execute('UPDATE invoices SET status = "trashed" WHERE id = ?', [id]);
      await connection.commit();
      return res.json({ success: true, message: `Invoice moved to Recycle Bin. Stock not affected.` });
    }

  } catch (err) {
    if (connection) await connection.rollback();
    console.error('Error deleting/cancelling invoice:', err);
    res.status(500).json({ success: false, error: err.message });
  } finally {
    if (connection) connection.release();
  }
});

// Bulk Move Invoices to Trash
app.post('/api/invoices/bulk-trash', async (req, res) => {
  try {
    await pool.query('UPDATE invoices SET status = "trashed" WHERE status != "trashed"');
    res.json({ success: true, message: 'All invoices moved to Recycle Bin' });
  } catch (err) {
    console.error('Error bulk trashing invoices:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Bulk Clear All Invoices (Permanent Delete)
app.post('/api/invoices/bulk-clear', async (req, res) => {
  try {
    await pool.query('TRUNCATE TABLE invoices');
    res.json({ success: true, message: 'All invoices cleared permanently' });
  } catch (err) {
    console.error('Error bulk clearing invoices:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Fetch All Invoices
app.get('/api/invoices', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM invoices ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    console.error('Error fetching invoices:', err);
    res.status(500).json({ error: err.message });
  }
});

// Update Invoice Status with Stock Management
app.put('/api/invoices/:id/status', async (req, res) => {
  let connection;
  try {
    const { id } = req.params;
    const { status: newStatus } = req.body;
    connection = await pool.getConnection();
    await connection.beginTransaction();

    // 1. Get current status and data
    const [rows] = await connection.query('SELECT status, data, invoice_number, grand_total, customer_name, issue_date FROM invoices WHERE id = ?', [id]);
    if (rows.length === 0) return res.status(404).json({ success: false });

    const oldStatus = rows[0].status;
    const rawData = rows[0].data;
    const invoiceData = typeof rawData === 'string' ? JSON.parse(rawData) : rawData;
    const { items, annexures } = invoiceData;

    const updateStock = async (productList, multiplier) => {
      for (const item of productList) {
        if (item.name && item.quantity) {
          await connection.execute(
            'UPDATE products SET stock = stock + ? WHERE TRIM(UPPER(name)) = TRIM(UPPER(?))',
            [(parseFloat(item.quantity) || 0) * multiplier, item.name]
          );
        }
      }
    };

    // 2. Transition Logic
    const isPaidStatus = (s) => s === 'paid' || s === 'paid_archived';

    if (!isPaidStatus(oldStatus) && isPaidStatus(newStatus)) {
      // MOVING TO PAID: Deduct Stock & Log Revenue
      if (items) await updateStock(items, -1);
      if (annexures) {
        for (const ann of annexures) {
          if (ann.items) await updateStock(ann.items, -1);
        }
      }

      // Log to Persistent Revenue Table (Use current date for accurate 'Today's Revenue' tracking)
      const total = parseFloat(rows[0].grand_total) || 0;
      const tax = (total * 0.18) / 1.18;
      const todayDate = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD in local time
      await connection.execute(
        'INSERT IGNORE INTO revenue_log (invoice_id, invoice_number, amount, tax_collected, customer_name, entry_date) VALUES (?, ?, ?, ?, ?, ?)',
        [id, rows[0].invoice_number, total, tax, rows[0].customer_name, todayDate]
      );
    } else if (isPaidStatus(oldStatus) && (newStatus === 'pending' || newStatus === 'active' || newStatus === 'cancelled')) {
      // MOVING FROM PAID TO REVERSAL (Pending/Active/Cancelled): Restore Stock & Remove Revenue
      if (items) await updateStock(items, 1);
      if (annexures) {
        for (const ann of annexures) {
          if (ann.items) await updateStock(ann.items, 1);
        }
      }
      // Delete from Revenue Log
      await connection.execute('DELETE FROM revenue_log WHERE invoice_id = ?', [id]);
    } else if (isPaidStatus(oldStatus) && newStatus === 'trashed') {
      // MOVING FROM PAID TO TRASHED: Do NOT restore stock, Do NOT remove revenue.
      // Revenue remains in analytics even if record is in recycle bin.
    }

    // 3. Update Status
    await connection.execute('UPDATE invoices SET status = ? WHERE id = ?', [newStatus, id]);
    await connection.commit();
    res.json({ success: true });
  } catch (err) {
    if (connection) await connection.rollback();
    console.error('Error updating status:', err);
    res.status(500).json({ success: false, error: err.message });
  } finally {
    if (connection) connection.release();
  }
});

// Update Payment Status (for Credit Manager)
app.put('/api/invoices/:id/payment-status', async (req, res) => {
  try {
    const { id } = req.params;
    const { payment_status, pending_amount } = req.body;
    await pool.execute(
      'UPDATE invoices SET payment_status = ?, pending_amount = ? WHERE id = ?',
      [payment_status, pending_amount, id]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Clients Endpoints
app.get('/api/clients', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM clients ORDER BY name ASC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/clients', async (req, res) => {
  try {
    const { name, address, gstin, gst, site, phone } = req.body;
    const clientGst = gstin || gst || ""; // Support both names
    const [result] = await pool.execute(
      'INSERT INTO clients (name, address, gst, site, phone) VALUES (?, ?, ?, ?, ?)',
      [name, address, clientGst, site, phone]
    );
    res.status(201).json({ success: true, id: result.insertId });
  } catch (err) {
    console.error("DB Error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/clients/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.execute('DELETE FROM clients WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Products Endpoints
app.get('/api/products', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM products ORDER BY name ASC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/products', async (req, res) => {
  try {
    const { name, hsn, make, price, tax_rate, stock, min_stock } = req.body;
    const [result] = await pool.execute(
      'INSERT INTO products (name, hsn, make, price, tax_rate, stock, min_stock) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [name, hsn, make, price, tax_rate, stock || 0, min_stock || 5]
    );
    res.status(201).json({ success: true, id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, hsn, make, price, tax_rate, stock, min_stock } = req.body;
    await pool.execute(
      'UPDATE products SET name = ?, hsn = ?, make = ?, price = ?, tax_rate = ?, stock = ?, min_stock = ? WHERE id = ?',
      [name, hsn, make, price, tax_rate, stock, min_stock, id]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/purchase_orders/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.execute('DELETE FROM purchase_orders WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.execute('DELETE FROM products WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Purchase Orders Endpoints
app.get('/api/purchase_orders', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM purchase_orders ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    console.error('Error fetching POs:', err);
    res.status(500).json({ error: err.message });
  }
});

// Save New Purchase Order
app.post('/api/purchase_orders', async (req, res) => {
  try {
    const { po_number, po_date, vendor_name, items, total_value, status } = req.body;
    const query = `
      INSERT INTO purchase_orders (po_number, po_date, vendor_name, total_value, items, status)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    const values = [
      po_number,
      po_date,
      vendor_name,
      parseFloat(total_value),
      typeof items === 'string' ? items : JSON.stringify(items),
      status || 'active'
    ];
    const [result] = await pool.execute(query, values);
    res.status(201).json({ success: true, id: result.insertId });
  } catch (err) {
    console.error('Error saving PO:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Bulk Move POs to Trash
app.post('/api/purchase_orders/bulk-trash', async (req, res) => {
  try {
    await pool.query('UPDATE purchase_orders SET status = "trashed" WHERE status != "trashed"');
    res.json({ success: true, message: 'All purchase orders moved to Recycle Bin' });
  } catch (err) {
    console.error('Error bulk trashing POs:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Bulk Clear All Purchase Orders (Permanent Delete)
app.post('/api/purchase_orders/bulk-clear', async (req, res) => {
  try {
    // Using TRUNCATE is faster and more permanent for "Clear All"
    await pool.query('TRUNCATE TABLE purchase_orders');
    res.json({ success: true, message: 'All purchase orders cleared permanently' });
  } catch (err) {
    console.error('Error bulk clearing POs:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Update Purchase Order Status & Stock
app.put('/api/purchase_orders/:id/status', async (req, res) => {
  let connection;
  try {
    const { id } = req.params;
    const { status } = req.body;
    connection = await pool.getConnection();
    await connection.beginTransaction();

    // 1. Get PO items if status is 'received'
    if (status === 'received') {
      const [rows] = await connection.query('SELECT items, status FROM purchase_orders WHERE id = ?', [id]);
      if (rows.length > 0 && rows[0].status !== 'received') {
        const itemList = typeof rows[0].items === 'string' ? JSON.parse(rows[0].items) : rows[0].items;
        if (itemList && Array.isArray(itemList)) {
          for (const item of itemList) {
            if (item.name && item.quantity) {
              await connection.execute(
                'UPDATE products SET stock = stock + ? WHERE name = ?',
                [parseFloat(item.quantity) || 0, item.name]
              );
            }
          }
        }
      }
    }

    // 2. Update Status
    await connection.execute('UPDATE purchase_orders SET status = ? WHERE id = ?', [status, id]);

    await connection.commit();
    res.json({ success: true });
  } catch (err) {
    if (connection) await connection.rollback();
    console.error('Error updating PO status:', err);
    res.status(500).json({ success: false, error: err.message });
  } finally {
    if (connection) connection.release();
  }
});

// Update Purchase Order Data
app.put('/api/purchase_orders/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { po_number, po_date, vendor_name, items, total_value } = req.body;
    const query = `
      UPDATE purchase_orders 
      SET po_number = ?, po_date = ?, vendor_name = ?, total_value = ?, items = ?
      WHERE id = ?
    `;
    const values = [
      po_number,
      po_date,
      vendor_name,
      parseFloat(total_value),
      typeof items === 'string' ? items : JSON.stringify(items),
      id
    ];
    await pool.execute(query, values);
    res.json({ success: true });
  } catch (err) {
    console.error('Error updating PO:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Expenses Endpoints
app.get('/api/expenses', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM expenses ORDER BY expense_date DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/expenses', async (req, res) => {
  try {
    const { expense_date, category, vendor, description, amount, payment_method } = req.body;
    const query = `
      INSERT INTO expenses (expense_date, category, vendor, description, amount, payment_method)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    const [result] = await pool.execute(query, [expense_date, category, vendor, description, parseFloat(amount), payment_method]);
    res.status(201).json({ success: true, id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/expenses/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.execute('DELETE FROM expenses WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/expenses/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    await pool.execute('UPDATE expenses SET status = ? WHERE id = ?', [status, id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Bulk Move Expenses to Trash
app.post('/api/expenses/bulk-trash', async (req, res) => {
  try {
    await pool.query('UPDATE expenses SET status = "trashed" WHERE status != "trashed"');
    res.json({ success: true, message: 'All expenses moved to Recycle Bin' });
  } catch (err) {
    console.error('Error bulk trashing expenses:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/expenses/bulk-clear', async (req, res) => {
  try {
    await pool.query('TRUNCATE TABLE expenses');
    res.json({ success: true, message: 'All expenses cleared permanently' });
  } catch (err) {
    console.error('Error bulk clearing expenses:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/recycle-bin/clear/:type', async (req, res) => {
  try {
    const { type } = req.params;
    let query = "";
    if (type === 'invoices') {
      query = 'DELETE FROM invoices WHERE status = "trashed" OR status = "cancelled"';
    } else if (type === 'purchase_orders') {
      query = 'DELETE FROM purchase_orders WHERE status = "trashed"';
    } else if (type === 'expenses') {
      query = 'DELETE FROM expenses WHERE status = "trashed"';
    } else {
      return res.status(400).json({ success: false, message: 'Invalid type' });
    }

    await pool.query(query);
    res.json({ success: true, message: `${type} trash cleared permanently` });
  } catch (err) {
    console.error('Error clearing specific trash:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Recycle Bin Auto-Purge Logic (To be called by a trigger or at startup)
app.post('/api/recycle-bin/purge', async (req, res) => {
  try {
    await pool.query('DELETE FROM invoices WHERE status = "trashed" OR status = "cancelled"');
    await pool.query('DELETE FROM purchase_orders WHERE status = "trashed"');
    await pool.query('DELETE FROM expenses WHERE status = "trashed"');
    res.json({ success: true, message: 'Recycle bin purged successfully' });
  } catch (err) {
    console.error('Error purging trash:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Master System Reset with Automatic Archival
app.post('/api/system/master-reset', async (req, res) => {
  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    const todayDate = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD

    // 1. Fetch current data for snapshot
    const [invRows] = await connection.query('SELECT * FROM invoices');
    const [expRows] = await connection.query('SELECT * FROM expenses');
    const [poRows] = await connection.query('SELECT * FROM purchase_orders');
    
    // For revenue, we only want to archive TODAY'S revenue in the summary, 
    // but the revenue_log itself remains persistent.
    const [revRowsToday] = await connection.query('SELECT * FROM revenue_log WHERE entry_date = ?', [todayDate]);
    const [allRevRows] = await connection.query('SELECT * FROM revenue_log');

    const dailyRevenue = revRowsToday.reduce((acc, r) => acc + (parseFloat(r.amount) || 0), 0);
    const dailyExpenses = expRows.reduce((acc, r) => acc + (parseFloat(r.amount) || 0), 0);
    
    // 2. Prepare Full Snapshot (Invoices, POs, and Expenses being cleared)
    const snapshot = {
      invoices: invRows,
      expenses: expRows,
      purchase_orders: poRows,
      revenue_snapshot: revRowsToday,
      archive_timestamp: new Date().toISOString()
    };

    // 3. Save to Daily Archives
    await connection.execute(
      'INSERT INTO daily_archives (archive_date, total_revenue, total_orders, total_expenses, snapshot_data) VALUES (?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE total_revenue = ?, total_orders = ?, total_expenses = ?, snapshot_data = ?',
      [
        todayDate, dailyRevenue, invRows.length, dailyExpenses, JSON.stringify(snapshot),
        dailyRevenue, invRows.length, dailyExpenses, JSON.stringify(snapshot)
      ]
    );

    // 4. Clear Active Tables (BUT PRESERVE Pending Credit & Life-time Sales)
    // We only delete invoices that are fully paid to keep Credit Manager intact
    await connection.query('DELETE FROM invoices WHERE payment_status = "paid" AND (pending_amount IS NULL OR pending_amount <= 0)');
    
    // We clear POs and Expenses as they are usually operational/one-time
    await connection.query('TRUNCATE TABLE purchase_orders');
    await connection.query('TRUNCATE TABLE expenses');
    // Note: revenue_log is NOT truncated to preserve life-time sales on Dashboard

    await connection.commit();
    res.json({ success: true, message: `System reset successful. Data archived for ${todayDate}.` });
  } catch (err) {
    if (connection) await connection.rollback();
    console.error('Master reset error:', err);
    res.status(500).json({ success: false, error: err.message });
  } finally {
    if (connection) connection.release();
  }
});

// Analytics & Lifetime Sales Reset
app.post('/api/system/analytics-reset', async (req, res) => {
  try {
    await pool.query('TRUNCATE TABLE revenue_log');
    res.json({ success: true, message: 'Analytics and Lifetime Sales have been reset to 0.' });
  } catch (err) {
    console.error('Analytics reset error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// List all Archives
app.get('/api/archives', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT id, archive_date, total_revenue, total_orders, total_expenses FROM daily_archives ORDER BY archive_date DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get specific Archive Details
app.get('/api/archives/:id', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM daily_archives WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Archive not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Initialize Database
initDB();

// For local development
// Revenue Log Endpoint
app.get('/api/revenue', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM revenue_log ORDER BY entry_date DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// For local development
// Email Sending Endpoint
app.post('/api/send-email', async (req, res) => {
  const { 
    to, 
    invoiceData, 
    myBusiness, 
    pdfBase64, 
    isPO = false, 
    poData = {}, 
    isGST = false, 
    gstData = {} 
  } = req.body;

  // SMTP Configuration
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const attachments = [];
  
  // Attach PDF
  if (pdfBase64) {
    const filename = isGST 
      ? `GST_Report_${gstData.date || 'Report'}.pdf`
      : isPO 
        ? `PurchaseOrder_${poData.poNumber || 'PO'}.pdf` 
        : `Invoice_${invoiceData?.invoiceMeta?.invoiceNumber || 'INV'}.pdf`;
      
    attachments.push({
      filename,
      content: pdfBase64.split('base64,')[1] || pdfBase64,
      encoding: 'base64'
    });
  }

  // Handle Logo Embedding if exists
  let logoCid = 'companyLogo';
  if (myBusiness.logo && myBusiness.logo.startsWith('data:image')) {
     attachments.push({
        filename: 'logo.png',
        content: myBusiness.logo.split('base64,')[1],
        encoding: 'base64',
        cid: logoCid
     });
  }

  // Choose Template
  const htmlContent = isGST
    ? getGSTReportEmailTemplate({
        myBusiness,
        reportMeta: { date: gstData.date },
        logoCid
      })
    : isPO 
      ? getPurchaseOrderEmailTemplate({
          myBusiness,
          vendorName: poData.vendorName,
          poMeta: poData.poMeta,
          totalValue: poData.totalValue,
          currency: poData.currency,
          logoCid
        })
      : getProfessionalEmailTemplate({
          myBusiness,
          customer: invoiceData.customer,
          invoiceMeta: invoiceData.invoiceMeta,
          totals: invoiceData.totals,
          currency: invoiceData.currency,
          logoCid,
          invoiceData
        });

  try {
    const subject = isGST
      ? `GST Compliance Report - ${myBusiness.name}`
      : isPO 
        ? `Purchase Order #${poData.poNumber} from ${myBusiness.name}`
        : `${invoiceData?.invoiceMeta?.docType === 'quotation' ? 'Quotation' : 'Tax Invoice'} #${invoiceData?.invoiceMeta?.invoiceNumber} from ${myBusiness.name}`;

    await transporter.sendMail({
      from: `"${myBusiness.name}" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html: htmlContent,
      attachments
    });
    res.json({ success: true, message: 'Email sent successfully!' });
  } catch (err) {
    console.error('Email error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

export default app;
