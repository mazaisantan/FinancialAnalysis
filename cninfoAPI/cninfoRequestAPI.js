import request from 'request'
import fs from "fs";


function getCninfoJson(url){
    return new Promise((resolve,reject)=>{
        request
            .get({
                url,
                headers: {
                    'Origin': 'http://webapi.cninfo.com.cn',
                    "Referer": 'http://webapi.cninfo.com.cn'
                }},function(error,response,body){
                    resolve(body)
                })
    })
    
}

function postCninfoJson(url){
    return new Promise((resolve,reject)=>{
        request
            .post({
                url,
                headers: {
                    'Origin': 'http://webapi.cninfo.com.cn',
                    "Referer":'http://webapi.cninfo.com.cn'
                },
                form: {
                    type: 2
                }
            },function(error,response,body){
                    resolve(body)
            })
    })
    
}

function cninfoFileDownload(url,directory){
    let out = fs.createWriteStream(directory);
    request
        .get({
            url,
            headers: {
                "Referer":'http://webapi.cninfo.com.cn'
            }})
        .on('response', function(response) {
            console.log(response.code) // 200
        })
        .pipe(out);
}

module.exports = {
    getCninfoJson,
    postCninfoJson,
    cninfoFileDownload
}