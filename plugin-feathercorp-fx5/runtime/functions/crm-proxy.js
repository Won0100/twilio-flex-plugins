const fetch = require('node-fetch');
const TokenValidator = require('twilio-flex-token-validator').validator;
const crmUrl = 'https://owlcrm-4339-dev.twil.io';

exports.handler = function (context, event, callback) {
  let response = new Twilio.Response();
  // '*' allows being called from any origin, this not the best security
  // practice and should only be used for testing; when builiding a production
  // plugin you should set the allowed origin to 'https://flex.twilio.com'
  // (or any custom domain you serve the plugin from)
  response.appendHeader('Access-Control-Allow-Origin', '*');

  response.appendHeader('Access-Control-Allow-Methods', 'OPTIONS POST');
  response.appendHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (isNaN(event.id)) {
    response.setBody(`Missing 'id' parameter`);
    response.setStatusCode(400);
    return callback(null, response);
  }
  if (!event.token) {
    response.setBody(`Missing 'token' parameter`);
    response.setStatusCode(400);
    return callback(null, response);
  }
  if (!context.CRM_APIKEY) {
    response.setBody(`Missing API key (CRM_APIKEY) environment variable`);
    response.setStatusCode(500);
    return callback(null, response);
  }

  TokenValidator(event.token, context.ACCOUNT_SID, context.AUTH_TOKEN)
    .then((tokenResult) => {
      // token validated
      if (
        tokenResult.roles.includes('supervisor') ||
        // include any specific users you want to allow (e.g. for testing)
        tokenResult.identity === 'jowling'
      ) {
        // Flex user is allowed to access security questions
        const data = new URLSearchParams();
        data.append('id', event.id);
        data.append('apikey', context.CRM_APIKEY);
        data.append('content', 'sq'); // get security questions, not user profile

        fetch(`${crmUrl}/json`, {
          method: 'POST',
          body: data
        })
          .then((data) => data.json())
          .then((data) => {
            response.appendHeader('Content-Type', 'application/json');
            response.setBody(data);
            return callback(null, response);
          })
          .catch((err) => {
            console.error('Fetch failed: ', err);
            response.setBody('Fetch failed');
            response.setStatusCode(500);
            return callback(null, response);
          });
      } else {
        const errUserAuth = 'User not authorized to access security questions';
        console.error(errUserAuth);
        response.setBody(errUserAuth);
        response.setStatusCode(401);
        return callback(null, response);
      }
    })
    .catch((err) => {
      // token validation failed
      console.error('Token validation failed: ', err);
      response.setBody('Token validation failed');
      response.setStatusCode(403);
      return callback(null, response);
    });
};
