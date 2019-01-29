import request from 'request'
import fs from "fs";

class CninfoApi{
    constructor(){
        this.term = {
            stockQuotation : {},
            financialProfitTTM : {},
            fianancialProfitIndex : {},
            stockIndex : {}
        }
        this.urlOptions = {
            Referer :  'http://webapi.cninfo.com.cn',
            apiCategory : {
                apiCloudPlatform : {
                    name : '/api-cloud-platform',
                    sub : function(type){
                        switch(type){
                            case 'apidoc' : return '/apidoc/apiDocTree';
                            case 'apiinfo': return '/apiinfo/info';
                            default : return 'invalid params'
                        }
                    },
                    query : function(id){
                        return '?id='+id;
                    }
                }
            },
            api : {
                name : '/api',
                sub : function(category,code){
                    switch(category){
                        case 'sysapi':return '/sysapi/p_sysapi' + code;
                        case 'stock': return '/stock/p_stock' + code;
                        default : return 'invaild url';
                    }
                },
                query : function(code,sdate,edate,column,type){
                    return '?scode='+code+'&sdate='+sdate+'&edate='+edate+'&column='+column+'&indtype'+type+'&type='+type;
                }
            }
        }
        // this.getStockQuotation.bind(this);
        // this.getFinancialProfitTTM.bind(this);
        // this.getStockIndex.bind(this);
        // this.getFianancialProfitIndex.bind(this);

    }

    getStockQueryParams(){
        let that = this;
        let options = getStockQueryParamsUrl();
        let out = fs.createWriteStream('./data/finance/stockQuery.json');
        request
            .post(options)
            .on('response', function(response) {
                console.log(response.statusCode) // 200
            })
            .pipe(out);

        function getStockQueryParamsUrl(id){
            let apiCloudPlatform = that.urlOptions.apiCategory.apiCloudPlatform
            let urlStr = apiCloudPlatform.name;
            let subUrlStr = apiCloudPlatform.sub('apidoc');
            let queryStr = apiCloudPlatform.query(id);
            let url = that.urlOptions.Referer + urlStr + subUrlStr + queryStr;
            return {
                url,
                headers: {
                    'User-Agent': 'request',
                    "Referer":that.urlOptions.Referer
                },
                form: {
                    type: 2
                }
            }
        }
    }
    
    getStockQuotation(){
        let that = this;
        let options = getStockQuotationUrl(527);
        let out = fs.createWriteStream('./data/finance/stockQuotation.json');
        request
            .get(options)
            .on('response', function(response) {
                console.log(response.statusCode) // 200
            })
            .pipe(out);

        function getStockQuotationUrl(id){
            let urlStr = that.urlOptions.apiCategory.apiCloudPlatform.name;
            let subUrlStr = that.urlOptions.apiCategory.apiCloudPlatform.sub('apiinfo');
            let queryStr = that.urlOptions.apiCategory.apiCloudPlatform.query(id);
            let url = that.urlOptions.Referer + urlStr + subUrlStr + queryStr;
            return {
                url,
                headers: {
                    'User-Agent': 'request',
                    "Referer":that.urlOptions.Referer
                }
            }
        }
    }

    getFinancialProfitTTM(){
        let that = this;
        let options = getFinancialProfitTTMUrl(378);
        let out = fs.createWriteStream('./data/finance/financialProfit.json');
        request
            .get(options)
            .on('response', function(response) {
                console.log(response.statusCode) // 200
            })
            .pipe(out);

        function getFinancialProfitTTMUrl(id){
            let urlStr = that.urlOptions.apiCategory.apiCloudPlatform.name;
            let subUrlStr = that.urlOptions.apiCategory.apiCloudPlatform.sub('apiinfo');
            let queryStr = that.urlOptions.apiCategory.apiCloudPlatform.query(id);
            let url = that.urlOptions.Referer + urlStr + subUrlStr + queryStr;
            return {
                url,
                headers: {
                    'User-Agent': 'request',
                    "Referer":that.urlOptions.Referer
                }
            }
        }
    }

    getStockIndex(){
        let that = this;
        let options = getStockIndexUrl(162);
        let out = fs.createWriteStream('./data/finance/stockIndex.json');
        request
            .get(options)
            .on('response', function(response) {
                console.log(response.statusCode) // 200
            })
            .pipe(out);

        function getStockIndexUrl(id){
            let urlStr = that.urlOptions.apiCategory.apiCloudPlatform.name;
            let subUrlStr = that.urlOptions.apiCategory.apiCloudPlatform.sub('apiinfo');
            let queryStr = that.urlOptions.apiCategory.apiCloudPlatform.query(id);
            let url = that.urlOptions.Referer + urlStr + subUrlStr + queryStr;
            return {
                url,
                headers: {
                    'User-Agent': 'request',
                    "Referer":that.urlOptions.Referer
                }
            }
        }
    }

    getFianancialProfitIndex(){
        let that = this;
        let options = getFianancialProfitIndexUrl(269);
        let out = fs.createWriteStream('./data/finance/fianancialProfitIndex.json');
        request
            .get(options)
            .on('response', function(response) {
                console.log(response.statusCode) // 200
            })
            .pipe(out);

        function getFianancialProfitIndexUrl(id){
            let urlStr = that.urlOptions.apiCategory.apiCloudPlatform.name;
            let subUrlStr = that.urlOptions.apiCategory.apiCloudPlatform.sub('apiinfo');
            let queryStr = that.urlOptions.apiCategory.apiCloudPlatform.query(id);
            let url = that.urlOptions.Referer + urlStr + subUrlStr + queryStr;
            return {
                url,
                headers: {
                    'User-Agent': 'request',
                    "Referer":that.urlOptions.Referer
                }
            }
        }
    }

    
}

export default CninfoApi