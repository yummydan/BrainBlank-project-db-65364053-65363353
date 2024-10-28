const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const path = require('path'); // เพิ่มเพื่อใช้ path module
const app = express();
const bodyParser = require('body-parser');
require('dotenv').config()
// กำหนดพอร์ตที่ server จะทำงาน
const PORT = 5000;

// เปิดใช้งาน CORS
// Create an instance of Express
app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, 'public')));


// เชื่อมต่อกับฐานข้อมูล MySQL users_db
const login = mysql.createConnection({
    host: 'gateway01.ap-southeast-1.prod.aws.tidbcloud.com',
    user: '4EaMJX1ZMmWazbw.root',
    password: 'Mv3jgj3SvvlneD1s',
    database: 'test',

    
    port: 4000,
    ssl: {
        rejectUnauthorized: true // ตรวจสอบความถูกต้องของใบรับรอง SSL
    }
});

login.connect(err => {
    if (err) {
        console.error('Error connecting to TiDB Cloud:', err);
    } else {
        console.log('Connected to TiDB Cloud database');
    }
});

// เชื่อมต่อกับฐานข้อมูล MySQL bank_data
const db = mysql.createConnection({
    host: 'gateway01.ap-southeast-1.prod.aws.tidbcloud.com',
    user: '4EaMJX1ZMmWazbw.root',
    password: 'Mv3jgj3SvvlneD1s',
    database: 'mydb',
    port: 4000,
    ssl: {
        rejectUnauthorized: true // ตรวจสอบความถูกต้องของใบรับรอง SSL
    }
});

db.connect(err => {
    if (err) {
        console.error('Error connecting to TiDB Cloud:', err);
    } else {
        console.log('Connected to TiDB Cloud database');
    }
});

// Register route
app.post('/register', (req, res) => {
    const { name, email, password } = req.body;

    // Check if email already exists
    const checkEmailQuery = 'SELECT * FROM users WHERE email = ?';
    login.query(checkEmailQuery, [email], (err, result) => {
        if (err) {
            return res.json({ success: false, message: 'Error checking email' });
        }

        if (result.length > 0) {
            // Email already exists
            return res.json({ success: false, message: 'Email already registered' });
        }

        // Insert new user if email does not exist
        const query = 'INSERT INTO users (name, email, password) VALUES (?, ?, ?)';
        login.query(query, [name, email, password], (err, result) => {
            if (err) {
                return res.json({ success: false, message: 'Error registering user' });
            }
            res.json({ success: true });
        });
    });
});

// Login route
app.post('/login', (req, res) => {
    const { email, password } = req.body;
    const query = 'SELECT * FROM users WHERE email = ? AND password = ?';

    login.query(query, [email, password], (err, result) => {
        if (err) {
            return res.json({ success: false, message: 'Error logging in' });
        }

        if (result.length > 0) {
            const user = result[0];
            res.json({ success: true, name: user.name }); // ส่งชื่อผู้ใช้กลับ
        } else {
            res.json({ success: false, message: 'Incorrect email or password' });
        }
    });
});


// เส้นทาง API เพื่อดึงข้อมูลการกระจายตัวของข้อมูลที่เลือก
app.get('/data-distribution', (req, res) => {
    const filterType = req.query.filterType; // รับค่าประเภทการกรอง
    const filterValue = req.query.filterValue; // รับค่าที่กรอง

    let sqlQuery = '';

    switch (filterType) {
        case 'age':
            sqlQuery = 'SELECT age as category, COUNT(*) as count FROM `bank_cleaned` GROUP BY age';
            break;
        case 'job':
            sqlQuery = 'SELECT job as category, COUNT(*) as count FROM `bank_cleaned` GROUP BY job';
            break;
        case 'education':
            sqlQuery = 'SELECT education as category, COUNT(*) as count FROM `bank_cleaned` GROUP BY education';
            break;
        case 'balance':
            sqlQuery = 'SELECT CASE ' +
                'WHEN balance < 0 THEN "< 0" ' +
                'WHEN balance BETWEEN 0 AND 1000 THEN "0-1000" ' +
                'WHEN balance BETWEEN 1001 AND 5000 THEN "1001-5000" ' +
                'ELSE "> 5000" END as category, COUNT(*) as count ' +
                'FROM `bank_cleaned` GROUP BY category';
            break;
        case 'loan':
            sqlQuery = 'SELECT loan as category, COUNT(*) as count FROM `bank_cleaned` GROUP BY loan';
            break;
        case 'contact':
            sqlQuery = 'SELECT contact as category, COUNT(*) as count FROM `bank_cleaned` GROUP BY contact';
            break;
        default:
            return res.status(400).send('Invalid filter type');
    }

    db.query(sqlQuery, (err, result) => {
        if (err) {
            res.status(500).send('Error fetching data distribution');
        } else {
            res.json(result);
        }
    });
});


