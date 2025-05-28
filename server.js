const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(cors());

// Your Railway MySQL URL
const connection = mysql.createConnection('mysql://root:FuEbybhbhPwJXtsPAqdKdXyvbyOCxVWc@turntable.proxy.rlwy.net:51124/railway');

// Add endpoint to check table structure
app.get('/api/columns', (req, res) => {
    connection.query(
        'DESCRIBE companies',
        (err, results) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json(results);
        }
    );
});

// Get sample with all columns to see what data we have
app.get('/api/sample', (req, res) => {
    connection.query(
        'SELECT * FROM companies LIMIT 1',
        (err, results) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json(results);
        }
    );
});

// Check all tables
app.get('/api/tables', (req, res) => {
    connection.query(
        'SHOW TABLES',
        (err, results) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json(results);
        }
    );
});

app.get('/api/oldest', (req, res) => {
    connection.query(
        'SELECT * FROM companies ORDER BY CompanyNumber ASC LIMIT 5',
        (err, results) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json(results);
        }
    );
});

app.get('/api/newest', (req, res) => {
    connection.query(
        'SELECT * FROM companies ORDER BY CompanyNumber DESC LIMIT 5',
        (err, results) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json(results);
        }
    );
});

// Add endpoints for loading more with offset
app.get('/api/oldest/:offset', (req, res) => {
    const offset = parseInt(req.params.offset) || 0;
    connection.query(
        'SELECT * FROM companies ORDER BY CompanyNumber ASC LIMIT 5 OFFSET ?',
        [offset],
        (err, results) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json(results);
        }
    );
});

app.get('/api/newest/:offset', (req, res) => {
    const offset = parseInt(req.params.offset) || 0;
    connection.query(
        'SELECT * FROM companies ORDER BY CompanyNumber DESC LIMIT 5 OFFSET ?',
        [offset],
        (err, results) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json(results);
        }
    );
});

app.listen(process.env.PORT || 3000);
console.log('Server started!');