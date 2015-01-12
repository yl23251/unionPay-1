/**
 * lonso@foxmail.com
 */
'use strict';
var UnionPay = require('..');
var should = require('should');

var appInfo = {
	merId: "xxx",
	secret_key: "xxx",
	tradeAdd: "http://202.101.25.178:8080/gateway/merchant/trade",
	queryAdd: "http://202.101.25.178:8080/gateway/merchant/query",
	backEndUrl: "xxx"
};


describe('union server push test', function () {
	var unionPay = new UnionPay(appInfo);
	var now = new Date();
	var orderNo = '1234567890';
	var orderAmount = 100
		;
	it('good testCase for push trader', function (done) {
		unionPay.pushTrade(orderNo, orderAmount, now, 'test').then(function (data) {
			data.tn.should.not.be.null;
		}).catch(function (err) {
				(!err).should.be.true;
			}).finally(function () {
				done()
			})
	});

	it('good testCase for query trader', function (done) {
		unionPay.queryTrade(orderNo, now).then(function (data) {
			data.should.be.true;
		}).catch(function (err) {
				err.merId.should.be.equal(appInfo.merId);
			}).finally(function () {
				done()
			})
	});
});