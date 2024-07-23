export type Quote = {
    Date: string | number
    Value: number
}
export type File = {
    name: string
    type: string
    sizeBytes: number
}
export type ImportJob = {
    Id: string
    FileName: string
    Date: Date
    Progress: number
    Message: string
    DurationSeconds: number
    Status: string
}

export type BackendResponse = {
    data: ResponseData | undefined;
    error: Error | undefined;
}

export type ResponseData = {
    status: string;
    code: number;
    data: Quote[] | File[] | ImportJob[] | string[] | [] | string
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
    listImports: () => Promise<BackendResponse>;
    importFile: (name: string) => Promise<BackendResponse>;
    searchQuotesFromStock: (stock: string) => Promise<BackendResponse>;
    searchStock: (name: string) => Promise<BackendResponse>;
    uploadFileChunk: (chunk: Blob, chunkNumber: number, totalChunks: number, originalName: string, uploadID: string) => Promise<BackendUploadResponse>;
}
