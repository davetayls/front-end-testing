/*jslint browser: true, vars: true, white: true, forin: true, plusplus: true, indent: 4 */
/*global define,require,sjs */

// display external url
(function(){
    'use strict';

    var validatorHost       = 'testing.local:8888',
        validatorUrl        = 'http://' + validatorHost + '/?level=error&out=json&callback=setResult&doc=${url}',
        urlArg              = sjs.arguments().arguments.url.values[0],
        result,
        validState          = 'failed',
        validMessage;

    var setResult = function(data){
        result = data;
    };
    var getValidationUrl = function(url) {
        return validatorUrl.replace('${url}', url);
    };
    result = sjs.get(getValidationUrl(urlArg));
    if (result) {
        eval(result);
        validState = result.messages.length === 0 ? 'passed' : 'failed';
        validMessage = 'Validation for ' + result.url + ' has ' + validState;
        if (validState === 'failed') {
            throw validMessage;
        }
    }

}());
