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
const responseTime=require('./responseTime')
const port=process.env.PORT||5000;
const redis_port=process.env.port||6379;
const client=redis.createClient(redis_port);
const app=express();
const getDurationInMilliseconds = (start) => {
    const NS_PER_SEC = 1e9
    const NS_TO_MS = 1e6
    const diff = process.hrtime(start)
    return (diff[0] * NS_PER_SEC + diff[1]) / NS_TO_MS
}
function setResponse(username,repos)
{
    return `<h2> ${username} has ${repos}</h2>`
}
async function getRepos(req,res,next){
    try{
        const start = process.hrtime()
        console.log(`Fetching Data`);
        const {username}=req.params;
        const response=await fetch(`https://api.github.com/users/${username}`);
        const data=await response.json();
        const repos=data.public_repos;
        //set data with client set key-> value with expiry of 3600
        client.setex(username,3600,repos);
        res.send(setResponse(username,repos));
        const durationInMilliseconds = getDurationInMilliseconds (start)
        console.log(`${req.method} ${req.originalUrl} [FINISHED] ${durationInMilliseconds .toLocaleString()} ms`)

    }
    catch(err)
    {
        console.error(err);
        res.status(500);
    }
}

//Cache middleware
function cache(req,res,next)
{

    const {username}=req.params;
    const start = process.hrtime();
    client.get(username,(err,data)=>{
        if(err) throw err;
        if(data!==null)
        {
            console.log('User Already cached')
            const durationInMilliseconds = getDurationInMilliseconds (start)
            console.log(`${req.method} ${req.originalUrl} [FINISHED] ${durationInMilliseconds .toLocaleString()} ms`)
            res.send(setResponse(username,data));
        }
        else{
            console.log('User not found')
            next();
        }
    })

    
}
// app.use(responseTime());
app.get('/repos/:username',cache,getRepos);
app.listen(5000,()=>{
    console.log(`App listening on port ${port}`);
})