import { css } from '@emotion/react';

// Minimal layout styles without theme, colors, or font families
export const appContainerStyles = css`
  min-height: 100vh;
  display: grid;
  grid-template-rows: auto 1fr;
`;

export const appLayoutStyle = css`
  display: flex;
  flex: 1;
  overflow: hidden;
`;

export const sidebarStyle = css`
  width: 350px;
  border-right: 1px solid;
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
export const toolSelectorStyle = css`
  h2 {
    margin-bottom: 1rem;
  }
`;

export const toolsListStyle = css`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1rem;
`;

export const toolItemStyle = (selected?: boolean) => css`
  border: 1px solid;
  border-width: ${selected ? '2px' : '1px'};
  padding: 1rem;
  cursor: pointer;
`;

export const inputSchemaStyle = css`
  border: 1px solid;
  padding: 0.75rem;
  overflow-x: auto;
  margin-top: 0.5rem;
`;

export const toolActionsStyle = css`
  margin-top: 1rem;
`;

export const executeButtonStyle = css`
  width: 100%;
  border: none;
  padding: 0.75rem 1.5rem;
  cursor: pointer;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

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

