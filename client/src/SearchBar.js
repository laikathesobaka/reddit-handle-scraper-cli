import React, { useState, useEffect, useMemo } from "react";
import styled from "styled-components";
import axios from "axios";
import SearchResults from "./SearchResults";

import BarLoader from "react-spinners/BarLoader";
import { css } from "@emotion/core";
const override = css`
  display: block;
  margin: 0 auto;
  border-color: black;
`;

const SearchBar = () => {
  const [redditHandle, setRedditHandle] = useState("");
  const [handleInput, setHandleInput] = useState("");
  const [karma, setKarma] = useState({});
  const [scoresBySubreddit, setScoresBySubreddit] = useState({});
  const [isFetching, setFetchingStatus] = useState(false);
  const [searchSuccess, setSearchStatus] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const fetchKarma = async (handle) => {
    const res = await axios.get(`/user/${handle}/karma`);
    const { error, karma } = res.data;
    if (karma) {
      setKarma(karma);
      return true;
    }
    setErrorMsg(error.message);
    return false;
  };

  const fetchScoresBySubreddit = async (handle) => {
    const res = await axios.get(`/user/${handle}/scores-by-subreddit`);
    const { error, scoresBySubreddit } = res.data;
    if (scoresBySubreddit) {
      setScoresBySubreddit(scoresBySubreddit);
      return true;
    }
    setErrorMsg(error.message);
    return false;
  };

  const resetSearch = (status) => {
    setSearchStatus(status);
    setFetchingStatus(false);
    setHandleInput("");
  };

  const fetchHandleData = async (e, handle) => {
    e.preventDefault();
    setFetchingStatus(true);
    let success = await fetchKarma(handle);
    if (!success) {
      resetSearch(success);
      return;
    }
    success = await fetchScoresBySubreddit(handle);
    resetSearch(success);
  };

  const setHandleData = (e) => {
    setRedditHandle(handleInput);
    fetchHandleData(e, handleInput);
  };

  return (
    <SearchContainer>
      <form onSubmit={(e) => setHandleData(e)}>
        <input
          value={handleInput}
          onChange={(e) => setHandleInput(e.target.value.toLowerCase().trim())}
          placeholder="Reddit handle"
          type="text"
          name="handle"
          style={{ padding: "4px" }}
          required
        />
        <SearchButton type="submit">Search</SearchButton>
      </form>

      <Loader loading={isFetching} handle={redditHandle} />
      <SearchResults
        success={searchSuccess}
        errorMsg={errorMsg}
        handle={redditHandle}
        karma={karma}
        scores={scoresBySubreddit}
      />
    </SearchContainer>
  );
};

const Loader = ({ loading, handle }) => {
  if (loading) {
    return (
      <LoaderContainer>
        <div style={{ marginBottom: "60px" }}>
          <LoadingCaption>
            Searching {handle}'s comment and post history.
            <br />
            May take a while.
          </LoadingCaption>
          <BarLoader css={override} size={150} color={"black"} loading={true} />
        </div>
      </LoaderContainer>
    );
  } else {
    return null;
  }
};

export default SearchBar;

const SearchButton = styled.button`
  margin-left: 8px;
  padding: 4px;
  width: 70px;
  margin-top: 20px;
`;

const SearchContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const LoaderContainer = styled.div`
  position: fixed;
  background-color: white;
  // opacity: 0.6;
  z-index: 6;
  height: 100vh;
  width: 100vw;
  left: 0;
  top: 0;
  margin-left: -50vw;
  left: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const LoadingCaption = styled.div`
  font-size: 13px;
  padding: 15px;
`;
