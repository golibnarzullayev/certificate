const { model, Schema } = require('mongoose');

const sertificateSchema = new Schema({
   fullName: {
      type: String,
      required: true
   },
   sertificateId: {
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

module.exports = model('Certificate', sertificateSchema);