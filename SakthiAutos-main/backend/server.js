const dotenv = require('dotenv');
dotenv.config({ path: '.env' });

const express = require('express');
const app = express();
const PORT = 3000;

// ✅ Use express.json() BEFORE the routes
app.use(express.json());

// ✅ CORS middleware (also before routes)
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

// ✅ Load routes
const QF07Router = require('./QF07_FBQ_02');
const QF07FBQ03Router = require('./QF07_FBQ_03');
const timeStudyRouter = require('./timeStudyRoutes'); // Add time study routes

app.use('/', QF07Router);
app.use('/', QF07FBQ03Router);
app.use('/', timeStudyRouter); // Register time study routes

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
