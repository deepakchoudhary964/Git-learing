const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const mongoosastic = require("mongoosastic");
const { getElasticInstance } = require('../../config/elastic');

// Define collection and schema for Instruments
var instrument = {
  id: {
    type: Number
  },
  name: {
    type: String
  }
};

var instruments_en = new Schema(instrument, {
  collection: 'instruments_en',
  // String (core type)
  string: { type: String, es_boost: 2.0 },

  // Number (core type)
  number: { type: Number, es_type: 'integer' },
});

instruments_en.plugin(mongoosastic, {
  esClient: getElasticInstance(),
  index:'instruments_en'
});
var instruments = mongoose.model('instruments_en', instruments_en)
  , stream = instruments.synchronize()
  , count = 0;

stream.on('data', function (err, doc) {
  count++;
});
stream.on('close', function () {
});
stream.on('error', function (err) {
  console.log(err);
});

module.exports = mongoose.model('instruments_en', instruments_en);
