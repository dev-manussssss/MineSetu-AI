import type { DocumentRecord, ParliamentaryQuery, TopicCluster, AuditEvent } from '../types';

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
    subsidiaryCode: 'ECL',
    collieryName: 'Rajmahal OCP',
    status: 'needs_review',
    ocrConfidence: 88.5,
    uploadedAt: '2026-09-28T09:15:00Z',
    uploadedBy: 'Manoj Kumar Soren (Field Officer)',
    fileSize: '2.4 MB',
    pageCount: 3,
    extractedSummary: 'Daily coal excavation totaled 45,210 tonnes. Overburden stripping reached 142,500 m3 with 3 shovel-dumper spreads.',
    isDemo: true,
    extractedFields: [
      { id: 'f-1', fieldName: 'coal_prod_tonnes', label: 'Coal Production', extractedValue: '45,210', verifiedValue: '45,210', unit: 'Tonnes', confidence: 96, status: 'verified', pageNumber: 1 },
      { id: 'f-2', fieldName: 'ob_removal_m3', label: 'Overburden Removal', extractedValue: '142,500', verifiedValue: '142,500', unit: 'm³', confidence: 94, status: 'verified', pageNumber: 1 },
      { id: 'f-3', fieldName: 'rail_despatch_rakes', label: 'Rail Despatch Rakes', extractedValue: '18', verifiedValue: undefined, unit: 'Rakes', confidence: 76, status: 'flagged_error', pageNumber: 2, notes: 'Handwritten digit blurred in slip column' },
      { id: 'f-4', fieldName: 'avg_ash_percentage', label: 'Average Ash Content', extractedValue: '38.4', verifiedValue: '38.4', unit: '%', confidence: 91, status: 'auto_extracted', pageNumber: 2 },
    ]
  },
  {
    id: 'doc-secl-002',
    title: 'Gevra Mega Project Heavy Excavation Shift Summary',
    fileName: 'SECL_Gevra_ShiftSummary_0926.pdf',
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
      { id: 'f-5', fieldName: 'coal_prod_tonnes', label: 'Coal Production', extractedValue: '524,300', verifiedValue: '524,300', unit: 'Tonnes', confidence: 99, status: 'approved', pageNumber: 1 },
      { id: 'f-6', fieldName: 'ob_removal_m3', label: 'Overburden Removal', extractedValue: '1,120,000', verifiedValue: '1,120,000', unit: 'm³', confidence: 98, status: 'approved', pageNumber: 1 },
      { id: 'f-7', fieldName: 'surface_miner_hours', label: 'Surface Miner Operating Hours', extractedValue: '432', verifiedValue: '432', unit: 'Hours', confidence: 95, status: 'approved', pageNumber: 3 },
    ]
  },
  {
    id: 'doc-bccl-003',
    title: 'Moonidih Underground Washery Yield & Prime Coking Coal Audit',
    fileName: 'BCCL_Moonidih_Washery_Q2.pdf',
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
      { id: 'f-8', fieldName: 'raw_coal_feed', label: 'Raw Coal Feed', extractedValue: '28,400', verifiedValue: undefined, unit: 'Tonnes', confidence: 72, status: 'auto_extracted', pageNumber: 1 },
      { id: 'f-9', fieldName: 'clean_coking_yield', label: 'Clean Coal Yield %', extractedValue: '48.2', verifiedValue: undefined, unit: '%', confidence: 68, status: 'flagged_error', pageNumber: 1, notes: 'Decimals smudged; human re-verification required' },
      { id: 'f-10', fieldName: 'middlings_tonnes', label: 'Middlings Production', extractedValue: '8,950', verifiedValue: undefined, unit: 'Tonnes', confidence: 82, status: 'auto_extracted', pageNumber: 2 },
    ]
  },
  {
    id: 'doc-ncl-004',
    title: 'Jayant OCP Dragline Productivity & HEMM Uptime Return',
    fileName: 'NCL_Jayant_HEMM_Sep2026.pdf',
    subsidiaryCode: 'NCL',
    collieryName: 'Jayant OCP',
    status: 'approved',
    ocrConfidence: 99.1,
    uploadedAt: '2026-09-27T16:00:00Z',
    uploadedBy: 'NCL ICT Automation Gateway',
    fileSize: '3.6 MB',
    pageCount: 4,
    extractedSummary: 'Dragline 24/96 operated at 89.4% operational efficiency. Dragline cycle time averaged 62 seconds per pass.',
    isDemo: true,
    extractedFields: [
      { id: 'f-11', fieldName: 'dragline_ob_m3', label: 'Dragline Excavation', extractedValue: '348,000', verifiedValue: '348,000', unit: 'm³', confidence: 99, status: 'approved', pageNumber: 2 },
      { id: 'f-12', fieldName: 'hemm_availability', label: 'HEMM Fleet Availability', extractedValue: '91.8', verifiedValue: '91.8', unit: '%', confidence: 99, status: 'approved', pageNumber: 2 },
    ]
  },
  {
    id: 'doc-ccl-005',
    title: 'Piparwar Open Cast Beneficiation & Despatch Return',
    fileName: 'CCL_Piparwar_Despatch_Aug2026.pdf',
    subsidiaryCode: 'CCL',
    collieryName: 'Piparwar OCP',
    status: 'completed',
    ocrConfidence: 92.4,
    uploadedAt: '2026-09-29T11:20:00Z',
    uploadedBy: 'Sunil Toppo (Field)',
    fileSize: '2.1 MB',
    pageCount: 2,
    extractedSummary: 'In-pit crushing and conveying system despatch log to NTPC Dadri power plant.',
    isDemo: true,
    extractedFields: [
      { id: 'f-13', fieldName: 'coal_despatch_power', label: 'Coal Despatch (Power Sector)', extractedValue: '82,100', verifiedValue: '82,100', unit: 'Tonnes', confidence: 94, status: 'verified', pageNumber: 1 },
      { id: 'f-14', fieldName: 'gross_cv_kcal', label: 'Gross Calorific Value (GCV)', extractedValue: '3,850', verifiedValue: '3,850', unit: 'kcal/kg', confidence: 91, status: 'verified', pageNumber: 1 },
    ]
  }
];

