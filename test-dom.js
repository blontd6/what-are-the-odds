const fs = require('fs');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

const html = fs.readFileSync('./index.html', 'utf8');
const dom = new JSDOM(html);
global.window = dom.window;
global.document = dom.window.document;
global.FormData = dom.window.FormData;
global.Number = Number;
global.Math = Math;

window.App = {};
eval(fs.readFileSync('./js/probability.js', 'utf8'));
eval(fs.readFileSync('./js/outcomes.js', 'utf8'));
eval(fs.readFileSync('./js/handOdds.js', 'utf8'));

window.App.initHandOdds();

const missProb = document.querySelector("#miss-probability").textContent;
console.log("missProb text:", missProb);

// simulate form submit
document.querySelector("#analyzer-form").dispatchEvent(new dom.window.Event('submit', { cancelable: true }));

setTimeout(() => {
    console.log("missProb text after render:", document.querySelector("#miss-probability").textContent);
}, 100);
