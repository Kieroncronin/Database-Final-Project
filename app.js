const express = require("express");
const app = express();
const port = 3000;
const sql3 = require("sqlite3").verbose();

app.set("view engine", "pug");
app.use(express.urlencoded({ extended: true }));

const db = new sql3.Database("./univdb.sqli");


app.get("/", (req, res) => {
    res.render("index");
});


app.get("/student", (req, res) => {
    const id = req.query.id;
    if (!id) return res.send("Missing student ID.");

    
    db.get("SELECT * FROM Student WHERE StdSSN = ?", [id], (err, studentRow) => {
        if (err) return res.send(err.message);
        if (!studentRow) return res.send("Student not found.");

        
        const enrolledSql = `
            SELECT o.OfferingNum, o.CourseNum, o.Term, o.Year,
                   f.FirstName || ' ' || f.LastName AS Instructor,
                   e.Grade
            FROM Enrollments e
            JOIN Offerings o ON e.OfferingNum = o.OfferingNum
            LEFT JOIN Faculty f ON o.Instructor = f.FacSSN
            WHERE e.StdSSN = ?
        `;

        db.all(enrolledSql, [id], (err, enrolledRows) => {
            if (err) return res.send(err.message);

            
            const winterSql = `
                SELECT o.OfferingNum, o.CourseNum,
                       f.FirstName || ' ' || f.LastName AS Instructor,
                       o.Location, o.Time, o.Days
                FROM Offerings o
                LEFT JOIN Faculty f ON o.Instructor = f.FacSSN
                WHERE o.Term = 'Winter' AND o.Year = 2025
            `;

            db.all(winterSql, [], (err, winterRows) => {
                if (err) return res.send(err.message);

                
                const enrolledSet = new Set(enrolledRows.map(r => r.OfferingNum));
                winterRows.forEach(o => {
                    o.enrolled = enrolledSet.has(o.OfferingNum);
                });

                res.render("student", {
                    student: studentRow,
                    enrolled: enrolledRows,
                    offerings: winterRows,
                    id
                });
            });
        });
    });
});


app.post("/student/enroll", (req, res) => {
    const { id, offering } = req.body;

    
    db.get(
        "SELECT 1 FROM Enrollments WHERE StdSSN = ? AND OfferingNum = ?",
        [id, offering],
        (err, row) => {
            if (row) return res.redirect(`/student?id=${id}`);

           
            db.run(
                "INSERT INTO Enrollments (StdSSN, OfferingNum) VALUES (?, ?)",
                [id, offering],
                err => {
                    res.redirect(`/student?id=${id}`);
                }
            );
        }
    );
});


app.post("/student/drop", (req, res) => {
    const { id, offering } = req.body;
    db.run(
        "DELETE FROM Enrollments WHERE StdSSN = ? AND OfferingNum = ?",
        [id, offering],
        err => {
            res.redirect(`/student?id=${id}`);
        }
    );
});


app.post("/display", (req, res) => {
    const { id, role } = req.body;

    if (role === "student") {
        res.redirect(`/student?id=${id}`);
    } else if (role === "faculty") {
        res.send("Faculty page not implemented yet.");
    } else if (role === "registrar") {
        res.send("Registrar page not implemented yet.");
    } else {
        res.send("Invalid role.");
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
