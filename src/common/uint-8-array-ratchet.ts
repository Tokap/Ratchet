// Uint8Array is the common denominator between node and web apis
// https://medium.com/@naveenkumarasinghe/javascript-lost-in-binaries-buffer-blob-uint8array-arraybuffer-ed8d2b4de44a
export class Uint8ArrayRatchet {
  // Empty constructor prevents instantiation
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private constructor() {}

  // Taken from https://stackoverflow.com/questions/49129643/how-do-i-merge-an-array-of-uint8arrays
  public static mergeArrays(myArrays: Uint8Array[]): Uint8Array {
    let rval: Uint8Array = null;
    if (myArrays?.length) {
      // Get the total length of all arrays.
      let length = 0;
      myArrays.forEach((item) => {
        length += item.length;
      });

      // Create a new array with total length and merge all source arrays.
      rval = new Uint8Array(length);
      let offset = 0;
      myArrays.forEach((item) => {
        rval.set(item, offset);
        offset += item.length;
      });
    }
    return rval;
  }

  public static utf8StringToUint8Array(bufferString: string): Uint8Array {
    // This function WILL NOT WORK if the string contains non-utf8 characters
    const uint8Array = new TextEncoder().encode(bufferString);
    return uint8Array;
  }
  public static uint8ArrayToUtf8String(bufferValue: Uint8Array): string {
    // This function WILL NOT WORK if the string contains non-utf8 characters
    return new TextDecoder('utf-8').decode(bufferValue);
  }
}
