import { BackendAPI, BackendResponse, BackendUploadResponse, UploadChunkResponse } from "./base";


const backendAPIURL = "http://localhost:8080/api/v1/"

export class BackendAPIClient implements BackendAPI {
  importFile = async (name:string) => {
    const url = backendAPIURL + `quotes/file/${name}/import`
    console.log(`API: POST ${url}`)
    const ret: BackendResponse = { data: undefined, error: undefined }
    try {
      const response = await fetch(url, {method:"POST"})
      const data = await response.json()
      ret.data = data
    } catch (error: unknown) {
      console.log('API ERROR', error)
      ret.error = error as Error
    }
    return ret
  }
  searchQuotesFromStock = async (stock: string, period: string) => {
    const url = backendAPIURL + `quotes/${stock}?period=${period}`
    console.log(`API: GET ${url}`)
    const ret: BackendResponse = { data: undefined, error: undefined }
    try {
      const response = await fetch(url)
      const data = await response.json()
      ret.data = data
    } catch (error: unknown) {
      console.log('API ERROR', error)
      ret.error = error as Error
    }
    return ret
  }
  listFiles = async () => {
    const url = backendAPIURL + "quotes/file/list"
    console.log(`API: GET ${url}`)
    const ret: BackendResponse = { data: undefined, error: undefined }
    try {
      const response = await fetch(url)
      const data = await response.json()
      ret.data = data
    } catch (error: unknown) {
      console.log('API ERROR', error)
      ret.error = error as Error
    }
    console.log("listFiles: ", ret)
    return ret
  }
  listImports = async () => {
    const url = backendAPIURL + "quotes/imports"
    console.log(`API: GET ${url}`)
    const ret: BackendResponse = { data: undefined, error: undefined }
    try {
      const response = await fetch(url)
      const data = await response.json()
      ret.data = data
    } catch (error: unknown) {
      console.log('API ERROR', error)
      ret.error = error as Error
    }
    console.log("listImports: ", ret)
    return ret
  }
  searchStock = async (name: string) => {
    const url = backendAPIURL + `stocks/${name}`
    console.log(`API: GET ${url}`)
    const ret: BackendResponse = { data: undefined, error: undefined }
    try {
      const response = await fetch(url)
      ret.data = await response.json()
    } catch (error: unknown) {
      console.log('API ERROR', error)
      ret.error = error as Error
    }
    return ret
  }  
  uploadFileChunk = async (chunk: Blob, chunkNumber: number, totalChunks: number, originalName: string, uploadID: string) => {
    const url = backendAPIURL + "quotes/upload"
    const ret: BackendUploadResponse = { data: undefined, error: undefined }
    const formData = new FormData();
    formData.append("chunk", chunk);
    formData.append("chunkNumber", chunkNumber.toString());
    formData.append("totalChunks", totalChunks.toString());
    formData.append("originalname", originalName);
    if (uploadID != "") {
        formData.append("uuid", uploadID)
    }
    try {
      let response = await fetch(url, { method: "POST", body: formData })
      console.log("B4JSON", response)
      response = await response.json()
      console.log("AFTERJSON", response)
      ret.data = response as UploadChunkResponse
    } catch (error: unknown) {
      ret.error = error as Error
      console.log('!!!!!!!!!!API ERROR', error)
      console.log('!!!!!!!!!!API ERROR', error)
    }
    return ret
  }
}
