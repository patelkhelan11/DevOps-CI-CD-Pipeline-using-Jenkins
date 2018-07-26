//load dependencies
var fs = require('fs')
var path = require('path')
var recursive = require("recursive-readdir");


//get all java files

var commitHash = process.env.SHA1;
child_process.execSync(`git checkout ${commitHash}`);

var n = 2;
for(i=0;i<n;i++){

    recursive("iTrust2/src/main/java/edu/ncsu/csc/itrust2/", function (err, files) {
    
      files.forEach(function(fileName){

       if(!fileName.match(/models/) && !fileName.match(/sql/)){
        var data = fs.readFileSync(fileName, 'utf8');
        fs.writeFileSync(fileName,'','utf8');
        var lines = data.split("\n");

        var prob=0;
        lines.forEach(function(line){
            prob=Math.random();
            if(prob>0.5)
            {
              /*if(line.match('strings'))
              {
                
              }*/
            }

            prob=Math.random();
            if(prob>0.5)
            {
              if(line.match('for'))
              {
                if(line.match(/\+\+/)){
                  line=line.replace(/\+\+/g, "--");
                }
                else if(line.match("--")){
                  line=line.replace("--", "++");
                }
              }
            }

            prob=Math.random();
            if(prob>0.5)
            {
                if(line.match('true')){
                  line=line.replace('true', 'false');
                }
            }
            else{
                if(line.match('false')){
                  line=line.replace('false', 'true');
                }
            }
            
            prob=Math.random();
            if(prob>0.5)
            {
              if(line.match('while') || line.match('for') || line.match('if'))
              {
                
                if(line.match('<')){
                  line=line.replace('<', '>');
                }
                else if(line.match('>') && !line.match('->')){
                  line=line.replace('>', '<');
                }
    
              }
            }
            prob=Math.random();
            if(prob>0.5){
              if(line.match('=='))
                line=line.replace(/==/g,'!=');
              else if(line.match('!='))
                line=line.replace(/!=/g,'==');
              
            }
            prob=Math.random();
            
            if(prob>0.5)
            {
              if((line.match('while') || line.match('for') || line.match('if')) && line.match(/[0]/))
              {
                line=line.replace(/[0]/g,"1");
              }
              else if((line.match('while') || line.match('for') || line.match('if')) && line.match('1'))
              { 
                  line=line.replace(/[1]/g,'0');
              }

            }

            if(line != '\r')
              line += '\n'

            fs.appendFileSync(fileName,line);
    
        });
    
       }
      });
    });

    child_process.execSync(`git stash && git checkout fuzzer && git checkout stash -- . && git commit -am "Fuzzing master: Commit # ${n}:${process.env.MASTER_SHA1} " && git push`)
    child_process.execSync('git stash drop');
    let lastSha1 = child_process.execSync(`git rev-parse fuzzer`).toString().trim()
    
    try {
        child_process.execSync(`curl "http://${process.env.JENKINS_IP}:8090/git/notifyCommit?url=${process.env.GITHUB_URL}&branches=fuzzer&sha1=${lastSha1}"`)
        console.log(`Succesfully triggered build for fuzzer:${lastSha1}`)
    } catch (error) {
        console.log(`Couldn't trigger build for fuzzr:${lastSha1}`)
    }

    child_process.execSync(`git checkout ${commitHash}`);
}
