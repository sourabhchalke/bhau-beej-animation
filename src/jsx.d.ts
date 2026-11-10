// Lets the TypeScript entry (App.tsx) import the plain .jsx film without type errors.
declare module "*.jsx" {
  import type { ComponentType } from "react";
  const Component: ComponentType;
  export default Component;
}
