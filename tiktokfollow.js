/**
 * Credits to @ridarf on GitHub for this. Very grateful.
 */
const { EventEmitter } = require("events");
const request = require("request-promise-native").defaults({ jar: true });

const prepareCookies = (username) => request(`https://tiktok.com/@${username}`);
const fetchAccountData = (username) =>
  request(`https://m.tiktok.com/node/share/user/@${username}`)
    .then(JSON.parse)
    .then(({ body }) => body);

const doesAccountExist = (username) =>
  fetchAccountData(username).then((body) => !!body.userData);
const getFollowerCount = (username) =>
  fetchAccountData(username).then((body) => body.userData.fans);
const getExactFollowerCount = (username) =>
  request(`https://api.livecounts.io/tiktok_estimated/${username}`, {
    headers: { referer: "https://livecounts.io" },
  })
    .then(JSON.parse)
    .then(({ followerCount }) => followerCount || getFollowerCount(username));

class TikTokFollowerCount extends EventEmitter {
  /**
   * Tik Tok follower count tracker.
   * @param {String} username - The username of the user to listen for followers.
   * @param {Number} interval - Time in milliseconds to update count.
   */
  constructor(username, interval = 2500) {
    super();
    this.username = username;
    this.interval = interval;
    this.init();
  }

  async init() {
    const { username, interval } = this;
    await prepareCookies();

    const valid = await doesAccountExist(username);
    if (!valid) throw new Error(`Could not find account @${username}`);

    this.followers = await getExactFollowerCount(username);
    this.emit("ready", this);

    setInterval(async () => {
      const previous = this.followers;
      const current = await getExactFollowerCount(username);
      const difference = current - previous;
      if (previous != current)
        this.emit("followerChange", {
          username,
          previous,
          current,
          difference,
        });
    }, interval);
  }
}

module.exports = TikTokFollowerCount;
