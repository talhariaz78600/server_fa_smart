const mongoose = require("mongoose");
const colors = require("colors");
const uri = process.env.Mongoo_URI;

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`.cyan.underline);
  } catch (error) {
    console.error(`Error: ${error.message}`.red.bold);
    process.exit(1); // Exit with a non-zero status code to indicate an error
  }
};

module.exports = connectDB;


// const uri = process.env.Mongoo_URI;
// const connectDB = async () => {
//   mongoose.connect(uri, {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
//   })
//     .then(() => {
//       console.log("Successfully connected to MongoDB")

//     }).catch((error) => {
//       console.error("Unable to connect to MongoDB", error);
//     })
// }