/**********************************************************************/
/* Subscriptions */
/**********************************************************************/

Meteor.subscribe('puns');

/**********************************************************************/
/* Initial State */
/*********************************************************************/

Session.setDefault('page', 'showMain');
Session.setDefault('randomPun', null);

/*****************************************************************************/
/* RPC (Remote Procedure Call) Methods */
/*****************************************************************************/

/********************************************************************/
/* Global Functions */
/**********************************************************************/

function selectRandomPun () {
  var puns = Puns.find().fetch();
  Session.set('randomPun', Random.choice(puns));
}

/********************************************************************/
/* Template Helpers */
/**********************************************************************/

Handlebars.registerHelper("randomPun", function (input) {
  return Session.get("randomPun");
});

UI.body.helpers({
  isPage: function (page) {
    return Session.equals('page', page);
  }
});

Template.ShowGive.helpers({

});

Template.ShowTake.onCreated(selectRandomPun);

Template.ShowTake.helpers({
  pun: function () {
    return Session.get('randomPun');
  }
});

/*********************************************************************/
/* Template Events */
/*********************************************************************/

UI.body.events({
  'click .clickChangesPage': function(event, template) {
    Session.set('page', event.currentTarget.getAttribute('data-page'));
  }
});

Template.ShowGive.events({
  'submit form': function (event, template) {
    event.preventDefault();


    var form = template.find('form');
    var prompt = template.find('[name=prompt]').value;
    var answer = template.find('[name=answer]').value;
    var username = Meteor.user().username; // || 'anon';

    Puns.insert({
      'prompt': prompt,
      'answer': answer,
      'userId': Meteor.userId(), // | 'anon',
      'username': username,
      'createdAt': new Date()
    });

    form.reset();
    alert('Thanks ', Meteor.userId() | 'anon');
  }
});

Template.ShowTake.events({
  // Should load a pun when "More Pun" btn is clicked.
  'click [data-action="getPun"]': selectRandomPun
});

/**********************************************************************/
/* Accounts */
/*********************************************************************/

Accounts.ui.config({
  passwordSignupFields: "USERNAME_ONLY"
});