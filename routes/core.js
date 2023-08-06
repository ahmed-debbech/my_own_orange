var express = require('express');
var router = express.Router();
const axios = require('axios');


router.get('/num/:n', async function(req, res, next) {
    console.log(req.params.n)

    try{
        let re = await axios.get('https://openid.orange.tn/oidc/authorize?scope=openid&response_type=code&client_id=nMelXvx1upwLvD1ewpGZunz7BnYiyy34&redirect_uri=https%3A//myorange.orange.tn/eden/v2/get&state=auth')
        console.log(re)
        let arr = re.data.split('\n')
        let transId = ""
        for(let i=0; i<=arr.length-1; i++){
            if(arr[i].includes('TransID')){
                transId = arr[i].split('"')[7]
            }
        }
        if(transId == ''){
            res.json('internal server error : 500')
            return
        }
        console.log(transId)
        axios.get('https://ssowt.orange.tn/WT/mobileconnect/async?TransID='+transId+'&wt-msisdn='+req.params.n)
        .catch(async (err)=>{
            let re2 = await axios.get('https://ssowt.orange.tn'+err.response.data.FallBack)
            let trx = re2.data.split('TransID')[2].split('"')[4];
            
            await axios.get('https://ssowt.orange.tn/WT/OTPConnect/OTPRequest/?TransID='+trx+'&wt-msisdn=216'+req.params.n)
            res.json({trans : trx})
        })
    }catch(error){
        res.json({error : "error"})
    }
    
});

router.get('/pin/:t/:p', async function(req, res, next) {
    let re1 = await axios.get('https://ssowt.orange.tn/WT/OTPConnect/status?TransID='+req.params.t+'&confirmationCode='+req.params.p)
    console.log(re1.headers['set-cookie'])
    const cookie = (re1.headers['set-cookie'])[0]

    Axios.request({
        url: "https://myorange.orange.tn/eden/v2/get?language=EN&subsection=account&subsection=balance",
        method: "get",
        headers:{
            Cookie: cookie
        } 
        
   }).then((res)=>{
        res.json({resp : res.data})
   })
});
module.exports = router;