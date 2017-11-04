var express = require('express');
var bodyParser = require('body-parser');
var logger = require('morgan');
var exphbs = require('express-handlebars');
var _ = require('lodash');
var dotenv = require('dotenv');
var mongoose = require('mongoose');
var request = require('request');
var session= require('express-session');
var MongoStore = require('connect-mongo')(session);

var AcademicRubric = require('./models/AcademicRubric');
var ArtsRubric = require('./models/ArtsRubric');
var AthleticRubric = require('./models/AthleticRubric');
var ServiceRubric = require('./models/ServiceRubric');
var StemRubric = require('./models/StemRubric');
var User = require('./models/user.js');
var AcademicForm = require('./models/AcademicNomination');
var ArtsForm = require('./models/ArtsNomination');
var AthleticForm = require('./models/AthleticNomination');
var ServiceForm = require('./models/ServiceNomination');
var StemForm = require('./models/StemNomination');
var app = express();


dotenv.load();

// Connect to MongoDB
console.log(process.env.MONGODB)
mongoose.connect(process.env.MONGODB);
var db = mongoose.connection.on('error', function() {
    console.log('MongoDB Connection Error. Please make sure that MongoDB is running.');
    process.exit(1);
});

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.engine('handlebars', exphbs({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');
app.use('/public', express.static('public'));

app.use(session({
  secret: 'work hard',
  resave: true,
  saveUninitialized: false,
  store: new MongoStore({
    mongooseConnection: db
  })
}));

/* Api Endpoints:
• /api/nominator/submitted - get
• /api/nominator/incomplete - get
• /api/nominator/submitform - post (https://stackoverflow.com/questions/10827108/mongoose-check-if-object-is-mongoose-object)
• /api/graders/ungradedapps - get
• /api/graders/finishgrading - post
• /api/graders/gradedapps - get - needed?

don't need partials since links will be hardcoded
*/

// API endpoints begin here
app.get('/api/nominator/submitted', function(req,res){
    var nominatorName = req.session.username;
    console.log(nominatorName);
    
	AcademicNomination.find({'Nominator': name, 'completed': submit}, function(err, doc){
        if (err) throw err; 

        if (!doc && submit) {
            res.json({"Cannot find application": name});
        } else {
            res.json(doc);//array
        }
    });
});

app.get('/api/nominator/incomplete', function(req,res){
	var nominator = req.session.username;
    console.log(nominatorName);
    
	AcademicNomination.find({'NominatorName': name, 'completed': submit}, function(err, doc){
        if (err) throw err; 

        if (!doc && !submit) {
            res.json({"Cannot find application": name});
        } else {
            res.json(doc);
        }
    });
});

app.get('/login', function(req,res){
	res.render('login');
});


app.post('/login', function (req, res, next) {
    // confirm that user typed same password twice
    if (req.body.password !== req.body.passwordConf) {
        var err = new Error('Passwords do not match.');
        err.status = 400;
        res.send("passwords dont match");
        return next(err);
    }
    
    if (
        req.body.username &&
            req.body.password &&
            req.body.firstName &&
            req.body.lastName &&
            req.body.passwordConf) {
        var userData = {
            type: 0,
            username: req.body.username,
            password: req.body.password,
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            passwordConf: req.body.passwordConf,
        }
        
        User.create(userData, function (error, user) {
            if (error) {
                return next(error);
            } else {
                console.log(user);
                req.session.username = user.username;
                return res.redirect('/nominator');
            }
        });
        
    } else if (req.body.logusername && req.body.logpassword) {
        User.authenticate(req.body.logusername, req.body.logpassword, function (error, user) {
            if (error || !user) {
                var err = new Error('Wrong username or password.');
                err.status = 401;
                return next(err);
            } else {
                req.session.username = user.username;
                
                return res.redirect('/?');
            }
        });
    } else {
        var err = new Error('All fields required.');
        err.status = 400;
        return next(err);
    }
})

app.get('/logout', function (req, res, next) {
  if (req.session) {
    // delete session object
    req.session.destroy(function (err) {
      if (err) {
        return next(err);
      } else {
        return res.redirect('/');
      }
    });
  }
});

app.post('/api/nominator/submitform', function(req,res){
	var areacode = req.params.areacode;
	if (!areacode_regex.test(areacode)) {
		return res.json({"Invalid areacode":"Area codes must be exactly 3 digits"})
	}
	Spamcall.find({phonenum: new RegExp(areacode+'[0-9]{7}')},function(err, spamcalls){
		if (err) throw err;

		if (spamcalls.length == 0) {
			res.json({"No numbers reported with area code":areacode});
		} else {
			res.json(spamcalls);
		}
	});
});

app.get('/api/graders/ungradedapps', function(req,res){
	Spamcall.find({calltype: "Spam"}, function(err, spamcalls) {
		if (err) throw err;

		if (spamcalls.length == 0) {
			res.json({"No spam numbers reported":"No spam callers yet"});
		} else {
			res.json(spamcalls);
		}
	});
});

app.post('/api/graders/finishgrading', function(req,res){
	Spamcall.find({calltype: "Telemarketers"}, function(err, spamcalls) {
		if (err) throw err;

		if (spamcalls.length == 0) {
			res.json({"No telemarketers reported":"No telemarketers yet"});
		} else {
			res.json(spamcalls);
		}
	});
});

app.get('/api/graders/gradedapps', function(req,res){
	Spamcall.find({calltype: "Robocallers"}, function(err, spamcalls) {
		if (err) throw err;

		if (spamcalls.length == 0) {
			res.json({"No robocallers reported":"No robocallers yet"});
		} else {
			res.json(spamcalls);
		}
	});
});

// Other endpoints begin here
/*
Other Endpoints:
• / (login.handlebars) (login page)
• /nominator (nominator dashboard - shows incompleted applications)
• /nominator/completed (completed nominator applications)
• /nominator/academicform
• /nominator/artsform
• /nominator/stemform
• /nominator/communityserviceform
• /nominator/athleticform
• /graders (graders dashboard - shows ungraded applications)
• /graders/gradedapps
• /admin/allapps (if needed)
*/
app.get('/', function(req,res){

	Spamcall.find({}, function(err,spamcalls){
		if (err) throw err;
		var numsonly = [];
		spamcalls.forEach(function(call){
			numsonly.push(call.phonenum);
		});
		res.render('allnums',{
			search: JSON.stringify(numsonly),
			numbers: spamcalls
		});
	});
});

app.get('/nominator', function(req,res){
	console.log("****nominator****");
});

app.get('/nominator/completed', function(req,res){
	res.render('reportnum');
});

app.get('/nominator/academicform', function(req,res){
	var body = req.body;
	console.log("Phone number: " + body.phonenum);
	console.log("Call type: " + body.calltype);
	console.log("Call content: " + body.callcontent);
	body.reports = parseInt(body.reports);
	console.log("Reports: "+ body.reports);
	console.log("How to unsub: " + body.howtounsub);
	var options = { 
	    method: 'POST',
	    url: 'http://localhost:3000/api/report_num',
	    headers: { 
	        'content-type': 'application/x-www-form-urlencoded' 
	    },
	    form: { 
	       phonenum: body.phonenum,
	       calltype: body.calltype,
	       callcontent: body.callcontent,
	       reports: body.reports,
	       howtounsub: body.howtounsub
	    } 
	};
	request(options, function (error, response, body) {
	  if (error) throw new Error(error);
	  console.log(body);
	  res.redirect('/');
	});
});

app.get('/nominator/artsform', function(req,res){
	var areacode = req.params.areacode;
	console.log("Area code:" + areacode);

	if (!areacode_regex.test(areacode)) {
		return res.render('areacode', {
			areacodevalid: false,
			areacode: areacode,
			phonenums: {}
		});
	}
	Spamcall.find({phonenum: new RegExp(areacode+'[0-9]{7}')},function(err, spamcalls){
		if (err) throw err;

		if (spamcalls.length == 0) {
			res.render('areacode', {
				areacodevalid: true,
				areacode: areacode,
				phonenums: undefined
			});
		} else {
			var areanums = [];
			spamcalls.forEach(function(call){
				areanums.push(call.phonenum);
			});
			res.render('areacode', {
				areacodevalid: true,
				areacode: areacode,
				phonenums: areanums
			});
		}
	});
});

app.get('/nominator/stemform', function(req,res){
	Spamcall.find({calltype: "Spam"}, function(err, spamcalls) {
		if (err) throw err;

		if (spamcalls.length == 0) {
			res.render('spam',{
				spam: undefined
			});
		} else {
			res.render('spam',{
				spam: spamcalls
			});
		}
	});
});

app.get('/nominator/communityserviceform', function(req,res){
	Spamcall.find({calltype: "Telemarketers"}, function(err, spamcalls) {
		if (err) throw err;

		if (spamcalls.length == 0) {
			res.render('telemarketers',{
				telemarketers: undefined
			});
		} else {
			res.render('telemarketers',{
				telemarketers: spamcalls
			});
		}
	});
});

app.get('/nominator/athleticform', function(req,res){
	Spamcall.find({calltype: "Robocallers"}, function(err, spamcalls) {
		if (err) throw err;

		if (spamcalls.length == 0) {
			res.render('robocallers',{
				robocallers: undefined
			});
		} else {
			res.render('robocallers',{
				robocallers: spamcalls
			});
		}
	});
});

app.get('/graders/ungradedapps', function(req,res){
	Spamcall.find({}).sort({reports: 'desc'}).find().exec(function(err,spamcalls){
		if (err) throw err;

		var mostreports = spamcalls[0].reports;
		var mostreportednums = [];

		spamcalls.forEach(function(call){
			if (call.reports == mostreports) {
				mostreportednums.push(call);
			}
		});

		if (spamcalls.length == 0) {
			res.render('mostreported',{
				mostreported: undefined
			});
		} else {
			res.render('mostreported',{
				mostreported: mostreportednums
			});
		}
	});
});

app.get('/graders/gradedapps', function(req,res){
	Spamcall.find({}).sort({reports: 'desc'}).find().exec(function(err,spamcalls){
		if (err) throw err;

		var mostreports = spamcalls[0].reports;
		var mostreportednums = [];

		spamcalls.forEach(function(call){
			if (call.reports == mostreports) {
				mostreportednums.push(call);
			}
		});

		if (spamcalls.length == 0) {
			res.render('mostreported',{
				mostreported: undefined
			});
		} else {
			res.render('mostreported',{
				mostreported: mostreportednums
			});
		}
	});
});


app.listen(3000, function() {
    console.log('LACC listening on port 3000!');
});
