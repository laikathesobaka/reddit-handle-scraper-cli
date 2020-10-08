import React, { useState } from "react";
import styled from "styled-components";

const Karma = ({ handle, karma }) => {
  return (
    <KarmaContainer>
      {console.log("incoming karma: ", karma)}
      <Handle>
        <i>{handle}</i> has a total of{" "}
      </Handle>
      <div>{karma.comments} comment karma </div>
      <div>{karma.posts} posts karma</div>
    </KarmaContainer>
  );
};

export default Karma;

const KarmaContainer = styled.div`
  padding: 30px;
`;

const Handle = styled.div`
  font-weight: 600;
`;
