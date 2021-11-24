const fs = require('fs')
const Papa = require('papaparse')
const jstat = require('jstat')
const percentRank = require('percentile-rank');

function roundToTwo(num) {
    return +(Math.round(num + "e+3")  + "e-3");
}

const configOrig = {
	swcc:{
		sw01:{
			stations: [20207, 20212, 20213],
			thresholds: {ERC: {dry: 45, veryDry: 70}, MinT:{dry: 40, veryDry: 50}},
			parameters: ['ERC', 'MinT'],
			models: ['G', 'Y'],
			fireSeason:{startMonth:5, startDay:1, endMonth:7, endDay:31},
			climoYears:[2002, 2016]
		},
		sw02:{
			stations: [20115,20501,20509],
			thresholds: {ERC: {dry: 65, veryDry: 75}, F100:{dry: 9, veryDry: 6}},
			parameters: ['ERC', 'F100'],
			models: ['G', 'Y'],
			fireSeason:{startMonth:4, startDay:1, endMonth:6, endDay:30},
			climoYears:[2002, 2016]
		},
		sw03:{
			stations: [45801],
			thresholds: {ERC: {dry: 70, veryDry: 90}, FM10:{dry: 6, veryDry: 3}},
			parameters: ['ERC', 'FM10'],
			models: ['G', 'Y'],
			fireSeason:{startMonth:3, startDay:1, endMonth:6, endDay:30},
			climoYears:[2002, 2016]
		},
		sw04:{
			stations: [20402, 290101, 290102],
			thresholds: {ERC: {dry: 50, veryDry: 70}, F100:{dry: 10, veryDry: 7}},
			parameters: ['ERC', 'F100'],
			models: ['G', 'Y'],
			fireSeason:{startMonth:5, startDay:1, endMonth:7, endDay:31},
			climoYears:[2002, 2016]
		},
		sw05:{
			stations: [20209, 20301, 20303],
			thresholds: {ERC: {dry: 55, veryDry: 70}, F100:{dry: 11, veryDry: 7}},
			parameters: ['ERC', 'F100'],
			models: ['G', 'Y'],
			fireSeason:{startMonth:5, startDay:1, endMonth:6, endDay:30},
			climoYears:[2002, 2016]
		}
	}
}

