import express from "express";
import path from "path";
import morgan from "morgan";
import bodyParser from "body-parser";
import reddit from "./reddit";
const app = express();

app.use(morgan("combined"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// app.enable("trust proxy");

// app.use(function (req, res, next) {
//   res.header("Access-Control-Allow-Origin", "localhost:3000"); // update to match the domain you will make the request from
//   res.header(
//     "Access-Control-Allow-Headers",
//     "Origin, X-Requested-With, Content-Type, Accept"
//   );
//   next();
// });

// Endpoint to fetch aggregate of likes
app.get("/likes/:handle/total", async (req, res) => {
  console.log("REQ PARAMS: ", req.params);
  const handle = req.params.handle;
  await reddit.initializeOverview(handle);
  const likes = await reddit.getTotalLikes();
  console.log("TOTAL LIKES :", likes);
  res.send({ likes });
});

// Endpoint to fetch aggregated likes by subreddit
app.get("/likes/:handle/by-subreddit", async (req, res) => {
  console.log("req.body: ", req.params);
  const handle = req.params.handle;
  let aggregates;
  let groups;
  let likesBySubreddit = {};
  await reddit.initializeOverviewPosts(handle);
  aggregates = await reddit.getAggregates();
  groups = Object.keys(aggregates);
  const subscriberCount = await reddit.getSubredditSubscriberCount(groups);
  for (const group of groups) {
    likesBySubreddit[group] = {
      subscriberTotal: subscriberCount[group],
      userLikes: aggregates[group],
    };
  }
  console.log("AGGREGATES RETRIEVED: ", likesBySubreddit);
  // Calculate aggregate worth
  res.send({ likesBySubreddit });
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
