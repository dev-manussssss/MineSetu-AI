/**
 * Promptfoo Custom Provider for MineSetu RAG Engine
 */
import { resolveEntitiesFromPrompt, synthesizeAnswerFromRecords } from '../frontend/src/lib/conversationService.ts';

// Deterministic test fixture records
const FIXTURE_DOCS = [
  {
    id: 'doc-ecl-001',
    title: 'Rajmahal OCP Monthly Production & Despatch Return - Aug 2026',
    subsidiaryCode: 'ECL',
    collieryName: 'Rajmahal OCP',
    reportingPeriod: 'August 2026',
    status: 'verified',
    extractedSummary: 'Daily coal excavation totaled 45,210 tonnes. Overburden stripping reached 142,500 m³ with 3 shovel-dumper spreads.',
    extractedFields: [
      { id: 'f-1', fieldName: 'coal_prod_tonnes', label: 'Coal Production', extractedValue: '45,210', verifiedValue: '45,210', unit: 'Tonnes', confidence: 96, status: 'verified', pageNumber: 1 },
      { id: 'f-2', fieldName: 'ob_removal_m3', label: 'Overburden Removal', extractedValue: '142,500', verifiedValue: '142,500', unit: 'm³', confidence: 94, status: 'verified', pageNumber: 1 }
    ]
  },
  {
    id: 'doc-secl-002',
    title: 'Gevra Mega Project Heavy Excavation Shift Summary',
    subsidiaryCode: 'SECL',
    collieryName: 'Gevra OCP',
    reportingPeriod: 'September 2026',
    status: 'approved',
    extractedSummary: 'Cumulative output exceeds 520,000 MT for the ten-day period with 98.2% conveyor belt uptime.',
    extractedFields: [
      { id: 'f-5', fieldName: 'coal_prod_tonnes', label: 'Coal Production', extractedValue: '524,300', verifiedValue: '524,300', unit: 'Tonnes', confidence: 99, status: 'approved', pageNumber: 1 },
      { id: 'f-6', fieldName: 'ob_removal_m3', label: 'Overburden Removal', extractedValue: '1,120,000', verifiedValue: '1,120,000', unit: 'm³', confidence: 98, status: 'approved', pageNumber: 1 }
    ]
  }
];

class MineSetuRagProvider {
  constructor(options = {}) {
    this.providerId = options.id || 'minesetu-rag-engine';
    this.config = options.config || {};
  }

  id() {
    return this.providerId;
  }

  async callApi(prompt, context) {
    const activeCtx = context?.vars?.activeContext || {
      subsidiaries: [],
      reportingYear: 2026
    };

    const resolution = resolveEntitiesFromPrompt(prompt, activeCtx);
    const synthesis = synthesizeAnswerFromRecords(prompt, resolution, FIXTURE_DOCS, activeCtx);

    return {
      output: synthesis.answerText,
      metadata: {
        status: synthesis.status,
        sourcesCount: synthesis.sources.length,
        intent: resolution.intent,
        updatedContext: synthesis.updatedContext
      }
    };
  }
}

export default MineSetuRagProvider;
