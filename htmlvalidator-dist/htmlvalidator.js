/*
    http://www.JSON.org/json2.js
    2011-02-23

    Public Domain.

    NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.

    See http://www.JSON.org/js.html


    This code should be minified before deployment.
    See http://javascript.crockford.com/jsmin.html

    USE YOUR OWN COPY. IT IS EXTREMELY UNWISE TO LOAD CODE FROM SERVERS YOU DO
    NOT CONTROL.


    This file creates a global JSON object containing two methods: stringify
    and parse.

        JSON.stringify(value, replacer, space)
            value       any JavaScript value, usually an object or array.

            replacer    an optional parameter that determines how object
                        values are stringified for objects. It can be a
                        function or an array of strings.

            space       an optional parameter that specifies the indentation
                        of nested structures. If it is omitted, the text will
                        be packed without extra whitespace. If it is a number,
                        it will specify the number of spaces to indent at each
                        level. If it is a string (such as '\t' or '&nbsp;'),
                        it contains the characters used to indent at each level.

            This method produces a JSON text from a JavaScript value.

            When an object value is found, if the object contains a toJSON
            method, its toJSON method will be called and the result will be
            stringified. A toJSON method does not serialize: it returns the
            value represented by the name/value pair that should be serialized,
            or undefined if nothing should be serialized. The toJSON method
            will be passed the key associated with the value, and this will be
            bound to the value

            For example, this would serialize Dates as ISO strings.

                Date.prototype.toJSON = function (key) {
                    function f(n) {
                        // Format integers to have at least two digits.
                        return n < 10 ? '0' + n : n;
                    }

                    return this.getUTCFullYear()   + '-' +
                         f(this.getUTCMonth() + 1) + '-' +
                         f(this.getUTCDate())      + 'T' +
                         f(this.getUTCHours())     + ':' +
                         f(this.getUTCMinutes())   + ':' +
                         f(this.getUTCSeconds())   + 'Z';
                };

            You can provide an optional replacer method. It will be passed the
            key and value of each member, with this bound to the containing
            object. The value that is returned from your method will be
            serialized. If your method returns undefined, then the member will
            be excluded from the serialization.

            If the replacer parameter is an array of strings, then it will be
            used to select the members to be serialized. It filters the results
            such that only members with keys listed in the replacer array are
            stringified.

            Values that do not have JSON representations, such as undefined or
            functions, will not be serialized. Such values in objects will be
            dropped; in arrays they will be replaced with null. You can use
            a replacer function to replace those with JSON values.
            JSON.stringify(undefined) returns undefined.

            The optional space parameter produces a stringification of the
            value that is filled with line breaks and indentation to make it
            easier to read.

            If the space parameter is a non-empty string, then that string will
            be used for indentation. If the space parameter is a number, then
            the indentation will be that many spaces.

            Example:

            text = JSON.stringify(['e', {pluribus: 'unum'}]);
            // text is '["e",{"pluribus":"unum"}]'


            text = JSON.stringify(['e', {pluribus: 'unum'}], null, '\t');
            // text is '[\n\t"e",\n\t{\n\t\t"pluribus": "unum"\n\t}\n]'

            text = JSON.stringify([new Date()], function (key, value) {
                return this[key] instanceof Date ?
                    'Date(' + this[key] + ')' : value;
            });
            // text is '["Date(---current time---)"]'


        JSON.parse(text, reviver)
            This method parses a JSON text to produce an object or array.
            It can throw a SyntaxError exception.

            The optional reviver parameter is a function that can filter and
            transform the results. It receives each of the keys and values,
            and its return value is used instead of the original value.
            If it returns what it received, then the structure is not modified.
            If it returns undefined then the member is deleted.

            Example:

            // Parse the text. Values that look like ISO date strings will
            // be converted to Date objects.

            myData = JSON.parse(text, function (key, value) {
                var a;
                if (typeof value === 'string') {
                    a =
/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*)?)Z$/.exec(value);
                    if (a) {
                        return new Date(Date.UTC(+a[1], +a[2] - 1, +a[3], +a[4],
                            +a[5], +a[6]));
                    }
                }
                return value;
            });

            myData = JSON.parse('["Date(09/09/2001)"]', function (key, value) {
                var d;
                if (typeof value === 'string' &&
                        value.slice(0, 5) === 'Date(' &&
                        value.slice(-1) === ')') {
                    d = new Date(value.slice(5, -1));
                    if (d) {
                        return d;
                    }
                }
                return value;
            });


    This is a reference implementation. You are free to copy, modify, or
    redistribute.
*/

