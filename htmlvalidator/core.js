/*jslint browser: true, vars: true, white: true, forin: true, plusplus: true, indent: 4, evil: true */
/*global define,require,sjs */

// display external url
(function(){
    'use strict';

    var validatorHost       = 'testing.local:8888',
        validatorUrl        = 'http://' + validatorHost + '/?level=error&out=json&callback=setResult&doc=${url}',
        urlArg              = sjs.arguments().arguments.url.values[0],
        result,
        validState          = 'failed',
        validMessage,
        resultErrors;

    var WHITELIST = [
        'Legacy doctype'
    ];
    var setResult = function(data){
        result = data;
    };
    var getValidationUrl = function(url) {
        return validatorUrl.replace('${url}', url);
    };
    var printError = function(url, message) {
        var msg = message.message
                        .replace(new RegExp(String.fromCharCode(226,8364,339), 'g'), '"')
                        .replace(new RegExp(String.fromCharCode(226,8364,65533), 'g'), '"');

        sjs.print(url + '|' + message.lastLine + '| ' + msg);
        var charc = message.message.charCodeAt(19),
            str = String.fromCharCode(charc); // 226,8364,339 - 65533

        sjs.print(charc + ' ' + str);
    };
    var siftErrors = function(url, messages) {
        var errors = [],
            i, ii, 
            message,
            messageText,
            isOk;

        for (i = 0; i < messages.length; i++) {
            isOk = false;
            message = messages[i];
            messageText = message.message;
            for (ii = 0; ii < WHITELIST.length; ii++) {
                var whiteListItem = WHITELIST[ii];
                if (typeof whiteListItem === 'string') {
                    if (messageText.indexOf(whiteListItem) >= 0) {
                        isOk = true;
                    }   
                } else if (whiteListItem instanceof RegExp){
                    if (whiteListItem.test(messageText)) {
                        isOk = true;
                    }   
                } else if (typeof whiteListItem === 'function') {
                    isOk = whiteListItem.call(message, message);
                }
            }
            if (!isOk) {
                printError(url, message);
                errors.push(message);
            }
        }
        return errors;
    };
    result = sjs.get(getValidationUrl(urlArg));
    // sjs.print(result);
    if (result) {
        eval(result);
        resultErrors = siftErrors(result.url, result.messages);
        validState = resultErrors.length === 0 ? 'passed' : 'failed';
        validMessage = 'Validation for ' + result.url + ' has ' + validState;
        if (validState === 'failed') {
            throw validMessage;
        }
    }

}());
