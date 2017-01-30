var randomBytes = require('randombytes');
var BigInteger = require('jsbn').BigInteger;
var util=require('./util.js')
var SRP={}

var hash_type='sha256'
var length
var g
var N

var passwordHash=util.hash(hash_type)
var keyHash=util.hash(hash_type)
var scrambleHash=util.hash(hash_type)
var publicHash=util.hash(hash_type)

SRP.randomInt=function(size) {
    return util.toBigInteger(randomBytes(size))
};

SRP.generateSalt=function(size) {
    return randomBytes(size).toString('hex')
};

SRP.x = function(I,P,salt) {
    var identifierPasswordHash = passwordHash(I+':'+P);
    var xHash=passwordHash(salt+identifierPasswordHash);
    
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
    result = scrambleHash(util.toN(N, length)+util.toN(g, length));
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
        publicHash(
            A.toString('hex')+B.toString('hex')
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
    return keyHash(key.toString('hex')).toString('hex')
}
SRP.debug=function(A,B,a,b,I,P,s){
    var u=SRP.u(A,B)
    var x=SRP.x(I,P,s)

    return SRP.K(util.toN(g.modPow(b,N).modPow(a.add(u.multiply(x)),N),length))
}
module.exports=function(group,keylength){
    var dh=require('crypto').getDiffieHellman(group)
    g=util.toBigInteger(dh.getGenerator())
    N=util.toBigInteger(dh.getPrime())
    length=keylength     

    return SRP
}








