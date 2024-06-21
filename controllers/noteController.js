
const Note = require('../models/Note');

// Controller to create a new note
exports.createNote = async (req, res) => {
  const { title, content } = req.body;

  // Validate data
  if (!title || !content) {
    return res.status(400).json({ msg: 'Title and content are required' });
  }

  try {
    const newNote = new Note({
      userId: req.user.id,
      title,
      content,
    });
    const note = await newNote.save();
    res.json(note);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Controller to get all notes for a user
exports.getNotes = async (req, res) => {
  try {
    const notes = await Note.find({ userId: req.user.id });
    res.json(notes);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Controller to update a note
exports.updateNote = async (req, res) => {
  const { title, content } = req.body;

  // Validate data
  if (!title && !content) {
    return res.status(400).json({ msg: 'At least one of title or content must be provided' });
  }

  try {
    // Find the note to update
    let note = await Note.findById(req.params.id);

    // If the note doesn't exist
    if (!note) return res.status(404).json({ msg: 'Note not found' });

    // Check if the user owns the note
    if (note.userId.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    // Update the note fields
    note = await Note.findByIdAndUpdate(
      req.params.id,
      { $set: { title, content } },
      { new: true }
    );

    res.json(note);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Controller to delete a note
exports.deleteNote = async (req, res) => {
  try {
    // Find the note to delete
    const note = await Note.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id,
    });

    // If the note doesn't exist or user is not authorized
    if (!note) {
      return res.status(404).json({ msg: 'Note not found or unauthorized' });
    }

    res.json({ msg: 'Note removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};
exports.getNoteById=async (req, res) => {
  const { id } = req.params;
  try {
    const note = await Note.findById(id);
    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }
    res.render('notes/note', { note });
  } catch (error) {
    console.error('Error fetching note by ID:', error);
    res.status(500).json({ error: 'Failed to fetch note' });
  }
}
