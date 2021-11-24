const dat = [['SW01','100','ERCg','Tmin','MJJ',[20207, 20212, 20213],45,70,40,50,14,59,24,62,30,51,40,50],
['SW02','300','ERCg','F100','AMJ',[20115, 20501, 20509],65,75,9,6,14,31,83,56,45,53,12,9],
['SW03','300','ERCg','F10' ,'MAMJ',[45801],70,90,6,3,8,50,96,48,54,75,11,6],
['SW04','100','ERCg','F100','MJJ',[20402, 290101, 290102],50,70,10,7,22,58,72,47,36,50,12,10],
['SW05','50','ERCg','F100','MJ' ,[20209, 20301, 20303],55,70,11,7,20,52,86,46,40,51,14,9],
['SW06N','500','ERCg','Tmin','AMJJ',[20601, 20604],70,85,50,60,16,46,16,43,49,65,50,60],
['SW06S','100','ERCg','F100','AMJ' ,[21005, 21007, 21202, 21206],55,70,9,6,,,,,,,,],
['SW07','100','ERCg','F100','MJJ',[290702, 200801, 291302],50,70,10,7,,,,,,,,],
['SW08','300','ERCg','F100','AMJ',[20401, 292001, 292008, 292009],60,80,10,7,,,,,,,,],
['SW09','300','ERCg','F100','AMJ',[292103, 292702, 292903],60,80,9,6,,,,,,,,],
['SW10','100','ERCg','F100','MJJ',[290210, 291202],50,65,10,8,,,,,,,,],
['SW11','100','ERCg','F100','AMJ',[291501, 292102],55,80,9,6,,,,,,,,],
['SW12','100','ERCg','F100','AMJ',[292203, 293002, 293003],40,60,12,8,,,,,,,,],
['SW13','2000','ERCg','F10' ,'FMAMJ',[418701, 292301],40,55,8,6,,,,,,,,],
['SW14N','2000','ERCg','F10' ,'FMAMJ',[292301, 293101, 293104],40,55,8,5,,,,,,,,],
['SW14S','200','ERCg','F100','FMAMJ',[417201, 417401, 417403],65,80,9,6,,,,,,,,],
]



const datEA = [['EA01','ERC','F10',30,40,17,11,3,11,[21001,212201,21005,21001,21001,211604,21003,211502,21007,212601,,,,,,,]],
['EA02','ERC','F10',29,38,16,11,3,11,[215601,214001,214201,13610,132207,213501,,,,,,,,,,,]],
['EA03','ERC','F10',28,38,17,12,3,11,[21014,214201,213301,21310,211702,21002,21009,211803,21012,21003,21009,,,,,,]],
['EA04','ERC','F10',27,38,16,11,3,11,[47110,20010,470202,470207,470302,47102,470703,471601,471901,472801,471801,470804,,,,,]],
['EA05','ERC','F10',29,38,17,12,3,11,[476001,475701,215601,474301,473901,475601,214201,473501,,,,,,,,,]],
['EA06','ERC','F10',30,39,17,12,3,11,[201202,20110,200703,20102,471301,201504,,,,,,,,,,,]],
['EA07','ERC','F10',30,39,17,12,3,11,[203802,202902,202010,20310,203601,,,,,,,,,,,,]],
['EA08','ERC','F10',29,39,17,11,3,11,[120201,112001,203802,,,,,,,,,,,,,,]],
['EA09','ERC','F10',29,38,17,12,3,11,[232401,231501,13610,231301,132207,135501,,,,,,,,,,,]],
['EA10','ERC','F10',30,39,17,12,3,11,[475701,112001,476001,,,,,,,,,,,,,,]],
['EA11','ERC','F10',30,39,17,12,3,11,[120201,112001,,,,,,,,,,,,,,,]],
['EA12','ERC','F10',29,40,17,12,3,11,[235202,236902,238502,,,,,,,,,,,,,,]],
['EA13','ERC','F10',30,40,17,12,3,11,[236501,23910,239004,236403,236601,,,,,,,,,,,,]],
['EA14','ERC','F10',29,38,17,12,3,11,[119501,128905,125701,127301,125201,234801,127901,,,,,,,,,,]],
['EA15','ERC','F10',29,39,17,12,3,11,[337301,360901,336001,,,,,,,,,,,,,,]],
['EA16','ERC','F10',29,39,17,12,3,11,[338401,464601,460901,46010,463001,463301,463802,336001,337301,,,,,,,,]],
['EA17','ERC','F10',29,39,17,12,3,11,[461601,464203,465201,464901,465401,463501,462601,360991,46110,,,,,,,,]],
['EA18','ERC','F10',29,39,17,12,3,11,[30101,361231,360331,360351,361171,360901,36102,361802,30110,300171,,,,,,,]],
['EA19','ERC','F10',29,39,17,12,3,11,[300171,300411,361291,360991,30101,360131,361171,360351,360431,360271,301111,36101,,,,,]],
['EA20','ERC','F10',29,38,17,12,3,11,[300312,300491,300191,300411,300892,300311,300891,,,,,,,,,,]],
['EA21','ERC','F10',28,38,17,12,3,11,[430501,430601,270301,430402,301901,270071,431301,,,,,,,,,,]],
['EA22','ERC','F10',28,39,17,12,3,11,[170131,170850,270131,171603,170791,170800,,,,,,,,,,,]],
['EA23','ERC','F10',29,38,17,12,3,11,[305803,280372,361802,191202,30510,300712,191203,370450,,,,,,,,,]],
['EA24','ERC','F10',29,39,17,12,3,11,[280071,182201,280311,18210,180701,180201,28010,280291,280231,280191,280091,280051,182002,281501,70301,181510,]]]


