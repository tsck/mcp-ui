/** @jsxImportSource @emotion/react */
import React from "react";
import { Card } from "@leafygreen-ui/card";
import { H1 } from "@leafygreen-ui/typography";
import { cardContentStyles } from "./helloWorld.styles";

export const HelloWorld = () => (
  <Card>
    <div css={cardContentStyles}>
      <H1>Hello World</H1>
    </div>
  </Card>
);
