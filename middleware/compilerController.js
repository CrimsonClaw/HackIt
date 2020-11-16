require('../models/TestCase');

const fs = require('fs');
const { c, cpp, node, python, java } = require('compile-run');
const mongoose = require('mongoose');
const testcase = mongoose.model('Testcase');

module.exports = {
    compiler: (req, res, next) => {
        testcase.find({questionid: req.app.get('qid'), sample: 'false'}).exec(async (err, testcases) => {
            let selected_language = req.body.language;
            let total = 0;
            let passed = 0;
            req.app.set('language', selected_language);
            req.app.set('code', req.body.codeArea);
            req.app.set('total', testcases.length);

            if (selected_language === "Java") {
                let javaCode = req.body.codeArea;
                
                fs.writeFile('Main.java', javaCode, function (err) {
                  if (err) throw err;
                  console.log('Saved!');
                });

                for(let doc of testcases) {
                    await java.runFile('Main.java', {compilationPath: 'javac', executionPath: 'java', stdin: doc.input,}, (err, result) => {
                        var out = (result['stdout']).replace(/(?:\\[rn]|[\r\n]+)$/, '');
                        var expec = (doc.expected).replace(/(?:\\[rn]|[\r\n]+)$/, '');
                        if(JSON.stringify(out) === JSON.stringify(expec)) {
                            passed++;
                            total += parseInt(doc.score);
                        }
                    });
                }
                req.app.set('passed', passed);
                req.app.set('score', total);
                return next();
            }

            else if (selected_language === "Python") {
                const sourcecode = req.body.codeArea;

                fs.writeFile('Main.py', sourcecode, function (err) {
                    if (err) throw err;
                    console.log('Saved!');
                });

                for(let doc of testcases) {
                    await python.runFile('Main.py', { stdin: doc.input}, (err, result) => {
                        var out = (result['stdout']).replace(/(?:\\[rn]|[\r\n]+)$/, '');
                        var expec = (doc.expected).replace(/(?:\\[rn]|[\r\n]+)$/, '');
                        if(JSON.stringify(out) === JSON.stringify(expec)) {
                            passed++;
                            total += parseInt(doc.score);
                        }
                    });
                }
                console.log(passed, total);
                req.app.set('passed', passed);
                req.app.set('score', total);
                return next();
            } 

            else if (selected_language === "C") {
                const sourcecode = req.body.codeArea;
            
                fs.writeFile('Main.C', sourcecode, function (err) {
                    if (err) throw err;
                    console.log('Saved!');
                });
                
                for(let doc of testcases) {
                    await c.runFile('Main.C', { stdin: doc.input}, (err, result) => {
                        var out = (result['stdout']).replace(/(?:\\[rn]|[\r\n]+)$/, '');
                        var expec = (doc.expected).replace(/(?:\\[rn]|[\r\n]+)$/, '');
                        if(JSON.stringify(out) === JSON.stringify(expec)) {
                            passed++;
                            total += parseInt(doc.score);
                        }
                    });
                }
                req.app.set('passed', passed);
                req.app.set('score', total);
                return next();
            } 

            else if (selected_language === "C++") {
                const sourcecode = req.body.codeArea;
            
                fs.writeFile('Main.CPP', sourcecode, function (err) {
                    if (err) throw err;
                    console.log('Saved!');
                });
            
                for(let doc of testcases) {
                    await cpp.runFile('Main.CPP', { stdin: doc.input}, (err, result) => {
                        var out = (result['stdout']).replace(/(?:\\[rn]|[\r\n]+)$/, '');
                        var expec = (doc.expected).replace(/(?:\\[rn]|[\r\n]+)$/, '');
                        if(JSON.stringify(out) === JSON.stringify(expec)) {
                            passed++;
                            total += parseInt(doc.score);
                        }
                    });
                }
                req.app.set('passed', passed);
                req.app.set('score', total);
                return next();
            }
        });
    }
};

module.exports.check = (req, res, next) => {
    testcase.find({questionid: req.app.get('qid'), sample: 'true'}).exec(async (err, testcases) => {
        console.log(testcases);
        let selected_language = req.body.language;
        let passed = 0, i = 0;
        let obt = [];
        
        if (selected_language === "Java") {
            let javaCode = req.body.codeArea;
            
            fs.writeFile('Main.java', javaCode, function (err) {
              if (err) throw err;
              console.log('Saved!');
            });

            for(let doc of testcases) {
                await java.runFile('Main.java', {compilationPath: 'javac', executionPath: 'java', stdin: doc.input,}, (err, result) => {
                    var out = (result['stdout']).replace(/(?:\\[rn]|[\r\n]+)$/, '');
                    var expec = (doc.expected).replace(/(?:\\[rn]|[\r\n]+)$/, '');
                    if(JSON.stringify(out) === JSON.stringify(expec)) {
                        passed++;
                    }
                    obt[i] = {'output': out}
                    i++;
                });
            }
            console.log(obt);
            res.send({obt, passed})
        }

        else if (selected_language === "Python") {
            const sourcecode = req.body.codeArea;

            fs.writeFile('Main.py', sourcecode, function (err) {
                if (err) throw err;
                console.log('Saved!');
            });
            
            for(let doc of testcases) {
                await python.runFile('Main.py', { stdin: doc.input}, (err, result) => {
                    var out = (result['stdout']).replace(/(?:\\[rn]|[\r\n]+)$/, '');
                    var expec = (doc.expected).replace(/(?:\\[rn]|[\r\n]+)$/, '');
                    if(JSON.stringify(out) === JSON.stringify(expec)) {
                        passed++;
                    }
                    obt[i] = {'output': out}
                    i++;
                });
                console.log(obt);
            }
            console.log(obt);
            res.send({obt, passed})
        } 

        else if (selected_language === "C") {
            const sourcecode = req.body.codeArea;
        
            fs.writeFile('Main.C', sourcecode, function (err) {
                if (err) throw err;
                console.log('Saved!');
            });
            
            for(let doc of testcases) {
                await c.runFile('Main.C', { stdin: doc.input}, (err, result) => {
                    var out = (result['stdout']).replace(/(?:\\[rn]|[\r\n]+)$/, '');
                    var expec = (doc.expected).replace(/(?:\\[rn]|[\r\n]+)$/, '');
                    if(JSON.stringify(out) === JSON.stringify(expec)) {
                        passed++;
                    }
                    obt[i] = {'output': out}
                    i++;
                });
            }
            console.log(obt);
            res.send({obt, passed})
        } 

        else if (selected_language === "C++") {
            const sourcecode = req.body.codeArea;
        
            fs.writeFile('Main.CPP', sourcecode, function (err) {
                if (err) throw err;
                console.log('Saved!');
            });
        
            for(let doc of testcases) {
                await cpp.runFile('Main.CPP', { stdin: doc.input}, (err, result) => {
                    var out = (result['stdout']).replace(/(?:\\[rn]|[\r\n]+)$/, '');
                    var expec = (doc.expected).replace(/(?:\\[rn]|[\r\n]+)$/, '');
                    if(JSON.stringify(out) === JSON.stringify(expec)) {
                        passed++;
                    }
                    obt[i] = {'output': out}
                    i++;
                });
            }
            console.log(obt);
            res.send({obt, passed})
        }
    });
};