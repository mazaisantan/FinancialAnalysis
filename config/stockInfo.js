
const stockList = {
    urls:{
        SZ_url:()=>('http://www.szse.cn/api/report/ShowReport?SHOWTYPE=xlsx&CATALOGID=1110x&TABKEY=tab1&random=0.8878569926356359') ,
        SH_url:()=>({
            url: 'http://query.sse.com.cn/security/stock/downloadStockListFile.do?csrcCode=&stockCode=&areaName=&stockType=1',
            headers: {
              'User-Agent': 'request',
              "Referer":"http://www.sse.com.cn/assortment/stock/list/share/"
            }
        })
    },
    getUrl: function(type){
        switch(type){
            case 'SZ':
                return this.urls.SZ_url();
            case 'SH':
                return this.urls.SH_url();
            default :
                return 'params must be \'SH\' or \'SZ\''
        }
    }
}

const stockTrade = {
    urls:{
        SZ_url: (date)=>('http://www.szse.cn/api/report/ShowReport/data?SHOWTYPE=JSON&CATALOGID=1803&TABKEY=tab1&txtQueryDate='+date+'&random=0.010178237866810713'),
        SH_url: (date)=>{
            let jsonCallBack = "jsonpCallback" + Math.floor(Math.random() * (100000 + 1));
            let timestamp = Math.round(new Date().getTime());
            return {
                url:'http://query.sse.com.cn/marketdata/tradedata/queryTradingByProdTypeData.do?jsonCallBack='+jsonCallBack+'&searchDate='+date+'&prodType=gp&_='+timestamp,
                headers: {
                    'User-Agent': 'post',
                    "Referer":"http://www.sse.com.cn/market/stockdata/overview/day/"
                }
        }}
        
    },
    getUrl: function(type,date){
        switch(type){
            case 'SZ':
                return this.urls.SZ_url(date);
            case 'SH':
                return this.urls.SH_url(date);
            default :
                return 'params must be \'SH\' or \'SZ\''
        }
    }
}

const industryPE = {
    url:(date)=>({
        url: 'http://webapi.cninfo.com.cn/api/sysapi/p_sysapi1087?tdate='+date+'&sortcode=008001',
        headers: {
            'User-Agent': 'request',
            "Referer": 'http://webapi.cninfo.com.cn/'
          }
    }),
    getUrl:function(date){
        return this.url(date)
    }
}
module.exports = {
    stockList,
    stockTrade,
    industryPE
};