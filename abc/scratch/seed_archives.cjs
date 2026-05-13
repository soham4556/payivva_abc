const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const seedData = async () => {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASS,
        database: process.env.DB_NAME
    });

    try {
        console.log("Seeding test data for AI Analytics...");

        const today = new Date();
        for (let i = 5; i >= 1; i--) {
            const date = new Date();
            date.setDate(today.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];

            const revenue = Math.floor(Math.random() * (150000 - 50000) + 50000);
            const orders = Math.floor(Math.random() * (15 - 5) + 5);
            const expenses = Math.floor(Math.random() * (40000 - 10000) + 10000);

            // Create Snapshot Data
            const snapshot = {
                invoices: [
                    { 
                        invoice_number: `INV-${dateStr}-01`, 
                        customer_name: "Test B2B Client", 
                        total_amount: revenue * 0.7, 
                        customer_gstin: "27ABCDE1234F1Z1",
                        data: JSON.stringify({ totals: { grandTotal: revenue * 0.7 } })
                    },
                    { 
                        invoice_number: `INV-${dateStr}-02`, 
                        customer_name: "Test B2C Client", 
                        total_amount: revenue * 0.3, 
                        customer_gstin: "",
                        data: JSON.stringify({ totals: { grandTotal: revenue * 0.3 } })
                    }
                ]
            };

            // 1. Insert into daily_archives
            await connection.execute(
                `INSERT INTO daily_archives (archive_date, total_revenue, total_orders, total_expenses, snapshot_data) 
                 VALUES (?, ?, ?, ?, ?) 
                 ON DUPLICATE KEY UPDATE total_revenue = VALUES(total_revenue), total_orders = VALUES(total_orders), total_expenses = VALUES(total_expenses)`,
                [dateStr, revenue, orders, expenses, JSON.stringify(snapshot)]
            );

            // 2. Insert into revenue_log for more granularity
            await connection.execute(
                `INSERT IGNORE INTO revenue_log (invoice_number, amount, tax_collected, customer_name, entry_date) 
                 VALUES (?, ?, ?, ?, ?)`,
                [`DUMMY-${dateStr}`, revenue, (revenue * 0.18) / 1.18, "Daily Bulk Test", dateStr]
            );

            // 3. Insert random expense
            await connection.execute(
                `INSERT INTO expenses (expense_date, category, vendor, description, amount) 
                 VALUES (?, ?, ?, ?, ?)`,
                [dateStr, "Testing", "AI Test Vendor", "Random Test Expense", expenses]
            );

            console.log(`✔ Seeded data for ${dateStr}: Rev: ${revenue}, Exp: ${expenses}`);
        }

        console.log("DONE: AI Analytics is now ready with test data.");
    } catch (err) {
        console.error("Seeding Error:", err.message);
    } finally {
        await connection.end();
    }
};

seedData();
