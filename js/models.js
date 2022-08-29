"use strict";

const BASE_URL = "https://hack-or-snooze-v3.herokuapp.com";

/******************************************************************************
                    Story: a single story in the system
 ******************************************************************************/

class Story {
  constructor({ storyId, title, author, url, username, createdAt }) {
    this.storyId = storyId;
    this.title = title;
    this.author = author;
    this.url = url;
    this.username = username;
    this.createdAt = createdAt;
  }

  /** Parses hostname out of URL and returns it. */
  getHostName() {
    return new URL(this.url).hostname;
  }

  // allow users to remove a story
  async deleteStory() {
    try {
      const res = await axios({
        url: `${BASE_URL}/stories/${this.storyId}`,
        method: "DELETE",
        data: {
          token: currentUser.loginToken,
        },
      });
    } catch (err) {
      console.error("deleteStory failed", err);
      return null;
    }
  }
}

/******************************************************************************
         List of Story instances: used by UI to show story lists in DOM.
 ******************************************************************************/

class StoryList {
  constructor(stories) {
    this.stories = stories;
  }

  // Generate a new StoryList
  static async getStories() {
    // Note presence of `static` keyword: this indicates that getStories is **not** an instance method. Rather, it is a method that is called on the class directly. Why doesn't it make sense for getStories to be an instance method?

    // query the /stories endpoint (no auth required)
    const response = await axios({
      url: `${BASE_URL}/stories`,
      method: "GET",
    });

    // turn plain old story objects from API into instances of Story class
    const stories = response.data.stories.map((story) => new Story(story));

    // build an instance of our own class using the new array of stories
    return new StoryList(stories);
  }

  // Adds story data to API, makes a Story instance, adds it to story list.
  async addStory(newStory) {
    try {
      const { data } = await axios({
        url: `${BASE_URL}/stories`,
        method: "POST",
        data: {
          story: newStory,
          token: currentUser.loginToken,
        },
      });
      const { storyId, title, author, url, username, createdAt } = data.story;
      return new Story({
        storyId,
        title,
        author,
        url,
        username,
        createdAt,
      });
    } catch (e) {
      console.error("addStory failed", err);
      return null;
    }
  }

  // allow users to update a story
  async updateStory(storyId, updatedStory) {
    try {
      await axios({
        url: `${BASE_URL}/stories/${storyId}`,
        method: "PATCH",
        data: {
          token: currentUser.loginToken,
          story: updatedStory,
        },
      });
    } catch (err) {
      console.error("updateStory failed", err);
      return null;
    }
  }
}

/******************************************************************************************************
          User: a user in the system (only used to represent the current user)
******************************************************************************************************/

class User {
  constructor(
    { username, name, password, createdAt, favorites = [], ownStories = [] },
    token
  ) {
    this.username = username;
    this.name = name;
    this.password = password;
    this.createdAt = createdAt;

    // instantiate Story instances for the user's favorites and ownStories
    this.favorites = favorites.map((s) => new Story(s));
    this.ownStories = ownStories.map((s) => new Story(s));

    // store the login token on the user so it's easy to find for API calls.
    this.loginToken = token;
  }

  // Register new user in API, make User instance & return it
  static async signup(username, password, name) {
    try {
      const response = await axios({
        url: `${BASE_URL}/signup`,
        method: "POST",
        data: { user: { username, password, name } },
      });
      let { user } = response.data;
      return new User(
        {
          username: user.username,
          name: user.name,
          password: password,
          createdAt: user.createdAt,
          favorites: user.favorites,
          ownStories: user.stories,
        },
        response.data.token
      );
    } catch (e) {
      alert(e.response.data.error.message);
      return null;
    }
  }

  // Login in user with API, make User instance & return it
  static async login(username, password) {
    try {
      const response = await axios({
        url: `${BASE_URL}/login`,
        method: "POST",
        data: { user: { username, password } },
      });
      let { user } = response.data;
      return new User(
        {
          username: user.username,
          name: user.name,
          password: password,
          createdAt: user.createdAt,
          favorites: user.favorites,
          ownStories: user.stories,
        },
        response.data.token
      );
    } catch (e) {
      alert(e.response.data.error.message);
      return null;
    }
  }

  // When we already have credentials (token & username) for a user, we can log them in automatically
  static async loginViaStoredCredentials(token, username, password) {
    try {
      const response = await axios({
        url: `${BASE_URL}/users/${username}`,
        method: "GET",
        params: { token },
      });
      let { user } = response.data;
      return new User(
        {
          username: user.username,
          name: user.name,
          password: password,
          createdAt: user.createdAt,
          favorites: user.favorites,
          ownStories: user.stories,
        },
        token
      );
    } catch (err) {
      alert(e.response.data.error.message);
      return null;
    }
  }

  async updateProfile(updatedUser) {
    try {
      const { data } = await axios({
        url: `${BASE_URL}/users/${this.username}`,
        method: "PATCH",
        data: { token: this.loginToken, user: updatedUser },
      });
      let { user } = data;
      return new User(
        {
          username: user.username,
          name: user.name,
          password: updatedUser.password,
          createdAt: user.createdAt,
          favorites: user.favorites,
          ownStories: user.stories,
        },
        this.loginToken
      );
    } catch (e) {
      alert(e.response.data.error.message);
      return currentUser;
    }
  }

  async addFavStory(storyId) {
    try {
      const { data } = await axios({
        url: `${BASE_URL}/users/${this.username}/favorites/${storyId}`,
        method: "POST",
        data: { token: this.loginToken },
      });
      let { user } = data;
      return new User(
        {
          username: user.username,
          name: user.name,
          password: localStorage.password,
          createdAt: user.createdAt,
          favorites: user.favorites,
          ownStories: user.stories,
        },
        this.loginToken
      );
    } catch (err) {
      alert(e.response.data.error.message);
      return currentUser;
    }
  }

  async unFavStory(storyId) {
    try {
      const { data } = await axios({
        url: `${BASE_URL}/users/${this.username}/favorites/${storyId}`,
        method: "DELETE",
        data: { token: this.loginToken },
      });
      let { user } = data;
      return new User(
        {
          username: user.username,
          name: user.name,
          password: localStorage.password,
          createdAt: user.createdAt,
          favorites: user.favorites,
          ownStories: user.stories,
        },
        this.loginToken
      );
    } catch (err) {
      alert(e.response.data.error.message);
      return currentUser;
    }
  }
}
