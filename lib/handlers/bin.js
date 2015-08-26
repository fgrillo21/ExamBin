'use strict';
var async      = require('asyncjs'),
    utils      = require('../utils'),
    errors     = require('../errors'),
    custom     = require('../custom'),
    blacklist  = require('../blacklist'),
    scripts    = require('../../scripts.json'),
    processors = require('../processors'),
    _          = require('underscore'),
    undefsafe  = require('undefsafe'),
    metrics    = require('../metrics'),
    features   = require('../features'),
    RSVP       = require('rsvp'),
    Promise    = RSVP.Promise,
    config     = require('../config'),
    welcomePanel = require('../welcome-panel'),
    binToFile  = require('bin-to-file'),
    Observable = utils.Observable;

var w3cvalidator = require('w3cvalidator');
var esprima = require('esprima');
var clockAula = require('../myjsbin/timer');
var moduleVote = require('../myjsbin/vote');
var studentData = require('../myjsbin/studentData');
var testConfig = require("../../test/myjsbin/testConfig2");

var cheerio = require('cheerio');
var jsdom = require("jsdom");

var Mocha = require("mocha");

var pathModule = require('path');
var moment = require('moment');
var MINUTE1MILLIS = 60000; /* 1 minuto*/
var MINUTE5MILLIS = 300000; /* 5 minuti*/
var MINUTE30MILLIS = 1800000; /* 30 minuti*/
var fs = require('fs');


