import React from "react";

// This layout is intentionally minimal to resolve a route conflict.

export default function AdminManagementLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
