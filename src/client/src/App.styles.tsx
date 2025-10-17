import { css } from '@emotion/react';
import { color, fontFamilies, InteractionState, spacing, Variant } from '@leafygreen-ui/tokens';
import type { Theme } from '@leafygreen-ui/lib';

// Minimal layout styles without theme, colors, or font families
export const getAppContainerStyle = (theme: Theme) => css`
  min-height: 100vh;
  display: grid;
  grid-template-columns: auto 1fr;
  font-family: ${fontFamilies.default};
  background-color: ${color[theme].background[Variant.Primary][InteractionState.Default]};
  color: ${color[theme].text[Variant.Primary][InteractionState.Default]};
`;

export const appLayoutStyle = css`
  display: flex;
  flex: 1;
  overflow: hidden;
`;

export const getSidebarStyle = (theme: Theme) => css`
  background-color: ${color[theme].background[Variant.Secondary][InteractionState.Default]};
  width: 350px;
  overflow-y: auto;
  padding: 1.5rem;
`;

export const mainContentStyle = css`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

export const contentPanelStyle = css`
  flex: 1;
  padding: 1.5rem;
  overflow-y: auto;
  border-bottom: 1px solid;

  &:last-child {
    border-bottom: none;
  }
`;

// Tool Selector Styles


// Response Display & UI Renderer Styles
export const sectionTitleStyle = css`
  margin-bottom: 1rem;
`;

export const responseJsonStyle = css`
  border: 1px solid;
  padding: 1.5rem;
  overflow-x: auto;
  line-height: 1.6;
`;

export const placeholderStyle = css`
  font-style: italic;
  padding: 2rem;
  text-align: center;
  border: 1px dashed;
`;

export const errorMessageStyle = css`
  padding: 1rem;
  border: 1px solid;
`;

export const uiContainerStyle = css`
  border: 1px solid;
  padding: 1.5rem;
  min-height: 200px;
`;

