const SHA256 = require('crypto-js/sha256')

class Transaction{
    constructor(fromAddress, toAddress, amount){
        this.fromAddress = fromAddress
        this.toAddress = toAddress
        this.amount = amount
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
            this.hash = this.calculateHash()
            this.nonce++
        }

        console.log("Block mined : ", this.hash)
    }
}

class BlockChain{
    constructor(){
        this.chain = [this.createGenesisBlock()]
        this.difficulty = 2
        this.pendingTransations = []
        this.miningReward = 100

    }

    createGenesisBlock(){
        return new Block(0, '01/01/2021', "Genesis Block", "0")
    }

    getLatestBlock(){
        return this.chain[this.chain.length-1]
    }

    // addBlock(newBlock){
    //     newBlock.previousHash = this.getLatestBlock().hash
    //     newBlock.mineBlock(this.difficulty)
    //     this.chain.push(newBlock)
    // }

    minePendingTransaction(miningRewardAddress){
        let block = new Block(Date.now(), this.pendingTransations)
        block.mineBlock(this.difficulty)

        console.log("successfully mined")
        this.chain.push(block)

        this.pendingTransations = [
            new Transaction(null, miningRewardAddress, this.miningReward)
        ]
    }

    createTransaction(transaction){
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

            if(currentBlock.hash !== currentBlock.calculateHash()) return false

            if(currentBlock.previousHash !== previousBlock.hash) return false
        }
        return true
    }
}

let coin = new BlockChain()

coin.createTransaction(new Transaction('address1', 'address2', 100))
coin.createTransaction(new Transaction('address2', 'address1', 50))

console.log('\n starting miner')
coin.minePendingTransaction('xavier')

console.log('\n starting miner again')
coin.minePendingTransaction('xavier')

console.log("balance of xavier = ", coin.getBalanceOfAddress('xavier'))