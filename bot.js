var fs = require('fs');
var readline = require('readline');
var google = require('googleapis');
var googleAuth = require('google-auth-library');

var secret = require('./secret');


var twit = require('twit');
var config = require('./config.js');
var Twitter = new twit(config);


// Create an OAuth2 client with the given credentials
var clientSecret = secret.client_secret;
var clientId = secret.client_id;
var redirectUrl = secret.redirect_uris[0];
var auth = new googleAuth();
var oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl);
oauth2Client.credentials = secret.token;


// search for users using hashtag
var bot = function() {
    var params = {
        q: '#vue',
        page: 4,
        count: 15
    }
    Twitter.get('users/search', params, function(err, data) {
      // if there no errors
        if (!err) {
            values = [];

            for(i = 0; i < params.count; i++){
                let follower = (data[i].followers_count);

                // check number of followers
                if((follower > 1000) && (follower < 50000) ) {
                    values[i] = [data[i].name, data[i].followers_count]
                }else {
                    console.log("less number of followers");
                }
            }

            // save and post data to Google spreadsheet
            saveDataFromBot(oauth2Client, values);
        }

        else {
          console.log('Something went wrong while SEARCHING...');
        }
    });
}
bot();

// fetch users details at a specified interval and post to google spreadsheet
setInterval(bot, 3000000);


function saveDataFromBot(auth, values) {
    var sheets = google.sheets('v4');
   
    var data = [];
    data.push({
      range: 'A2:B',
      values: values
    });

    var body = {
      data: data,
      valueInputOption: "USER_ENTERED"
    };
    sheets.spreadsheets.values.batchUpdate({
      auth: auth,
      spreadsheetId: '1AnpvkbC-zXlev-qUgxYgkhCIshsMkRu-kGXrzJc0_BI',
      resource: body
    }, function(err, result) {
      if(err) {
        // Handle error
        console.log(err);
      } else {
        console.log('%d cells updated.', result.totalUpdatedCells);
      }
    });
}