/*jslint evil: true, strict: false, regexp: false */

/*members "", "\b", "\t", "\n", "\f", "\r", "\"", JSON, "\\", apply,
    call, charCodeAt, getUTCDate, getUTCFullYear, getUTCHours,
    getUTCMinutes, getUTCMonth, getUTCSeconds, hasOwnProperty, join,
    lastIndex, length, parse, prototype, push, replace, slice, stringify,
    test, toJSON, toString, valueOf
*/


// Create a JSON object only if one does not already exist. We create the
// methods in a closure to avoid creating global variables.

var JSON;
if (!JSON) {
    JSON = {};
}

(function () {
    "use strict";

    function f(n) {
        // Format integers to have at least two digits.
        return n < 10 ? '0' + n : n;
    }

    if (typeof Date.prototype.toJSON !== 'function') {

        Date.prototype.toJSON = function (key) {

            return isFinite(this.valueOf()) ?
                this.getUTCFullYear()     + '-' +
                f(this.getUTCMonth() + 1) + '-' +
                f(this.getUTCDate())      + 'T' +
                f(this.getUTCHours())     + ':' +
                f(this.getUTCMinutes())   + ':' +
                f(this.getUTCSeconds())   + 'Z' : null;
        };

        String.prototype.toJSON      =
            Number.prototype.toJSON  =
            Boolean.prototype.toJSON = function (key) {
                return this.valueOf();
            };
    }

    var cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        gap,
        indent,
        meta = {    // table of character substitutions
            '\b': '\\b',
            '\t': '\\t',
            '\n': '\\n',
            '\f': '\\f',
            '\r': '\\r',
            '"' : '\\"',
            '\\': '\\\\'
        },
        rep;


    function quote(string) {

// If the string contains no control characters, no quote characters, and no
// backslash characters, then we can safely slap some quotes around it.
// Otherwise we must also replace the offending characters with safe escape
// sequences.

        escapable.lastIndex = 0;
        return escapable.test(string) ? '"' + string.replace(escapable, function (a) {
            var c = meta[a];
            return typeof c === 'string' ? c :
                '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
        }) + '"' : '"' + string + '"';
    }


    function str(key, holder) {

// Produce a string from holder[key].

        var i,          // The loop counter.
            k,          // The member key.
            v,          // The member value.
            length,
            mind = gap,
            partial,
            value = holder[key];

// If the value has a toJSON method, call it to obtain a replacement value.

        if (value && typeof value === 'object' &&
                typeof value.toJSON === 'function') {
            value = value.toJSON(key);
        }

// If we were called with a replacer function, then call the replacer to
// obtain a replacement value.

        if (typeof rep === 'function') {
            value = rep.call(holder, key, value);
        }

// What happens next depends on the value's type.

        switch (typeof value) {
        case 'string':
            return quote(value);

        case 'number':

// JSON numbers must be finite. Encode non-finite numbers as null.

            return isFinite(value) ? String(value) : 'null';

        case 'boolean':
        case 'null':

// If the value is a boolean or null, convert it to a string. Note:
// typeof null does not produce 'null'. The case is included here in
// the remote chance that this gets fixed someday.

            return String(value);

// If the type is 'object', we might be dealing with an object or an array or
// null.

        case 'object':

// Due to a specification blunder in ECMAScript, typeof null is 'object',
// so watch out for that case.

            if (!value) {
                return 'null';
            }

// Make an array to hold the partial results of stringifying this object value.

            gap += indent;
            partial = [];

// Is the value an array?

            if (Object.prototype.toString.apply(value) === '[object Array]') {

// The value is an array. Stringify every element. Use null as a placeholder
// for non-JSON values.

                length = value.length;
                for (i = 0; i < length; i += 1) {
                    partial[i] = str(i, value) || 'null';
                }

// Join all of the elements together, separated with commas, and wrap them in
// brackets.

                v = partial.length === 0 ? '[]' : gap ?
                    '[\n' + gap + partial.join(',\n' + gap) + '\n' + mind + ']' :
                    '[' + partial.join(',') + ']';
                gap = mind;
                return v;
            }

// If the replacer is an array, use it to select the members to be stringified.

            if (rep && typeof rep === 'object') {
                length = rep.length;
                for (i = 0; i < length; i += 1) {
                    if (typeof rep[i] === 'string') {
                        k = rep[i];
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (gap ? ': ' : ':') + v);
                        }
                    }
                }
            } else {

// Otherwise, iterate through all of the keys in the object.

                for (k in value) {
                    if (Object.prototype.hasOwnProperty.call(value, k)) {
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (gap ? ': ' : ':') + v);
                        }
                    }
                }
            }

