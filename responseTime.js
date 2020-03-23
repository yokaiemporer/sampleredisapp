module.exports = function responseTime(){
    return function(req, res, next){
      var start = new Date;
  
      if (res._responseTime) return next();
      res._responseTime = true;
  
      res.on('header', function(){
        var duration = new Date - start;
        res.setHeader('X-Response-Time', duration + 'ms');
        console.log(`time taken ${duration}`);
      });
  
      next();
    };
  };