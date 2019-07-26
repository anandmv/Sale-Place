# Sale Place 
[Live Demo](https://saleplace.web.app/)

Ethereum based e-commerce app for sale
A decentralized application running on Ethereum were a user can purchase/sell an item and track/update its status on the go.

[EtherScan Contract Deployed Address](https://rinkeby.etherscan.io/address/0xd823ff2600b5a0456c6a797b5cf1eaec2a32eb95)

## What's a SalePlace
SalePlace is a e-commerce app , having only two kinds of user seller and a purchaser .Seller will be creating an item for sale and any user(purchaser) can pay for the item. Purchased item status will be updated by the seller and purchaser in the order of the action required from both ends.

## User Actions
1. User can sell an item
2. User can buy an item
3. User can see the list of item they have purcahsed
4. User can edit the item they have created
5. Seller can set item purchased status as shipped
6. Purchaser can set the item status as received only if shipped
7. Seller can refund the item purchase amount once recieved


## Running locally
1. Install git, truffle and Metamask
    ```sh
    # install git
    sudo apt-get install -y git
    # install truffle
    sudo npm install -g truffle
    ```
    MetaMask can be installed from the [Firefox add-ons store](https://addons.mozilla.org/en-US/firefox/addon/ether-metamask/).
    ```
2. Install node (v10.0+), npm
    ```sh
    # install curl
    sudo apt-get install curl
    # install node & npm
    curl -sL https://deb.nodesource.com/setup_10.x | sudo -E bash -
    sudo apt-get install -y nodejs
3. Install project dependencies
    ```sh
    git clone https://github.com/anandmv/Sale-Place
    cd Sale-Place/client
    npm install
    ```
4. Run the Truffle development blockchain and ethereum-bridge in two seperate consoles (follow this exact order!)
    ```sh
    cd Sale-Place
    truffle develop
    # switch back to console one (truffle console)
    compile
    migrate
    test
    ```
5. Start the React front end from the local server
    ```sh
    # console three
    cd Sale-Place
    npm start
    ```
    Be sure to configure MetaMask using the default mnemonic phrase:
    ```
    candy maple cake sugar pudding cream honey rich smooth crumble sweet treat 
    ```
    Add the custom RPC endpoint when choosing a network: 
    ```
    http://127.0.0.1:7545 
    ```
    and then refresh the app page.Please confirm the network url from the truffle GUI/CLI 
    Once the app recognizes your MetaMask account you are good to go!

This project is created out of React Truffle Box https://github.com/truffle-box/react-box
