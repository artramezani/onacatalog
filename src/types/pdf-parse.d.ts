declare module 'pdf-parse' {
  interface PdfInfo {
    numpages: number
  }
  const pdfParse: (data: Buffer) => Promise<PdfInfo>
  export default pdfParse
}
