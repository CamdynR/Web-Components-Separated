// build.js

import { createRequire } from 'module';
import { config } from './config.js';
import { fileURLToPath } from 'url';

const require = createRequire(import.meta.url);
const fs = require('fs-extra');
const path = require('path');

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

const files = getAllFiles(config.directory);
let splitToken;
files.forEach(file => {
  let splitArray, fileName, extension, dirName;
  splitToken = '\\';
  if (!file.includes('\\')) splitToken = '/';

  splitArray = file.split(splitToken);
  fileName = splitArray.pop().split('.');
  extension = fileName.pop();
  fileName = fileName[0];
  dirName = splitArray.pop();
  
  if (fileName == dirName && extension == 'js') {
    splitArray = splitArray.join('/');
    const markupFile = `${splitArray}/${dirName}/${dirName}.html`;
    const stylesFile = `${splitArray}/${dirName}/${dirName}.css`;
    let markupStr = fs.readFileSync(markupFile).toString();
    let stylesStr = fs.readFileSync(stylesFile).toString();
    let jsStr = fs.readFileSync(file).toString();

    markupStr = `this.markupStr = \`${markupStr}\`;\n`;
    stylesStr = `this.shadowRoot.innerHTML += \`<style>${stylesStr}</style>\`;\n`;
    
    // Set up the constructor()
    let index = jsStr.search(/this\.attachShadow\(/);
    index += jsStr.substr(jsStr.search(/this\.attachShadow\(/)).search(/\)/) + 1;
    if (jsStr.charAt(index) == ';') index += 1;
    jsStr = jsStr.slice(0,index) + markupStr + stylesStr + jsStr.slice(index);
    
    // set up set props(props)
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
    
    file = file.replace('src', 'dist');
    let directory = file.split(splitToken);
    directory.pop();
    directory = directory.join(splitToken);
    fs.mkdirsSync(directory);
    fs.writeFileSync(file, jsStr);
  }
});