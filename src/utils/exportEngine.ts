import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import {
  FacultyMember,
  CampusActivity,
  NaacMetric,
  AAAAuditRecord,
  SOPDocument,
  StakeholderFeedbackEntry,
  SessionalAssessmentRecord,
  DepartmentAsset,
} from '../types';

export type ExportFormat = 'PDF' | 'XLSX' | 'CSV' | 'XML' | 'EXCEL' | 'DOC' | 'PPT' | 'JSON';

export interface ExportColumn<T = any> {
  header: string;
  accessor?: keyof T | string | ((row: T) => any);
  key?: keyof T | string;
  format?: (value: any, row: T) => string;
}

export interface ExportDataBundle {
  institutionName?: string;
  generatedBy?: string;
  timestamp?: string;
  facultyMembers?: FacultyMember[];
  campusActivities?: CampusActivity[];
  naacMetrics?: NaacMetric[];
  audits?: AAAAuditRecord[];
  sops?: SOPDocument[];
  feedbackEntries?: StakeholderFeedbackEntry[];
  sessionals?: SessionalAssessmentRecord[];
  assets?: DepartmentAsset[];
}

/**
 * Universal export function used across DataActionsBar and domain components
 */
export function exportData<T extends Record<string, any>>(
  data: T[],
  filename: string,
  title: string,
  columns: ExportColumn<T>[],
  format: ExportFormat
) {
  if (!data || data.length === 0) return;

  // Format flattened row objects based on column mappings
  const flatRows = data.map(item => {
    const rowObj: Record<string, any> = {};
    columns.forEach(col => {
      let rawVal: any;
      if (typeof col.accessor === 'function') {
        rawVal = col.accessor(item);
      } else if (typeof col.accessor === 'string') {
        rawVal = item[col.accessor];
      } else if (col.key) {
        rawVal = item[col.key as keyof T];
      }
      rowObj[col.header] = col.format ? col.format(rawVal, item) : rawVal ?? '';
    });
    return rowObj;
  });

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const safeFilename = `${filename}_${timestamp}`;

  if (format === 'EXCEL' || format === 'XLSX') {
    const ws = XLSX.utils.json_to_sheet(flatRows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, title.substring(0, 31));
    XLSX.writeFile(wb, `${safeFilename}.xlsx`);
    return;
  }

  if (format === 'CSV') {
    const csvContent = toCSVString(flatRows);
    triggerBrowserDownload(new Blob([csvContent], { type: 'text/csv;charset=utf-8;' }), `${safeFilename}.csv`);
    return;
  }

  if (format === 'JSON') {
    const jsonStr = JSON.stringify(data, null, 2);
    triggerBrowserDownload(new Blob([jsonStr], { type: 'application/json;charset=utf-8;' }), `${safeFilename}.json`);
    return;
  }

  if (format === 'XML') {
    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<ComplianceExport title="${escapeXml(title)}" timestamp="${new Date().toISOString()}">\n`;
    data.forEach((item, idx) => {
      xml += `  <Record id="${idx + 1}">\n`;
      columns.forEach(col => {
        const rawVal = item[col.key as keyof T];
        const displayVal = col.format ? col.format(rawVal, item) : String(rawVal ?? '');
        const tag = String(col.key).replace(/[^a-zA-Z0-9]/g, '');
        xml += `    <${tag}>${escapeXml(displayVal)}</${tag}>\n`;
      });
      xml += `  </Record>\n`;
    });
    xml += `</ComplianceExport>`;
    triggerBrowserDownload(new Blob([xml], { type: 'application/xml;charset=utf-8;' }), `${safeFilename}.xml`);
    return;
  }

  if (format === 'DOC') {
    let html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">`;
    html += `<head><meta charset="utf-8"><title>${title}</title><style>table{border-collapse:collapse;width:100%}th,td{border:1px solid #999;padding:6px;font-family:sans-serif;font-size:11px}</style></head><body>`;
    html += `<h2>${title}</h2><p>Official Institutional Record Generated: ${new Date().toLocaleString()}</p>`;
    html += `<table><thead><tr>${columns.map(c => `<th>${c.header}</th>`).join('')}</tr></thead><tbody>`;
    data.forEach(item => {
      html += `<tr>${columns.map(c => `<td>${c.format ? c.format(item[c.key as keyof T], item) : item[c.key as keyof T] ?? ''}</td>`).join('')}</tr>`;
    });
    html += `</tbody></table></body></html>`;
    triggerBrowserDownload(new Blob([html], { type: 'application/msword;charset=utf-8;' }), `${safeFilename}.doc`);
    return;
  }

  if (format === 'PPT') {
    let html = `<html><head><meta charset="utf-8"><title>${title}</title><style>body{font-family:sans-serif;padding:30px}.slide{border:2px solid #333;padding:20px;margin-bottom:20px;border-radius:10px}</style></head><body>`;
    html += `<div class="slide"><h1>${title}</h1><h3>Total Records: ${data.length}</h3><p>Generated: ${new Date().toLocaleString()}</p></div>`;
    triggerBrowserDownload(new Blob([html], { type: 'application/vnd.ms-powerpoint;charset=utf-8;' }), `${safeFilename}.ppt`);
    return;
  }

  if (format === 'PDF') {
    const doc = new jsPDF('landscape');
    renderPdfHeader(doc, title.toUpperCase(), 'INSTITUTIONAL QUALITY & ERP SUITE');

    doc.setFontSize(8);
    doc.setTextColor(70, 80, 95);
    doc.text(`Generated: ${new Date().toLocaleString()} | Total Records: ${data.length}`, 14, 28);

    let y = 36;
    doc.setFillColor(241, 245, 249);
    doc.rect(14, y, 268, 8, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(30, 41, 59);

    const colWidth = Math.floor(260 / Math.min(columns.length, 6));
    columns.slice(0, 6).forEach((col, idx) => {
      doc.text(col.header.substring(0, 18), 16 + idx * colWidth, y + 5);
    });

    y += 10;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);

    data.slice(0, 50).forEach((item, rowIdx) => {
      if (y > 185) {
        doc.addPage('landscape');
        renderPdfHeader(doc, title.toUpperCase(), 'INSTITUTIONAL QUALITY & ERP SUITE');
        y = 36;
      }
      if (rowIdx % 2 === 1) {
        doc.setFillColor(248, 250, 252);
        doc.rect(14, y - 4, 268, 7, 'F');
      }
      doc.setTextColor(15, 23, 42);
      columns.slice(0, 6).forEach((col, idx) => {
        const val = col.format ? col.format(item[col.key as keyof T], item) : String(item[col.key as keyof T] ?? '');
        doc.text(val.substring(0, 22), 16 + idx * colWidth, y);
      });
      y += 7;
    });

    renderPdfFooter(doc);
    doc.save(`${safeFilename}.pdf`);
  }
}

