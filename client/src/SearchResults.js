import React, { useState } from "react";
import Karma from "./Karma";
import ScoresBySubreddit from "./ScoresBySubreddit";
import styled from "styled-components";

const SearchResults = ({ handle, karma, scores }) => {
  return (
    <ResultsContainer>
      <Karma handle={handle} karma={karma} />
      <ScoresBySubreddit scores={scores} />
    </ResultsContainer>
  );
};

export default SearchResults;

const ResultsContainer = styled.div`
  display: flex;
  -webkit-flex-direction: column;
  -ms-flex-direction: column;
  flex-direction: column;
`;
