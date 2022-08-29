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

$userProfileForm.on("submit", handleUpdateUserProfile);
async function handleUpdateUserProfile(e) {
  e.preventDefault;
  const updatedUser = {
    name: $("#edit-user-name").val(),
    password: $("#edit-user-password").val(),
  };
  currentUser = await currentUser.updateProfile(updatedUser);
  saveUserCredentialsInLocalStorage();
  location.reload();
}

/** Show stories the current user has created */
$myStoriesNav.on("click", navMyStories);
function navMyStories() {
  hidePageComponents();
  $myStoriesList.show();
  $myStoriesList.empty();
  generateMyStoryMarkup();
}

// handle delete and edit buttons for each story
async function handleDeleteMyStory(story) {
  await story.deleteStory();
  location.reload();
}

function handleEditMyStory(story) {
  hidePageComponents();
  $editStoryForm.show();
  $("#edit-story-title").val(story.title);
  $("#edit-story-author").val(story.author);
  $("#edit-story-url").val(story.url);
  $("#edit-story-id").val(story.storyId);
}

$editStoryForm.on("submit", handleEditStorySubmit);
async function handleEditStorySubmit(e) {
  e.preventDefault();
  const storyId = $("#edit-story-id").val();
  const updatedStory = {
    title: $("#edit-story-title").val(),
    author: $("#edit-story-author").val(),
    url: $("#edit-story-url").val(),
  };
  await storyList.updateStory(storyId, updatedStory);
  location.reload();
}

// show new story submission form
$newStoriesNav.on("click", navNewStory);
function navNewStory() {
  hidePageComponents();
  $newStoryForm.show();
}

$newStoryForm.on("submit", handleNewStorySubmit);
async function handleNewStorySubmit(e) {
  e.preventDefault();
  const newStory = {
    title: $("#new-story-title").val(),
    author: $("#new-story-author").val(),
    url: $("#new-story-url").val(),
  };
  await storyList.addStory(newStory);
  $newStoryForm.trigger("reset");
  location.reload();
}

// show user's favourite stories
$favoritesNav.on("click", navFavStories);
async function navFavStories() {
  hidePageComponents();
  $favStoriesList.show();
  $favStoriesList.empty();
  generateFavStoryMarkup();
}
