'use strict';
var yeoman = require('yeoman-generator');
var chalk = require('chalk');
var yosay = require('yosay');

var createGit = require('../lib/create-git');

module.exports = yeoman.generators.Base.extend({
  initializing: function () {
    this.pkg = require('../package.json');
  },

  prompting: function () {
    var done = this.async();

    // Have Yeoman greet the user.
    this.log(yosay(
      'Welcome to the super ' + chalk.red('lmn-theme') + ' generator! Also for projects.'
    ));

    var prompts = [
      {
        type: 'input',
        name: 'name',
        message: 'What\'s the name of the theme or project? (eg "careers")',
        validate: function (input) {
          return /^[a-z\-.]+$/.test(input) ? true : '[a-z\\-.] only pls';
        },
        default: this.appname
      },
      {
        type: 'list',
        name: 'type',
        message: 'Is this a theme or a project?',
        choices: ['Theme', 'Project'],
        default: 'Theme'
      },
      {
        type: 'input',
        name: 'description',
        message: 'Please describe the theme or project for the npm description'
      },
      {
        type: 'input',
        name: 'author',
        message: 'What\'s your GitHub username?',
        store: true
      },
      {
        type: 'confirm',
        name: 'github',
        message: 'Would you like a GitHub repo to be created automatically?',
        default: true
      },
      {
        type: 'input',
        name: 'ghToken',
        message: 'Can I have a personal access token? (Settings -> Applications)',
        store: true,
        when: function (answers) {
          return answers.github;
        }
      }
    ];

    this.prompt(prompts, function (props) {
      this.promptProps = props;

      done();
    }.bind(this));
  },

  writing: {
    app: function () {
      // Copy all non-dotfiles
      this.fs.copy(
        this.templatePath('static/**/*'),
        this.destinationRoot()
      );

      // Copy all dotfiles
      this.fs.copy(
        this.templatePath('static/.*'),
        this.destinationRoot()
      );

      // Copy dynamic files
      this.fs.copy(
        this.templatePath('dynamic/_gitignore'),
        this.destinationPath('.gitignore')
      );

      this.fs.copyTpl(
        this.templatePath('dynamic/_package.json'),
        this.destinationPath('package.json'),
        this.promptProps
      );
    }
  },

  install: {
    git: function () {
      var done = this.async();

      createGit({
        cwd: this.destinationRoot(),
        github: this.promptProps.github,
        org: 'Lostmyname',
        orgTeam: 316933,
        repo: this.promptProps.type + '.' + this.promptProps.name,
        repoDescription: this.promptProps.description,
        ghToken: this.promptProps.ghToken
	    })
        .then(function () {
          done();
        });
    },
    npm: function () {
      this.log(chalk.bold('\n\nRunning npm install\n'));
      this.npmInstall();
    }
  },

  end: function () {
    this.log(chalk.green.bold('\nALL DONE.'));
  }
});