module.exports = Observable.extend({
  constructor: function BinHandler(sandbox) {
    Observable.apply(this, arguments);

    this.models = sandbox.models;
    this.helpers = sandbox.helpers;
    this.mailer = sandbox.mailer;

    // For now we bind all methods to the class scope. In reality only those
    // used as route callbacks need to be bound.
    var methods = Object.getOwnPropertyNames(BinHandler.prototype).filter(function (prop) {
      return typeof this[prop] === 'function';
    }, this);

    utils.bindAll(this, methods);
  },
  getDefault: function (req, res, next) {
      //if there isn't nobody student logged in, I don't make visible this page
      if (req.session.student){
            if (req.subdomain && custom[req.subdomain]) {
              return this.getCustom(req, res, next);
            }
            this.renderFiles(req, res);
      } else {
          //TODO create page to redirect the not registered user
          if (req.session.professor){
              if (req.subdomain && custom[req.subdomain]) {
                  return this.getCustom(req, res, next);
              }
              this.renderFiles(req, res);
          } else {
              res.render("errorPage", {
                  serviceIsNotAccessible : true
              });
          }
      }
  },
  getFromPost: function (req, res) {
    var processorTypes = 'jade markdown less stylus sass scss coffeescript processing traceur typescript jsx'.split(' '),
        aliases = processors.aliases,
        allTypes = ('html css javascript'.split(' ')).concat(processorTypes).concat(Object.keys(aliases));

    // JavaScript isn't a processor, so it's not included in the default aliases
    aliases.js = 'javascript';

    var processorSettings = {};

    var data = utils.extract.apply(null, [req.body].concat(allTypes));
    data.settings = {};

    allTypes.forEach(function (panel) {
      if (data[panel]) {
        // if an alias was used, then move it to the non alias version
        if (aliases[panel]) {
          data[aliases[panel]] = data[panel];
          panel = aliases[panel];
        }

        // if we're dealing with a processor in the posted data, then add it to
        // settings and move it to the correct panel name (ie. coffeescript => js)
        if (processorTypes.indexOf(panel) !== -1) {
          // mark this as a processor
          processorSettings[processors.lookup[panel]] = panel;

          // then change the panel name to match the actual panel, and let the
          // processor kick in during render
          data[processors.lookup[panel]] = data[panel];
          delete data[panel];
          panel = processors.lookup[panel];
        }
        data[panel] = (data[panel]);
      }
    });

    if (Object.keys(processorSettings).length) {
      data.settings.processors = processorSettings;
    }

    data.post = true;

    this.render(req, res, data);
  },
  getCustom: function (req, res, next) {
    var config = custom[req.subdomain],
        overrides = config.defaults,
        _this = this;

    this.loadFiles(this.defaultFiles(), function (err, defaults) {
      if (err) {
        return next(err);
      }

      for (var key in defaults) {
        if (overrides[key]) {
          defaults[key] = overrides[key];
        }
      }

      _this.render(req, res, defaults);
    });
  },
    getBin: function (req, res, next) {
        if (req.session.student) {
            var studentOk = validateStudent(req.session.student,req.bin.url);
            if (studentOk) {
                console.log("get bin url "+req.bin.url);
                this.render(req, res, req.bin);
            }  else {
                //TODO create page to redirect the not registered user
                res.send("reindirizzami dove vuoi bel");
            }
        } else {
            //TODO create page to redirect the not registered user
            if (req.session.professor){
                this.render(req, res, req.bin);
            } else {
                res.send("reindirizzami dove vuoi bel");
            }
        }

        function validateStudent(student, url){
            student.date = moment().format('YYYY-MM-DD');
            var urlArray = url.split("_");
            var splitUrl = {};
            splitUrl.date = urlArray[0];
            splitUrl.name = urlArray[1];
            splitUrl.surname = urlArray[2];
            splitUrl.matricola = urlArray[3];
            splitUrl.postazione = urlArray[4];

            var studentOk = true;
            for (var key in splitUrl){
                if (splitUrl[key] !== student[key]){
                    console.log("io non posso entrare");
                    studentOk = false;
                    return studentOk;
                }
            }
            return studentOk;
        }
    },
    getStudentLogin: function (req, res, next) {
        var _this = this;
        var statik = _this.helpers.urlForStatic('', req.secure);

        if (req.session.student) {

            var studentData = req.session.student;
            var params = moment().format('YYYY-MM-DD') + "_" + studentData.name + "_" + studentData.surname + "_" + studentData.matricola + "_" + studentData.postazione + "%";
            //call function to visualize if exist a record in the db about this student
            _this.models.bin.getAllStudentRecord(params, function (err, result) { //result is the content of the query mysql to table sandbox
                console.log("ATTENZIONE ATTENZIONE STUDENTE LOGGATO");
                console.log("errori");
                console.log("-" + err + "-"); //return null
                console.log("risultati getstudentlogin"); //return updated row ==> perfect
                console.log("-" + JSON.stringify(result) + "-");
                if (err) {
                    return next(err);
                }

                for (var i = 0; i < result.length; i++) {
                    console.log(result[i]);
                }
                if (result.length) {
                    var urlOldExam = statik + "/listPage_" + result[0].url;
                    console.log("urlOldExam in getstudentlogin "+urlOldExam);
                    var loadJs = false;
                    var studentLoggedIn = true;
                    res.render('studentLogin', {
                        static: statik,
                        studentLoggedIn: studentLoggedIn,
                        urlOldExam: urlOldExam,
                        loadJs: loadJs
                    });
                } else {
                    //this is the case, that there is a loggedIn student, without any exam related to it
                    res.render('studentLogin', {
                        static: statik,
                        studentLoggedIn: false,
                        loadJs: true
                    });
                }
            });
        } else {
            if (req.session.professor){
                res.render('studentLogin',{
                    static: statik,
                    loadJs : false
                });
            } else {

                res.render('studentLogin',{
                    static: statik,
                    loadJs : true
                });
            }
        }
    },
    setStartIndexAutoIncrement: function () {
        var _this = this;
        _this.models.bin.getLastIdSandbox(null, function (err, result) { //result is the content of the query mysql to table sandbox
            if (err) {
                return (err);
            }
            //result variable contains an array of one object with an index : 'MAX(`id`)' that contains the value
            utils.setAutoIncrementIndex(result[0]['MAX(`id`)']);
        });
    },

    updateList:function (req, res, next) {
        var _this = this;
        var statik = _this.helpers.urlForStatic('', req.secure);
        var studentData = req.session.student;
        var params = moment().format('YYYY-MM-DD') + "_" + studentData.name + "_" + studentData.surname + "_" + studentData.matricola + "_" + studentData.postazione;
        var urlList = statik+"/listPage_"+params;
        var dataToSend = {
            listQuestionUrl : urlList
        };

        res.json(dataToSend);
    },

    getAllExamDate: function (req, res, next) {
        //control if the access is allowed from this request
        if (req.session.professor) {
            var _this = this;
            _this.models.bin.getAllExamDate(null, function (err, result) { //result is the content of the query mysql to table sandbox
                if (err) {
                    return next(err);
                }

                var dateArray = [];
                //now validate html call in your callback function the function for validate css, and after javascript and so on with mocha and chai
                if (result.length) {
                    var date = result[0].url.split("_")[0];
                    dateArray.push(date);

                    for (var i = 1; i < result.length; i++) {
                        if (result[i].url.split("_")[0] !== date) {
                            date = result[i].url.split("_")[0];
                            dateArray.push(date);
                        }
                    }
                }

                res.json(dateArray);

            });
        } else {
            res.render("errorPage", {
                serviceIsNotAccessible : true
            });
        }
    },

    getAllSandbox: function (req, res, next){
        var _this  = this;

       function sendResult(res, result){
           //I write a file in memory with the result of exam validation (of course a JSON file)
           var target_path = '././public/myjsbin/correction/' + "correction.json";
           fs.writeFileSync(target_path, JSON.stringify(result, null, 4));
           res.json(result);
       }

       function validateCss(record){ //result[0].css
           w3cvalidator.validate({
               //file: 'style.css', // file can either be a local file or a remote file
               //file: 'http://html5boilerplate.com/',
               input: record.css,
               //input: myBuffer,
               output: 'json', // Defaults to 'json', other option includes html
               //doctype: 'HTML5', // Defaults false for autodetect
               //charset: 'utf-8', // Defaults false for autodetect
               //proxy: 'http://proxy:8080', // Default to null
               callback: function (response) { //TODO gestire i risultati qui
                   console.log("Risultati validate CSS ");
//                   console.log(response);
                   exams[examIndex].error_Css_messages = response.messages;
                   exams[examIndex].error_Css = response.messages.length;
                   // depending on the output type, res will either be a json object or a html string
                   validateJavascript(record);
               },
               onError: function (){
                   console.log("non è stato possibile accedere alla rete");
                   var typeOfException = "non è stato possibile accedere\n alla rete per validare il compito";
                   res.json({
                       exception : true,
                       typeOfException : typeOfException
                   });
               },
               // section for css validation
               validate: 'css', // defaults to html
               profile: 'css3', // possible profiles are: none, css1, css2, css21, css3, svg, svgbasic, svgtiny, mobile, atsc-tv, tv
               medium: 'all', // possible media are: all, aural, braille, embossed, handheld, print, projection, screen, tty, tv, presentation
               warnings: 'no' // possible warnings are: 2 (all), 1 (normal), 0 (most important), no (no warnings)
           });
       }

       function validateHtml(record) { //result[i].html
           console.log("i am in validate Html");
           parseUrl(record.url);
           w3cvalidator.validate({
               //file: 'demo.html', // file can either be a local file or a remote file
               //file: 'http://html5boilerplate.com/',
               input: record.html,
               //input: myBuffer,
               output: 'json', // Defaults to 'json', other option includes html
               callback: function (response) {
                   console.log("html validato");
                   //console.log(response);
                   exams[examIndex].error_Html_messages = response.messages;
                   exams[examIndex].error_Html = response.messages.length;
                   validateCss(record);
               },
               onError: function (){
                   console.log("non è stato possibile accedere alla rete");
                   var typeOfException = "non è stato possibile accedere\n alla rete per validare il compito";
                   res.json({
                       exception : true,
                       typeOfException : typeOfException
                   });
               }
           });
       }

       function parseUrl(url){
           var urlArray = url.split("_");
           console.log(urlArray);
           exams[examIndex].name = utils.decodeSpecialChars(urlArray[1]);
           exams[examIndex].surname = utils.decodeSpecialChars(urlArray[2]);
           exams[examIndex].matricola = urlArray[3];
           exams[examIndex].postazione = urlArray[4];

           //TODO create the url for whatch the exam
           //var statik = helpers.urlForStatic(undefined, ssl);
           var statik = _this.helpers.urlForStatic('', req.secure);
           var examUrl = statik+"/"+exams[examIndex].url+"/"+jsbinIdArray[0]+"/"+exams[examIndex].revision+"/edit";
           console.log("EXAMURL "+examUrl);
           exams[examIndex].examUrl = "<a href='"+examUrl+"' target='_blank'>Show Exam</a>";
       }

       function validateJavascript(record){
           try {
               var esprimaResult = esprima.parse(record.javascript, { tolerant: true, loc: true });
               exams[examIndex].error_Javascript_messages = esprimaResult.errors;
               exams[examIndex].error_Javascript = esprimaResult.errors.length;
           } catch (e){
               exams[examIndex].error_Javascript_messages = {
                   exception: true,
                   error: e.toString()
               };
               exams[examIndex].error_Javascript = 1;
           }
           console.log("javascript validato");
           console.log(useValidationCustom);
           //the professor want to use custom validation???
           if (useValidationCustom) {
               console.log("non è possibile che io riesca ad entrare qui dentro");
               customValidationMochaChai(record);
           } else {

               exams[examIndex].failure_Mocha = "Disabilitata";
               exams[examIndex].pass_Mocha = "Disabilitata";
               var proposalVote = moduleVote.makeVote(exams[examIndex],useValidationCustom);
               exams[examIndex].proposal_vote = proposalVote;

               examIndex++;

               if (examIndex === exams.length){
                   sendResult(res,exams);
               } else {
                   validateHtml(exams[examIndex]);
               }
           }
       }

       function customValidationMochaChai(record){
           parseUrl(record.url);
           console.log("custom validation");
           var $ = cheerio.load(record.html);
           $("head").append("\n<style>\n" + record.css + "\n</style>");
           $("html").append("<script src='https://ajax.googleapis.com/ajax/libs/jquery/1.11.0/jquery.min.js'></script>");
           $("html").append("\n<script>\n"+ record.javascript +"\n</script>");
//           $("html").append("\n<script>\n  var y = $('body').length; var x = 11; \n $(document).ready(function(){ \n x= $('p').length; \n }); function zeta() { return 3;} </script>");
            var html = $.html();
            //console.log(html);

           var doc   = jsdom.jsdom(html, null, {
               features: {
                   FetchExternalResources   : ['script'],
                   ProcessExternalResources : ['script'],
                   MutationEvents           : '2.0',
                   QuerySelector            : false
               }
           });

           var window = doc.parentWindow;
           window.addEventListener('load',  function(){

                console.log("I load the dom");
               testConfig.setExam(window);

               var mocha = new Mocha();
               mocha.addFile("test/myjsbin/testExam3");

               var passed = [];
               var failed = [];

               mocha.run(function(){
                   var tmpPath = __dirname.substr(0,__dirname.indexOf("handlers")-4);
                   console.log(tmpPath);
                   //console.log(require.cache[tmpPath+'test'+pathModule.sep+'myjsbin'+pathModule.sep+'testExam2.js']);

                   //this istruction do the MAGIC
                   delete require.cache[tmpPath+'test'+pathModule.sep+'myjsbin'+pathModule.sep+'testExam3.js'];
//                   delete require.cache['c:\\Users\\Trappola\\WebstormProjects\\myJsbin\\test\\myjsbin\\testExam2.js'];
                   console.log(passed.length + ' Tests Passed');
                   passed.forEach(function(testName){
                       console.log('Passed:', testName);
                   });

                   console.log("\n"+failed.length + ' Tests Failed');
                   failed.forEach(function(testName){
                       console.log('Failed:', testName);
                   });

                   exams[examIndex].failure_Mocha_messages = failed;
                   exams[examIndex].failure_Mocha = failed.length;

                   exams[examIndex].pass_Mocha_messages = passed;
                   exams[examIndex].pass_Mocha = passed.length;

                   var proposalVote = moduleVote.makeVote(exams[examIndex],useValidationCustom);
                   exams[examIndex].proposal_vote = proposalVote;

                   examIndex++;

                   if (examIndex === exams.length){
                       sendResult(res,exams);
                   } else {
                       validateHtml(exams[examIndex]);
                   }


               }).on('fail', function(test){
                   failed.push(test.title);
               }).on('pass', function(test){
                   passed.push(test.title);
               });
           });
       }

       var examIndex;
       var exams;
       var useValidationCustom;
       //control if the access is allowed from this request
       if (req.session.professor) {
           useValidationCustom = req.query.useCustomValidation === "false" ? false : true;
           console.log(useValidationCustom);
           var date = req.query.date;
           date = date + "%finish";
           _this.models.bin.getAllFinishStudents(date, function (err, result) { //result is the content of the query mysql to table sandbox
               if (err) {
                   return next(err);
               }

               exams = result;
               examIndex = 0;

               //now validate html call in your callback function the function for validate css, and after javascript and so on with mocha and chai
               if (exams.length) {
                   validateHtml(result[examIndex]);
               } else {
                   res.json(exams);
               }
           });
       } else {
           res.render("errorPage", {
               serviceIsNotAccessible : true
           });
       }
    },

    getDataStudentLogin:function(req, res){
        var result = studentData.getDataStudent();
        if(result){
            res.json(result);
        }
    },

    updateCompleteExam:function(req, res){
        var _this = this;
        var urlExam = req.body.urlExam;
        studentData.setUrlExamComplete(urlExam);

        //clear All cookie from student ==> important instruction ;)
        req.session.student = null;

        var statik = _this.helpers.urlForStatic('', req.secure);
        var urlForFinish = statik+"/finishExam";
        var dataToSend = {
            finishPageUrl : urlForFinish
        };

        res.json(dataToSend);
    },

    getFinishPage: function(req, res){
        var _this = this;
        var statik = _this.helpers.urlForStatic('', req.secure);
        var urlForFinish = statik+"/finishExam";
        var dataToSend = {
            finishPageUrl : urlForFinish
        };

        res.json(dataToSend);
    },

    getDataStudentEnd:function(req, res){
        var strUrlExam = studentData.getUrlExamComplete();
        if(strUrlExam){
            res.json(strUrlExam);
        }
        else{
            res.json({
                ok : false
            });
        }
    },

    getClockClassroom: function (req,res, next){
        res.json(clockAula.getClockAula());
    },
    setClockClassroom:  function (req,res, next){
        //control if the access is allowed from this request
        if(req.session.professor){
            var newStatus = req.body.status;
            res.json(clockAula.setClockAula(newStatus));
        }
        else{
            res.render("errorPage", {
                serviceIsNotAccessible : true
            });
        }
    },
    setDataClockClassromm: function (req,res){
        //control if the access is allowed from this request
        if (req.session.professor) {
            //assign field of the body in my variable with a simple conversion
            var newDurationTest = req.body.inputDurationTest * MINUTE1MILLIS;

            res.json(clockAula.setDataClockAula(newDurationTest));
        }
        else{
            res.render("errorPage", {
                serviceIsNotAccessible : true
            });
        }
    },

    setDataOverTimeOne: function(req, res, next){
        if (req.session.professor) {
            res.json(clockAula.setOverTime(MINUTE1MILLIS));
        }
        else{
            res.render("errorPage", {
                serviceIsNotAccessible : true
            });
        }
    },

    setDataOverTimeFive: function(req, res, next){
        if (req.session.professor) {
            res.json(clockAula.setOverTime(MINUTE5MILLIS));
        }
        else{
            res.render("errorPage", {
                serviceIsNotAccessible : true
            });
        }
    },

    setDataOverTimeHalfHour: function(req, res, next){
        if (req.session.professor) {
            res.json(clockAula.setOverTime(MINUTE30MILLIS));
        }
        else{
            res.render("errorPage", {
                serviceIsNotAccessible : true
            });
        }
    },

    setVoteWeight: function (req,res){
        //control if the access is allowed from this request
        if(req.session.professor){
            //recovery field from request's body
            var weightStandardHtml = req.body.inputWeightHtml;
            var weightStandardCss = req.body.inputWeightCss;
            var weightStandardJavascript = req.body.inputWeightJavascript;
            var weightMochaFailure = req.body.inputWeightMocha;
            var startVote = req.body.inputStartVote;

            moduleVote.setVoteWeight(weightStandardHtml, weightStandardCss, weightStandardJavascript, weightMochaFailure, startVote);
            res.json({
                ok: true,
                message: "Pesi Voto Aggiornati con successo"
            });
        }
        else{
            res.render("errorPage", {
                serviceIsNotAccessible : true
            });
        }
    },

  // creates a object that's API request friendly - ie. gets rendered
  // output if there's a processor and hides internal fields
  apiPrepareBin: function (bin) {
    var out = _.pick(bin,
      'html',
      'javascript',
      'css',
      'original_html',
      'original_javascript',
      'original_css',
      'created',
      'last_updated'
    );

    out.permalink = this.helpers.urlForBin(bin, true);

    if (bin.settings && bin.settings.processors) {
      out.processors = bin.settings.processors;
    }

    // note: if there's no processor, then the "original_*" fields

    return out;
  },
  apiGetBin: function (req, res, next) {
    this.applyProcessors(req.bin).then(function (bin) {
      res.json(this.apiPrepareBin(bin));
    }, function () {
      res.json(null);
    });
  },
  live: function (req, res, next) {
    req.live = true;
    next();
  },
  embed: function (req, res, next) {
    req.embed = true;
    next();
  },
  testPreviewAllowed: function (req, res, next) {
    /**
     * if the bin does not have a user who create it
     * and it was made 2 hours ago
     * then redirect to the /edit url
     */
    var user = undefsafe(req, 'bin.metadata.name');
    if (config.security.allowAnonymousPreview !== true && user === 'anonymous' || !user) {
      var created = req.bin.created;

      // this is hard coded for production jsbin.com - it means that all bins
      // created before we released this change won't be affected by the limit
      if (config.url.host === 'jsbin.com') {
        if (req.bin.id < 10786492) {
          return next();
        }
      }

      // test the time created, and if it's older than 90 minutes, then redirect
      // to the edit view. Details as to why on our blog
      if ((Date.now() - created.getTime()) / 1000 / 60 > 90) {
        var msg = 'This bin was created anonymously and its free preview time has expired.';

        if (!req.session.user) {
          msg += ' <a href="/register">Get a free unrestricted account</a>';
        } else {
          msg += ' <a href="/clone">Clone it to enable the full preview</a>';
        }
        res.flash(req.flash.NOTIFICATION, msg);
          console.log("URLJSBIN "+this.helpers.urlForBin(req.bin));
          console.log("REQBIN "+JSON.stringify(req.bin));
        return res.redirect(this.helpers.urlForBin(req.bin) + '/edit');
      }
    }
    next();
  },
  getBinPreview: function (req, res, next) {
    // if we're loading a username/last(-:n)? and no 'n' is present
    // it breaks quiet, leaving it as undefined, here we manually
    // check for it and modify the req.params to reflect the url.
    // the reason we check for user name is so there aren't conflicts
    // loading a bin called quiet.
    if(req.params.username && req.url.indexOf('quiet') !== -1) {
      req.params.quiet = 'quiet';
    }
    var options = {
      edit: !req.param('quiet'),
      silent: !!req.param('quiet'),
      csrf: req.session._csrf
    };

    this.protectVisibility(req.session.user, req.bin, function(err, bin) {
      new Promise(function (resolve, reject) {
        // if there's a subdomain
        if (req.subdomain) {
          // TODO handle orgs here too
          // ignore orgs for now
          //
          // if the subdomain
          if (custom[req.subdomain]) {
            // custom domain
            resolve();
          } else if (req.subdomain !== undefsafe(bin, 'metadata.name')) {
            reject('username does not match');
          } else {
            if (features('vanity', { session: { user: bin.metadata }})) {
              resolve();
            } else {
              reject('vanity feature not enabled');
            }
          }
        } else {
          resolve();
        }
      }).then(function () {
        this.formatPreview(req, req.bin, options, function (err, formatted) {
          if (err) {
            // don't hide inside a promise
            // return next(err);
            throw err;
          }

          if (req.ajax && req.params.format !== 'html') {
            res.json(this.apiPrepareBin(req.bin));
          } else if (formatted) {
            res.send(formatted);
          } else {
            res.contentType('js');
            res.send(req.bin.javascript);
          }
        }.bind(this));
      }.bind(this)).catch(function (error) {
        if (error instanceof Error) {
          next(error);
        } else {
          res.redirect(this.helpers.url(req.url, true));
        }
      }.bind(this));
    }.bind(this));
  },
  // TODO decide whether this is used anymore
  getBinSource: function (req, res) {
    var copy = _.extend({}, req.bin);
    copy.sourceOnly = req.sourceOnly;
    this.protectVisibility(req.session.user, copy, function(err, bin){
      res.contentType('text/plain');
      var file = binToFile(bin, { proto: req.secure ? 'https' : 'http' });
      res.send(file);
    }.bind(this));
  },
  getBinSourceFile: function (req, res) {
    this.protectVisibility(req.session.user, req.bin, function(err, bin){
      var format = req.params.format,
          settings = bin.settings || {},
          reverseProcessorLookup = {},
          contentType = processors.mime[format] || processors.mime._default;

      // this doesn't do anything except tell you, the reader, what's going on.
      req.bin = bin;

      if (format === 'js' || format === 'json') {
        format = 'javascript';
        contentType = 'application/javascript';
      }

      if (format === 'md') {
        format = 'markdown';
      }

      if (format === 'coffee') {
        format = 'coffeescript';
      }

      if (format === 'ls') {
        format = 'livescript';
      }

      if (format === 'svg') {
        contentType = 'image/svg+xml';
        req.bin.svg = req.bin.html;
        res.set('X-Frame-Options', 'SAMEORIGIN');
      }

      var _this = this;

      new Promise(function (resolve, reject) {
        if (!settings.processors) {
          return resolve(bin);
        }

        if (settings.processors) {
          // first shuffle the bin around so they can request .less and get the
          // .css panel...yeah, funky { html: 'markdown' }
          Object.keys(settings.processors).forEach(function (key) {
            if (settings.processors.hasOwnProperty(key)) {
              reverseProcessorLookup[settings.processors[key]] = key;
            }
          });

          // if we want the raw preprocessed content, just map
          if (reverseProcessorLookup[format]) {
            bin[format] = bin[reverseProcessorLookup[format]];
            resolve(bin);
          } else if (settings.processors[format]) {
            // else we need to convert and process the source
            if (processors.support(settings.processors[format])) {
              // keep only the single processor we need
              var singleProcessor = {};
              singleProcessor[format] = settings.processors[format];
              bin.settings.processors = singleProcessor;

              _this.applyProcessors(bin).then(function (results) {
                bin = results[0];

                // Processor object
                if (typeof bin[format] === 'object') {
                  if (bin[format].result !== null) {
                    bin[format] = bin[format].result;
                  } else if (bin[format].errors !== null) {
                    // TODO do we show the errors in the source code?
                    bin[format] = bin[format].errors;
                  }
                }

                // bin[format] = bin[settings.processors[format]];
                // this delete ensures it doesn't happen again (in case we're
                // looking at .html)
                delete bin.settings.processors[format];
                resolve(bin);
              }, function (error) {
                reject(error);
              });
            } else {
              reject('Unsupported extension: ' + settings.processors[format]);
            }
          } else { // usually for .html
            resolve(bin);
          }
        }
      }).then(function () {
        if (format !== 'html' || contentType !== 'text/html') {
          res.contentType(contentType);
          res.send(req.bin[format]);
        } else {
          _this.getBinPreview(req, res);
        }
      }).catch(function (error) {
        console.log('500', error);
        res.send(500);
      });
    }.bind(this));
  },
  getUserBins: function (req, res, next) {
    var _this = this;

    var username = req.params.user || undefsafe(req, 'session.user.name');

    if (!username) {
      // FIXME tmp fix to kick out 404 infinite loop
      return res.send('<meta http-equiv="refresh" content="0">');
      // return next(404);
    }

    // TODO: convert to promise
    this.models.user.load(username, function (error, user) {
      if (error || !user) {
        return next(404);
      }

      this.models.user.getBins(req.params.user || req.session.user.name, function (err, bins) {
        if (err) {
          return next(404);
        }

        this.renderHistory(req, res, next, bins);
      }.bind(this));
    }.bind(this), true);
    // ^^^^ indicates we want to only check by username (and don't bother email check)
  },
  getLatestForUser: function (req, res, next) {
    var _this = this;

    if (!req.user) {
      return next(new errors.NotFound('User not found'));
    }

    this.models.user.getLatestBin(req.user.name, req.params.n || 0, undefsafe(req, 'session.user.name'), function (err, bin) {
      if (err && err !== 401) {
        return next(err);
      }

      if (!bin || err === 401) {
        metrics.increment('bin.404');
        if (req.url.indexOf('/edit') !== -1) {
          var root = _this.helpers.url('', true);
          return res.redirect(root);
        }
        return next(new errors.BinNotFound('Could not find bin: ' + req.params.bin));
      } else {
        req.bin = bin;
        next();
      }

    });
  },
  redirectToLatest: function (req, res) {
    var path = req.originalUrl.replace('latest', req.bin.revision);
    res.redirect(303, path);
  },
  createBin: function (req, res, next) {
      var Jsbinchecked = studentData.getJsbinChecked();
    var params = utils.extract(req.body, 'html', 'css', 'javascript', 'settings'),
        _this  = this;

    this.validateBin(params, function (err) {
      if (err) {
        return next(err);
      }

      params.length = utils.binUrlLength(req);

      metrics.increment('bin.create');

        //aggiungiamo dei dati a params
        params.student = req.session.student;

      _this.models.bin.create(params, function (err, result) {
        if (err) {
          return next(err);
        }

        _this.completeCreateBin(result, req, res, next);
      });
    });
  },
  apiCreateBin: function (req, res, next) {
    var params = utils.extract(req.body, 'html', 'css', 'javascript', 'settings'),
        _this  = this;

    this.validateBin(params, function (err) {
      if (err) {
        return next(err);
      }

      params.settings = params.settings || '{ processors: {} }'; // set default processors
      params.length = utils.binUrlLength(req);
      _this.models.bin.create(params, function (err, result) {
        if (err) {
          return next(err);
        }

        _this.completeCreateBin(result, req, res, next, function() {
          res.json(result);
        });
      });
    });
  },
  claimBin: function (req, res, next) {
    // Handler for ambiguous endpoint that can be used to create a new bin with
    // a provided bin url, clone the bin and create a new endpoint or update an
    // existing one with no revision.  We use :url instead of :bin in the route
    // to prevent 404ing on a bin to be created.
    if (req.param('method') === 'save') {
      req.bin = {url: req.param('url'), revision: 0};
      return this.createRevision(req, res, next);
    }

    // If we're not claiming a new url then it's either a simple revision
    // or a clone. We pass this on to the next route which should use
    // .createRevisionOrClone() and :bin in the route segment to load the bin.
    next();
  },
  createRevisionOrClone: function (req, res, next) {
      console.log("createRevisionOrClone");
    // Another endpoint that does two things based on the content of the
    // POST body. Need to check for "new" in the method which is "clone".
    if (req.param('method', '').indexOf('new') > -1) {
      this.createBin(req, res, next);
    } else {
        console.log("createRevision");
      this.createRevision(req, res, next);
    }
  },
  setBinAsPrivate: function(req, res, next) {
    if (!req.session.user || !req.session.user.pro) {
      return res.send(301);
    }
    this.models.bin.setBinVisibility(req.bin, req.session.user.name, 'private', function(err, bin){
      if (err) {
        res.send(err);
      }
      res.send(200, 'OK');
    });
  },
  setBinAsPublic: function(req, res, next) {
    if (!req.session.user || !req.session.user.pro) {
      return res.send(301);
    }
    this.models.bin.setBinVisibility(req.bin, req.session.user.name, 'public', function(err, bin){
      if (err) {
        res.send(err);
      }
      res.send(200, 'OK');
    });
  },
  apiCreateRevision: function (req, res, next) {
    var that = this,
        params = utils.extract(req.body, 'html', 'css', 'javascript', 'settings');

    params.url = req.params.bin;
    params.revision = parseInt(req.params.rev, 10) || req.bin.revision;
    params.settings = params.settings || '{ processors: {} }'; // set default processors
    params.summary = utils.titleForBin(params);

    this.validateBin(params, function (err) {
      if (err) {
        return next(err);
      }

      var username = req.session.user ? req.session.user.name : undefined;

      that.models.user.isOwnerOf(username, params, function (err, result) {
        var method = 'create';

        if (result.isowner || result.found === false) { // if anonymous or user is owner
          params.revision += 1; // bump the revision from the *latest*
          that.models.bin.createRevision(params, function (err, result) {
            var query = {id: req.params.bin, revision: result.revision};
            if (err) {
              return next(err);
            }

            that.models.bin.load(req, query, function (err, result) {
              if (err) {
                return next(err);
              }
              that.completeCreateBin(result, req, res, next, function() {
                res.json(result);
              });
            });
          });
        } else {
          res.status(403); // forbidden
          res.json({ error: 'You are not the owner of this bin so you cannot create a revision' });
        }
      });
    });
  },
  createRevision: function (req, res, next) {
      var Jsbinchecked = studentData.getJsbinChecked();
    var panel  = req.param('panel'),
        params = {},
        handler  = this,
        models = this.models;

    if (req.param('method') === 'save') {
        console.log("method save");
      params = utils.extract(req.body, 'html', 'css', 'javascript', 'settings');
      params.url = req.bin.url;
      params.revision = parseInt(req.params.rev, 10) || 1; //req.bin.revision;
      // Catch for when this is a claimed bin, with no metadata as it does not exist in the owners table yet.
      // We would put this in the :bin param but the claimBin uses :url to get around the error that would be thrown.
      params.visibility = req.bin.metadata ? req.bin.metadata.visibility : 'public';
      // this is the bin that will be *created*
      var bin = _.extend({}, req.bin || {}, params);
      params.summary = utils.titleForBin(bin);

      this.validateBin(params, function (err) {
        if (err) {
          return next(err);
        }

        var username = req.session.user ? req.session.user.name : undefined;

        handler.models.user.isOwnerOf(username, params, function (err, result) {
          var method = 'create';

          if (result.found && result.result.active === 'n') { // this is a deleted bin
            metrics.increment('bin.fork');
            delete params.revision;
          } else if (result.isowner || result.found === false) {
            metrics.increment('bin.create-revision');
            method = 'createRevision';
            params.revision = req.bin.revision + 1; // bump the revision from the *latest*

            if (result.isowner) {
              // remove the streaming_key from this one
              handler.models.bin.updateBinData(req.bin, { streaming_key: '' }, function (error) { // jshint ignore:line
                if (error) {
                  console.error('models.bin.updateBinData:streaming_key', error);
                }
              });
            }
          } else {
            delete params.revision;
            metrics.increment('bin.fork');
          }

          params.length = utils.binUrlLength(req);

          handler.models.bin[method](params, function (err, result) {
            if (err) {
              return next(err);
            }

            // Notify interested parties (spike) that a new revision was created
            var oldBin = req.bin;
            handler.once('created', function (newBin) {
              handler.emit('new-revision', bin, newBin);
            });

            handler.completeCreateBin(result, req, res, next);
          });
        });
      });
    } else if (req.param('method') === 'update') {
        console.log("method update");
      params[panel] = req.param('content');
      params.streamingKey = req.param('checksum');
      params.revision = req.param('revision');
      params.url = req.param('code');
      params.settings = req.param('settings');
      params.panel = panel;
      params.panel_open = !!params[panel];

        /*** Salvataggio dati all'interno del file Json dello studente ***/
        var urlFile = studentData.getUrlFileStudent();
        var content = fs.readFileSync(urlFile, "utf8");
        var obj = JSON.parse(content);

        if(panel === "html"){
            obj.question[Jsbinchecked - 1].html = params[panel].split("\n");
        }
        else if(panel === "css"){
            obj.question[Jsbinchecked - 1].css = params[panel].split("\n");
        }
        else{
            obj.question[Jsbinchecked - 1].javascript = params[panel].split("\n");
        }

        var json = JSON.stringify(obj, null, 2);
        fs.openSync(urlFile, "w");
        fs.appendFileSync(urlFile, json);
        /*******************************************************************/

      // this is the bin that will be *created*
      var bin = _.extend({}, req.bin || {}, params);

      // ensure our summary comes from the complete bin picture
      params.summary = utils.titleForBin(bin);

      this.validateBin(bin, function (err) {
        if (err) {
          return next(err);
        }

        metrics.increment('bin.update');

        handler.models.bin.updatePanel(panel, params, function (err, result) {
          if (err) {
            return res.json({ok:false, error: err});
            // return next(err);
          }

          if (req.session.user) {
            handler.models.user.updateOwners(req.session.user.name, params, function () {});
            handler.emit('latest-for-user', req.session.user.name, req.bin);

            var dropbox_token = undefsafe(req, 'session.user.dropbox_token');
            if (features('dropbox', req) && !!dropbox_token) {
              handler.applyProcessors(bin).then(function (result) {
                models.bin.saveToDropbox(result[0], dropbox_token);
              }).catch(function (error) {
                console.error(error);
              });
            }
          }

          handler.emit('updated', req.bin, {
            panelId: panel,
            content: params[panel]
          });

          res.json({ok: true, error: false});
        });
      });
    } else {
        console.log("method next");
      next();
    }
  },
  reload: function (req, res, next) {
    var params = {},
        _this = this;

    params.streamingKey = req.param('checksum');
    params.revision = req.param('revision');
    params.url = req.param('code');

    // this is the bin that will be *created*
    var bin = _.extend({}, req.bin || {}, params);

    this.validateBin(bin, function (err) {
      if (err) {
        return next(err);
      }

      metrics.increment('spike.reload');

      if (req.session.user) {
        _this.models.user.touchOwners(req.session.user.name, params, function () {});
        _this.emit('latest-for-user', req.session.user.name, req.bin);
      }

      _this.emit('reload', req.bin);

      res.json({ok: true, error: false});
    });
  },
  completeCreateBin: function (bin, req, res, next, renderFn) {
    var _this  = this;

    if (!bin.summary) {
      bin.summary = utils.titleForBin(bin);
    }

    function render() {
      if (renderFn) {
        renderFn();
      } else {
        _this.emit('created', bin);
        _this.renderCreated(req, res, bin);
      }
    }

    // If we have a logged in user then assign the bin to them.
    if (req.session.user && req.session.user.name) {
      _this.models.user.setBinOwner(req.session.user.name, bin, function (err) {
        if (err) {
          return next(err);
        }
        render();
      });
    } else {
      render();
    }
  },
  downloadBin: function (req, res, next) {
    this.protectVisibility(req.session.user, req.bin, function(err, bin) {
      var filename = ['jsbin', bin.url, bin.revision, 'html'].join('.');

      var data = {
        domain: this.helpers.set('url host'),
        permalink: this.helpers.editUrlForBin(bin, true),
        user: undefsafe(bin, 'metadata.name') || false,
        year: (new Date()).getYear() + 1900
      };

      // get the meta tag with license
      this.helpers.render('comment', data, function (err, meta) {
        bin.meta = meta;

        var file = binToFile(bin, { proto: req.secure ? 'https' : 'http' });

        metrics.increment('bin.download');

        res.header('Content-Disposition', 'attachment; filename=' + filename);
        res.send(file);
      });
    }.bind(this));
  },
  notFound: function (req, res, next) {
    var files = this.defaultFiles(),
        _this = this,
        errorMessage;

    // files[0] = 'not_found.html';
    // files[2] = 'not_found.js';

    if (req.isApi || req.ajax) {
      res.status(404);
      errorMessage = 'Could not find bin with ID "' + req.param('bin') + '"';
      if (req.param('rev')) { errorMessage += ' and revision ' + req.param('rev'); }
      res.json({ error: errorMessage });
    } else {
      this.loadFiles(files, function (err, results) {
        if (err) {
          return next(err);
        }

        results.url = req.param('bin');

        // Need to get the most recent revision from the database.
        var bin = {};
        // so go ahead and completely reset the bin to a not found state
        bin.metadata = {};
        bin.html = results[0];
        bin.css = results[1];
        bin.javascript = results[2];

        if (req.url.indexOf('edit') > -1) {
          _this.render(req, res, results);
        } else {
          var options = {edit: true, silent: true, csrf: req.session._csrf};
          _this.formatPreview(req, results, options, function (err, formatted) {
            if (err) {
              return next(err);
            }

            if (formatted) {
              res.send(formatted);
            } else {
              res.contentType('js');
              res.send(bin.javascript);
            }
          });
        }
      });
    }
  },
  loadBin: function (req, res, next) {
    var rev    = parseInt(req.params.rev, 10) || 'latest',
        username = undefsafe(req, 'session.user.name'),
        query  = {id: req.params.bin, revision: rev, username: username },
        helpers = this.helpers,
        models = this.models;

    function complete(err, result) {
      if (err && err !== 401) {
        return next(err);
      }

      if (!result || err === 401) {
        metrics.increment('bin.404');
        return next(new errors.BinNotFound('Could not find bin: ' + req.params.bin));
      } else {
        var flag = undefsafe(result, 'metadata.flagged');
        if (flag) {
          var ip = (req.headers['x-real-ip'] || req.ip);
          if (username === result.metadata.name && ip !== flag) {
            // log ip
            models.user.updateOwnershipData(username, {
              flagged: ip
            }, function () {});
            // continue to next()
          } else if (username !== result.metadata.name && ip !== flag) {
            metrics.increment('bin.404-banned-user');
            return next(new errors.BinNotFound('Could not find bin: ' + req.params.bin));
          }
        }

        req.bin = result;
        // manually add the full url to the bin to allow templates access
        req.bin.permalink = helpers.urlForBin(req.bin, true);

        next();
      }
    }

    // TODO: Re-factor this logic.
    if (rev === 'latest' || req.path.indexOf('save') !== -1) {
      models.bin.latest(req, query, complete);
    } else {
      models.bin.load(req, query, complete);
    }
  },
  protectVisibility: function (user, bin, cb) {
    if (this.models.bin.isVisible(bin, undefsafe(user, 'name'))) {
      return cb(null, bin);
    }

    metrics.increment('bin.visibility.deined');
    this.loadFiles(this.defaultFiles(), function(err, files) {
      bin.javascript = files.javascript;
      bin.html = files.html;
      bin.css = files.css;
      cb(err, bin);
    });
  },
  validateBin: function (bin, fn) {
    var reserved = this.helpers.set('reserved') || [];

    var panels = 'html javascript css'.split(' ').map(function (key) {
      return (bin[key] || '').trim();
    }).filter(function (content) {
      return content.length;
    });

    if (!blacklist.validate(bin)) {
      metrics.increment('bin.validate.blacklisted');
      fn(new errors.BadRequest('Unable to save: Post contains blacklisted content'));
    } else if (bin.url && reserved.length && reserved.indexOf(bin.url) > -1) {
      metrics.increment('bin.validate.reserved');
      fn(new errors.BadRequest('Unable to save: This is a reserved url'));
    } else if (panels.length === 0) {
      metrics.increment('bin.validate.empty');
      fn(new errors.BadRequest('Unable to save: The bin has no content'));
    } else {
      fn();
    }
  },
  render: function renderEdit(req, res, bin) {
    this.protectVisibility(req.session.user, bin, function(err, bin) {

      var template = this.templateFromBin(bin),
          customConfig = custom[req.subdomain],
          helpers = this.helpers,
          version = helpers.set('version'),
          created = req.flash('checksum') || {},
          sslForAll = features('sslForAll', req),
          ssl = req.embed ? req.secure && sslForAll : sslForAll,
          root = helpers.url('', true, ssl),
          _this = this,
          user = req.session.user || {},
          production = (req.cookies && req.cookies.debug) ? false : helpers.production,
          jsbin;

      // Insert the subdomain if the request has one. Ideally this should be
      // done by the helper.url() function but it's not currently aware of the
      // request object.
      if (req.subdomain && customConfig) {
        root = root.replace('://', '://' + req.subdomain + '.');
      }

      var statik = helpers.urlForStatic(undefined, ssl);

      jsbin = this.jsbin(bin, {
        version: version,
        token: req.session._csrf,
        root: root,
        shareRoot: features('vanity', req) ? 'http://' + user.name + '.' + req.app.get('url host') : root,
        metadata: bin.metadata,
        runner: helpers.runner,
        static: statik,
        settings: !bin.url ? customConfig && customConfig.settings : {},
        // If we've pulled a just created bin out of the flash messages object
        // then we check to see if the previously created bin is the one we're
        // about to load. If so we add the checksum to the page which allows
        // the spike logic to work in IE8.
        checksum: created.url === bin.url && created.revision === bin.revision && created.checksum
      });

      jsbin.user = user;

      // TODO I guess this isn't the clean way of doing this? -- RS
      // TODO WORK OUT WHETHER THIS IS NOT THE OWNER AND STREAMING
      if (req.live || req.embed || req.sandbox) {
        jsbin.saveDisabled = true;
      }

      if ((!jsbin.state.checksum && jsbin.state.streaming === true) && (bin.metadata.name !== user.name)) {
        jsbin.saveDisabled = true;
      }

      if (req.embed) {
        jsbin.embed = true;
      }

      if (req.sandbox) {
        jsbin.sandbox = true;
      }

      if (custom[req.subdomain]) {
        jsbin.custom = true;
      }

      // as backup - i.e. the user has not refreshed their session and
      // req.session.user.settings === null - which we don't want.
      if (!undefsafe(jsbin, 'user.settings')) {
        jsbin.user.settings = {};
      }


      var url = helpers.urlForBin(bin),
          user = req.session.user || {};

      var done = function () {
        // Sort out the tip
        var info = req.flash(req.flash.INFO),
            error = req.flash(req.flash.ERROR),
            notification = req.flash(req.flash.NOTIFICATION);

        var tip = error || notification || info,
            tipType = '';

        var addons = [];
        if (!production) {
          for (var prop in scripts.addons) {
            if (scripts.addons.hasOwnProperty(prop)) {
              addons = addons.concat(scripts.addons[prop]);
            }
          }
        }

        var embedURL = null;
        if (req.bin) {
          embedURL = helpers.editUrlForBin(req.bin, true).replace(/\/edit/, '/embed');
          if (req.secure) {
            embedURL = embedURL.replace(/http:/, 'https:');
          }
        }

        if (info) {tipType = 'info';}
        if (notification) {tipType = 'notification';}
        if (error) {tipType = 'error';}

        metrics.increment('bin.viewed');

        res.render('index', {
          editorLayout: undefsafe(user, 'settings.layout') || "0", // "0" means don't use it
          request: req,
          tips: '{}',
          revision: bin.revision || 1,
          home:  user.name || null,
          email: user.email || null,
          pro: user.pro,
          private: bin.metadata ? bin.metadata.visibility === 'private' : false,
          bin: req.bin || null,
          user: user || null,
          flash_tip: tip,
          flash_tip_type: tipType,
          gravatar: user.avatar,
          large_gravatar: req.app.locals.gravatar(user, 120),
          jsbin: JSON.stringify(jsbin).replace(/<\/script>/gi, '<\\/script>').replace(/<!--/g, '<\\!--'),
          json_template: JSON.stringify(template).replace(/<\/script>/gi, '<\\/script>').replace(/<!--/g, '<\\!--'),
          token: req.session._csrf,
          custom_css: customConfig && customConfig.css,
          scripts: production ? false : scripts.app,
          addons: production ? false : addons,
          isProduction: production,
          concat: req.cookies && req.cookies.debug ? req.cookies.debug === 'concat' : false,
          root: root,
          static: statik,
          bincount: user.bincount,
          url: url,
          embedURL: embedURL,
          vanity: features('vanity', req) ? 'http://' + req.session.user.name + '.' + req.app.get('url host') : root,
          live: req.live,
          embed: req.embed,
          code_id: bin.url,
          code_id_path: url,
          code_id_domain: helpers.urlForBin(bin, true).replace(/^https?:\/\//, ''),
          welcomePanel: welcomePanel.getData(),
          analyticsAltId: req.embed && undefsafe(config, 'analytics.render-id') ? undefsafe(config, 'analytics.render-id') : null,
          timeout: clockAula.getTimeoutInSecond(), //TODO try and after commit changes
          notProfessor: req.session.professor ? false : true
        });
      };

      if (user) {
        _this.models.user.getBinCount(user.name, function (err, result) {
          if (err || !result) {
            return done(err);
          }
          user.bincount = result.total;
          done();
        });
      } else {
        done();
      }

    }.bind(this));
  },
  renderFiles: function (req, res, files, url) {
    var _this = this;
    files = files || this.defaultFiles();
    this.loadFiles(files, function (err, results) {
      if (!err) {
        results.url = url;
        _this.render(req, res, results);
      } else {
        res.send(500, 'Unable to read file');
      }
    });
  },
  renderCreated: function (req, res, bin) {
    var permalink = this.helpers.urlForBin(bin, true),
        editPermalink = this.helpers.editUrlForBin(bin);

    if (req.ajax) {
      if (req.param('format', '').toLowerCase() === 'plain') {
        return res.contentType('txt').send(this.helpers.editUrlForBin(bin, true));
      }

      var root = this.helpers.set('url full');
      // Insert the subdomain if the request has one. Ideally this should be
      // done by the helper.url() function but it's not currently aware of the
      // request object.
      if (req.subdomain && custom[req.subdomain]) {
        root = root.replace('://', '://' + req.subdomain + '.');
        permalink = permalink.replace('://', '://' + req.subdomain + '.');
      }


      res.json({
        code: bin.url,
        root: root,
        created: (new Date()).toISOString(), // Should be part of bin.
        revision: bin.revision,
        url: permalink,
        edit: editPermalink,
        html: editPermalink,
        js: editPermalink,
        summary: utils.titleForBin(bin),
        allowUpdate: !!bin.streamingKey,
        checksum: bin.streamingKey
      });
    } else {
      // Pass the bin id through in a flash message so that IE can get
      // the checksum after the redirect.
      res.flash('checksum', {url: bin.url, revision: bin.revision, checksum: bin.streamingKey});
      res.redirect(303, editPermalink);
    }
  },
  renderHistory: function (req, res, next, bins) {
    var accepts = req.header('Accept', '');

    if (accepts === undefined) {
      return next();
    }

    var acceptsJSON = req.header('Accept', '').indexOf('application/json') > -1,
        format = acceptsJSON ? 'json' : 'html',
        helpers = this.helpers,
        jsbin = JSON.stringify({ version: helpers.production ? helpers.set('version') : 'debug',
          root: helpers.url('', true),
          static: helpers.urlForStatic()
        });


    this.formatHistory(bins, format, function (err, history) {
      if (acceptsJSON) {
        res.send(history);
      } else {
        helpers.render('history', {
          bins: history,
          by_user: req.params.user ? ' by ' + req.params.user : ''
          },
          function (err, html) {
            if (req.ajax) {
              res.send(html);
            } else {
              res.render('list', { list_history: html,
                jsbin: jsbin,
                static: helpers.urlForStatic(),
                scripts: [ '/js/vendor/jquery-1.11.0.min.js',
                  '/js/vendor/pretty-date.js',
                  '/js/render/saved-history-preview.js'
                ],
                is_production: helpers.production
              });
            }
          });
      }
    });
  },
  jsbin: function (bin, options) {
    var panels = Object.keys(_.pick(bin, 'html', 'javascript', 'css')).filter(function (panel) {
      return !!bin[panel].trim();
    }).concat('live');

    if (!options.metadata) {
      options.metadata = {};
    }

    if (options.metadata.email) {
      options.metadata.avatar = this.helpers.gravatar(options.metadata);
    }

    options.metadata = _.pick.apply(_, [options.metadata].concat('archive avatar created last_login name pro summary updated visibility'.split(' ')));

    // this value isn't always present in anonymous metadata
    options.metadata.last_updated = bin.created;

    var statik = options.static || options.root;
    var runner = this.helpers.runner;
    if (statik.indexOf('https') === 0) {
      // then ensure the runner is also https
      if (runner.indexOf('https') === -1) {
        runner = runner.replace(/http/, 'https');
      }
    }

    return {
      root: options.root,
      shareRoot: options.shareRoot,
      runner: runner,
      static: statik,
      version: options.version,
      state: {
        token: options.token,
        stream: false,
        streaming: this.models.bin.isStreaming(bin),
        code: bin.url || null,
        revision: bin.url ? (bin.revision || 1) : null,
        processors: bin.settings.processors || {},
        checksum: options.checksum || null,
        metadata: options.metadata
      },
      settings: options.settings ? _.extend(options.settings, { panels: panels }) : { panels: panels }
    };
  },
  templateFromBin: function (bin) {
    var template = utils.extract(bin, 'html', 'css', 'javascript');

    'html css javascript'.split(' ').forEach(function (panel) {
      template[panel] = utils.cleanForRender(template[panel] || '');
    });

    if (bin.post) {
      template.post = bin.post;
    }

    template.url = this.helpers.jsbinURL(bin); //.permalink;
    return template;
  },
  defaultFiles: function () {
    return ['html', 'css', 'js'].map(function (ext) {
      return 'default.' + ext;
    });
  },
  loadFiles: function (files, fn) {
    files = files || this.defaultFiles();

    async.files(files, this.helpers.set('views')).readFile('utf8').toArray(function (err, results) {
      if (!err) {
        fn(null, {
          html: results[0].data,
          css: results[1].data,
          javascript: results[2].data,
          settings: {}
        });
      } else {
        fn(err);
      }
    });
  },
  // applies the processors to the bin and generates the html, js, etc
  // based on the appropriate processor. Used in the previews and the API
  // requests.
  applyProcessors: function (bin) {
    var binSettings = {};

    // self defence against muppertary
    if (typeof bin.settings === 'string') {
      try {
        binSettings = JSON.parse(bin.settings);
      } catch (e) {}
    } else {
      binSettings = bin.settings;
    }

    if (binSettings && binSettings.processors && Object.keys(binSettings.processors).length) {
      return new RSVP.all(Object.keys(binSettings.processors).map(function (panel) {
        var processorName = binSettings.processors[panel],
            code = bin[panel];
        if (processors.support(processorName)) {
          bin['original_' + panel] = code;
          return processors.run(processorName, {
            source: code,
            url: bin.url,
            revision: bin.revision
          }).then(function (output) {
            bin[panel] = output.result;
            return bin;
          }).catch(function () {
            return bin;
          });
        } else {
          return new RSVP.resolve(bin);
        }
      }));
    }

    // otherwise default to being resolved
    return RSVP.resolve([bin]);
  },
  formatPreview: function (req, bin, options, fn) {
    var _this = this;
    var helpers = this.helpers;

    this.applyProcessors(bin).then(function (bin) {
      var formatted = bin[0].html || '';

      metrics.increment('bin.rendered');

      options = options || {};

      if (formatted) {
        if (config.analytics && config.analytics['render-id']) {
          helpers.renderAnalytics(true, function (err, analytics) {
            onAnalyticsComplete(err, formatted, analytics);
          });
        } else {
          onAnalyticsComplete(null, formatted);
        }
      } else {
        fn(null, formatted); // FIXME is this right?
      }
    }).catch(function (error) {
      console.error('formatPreview', error);
      fn(error || new Error('Could not render output'));
    });

    function onAnalyticsComplete(err, formatted, analytics) {
      var insert = [];
      var scripts = [];
      var parts;
      var last;
      var context;

      if (err) {
        return fn(err);
      }

      // Processor object
      ['html', 'css', 'javascript'].forEach(function (format) {
        if (typeof bin[format] === 'object' && bin[format] !== null) {
          if (bin[format].result !== null) {
            bin[format] = bin[format].result;
          } else if (bin[format].errors !== null) {
            // TODO do we show the errors in the source code?
            bin[format] = bin[format].errors;
          }
        }
        if (!bin[format]) {
          bin[format] = '';
        }
      });

      // Insert JS at %code% or as the first script
      if (formatted.indexOf('%code%') > -1) {
        var jsparts = formatted.split('%code%');
        formatted = jsparts.join(bin.javascript);
      } else {
        insert.push('<script>', bin.javascript.trim(), '</script>');
      }

      // Include 'Edit in JS Bin' button
      if (options.edit && !req.ajax) {
        var data = {static: helpers.urlForStatic('', req.secure), root: helpers.url('/', true, req.secure) };
        insert.push('<script src="' + helpers.urlForStatic('js/render/edit.js?' + helpers.set('version'), req.secure) + '"></script>');
        insert.push('<script>jsbinShowEdit && jsbinShowEdit(' +  JSON.stringify(data) + ');</script>');
      }

      // Trigger an event to allow listeners to apply scripts to the page.
      // Scripts will be passed to helpers.urlForStatic() if no protocol is present.
      if (!options.silent && _this.models.bin.isStreaming(bin)) { // jshint ignore:line
        _this.emit('render-scripts', scripts);
        insert = insert.concat(scripts.map(function (script) {
          script = script.indexOf('http') === 0 ? script : helpers.urlForStatic(script, req.secure);
          return '<script src="' + script + '"></script>';
        }));
      }

      // Analytics
      if (options.silent !== true && helpers.production && analytics && !req.ajax) {
        insert.push(analytics);
      }

      // Add CSS at %css% or find a place for it
      if (formatted.indexOf('%css%') > -1) {
        formatted = formatted.replace(/%css%/g, bin.css || '');
      } else {
        var css = '\n<style id="jsbin-css">\n' + (bin.css || '') + '\n</style>';
        parts = formatted.split('</head>');
        last  = parts.pop();
        if (parts.length > 0) {
          // Add it just after before the end head tag if we can
          formatted = parts.join('</head>') + css + '\n</head>' + last;
        } else {
          // No <head>, now try just after </title>
          parts = formatted.split('</title>');
          last  = parts.pop();
          if (parts.length > 0) {
            formatted = parts.join('</title>') + '</title>' + css + last;
          } else {
            // Otherwise add it as the first script
            insert.unshift(css);
          }
        }
      }

      // Append scripts to the bottom of the page.
      if (insert.length) {
        parts = formatted.split('</body>');
        last  = parts.pop();
        if (parts.length > 0) {
          // Add the scripts just before the end body tag if there is one
          formatted = parts.join('</body>') + insert.join('\n') + '\n</body>' + last;
        } else {
          // Otherwise just shove 'em at the end
          formatted = last + '\n\n' + insert.join('\n');
        }
      }

      context = {
        domain: helpers.set('url host'),
        permalink: helpers.editUrlForBin(bin, true),
        user: undefsafe(bin, 'metadata.name') || false,
        year: (new Date()).getYear() + 1900
      };

      // Append attribution comment to header.
      helpers.render('comment', context, function (err, comment) {
        var done = false;
        formatted = formatted.replace(/<meta.*?charset.*?[^>]*>/, function ($0) {
          if ($0) {
            done = true;
          }
          return $0 + '\n' + (comment || '').trim();
        });

        if (!done) {
          formatted = formatted.replace(/<html[^>]*>/, function ($0) {
            return $0 + '\n' + (comment || '').trim();
          });
        }
        return fn(err || null, err ? undefined : formatted);
      });
    }
  },
  formatHistory: function (bins, format, fn) {
    // reorder the bins based latest edited, and group by bin.url
    var helpers = this.helpers,
        order = {},
        urls = {},
        orderedBins, loopOrder, i, length;

    if (typeof format === 'function') {
      fn = format;
      format = 'html';
    }

    bins.forEach(function (bin) {
      if (bin.active === 'n' || bin.archive === -1) {
        return;
      }

      var time = new Date(bin.last_updated).getTime();

      if (!urls[bin.url]) {
        urls[bin.url] = [];
      }

      urls[bin.url].push(bin);

      if (order[bin.url]) {
        if (order[bin.url] < time) {
          order[bin.url] = time;
        }
      } else {
        order[bin.url] = time;
      }
    });

    // Sort the revisions within the group
    Object.keys(urls).forEach(function (group) {
      urls[group].sort(function (a, b) {
        var a = new Date(a.last_updated).getTime(),
            b = new Date(b.last_updated).getTime();
        return a == b ? 0 : a < b ? -1 : 1;
      });
    });

    orderedBins = [];
    loopOrder = Object.keys(order).sort(function (a, b) {
      return order[a] < order[b] ? -1 : 1;
    });

    for (i = 0, length = loopOrder.length; i < length; i += 1) {
      orderedBins.push.apply(orderedBins, urls[loopOrder[i]]);
    }

    bins = orderedBins.reverse();

    this.loadFiles(null, function (err, defaults) {
      var map = {}, data = [], key;

      bins.forEach(function (bin) {
        var query = utils.queryStringForBin(bin, defaults),
            revisions = map[bin.url];

        if (!revisions) {
          revisions = map[bin.url] = [];
          data.push(revisions);
        }

        revisions.push({
          code: bin.url,
          revision: bin.revision,
          summary: bin.summary || utils.titleForBin(bin),
          archive: bin.archive,
          url: helpers.urlForBin(bin),
          edit_url: helpers.editUrlForBin(bin) + '?' + query,
          last_updated: bin.last_updated.toISOString(),
          pretty_last_updated: utils.since(bin.last_updated),
          is_first: !map[bin.url].length
        });
      });

      fn(null, data);
    });
  },
  report: function (req, res, next) {
    var bin = req.bin,
        _this = this;

    this.models.bin.report(bin, function (err) {
      if (err) {
        return next(err);
      }

      var to = _this.helpers.set('notify report'),
          context;

      context = {
        url: req.body.url,
        reportee: req.param('email', 'Anonymous'),
        from: req.body.email || null
      };

      if (_this.helpers.production && to && to.length) {
        _this.mailer.reportBin(to, context);
      }

      res.render('report', {
        root: _this.helpers.url(),
        static: _this.helpers.urlForStatic()
      });

    });
  },
  delete: function (req, res, next) {
    // first check they own the bin
    var user = undefsafe(req, 'session.user.name');
    var owner = undefsafe(req, 'bin.metadata.name');
    var streamingKey = undefsafe(req, 'bin.streaming_key');

    // Only check if they're not admin
    if (features('admin', req) === false) {
      // if the user doesn't own this bin...and
      if (user !== owner) {
        // the checksum doesn't match the key in the database
        if (req.body.checksum !== streamingKey) {
          // then it's not theirs to delete
          return res.send(403, {error: 'Not authorised.'});
        }
      }
    }

    // using -1 as the marker on the archive field to say "this is deleted"
    // since we don't have an active field on the owners table.
    // broader issue explained here: https://github.com/jsbin/jsbin/issues/1056
    this.models.bin.updateOwnersData(req.bin, {archive: -1, url: 'deleted/'+ req.bin.url}, function () {});

    this.models.bin.updateBinData(req.bin, {active: 'n', url: 'deleted/'+ req.bin.url}, function (error) {
      if (error) {
        console.error(error);
        return res.send(400, {error: 'The bin could not be deleted.', detail: error });
      }

      metrics.increment('bin.deleted');

      res.send(200, true);
    });
  },
  archiveBin: function (archive, req, res, next) {
    if (!req.session.user) {
      return res.send(403, {error: 'Not authorised.'});
    }
    var bin = {
      url: req.param('bin'),
      revision: req.param('rev'),
      name: req.session.user.name,
      archive: archive
    };

    this.models.bin.archive(bin, function (err) {
      if (err) {
        return res.send(err);
      }
      metrics.increment('bin.archived');
      res.send(200, bin);
    });
  }
});
