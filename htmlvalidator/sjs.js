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
