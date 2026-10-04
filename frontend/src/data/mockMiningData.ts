import type {
  DocumentRecord,
  ManualRecord,
  InformationRequest,
  ReportDraft,
  TopicCluster,
  AuditEvent,
  NotificationItem
} from '../types';

export const MOCK_SUBSIDIARIES = [
  { code: 'ECL', name: 'Eastern Coalfields Limited', hq: 'Sanctoria, WB', targetMT: 52.0 },
  { code: 'BCCL', name: 'Bharat Coking Coal Limited', hq: 'Dhanbad, JH', targetMT: 41.5 },
  { code: 'CCL', name: 'Central Coalfields Limited', hq: 'Ranchi, JH', targetMT: 84.0 },
  { code: 'NCL', name: 'Northern Coalfields Limited', hq: 'Singrauli, MP', targetMT: 133.0 },
  { code: 'WCL', name: 'Western Coalfields Limited', hq: 'Nagpur, MH', targetMT: 65.5 },
  { code: 'SECL', name: 'South Eastern Coalfields Limited', hq: 'Bilaspur, CG', targetMT: 182.0 },
  { code: 'MCL', name: 'Mahanadi Coalfields Limited', hq: 'Sambalpur, OD', targetMT: 198.0 },
  { code: 'CMPDI', name: 'Central Mine Planning & Design Inst.', hq: 'Ranchi, JH', targetMT: 0.0 },
];

