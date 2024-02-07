const { validationResult } = require("express-validator");
const Product = require("../models/product");
const fileHelper = require("../util/file");

exports.getAddProduct = (req, res, next) => {
  res.render("admin/edit-product", {
    pageTitle: "Add Product",
    path: "/admin/add-product",
    editing: false,
    hasError: false,
    isAuthenticated: req.session.isLoggedIn,
    errorMessage: "",
    validationErrors: [],
  });
};

exports.postAddProduct = (req, res, next) => {
  const { title, price, description } = req.body;
  const img = req.file;
  const errors = validationResult(req);

  console.log(img);

  if (!img) {
    return res.status(422).render("admin/edit-product", {
      path: "/admin/edit-product",
      pageTitle: "Add Product",
      editing: false,
      hasError: true,
      product: {
        title,
        price,
        description,
      },
      errorMessage: "Please upload an appropriate image.",
      validationErrors: [],
    });
  }

  if (!errors.isEmpty()) {
    return res.status(422).render("admin/edit-product", {
      path: "/admin/edit-product",
      pageTitle: "Add Product",
      editing: false,
      hasError: true,
      product: {
        title,
        price,
        description,
      },
      errorMessage: errors.array()[0].msg,
      validationErrors: errors.array(),
    });
  }

  const product = new Product({
    title,
    price,
    img: img.path,
    description,
    userId: req.user,
  });
  product
    .save()
    .then(() => res.redirect("/admin/products"))
    .catch((err) => {
      console.log(err);
      const error = new Error(err);
      error.httpStatusCode = "500";
      return next(error);
    });
};

exports.getAdminProducts = (req, res, next) => {
  Product.find({ userId: req.user._id })
    .then((products) => {
      res.render("admin/products", {
        products: products,
        pageTitle: "Admin Products",
        path: "/admin/products",
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = "500";
      return next(error);
    });
};

exports.getEditProduct = (req, res, next) => {
  console.log(req.params.productId);
  console.log(req.query.edit);

  Product.findById(req.params.productId)
    .then((product) => {
      res.render("admin/edit-product", {
        path: "/admin/edit-product",
        pageTitle: "Edit Product",
        editing: true,
        product: product,
        hasError: false,
        errorMessage: "",
        validationErrors: [],
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = "500";
      return next(error);
    });
};

exports.postEditProduct = (req, res, next) => {
  const { productId, title, price, description } = req.body;
  const img = req.file;

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.render("admin/edit-product", {
      path: "/admin/edit-product",
      pageTitle: "Edit Product",
      editing: true,
      hasError: true,
      product: {
        title,
        price,
        description,
        _id: productId,
      },
      errorMessage: errors.array()[0].msg,
      validationErrors: errors.array(),
    });
  }

  Product.findById(productId)
    .then((product) => {
      if (product.userId.toString() !== req.user._id.toString()) {
        return res.redirect("/");
      }
      product.title = title;

      if (img) {
        fileHelper.deleteFile(product.img);
        product.img = img.path;
      }
      product.price = price;
      product.description = description;
      return product.save().then(() => res.redirect("/admin/products"));
    })

    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = "500";
      return next(error);
    });
};

exports.deleteProduct = (req, res, next) => {
  const productId = req.params.productId;
  Product.findById(productId)
    .then((product) => {
      if (!product) {
        return next(new Error());
      }
      fileHelper.deleteFile(product.img);
      return Product.deleteOne({ _id: productId, userId: req.user._id });
    })
    .then(() => {
      return res.json({ message: "Product deleted successfully" });
    })
    .catch((err) => {
      res.json({ message: "Can't delete product" });
    });
};
