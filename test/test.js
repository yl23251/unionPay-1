/**
 * lonso@foxmail.com
 */
'use strict';
var UnionPay = require('..');
var should = require('should');

var appInfo = {
	merId: "xxxx",
	secret_key: "xxxx",
	tradeAdd: "https://mgate.unionpay.com/gateway/merchant/trade",
	queryAdd: "https://mgate.unionpay.com/gateway/merchant/query",
	backEndUrl: "xxxx"
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

	xit('good testCase for query trader', function (done) {
		unionPay.queryTrade(orderNo, now).then(function (data) {
			data.should.be.true;
		}).catch(function (err) {
				err.merId.should.be.equal(appInfo.merId);
			}).finally(function () {
				done()
			})
	});
});