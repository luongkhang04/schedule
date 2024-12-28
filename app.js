const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const app = express();

// Cấu hình body-parser để xử lý form data
app.use(bodyParser.urlencoded({ extended: false }));

// Cấu hình thư mục public cho các file tĩnh
app.use(express.static(path.join(__dirname, 'public')));

// Cấu hình EJS như view engine
app.set('view engine', 'ejs');

// Trang chủ (Landing Page)
app.get('/', (req, res) => {
    res.render('index');
});

// Trang đăng nhập
app.get('/login', (req, res) => {
    res.render('login');
});

// Trang đăng ký
app.get('/register', (req, res) => {
    res.render('register');
});

// Trang xếp lịch học
app.get('/schedule', (req, res) => {
    res.render('schedule');
});

// Khởi động server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