const monthNums = {
	J:{monthNum: 6, endDay: 31},
	F:{monthNum:  2, endDay: 28},
	M:{monthNum:  5, endDay: 31},
	A:{monthNum:  4, endDay: 30},
	S:{monthNum:  9, endDay: 30},
	O:{monthNum:  10, endDay: 31},
	N:{monthNum:  11, endDay: 30},
	D:{monthNum:  12, endDay: 31}
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

const makeSeasonObj = (monthString) =>{
	const month1 = monthNums[monthString[0]].monthNum
	const month2 = monthNums[monthString[monthString.length-1]].monthNum
	const endDayy = monthNums[monthString[monthString.length-1]].endDay
	// expected output: "the lazy dog."
	return {startMonth:month1, startDay:1, endMonth:7, endDay:endDayy, custom: monthString}

	console.log('monthString', monthString, 'month1', month1, 'month2', month2)
}

const metadatObj = {}

dat.map(currPsa=>{
	const psa = currPsa[0]
	const elem1 = currPsa[2]
	const elem2 = currPsa[3]
	const fireSeasons = currPsa[4]
	const stations = currPsa[5]
	const thresholds = {
		[elem1]:{dry: currPsa[6], veryDry: currPsa[7]},
		[elem2]:{dry: currPsa[8], veryDry: currPsa[9]}
	}
	// console.log('currPsa', currPsa)
	makeSeasonObj(fireSeasons)
	// currPsa.map((currField, i) =>{
		// if(i == 0){
			metadatObj[psa] = 
			{
				stations,
				thresholds,
				parameters: [elem1, elem2],
				models: ['G', 'Y'],
				fireSeason: {startMonth:5, startDay:1, endMonth:7, endDay:31, custom: fireSeasons},
				climoYears:[2002, 2016]
			}
		// }
		// else{
			
		// }
	// })
})
// 0   1  2  3      4      5      6      7      8      9 
// PSA,P1,P2,P1-BP2,P1-BP3,P2-BP2,P2-BP3,month1,month2, rawAr
//

const metadatObjEA = {}

datEA.map(currPsa=>{
	const psa = currPsa[0]
	const elem1 = currPsa[1]
	const elem2 = currPsa[2]
	const thresholds = {
		[elem1]:{dry: currPsa[3], veryDry: currPsa[4]},
		[elem2]:{dry: currPsa[5], veryDry: currPsa[6]}
	}
	const startMonth = currPsa[7]
	const endMonth = currPsa[8]
	const endDay = getEndDay(endMonth)
	const stations = currPsa[9]
	// console.log('currPsa', currPsa)
	// makeSeasonObj(fireSeasons)
	// currPsa.map((currField, i) =>{
		// if(i == 0){
			metadatObjEA[psa] = 
			{
				stations,
				thresholds,
				parameters: [elem1, elem2],
				models: ['G', 'Y'],
				fireSeason: {startMonth, startDay:1, endMonth, endDay: endDay ? endDay : 30},
				climoYears:[2002, 2016]
			}
		// }
		// else{
			
		// }
	// })
})

console.log('metadatObj', JSON.stringify(metadatObjEA))

		// sw01:{
		// 	stations: [20207, 20212, 20213],
		// 	thresholds: {ERC: {dry: 45, veryDry: 70}, MinT:{dry: 40, veryDry: 50}},
		// 	parameters: ['ERC', 'MinT'],
		// 	models: ['G', 'Y'],
		// 	fireSeason:{startMonth:5, startDay:1, endMonth:7, endDay:31},
		// 	climoYears:[2002, 2016]
		// },

// dat.map(currPsa=>{
// 	console.log('currPsa', currPsa)
// 	currPsa.map((currField, i) =>{
// 		if(i == 0){
// 			metadatObj[currField] = 
// 			{
// 				stations: [],
// 				thresholds: {},
// 				parameters: [],
// 				models: ['G', 'Y'],
// 				fireSeason:{},
// 				climoYears:[2002, 2016]
// 			}
// 		}
// 		else{
			
// 		}
// 	})
// })


// {
// 	stations: null,
// 	thresholds: null,
// 	parameters: null,
// 	models: ['G', 'Y'],
// 	fireSeason:{null},
// 	climoYears:[2002, 2016]
// }