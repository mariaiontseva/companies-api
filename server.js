const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(cors());

// Railway MySQL connection pool
const pool = mysql.createPool({
  host: 'turntable.proxy.rlwy.net',
  port: 51124,
  user: 'root',
  password: 'FuEbybhbhPwJXtsPAqdKdXyvbyOCxVWc',
  database: 'railway',
  connectionLimit: 10,
  acquireTimeout: 60000,
  timeout: 60000,
  reconnect: true,
  idleTimeout: 300000,
  queueLimit: 0
});

// Test database connection pool
pool.getConnection((err, connection) => {
  if (err) {
    console.error('Database connection pool failed:', err.message);
  } else {
    console.log('✅ Connected to Railway MySQL database pool');
    connection.release(); // Return connection to pool
  }
});

// Health check
app.get('/', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Companies API is running',
    timestamp: new Date().toISOString()
  });
});

// Get oldest companies
app.get('/api/oldest', (req, res) => {
  const industry = req.query.industry;
  
  let whereClause = 'WHERE CompanyStatus = \'Active\' AND IncorporationDate IS NOT NULL';
  const queryParams = [];
  
  // Add industry filter if provided
  if (industry && industry !== 'ALL') {
    const industryPatterns = {
      'AGRICULTURE': ['01%', '02%', '03%', '10%', '11%', '%AGRICULTURE%', '%FARM%', '%FOOD%', '%CATTLE%'],
      'FINANCIAL': ['64%', '65%', '66%', '%FINANC%', '%INSURANCE%', '%BANK%'],
      'TECHNOLOGY': ['62%', '63%', '%SOFTWARE%', '%COMPUTER%', '%INFORMATION%'],
      'RETAIL': ['45%', '46%', '47%', '%RETAIL%', '%WHOLESALE%', '%SALE%'],
      'MANUFACTURING': ['10%', '11%', '12%', '13%', '14%', '15%', '16%', '17%', '18%', '19%', '20%', '21%', '22%', '23%', '24%', '25%', '26%', '27%', '28%', '29%', '30%', '31%', '32%', '33%', '%MANUFACTUR%'],
      'REAL_ESTATE': ['68%', '%REAL ESTATE%', '%PROPERTY%'],
      'ENERGY': ['05%', '06%', '07%', '08%', '09%', '35%', '%ENERGY%', '%ELECTRIC%', '%GAS%', '%MINING%'],
      'HEALTHCARE': ['86%', '87%', '88%', '%HEALTH%', '%MEDICAL%', '%HOSPITAL%'],
      'TRANSPORT': ['49%', '50%', '51%', '52%', '53%', '%TRANSPORT%'],
      'CONSTRUCTION': ['41%', '42%', '43%', '%CONSTRUCTION%', '%BUILDING%'],
      'SERVICES': ['69%', '70%', '71%', '72%', '73%', '74%', '75%', '%CONSULTING%', '%LEGAL%'],
      'MEDIA': ['58%', '59%', '60%', '90%', '91%'],
      'OTHER': ['%']
    };
    
    const patterns = industryPatterns[industry] || ['%'];
    const sicConditions = patterns.map(() => 'SICCode_SicText_1 LIKE ?').join(' OR ');
    whereClause += ` AND (${sicConditions})`;
    queryParams.push(...patterns);
  }
  
  const query = `
    SELECT CompanyName, CompanyNumber, CompanyStatus, IncorporationDate, CompanyCategory,
           RegAddress_CareOf, RegAddress_POBox, RegAddress_AddressLine1, RegAddress_AddressLine2,
           RegAddress_PostTown, RegAddress_County, RegAddress_Country, RegAddress_PostCode,
           SICCode_SicText_1, SICCode_SicText_2, SICCode_SicText_3, SICCode_SicText_4,
           Mortgages_NumMortCharges, Mortgages_NumMortOutstanding, 
           Mortgages_NumMortPartSatisfied, Mortgages_NumMortSatisfied,
           Accounts_NextDueDate, Accounts_LastMadeUpDate, Accounts_AccountCategory,
           ConfStmtNextDueDate, ConfStmtLastMadeUpDate,
           PreviousName_1_CompanyName, PreviousName_2_CompanyName, PreviousName_3_CompanyName
    FROM companies 
    ${whereClause}
    ORDER BY IncorporationDate ASC
    LIMIT 5
  `;
  
  pool.query(query, queryParams, (err, results) => {
    if (err) {
      console.error('Query error:', err);
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

// Get newest companies
app.get('/api/newest', (req, res) => {
  const industry = req.query.industry;
  
  let whereClause = 'WHERE CompanyStatus = \'Active\' AND IncorporationDate IS NOT NULL';
  const queryParams = [];
  
  // Add industry filter if provided
  if (industry && industry !== 'ALL') {
    const industryPatterns = {
      'AGRICULTURE': ['01%', '02%', '03%', '10%', '11%', '%AGRICULTURE%', '%FARM%', '%FOOD%', '%CATTLE%'],
      'FINANCIAL': ['64%', '65%', '66%', '%FINANC%', '%INSURANCE%', '%BANK%'],
      'TECHNOLOGY': ['62%', '63%', '%SOFTWARE%', '%COMPUTER%', '%INFORMATION%'],
      'RETAIL': ['45%', '46%', '47%', '%RETAIL%', '%WHOLESALE%', '%SALE%'],
      'MANUFACTURING': ['10%', '11%', '12%', '13%', '14%', '15%', '16%', '17%', '18%', '19%', '20%', '21%', '22%', '23%', '24%', '25%', '26%', '27%', '28%', '29%', '30%', '31%', '32%', '33%', '%MANUFACTUR%'],
      'REAL_ESTATE': ['68%', '%REAL ESTATE%', '%PROPERTY%'],
      'ENERGY': ['05%', '06%', '07%', '08%', '09%', '35%', '%ENERGY%', '%ELECTRIC%', '%GAS%', '%MINING%'],
      'HEALTHCARE': ['86%', '87%', '88%', '%HEALTH%', '%MEDICAL%', '%HOSPITAL%'],
      'TRANSPORT': ['49%', '50%', '51%', '52%', '53%', '%TRANSPORT%'],
      'CONSTRUCTION': ['41%', '42%', '43%', '%CONSTRUCTION%', '%BUILDING%'],
      'SERVICES': ['69%', '70%', '71%', '72%', '73%', '74%', '75%', '%CONSULTING%', '%LEGAL%'],
      'MEDIA': ['58%', '59%', '60%', '90%', '91%'],
      'OTHER': ['%']
    };
    
    const patterns = industryPatterns[industry] || ['%'];
    const sicConditions = patterns.map(() => 'SICCode_SicText_1 LIKE ?').join(' OR ');
    whereClause += ` AND (${sicConditions})`;
    queryParams.push(...patterns);
  }
  
  const query = `
    SELECT CompanyName, CompanyNumber, CompanyStatus, IncorporationDate, CompanyCategory,
           RegAddress_CareOf, RegAddress_POBox, RegAddress_AddressLine1, RegAddress_AddressLine2,
           RegAddress_PostTown, RegAddress_County, RegAddress_Country, RegAddress_PostCode,
           SICCode_SicText_1, SICCode_SicText_2, SICCode_SicText_3, SICCode_SicText_4,
           Mortgages_NumMortCharges, Mortgages_NumMortOutstanding, 
           Mortgages_NumMortPartSatisfied, Mortgages_NumMortSatisfied,
           Accounts_NextDueDate, Accounts_LastMadeUpDate, Accounts_AccountCategory,
           ConfStmtNextDueDate, ConfStmtLastMadeUpDate,
           PreviousName_1_CompanyName, PreviousName_2_CompanyName, PreviousName_3_CompanyName
    FROM companies
    ${whereClause}
    ORDER BY IncorporationDate DESC
    LIMIT 5
  `;
  
  pool.query(query, queryParams, (err, results) => {
    if (err) {
      console.error('Query error:', err);
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

// Get companies with charges
app.get('/api/companies-with-charges', (req, res) => {
  const query = `
    SELECT CompanyName, CompanyNumber, CompanyStatus, IncorporationDate, CompanyCategory,
           RegAddress_CareOf, RegAddress_POBox, RegAddress_AddressLine1, RegAddress_AddressLine2,
           RegAddress_PostTown, RegAddress_County, RegAddress_Country, RegAddress_PostCode,
           SICCode_SicText_1, SICCode_SicText_2, SICCode_SicText_3, SICCode_SicText_4,
           Mortgages_NumMortCharges, Mortgages_NumMortOutstanding, 
           Mortgages_NumMortPartSatisfied, Mortgages_NumMortSatisfied,
           Accounts_NextDueDate, Accounts_LastMadeUpDate, Accounts_AccountCategory,
           ConfStmtNextDueDate, ConfStmtLastMadeUpDate,
           PreviousName_1_CompanyName, PreviousName_2_CompanyName, PreviousName_3_CompanyName
    FROM companies 
    WHERE CompanyStatus = 'Active' AND Mortgages_NumMortCharges > 0
    ORDER BY Mortgages_NumMortCharges DESC
    LIMIT 20
  `;
  
  pool.query(query, (err, results) => {
    if (err) {
      console.error('Query error:', err);
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

const PORT = process.env.PORT || 3000;
console.log(`🚀 Starting Companies API server on port ${PORT}`);

app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Companies API server running on port ${PORT}`);
});