// Join all of the member texts together, separated with commas,
// and wrap them in braces.

            v = partial.length === 0 ? '{}' : gap ?
                '{\n' + gap + partial.join(',\n' + gap) + '\n' + mind + '}' :
                '{' + partial.join(',') + '}';
            gap = mind;
            return v;
        }
    }

// If the JSON object does not yet have a stringify method, give it one.

    if (typeof JSON.stringify !== 'function') {
        JSON.stringify = function (value, replacer, space) {

// The stringify method takes a value and an optional replacer, and an optional
// space parameter, and returns a JSON text. The replacer can be a function
// that can replace values, or an array of strings that will select the keys.
// A default replacer method can be provided. Use of the space parameter can
// produce text that is more easily readable.

            var i;
            gap = '';
            indent = '';

// If the space parameter is a number, make an indent string containing that
// many spaces.

            if (typeof space === 'number') {
                for (i = 0; i < space; i += 1) {
                    indent += ' ';
                }

// If the space parameter is a string, it will be used as the indent string.

            } else if (typeof space === 'string') {
                indent = space;
            }

// If there is a replacer, it must be a function or an array.
// Otherwise, throw an error.

            rep = replacer;
            if (replacer && typeof replacer !== 'function' &&
                    (typeof replacer !== 'object' ||
                    typeof replacer.length !== 'number')) {
                throw new Error('JSON.stringify');
            }

// Make a fake root object containing our value under the key of ''.
// Return the result of stringifying the value.

            return str('', {'': value});
        };
    }


