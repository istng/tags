const express = require("express");
const cors = require('cors');
const jwt = require("jsonwebtoken");
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const app = express();
const path = require('path');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors({
  origin: '*'
}));
app.disable('x-powered-by');
app.use(cookieParser());

const port = process.env.TAGS_PORT || 8080;
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

const jwtSecret = process.env.TAGS_JWT_SECRET;

const pool = mysql.createPool({
  host: process.env.TAGS_DB_HOST,
  user: process.env.TAGS_DB_USER,
  password: process.env.TAGS_DB_PASS,
  database: process.env.TAGS_DB_DB,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

function parseCardsRows(rows) {
  var cards = [];
  for (var i = 0; i < rows.length; i++) {
    cardIndex = cards.findIndex(card => card.content === rows[i].content);
    if(cardIndex === -1)
      cards.push({tags: [rows[i].tag], 
        content: rows[i].content,
        created: rows[i].created,
        edited: rows[i].edited
      });
    else
      cards[cardIndex].tags.push(rows[i].tag);
  }
  return cards;
}

function getCardsFromUser(user) {
  return new Promise((resolve, reject) => {
    pool.getConnection((err, connection) => {
      if (err) throw err;
      console.log('Connected to database');
      connection.query("select card.*, tag.name as tag, users.username from card join tag_card on card.id=tag_card.card join tag on tag_card.tag = tag.name join users on card.user_id=users.id where users.username = ?;", [user], (err, rows) => {
        if (err) throw err;
        cards = parseCardsRows(rows);
        connection.release();
        resolve(cards);
      });
    });
  });
}

// middleware to verify JWT token in request header
const verifyToken = (req, res, next) => {
  const token = req.cookies.jwt;
  if (token != undefined) {
    jwt.verify(token, jwtSecret, (err, user) => {
      if (err) {
        return res.send(401);
      }
      req.user = user;
      next();
    });
  } else
    res.sendFile(path.join(__dirname, 'views', 'login.html'));
};

app.post('/authenticate', (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  // Get a connection from the pool
  pool.getConnection((err, connection) => {
    if (err) {
      console.error('Error getting database connection:', err);
      return res.status(500).send('Internal Server Error');
    }

    // Query the database for the username and password
    connection.query(
      'SELECT * FROM users WHERE username = ? AND password = ?',
      [username, password],
      (err, results) => {
        connection.release(); // Release the connection back to the pool

        if (err) {
          console.error('Error executing database query:', err);
          return res.status(500).send('Internal Server Error');
        }

        if (results.length === 1) {
          // Valid username and password
          const token = jwt.sign({ username: username }, jwtSecret);
          // set the token in a cookie
          res.cookie('jwt', token, {
            httpOnly: true,
            secure: true,
            sameSite: 'strict',
            maxAge: 3600000, // 1 hour
          });
          return res.redirect('/home');
        } else {
          // Invalid username or password
          return res.status(401).send('Unauthorized');
        }
      }
    );
  });
});

app.get('/home', verifyToken, async (req, res) => {
  var cards = await getCardsFromUser(req.user.username);
  res.render(path.join(__dirname, 'views', 'home.html'), { cards });
});

app.get('/add', verifyToken, (req, res) => {
  res.status(400);
});

app.get('/cards', verifyToken, (req, res) => {
  res.status(400);
});

// any other endpoint returns 400
app.get('*', (req, res, next) => {
  res.status(400);
});

app.listen(port, () => {
  console.log(`Open your browser and navigate to http://localhost:${port}`)
});