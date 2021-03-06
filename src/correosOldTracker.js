'use strict';

const request = require('requestretry').defaults({timeout: 10000, maxAttempts: 2, retryDelay: 500})
const parser = require('cheerio')
const utils = require('./utils')
const sprintf = require('sprintf')
const moment = require('moment-timezone')
const zone = "Europe/Madrid" // +1h

const URL = 'https://www.correosexpress.com/web/correosexpress/envios4?param=%s;%s'

const correos = {}

/**
 * Get correos info
 * Scraps the Correos Express website
 * Async
 *
 * Design changes may break this code!!
 * @param id
 * @param postalcode
 * @param cb(Error, CorreosInfo)
 */
correos.getInfo = function (id, cb) {
    request(sprintf(URL, utils.getPostalCode(id), id), function (error, response, body) {
        if (error || response.statusCode != 200) {
            cb(utils.errorDown())
            return
        }

        // Not found
        if (body.indexOf('portlet-msg-error') != -1) {
            cb(utils.errorNoData())
            return
        }

        let entity = null
        try {
            entity = createCorreosEntity(body, id)
            entity.retries = response.attempts
        } catch (error) {
            return cb(utils.errorParser(id, error.message))
        }

        cb(null, entity)
    })
}

/**
 * Create correos entity from html
 * @param html
 */
function createCorreosEntity(html, id) {
    let $ = parser.load(html)

    let states = []
    const fields = ['date', 'info', 'department']
    $('.results-row').each(function (i, elem) {
        if (i == 0) return

        let state = {}
        $(this).children().each(function (s, e) {
            let text = $(this).text().trim()

            if(s == 0)
                text = moment.tz(text, "DD/MM/YY HH:mm", zone).format()

            state[fields[s]] = text
        })

        states.push(state)
    })

    return new CorreosInfo({
        'nenvio': $('#nenvio').val(),
        'estado': $('#estado').val(),
        'fecha': $('#fecha').val(),
        'fechaEstado': $('#fechaEstado').val(),
        'sendername': $('#sendername').val(),
        'sendercity': $('#sendercity').val(),
        'senderaddress': $('#senderaddress').val(),
        'receivername': $('#receivername').val(),
        'receivercity': $('#receivercity').val(),
        'receiveraddress': $('#receiveraddress').val(),
        'weight': $('#weight').val(),
        'parcels': $('#parcels').val(),
        'ref': $('#reference').val(),
        'observations': $('#observations').val(),
        'states': states,
        'id': id
    })
}

/*
 |--------------------------------------------------------------------------
 | Entity
 |--------------------------------------------------------------------------
 */
function CorreosInfo(obj) {
    // Sent details
    this.id = obj.nenvio
    this.state = obj.estado
    this.received = moment.tz(obj.fecha, "DD/MM/YY", zone).format()
    this.lastUpdate = moment.tz(obj.fechaEstado, "DD/MM/YY HH:mm", zone).format()

    // Sender Details
    this.sender = {
        name: obj.sendername.replace('¿', ''),
        city: obj.sendercity,
        address: obj.senderaddress
    }

    // Receiver Details
    this.receiver = {
        name: obj.receivername,
        city: obj.receivercity,
        address: obj.receiveraddress
    }

    // Product Details
    this.product = {
        weight: obj.weight,
        parcels: obj.parcels,
        ref: obj.ref,
        observations: obj.observations
    }

    //States
    this.states = obj.states.reverse()

    this.trackerWebsite = correos.getLink(obj.id)
}

correos.getLink = function (id) {
    return sprintf(URL, utils.getPostalCode(id), id)
}

module.exports = correos