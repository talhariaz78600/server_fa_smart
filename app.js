const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config();
const bodyParser = require('body-parser');
const PORT = process.env.PORT || 2200;
const app = express();
const connectDB = require("./config/db")
const colors = require("colors");
const path = require('path'); 


app.use(cors());
app.use(express.json());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname,'uploads')));

// const userRouter = require('./api/users/user');
// const authRouter = require('./api/users/auth');
// const subCategoryRouter = require('./api/category/subcategory');
// const playListRouter = require('./api/category/plyalist');
// const categoryRouter = require('./api/category/category');
const adminRouter = require('./api/admin/admin');
const productRouter = require('./api/products/addProducts');
const appointmentRouter = require('./api/appointment/appointment');
const careerRouter = require('./api/career/career');




// app.use('/api/users', userRouter);
// app.use('/api/auth', authRouter);
// app.use('/api/subCategory', subCategoryRouter);
// app.use('/api/playList', playListRouter);
// app.use('/api/category', categoryRouter);
app.use('/api/admin', adminRouter);
app.use('/api/product', productRouter);
app.use('/api/appointment', appointmentRouter);
app.use('/api/career', careerRouter);


app.get('/', async (req, res) => {
  res.json({ message: `server is running at ${PORT}` })
})


connectDB().then(() => {

  app.listen(PORT, () => {
    console.log(`Server is running at ${PORT}`.green.underline);
  });
})