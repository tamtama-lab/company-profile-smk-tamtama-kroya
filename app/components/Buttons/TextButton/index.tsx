import React from "react";

export const TextButton: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return <button>{children}</button>;
};
