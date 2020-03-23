// var redis = require('redis');

// var redisHost = 'localhost';
// var redisPort = process.argv[3] || 6379;
// var redisAuth = "";

// var client = redis.createClient ({
// port : redisPort,
// host : redisHost
// });

// client.auth(redisAuth, function(err, response){
// if(err){
// throw err;
// }
// });

// client.set('foo','bar');
// client.get('foo', function(err, response){
// if(err) {
// throw err;
// }else{
// console.log(response);
// }
// });
const express=require('express');
const fetch=require('node-fetch')
const redis=require('redis')
const port=process.env.PORT||5000;
const redis_port=process.env.port||6379;
const client=redis.createClient(redis_port);
const app=express();
async function getRepos(req,res,next){
    try{
        console.log(`Fetching Data`);
        const {username}=req.params;
        const response=await fetch(`https://api.github.com/users/${username}`);
        const data=await response.json();
        res.send(data);

    }
    catch(err)
    {
        console.error(err);
        res.status(500);
    }
}
app.get('/repos/:username',getRepos);
app.listen(5000,()=>{
    console.log(`App listening on port ${port}`);
})