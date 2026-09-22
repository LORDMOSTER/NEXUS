import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import useAssessmentStore from './store/useAssessmentStore';
import useAuthStore from './store/useAuthStore';
import api from './api';
import { ArrowLeft } from 'lucide-react';
import ThemeToggle from './components/ThemeToggle';
import PaginatedCanvas from './components/PaginatedCanvas';

function Studio() {
  const navigate = useNavigate();
  const { examType, selectedSubject, headerData, department, academicYear, yearSem, qpCode, quizUnits, targetUnits, numberOfQuestions } = useAssessmentStore();
  const { theme, toggleTheme } = useAuthStore();
  const date = headerData?.examDate || '';

  let formattedDate = '';
  if (date) {
    const [year, month, day] = date.split('-');
    if (year && month && day) {
      formattedDate = `${day}/${month}/${year}`;
    } else {
      formattedDate = date;
    }
  }

  const subjectCode = selectedSubject?.subjectCode || '';
  const subjectName = selectedSubject?.subjectName || '';

  // â”€â”€ Combined HTML state â€” source of truth for the paginated canvas â”€â”€
  const [combinedHtml, setCombinedHtml] = useState('');
  const [partAHtml, setPartAHtml] = useState('');
  const [partBHtml, setPartBHtml] = useState('');

  // â”€â”€ Canvas ref â€” used to collect all page HTML for export â”€â”€
  const canvasRef = useRef(null);

  // â”€â”€ Chat state â”€â”€
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState([{ role: 'ai', content: 'Hello! Ask me to generate Part A or Part B, or type a modification request here.' }]);
  const [isChatting, setIsChatting] = useState(false);

  // â”€â”€ Export modal state â”€â”€
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [exportStatus, setExportStatus] = useState('idle');
  const [exportData, setExportData] = useState(null);

  // â”€â”€ Generation loading states â”€â”€
  const [isGeneratingA, setIsGeneratingA] = useState(false);
  const [isGeneratingB, setIsGeneratingB] = useState(false);
  const [aiProvider, setAiProvider] = useState('ollama');

  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isChatting]);

  // â”€â”€ Rebuild combined HTML whenever partA or partB changes â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const rebuildHtml = (newPartA, newPartB) => {
    let combined = '';
    if (newPartA) combined += newPartA;
    if (newPartB) combined += newPartB;
    setCombinedHtml(combined);
  };

  const generatePartA = async () => {
    setIsGeneratingA(true);
    try {
      const payload = {
        examType,
        subjectName,
        units: quizUnits || [],
        targetMarks: headerData?.maxMarks || 100,
        duration: headerData?.duration || '3 Hours',
        aiProvider
      };
      const response = await api.post('/generate/part-a', payload);
      if (response.data && response.data.success) {
        const newA = response.data.html;
        setPartAHtml(newA);
        rebuildHtml(newA, partBHtml);
      }
    } catch (error) {
      console.error("Part A Error:", error);
    }
    setIsGeneratingA(false);
  };

  const generatePartB = async () => {
    setIsGeneratingB(true);
    try {
      const payload = {
        examType,
        subjectName,
        units: quizUnits || [],
        targetMarks: headerData?.maxMarks || 100,
        duration: headerData?.duration || '3 Hours',
        aiProvider
      };
      const response = await api.post('/generate/part-b', payload);
      if (response.data && response.data.success) {
        const newB = response.data.html;
        setPartBHtml(newB);
        rebuildHtml(partAHtml, newB);
      }
    } catch (error) {
      console.error("Part B Error:", error);
    }
    setIsGeneratingB(false);
  };


  const handleSendMessage = async () => {
    if (!chatInput.trim()) return;

    const userMsg = chatInput;
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setChatInput('');
    setIsChatting(true);

    // Grab current full document HTML from canvas
    const currentHtml = canvasRef.current?.getAllHtml?.() || combinedHtml;

    try {
      const response = await api.post('/generate/chat/modify', {
        prompt: userMsg,
        selectedText: '',
        context: currentHtml.substring(0, 500),
        aiProvider
      });

      if (response.data.success) {
        setMessages(prev => [...prev, { role: 'ai', content: response.data.chatMessage }]);

        // If the AI returned HTML to inject, append it to the document
        if (response.data.htmlUpdate && response.data.htmlUpdate.trim() !== '') {
          setCombinedHtml(prev => prev + `<p>${response.data.htmlUpdate}</p>`);
        }
      }
    } catch (error) {
      setMessages(prev => [...prev, { role: 'ai', content: 'Sorry, I encountered an error.' }]);
    }
    setIsChatting(false);
  };

  const handleExportPDF = () => {
    window.print();
  };

  const handleSecureExport = async () => {
    setExportStatus('processing');

    // Collect the combined innerHTML from all page cards via the canvas ref
    const htmlContent = canvasRef.current?.getAllInnerHtml?.() || combinedHtml;

    const payload = {
      htmlContent,
      teacherId: "7321CSE001",
      subjectCode: subjectCode || "CS3391",
      subjectName: subjectName || "Object Oriented Programming",
      examType: examType || "CAT-1",
      academicYear: academicYear || "2025-2026"
    };

    try {
      const response = await api.post('/export/finalize', payload);
      if (response.data.success) {
        setExportData(response.data);
        setExportStatus('complete');
      }
    } catch (error) {
      console.error("Export failed", error);
      setExportStatus('error');
    }
  };

  const downloadEncryptedPDF = () => {
    if (!exportData?.pdfBase64) return;
    const linkSource = `data:application/pdf;base64,${exportData.pdfBase64}`;
    const downloadLink = document.createElement("a");
    downloadLink.href = linkSource;
    downloadLink.download = "Encrypted_Exam_Paper.pdf";
    downloadLink.click();
  };

  const handleExportWord = () => {
    const headerHtml = document.querySelector('.page-card-header')?.innerHTML || '';
    const editorHtml = canvasRef.current?.getAllInnerHtml?.() || combinedHtml;

    const htmlContent = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head><meta charset='utf-8'><title>Export HTML To Doc</title>
      <style>
        body { font-family: 'Times New Roman', Times, serif; font-size: 15px; }
        table { width: 100%; border-collapse: collapse; border: 1px solid black; }
        td, th { border: 1px solid black; padding: 6px; }
        .text-center { text-align: center; }
        .font-bold { font-weight: bold; }
        .uppercase { text-transform: uppercase; }
      </style>
      </head><body>
        ${headerHtml}
        ${editorHtml}
      </body></html>
    `;

    const blob = new Blob(['\ufeff', htmlContent], {
      type: 'application/msword'
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${subjectCode || 'Question_Paper'}_${examType || 'Exam'}.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Header props object passed to PaginatedCanvas
  const headerProps = {
    academicYear,
    yearSem,
    examType,
    maxMarks: headerData?.maxMarks || '100',
    department,
    duration: headerData?.duration || '3 Hours',
    date: formattedDate,
    subjectName: subjectCode ? `${subjectCode} - ${subjectName}` : subjectName,
    codeDigits: qpCode ? qpCode.split('') : ['', '', '', '', ''],
    // Extras used by ContinuationHeader:
    subjectCode,
  };

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col font-sans" style={{ background: 'var(--app-bg)', color: 'var(--text-main)' }}>

      {/* TOPBAR */}
      <header
        className="h-14 shrink-0 flex items-center justify-between px-6 z-10 relative no-print mb-4"
        style={{ borderBottom: '1px solid var(--border-rim)' }}
      >
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-opacity hover:opacity-70"
          style={{ color: 'var(--text-main)' }}
        >
          <ArrowLeft size={16} />
          Back
        </button>

        <h1
          className="text-sm font-bold tracking-widest uppercase absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
          style={{ color: 'var(--text-muted)' }}
        >
          Assessment Generation Studio
        </h1>

        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsExportModalOpen(true)}
            disabled={exportStatus === 'processing'}
            className="soft-surface soft-surface-hover px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-sm disabled:opacity-50"
            style={{ color: 'var(--accent)' }}
          >
            {exportStatus === 'processing' ? 'Processing...' : 'Export & Lock Document'}
          </button>

          <ThemeToggle size={40} />
        </div>
      </header>

      {/* MAIN NON-SCROLLING FLEXBOX ROW */}
      <main className="flex h-[calc(100vh-120px)] gap-6 w-full max-w-[1600px] mx-auto px-6">

        {/* LEFT PANE (THE CANVAS) */}
        <section className="flex-1 soft-surface rounded-3xl overflow-hidden flex flex-col relative print-area">
          <PaginatedCanvas
            ref={canvasRef}
            html={combinedHtml}
            headerProps={headerProps}
          />
        </section>

        {/* RIGHT PANE: AI ASSISTANT SIDEBAR */}
        <div className="w-[380px] soft-surface rounded-[32px] p-6 flex flex-col flex-shrink-0 relative">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-extrabold tracking-tight text-[var(--accent)] flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
              AI Assistant
            </h2>
            {/* NVIDIA / Ollama Provider Badge */}
            {aiProvider === 'nvidia' ? (
              <span style={{ background: 'linear-gradient(135deg, #76b900, #4a7a00)', color: '#fff', fontSize: '10px', fontWeight: '800', letterSpacing: '0.05em', padding: '3px 8px', borderRadius: '999px' }}>
                âš¡ NVIDIA
              </span>
            ) : (
              <span style={{ background: 'var(--soft-surface)', color: 'var(--text-muted)', fontSize: '10px', fontWeight: '700', letterSpacing: '0.05em', padding: '3px 8px', borderRadius: '999px', border: '1px solid var(--border-rim)' }}>
                ðŸ–¥ Ollama
              </span>
            )}
          </div>

          {/* â”€â”€ AI PROVIDER TOGGLE â”€â”€ */}
          <div className="mb-4 soft-inset rounded-2xl p-3">
            <p style={{ fontSize: '10px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>AI Provider</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '12px', fontWeight: aiProvider === 'ollama' ? '800' : '500', color: aiProvider === 'ollama' ? 'var(--accent)' : 'var(--text-muted)', transition: 'all 0.2s' }}>Ollama</span>
              {/* Pill Toggle */}
              <button
                id="ai-provider-toggle"
                onClick={() => setAiProvider(p => p === 'ollama' ? 'nvidia' : 'ollama')}
                style={{
                  position: 'relative', width: '44px', height: '24px', borderRadius: '999px', border: 'none', cursor: 'pointer', padding: 0, flexShrink: 0,
                  background: aiProvider === 'nvidia' ? 'linear-gradient(135deg, #76b900, #4a7a00)' : 'var(--border-rim)',
                  transition: 'background 0.3s ease', boxShadow: aiProvider === 'nvidia' ? '0 0 10px rgba(118,185,0,0.4)' : 'none'
                }}
                aria-label="Toggle AI provider"
              >
                <span style={{
                  position: 'absolute', top: '3px', width: '18px', height: '18px', borderRadius: '50%', background: '#fff',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
                  left: aiProvider === 'nvidia' ? '23px' : '3px',
                  transition: 'left 0.25s cubic-bezier(0.4, 0, 0.2, 1)'
                }} />
              </button>
              <span style={{ fontSize: '12px', fontWeight: aiProvider === 'nvidia' ? '800' : '500', color: aiProvider === 'nvidia' ? '#76b900' : 'var(--text-muted)', transition: 'all 0.2s' }}>NVIDIA</span>
            </div>
            {aiProvider === 'nvidia' && (
              <p style={{ fontSize: '10px', color: '#76b900', marginTop: '6px', fontWeight: '600' }}>

              </p>
            )}
            {aiProvider === 'ollama' && (
              <p style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '6px', fontWeight: '500' }}>
                Local phi4-mini Â· Ollama must be running
              </p>
            )}
          </div>

          {/* Quick Actions (Keep your existing Part A / Part B buttons here) */}
          <div className="flex gap-2 mb-4">
              <>
                <button
                  onClick={generatePartA}
                  disabled={isGeneratingA}
                  className="flex-1 py-2.5 rounded-xl font-bold soft-surface soft-surface-hover text-[var(--accent)] transition-all disabled:opacity-50 text-xs flex items-center justify-center gap-1.5"
                >
                  {isGeneratingA ? (
                    <><div className="w-3 h-3 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin"></div> Generating...</>
                  ) : 'Gen Part A'}
                </button>
                <button
                  onClick={generatePartB}
                  disabled={isGeneratingB}
                  className="flex-1 py-2.5 rounded-xl font-bold soft-surface soft-surface-hover text-[var(--accent)] transition-all disabled:opacity-50 text-xs flex items-center justify-center gap-1.5"
                >
                  {isGeneratingB ? (
                    <><div className="w-3 h-3 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin"></div> Generating...</>
                  ) : 'Gen Part B&C'}
                </button>
              </>
          </div>

          {/* CHAT HISTORY THREAD */}
          <div className="flex-1 overflow-y-auto mb-4 flex flex-col gap-4 pr-2 custom-scrollbar" style={{ minHeight: '120px' }} data-lenis-prevent="true">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`p-4 max-w-[85%] text-sm font-medium leading-relaxed ${
                    msg.role === 'user'
                      ? 'soft-surface rounded-2xl rounded-tr-sm text-[var(--accent)]'
                      : 'soft-inset rounded-2xl rounded-tl-sm text-[var(--text-main)]'
                  }`}>
                  {msg.content}
                </div>
              </div>
            ))}
            {/* Empty state: only the AI welcome bubble, nothing else yet */}
            {messages.length === 1 && !isChatting && (
              <div className="flex flex-col items-center justify-center gap-2 py-6 opacity-40">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--text-muted)' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <p className="text-xs font-medium text-center" style={{ color: 'var(--text-muted)' }}>Generate questions first,<br/>then ask me to modify them.</p>
              </div>
            )}
            {isChatting && (
              <div className="flex justify-start">
                <div className="soft-inset p-4 rounded-2xl rounded-tl-sm text-sm text-[var(--text-muted)] animate-pulse">
                  Thinking...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* CONVERSATIONAL INPUT */}
          <div className="mt-auto">
            <textarea
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }}
              className="soft-inset w-full p-4 rounded-2xl text-sm resize-none h-24 mb-3 text-[var(--text-main)] placeholder-[var(--text-muted)]"
              placeholder="Highlight text to edit, or ask a question..."
            />
            <button
              onClick={handleSendMessage}
              disabled={isChatting || !chatInput.trim()}
              className="w-full py-3 rounded-xl font-bold bg-[var(--accent)] text-[#ffffff] hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 shadow-lg"
            >
              Send Message
            </button>
          </div>
        </div>

      </main>

      {/* PHASE 6 EXPORT MODAL */}
      {isExportModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-md transition-opacity">

          <div className="soft-surface w-full max-w-lg p-8 rounded-[32px] flex flex-col shadow-[0_20px_50px_rgba(0,0,0,0.5)] transform transition-transform scale-100" style={{ color: 'var(--text-main)' }}>

            <h2 className="text-2xl font-extrabold text-[var(--text-main)] mb-2 tracking-tight">
              Secure Export & Lock
            </h2>

            {exportStatus === 'idle' && (
              <>
                <p className="text-[var(--text-muted)] mb-8 font-medium leading-relaxed">
                  Finalizing this document will permanently lock the database record. The AI will synthesize an Answer Key and encrypt the final PDF.
                </p>
                <div className="flex gap-4 mt-auto">
                  <button onClick={() => setIsExportModalOpen(false)} className="flex-1 py-3 rounded-xl font-bold soft-surface soft-surface-hover text-[var(--text-main)] transition-all">
                    Cancel
                  </button>
                  <button onClick={handleSecureExport} className="flex-1 py-3 rounded-xl font-bold bg-[var(--accent)] text-[#ffffff] shadow-lg hover:scale-[1.02] transition-transform">
                    Confirm & Lock
                  </button>
                </div>
              </>
            )}

            {exportStatus === 'processing' && (
              <div className="py-12 flex flex-col items-center justify-center">
                <div className="w-12 h-12 border-4 border-[var(--accent)] border-t-transparent rounded-full animate-spin mb-6"></div>
                <p className="text-[var(--text-main)] font-bold text-lg animate-pulse">Locking Database & Generating PDF...</p>
              </div>
            )}

            {exportStatus === 'complete' && (
              <div className="flex flex-col animate-in fade-in zoom-in duration-300">
                <div className="soft-inset p-4 rounded-2xl mb-6 border border-green-500/20 bg-green-500/5">
                  <p className="text-green-400 font-bold mb-1">Database Locked Successfully</p>
                  <p className="text-[var(--text-muted)] text-sm font-medium">
                    The document is now permanently sealed. You can generate grading rubrics from the Archives tab.
                  </p>
                </div>

                <div className="flex flex-col gap-3">
                  <button onClick={downloadEncryptedPDF} className="w-full py-4 rounded-xl font-bold bg-[var(--accent)] text-[#000] shadow-lg flex justify-center items-center gap-2 hover:scale-[1.02] transition-transform">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                    Download Final PDF
                  </button>
                </div>

                <button onClick={() => setIsExportModalOpen(false)} className="mt-6 text-[var(--text-muted)] hover:text-[var(--text-main)] font-semibold text-sm transition-colors text-center w-full">
                  Close Workspace
                </button>
              </div>
            )}

            {exportStatus === 'error' && (
              <div className="py-8 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </div>
                <p className="text-red-400 font-bold text-lg mb-2">Export Failed</p>
                <p className="text-[var(--text-muted)] font-medium mb-6">There was a server error processing the secure export. This may be due to missing API keys or a backend failure.</p>
                <button onClick={() => { setIsExportModalOpen(false); setExportStatus('idle'); }} className="w-full py-3 rounded-xl font-bold soft-surface soft-surface-hover text-[var(--text-main)] transition-all">
                  Close & Retry
                </button>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}

export default Studio;
