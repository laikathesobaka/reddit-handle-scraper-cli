import React, { useState } from "react";
import styled from "styled-components";
import axios from "axios";

const Search = () => {
  const [handle, setHandle] = useState("");
  const [likes, setLikes] = useState(0);
  const [likesBySubreddit, setLikesBySubreddit] = useState({});

  const fetchHandleData = async (e) => {
    console.log("HANDLE: ", handle);
    e.preventDefault();
    try {
      let res = await axios.get(`/likes/${handle}/total`);
      console.log("TOTAL LIKES RES: ", res.data);
      setLikes(res.data.likes);
    } catch (err) {
      throw err;
    }
    try {
      let res = await axios.get(`/likes/${handle}/by-subreddit`);
      console.log("BY SUBREDDIT RES:    ", res.data);
      setLikesBySubreddit(res.data.likesBySubreddit);
    } catch (err) {
      throw err;
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "row" }}>
      <SearchBar onSubmit={(e) => fetchHandleData(e)}>
        <input
          value={handle}
          onChange={(e) => setHandle(e.target.value.toLowerCase().trim())}
          placeholder="Reddit handle"
          type="text"
          name="handle"
          required
        />
        <SearchButton type="submit">Search</SearchButton>
      </SearchBar>
    </div>
  );
};

export default Search;

const SearchBar = styled.form``;

const SearchButton = styled.button``;
