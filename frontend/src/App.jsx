import { useState, useRef } from 'react'
import './index.css'

function App() {
  const [jobDescription, setJobDescription] = useState('')
  const [resumeFile, setResumeFile] = useState(null)
  const [isDragging, setIsDragging] = useState(false)
  
  const [status, setStatus] = useState('idle') // idle, loading, success, error
  const [errorMsg, setErrorMsg] = useState('')
  const [downloadUrl, setDownloadUrl] = useState('')
  const [outputFilename, setOutputFilename] = useState('')

  const fileInputRef = useRef(null)

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0]
      if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || 
          file.name.endsWith('.docx')) {
        setResumeFile(file)
      } else {
        alert('Please upload a .docx file')
      }
    }
  }

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setResumeFile(e.target.files[0])
    }
  }

  const removeFile = () => {
    setResumeFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!jobDescription || !resumeFile) return

    setStatus('loading')
    setErrorMsg('')

    const formData = new FormData()
    formData.append('job_description', jobDescription)
    formData.append('resume', resumeFile)

    try {
      const response = await fetch('/api/optimize', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}: ${response.statusText}`)
      }

      // Get the filename from headers if possible, or create a default one
      const contentDisposition = response.headers.get('content-disposition')
      let filename = 'Optimized_Resume.docx'
      if (contentDisposition && contentDisposition.includes('filename=')) {
        filename = contentDisposition.split('filename=')[1].replace(/["']/g, '')
      }
      
      setOutputFilename(filename)

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      setDownloadUrl(url)
      setStatus('success')
    } catch (error) {
      console.error('Optimization failed:', error)
      setErrorMsg(error.message || 'An error occurred during optimization.')
      setStatus('error')
    }
  }

  const resetForm = () => {
    setStatus('idle')
    setJobDescription('')
    setResumeFile(null)
    setDownloadUrl('')
  }

  return (
    <div className="app-container">
      <header className="header">
        <h1>ATS Optimizer AI</h1>
        <p>Upload your resume and the job description. Our AI agents will rewrite your resume to beat the ATS and craft a tailored cover letter.</p>
      </header>

      <main className="glass-panel">
        {status === 'idle' || status === 'error' ? (
          <form onSubmit={handleSubmit}>
            {status === 'error' && (
              <div style={{ color: '#ef4444', marginBottom: '1rem', padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
                {errorMsg}
              </div>
            )}
            
            <div className="form-group">
              <label htmlFor="job-description">Job Description</label>
              <textarea
                id="job-description"
                className="textarea"
                placeholder="Paste the target job description here..."
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Your Resume (.docx)</label>
              {!resumeFile ? (
                <div 
                  className={`file-drop-area ${isDragging ? 'drag-over' : ''}`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    type="file"
                    className="file-input"
                    accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                  />
                  <div className="file-icon">📄</div>
                  <span className="file-msg">Drag & Drop your .docx resume here, or click to browse</span>
                </div>
              ) : (
                <div className="selected-file">
                  <div className="selected-file-name">
                    <span>📄</span> {resumeFile.name}
                  </div>
                  <button type="button" className="remove-file" onClick={removeFile} title="Remove file">
                    ✕
                  </button>
                </div>
              )}
            </div>

            <button 
              type="submit" 
              className="btn-submit"
              disabled={!jobDescription || !resumeFile}
            >
              Optimize My Application ✨
            </button>
          </form>
        ) : status === 'loading' ? (
          <div className="loader-container">
            <div className="spinner"></div>
            <h3 className="loader-text">AI Agents at Work</h3>
            <p className="loader-subtext">Analyzing job requirements, rewriting resume, and crafting a cover letter...</p>
            <p className="loader-subtext" style={{ marginTop: '0.5rem', opacity: 0.7 }}>This may take a minute or two.</p>
          </div>
        ) : (
          <div className="success-container">
            <div className="success-icon">✓</div>
            <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Optimization Complete!</h2>
            <p style={{ color: 'var(--text-muted)' }}>Your tailored resume and cover letter are ready.</p>
            
            <a 
              href={downloadUrl} 
              download={outputFilename}
              className="btn-download"
            >
              <span style={{ fontSize: '1.5rem' }}>↓</span> Download Application (.docx)
            </a>
            
            <div style={{ marginTop: '2rem' }}>
              <button onClick={resetForm} className="btn-restart">
                Optimize Another Resume
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default App
