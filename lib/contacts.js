"use strict";
const fetch = require("node-fetch"), Logger = require("bug-killer");
class GoogleContact {
  constructor(token) {
    this.token = token;
    this.userEmail = "";
  }
  defaultHeaders() {
    return {
      "GData-Version": "3",
      Authorization: `Bearer ${this.token}`,
      "Content-Type": "application/json",
      "MIME-version": "1.0"
    };
  }
  setCurrentUserEmail(callback) {
    /*
    get current user email needed for group filtering
    */
    fetch(
      "https://www.google.com/m8/feeds/contacts/default/full?max-results=1&alt=json",
      {
        method: "GET",
        headers: this.defaultHeaders()
      }
    )
      .then(res => res.json())
      .then(json => {
        this.userEmail = json.feed.author[0].email["$t"];
        callback();
      })
      .catch(err => callback(new Error(err)));
  }
  getAllContacts(callback) {
    //returns only the accounts associated with my contacts
    if (!this.userEmail) {
      return callback(new Error(
        "Current user email is required for group filter"
      ));
    }
    const CONTACTS_URL = "https://www.google.com/m8/feeds/contacts/default/full";
    const GROUP_URL = `https://www.google.com/m8/feeds/groups/${this.userEmail}/base/6`;
    const ALL_CONTACTS_URL = `${CONTACTS_URL}?group=${GROUP_URL}&max-results=500&alt=JSON`;
    fetch(ALL_CONTACTS_URL, {
      method: "GET",
      headers: this.defaultHeaders()
    })
      .then(res => res.json())
      .then(json => {
        callback(null, json);
      })
      .catch(err => callback(new Error(err)));
  }
  updatePhoto(link, byteImage, callback) {
    let header = Object.assign(this.defaultHeaders(), {
      "Content-Type": "image/*",
      "If-Match": "*"
    });
    fetch(link, {
      method: "PUT",
      headers: header,
      body: byteImage
    })
      .then(res => res.json())
      .then(json => callback(null, json))
      .catch(err => callback(new Error(err)));
  }
}
module.exports = GoogleContact;
