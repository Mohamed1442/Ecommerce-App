const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const productSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  img: {
    type: String,
    required: true,
  },
  userId: {
    type: Schema.Types.ObjectId,
    rer: "User",
    required: true,
  },
});

module.exports = mongoose.model("Product", productSchema);

// const mongodb = require("mongodb");
// const getDb = require("../util/database").getDb;

// class Product {
//   constructor(title, price, imgUrl, description, id, userId) {
//     this.title = title;
//     this.price = price;
//     this.imgUrl = imgUrl;
//     this.description = description;
//     this._id = id && new mongodb.ObjectId(id);
//     this.userId = userId;
//   }
//   save() {
//     const db = getDb();

//     if (this._id) {
//       return db
//         .collection("products")
//         .updateOne({ _id: this._id }, { $set: this });
//     } else {
//       return db.collection("products").insertOne(this);
//     }
//   }

//   static fetchAll() {
//     const db = getDb();
//     return db.collection("products").find().toArray();
//   }

//   static findById(productId) {
//     const db = getDb();
//     return db
//       .collection("products")
//       .find({ _id: new mongodb.ObjectId(productId) })
//       .next();
//   }

//   static deleteById(productId) {
//     const db = getDb();
//     return db
//       .collection("products")
//       .deleteOne({ _id: new mongodb.ObjectId(productId) });
//   }
// }

// module.exports = Product;
