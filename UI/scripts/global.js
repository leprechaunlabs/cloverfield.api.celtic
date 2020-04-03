var netsuiteURL = "https://4976131-sb1.extforms.netsuite.com/app/site/hosting/scriptlet.nl?script=391&deploy=1&compid=4976131_SB1&h=bc0412cde19c51afd168";
var corsHerokuURL = "https://cors-anywhere.herokuapp.com/";

var env = {
    cors: {
        host: 'cors-anywhere.herokuapp.com',
        protocol: 'https'
    },
    netsuite: {
        domain: 'extforms.netsuite.com',
        path: 'app/site/hosting/scriptlet.nl',
        production: {
            account: '4976131',
            script: null,
            deploy: null,
        },
        staging: {
            account: '4976131-sb1',
            script: 391,
            deploy: 1
        }
    },
    host: {
        name: 'Distributor Central',
        domain: 'www.distributorcentral.com',
        protocol: 'https'
    }
};

var states = {
    11: {
        status: 'Pending Approval & Payment',
        message: 'We\'re still waiting on your response to our Approval Request as well as payment information. Check your email to find the notification we sent that contains the link to access your Approval Portal.'
    },
    16: {
        status: 'Pending Approval',
        message: 'We\'re still waiting on your response to our Approval Request. Check your email to find the notification we sent that contains the link to access your Approval Portal.'
    },
    21: {
        status: 'Artwork Issue',
        message: 'Our team has identified a potential issue with your Artwork. Please contact us so we can discuss the matter further.'
    },
    25: {
        status: 'Revision Request Received',
        message: 'We\'ve received your Revision Request and will be getting it queued as soon as possible.'
    },
    26: {
        status: 'Revising',
        message: 'We\'re currently processing your Revision Request. Be on the lookout for a new Approval Request from us shortly.'
    },
    31: {
        status: 'Stock Issue',
        message: 'Our team has identified a Stock Issue with your Job. Please contact us so we can discuss alternative options.'
    },
    41: {
        status: 'Shipped',
        message: 'Great news, your Job has shipped out! See the details below for more information.'
    },
    51: {
        status: 'Printing',
        message: 'Great news, we are currently producing your Job for you. It should be shipping according to the information below.'
    }
};

function buildOrderStatusURL(jobNumber) {
    var builtURL = "https://www.distributorcentral.com/preview/DD6F3DD9-FD1B-4041-80EE-A1B8342A5240/p/order-status?jobNumber=" + jobNumber;
    return builtURL;
}

$('.ui.form button').click(function(e) {
    e.preventDefault();

    var refnum = document.getElementById('job_number').value;

    if (isValidJobNumber(refnum)) {
        $.getJSON(getRequestURL(), getObjRefNum(refnum), function (response) {
            console.log(response);
            if (response.status === 'success') {
                var m = $('.ui.tiny.modal.valid');
                m.find('#status').text(_getStatus(response));
                m.find('#details').html(_getMessage(response));
                m.find('table tr th#customer ~ td').html(_getCustomer(response));
                m.find('table tr th#refnum ~ td').html(_getRefNum(response));
                m.find('table tr th#ordernum ~ td').html(_getOrderNum(response));
                m.find('table tr th#date_ship ~ td').html(_getDateShip(response));
                m.find('table tr th#date_arrival ~ td').html(_getDateArrival(response));
                m.modal('show');
            } else {
                $('.ui.tiny.modal.missing').modal('show');
            }
        });
    } else {
        $('.ui.tiny.modal.invalid').modal('show');
    }
});

function _getStatus (response) {
    var status = null;
    if (states.hasOwnProperty(response.job.status.code)) {
        status = states[response.job.status.code].status;
    }
    return status;
}

function _getMessage (response) {
    var message = null;
    if (states.hasOwnProperty(response.job.status.code)) {
        message = states[response.job.status.code].message;
    }
    return message;
}

function _getCustomer (response) {
    return parseCustomerName(response.job.entity[0].text);
}

function _getRefNum (response) {
    return response.job.tranid;
}

function _getOrderNum (response) {
    return response.job.otherrefnum;
}

function _getDateShip (response) {
    return response.job.shipdate;
}

function _getDateArrival (response) {
    return response.job.custbody_lp_shipping_arrival_date;
}

function isValidJobNumber (refnum) {
    var validate = {
        shape: /^[0-9]*$/g,
        size: 7
    };

    var _refnum = parseRefNum(refnum);
    return !!(_refnum.length === validate.size && _refnum.match(validate.shape));
}

function parseRefNum (refnum) {
    return refnum.replace(/[- ]/g, '');
}

function getRequestURL () {
    return 'https://cors-anywhere.herokuapp.com/' + 'https://4976131.extforms.netsuite.com/app/site/hosting/scriptlet.nl?script=609&deploy=1&compid=4976131&h=3f24a57f9b4074d816f6'
}

function buildCORSBypass () {}

function buildNSUrl () {}

function getObjRefNum (_refnum) {
    return {refnum: _refnum};
}

function parseCustomerName (name) {
    var _name = '';
    var pattern = /(^\S+\s)/g;
    _name = name.replace(pattern, "");
    return _name;
}