/**
 * job.ext.getStatus.js
 * @description Get External Job Status
 * @module clv/job/getStatus
 * @NApiVersion 2.0
 * @NScriptType Suitelet
 * @author Miquel Brazil <miquel@leprechaunpromotions.com>
 */

define(['N/https', 'N/search', "N/record", "N/log"], function (https, search, record, log) {

    var id = "";
    var jobnumber;
    var data = [];
    var objRecord;
    var orderStatusVariables = [];
    var has_data = [];

    function loadRecord() {
        objRecord = record.load({
            type: record.Type.SALES_ORDER,
            id: id
        });
        orderStatusVariables.push({
            approval_request: objRecord.getValue({fieldId: "custbody_lp_status_approval_request"}),
            artwork_setup: objRecord.getValue({fieldId: "custbody_lp_status_artwork_setup"}),
            payment: objRecord.getValue({fieldId: "custbody_lp_status_payment"}),
            stock: objRecord.getValue({fieldId: "custbody_lp_status_stock"})
        });

        data.push({
            custbody_lp_status_stock: objRecord.getValue({fieldId: "custbody_lp_status_stock"}),
            custbody_lp_status_artwork_setup: objRecord.getValue({fieldId: "custbody_lp_status_artwork_setup"}),
            custbody_lp_status_payment: objRecord.getValue({fieldId: "custbody_lp_status_payment"}),
            custbody_lp_status_approval_request: objRecord.getValue({fieldId: "custbody_lp_status_approval_request"}),
            tranid: objRecord.getText({fieldId: "tranid"}),
            otherrefnum: objRecord.getText({fieldId: "otherrefnum"}),
            saleseffectivedate: objRecord.getText({fieldId: "saleseffectivedate"}),
            entity: objRecord.getText({fieldId: "entity"}),
            custbody_lp_email_approval: objRecord.getText({fieldId: "custbody_lp_email_approval"}),
            custbody_lpl_so_total_less_shipcost: objRecord.getText({fieldId: "custbody_lpl_so_total_less_shipcost"}),
            shipaddress: objRecord.getText({fieldId: "shipaddress"}),
            carrier: objRecord.getText({fieldId: "carrier"}),
            shipmethod: objRecord.getText({fieldId: "shipmethod"}),
            shipdate: objRecord.getText({fieldId: "shipdate"}),
            custbody_lp_shipping_arrival_date: objRecord.getText({fieldId: "custbody_lp_shipping_arrival_date"}),
            custbody_lp_approval_request: objRecord.getText({fieldId: "custbody_lp_approval_request"}),
            linkedtrackingnumbers: objRecord.getText({fieldId: "linkedtrackingnumbers"}),
            status: getOrderStatus(orderStatusVariables),
            has_data: "true"
        });
    }

    function getOrderStatus(orderStatusVariables) {
        var status = {text_status: "Your Order Is Being Processed ", value_status: "-1"};
        if (orderStatusVariables[0].stock === "2") {
            status = {text_status: "Stock Issues", value_status: "2"};
            return status;
        }
        if (orderStatusVariables[0].artwork_setup === "4") {
            status = {text_status: "Art Issues", value_status: "4"};
            return status;
        }
        if (orderStatusVariables[0].approval_request === "2") {
            status = {text_status: "Queued For Revision", value_status: "2"};
            return status;
        }
        if (orderStatusVariables[0].approval_request === "3") {
            status = {text_status: "Pending Response", value_status: "3"};
            return status;
        }
        if (orderStatusVariables[0].payment === "5") {
            status = {text_status: "Pending Payment Response", value_status: "5"};
            return status;
        }
        if (orderStatusVariables[0].approval_request === "1" & orderStatusVariables[0].artwork_setup == "1" & (orderStatusVariables[0].payment == "1" || "2" || "3") & (orderStatusVariables[0].stock == "1" || "3")) {
            status = {text_status: "Queued For Printing", value_status: "12"};
            return status;
        }
        return status;
    }

    function createSearch() {
        search.create({
            type: search.Type.SALES_ORDER,
            filters:
                [{
                    name: 'tranid',
                    operator: search.Operator.IS,
                    values: [jobnumber]
                }],
        }).run().each(processResult);

        function processResult(result) {
            id = result.id;
            log.debug({});
            return true;
        }
    }

    function inspect(context) {
        jobnumber = context.request.parameters.jobNumber;

        context.response.setHeader({
            name: 'Content-Type',
            value: 'application/json; charset=utf-8'
        });
        createSearch();
        if (id === "") {
            data.push({has_data: "false"});
        } else {
            loadRecord();
        }

        context.response.write(JSON.stringify({
            data: data,
        }));
    }

    return {
        onRequest: inspect
    }
});

