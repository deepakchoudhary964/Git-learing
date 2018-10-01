const Instruments_en = require('../models/instruments_en');
const Instruments_fr = require('../models/instruments_fr');
const redis = require('../../config/redis');
const { getElasticInstance } = require('../../config/elastic');
var client = getElasticInstance()


module.exports = {
    create(req, res) {
        let lang = "";
        if (req.originalUrl.indexOf('/en') > -1) {
            lang = "en";
        }
        else if (req.originalUrl.indexOf('/fr') > -1) {
            lang = "fr";
        }
        let instruments = {};
        if (undefined !== req.body.id) instruments.id = req.body.id;
        if (undefined !== req.body.name) instruments.name = req.body.name;


        if (lang == "en") {
            const newInstruments = new Instruments_en(instruments);
            newInstruments.save(err => {
                if (err) {
                    return res.status(500).send(err);
                }
            });
            return res.status(200).json(newInstruments);
        }
        else if (lang == "fr") {

            const newInstruments = new Instruments_fr(instruments);
            newInstruments.save(err => {
                if (err) {
                    return res.status(500).send(err);
                }
            });
            return res.status(200).json(newInstruments);
        }
    },

    findAll(req, res) {
        let lang = "";

        if (req.originalUrl.indexOf('/en') > -1) {
            lang = "en";
        }
        else if (req.originalUrl.indexOf('/fr') > -1) {
            lang = "fr";
        }
        if (lang == "en") {
            Instruments_en.find({}, (err, instruments) => {
                if (err) {
                    return res.status(404).send(err);
                }
                return res.status(200).json(instruments);
            })
        } else if (lang == "fr") {
            Instruments_fr.find({}, (err, instruments) => {
                if (err) {
                    return res.status(404).send(err);
                }
                return res.status(200).json(instruments);
            })
        }


    },
    findByText(req, res) {
        let lang = "";
        if (req.originalUrl.indexOf('/en') > -1) {
            lang = "en";
        }
        else if (req.originalUrl.indexOf('/fr') > -1) {
            lang = "fr";
        }
        let text = req.params.text;
        let isNAN = isNaN(text)
        if (!text) {
            return res.status(400).send({ err: 'search text is required field' });
        }
        if (text.length < 3) {
            return res.status(404).send({ err: 'search text length should be minimum three' });
        }
        if (lang == "en") {
            client.search({                
                type: 'instruments_en',

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
                    data.id = hits[i]._source.id;
                    data.name = hits[i]._source.name;;
                    completeRecord.push(data);
                }

                return res.status(200).json(completeRecord);
            }, function (error) {
                console.trace(error.message);
            });


        }
        if (lang == "fr") {
            client.search({                
                type: 'instruments_fr',

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
                    data.id = hits[i]._source.id;
                    data.name = hits[i]._source.name;;
                    completeRecord.push(data);
                }

                return res.status(200).json(completeRecord);
            }, function (error) {
                console.trace(error.message);
            });

        }
    },
    findOne(req, res) {
        let id = req.params.id;
        let lang = "";

        if (req.originalUrl.indexOf('/en/') > -1) {
            lang = "en";
        }
        else if (req.originalUrl.indexOf('/fr/') > -1) {
            lang = "fr";
        }

        if (!id) {
            return res.status(400).send({ err: 'id is required field' });
        }
        if (lang == "en") {

            let protocol = req.protocol;
            let host = req.get('host');
            let key = protocol + '://' + host + req.originalUrl;
            redis.get(key, function (err, instruments) {

                if (err) {
                    return res.status(404).send(err);
                }
                else if (instruments) {
                    return res.status(200).send(JSON.parse(instruments));
                }
                else {
                    Instruments_en.findById(id, (err, instruments) => {
                        if (err) {
                            return res.status(404).send(err);
                        }
                        redis.set(key, JSON.stringify(instruments), function () {
                            return res.status(200).json(instruments);
                        });

                    })
                }
            });
        } else if (lang == "fr") {
            let protocol = req.protocol;
            let host = req.get('host');
            let key = protocol + '://' + host + req.originalUrl;
            redis.get(key, function (err, instruments) {

                if (err) {
                    return res.status(404).send(err);
                }
                else if (instruments) {
                    return res.status(200).send(JSON.parse(instruments));
                }
                else {
                    Instruments_fr.findById(id, (err, instruments) => {
                        if (err) {
                            return res.status(404).send(err);
                        }

                        redis.set(key, JSON.stringify(instruments), function () {
                            return res.status(200).json(instruments);
                        });

                    })
                }
            });
        }

    },
    update(req, res) {
        let id = req.params.id;
        let lang = "";

        if (req.originalUrl.indexOf('/en/') > -1) {
            lang = "en";
        }
        else if (req.originalUrl.indexOf('/fr/') > -1) {
            lang = "fr";
        }

        let instrumentAttributes = {};
        if (undefined !== req.body.name) instrumentAttributes.name = req.body.name;
        if (undefined !== req.body.id) instrumentAttributes.id = req.body.id;

        let protocol = req.protocol;
        let host = req.get('host');
        let key = protocol + '://' + host + req.originalUrl;

        if (lang == "en") {
            Instruments_en.update({ _id: id }, instrumentAttributes, (err, result) => {
                if (err) {
                    return res.status(500).send(err);
                }
                instrumentAttributes._id = id;
                redis.set(key, JSON.stringify(instrumentAttributes), function () {
                    return res.status(200).json({ msg: `Instruments_en is updated with id  ${id}` });
                });
            });
        } else if (lang == "fr") {
            Instruments_fr.update({ _id: id }, instrumentAttributes, (err, result) => {
                if (err) {
                    return res.status(500).send(err);
                }
                instrumentAttributes._id = id;
                redis.set(key, JSON.stringify(instrumentAttributes), function () {
                    return res.status(200).json({ msg: `Instruments_fr is updated with id  ${id}` });
                });
            });

        }
    },
    delete(req, res) {
        let id = req.params.id;
        let lang = "";

        if (req.originalUrl.indexOf('/en/') > -1) {
            lang = "en";
        }
        else if (req.originalUrl.indexOf('/fr/') > -1) {
            lang = "fr";
        }
        if (lang == "en") {
            Instruments_en.findByIdAndRemove(id, err => {
                if (err) {
                    return res.status(500).send(err);
                }
                return res.status(200).json({ msg: `Instrument is deleted with id ${id}` });
            })
        } else if (lang == "fr") {
            Instruments_fr.findByIdAndRemove(id, err => {
                if (err) {
                    return res.status(500).send(err);
                }
                return res.status(200).json({ msg: `Instrument is deleted with id ${id}` });
            })
        }
    }
};
