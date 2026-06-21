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
      
      <h1 style={{ textAlign: 'center', fontSize: '22px', fontWeight: '900', margin: '0 0 5px 0', letterSpacing: '0.5px' }}>
        NANDHA COLLEGE OF TECHNOLOGY (AUTONOMOUS)
      </h1>
      <h3 style={{ textAlign: 'center', fontSize: '15px', fontWeight: 'bold', margin: '0 0 20px 0' }}>
        (Approved by AICTE, New Delhi | Affiliated to Anna University)
      </h3>

      {/* MAIN METADATA TABLE */}
      <table style={{ width: '100%', borderCollapse: 'collapse', border: '2px solid black', fontSize: '13px', fontWeight: 'bold', tableLayout: 'fixed' }}>
        <tbody>
          
          {/* ROW 1: Register No & Code */}
          <tr>
            <td style={{ border: '1px solid black', padding: '6px 8px', width: '16%' }}>REGISTER NO.</td>
            <td style={{ border: '1px solid black', padding: '6px 8px', width: '3%', textAlign: 'center' }}>:</td>
            
            {/* NESTED TABLE FOR REGISTER BOXES - Fixed Layout */}
            <td style={{ border: '1px solid black', padding: 0, width: '36%' }}>
              <table style={{ width: '100%', height: '32px', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
                <tbody>
                  <tr>
                    {Array(12).fill('').map((_, i) => (
                      <td key={i} style={{ borderRight: i !== 11 ? '1px solid black' : 'none', width: '8.33%', padding: 0, height: '32px', textAlign: 'center' }}>
                        &nbsp;
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </td>
            
            <td style={{ border: '1px solid black', padding: '6px 8px', width: '12%' }}>CODE</td>
            <td style={{ border: '1px solid black', padding: '6px 8px', width: '3%', textAlign: 'center' }}>:</td>
            
            {/* NESTED TABLE FOR CODE BOXES - Fixed Layout */}
            <td style={{ border: '1px solid black', padding: 0, width: '30%' }}>
              <table style={{ width: '100%', height: '32px', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
                <tbody>
                  <tr>
                    {codeDigits.map((num, i) => (
                      <td key={i} style={{ borderRight: i !== codeDigits.length - 1 ? '1px solid black' : 'none', width: '20%', padding: 0, height: '32px', textAlign: 'center', fontSize: '14px' }}>
                        {num || '\u00A0'}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </td>
          </tr>

          {/* ROW 2 */}
          <tr>
            <td style={{ border: '1px solid black', padding: '6px 8px' }}>ACADEMIC YEAR</td>
            <td style={{ border: '1px solid black', padding: '6px 8px', textAlign: 'center' }}>:</td>
            <td style={{ border: '1px solid black', padding: '6px 8px', fontWeight: 'normal' }}>{academicYear}</td>
            <td style={{ border: '1px solid black', padding: '6px 8px' }}>YEAR / SEM</td>
            <td style={{ border: '1px solid black', padding: '6px 8px', textAlign: 'center' }}>:</td>
            <td style={{ border: '1px solid black', padding: '6px 8px', fontWeight: 'normal' }}>{yearSem}</td>
          </tr>

          {/* ROW 3 */}
          <tr>
            <td style={{ border: '1px solid black', padding: '6px 8px' }}>EXAM TYPE</td>
            <td style={{ border: '1px solid black', padding: '6px 8px', textAlign: 'center' }}>:</td>
            <td style={{ border: '1px solid black', padding: '6px 8px', fontWeight: 'normal' }}>{examType}</td>
            <td style={{ border: '1px solid black', padding: '6px 8px' }}>MAX MARKS</td>
            <td style={{ border: '1px solid black', padding: '6px 8px', textAlign: 'center' }}>:</td>
            <td style={{ border: '1px solid black', padding: '6px 8px', fontWeight: 'normal' }}>{maxMarks}</td>
          </tr>

          {/* ROW 4 */}
          <tr>
            <td style={{ border: '1px solid black', padding: '6px 8px' }}>DEPARTMENT</td>
            <td style={{ border: '1px solid black', padding: '6px 8px', textAlign: 'center' }}>:</td>
            <td style={{ border: '1px solid black', padding: '6px 8px', fontWeight: 'normal' }}>{department}</td>
            <td style={{ border: '1px solid black', padding: '6px 8px' }}>DURATION</td>
            <td style={{ border: '1px solid black', padding: '6px 8px', textAlign: 'center' }}>:</td>
            <td style={{ border: '1px solid black', padding: '6px 8px', fontWeight: 'normal' }}>{duration}</td>
          </tr>

          {/* ROW 5 */}
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
            <td style={{ width: '22%', padding: '8px 0' }}>SUBJECT CODE & NAME</td>
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
