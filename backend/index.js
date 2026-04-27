const express = require('express');
const mongoose = require('mongoose');
const UserModel = require('./models/users.model.js');
const dotenv = require('dotenv');
const dns = require('dns');

dotenv.config();
dns.setServers(['8.8.8.8', '1.1.1.1']);


const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello World');
});
// users routes
app.post('/api/users/register', async (req, res) => {
  try{
   
    const user = await UserModel.create(req.body);
    res.status(200).json({message: user});
  }
  catch(error){
    res.status(500).json({message: error.message})
  }
});
// end of users routes

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected successfully');
    app.listen(port, () => {
      console.log(`Server is now listening on port ${port}`);
    });
  })
  .catch((error) => {
    console.error('MongoDB connection failed:', error.message);
    process.exit(1);
  });