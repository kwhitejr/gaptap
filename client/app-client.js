/**********************************************************************/
/* Subscriptions */
/**********************************************************************/

Meteor.subscribe('puns');

/**********************************************************************/
/* Initial State */
/*********************************************************************/

Session.setDefault('page', 'Main');
Session.setDefault('randomPun', null);

if (Meteor.userId()) {
  Tracker.autorun(function () {
    Session.set('rated', userHasRated());
  });
}


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

// function ratingDisplay () {
//   var whetherRated = userHasRated();
//   if (whetherRated === true) {
//     Session.set('rated', 'rated');
//   } else {
//     Session.set('rated', 'notRated');
//   }
// }

function userHasRated () {
  var currentPun = Session.get('randomPun');
  var username = Meteor.user().username;
  var rated = false;

  if (!username) {
    rated = true;
  }

  for (var i = 0; i < currentPun.ratings.length; i++) {
    if (currentPun.ratings[i].hasOwnProperty(username)) {
      rated = true;
    }
  }

  return rated;
}

/********************************************************************/
/* Template Helpers */
/**********************************************************************/

Handlebars.registerHelper('randomPun', function (input) {
  return Session.get('randomPun');
});

Handlebars.registerHelper('isRated', function (input) {
  return Session.get('rated');
});

UI.body.helpers({
  isPage: function (page) {
    return Session.equals('page', page);
  }
});

Template.Give.helpers({

});

Template.Take.onCreated(selectRandomPun);

Template.Take.helpers({
  isRated: function () {
    return Session.get('rated');
  }
});

Template.Rating.helpers({

});


/*********************************************************************/
/* Template Events */
/*********************************************************************/

UI.body.events({
  'click .clickChangesPage': function(event, template) {
    Session.set('page', event.currentTarget.getAttribute('data-page'));
  }
});

Template.Give.events({
  'submit form': function (event, template) {
    event.preventDefault();
    var form = template.find('form');

    if (! Meteor.userId()) {
      alert("You must be signed in to submit!");
      form.reset();
      throw new Meteor.Error("You must be signed in to submit!");
    }

    if (Meteor.userId()) {
      var prompt = template.find('[name=prompt]').value;
      var answer = template.find('[name=answer]').value;
      var username = Meteor.user().username; // || 'anon';

      Puns.insert({
        'prompt': prompt,
        'answer': answer,
        'userId': Meteor.userId(), // | 'anon',
        'author': username,
        'createdAt': new Date(),
        'ratings': []
      });

      form.reset();
    }

    alert('Thanks ', Meteor.user().username);
  }
});

Template.Take.events({
  // Should load a pun when "More Pun" btn is clicked.
  'click [data-action="getPun"]': function () {
    selectRandomPun();
  }
});

Template.Rating.events({
  'submit form': function (event, template) {
    event.preventDefault();

    var form = template.find('form');
    var rating = template.find('input[name="rating"]:checked').value;
    var currentPun = Session.get('randomPun');
    var username = Meteor.user().username;
    var rated = userHasRated();


    console.log('This user has already rated the current pun: ' + rated);

    if (! Meteor.userId()) {
      alert("You must be signed in to submit!");
      throw new Meteor.Error("You must be signed in to submit!");
    }
    if (! rating) {
      alert("You must enter a score.");
      throw new Meteor.Error("You must enter a score.");
    }
    if (Meteor.userId() && rated === false) {
      var ratingObj = {};
      ratingObj[username] = rating;
      Puns.update(
        { _id: currentPun._id},
        {
          $push: {
            ratings: ratingObj
          }
        }
      );
    }

    form.reset();

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