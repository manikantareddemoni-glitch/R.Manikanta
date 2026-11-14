# Lab 4: Registration, login and JWT

> **🔗 Live Deployment URL:** [https://r-manikanta-3.onrender.com](https://r-manikanta-3.onrender.com)

---

## 📋 Student Information

| Field | Details |
| --- | --- |
| **Name** | Reddemoni Manikanta |
| **Registration Number** | 252U1R1220 |
| **Section** | CSE-2E 211 |
| **Course** | Backend Development Fundamentals · Year II Term II |
| **Faculty** | Mr Yugandhar Gurjalwar |
| **College** | Aurora Deemed-to-be-University |

---

## 🎯 Objective

Add secure user registration and login to the Express REST API using industry-standard **bcrypt** password hashing and **JSON Web Tokens (JWT)** for stateless authentication. Ensure passwords are never stored in plain text, enforce request body validation, utilize parameterized SQL queries to prevent SQL injection, and analyze decoded JWT tokens using `jwt.io`.

---

## 🛠️ Technologies Used

| Technology | Purpose |
| --- | --- |
| **Node.js** | JavaScript runtime environment for backend execution |
| **Express.js** | Web framework for routing and handling HTTP requests |
| **SQLite (sqlite3 / sqlite)** | Lightweight, file-based relational database |
| **bcrypt** | Cryptographic library for salt generation and one-way password hashing |
| **jsonwebtoken (JWT)** | Stateless authentication token generation and verification |
| **nodemon** | Development tool for automatic server reload on code modification |
| **Postman** | Comprehensive API design and automated request testing suite |
| **Git & GitHub** | Version control and source code repository |

---

## 🗄️ Database Structure

**Database File:** `database.db`

### 1. `user` Table (New in Lab 4)
Stores registered user credentials. **Passwords are stored strictly as bcrypt hashes with 10 salt rounds.**

| Column | Type | Constraints | Description |
| --- | --- | --- | --- |
| `id` | INTEGER | PRIMARY KEY AUTOINCREMENT | Unique identifier for each registered user |
| `username` | TEXT | UNIQUE NOT NULL | Unique login handle for the user |
| `name` | TEXT | NOT NULL | User's full display name |
| `password` | TEXT | NOT NULL | 60-character bcrypt one-way password hash |

### 2. `book` Table (Retained from Lab 2 & Lab 3)
Maintained to guarantee full backward compatibility for all existing `/books/` endpoints.

| Column | Type | Constraints | Description |
| --- | --- | --- | --- |
| `id` | INTEGER | PRIMARY KEY AUTOINCREMENT | Unique identifier for each book |
| `title` | TEXT | NOT NULL | Title of the book |
| `author` | TEXT | NOT NULL | Full author name |
| `price` | INTEGER | NOT NULL | Price in INR |
| `pages` | INTEGER | NOT NULL | Total page count |

---

## ⚙️ How to Install & Run

### Prerequisites
- **Node.js** (v18.x or v20.x LTS or higher)
- **npm** (bundled with Node.js)

### Installation Steps

1. **Navigate to the `lab-04` directory:**
   ```bash
   cd R.Manikanta/lab-04
   ```

2. **Install all dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Copy `.env.example` to create `.env` (never commit real secret values):
   ```env
   PORT=3000
   ```

4. **Start the Server:**
   - **Production Mode:**
     ```bash
     npm start
     ```
   - **Development Mode (with auto-reload):**
     ```bash
     npm run dev
     ```

5. **Local Server URL:** [http://localhost:3000](http://localhost:3000)

---

## 📡 API Endpoints

| Method | Path | Live URL | Description | Expected Status Codes |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/` | [Open Live Link](https://r-manikanta-3.onrender.com/) | API Directory, student information & service status | `200 OK` |
| `POST` | `/register/` | [API Endpoint](https://r-manikanta-3.onrender.com/register/) | Register new user with bcrypt password hashing | `201 Created` / `400 Bad Request` |
| `POST` | `/login/` | [API Endpoint](https://r-manikanta-3.onrender.com/login/) | Authenticate user & return signed JWT token | `200 OK` / `400 Bad Request` |
| `GET` | `/books/` | [Open Live Link](https://r-manikanta-3.onrender.com/books/) | List books with search, sort, and pagination | `200 OK` / `400 Bad Request` |
| `GET` | `/books/:bookId/` | [Open Live Link (ID 1)](https://r-manikanta-3.onrender.com/books/1/) | Retrieve a single book record by ID | `200 OK` / `400 Bad Request` / `404 Not Found` |
| `POST` | `/books/` | [API Endpoint](https://r-manikanta-3.onrender.com/books/) | Create and insert a new book record | `201 Created` / `400 Bad Request` |
| `PUT` | `/books/:bookId/` | [API Endpoint (ID 1)](https://r-manikanta-3.onrender.com/books/1/) | Update existing book details | `200 OK` / `400 Bad Request` / `404 Not Found` |
| `DELETE` | `/books/:bookId/` | [API Endpoint (ID 15)](https://r-manikanta-3.onrender.com/books/15/) | Delete book record by ID | `200 OK` / `400 Bad Request` / `404 Not Found` |

---

## 🧪 Postman Test Suite & Verification Results

A complete collection with 12 automated test cases is provided in [`postman/Lab4.postman_collection.json`](postman/Lab4.postman_collection.json).

| # | Test Scenario | Method | Endpoint | Request Payload | Expected Status | Real Result |
| :---: | :--- | :---: | :--- | :--- | :---: | :---: |
| **1** | API Directory | `GET` | `/` | None | `200 OK` | `200 OK` ✅ |
| **2** | Register User Success | `POST` | `/register/` | `{"username":"manikanta", "name":"Reddemoni Manikanta", "password":"Password@123"}` | `201 Created` | `201 Created` ✅ |
| **3** | Register Duplicate User | `POST` | `/register/` | `{"username":"manikanta", "name":"Reddemoni Manikanta", "password":"Password@123"}` | `400 Bad Request` | `400 Bad Request` ✅ |
| **4** | Register Missing Fields | `POST` | `/register/` | `{"username":"incomplete_user"}` | `400 Bad Request` | `400 Bad Request` ✅ |
| **5** | Register Password < 6 Chars | `POST` | `/register/` | `{"username":"short_pwd", "name":"Short", "password":"123"}` | `400 Bad Request` | `400 Bad Request` ✅ |
| **6** | Login Success with JWT | `POST` | `/login/` | `{"username":"manikanta", "password":"Password@123"}` | `200 OK` | `200 OK` ✅ |
| **7** | Login Unknown User | `POST` | `/login/` | `{"username":"ghost_user_999", "password":"Password@123"}` | `400 Bad Request` | `400 Bad Request` ✅ |
| **8** | Login Wrong Password | `POST` | `/login/` | `{"username":"manikanta", "password":"WrongPassword!"}` | `400 Bad Request` | `400 Bad Request` ✅ |
| **9** | Login Missing Fields | `POST` | `/login/` | `{"username":"manikanta"}` | `400 Bad Request` | `400 Bad Request` ✅ |
| **10** | Backward Compatibility /books/ | `GET` | `/books/?limit=3` | None | `200 OK` | `200 OK` ✅ |
| **11** | GET Single Book by ID | `GET` | `/books/1/` | None | `200 OK` | `200 OK` ✅ |
| **12** | 404 Unknown Route | `GET` | `/unknown-route-test/` | None | `404 Not Found` | `404 Not Found` ✅ |

---

## 🔍 SQLite CLI Verification

To verify directly inside the SQLite database that:
1. Passwords are never stored in plain text.
2. Usernames are uniquely enforced.
3. Identical plaintext passwords for different users produce **distinct hashes** due to bcrypt salt generation:

```bash
sqlite3 database.db
```

```sql
.headers on
.mode column

-- Inspect all registered user records:
SELECT id, username, name, password FROM user;
```

### Real Terminal Output:
```text
id  username   name                  password
--  ---------  --------------------  ------------------------------------------------------------
1   manikanta  Reddemoni Manikanta   $2b$10$.ecW9MkUJte9Pyah58C1me/wiIFew1vwQLwpikEzjiMHEdEtrZENC
2   rahul      Rahul Sharma          $2b$10$m3aop87AeaH47Q7JDhqQEes3/rFGEYG9M0OB6hOCJsfQTEKyhRlWG
```

> [!IMPORTANT]
> Both `manikanta` and `rahul` were registered with the exact same plaintext password (`secret123`), but because `bcrypt` automatically generates a random cryptographic salt for each call, the stored password hashes are completely different.

---

## 🔐 JWT Structure & Decoding at jwt.io

A JSON Web Token consists of three base64url-encoded parts separated by dots (`.`):
$$\text{JWT} = \text{Header} \,.\, \text{Payload} \,.\, \text{Signature}$$

### Real Token Generated by Server:
```text
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6Im1hbmlrYW50YSIsImlhdCI6MTc5NDU2NTc5MCwiZXhwIjoxNzk0NTY5MzkwfQ.CxZR9lzdaoqqYoznm9tnNqKCwaZNc2F9VazkdN3QM9k
```

### 1. Header (Red)
Specifies the cryptographic signing algorithm and token type:
```json
{
  "alg": "HS256",
  "typ": "JWT"
}
```

### 2. Payload (Purple)
Contains user identity claims. **Only the username and timestamp claims (`iat`, `exp`) are present. Passwords, hashes, and database secrets are never included.**
```json
{
  "username": "manikanta",
  "iat": 1794565790,
  "exp": 1794569390
}
```

### 3. Signature (Cyan)
Created by taking the base64url-encoded header and payload, hashing them with the HMAC SHA-256 algorithm and the server secret key:
```text
HMACSHA256(
  base64UrlEncode(header) + "." + base64UrlEncode(payload),
  secret_key_manikanta_lab4_auth
)
```

### How to Verify at jwt.io:
1. Open [https://jwt.io](https://jwt.io) in your browser.
2. Paste the token from `POST /login/` into the **Encoded** box on the left.
3. Observe the right-hand **Decoded** pane automatically parse the Header (`HS256`) and Payload (`{"username": "manikanta"}`).
4. Under **Verify Signature**, enter `secret_key_manikanta_lab4_auth` into the secret input to see **Signature Verified**.

---

## 📸 Screenshots

### 1. Register Success (201 Created)
- **Render Live URL:** [https://r-manikanta-3.onrender.com/register/](https://r-manikanta-3.onrender.com/register/)
- **Expected Status:** `201 Created`
- **Response:** `{"message": "User created successfully"}`

![Register Success](screenshots/01-register-success.png)

---

### 2. Register Existing Username (400 Bad Request)
- **Render Live URL:** [https://r-manikanta-3.onrender.com/register/](https://r-manikanta-3.onrender.com/register/)
- **Expected Status:** `400 Bad Request`
- **Response:** `{"message": "User already exists"}`

![Register Existing User](screenshots/02-register-existing-user.png)

---

### 3. Register Validation Error - Password Too Short (400 Bad Request)
- **Render Live URL:** [https://r-manikanta-3.onrender.com/register/](https://r-manikanta-3.onrender.com/register/)
- **Expected Status:** `400 Bad Request`
- **Response:** `{"message": "Password must be at least 6 characters long"}`

![Register Validation Error](screenshots/03-register-validation-error.png)

---

### 4. Login Success Returning JWT Token (200 OK)
- **Render Live URL:** [https://r-manikanta-3.onrender.com/login/](https://r-manikanta-3.onrender.com/login/)
- **Expected Status:** `200 OK`
- **Response:** `{"jwt_token": "..."}`

![Login Success JWT](screenshots/04-login-success-jwt.png)

---

### 5. Login Unknown User (400 Bad Request)
- **Render Live URL:** [https://r-manikanta-3.onrender.com/login/](https://r-manikanta-3.onrender.com/login/)
- **Expected Status:** `400 Bad Request`
- **Response:** `{"message": "Invalid user"}`

![Login Unknown User](screenshots/05-login-unknown-user.png)

---

### 6. Login Wrong Password (400 Bad Request)
- **Render Live URL:** [https://r-manikanta-3.onrender.com/login/](https://r-manikanta-3.onrender.com/login/)
- **Expected Status:** `400 Bad Request`
- **Response:** `{"message": "Invalid password"}`

![Login Wrong Password](screenshots/06-login-wrong-password.png)

---

### 7. SQLite CLI Showing Hashed Passwords & Salting
- **Verification:** `SELECT id, username, name, password FROM user;`
- Proves no plain text passwords exist; identical passwords yield distinct hashes.

![SQLite CLI Users Hashed](screenshots/07-sqlite-cli-users-hashed.png)

---

### 8. jwt.io Decoded Token (Header, Payload, Signature)
- **Verification:** Token pasted into jwt.io debugger showing decoded JSON claims and signature verification.

![JWT IO Decoded Token](screenshots/08-jwt-io-decoded-token.png)

---

### 9. Terminal Showing Server Running
- **Command:** `npm start`
- Proves startup, database initialization, and port binding without error.

![Terminal Server Running](screenshots/09-terminal-server-running.png)

---

## 💡 Notes: Problems Faced and How They Were Solved

1. **Storing Passwords Securely vs Plain Text Risk:**
   - *Problem:* Storing passwords as raw text in the database exposes all user accounts if the database file is compromised.
   - *Solution:* Implemented `bcrypt.hash(password, 10)`. The `10` salt rounds ensure computational security against brute force attacks.

2. **Rainbow Table Attacks on Identical Passwords:**
   - *Problem:* If two users choose the same password (e.g. `secret123`), simple cryptographic hashes (like SHA-256) would produce identical hash strings, allowing attackers to pre-compute hash dictionaries (rainbow tables).
   - *Solution:* `bcrypt` automatically generates a random 128-bit salt and prepends it to the resulting hash. As proved in our SQLite CLI verification, identical passwords produce completely different hash strings.

3. **Preventing SQL Injection in Authentication:**
   - *Problem:* Malicious strings like `' OR '1'='1` in the username input can bypass login if concatenated directly into SQL queries.
   - *Solution:* Enforced parameterized queries (`SELECT * FROM user WHERE username = ?`) for all user input lookups. The database engine treats the input strictly as literal string values.

4. **Secret Key Placement in Lab 4:**
   - *Problem:* The curriculum requires the JWT secret key to be placed in a top-level constant in Lab 4, before moving it to `.env` in Lab 8.
   - *Solution:* Declared `const JWT_SECRET = "secret_key_manikanta_lab4_auth"` at the top of `server.js` with clear documentation notes indicating that production secrets belong in `.env`.

5. **Cloud Deployment & SQLite Persistence:**
   - *Problem:* Free cloud hosting tiers (such as Render Free Tier) use ephemeral container filesystems. When the service goes idle and spins down, newly registered users stored in `database.db` are lost.
   - *Solution:* Documented the requirement for persistent storage (Render Persistent Disk, NxtWave Cloud IDE, or Docker volume mounts) and ensured comprehensive Postman and SQLite CLI test verification is preserved in the repository.

---

## 🎓 Viva Questions & Answers (Be Ready to Answer)

### Q1: Why use `POST` instead of `GET` for the login endpoint?
**Answer:**
1. **Security & URL Visibility:** `GET` request parameters are transmitted inside the query string in the URL (e.g. `/login?username=user&password=123`). This URL is recorded in plain text in browser histories, proxy logs, server access logs, and network monitoring tools. `POST` sends credentials inside the HTTP request body.
2. **Payload Size & Semantics:** `POST` is designed for submitting sensitive data and initiating state changes or session token issuance. `GET` is idempotent and safe, intended solely for retrieving resources without side effects.

### Q2: What is the difference between Hashing and Encryption?
**Answer:**
- **Hashing (One-Way):** Converts plaintext into a fixed-length string using a one-way mathematical function. It cannot be decrypted back into the original plaintext. Verification is performed by hashing the input again and comparing the two hashes (`bcrypt.compare`). Ideal for password storage.
- **Encryption (Two-Way):** Transforms plaintext into ciphertext using an encryption key and an algorithm (e.g. AES). The ciphertext **can** be decrypted back to plaintext using the corresponding decryption key. Ideal for confidential data in transit or encrypted backups.

### Q3: What does `jwt.sign()` need?
**Answer:**
`jwt.sign(payload, secretOrPrivateKey, [options, callback])` requires three primary arguments:
1. **Payload:** A plain JavaScript object holding the identity claims (e.g. `{ username: "manikanta" }`).
2. **Secret Key:** A cryptographic key string used by HMAC SHA-256 to sign the token and guarantee that it cannot be forged.
3. **Options:** An optional configuration object, typically `{ expiresIn: "1h" }` to set an automatic expiration lifespan.

### Q4: What should NEVER go into a JWT payload?
**Answer:**
**Sensitive, confidential, or secret data** should never be placed in a JWT payload:
- Plaintext passwords or bcrypt password hashes.
- Credit card numbers, bank details, or Social Security numbers.
- Secret API keys or database connection strings.

*Why?* The JWT payload is only **base64url-encoded**, **NOT encrypted**. Anyone with access to the token can paste it into `jwt.io` or run `Buffer.from(payload, 'base64')` to inspect every claim inside the payload in plain text.

### Q5: What is salting and why does bcrypt use it?
**Answer:**
- **Salting** is the addition of unique, cryptographically random data (a "salt") to the plaintext password before it is hashed.
- `bcrypt` uses salting to prevent **Rainbow Table attacks** (precomputed tables of common password hashes). Because every user's password receives a distinct random salt, two users with the exact same password (e.g. `Password123`) will always have completely different hashes in the database.

### Q6: How does `bcrypt.compare()` verify a password without knowing the original plaintext?
**Answer:**
A bcrypt hash string contains the algorithm version, cost factor (salt rounds), the salt itself, and the final hashed output combined (e.g. `$2b$10$SALT...HASH...`).
When `bcrypt.compare(password, dbHash)` runs:
1. It extracts the original salt and cost factor directly from the stored `dbHash`.
2. It hashes the candidate plaintext password using that **exact same salt**.
3. It performs a constant-time comparison between the new hash and the stored hash. If they match, the password is correct!

### Q7: What is stateless authentication?
**Answer:**
In stateless authentication (JWT), the server does not save session records in memory or a session table in the database. Instead, all necessary user information is encoded into the signed JWT token sent to the client. On subsequent requests, the server simply verifies the digital signature of the token to authenticate the user, allowing backend APIs to scale horizontally without shared session stores.

---

## 👤 Author

**Reddemoni Manikanta**  
B.Tech CSE – Aurora Deemed-to-be-University  
Registration Number: `252U1R1220`  
Section: `CSE-2E 211`

