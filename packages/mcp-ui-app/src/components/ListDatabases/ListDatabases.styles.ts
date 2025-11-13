import { css } from "@emotion/react";

export const cardContentStyles = css`
  padding: 24px;
`;

export const listStyles = css`
  list-style: none;
  padding: 0;
  margin: 16px 0 0 0;
`;

export const listItemStyles = css`
  padding: 12px;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  justify-content: space-between;
  align-items: center;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background-color: #f5f5f5;
  }
`;

export const databaseNameStyles = css`
  font-weight: 500;
  font-size: 14px;
`;

export const databaseSizeStyles = css`
  color: #666;
  font-size: 13px;
`;
