const FetchStream = require("fetch").FetchStream,
      fs = require("fs");

exports.writeFinancialData= function(stockCode){
    const addr = './Data/Finance/';
    let out = fs.createWriteStream(addr + stockCode + '.xls');
    
    //同花顺的股票财务数据下载地址
    const basicUrl = "http://basic.10jqka.com.cn/api/stock/export.php?export=main&type=year&code=";
    //输出文件
    new FetchStream(basicUrl + stockCode).pipe(out);
}
