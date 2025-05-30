const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(cors());

// Your Railway MySQL connection
const connection = mysql.createConnection({
  host: 'turntable.proxy.rlwy.net',
  port: 51124,
  user: 'root',
  password: 'FuEbybhbhPwJXtsPAqdKdXyvbyOCxVWc',
  database: 'railway'
});

// Get oldest companies with pagination and optional industry filter
app.get('/api/oldest/:offset?', (req, res) => {
  const offset = parseInt(req.params.offset) || 0;
  const industry = req.query.industry;
  
  let whereClause = 'WHERE CompanyStatus = \'Active\' AND IncorporationDate IS NOT NULL';
  const queryParams = [];
  
  // Add industry filter if provided
  if (industry && industry !== 'ALL') {
    // Map frontend industry names to SIC code patterns
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
  
  queryParams.push(offset);
  
  const query = `
    SELECT CompanyName, CompanyNumber, CompanyStatus, IncorporationDate,
           RegAddress_PostTown, RegAddress_County, RegAddress_Country,
           SICCode_SicText_1, SICCode_SicText_2, SICCode_SicText_3, SICCode_SicText_4,
           Mortgages_NumMortCharges, Mortgages_NumMortOutstanding, 
           Mortgages_NumMortPartSatisfied, Mortgages_NumMortSatisfied
    FROM companies 
    ${whereClause}
    ORDER BY IncorporationDate ASC
    LIMIT 5 OFFSET ?
  `;
  
  connection.query(query, queryParams, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Get newest companies with pagination and optional industry filter
app.get('/api/newest/:offset?', (req, res) => {
  const offset = parseInt(req.params.offset) || 0;
  const industry = req.query.industry;
  
  let whereClause = 'WHERE CompanyStatus = \'Active\' AND IncorporationDate IS NOT NULL';
  const queryParams = [];
  
  // Add industry filter if provided
  if (industry && industry !== 'ALL') {
    // Map frontend industry names to SIC code patterns
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
  
  queryParams.push(offset);
  
  const query = `
    SELECT CompanyName, CompanyNumber, CompanyStatus, IncorporationDate,
           RegAddress_PostTown, RegAddress_County, RegAddress_Country,
           SICCode_SicText_1, SICCode_SicText_2, SICCode_SicText_3, SICCode_SicText_4,
           Mortgages_NumMortCharges, Mortgages_NumMortOutstanding, 
           Mortgages_NumMortPartSatisfied, Mortgages_NumMortSatisfied
    FROM companies
    ${whereClause}
    ORDER BY IncorporationDate DESC
    LIMIT 5 OFFSET ?
  `;
  
  connection.query(query, queryParams, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Search companies
app.get('/api/search/:query', (req, res) => {
  const searchQuery = req.params.query;
  const query = `
    SELECT CompanyName, CompanyNumber, CompanyStatus, IncorporationDate,
           Mortgages_NumMortCharges, Mortgages_NumMortOutstanding, 
           Mortgages_NumMortPartSatisfied, Mortgages_NumMortSatisfied
    FROM companies
    WHERE CompanyName LIKE ? OR CompanyNumber LIKE ?
    ORDER BY CompanyName ASC
    LIMIT 20
  `;
  
  const searchTerm = `%${searchQuery}%`;
  connection.query(query, [searchTerm, searchTerm], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Get total company count
app.get('/api/stats', (req, res) => {
  const query = `
    SELECT 
      COUNT(*) as total,
      COUNT(CASE WHEN CompanyStatus = 'Active' THEN 1 END) as active,
      COUNT(CASE WHEN CompanyStatus = 'Dissolved' THEN 1 END) as dissolved
    FROM companies
  `;
  
  connection.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results[0]);
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Companies API server running on port ${PORT}`);
});