app.get('/financial-data', (req, res) => {
    const chartType = req.query.chartType;

    let query = '';
    if (chartType === 'balance') {
        query = 'SELECT balance FROM `bank_cleaned`';
    }
    else if (chartType === 'default_status') {
        query = 'SELECT `default` AS status, COUNT(*) AS count FROM `bank_cleaned` GROUP BY `default`';
    }


    db.query(query, (err, result) => {
        if (err) throw err;
        res.json(result);
    });
});

// เส้นทาง API เพื่อดึงข้อมูลการวิเคราะห์แคมเปญ (Previous contacts vs Success rate)
app.get('/campaign-analysis', (req, res) => {
    const query = `
        SELECT previous, 
               SUM(CASE WHEN response = 'yes' THEN 1 ELSE 0 END) AS success_count,
               COUNT(*) AS total_count
        FROM \`bank_cleaned\`
        GROUP BY previous
        ORDER BY previous ASC;
    `;

    db.query(query, (err, result) => {
        if (err) {
            console.error('Error fetching campaign analysis data:', err);
            res.status(500).send('Error fetching campaign analysis data');
            return;
        }

        const analysisData = result.map(row => ({
            previous: row.previous,
            success_rate: row.success_count / row.total_count * 100
        }));

        res.json(analysisData);  // ส่งข้อมูลในรูป JSON
    });
});


// เส้นทาง API เพื่อดึงข้อมูลการติดต่อและอัตราความสำเร็จตามวัน/เดือน
app.get('/contacts-analysis', (req, res) => {
    const chartType = req.query.chartType;

    let query = '';
    if (chartType === 'contacts_per_day') {
        query = `
            SELECT CONCAT(month, '-', day) AS contact_date, COUNT(*) AS contact_count
            FROM \`bank_cleaned\`
            GROUP BY month, day
            ORDER BY FIELD(month, 'jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'), day ASC;
        `;
    }else if (chartType === 'contacts_per_month') {
        query = `
            SELECT month AS contact_month, COUNT(*) AS contact_count
            FROM \`bank_cleaned\`
            GROUP BY contact_month
            ORDER BY FIELD(month, 'jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec') ASC;
        `;
    } else if (chartType === 'success_rate_per_month') {
        query = `
            SELECT month AS contact_month, 
                   SUM(CASE WHEN response = 'yes' THEN 1 ELSE 0 END) AS success_count,
                   COUNT(*) AS total_count,
                   (SUM(CASE WHEN response = 'yes' THEN 1 ELSE 0 END) / COUNT(*)) * 100 AS success_rate
            FROM \`bank_cleaned\`
            GROUP BY contact_month
            ORDER BY FIELD(month, 'jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec') ASC;
        `;
    }
    db.query(query, (err, result) => {
        if (err) {
            console.error('Error fetching contacts analysis data:', err);
            res.status(500).send('Error fetching contacts analysis data');
            return;
        }

        res.json(result);
    });
});

