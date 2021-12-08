export interface ISvgAttributes {
  fill: string;
  stroke: string;
  strokeWidth: number;
}

export interface ISvgElement {
  attr: Partial<ISvgAttributes>;
  render: () => string;
}