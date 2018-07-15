pragma solidity ^0.4.10;

import "openzeppelin-solidity/contracts/math/SafeMath.sol";

library DexLib {

    using SafeMath for uint;
    
    uint constant MAXORDER = 2**20;
    uint constant MAXTOKEN = 2**8;
    uint constant MAXBATCH = 2**8;

    enum OrderType {Bid, Ask}
    
    //order fee not implemented!!!
    
    struct Order {
        uint volume;
        uint price;
        address trader;
        bytes32 nonce;
        uint timestamp;
    }
    
    struct OrderBook {
        uint numOrder;
        Order[MAXORDER] orders;
    }
    
    struct Batch {
        uint batchHead; //the actual head - 1
        uint batchTail; //the actual tail
        uint[MAXBATCH] timestamp;
        OrderBook[MAXBATCH] bidBook;
        OrderBook[MAXBATCH] askBook;
    }
    
    struct Token {
        string symbolName;
        address tokenAddr;
        Batch[MAXTOKEN] batches;
    }
    
    struct Dex {
        uint8 numToken;
        Token[MAXTOKEN] tokens;
        mapping (string => uint8) tokenIndex;
    
        mapping (address => mapping (uint8 => uint)) balance;
        mapping (address => mapping (uint8 => uint)) freeBal;

        address admin;
        uint lenPeriod;
        uint staPeriod;
    }

    function initOrder(Order storage self, address trader, uint volume, uint price, 
        bytes32 nonce, uint timestamp) internal {
        self.trader = trader;
        self.volume = volume;
        self.price = price;
        self.nonce = nonce;
        self.timestamp = timestamp;
    }

    function copyOrder(Order storage self, Order storage origin) internal{
        initOrder(self, origin.trader, origin.volume, origin.price, origin.nonce, origin.timestamp);
    }
    
    function initBatch(Batch storage self) internal {
        self.batchHead = 0;
        self.batchTail = 0;
    }

    function initToken(Token storage self, address addr, string name, uint numToken) internal {
        self.symbolName = name;
        self.tokenAddr = addr;

        for (uint i = 0; i < numToken; i++) {
            initBatch(self.batches[i]);
        }
    }
    
    function initDex (Dex storage self, address admin_, uint lenPeriod) internal {
        self.admin = admin_;
        self.lenPeriod = lenPeriod;
        self.staPeriod = block.number;
        
        initToken(self.tokens[self.numToken], 0, "ETH", self.numToken);
        self.tokenIndex["ETH"] = self.numToken;
        self.numToken = 1;
    }

    function updateBatchIndex(uint idx) public pure returns (uint) {
        if (idx == MAXBATCH - 1) {
            return 0;
        } else {
            return idx + 1;
        }
    }

    function currentPeriod(Dex storage self, uint cur) public view returns (uint) {
        return ((cur - self.staPeriod) / self.lenPeriod) * self.lenPeriod + self.staPeriod;
    }

/*    function updatePeriod(Dex storage self) public {
        //Handle who is responsible for gas cost in this function!!!
        if (self.curPeriod + self.lenPeriod <= block.number) {
            self.curPeriod += self.lenPeriod;

            for (uint i = 0; i < self.numToken; i++) {
                for (uint j = 0; j < i; j++) {
                    self.tokens[i].batches[j].batchTail = updateBatchIndex(
                        self.tokens[i].batches[j].batchTail);
                    self.tokens[i].batches[j].timeTail += self.lenPeriod;
                    self.tokens[i].batches[j].bidBook[self.tokens[i].batches[j].batchTail].numOrder = 0;
                    self.tokens[i].batches[j].askBook[self.tokens[i].batches[j].batchTail].numOrder = 0;
                }
            }
         }
    }
*/
    function insertOrder(Batch storage self, uint timestamp, Order storage order, 
        OrderType t) internal {
        if (self.batchHead == self.batchTail || self.timestamp[self.batchTail] < timestamp) {
            self.batchTail = updateBatchIndex(self.batchTail);
            self.timestamp[self.batchTail] = timestamp;
            self.bidBook[self.batchTail].numOrder = 0;
            self.askBook[self.batchTail].numOrder = 0;
        }
        if (t == OrderType.Bid) {
            copyOrder(self.bidBook[self.batchTail].orders[self.bidBook[self.batchTail].numOrder], 
                order);
            self.bidBook[self.batchTail].numOrder++;
        } else {
            copyOrder(self.askBook[self.batchTail].orders[self.askBook[self.batchTail].numOrder], 
                order);
            self.askBook[self.batchTail].numOrder++;
        }
    }

    //check whether priceA < priceB
    function compareOrder(Order storage orderA, Order storage orderB) 
        public view returns(bool) {
            return (orderA.price < orderB.price || 
                (orderA.price == orderB.price && orderA.nonce < orderB.nonce));
    }

    //bids price in descending order, asks price in ascending order
    function checkSortedBook(OrderBook storage self, uint[] sortedOrder, OrderType t)
        public view returns(bool) {
            if (self.numOrder != sortedOrder.length) return false;
            for (uint i = 1; i < sortedOrder.length; i++) {
                if (sortedOrder[i] == sortedOrder[i - 1]) return false;
                if (t == OrderType.Bid) {
                    if (compareOrder(self.orders[sortedOrder[i - 1]], 
                        self.orders[sortedOrder[i]])) return false;
                } else {
                    if (compareOrder(self.orders[sortedOrder[i]],
                        self.orders[sortedOrder[i - 1]])) return false;
                }
            }
            return true;
    }

    function checkSorting(Batch storage self, uint[] sortedBid, uint[] sortedAsk) 
        public view returns(bool) {
            uint next = updateBatchIndex(self.batchHead);
            return (checkSortedBook(self.bidBook[next], sortedBid, OrderType.Bid)
                && checkSortedBook(self.askBook[next], sortedAsk, OrderType.Ask));
    }

    function min(uint a, uint b) public pure returns(uint) {
        if (a < b) return a; else return b;
    }

    function firstPriceAuction(Dex storage dex, uint[] sortedBid, uint[] sortedAsk, 
        uint8 tokenA, uint8 tokenB) internal {
        Batch storage self = dex.tokens[tokenA].batches[tokenB];
        uint cur = updateBatchIndex(self.batchHead);
        uint i = 0;
        uint j = 0;
        Order storage orderBid;
        if (i < sortedBid.length) orderBid = self.bidBook[cur].orders[sortedBid[i]];
        Order storage orderAsk;
        if (j < sortedAsk.length) orderAsk = self.askBook[cur].orders[sortedAsk[j]];

        for (; i < sortedBid.length && j < sortedAsk.length;) {
            if (orderBid.price >= orderAsk.price) {
                //how to set the settlement price when bid and ask prices are not equal???
                uint price = (orderBid.price + orderAsk.price) / 2;
                uint volume = min(orderBid.volume, orderAsk.volume);

                //buy (volume) "tokenTo" with (volume * price) "tokenFrom" [tokenFrom][tokenTo] 
                dex.balance[orderBid.trader][tokenA].sub(volume * price);
                dex.balance[orderBid.trader][tokenB].add(volume);
                dex.freeBal[orderBid.trader][tokenB].add(volume);
                orderBid.volume -= volume;
                if (orderBid.volume == 0) {
                    i++;
                    if (i < sortedBid.length) orderBid = self.bidBook[cur].orders[sortedBid[i]];
                }

                //sell (volume) "tokenFrom" for (volume * price) "tokenTo" [tokenTo][tokenFrom]
                dex.balance[orderAsk.trader][tokenA].add(volume * price);
                dex.freeBal[orderAsk.trader][tokenA].add(volume * price);
                dex.balance[orderAsk.trader][tokenB].sub(volume);
                orderAsk.volume -= volume;
                if (orderAsk.volume == 0) {
                    j++;
                    if (j < sortedAsk.length) orderAsk = self.askBook[cur].orders[sortedAsk[j]];
                }
            } else {
                break;
            }
        }

        if (i < sortedBid.length || j < sortedAsk.length) {
            if (cur == self.batchTail) {
                self.batchTail = updateBatchIndex(self.batchTail);
                self.timestamp[self.batchTail] = currentPeriod(dex, block.number);
                self.bidBook[self.batchTail].numOrder = 0;
                self.askBook[self.batchTail].numOrder = 0;
            }
            uint next = updateBatchIndex(cur);
            for (; i < sortedBid.length; i++) {
                orderBid = self.bidBook[cur].orders[sortedBid[i]];
                copyOrder(self.bidBook[next].orders[self.bidBook[next].numOrder], orderBid);
                self.bidBook[next].numOrder++;
            }
            for (; j < sortedAsk.length; j++) {
                orderAsk = self.askBook[cur].orders[sortedAsk[i]];
                copyOrder(self.askBook[next].orders[self.askBook[next].numOrder], orderAsk);
                self.askBook[next].numOrder++;
            }

        }
        self.batchHead = cur;
    }    

    function settle(Dex storage dex, uint[] sortedBid, uint[] sortedAsk, 
        uint8 tokenA, uint8 tokenB) internal {
        Batch storage self = dex.tokens[tokenA].batches[tokenB];
        require(self.batchHead != self.batchTail);
        require(self.timestamp[updateBatchIndex(self.batchHead)] + dex.lenPeriod <= block.number);

        require(checkSorting(self, sortedBid, sortedAsk));
        firstPriceAuction(dex, sortedBid, sortedAsk, tokenA, tokenB);
    }
    
}