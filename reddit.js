const puppeteer = require("puppeteer");
const axios = require("axios");

const REDDIT_URL = (redditUrl) => `https://old.reddit.com/user/${redditUrl}`;
const SUBREDDIT_URL = (redditUrl) => `https://old.reddit.com/${redditUrl}`;
const SUBREDDIT_ABOUT_JSON_URL = (redditUrl) =>
  `https://www.reddit.com/${redditUrl}/about.json`;
const NUM_POSTS_PER_PAGE = 25;

const self = {
  browser: null,
  page: null,
  initializeOverview: async (redditUrl) => {
    self.browser = await puppeteer.launch({
      headless: false,
      args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-infobars"],
    });
    self.page = await self.browser.newPage();
    await self.page.goto(REDDIT_URL(redditUrl), { waitUntil: "networkidle0" });
  },
  initializeOverviewPosts: async (redditUrl) => {
    self.browser = await puppeteer.launch({
      headless: false,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    self.page = await self.browser.newPage();

    // Disable photos and css to reduce scrape time
    await self.page.setRequestInterception(true);
    self.page.on("request", (req) => {
      if (
        req.resourceType() == "stylesheet" ||
        req.resourceType() == "font" ||
        req.resourceType() == "image"
      ) {
        req.abort();
      } else {
        req.continue();
      }
    });
    await self.page.goto(REDDIT_URL(redditUrl), { waitUntil: "networkidle0" });
  },
  getKarma: async () => {
    const interstitialButton = await self.page.$(
      'div[class="content"] > div[class="interstitial"] > form[class="pretty-form"] > div[class="buttons"] > button:nth-child(2)'
    );
    debugger;
    if (interstitialButton) {
      await interstitialButton.click();
      await self.page.waitForNavigation({ waitUntil: "networkidle0" });
    }
    let commentKarma = await self.page.$eval(
      'div[class="side"] > div[class="spacer"] > div[class="titlebox"] > span[class="karma comment-karma"]',
      (node) => node.innerText.trim()
    );
    let postKarma = await self.page.$eval(
      'div[class="side"] > div[class="spacer"] > div[class="titlebox"] > span[class="karma"]',
      (node) => node.innerText.trim()
    );
    console.log("COMMENT LIKES: ", commentKarma);
    console.log("POST LIKES: ", postKarma);
    return {
      comments: parseInt(commentKarma.replace(/,/g, "")),
      posts: parseInt(postKarma.replace(/,/g, "")),
    };
  },
  parseResults: async () => {
    const elements = await self.page.$$('#siteTable > div[class*="thing"]');
    let likes = [];
    for (let element of elements) {
      try {
        let score = await element.$eval('div[class="score unvoted"]', (node) =>
          node.innerText.trim()
        );
        console.log("PARSE RESULTS SCORE: ", score);
        let subreddit = await element.$eval(
          'p[class="tagline "] > a[class*="subreddit"]',
          (node) => node.innerText.trim()
        );
        console.log("PARSE RESULTS SUBREDDIT: ", subreddit);
        likes.push({
          score: parseInt(score),
          subreddit,
        });
      } catch (err) {
        likes.push(null);
      }
    }
    return likes;
  },
  getScoresBySubreddit: async () => {
    let results = [];
    let new_results = [];
    let nextAmount = 0;

    // Check if 'Over 18' check exists and click yes if true
    const interstitialButton = await self.page.$(
      'div[class="content"] > div[class="interstitial"] > form[class="pretty-form"] > div[class="buttons"] > button[name="over18"]',
      "yes"
    );
    if (interstitialButton) {
      await interstitialButton.click();
      await self.page.waitForNavigation({ waitUntil: "networkidle0" });
    }
    let nextPageButton = await self.page.$(
      'span[class="next-button"] > a[rel="nofollow next"]'
    );
    do {
      new_results = await self.parseResults();
      nextAmount += 25;
      results.push(...new_results);
      if (new_results.length >= NUM_POSTS_PER_PAGE) {
        nextPageButton = await self.page.$(
          'span[class="next-button"] > a[rel="nofollow next"]'
        );
        if (nextPageButton) {
          await nextPageButton.click();
          await self.page.waitForNavigation({ waitUntil: "networkidle0" });
        } else {
          break;
        }
      }
    } while (results.length === nextAmount);
    return aggregateScoreBySubreddit(results);
  },
  getMemberTotals: async (subreddits) => {
    const results = [];
    for (const subreddit of subreddits) {
      await self.initializeSubReddit(subreddit);
      const side = await self.page.$eval(
        'div[class="side"] > div:nth-child(6) >  div[class="titlebox"] > span[class="subscribers"] > span[class="number"]',
        (node) => node.innerText.trim()
      );
      results.push({
        subreddit,
        subscriberCount: side,
      });
    }
    return results;
  },
  getSubredditSubscriberCount: async (subreddits) => {
    const subscriberCounts = {};
    for (const subreddit of subreddits) {
      const subredditAbout = await axios.get(
        SUBREDDIT_ABOUT_JSON_URL(subreddit)
      );
      subscriberCounts[subreddit] = subredditAbout.data.data.subscribers;
    }
    return subscriberCounts;
  },
};

function aggregateScoreBySubreddit(scores) {
  const aggregates = {};
  for (const score of scores) {
    if (score) {
      aggregates[score.subreddit] = aggregates[score.subreddit]
        ? (aggregates[score.subreddit] += score.score)
        : score.score;
    }
  }

  return aggregates;
}

module.exports = self;
