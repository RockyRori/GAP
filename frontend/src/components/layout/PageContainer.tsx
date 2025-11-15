import React from "react";

interface Props {
  children: React.ReactNode;
}

export const PageContainer: React.FC<Props> = ({ children }) => {
  return <main className="gap-page-container">{children}</main>;
};
