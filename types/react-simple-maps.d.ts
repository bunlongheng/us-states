/* eslint-disable @typescript-eslint/no-explicit-any */
// Minimal ambient types - react-simple-maps@3 ships no TypeScript definitions.
declare module "react-simple-maps" {
  import { ComponentType } from "react";
  export const ComposableMap: ComponentType<any>;
  export const Geographies: ComponentType<any>;
  export const Geography: ComponentType<any>;
  export const Marker: ComponentType<any>;
}
