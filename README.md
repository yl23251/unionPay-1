union pay
=====
china union pay push trader and query order by nodejs.
complete push,query and async pay notice;


Example
=====

```javascript

    var appInfo = {
        merId: "xxx",
        secret_key: "xxx",
        tradeAdd: "xxx",
        queryAdd: "xxx",
        backEndUrl: "xx"
    };


	var unionPay = new UnionPay(appInfo);
	var now = new Date();
	var orderNo = '1234567890';
	var orderAmount = 100;



    unionPay.pushTrade(orderNo, orderAmount, now, 'test').then(function (data) {
        xxxx
    }).catch(function (err) {
            xxx
        }).finally(function () {
           xxx
        })

    unionPay.queryTrade(orderNo, now).then(function (data) {
        xxx
    }).catch(function (err) {
            xxx
        }).finally(function () {
            xxx
        })


    //server pay notice key,value object and secretKey
    unionPay.payNotice({key: value}, secretKey).then(function (data) {
        xxx
    }).catch(function (err) {
            xxx
        }).finally(function () {
            xxx
        })



```
License
=====
MIT
