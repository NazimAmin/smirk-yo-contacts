"use strict";
const randomColor = require("randomcolor"),
  vibrant = require("node-vibrant"),
  images = require("images"),
  Logger = require("bug-killer");
class Emoji {
  constructor() {}
  getRandomNumber() {
    return ~~(Math.random() * 525) + 1;
  }
  getRandomColor() {
    const color = randomColor({
      luminosity: "bright",
      format: "rgb"
    });
    return color
      .substring(4, color.length - 1)
      .split(",")
      .map(elem => parseInt(elem));
  }
  generateImage(callback) {
    const path = __dirname + `/../emojis/${this.getRandomNumber()}.png`;

    /* vibrant is pretty buggy -- move on for now
    var motherFuckingCOlor = JSON.stringify(palette["Vibrant"].rgb);
    Logger.log(motherFuckingCOlor);
    let color = palette["Vibrant"].rgb;
    Logger.log(color);*/
    try {
      const color = this.getRandomColor();
      const background = images(620, 620).fill(...color, 1);
      const forground = images(path).size(360);
      const finalImage = images(background)
        .size(620)
        .draw(forground, 130, 130)
        .encode("png", { operation: 100 });
      return callback(null, finalImage);
    } catch (err) {
      return callback(new Error(err));
    }
  }
}
module.exports = Emoji;
