import {getCninfoJson,postCninfoJson,cninfoFileDownload} from './cninfoRequestAPI.js'

const financialFormSum = ["行情数据",'个股TTM财务利润表','个股TTM现金流量表','财务指标行业排名']
async function getfinancialForm(financialFormSum){
    let financialForm = await postCninfoJson('http://webapi.cninfo.com.cn/api-cloud-platform/apidoc/apiDocTree')
        .then((data)=>{
            let dataSub = JSON.parse(data).data[0].children;
            let result = dataSub.filter((item,index)=>{
                return item.name == 'SYSAPI03';
            })
            return result;
        })
        .then(async (data)=>{
            let treeData = data[0]
            let financialForm = []
            for(let i=0;i<financialFormSum.length;i++){

                let financialFormItem = treeSearch(treeData,financialFormSum[i])[0];

                let paramsData = await getCninfoJson('http://webapi.cninfo.com.cn/api/sysapi/p_sysapi1017?apiname='+financialFormItem.url)
                let timeFormatStr = JSON.parse(paramsData).records[0].paraminfo.paramurl
                financialFormItem.timeFormatStr = timeFormatStr

                let subTerms = await getCninfoJson('http://webapi.cninfo.com.cn/api-cloud-platform/apiinfo/info?id='+financialFormItem.id)
                financialFormItem.children = JSON.parse(JSON.parse(subTerms).data.outputParameter)

                financialForm.push(financialFormItem)
            }
            return financialForm
                    
        })
        return financialForm
}


function getStockList(){
    let result = Promise.all([
        getCninfoJson('http://webapi.cninfo.com.cn//api/stock/p_public0004?platetype=137001&platecode=012001&abtype=A&@orderby=SECCODE:asc&@column=SECCODE,SECNAME'),//上证股票
        getCninfoJson('http://webapi.cninfo.com.cn//api/stock/p_public0004?platetype=137001&platecode=012002,012003,012015&abtype=A&@orderby=SECCODE:asc&@column=SECCODE,SECNAME')//深证股票
    ])
    return result
}


function treeSearch(item,searchStr){
    if(item.children != null){
        item = item.children;
        for(let i=0;i<item.length;i++){
            let result = treeSearch(item[i],searchStr)
            if(result != undefined){return result}
        } 
    }else{
        item = item.apiList;
        let result = item.filter((item,index)=>{
            return item.alias == searchStr;
        })
        if(result.length != 0){return result}
    }
}

function stockListDownload(){
    getStockList()
    .then((data)=>{
        let [result0,result1] = data
        let result = JSON.parse(result0).records
        result = result.concat(JSON.parse(result1).records)
        result = JSON.stringify(result)
        fs.writeFile('./stockList.json', result, function(err) {
            if (err) {
                throw err;
            }
        })
    })
}

function financialFormDownload(){
    getfinancialForm(financialFormSum)
    .then((data)=>{
            data = JSON.stringify(data)
            fs.writeFile('./data.json', data, function(err) {
                if (err) {
                    throw err;
                }
            })
    })
}

module.exports = {
    stockListDownload,
    financialFormDownload
}