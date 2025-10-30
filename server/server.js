// ตัวอย่าง login handler
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

app.post("/api/login", async (req, res) => {
  const { username, password } = req.body;
  const user = await db.query("SELECT * FROM users WHERE username = $1", [
    username,
  ]);

  if (!user.rows.length) return res.status(401).send("Invalid credentials");

  const match = await bcrypt.compare(password, user.rows[0].password_hash);
  if (!match) return res.status(401).send("Invalid credentials");

  const token = jwt.sign(
    { id: user.rows[0].id, role: user.rows[0].role },
    process.env.JWT_SECRET
  );
  res.json({ token });
});
