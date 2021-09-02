'use strict';
const
    config = require('config'),
    express = require('express'),
    request = require('request');

var app = express();
var port = process.env.PORT || process.env.port || 5000;
app.set('port',port);
app.use(express.json());
//JSON, XML, CSV
app.listen(app.get('port'),function(){
    console.log('[app.listen]Node app is running on port',app.get('port'));
});

module.exports = app;

const MOVIE_API_KEY = config.get('MovieDB_API_Key');

app.post('/webhook',function(req, res){
    //Dialogflow - Get Movie Intro
    //送電影名稱過來
    let data = req.body;
    let queryMovieName = data.queryResult.parameters.MovieName;
    //去TMDB調資料出來
    //網址
    //參數:query, api_key, language - Done
    let propertiesObject = {
        query:queryMovieName,
        api_key:MOVIE_API_KEY,
        language:'zh-TW'
    };

    request({
        uri:"https://api.themoviedb.org/3/search/movie?",
        json:true,
        qs:propertiesObject
    },function(error, response, body){
        //拿到回應
        if(!error && response.statusCode == 200){
            //正常
            if(body.results.length!=0){
                let thisFulfillmentMessages = [];
                //電影名稱, 電影簡介, 電影海報
                //電影名稱
                let movieTitleObject = {};
                if(body.results[0].title == queryMovieName){
                    movieTitleObject.text = {text:[body.results[0].title]};
                }else{
                    movieTitleObject.text = {text:["系統內最相關的電影是"+body.results[0].title]};
                }
                thisFulfillmentMessages.push(movieTitleObject);

                //電影簡介
                if(body.results[0].overview){
                   let movieOverviewObject = {};
                   movieOverviewObject.text = {text:[body.results[0].overview]}; 
                   thisFulfillmentMessages.push(movieOverviewObject);
                }

                //電影海報
                if(body.results[0].poster_path){
                    let movieImageObject = {};
                    movieImageObject.image = {imageUri:"https://image.tmdb.org/t/p/w185"+body.results[0].poster_path};
                    thisFulfillmentMessages.push(movieImageObject);
                }

                res.json({fulfillmentMessages:thisFulfillmentMessages});
            }else{
                res.json({fulfillmentText:"很抱歉，系統裡面沒有這部電影"});
            }
        }else{
            console.log("[The MovieDB] failed");
        }
    });

});