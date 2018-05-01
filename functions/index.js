const gcs = require('@google-cloud/storage')();
const spawn = require('child-process-promise').spawn;
const path = require('path');
const os = require('os');
const fs = require('fs');
const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

// Checks if uploaded images are flagged as Adult or Violence and if so blurs them.
exports.blurOffensiveImages = functions.storage.object().onFinalize((object) => {
  const filePath = object.name;
  const bucketName = object.bucket;
  const tempLocalFile = path.join(os.tmpdir(), path.basename(filePath));
  const messageId = filePath.split(path.sep)[1];
  const bucket = gcs.bucket(bucketName);

  // Download file from bucket.
  return bucket.file(filePath).download({ destination: tempLocalFile }).then(() => {
    console.log('Image has been downloaded to', tempLocalFile);
    // Blur the image using ImageMagick.
    return spawn('convert', [tempLocalFile, '-channel', 'RGBA', '-blur', '0x24', tempLocalFile]);
  }).then(() => {
    console.log('Image has been blurred');
    // Uploading the Blurred image back into the bucket.
    return bucket.upload(tempLocalFile, { destination: filePath });
  })
    .then(() => {
      console.log('Blurred image has been uploaded to', filePath);
      // Deleting the local file to free up disk space.
      fs.unlinkSync(tempLocalFile);
      console.log('Deleted local file.');
      // Indicate that the message has been moderated.
      return admin.database().ref(`/messages/${messageId}`).update({ moderated: true });
    })
    .then(() => {
      console.log('Marked the image as moderated in the database.');
      return null;
    });
});
