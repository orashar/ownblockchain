const { BlockChain, Transaction } = require("./src/blockchain")
const EC = require('elliptic').ec
const ec = new EC('secp256k1')

const myKey = ec.keyFromPrivate('c92501f2717740ada49d8a219e3a73043762eef498821e89a62e5b7afffa9cbe')
const myWalletAddress = myKey.getPublic('hex')


let coin = new BlockChain()

const tx1 = new Transaction(myWalletAddress, 'public key goes here', 10)
tx1.signTransation(myKey)
coin.addTransaction(tx1)

console.log('\n starting miner')
coin.minePendingTransaction(myWalletAddress)

console.log("balance of xavier = ", coin.getBalanceOfAddress(myWalletAddress))


console.log(coin.isChainValid())
// console.log(coin)