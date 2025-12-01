const express = require("express");
const app = express();
const port = 3000;
const sql3 = require("sqlite3").verbose();

app.set("view engine", "pug");
app.use(express.urlencoded({ extended: true }));

const db = new sql3.Database("./univdb.sqli");

// Home page
app.get("/", (req, res) => {
    res.render("index");
});

// Student page
app.get("/student", (req, res) => {
    const id = req.query.id;
    if (!id) return res.send("Missing student ID.");

    db.get("SELECT * FROM Student WHERE StdSSN = ?", [id], (err, studentRow) => {
        if (err) return res.send(err.message);
        if (!studentRow) return res.send("Student not found.");

        // All enrolled courses (read-only)
        const enrolledSql = `
            SELECT o.OfferNo, o.CourseNo, o.OffTerm, o.OffYear,
                   f.FacFirstName || ' ' || f.FacLastName AS Instructor,
                   e.EnrGrade
            FROM Enrollment e
            JOIN Offering o ON e.OfferNo = o.OfferNo
            LEFT JOIN Faculty f ON o.FacSSN = f.FacSSN
            WHERE e.StdSSN = ?
        `;

        db.all(enrolledSql, [id], (err, enrolledRows) => {
            if (err) return res.send(err.message);

            // Winter 2025 offerings
            const winterSql = `
                SELECT o.OfferNo, o.CourseNo,
                       f.FacFirstName || ' ' || f.FacLastName AS Instructor,
                       o.OffLocation, o.OffTime, o.OffDays
                FROM Offering o
                LEFT JOIN Faculty f ON o.FacSSN = f.FacSSN
                WHERE o.OffTerm = 'Winter' AND o.OffYear = 2025
            `;

            db.all(winterSql, [], (err, winterRows) => {
                if (err) return res.send(err.message);

                winterRows = winterRows || [];

                // Mark Winter 2025 courses that the student is already enrolled in
                const enrolledSet = new Set(enrolledRows.map(r => r.OfferNo));
                winterRows.forEach(o => {
                    o.enrolled = enrolledSet.has(o.OfferNo);
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

// Enroll in Winter 2025 course
app.post("/student/enroll", (req, res) => {
    const { id, offering } = req.body;

    // Check if already enrolled
    db.get(
        "SELECT 1 FROM Enrollment WHERE StdSSN = ? AND OfferNo = ?",
        [id, offering],
        (err, row) => {
            if (err) return res.send(err.message);
            if (row) return res.redirect(`/student?id=${id}`);

            // Insert enrollment
            db.run(
                "INSERT INTO Enrollment (StdSSN, OfferNo) VALUES (?, ?)",
                [id, offering],
                (err) => {
                    if (err) return res.send(err.message);
                    res.redirect(`/student?id=${id}`);
                }
            );
        }
    );
});

// Drop Winter 2025 course
app.post("/student/drop", (req, res) => {
    const { id, offering } = req.body;

    // Only allow dropping Winter 2025 offerings
    const checkSql = `
        SELECT 1 FROM Offering o
        JOIN Enrollment e ON o.OfferNo = e.OfferNo
        WHERE e.StdSSN = ? AND o.OfferNo = ? AND o.OffTerm = 'Winter' AND o.OffYear = 2025
    `;

    db.get(checkSql, [id, offering], (err, row) => {
        if (err) return res.send(err.message);

        if (!row) {
            // Not a Winter 2025 course; ignore drop
            return res.send("Cannot drop courses from past terms.");
        }

        // Safe to drop
        db.run(
            "DELETE FROM Enrollment WHERE StdSSN = ? AND OfferNo = ?",
            [id, offering],
            (err) => {
                if (err) return res.send(err.message);
                res.redirect(`/student?id=${id}`);
            }
        );
    });
});

// Display page based on role
app.post("/display", (req, res) => {
    const { id, role } = req.body;

    if (role === "student") {
        res.redirect(`/student?id=${id}`);
    } else if (role === "faculty") {
        db.get("SELECT * FROM Faculty WHERE FacSSN = ?", [id], (err, row) =>{
            if (err) return res.send("Error: " + err.message);
            if (!row) return res.send("Faculty ID not found");
            res.render('faculty', { faculty: row });
        });
    } else if (role === "registrar") {
        res.render('registrar', {id});
    } else {
        res.send("Invalid role.");
    }
});

// Start server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
