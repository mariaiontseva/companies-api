const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(cors());

// Your Railway MySQL URL
const connection = mysql.createConnection('mysql://root:FuEbybhbhPwJXtsPAqdKdXyvbyOCxVWc@turntable.proxy.rlwy.net:51124/railway');

app.get('/api/oldest', (req, res) => {
    connection.query(
        'SELECT * FROM companies ORDER BY DateofCreation ASC LIMIT 10',
        (err, results) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json(results);
        }
    );
});

app.get('/api/newest', (req, res) => {
    connection.query(
        'SELECT * FROM companies ORDER BY DateofCreation DESC LIMIT 10',
        (err, results) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json(results);
        }
    );
});

app.listen(process.env.PORT || 3000);
console.log('Server started!');