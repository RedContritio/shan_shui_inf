export interface ISvgStyles {
  fill: string;
  stroke: string;
  strokeWidth: number;
}

export interface ISvgAttributes {
  style: Partial<ISvgStyles>;
  fontSize: number;
  fontFamily: string;
  textAnchor: string;
  transform: string;
}

export interface ISvgElement {
  attr: Partial<ISvgAttributes>;
  render: () => string;
}
