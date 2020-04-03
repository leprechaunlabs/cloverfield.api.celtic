/**
 * job.ext.getStatus.js
 * @description Get External Job Status
 * @module clv/job/getStatus
 * @NApiVersion 2.0
 * @NScriptType Suitelet
 * @author Miquel Brazil <miquel@leprechaunpromotions.com>
 */

define(['N/https', 'N/search', "N/record"], function (https, search, record) {

    var orderStatusVariables = [];
    var _job = {};

    function _loadJob(finder) {
        try {
            var job = search.lookupFields({
                type: search.Type.SALES_ORDER, // @todo: consider how to use finder.recordType
                id: finder.id,
                columns: [
                    'tranid',
                    'otherrefnum',
                    'entity',
                    'saleseffectivedate', // not sure what this field is
                    'custbody_lp_status_artwork_setup',
                    'custbody_lp_status_approval_request',
                    'custbody_lp_status_payment',
                    'custbody_lp_status_stock',
                    'custbody_lp_status_artwork_setup',
                    'custbody_lp_email_approval',
                    'shipaddress',
                    'shipcarrier',
                    'shipmethod',
                    'shipdate',
                    'custbody_lp_shipping_arrival_date',
                    'custbody_lp_approval_request',
                    'trackingnumbers'
                ]
            });

            job.status = _getStatus(job);
            return job;

        } catch (e) {
            return e;
        }
    }

    function _getStatus(job) {
        /**
         * build system for checking each status component and returning a value
         * also need mechanism for determining value of Array and Objects
         */

        var status = {
            code: null,
            message: ''
        };

        if (job.custbody_lp_status_stock[0].value === '2') {
            status.code = 31; // Stock Issue
        } else if (job.custbody_lp_status_artwork_setup[0].value === '4' || job.custbody_lp_status_artwork_setup[0].value === '10') {
            status.code = 21; // Artwork Issue
        } else if (job.custbody_lp_status_artwork_setup[0].value === '3' || job.custbody_lp_status_artwork_setup[0].value === '9') {
            status.code = 26; // Revising
        } else if ((job.custbody_lp_status_approval_request[0].value === '4' || job.custbody_lp_status_approval_request[0].value === '8') && job.custbody_lp_status_payment[0].value === '5') {
            status.code = 11; // Pending Response & Payment
        } else if (job.custbody_lp_status_approval_request[0].value === '4' || job.custbody_lp_status_approval_request[0].value === '8') {
            status.code = 16; // Pending Response
        } else if (job.custbody_lp_status_approval_request[0].value === '2' || job.custbody_lp_status_approval_request[0].value === '6') {
            status.code = 25; // Revision Request Received
        } else if (
            (job.custbody_lp_status_approval_request[0].value === '1' || job.custbody_lp_status_approval_request[0].value === '5')
            && (job.custbody_lp_status_artwork_setup[0].value === '1' || job.custbody_lp_status_artwork_setup[0].value === '7')
            && (job.custbody_lp_status_payment[0].value === '1' || job.custbody_lp_status_payment[0].value === '2' || job.custbody_lp_status_payment[0].value === '3')
            && (job.custbody_lp_status_stock[0].value === '1' || job.custbody_lp_status_stock[0].value === '3')
        ){
            if (job.trackingnumbers) {
                status.code = '41' // Job Shipped
            } else {
                status.code = '51' // in Production
            }
        }

        return status;
    }

    function _getJob (refnum) {
        try {
            var finder = search.create({
                type: search.Type.SALES_ORDER,
                filters: [
                    {
                        name: 'tranid',
                        operator: search.Operator.IS,
                        values: refnum
                    }
                ]
            }).run().getRange({start: 0, end: 1});

            if (finder.length) {

                var job = _loadJob(finder[0]);

                if (job) {
                    _job.status = 'success';
                    _job.message = 'Job was found.';
                    _job.job = job;
                } else {
                    // issue with loading Job
                }

            } else {
                _job.status = 'error';
                _job.message = 'Job not found.';
                _job.job = null;
            }
        } catch (e) {
            /**
             * added in case Job Number variable is modified or not provided
             * this would ideally be include in a test suite
             */
            return e;
        }

        return _job;
    }

    function getJob (context) {
        if (context.request.parameters.refnum) {
            _job = _getJob(context.request.parameters.refnum);
        } else {
            _job = {
                status: 'error',
                message: 'something went wrong'
            }
        }

        context.response.setHeader({
            name: 'Content-Type',
            value: 'application/json; charset=utf-8'
        });

        context.response.write(JSON.stringify(_job));
    }

    return {
        onRequest: getJob
    }
});