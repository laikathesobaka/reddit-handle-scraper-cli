#!/usr/bin/env node

import chalk from "chalk";
import clear from "clear";
import figlet from "figlet";
import CLI from "clui";
import { promptForHandle } from "../lib/inquirer.js";
import { scraper } from "../lib/reddit.js";
import Table from "cli-table3";

clear();

console.log(
  chalk.red(
    figlet.textSync("Reddit Handle Scraper", { horizontalLayout: "full" })
  )
);

const Progress = CLI.Progress;
const progressBar = new Progress(20);

const karmaTable = new Table({
  head: ["Total Karma"],
});

const aggregatesTable = new Table({
  head: ["Subreddit", "Member Total", "Points"],
  colWidths: [20, 20, 20],
});

const run = async () => {
  const { handle } = await promptForHandle();

  // Create reddit scraper instance
  scraper.setHandleInfo(handle);

  // Initialize profile page associated with handle
  await scraper.initializeOverview();
  console.log(progressBar.update(0.2));

  // Scrape amassed karma points section from proffile
  const { commentsKarma, postsKarma } = await scraper.fetchKarma();

  console.log(progressBar.update(0.4));
  karmaTable.push({ Posts: [postsKarma] }, { Comments: [commentsKarma] });

  // Intialize posts and comments pages associated with handle
  await scraper.initializeOverviewPosts();
  console.log(progressBar.update(0.7));

  const aggregates = await scraper.getScoresBySubreddit();
  console.log(progressBar.update(0.9));

  const subreddits = Object.keys(aggregates);
  const subscriberCount = await scraper.getSubredditSubscriberCount(subreddits);
  console.log(progressBar.update(2));

  for (const subreddit of subreddits) {
    aggregatesTable.push([
      subreddit,
      subscriberCount[subreddit],
      aggregates[subreddit],
    ]);
  }
  console.log(karmaTable.toString());
  console.log(aggregatesTable.toString());
};

run();
