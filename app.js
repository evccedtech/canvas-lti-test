const cookieParser = require('cookie-parser');
const createError = require('http-errors');
const express = require('express');
const logger = require('morgan');
const lti = require('ims-lti');
const path = require('path');

const app = express();

// Required for Heroku deployment -- otherwise will use http rather than https?
app.enable('trust proxy');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// LTI launch
app.post('/lti_launch', function(req, res, next) {
    
    let ltiKey = process.env.LTI_KEY;
    let ltiSecret = process.env.LTI_SECRET;
    
    // LTI key matches
    if (req.body['oauth_consumer_key'] === ltiKey) {
        
        let provider = new lti.Provider(ltiKey, ltiSecret);
        
        provider.valid_request(req, function(err, isValid) {
            
            if (err) {
                res.status(403).send(err);
            } else {
                
                // Invalid launch
                if (!isValid) {
                    res.status(500).send({ error: 'Invalid LTI launch request.' });
                }
                
                // Valid launch
                else {
                    
                    res.status(200).send(res.body);
                    
                }
            }
            
        });
        
    }
    
    // LTI Key doesn't match
    else {
        res.status(403).send({ error: 'Invalid LTI key. Contact your Canvas administrator for assistance.' })
    }
    
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
