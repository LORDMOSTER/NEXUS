import React, { useEffect, useRef, useState, useCallback, useImperativeHandle, forwardRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import { TextAlign } from '@tiptap/extension-text-align';
import InstitutionalHeader from './InstitutionalHeader';
import ContinuationHeader from './ContinuationHeader';

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
// A4 at 96dpi = 794px wide. We use 800px to match existing letterhead table widths.
// Page card: 800px wide, padded 48px top/bottom (96px total vertical padding).
// Institutional header occupies ~230px (measured empirically from InstitutionalHeader).
// Page body height = 1056px (A4 height at 96dpi) - 96px padding - 16px footer = 944px usable.
const PAGE_HEIGHT_PX = 1056;   // total card height in pixels
const PAGE_PADDING_V = 48;     // top + bottom padding each side
const PAGE_FOOTER_H = 24;      // reserved for page number badge
const HEADER_PAGE1_H = 245;    // approximate px height of InstitutionalHeader
const HEADER_CONT_H = 52;      // approximate px height of ContinuationHeader
const PAGE1_BODY_H = PAGE_HEIGHT_PX - PAGE_PADDING_V * 2 - PAGE_FOOTER_H - HEADER_PAGE1_H;
const CONT_BODY_H  = PAGE_HEIGHT_PX - PAGE_PADDING_V * 2 - PAGE_FOOTER_H - HEADER_CONT_H;

// ─── MEASUREMENT EXTENSIONS ───────────────────────────────────────────────────
const measureExtensions = [
  StarterKit,
  Table.configure({ resizable: true }),
  TableRow,
  TableHeader,
  TableCell,
  TextAlign.configure({ types: ['heading', 'paragraph'] }),
];

// ─── usePaginatedContent hook ─────────────────────────────────────────────────
/**
 * Given a full HTML string, renders it in a hidden offscreen editor,
 * measures each direct child block's height, and returns an array of
 * HTML strings — one per page.
 *
 * Edge case: tables are iterated row-by-row; a row that does not fit in
 * the remaining space is moved entirely to the next page (no row splitting).
 */
function usePaginatedContent(html) {
  const [pages, setPages] = useState(['']); // array of HTML strings, one per page
  const measureEditorRef = useRef(null);
  const debounceTimer = useRef(null);

  // Hidden measurement editor — never shown to the user
  const measureEditor = useEditor({
    extensions: measureExtensions,
    content: html || '',
    editable: false,
  });

  // Keep a ref so the effect closure always has the current editor
  useEffect(() => {
    measureEditorRef.current = measureEditor;
  }, [measureEditor]);

  const runPagination = useCallback(() => {
    const editor = measureEditorRef.current;
    if (!editor) return;

    // Update content to the latest HTML
    const currentHtml = editor.getHTML();
    // Only update if content actually changed (avoid infinite loops)
    editor.commands.setContent(html || '', false);

    requestAnimationFrame(() => {
      const proseMirrorEl = editor.view?.dom;
      if (!proseMirrorEl) return;

      const children = Array.from(proseMirrorEl.children);
      if (children.length === 0) {
        setPages(['']);
        return;
      }

      const resultPages = []; // array of HTMLElement[][] (one array of nodes per page)
      let currentPageNodes = [];
      let currentHeight = 0;
      let isFirstPage = true;
      let bodyLimit = PAGE1_BODY_H;

      const flushPage = () => {
        resultPages.push(currentPageNodes);
        currentPageNodes = [];
        currentHeight = 0;
        isFirstPage = false;
        bodyLimit = CONT_BODY_H;
      };

      for (const child of children) {
        const childRect = child.getBoundingClientRect();
        const childH = childRect.height || child.offsetHeight || 20;

        // Handle tables specially: split by rows to avoid mid-row cuts
        if (child.tagName === 'TABLE' || child.querySelector('table')) {
          const tableEl = child.tagName === 'TABLE' ? child : child.querySelector('table');
          if (!tableEl) {
            // Treat as normal block
            if (currentHeight + childH > bodyLimit && currentPageNodes.length > 0) flushPage();
            currentPageNodes.push(child);
            currentHeight += childH;
            continue;
          }

          // Clone the table shell (thead, colgroup, etc.) without rows
          const tableClone = tableEl.cloneNode(false); // shallow clone
          const tbody = tableEl.querySelector('tbody');
          const thead = tableEl.querySelector('thead');
          if (thead) tableClone.appendChild(thead.cloneNode(true));

          const rows = tbody
            ? Array.from(tbody.querySelectorAll(':scope > tr'))
            : Array.from(tableEl.querySelectorAll(':scope > tr'));

          let currentTbody = document.createElement('tbody');
          tableClone.appendChild(currentTbody);

          // Capture the thead height and colgroup, if any
          const tableHeaderH = thead ? (thead.getBoundingClientRect().height || thead.offsetHeight || 0) : 0;

          // If the entire table can't even start on this page, flush first
          if (currentHeight + tableHeaderH + 20 > bodyLimit && currentPageNodes.length > 0) {
            flushPage();
          }

          for (const row of rows) {
            const rowH = row.getBoundingClientRect().height || row.offsetHeight || 28;
            if (currentHeight + rowH > bodyLimit && currentTbody.children.length > 0) {
              // Finalize current table fragment and push to page
              const tbl = tableClone.cloneNode(false);
              if (thead) tbl.appendChild(thead.cloneNode(true));
              tbl.appendChild(currentTbody.cloneNode(true));
              // Wrap in a wrapper div to be consistent with other nodes
              const wrapper = document.createElement('div');
              wrapper.appendChild(tbl);
              currentPageNodes.push(wrapper);
              flushPage();
              // Start a fresh table on the new page
              currentTbody = document.createElement('tbody');
            }
            currentTbody.appendChild(row.cloneNode(true));
            currentHeight += rowH;
          }

          // Push the remaining rows as a table fragment
          if (currentTbody.children.length > 0) {
            const tbl = tableClone.cloneNode(false);
            if (thead) tbl.appendChild(thead.cloneNode(true));
            tbl.appendChild(currentTbody.cloneNode(true));
            const wrapper = document.createElement('div');
            wrapper.appendChild(tbl);
            currentPageNodes.push(wrapper);
          }
        } else {
          // Normal block (p, h1, ol, ul, etc.)
          if (currentHeight + childH > bodyLimit && currentPageNodes.length > 0) {
            flushPage();
          }
          currentPageNodes.push(child);
          currentHeight += childH;
        }
      }

      // Push the last page
      if (currentPageNodes.length > 0) {
        resultPages.push(currentPageNodes);
      }

      // Convert each page's array of DOM nodes → HTML strings
      const pageHtmlStrings = resultPages.map(nodes =>
        nodes.map(n => n.outerHTML).join('\n')
      );

      // Ensure at least one page
      setPages(pageHtmlStrings.length > 0 ? pageHtmlStrings : ['']);
    });
  }, [html]);

  // Debounce: re-paginate 150ms after html changes
  useEffect(() => {
    if (!measureEditor) return;
    clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(runPagination, 150);
    return () => clearTimeout(debounceTimer.current);
  }, [html, measureEditor, runPagination]);

  return pages;
}

// ─── SINGLE PAGE CARD ─────────────────────────────────────────────────────────
/**
 * Renders one A4 page card with a TipTap editor slice,
 * the appropriate header (institutional or continuation),
 * and a live page number badge.
 */
function PageCard({ htmlSlice, pageNumber, totalPages, isFirstPage, headerProps, onEditorReady }) {
  const editor = useEditor({
    extensions: measureExtensions,
    content: htmlSlice || '<p></p>',
    editable: true,
    onUpdate: ({ editor }) => {
      onEditorReady?.(editor, pageNumber);
    },
  });

  // Sync content if the slice changes (after AI injection / re-pagination)
  useEffect(() => {
    if (!editor) return;
    const current = editor.getHTML();
    const next = htmlSlice || '<p></p>';
    if (current !== next) {
      editor.commands.setContent(next, false);
    }
  }, [htmlSlice, editor]);

  useEffect(() => {
    if (editor) onEditorReady?.(editor, pageNumber);
  }, [editor]);

  return (
    <div
      className="page-card"
      data-page={pageNumber}
      id={isFirstPage ? 'exam-canvas' : `exam-page-${pageNumber}`}
    >
      {/* Non-editable header region */}
      <div className="page-card-header" contentEditable={false} style={{ userSelect: 'none' }}>
        {isFirstPage ? (
          <InstitutionalHeader {...headerProps} />
        ) : (
          <ContinuationHeader
            subjectCode={headerProps.subjectCode}
            examType={headerProps.examType}
          />
        )}
      </div>

      {/* Editable academic content */}
      <div className="academic-editor page-card-inner">
        <EditorContent editor={editor} />
      </div>

      {/* Non-editable page number badge */}
      <div className="page-number-badge">
        Page {pageNumber} of {totalPages}
      </div>
    </div>
  );
}

// ─── PaginatedCanvas ──────────────────────────────────────────────────────────
/**
 * Main exported component. Accepts `html` (the full exam content string),
 * header props, and an `onEditorChange` callback that fires whenever any
 * page's editor content changes. Also exposes `getAllHtml()` via ref
 * so Studio.jsx can collect the full document for export.
 */
const PaginatedCanvas = forwardRef(function PaginatedCanvas(
  { html, headerProps, onEditorChange },
  ref
) {
  const pages = usePaginatedContent(html);
  // Store refs to each page's TipTap editor instance
  const editorRefs = useRef({});

  const handleEditorReady = useCallback((editor, pageNumber) => {
    editorRefs.current[pageNumber] = editor;
  }, []);

  /**
   * Collect the full HTML from all page editors in order.
   * Used by Studio.jsx for export / secure lock.
   */
  const getAllHtml = useCallback(() => {
    return Object.keys(editorRefs.current)
      .sort((a, b) => Number(a) - Number(b))
      .map(k => editorRefs.current[k]?.getHTML?.() || '')
      .join('\n');
  }, []);

  /**
   * Get the combined innerHTML of all page-card-inner divs in DOM order.
   * Used for the secure export backend payload.
   */
  const getAllInnerHtml = useCallback(() => {
    const cards = document.querySelectorAll('.page-card-inner');
    return Array.from(cards).map(c => c.innerHTML).join('\n');
  }, []);

  // Expose helpers to parent via ref
  useImperativeHandle(ref, () => ({
    getAllHtml,
    getAllInnerHtml,
  }), [getAllHtml, getAllInnerHtml]);

  const totalPages = pages.length;

  return (
    <div className="studio-canvas-scroll" data-lenis-prevent="true">
      {pages.map((pageHtml, idx) => (
        <PageCard
          key={idx}
          htmlSlice={pageHtml}
          pageNumber={idx + 1}
          totalPages={totalPages}
          isFirstPage={idx === 0}
          headerProps={headerProps}
          onEditorReady={handleEditorReady}
        />
      ))}
    </div>
  );
});

export default PaginatedCanvas;
