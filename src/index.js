exports.handler = async (event, context, callback) => {
  // let index = event.iterator.index
  // let count = event.iterator.count
  // let requestModel = event.iterator.model
  // console.log('requestModel', requestModel)
 
  
  const convertThresholds = require('./convertGtoY.js')

  const response = {
    statusCode:null,
    error:null
  }
  try{
    const startTime = new Date().getTime()
    // const res = await makeText('ALL_GB')
    const resObj = {}
    // for await(gacc of gaccArray){
      // const res = await makeText(gbStnsFrom7DayGuys, 'gbcc')
      // console.log('doing gacc fuel model g', gacc)
      const res = await convertThresholds()


    // }
    const finishTime = new Date().getTime()
    const lapsedTime = startTime - finishTime
    // console.log('startTime', startTime, 'endTime', finishTime, 'lapsed', lapsedTime)
    response.statusCode = 200
    response.res = JSON.stringify(response)
  }
  catch(e){
    console.log('error', e)
    response.statusCode = 500
    response.error = e
  }
  finally{
   //  callback(null, {
	  //   // index,
	  //   // count,
	  //   // model: nextModel,
	  //   // continue: index <= count
	  // })
	  return response
  }

};
