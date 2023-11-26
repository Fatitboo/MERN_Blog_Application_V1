const express = require('express');
const dbConnect = require('./config/db/dbConnect');
const userRouter = require('./routes/user/userRoute');
const { notFound, errorHandler } = require('./middlewares/error/errorHandler');
const postRoute = require('./routes/post/postRoute');
const cmtRoute = require('./routes/comment/commentRoute');
const categoryRoute = require('./routes/category/categoryRoute');
const emailMsgRoute = require('./routes/emailMsg/emailMsgRoute');
require('dotenv').config();
const app = express();

//use middleware
app.use(express.json());

// user Routes
app.use('/api/users', userRouter);

app.use('/api/posts', postRoute);

app.use('/api/comments', cmtRoute)

app.use('/api/category', categoryRoute)

app.use('/api/email', emailMsgRoute)
//handler errors
app.use(notFound);
app.use(errorHandler);

dbConnect();

app.listen(process.env.PORT, console.log('Server is running at port: ' + process.env.PORT));