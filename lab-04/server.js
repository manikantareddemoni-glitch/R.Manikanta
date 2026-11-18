const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const app = express();
const PORT = process.env.PORT || 3000;
const dbPath = path.join(__dirname, "database.db");

const JWT_SECRET = "secret_key_manikanta_lab4_auth";

app.use(express.json());

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });

    await db.exec(`
      CREATE TABLE IF NOT EXISTS book (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        author TEXT NOT NULL,
        price INTEGER NOT NULL,
        pages INTEGER NOT NULL
      )
    `);

    await db.exec(`
      CREATE TABLE IF NOT EXISTS user (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        password TEXT NOT NULL
      )
    `);

    const count = await db.get("SELECT COUNT(*) as total FROM book");
    if (count.total < 15) {
      await db.exec(`DELETE FROM book`);
      await db.exec(`
        INSERT INTO book (title, author, price, pages) VALUES
        ('The Pragmatic Programmer', 'David Thomas, Andrew Hunt', 750, 352),
        ('Clean Code', 'Robert C. Martin', 650, 464),
        ('You Don''t Know JS: Scope & Closures', 'Kyle Simpson', 420, 144),
        ('Designing Data-Intensive Applications', 'Martin Kleppmann', 1200, 616),
        ('JavaScript: The Good Parts', 'Douglas Crockford', 380, 176),
        ('Atomic Habits', 'James Clear', 450, 320),
        ('Node.js Design Patterns', 'Mario Casciaro', 890, 660),
        ('Learning SQL', 'Alan Beaulieu', 550, 380),
        ('Introduction to Algorithms', 'Thomas H. Cormen', 1400, 1312),
        ('Refactoring: Improving the Design of Existing Code', 'Martin Fowler', 790, 448),
        ('Cracking the Coding Interview', 'Gayle Laakmann McDowell', 950, 687),
        ('Head First Design Patterns', 'Eric Freeman', 720, 694),
        ('Eloquent JavaScript', 'Marijn Haverbeke', 499, 472),
        ('Clean Architecture', 'Robert C. Martin', 680, 432),
        ('Database System Concepts', 'Abraham Silberschatz', 1150, 1376)
      `);
      console.log("Seeded database with 15 realistic book records.");
    }

    const server = app.listen(PORT, () => {
      console.log(`Server is running at http://localhost:${PORT}`);
    });

    server.on("error", (error) => {
      if (error.code === "EADDRINUSE") {
        console.error(
          `[Port Conflict] Port ${PORT} is already in use. Please terminate the process using this port or specify another port using PORT=<number>.`
        );
      } else {
        console.error(`[Server Error] ${error.message}`);
      }
    });
  } catch (error) {
    console.error(`Database Initialization Error: ${error.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

app.get("/", (req, res) => {
  res.status(200).json({
    message: "Welcome to Backend Development Fundamentals - Lab 4 (Registration, Login and JWT)",
    student: "Reddemoni Manikanta",
    registrationNumber: "252U1R1220",
    section: "CSE-2E 211",
    college: "Aurora Deemed-to-be-University",
    faculty: "Mr Yugandhar Gurjalwar",
    endpoints: {
      register: "POST /register/",
      login: "POST /login/",
      listBooksWithFilters: "GET /books/?search_q=&order_by=id&order=ASC&limit=10&offset=0&min_price=&max_price=",
      getSingleBook: "GET /books/:bookId/",
      addBook: "POST /books/",
      updateBook: "PUT /books/:bookId/",
      deleteBook: "DELETE /books/:bookId/"
    }
  });
});

app.get("/register/", (req, res) => {
  res.status(200).json({
    message: "Registration Endpoint. Please submit an HTTP POST request with a JSON body.",
    method: "POST",
    expectedRequestBody: {
      username: "manikanta",
      name: "Reddemoni Manikanta",
      password: "Password@123"
    }
  });
});

app.post("/register/", async (req, res, next) => {
  try {
    const { username, name, password } = req.body;

    if (
      !username ||
      !name ||
      !password ||
      typeof username !== "string" ||
      typeof name !== "string" ||
      typeof password !== "string"
    ) {
      return res.status(400).json({
        message: "Username, name, and password are required",
      });
    }

    const trimmedUsername = username.trim();
    const trimmedName = name.trim();

    if (!trimmedUsername || !trimmedName || password.length === 0) {
      return res.status(400).json({
        message: "Username, name, and password cannot be empty",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters long",
      });
    }

    const checkUserQuery = "SELECT * FROM user WHERE username = ?";
    const existingUser = await db.get(checkUserQuery, [trimmedUsername]);

    if (existingUser !== undefined) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const insertUserQuery = `
      INSERT INTO user (username, name, password)
      VALUES (?, ?, ?)
    `;
    await db.run(insertUserQuery, [trimmedUsername, trimmedName, hashedPassword]);

    res.status(201).json({
      message: "User created successfully",
    });
  } catch (error) {
    next(error);
  }
});

app.get("/login/", (req, res) => {
  res.status(200).json({
    message: "Login Endpoint. Please submit an HTTP POST request with a JSON body.",
    method: "POST",
    expectedRequestBody: {
      username: "manikanta",
      password: "Password@123"
    }
  });
});

app.post("/login/", async (req, res, next) => {
  try {
    const { username, password } = req.body;

    if (
      !username ||
      !password ||
      typeof username !== "string" ||
      typeof password !== "string"
    ) {
      return res.status(400).json({
        message: "Username and password are required",
      });
    }

    const trimmedUsername = username.trim();
    if (!trimmedUsername || password.length === 0) {
      return res.status(400).json({
        message: "Username and password cannot be empty",
      });
    }

    const selectUserQuery = "SELECT * FROM user WHERE username = ?";
    const dbUser = await db.get(selectUserQuery, [trimmedUsername]);

    if (dbUser === undefined) {
      return res.status(400).json({
        message: "Invalid user",
      });
    }

    const isPasswordMatched = await bcrypt.compare(password, dbUser.password);

    if (!isPasswordMatched) {
      return res.status(400).json({
        message: "Invalid password",
      });
    }

    const payload = { username: dbUser.username };
    const jwtToken = jwt.sign(payload, JWT_SECRET, { expiresIn: "1h" });

    res.status(200).json({
      jwt_token: jwtToken,
    });
  } catch (error) {
    next(error);
  }
});

const validateBookBody = (body) => {
  const { title, author, price, pages } = body;

  if (!title || typeof title !== "string" || title.trim() === "") {
    return "title is required and must be a non-empty string";
  }
  if (!author || typeof author !== "string" || author.trim() === "") {
    return "author is required and must be a non-empty string";
  }
  if (price === undefined || price === null || typeof price !== "number" || isNaN(price)) {
    return "price is required and must be a valid number";
  }
  if (price < 0) {
    return "price must be a non-negative number (>= 0)";
  }
  if (pages !== undefined) {
    if (typeof pages !== "number" || !Number.isInteger(pages) || pages <= 0) {
      return "pages must be a positive integer";
    }
  }

  return null;
};

app.get("/books/", async (req, res, next) => {
  try {
    const {
      search_q = "",
      order_by = "id",
      order = "ASC",
      limit = "10",
      offset = "0",
      min_price,
      max_price,
    } = req.query;

    const allowedColumns = ["id", "title", "author", "price", "pages"];
    const sanitizedOrderBy = order_by.toLowerCase();
    if (!allowedColumns.includes(sanitizedOrderBy)) {
      return res.status(400).json({
        message: `Invalid order_by field. Allowed fields: ${allowedColumns.join(", ")}`,
      });
    }

    const allowedOrders = ["ASC", "DESC"];
    const sanitizedOrder = order.toUpperCase();
    if (!allowedOrders.includes(sanitizedOrder)) {
      return res.status(400).json({
        message: "Invalid order value. Allowed values: ASC, DESC",
      });
    }

    const parsedLimit = Number(limit);
    if (!Number.isInteger(parsedLimit) || parsedLimit < 0) {
      return res.status(400).json({
        message: "limit must be a non-negative integer",
      });
    }

    const parsedOffset = Number(offset);
    if (!Number.isInteger(parsedOffset) || parsedOffset < 0) {
      return res.status(400).json({
        message: "offset must be a non-negative integer",
      });
    }

    let parsedMinPrice = null;
    if (min_price !== undefined) {
      parsedMinPrice = Number(min_price);
      if (isNaN(parsedMinPrice) || parsedMinPrice < 0) {
        return res.status(400).json({
          message: "min_price must be a non-negative number",
        });
      }
    }

    let parsedMaxPrice = null;
    if (max_price !== undefined) {
      parsedMaxPrice = Number(max_price);
      if (isNaN(parsedMaxPrice) || parsedMaxPrice < 0) {
        return res.status(400).json({
          message: "max_price must be a non-negative number",
        });
      }
    }

    const conditions = [];
    const params = [];

    if (search_q.trim() !== "") {
      conditions.push("title LIKE ?");
      params.push(`%${search_q.trim()}%`);
    }

    if (parsedMinPrice !== null) {
      conditions.push("price >= ?");
      params.push(parsedMinPrice);
    }

    if (parsedMaxPrice !== null) {
      conditions.push("price <= ?");
      params.push(parsedMaxPrice);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
    const sql = `
      SELECT * FROM book
      ${whereClause}
      ORDER BY ${sanitizedOrderBy} ${sanitizedOrder}
      LIMIT ? OFFSET ?
    `;
    params.push(parsedLimit, parsedOffset);

    const books = await db.all(sql, params);
    res.status(200).json(books);
  } catch (error) {
    next(error);
  }
});

app.get("/books/:bookId/", async (req, res, next) => {
  try {
    const { bookId } = req.params;
    const parsedId = Number(bookId);

    if (!Number.isInteger(parsedId) || parsedId <= 0) {
      return res.status(400).json({
        message: "Invalid bookId format. Must be a positive integer",
      });
    }

    const book = await db.get("SELECT * FROM book WHERE id = ?", [parsedId]);
    if (!book) {
      return res.status(404).json({
        message: `Book with ID ${parsedId} not found`,
      });
    }

    res.status(200).json(book);
  } catch (error) {
    next(error);
  }
});

app.post("/books/", async (req, res, next) => {
  try {
    const validationError = validateBookBody(req.body);
    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    const { title, author, price, pages = 100 } = req.body;
    const query = "INSERT INTO book (title, author, price, pages) VALUES (?, ?, ?, ?)";
    const result = await db.run(query, [title.trim(), author.trim(), price, pages]);

    res.status(201).json({
      id: result.lastID,
      title: title.trim(),
      author: author.trim(),
      price,
      pages,
    });
  } catch (error) {
    next(error);
  }
});

app.put("/books/:bookId/", async (req, res, next) => {
  try {
    const { bookId } = req.params;
    const parsedId = Number(bookId);

    if (!Number.isInteger(parsedId) || parsedId <= 0) {
      return res.status(400).json({
        message: "Invalid bookId format. Must be a positive integer",
      });
    }

    const existingBook = await db.get("SELECT * FROM book WHERE id = ?", [parsedId]);
    if (!existingBook) {
      return res.status(404).json({
        message: `Book with ID ${parsedId} not found`,
      });
    }

    const validationError = validateBookBody(req.body);
    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    const { title, author, price, pages = existingBook.pages } = req.body;
    const query = "UPDATE book SET title = ?, author = ?, price = ?, pages = ? WHERE id = ?";
    await db.run(query, [title.trim(), author.trim(), price, pages, parsedId]);

    res.status(200).json({ message: "Book Updated Successfully" });
  } catch (error) {
    next(error);
  }
});

app.delete("/books/:bookId/", async (req, res, next) => {
  try {
    const { bookId } = req.params;
    const parsedId = Number(bookId);

    if (!Number.isInteger(parsedId) || parsedId <= 0) {
      return res.status(400).json({
        message: "Invalid bookId format. Must be a positive integer",
      });
    }

    const existingBook = await db.get("SELECT * FROM book WHERE id = ?", [parsedId]);
    if (!existingBook) {
      return res.status(404).json({
        message: `Book with ID ${parsedId} not found`,
      });
    }

    const query = "DELETE FROM book WHERE id = ?";
    await db.run(query, [parsedId]);

    res.status(200).json({ message: "Book Deleted Successfully" });
  } catch (error) {
    next(error);
  }
});

app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

app.use((err, req, res, next) => {
  console.error("Unhandled Error:", err.stack || err.message);
  res.status(500).json({ message: "Internal server error" });
});
