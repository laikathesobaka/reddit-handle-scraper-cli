import React, { useState } from "react";
import Karma from "./Karma";
import ScoresBySubreddit from "./ScoresBySubreddit";
import styled from "styled-components";

const SearchResults = ({ success, errorMsg, handle, karma, scores }) => {
  if (success && !errorMsg) {
    return (
      <ResultsContainer>
        <Karma handle={handle} karma={karma} />
        <ScoresBySubreddit scores={scores} />
      </ResultsContainer>
    );
  }
  if (errorMsg) {
    return <ErrorMsg>{errorMsg}</ErrorMsg>;
  }
  return null;
};

export default SearchResults;

const ResultsContainer = styled.div`
  display: flex;
  -webkit-flex-direction: column;
  -ms-flex-direction: column;
  flex-direction: column;
`;

const ErrorMsg = styled.div`
  padding: 50px;
`;