export const INITIAL_DOCUMENTS: DocumentRecord[] = [
  {
    id: 'doc-ecl-001',
    title: 'Rajmahal OCP Monthly Production & Despatch Return - Aug 2026',
    fileName: 'ECL_Rajmahal_Monthly_Aug2026.pdf',
    category: 'production',
    reportingPeriod: 'August 2026',
    subsidiaryCode: 'ECL',
    collieryName: 'Rajmahal OCP',
    status: 'needs_review',
    ocrConfidence: 88.5,
    uploadedAt: '2026-09-28T09:15:00Z',
    uploadedBy: 'Manoj Kumar Soren (Field Officer)',
    fileSize: '2.4 MB',
    pageCount: 3,
    extractedSummary: 'Daily coal excavation totaled 45,210 tonnes. Overburden stripping reached 142,500 m³ with 3 shovel-dumper spreads.',
    isDemo: true,
    extractedFields: [
      { id: 'f-1', fieldName: 'coal_prod_tonnes', label: 'Coal Production', extractedValue: '45,210', verifiedValue: '45,210', unit: 'Tonnes', confidence: 96, status: 'verified', pageNumber: 1, boundingBox: [45, 120, 210, 145] },
      { id: 'f-2', fieldName: 'ob_removal_m3', label: 'Overburden Removal', extractedValue: '142,500', verifiedValue: '142,500', unit: 'm³', confidence: 94, status: 'verified', pageNumber: 1, boundingBox: [45, 160, 210, 185] },
      { id: 'f-3', fieldName: 'rail_despatch_rakes', label: 'Rail Despatch Rakes', extractedValue: '18', verifiedValue: undefined, unit: 'Rakes', confidence: 76, status: 'flagged_error', pageNumber: 2, boundingBox: [60, 220, 180, 245], notes: 'Handwritten digit blurred in slip column' },
      { id: 'f-4', fieldName: 'avg_ash_percentage', label: 'Average Ash Content', extractedValue: '38.4', verifiedValue: '38.4', unit: '%', confidence: 91, status: 'auto_extracted', pageNumber: 2, boundingBox: [60, 260, 180, 285] },
    ]
  },
  {
    id: 'doc-secl-002',
    title: 'Gevra Mega Project Heavy Excavation Shift Summary',
    fileName: 'SECL_Gevra_ShiftSummary_0926.pdf',
    category: 'production',
    reportingPeriod: 'September 2026',
    subsidiaryCode: 'SECL',
    collieryName: 'Gevra OCP',
    status: 'approved',
    ocrConfidence: 97.2,
    uploadedAt: '2026-09-29T14:30:00Z',
    uploadedBy: 'Rajiv Nambiar (Area Tech)',
    fileSize: '4.1 MB',
    pageCount: 5,
    extractedSummary: 'World-scale surface mining report. Cumulative output exceeds 520,000 MT for the ten-day period with 98.2% conveyor belt uptime.',
    isDemo: true,
    extractedFields: [
      { id: 'f-5', fieldName: 'coal_prod_tonnes', label: 'Coal Production', extractedValue: '524,300', verifiedValue: '524,300', unit: 'Tonnes', confidence: 99, status: 'approved', pageNumber: 1, boundingBox: [50, 130, 220, 155] },
      { id: 'f-6', fieldName: 'ob_removal_m3', label: 'Overburden Removal', extractedValue: '1,120,000', verifiedValue: '1,120,000', unit: 'm³', confidence: 98, status: 'approved', pageNumber: 1, boundingBox: [50, 170, 220, 195] },
      { id: 'f-7', fieldName: 'surface_miner_hours', label: 'Surface Miner Operating Hours', extractedValue: '432', verifiedValue: '432', unit: 'Hours', confidence: 95, status: 'approved', pageNumber: 3, boundingBox: [70, 310, 200, 335] },
    ]
  },
  {
    id: 'doc-bccl-003',
    title: 'Moonidih Underground Washery Yield & Prime Coking Coal Audit',
    fileName: 'BCCL_Moonidih_Washery_Q2.pdf',
    category: 'geological',
    reportingPeriod: 'Q2 FY 2026',
    subsidiaryCode: 'BCCL',
    collieryName: 'Moonidih UG',
    status: 'partially_extracted',
    ocrConfidence: 74.0,
    uploadedAt: '2026-09-30T08:10:00Z',
    uploadedBy: 'Subrata Das (Nodal Cell)',
    fileSize: '1.8 MB',
    pageCount: 2,
    extractedSummary: 'Prime coking coal washery throughput. Low contrast carbon copy caused low OCR confidence on dense moisture tables.',
    isDemo: true,
    extractedFields: [
      { id: 'f-8', fieldName: 'raw_coal_feed', label: 'Raw Coal Feed', extractedValue: '28,400', verifiedValue: undefined, unit: 'Tonnes', confidence: 72, status: 'auto_extracted', pageNumber: 1, boundingBox: [40, 110, 190, 135] },
      { id: 'f-9', fieldName: 'clean_coking_yield', label: 'Clean Coal Yield %', extractedValue: '48.2', verifiedValue: undefined, unit: '%', confidence: 68, status: 'flagged_error', pageNumber: 1, boundingBox: [40, 150, 190, 175], notes: 'Decimals smudged; human re-verification required' },
      { id: 'f-10', fieldName: 'middlings_tonnes', label: 'Middlings Production', extractedValue: '8,950', verifiedValue: undefined, unit: 'Tonnes', confidence: 82, status: 'auto_extracted', pageNumber: 2, boundingBox: [55, 210, 195, 235] },
    ]
  },
  {
    id: 'doc-ncl-004',
    title: 'Jayant OCP Dragline Productivity & HEMM Uptime Return',
    fileName: 'NCL_Jayant_HEMM_Sep2026.pdf',
    category: 'production',
    reportingPeriod: 'September 2026',
    subsidiaryCode: 'NCL',
    collieryName: 'Jayant OCP',
    status: 'ready_to_search',
    ocrConfidence: 99.1,
    uploadedAt: '2026-09-27T16:00:00Z',
    uploadedBy: 'NCL ICT Automation Gateway',
    fileSize: '3.6 MB',
    pageCount: 4,
    extractedSummary: 'Dragline 24/96 operated at 89.4% operational efficiency. Dragline cycle time averaged 62 seconds per pass.',
    isDemo: true,
    extractedFields: [
      { id: 'f-11', fieldName: 'dragline_ob_m3', label: 'Dragline Excavation', extractedValue: '348,000', verifiedValue: '348,000', unit: 'm³', confidence: 99, status: 'approved', pageNumber: 2, boundingBox: [50, 140, 210, 165] },
      { id: 'f-12', fieldName: 'hemm_availability', label: 'HEMM Fleet Availability', extractedValue: '91.8', verifiedValue: '91.8', unit: '%', confidence: 99, status: 'approved', pageNumber: 2, boundingBox: [50, 180, 210, 205] },
    ]
  },
  {
    id: 'doc-ccl-005',
    title: 'Piparwar Open Cast Beneficiation & Despatch Return',
    fileName: 'CCL_Piparwar_Despatch_Aug2026.pdf',
    category: 'despatch',
    reportingPeriod: 'August 2026',
    subsidiaryCode: 'CCL',
    collieryName: 'Piparwar OCP',
    status: 'ready_to_search',
    ocrConfidence: 94.6,
    uploadedAt: '2026-09-25T11:45:00Z',
    uploadedBy: 'Anand Tirkey (Area Despatch)',
    fileSize: '2.1 MB',
    pageCount: 3,
    extractedSummary: 'Beneficiated coal rakes despatched to Dadri & Rihand STPS via Tori-Shivpur rail line. Zero demurrage recorded.',
    isDemo: true,
    extractedFields: [
      { id: 'f-13', fieldName: 'beneficiated_despatch', label: 'Washed Coal Despatch', extractedValue: '82,100', verifiedValue: '82,100', unit: 'Tonnes', confidence: 95, status: 'approved', pageNumber: 1, boundingBox: [45, 125, 205, 150] },
      { id: 'f-14', fieldName: 'loaded_rakes', label: 'Loaded Railway Rakes', extractedValue: '21', verifiedValue: '21', unit: 'Rakes', confidence: 94, status: 'approved', pageNumber: 1, boundingBox: [45, 165, 205, 190] },
    ]
  },
];

