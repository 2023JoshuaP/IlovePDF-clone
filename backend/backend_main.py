from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.responses import StreamingResponse
from pypdf import PdfReader, PdfWriter
import io

app = FastAPI(title="My Ilove PDF")

@app.post("/api/merge")
async def merge_pdfs(files: list[UploadFile] = File(...)):
    if len(files) < 2:
        raise HTTPException(status_code=400, detail="At least two PDF files are required for merging.")
    
    merger = PdfWriter()

    try:
        for pdf_file in files:
            reader = PdfReader(pdf_file.file)
            merger.append(reader)
        
        output_pdf = io.BytesIO()
        merger.write(output_pdf)
        output_pdf.seek(0)

        return StreamingResponse(
            output_pdf,
            media_type="application/pdf",
            headers={"Content-Disposition": "attachment; filename=merged.pdf"}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred while merging PDFs: {str(e)}")
    
@app.post("/api/split")
async def split_pdf(file: UploadFile = File(...), start_page: int = Form(...), end_page: int = Form(...)):
    try:
        reader = PdfReader(file.file)
        writer = PdfWriter()

        total_pages = len(reader.pages)
        if start_page < 0 or end_page >= total_pages or start_page > end_page:
            raise HTTPException(status_code=400, detail="Invalid page range specified.")
        
        for i in range(start_page, end_page + 1):
            writer.add_page(reader.pages[i])
        
        output_pdf = io.BytesIO()
        writer.write(output_pdf)
        output_pdf.seek(0)

        return StreamingResponse(
            output_pdf,
            media_type="application/pdf",
            headers={"Content-Disposition": "attachment; filename=splitted.pdf"}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred while splitting the PDF: {str(e)}")