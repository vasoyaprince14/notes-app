const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const { createNote, getNotes, updateNote, deleteNote,getNoteById } = require('../controllers/noteController');

router.post('/', auth, createNote);
router.get('/', auth, getNotes);
router.put('/:id', auth, updateNote);
router.delete('/:id', auth, deleteNote);


router.get('/:id', getNoteById);
  


module.exports = router;
