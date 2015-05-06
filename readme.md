## html-explorer - HTML page explorer

**html-explorer** extracts main information from a HTML page.

Currently it extracts:

- Page meta:
  + `title`
  + `description`
  + `keywords`
  + `canonical`
  + `feeds`
- Main images - a ordered list of images;

## Usage

```
var explorer = require('html-explorer');
explorer.explore('http://edition.cnn.com/2015/05/06/asia/salman-khan-bollywood-hit-and-run-verdict/index.html')
.then(function(page){
  // page object
});
```

## Result structure

- `url` (String) - input `url` param;
- `href` (String) - server response url;
- `canonical` (String) - page canonical;
- `title` (String)
- `description` (String)
- `keywords` (String)

- `feeds` ([Feed]) - list of feeds:
  + `title` (String);
  + `href` (String) - feed url;

- `images` ([Image]) - a list of images:
  + `src` (String) - image src;
  + `width` (Number) - image width if found;
  + `height` (Number);
  + `alt` (String);
  + `title` (String);
  + `rating` (Number) - count of words matching page title words;

## API

### `explorer.explore(url, [options])`

Explores an url.

## Options

- `page` - html page options:
  + `timeout` (Number) [5000] - request timeout;
  + `headers` (Object) [{}]- request headers;
  + `canonical` (Boolean) [true] - find or not;
  + `feeds` (Boolean|Function) - find or not, function for validating a feed;
  + `validator` (Function) [*noop*] - Validates page after exploring info, throw an error if invalid;
  + `html` (Boolean|String) [false] - Return HTML text or not. If is string it will be used as remote HTML body;

- `images` - images explorer options:
  + `limit` (Number) [5] - maximum number of images to return;
  + `filter` (Object):
    - `minHeight` (Number) [200] - minimum image height;
    - `minWidth` (Number) [250] - minimum image width;
    - `minRating` (Number) [0] - minimum image rating(...);
    - `invalidExt` ([String]) [gif, png] - invalid image extensions;
    - `src` (RegExp) [*see source code*] - invalidate image SRC;

