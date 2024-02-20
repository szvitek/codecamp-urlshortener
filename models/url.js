const mongoose = require('mongoose');
const { Schema } = mongoose;

const urlSchema = new Schema({
  original_url: { type: String, unique: true, required: true },
  short_url: { type: Number, default: 1 },
});

urlSchema.pre('save', async function () {
  const [lastUrl] = await mongoose
    .model('Url')
    .find({})
    .sort({ short_url: -1 })
    .limit(1);
  if (lastUrl) {
    this.short_url = lastUrl.short_url + 1;
  }
});

module.exports = mongoose.model('Url', urlSchema);
