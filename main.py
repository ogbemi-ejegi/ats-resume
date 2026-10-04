import os
import shutil
import docx
from fastapi import FastAPI, File, UploadFile, Form
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from crewai import Crew, Process

from agents import ats_expert, resume_writer, cover_letter_crafter
from tasks import analyze_resume_task, rewrite_resume_task, write_cover_letter_task

#Initialize Main app
app = FastAPI(title = "ATS Resume Optimizer API")

#Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials = True,
    allow_methods=["*"],
    allow_headers=["*"]
)

#Create an endpoint that listens for POST request
@app.post("/api/optimize")
def optimize_resume(
    job_description: str = Form(...),
    resume: UploadFile = File(...)
):
    #create temporary filenames based on the uploaded files
    temp_resume_path = f"temp_{resume.filename}"
    output_filename = f"Optimized_{resume.filename}"

    try:
        with open(temp_resume_path, "wb") as buffer:
            shutil.copyfileobj(resume.file, buffer)

            doc = docx.Document(temp_resume_path)
            extracted_resume_text = "\n".join([para.text for para in doc.paragraphs])

            my_crew = Crew(
                agents=[ats_expert, resume_writer, cover_letter_crafter],
                tasks=[analyze_resume_task, rewrite_resume_task, write_cover_letter_task],
                process = Process.sequential,
                verbose = True
            )

            #start extrating text
            my_crew.kickoff(inputs = {
                'resume_text': extracted_resume_text,
                'job_description': job_description
            })

            #Build a brand new output document
            output_doc = docx.Document()

            #Write cover letter
            output_doc.add_heading('Cover letter', level=1)
            output_doc.add_paragraph(str(write_cover_letter_task.output))

            output_doc.add_page_break()

            #Write resume section
            output_doc.add_heading('Optimized Resume', level=1)
            output_doc.add_paragraph(str(rewrite_resume_task.output))

            #save the newly created doc
            output_doc.save(output_filename)
            return FileResponse(
                path= output_filename,
                filename = output_filename,
                media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            )
    except Exception as e:
        print(f"CRASH REPORT: {str(e)}")
        raise e

    finally:
        if os.path.exists(temp_resume_path):
            os.remove(temp_resume_path)


    