// const fs = require('fs')
const Papa = require('papaparse')
const axios = require('axios')
const jstat = require('jstat')
const percentRank = require('percentile-rank');
const AWS = require('aws-sdk');
const config = require('./config')
const {
		csvToJson, 
		roundToTwo, 
		makeStnObj,
		checkInDateRange,
		stnClimo,
		doStats,
		configFromCsv,
		getDataFile
	} = require('./utils/conversionUtils')








// psaFn(config[gacc][psa], psa, gacc, autoConfig[gacc][psa], gacc)
const psaFn = async(gacc, psa, newConfig, historyBucketUrl, stnCsvsInBucket) =>{
	const noData={G:[],Y:[]}

	const psaStations = newConfig.stnArray

	const parameter1 = newConfig.parameter1
	const parameter2 = newConfig.parameter2
	const legacyBreakpoints = newConfig.legacyBreakpoints

	const returnObj = {
		stations: psaStations,
		parameter1,
		parameter2,
		legacyBreakpoints,
		
	}


	const model1 = newConfig.oldModel
	const model2 = newConfig.newModel

	const model1Data = {parameter1:[], parameter2:[]}
	const model2Data = {parameter1:[], parameter2:[]}

	const model1DataPromiseObj = {parameter1:[], parameter2:[]}
	const model2DataPromiseObj = {parameter1:[], parameter2:[]}
	// const psaStationsShort = psaStations.filter((curr,i)=>i<5)
	// console.log('psaStnsLength', psaStationsShort.length, psaStationsShort)
	let psaModel1StnCsvsInBucket = 
		psaStations.filter(currStn =>{
			const hasStnModel1 = stnCsvsInBucket[model1].indexOf(currStn)
			if(hasStnModel1 >=0){
				return currStn
			}
		})

	let dataFileArrayModel1Promise = await Promise.allSettled(
		psaModel1StnCsvsInBucket.map(async currStn =>{
			try{
				const hasStnModel1 = stnCsvsInBucket[model1].indexOf(currStn)
				const stnData = await axios.get(getDataFile(gacc, model1, currStn, historyBucketUrl))
				console.log('here1')
				if(stnData && stnData.data){
				console.log('here2')
					const stnDataJson = await Papa.parse(stnData.data,{header:true}).data
					const stnObjHere = makeStnObj(stnDataJson)
					const stnClimoModel1Here = await stnClimo(stnObjHere, model1, currStn, psa, newConfig, gacc)
					// console.log('model1DataPromiseObj.parameter1', model1DataPromiseObj.parameter1)
					// console.log('stnClimoModel1Here.parameter1', stnClimoModel1Here.parameter1)
					const newParam1Mod2 = [...model1DataPromiseObj.parameter1, ...stnClimoModel1Here.parameter1].sort()
					const newParam2Mod2 = [...model1DataPromiseObj.parameter2, ...stnClimoModel1Here.parameter2].sort()
					model1DataPromiseObj.parameter1 = newParam1Mod2
					model1DataPromiseObj.parameter2 = newParam2Mod2
				// console.log('stnClimoModel1Here', stnClimoModel1Here)
					return stnClimoModel1Here
				// console.log('sending this from the promise stnDataJson', stnDataJson)
				}
			}
			catch(e){
				console.log('error in mapping thing for stn', currStn, e)
			}
		})
	)  
	// console.log('model1DataPromise', model1DataPromise)

	let psaModel2StnCsvsInBucket = 
		psaStations.filter(currStn =>{
			const hasStnModel2 = stnCsvsInBucket[model2].indexOf(currStn)
			if(hasStnModel2 >=0){
				return currStn
			}
		})

	let dataFileArrayModel2Promise = await Promise.allSettled(
		psaModel2StnCsvsInBucket.map(async currStn =>{
			try{
				const hasStnModel2 = stnCsvsInBucket[model2].indexOf(currStn)
				const stnData = await axios.get(getDataFile(gacc, model2, currStn, historyBucketUrl))
				console.log('here1')
				if(stnData && stnData.data){
				console.log('here2')
					const stnDataJson = await Papa.parse(stnData.data,{header:true}).data
					const stnObjHere = makeStnObj(stnDataJson)
					const stnClimoModel2Here = await stnClimo(stnObjHere, model2, currStn, psa, newConfig, gacc)
					// console.log('model2DataPromiseObj.parameter1', model2DataPromiseObj.parameter1)
					// console.log('stnClimoModel2Here.parameter1', stnClimoModel2Here.parameter1)
					const newParam1Mod2 = [...model2DataPromiseObj.parameter1, ...stnClimoModel2Here.parameter1].sort()
					const newParam2Mod2 = [...model2DataPromiseObj.parameter2, ...stnClimoModel2Here.parameter2].sort()
					model2DataPromiseObj.parameter1 = newParam1Mod2
					model2DataPromiseObj.parameter2 = newParam2Mod2
				// console.log('stnClimoModel2Here', stnClimoModel2Here)
					return stnClimoModel2Here
				// console.log('sending this from the promise stnDataJson', stnDataJson)
				}
			}
			catch(e){
				console.log('error in mapping thing for stn', currStn, e)
			}
		})
	) 
	// console.log('model2DataPromiseObj', model2DataPromiseObj)
	const statInfoNewPromise = doStats(legacyBreakpoints, parameter1, parameter2, model1DataPromiseObj.parameter1, model1DataPromiseObj.parameter2, model2DataPromiseObj.parameter1, model2DataPromiseObj.parameter2)
	console.log('statInfoNewPromise', statInfoNewPromise)
	const newInfo = {
			percentiles:{
					parameter1:{
						dry: roundToTwo(statInfoNewPromise.parameter1DryPercentile),
						veryDry:roundToTwo(statInfoNewPromise.parameter1VeryDryPercentile)
					},
					parameter2:{
						dry: roundToTwo(statInfoNewPromise.parameter2DryPercentile),
						veryDry: roundToTwo(statInfoNewPromise.parameter2VeryDryPercentile)
					}
				},
				newBreakpoints:{
					parameter1: {dry: Math.round(statInfoNewPromise.parameter1Crosswalk[0]), veryDry: Math.round(statInfoNewPromise.parameter1Crosswalk[1])}, 
					parameter2: {dry: Math.round(statInfoNewPromise.parameter2Crosswalk[0]), veryDry: Math.round(statInfoNewPromise.parameter2Crosswalk[1])}
				}
			}
		returnObj['percentiles'] = newInfo.percentiles
		returnObj['newBreakpoints'] = newInfo.newBreakpoints

// 	// for await (var stn of psaStations){
// 	for await (var stn of psaStations){
// 		console.log('stnCsvsInBucket', stnCsvsInBucket[model1].indexOf(stn))
// 		const hasStnModel1 = stnCsvsInBucket[model1].indexOf(stn)
// 		const hasStnModel2 = stnCsvsInBucket[model2].indexOf(stn)
// 		console.log('stn', stn, 'model1', model1, 'model2', model2, hasStnModel1 >=0, hasStnModel2 >=0)
// 		// 239204_daily_listing_G
// 		const dataFileModel1 = hasStnModel1 >=0 ? getDataFile(gacc, model1, stn, historyBucketUrl) : false
// 		// console.log('dataFileModel1', dataFileModel1)
// 		const dataFileModel2 = hasStnModel2 >=0 ? getDataFile(gacc, model2, stn, historyBucketUrl) : false
// 		// console.log('here2')

// 		console.log('this is okay data to send it', dataFileModel1)
// 		const fuelModel1Data = await csvToJson(model1, dataFileModel1, stn, psa, gacc)
// 		const fuelModel2Data = await csvToJson(model2, dataFileModel2, stn, psa, gacc)

// 		// console.log('model1 data missing', fuelModel1Data.error)
// 		// console.log('model2 data missing', fuelModel2Data.error)
// 		if(fuelModel1Data.error || fuelModel2Data.error){
// 			// console.log('no data for station fuelModel1Data', stn)
// 			// return null
// 			const errStn1 = fuelModel1Data.error ? fuelModel1Data.station : false
// 			const errorModel1 = fuelModel1Data.error? fuelModel1Data.model : false

// 			const errStn2 = fuelModel2Data.error ? fuelModel2Data.station : false
// 			const errorModel2 = fuelModel2Data.error? fuelModel2Data.model : false
// 			if(errStn1 && errorModel1){
// 				noData[errorModel1].push(errStn1)
// 			}
// 			if(errStn2 && errorModel2){
// 				noData[errorModel2].push(errStn2)
// 			}



// 		}
// 		else{

// 			const dataObjModel1 = makeStnObj(fuelModel1Data)
// 			const dataObjModel2 = makeStnObj(fuelModel2Data)

// 			// console.log('dataObjModel1', dataObjModel1)

// 			const stnClimoModel1 = await stnClimo(dataObjModel1, model1, stn, psa, newConfig, gacc)
// 			// console.log('stnClimoModel1', stnClimoModel1)
// 			const stnClimoModel2 = await stnClimo(dataObjModel2, model2, stn, psa, newConfig, gacc)
// 			// console.log('stnClimoModel2', stnClimoModel2)
// 			// const stnClimoModel2 = await stnClimo(model2, `${stn}_daily_listing_${model2}.csv`, parameter1, parameter2, fireSeasonInfo, climoYears, stn, psa, gacc, newConfig, gacc)
// 			// const stnClimoModel2 = await stnClimo(model2,  `${stn}.csv`, parameter1, parameter2, fireSeasonInfo, climoYears, stn, psa, gacc)
// 			// console.log('s',stnClimoModel2)
// 			// if(!stnClimoModel2){
// 			// 	console.log('no station climo model 2')
// 			// }
// 			// else if(!stnClimoModel1){
// 			// 	console.log('no station climo model 2')
// 			// }
// 			if(stnClimoModel1 && stnClimoModel2){
// 				model1Data['parameter1'].push(...stnClimoModel1['parameter1'])
// 				model1Data['parameter2'].push(...stnClimoModel1['parameter2'])
// 				model2Data['parameter1'].push(...stnClimoModel2['parameter1'])
// 				model2Data['parameter2'].push(...stnClimoModel2['parameter2'])
// 			}
// 			else{

// 				// console.log('no data stnClimoModel1 || stnClimoModel2')
// 			}
// 		}
// 	}

	

// 	const parameter1Model1Data = model1Data && model1Data.parameter1 ? model1Data.parameter1.sort() : null
// 	const parameter2Model1Data = model1Data && model1Data.parameter2 ? model1Data.parameter2.sort() : null

// 	const parameter1Model2Data = model2Data && model2Data.parameter1 ? model2Data.parameter1.sort() : null
// 	const parameter2Model2Data = model2Data && model2Data.parameter2 ? model2Data.parameter2.sort() : null

// 	// console.log('parameter1Model1Data.length', parameter1Model1Data, 'parameter2Model1Data.length', parameter2Model1Data, 'parameter1Model2Data.length', parameter1Model2Data, 'parameter2Model2Data.length', parameter2Model2Data)

// 	// console.log('parameter1Model1Data && parameter2Model1Data', parameter1Model1Data , parameter2Model1Data)

	
// 	if(parameter1Model1Data.length>0 && parameter2Model1Data.length>0 && parameter1Model2Data.length>0 && parameter2Model2Data.length>0){
// // ats =                       (legacyBreakpoints, parameter1, parameter2, parameter1Model1Data, parameter2Model1Data, parameter1Model2Data, parameter2Model2Data)=>{
// 		const statInfo = doStats(legacyBreakpoints, parameter1, parameter2, parameter1Model1Data, parameter2Model1Data, parameter1Model2Data, parameter2Model2Data)
// 		console.log('statInfo Original', statInfo)
// 		const newInfo = {
// 			percentiles:{
// 					parameter1:{
// 						dry: roundToTwo(statInfo.parameter1DryPercentile),
// 						veryDry:roundToTwo(statInfo.parameter1VeryDryPercentile)
// 					},
// 					parameter2:{
// 						dry: roundToTwo(statInfo.parameter2DryPercentile),
// 						veryDry: roundToTwo(statInfo.parameter2VeryDryPercentile)
// 					}
// 				},
// 				newBreakpoints:{
// 					parameter1: {dry: Math.round(statInfo.parameter1Crosswalk[0]), veryDry: Math.round(statInfo.parameter1Crosswalk[1])}, 
// 					parameter2: {dry: Math.round(statInfo.parameter2Crosswalk[0]), veryDry: Math.round(statInfo.parameter2Crosswalk[1])}
// 				}
// 			}
// 		returnObj['percentiles'] = newInfo.percentiles
// 		returnObj['newBreakpoints'] = newInfo.newBreakpoints
// 		// await fs.writeFileSync(`./stnData/crosswalk-${gacc}-${psa}.txt`, JSON.stringify(returnObj))
// 		console.log('success!!!!', psa)
// 	}
// 	else{
// 		console.log('no data', psa)
// 	}
	// console.log('noData', noData)
	
	return {returnObj, noData}	


	

	



	// console.log('elem 1 orig dry and ver dry vals', parameter1DryValue, parameter1VeryDryValue)
	// console.log('elem 1 orig dry percentile very dry perceintel', parameter1DryPercentile, parameter1VeryDryPercentile)
	// console.log('element 1 crosswalk', parameter1Crosswalk)

	// console.log('elemt 2 orig dry very dry', parameter2DryValue, parameter2VeryDryValue)
	// console.log('elemnt2 dry very dry percentile', parameter2DryPercentile, parameter2VeryDryPercentile)
	// console.log('element 2 croswawlk', parameter2Crosswalk)
}



