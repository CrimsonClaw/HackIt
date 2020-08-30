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
                        if(JSON.parse(JSON.stringify(result['stdout'])) === JSON.parse(JSON.stringify(doc.expected))) {
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
                    if(JSON.stringify(result['stdout']) === JSON.stringify(doc.expected)) {
                        passed++;
                    }
                    exp[i] = {'input': doc.input, 'output': JSON.parse(JSON.stringify(doc.expected))}
                    obt[i] = {'output': JSON.parse(JSON.stringify(result['stdout'])), 'pass?': (result['stdout']) == (doc.expected), 'pass1': JSON.parse(JSON.stringify(doc.expected)) == JSON.parse(JSON.stringify(result['stdout']))}
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
