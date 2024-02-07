const crypto = require("crypto");

const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const { validationResult } = require("express-validator");

const User = require("../models/user");

const transporter = nodemailer.createTransport({
  service: "gmail",
  port: 2525,
  auth: {
    user: "mohamedtest965@gmail.com",
    pass: "psiodrmoyksrpdfl",
  },
});

exports.getLogin = (req, res, next) => {
  let message = req.flash("error");
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }

  res.render("auth/login", {
    pageTitle: "Login",
    path: "/login",
    errorMessage: message,
    oldInput: {
      email: "",
      password: "",
    },
    validationErrors: [],
  });
};

exports.getSignup = (req, res, next) => {
  let message = req.flash("error");
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }

  res.render("auth/signup", {
    path: "/signup",
    pageTitle: "Signup",
    errorMessage: message,
    oldInput: {
      email: "",
      password: "",
      confirmPassword: "",
    },
    validationErrors: [],
  });
};

exports.postLogin = (req, res, next) => {
  const { email, password } = req.body;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).render("auth/login", {
      pageTitle: "Login",
      path: "/login",
      errorMessage: errors.array()[0].msg,
      oldInput: {
        email,
        password,
      },
      validationErrors: errors.array(),
    });
  }

  User.findOne({ email: email })
    .then((user) => {
      if (!user) {
        return res.status(422).render("auth/login", {
          pageTitle: "Login",
          path: "/login",
          errorMessage: "Invalid email or password.",
          oldInput: {
            email,
            password,
          },
          validationErrors: [],
        });
      }
      return bcrypt
        .compare(password, user.password)
        .then((isMatch) => {
          if (isMatch) {
            req.session.isLoggedIn = true;
            req.session.user = user;
            return req.session.save((err) => {
              res.redirect("/");
            });
          }
          return res.status(422).render("auth/login", {
            pageTitle: "Login",
            path: "/login",
            errorMessage: "Invalid email or password.",
            oldInput: {
              email,
              password,
            },
            validationErrors: [],
          });
        })
        .catch((err) => {
          return res.redirect("/login");
        });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = "500";
      return next(error);
    });
};

exports.postSignup = (req, res, next) => {
  const { email, password, confirmPassword } = req.body;

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).render("auth/signup", {
      path: "/signup",
      pageTitle: "Signup",
      errorMessage: errors.array()[0].msg,
      oldInput: {
        email,
        password,
        confirmPassword,
      },
      validationErrors: errors.array(),
    });
  }

  bcrypt
    .hash(password, 12)
    .then((hashedPassword) => {
      const newUser = new User({
        email: email,
        password: hashedPassword,
        cart: { items: [] },
      });
      return newUser.save();
    })
    .then((result) => {
      return transporter.sendMail(
        {
          from: "Shopy App",
          to: email,
          subject: "Account Created Successfully",
          html: `<b>Hey there! </b><br> Your account created successfully!<br />`,
        },
        (err, info) => {
          if (err) {
            console.log(err);
          } else {
            console.log("Email sent: " + info.response);
            // do something useful
          }
        }
      );
    })
    .then(() => {
      return res.redirect("/login");
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = "500";
      return next(error);
    });
};

exports.postLogout = (req, res, next) => {
  req.session.destroy((err) => {
    res.redirect("/");
  });
};

exports.getReset = (req, res, next) => {
  let message = req.flash("error");
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }

  res.render("auth/reset", {
    path: "/reset",
    pageTitle: "Reset Password",
    errorMessage: message,
  });
};

exports.potReset = (req, res, next) => {
  crypto.randomBytes(32, (err, buffer) => {
    if (err) {
      res.redirect("/reset");
    }
    const token = buffer.toString("hex");
    User.findOne({ email: req.body.email })
      .then((user) => {
        if (!user) {
          req.flash("error", "No Matching Email Found!");
          return res.redirect("/reset");
        }
        user.resetToken = token;
        user.resetTokenExpiring = Date.now() + 60 * 60 * 1000;
        return user.save();
      })
      .then((result) => {
        res.redirect("/");
        transporter.sendMail(
          {
            from: "Shopy App",
            to: req.body.email,
            subject: "Reset Password",
            html: `
            <p>You currently trying to change your password</p>
            <p>Reset Link: <a href="http://localhost:3000/reset/${token}">Reset</a></p>
          `,
          },
          (err, info) => {
            if (err) {
              console.log(err);
            } else {
              console.log("Email sent: " + info.response);
              // do something useful
            }
          }
        );
      })
      .catch((err) => {
        const error = new Error(err);
        error.httpStatusCode = "500";
        return next(error);
      });
  });
};

exports.getNewPassword = (req, res, next) => {
  const token = req.params.token;

  User.findOne({ resetToken: token, resetTokenExpiring: { $gt: Date.now() } })
    .then((user) => {
      if (!user) {
        return res.redirect("/");
      }
      let message = req.flash("error");
      if (message.length > 0) {
        message = message[0];
      } else {
        message = null;
      }

      res.render("auth/new-password", {
        path: "/new-password",
        pageTitle: "New Password",
        errorMessage: message,
        resetToken: token,
        userId: user._id.toString(),
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = "500";
      return next(error);
    });
};

exports.postNewPassword = (req, res, next) => {
  const userId = req.body.userId;
  const resetToken = req.body.resetToken;
  const newPassword = req.body.newpassword;
  let editedUser;

  User.findOne({
    resetToken: resetToken,
    resetTokenExpiring: { $gt: Date.now() },
    _id: userId,
  })
    .then((user) => {
      editedUser = user;
      return bcrypt.hash(newPassword, 12);
    })
    .then((hashedPassword) => {
      editedUser.password = hashedPassword;
      editedUser.resetToken = undefined;
      editedUser.resetTokenExpiring = undefined;
      return editedUser.save();
    })
    .then((result) => {
      return res.redirect("/login");
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = "500";
      return next(error);
    });
};
