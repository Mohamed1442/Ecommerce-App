require('dotenv').config()
const path = require("path");

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const session = require("express-session");
const MongodbStore = require("connect-mongodb-session")(session);
const csrf = require("csurf");
const flash = require("connect-flash");
const multer = require("multer");
const { v4: uuidv4 } = require("uuid");

const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");
const authRoutes = require("./routes/auth");

const routePath = require("./util/path");
const User = require("./models/user");

const errorController = require("./controllers/error");
const app = express();

const DATABASE_URI = process.env.DATABASE_URI;

const store = new MongodbStore({
  uri: DATABASE_URI,
  collection: "sessions",
});

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "images");
  },
  filename: (req, file, cb) => {
    cb(null, uuidv4() + "-" + file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const csrfProtection = csrf();

app.set("view engine", "ejs");
app.set("views", "views");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(multer({ storage: fileStorage, fileFilter: fileFilter }).single("img"));
app.use("/images", express.static(path.join(routePath, "images")));
app.use(express.static(path.join(routePath, "public")));

app.use(
  session({
    secret: "This Is my Secret!",
    saveUninitialized: false,
    resave: false,
    store: store,
  })
);

app.use(csrfProtection);

app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isLoggedIn;
  res.locals.csrfToken = req.csrfToken();

  next();
});

app.use(flash());

app.use((req, res, next) => {
  if (!req.session.user) {
    return next();
  }
  User.findById(req.session.user._id)
    .then((user) => {
      if (!user) {
        return next();
      }
      req.user = user;
      next();
    })
    .catch((err) => {
      // throw new Error(err);
      // inside async code we use next(err)
      next(new Error(err));
    });
});

app.use("/admin", adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.use("/500", errorController.get500);
app.use(errorController.get404);

app.use((err, req, res, next) => {
  // res.status(err.httpStatusCode).render(...)
  // res.redirect("/500");

  console.log(err);

  res.status(500).render("500", {
    pageTitle: "Error",
    path: "/500",
  });
});

mongoose
  .connect(DATABASE_URI)
  .then((result) => {
    console.log("Connected to DB!");
    app.listen(3000);
  })
  .catch((err) => {
    console.log(err);
  });
