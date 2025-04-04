const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');


dotenv.config();

const connectDB = require('./config/db'); 
const authRoutes = require('./routes/authRoutes');
const taskRoutes = require('./routes/taskRoutes');
const { notFound, errorHandler } = require('./middleware/errorMiddleware'); 

connectDB();

const app = express();

app.use(cors({
    origin: process.env.FRONTEND_URL || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', authRoutes);

app.use('/api/tasks', taskRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'Secure Task Management API is running...' });
});


if (process.env.NODE_ENV === 'production') {
  const __dirname = path.resolve(); 
  app.use(express.static(path.join(__dirname, '/frontend/build')));

  app.get('*', (req, res) =>
    res.sendFile(path.resolve(__dirname, 'frontend', 'build', 'index.html'))
  );
} else {
  app.get('/', (req, res) => {
     res.json({ message: 'Secure Task Management API is running... (Development)' });
  });
}

app.use(notFound);

app.use(errorHandler);


const PORT = process.env.PORT || 5001; 

const server = app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

process.on('unhandledRejection', (err, promise) => {
  console.error(`Error [Unhandled Rejection]: ${err.message}`);
  server.close(() => process.exit(1));
});