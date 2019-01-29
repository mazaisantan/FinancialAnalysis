
import {getCninfoJson,postCninfoJson,cninfoFileDownload} from './cninfoRequestAPI.js'

const quarters = ['0331','0631','0931','1231']
async function getFinancialTermData(financialFormData,scode,timeStr,term){
    let TermInfo = financialFormChildrenSearch(financialFormData,term)
    let year = timeStr.slice(0,4)
    let date = timeStr.slice(-4)
    let paramUrl = TermInfo.timeFormatStr
    paramUrl = paramUrl
        .replace(new RegExp('%repyear', 'gm'), year)
        .replace(new RegExp('%reptype', 'gm'), date)
        .replace('%sdate', timeStr)
        .replace('%edate', timeStr)
    let result = TermInfo.children.filter((item)=>{
        return item.fieldChineseName == term
    })
    let column = result[0].fieldName
    let subUrl = ''
    if(TermInfo.url.search('stock')>-1){
        subUrl = '/stock/'+TermInfo.url
    }else{
        subUrl = '/sysapi/'+TermInfo.url;
    }
    let fullUrl = 'http://webapi.cninfo.com.cn/api'+subUrl+'?scode='+scode+paramUrl+'&@column='+column
    let queryData = await getCninfoJson(fullUrl)
    return JSON.parse(queryData).records[0][column]
}

module.exports = {
    getFinancialTermData
}