// API สำหรับดึงข้อมูล Education vs Success Rate
app.get('/education-success-rate', (req, res) => {
    const filter = req.query.education || 'all';

    // Query ข้อมูลการศึกษาและผลลัพธ์ของแคมเปญจากฐานข้อมูล
    const query = 'SELECT education, response FROM `bank_cleaned`';

    db.query(query, (err, educationData) => {
        if (err) {
            console.error('Error fetching education data:', err);
            res.status(500).send('Error fetching education data');
            return;
        }

        // คำนวณอัตราความสำเร็จสำหรับแต่ละระดับการศึกษา
        const successRates = educationData.reduce((acc, row) => {
            const education = row.education || 'unknown';
            const success = row.response === 'yes' ? 1 : 0;

            if (filter === 'all' || education === filter) {
                if (!acc[education]) {
                    acc[education] = { success: 0, total: 0 };
                }
                acc[education].success += success;
                acc[education].total += 1;
            }
            return acc;
        }, {});

        // สร้างผลลัพธ์อัตราความสำเร็จในรูปแบบที่ส่งกลับไปยัง client
        const result = Object.keys(successRates).map((education) => ({
            education,
            success_rate: (successRates[education].success / successRates[education].total) * 100
        }));

        res.json(result);
    });
});

// API สำหรับดึงจำนวนข้อมูลตามฟิลเตอร์เดียว
app.get('/data-count', (req, res) => {
    const column = req.query.column;
    const value = req.query.value;

    const validColumns = ['age', 'job', 'marital', 'education', 'default', 'housing', 'loan', 'contact', 'month', 'day', 'poutcome'];

    if (!validColumns.includes(column)) {
        return res.status(400).send('Invalid column name');
    }

    const query = `SELECT COUNT(*) AS count FROM \`bank_cleaned\` WHERE \`${column}\` = ?`;

    db.query(query, [value], (err, results) => {
        if (err) {
            console.error('Error fetching data count:', err);
            return res.status(500).send('Error fetching data count');
        }
        res.json({ count: results[0].count });
    });
});

// เส้นทาง API เพื่อดึงค่าที่ไม่ซ้ำกันจากคอลัมน์ที่เลือก
app.get('/unique-values', (req, res) => {
    const column = req.query.column;
    const validColumns = ['age', 'job', 'marital', 'education', 'default', 'housing', 'loan', 'contact', 'month', 'day', 'poutcome'];

    if (!validColumns.includes(column)) {
        return res.status(400).send('Invalid column name');
    }

    const query = `SELECT DISTINCT \`${column}\` FROM \`bank_cleaned\` ORDER BY \`${column}\` ASC`;

    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching unique values:', err);
            return res.status(500).send('Error fetching unique values');
        }
        const values = results.map(row => row[column]);
        res.json(values);
    });
});


// API to fetch and sort data from 'bank_cleaned' table
app.get('/data', (req, res) => {
    let limit = parseInt(req.query.limit) || 15;  // Default limit
    let sort = req.query.sort || 'id';  // Default sorting column
    let order = req.query.order === 'desc' ? 'DESC' : 'ASC';  // Sorting order (default to ASC)

    let query = `SELECT * FROM \`bank_cleaned\` ORDER BY \`${sort}\` ${order} LIMIT ${limit}`;

    db.query(query, (err, results) => {
        if (err) throw err;
        res.json(results);
    });
});


// API endpoint for search with filters
app.get('/search', (req, res) => {
    const { age, job, marital } = req.query;

    // Start the base SQL query
    let sqlQuery = 'SELECT * FROM \`bank_cleaned\` WHERE 1=1';

    // Add conditions for each filter if provided
    const params = [];
    if (age) {
        sqlQuery += ' AND age = ?';
        params.push(age);
    }
    if (job) {
        sqlQuery += ' AND job LIKE ?';
        params.push(`%${job}%`);
    }
    if (marital) {
        sqlQuery += ' AND marital LIKE ?';
        params.push(`%${marital}%`);
    }

    console.log('SQL Query:', sqlQuery);  // ตรวจสอบ query ที่สร้างขึ้น
    console.log('Parameters:', params);   // ตรวจสอบพารามิเตอร์ที่ส่ง

    db.query(sqlQuery, params, (err, results) => {
        if (err) {
            console.error('Database error:', err);  // แสดง error ในคอนโซล
            return res.status(500).json({ error: 'Internal Server Error', details: err });
        }
        res.json(results);
    });
});



// เส้นทางสำหรับหน้าแรก (index.html)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index_login.html'));
});

// เริ่มการทำงานของ server
app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