export const INITIAL_MANUAL_RECORDS: ManualRecord[] = [
  {
    id: 'man-001',
    title: 'Rajmahal OCP Shift-B Manual Excavation & Stripping Return',
    category: 'production',
    reportingPeriod: 'August 2026',
    subsidiaryCode: 'ECL',
    collieryName: 'Rajmahal OCP',
    sourceDate: '2026-08-31',
    sourceExplanation: 'Colliery shift in-charge logbook #44/B signed by Shift Supdt.',
    status: 'submitted',
    authorName: 'Manoj Kumar Soren',
    authorRole: 'Field / Mine Data Officer',
    createdAt: '2026-08-31T20:30:00Z',
    isDemo: true,
    fields: [
      { id: 'mf-1', fieldName: 'Raw Coal Production (Tonnes)', value: '14,850', unit: 'Tonnes', sourceNote: 'Weighbridge slip series E-992' },
      { id: 'mf-2', fieldName: 'Overburden Stripping (m³)', value: '48,200', unit: 'm³', sourceNote: 'Surveyor bench cross-section tally' },
      { id: 'mf-3', fieldName: 'Dumper Trips', value: '312', unit: 'Trips', sourceNote: 'Dispatch slip booth 2' },
      { id: 'mf-4', fieldName: 'Shovel Operating Hours', value: '19.5', unit: 'Hours', sourceNote: 'Machine #CK300 meter' },
    ]
  },
  {
    id: 'man-002',
    title: 'Gevra OCP Conveyor Maintenance & Pit Sump Water Level Log',
    category: 'safety',
    reportingPeriod: 'September 2026',
    subsidiaryCode: 'SECL',
    collieryName: 'Gevra OCP',
    sourceDate: '2026-09-28',
    sourceExplanation: 'Internal safety organization daily checklist',
    status: 'accepted',
    authorName: 'Rajiv Nambiar',
    authorRole: 'Area Tech Engineer',
    createdAt: '2026-09-28T18:00:00Z',
    isDemo: true,
    fields: [
      { id: 'mf-5', fieldName: 'Conveyor Uptime', value: '98.2', unit: '%', sourceNote: 'PLC automated telemetry' },
      { id: 'mf-6', fieldName: 'Pit Sump Pumping Volume', value: '18,500', unit: 'm³', sourceNote: 'Pump discharge meter #4' },
      { id: 'mf-7', fieldName: 'Safety Violations Detected', value: '0', unit: 'Incidents', sourceNote: 'Shift safety patrol report' },
    ]
  },
  {
    id: 'man-003',
    title: 'Moonidih UG Seam-XVI Coking Coal Proximate Analysis',
    category: 'geological',
    reportingPeriod: 'Q2 FY 2026',
    subsidiaryCode: 'BCCL',
    collieryName: 'Moonidih UG',
    sourceDate: '2026-09-29',
    sourceExplanation: 'CMPDI Regional Lab Chemical Assay Sheet #CMPDI/RN/2026/89',
    status: 'under_review',
    authorName: 'Dr. Ananya Mukherjee',
    authorRole: 'CMPDI Nodal Expert',
    createdAt: '2026-09-29T11:00:00Z',
    isDemo: true,
    fields: [
      { id: 'mf-8', fieldName: 'Average Ash Content', value: '17.2', unit: '%', sourceNote: 'Dry mineral matter basis' },
      { id: 'mf-9', fieldName: 'Volatile Matter', value: '24.8', unit: '%', sourceNote: 'Proximate test batch B-12' },
      { id: 'mf-10', fieldName: 'Moisture Percentage', value: '1.4', unit: '%', sourceNote: 'Standard air-dry protocol' },
    ]
  }
];

