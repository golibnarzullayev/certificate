const { model, Schema } = require('mongoose');

const fileSchema = new Schema({
   fileName: {
      type: String,
      required: true,
      unique: true
   },
   file: {
      type: String,
      required: true,
      unique: true
   }
}, {
   timestamps: true
})

module.exports = model('File', fileSchema);