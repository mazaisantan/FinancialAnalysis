import request from 'request'
import fs from "fs";
import {stockList,stockTrade,industryPE} from './config/stockInfo.js';
import fileDownload from './util/fileDownload.js';
import CninfoApi from './config/cninfoAPI.js'
import cninfoAPI from './config/cninfoAPI.js';
import {getCninfoJson,postCninfoJson,cninfoFileDownload} from './cninfoAPI/cninfoRequestAPI.js'
import financialFormData from './data.json'








function financialFormChildrenSearch(data,searchStr){
    let result = data.filter((item)=>{
        let result = item.children.filter((item)=>{
            return item.fieldChineseName == searchStr
        })
        return result.length != 0
    })
    return result[0]
}



let result1 = financialFormChildrenSearch(financialFormData,"股票代码")





