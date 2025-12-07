declare module 'pica' {
  interface PicaOptions {
    tile?: number;
    features?: string[];
    idle?: number;
  }

  interface PicaResizeOptions {
    quality?: number;
    alpha?: boolean;
    unsharpAmount?: number;
    unsharpRadius?: number;
    unsharpThreshold?: number;
  }

  class Pica {
    constructor(options?: PicaOptions);
    resize(
      from: HTMLCanvasElement | HTMLImageElement,
      to: HTMLCanvasElement,
      options?: PicaResizeOptions
    ): Promise<HTMLCanvasElement>;
    toBlob(canvas: HTMLCanvasElement, mimeType?: string, quality?: number): Promise<Blob>;
  }

  export default Pica;
}
