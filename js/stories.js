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
  for (let story of storyList.stories) {
    const $story = generateStoryMarkup(story);
    $allStoriesList.append($story);
    $story.on("click", handleFav);
  }
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
    for (let story of currentUser.ownStories) {
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
    }
    // toggle fav icon for each story
    showFavIcon($myStoriesList);
  }
}

// a render method to render HTML for fav stories - "favorites" nav
function generateFavStoryMarkup() {
  if (currentUser.favorites.length === 0) {
    return $(`<p>You don't have any favorite stories yet!</p>`).appendTo(
      $favStoriesList
    );
  } else {
    for (let story of currentUser.favorites) {
      const $story = generateStoryMarkup(story);
      $story.children()[0].innerHTML = "&#9829;";
      $story.appendTo($favStoriesList);
      $story.on("click", handleFav);
    }
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
  for (let $li of stories.children()) {
    for (let fav of currentUser.favorites) {
      if (fav.storyId == $li.getAttribute("id")) {
        $li.children[0].innerHTML = "&#9829;";
      }
    }
  }
}
