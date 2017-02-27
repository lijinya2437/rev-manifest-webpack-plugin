const path = require('path');
const fs = require('fs');

class GenerateRevManifestPlugin {
	
	constructor(options) {
        this.filename = options.filename || 'rev-manifest.json';
    }
	
	apply (compiler) {
		let that = this;
	  	compiler.plugin('emit', function(compilation, callback) {
		    let assetfileList = {};
		    let result = null;
		    let outputFilePath = path.normalize(compilation.outputOptions.path + '/' + this.options.filename);
			let existsFlag = fs.existsSync( outputFilePath );
		
			let stats = compilation.getStats().toJson({
		        hash: true,
		        publicPath: true,
		        assets: true,
		        chunks: false,
		        modules: false,
		        source: false,
		        errorDetails: false,
		        timings: false
		    });
	
		    for (let fileOrign in stats.assetsByChunkName) {
				for(let filename of stats.assetsByChunkName[fileOrign]){
					let attribute = fileOrign + path.parse(filename).ext;
					assetfileList[attribute] = filename;
				}
		    }
	    
		    if( existsFlag ){
				let data = fs.readFileSync( outputFilePath , {"encoding":"utf-8"});
				let readObj = JSON.parse(data);
				Object.assign(readObj, assetfileList)
				result = JSON.stringify(readObj , null , '\t');
			}else{
				result = JSON.stringify(assetfileList , null , '\t');
			}
		    compilation.assets[that.filename] = {
		      source: function() {
		        return result;
		      },
		      size: function() {
		        return result.length;
		      }
		    };
	
	    	callback();
		});
	}
}

module.exports = GenerateRevManifestPlugin;