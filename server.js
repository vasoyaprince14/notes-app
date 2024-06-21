const express = require('express');
// const mongoose = require('mongoose');
const Note=require('./models/Note')
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const noteRoutes = require('./routes/noteRoutes');
const authMiddleware = require('./middleware/authMiddleware');

require('dotenv').config();

const app = express();
connectDB();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => res.redirect('/login'));

app.get('/login', (req, res) => res.render('auth/login'));
app.get('/register', (req, res) => res.render('auth/register'));
// app.get('/notes',(req,res)=>{res.render('notes/getNotes')})
app.use('/api/auth', authRoutes);
app.use('/api/notes', noteRoutes);

app.get('/notes/create', (req, res) => res.render('notes/create'));
app.get('/notes/edit/:id', async (req, res) => {
  const note = await Note.findById(req.params.id);
  res.render('notes/edit', { note });
});
app.get('/notes',async (req, res) => {
  // console.log(req.user);
  // const notes = await Note.find({ userId: req.user.id });
  // res.render('notes/index', { notes });
  res.render('notes/index');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