export const INITIAL_PARLIAMENTARY_QUERIES: ParliamentaryQuery[] = [
  {
    id: 'pq-ls-402',
    queryNumber: 'LS-STARRED-402',
    house: 'Lok Sabha',
    session: 'Monsoon Session 2026',
    questionText: 'Will the Minister of Coal be pleased to state: (a) the coal production targets versus actual achievement across SECL and MCL open cast mines; (b) the safety audit compliance score for mechanized HEMM deployment?',
    category: 'Production & Safety Compliance',
    workflowStatus: 'ai_draft_ready',
    submissionDeadline: '2026-10-06',
    assignedToName: 'Sunita Meena (Parliamentary Cell)',
    isDemo: true,
    aiDraft: `Madam Speaker,\n\n(a) During the current fiscal period, SECL achieved 142.8 MT against a prorated target of 145.0 MT (98.5% achievement), and MCL recorded 158.4 MT against a target of 155.0 MT (102.2% achievement), driven by high surface miner availability at Gevra and Bhubaneswari OCPs.\n\n(b) Regular safety audits conducted under DGMS and Internal Safety Organisation (ISO) standards established a fleet compliance score of 96.8% across mega opencast projects, with continuous biometric shift logging and slope-stability radar monitoring deployed.`,
    groundedSources: [
      {
        documentId: 'doc-secl-002',
        documentTitle: 'Gevra Mega Project Heavy Excavation Shift Summary',
        subsidiary: 'SECL',
        pageNumber: 1,
        excerpt: 'Cumulative output exceeds 520,000 MT for the ten-day period with 98.2% conveyor uptime.',
        verifiedStatus: 'approved'
      },
      {
        documentId: 'doc-ncl-004',
        documentTitle: 'Jayant OCP Dragline Productivity & HEMM Uptime Return',
        subsidiary: 'NCL',
        pageNumber: 2,
        excerpt: 'HEMM Fleet Availability logged at 91.8% with zero major lost-time incidents.',
        verifiedStatus: 'approved'
      }
    ]
  },
  {
    id: 'pq-rs-119',
    queryNumber: 'RS-UNSTARRED-119',
    house: 'Rajya Sabha',
    session: 'Monsoon Session 2026',
    questionText: 'Whether Coal India has identified specific bottleneck areas in coal evacuation via railway rakes from ECL and BCCL mines; if so, details thereof?',
    category: 'Logistics & Infrastructure',
    workflowStatus: 'under_review',
    submissionDeadline: '2026-10-08',
    assignedToName: 'Sunita Meena (Parliamentary Cell)',
    isDemo: true,
    aiDraft: `Sir,\n\n(a) & (b) In ECL and BCCL command areas, rail connectivity enhancements under First Mile Connectivity (FMC) projects are progressing rapidly. At Rajmahal OCP, 18 rakes per day were loaded in August 2026 against a targeted requirement of 20 rakes. Critical railway siding augmentation at Moonidih and Sonnagar-Dankuni section works are actively coordinated with the Ministry of Railways to alleviate regional evacuation constraints.`,
    groundedSources: [
      {
        documentId: 'doc-ecl-001',
        documentTitle: 'Rajmahal OCP Monthly Production & Despatch Return - Aug 2026',
        subsidiary: 'ECL',
        pageNumber: 2,
        excerpt: 'Rail Despatch Rakes: 18 rakes loaded during the period; siding congestion logged on Aug 14.',
        verifiedStatus: 'verified'
      }
    ]
  },
  {
    id: 'pq-ls-845',
    queryNumber: 'LS-UNSTARRED-845',
    house: 'Lok Sabha',
    session: 'Monsoon Session 2026',
    questionText: 'Steps taken to prevent spontaneous heating and environmental compliance in opencast overburden dumps?',
    category: 'Environment & Mine Fire',
    workflowStatus: 'approved',
    submissionDeadline: '2026-09-25',
    assignedToName: 'Sunita Meena (Parliamentary Cell)',
    approvedByName: 'Dr. Rajeshwar Sharma, IAS (Joint Secretary)',
    isDemo: true,
    approvedResponse: `Madam Speaker,\n\nCoal India subsidiaries strictly enforce the guidelines formulated by DGMS and CMPDI for OB dump slope stability and spontaneous combustion prevention. Extensive blanket cover layering with inert material, chemical crusting sprays, and continuous thermal drone imaging have been adopted at major overburden dumps in BCCL and ECL.`,
    groundedSources: [
      {
        documentId: 'doc-ecl-001',
        documentTitle: 'Rajmahal OCP Monthly Production & Despatch Return - Aug 2026',
        subsidiary: 'ECL',
        pageNumber: 3,
        excerpt: 'Dump slope thermal scans showed zero active hotspots; bio-reclamation on Bench 4 completed.',
        verifiedStatus: 'approved'
      }
    ]
  }
];