// If the JSON object does not yet have a parse method, give it one.

    if (typeof JSON.parse !== 'function') {
        JSON.parse = function (text, reviver) {

// The parse method takes a text and an optional reviver function, and returns
// a JavaScript value if the text is a valid JSON text.

            var j;

            function walk(holder, key) {

// The walk method is used to recursively walk the resulting structure so
// that modifications can be made.

                var k, v, value = holder[key];
                if (value && typeof value === 'object') {
                    for (k in value) {
                        if (Object.prototype.hasOwnProperty.call(value, k)) {
                            v = walk(value, k);
                            if (v !== undefined) {
                                value[k] = v;
                            } else {
                                delete value[k];
                            }
                        }
                    }
                }
                return reviver.call(holder, key, value);
            }


// Parsing happens in four stages. In the first stage, we replace certain
// Unicode characters with escape sequences. JavaScript handles many characters
// incorrectly, either silently deleting them, or treating them as line endings.

            text = String(text);
            cx.lastIndex = 0;
            if (cx.test(text)) {
                text = text.replace(cx, function (a) {
                    return '\\u' +
                        ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
                });
            }

// In the second stage, we run the text against regular expressions that look
// for non-JSON patterns. We are especially concerned with '()' and 'new'
// because they can cause invocation, and '=' because it can cause mutation.
// But just to be safe, we want to reject all unexpected forms.

// We split the second stage into 4 regexp operations in order to work around
// crippling inefficiencies in IE's and Safari's regexp engines. First we
// replace the JSON backslash pairs with '@' (a non-JSON character). Second, we
// replace all simple value tokens with ']' characters. Third, we delete all
// open brackets that follow a colon or comma or that begin the text. Finally,
// we look to see that the remaining characters are only whitespace or ']' or
// ',' or ':' or '{' or '}'. If that is so, then the text is safe for eval.

            if (/^[\],:{}\s]*$/
                    .test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@')
                        .replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']')
                        .replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {

// In the third stage we use the eval function to compile the text into a
// JavaScript structure. The '{' operator is subject to a syntactic ambiguity
// in JavaScript: it can begin a block or an object literal. We wrap the text
// in parens to eliminate the ambiguity.

                j = eval('(' + text + ')');

// In the optional fourth stage, we recursively walk the new structure, passing
// each name/value pair to a reviver function for possible transformation.

                return typeof reviver === 'function' ?
                    walk({'': j}, '') : j;
            }

// If the text is not JSON parseable, then a SyntaxError is thrown.

            throw new SyntaxError('JSON.parse');
        };
    }
}());
/*
	sjs
	===
	Server side JavaScript Framework
	http://github.com/davetayls/sjs
	
	Copyright (c) 2010 Dave Taylor (@davetayls), http://the-taylors.org
	This source code is subject to terms and conditions of the New BSD License.
	A copy of the license can be found in the license.txt file at the root of 
	this distribution.
	
	The aim of this project is to give a very simple server side JavaScript 
	framework which will work across various platforms.
	
	It will initially be compatible with Mozilla Rhino and Microsoft cscript.exe 
	and will allow you to do the following:
	
	Using cscript:
	c:\project>cscript project.js arg1::var arg2::"foo bar"
	
	Using rhino:
	c:\project>java -jar js.jar project.js arg1::var arg2::"foo bar"

--------------------------------------------------------
//load sjs if not used with juxtapo combiner
var sjsLocation = 'sjs.js';
if (typeof load !== 'undefined'){load(sjsLocation);}else if (typeof ActiveXObject !== 'undefined'){eval(new ActiveXObject("Scripting.FileSystemObject").OpenTextFile(sjsLocation,1).ReadAll());}else{throw('sjs is compatible with either Rhino or cscript');}
//end sjs load 
--------------------------------------------------------
*/
/*jslint rhino: true, vars: true, white: true, forin: true, plusplus: true, indent: 4, evil: true */
/*global define,require,ActiveXObject,WScript,environment */

