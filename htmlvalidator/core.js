/*jslint browser: true, vars: true, white: true, forin: true, plusplus: true, indent: 4, nomen: true */
/*global define,require,sjs,JSON,_ */

// display external url
(function(global){
    'use strict';

    var debug               = sjs.args().getSingleValue('debug') === 'true',
        urlArg              = sjs.args().getSingleValue('url'),
        configPath          = sjs.args().getSingleValue('config'),
        config;

    var DEFAULT_CONFIG = {
        validatorHost: 'validator.nu',
        validatorUrl: 'http://<%= validatorHost %>/?level=error&out=json&doc=<%= url %>',
        whiteList: [
            "Legacy doctype",
            "xml:lang"
        ],
        urls: [],
        errorTemplate: '<%= url %>|<%= lastLine %>|<%= message %>'
    };

    var log = function(message, force) {
        if (debug || force) { sjs.print(message); }
    };

    log('STARTING VALIDATOR');

    var getConfig = function(path) {
        var json = sjs.file(path).readText(),
            options;
        log('Loaded config:');
        log(json);
        if (json) {
            return _.extend({}, DEFAULT_CONFIG, JSON.parse(json)); 
        }
    };

    var getValidationUrl = function(url) {
        var templ = _.template(config.validatorUrl);
        return templ({
            url: url,
            validatorHost: config.validatorHost
        });
    };
    var printError = function(url, message) {
        var msg = message.message
                        .replace(new RegExp(String.fromCharCode(226,8364,339), 'g'), '"')
                        .replace(new RegExp(String.fromCharCode(226,8364,65533), 'g'), '"'),
            errTmpl = _.template(config.errorTemplate);

        sjs.print(errTmpl({
            url: url,
            lastLine: message.lastLine,
            message: msg
        }));
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
            for (ii = 0; ii < config.whiteList.length; ii++) {
                var whiteListItem = config.whiteList[ii];
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
        log('Using validation url: ' + validationUrl);
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
        var urls,
            url,
            i;

        log('Initialising');

        if (urlArg) {
            log('Validating single url: ' + urlArg);
            validateUrl(urlArg);
        } else if (configPath) {
            log('Loading from config ' + configPath);
            config = getConfig(configPath);
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
