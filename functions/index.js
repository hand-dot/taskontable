// [START functions_sendgrid_setup]
const sgMail = require('@sendgrid/mail');
const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

// [START functions_get_payload]
/**
 * Constructs the SendGrid email request from the HTTP request body.
 *
 * @param {object} requestBody Cloud Function request body.
 * @param {string} data.to Email address of the recipient.
 * @param {string} data.from Email address of the sender.
 * @param {string} data.subject Email subject line.
 * @param {string} data.body Body of the email subject line.
 * @returns {object} Payload object.
 */
function getPayload(requestBody) {
  if (!requestBody.to) {
    const error = new Error('To email address not provided. Make sure you have a "to" property in your request');
    error.code = 400;
    throw error;
  } else if (!requestBody.from) {
    const error = new Error('From email address not provided. Make sure you have a "from" property in your request');
    error.code = 400;
    throw error;
  } else if (!requestBody.subject) {
    const error = new Error('Email subject line not provided. Make sure you have a "subject" property in your request');
    error.code = 400;
    throw error;
  } else if (!requestBody.body) {
    const error = new Error('Email content not provided. Make sure you have a "body" property in your request');
    error.code = 400;
    throw error;
  }

  return {
    to: requestBody.to,
    from: requestBody.from,
    subject: requestBody.subject,
    text: requestBody.body,
  };
}
// [END functions_get_payload]

// [START functions_sendgrid_email]
/**
 * Send an email using SendGrid.
 *
 * Trigger this function by making a POST request with a payload to:
 * https://[YOUR_REGION].[YOUR_PROJECT_ID].cloudfunctions.net/sendEmail?sg_key=[YOUR_API_KEY]
 *
 * @example
 * curl -X POST "https://us-central1.your-project-id.cloudfunctions.net/sendEmail?sg_key=your_api_key" --data '{"to":"bob@email.com","from":"alice@email.com","subject":"Hello from Sendgrid!","body":"Hello World!"}' --header "Content-Type: application/json"
 *
 * @param {object} req Cloud Function request context.
 * @param {object} req.query The parsed querystring.
 * @param {string} req.query.sg_key Your SendGrid API key.
 * @param {object} req.body The request payload.
 * @param {string} req.body.to Email address of the recipient.
 * @param {string} req.body.from Email address of the sender.
 * @param {string} req.body.subject Email subject line.
 * @param {string} req.body.body Body of the email subject line.
 * @param {object} res Cloud Function response context.
 */
exports.sendgridEmail = functions.https.onRequest((req, res) => Promise.resolve()
  .then(() => {
    if (req.method !== 'POST') {
      const error = new Error('Only POST requests are accepted');
      error.code = 405;
      throw error;
    }

    const key = req.query.sg_key;
    // Get a SendGrid client
    if (!key) {
      const error = new Error('SendGrid API key not provided. Make sure you have a "sg_key" property in your request querystring');
      error.code = 401;
      throw error;
    }
    console.log(`Sending email to: ${req.body.to}`);
    return sgMail.setApiKey(key).send(getPayload(req.body));
  })
  .then((response) => {
    if (response.statusCode < 200 || response.statusCode >= 400) {
      const error = Error(response.body);
      error.code = response.statusCode;
      throw error;
    }
    console.log(`Email sent to: ${req.body.to}`);
    // Forward the response back to the requester
    res.status(response.statusCode);
    if (response.headers['content-type']) {
      res.set('content-type', response.headers['content-type']);
    }
    if (response.headers['content-length']) {
      res.set('content-length', response.headers['content-length']);
    }
    if (response.body) {
      res.send(response.body);
    } else {
      res.end();
    }
  })
  .catch((err) => {
    console.error(err);
    const code = err.code || (err.response ? err.response.statusCode : 500) || 500;
    res.status(code).send(err);
    return Promise.reject(err);
  }));
// [END functions_sendgrid_email]
