module.exports=function(grunt){
    require('time-grunt')(grunt);
    require('load-grunt-tasks')(grunt);

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
    })

    require('load-grunt-config')(grunt,{
        data:grunt.file.readJSON('config.json')
    });

    grunt.registerTask('test',[
        'nodeunit:all'
    ])

    grunt.registerTask('coverage',[
        'env:coverage',
        'instrument',
        'test',
        "storeCoverage",
        "makeReport"
    ])
}











