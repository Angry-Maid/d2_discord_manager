require('dotenv').config();

const db = require('monk')(process.env.MONGO_URI);
const schemas = require('../models/categoryModel');

const categories = db.get('categories');

exports.allCategories = (req, res) => {
  if (schemas.categorySearchSchema.isValidSync(req.query)) {
    categories.find({}, (err, ctgs) => {
      if (err) res.send(err);
      res.json(ctgs);
    });
  } else {
    res.send({
      error: 'Invalid params',
    });
  }
};
