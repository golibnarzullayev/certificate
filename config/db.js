const mongoose = require('mongoose');

const connectDB = async () => {
   try {
      const conn = await mongoose.connect(process.env.MONGO_URL);
      console.log(`Mongodb connected on: ${conn.connection.host}`);
   } catch (err) {
      throw new Error(err)
   }
}

module.exports = connectDB;