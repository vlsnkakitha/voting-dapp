var path=require('path');
var Web3 = require('web3');
var web3 = new Web3(new Web3.providers.HttpProvider("http://127.0.0.1:8545"));
web3.eth.getAccounts().then(console.log);
var fs= require('fs');
var solc=require('solc');
var contractPath=path.resolve(__dirname,'contracts','Voting.sol');
var source=fs.readFileSync(contractPath,'UTF-8');
var compiledCode = solc.compile(source);
var abiDefinition = JSON.parse(compiledCode.contracts[':Voting'].interface)
var byteCode = compiledCode.contracts[':Voting'].bytecode;

/*(async () => {
  const accounts = await web3.eth.getAccounts();
  console.log(accounts);

  const balance = await web3.eth.getBalance(accounts[0]);
  console.log("balance", web3.utils.fromWei(balance, "ether"));
})();*/
//var votingContract = web3.eth.contract(abiDefinition);
//var ownerAccount = web3.eth.getAccounts(0).then(function(account){
//});
//console.log(ownerAccount);
//VotingContract.new(['Rama','Nick','Jose'],{data: byteCode, from: , gas: 4700000})