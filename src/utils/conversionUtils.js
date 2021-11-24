// const fs = require('fs')
const Papa = require('papaparse')
const jstat = require('jstat')
const percentRank = require('percentile-rank');
const axios = require('axios')

function roundToTwo(num) {
    return +(Math.round(num + "e+3")  + "e-3");
}

function isNumeric(str) {
  if (typeof str != "string") return false // we only process strings!  
  return !isNaN(str) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
         !isNaN(parseFloat(str)) // ...and ensure strings of whitespace fail
}

const insertLetter = (str, insertLetter, insertAfter) =>{
	const strAr = [...str]
	return str.substring(0,insertAfter) + insertLetter + str.substring(insertAfter,strAr.length)
}

const getEndDay = (monthNum) =>{
	const thirty = [4,6,9,11]
	const thirtyOne = [1,3,5,7,8,10,12]
	if(monthNum == 2){
		return 28
	}
	else{
		const endDay = thirty.indexOf(monthNum) >=0 ? 30
		 : thirtyOne.indexOf(monthNum) >= 0
		 	? 31 : false
		return endDay 	
	}
}

const configFromCsv = async(fileName) =>{

	try{
		// const data = await fs.readFileSync(fileName,{encoding:'utf8'})
		const dataFull = await axios.get(fileName)

		const data = dataFull.data
		if(!data){
			return {error: 'aws config file request error'}
		}
		// console.log('data', data)

		const parsed = await Papa.parse(data,{header:true}).data
		// console.log('parsed', parsed)
		const configObj = {}
		const origArray = []
		const psaIndexMap = new Map()
		parsed.map((currPsaObj,i) =>{
			// console.log('currPsaObj', currPsaObj)
			const newObj = {}
			const currGacc = currPsaObj['GACC'] ?  currPsaObj['GACC'].replace(/\t/g, '') : null
			const currPsa = currPsaObj['PSA'] ? currPsaObj['PSA'].replace(/\t/g, '') : null
			psaIndexMap.set(currPsa,i)
			newObj['GACC'] = currGacc
			newObj['PSA'] = currPsa
			newObj['P1'] = currPsaObj['P1'] ? currPsaObj['P1'].replace(/\t/g, '') : false
			newObj['P2'] = currPsaObj['P2'] ? currPsaObj['P2'].replace(/\t/g, '') : false
			newObj['P1-BP2'] = currPsaObj['P1-BP2']
			newObj['P1-BP3'] = currPsaObj['P1-BP3']
			newObj['P2-BP2'] = currPsaObj['P2-BP2']
			newObj['P2-BP3'] = currPsaObj['P2-BP3']
			origArray.push(newObj)
			if(!configObj[currGacc] && currGacc){
				configObj[currGacc]={}
			}
			if(currGacc && currPsa){
				const endMonth = parseFloat(currPsaObj?.['seasonEndMonth']) ?? 12
				const endDay = endMonth ? getEndDay(endMonth) : false
				configObj[currGacc][currPsa] = {
					stnArray:[],
					fireSeason: {startMonth: parseFloat(currPsaObj?.['seasonStartMonth']) ?? 1, startDay:1, endMonth, endDay: endDay ? endDay : 30},
					climoYears:[2002, 2016],
					legacyBreakpoints:{
						parameter1: {
							dry: currPsaObj['P1-BP2'] && isNumeric(currPsaObj['P1-BP2']) ?  parseFloat(currPsaObj['P1-BP2']) : false,
							veryDry: currPsaObj['P1-BP3'] && isNumeric(currPsaObj['P1-BP3']) ?  parseFloat(currPsaObj['P1-BP3']) : false,
						},
						parameter2:{
							dry: currPsaObj['P2-BP2'] && isNumeric(currPsaObj['P2-BP2']) ?  parseFloat(currPsaObj['P2-BP2']) : false,
							veryDry: currPsaObj['P2-BP3'] && isNumeric(currPsaObj['P2-BP3']) ?  parseFloat(currPsaObj['P2-BP3']) : false,
						}
					},
					parameter1: currPsaObj['P1'] ? currPsaObj['P1'].replace(/\t/g, '') : false,
					parameter2: currPsaObj['P2'] ? currPsaObj['P2'].replace(/\t/g, '') : false,
					oldModel: currPsaObj['oldModel'],
					newModel: currPsaObj['newModel']
				}
			}
			for(var element in currPsaObj){
				const info = currPsaObj[element]
				const cleanInfo = info.replace(/\t/g, '')
				const isRaws = element.search("Key RAWS") >=0 ? true : false
				// console.log('isRaws', isRaws, 'cleanInfo', cleanInfo, 'isNumber', isNumeric(cleanInfo), 'element', element, 'currPsa', currPsa)

				// console.log('cleanInfo',element, element.search("Key RAWS"))


				// if(element !== 'GACC' && element !== 'PSA'  && element !== 'seasonStartMonth'  && element !== 'seasonEndMonth' && currGacc && currPsa ){
					if(isRaws){
						if(cleanInfo){
							configObj[currGacc][currPsa]['stnArray'].push(isNumeric(cleanInfo) ? parseFloat(cleanInfo): cleanInfo)
						}
					}
					// else{
					// 	configObj[currGacc][currPsa][element] = isNumeric(cleanInfo) ? parseFloat(cleanInfo): cleanInfo
					// }
				// }
			}

		})
		// console.log('orig psaIndexMap', psaIndexMap)
			// const psaData = parsed[psa]
			// console.log('configObj', JSON.stringify(configObj))
			return {newConfig: configObj, origConfig: origArray, psaIndexMap}

	}
	catch(e){
		console.log('config error',e)
		return {error: JSON.stringify(e)}
	}
}


