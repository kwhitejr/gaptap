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

Handlebars.registerHelper('randomPun', function (input) {
  return Session.get('randomPun');
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
  },

  rating: function () {
    var username = Meteor.user().username;
    var currentPun = Session.get('randomPun');
    return currentPun.usersWhoRated.indexOf(username) < -1; // if true, user has not yet rated
  }
});

Template.Rating.helpers({
});

// Template.Rating.rendered = function () {
//   this.$('.rateit').rateit();
// };

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

    if (! Meteor.userId()) {
      alert("You must be signed in to submit!");
      form.reset();
      throw new Meteor.Error("You must be signed in to submit!");
    }

    if (Meteor.userId()) {
      Puns.insert({
        'prompt': prompt,
        'answer': answer,
        'userId': Meteor.userId(), // | 'anon',
        'author': username,
        'createdAt': new Date(),
        'ratings': []
      });
    }

    form.reset();
    alert('Thanks ', Meteor.user().username);
  }
});

Template.ShowTake.events({
  // Should load a pun when "More Pun" btn is clicked.
  'click [data-action="getPun"]': selectRandomPun
});

Template.Rating.events({
  'submit form': function (event, template) {
    event.preventDefault();

    var form = template.find('form');
    var rating = template.find('input[name="rating"]:checked').value;
    var currentPun = Session.get('randomPun');
    var username = Meteor.user().username || null;
    var ratingsCheck = false;

    for (var i = 0; i < currentPun.ratings.length; i++) {
      if (currentPun.ratings[i].hasOwnProperty('username')) {
        ratingsCheck = true;
        console.log('user found');
      }
    }


    if (! Meteor.userId()) {
      alert("You must be signed in to submit!");
      throw new Meteor.Error("You must be signed in to submit!");
    }
    if (! rating) {
      alert("You must enter a score.");
      throw new Meteor.Error("You must enter a score.");
    }
    if (Meteor.userId() && ratingsCheck === false) {
      console.log(username);
      Puns.update(
        { _id: currentPun._id},
        {
          $push: {
            // When pushing to ratings array, the {username: rating} object treats 'username' as a string instead of a variable.
            ratings: {username: rating}
          }
        }
      );
    }

    form.reset();

    console.log(currentPun.usersWhoRated);
    console.log(Session.get('randomPun').ratings);

    // alert('Thanks ', Meteor.user().username);

  }
});

/**********************************************************************/
/* Accounts */
/*********************************************************************/

Accounts.ui.config({
  passwordSignupFields: "USERNAME_ONLY"
});