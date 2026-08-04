// Hand-written types for react-simple-maps@3 (ships none; @types targets v1/v2).
// Covers only the props this app uses, so the strict compiler still checks the map layer.
declare module "react-simple-maps" {
  import type { CSSProperties, MouseEvent, ReactNode } from "react";

  export interface ComposableMapProps {
    projection?: string;
    projectionConfig?: { scale?: number; center?: [number, number]; rotate?: [number, number, number] };
    className?: string;
    width?: number;
    height?: number;
    children?: ReactNode;
  }
  export const ComposableMap: (props: ComposableMapProps) => JSX.Element;

  // A geography as react-simple-maps hands it to the render prop.
  export interface GeographyShape {
    rsmKey: string;
    id: string | number;
    [key: string]: unknown;
  }

  export interface GeographiesProps {
    geography: string | object;
    children: (args: { geographies: GeographyShape[] }) => ReactNode;
  }
  export const Geographies: (props: GeographiesProps) => JSX.Element;

  export type GeographyStyle = Partial<Record<"default" | "hover" | "pressed", CSSProperties>>;

  export interface GeographyProps {
    geography: GeographyShape;
    className?: string;
    style?: GeographyStyle;
    tabIndex?: number;
    role?: string;
    "aria-label"?: string;
    onClick?: (event: MouseEvent) => void;
    onKeyDown?: (event: React.KeyboardEvent) => void;
    onMouseEnter?: () => void;
    onMouseLeave?: () => void;
    onFocus?: () => void;
    onBlur?: () => void;
  }
  export const Geography: (props: GeographyProps) => JSX.Element;

  export interface MarkerProps {
    coordinates: [number, number];
    children?: ReactNode;
  }
  export const Marker: (props: MarkerProps) => JSX.Element;
}
