from crewai import Task
from agents import ats_expert, resume_writer, cover_letter_crafter

#Task 1
analyze_resume_task = Task(
    description = (
        "Compare the provided resume against the job description"
        "Identify exactly which required skills and keywords are missing from the resume. \n\n"

        "Resume: \n {resume_text} \n\n"
        "Job Description: \n{job_description}"
    ),
    expected_output = "A bulleted list of missing keywords and skills.",
    agent= ats_expert
)

#Task 2
rewrite_resume_task = Task(
    description = (
        "Using the kyword gaps identified by the ATS Specialist, rewrite the bullet points from the provided resume."
        "DO NOT invent new jobs or degrees. Only rephrase existing bullet points to include the missing keywords naturally. \n\n"
        "Base Resume: \n{resume_text}"
    ),
    expected_output = "A fully rewritten resume with optimized bullet points",
    agent = resume_writer
)

#Task 3
write_cover_letter_task = Task(
    description = (
        "Using the optimized resume data and the target job description, write a 3-paragraph cover letter."
        "Make it confident, modern and directly address teh requirements in the job description \n\n"
        "Job Description: \n{job_description}"
    ),
    expected_output = "A 3-paragraph cover letter tailored to the job description",
    agent = cover_letter_crafter
)