export const INITIAL_INFORMATION_REQUESTS: InformationRequest[] = [
  {
    id: 'req-001',
    requestNumber: 'MOC/REQ/2026/084',
    subject: 'Quarterly HEMM Utilization and Monsoon Pumping Availability in Rajmahal Area',
    description: 'Provide certified equipment utilization rates for 20m³ shovels, draglines, and bench dewatering pump capacity during peak August rainfall.',
    requestingOrg: 'Ministry of Coal',
    requestingPersona: 'Dr. Rajeshwar Sharma, IAS',
    recipientOrg: 'Eastern Coalfields Limited',
    recipientPersona: 'Manoj Kumar Soren (Rajmahal OCP)',
    reportingPeriod: 'August 2026',
    requestedFields: ['Coal Production (Tonnes)', 'Overburden Stripping (m³)', 'Pumping Availability %', 'Rail Rakes'],
    dueDate: '2026-10-15T18:00:00Z',
    status: 'awaiting_response',
    lastUpdate: '2026-10-02T10:00:00Z',
    isDemo: true,
  },
  {
    id: 'req-002',
    requestNumber: 'CIL/HQ/2026/192',
    subject: 'Gevra Mega Project Heavy Excavator Deployment & Road Dispatch Tally',
    description: 'Reconcile road despatch vs silo rail dispatches following heavy rain inundation at North Sump.',
    requestingOrg: 'Coal India Headquarters',
    requestingPersona: 'Er. S. N. Bhattacharya (CIL HQ)',
    recipientOrg: 'South Eastern Coalfields Limited',
    recipientPersona: 'Area General Manager, Bilaspur',
    reportingPeriod: 'September 2026',
    requestedFields: ['Daily Rail Despatch', 'Road Despatch MT', 'Conveyor Belt Hours'],
    dueDate: '2026-10-10T12:00:00Z',
    status: 'submitted',
    lastUpdate: '2026-10-03T14:20:00Z',
    responseText: 'All data points compiled. Conveyor belt uptime maintained at 98.2% with zero demurrage on railway sidings.',
    attachedDocumentIds: ['doc-secl-002'],
    isDemo: true,
  },
  {
    id: 'req-003',
    requestNumber: 'CMPDI/REV/2026/012',
    subject: 'Moonidih Underground Washery Yield Re-Verification',
    description: 'Verify clean coking yield percentage on carbon copy slips where decimals were blurred in initial OCR scan.',
    requestingOrg: 'CMPDI',
    requestingPersona: 'Dr. Ananya Mukherjee (CMPDI)',
    recipientOrg: 'Bharat Coking Coal Limited',
    recipientPersona: 'Moonidih Colliery Office',
    reportingPeriod: 'Q2 FY 2026',
    requestedFields: ['Clean Coking Yield %', 'Middlings Tonnes', 'Moisture %'],
    dueDate: '2026-10-08T18:00:00Z',
    status: 'clarification_required',
    lastUpdate: '2026-10-01T09:30:00Z',
    clarificationNotes: ['Original carbon copy slip #14 has blurry handwriting in clean coal yield column. Requesting clear scan.'],
    attachedDocumentIds: ['doc-bccl-003'],
    isDemo: true,
  }
];

