import React, { useState } from "react";
import styled from "styled-components";
import axios from "axios";
import SearchResults from "./SearchResults";

import PuffLoader from "react-spinners/PuffLoader";
import { css } from "@emotion/core";
const override = css`
  display: block;
  margin: 0 auto;
  border-color: black;
`;

const SearchBar = () => {
  const [handle, setHandle] = useState("");
  const [karma, setKarma] = useState({});
  const [scoresBySubreddit, setScoresBySubreddit] = useState({});
  const [input, setInput] = useState("");
  const [isFetching, setFetchingStatus] = useState(false);
  const [searchSuccess, setSearchStatus] = useState(false);

  const setHandleData = async (e) => {
    const handle = e.target.value.toLowerCase().trim();
    setHandle(handle);
    setInput(handle);
  };

  const fetchHandleData = async (e) => {
    e.preventDefault();
    setFetchingStatus(true);
    let success = true;
    try {
      let res = await axios.get(`/user/${handle}/karma`);
      console.log("TOTAL LIKES RES: ", res.data);
      setKarma(res.data.karma);
    } catch (err) {
      setSearchStatus(false);
      console.log("Error occurred retrieving karma: ", err.message);
    }
    try {
      let res = await axios.get(`/user/${handle}/scores-by-subreddit`);
      console.log("BY SUBREDDIT RES:    ", res.data);
      setScoresBySubreddit(res.data.scoresBySubreddit);
    } catch (err) {
      setSearchStatus(false);
      console.log("Error occurred retrieving scores: ", err.message);
    }
    setFetchingStatus(false);
    setInput("");
    setSearchStatus(success);
  };

  return (
    <SearchContainer>
      <form onSubmit={(e) => fetchHandleData(e)}>
        <input
          value={input}
          onChange={(e) => setHandleData(e)}
          placeholder="Reddit handle"
          type="text"
          name="handle"
          style={{ padding: "4px" }}
          required
        />
        <SearchButton type="submit">Search</SearchButton>
      </form>
      <Loader loading={isFetching} />
      {searchSuccess ? (
        <SearchResults
          handle={handle}
          karma={karma}
          scores={scoresBySubreddit}
        />
      ) : null}
    </SearchContainer>
  );
};

const Loader = ({ loading }) => {
  if (loading) {
    return (
      <LoaderContainer>
        <div>
          <PuffLoader
            css={override}
            size={150}
            color={"black"}
            loading={true}
          />
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
  opacity: 0.6;
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
