'use strict';
const randomColor = require('randomcolor'),
  images = require('images'),
  Logger = require('bug-killer'),
  path = require('path');
class Emoji {
  getRandomNumber() {
    return ~~(Math.random() * 518) + 1;
  }

  getRandomColor() {
    const color = randomColor({
      luminosity: 'bright',
      format: 'rgb'
    });
    return color
      .substring(4, color.length - 1)
      .split(',')
      .map(elem => parseInt(elem));
  }

  generateImage(callback) {
    const emojiPath = path.resolve(
      __dirname,
      `../emojis/${this.getRandomNumber()}.png`
    );
    try {
      const color = this.getRandomColor();
      const background = images(620, 620).fill(...color, 1);
      const forground = images(emojiPath).size(360);
      const finalImage = images(background)
        .size(620)
        .draw(forground, 130, 130)
        .encode('png', { operation: 100 });
      return callback(null, finalImage);
    } catch (err) {
      return callback(new Error(err));
    }
  }
}

module.exports = Emoji;