export const TOPIC_CLUSTERS: TopicCluster[] = [
  {
    id: 'topic-1',
    name: 'Overburden Removal',
    weight: 95,
    frequency: 384,
    sentiment: 'neutral',
    subsidiaryBreakdown: { ECL: 45, SECL: 110, NCL: 92, MCL: 85, CCL: 52 },
    sampleExcerpts: [
      'Heavy monsoon runoff required temporary bench diversion at Rajmahal OCP.',
      'Shovel #14 reached 320 m3/hr stripping rate in hard sandstone formation.',
      'Overburden dump stability verified by CMPDI slope monitoring radar.'
    ]
  },
  {
    id: 'topic-2',
    name: 'Railway Rake Logistics',
    weight: 88,
    frequency: 295,
    sentiment: 'urgent',
    subsidiaryBreakdown: { ECL: 62, BCCL: 74, SECL: 80, MCL: 79 },
    sampleExcerpts: [
      'Siding 4 faced shunting locomotive delay of 2.5 hours on Wednesday night shift.',
      'First Mile Connectivity (FMC) silo automated chute loaded BOXN rakes in 54 minutes.',
      'Thermal power plant indent allocation received for 14 daily rakes from Gevra.'
    ]
  },
  {
    id: 'topic-3',
    name: 'DGMS Safety Compliance',
    weight: 80,
    frequency: 240,
    sentiment: 'neutral',
    subsidiaryBreakdown: { BCCL: 55, SECL: 65, NCL: 40, WCL: 48, ECL: 32 },
    sampleExcerpts: [
      'Statutory inspection of continuous miner safety interlocks completed without infractions.',
      'Slope stability radar alarm test passed at Jayant OCP Bench 3.',
      'Audio-visual alarm (AVA) retrofitting on all 100-tonne haul dumpers completed.'
    ]
  },
  {
    id: 'topic-4',
    name: 'Surface Miner Productivity',
    weight: 75,
    frequency: 215,
    sentiment: 'positive',
    subsidiaryBreakdown: { MCL: 98, SECL: 82, NCL: 35 },
    sampleExcerpts: [
      'Elimination of blasting near village perimeter through 2.5m drum surface miner.',
      'Clean coal sizing achieved at -100mm directly onto field conveyor belts.',
      'Pick consumption reduced by 14% after switching to tungsten carbide tooling.'
    ]
  },
  {
    id: 'topic-5',
    name: 'Environmental Clearance',
    weight: 70,
    frequency: 182,
    sentiment: 'neutral',
    subsidiaryBreakdown: { WCL: 42, CCL: 56, ECL: 44, SECL: 40 },
    sampleExcerpts: [
      'MoEF&CC public hearing minutes submitted for Area Expansion Phase II.',
      'Ambient air quality PM10 and PM2.5 monitoring stations within CPCB limits.',
      'Effluent treatment plant (ETP) zero liquid discharge achieved at Moonidih washery.'
    ]
  },
  {
    id: 'topic-6',
    name: 'Heavy Earth Moving (HEMM)',
    weight: 65,
    frequency: 165,
    sentiment: 'urgent',
    subsidiaryBreakdown: { NCL: 52, SECL: 48, CCL: 35, BCCL: 30 },
    sampleExcerpts: [
      'Hydraulic hose failure on Excavator EX-2001 caused 4 hours unscheduled downtime.',
      'Preventive tire rotation protocol extended dumper radial tire lifespan by 1,200 hours.'
    ]
  },
  {
    id: 'topic-7',
    name: 'Washery Coking Yield',
    weight: 60,
    frequency: 120,
    sentiment: 'urgent',
    subsidiaryBreakdown: { BCCL: 85, CCL: 35 },
    sampleExcerpts: [
      'Dense media cyclone pressure drop adjusted to optimize clean coal ash at 17.5%.',
      'Steel plant off-take quality certified by third party sampling agency.'
    ]
  },
  {
    id: 'topic-8',
    name: 'Borehole Lithology Logs',
    weight: 55,
    frequency: 98,
    sentiment: 'positive',
    subsidiaryBreakdown: { CMPDI: 98 },
    sampleExcerpts: [
      'Core drilling intersected Seam IV at 184 meters depth with 6.2m clean thickness.',
      'Geophysical logging confirmed floor sandstone compressive strength.'
    ]
  }
];

