const fs = require('fs');

const window = {};
eval(fs.readFileSync('./js/probability.js', 'utf8'));
eval(fs.readFileSync('./js/outcomes.js', 'utf8'));
eval(fs.readFileSync('./js/handOdds.js', 'utf8'));
console.log(Object.keys(window.App.probability));
