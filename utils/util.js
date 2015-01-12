/**
 * Created by lonso on 15-1-12.
 * liusc@polyvi.com
 */
'use strict';
var crypto = require('crypto');
var Promise = require('bluebird');

exports.cryptoMD5 = function (val) {
	return new Promise(function (resolve, reject) {
		resolve(crypto.createHash('md5').update((val).toString(), 'UTF-8').digest('hex'))
	})
};
