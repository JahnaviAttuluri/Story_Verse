const express = require('express');
const jwt = require('jsonwebtoken');
const Book = require('../models/Book');

const router = express.Router();

function authRequired(req, res, next) {
  try {
    let token = req.cookies && req.cookies.token;
    if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.slice('Bearer '.length);
    }
    if (!token) return res.status(401).json({ message: 'Unauthorized' });
    const secret = process.env.JWT_SECRET || 'jonv0488';
    const payload = jwt.verify(token, secret);
    req.userId = payload.sub;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
}

// GET /api/books
router.get('/', async (req, res) => {
  try {
    const { search, genre } = req.query;
    const filter = { isDraft: false }; // Only show published stories
    
    // Apply genre filter if provided and not "all"
    if (genre && genre !== 'all' && genre !== 'All') {
      filter.genre = genre;
    }
    
    // Apply search filter if provided
    if (search && search.trim()) {
      const searchRegex = { $regex: search.trim(), $options: 'i' };
      filter.$or = [
        { title: searchRegex },
        { author: searchRegex },
        { description: searchRegex },
        { genre: searchRegex }
      ];
    }
    
    // Fetch books
    let books = await Book.find(filter);
    
    // If no search and no genre (showing "All"), randomize order for variety
    if (!search && (!genre || genre === 'all' || genre === 'All')) {
      books = books.sort(() => Math.random() - 0.5);
    } else {
      // Otherwise sort by newest first
      books = books.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    
    res.json(books);
  } catch (err) {
    console.error('Error fetching books:', err);
    res.status(500).json({ message: 'Failed to fetch books' });
  }
});

// POST /api/books
router.post('/', authRequired, async (req, res) => {
  try {
    const { title, author, description, coverUrl, genre, content, isDraft } = req.body;
    if (!title) {
      return res.status(400).json({ message: 'title is required' });
    }
    const created = await Book.create({
      title,
      author: author || 'Anonymous',
      description,
      coverUrl,
      genre: typeof genre === 'string' ? genre.toLowerCase() : undefined,
      content,
      owner: req.userId,
      isDraft: isDraft === true
    });
    res.status(201).json(created);
  } catch (err) {
    res.status(500).json({ message: 'Failed to create book' });
  }
});

// GET /api/books/:id
// GET /api/books/mine (place BEFORE :id route)
router.get('/mine', authRequired, async (req, res) => {
  try {
    const { drafts } = req.query;
    const filter = { owner: req.userId };
    if (drafts === 'true') {
      filter.isDraft = true;
    } else if (drafts === 'false') {
      filter.isDraft = false;
    }
    const books = await Book.find(filter).sort({ createdAt: -1 });
    res.json(books);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch user books' });
  }
});

// GET /api/books/:id
router.get('/:id', async (req, res) => {
  try {
    const book = await Book.findById(req.params.id).populate('reviews.user', 'name email');
    if (!book) return res.status(404).json({ message: 'Not found' });
    res.json(book);
  } catch (err) {
    res.status(400).json({ message: 'Invalid id' });
  }
});

// PUT /api/books/:id
router.put('/:id', authRequired, async (req, res) => {
  try {
    const updated = await Book.findOneAndUpdate(
      { _id: req.params.id, owner: req.userId },
      req.body,
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: 'Not found' });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: 'Invalid id' });
  }
});

// DELETE /api/books/:id
router.delete('/:id', authRequired, async (req, res) => {
  try {
    const deleted = await Book.findOneAndDelete({ _id: req.params.id, owner: req.userId });
    if (!deleted) return res.status(404).json({ message: 'Not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ message: 'Invalid id' });
  }
});


// POST /api/books/:id/reviews
router.post('/:id/reviews', authRequired, async (req, res) => {
  try {
    const { rating, text } = req.body;
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'rating must be 1-5' });
    }
    const User = require('../models/User');
    const user = await User.findById(req.userId);
    if (!user) return res.status(401).json({ message: 'User not found' });
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ message: 'Not found' });
    book.reviews.push({ user: req.userId, author: user.name || user.email, rating, text });
    await book.save();
    const saved = await Book.findById(req.params.id).populate('reviews.user', 'name email');
    res.status(201).json(saved.reviews[saved.reviews.length - 1]);
  } catch (err) {
    res.status(500).json({ message: 'Failed to add review' });
  }
});

module.exports = router;

// Reviews endpoints appended after export for clarity (must be before require() in server)


