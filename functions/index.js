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

// [START sendgridEmail]
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
    sgMail.setApiKey(key);
    sgMail.send(getPayload(JSON.parse(req.body))).then((response) => {
      console.log('Successfully sent message:', response);
      res.status(200).send({ success: true });
    })
      .catch((error) => {
        console.log('Error sending message:', error);
        res.status(500).send({ success: false, message: error });
      });
  }));
// [END sendgridEmail]

// [START removeUserWorksheetsById]
/**
 * Send an email using SendGrid.
 *
 * Trigger this function by making a POST request with a payload to:
 * https://[YOUR_REGION].[YOUR_PROJECT_ID].cloudfunctions.net/removeUserWorksheetsById
 *
 * @example
 * curl -X POST "https://us-central1.your-project-id.cloudfunctions.net/removeUserWorksheetsById" --data '{ "userId":"userId", "worksheetId":"worksheetId", "apiVersion":"apiVersion" }' --header "Content-Type: application/json"
 *
 * @param {object} req Cloud Function request context.
 * @param {object} req.body The request payload.
 * @param {string} req.body.userId userId.
 * @param {string} req.body.worksheetId worksheetId.
 * @param {string} req.body.apiVersion API Version.
 * @param {object} res Cloud Function response context.
 */
exports.removeUserWorksheetsById = functions.https.onRequest((req, res) => Promise.resolve()
  .then(() => {
    if (req.method !== 'POST') {
      const error = new Error('Only POST requests are accepted');
      error.code = 405;
      throw error;
    }
    const { apiVersion, userId, worksheetId } = JSON.parse(req.body);
    if (userId && worksheetId) {
      admin.database().ref(`/${apiVersion}/users/${userId}/worksheets/`).once('value').then((worksheetIds) => {
        if (!worksheetIds.exists() && !Array.isArray(worksheetIds.val())) {
          const error = new Error('The member who tried to delete did not exist.');
          error.code = 500;
          throw error;
        }
        admin.database().ref(`/${apiVersion}/users/${userId}/worksheets/`).set(worksheetIds.val().filter(_worksheetId => _worksheetId !== worksheetId)).then(() => {
          console.log('Successfully removeUserWorksheetsById:', { apiVersion, userId, worksheetId });
          res.status(200).send({ success: true });
        });
      });
    } else {
      const message = `${userId ? 'worksheetId' : 'userId'} is not set`;
      console.log('Error sending message:', message);
      res.status(500).send({ success: false, message });
    }
  }));
// [END removeUserWorksheetsById]