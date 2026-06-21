import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import useAssessmentStore from './store/useAssessmentStore';
import useAuthStore from './store/useAuthStore';
import api from './api';
import { ArrowLeft, Sun, Moon, Download, ChevronDown } from 'lucide-react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import { TextAlign } from '@tiptap/extension-text-align';
import InstitutionalHeader from './components/InstitutionalHeader';

function Studio() {
  const navigate = useNavigate();
  const { examType, selectedSubject, headerData, department, academicYear, yearSem, qpCode, quizUnits } = useAssessmentStore();
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
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState([{ role: 'ai', content: 'Hello! Highlight any text on the canvas and ask me to rephrase it, change its K-Level, or generate a new question.' }]);
  const [isChatting, setIsChatting] = useState(false);
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [exportStatus, setExportStatus] = useState('idle'); // 'idle', 'processing', 'complete'
  const [exportData, setExportData] = useState(null);
  const [partAHtml, setPartAHtml] = useState("");
  const [partBHtml, setPartBHtml] = useState("");
  const [isGeneratingA, setIsGeneratingA] = useState(false);
  const [isGeneratingB, setIsGeneratingB] = useState(false);
  const exportMenuRef = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isChatting]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(e.target)) {
        setIsExportMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const generatePartA = async () => {
    setIsGeneratingA(true);
    try {
      const payload = {
        examType,
        subjectName,
        units: quizUnits || [],
        targetMarks: headerData?.maxMarks || 100,
        duration: headerData?.duration || '3 Hours'
      };
      const response = await api.post('/generate/part-a', payload);
      if (response.data && response.data.success) {
        setPartAHtml(response.data.html);
        rebuildEditor(response.data.html, partBHtml);
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
        duration: headerData?.duration || '3 Hours'
      };
      const response = await api.post('/generate/part-b', payload);
      if (response.data && response.data.success) {
        setPartBHtml(response.data.html);
        rebuildEditor(partAHtml, response.data.html);
      }
    } catch (error) {
      console.error("Part B Error:", error);
    }
    setIsGeneratingB(false);
  };

  const rebuildEditor = (partA, partB) => {
    // This ensures Part A is ALWAYS above Part B, regardless of which button was clicked first.
    let combinedHtml = "";
    if (partA) combinedHtml += partA + "<br/><br/>";
    if (partB) combinedHtml += partB;
    editor.commands.setContent(combinedHtml);
  };

  const handleSendMessage = async () => {
    if (!chatInput.trim()) return;
    
    const userMsg = chatInput;
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setChatInput('');
    setIsChatting(true);

    // Grab the exact text the teacher highlighted in TipTap
    const { from, to } = editor.state.selection;
    const selectedText = editor.state.doc.textBetween(from, to, ' ');
    const context = editor.getText().substring(0, 500); // Send some context

    try {
      const response = await api.post('/generate/chat/modify', {
        prompt: userMsg,
        selectedText,
        context
      });

      if (response.data.success) {
        setMessages(prev => [...prev, { role: 'ai', content: response.data.chatMessage }]);
        
        // TARGETED MODIFICATION: Only inject if the AI provided HTML
        if (response.data.htmlUpdate && response.data.htmlUpdate.trim() !== "") {
          if (selectedText) {
            // Replace highlighted text
            editor.chain().focus().insertContent(response.data.htmlUpdate).run();
          } else {
            // Append at cursor
            editor.chain().focus().insertContent(`<p>${response.data.htmlUpdate}</p>`).run();
          }
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
    
    const canvasElement = document.getElementById('exam-canvas');
    if (!canvasElement) {
      console.error("Canvas not found!");
      setExportStatus('error');
      return;
    }
    
    const htmlContent = canvasElement.innerHTML;
    
    // Replace these with your actual Zustand/Auth store values
    const payload = {
      htmlContent,
      examId: headerData?._id || "current_exam_id", 
      teacherId: "FAC1029",
      subjectCode: subjectCode || "CS3591",
      currentYear: academicYear || "2026"
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
    const headerHtml = document.getElementById('institutional-header')?.innerHTML || '';
    const editorHtml = editor.getHTML();
    
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

  const editor = useEditor({
    extensions: [
      StarterKit,
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
    ],
    content: '<p style="text-align: center; color: gray;"><em>[ AI Generation will inject exam questions here... ]</em></p>',
  });

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
            className="soft-surface soft-surface-hover px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-sm"
            style={{ color: 'var(--accent)' }}
          >
            Export & Lock Document
          </button>

          <button
            onClick={toggleTheme}
            className="soft-surface soft-surface-hover flex items-center justify-center w-10 h-10 rounded-xl transition-all shadow-sm"
            style={{ color: 'var(--accent)' }}
            title="Toggle Theme"
          >
            {theme === 'dark' ? <Moon size={18} /> : <Sun size={18} />}
          </button>
        </div>
      </header>

      {/* MAIN NON-SCROLLING FLEXBOX ROW */}
      <main className="flex h-[calc(100vh-120px)] gap-6 w-full max-w-[1600px] mx-auto px-6">

        {/* LEFT PANE (THE CANVAS) */}
        <section className="flex-1 soft-surface rounded-3xl overflow-hidden flex flex-col relative print-area">
          <div className="flex-1 overflow-y-auto p-8 flex flex-col items-center gap-8" data-lenis-prevent="true">
            {/* ── PAGE 1: Institutional Header + start of questions ── */}
            <div
              id="exam-canvas"
              className="exam-print-container w-full max-w-[800px] bg-white text-black p-12 shrink-0 transition-all relative print-area"
              style={{ minHeight: '1056px' }}
            >
              {/* --- INSTITUTIONAL HEADER START --- */}
              <InstitutionalHeader 
                academicYear={academicYear}
                yearSem={yearSem}
                examType={examType}
                maxMarks={headerData?.maxMarks || "100"}
                department={department}
                duration={headerData?.duration || "3 Hours"}
                date={formattedDate}
                subjectName={subjectCode ? `${subjectCode} - ${subjectName}` : subjectName}
                codeDigits={qpCode ? qpCode.split('') : ['', '', '', '', '']}
              />
              {/* --- INSTITUTIONAL HEADER END --- */}

              <div className="academic-editor">
                <EditorContent editor={editor} />
              </div>
            </div>

            {/* ── PAGE 2 (overflow continuation sheet) ── */}
            <div
              className="exam-print-container w-full max-w-[800px] bg-white text-black p-12 shrink-0 transition-all relative print-area page-break-before"
              style={{ minHeight: '1056px' }}
            >
              <div className="text-center mb-4 border-b border-black pb-2">
                <p className="text-[13px] font-bold uppercase tracking-widest text-gray-500">— Continuation Sheet —</p>
                <p className="text-[12px] text-gray-400">{subjectCode} | {examType}</p>
              </div>
              <div style={{ minHeight: '900px' }} />
            </div>
          </div>
        </section>

        {/* RIGHT PANE: AI ASSISTANT SIDEBAR */}
        <div className="w-[380px] soft-surface rounded-[32px] p-6 flex flex-col flex-shrink-0 relative">
          <h2 className="text-xl font-extrabold mb-4 tracking-tight text-[var(--accent)] flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
            AI Assistant
          </h2>

          {/* Quick Actions (Keep your existing Part A / Part B buttons here) */}
          <div className="flex gap-2 mb-4">
            <button 
              onClick={generatePartA} 
              disabled={isGeneratingA}
              className="flex-1 py-2 rounded-xl font-bold soft-surface soft-surface-hover text-[var(--accent)] transition-all disabled:opacity-50 text-xs"
            >
              {isGeneratingA ? 'Gen...' : 'Gen Part A'}
            </button>
            <button 
              onClick={generatePartB} 
              disabled={isGeneratingB}
              className="flex-1 py-2 rounded-xl font-bold soft-surface soft-surface-hover text-[var(--accent)] transition-all disabled:opacity-50 text-xs"
            >
              {isGeneratingB ? 'Gen...' : 'Gen Part B&C'}
            </button>
          </div>

          {/* CHAT HISTORY THREAD */}
          <div className="flex-1 overflow-y-auto mb-4 flex flex-col gap-4 pr-2 custom-scrollbar" data-lenis-prevent="true">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`p-4 max-w-[85%] text-sm font-medium leading-relaxed ${
                  msg.role === 'user' 
                    ? 'soft-surface rounded-2xl rounded-tr-sm text-[var(--accent)]' // Convex for Teacher
                    : 'soft-inset rounded-2xl rounded-tl-sm text-[var(--text-main)]' // Concave for AI
                }`}>
                  {msg.content}
                </div>
              </div>
            ))}
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