const csvToJson = async(model, fileName, station, psa, gaccCap)=>{
	try{
		// const data = await fs.readFileSync(fileName,{encoding:'utf8'})
		// console.log('requesting data', fileName)
		const requestedData = await axios.get(fileName)
		// console.log('requestedData', requestedData)
		const data = requestedData.data
		// console.log('data', data)
		if(!data){
			console.log('no station history data', station, fileName)
		}
		else{
			console.log('! I got data!!!!!', data.length)
		}

		// console.log('model', model, 'fileName', fileName)
		// console.log('got this file successfully', `./stnData/allGACCFormat/${fileName}`)
		const parsed = await Papa.parse(data,{header:true}).data
		// console.log('parsed', parsed)
		return parsed
	}
	catch(e){
		// console.log('file read error', e)
		console.log('no data for station', station)
		const errorText = `\n PSA ${psa}: no data for ${station} fuel model ${model}`
		// await fs.appendFileSync(`./stnData/errorLog${gaccCap}.txt`, errorText)
		return {error: JSON.stringify(e), station, model}
	}
}

const makeStnObj = (dataAr)=>{
	const returnObj = {}
	dataAr.map((curObObject,i) =>{
		if(i>0){
			var date = undefined
			for(var keySpace in curObObject){
				const key = keySpace.replace(/ /g, "")
				const val = curObObject[keySpace].replace(/ /g, "")

				if(key == 'DATE'){
					date = val
					returnObj[val] = {}
				}
				else{
					if(returnObj[date])
					returnObj[date][key] = val
				}
			}
		}
	})
	// console.log('returnObj', returnObj)
	return returnObj
}

const checkInDateRange = (obDateAr, {startMonth, startDay, endMonth, endDay}, climoYears) => {
	const obMonth = obDateAr[0] && isNumeric(obDateAr[0]) ? parseFloat(obDateAr[0]) : false
	const obDay = obDateAr[1] && isNumeric(obDateAr[1]) ? parseFloat(obDateAr[1]) : false
	const obYear = obDateAr[2] && isNumeric(obDateAr[2]) ? parseFloat(obDateAr[2]) : false
	const yearInRange = obYear >=climoYears[0] && obYear <=climoYears[1]
	const dayInRange = obDay >=startDay && obDay <=endDay
	const isStartMonth = obMonth == startMonth
	const isEndMonth = obMonth == endMonth
	var inRange = false
	if(yearInRange){
		if(isStartMonth){
			if(obDay>=startDay){
				inRange = true
			}
		}
		else if(isEndMonth){
			if(obDay <= endDay){
				inRange = true
			}
		}
		else if(obMonth > startMonth && obMonth < endMonth){
			inRange = true
		}
	}
	return inRange
}

const getDataFile = (gacc, model, station, bucketURL) => {
	console.log(`${bucketURL}/${gacc}/${station}_daily_listing_${model}.csv`)
	// if(gacc == 'SWCC'){
	// 	return `./stnData/allGACCFormat/${gacc}/${model}/${station}.csv`
	// }
	// else{
		// return `./stnData/allGACCFormat/${gacc}/${station}_daily_listing_${model}.csv`
		return `${bucketURL}/${gacc}/${station}_daily_listing_${model}.csv`
		// https://7daydata.s3.us-east-2.amazonaws.com/GtoY/historyRAWS
	// }

}


