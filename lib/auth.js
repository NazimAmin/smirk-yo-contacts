'use strict';
const google = require('googleapis'),
  Opn = require('opn'),
  cred = require('r-json');
class OAuth {
  constructor() {
    const credentials = cred(__dirname + '/../cred.json');
    this.OAuthClient = new google.auth.OAuth2(
      credentials.CLIENT_ID,
      credentials.CLIENT_SECRET,
      credentials.REDIRECT_URIS[0]
    );
    this.prompt();
  }

  prompt() {
    Opn(
      this.OAuthClient.generateAuthUrl({
        access_type: 'offline',
        scope: ['https://www.google.com/m8/feeds']
      })
    );
  }

  getToken(code, callback) {
    this.OAuthClient.getToken(code, (err, token) => {
      if (err) {
        return callback(new Error(err));
      }
      return callback(null, token);
    });
  }
}

module.exports = OAuth;
