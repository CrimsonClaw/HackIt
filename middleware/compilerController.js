require('../models/TestCase');
require('../routes/student');

const fs = require('fs');
const { c, cpp, node, python, java } = require('compile-run');
const mongoose = require('mongoose');
const testcase = mongoose.model('Testcase');

module.exports = {
    compiler: (req, res, next) => {
        testcase.find({questionid: req.app.get('qid')}).exec(async (err, testcases) => {
            console.log(testcases);
            let selected_language = req.body.language;
            let total = 0;
            let passed = 0;
            
            if (selected_language === "Java") {
                let javaCode = req.body.codeArea;
                
                fs.writeFile('Main.java', javaCode, function (err) {
                  if (err) throw err;
                  console.log('Saved!');
                });

                for(let doc of testcases) {
                    await java.runFile('Main.java', {compilationPath: 'javac', executionPath: 'java', stdin: doc.input,}, (err, result) => {
                        if(JSON.stringify(result['stdout']) === JSON.stringify(doc.expected)) {
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
                        let expec = String(doc.expected);
                        let out = String(result['stdout']);
                        if(out === expec) {
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
                        if(JSON.stringify(result['stdout']) === JSON.stringify(doc.expected)) {
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
                        if(JSON.stringify(result['stdout']) === JSON.stringify(doc.expected)) {
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

module.exports.check = (req, res) => {
    testcase.find({questionid: req.app.get('qid')}).exec(async (err, testcases) => {
        console.log(testcases);
        let selected_language = req.body.language;
        let passed = 0, i = 0;
        let exp = [];
        let obt = [];
        
        if (selected_language === "Java") {
            let javaCode = req.body.codeArea;
            
            fs.writeFile('Main.java', javaCode, function (err) {
              if (err) throw err;
              console.log('Saved!');
            });

            for(let doc of testcases) {
                await java.runFile('Main.java', {compilationPath: 'javac', executionPath: 'java', stdin: doc.input,}, (err, result) => {
                    if(JSON.stringify(result['stdout']) === JSON.stringify(doc.expected)) {
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
                    let expec = String(doc.expected);
                    let out = String(result['stdout']);
                    let expec1 = String(JSON.parse(JSON.stringify(doc.expected)));
                    let out1 = String(JSON.parse(JSON.stringify(result['stdout'])));
                    if(JSON.stringify(result['stdout']) === JSON.stringify(doc.expected)) {
                        passed++;
                    }
                    exp[i] = {'input': doc.input, 'output': expec, 'output': expec1}
                    obt[i] = {'output':out, 'ouput1': out1, 'pass?': (expec1 == out1), 'pass1': expec == out, 'pass2': (expec1 === out1), 'pass3': (expec === out)}
                    i++;
                });
            }
            console.log(exp, obt);
            res.send({exp, obt, passed})
        } 

        else if (selected_language === "C") {
            const sourcecode = req.body.codeArea;
        
            fs.writeFile('Main.C', sourcecode, function (err) {
                if (err) throw err;
                console.log('Saved!');
            });
            
            for(let doc of testcases) {
                await c.runFile('Main.C', { stdin: doc.input}, (err, result) => {
                    if(JSON.stringify(result['stdout']) === JSON.stringify(doc.expected)) {
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
                    if(JSON.stringify(result['stdout']) === JSON.stringify(doc.expected)) {
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
};
