"use client";
import React from 'react';
import { Provider } from "react-redux";
import { store } from "../redux/store";
import "regenerator-runtime/runtime";

export default function Providers({
  children,
}: {
  children: React.ReactNode;
}) {
  return <Provider store={store}>{children}</Provider>;
}
