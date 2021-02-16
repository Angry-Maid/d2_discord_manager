const categories = require('../controllers/categotyController');

module.exports = (app) => {
  app
    .route('/categories')
    .get(categories.allCategories);
};