(function(global){
    'use strict';
		
	var commandLineArgs,
		java,
		javaSystem;

	if (typeof global.java !== 'undefined'){
		java = global.java;
		javaSystem = java.lang.System;		
	}
	
	// global setup
	var sjs = {
		version: '@SJS_VERSION',
		fileSeparator : javaSystem ? javaSystem.getProperty('file.separator') : '\\',
		args: function(){
			if (!commandLineArgs){
				if(java){
					commandLineArgs = new sjs.Args(global['arguments'],'::');
				}else if(ActiveXObject){
					var items = [],
                        i;
					for (i=0;i<global.WSH.Arguments.length;i+=1){
						items.push(global.WSH.Arguments.Item(i));
					}
					commandLineArgs = new sjs.Args(items,'::');
				}				
			}
			return commandLineArgs;
		},
		file : function(path){
			return new sjs.io.File(path);
		},
        get: function(url, calback) {
            var self = this;

			if (java){
                return readUrl(url);
			}else if (WScript){
                throw 'Sorry this is not implemented yet';
            }
            
        },
		load: function(path){
			if (typeof load !== 'undefined'){
				load(path);
			}else if (typeof ActiveXObject !== 'undefined'){
				eval(new ActiveXObject("Scripting.FileSystemObject")
                    .OpenTextFile(path,1)
                    .ReadAll());
			}else{
				throw('sjs is not compatible with this JavaScript engine');
			}			
		},
		print : function(s){
			if (typeof print !== 'undefined'){
				print(s);
			} else if (global.WSH){
				global.WSH.Echo(s);
			}
		},
		workingDir: function(){
			if (java){
				return environment['user.dir'];
			}else if (WScript){
				return WScript.CreateObject("WScript.Shell").CurrentDirectory;
			}
		}
	};
	global.sjs = sjs;

	// arguments
	sjs.Args = function(args,separator){
		this.args = {};
		var length = args.length,
            i;
		for (i = 0; i < length; i += 1) {
			var keyValue = args[i].split(separator);
			var arg = this.args[keyValue[0]];
			if (!arg) {
				arg = new sjs.Arg(keyValue[0]);
			}
			arg.addValue(keyValue[1]);
			if (!this.args[keyValue[0]]){
				this.args[keyValue[0]] = arg;				
			}
		}
	};
	sjs.Args.prototype = {
		each: function(fn){
            var key;
			for (key in this.args){
				if(fn.call(this.args[key]) === false){
					break;
				}					
			}
			return this;
		},
        get: function(key) {
            var arg;
            this.each(function(){
                if (this.key === key) {
                    arg = this;
                    return false;
                }
            });
            return arg;
        },
        getValue: function(key) {
            var arg = this.get(key);   
            return arg ? arg.values : [];
        },
        getSingleValue: function(key){
            var val = this.getValue(key)[0];
            if (val && val.length) {
                return val;
            } else {
                return '';
            }
        }
	};
	sjs.Arg = function(key){
		this.key = key;
		this.values = [];
	};
	sjs.Arg.prototype = {
		addValue: function(val){
			this.values.push(val);
		},
		join: function(separator){
			return this.values.join(separator);
		}
	};
	
	/* io */
	sjs.io = {};
	sjs.io.File = function(path){
		if (java){
			this.javaFile = new java.io.File(path);
		}
		this.path = path;
		this.contents = this.readText();		
	};
	sjs.io.File.prototype = {
		contents: null,
		path: '',
		append: function(s, ins){
            var params = arguments;
			if (typeof s === 'number'){
				var lineNumber = s === 0 ? 0 : s -1;
				return this.insertLine(lineNumber, ins);
			}else{			
				this.contents += s;
			}
			return this;
		},
		clear: function(){
			this.contents = '';
			return this;
		},
		insertLine: function(index,s){
			var lines = this.readText().split('\n');
			lines.splice(index,0,s);
			this.contents = lines.join('\n');
			return this;
		},
		prepend: function(s){
			this.contents = s + this.contents;
			return this;
		},
		readText: function(force){
            var reader,
                buffer,
                line;

			if (!this.contents || force){
				this.contents = '';
				if (java){
					reader = new java.io.FileReader(this.javaFile);
					buffer = new java.io.BufferedReader(reader);
					while((line = buffer.readLine())){
				        this.contents += line + '\n';
					}
				}else if (ActiveXObject){
					var fs = new ActiveXObject("Scripting.FileSystemObject");
					this.contents = fs.OpenTextFile(this.path,1).ReadAll();					
				}
			}
			return this.contents;
		},
		save: function(newFile){
			if (typeof newFile === 'string'){
				this.path = newFile;
			}			
			if (java){
				if (typeof newFile === 'string'){
					this.javaFile = java.io.File(newFile);
				}
				var writer = new java.io.FileWriter(this.javaFile,false);
				var buffer = new java.io.BufferedWriter(writer);
				buffer.write(this.contents);
				buffer.close();
			}else if (ActiveXObject){
				var fso, f;
				var ForReading = 1, ForWriting = 2;
				fso = new ActiveXObject("Scripting.FileSystemObject");
				f = fso.OpenTextFile(this.path, ForWriting, true);
				f.Write(this.contents);
				f.Close();
			}
			return this;
		},
		text: function(text){
			this.contents = text;
			return this;
		}
	};
	
	
}(this));
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
    var getConfig = function(path) {
        var json = sjs.file(path).readText();
        if (debug) {
            sjs.print('Loaded config:');
            sjs.print(json);
        }
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
        var result,
            validState          = 'failed',
            validMessage,
            resultErrors;
        result = sjs.get(getValidationUrl(url));
        if (result) {
            result = JSON.parse(result);
            resultErrors = siftErrors(result.url, result.messages);
            validState = resultErrors.length === 0 ? 'passed' : 'failed';
            validMessage = 'Validation for ' + result.url + ' has ' + validState;
            if (validState === 'failed') {
                throw validMessage;
            }
        }
    };

    var init = function() {
        var config,
            urls,
            url,
            i;

        if (urlArg) {
            validateUrl(urlArg);
        } else if (configPath) {
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
