const express = require("express");
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const jwt = require("jsonwebtoken");
const app = express();
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors({
  origin: '*'
}));
app.disable('x-powered-by');

const access = process.env.COMPARE_TOOL_USER || 'ivan';
const accessPass = process.env.COMPARE_TOOL_PASS || 'a';
const jwtSecret = process.env.COMPARE_TOOL_JWT_SECRET || 'secret';

const port = process.env.COMPARE_TOOL_PORT || 8080;
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

// middleware to verify JWT token in request header
const verifyToken = (req, res, next) => {
  const token = req.cookies.jwt;
  if (token != undefined) {
    jwt.verify(token, jwtSecret, (err, user) => {
      if (err) {
        console.log(err);
        return res.sendStatus(404);
      }
      req.user = user;
      next();
    });
  } else
    res.sendFile(path.join(__dirname, 'views', 'login.html'));
};

app.post('/authenticate', (req, res, next) => {
  // check username and password
  const username = req.body.username;
  const password = req.body.password;
  if (username === access && password === accessPass) {
    const token = jwt.sign({ username: username }, jwtSecret);
    // Set the token in a cookie
    res.cookie('jwt', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: 3600000, // 1 hour
    });

    return res.redirect('/');
  } else
    res.sendStatus(404);
});

//app.use(verifyToken);
app.use(express.static(path.join(__dirname, 'build')));

app.listen(port, () => {
  console.log(`Open your browser and navigate to http://localhost:${port}`)
});
