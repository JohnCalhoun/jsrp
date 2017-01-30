module.exports=function(group,keylength){
    var srp=require('./srp.js')(group,keylength)
    var out={}

    out.getSaltVerifier=function(I,P){
        var salt=srp.generateSalt(32)
        var x=srp.x(I,P,salt)
        return {
            v:srp.v(x),
            salt:salt
        }
    }
    out.genA=function(){
        return srp.A(32)  
    }
    out.getShared=function(A,B,a,I,P,s){
        var key=srp.clientS(A,B,a,I,P,s)
        return srp.K(key)
    }

    return out
}
