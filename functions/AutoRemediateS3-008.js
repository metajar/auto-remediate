'use strict'

const utils = require('../utils/S3_utils')
const AWS = require('aws-sdk')

const CCRuleCode = 'S3-008'
const CCRuleName = 'BucketAuthenticatedUsersWriteAccess'

const writeAuthenticatedUsers = {
  Grantee: { Type: 'Group', URI: 'http://acs.amazonaws.com/groups/global/AuthenticatedUsers' }, Permission: 'WRITE'
}

function handleError (message, callback) {
  message = message || 'Failed to process request.'
  return callback(new Error(message))
}

// look for and remove S3 BucketAuthenticatedUsersWriteAccess
const handler = (event, context, callback) => {
  console.log('S3', CCRuleName, ' - Received event:', JSON.stringify(event, null, 2))

  if (!event || !event.resource || event.ruleId !== CCRuleCode) {
    return handleError('Invalid event', callback)
  }

  var s3 = new AWS.S3({ apiVersion: '2006-03-01' })

  utils.filterAcl(s3, event.resource, writeAuthenticatedUsers).then(() => {
    callback(null, 'Success')
  }).catch((err) => {
    console.log(err, err.stack)
    callback(err, 'failed to auto-remediate', CCRuleCode)
  })
}

module.exports = {
  handler: handler
}
