import React from "react";
import SearchBar from "./SearchBar";
import styled from "styled-components";

function App() {
  return (
    <Container>
      <Title>Search Reddit user's karma history</Title>
      <SearchBar />
    </Container>
  );
}

export default App;

const Container = styled.div`
  text-align: center;
  padding: 40px;
  margin-top: 30px;
  font-size: 15px;
`;

const Title = styled.div`
  font-size: 20px;
  font-weight: 500;
  padding: 20px;
`;

const Description = styled.div``;