const loopPsas = async(gacc, psaAr, gaccConfig, origConfig, psaIndexMap, historyBucketUrl, stnCsvsInBucket) =>{
	const psaObj = {}
	const noStnDataAllPsas = {G:[], Y:[]}
	// const gacc = 'swcc'
	// const gacc = 'eacc'
	// const gacc = 'EACC'
	// const gacc = 'SWCC'
	// const psa = 'sw02'
	const psaArShort = psaAr.filter((curr,i)=>i<3)
	
	// (`./stnData/allGACCFormat/${fileName}`,{encoding:'utf8'})
	// console.log('psaAr', psaAr)
	const errorText = ``
	// await fs.writeFileSync(`./stnData/errorLog${gacc}.txt`, errorText)
	// psaFn(config[gacc][psa]['stations'],config[gacc][psa]['parameters'], config[gacc][psa]['models'], config[gacc][psa]['thresholds'], config[gacc][psa]['fireSeason'],)
	const newOrigConfig = []
	for await (var psa of psaAr){
	// for await (var psa of psaArShort){
	// console.log('autoConfig', autoConfig[gacc][psa], 'origConfig', config[gacc][psa])
		const psaIndex = psaIndexMap.get(psa)
		const psaOrigConfig = origConfig[psaIndex]
		// console.log('psaIndex', psaIndex, 'psaOrigConfig', psaOrigConfig)
		const psaConfig = gaccConfig[psa]
		const psaReturn = await psaFn(gacc, psa, psaConfig, historyBucketUrl, stnCsvsInBucket)
		const psaInfo = psaReturn.returnObj
		const noDataStns = psaReturn.noData
		const {parameter1, parameter2, oldModel, newModel, stnArray} = psaConfig
		console.log('psaInfo', psa, psaInfo.newBreakpoints)
		const newOrigConfigObj = {
			GACC: gacc,
			PSA: psa,
			P1: parameter1,
			P2: parameter2,
			[`P1-BP2-${oldModel}`]: psaInfo?.legacyBreakpoints?.parameter1?.dry ?? null,
			[`P1-BP2-${newModel}`]: psaInfo?.newBreakpoints?.parameter1?.dry ?? null,
			'P1-BP2%': psaInfo?.percentiles?.parameter1?.dry ?? null,
			[`P1-BP3-${oldModel}`]: psaInfo?.legacyBreakpoints?.parameter1?.veryDry ?? null,
			[`P1-BP3-${newModel}`]: psaInfo?.newBreakpoints?.parameter1?.veryDry ?? null,
			'P1-BP3%': psaInfo?.percentiles?.parameter1?.veryDry ?? null,
			[`P2-BP2-${oldModel}`]: psaInfo?.legacyBreakpoints?.parameter2?.dry ?? null,
			[`P2-BP2-${newModel}`]: psaInfo?.newBreakpoints?.parameter2?.dry ?? null,
			'P2-BP2%': psaInfo?.percentiles?.parameter2?.dry ?? null,
			[`P2-BP3-${oldModel}`]: psaInfo?.legacyBreakpoints?.parameter2?.veryDry ?? null,
			[`P2-BP3-${newModel}`]: psaInfo?.newBreakpoints?.parameter2?.veryDry ?? null,
			'P2-BP3%': psaInfo?.percentiles?.parameter2?.veryDry ?? null,
		}
		stnArray.map((curr,i)=> newOrigConfigObj[`station${i}`]=curr)
		newOrigConfig.push(newOrigConfigObj)
		// console.log('newOrigConfigObj', newOrigConfigObj)
		psaObj[psa] = psaInfo
		for(var missingModel in noDataStns){
				const psaMissing = noDataStns[missingModel]
				noStnDataAllPsas[missingModel] = [...noStnDataAllPsas[missingModel], ...psaMissing]
			}
	}
	// console.log('newOrigConfig', newOrigConfig)
	return {psaObj, newOrigConfig, missingStns: noStnDataAllPsas}

}
const gaccLevel = async() =>{
	// try{
		AWS.config.update({ region: 'us-east-2' });

    // Create S3 service object
    const s3 = new AWS.S3({
      apiVersion: '2006-03-01',
      accessKeyId: process.env.ACCESSKEYID,
      secretAccessKey: process.env.SECRETACCESSKEY
    });
	// }
	// catch(e){
	// 	console.log('aws s3 connection error', e)
	// }
	const configObj = await configFromCsv('https://7dayconversion-inputs.s3.us-east-2.amazonaws.com/PSA_Attributes.csv') 
	const historyBucketUrl = 'https://7dayconversion-inputs.s3.us-east-2.amazonaws.com/historyRAWS'
	if(configObj.error){
		console.log('config request error', configObj.error)
		return {error:configObj.error}
	}
	const autoConfig = configObj.newConfig
	const origConfig = configObj.origConfig
	const psaIndexMap = configObj.psaIndexMap
	let parameterTranslationInfoArray = []
	const noStnData = {G:[], Y:[]}
	// console.log('origConfig', origConfig)
	// const autoConfig = await configFromCsv('./stnData/PSA_Attributes.csv') https://7daydata.s3.us-east-2.amazonaws.com/GtoY/PSA_Attributes.csv
	// const gaccAr = Object.keys(autoConfig)
	const gaccAr = ['SWCC', 'EACC', 'GBCC', 'AICC', 'NRCC', 'NWCC', 'ONCC', 'OSCC', 'RMCC', 'SACC']
	// const gaccAr = ['SWCC']
	// const gaccAr = ['EACC']
	const allGaccObj = {}
	// console.log('gaccAr', gaccAr)
	for await (var gacc of gaccAr){
		console.log('gacc', gacc)
		const stnCsvs={G:[], Y:[]}
		try{
			const listParams = {Bucket: '7dayconversion-inputs', Prefix: `historyRAWS/${gacc}`}	
			// const listParams = {Bucket: '7daydata', Prefix: 'GtoY', Delimiter:"/"}	
			// const listParams = {Bucket: '7daydata',  Delimiter:"/"}	
			const bucketObjectsReturn = await s3.listObjects(listParams).promise()
			const bucketContents = bucketObjectsReturn.Contents

			if(bucketContents.length > 0 ){
				bucketContents.map(currObj =>{
					var currAr = currObj.Key.split(/[/_.]/)
					const stn = currAr[2]
					const fModel = currAr[5]
					if(currAr.length>5 && stnCsvs[fModel]){
						// console.log('currAr', currAr, stnCsvs[fModel], fModel, stnCsvs)
						stnCsvs[fModel].push(parseFloat(stn))
					}
					// console.log(currObj.Key)
					// console.log(stn, fModel)
				})
				console.log('stnCS', stnCsvs)
			}
			else{
				console.log('empty bucket requesting everything')
			}

		}
		catch(e){
			console.log('s3 error listing bucket objects', e)
		}
		const gaccData = await loopPsas(gacc, Object.keys(autoConfig[gacc]), autoConfig[gacc], origConfig, psaIndexMap, historyBucketUrl, stnCsvs)
		allGaccObj[gacc] = gaccData.psaObj
		const missingGaccStns = gaccData.missingStnsf
		for(var missingModel in missingGaccStns){
			const gaccMissing = missingGaccStns[missingModel]
			noStnData[missingModel] = [...noStnData[missingModel], ...gaccMissing]
		}
		console.log('missingGaccStns', missingGaccStns)
		if(gaccData.newOrigConfig){
			parameterTranslationInfoArray = [...parameterTranslationInfoArray, ...gaccData.newOrigConfig]
		}
		// console.log('gaccData', gaccData)
	}
	// const psaAr = Object.keys(autoConfig[gacc])
	// console.log('allmissing sataion', noStnData)
	// console.log('allGaccObj', JSON.stringify(allGaccObj))
	const translationInfoCsv = Papa.unparse(JSON.stringify(parameterTranslationInfoArray))
	// console.log('parameterTranslationInfoArray', translationInfoCsv)
	// await fs.writeFileSync(`./stnData/allGACCFormat/allGacConfig.json`, JSON.stringify(allGaccObj))
	console.log('done with all of this')
	try{
    
    // console.log('final no station list', mis)
    const uploadParamsText = { Bucket: '7daydata/GtoY', Key: `allGacConfigTest.json`, Body: JSON.stringify(allGaccObj), ACL: 'public-read' }
    const uploadedText = await s3.upload(uploadParamsText).promise()
    console.log('uploaded to aws uploadedText', uploadedText)

    const uploadParamsCsv = { Bucket: '7daydata/GtoY', Key: `crosswalkInfoTest.csv`, Body: translationInfoCsv, ACL: 'public-read' }
    const uploadedCsv = await s3.upload(uploadParamsCsv).promise()
    console.log('uploaded to aws uploadedCsv', uploadedCsv)

    const uploadMissingStnsParams = { Bucket: '7daydata/GtoY', Key: `missingStationDataTest.json`, Body: JSON.stringify(noStnData), ACL: 'public-read' }
    const uploadedMissingStnsParams = await s3.upload(uploadMissingStnsParams).promise()
    console.log('uploaded to aws uploadedCsv', uploadedMissingStnsParams)


    return {status: 'success'}
  }
  catch(e){
  	console.log('s3 connection error', e)
  	return {error: 'aws s3 connection error'}
  }
}

module.exports = gaccLevel
// gaccLevel()

// parameter choices:
  // ERC	   BI	 FM10	 F100	 KBDI	 MnRH	 MxRH	 MinT	 MaxT	  GSI	 Wind	SFlag	 VPDA	 VPDM	 SolR	 Rain	 RnDr
