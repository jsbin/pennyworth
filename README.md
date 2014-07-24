# Pennyworth: JS Bin Processors

Pennyworth is the compliment to Jobsworth, handling tasks for Dave the JS Bin bot, and generally running around like a headless chicken turning gobbledegook in to sensible code!

This is the server (and sample client) to handle processors. Though most of JS Bin's processors are handled both on the client side and server side, *some* processors need to be server side only (like Sass), but also they need to be (effectively) "thread safe".

This server will respond to zeromq messages with appropriate source types, and respond with the translated output.

## Creating a processor target

All processors live in the `targets` directory, and are structured as so:

1. Directory name for the target processor (such as `markdown`)
2. `index.js` will be loaded by the processor server
3. `module.exports` is a function that receives `resolve`, `reject` and `data`
4. The processor must handle *both* the resolve and the reject.
5. `data` is an object structured as:

```js
{
  language: "<string>", // maps to target processor
  source: "<string>", // source text to be processed
  file: "<string>", // optional filename to create tmp files from, should be unique
}
```

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

The `output` property contains data if the processor successfully returned a result (be it intended result or otherwise). The `output` object contains `result` (a string representing processed code) and `errors` an *array* of compilation errors.

The compilation `errors` array contains object structured as:

```js
{
  line: x, // integer with index starting at 0
  ch: y, // integer with index starting at 0, or null
  msg: 'string' // error message
}
```

### Ruby dependencies

Ideally node is used to run each processor, but some processors (like Sass and SCSS) run using Ruby.

If the processor needs a ruby gem to run, add it to `./Gemfile` to be automatically installed by `npm run-script gems`

```ruby
# Pennyworth Gemfile
source "https://rubygems.org"

gem "compass", ">= 1.0.0.alpha.19"
gem "bourbon"
gem "<your-gem-file>"
```

[More information about Gemfile and Bundler](http://bundler.io/v1.3/gemfile.html)

### Tests

All processor specific tests live in `test/targets/<processor>/*.test.js` and can be run with `npm test`. They use [Mocha](http://visionmedia.github.io/mocha/) and [should](https://github.com/visionmedia/should.js/).

The following outline is our current process for processor tests (using markdown as the example, obviously change names and extensions as appropriate):

1. Directory name for the target processor in `test/targets/markdown`
2. `markdown.test.js` will contain the tests.
3. `broken.md` contains code that will return errors.
4. `sample.md` contains working code that will succesfully parse.
5. Tests should check for at least one positive and negative outcome.

We welcome more tests and ideas on how to improve this process.

## License

MIT / http://jsbin.mit-license.org


