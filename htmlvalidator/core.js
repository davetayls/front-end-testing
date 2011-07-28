/*jslint browser: true, vars: true, white: true, forin: true, plusplus: true, indent: 4 */
/*global define,require,sjs,JSON */

// display external url
(function(global){
    'use strict';

    var validatorHost       = 'testing.local:8888',
        validatorUrl        = 'http://' + validatorHost + '/?level=error&out=json&doc=${url}',
        debug               = sjs.args().getSingleValue('debug') === 'true',
        urlArg              = sjs.args().getSingleValue('url'),
        configPath          = sjs.args().getSingleValue('config');

    var WHITELIST = [
        'Legacy doctype'
    ];
    var log = function(message, force) {
        if (debug || force) { sjs.print(message); }
    };

    log('STARTING VALIDATOR');

    var getConfig = function(path) {
        var json = sjs.file(path).readText();
        log('Loaded config:');
        log(json);
        if (json) {
            return JSON.parse(json); 
        }
    };
    var setResult = function(json){
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
    var validateUrl = function(url) {
        var validationUrl       = getValidationUrl(url),
            result,
            validState          = 'failed',
            validMessage,
            resultErrors;
        log('Get url ' + url);
        try {
        result = sjs.get(validationUrl);
        } catch(ex){
            throw 'There was a timeout while trying to reach the validator at this url ' + validationUrl;
        }
        if (result) {
            log('Got a result from ' + url);
            result = JSON.parse(result);
            resultErrors = siftErrors(result.url, result.messages);
            validState = resultErrors.length === 0 ? 'passed' : 'failed';
            validMessage = 'Validation for ' + result.url + ' has ' + validState;
            if (validState === 'failed') {
                throw validMessage;
            } else {
                log('OK    ' + result.url, true);
            }
        }
    };

    var init = function() {
        var config,
            urls,
            url,
            i;

        log('Initialising');

        if (urlArg) {
            log('Validating single url: ' + urlArg);
            validateUrl(urlArg);
        } else if (configPath) {
            log('Loading from config ' + configPath);
            config = getConfig(configPath);
            WHITELIST = config.whiteList;
            urls = config.urls;
            for (i = 0; i < urls.length; i++) {
                url = urls[i];
                validateUrl(url);
            }
        }
        sjs.print('HTML VALIDATION PASSED');
    };
    init();

}(this));
