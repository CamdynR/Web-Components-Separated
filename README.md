# Web Components Separated - v0.0.1

## About:
I wanted a way to separate my HTML, CSS, and JS in my native web components into their own files. This has a few benefits:
- It respects separation of concerns, making things a bit cleaner
- Code editors make it was easier to write code in the file type that is meant for that code (e.g. writing HTML has a lot of tag autocompletion when being written in a .html file)
- Along with the second point, it's a lot easier to spot errors when the code is being written in the file type it was meant to be written in since editors help a lot there

## How to use:

To create a component, follow these steps:
- Inside the `src/components` directory, create a new directory named the same name as your component
  - If you would like to use a different directory other than `components`, you can modify this in `config.js`
- Create three files inside of that directory sharing the same name, but with `.html`, `.css`, and `.js` file extensions respectively
  - For example: For the component `<demo-component>` I would create a directory `DemoComponent`, with the files `DemoComponent.html`, `DemoComponent.css`, and `DemoComponent.js` inside.
- Fill out your newly create files with your component's code, some notes:
  - The HTML that goes in your `CustomComponent.html` file will go _inside_ of your component, so do not put your component's element inside of there
    - e.g. Inside of `DemoComponent.html` I shouldn't place `<demo-component>`
  - You can use props in your HTML just like in React with bracket `{notation}`.
    - You can pass in the props to your element using `.props = {}` after creating your element.
  - Because of this, `set props()` is a reserved function
  - Currently you need to use the shadowDOM, I would recommend attaching it at the end of your `constructor()`
  - Also make sure to define your custom element at right after you define the class in your component's `.js` file
- Make sure to add a relative path to `DemoComponent.js` in your main HTML file (not your component HTML file) so that you can use it. This will be carried over when your files are finished in the `dist` folder


## How to build:
- Run `npm install --only=dev`
- Next, run `npm run build`
  - You can alternatively use `npm run watch` to continuously rebuild your files as they update if you want to make live changes. Currently there is a few second delay in between changes and refreshing.
- Finally, launch the files that have been created in `dist` in whichever server you'd like so you can view them in your browser
