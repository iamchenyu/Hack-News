"use strict";

/******************************************************************************
                      Handling navbar clicks and updating navbar
 *******************************************************************************/

/** When a user first logins in, update the navbar to reflect that. */
function updateNavOnLogin() {
  console.debug("updateNavOnLogin");
  $(".main-nav-links").show();
  $navLogin.hide();
  $navLogOut.show();
  $navUserProfile.text(`${currentUser.username}`).show();
}

/** Show main list of all stories when click site name */
$body.on("click", "#nav-all", navAllStories);
function navAllStories(evt) {
  console.debug("navAllStories");
  hidePageComponents();
  getAndShowStoriesOnStart();
}

/** Show login/signup on click on "login/signup" */
$navLogin.on("click", navLoginClick);
function navLoginClick(evt) {
  console.debug("navLoginClick", evt);
  hidePageComponents();
  $loginForm.show();
  $signupForm.show();
}

/** show user profile */
$navUserProfile.on("click", navUserProfile);
function navUserProfile() {
  hidePageComponents();
  $userProfileForm.show();
  $("#edit-user-name").val(currentUser.name);
  $("#edit-user-password").val(currentUser.password);
  $("#edit-user-username").val(currentUser.username);
}

/** Show stories the current user has created */
$myStoriesNav.on("click", navMyStories);
function navMyStories() {
  hidePageComponents();
  $myStoriesList.show();
  $myStoriesList.empty();
  generateMyStoryMarkup();
}

// show new story submission form
$newStoriesNav.on("click", navNewStory);
function navNewStory() {
  hidePageComponents();
  $newStoryForm.show();
}

// show user's favorite stories
$favoritesNav.on("click", navFavStories);
function navFavStories() {
  hidePageComponents();
  $favStoriesList.show();
  $favStoriesList.empty();
  generateFavStoryMarkup();
}
