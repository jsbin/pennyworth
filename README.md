# Pennyworth: JS Bin Processors

Pennyworth is the compliment to Jobsworth, handling tasks for Dave the JS Bin bot, and generally running around like a headless chicken turning gobbledegook in to sensible code!

This is the server (and sample client) to handle processors. Though most of JS Bin's processors are handled both on the client side and server side, *some* processors need to be server side only (like Sass), but also they need to be (effectively) "thread safe".

This server will respond to zeromq messages with appropriate source types, and respond with the translated output.

## Creating a processor target

All processors live in the `targets` directory, and are structured as so:

1. Directory name for the target processor (such as `markdown`)
2. `index.js` will be loaded by the processor server
3. `module.exports` is a function that receives `resolve`, `reject` and `data`
4. `data` is an object with `language` (which maps to the target processor) `source`, `url` (i.e. "abc" in [JS Bin's pronounceable urls](http://jsbin.com/help/pronounceable-urls)) and `revision` (for now).
5. The processor must handle *both* the resolve and the reject.

### Simple example with markdown

The directory structure:

```text
.
└── targets
    └── markdown
        └── index.js
```

The `package.json` for *this* project includes the `markdown` npm module.

`index.js` contains:

```js
module.exports = function (resolve, reject, data) {
  try {
    var res = markdown.toHTML(data.source);
    resolve({
      errors: null,
      result: res
    });
  } catch (e) {
    var errors = {
      line: null,
      ch: null,
      msg: e
    };
    resolve({
      errors: [errors],
      result: null
    });
  }
};
```

Now the processor server can handle requests for markdown conversion.

Note that the actually processor won't need to `reject`, if the processor has errors, then these are considered runtime errors and they are sent back to the requester.

### Response object

The target processor returns an object with `result` (the processed code) and `errors` an array of compilation errors.   
The format of the items in `errors` is:
```js
{
  line: x, // integer with index starting at 0
  ch: x, // integer with index starting at 0, or null
  msg: 'string' // error message
}
```

Pennyworth will return a single object with `output` (from the processor) and `error` (if there's any system level errors, like timeouts):

```js
{
  output: {
    result: "<string>",
    errors: null, // or: [{ line: x, ch: y, msg: string }, ... ]
  },
  error: null, // or Error object
}
```

### Ruby gems

If the processor needs a ruby gem to run, add it to `Gemfile` to be automatically installed by `npm install`
```ruby
gem "nameofthegem"
```

[More info](http://bundler.io/v1.3/gemfile.html) about Gemfile and Bundler.

### Tests

All tests live in the `test/targets` directory and can be run with `npm test` from the main pennyworth directory, and are structured as so:

1. Directory name for the target processor (such as `markdown`)
2. `markdown.test.js` (replace markdown with the name of the processor) will contain the tests.
3. `broken.md` contains an example of broken code that will return errors.
4. `sample.md` contains an example of working code that will return the parsed output correctly (replace the extension of these files with the appropriate one).
5. Tests should check for both positive and negative outcomes: at least one test should check `sample.md` file and compile it without errors returning the expected result; at least one test should check `broken.md` file and return compilation errors.