export const INITIAL_REPORTS: ReportDraft[] = [
  {
    id: 'rep-001',
    title: 'Quarterly Executive Operational Review (Q2 FY 2026)',
    reportType: 'Quarterly Executive Operational Review',
    reportingPeriod: 'July 1, 2026 – September 30, 2026',
    scope: 'Multi-Subsidiary Consolidated',
    selectedSubsidiaries: ['SECL', 'ECL', 'NCL', 'BCCL', 'CCL'],
    comparisonBasis: 'Year-on-Year vs Prorated Target',
    executiveSummary: 'During the second quarter of FY 2026, aggregate coal production across monitored Coal India subsidiaries maintained positive pacing at 98.4% of prorated targets. In particular, surface miner throughput at SECL (Gevra OCP) and mechanized dragline operations at NCL (Jayant OCP) demonstrated operational availability above 91%. In contrast, monsoon bench inundation at ECL (Rajmahal OCP) created localized despatch variances mitigated through FMC silo rail connectivity.',
    metricsTable: [
      { subsidiary: 'SECL', mine: 'Gevra Mega OCP', coalTonnes: '524,300', obM3: '1,120,000', status: 'Approved', confidence: '99%' },
      { subsidiary: 'ECL', mine: 'Rajmahal OCP', coalTonnes: '45,210', obM3: '142,500', status: 'Verified', confidence: '94%' },
      { subsidiary: 'NCL', mine: 'Jayant OCP', coalTonnes: '348,000', obM3: '890,000', status: 'Approved', confidence: '99%' },
      { subsidiary: 'BCCL', mine: 'Moonidih UG', coalTonnes: '28,400', obM3: 'N/A (Washery)', status: 'Needs Review', confidence: '74%' },
      { subsidiary: 'CCL', mine: 'Piparwar OCP', coalTonnes: '82,100', obM3: '210,000', status: 'Approved', confidence: '94%' },
    ],
    sources: [
      'SECL_Gevra_ShiftSummary_0926.pdf (Page 1)',
      'ECL_Rajmahal_Monthly_Aug2026.pdf (Pages 1-2)',
      'NCL_Jayant_HEMM_Sep2026.pdf (Page 2)',
      'CCL_Piparwar_Despatch_Aug2026.pdf (Page 1)'
    ],
    draftStatus: 'reviewed',
    generatedAt: '2026-10-04T12:00:00Z',
    author: 'Dr. Rajeshwar Sharma, IAS (Ministry of Coal)',
    outputFormats: ['pdf', 'docx', 'xlsx'],
    isDemo: true,
  },
  {
    id: 'rep-002',
    title: 'ECL Rajmahal Area Monthly Despatch & Rail Wagon Pacing',
    reportType: 'Monthly Despatch Brief',
    reportingPeriod: 'August 2026',
    scope: 'Subsidiary-Wise (ECL)',
    selectedSubsidiaries: ['ECL'],
    comparisonBasis: 'Previous Month Trend',
    executiveSummary: 'Rajmahal Open Cast Project completed 18 loaded rakes towards Farakka and Kahalgaon Super Thermal Power Stations. Surface moisture remained within statutory limits at 38.4% average ash content.',
    metricsTable: [
      { subsidiary: 'ECL', mine: 'Rajmahal OCP', coalTonnes: '45,210', obM3: '142,500', status: 'Verified', confidence: '94%' },
    ],
    sources: ['ECL_Rajmahal_Monthly_Aug2026.pdf (Page 1)'],
    draftStatus: 'draft',
    generatedAt: '2026-10-02T16:00:00Z',
    author: 'Manoj Kumar Soren (Field Officer)',
    outputFormats: ['pdf', 'xlsx'],
    isDemo: true,
  }
];

