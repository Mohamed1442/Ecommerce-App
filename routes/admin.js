const express = require("express");
const { body } = require("express-validator");

const adminController = require("../controllers/admin");
const isAuth = require("../middleware/is-auth");

const router = express.Router();

//get /admin/add-product
router.get("/add-product", isAuth, adminController.getAddProduct);

//post /admin/add-product
router.post(
  "/add-product",
  [
    body("title").trim().isString().isLength({ min: 3 }),
    body("price").isFloat(),
    body("description").trim().isLength({ min: 5, max: 400 }),
  ],
  isAuth,
  adminController.postAddProduct
);

router.get("/products", isAuth, adminController.getAdminProducts);

router.get("/edit-product/:productId", isAuth, adminController.getEditProduct);

router.post(
  "/edit-product",
  [
    body("title").trim().isString().isLength({ min: 3 }),
    body("price").isFloat(),
    body("description").trim().isLength({ min: 5, max: 400 }),
  ],
  isAuth,
  adminController.postEditProduct
);

router.delete("/products/:productId", isAuth, adminController.deleteProduct);

module.exports = router;
