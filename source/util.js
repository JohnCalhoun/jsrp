var BigInteger = require('jsbn').BigInteger;
var createHash=require('create-hash')
var toBuffer = function(bigIntegerObj) {
    var thisHexString = bigIntegerObj.toString(16);
    if (thisHexString.length % 2 === 1) {
        thisHexString = "0" + thisHexString;
    }
    return new Buffer(thisHexString, 'hex');
};

var to = function(n, length) {
    var padding = length - n.length;
    var result = new Buffer(length);
    result.fill(0, 0, padding);
    n.copy(result, padding);
    return result;
};

exports.toN = function(number, length) {
    return to(toBuffer(number), length / 8);
};

exports.toBigInteger = function(bufferObj) {
    return new BigInteger(bufferObj.toString('hex'), 16);
};

exports.hash=function(text,type){
    return createHash(type)
        .update(text)
        .digest()
}

exports.passwordHash=exports.hash
exports.keyHash=exports.hash





