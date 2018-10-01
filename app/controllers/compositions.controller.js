const Compositions_en = require('../models/compositions_en');
const Compositions_fr = require('../models/compositions_fr');
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

        let compositions = {};

        // compositions.musicians[{name:'',instrument:'',filename:''}]
        if (undefined !== req.body.id) compositions.id = req.body.id;
        if (undefined !== req.body.isNewComposition) compositions.isNewComposition = req.body.isNewComposition;
        if (undefined !== req.body.private) compositions.private = req.body.private;
        if (undefined !== req.body.composition) compositions.composition = req.body.composition;
        if (undefined !== req.body.composer) compositions.composer = req.body.composer;
        if (undefined !== req.body.orchestra) compositions.orchestra = req.body.orchestra;
        if (undefined !== req.body.conductor) compositions.conductor = req.body.conductor;
        if (undefined !== req.body.soloists) compositions.soloists = req.body.soloists;
        if (undefined !== req.body.musicians) compositions.musicians = req.body.musicians;
        if (undefined !== req.body.pitchStandard) compositions.pitchStandard = req.body.pitchStandard;
        if (undefined !== req.body.movements) compositions.movements = req.body.movements;
        if (undefined !== req.body.genre) compositions.genre = req.body.genre;
        if (undefined !== req.body.date) compositions.date = req.body.date;
        if (undefined !== req.body.description) compositions.description = req.body.description;
        if (undefined !== req.body.credits) compositions.credits = req.body.credits;
        if (undefined !== req.body.concerts) compositions.concerts = req.body.concerts;

        if (lang == "en") {
            const newCompositions = new Compositions_en(compositions);
            newCompositions.save(err => {
                if (err) {
                    return res.status(500).send(err);
                }
            });
            return res.status(200).json(newCompositions);
        }
        else if (lang == "fr") {
            const newCompositions = new Compositions_fr(compositions);
            newCompositions.save(err => {
                if (err) {
                    return res.status(500).send(err);
                }
            });
            return res.status(200).json(newCompositions);
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

            Compositions_en.find({}, (err, compositions) => {
                if (err) {
                    return res.status(404).send(err);
                }
                return res.status(200).json(compositions);
            })
        } else if (lang == "fr") {

            Compositions_fr.find({}, (err, compositions) => {
                if (err) {
                    return res.status(404).send(err);
                }
                return res.status(200).json(compositions);
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

        if (lang == "en") {
            if (!text) {
                return res.status(400).send({ err: 'search text is required field' });
            }

            if (text.length < 3) {
                return res.status(404).send({ err: 'search text length should be minimum three' });
            }
            client.search({                
                type: 'compositions_en',
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
                    data.private = hits[i]._source.private;
                    data.composition = hits[i]._source.composition;
                    data.isNewCompositions = hits[i]._source.isNewCompositions;
                    data.composer = hits[i]._source.composer;
                    data.orchestra = hits[i]._source.orchestra;
                    data.pitchStandard = hits[i]._source.pitchStandard;
                    data.musicians = hits[i]._source.musicians;
                    data.conductor = hits[i]._source.conductor;
                    data.soloists = hits[i]._source.soloists;
                    data.movements = hits[i]._source.movements;
                    data.default = hits[i]._source.default;
                    data.genre = hits[i]._source.genre;
                    data.date = hits[i]._source.date;
                    data.description = hits[i]._source.description;
                    data.credits = hits[i]._source.credits;
                    data.concerts = hits[i]._source.concerts;
                    completeRecord.push(data);
                }
                return res.status(200).json(completeRecord);
            }, function (error) {
                console.trace(error.message);
            });
        }


        if (lang == "fr") {
            if (!text) {
                return res.status(400).send({ err: 'search text is required field' });
            }
            if (text.length < 3) {
                return res.status(404).send({ err: 'search text length should be minimum three' });
            }
            client.search({                
                type: 'compositions_fr',
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
                    data.private = hits[i]._source.private;
                    data.composition = hits[i]._source.composition;
                    data.isNewCompositions = hits[i]._source.isNewCompositions;
                    data.composer = hits[i]._source.composer;
                    data.orchestra = hits[i]._source.orchestra;
                    data.pitchStandard = hits[i]._source.pitchStandard;
                    data.musicians = hits[i]._source.musicians;
                    data.conductor = hits[i]._source.conductor;
                    data.soloists = hits[i]._source.soloists;
                    data.movements = hits[i]._source.movements;
                    data.default = hits[i]._source.default;
                    data.genre = hits[i]._source.genre;
                    data.date = hits[i]._source.date;
                    data.description = hits[i]._source.description;
                    data.credits = hits[i]._source.credits;
                    data.concerts = hits[i]._source.concerts;
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
            redis.get(key, function (err, compositions) {

                if (err) {
                    return res.status(404).send(err);
                }
                else if (compositions) {
                    return res.status(200).send(JSON.parse(compositions));
                }
                else {
                    Compositions_en.findById(id, (err, compositions) => {
                        if (err) {
                            return res.status(404).send(err);
                        }

                        redis.set(key, JSON.stringify(compositions), function () {
                            return res.status(200).json(compositions);
                        });

                    })
                }
            });
        } else if (lang == "fr") {
            let protocol = req.protocol;
            let host = req.get('host');
            let key = protocol + '://' + host + req.originalUrl;
            redis.get(key, function (err, compositions) {

                if (err) {
                    return res.status(404).send(err);
                }
                else if (compositions) {
                    return res.status(200).send(JSON.parse(compositions));
                }
                else {
                    Compositions_fr.findById(id, (err, compositions) => {
                        if (err) {
                            return res.status(404).send(err);
                        }

                        redis.set(key, JSON.stringify(compositions), function () {
                            return res.status(200).json(compositions);
                        });

                    })
                }
            });
        }

    },
    update(req, res) {
        let _id = req.params.id
        let lang = "";
        if (req.originalUrl.indexOf('/en/') > -1) {
            lang = "en";
        }
        else if (req.originalUrl.indexOf('/fr/') > -1) {
            lang = "fr";
        }
        let compositionsAttributes = {};
        if (undefined !== req.body.id) compositionsAttributes.id = req.body.id;
        if (undefined !== req.body.isNewComposition) compositionsAttributes.isNewComposition = req.body.isNewComposition;
        if (undefined !== req.body.private) compositionsAttributes.private = req.body.private;
        if (undefined !== req.body.composition) compositionsAttributes.composition = req.body.composition;
        if (undefined !== req.body.composer) compositionsAttributes.composer = req.body.composer;
        if (undefined !== req.body.orchestra) compositionsAttributes.orchestra = req.body.orchestra;
        if (undefined !== req.body.conductor) compositionsAttributes.conductor = req.body.conductor;
        if (undefined !== req.body.soloists) compositionsAttributes.soloists = req.body.soloists;
        if (undefined !== req.body.musicians) compositionsAttributes.musicians = req.body.musicians;
        if (undefined !== req.body.pitchStandard) compositionsAttributes.pitchStandard = req.body.pitchStandard;
        if (undefined !== req.body.movements) compositionsAttributes.movements = req.body.movements;
        if (undefined !== req.body.genre) compositionsAttributes.genre = req.body.genre;
        if (undefined !== req.body.date) compositionsAttributes.date = req.body.date;
        if (undefined !== req.body.description) compositionsAttributes.description = req.body.description;
        if (undefined !== req.body.credits) compositionsAttributes.credits = req.body.credits;
        if (undefined !== req.body.concerts) compositionsAttributes.concerts = req.body.concerts;
        let protocol = req.protocol;
        let host = req.get('host');
        let key = protocol + '://' + host + req.originalUrl;

        if (lang == "en") {
            Compositions_en.update({ _id: _id }, compositionsAttributes, (err, result) => {
                if (err) {
                    return res.status(500).send(err);
                }
                compositionsAttributes._id = _id;
                redis.set(key, JSON.stringify(compositionsAttributes), function () {
                    return res.status(200).json({ msg: `Compositions_en is updated with id  ${_id}` });
                });
            });
        } else if (lang == "fr") {
            Compositions_fr.update({ _id: _id }, compositionsAttributes, (err, result) => {
                if (err) {
                    return res.status(500).send(err);
                }
                compositionsAttributes._id = _id;
                redis.set(key, JSON.stringify(compositionsAttributes), function () {
                    return res.status(200).json({ msg: `Compositions_fr is updated with id  ${_id}` });
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

            Compositions_en.findByIdAndRemove(id, err => {
                if (err) {
                    return res.status(500).send(err);
                }
                return res.status(200).json({ msg: `Compositions is deleted with id ${id}` });
            })
        } else if (lang == "fr") {
            Compositions_fr.findByIdAndRemove(id, err => {
                if (err) {
                    return res.status(500).send(err);
                }
                return res.status(200).json({ msg: `Compositions is deleted with id ${id}` });
            })
        }

    }
};
