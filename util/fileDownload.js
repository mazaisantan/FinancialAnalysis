import {FetchStream}  from "fetch";
import fs from "fs";
import request from 'request'

var fileDownload = function(options,directory,type){

    let out = fs.createWriteStream(directory + '.' + type);
    //输出文件
    request
        .get(options)
        .on('response', function(response) {
            // console.log(response.statusCode) // 200
        })
        .pipe(out);
}

export default fileDownload;