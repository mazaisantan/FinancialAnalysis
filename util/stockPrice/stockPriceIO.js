const CookieJar = require("fetch").CookieJar,
      FetchStream = require("fetch").FetchStream,
      fs = require("fs");

exports.writeStockPriceData= function(stockCode){
    //要先登录网页才能获取股票数据
    let fetch = new FetchStream("https://xueqiu.com/");

    fetch.on("meta", function(chunk){
        let cookies = new CookieJar();
        cookies.setCookie('xq_a_token=019174f18bf425d22c8e965e48243d9fcfbd2cc0;');
        console.log(cookies);
        //同花顺的股票财务数据下载地址
        const addr = "./Data/StockPrice/";
        let out = fs.createWriteStream(addr + stockCode + '.json');

        const basicUrl = "https://xueqiu.com/",
            beginUrl = "https://stock.xueqiu.com/v5/stock/chart/kline.json?",
            endUrl = "&period=year&type=before&count=-142&indicator=kline,ma,macd,kdj,boll,rsi,wr,bias,cci,psy";
        let date = Math.round(new Date().getTime());
        let middleUrl = 'symbol=SH' + stockCode + '&begin=' + date;
        //输出文件
        new FetchStream(beginUrl + middleUrl + endUrl,{cookieJar:cookies}).pipe(out);
    });
}





