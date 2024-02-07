const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const userSchema = new Schema({
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  cart: {
    items: [
      {
        productId: {
          type: Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
        },
      },
    ],
  },
  resetToken: String,
  resetTokenExpiring: Date,
});

userSchema.methods.addToCart = function (product) {
  let newQuantity = 1;
  let updatedCart = { items: [...this.cart.items] };
  const cartProductIndex = this.cart.items.findIndex((cartProduct) => {
    return cartProduct.productId.toString() === product._id.toString();
  });
  // product exists
  if (cartProductIndex >= 0) {
    newQuantity = this.cart.items[cartProductIndex].quantity + 1;
    this.cart.items[cartProductIndex].quantity = newQuantity;
  } else {
    updatedCart.items.push({ productId: product._id, quantity: newQuantity });
  }

  this.cart = updatedCart;

  return this.save();
};

userSchema.methods.deleteProductFromCart = function (productId) {
  const updatedCartItems = this.cart.items.filter((p) => {
    return p.productId.toString() !== productId.toString();
  });

  this.cart.items = updatedCartItems;

  return this.save();
};

userSchema.methods.clearCart = function () {
  this.cart = { items: [] };

  return this.save();
};

module.exports = mongoose.model("User", userSchema);

// const mogodb = require("mongodb");
// const Product = require("./product");

// const getDb = require("../util/database").getDb;

// class User {
//   constructor(name, email, cart, _id) {
//     this.name = name;
//     this.email = email;
//     this.cart = cart || { items: [] }; // {items: [product1,product2,...]}
//     this._id = _id;
//   }

//   save() {
//     const db = getDb();
//     return db.collection("users").insertOne(this);
//   }

//   addToCart(product) {
//     let newQuantity = 1;
//     let updatedCart = { items: [...this.cart.items] };

//     const cartProductIndex = this.cart.items.findIndex((cartProduct) => {
//       return cartProduct.productId.toString() === product._id.toString();
//     });

//     // product exists
//     if (cartProductIndex >= 0) {
//       const updatedProduct = { ...this.cart.items[cartProductIndex] };
//       newQuantity = updatedProduct.quantity + 1;
//       updatedProduct.quantity = newQuantity;
//       updatedCart.items[cartProductIndex] = updatedProduct;
//     } else {
//       updatedCart.items.push({ productId: product._id, quantity: newQuantity });
//     }

//     this.cart = updatedCart;
//     const db = getDb();
//     return db.collection("users").updateOne(
//       { _id: this._id },
//       {
//         $set: {
//           cart: updatedCart,
//         },
//       }
//     );
//   }

//   getCart() {
//     const cartItems = [...this.cart.items]; // [{productId: ..., quantity: ...}, ...]
//     const productIds = cartItems.map((product) => product.productId);

//     const db = getDb();

//     return db
//       .collection("products")
//       .find({ _id: { $in: productIds } })
//       .toArray()
//       .then((products) => {
//         return products.map((product) => {
//           return {
//             ...product,
//             quantity: this.cart.items.find((p) => {
//               return p.productId.toString() === product._id.toString();
//             }).quantity,
//           };
//         });
//       });
//   }

//   deleteProductFromCart(productId) {
//     const updatedCart = { ...this.cart };
//     const updatedCartItems = updatedCart.items.filter((p) => {
//       return p.productId.toString() !== productId.toString();
//     });
//     updatedCart.items = updatedCartItems;
//     this.cart = updatedCart;
//     const db = getDb();
//     return db.collection("users").updateOne(
//       { _id: this._id },
//       {
//         $set: {
//           cart: updatedCart,
//         },
//       }
//     );
//   }

//   addOrder() {
//     const db = getDb();

//     return this.getCart().then((orderedProducts) => {
//       return db
//         .collection("orders")
//         .insertOne({
//           items: orderedProducts,
//           user: { _id: this._id, name: this.name },
//         })
//         .then(() => {
//           this.cart.items = [];
//           return db.collection("users").updateOne(
//             { _id: this._id },
//             {
//               $set: {
//                 cart: { items: [] },
//               },
//             }
//           );
//         });
//     });
//   }

//   getOrders() {
//     const db = getDb();

//     return db
//       .collection("orders")
//       .find({ "user._id": this._id })
//       .toArray()
//       .then((orders) => {
//         console.log(orders, "jfhjhfhjff");
//         return orders;
//       });
//   }

//   static findById(userId) {
//     const db = getDb();
//     return db.collection("users").findOne({ _id: new mogodb.ObjectId(userId) });
//   }
// }

// module.exports = User;
