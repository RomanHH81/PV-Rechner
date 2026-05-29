"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { Theme } from "@radix-ui/themes";
import "@radix-ui/themes/styles.css";

export function ThemeProvider({ children, ...props }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider attribute="class" defaultTheme="dark" {...props}>
      <Theme accentColor="green" radius="large">
        {children}
      </Theme>
    </NextThemesProvider>
  );
}