export const INITIAL_AUDIT_LOGS: AuditEvent[] = [
  {
    id: 'audit-001',
    timestamp: '2026-09-30T10:14:22Z',
    actorName: 'Manoj Kumar Soren',
    actorRole: 'field_officer',
    action: 'documents.upload',
    entityType: 'document',
    entityId: 'doc-ecl-001',
    result: 'success',
    metadata: { filename: 'ECL_Rajmahal_Monthly_Aug2026.pdf', size: '2.4 MB' }
  },
  {
    id: 'audit-002',
    timestamp: '2026-09-30T10:18:05Z',
    actorName: 'Manoj Kumar Soren',
    actorRole: 'field_officer',
    action: 'documents.verify',
    entityType: 'extracted_record',
    entityId: 'f-1',
    result: 'success',
    metadata: { field: 'coal_prod_tonnes', verifiedValue: '45,210' }
  },
  {
    id: 'audit-003',
    timestamp: '2026-09-30T11:05:40Z',
    actorName: 'Dr. Ananya Mukherjee',
    actorRole: 'cmpdi_nodal',
    action: 'documents.approve',
    entityType: 'document',
    entityId: 'doc-secl-002',
    result: 'success',
    metadata: { status: 'approved', previousStatus: 'needs_review' }
  },
  {
    id: 'audit-004',
    timestamp: '2026-09-30T11:32:11Z',
    actorName: 'Sunita Meena',
    actorRole: 'parliamentary_cell',
    action: 'parliamentary.draft',
    entityType: 'parliamentary_query',
    entityId: 'pq-ls-402',
    result: 'success',
    metadata: { mode: 'ai_assisted_draft', sourcesCount: 2 }
  }
];
