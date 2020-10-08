import React, { useState } from "react";
import styled from "styled-components";

const ScoresBySubreddit = ({ scores }) => {
  return (
    <ScoreContainer>
      {console.log("incoming scores : ", scores)}

      <Table>
        <thead>
          <tr>
            <Column>Subreddit</Column>
            <Column>Number of subscribers</Column>
            <Column>Score</Column>
          </tr>
        </thead>
        <tbody>
          {Object.keys(scores).map((score) => {
            return (
              <tr>
                <Cell>{scores[score].subreddit}</Cell>
                <Cell>{scores[score].subscriberTotal}</Cell>
                <Cell>{scores[score].score}</Cell>
              </tr>
            );
          })}
        </tbody>
      </Table>
    </ScoreContainer>
  );
};

export default ScoresBySubreddit;

const ScoreContainer = styled.div`
  align-self: center;
`;

const Table = styled.table`
  border-collapse: collapse;
`;

const Cell = styled.td`
  border: 1px solid black;
  padding: 5px 10px 5px 10px;
  padding: 5px;
`;

const Column = styled.th`
  border: 1px solid black;
  padding: 7px 10px 7px 10px;
  font-weight: 600;
  padding: 7px;
`;
