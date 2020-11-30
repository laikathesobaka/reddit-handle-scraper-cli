import puppeteer from "puppeteer";
import axios from "axios";

const USER_PROFILE_URL = (redditUrl) =>
  `https://old.reddit.com/user/${redditUrl}`;
const SUBREDDIT_ABOUT_JSON_URL = (redditUrl) =>
  `https://www.reddit.com/${redditUrl}/about.json`;
const NUM_POSTS_PER_PAGE = 25;

export const scraper = {
  handle: "",
  browser: null,
  page: null,
  userProfileUrl: "",
  setHandleInfo(handle) {
    this.handle = handle;
    this.userProfileUrl = USER_PROFILE_URL(handle);
  },
  async initializeOverview() {
    try {
      this.browser = await puppeteer.launch({
        headless: true,
        args: [
          "--no-sandbox",
          "--disable-setuid-sandbox",
          "--disable-infobars",
        ],
      });
      this.page = await this.browser.newPage();
      const res = await this.page.goto(this.userProfileUrl, {
        waitUntil: "networkidle0",
        timeout: 60000,
      });
      const initStatus = res.status();
      if (initStatus && initStatus !== 200) {
        if (initStatus === 404) {
          throw new Error(
            `Reddit page with handle ${this.handle} does not exist.`
          );
        } else {
          throw new Error(`Error occurred retrieving ${this.handle}'s data.`);
        }
      }
      return initStatus;
    } catch (err) {
      throw err;
    }
  },
  async initializeOverviewPosts() {
    try {
      this.browser = await puppeteer.launch({
        headless: true,
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
      });
      this.page = await this.browser.newPage();

      // Disable photos and css to reduce scrape time
      await this.page.setRequestInterception(true);
      this.page.on("request", (req) => {
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
      const res = await this.page.goto(this.userProfileUrl, {
        waitUntil: "networkidle0",
      });
      const initStatus = res.status();
      if (initStatus && initStatus !== 200) {
        if (initStatus === 404) {
          throw new Error(
            `Reddit page with handle ${this.handle} does not exist.`
          );
        } else {
          throw new Error(`Error occurred retrieving ${this.handle}'s data.`);
        }
      }
      return initStatus;
    } catch (err) {
      throw err;
    }
  },
  async fetchKarma() {
    try {
      const interstitialButton = await this.page.$(
        'div[class="content"] > div[class="interstitial"] > form[class="pretty-form"] > div[class="buttons"] > button:nth-child(2)'
      );
      if (interstitialButton) {
        await interstitialButton.click();
        await this.page.waitForNavigation({ waitUntil: "networkidle0" });
      }
      let commentKarma = await this.page.$eval(
        'div[class="side"] > div[class="spacer"] > div[class="titlebox"] > span[class="karma comment-karma"]',
        (node) => node.innerText.trim()
      );
      let postKarma = await this.page.$eval(
        'div[class="side"] > div[class="spacer"] > div[class="titlebox"] > span[class="karma"]',
        (node) => node.innerText.trim()
      );

      return {
        commentsKarma: parseInt(commentKarma.replace(/,/g, "")),
        postsKarma: parseInt(postKarma.replace(/,/g, "")),
      };
    } catch (err) {
      throw err;
    }
  },
  async getScoresBySubreddit() {
    let results = [];
    let new_results = [];
    let nextAmount = 0;

    try {
      const interstitialButton = await this.page.$(
        'div[class="content"] > div[class="interstitial"] > form[class="pretty-form"] > div[class="buttons"] > button[name="over18"]',
        "yes"
      );
      if (interstitialButton) {
        await interstitialButton.click();
        await this.page.waitForNavigation({ waitUntil: "networkidle0" });
      }
      let nextPageButton = await this.page.$(
        'span[class="next-button"] > a[rel="nofollow next"]'
      );
      do {
        new_results = await this.parseResults();
        nextAmount += 25;
        results.push(...new_results);
        if (new_results.length >= NUM_POSTS_PER_PAGE) {
          nextPageButton = await this.page.$(
            'span[class="next-button"] > a[rel="nofollow next"]'
          );
          if (nextPageButton) {
            await nextPageButton.click();
            await this.page.waitForNavigation({ waitUntil: "networkidle0" });
          } else {
            break;
          }
        }
      } while (results.length === nextAmount);
      await this.page.close();
      await this.browser.close();
      return aggregateScoreBySubreddit(results);
    } catch (err) {
      throw err;
    }
  },
  async parseResults() {
    const elements = await this.page.$$('#siteTable > div[class*="thing"]');
    let likes = [];
    for (let element of elements) {
      try {
        let score = await element.$eval('div[class="score unvoted"]', (node) =>
          node.innerText.trim()
        );
        let subreddit = await element.$eval(
          'p[class="tagline "] > a[class*="subreddit"]',
          (node) => node.innerText.trim()
        );
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
  async getSubredditSubscriberCount(subreddits) {
    const subscriberCounts = {};
    try {
      for (const subreddit of subreddits) {
        const subredditAbout = await axios.get(
          SUBREDDIT_ABOUT_JSON_URL(subreddit)
        );
        subscriberCounts[subreddit] = subredditAbout.data.data.subscribers;
      }
      return subscriberCounts;
    } catch (err) {
      throw err;
    }
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
