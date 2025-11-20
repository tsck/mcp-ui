/** @jsxImportSource @emotion/react */
import { Card } from "@leafygreen-ui/card";
import { H1 } from "@leafygreen-ui/typography";
import { useRenderData } from "../../hooks/useRenderData";
import { cardContentStyles } from "./HelloWorld.styles";

interface HelloWorldRenderData {
  message: string;
  timestamp: string;
}

export const HelloWorld = () => {
  const { data, isLoading, error } = useRenderData<HelloWorldRenderData>();

  if (isLoading) {
    return (
      <Card>
        <div css={cardContentStyles}>
          <H1>Loading...</H1>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <div css={cardContentStyles}>
          <H1>Error</H1>
          <div style={{ color: "red", padding: "20px" }}>Error: {error}</div>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div css={cardContentStyles}>
        <H1>{data?.message || "Hello World"}</H1>
      </div>
    </Card>
  );
};
