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
- Main videos - a ordered list of videos;
- Page content - main page content/article;
- Page encoding;

## Usage

```
var explorer = require('html-explorer');
explorer.explore('http://edition.cnn.com/')
.then(function(page){
  // page object
});
```

## Result structure

- `url` (String) - input `url` param;
- `href` (String) - server response url;
- `canonical` (String) - page canonical;
- `title` (String);
- `description` (String);
- `keywords` (String);

- `content` (String);
- `encoding` (String): utf8, windows-1251, iso-8859-2, etc.;

- `feeds` ([Feed]) - list of feeds:
  + `title` (String);
  + `href` (String) - feed url;

- `images` ([Image]) - a list of images:
  + `src` (String) - image src;
  + `viewWidth` (Number) - image view width if founded;
  + `viewHeight` (Number);
  + `width` (Number) - real image width;
  + `height` (Number);
  + `alt` (String);
  + `title` (String);
  + `rating` (Number) - count of words matching page title words;
  + `type` (String) - (only if `identify` option is true) - can be: `bmp`, `gif`, `jpg`, `png`, `psd`, `svg`, `tiff` or `webp`;
  + `data` (Buffer) - (only if `identify` option is true) - image data.

- `videos` ([Video]) - a list of videos:
  + `sourceType` (String) - video source type: `URL`, `YOUTUBE`, `VIMEO` or `IFRAME`;
  + `sourceId` (String) - depends of `sourceType`: url or source id;
  + `width` (Number) - video width;
  + `height` (Number) - video height;

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

- `content` (Boolean|Object) - content options:
  + `filter` (Boolean|Object):
    - `minLine`: (Number) [50] - accepted minimum line length;
    - `minPhrase`: (Number) [100] - accepted minimum phrase length;
    - `phraseEndRegex`: (Regex) default: /[.!?:;¡¿%]$/ - end phrase puctuation regex;
    - `phraseEnd`: (Boolean) [false] - require phrase to end with a puctuation;
    - `maxInvalidLines`: (Number) [3] - maximum consecutive invalid lines;

- `images` (Boolean|Object) - images explorer options:
  + `limit` (Number) [5] - maximum number of images to return;
  + `filter` (Object):
    - `minViewHeight` (Number) [180] - accepted minimum image view height;
    - `minViewWidth` (Number) [220] - accepted minimum image view width;
    - `minHeight` (Number) [200] - accepted minimum image height;
    - `minWidth` (Number) [250] - accepted minimum image width;
    - `minRating` (Number) [0] - accepted minimum image rating(...);
    - `minRatio` (Number) [null] - accepted minimum image ratio (`ratio`=`width`/`height`);
    - `maxRatio` (Number) [null] - accepted maximum image ratio;
    - `invalidRatio` (Number | [Number]) [1] - example: value *[1]* will exclude all images with width=height;
    - `invalidExtensions` ([String]) [gif, png] - invalid image extensions;
    - `src` (RegExp) [*see source code*] - invalidate image by SRC;
    - `extraSrc` (RegExp) - invalidate image by SRC;
    - `cssClass` (RegExp) - filter image by its css class;
    - `types` (String|[String]) - accepted image types (`bmp`, `gif`, `jpg`, `png`, `psd`, `svg`, `tiff`, `webp`), default: `['jpg']`;
    - `invalidTypes` (String|[String]) - invalid image types;
  + `identify` (Boolean) [false] - identify image `width`, `height` and `type` by downloading data;
  + `data` (Boolean) [false] - set image `data` property. Works only if `identify` is true.
  + `timeout` (Number) [1000] - image downloading timeout, in ms.

- `video` (Boolean|Object) - video explorer options:
  + `limit` (Number) [1] - maximum number or videos to return;
  + `filter` (Object):
    - `minHeight` (Number) [200] - accepted minimum image height;
    - `minWidth` (Number) [250] - accepted minimum image width;
    - `minRatio` (Number) [null] - accepted minimum image ratio (`ratio`=`width`/`height`);
    - `maxRatio` (Number) [null] - accepted maximum image ratio;
    - `invalidRatio` (Number | [Number]) [1] - example: value *[1]* will exclude all images with width=height;
    - `src` (RegExp) [*see source code*] - invalidate image by SRC;
    - `extraSrc` (RegExp) - invalidate image by SRC;
  + `priority` ([String]) - video source type priority - default: `['YOUTUBE', 'VIMEO', 'URL', 'IFRAME']`;
  + `customFinders` ([Finder]) - a list of custom video fiders.


## Changelog

#### v0.1.11 - August 16, 2016

- find videos from known iframes

#### v0.1.9 - August 15, 2015

- explore content with `readability-js`
- fix videos explore bug

#### v0.1.6 - August 3, 2015

- explore videos from microdata

#### v0.1.5 - August 3, 2015

- filter page content
- better encoding detection & add to the response object

#### v0.1.4 - August 2, 2015

- tests
- extracting page content
- editorconfig, eslint

#### v0.1.2 - June 17, 2015

- custom video finders
- sort videos by priority option
- head(og:video) video finder

#### v0.1.1 - June 13, 2015

- decode page urls
- image downloading timeout

#### v0.1.0 - May 30, 2015

- detect embedded videos
- better images order

#### v0.0.8 - May 29, 2015

- detect charset from content-type response header
- image filter: `invalidRatio`

#### v0.0.7 - May 22, 2015

- filter images by view size - width & heigth detected in image attributes
- merge images with same src
