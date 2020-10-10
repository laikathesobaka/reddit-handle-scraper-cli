import express from "express";
import path from "path";
import morgan from "morgan";
import bodyParser from "body-parser";
import reddit from "./reddit";
const app = express();

app.use(morgan("combined"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const formatError = (status, message) => {
  return {
    status,
    message,
  };
};

// Endpoint to fetch aggregate of likes
app.get("/user/:handle/karma", async (req, res) => {
  const handle = req.params.handle;
  const initStatus = await reddit.initializeOverview(handle);
  if (initStatus !== 200) {
    if (initStatus === 404) {
      return res.send({
        error: formatError(
          initStatus,
          `Reddit page with handle ${handle} does not exist.`
        ),
        karma: null,
      });
    } else {
      return res.send({
        error: formatError(
          initStatus,
          `Error occurred retrieving ${handle}'s data.`
        ),
        karma: null,
      });
    }
  }
  const karma = await reddit.getKarma(handle);
  res.send({ error: null, karma });
});

// Endpoint to fetch aggregated likes by subreddit
app.get("/user/:handle/scores-by-subreddit", async (req, res) => {
  const handle = req.params.handle;
  const initStatus = await reddit.initializeOverviewPosts(handle);
  if (initStatus !== 200) {
    if (initStatus === 404) {
      return res.send({
        error: formatError(
          initStatus,
          `Reddit page with handle ${handle} does not exist.`
        ),
        scoresBySubreddit: null,
      });
    } else {
      return res.send({
        error: formatError(
          initStatus,
          `Error occurred retrieving ${handle}'s data.`
        ),
        scoresBySubreddit: null,
      });
    }
  }
  let aggregates = await reddit.getScoresBySubreddit();
  let subreddits = Object.keys(aggregates);
  let scoresBySubreddit = {};
  const subscriberCount = await reddit.getSubredditSubscriberCount(subreddits);
  for (const subreddit of subreddits) {
    scoresBySubreddit[subreddit] = {
      subreddit,
      subscriberTotal: subscriberCount[subreddit],
      score: aggregates[subreddit],
    };
  }
  res.send({ error: null, scoresBySubreddit });
});

if (["production"].includes(process.env.NODE_ENV)) {
  app.use(express.static("client/build"));
  app.get("*", (req, res) => {
    res.sendFile(path.resolve("client", "build", "index.html"));
  });
}

const port = process.env.PORT || 3001;

app.listen(port, () => {
  console.log(`listening to port ${port}`);
});

module.exports = app;
