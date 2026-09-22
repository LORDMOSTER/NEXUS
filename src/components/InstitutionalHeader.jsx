import React from 'react';

export default function InstitutionalHeader({ 
  academicYear = "2025-2026", 
  yearSem = "III / V", 
  examType = "CAT-1", 
  maxMarks = "100", 
  department = "CSE / IT", 
  duration = "3 Hours", 
  date = "22/06/2026", 
  subjectName = "CS3451 - INTRODUCTION TO OPERATING SYSTEMS",
  codeDigits = ['2', '3', '3', '2', '1'] 
}) {
  return (
    <div style={{ fontFamily: "'Times New Roman', Times, serif", marginBottom: '30px', color: 'black' }} className="print-safe-header">
      
      <h1 style={{ textAlign: 'center', fontSize: '22px', fontWeight: '900', margin: '0 0 5px 0', letterSpacing: '0.5px', color: 'black' }}>
        NANDHA COLLEGE OF TECHNOLOGY (AUTONOMOUS)
      </h1>
      <h3 style={{ textAlign: 'center', fontSize: '15px', fontWeight: 'bold', margin: '0 0 20px 0', color: 'black' }}>
        (Approved by AICTE, New Delhi | Affiliated to Anna University)
      </h3>

      {/* MAIN METADATA TABLE — outer table has NO tableLayout:fixed so rows 2-5 don't pollute row 1 widths */}
      <table style={{ width: '100%', borderCollapse: 'collapse', border: '2px solid black', fontSize: '13px', fontWeight: 'bold' }}>
        <tbody>

          {/* ── ROW 1: REGISTER NO. & CODE ──────────────────────────────────────────
              This row is fully isolated inside its own nested table that spans all 6
              columns via colspan. None of the pixel widths below can be overridden by
              subsequent rows because the inner table controls its own column widths.
          ─────────────────────────────────────────────────────────────────────────── */}
          <tr>
            <td style={{ padding: 0, border: '1px solid black' }} colSpan={6}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <tbody>
                  <tr>
                    {/* Label — fixed width, no stretch */}
                    <td style={{ width: '120px', padding: '6px 8px', fontWeight: 'bold', whiteSpace: 'nowrap', border: 'none' }}>
                      REGISTER NO.
                    </td>

                    {/* Colon — strictly width-locked to 15px, hugs the label */}
                    <td style={{ width: '15px', textAlign: 'center', border: 'none', padding: 0 }}>:</td>

                    {/* 12 empty tracking boxes — each exactly 24×24px in an isolated inline-table */}
                    <td style={{ padding: '4px 6px', border: 'none' }}>
                      <table style={{ borderCollapse: 'collapse', display: 'inline-table' }}>
                        <tbody>
                          <tr>
                            {Array(12).fill('').map((_, i) => (
                              <td
                                key={i}
                                style={{
                                  width: '24px',
                                  height: '24px',
                                  border: '1px solid #000000',
                                  textAlign: 'center',
                                  fontWeight: 'bold',
                                  verticalAlign: 'middle',
                                  padding: 0,
                                }}
                              >
                                &nbsp;
                              </td>
                            ))}
                          </tr>
                        </tbody>
                      </table>
                    </td>

                    {/* CODE label — fixed 60px, no stretch */}
                    <td style={{ width: '60px', padding: '6px 8px', fontWeight: 'bold', whiteSpace: 'nowrap', border: 'none' }}>
                      CODE
                    </td>

                    {/* Colon — strictly width-locked to 15px */}
                    <td style={{ width: '15px', textAlign: 'center', border: 'none', padding: 0 }}>:</td>

                    {/* Code digit boxes — each exactly 24×24px in an isolated inline-table */}
                    <td style={{ padding: '4px 6px', border: 'none' }}>
                      <table style={{ borderCollapse: 'collapse', display: 'inline-table' }}>
                        <tbody>
                          <tr>
                            {codeDigits.map((digit, i) => (
                              <td
                                key={i}
                                style={{
                                  width: '24px',
                                  height: '24px',
                                  border: '1px solid #000000',
                                  textAlign: 'center',
                                  fontWeight: 'bold',
                                  verticalAlign: 'middle',
                                  padding: 0,
                                  fontSize: '14px',
                                }}
                              >
                                {digit || '\u00A0'}
                              </td>
                            ))}
                          </tr>
                        </tbody>
                      </table>
                    </td>
                  </tr>
                </tbody>
              </table>
            </td>
          </tr>

          {/* ── ROW 2: Academic Year & Year/Sem ──────────────────────────────────── */}
          <tr>
            <td style={{ border: '1px solid black', padding: '6px 8px', width: '16%' }}>ACADEMIC YEAR</td>
            <td style={{ border: '1px solid black', padding: '6px 8px', width: '3%', textAlign: 'center' }}>:</td>
            <td style={{ border: '1px solid black', padding: '6px 8px', width: '31%', fontWeight: 'normal' }}>{academicYear}</td>
            <td style={{ border: '1px solid black', padding: '6px 8px', width: '12%' }}>YEAR / SEM</td>
            <td style={{ border: '1px solid black', padding: '6px 8px', width: '3%', textAlign: 'center' }}>:</td>
            <td style={{ border: '1px solid black', padding: '6px 8px', fontWeight: 'normal' }}>{yearSem}</td>
          </tr>

          {/* ── ROW 3: Exam Type & Max Marks ─────────────────────────────────────── */}
          <tr>
            <td style={{ border: '1px solid black', padding: '6px 8px' }}>EXAM TYPE</td>
            <td style={{ border: '1px solid black', padding: '6px 8px', textAlign: 'center' }}>:</td>
            <td style={{ border: '1px solid black', padding: '6px 8px', fontWeight: 'normal' }}>{examType}</td>
            <td style={{ border: '1px solid black', padding: '6px 8px' }}>MAX MARKS</td>
            <td style={{ border: '1px solid black', padding: '6px 8px', textAlign: 'center' }}>:</td>
            <td style={{ border: '1px solid black', padding: '6px 8px', fontWeight: 'normal' }}>{maxMarks}</td>
          </tr>

          {/* ── ROW 4: Department & Duration ─────────────────────────────────────── */}
          <tr>
            <td style={{ border: '1px solid black', padding: '6px 8px' }}>DEPARTMENT</td>
            <td style={{ border: '1px solid black', padding: '6px 8px', textAlign: 'center' }}>:</td>
            <td style={{ border: '1px solid black', padding: '6px 8px', fontWeight: 'normal' }}>{department}</td>
            <td style={{ border: '1px solid black', padding: '6px 8px' }}>DURATION</td>
            <td style={{ border: '1px solid black', padding: '6px 8px', textAlign: 'center' }}>:</td>
            <td style={{ border: '1px solid black', padding: '6px 8px', fontWeight: 'normal' }}>{duration}</td>
          </tr>

          {/* ── ROW 5: Date ──────────────────────────────────────────────────────── */}
          <tr>
            <td style={{ border: '1px solid black', padding: '6px 8px' }}>DATE</td>
            <td style={{ border: '1px solid black', padding: '6px 8px', textAlign: 'center' }}>:</td>
            <td style={{ border: '1px solid black', padding: '6px 8px', fontWeight: 'normal' }}>{date}</td>
            <td style={{ border: '1px solid black', padding: '6px 8px', backgroundColor: '#f9f9f9' }}></td>
            <td style={{ border: '1px solid black', padding: '6px 8px', backgroundColor: '#f9f9f9' }}></td>
            <td style={{ border: '1px solid black', padding: '6px 8px', backgroundColor: '#f9f9f9' }}></td>
          </tr>

        </tbody>
      </table>

      {/* SUBJECT IDENTIFIER */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px', fontSize: '13px', fontWeight: 'bold' }}>
        <tbody>
          <tr>
            <td style={{ width: '22%', padding: '8px 0' }}>SUBJECT CODE &amp; NAME</td>
            <td style={{ width: '3%', textAlign: 'center' }}>:</td>
            <td style={{ border: '1px solid black', padding: '8px 12px', width: '75%', fontWeight: 'normal' }}>
              {subjectName}
            </td>
          </tr>
        </tbody>
      </table>
      
      {/* Decorative Divider */}
      <div style={{ height: '2px', backgroundColor: 'black', width: '100%', marginTop: '20px' }}></div>
    </div>
  );
}
