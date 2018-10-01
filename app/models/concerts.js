const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const mongoosastic = require("mongoosastic");
const { getElasticInstance } = require('../../config/elastic');

var concert = {
    orchestra: {
        type: String,

    },
    date: {
        type: String,
    },
    hour: {
        type: String,

    },
    venue: {
        type: String,
        required: true
    },
    link: {
        type: String,
        required: true
    }
};

var concerts = new Schema(concert, {
    collection: 'concerts'
});
concerts.plugin(mongoosastic, {
    esClient: getElasticInstance(),
    index:'concerts'
});
var concert = mongoose.model('concerts', concerts)
    , stream = concert.synchronize()
    , count = 0;

stream.on('data', function (err, doc) {
    count++;
});
stream.on('close', function () {
});
stream.on('error', function (err) {
    console.log(err);
});


module.exports = mongoose.model('concerts', concerts);