export const TOPIC_CLUSTERS: TopicCluster[] = [
  {
    id: 'top-1',
    name: 'Monsoon Inundation & Sump Water Management',
    weight: 92,
    frequency: 44,
    sentiment: 'urgent',
    category: 'Water Drainage',
    subsidiaryBreakdown: { ECL: 22, SECL: 8, CCL: 10, BCCL: 4 },
    sampleExcerpts: [
      'Excessive rain in bench 3 required additional 1000 GPM submersible pump deployment at Rajmahal.',
      'Sump water level approached statutory high-water mark; haul road diverted to southern ramp.',
      'Monsoon drainage protocol engaged with 24-hour continuous pumping.'
    ]
  },
  {
    id: 'top-2',
    name: 'HEMM Availability & Shovel-Dumper Availability',
    weight: 86,
    frequency: 38,
    sentiment: 'neutral',
    category: 'Equipment Maintenance',
    subsidiaryBreakdown: { SECL: 16, NCL: 14, ECL: 8 },
    sampleExcerpts: [
      'Shovel #CK300 hydraulic seal replaced during scheduled shift change.',
      'Dragline 24/96 operated at 89.4% operational availability throughout second fortnight.',
      'Surface miner cutting drum maintenance completed ahead of schedule at Gevra.'
    ]
  },
  {
    id: 'top-3',
    name: 'Rail Rake Allocation & FMC Silo Loading',
    weight: 78,
    frequency: 31,
    sentiment: 'positive',
    category: 'Logistics',
    subsidiaryBreakdown: { CCL: 14, ECL: 9, SECL: 8 },
    sampleExcerpts: [
      'First Mile Connectivity (FMC) rapid loading system loaded 6 BOXN rakes under 45 minutes.',
      'Zero demurrage incurred for thermal power utility dispatches.',
      'Tori-Shivpur railway corridor enabled smooth evacuation from North Karanpura.'
    ]
  },
  {
    id: 'top-4',
    name: 'Washery Yield & Beneficiation Ash Reduction',
    weight: 65,
    frequency: 24,
    sentiment: 'urgent',
    category: 'Coal Quality',
    subsidiaryBreakdown: { BCCL: 18, CCL: 6 },
    sampleExcerpts: [
      'Dense media cyclone pressure adjusted to increase clean coal yield above 48%.',
      'High moisture in feed coal reduced throughput by 6% during continuous rain spells.',
      'Prime coking coal ash content maintained within 17.5% specification.'
    ]
  },
  {
    id: 'top-5',
    name: 'Statutory Safety Inspections & DGMS Compliance',
    weight: 54,
    frequency: 19,
    sentiment: 'positive',
    category: 'Safety Compliance',
    subsidiaryBreakdown: { SECL: 8, NCL: 6, ECL: 5 },
    sampleExcerpts: [
      'Internal safety organization inspection verified bench slope stability sensors.',
      'Night-shift illumination audit across highwall faces confirmed DGMS standards compliance.',
      'Dust suppression mist cannons operated continuously along main haulage roads.'
    ]
  }
];

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    title: 'New Information Request Assigned',
    message: 'Ministry of Coal requested certified HEMM utilization and monsoon data for Rajmahal OCP.',
    timestamp: '2026-10-02T10:00:00Z',
    read: false,
    type: 'request',
    linkRoute: '/requests'
  },
  {
    id: 'notif-2',
    title: 'OCR Extraction Ready for Verification',
    message: 'Rajmahal OCP Monthly Return (ECL_Rajmahal_Monthly_Aug2026.pdf) awaits human verification.',
    timestamp: '2026-09-28T09:20:00Z',
    read: false,
    type: 'document',
    linkRoute: '/documents/verify'
  },
  {
    id: 'notif-3',
    title: 'Submission Accepted for Next Stage',
    message: 'Gevra Mega Project Heavy Excavation Shift Summary was approved by CIL HQ Review Desk.',
    timestamp: '2026-09-29T16:00:00Z',
    read: true,
    type: 'review',
    linkRoute: '/review'
  }
];

export const INITIAL_AUDIT_LOGS: AuditEvent[] = [
  {
    id: 'aud-001',
    timestamp: '2026-10-04T08:30:00Z',
    actorName: 'Dr. Rajeshwar Sharma, IAS',
    actorRole: 'ministry_coal',
    action: 'report.generate',
    entityType: 'report',
    entityId: 'rep-001',
    result: 'success',
    metadata: { scope: 'Multi-subsidiary', format: 'PDF/Word/Excel' }
  },
  {
    id: 'aud-002',
    timestamp: '2026-10-03T14:20:00Z',
    actorName: 'Er. S. N. Bhattacharya',
    actorRole: 'cil_hq',
    action: 'submission.accept',
    entityType: 'document',
    entityId: 'doc-secl-002',
    result: 'success',
    metadata: { subsidiary: 'SECL', verifiedProduction: '524,300 T' }
  },
  {
    id: 'aud-003',
    timestamp: '2026-10-02T11:15:00Z',
    actorName: 'Dr. Ananya Mukherjee',
    actorRole: 'cmpdi',
    action: 'ocr.verify_field',
    entityType: 'extracted_field',
    entityId: 'f-1',
    result: 'success',
    metadata: { field: 'coal_prod_tonnes', oldValue: '45,210', newValue: '45,210' }
  },
  {
    id: 'aud-004',
    timestamp: '2026-10-01T09:00:00Z',
    actorName: 'Manoj Kumar Soren',
    actorRole: 'subsidiary_officer',
    action: 'manual_record.submit',
    entityType: 'manual_record',
    entityId: 'man-001',
    result: 'success',
    metadata: { category: 'production', rowsCount: 4 }
  },
  {
    id: 'aud-005',
    timestamp: '2026-09-30T16:45:00Z',
    actorName: 'Dr. Rajeshwar Sharma, IAS',
    actorRole: 'ministry_coal',
    action: 'request.create',
    entityType: 'information_request',
    entityId: 'req-001',
    result: 'success',
    metadata: { target: 'ECL', subject: 'HEMM Utilization' }
  }
];
