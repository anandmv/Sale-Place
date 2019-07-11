import SalePlace from "../contracts/SalePlace.json";
import getWeb3 from "./getWeb3";

class Web3Instance {
  constructor(){
    this.web3 = null;
    this.accounts = [];
    this.networkId = null;
    this.instances = {};
  }

  async setWeb3(_web3){
    this.web3 = _web3;
    await this.getAccounts();
    await this.getNetworkId();
  }

  async getAccounts(){
    this.accounts = await this.web3.eth.getAccounts();
  }

  async getNetworkId(){
    this.networkId = await this.web3.eth.net.getId();
  }

  getInstance(contract){
    return this.instances[contract] || false;
  }

  async setInstance(instance, key){
    const deployedNetwork = instance.networks[this.networkId];
    this.instances[key] = new this.web3.eth.Contract(
      instance.abi,
      deployedNetwork && deployedNetwork.address,
    );
  }
}


const web3Instance = new Web3Instance();

const getInstance = async () =>{
    try {
        const web3 = await getWeb3();
        if(!web3Instance.web3){
          await web3Instance.setWeb3(web3);
        }
        if(!web3Instance.getInstance('SalePlace')){
          await web3Instance.setInstance(SalePlace, 'SalePlace');
        }
        const instance = web3Instance.getInstance('SalePlace');
        const accounts = web3Instance.accounts;
        console.log(accounts, instance)
        return { accounts, instance }
      } catch (error) {
        console.error(error);
        throw error;
    }
}

export default getInstance;