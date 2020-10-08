import express from "express";
import path from "path";
import morgan from "morgan";
import bodyParser from "body-parser";
import reddit from "./reddit";
const app = express();

app.use(morgan("combined"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Endpoint to fetch aggregate of likes
app.get("/user/:handle/karma", async (req, res) => {
  const handle = req.params.handle;
  await reddit.initializeOverview(handle);
  const karma = await reddit.getKarma();
  console.log("TOTAL LIKES :", karma);
  res.send({ karma });
});

// Endpoint to fetch aggregated likes by subreddit
app.get("/user/:handle/scores-by-subreddit", async (req, res) => {
  const handle = req.params.handle;
  await reddit.initializeOverviewPosts(handle);
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
  res.send({ scoresBySubreddit });
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