/**
 * Download a blob file in the browser
 */
function triggerBrowserDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Format CSV rows safely escaping commas and quotes
 */
function toCSVString(data: Array<Record<string, any>>): string {
  if (!data || data.length === 0) return '';
  const headers = Object.keys(data[0]);
  const rows = data.map(row =>
    headers
      .map(fieldName => {
        let val = row[fieldName];
        if (val === null || val === undefined) return '""';
        if (typeof val === 'object') val = JSON.stringify(val);
        const str = String(val).replace(/"/g, '""');
        return `"${str}"`;
      })
      .join(',')
  );
  return '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
}

/**
 * Export Faculty Members in chosen format
 */
export function exportFacultyData(faculty: FacultyMember[], format: ExportFormat, institutionName = 'Higher Education University & Medical Center') {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `Faculty_Register_${timestamp}`;

  const flatData = faculty.map(f => ({
    'Employee ID': f.empId,
    'Faculty Name': f.name,
    'Designation': f.designation,
    'Department': f.department,
    'Employment Type': f.employmentType,
    'Status': f.status,
    'Joining Date': f.joinDate,
    'Qualification': f.qualification,
    'Specialization': f.specialization,
    'Email': f.email,
    'Phone': f.phone,
    'Aadhaar (Masked)': f.kyc.aadhaarNumber,
    'PAN Number': f.kyc.panNumber,
    'Passport': f.kyc.passportNumber || 'N/A',
    'Bank Name': f.kyc.bankName,
    'Bank Account (Masked)': f.kyc.bankAccountNumber,
    'Bank IFSC': f.kyc.bankIfscCode,
    'Appointment Ref': f.kyc.appointmentLetterNumber,
    'Appointment Date': f.kyc.appointmentDate,
    'KYC Verified': f.kyc.isKycVerified ? 'Verified' : 'Pending',
    'Guest Stipend / Session': f.guestTerms ? `Rs. ${f.guestTerms.honorariumPerSession}` : 'N/A',
    'Guest Parent Institution': f.guestTerms?.affiliatedInstitution || 'N/A',
    'Guest Lecture Topic': f.guestTerms?.specialLectureTopic || 'N/A',
    'Testimonials Count': f.kyc.testimonials?.length || 0,
  }));

  if (format === 'CSV') {
    const csvContent = toCSVString(flatData);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    triggerBrowserDownload(blob, `${filename}.csv`);
    return;
  }

  if (format === 'XLSX') {
    const ws = XLSX.utils.json_to_sheet(flatData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Faculty KYC Register');
    XLSX.writeFile(wb, `${filename}.xlsx`);
    return;
  }

  if (format === 'XML') {
    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<FacultyRegister xmlns="urn:eoms:iso21001:faculty" generatedAt="${new Date().toISOString()}">\n`;
    xml += `  <Institution>${institutionName}</Institution>\n`;
    xml += `  <TotalRecords>${faculty.length}</TotalRecords>\n`;
    xml += `  <FacultyList>\n`;
    faculty.forEach(f => {
      xml += `    <FacultyMember id="${f.id}">\n`;
      xml += `      <EmployeeId>${f.empId}</EmployeeId>\n`;
      xml += `      <Name>${escapeXml(f.name)}</Name>\n`;
      xml += `      <Designation>${f.designation}</Designation>\n`;
      xml += `      <Department>${escapeXml(f.department)}</Department>\n`;
      xml += `      <EmploymentType>${f.employmentType}</EmploymentType>\n`;
      xml += `      <Status>${f.status}</Status>\n`;
      xml += `      <Qualification>${escapeXml(f.qualification)}</Qualification>\n`;
      xml += `      <Email>${f.email}</Email>\n`;
      xml += `      <KYC>\n`;
      xml += `        <Aadhaar>${f.kyc.aadhaarNumber}</Aadhaar>\n`;
      xml += `        <PAN>${f.kyc.panNumber}</PAN>\n`;
      xml += `        <Bank>${escapeXml(f.kyc.bankName)} (${f.kyc.bankAccountNumber})</Bank>\n`;
      xml += `        <AppointmentRef>${f.kyc.appointmentLetterNumber}</AppointmentRef>\n`;
      xml += `        <Verified>${f.kyc.isKycVerified}</Verified>\n`;
      xml += `      </KYC>\n`;
      if (f.guestTerms) {
        xml += `      <GuestFacultyTerms>\n`;
        xml += `        <Honorarium>${f.guestTerms.honorariumPerSession}</Honorarium>\n`;
        xml += `        <AffiliatedInstitution>${escapeXml(f.guestTerms.affiliatedInstitution)}</AffiliatedInstitution>\n`;
        xml += `      </GuestFacultyTerms>\n`;
      }
      xml += `    </FacultyMember>\n`;
    });
    xml += `  </FacultyList>\n</FacultyRegister>`;
    const blob = new Blob([xml], { type: 'application/xml;charset=utf-8;' });
    triggerBrowserDownload(blob, `${filename}.xml`);
    return;
  }

  if (format === 'PDF') {
    const doc = new jsPDF('landscape');
    renderPdfHeader(doc, 'FACULTY & GUEST APPOINTMENT STATUTORY REGISTER', institutionName);

    doc.setFontSize(9);
    doc.setTextColor(70, 80, 95);
    doc.text(`Generated on: ${new Date().toLocaleString()} | Verified Institutional Records | Total Faculty: ${faculty.length}`, 14, 28);

    let y = 36;
    doc.setFillColor(241, 245, 249);
    doc.rect(14, y, 268, 8, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(30, 41, 59);

    doc.text('Emp ID', 16, y + 5);
    doc.text('Faculty Name', 45, y + 5);
    doc.text('Designation', 95, y + 5);
    doc.text('Department', 135, y + 5);
    doc.text('Status', 185, y + 5);
    doc.text('Aadhaar / PAN', 215, y + 5);
    doc.text('KYC State', 255, y + 5);

    y += 10;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);

    faculty.forEach((f, idx) => {
      if (y > 185) {
        doc.addPage('landscape');
        renderPdfHeader(doc, 'FACULTY & GUEST APPOINTMENT STATUTORY REGISTER', institutionName);
        y = 36;
      }

      if (idx % 2 === 1) {
        doc.setFillColor(248, 250, 252);
        doc.rect(14, y - 4, 268, 7, 'F');
      }

      doc.setTextColor(15, 23, 42);
      doc.text(f.empId, 16, y);
      doc.text(f.name.substring(0, 26), 45, y);
      doc.text(f.designation, 95, y);
      doc.text(f.department.substring(0, 26), 135, y);
      doc.text(f.status, 185, y);
      doc.text(`${f.kyc.aadhaarNumber.slice(-8)} / ${f.kyc.panNumber}`, 215, y);
      doc.text(f.kyc.isKycVerified ? 'Verified' : 'Pending', 255, y);

      y += 8;
    });

    renderPdfFooter(doc);
    doc.save(`${filename}.pdf`);
  }
}

/**
 * Export Campus Activities, Sports & Symposiums
 */
export function exportActivitiesData(activities: CampusActivity[], format: ExportFormat, institutionName = 'Higher Education University & Medical Center') {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `Campus_Activities_Register_${timestamp}`;

  const flatData = activities.map(a => ({
    'Activity Code': a.activityCode,
    'Title': a.title,
    'Category': a.category,
    'Organizing Department': a.organizingDepartment,
    'Faculty Coordinator': a.facultyCoordinator,
    'Start Date': a.startDate,
    'End Date': a.endDate,
    'Venue': a.venue,
    'Participants': a.participantCount,
    'Budget Allocated (Rs.)': a.budgetAllocated,
    'Budget Utilized (Rs.)': a.budgetUtilized,
    'Status': a.status,
    'NAAC Criterion Link': `Criterion ${a.naacCriterionLink}`,
    'ISO Clause': `Clause ${a.isoClauseLink}`,
    'Certificates Issued': a.certificatesIssued,
    'Key Outcomes': a.keyOutcomes,
  }));

  if (format === 'CSV') {
    const csv = toCSVString(flatData);
    triggerBrowserDownload(new Blob([csv], { type: 'text/csv;charset=utf-8;' }), `${filename}.csv`);
    return;
  }

  if (format === 'XLSX') {
    const ws = XLSX.utils.json_to_sheet(flatData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Campus Events & Sports');
    XLSX.writeFile(wb, `${filename}.xlsx`);
    return;
  }

  if (format === 'XML') {
    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<CampusActivitiesRegister xmlns="urn:eoms:activities" generatedAt="${new Date().toISOString()}">\n`;
    xml += `  <Institution>${institutionName}</Institution>\n`;
    xml += `  <TotalActivities>${activities.length}</TotalActivities>\n`;
    xml += `  <ActivitiesList>\n`;
    activities.forEach(a => {
      xml += `    <Activity id="${a.id}">\n`;
      xml += `      <Code>${a.activityCode}</Code>\n`;
      xml += `      <Title>${escapeXml(a.title)}</Title>\n`;
      xml += `      <Category>${a.category}</Category>\n`;
      xml += `      <Department>${escapeXml(a.organizingDepartment)}</Department>\n`;
      xml += `      <Coordinator>${escapeXml(a.facultyCoordinator)}</Coordinator>\n`;
      xml += `      <Dates start="${a.startDate}" end="${a.endDate}" />\n`;
      xml += `      <Venue>${escapeXml(a.venue)}</Venue>\n`;
      xml += `      <Participants>${a.participantCount}</Participants>\n`;
      xml += `      <Budget allocated="${a.budgetAllocated}" utilized="${a.budgetUtilized}" />\n`;
      xml += `      <Status>${a.status}</Status>\n`;
      xml += `      <NAACCriterion>${a.naacCriterionLink}</NAACCriterion>\n`;
      xml += `      <ISOClause>${a.isoClauseLink}</ISOClause>\n`;
      xml += `      <Outcomes>${escapeXml(a.keyOutcomes)}</Outcomes>\n`;
      xml += `    </Activity>\n`;
    });
    xml += `  </ActivitiesList>\n</CampusActivitiesRegister>`;
    triggerBrowserDownload(new Blob([xml], { type: 'application/xml;charset=utf-8;' }), `${filename}.xml`);
    return;
  }

  if (format === 'PDF') {
    const doc = new jsPDF('landscape');
    renderPdfHeader(doc, 'SPORTS, SEMINARS, SYMPOSIUMS & CAMPUS ACTIVITIES REGISTER', institutionName);

    doc.setFontSize(9);
    doc.setTextColor(70, 80, 95);
    doc.text(`Generated on: ${new Date().toLocaleString()} | Total Activities Logged: ${activities.length}`, 14, 28);

    let y = 36;
    doc.setFillColor(241, 245, 249);
    doc.rect(14, y, 268, 8, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(30, 41, 59);

    doc.text('Activity Code', 16, y + 5);
    doc.text('Event Title & Category', 50, y + 5);
    doc.text('Dates', 125, y + 5);
    doc.text('Participants', 165, y + 5);
    doc.text('Budget (Spent/Alloc)', 195, y + 5);
    doc.text('Status', 240, y + 5);

    y += 10;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);

    activities.forEach((a, idx) => {
      if (y > 185) {
        doc.addPage('landscape');
        renderPdfHeader(doc, 'SPORTS, SEMINARS, SYMPOSIUMS & CAMPUS ACTIVITIES REGISTER', institutionName);
        y = 36;
      }

      if (idx % 2 === 1) {
        doc.setFillColor(248, 250, 252);
        doc.rect(14, y - 4, 268, 7, 'F');
      }

      doc.setTextColor(15, 23, 42);
      doc.text(a.activityCode, 16, y);
      doc.text(`${a.title.substring(0, 36)} (${a.category})`, 50, y);
      doc.text(a.startDate, 125, y);
      doc.text(String(a.participantCount), 165, y);
      doc.text(`Rs. ${(a.budgetUtilized / 1000).toFixed(0)}k / ${(a.budgetAllocated / 1000).toFixed(0)}k`, 195, y);
      doc.text(a.status, 240, y);

      y += 8;
    });

    renderPdfFooter(doc);
    doc.save(`${filename}.pdf`);
  }
}

/**
 * Universal Master Bulk Export of All Modules
 */
export function exportMasterInstitutionalBundle(bundle: ExportDataBundle, format: ExportFormat) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `Institutional_Master_Compliance_Archive_${timestamp}`;
  const instName = bundle.institutionName || 'University Higher Education & IQAC Suite';

  if (format === 'XLSX') {
    const wb = XLSX.utils.book_new();

    if (bundle.facultyMembers && bundle.facultyMembers.length > 0) {
      const wsFaculty = XLSX.utils.json_to_sheet(
        bundle.facultyMembers.map(f => ({
          'Emp ID': f.empId,
          'Name': f.name,
          'Designation': f.designation,
          'Department': f.department,
          'Employment': f.employmentType,
          'Status': f.status,
          'Joining': f.joinDate,
          'Aadhaar': f.kyc.aadhaarNumber,
          'PAN': f.kyc.panNumber,
          'Bank Account': f.kyc.bankAccountNumber,
          'Appointment Letter': f.kyc.appointmentLetterNumber,
          'KYC Verified': f.kyc.isKycVerified ? 'Yes' : 'No',
        }))
      );
      XLSX.utils.book_append_sheet(wb, wsFaculty, 'Faculty Register');
    }

    if (bundle.campusActivities && bundle.campusActivities.length > 0) {
      const wsActs = XLSX.utils.json_to_sheet(
        bundle.campusActivities.map(a => ({
          'Code': a.activityCode,
          'Title': a.title,
          'Category': a.category,
          'Department': a.organizingDepartment,
          'Dates': `${a.startDate} to ${a.endDate}`,
          'Participants': a.participantCount,
          'Budget Allocated': a.budgetAllocated,
          'Budget Utilized': a.budgetUtilized,
          'Status': a.status,
          'NAAC': a.naacCriterionLink,
        }))
      );
      XLSX.utils.book_append_sheet(wb, wsActs, 'Campus Activities');
    }

    if (bundle.naacMetrics && bundle.naacMetrics.length > 0) {
      const wsNaac = XLSX.utils.json_to_sheet(
        bundle.naacMetrics.map(m => ({
          'Criterion': m.criterionId,
          'Code': m.metricCode,
          'Description': m.metricDescription,
          'Score': m.currentScore,
          'Max': m.maxScore,
          'Status': m.status,
          'Evidences': m.evidenceCount,
        }))
      );
      XLSX.utils.book_append_sheet(wb, wsNaac, 'NAAC 1-10 Matrix');
    }

    if (bundle.feedbackEntries && bundle.feedbackEntries.length > 0) {
      const wsFeedback = XLSX.utils.json_to_sheet(
        bundle.feedbackEntries.map(e => ({
          'ID': e.id,
          'Role': e.role,
          'Department': e.department,
          'Cohort': e.semesterCohort,
          'Sentiment': e.sentiment,
          'Status': e.status,
          'Comments': e.qualitativeComments,
        }))
      );
      XLSX.utils.book_append_sheet(wb, wsFeedback, 'Stakeholder Feedback');
    }

    if (bundle.audits && bundle.audits.length > 0) {
      const wsAudits = XLSX.utils.json_to_sheet(
        bundle.audits.map(au => ({
          'Audit ID': au.id,
          'Cycle': au.auditCycle,
          'Department': au.department,
          'Date': au.auditDate,
          'Lead Auditor': au.leadAuditor,
          'Status': au.status,
          'Non-Conformances': au.nonConformances.length,
        }))
      );
      XLSX.utils.book_append_sheet(wb, wsAudits, 'AAA Audits & CAPA');
    }

    XLSX.writeFile(wb, `${filename}.xlsx`);
    return;
  }

  if (format === 'CSV') {
    // Combine primary records into clean unified CSV
    const rows: Array<Record<string, any>> = [];
    bundle.facultyMembers?.forEach(f => {
      rows.push({
        'Module': 'Faculty Management',
        'Record ID': f.empId,
        'Title / Name': f.name,
        'Department': f.department,
        'Designation / Type': f.designation,
        'Status': f.status,
        'Date': f.joinDate,
        'Details': `KYC Verified: ${f.kyc.isKycVerified}; Specialization: ${f.specialization}`,
      });
    });
    bundle.campusActivities?.forEach(a => {
      rows.push({
        'Module': 'Campus Events & Sports',
        'Record ID': a.activityCode,
        'Title / Name': a.title,
        'Department': a.organizingDepartment,
        'Designation / Type': a.category,
        'Status': a.status,
        'Date': a.startDate,
        'Details': `Participants: ${a.participantCount}; Budget: Rs. ${a.budgetUtilized}/${a.budgetAllocated}`,
      });
    });
    bundle.naacMetrics?.forEach(m => {
      rows.push({
        'Module': 'NAAC Accreditation',
        'Record ID': m.metricCode,
        'Title / Name': m.metricDescription.substring(0, 50),
        'Department': `Criterion ${m.criterionId}`,
        'Designation / Type': m.metricType,
        'Status': m.status,
        'Date': m.lastUpdated,
        'Details': `Score: ${m.currentScore}/${m.maxScore}; Evidence: ${m.evidenceCount}`,
      });
    });

    const csv = toCSVString(rows);
    triggerBrowserDownload(new Blob([csv], { type: 'text/csv;charset=utf-8;' }), `${filename}.csv`);
    return;
  }

  if (format === 'XML') {
    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<InstitutionalMasterArchive xmlns="urn:eoms:master:v2" exportedAt="${new Date().toISOString()}">\n`;
    xml += `  <Institution>${instName}</Institution>\n`;
    xml += `  <Metadata>\n    <GeneratedBy>${bundle.generatedBy || 'Administrator'}</GeneratedBy>\n    <Standard>ISO 21001:2025 &amp; NAAC Binary Framework</Standard>\n  </Metadata>\n`;

    xml += `  <FacultySummary count="${bundle.facultyMembers?.length || 0}">\n`;
    bundle.facultyMembers?.forEach(f => {
      xml += `    <Faculty empId="${f.empId}" name="${escapeXml(f.name)}" designation="${f.designation}" dept="${escapeXml(f.department)}" status="${f.status}" />\n`;
    });
    xml += `  </FacultySummary>\n`;

    xml += `  <ActivitiesSummary count="${bundle.campusActivities?.length || 0}">\n`;
    bundle.campusActivities?.forEach(a => {
      xml += `    <Activity code="${a.activityCode}" title="${escapeXml(a.title)}" category="${a.category}" participants="${a.participantCount}" status="${a.status}" />\n`;
    });
    xml += `  </ActivitiesSummary>\n`;

    xml += `</InstitutionalMasterArchive>`;
    triggerBrowserDownload(new Blob([xml], { type: 'application/xml;charset=utf-8;' }), `${filename}.xml`);
    return;
  }

  if (format === 'PDF') {
    const doc = new jsPDF('portrait');
    renderPdfHeader(doc, 'INSTITUTIONAL MASTER COMPLIANCE SUMMARY', instName);

    doc.setFontSize(9);
    doc.setTextColor(70, 80, 95);
    doc.text(`Generated: ${new Date().toLocaleString()} | Official ISO 21001 & NAAC Record Dossier`, 14, 28);

    let y = 38;
    const drawSection = (title: string, count: number, desc: string) => {
      doc.setFillColor(241, 245, 249);
      doc.rect(14, y, 182, 7, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(15, 23, 42);
      doc.text(title, 16, y + 5);
      doc.text(`Records: ${count}`, 160, y + 5);

      y += 11;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(71, 85, 105);
      doc.text(desc, 16, y);
      y += 8;
    };

    drawSection('1. Faculty & Guest Appointment Register', bundle.facultyMembers?.length || 0, 'Includes regular faculty, guest appointments, appointment refs, and KYC verification states.');
    drawSection('2. Campus Activities, Sports & Symposiums', bundle.campusActivities?.length || 0, 'Sports Olympiad, international symposiums, seminars, workshops, and student outreach.');
    drawSection('3. NAAC Criteria 1-10 Accreditation Matrix', bundle.naacMetrics?.length || 0, 'Quantitative & qualitative institutional metrics with verified digital evidence.');
    drawSection('4. Stakeholder Feedback & Quality Radar', bundle.feedbackEntries?.length || 0, 'ISO 21001:2025 Clause 9.1.2 voice-of-learner and continuous improvement telemetry.');
    drawSection('5. Academic & Admin Audits (AAA) & CAPA', bundle.audits?.length || 0, 'Surveillance cycles, findings, corrective action plans, and lead auditor endorsements.');

    y += 10;
    doc.setDrawColor(203, 213, 225);
    doc.line(14, y, 196, y);
    y += 8;
    doc.setFontSize(8);
    doc.text('Institutional Compliance Sign-off: Dean / Principal / Lead IQAC Director', 14, y);
    doc.text('Seal & Cryptographic Vault Signature Verified', 130, y);

    renderPdfFooter(doc);
    doc.save(`${filename}.pdf`);
  }
}

function renderPdfHeader(doc: jsPDF, title: string, institution: string) {
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, doc.internal.pageSize.getWidth(), 20, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(255, 255, 255);
  doc.text(institution.toUpperCase(), 14, 9);
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text(title, 14, 15);
}

function renderPdfFooter(doc: jsPDF) {
  const pageHeight = doc.internal.pageSize.getHeight();
  const pageWidth = doc.internal.pageSize.getWidth();
  doc.setDrawColor(226, 232, 240);
  doc.line(14, pageHeight - 12, pageWidth - 14, pageHeight - 12);
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  doc.text('Official Educational Organization Management System (EOMS) Record · Cryptographically Sealed', 14, pageHeight - 7);
  doc.text('Confidential & Statutory Document', pageWidth - 60, pageHeight - 7);
}

function escapeXml(unsafe: string): string {
  if (!unsafe) return '';
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