const config = {
	eacc:{
		"EA01": {
			"stations": [21001, 212201, 21005, 21001, 21001, 211604, 21003, 211502, 21007, 212601, null, null, null, null, null, null],
			"thresholds": {
				"ERC": {
					"dry": 30,
					"veryDry": 40
				},
				"F10": {
					"dry": 17,
					"veryDry": 11
				}
			},
			"parameters": ["ERC", "F10"],
			"models": ["G", "Y"],
			"fireSeason": {
				"startMonth": 3,
				"startDay": 1,
				"endMonth": 11,
				"endDay": 30
			},
			"climoYears": [2002, 2016]
		},
		"EA02": {
			"stations": [215601, 214001, 214201, 13610, 132207, 213501, null, null, null, null, null, null, null, null, null, null],
			"thresholds": {
				"ERC": {
					"dry": 29,
					"veryDry": 38
				},
				"F10": {
					"dry": 16,
					"veryDry": 11
				}
			},
			"parameters": ["ERC", "F10"],
			"models": ["G", "Y"],
			"fireSeason": {
				"startMonth": 3,
				"startDay": 1,
				"endMonth": 11,
				"endDay": 30
			},
			"climoYears": [2002, 2016]
		},
		"EA03": {
			"stations": [21014, 214201, 213301, 21310, 211702, 21002, 21009, 211803, 21012, 21003, 21009, null, null, null, null, null],
			"thresholds": {
				"ERC": {
					"dry": 28,
					"veryDry": 38
				},
				"F10": {
					"dry": 17,
					"veryDry": 12
				}
			},
			"parameters": ["ERC", "F10"],
			"models": ["G", "Y"],
			"fireSeason": {
				"startMonth": 3,
				"startDay": 1,
				"endMonth": 11,
				"endDay": 30
			},
			"climoYears": [2002, 2016]
		},
		"EA04": {
			"stations": [47110, 20010, 470202, 470207, 470302, 47102, 470703, 471601, 471901, 472801, 471801, 470804, null, null, null, null],
			"thresholds": {
				"ERC": {
					"dry": 27,
					"veryDry": 38
				},
				"F10": {
					"dry": 16,
					"veryDry": 11
				}
			},
			"parameters": ["ERC", "F10"],
			"models": ["G", "Y"],
			"fireSeason": {
				"startMonth": 3,
				"startDay": 1,
				"endMonth": 11,
				"endDay": 30
			},
			"climoYears": [2002, 2016]
		},
		"EA05": {
			"stations": [476001, 475701, 215601, 474301, 473901, 475601, 214201, 473501, null, null, null, null, null, null, null, null],
			"thresholds": {
				"ERC": {
					"dry": 29,
					"veryDry": 38
				},
				"F10": {
					"dry": 17,
					"veryDry": 12
				}
			},
			"parameters": ["ERC", "F10"],
			"models": ["G", "Y"],
			"fireSeason": {
				"startMonth": 3,
				"startDay": 1,
				"endMonth": 11,
				"endDay": 30
			},
			"climoYears": [2002, 2016]
		},
		"EA06": {
			"stations": [201202, 20110, 200703, 20102, 471301, 201504, null, null, null, null, null, null, null, null, null, null],
			"thresholds": {
				"ERC": {
					"dry": 30,
					"veryDry": 39
				},
				"F10": {
					"dry": 17,
					"veryDry": 12
				}
			},
			"parameters": ["ERC", "F10"],
			"models": ["G", "Y"],
			"fireSeason": {
				"startMonth": 3,
				"startDay": 1,
				"endMonth": 11,
				"endDay": 30
			},
			"climoYears": [2002, 2016]
		},
		"EA07": {
			"stations": [203802, 202902, 202010, 20310, 203601, null, null, null, null, null, null, null, null, null, null, null],
			"thresholds": {
				"ERC": {
					"dry": 30,
					"veryDry": 39
				},
				"F10": {
					"dry": 17,
					"veryDry": 12
				}
			},
			"parameters": ["ERC", "F10"],
			"models": ["G", "Y"],
			"fireSeason": {
				"startMonth": 3,
				"startDay": 1,
				"endMonth": 11,
				"endDay": 30
			},
			"climoYears": [2002, 2016]
		},
		"EA08": {
			"stations": [120201, 112001, 203802, null, null, null, null, null, null, null, null, null, null, null, null, null],
			"thresholds": {
				"ERC": {
					"dry": 29,
					"veryDry": 39
				},
				"F10": {
					"dry": 17,
					"veryDry": 11
				}
			},
			"parameters": ["ERC", "F10"],
			"models": ["G", "Y"],
			"fireSeason": {
				"startMonth": 3,
				"startDay": 1,
				"endMonth": 11,
				"endDay": 30
			},
			"climoYears": [2002, 2016]
		},
		"EA09": {
			"stations": [232401, 231501, 13610, 231301, 132207, 135501, null, null, null, null, null, null, null, null, null, null],
			"thresholds": {
				"ERC": {
					"dry": 29,
					"veryDry": 38
				},
				"F10": {
					"dry": 17,
					"veryDry": 12
				}
			},
			"parameters": ["ERC", "F10"],
			"models": ["G", "Y"],
			"fireSeason": {
				"startMonth": 3,
				"startDay": 1,
				"endMonth": 11,
				"endDay": 30
			},
			"climoYears": [2002, 2016]
		},
		"EA10": {
			"stations": [475701, 112001, 476001, null, null, null, null, null, null, null, null, null, null, null, null, null],
			"thresholds": {
				"ERC": {
					"dry": 30,
					"veryDry": 39
				},
				"F10": {
					"dry": 17,
					"veryDry": 12
				}
			},
			"parameters": ["ERC", "F10"],
			"models": ["G", "Y"],
			"fireSeason": {
				"startMonth": 3,
				"startDay": 1,
				"endMonth": 11,
				"endDay": 30
			},
			"climoYears": [2002, 2016]
		},
		"EA11": {
			"stations": [120201, 112001, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
			"thresholds": {
				"ERC": {
					"dry": 30,
					"veryDry": 39
				},
				"F10": {
					"dry": 17,
					"veryDry": 12
				}
			},
			"parameters": ["ERC", "F10"],
			"models": ["G", "Y"],
			"fireSeason": {
				"startMonth": 3,
				"startDay": 1,
				"endMonth": 11,
				"endDay": 30
			},
			"climoYears": [2002, 2016]
		},
		"EA12": {
			"stations": [235202, 236902, 238502, null, null, null, null, null, null, null, null, null, null, null, null, null],
			"thresholds": {
				"ERC": {
					"dry": 29,
					"veryDry": 40
				},
				"F10": {
					"dry": 17,
					"veryDry": 12
				}
			},
			"parameters": ["ERC", "F10"],
			"models": ["G", "Y"],
			"fireSeason": {
				"startMonth": 3,
				"startDay": 1,
				"endMonth": 11,
				"endDay": 30
			},
			"climoYears": [2002, 2016]
		},
		"EA13": {
			"stations": [236501, 23910, 239004, 236403, 236601, null, null, null, null, null, null, null, null, null, null, null],
			"thresholds": {
				"ERC": {
					"dry": 30,
					"veryDry": 40
				},
				"F10": {
					"dry": 17,
					"veryDry": 12
				}
			},
			"parameters": ["ERC", "F10"],
			"models": ["G", "Y"],
			"fireSeason": {
				"startMonth": 3,
				"startDay": 1,
				"endMonth": 11,
				"endDay": 30
			},
			"climoYears": [2002, 2016]
		},
		"EA14": {
			"stations": [119501, 128905, 125701, 127301, 125201, 234801, 127901, null, null, null, null, null, null, null, null, null],
			"thresholds": {
				"ERC": {
					"dry": 29,
					"veryDry": 38
				},
				"F10": {
					"dry": 17,
					"veryDry": 12
				}
			},
			"parameters": ["ERC", "F10"],
			"models": ["G", "Y"],
			"fireSeason": {
				"startMonth": 3,
				"startDay": 1,
				"endMonth": 11,
				"endDay": 30
			},
			"climoYears": [2002, 2016]
		},
		"EA15": {
			"stations": [337301, 360901, 336001, null, null, null, null, null, null, null, null, null, null, null, null, null],
			"thresholds": {
				"ERC": {
					"dry": 29,
					"veryDry": 39
				},
				"F10": {
					"dry": 17,
					"veryDry": 12
				}
			},
			"parameters": ["ERC", "F10"],
			"models": ["G", "Y"],
			"fireSeason": {
				"startMonth": 3,
				"startDay": 1,
				"endMonth": 11,
				"endDay": 30
			},
			"climoYears": [2002, 2016]
		},
		"EA16": {
			"stations": [338401, 464601, 460901, 46010, 463001, 463301, 463802, 336001, 337301, null, null, null, null, null, null, null],
			"thresholds": {
				"ERC": {
					"dry": 29,
					"veryDry": 39
				},
				"F10": {
					"dry": 17,
					"veryDry": 12
				}
			},
			"parameters": ["ERC", "F10"],
			"models": ["G", "Y"],
			"fireSeason": {
				"startMonth": 3,
				"startDay": 1,
				"endMonth": 11,
				"endDay": 30
			},
			"climoYears": [2002, 2016]
		},
		"EA17": {
			"stations": [461601, 464203, 465201, 464901, 465401, 463501, 462601, 360991, 46110, null, null, null, null, null, null, null],
			"thresholds": {
				"ERC": {
					"dry": 29,
					"veryDry": 39
				},
				"F10": {
					"dry": 17,
					"veryDry": 12
				}
			},
			"parameters": ["ERC", "F10"],
			"models": ["G", "Y"],
			"fireSeason": {
				"startMonth": 3,
				"startDay": 1,
				"endMonth": 11,
				"endDay": 30
			},
			"climoYears": [2002, 2016]
		},
		"EA18": {
			"stations": [30101, 361231, 360331, 360351, 361171, 360901, 36102, 361802, 30110, 300171, null, null, null, null, null, null],
			"thresholds": {
				"ERC": {
					"dry": 29,
					"veryDry": 39
				},
				"F10": {
					"dry": 17,
					"veryDry": 12
				}
			},
			"parameters": ["ERC", "F10"],
			"models": ["G", "Y"],
			"fireSeason": {
				"startMonth": 3,
				"startDay": 1,
				"endMonth": 11,
				"endDay": 30
			},
			"climoYears": [2002, 2016]
		},
		"EA19": {
			"stations": [300171, 300411, 361291, 360991, 30101, 360131, 361171, 360351, 360431, 360271, 301111, 36101, null, null, null, null],
			"thresholds": {
				"ERC": {
					"dry": 29,
					"veryDry": 39
				},
				"F10": {
					"dry": 17,
					"veryDry": 12
				}
			},
			"parameters": ["ERC", "F10"],
			"models": ["G", "Y"],
			"fireSeason": {
				"startMonth": 3,
				"startDay": 1,
				"endMonth": 11,
				"endDay": 30
			},
			"climoYears": [2002, 2016]
		},
		"EA20": {
			"stations": [300312, 300491, 300191, 300411, 300892, 300311, 300891, null, null, null, null, null, null, null, null, null],
			"thresholds": {
				"ERC": {
					"dry": 29,
					"veryDry": 38
				},
				"F10": {
					"dry": 17,
					"veryDry": 12
				}
			},
			"parameters": ["ERC", "F10"],
			"models": ["G", "Y"],
			"fireSeason": {
				"startMonth": 3,
				"startDay": 1,
				"endMonth": 11,
				"endDay": 30
			},
			"climoYears": [2002, 2016]
		},
		"EA21": {
			"stations": [430501, 430601, 270301, 430402, 301901, 270071, 431301, null, null, null, null, null, null, null, null, null],
			"thresholds": {
				"ERC": {
					"dry": 28,
					"veryDry": 38
				},
				"F10": {
					"dry": 17,
					"veryDry": 12
				}
			},
			"parameters": ["ERC", "F10"],
			"models": ["G", "Y"],
			"fireSeason": {
				"startMonth": 3,
				"startDay": 1,
				"endMonth": 11,
				"endDay": 30
			},
			"climoYears": [2002, 2016]
		},
		"EA22": {
			"stations": [170131, 170850, 270131, 171603, 170791, 170800, null, null, null, null, null, null, null, null, null, null],
			"thresholds": {
				"ERC": {
					"dry": 28,
					"veryDry": 39
				},
				"F10": {
					"dry": 17,
					"veryDry": 12
				}
			},
			"parameters": ["ERC", "F10"],
			"models": ["G", "Y"],
			"fireSeason": {
				"startMonth": 3,
				"startDay": 1,
				"endMonth": 11,
				"endDay": 30
			},
			"climoYears": [2002, 2016]
		},
		"EA23": {
			"stations": [305803, 280372, 361802, 191202, 30510, 300712, 191203, 370450, null, null, null, null, null, null, null, null],
			"thresholds": {
				"ERC": {
					"dry": 29,
					"veryDry": 38
				},
				"F10": {
					"dry": 17,
					"veryDry": 12
				}
			},
			"parameters": ["ERC", "F10"],
			"models": ["G", "Y"],
			"fireSeason": {
				"startMonth": 3,
				"startDay": 1,
				"endMonth": 11,
				"endDay": 30
			},
			"climoYears": [2002, 2016]
		},
		"EA24": {
			"stations": [280071, 182201, 280311, 18210, 180701, 180201, 28010, 280291, 280231, 280191, 280091, 280051, 182002, 281501, 70301, 181510],
			"thresholds": {
				"ERC": {
					"dry": 29,
					"veryDry": 39
				},
				"F10": {
					"dry": 17,
					"veryDry": 12
				}
			},
			"parameters": ["ERC", "F10"],
			"models": ["G", "Y"],
			"fireSeason": {
				"startMonth": 3,
				"startDay": 1,
				"endMonth": 11,
				"endDay": 30
			},
			"climoYears": [2002, 2016]
		}
	},
	swcc:{
		"SW01": {
			"stations": [20207, 20212, 20213],
			"thresholds": {
				"ERC": {
					"dry": 45,
					"veryDry": 70
				},
				"MinT": {
					"dry": 40,
					"veryDry": 50
				}
			},
			"parameters": ["ERC", "MinT"],
			"models": ["G", "Y"],
			"fireSeason": {
				"startMonth": 5,
				"startDay": 1,
				"endMonth": 7,
				"endDay": 31,
			},
			"climoYears": [2002, 2016]
		},
		"SW02": {
			"stations": [20115, 20501, 20509],
			"thresholds": {
				"ERC": {
					"dry": 65,
					"veryDry": 75
				},
				"F100": {
					"dry": 9,
					"veryDry": 6
				}
			},
			"parameters": ["ERC", "F100"],
			"models": ["G", "Y"],
			"fireSeason": {
				"startMonth": 4,
				"startDay": 1,
				"endMonth": 6,
				"endDay": 30,
			},
			"climoYears": [2002, 2016]
		},
		"SW03": {
			"stations": [45801],
			"thresholds": {
				"ERC": {
					"dry": 70,
					"veryDry": 90
				},
				"FM10": {
					"dry": 6,
					"veryDry": 3
				}
			},
			"parameters": ["ERC", "FM10"],
			"models": ["G", "Y"],
			"fireSeason": {
				"startMonth": 3,
				"startDay": 1,
				"endMonth": 6,
				"endDay": 30,
			},
			"climoYears": [2002, 2016]
		},
		"SW04": {
			"stations": [20402, 290101, 290102],
			"thresholds": {
				"ERC": {
					"dry": 50,
					"veryDry": 70
				},
				"F100": {
					"dry": 10,
					"veryDry": 7
				}
			},
			"parameters": ["ERC", "F100"],
			"models": ["G", "Y"],
			"fireSeason": {
				"startMonth": 5,
				"startDay": 1,
				"endMonth": 7,
				"endDay": 31,
			},
			"climoYears": [2002, 2016]
		},
		"SW05": {
			"stations": [20209, 20301, 20303],
			"thresholds": {
				"ERC": {
					"dry": 55,
					"veryDry": 70
				},
				"F100": {
					"dry": 11,
					"veryDry": 7
				}
			},
			"parameters": ["ERC", "F100"],
			"models": ["G", "Y"],
			"fireSeason": {
				"startMonth": 5,
				"startDay": 1,
				"endMonth": 6,
				"endDay": 30,
			},
			"climoYears": [2002, 2016]
		},
		"SW06N": {
			"stations": [20601, 20604],
			"thresholds": {
				"ERC": {
					"dry": 70,
					"veryDry": 85
				},
				"MinT": {
					"dry": 50,
					"veryDry": 60
				}
			},
			"parameters": ["ERC", "MinT"],
			"models": ["G", "Y"],
			"fireSeason": {
				"startMonth": 4,
				"startDay": 1,
				"endMonth": 7,
				"endDay": 31,
			},
			"climoYears": [2002, 2016]
		},
		"SW06S": {
			"stations": [21005, 21007, 21202, 21206],
			"thresholds": {
				"ERC": {
					"dry": 55,
					"veryDry": 70
				},
				"F100": {
					"dry": 9,
					"veryDry": 6
				}
			},
			"parameters": ["ERC", "F100"],
			"models": ["G", "Y"],
			"fireSeason": {
				"startMonth": 4,
				"startDay": 1,
				"endMonth": 6,
				"endDay": 30,
			},
			"climoYears": [2002, 2016]
		},
		"SW07": {
			"stations": [290702, 200801, 291302],
			"thresholds": {
				"ERC": {
					"dry": 50,
					"veryDry": 70
				},
				"F100": {
					"dry": 10,
					"veryDry": 7
				}
			},
			"parameters": ["ERC", "F100"],
			"models": ["G", "Y"],
			"fireSeason": {
				"startMonth": 5,
				"startDay": 1,
				"endMonth": 7,
				"endDay": 31,
			},
			"climoYears": [2002, 2016]
		},
		"SW08": {
			"stations": [20401, 292001, 292008, 292009],
			"thresholds": {
				"ERC": {
					"dry": 60,
					"veryDry": 80
				},
				"F100": {
					"dry": 10,
					"veryDry": 7
				}
			},
			"parameters": ["ERC", "F100"],
			"models": ["G", "Y"],
			"fireSeason": {
				"startMonth": 5,
				"startDay": 1,
				"endMonth": 6,
				"endDay": 30,
			},
			"climoYears": [2002, 2016]
		},
		"SW09": {
			"stations": [292103, 292702, 292903],
			"thresholds": {
				"ERC": {
					"dry": 60,
					"veryDry": 80
				},
				"F100": {
					"dry": 9,
					"veryDry": 6
				}
			},
			"parameters": ["ERC", "F100"],
			"models": ["G", "Y"],
			"fireSeason": {
				"startMonth": 4,
				"startDay": 1,
				"endMonth": 6,
				"endDay": 30,
			},
			"climoYears": [2002, 2016]
		},
		"SW10": {
			"stations": [290210, 291202],
			"thresholds": {
				"ERC": {
					"dry": 50,
					"veryDry": 65
				},
				"F100": {
					"dry": 10,
					"veryDry": 8
				}
			},
			"parameters": ["ERC", "F100"],
			"models": ["G", "Y"],
			"fireSeason": {
				"startMonth": 5,
				"startDay": 1,
				"endMonth": 7,
				"endDay": 31,
			},
			"climoYears": [2002, 2016]
		},
		"SW11": {
			"stations": [291501, 292102],
			"thresholds": {
				"ERC": {
					"dry": 55,
					"veryDry": 80
				},
				"F100": {
					"dry": 9,
					"veryDry": 6
				}
			},
			"parameters": ["ERC", "F100"],
			"models": ["G", "Y"],
			"fireSeason": {
				"startMonth": 4,
				"startDay": 1,
				"endMonth": 6,
				"endDay": 30,
			},
			"climoYears": [2002, 2016]
		},
		"SW12": {
			"stations": [292203, 293002, 293003],
			"thresholds": {
				"ERC": {
					"dry": 40,
					"veryDry": 60
				},
				"F100": {
					"dry": 12,
					"veryDry": 8
				}
			},
			"parameters": ["ERC", "F100"],
			"models": ["G", "Y"],
			"fireSeason": {
				"startMonth": 4,
				"startDay": 1,
				"endMonth": 6,
				"endDay": 30,
			},
			"climoYears": [2002, 2016]
		},
		"SW13": {
			"stations": [418701, 292301],
			"thresholds": {
				"ERC": {
					"dry": 40,
					"veryDry": 55
				},
				"FM10": {
					"dry": 8,
					"veryDry": 6
				}
			},
			"parameters": ["ERC", "FM10"],
			"models": ["G", "Y"],
			"fireSeason": {
				"startMonth": 2,
				"startDay": 1,
				"endMonth": 6,
				"endDay": 30,
			},
			"climoYears": [2002, 2016]
		},
		"SW14N": {
			"stations": [292301, 293101, 293104],
			"thresholds": {
				"ERC": {
					"dry": 40,
					"veryDry": 55
				},
				"FM10": {
					"dry": 8,
					"veryDry": 5
				}
			},
			"parameters": ["ERC", "FM10"],
			"models": ["G", "Y"],
			"fireSeason": {
				"startMonth": 2,
				"startDay": 1,
				"endMonth": 6,
				"endDay": 30,
			},
			"climoYears": [2002, 2016]
		},
		"SW14S": {
			"stations": [417201, 417401, 417403],
			"thresholds": {
				"ERC": {
					"dry": 65,
					"veryDry": 80
				},
				"F100": {
					"dry": 9,
					"veryDry": 6
				}
			},
			"parameters": ["ERC", "F100"],
			"models": ["G", "Y"],
			"fireSeason": {
				"startMonth": 2,
				"startDay": 1,
				"endMonth": 6,
				"endDay": 30,
			},
			"climoYears": [2002, 2016]
		}
	}
}
// C:\Users\BLMUser\code\7dayData\thresholdCrosswalk\stnData\allGACCFormat
const csvToJson = async(model, fileName, station, psa, gacc)=>{
	try{
		const data = await fs.readFileSync(`./stnData/allGACCFormat/${fileName}`,{encoding:'utf8'})
		console.log('model', model, 'fileName', fileName)
		console.log('getting this', `./stnData/allGACCFormat/${fileName}`)
		const parsed = await Papa.parse(data,{header:true}).data
		// console.log('parsed', parsed)
		return parsed
	}
	catch(e){
		// console.log('file read error', e)
		console.log('file read error')
		const errorText = `\n PSA ${psa}: no data for ${station} fuel model ${model}`
		await fs.appendFileSync(`./stnData/errorLog${gacc}.txt`, errorText)
		return {error: JSON.stringify(e)}
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
	return returnObj
}

const checkInDateRange = (obDateAr, {startMonth, startDay, endMonth, endDay}, climoYears) => {
	const obMonth = obDateAr[0]
	const obDay = obDateAr[1]
	const obYear = obDateAr[2]
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


const stnClimo = async(fuelModel, file1, element1, element2, climoDateObj, climoYears, station, psa, gacc)=>{
	const fuelModelData = await csvToJson(fuelModel, file1, station, psa, gacc)
	if(fuelModelData.error){
		return null
	}
	else{

		const dataObj = makeStnObj(fuelModelData)
		const modelClimo = {[element1]:[], [element2]: []}
		for(var obObj in dataObj){
			const obDateAr = obObj.split('/')
			const inRange = checkInDateRange(obDateAr, {...climoDateObj}, climoYears)
			const element1Val = dataObj[obObj][element1]
			// console.log('element1Val', element1Val, Number.isFinite(parseFloat(element1Val)))
			const element2Val = dataObj[obObj][element2]
			if(inRange){
				modelClimo[element1].push(parseFloat(element1Val))
				modelClimo[element2].push(parseFloat(element2Val))
			}
		}
		return{...modelClimo}
	}
}

const doStats = (legacyBreakPointObj, element1Model1Data, element2Model1Data, element1, element2, model2Data)=>{
	const element1DryValue = legacyBreakPointObj[element1]['dry']
	const element1VeryDryValue = legacyBreakPointObj[element1]['veryDry']

	const element2DryValue = legacyBreakPointObj[element2]['dry']
	const element2VeryDryValue = legacyBreakPointObj[element2]['veryDry']



	const element1DryPercentile = jstat.percentileOfScore(element1Model1Data, element1DryValue)
	const element1VeryDryPercentile = jstat.percentileOfScore(element1Model1Data, element1VeryDryValue)

	const element2DryPercentile = jstat.percentileOfScore(element2Model1Data, element2DryValue)
	const element2VeryDryPercentile = jstat.percentileOfScore(element2Model1Data, element2VeryDryValue)

	const element1Crosswalk = jstat.quantiles(model2Data[element1].sort(),[element1DryPercentile, element1VeryDryPercentile])
	const element2Crosswalk = jstat.quantiles(model2Data[element2].sort(),[element2DryPercentile, element2VeryDryPercentile])

	// const realityCheck = jstat.quantiles(model2Data[element1].sort(),[0.14,0.5,0.9, 0.97])
	// const realityCheckG = jstat.quantiles(element1Model1Data.sort(),[0.14, 0.5,0.9, 0.97])
	// const realityCheck1 = jstat.quantiles(testData,[0.5,0.9, 0.97])
	// const percentRankVal = percentRank(model2Data[element1].sort(),80)
	// console.log('model2Data', model2Data.ERC.length)
	// console.log('ralitycheckY', element1, '50th', realityCheck[0])
	// console.log('percentiel of schore reality check',  jstat.percentileOfScore(model2Data[element1].sort(), 47.1), 'should be 50th percentile')
	// console.log('ralitycheckY', element1, '90th', realityCheck[1], '(should be 74)')
	// console.log('ralitycheckY', element1, '97th', realityCheck[2], '(should be 86)')
	// console.log('ralitycheck1Y', element1, '97th', realityCheck1[2], '(should be 86)')

	// 	console.log('ralitycheckG', element1, '50th', realityCheckG[0])
	// console.log('ralitycheckG', element1, '90th', realityCheckG[1], '(should be 74)')
	// console.log('ralitycheckG', element1, '97th', realityCheckG[2], '(should be 86)')

	return(
		{
			legacyBreakPointObj,
			element1DryPercentile,
			element1VeryDryPercentile,
			element2DryPercentile,
			element2VeryDryPercentile,
			element1Crosswalk,
			element2Crosswalk,
		}
	)
}

const psaFn = async(psaConfig, psa, gacc) =>{
	console.log(psaConfig)
	const {
		stations: psaStnAr,
		parameters: elementAr, 
		// parameters, 
		// models: modelAr, 
		models, 
		thresholds: legacyBreakPointObj, 
		fireSeason: fireSeasonInfo, 
		climoYears
	} = psaConfig
	// console.log('stations#######################', psaStnAr)
	const element1 = elementAr[0]
	const element2 = elementAr[1]

	// const model1 = modelAr[0]
	// const model2 = modelAr[1]

	const model1 = models[0]
	const model2 = models[1]

	const model1Data = {[element1]:[], [element2]:[]}
	const model2Data = {[element1]:[], [element2]:[]}

	for await (var stn of psaStnAr){
		// console.log('stn', stn, 'model1', model1)
		// 239204_daily_listing_G
		const stnClimoModel1 = await stnClimo(model1, `${stn}_daily_listing_${model1}.csv`, element1, element2, fireSeasonInfo, climoYears, stn, psa, gacc)
		const stnClimoModel2 = await stnClimo(model2, `${stn}_daily_listing_${model2}.csv`, element1, element2, fireSeasonInfo, climoYears, stn, psa, gacc)
		// const stnClimoModel2 = await stnClimo(model2,  `${stn}.csv`, element1, element2, fireSeasonInfo, climoYears, stn, psa, gacc)

		// console.log('s',stnClimoModel2)
		if(stnClimoModel1 && stnClimoModel2){
			model1Data[element1].push(...stnClimoModel1[element1])
			model1Data[element2].push(...stnClimoModel1[element2])
			model2Data[element1].push(...stnClimoModel2[element1])
			model2Data[element2].push(...stnClimoModel2[element2])
		}
		else{

			console.log('no data ')
		}
	}

	

	const element1Model1Data = model1Data && model1Data[element1] ? model1Data[element1].sort() : null
	const element2Model1Data = model1Data && model1Data[element2] ? model1Data[element2].sort() : null

	// console.log('element1Model1Data && element2Model1Data', element1Model1Data , element2Model1Data)

	if(element1Model1Data.length>0 && element2Model1Data.length>0){

		const statInfo = doStats(legacyBreakPointObj, element1Model1Data, element2Model1Data, element1, element2, model2Data)
		// console.log('statInfo', statInfo)
		const returnObj = {
			stations: psaStnAr,
			parameters: elementAr ? elementAr : null,
			originalBreakpoints: statInfo.legacyBreakPointObj,
			percentiles:{
			[`${element1}BP1`]: roundToTwo(statInfo.element1DryPercentile),
				[`${element1}BP2`]: roundToTwo(statInfo.element1VeryDryPercentile),
				[`${element2}BP1`]: roundToTwo(statInfo.element2DryPercentile),
				[`${element2}BP2`]:roundToTwo(statInfo. element2VeryDryPercentile),
			},
			newBreakpoints:{
				[element1]: {dry: Math.round(statInfo.element1Crosswalk[0]), veryDry: Math.round(statInfo.element1Crosswalk[1])}, 
				[element2]: {dry: Math.round(statInfo.element2Crosswalk[0]), veryDry: Math.round(statInfo.element2Crosswalk[1])}
			}
		}
		await fs.writeFileSync(`./stnData/crosswalk-${gacc}-${psa}.txt`, JSON.stringify(returnObj))
		return returnObj
	}
	else{
		console.log('no data')
		return null
	}


	

	



	// console.log('elem 1 orig dry and ver dry vals', element1DryValue, element1VeryDryValue)
	// console.log('elem 1 orig dry percentile very dry perceintel', element1DryPercentile, element1VeryDryPercentile)
	// console.log('element 1 crosswalk', element1Crosswalk)

	// console.log('elemt 2 orig dry very dry', element2DryValue, element2VeryDryValue)
	// console.log('elemnt2 dry very dry percentile', element2DryPercentile, element2VeryDryPercentile)
	// console.log('element 2 croswawlk', element2Crosswalk)
}




const anotherFn = async(psaAsr) =>{
	const psaObj = {}
	// const gacc = 'swcc'
	const gacc = 'eacc'
	// const psa = 'sw02'
	const psaAr = Object.keys(config[gacc])
	console.log('psaAr', psaAr)
	const errorText = ``
	await fs.writeFileSync(`./stnData/errorLog${gacc}.txt`, errorText)
	// psaFn(config[gacc][psa]['stations'],config[gacc][psa]['parameters'], config[gacc][psa]['models'], config[gacc][psa]['thresholds'], config[gacc][psa]['fireSeason'],)
	for await (var psa of psaAr){
		const psaInfo = await psaFn(config[gacc][psa], psa, gacc)
		// console.log('psaInfo', psaInfo)
		psaObj[psa] = psaInfo
	}

	console.log('asdfasdfasdf', JSON.stringify(psaObj))
	
}

anotherFn()

// parameter choices:
  // ERC	   BI	 FM10	 F100	 KBDI	 MnRH	 MxRH	 MinT	 MaxT	  GSI	 Wind	SFlag	 VPDA	 VPDM	 SolR	 Rain	 RnDr
