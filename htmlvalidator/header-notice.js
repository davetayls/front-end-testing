/*!
 * Html Markup Validator
 * =====================
 * Version @VERSION_NUMBER, Released: @RELEASED
 *
 * This validator uses the validator.nu validation service.
 * We strongly advise to customise it to use your own instance of the validator
 *
 * Created by Dave Taylor (http://the-taylors.org)
 * 
 * Instructions for use can be found at <http://the-taylors.org/front-end-testing/>
 * or on the github repository <http://github.com/davetayls/front-end-testing>
 * 
 * Licensed under the MIT license. Take a look at the LICENSE file for details.
 *
 * Thanks to the following libraries which are used for this
 *  - underscore.js (http://documentcloud.github.com/underscore/)
 *  - json2 (https://github.com/douglascrockford/JSON-js)
 *  - Rivet (https://github.com/davetayls/rivet)
 *  - sjs (https://github.com/davetayls/sjs)
 *
 * How to use
 * ----------
 * To validate a single url: java -jar js.jar htmlvalidator.js url::http://exampleurl.com
 *
 * To validate using a config: java -jar js.jar htmlvalidator.js config::validation.config.json
 * An example config can be found in the root of the project.
 * 
 * Options
 * -------
 *  {
 *      // I recommend changing this to use a personal server
 *      validatorHost: 'validator.nu', 
 *
 *      // OPTIONAL: url template to use
 *      validatorUrl: 'http://<%= validatorHost %>/?level=error&out=json&doc=<%= url %>',
 *
 *      // OPTIONAL: an array of errors to whitelist using a simple contains
 *      whiteList: [
 *          "Legacy doctype",
 *          "xml:lang"
 *      ],
 *
 *      // the urls you want to validate
 *      urls: [],
 *
 *      // OPTIONAL: you can pass in a custom template for logging
 *      errorTemplate: '<%= url %>|<%= lastLine %>|<%= message %>'
 *  };
*/


