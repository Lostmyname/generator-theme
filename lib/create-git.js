'use strict';

var exec = require('child-process-promise').exec;
var GitHubApi = require('github');
var bluebird = require('bluebird');

/**
 * Initiate a git repo.
 *
 * @param {object} options
 * @returns {Promise}
 */
function createGit(options) {
  // We only want to give this option to exec
  options = {
    cwd: options.cwd
  };

  return exec('git init', options)
    .then(function () {
      return exec('git add -A', options);
    })
    .then(function () {
      return exec('git commit -am "Added skeleton files"', options);
    });
}

/**
 * Create a GitHub repository on a specified organisation.
 *
 * @param {object} options
 */
function createGitHub(options) {
  var github = new GitHubApi({ version: '3.0.0' });

  github.authenticate({
    type: 'oauth',
    token: options.ghToken
  });

  var createFromOrg = bluebird.promisify(github.repos.createFromOrg);

  return createFromOrg({
    org: options.org,
    team_id: options.orgTeam,
    name: options.repo,
    description: options.repoDescription
  })
    .then(function () {
      var remote = 'git@github.com:' + options.org + '/' + options.repo + '.git';
      return exec('git remote add origin ' + remote);
    })
    .then(function () {
      return exec('git push -u origin master');
    });
}

/**
 * Creates a git repo and optionally a GitHub repo.
 *
 * @param {object} options
 * @param {function} [done] Callback.
 * @returns {Promise}
 */
module.exports = function (options, done) {
  var promise = createGit(options);

  if (options.github) {
    promise = promise.then(function() {
      return createGitHub(options);
    });
  }

  if (typeof done === 'function') {
    promise.then(done);
  }

  return promise;
};
