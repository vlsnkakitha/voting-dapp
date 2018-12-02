var request = require('request');
var async = require('async');
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var Web3 = require('web3');
const path= require('path');
var contractABI = require("./VotingABI.json");
const contractAddress = "0x4407b0bb69a60bbf1b4370b3c20dce92423bc0e7";
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
const PORT = process.env.port||3000;

var candidateNames=[];
var votingComplete;

//as we are connecting to rinkebynetwork through infura. we need to configure infura as web3 provider

// web3 = new Web3(new Web3.providers.HttpProvider
//     ("http://127.0.0.1:8545"));

//configure web3 provider
const web3 = new Web3(Web3.givenProvider || "ws://127.0.0.1:8545");

//("https://rinkeby.infura.io/v3/ab666575da624da99894838a8d1a1fd0"));
//Contract intialization with ABI & contract address 
//which we got during compilation and deployment to rinkeby network
const contract = new web3.eth.Contract(contractABI,contractAddress);
var ownerAddress;


//configure port
app.listen(PORT,function(){
    console.log("server started at port ",PORT);
});

//to configure static files path
app.use(express.static('public'))


//to Enable CORS
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

//configure socket io server
// const server = require('http').createServer(app);
// const io = require('socket.io')(server);

// //once every client connected, send the voting status in response
// io.on('connection',function(socket){
//     console.log('client connected');
//     socket.emit('votingStatus',{"isComplete":votingComplete});
// });

//send index.html is root request
app.get("/fetchContractParameters",function(request,response){
    //calls the owner address of contract
    contract.methods.owner().call(function(err,details){
        ownerAddress = details;
    });

    //call to know whether voting is complete or not
    contract.methods.votingComplete().call(function(err,details){
        votingComplete = details;
    });
    console.log(votingComplete);
    console.log(ownerAddress);
    response.json({"owner":ownerAddress,"isVotingComplete":votingComplete});
});
app.get("/",function(request,response){
    console.log("ONWER"+ownerAddress);
    //response.sendFile(path.join(__dirname+"/public","main.html"),{"ownerAddress":ownerAddress,"isVotingCompleted":votingComplete);
    response.sendFile(path.join(__dirname+"/public","main.html"));
    //const html = fs.readFileSync( __dirname + '/public/111index.html' );
    //response.json({html: html.toString(), "owner": ownerAddress,kk"isVotingComplete":votingComplete});
});

//API to fetch the candidates list which was loaded during 
//contract deployment on ethereum blockchain 
app.get("/candidates",function(request,response){
    console.log("Fetch Candidates list");
    candidateNames=[];
    contract.methods.getAllCandidates().call((err, candidateDetails) => {
        if(err){
            console.log(err);
        }
        console.log(candidateDetails);
        
        for(i = 0 ; i < candidateDetails.length ; i++){
            candidateNames.push(web3.utils.toUtf8(candidateDetails[i]));
        }
        response.json({"candidates":candidateNames,"isCompleted":votingComplete,"ownerAddress":ownerAddress});
    });
});

app.post("/vote",function(request,responseObject){
    
    
    var voterAccount = request.body['voterId']//"0x98d908256dA625028E6a0791f34F8bBF4605Dc36";//request.body.account;
    var voteFor = request.body['selectedCandidateName']//web3.utils.fromUtf8("Devarsh"); //request.body.selectedCandidate;
    console.log(voterAccount);
    console.log(voteFor);
    // web3.eth.defaultAccount = voterAccount;

    contract.methods.voteForCandidate(web3.utils.fromUtf8(voteFor)).
    send({from:voterAccount},function(err,response){
        console.log("11111111"+response); 
        console.log("222222222"+err);        
        responseObject.send({"txId":response});
    });

});


app.get('/completeVoting',function(request,responseObject){
    console.log("In Complete Voting request");
    var senderAddress = "0x5e93e69b2abd6b23c0c49f7db80185c1d096582e";//request.body['voterId']
    contract.methods.closeElection().call((err,response)=>{
        console.log("Response from blockchain "+response);
        votingComplete = response;
        responseObject.send({"txId":response,"isComplete":votingComplete});
    });
});

app.get('/getResults',function(request,response){

    var candidateName=request.query.cname;//"Satya";
    console.log(candidateName);
    contract.methods.totalVotesFor(web3.utils.fromUtf8(candidateName)).call((err,details)=>{
        console.log("RESPONSE IN GET RESULTS"+details);
        response.send({"votesCount":details});
    });
});


/*contract.events.voteEvent ({
  fromBlock: 'latest',
  toBlock: 'latest'
}, function(error, result) {
  if (!error) {
    console.log("RESULT"+JSON.stringify(result));
    
  } else {
    console.log("ERROR"+error);
  }
});*/