// stnClimo(model1, stn, psa, newConfig, gaccCap)
const stnClimo = async(dataObj, fuelModel,station, psa, psaConfig, gaccCap)=>{
	// console.log('fileLoacation', getDataFile(gaccCap, fuelModel, station))
	// console.log('stn config look for climo date object and climo years', psaConfig)
	// console.log('stn climo input dataObj, fuelModel,station, psa, psaConfig, gaccCap', !dataObj, !fuelModel,!station, !psa, !psaConfig, !gaccCap)
	const parameter1 =  psaConfig.parameter1
	const parameter2 = psaConfig.parameter2
	const parameter1Alt = insertLetter(parameter1, 'M', 1)
	const parameter2Alt = insertLetter(parameter2, 'M', 1)
	// console.log('parameter2', parameter2)
	// console.log('parameter1Alt', parameter1Alt)
	// console.log('psaConfig', psaConfig)
	// const dataFile =  getDataFile(gaccCap, fuelModel, station)
	// console.log('dataFile', dataFile)
	// const fuelModelData = await csvToJson(fuelModel, dataFile, station, psa, gaccCap)
	// if(fuelModelData.error){
		// return null
	// }
	// else{
// 
		// const dataObj = makeStnObj(fuelModelData)
		// console.log('dataObj', dataObj)
		const modelClimo = {parameter1:[], parameter2: []}
		for(var obObj in dataObj){
			const obDateAr = obObj.split('/')
			const inRange = checkInDateRange(obDateAr, {...psaConfig.fireSeason}, psaConfig.climoYears)
			// const parameter1Val = dataObj[obObj][parameter1] 
			// 	? dataObj[obObj][parameter1] 
			// 		: dataObj[obObj][parameter1Alt] 
			// 			? dataObj[obObj][parameter1Alt] 
			// 				: null
			// const parameter2Val = dataObj[obObj][parameter2] 
			// 	? dataObj[obObj][parameter2] 
			// 		: dataObj[obObj][parameter2Alt] 
			// 			? dataObj[obObj][parameter2Alt] 
			// 				: null

			var parameter1Val
			if(dataObj[obObj][parameter1]){
				parameter1Val = dataObj[obObj][parameter1]
			}
			else if(!dataObj[obObj][parameter1] && dataObj[obObj][parameter1Alt]) {
				parameter1Val = dataObj[obObj][parameter1Alt]
			}
			else{
				parameter1Val = null
			}

			var parameter2Val
			if(dataObj[obObj][parameter2]){
				parameter2Val = dataObj[obObj][parameter2]
				// console.log('parameter2Val regular', parameter2Val)
			}
			else if(!dataObj[obObj][parameter2] && dataObj[obObj][parameter2Alt]) {
				parameter2Val = dataObj[obObj][parameter2Alt]
				// console.log('parameter2Val alt', parameter2Val)
			}
			else{
				// console.log('no parameter2Val', 'parameter2', parameter2, 'dataObj', dataObj, 'obObj', obObj, 'dataObj[obObj]', dataObj[obObj])
				parameter2Val = null
			}

			// console.log('parameter2Val', parameter2Val,  parameter2, dataObj[obObj])
			if(inRange){
				// console.log('in range!', parameter2Val, parameter1Val)
				modelClimo['parameter1'].push(parseFloat(parameter1Val))
				modelClimo['parameter2'].push(parseFloat(parameter2Val))
			}
			else{
				// console.log('not in range', obDateAr)
			}
		}
		// console.log('modelClimo', modelClimo)
		return{...modelClimo}
	// }
}
const doStats = (legacyBreakpoints, parameter1, parameter2, parameter1Model1Data, parameter2Model1Data, parameter1Model2Data, parameter2Model2Data)=>{
	// console.log('legacyBreakpoints, parameter1Model1Data, parameter2Model1Data, parameter1, parameter2, model2Data')
	// console.log(legacyBreakpoints, parameter1Model1Data, parameter2Model1Data, parameter1, parameter2, model2Data)

	const parameter1DryValue = legacyBreakpoints['parameter1']['dry']
	const parameter1VeryDryValue = legacyBreakpoints['parameter1']['veryDry']

	const parameter2DryValue = legacyBreakpoints['parameter2']['dry']
	const parameter2VeryDryValue = legacyBreakpoints['parameter2']['veryDry']

	// console.log('parameter1DryValue', parameter1DryValue, 'parameter1VeryDryValue', parameter1VeryDryValue)
	// console.log('parameter2DryValue', parameter2DryValue, 'parameter2VeryDryValue', parameter2VeryDryValue)



	const parameter1DryPercentile = jstat.percentileOfScore(parameter1Model1Data, parameter1DryValue)
	const parameter1VeryDryPercentile = jstat.percentileOfScore(parameter1Model1Data, parameter1VeryDryValue)
	// console.log('parameter1Model1Data length', parameter1Model1Data.length, 'parameter1DryValue', parameter1DryValue)
	// console.log('parameter1Model1Data length', parameter1Model1Data.length, 'parameter1VeryDryValue', parameter1VeryDryValue)

	const parameter2DryPercentile = jstat.percentileOfScore(parameter2Model1Data, parameter2DryValue)
	const parameter2VeryDryPercentile = jstat.percentileOfScore(parameter2Model1Data, parameter2VeryDryValue)

	// console.log('parameter2Model1Data length', parameter2Model1Data.length, 'parameter2DryValue', parameter2DryValue)
	// console.log('parameter2Model1Data ', parameter2Model1Data, 'parameter2VeryDryValue', parameter2VeryDryValue)

	const parameter1Crosswalk = jstat.quantiles(parameter1Model2Data.sort(),[parameter1DryPercentile, parameter1VeryDryPercentile])
	const parameter2Crosswalk = jstat.quantiles(parameter2Model2Data.sort(),[parameter2DryPercentile, parameter2VeryDryPercentile])

	// console.log('parameter1Crosswalk', parameter1Crosswalk)
	// console.log('parameter1Model1Data.length, parameter1DryPercentile, parameter1VeryDryPercentile', parameter1Model1Data.length, parameter1DryPercentile, parameter1VeryDryPercentile)
	// console.log('parameter2Crosswalk', parameter2Crosswalk)
	// console.log('parameter2Model2Data.length, parameter2DryPercentile, parameter2VeryDryPercentile', parameter2Model2Data.length, parameter2DryPercentile, parameter2VeryDryPercentile)
	// newBreakpoints:{
	// 				parameter1: {dry: Math.round(statInfo.parameter1Crosswalk[0]), veryDry: Math.round(statInfo.parameter1Crosswalk[1])}, 
	// 				parameter2: {dry: Math.round(statInfo.parameter2Crosswalk[0]), veryDry: Math.round(statInfo.parameter2Crosswalk[1])}
	// 			}
	// if
	// console.log('parameter1DryPercentile', parameter1DryPercentile, 'parameter1VeryDryPercentile', parameter1VeryDryPercentile)
	// console.log('parameter2DryPercentile', parameter2DryPercentile, 'parameter2VeryDryPercentile', parameter2VeryDryPercentile)

	// console.log('parameter1Crosswalk', parameter1Crosswalk, 'parameter2Crosswalk', parameter2Crosswalk)

// 	{
//   parameter1: { dry: 55, veryDry: 70 },
//   parameter2: { dry: 11, veryDry: 7 }
// }

	// const realityCheck = jstat.quantiles(model2Data[parameter1].sort(),[0.14,0.5,0.9, 0.97])
	// const realityCheckG = jstat.quantiles(parameter1Model1Data.sort(),[0.14, 0.5,0.9, 0.97])
	// const realityCheck1 = jstat.quantiles(testData,[0.5,0.9, 0.97])
	// const percentRankVal = percentRank(model2Data[parameter1].sort(),80)
	// console.log('model2Data', model2Data.ERC.length)
	// console.log('ralitycheckY', parameter1, '50th', realityCheck[0])
	// console.log('percentiel of schore reality check',  jstat.percentileOfScore(model2Data[parameter1].sort(), 47.1), 'should be 50th percentile')
	// console.log('ralitycheckY', parameter1, '90th', realityCheck[1], '(should be 74)')
	// console.log('ralitycheckY', parameter1, '97th', realityCheck[2], '(should be 86)')
	// console.log('ralitycheck1Y', parameter1, '97th', realityCheck1[2], '(should be 86)')

	// 	console.log('ralitycheckG', parameter1, '50th', realityCheckG[0])
	// console.log('ralitycheckG', parameter1, '90th', realityCheckG[1], '(should be 74)')
	// console.log('ralitycheckG', parameter1, '97th', realityCheckG[2], '(should be 86)')
	// console.log('legacyBreakpoints,				parameter1DryPercentile,				parameter1VeryDryPercentile,				parameter2DryPercentile,				parameter2VeryDryPercentile,				parameter1Crosswalk,				parameter2Crosswalk,')
	// console.log(legacyBreakpoints,
	// 		parameter1DryPercentile,
	// 		parameter1VeryDryPercentile,
	// 		parameter2DryPercentile,
	// 		parameter2VeryDryPercentile,
	// 		parameter1Crosswalk,
	// 		parameter2Crosswalk,)

	return(
		{
			legacyBreakpoints,
			parameter1DryPercentile,
			parameter1VeryDryPercentile,
			parameter2DryPercentile,
			parameter2VeryDryPercentile,
			parameter1Crosswalk,
			parameter2Crosswalk,
		}
	)
}

exports.csvToJson = csvToJson
exports.roundToTwo = roundToTwo
exports.makeStnObj = makeStnObj
exports.checkInDateRange = checkInDateRange
exports.stnClimo = stnClimo
exports.doStats = doStats
exports.configFromCsv = configFromCsv
exports.getDataFile = getDataFile