const Concert = require('../models/concerts');
const redis = require('../../config/redis');
const { getElasticInstance } = require('../../config/elastic');
var client = getElasticInstance()
module.exports = {
    create(req, res) {
        let concert = {};
        if (undefined !== req.body.orchestra) concert.orchestra = req.body.orchestra;
        if (undefined !== req.body.date) concert.date = req.body.date;
        if (undefined !== req.body.hour) concert.hour = req.body.hour;
        if (undefined !== req.body.venue) concert.venue = req.body.venue;
        if (undefined !== req.body.link) concert.link = req.body.link;

        const newConcert = new Concert(concert);
        newConcert.save(err => {
            if (err) {
                return res.status(500).send(err);
            }
        });

        return res.status(200).json(newConcert);



    },


    findAll(req, res) {
        Concert.find({}, (err, concert) => {
            if (err) {
                return res.status(404).send(err);
            }
            return res.status(200).json(concert);
        })


    },
    

    findByText(req, res) {

        let text = req.params.text;
        if (!text) {
            return res.status(400).send({ err: 'search text is required field' });
        }
        if (text.length < 3) {
            return res.status(404).send({ err: 'search text length should be minimum three' });
        }

        client.search({           
            type: 'concerts',
            body: {
                query: {
                    query_string: {
                        fields: ["_all"],
                        query: "*" + text + "*",
                    },
                }
            }
        }).then(function (body) {
            var hits = body.hits.hits;
            var data = {};
            var completeRecord = [];
            for (let i = 0; i < hits.length; i++) {
                data._id = hits[i]._id;
                data.orchestra = hits[i]._source.orchestra;
                data.date = hits[i]._source.date;
                data.hour = hits[i]._source.hour;
                data.venue = hits[i]._source.venue;
                data.link = hits[i]._source.link;
                completeRecord.push(data);
            }


            return res.status(200).json(completeRecord);
        }, function (error) {
            console.trace(error.message);
        });


    },

    findOne(req, res) {
        let id = req.params.id;
        if (!id) {
            return res.status(400).send({ err: 'id is required field' });
        }

        let protocol = req.protocol;
        let host = req.get('host');
        let key = protocol + '://' + host + req.originalUrl;
        redis.get(key, function (err, concert) {
            if (err) {
                return res.status(404).send(err);
            }
            else if (concert) {
                return res.status(200).send(JSON.parse(concert));
            }
            else {
                Concert.findById(id, (err, concert) => {
                    if (err) {
                        return res.status(404).send(err);
                    }

                    redis.set(key, JSON.stringify(concert), function () {
                        return res.status(200).json(concert);
                    });

                })
            }
        });
    },
    update(req, res) {
        let id = req.params.id
        let concertAttributes = {};
        if (undefined !== req.body.orchestra) concertAttributes.orchestra = req.body.orchestra;
        if (undefined !== req.body.date) concertAttributes.date = req.body.date;
        if (undefined !== req.body.hour) concertAttributes.hour = req.body.hour;
        if (undefined !== req.body.venue) concertAttributes.venue = req.body.venue;
        if (undefined !== req.body.link) concertAttributes.link = req.body.link;
        let protocol = req.protocol;
        let host = req.get('host');
        let key = protocol + '://' + host + req.originalUrl;


        Concert.update({ _id: id }, concertAttributes, (err, result) => {
            if (err) {
                return res.status(500).send(err);
            }
            concertAttributes._id = id;
            redis.set(key, JSON.stringify(concertAttributes), function () {
                return res.status(200).json({ msg: `Concerts is updated with id  ${id}` });
            });

        });

    },
    delete(req, res) {
        let id = req.params.id;
        Concert.findByIdAndRemove(id, err => {
            if (err) {
                return res.status(500).send(err);
            }
            return res.status(200).json({ msg: `Concerts is deleted with id ${id}` });
        })

    }
};