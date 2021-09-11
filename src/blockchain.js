const SHA256 = require('crypto-js/sha256')
const EC = require('elliptic').ec
const ec = new EC('secp256k1')

class Transaction{
    constructor(fromAddress, toAddress, amount){
        this.fromAddress = fromAddress
        this.toAddress = toAddress
        this.amount = amount
        this.timestamp = Date.now()
    }

    calculateHash(){
        return SHA256(this.fromAddress + this.toAddress + this.amount + this.timestamp).toString()
    }

    signTransation(signingKey){

        if(signingKey.getPublic('hex') !== this.fromAddress) throw new Error("cannot sign transaction from other's wallet")

        const hashTx = this.calculateHash()
        const sig = signingKey.sign(hashTx, 'base64')
        this.signature = sig.toDER('hex')
    }

    isValid(){
        if(this.fromAddress === null) return true

        if(!this.signature || this.signature.length === 0) throw new Error('No signature in this transaction')

        const publicKey = ec.keyFromPublic(this.fromAddress, 'hex')
        return publicKey.verify(this.calculateHash(), this.signature)
    }
}

class Block{
    constructor(timestamp, transations, previousHash = ''){
        this.timestamp = timestamp
        this.transations = transations
        this.previousHash = previousHash
        this.hash = this.calculateHash()
        this.nonce = 0
    }

    calculateHash(){
        return SHA256(this.previousHash + this.timestamp + JSON.stringify(this.transations) + this.nonce).toString()
    }

    mineBlock(difficulty){
        while(this.hash.substring(0, difficulty) !== Array(difficulty+1).join('0')){
            this.nonce++
            this.hash = this.calculateHash()
        }

        console.log("Block mined : ", this.hash)
    }

    hasValidTransaction(){
        for(const tx of this.transations){
            if(!tx.isValid()) return false
        }
        return true
    }
}

class BlockChain{
    constructor(){
        this.chain = [this.createGenesisBlock()]
        this.difficulty = 5
        this.pendingTransations = []
        this.miningReward = 100

    }

    createGenesisBlock(){
        return new Block(Date.parse('01/01/2021'), [], '0')
    }

    getLatestBlock(){
        return this.chain[this.chain.length-1]
    }

    minePendingTransaction(miningRewardAddress){
        const rewardTx = new Transaction(null, miningRewardAddress, this.miningReward)
        this.pendingTransations.push(rewardTx)

        let block = new Block(Date.now(), this.pendingTransations, this.getLatestBlock().hash)
        block.mineBlock(this.difficulty)

        console.log("successfully mined")
        this.chain.push(block)

        this.pendingTransations = []
    }

    addTransaction(transaction){
        if(!transaction.fromAddress || !transaction.toAddress) throw new Error('transaction must have from and to address')

        if(!transaction.isValid()) throw new Error('can not add invalid transaction')
        this.pendingTransations.push(transaction)
    }

    getBalanceOfAddress(address){
        let balance = 0

        for(const block of this.chain){
            for(const trans of block.transations){
                if(trans.fromAddress === address) balance -= trans.amount
                if(trans.toAddress === address) balance += trans.amount
            }
        }
        return balance
    }

    isChainValid(){
        for(let i = 1; i < this.chain.length; i++){
            const currentBlock = this.chain[i]
            const previousBlock = this.chain[i-1]

            if(!currentBlock.hasValidTransaction()) return false

            if(currentBlock.hash !== currentBlock.calculateHash()) return false

            if(currentBlock.previousHash !== previousBlock.hash) return false
        }
        return true
    }
}


module.exports.BlockChain = BlockChain
module.exports.Transaction = Transaction