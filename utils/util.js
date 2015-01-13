/**
 * Created by lonso on 15-1-12.
 * liusc@polyvi.com
 */
'use strict';
var crypto = require('crypto');
var Promise = require('bluebird');
var http = require('http');

exports.cryptoMD5 = function (val) {
	return new Promise(function (resolve, reject) {
		resolve(crypto.createHash('md5').update((val).toString(), 'UTF-8').digest('hex'))
	})
};

var splitUrl = function (url) {
	return new Promise(function (resolve, reject) {
		try {
			url = url.split('//')[1];
			var urlSplit = url.split('/');
			var path = url.substring(url.indexOf('/'), url.length);
			var addInfo = urlSplit[0];
			var port = addInfo.split(':')[1] || 80;
			var hostname = addInfo.split(':')[0];
			resolve({
				port: port,
				hostname: hostname,
				path: path
			})
		} catch (e) {
			reject(e);
		}
	})
};


exports.requestHelper = function (postData) {
	return new Promise(function (resolve, reject) {
		var uri = postData.uri;
		var body = postData.body;
		splitUrl(uri).then(function (reqInfo) {
			var options = {
				hostname: reqInfo.hostname,
				port: reqInfo.port,
				path: reqInfo.path,
				method: 'POST',
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded',
					'Content-Length': body.length
				}
			};
			var req = http.request(options, function (res) {
				res.setEncoding('utf8');
				res.on('data', function (chunk) {
					resolve(chunk)
				});
			});

			req.on('error', function (e) {
				reject(e);
			});

			req.write(body);
			req.end();
		}).catch(function (e) {
				reject(e);
			})
	})
};