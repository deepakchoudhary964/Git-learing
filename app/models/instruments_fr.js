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

var instruments_fr = new Schema(instrument, {
  collection: 'instruments_fr',
});

instruments_fr.plugin(mongoosastic, {
  esClient: getElasticInstance(),
  index:'instruments_fr'
});
var instruments = mongoose.model('instruments_fr', instruments_fr)
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
module.exports = mongoose.model('instruments_fr', instruments_fr);
