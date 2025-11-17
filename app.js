const express = require('express');
const app = express();
const port = 3000;
const sql3 = require('sqlite3').verbose();

app.set('view engine', 'pug');
app.use(express.urlencoded({extended: true}));

app.get('/', (req, res) => {
    res.render('index');
});

const db = new sql3.Database('./univdb.sqli');

app.post('/display', (req, res) => {
    const {id, role} = req.body;
    if (role === 'faculty'){
        db.get("SELECT * FROM Faculty WHERE FacSSN = ?", [id], (err, row) =>{
            if (err) return res.send("Error: " + err.message);
            if (!row) return res.send("Faculty ID not found");
            res.render('faculty', { faculty: row });
        });
    }
    else if (role === 'registrar'){
        res.render('registrar', {id});
    }
    else if (role === 'student'){
        db.get("SELECT * FROM Student WHERE StdSSN = ?", [id], (err, row) =>{
            if (err) return res.send("Error: " + err.message);
            if (!row) return res.send("Student ID not found");
            res.render('student', { student: row });
        });
    }
    else {
        res.send("Error")
    }
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
