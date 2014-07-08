
module.exports = function(nondebug){
	var fs = require("fs"),
	    dust     = require('dustjs-linkedin'),
	    UglifyJS = require("uglify-js2"),
	    templatesdir = 'templates';
	var dusttemps = fs.readdirSync(templatesdir);

    var dustall = dusttemps.filter(function(file){
        var cond = (file.substr(-5) === '.dust');
        return cond;
    });

    for(j in dustall) {
        makeJs(dustall[j]);
    }

    function makeJs(file) {
        
        var curr = fs.readFileSync(templatesdir+'/'+file,'utf8');

        var stripped = file.substr(0,(file).length-5);
        var out = dust.compile(curr,stripped);
        //var scriptdesc = JSON.parse(data),
        fs.writeFileSync('public/js/'+stripped+'.js', out);
        //console.log("preloading dust templates");
        //console.log(file); 
    
    }

    var path = "scripts.json";
        fs.readFile(path,'utf8', function(err, data) {
        if (err) {
            console.log(err);
            return;
        }
        var scriptdesc = JSON.parse(data),
        js = scriptdesc.scripts;

        if(nondebug){
            

	      
            var res= js.map(function(elem){
                return elem;
            });

            var result = UglifyJS.minify(res),
                dest = scriptdesc.target; 
            
            fs.writeFile(dest, result.code, function(err) {
                if(err) {
                    console.log(err);
                } else {
                    console.log("The file "+dest+"was minified and saved!");

                    var jadedir = scriptdesc.jadedir;
                    
                    fs.writeFile(jadedir, "script(src='"+scriptdesc.target.split("public")[1]+"')\n",function(err){
                        if(err){
                            console.log(err);
                        }                   
                        else{
                            console.log("minified jade file built in"+jadedir);
                        }    
                    });
                }
            });

        }// end of block for non debug
        else{
            var jadearr = js.map(function(elem){
                return "script(src='"+elem.split("public")[1]+"')\n";
            }),
             jade = jadearr.join("");

            var jadedir = scriptdesc.jadedir;
                    
            fs.writeFile(jadedir, jade,function(err){
                if(err){
                    console.log(err);
                }                   
                else{
                    console.log("jade file built in"+jadedir);
                }
            });    

        }
    });
};