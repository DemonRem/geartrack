const assert = require('chai').assert

const directLink = require('../src/directLink')

describe('DirectLink', function () {
    this.timeout(0)

    describe('#DirectLink - OrderNumber Q..XX', function () {
        it('Sweden Gearbest - Shoud receive an order number and get the item number', function (done) {
            const id = 'Q1845621341XX'
            directLink.getItemNumber(id, (err, item) => {
                assert.isNull(err)

                assert.equal(item, 'RE845621341SE')

                done()
            })
        });

        it('should fail to extract', function (done) {
            const id = 'Q18456342341XX'
            directLink.getInfo(id, (err, info) => {
                assert.isNotNull(err)

                done()
            })

        });
    })

    describe('#DirectLink', function () {
        it('should extract the messages from the website with success', function (done) {
            const id = 'RE845212395SE'
            directLink.getInfo(id, (err, info) => {
                assert.isNotNull(info)
                assert.isNull(err)

                assert.equal(info.id, 'RE845212395SE')
                assert.equal(info.state, 'Order delivered')

                assert.deepEqual(info.states, [
                    {
                        "date": "2017-01-13T09:32:00+01:00",
                        "state": "Item pre-advice received"
                    },
                    {
                        "date": "2017-01-14T15:08:00+01:00",
                        "state": "Item received for processing"
                    },
                    {
                        "date": "2017-01-17T10:12:00+01:00",
                        "state": "Order departed on flight from origin"
                    },
                    {
                        "date": "2017-01-19T08:12:00+01:00",
                        "state": "Order departed from sorting hub"
                    },
                    {
                        "date": "2017-02-01T15:05:00+01:00",
                        "state": "Order received into final destination country"
                    },
                    {
                        "date": "2017-02-15T14:49:00+01:00",
                        "state": "Order awaiting customs clearance"
                    },
                    {
                        "date": "2017-03-16T09:31:00+01:00",
                        "state": "Order customs cleared and lodged with local delivery agent"
                    },
                    {
                        "date": "2017-03-27T17:59:00+02:00",
                        "state": "Order delivered"
                    }
                ].reverse())

                console.log(id + ' attempts: ' + info.retries)
                done()
            })

        });

        it('should extract the messages from the website with success', function (done) {
            const id = 'Q1845621341XX'
            directLink.getInfo(id, (err, info) => {
                assert.isNotNull(info)
                assert.isNull(err)

                assert.equal(info.id, 'RE845621341SE')
                assert(info.states.length > 3)

                console.log(id + ' attempts: ' + info.retries)
                done()
            })

        });

        it('should fail to extract', function (done) {
            const id = 'RE84521'
            directLink.getInfo(id, (err, info) => {
                assert.isNotNull(err)

                done()
            })

        });
    });


});