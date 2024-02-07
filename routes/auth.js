const express = require("express");
const { check, body } = require("express-validator");

const router = express.Router();

const authController = require("../controllers/auth");
const User = require("../models/user");

router.get("/login", authController.getLogin);

router.get("/signup", authController.getSignup);

router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Please enter a valid email."),
    body(
      "password",
      "Please enter a valid password with only numbers and text with at least 5 characters."
    )
      .isLength({ min: 5 })
      .isAlphanumeric(),
  ],
  authController.postLogin
);

router.post("/logout", authController.postLogout);

router.post(
  "/signup",
  [
    check("email")
      .normalizeEmail()
      .isEmail()
      .withMessage("Please enter a valid email.")
      .custom((value) => {
        // if (value === "test@test.com") {
        //   throw new Error("This email address is forbidden.");
        // }
        return User.findOne({ email: value }).then((user) => {
          if (user) {
            return Promise.reject("E-mail exists already.");
          }
        });
      }),
    body(
      "password",
      "Please enter a valid password with only numbers and text with at least 5 characters."
    )
      .trim()
      .isLength({ min: 5 })
      .isAlphanumeric(),
    body("confirmPassword")
      .trim()
      .custom((value, { req }) => {
        if (value !== req.body.password) {
          throw new Error("Password must match!");
        }

        return true;
      }),
  ],
  authController.postSignup
);

router.get("/reset", authController.getReset);

router.post("/reset", authController.potReset);

router.get("/reset/:token", authController.getNewPassword);

router.post("/new-password", authController.postNewPassword);

module.exports = router;
