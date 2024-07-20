import { BackendAPI, BackendResponse, BackendUploadResponse, UploadChunkResponse } from "./base";


const backendAPIURL = "http://localhost:8080/api/v1/"

export class BackendAPIClient implements BackendAPI {
  importFile = async (name:string) => {
    let url = backendAPIURL + `quotes/file/${name}/import`
    console.log(`API: POST ${url}`)
    let ret: BackendResponse = { data: undefined, error: undefined }
    try {
      let response = await fetch(url, {method:"POST"})
      let data = await response.json()
      ret.data = data
    } catch (error: any) {
      console.log('API ERROR', error)
      ret.error = error
    }
    return ret
  }
  searchQuotesFromStock = async (stock: string) => {
    let url = backendAPIURL + `quotes/${stock}`
    console.log(`API: GET ${url}`)
    let ret: BackendResponse = { data: undefined, error: undefined }
    try {
      let response = await fetch(url)
      let data = await response.json()
      ret.data = data
    } catch (error: any) {
      console.log('API ERROR', error)
      ret.error = error
    }
    return ret
  }
  listFiles = async () => {
    let url = backendAPIURL + "quotes/file/list"
    console.log(`API: GET ${url}`)
    let ret: BackendResponse = { data: undefined, error: undefined }
    try {
      let response = await fetch(url)
      let data = await response.json()
      ret.data = data
    } catch (error: any) {
      console.log('API ERROR', error)
      ret.error = error
    }
    console.log("listFiles: ", ret)
    return ret
  }
  searchStock = async (name: string) => {
    let url = backendAPIURL + `stocks/${name}`
    console.log(`API: GET ${url}`)
    let ret: BackendResponse = { data: undefined, error: undefined }
    try {
      let response = await fetch(url)
      ret.data = await response.json()
    } catch (error: any) {
      console.log('API ERROR', error)
      ret.error = error
    }
    return ret
  }  
  uploadFileChunk = async (chunk: Blob, chunkNumber: number, totalChunks: number, originalName: string, uploadID: string) => {
    let url = backendAPIURL + "quotes/upload"
    let ret: BackendUploadResponse = { data: undefined, error: undefined }
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
    } catch (error: any) {
      ret.error = error
      console.log('!!!!!!!!!!API ERROR', error)
      console.log('!!!!!!!!!!API ERROR', error)
    }
    return ret
  }
}
