/**
 * Service to get data from TopCoder API
 */
const request = require('superagent');
const config = require('config');
const _ = require('lodash');
const Remarkable = require('remarkable')

/**
 * Get users details by ids
 *
 * @param  {Array} ids list of user ids
 *
 * @return {Promise}   resolves to the list of user details
 */
const getUsersById = (ids) => {
  const query = _.map(ids, (id) => 'id=' + id).join(' OR ');
  return M2m.getMachineToken(config.AUTH0_CLIENT_ID, config.AUTH0_CLIENT_SECRET)
    .then((token) => {
      return request
        .get(`${config.TC_API_V3_BASE_URL}/users?fields=userId,email,handle,firstName,lastName&filter=${query}`)
        .set('accept', 'application/json')
        .set('authorization', `Bearer ${token}`)
        .then((res) => {
          if (!_.get(res, 'body.result.success')) {
            throw new Error(`Failed to get users by id: ${ids}`);
          }
          const users = _.get(res, 'body.result.content');
          return users;
        }).catch((err) => {
          const errorDetails = _.get(err, 'response.body.result.content.message');
          throw new Error(
            `Failed to get users by ids: ${ids}.` +
            (errorDetails ? ' Server response: ' + errorDetails : '')
          );
        });
    })
    .catch((err) => {
      err.message = 'Error generating m2m token: ' + err.message;
      throw err;
    });
};

/**
 * Get topic details
 *
 * @param  {String} topicId topic id
 *
 * @return {Promise}          promise resolved to topic details
 */
const getTopic = (topicId, logger) => {
  return M2m.getMachineToken(config.AUTH0_CLIENT_ID, config.AUTH0_CLIENT_SECRET)
    .then((token) => {
      return request
        .get(`${config.MESSAGE_API_BASE_URL}/topics/${topicId}/read`)
        .set('accept', 'application/json')
        .set('authorization', `Bearer ${token}`)
        .then((res) => {
          if (!_.get(res, 'body.result.success')) {
            throw new Error(`Failed to get topic details of topic id: ${topicId}`);
          }

          return _.get(res, 'body.result.content');
        }).catch((err) => {
          if (logger) {
            logger.error(err, `Error while calling ${config.MESSAGE_API_BASE_URL}/topics/${topicId}/read`);
          }
          const errorDetails = _.get(err, 'response.body.result.content.message');
          throw new Error(
            `Failed to get topic details of topic id: ${topicId}.` +
            (errorDetails ? ' Server response: ' + errorDetails : '')
          );
        });
    })
    .catch((err) => {
      err.message = 'Error generating m2m token: ' + err.message;
      throw err;
    });
};


/**
 * Convert markdown into raw draftjs state
 *
 * @param {String} markdown - markdown to convert into raw draftjs object
 * @param {Object} options - optional additional data
 *
 * @return {Object} ContentState
**/
const markdownToHTML = (markdown) => {
  const md = new Remarkable('full', {
    html: true,
    linkify: true,
    // typographer: true,
  })
  // Replace the BBCode [u][/u] to markdown '++' for underline style
  const _markdown = markdown.replace(new RegExp('\\[/?u\\]', 'g'), '++')
  return md.render(_markdown, {}) // remarkable js takes markdown and makes it an array of style objects for us to easily parse
}


module.exports = {
  getUsersById,
  getTopic,
  markdownToHTML,
};
