const express = require('express');
const bodyParser = require('body-parser');
const app = express();

app.set('view engine', 'pug');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

const indexRouter = require('./routes/index');
const studentRouter = require('./routes/student');
const facultyRouter = require('./routes/faculty');
const registrarRouter = require('./routes/registrar');

app.use('/', indexRouter);
app.use('/student', studentRouter);
app.use('/faculty', facultyRouter);
app.use('/registrar', registrarRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
