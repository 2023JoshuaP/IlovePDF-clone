from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from pypdf import PdfReader, PdfWriter
import io

app = FastAPI(title="My Ilove PDF")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
    allow_credentials=True,
)

def parse_page_range(page_range: str, total_pages: int) -> list[int]:
    pages_extract = set()
    parts = page_range.replace(" ", "").split(",")

    for part in parts:
        if not part:
            continue
        if "-" in part:
            try:
                start_str, end_str = part.split("-")
                start = int(start_str) - 1
                end = int(end_str) - 1

                start = max(0, start)
                end = min(total_pages - 1, end)
                
                if start <= end:
                    pages_extract.update(range(start, end + 1))
            except ValueError:
                continue
        else:
            try:
                val = int(part) - 1
                if 0 <= val < total_pages:
                    pages_extract.add(val)
            except ValueError:
                continue

    return sorted(list(pages_extract))

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
async def split_pdf(file: UploadFile = File(...), pages_string: str = Form(...)):
    try:
        reader = PdfReader(file.file)
        writer = PdfWriter()
        total_pages = len(reader.pages)

        pages_extract = parse_page_range(pages_string, total_pages)

        if not pages_extract:
            raise HTTPException(status_code=400, detail="No valid pages specified for splitting.")
        
        for i in pages_extract:
            writer.add_page(reader.pages[i])
        
        output_pdf = io.BytesIO()
        writer.write(output_pdf)
        output_pdf.seek(0)

        safe_file = file.filename.replace(".pdf", "_split.pdf")

        return StreamingResponse(
            output_pdf,
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename={safe_file}"}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred while splitting the PDF: {str(e)}")