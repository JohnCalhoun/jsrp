module.exports=function(group,keylength){
    var srp=require('./srp.js')(group,keylength)
    var out={}
    
    out.genBandShared=function(A,salt,verifier){
        var Bs=srp.B(verifier,32)
        var key=srp.serverS(
            A,
            Bs.B,
            Bs.b,
            verifier
        ) 

        return {key:srp.K(key),B:Bs.B,b:Bs.b}
    }

    return out
}
