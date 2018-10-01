const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const mongoosastic = require("mongoosastic");
const { getElasticInstance } = require('../../config/elastic');

// Define collection and schema for Compositions
var composition = {
  id: {
    type: String
  },
  isNewComposition: {
    type: Boolean,
    default: true
  },
  private: {
    type: String,
    default: true
  },
  composition: {
    type: String
  },
  composer: {
    type: String
  },
  orchestra: {
    type: String
  },
  conductor: {
    type: String
  },
  soloists: {
    type: Array,
    default: [],
  },
  musicians: {
    type: Array,
    default: [
      {
        name: String,
        instrument: Number,
        filename: String
      }
    ]
  },
  pitchStandard: {
    type: String
  },
  movements: {
    type: Array,
    default: [
      {
        id: String,
        title: Number,
        act: String,
        duration: String,
        parts: {}
      }
    ]
  },
  genre: {
    type: String
  },
  date: {
    type: String
  },
  description: {
    type: String
  },
  credits: {
    type: String
  },
  concerts: {
    type: Array,
    default: []
  }
};
var compositions_en = new Schema(composition, {
  collection: 'compositions_en'
});

compositions_en.plugin(mongoosastic, {
  esClient: getElasticInstance(),
  index:'compositions_en'
});

var compositions = mongoose.model('compositions_en', compositions_en)
  , stream = compositions.synchronize()
  , count = 0;

stream.on('data', function (err, doc) {
  count++;
});
stream.on('close', function () {
});
stream.on('error', function (err) {
  console.log(err);
});

module.exports = mongoose.model('Compositions_en', compositions_en);