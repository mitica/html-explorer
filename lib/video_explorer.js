var external = module.exports;
var utils = require('./utils');
var _ = utils._;
var Promise = utils.Promise;
var VideoFilter = require('./filters/video_filter');
var finders = [require('./finders/video_element')];
var internal = {};

var OPTIONS = {
  filter: null,
  limit: 1
};

external.explore = function(page, options) {
  options = _.defaults(options || {}, OPTIONS);

  return Promise.resolve().then(function() {
    try {
      return internal.explore(page, options);
    } catch (e) {
      return Promise.reject(e);
    }
  });
};

internal.explore = function(page, options) {
  var videos = [];

  finders.forEach(function(finder) {
    videos = videos.concat(finder.find(page));
  });

  if (videos.length === 0) return;

  var videoFilter = new VideoFilter(options.filter);

  videos = videos.filter(function(video) {
    return videoFilter.filter(video);
  });

  videos = _.uniq(videos, function(video) {
    return video.sourceType + '_' + video.sourceId;
  });

  videos = _.sortBy(videos, 'width');
  videos.reverse();

  page.videos = _.take(videos, options.limit);
};
