var mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/wikiAnalytics', { useNewUrlParser: true }, function () {
  console.log('mongodb connected')
});

module.exports = mongoose;