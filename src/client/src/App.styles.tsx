import { css } from "@emotion/react";
import {
  color,
  fontFamilies,
  InteractionState,
  spacing,
  Variant,
} from "@leafygreen-ui/tokens";
import type { Theme } from "@leafygreen-ui/lib";

// Minimal layout styles without theme, colors, or font families
export const getAppContainerStyle = (theme: Theme) => css`
  font-family: ${fontFamilies.default};
  background-color: ${color[theme].background[Variant.Primary][
    InteractionState.Default
  ]};
  color: ${color[theme].text[Variant.Primary][InteractionState.Default]};
`;

export const appLayoutStyle = css`
  width: 100%;
  height: 100vh;
  display: grid;
  grid-template-columns: auto 1fr;
`;

export const getSidebarStyle = (theme: Theme) => css`
  background-color: ${color[theme].background[Variant.Secondary][
    InteractionState.Default
  ]};
  width: 350px;
  overflow-y: auto;
  padding: 1.5rem;
`;

export const mainContentStyle = css`
  /* display: grid;
  grid-template-rows: 50% 50%; */
  width: 100%;
  padding: ${spacing[400]}px;
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
`;

export const errorMessageStyle = css`
  padding: 1rem;
  border: 1px solid;
`;
