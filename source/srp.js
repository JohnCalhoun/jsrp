var randomBytes = require('randombytes');
var BigInteger = require('jsbn').BigInteger;
var util=require('./util.js')
var crypto=require('crypto')
var SRP={}

var hash_type='sha256'
var length
var g
var N

SRP.randomInt=function(size) {
    return util.toBigInteger(randomBytes(size))
};

SRP.generateSalt=function(size) {
    return randomBytes(size).toString('hex')
};

SRP.x = function(I,P,salt) {
    var identifierPasswordHash = util.hash(I+':'+P,hash_type);
    var xHash=util.hash(salt+identifierPasswordHash,hash_type);
    
    var result = util.toBigInteger(xHash);
    return result;
};

SRP.v = function(x) {
    var result = g.modPow(x, N);
    return util.toN(result, length);
};

SRP.A = function(size) {
    var a=SRP.randomInt(size)
    var result = g.modPow(a, N);
    var A=util.toN(result, length);

    return {A:A,a:a}
};

SRP.k = function() {
    result = util.hash(util.toN(N, length)+util.toN(g, length),hash_type);
    return util.toBigInteger(result);
};

SRP.B = function(v,size) {
    var b=SRP.randomInt(size)
    var k=SRP.k()

    var result = k.multiply(util.toBigInteger(v)).add(g.modPow(b, N)).mod(N);
    var B=util.toN(result, length);
    return {B:B,b:b}
};

SRP.u = function(A,B) {
    return util.toBigInteger(
        util.hash(
            A.toString('hex')+B.toString('hex'),
            hash_type
        )
    );
};

SRP.clientS = function(A,B,a,I,P,s) {
    var x=SRP.x(I,P,s)
    var k=SRP.k()
    var u=SRP.u(A,B)
    var B_int=util.toBigInteger(B)

    result = B_int.subtract(k.multiply(g.modPow(x, N))).modPow(a.add(u.multiply(x)), N);
    return util.toN(result, length);
};

SRP.serverS = function(A,B,b,v) {
    if(!util.toBigInteger(B).mod(N).equals(BigInteger.ZERO)){
        var A_int=util.toBigInteger(A)
        var u_int=SRP.u(A,B)
        var v_int=util.toBigInteger(v)

        result = A_int.multiply(v_int.modPow(u_int, N)).modPow(b, N);
        return util.toN(result, length);
    }else{
        return false
    }
};

SRP.K=function(key){
    return util.hash(key.toString('hex'),hash_type).toString('hex')
}
SRP.debug=function(A,B,a,b,I,P,s){
    var u=SRP.u(A,B)
    var x=SRP.x(I,P,s)

    return SRP.K(util.toN(g.modPow(b,N).modPow(a.add(u.multiply(x)),N),length))
}
module.exports=function(group,keylength){
    var dh=crypto.getDiffieHellman(group)
    g=util.toBigInteger(dh.getGenerator())
    N=util.toBigInteger(dh.getPrime())
    length=keylength     

    return SRP
}








