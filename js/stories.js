"use strict";

// This is the global list of the stories, an instance of StoryList
let storyList;

/** Get and show stories when site first loads. */
async function getAndShowStoriesOnStart() {
  storyList = await StoryList.getStories();
  $storiesLoadingMsg.remove();
  putStoriesOnPage();
}

/** Gets list of stories from server, generates their HTML, and puts on page. */
function putStoriesOnPage() {
  console.debug("putStoriesOnPage");
  $allStoriesList.empty();
  // loop through all of our stories and generate HTML for them
  storyList.stories.forEach((story) => {
    const $story = generateStoryMarkup(story);
    $allStoriesList.append($story);
    $story.on("click", handleFav);
  });
  if (currentUser) {
    showFavIcon($allStoriesList);
  }
  $allStoriesList.show();
}

// A render method to render HTML for an individual Story instance - Returns the markup for the story.
function generateStoryMarkup(story) {
  const hostName = story.getHostName();
  return $(`
      <li id="${story.storyId}">
      <span>&#9825;</span>
        <a href="${story.url}" target="a_blank" class="story-link">
          ${story.title}
        </a>
        <small class="story-hostname">(${hostName})</small>
        <small class="story-author">by ${story.author}</small>
        <small class="story-user">posted by ${story.username}</small>
      </li>
    `);
}

// a render method to render HTML for my stories - "my stories" nav
function generateMyStoryMarkup() {
  if (currentUser.ownStories.length === 0) {
    return $(`<p>You haven't posted any story yet!</p>`).appendTo(
      $myStoriesList
    );
  } else {
    currentUser.ownStories.forEach((story) => {
      const $story = generateStoryMarkup(story);
      $story.prependTo($myStoriesList);
      $story.on("click", handleFav);
      //add edit and delete buttons to each story
      const $delete = $("<button>Delete</button>");
      const $edit = $("<button>Edit</button>");
      $delete.appendTo($story);
      $edit.appendTo($story);
      $delete.on("click", () => handleDeleteMyStory(story));
      $edit.on("click", () => handleEditMyStory(story));
    });
    // toggle fav icon for each story
    showFavIcon($myStoriesList);
  }
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

// submit new story
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

// a render method to render HTML for fav stories - "favorites" nav
function generateFavStoryMarkup() {
  if (currentUser.favorites.length === 0) {
    return $(`<p>You don't have any favorite stories yet!</p>`).appendTo(
      $favStoriesList
    );
  } else {
    currentUser.favorites.forEach((story) => {
      const $story = generateStoryMarkup(story);
      $story.children()[0].innerHTML = "&#9829;";
      $story.appendTo($favStoriesList);
      $story.on("click", handleFav);
    });
  }
}

// add or remove favorites
async function handleFav(e) {
  if (e.target.nodeName === "SPAN") {
    const storyId = e.target.parentElement.getAttribute("id");
    if (e.target.innerText == "♡") {
      e.target.innerHTML = "&#9829;";
      currentUser = await currentUser.addFavStory(storyId);
    } else if (e.target.innerText == "♥") {
      e.target.innerHTML = "&#9825;";
      currentUser = await currentUser.unFavStory(storyId);
    }
  }
}

// UI for fav icon
function showFavIcon(stories) {
  [...stories.children()].forEach(($li) => {
    if (
      currentUser.favorites
        .map((fav) => fav.storyId)
        .includes($li.getAttribute("id"))
    ) {
      $li.children[0].innerHTML = "&#9829;";
    }
  });
}
