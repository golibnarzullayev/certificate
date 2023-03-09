const { model, Schema } = require('mongoose');

const userSchema = new Schema({
   fullName: {
      type: String,
      required: true
   },
   username: {
      type: String,
      required: true,
      unique: true
   },
   password: {
      type: String,
      required: true
   }
}, {
   timestamps: true
})

module.exports = model('User', userSchema);