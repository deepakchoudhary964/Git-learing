const elasticsearch = require('elasticsearch');
let elasticClient;

const getElasticInstance = () => {
    if (elasticClient)
        return elasticClient;
    elasticClient = new elasticsearch.Client({
        host: '52.47.47.212:9200'
    });
    return elasticClient;
};

module.exports = {
    getElasticInstance: getElasticInstance,
};