/********************************************************************/
/* Publications */
/*******************************************************************/

Meteor.publish('puns', function () {
  return Puns.find({});
});

/*********************************************************************/
/* Startup */
/***********************************************************************/

Meteor.startup(function () {
    // code to run on server at startup
});

/**********************************************************************/
/* Security */
/**********************************************************************/
Puns.allow({
  insert: function (userId, doc) {
    return true;
  },

  update: function (userId, doc) {
    return false;
  },

  remove: function (userId, doc) {
    return false;
  }
});