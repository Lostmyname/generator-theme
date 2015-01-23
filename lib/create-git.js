'use strict';

var exec = require('child-process-promise').exec;
var GitHubApi = require('github');
var bluebird = require('bluebird');

/**
 * Initiate a git repo.
 *
 * @param {object} options
 * @param {function} [done] Callback.
 * @returns {Promise}
 */
function createGit(options, done) {
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
    })
    .then(function () {
      if (typeof done === 'function') {
        done();
      }
    });
}

/**
 * Create a GitHub repository on a specified organisation.
 *
 * @param {object} options
 * @param {function} [done] Callback.
 */
function createGitHub(options, done) {
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
    })
    .then(function () {
      if (typeof done === 'function') {
        done();
      }
    });
}

/**
 * Creates a git repo and optionally a github repo.
 *
 * @param {object} options
 * @param {function} [done] Callback.
 * @returns {Promise}
 */
module.exports = function (options, done) {
  return createGit(options)
    .then(function () {
      if (options.github) {
        return createGitHub(options, done);
      }

      if (typeof done === 'function') {
        done();
      }
    });
};
