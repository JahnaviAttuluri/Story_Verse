const mongoose = require('mongoose');

const BookSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, index: 'text' },
    author: { type: String, required: true, index: true },
    description: { type: String, index: 'text' },
    coverUrl: { type: String },
    genre: { type: String, index: true },
    content: { type: String },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
    isDraft: { type: Boolean, default: false, index: true },
    reviews: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        author: { type: String },
        rating: { type: Number, min: 1, max: 5 },
        text: { type: String },
        createdAt: { type: Date, default: Date.now }
      }
    ],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
  },
  { versionKey: false }
);

BookSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('Book', BookSchema);


