export type Quote = {}
export type File = {}
export type BackendResponse = {
    data: ResponseData | undefined;
    error: Error | undefined;
}

export type ResponseData = {
    status: string;
    code: number;
    data: Quote[] | File[] | string[] | []
}

export type UploadChunkResponse = {
    message?: string;
    uuid?: string;
}

export type BackendUploadResponse = {
    data?: UploadChunkResponse;
    error?: Error;
}
  
export interface BackendAPI {
    listFiles: () => Promise<BackendResponse>;
    importFile: (name: string) => Promise<BackendResponse>;
    searchQuotesFromStock: (stock: string) => Promise<BackendResponse>;
    searchStock: (name: string) => Promise<BackendResponse>;
    uploadFileChunk: (chunk: Blob, chunkNumber: number, totalChunks: number, originalName: string, uploadID: string) => Promise<BackendUploadResponse>;
}
