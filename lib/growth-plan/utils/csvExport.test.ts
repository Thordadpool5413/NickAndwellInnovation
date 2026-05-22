import { describe, it, expect, vi, beforeEach } from 'vitest';
import { exportCSV, exportReferralCSV, exportFinancialCSV, exportCmsCSV, exportCompetitiveCSV } from './csvExport';

let lastBlobInstance: { content: any; options: any };
let lastAnchor: { href: string; download: string; click: () => void };

const createObjectURL = vi.fn(() => 'blob:test-url');
const revokeObjectURL = vi.fn();

class MockBlob {
  content: any;
  options: any;
  constructor(content: any, options: any) {
    this.content = content;
    this.options = options;
    lastBlobInstance = this;
  }
}

beforeEach(() => {
  lastAnchor = { href: '', download: '', click: vi.fn() };
  vi.stubGlobal('Blob', MockBlob);
  vi.stubGlobal('URL', { createObjectURL, revokeObjectURL });
  vi.stubGlobal('document', {
    createElement: vi.fn(() => lastAnchor),
  });
});

describe('exportCSV', () => {
  it('creates a blob and triggers download', () => {
    const headers = ['Name', 'Age'];
    const rows = [['Alice', '30'], ['Bob', '25']];
    exportCSV(headers, rows, 'test-file');

    expect(lastAnchor.click).toHaveBeenCalled();
    expect(URL.createObjectURL).toHaveBeenCalled();
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:test-url');
  });

  it('escapes commas in values', () => {
    exportCSV(['Name'], [['Smith, John']], 'test');
    expect(lastBlobInstance.content[0]).toContain('"Smith, John"');
  });

  it('escapes double quotes in values', () => {
    exportCSV(['Note'], [['He said "hello"']], 'test');
    expect(lastBlobInstance.content[0]).toContain('"He said ""hello"""');
  });

  it('escapes newlines in values', () => {
    exportCSV(['Note'], [['line1\nline2']], 'test');
    expect(lastBlobInstance.content[0]).toContain('"line1\nline2"');
  });

  it('handles null and undefined values', () => {
    exportCSV(['A', 'B'], [[null, undefined]], 'test');
    expect(lastBlobInstance.content[0]).toContain(',');
    expect(lastBlobInstance.content[0]).not.toContain('null');
  });

  it('generates correct CSV format', () => {
    exportCSV(['Col1', 'Col2'], [['a', '1'], ['b', '2']], 'test');
    const lines = lastBlobInstance.content[0].split('\n');
    expect(lines[0]).toBe('Col1,Col2');
    expect(lines[1]).toBe('a,1');
    expect(lines[2]).toBe('b,2');
  });

  it('sets correct MIME type', () => {
    exportCSV(['A'], [['1']], 'test');
    expect(lastBlobInstance.options).toEqual({ type: 'text/csv;charset=utf-8;' });
  });

  it('sets download attribute with .csv extension', () => {
    exportCSV(['A'], [['1']], 'my-file');
    expect(lastAnchor.download).toBe('my-file.csv');
  });
});

describe('exportReferralCSV', () => {
  it('exports referral plan rows with correct headers', () => {
    const rows = [{
      county: 'York', service: 'Home Healthcare', launchGroup: 'Priority 1',
      starts: [100, 120, 140], referrals: [50, 60, 70], revenue: [500000, 600000, 700000],
      demandPool: 5000, reimbursement: 3189, basis: 'CMS direct HH market',
      meta: { margin: 0.18 },
    }];

    exportReferralCSV(rows);

    const lines = lastBlobInstance.content[0].split('\n');
    expect(lines[0]).toContain('County');
    expect(lines[0]).toContain('Y1 Starts');
    expect(lines[0]).toContain('Y1 Referrals');
    expect(lines[0]).toContain('Y1 Revenue');
    expect(lines[1]).toContain('York');
    expect(lines[1]).toContain('100');
    expect(lines[1]).toContain('500000');
  });

  it('handles empty rows array', () => {
    exportReferralCSV([]);
    const lines = lastBlobInstance.content[0].split('\n');
    expect(lines).toHaveLength(1);
    expect(lines[0]).toContain('County');
  });
});

