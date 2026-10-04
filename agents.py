from crewai import Agent
from models import openrouter_model

#Agent1
ats_expert = Agent(
    role = "Senior ATS Optimization Specialist",
    goal = "Compare the provided resume against the job description. Identify exactly which required skills and keywords are missing from the resume",
    backstory = "You are a ruthless technical recruiter. You analyze resumes to ensure they perfectly match job descriptions.",
    llm = openrouter_model,
    verbose = True
)

#Agent 2
resume_writer = Agent(
    role = "Executive Resume writer",
    goal="Using tghe keyword gaps identified by the ATS Specialist, rewrite the bullet points from the provided resume",
    backstory = "You are a master resume writer who specializes in seamlessly weaving ATS keywords into existing experience. You NEVER invent fake jobs or degrees.",
    llm=openrouter_model,
    verbose = True
)
#Agent 3: The cover letter writer
cover_letter_crafter = Agent(
    role="Technical Copywriter",
    goal = "Write a confident, modern, 3-paragraph cover letter that directly addresses the requirements in the job description",
    backstory = "You are an expert technical copywriter who creates highly persuasive and tailored cover letters",
    llm = openrouter_model,
    verbose = True
)

