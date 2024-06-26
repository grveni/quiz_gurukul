const express = require('express');
//const mongoose = require('mongoose');
const cors = require('cors');
//require('dotenv').config();

const app = express();
app.use(cors());
//app.use(express.json());

// Example Route
app.get('/', (req, res) => {
  res.send('Hello World from backend!');
});

const PORT = process.env.PORT || 5001;
/*mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() =>
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
  )
  .catch((err) => console.error(err));*/

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
