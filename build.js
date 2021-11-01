// build.js

import { createRequire } from 'module';
import { config } from './config.js';
import { fileURLToPath } from 'url';

const require = createRequire(import.meta.url);
const fs = require('fs-extra');
const path = require('path');

/**
 * Used to get an array of strings of all of the file paths from the the given directory
 * @param {String} dirPath The directory (in relation to this file) that you'd like to get the 
 *                         files from
 * @param {Array} arrayOfFiles Only used when the function calls itself recursively
 * @returns {Array} An array of strings of all of the file paths from the the given directory
 */
const getAllFiles = function(dirPath, arrayOfFiles) {
  let files = fs.readdirSync(dirPath);
  let __dirname = path.dirname(fileURLToPath(import.meta.url));

  arrayOfFiles = arrayOfFiles || []

  files.forEach(function(file) {
    if (fs.statSync(dirPath + '/' + file).isDirectory()) {
      arrayOfFiles = getAllFiles(dirPath + '/' + file, arrayOfFiles)
    } else {
      arrayOfFiles.push(path.join(__dirname, dirPath, '/', file))
    }
  })

  return arrayOfFiles
}

/**
 * Copies over all of the files from the /src directory (that aren't in the components directory)
 * and pastes them in /dist
 */
const srcDir = getAllFiles('src');
let splitToken; // Accounts for some computers using \ for paths and others using /
srcDir.forEach(file => {
  splitToken = '\\';
  if (!file.includes('\\')) splitToken = '/';
  if (file.includes(`src${splitToken}${config.componentDir}`)) return;
  fs.copyFile(file, file.replace('src', 'dist'));
});

/**
 * Finds all of the .js files in the components directory, and then reads the .html and .css files
 * in that same directory, adds them as strings as variables in constructor() of the component, 
 * finally then inserting those strings into the shadow DOM using .innerHTML
 */
const files = getAllFiles(`src/${config.componentDir}`);
files.forEach(file => {
  let splitArray, fileName, extension, dirName;

  // Variables used to parse the file path
  splitArray = file.split(splitToken);
  fileName = splitArray.pop().split('.');
  extension = fileName.pop();
  fileName = fileName[0];
  dirName = splitArray.pop();
  
  // TODO - clean this up later
  // Looks for files that have the same name as the directory they're in as this is
  // the chosen convention for the component .js class files
  if (fileName == dirName && extension == 'js') {
    splitArray = splitArray.join('/');

    // Grab the HTML / CSS files in that same directory
    const markupFile = `${splitArray}/${dirName}/${dirName}.html`;
    const stylesFile = `${splitArray}/${dirName}/${dirName}.css`;

    // Read those HTML / CSS files as strings (as well as the component .js class file)
    let markupStr = fs.readFileSync(markupFile).toString();
    let stylesStr = fs.readFileSync(stylesFile).toString();
    let jsStr = fs.readFileSync(file).toString();

    // Make the HTML string a variable since the props will be passed in later.
    // The styles won't be affected by the props being passed in so add them directly to the
    // shadow DOM.
    markupStr = `this.markupStr = \`${markupStr}\`;\n`;
    stylesStr = `this.shadowRoot.innerHTML += \`<style>${stylesStr}</style>\`;\n`;
    
    // Find wherever this.attachShadow(...); is in the DOM and put our HTML/CSS strings right after
    let index = jsStr.search(/this\.attachShadow\(/);
    index += jsStr.substr(jsStr.search(/this\.attachShadow\(/)).search(/\)/) + 1;
    if (jsStr.charAt(index) == ';') index += 1;
    jsStr = jsStr.slice(0,index) + markupStr + stylesStr + jsStr.slice(index);
    
    // Write our set props(props) method, look for 'customElements' and then insert it before the
    // previous '}' (which does assume it comes right after the class intialization, fix this later)
    index = jsStr.substr(0,jsStr.search('customElements')).lastIndexOf('}');
    let propsFunc = `
      set props(props) {
        const propNames = Object.keys(props);
        propNames.forEach(propName => {
          while (this.markupStr.search(\`{\${propName}}\`) != -1) {
            this.markupStr = this.markupStr.replace(\`{\${propName}}\`, props[propName]);
          }
        });
        this.shadowRoot.innerHTML += this.markupStr;
      }
    `;
    jsStr = jsStr.slice(0,index) + propsFunc + jsStr.slice(index);

    // Create the new directory for this file in /dist, then create the file
    file = file.replace('src', 'dist');
    let directory = file.split(splitToken);
    directory.pop();
    directory = directory.join(splitToken);
    fs.mkdirsSync(directory);
    fs.writeFileSync(file, jsStr);
  }
});