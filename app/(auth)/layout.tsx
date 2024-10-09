import React from "react";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";

const Layout = ({ children }: { children: React.ReactNode }) => {
  return <main className={"auth"}>{children}</main>;
};

export default Layout;