describe('exportFinancialCSV', () => {
  it('exports yearly financial data with correct calculations', () => {
    const rows = [{
      county: 'York', service: 'HH', launchGroup: '1',
      starts: [100, 120, 140], referrals: [50, 60, 70], revenue: [500000, 600000, 700000],
      demandPool: 0, reimbursement: 0, basis: '',
      meta: { margin: 0.18 },
    }];

    exportFinancialCSV(rows);

    const lines = lastBlobInstance.content[0].split('\n');
    expect(lines[0]).toBe('Year,Starts,Referrals,Revenue,Contribution');
    expect(lines[1]).toContain('Year 1');
    expect(lines[1]).toContain('100');
    expect(lines[1]).toContain('50');
    expect(lines[1]).toContain('500000');
    const contribution = Math.round(500000 * 0.18);
    expect(lines[1]).toContain(String(contribution));
  });

  it('handles empty rows array', () => {
    exportFinancialCSV([]);
    const lines = lastBlobInstance.content[0].split('\n');
    expect(lines).toHaveLength(4);
    expect(lines[0]).toBe('Year,Starts,Referrals,Revenue,Contribution');
    expect(lines[1]).toContain('Year 1');
    expect(lines[1]).toContain('0');
  });
});

describe('exportCmsCSV', () => {
  it('exports CMS data entries with correct columns', () => {
    const cmsData = {
      'York': { ffs: 32287, hh: { prov: 11, users: 2191, rate: 0.0679, pay: 10448386, ppu: 4769 }, hos: { prov: 9, users: 851, ppu: 14723 } },
    };

    exportCmsCSV(cmsData);

    const lines = lastBlobInstance.content[0].split('\n');
    expect(lines[0]).toContain('FFS Beneficiaries');
    expect(lines[0]).toContain('HH Providers');
    expect(lines[1]).toContain('York');
    expect(lines[1]).toContain('32287');
    expect(lines[1]).toContain('11');
  });

  it('handles empty object', () => {
    exportCmsCSV({});
    const lines = lastBlobInstance.content[0].split('\n');
    expect(lines).toHaveLength(1);
  });
});

describe('exportCompetitiveCSV', () => {
  it('exports competitive providers with correct formatting', () => {
    const providers = [{
      service: 'Home Healthcare',
      providerName: 'HomeCare Plus',
      locationCounty: 'York',
      beneficiaries: 500,
      episodes: 200,
      payment: 318900,
      providerVolumeShare: 0.15,
      isAndwellCmsRecord: false,
    }];

    exportCompetitiveCSV(providers);

    const lines = lastBlobInstance.content[0].split('\n');
    expect(lines[0]).toContain('Service');
    expect(lines[0]).toContain('Provider Volume Share');
    expect(lines[0]).toContain('Is Andwell');
    expect(lines[1]).toContain('HomeCare Plus');
    expect(lines[1]).toContain('15.0%');
    expect(lines[1]).toContain('No');
  });

  it('marks Andwell records as Yes', () => {
    const providers = [{
      service: 'HH', providerName: 'Andwell Health', locationCounty: 'York',
      beneficiaries: 300, episodes: 100, payment: 100000,
      providerVolumeShare: 0.05, isAndwellCmsRecord: true,
    }];

    exportCompetitiveCSV(providers);
    expect(lastBlobInstance.content[0]).toContain('Yes');
  });

  it('handles empty providers array', () => {
    exportCompetitiveCSV([]);
    const lines = lastBlobInstance.content[0].split('\n');
    expect(lines).toHaveLength(1);
  });
});
