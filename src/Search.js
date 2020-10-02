import React, { useState } from "react";
import styled from "styled-components";
import axios from "axios";
import reddit from "./reddit";

const Search = () => {
  const [handle, setHandle] = useState("");
  const fetchHandleData = async () => {};
  return (
    <div style={{ display: "flex", flexDirection: "row" }}>
      <SearchBar>
        <input
          value={handle}
          onChange={(e) => setHandle(e.target.value)}
          placeholder="Reddit handle"
          type="text"
          name="handle"
          required
        />
      </SearchBar>
      <SearchButton>Search</SearchButton>
    </div>
  );
};

export default Search;

const SearchBar = styled.form``;

const SearchButton = styled.button``;
