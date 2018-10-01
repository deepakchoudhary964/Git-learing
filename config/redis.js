var redis = require('redis');
var port = process.env.REDIS_PORT;  
var host = process.env.REDIS_HOST;
var password = process.env.REDIS_PASSWORD;

var redisClient = redis.createClient({
    port      : port,             
    host      : host,        
    password  : password    
  });


module.exports = redisClient;