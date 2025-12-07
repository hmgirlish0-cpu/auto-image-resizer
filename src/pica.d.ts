declare module 'pica' {
  export default class Pica {
    constructor(options?: any);
    resize(
      from: HTMLCanvasElement | HTMLImageElement,
      to: HTMLCanvasElement,
      options?: any
    ): Promise<HTMLCanvasElement>;
    toBlob(canvas: HTMLCanvasElement, mimeType?: string, quality?: number): Promise<Blob>;
  }
}
