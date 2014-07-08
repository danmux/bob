
module.exports = function (hub) {
    "use strict";

    console.log(hub);
    return {
        web_app      : require('./jobs/webapp.js')(hub),
        tag_list     : require('./jobs/taglist.js')(hub),
        initial_clone: require('./jobs/initialclone.js')(hub),
    };
};
