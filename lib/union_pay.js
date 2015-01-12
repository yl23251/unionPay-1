/**
 * Created by lonso on 14-11-12.
 * lonso@foxmail.com
 */
'use strict';

var _ = require('lodash');
var util = require('../utils/util.js');
var Promise = require('bluebird');
var async = require('async');
var moment = require('moment');
var urlencode = require('urlencode');
var request = Promise.promisify(require("request"));

//union pay config
var notCryptoKeys = ['signMethod', 'signature', 'statusCode'];
var signMethod = "MD5";
var successCode = "00";
var transType = "01";
var version = "1.0.0";
var charset = "UTF-8";
var unionPayFormat = "YYYYMMDDHHmmss";

module.exports = unionPay;


function unionPay(appInfo) {
	if (!(this instanceof unionPay)) return new unionPay(appInfo);
	if (!appInfo.merId || !appInfo.secret_key || !appInfo.tradeAdd || !appInfo.queryAdd || !appInfo.backEndUrl)
		return new Error('merId,secret_key,tradeAdd,queryAdd,backEndUrl not be null');
	this.merId = appInfo.merId;
	this.secret_key = appInfo.secret_key;
	this.tradeAdd = appInfo.tradeAdd;
	this.queryAdd = appInfo.queryAdd;
	this.backEndUrl = appInfo.backEndUrl;
	this.orderTimeout = appInfo.orderTimeout || 15;
	return this;
}


/**
 * order key to signature
 */
var signature = exports.signature = function (args, secret_key) {
	return new Promise(function (resolve, reject) {
		var _keys = [];
		var signatureVal = [];
		for (var item in args) {
			_keys.push(item);
		}
		_keys.sort();

		_(_keys).forEach(function (key) {
			var _v = key + '=' + args[key];
			signatureVal.push(_v)
		});

		async.waterfall([function (cb) {
			util.cryptoMD5(secret_key).then(function (data) {
				cb(null, data);
			})
		}, function (md5V, cb) {
			signatureVal = signatureVal.join('&') + '&' + md5V.toLowerCase();
			util.cryptoMD5(signatureVal).then(function (data) {
				cb(null, data.toLowerCase());
			})
		}], function (err, signatureV) {
			if (err) reject(err);
			else resolve(signatureV);
		})

	})
};

/**
 *  string to obj;
 */
var objToString = function (obj) {
	return new Promise(function (resolve, reject) {
		var values = [];
		for (var key in obj) {
			var _v = key + '=' + obj[key];
			values.push(_v);
		}
		resolve(values.join('&'));
	})
};

/**
 * analyze respolse
 */
var analyzeRes = function (body) {
	return new Promise(function (resolve, reject) {
		try {
			var _r = {};
			var list = body[1].split("&");
			for (var i = 0; i < list.length; i++) {
				var kv = list[i].split("=");
				_r[kv[0]] = kv[1]
			}
			resolve(_r);
		} catch (e) {
			reject(e);
		}
	})
};

/**
 * get key info
 */

var getResCryptoObj = exports.getResCryptoObj = function (obj) {
	return new Promise(function (resolve, reject) {
		var verifyObj = {};
		for (var key in obj) {
			if (!~notCryptoKeys.indexOf(key))
				verifyObj[key] = obj[key];
		}
		resolve(verifyObj)
	})
};

/**
 * url encode
 */
var objectEncode = function (body) {
	return new Promise(function (resolve, reject) {
		for (var key in body) {
			body[key] = urlencode(body[key]);
		}
		resolve(body);
	})
};
/**
 * url decode
 */
var objectDecode = exports.objectDecode = function (body) {
	return new Promise(function (resolve, reject) {
		for (var key in body) {
			body[key] = urlencode.decode(body[key]);
		}
		resolve(body);
	})
};

/**
 * signature check
 */
var getResult = function (requestBody, secret_key, options) {
	return new Promise(function (resolve, reject) {
		signature(requestBody, secret_key)
			.bind({})
			.then(function (signatureV) {
				this.signatureV = signatureV;
				return objectEncode(requestBody)
			}).then(function (encodeObj) {
				encodeObj.signature = this.signatureV;
				encodeObj.signMethod = signMethod;
				return objToString(encodeObj);
			}).then(function (data) {
				options.body = data;
				return request(options)
			}).then(function (response) {
				return analyzeRes(response)
			}).then(function (data) {
				this.resSignature = data.signature;
				return getResCryptoObj(data)
			}).then(function (data) {
				this.resObj = data;
				return objectDecode(data)
			}).then(function (data) {
				return signature(data, secret_key);
			}).then(function (resSignature) {
				if (resSignature == this.resSignature) {
					if (this.resObj.respCode != successCode)
						return Promise.reject(this.resObj);
					else {
						resolve(this.resObj);
					}
				} else {
					return Promise.reject('response signature illegal')
				}
			}).catch(function (err) {
				return reject(err);
			})
	})
};

/**
 * push trade
 * @param orderNumber
 * @param orderAmount
 * @param orderTime
 * @param description
 * @returns {Promise}
 */
unionPay.prototype.pushTrade = function (orderNumber, orderAmount, orderTime, description) {
	var options = {
		uri: this.tradeAdd,
		method: 'POST'
	};
	var that = this;
	return new Promise(function (resolve, reject) {
		if (!orderNumber || (!orderAmount && orderAmount != 0) || !orderTime)
			return reject('orderNumber, orderTime, orderAmount not be null');
		var message = {
			version: version,
			charset: charset,
			transType: transType,
			merId: that.merId
		};

		message.backEndUrl = that.backEndUrl;
		message.orderTime = moment(orderTime).format(unionPayFormat);
		message.orderNumber = orderNumber;
		message.orderAmount = orderAmount;
		message.orderDescription = description;
		message.orderTimeout = moment(orderTime).add('m', that.orderTimeout).format(unionPayFormat);
		getResult(message, that.secret_key, options).then(function (data) {
			resolve(data);
		}).catch(function (e) {
				reject(e);
			})
	})
};

/**
 * query trader
 */
unionPay.prototype.queryTrade = function (orderNumber, orderTime) {
	var options = {
		uri: this.queryAdd,
		method: 'POST'
	};
	var that = this;
	return new Promise(function (resolve, reject) {
		if (!orderNumber || !orderTime) return Promise.reject();
		var message = {
			version: version,
			charset: charset,
			transType: transType,
			merId: that.merId
		};
		message.orderNumber = orderNumber;
		message.orderTime = moment(orderTime).format(unionPayFormat);
		getResult(message, that.secret_key, options).then(function (data) {
			resolve(data);
		}).catch(function (e) {
				reject(e);
			})
	})
};


/**
 * Asynchronous pay notice
 * @type {payNotice}
 */
unionPay.prototype.payNotice = function (obj) {
	if (!obj.signature) return Promise.reject('response signature illegal');
	var resSignature = obj.signature;
	var that = this;
	return new Promise(function (resolve, reject) {
		getResCryptoObj(obj).bind({}).then(function (data) {
			return objectDecode(data);
		}).then(function (data) {
				return signature(data, that.secret_key);
			}).then(function (data) {
				if (resSignature != data) return Promise.reject('response signature illegal');
				resolve(data);
			}).catch(function (e) {
				reject(e)
			})
	})
};


