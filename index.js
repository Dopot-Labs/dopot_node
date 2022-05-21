const OrbitDB = require('orbit-db')
require('dotenv').config()
const all = require('it-all')
const CID = require('cids')
const Web3 = require('web3');
var BN = Web3.utils.BN;
const IPFS = require('ipfs-core');
const bs58 = require('bs58')
const providers = require('./config.json');
const provider = providers[Math.floor(Math.random()*providers.length)];
const network = 5;
const orbitFeed = "/orbitdb/zdpuAorFE8WDJ3n7Z6H8H7LxgXLPsMcxYF2xRKUEA6R6efy5e/node";
const web3 = new Web3(new Web3.providers.WebsocketProvider(provider));

const ProjectFactory = require("./contracts/ProjectFactory.json");
const deployedNetwork = ProjectFactory.networks[network];
const ProjectFactoryInstance = new web3.eth.Contract(ProjectFactory.abi, deployedNetwork.address);
const DopotReward = require("./contracts/DopotReward.json");
const deployedNetwork2 = DopotReward.networks[network];
const DopotRewardInstance = new web3.eth.Contract(DopotReward.abi, deployedNetwork2.address);

(async ()=>{
const ipfs = await IPFS.create();


function getMultihashFromBytes32(multihash) {
  var { digest, hashFunction, size } = multihash;
  if (size === 0) return null;
  const hashBytes = Buffer.from(digest.slice(2), 'hex');
  const multihashBytes = new (hashBytes.constructor)(2 + hashBytes.length);
  multihashBytes[0] = hashFunction;
  multihashBytes[1] = size;
  multihashBytes.set(hashBytes, 2);
  return bs58.encode(multihashBytes);
}

async function pin(hash){
  try{
    const pinset = await all(ipfs.pin.ls({ paths: hash }));
    if (pinset.length == 0) {
      ipfs.pin.add(hash);
      //console.log('Pinned hash', hash);
    }
  } catch(e){
    console.log('Hash already pinned', hash);
  }
}

let options = {
  filter: {value: []}, //fromBlock: 0
};

ProjectFactoryInstance.events.ProjectCreated(options)
.on('data', async event => {
  var values = event.returnValues;
  await pin(getMultihashFromBytes32(values.projectMedia));
  values.rewardTiers.forEach(async tier => await pin(getMultihashFromBytes32(tier)));  
  await pin(getMultihashFromBytes32(values.survey));
})
.on('changed', changed => console.log("changed: " + changed))
.on('error', err => console.dir(err))


ProjectFactoryInstance.events.FrontendUpdated(options)
.on('data', async event => {
  var values = event.returnValues;
  await pin(getMultihashFromBytes32(values.frontendHash));
})
.on('changed', changed => console.log("changed: " + changed))
.on('error', err => console.dir(err))


DopotRewardInstance.events.RewardMinted(options)
.on('data', async event => {
  var values = event.returnValues;
  var h = (await DopotRewardInstance.methods.uri(values.id).call()).substring(7);
  await pin(h);
})
.on('changed', changed => console.log("changed: " + changed))
.on('error', err => console.dir(err))
//.on('connected', str => console.log("connected: " + str))





})();
