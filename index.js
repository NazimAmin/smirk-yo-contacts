"use strict";
//@flow
const Lien = require("lien"),
  Promise = require("bluebird"),
  Logger = require("bug-killer"),
  OAuth = new (require("./lib/auth.js"))(),
  ContactClient = require("./lib/contacts.js"),
  emoji = new (require("./lib/emoji"))();
const server = new Lien({
  host: "localhost",
  port: 9000,
  public: __dirname + "/public"
});
function stripContactLink(json) {
  let {
    feed: {
      entry: idObjects
    }
  } = json;
  // return only contacts that are not associated with other parties
  // i.e google+ or google -- since changing for such contacts
  // overrides -> filter(elem => !elem.link[0]["gd$etag"]);
  return idObjects.map(elem => {
    return {
      name: elem.title["$t"],
      link: `${elem.link[0].href}?alt=json`
    };
  });
}

// generate and update
function jobs(client, ids, i) {
  // delay sending too many requests at once
  return Promise.delay(1000).then(() => {
    if (i > 0) {
      emoji.generateImage((err, buffer) => {
        if (err) {
          console.log(
            `Failed to generateImage. Moving to next contact. ${err}`
          );
        } else {
          const contact = ids[ids.length - i];
          client.updatePhoto(contact.link, buffer, (err, json) => {
            if (err) {
              console.log(
                `Failed to updatePhoto. Moving to next contact. ${err}`
              );
            } else {
              console.log(
                `Successfully updated contact ${contact.name}'s pic. (${ids.length -
                  i}/${ids.length})`
              );
            }
          });
        }
      });
      return jobs(client, ids, i -= 1);
    } else {
      console.log(`Completed all updates`);
      process.exit();
    }
  });
}
// Listen for load
server.on("load", err => {
  Logger.log(err || "Server started on port 9000.");
  err && process.exit(1);
});

// Add page
server.addPage("/", lien => {
  // get a token from google
  OAuth.getToken(lien.query.code, (err, token) => {
    if (err) {
      Logger.log(err);
      return;
    }
    let client = new ContactClient(token.access_token);
    // set the useremail for getAllContacts
    client.setCurrentUserEmail(err => {
      client.getAllContacts((err, contacts) => {
        if (err) {
          Logger.log(err);
          return;
        }
        const contactLinks = stripContactLink(contacts);
        jobs(client, contactLinks, contactLinks.length);
      });
    });
  });
  lien.file("close.html");
});

server.on("serverError", err => {
  Logger.log(err.stack);
});
