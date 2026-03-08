#!/usr/bin/env node
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const SOURCE_DIR = path.join(ROOT, 'data', 'source', 'benchmarks');
const OUTPUT_PATH = path.join(ROOT, 'data', 'cfe-benchmarks-official-full.csv');

const FILES = [
  {
    file: 'literacyenglishbenchmarks.pdf',
    area: 'literacy_english',
    document: 'Benchmarks for literacy and English',
    sourceUrl: 'https://education.gov.scot/media/giljynmw/literacyenglishbenchmarks.pdf',
    publishedOn: '2017-06-01',
  },
  {
    file: 'numeracyandmathematicsbenchmarks.pdf',
    area: 'numeracy_maths',
    document: 'Benchmarks for Numeracy and Mathematics',
    sourceUrl: 'https://education.gov.scot/media/s5edgtvx/numeracyandmathematicsbenchmarks.pdf',
    publishedOn: '2017-06-01',
  },
  {
    file: 'hwbfoodhealthbenchmarkspdf.pdf',
    area: 'health_wellbeing',
    document: 'Benchmarks for Health and Wellbeing (Food and Health)',
    sourceUrl: 'https://education.gov.scot/media/ryukm55b/hwbfoodhealthbenchmarkspdf.pdf',
    publishedOn: '2017-06-01',
  },
  {
    file: 'hwbpersonalsocial-educationbenchmarkspdf.pdf',
    area: 'health_wellbeing',
    document: 'Benchmarks for Health and Wellbeing (Personal and Social Education)',
    sourceUrl: 'https://education.gov.scot/media/tbhpydja/hwbpersonalsocial-educationbenchmarkspdf.pdf',
    publishedOn: '2017-06-01',
  },
  {
    file: 'hwbphysicaleducationbenchmarkspdf.pdf',
    area: 'health_wellbeing',
    document: 'Benchmarks for Health and Wellbeing (Physical Education)',
    sourceUrl: 'https://education.gov.scot/media/xybdxqqm/hwbphysicaleducationbenchmarkspdf.pdf',
    publishedOn: '2017-06-01',
  },
  {
    file: 'sciencesbenchmarkspdf.pdf',
    area: 'sciences',
    document: 'Benchmarks for Sciences',
    sourceUrl: 'https://education.gov.scot/media/kosdrlaj/sciencesbenchmarkspdf.pdf',
    publishedOn: '2017-06-01',
  },
  {
    file: 'social-studiesbenchmarkspdf.pdf',
    area: 'social_studies',
    document: 'Benchmarks for Social Studies',
    sourceUrl: 'https://education.gov.scot/media/eprjaqf0/social-studiesbenchmarkspdf.pdf',
    publishedOn: '2017-06-01',
  },
  {
    file: 'technologiesbenchmarkspdf.pdf',
    area: 'technologies',
    document: 'Benchmarks for Technologies',
    sourceUrl: 'https://education.gov.scot/media/irimoozl/technologiesbenchmarkspdf.pdf',
    publishedOn: '2017-06-01',
  },
  {
    file: 'rmebenchmarkspdf.pdf',
    area: 'rme',
    document: 'Benchmarks for Religious and Moral Education',
    sourceUrl: 'https://education.gov.scot/media/1z0ejtwp/rmebenchmarkspdf.pdf',
    publishedOn: '2017-06-01',
  },
  {
    file: 'expressive-arts-benchmarks-0825.pdf',
    area: 'expressive_arts',
    document: 'Benchmarks for Expressive Arts',
    sourceUrl: 'https://education.gov.scot/media/vv3l2kp2/expressive-arts-benchmarks-0825.pdf',
    publishedOn: '2025-08-01',
  },
];

const LEVEL_PATTERNS = [
  { regex: /\bEarly\s+level\b/i, level: 'early' },
  { regex: /\bFirst\s+level\b/i, level: 'first' },
  { regex: /\bSecond\s+level\b/i, level: 'second' },
  { regex: /\bThird\s*\/\s*Fourth\s+level\b/i, level: 'third_fourth' },
  { regex: /\bThird\s+level\b/i, level: 'third_fourth' },
  { regex: /\bFourth\s+level\b/i, level: 'third_fourth' },
];

const CODE_RE = /\b(?:LIT|ENG|MNU|MTH|HWB|SCN|SOC|TCH|EXA|RME)\s+\d-\d+[a-z]?\b/g;
const BULLET_RE = /^\s*[•]\s*(.+)\s*$/;
const PAGE_ONLY_RE = /^\s*\d+\s*$/;

function toCsv(value) {
  if (value === null || value === undefined) return '';
  const str = String(value);
  if (/[",\n]/.test(str)) return `"${str.replace(/"/g, '""')}"`;
  return str;
}

function toPgTextArray(values) {
  if (!values || values.length === 0) return '{}';
  return `{${values.map((v) => `"${String(v).replace(/"/g, '\\"')}"`).join(',')}}`;
}

function normalizeWhitespace(input) {
  return input.replace(/\s+/g, ' ').trim();
}

function slugify(input) {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48);
}

function detectLevel(line) {
  const trimmed = line.trim();
  const hasLevelPhrase =
    /\b(early|first|second|third|fourth)\s+level\b/i.test(trimmed) ||
    /\bthird\s*\/\s*fourth\s+level\b/i.test(trimmed);
  if (!hasLevelPhrase) {
    return null;
  }

  // Reject body prose sentences that mention "level" but are not section headings.
  const lower = trimmed.toLowerCase();
  if (
    lower.includes('achievement of a level') ||
    lower.includes('towards the level') ||
    lower.includes('curriculum level judgements') ||
    lower.includes('set out in the experiences and outcomes') ||
    lower.includes('challenge set out in the experiences')
  ) {
    return null;
  }

  // Prefer heading-like lines: either starts with level, contains level hyphen section,
  // or is a title line that includes benchmarks.
  const looksLikeHeading =
    /^(early|first|second|third|fourth)\s+level\b/i.test(trimmed) ||
    /-\s*.+/.test(trimmed) ||
    /\bbenchmarks\b/i.test(trimmed);
  if (!looksLikeHeading) return null;

  for (const { regex, level } of LEVEL_PATTERNS) {
    if (regex.test(trimmed)) return level;
  }
  return null;
}

function isHeaderish(line) {
  const lower = line.toLowerCase();
  return (
    lower.includes('benchmarks to support practitioners') ||
    lower.includes('experiences and outcomes') ||
    lower.includes('curriculum organisers') ||
    lower.includes('for planning learning, teaching') ||
    lower.includes('professional judgement') ||
    lower.includes('guidance on using benchmarks')
  );
}

function extractBulletsFromPdf(pdfPath, fileMeta) {
  const raw = execFileSync('pdftotext', ['-raw', pdfPath, '-'], { encoding: 'utf8' });
  const lines = raw.split('\n');
  const rows = [];

  let currentLevel = null;
  let currentOrganiser = null;
  let page = 1;
  let recentCodes = [];

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i] ?? '';

    if (line.includes('\f')) {
      const parts = line.split('\f');
      for (let p = 0; p < parts.length - 1; p++) page += 1;
      line = parts[parts.length - 1];
    }

    const trimmed = normalizeWhitespace(line);
    if (!trimmed) continue;

    const levelFromLine = detectLevel(trimmed);
    if (levelFromLine) {
      currentLevel = levelFromLine;
      const organiserMatch = trimmed.match(/-\s*(.+)$/);
      if (organiserMatch?.[1]) {
        currentOrganiser = normalizeWhitespace(organiserMatch[1]).replace(/\s+-\s+.*/, '');
      }
    }

    const codes = trimmed.match(CODE_RE) ?? [];
    if (codes.length) {
      recentCodes = [...recentCodes, ...codes.map((c) => normalizeWhitespace(c.toUpperCase()))].slice(-20);
    }

    const bulletMatch = line.match(BULLET_RE);
    if (!bulletMatch || !currentLevel) continue;

    let text = normalizeWhitespace(bulletMatch[1]);
    const bulletPage = page;
    const localCodes = new Set(codes.map((c) => normalizeWhitespace(c.toUpperCase())));

    // Capture wrapped lines that belong to this bullet.
    let j = i + 1;
    while (j < lines.length) {
      let next = lines[j] ?? '';
      let nextPage = page;
      if (next.includes('\f')) {
        const parts = next.split('\f');
        for (let p = 0; p < parts.length - 1; p++) nextPage += 1;
        next = parts[parts.length - 1];
      }
      const nextTrim = normalizeWhitespace(next);

      if (!nextTrim) break;
      if (BULLET_RE.test(next)) break;
      if (detectLevel(nextTrim)) break;
      if (isHeaderish(nextTrim)) break;
      if (PAGE_ONLY_RE.test(nextTrim)) break;

      const nextCodes = nextTrim.match(CODE_RE) ?? [];
      if (nextCodes.length && text.length > 0) break;

      const startsLikeContinuation = /^[a-z0-9(]/.test(nextTrim) || /^(and|or|for|to|of|with|as|in)\b/i.test(nextTrim);
      const previousExpectsContinuation = /[,;:]$/.test(text);
      if (!startsLikeContinuation && !previousExpectsContinuation) break;

      text = `${text} ${nextTrim}`;
      j += 1;
      page = nextPage;
    }

    i = j - 1;

    text = normalizeWhitespace(text);
    if (!text || text.length < 12) continue;
    if (/^(experiences and outcomes|curriculum organisers)$/i.test(text)) continue;
    if (/^(use literacy and numeracy benchmarks|do not tick off individual benchmarks|do not assess benchmarks individually)/i.test(text)) continue;
    if (/^(achieved a breadth of learning across|responded consistently well to the level of challenge|demonstrated application of what they have learned)/i.test(text)) continue;

    const relatedCodes = [...new Set([...recentCodes.slice(-8), ...localCodes])];

    const checksum = createHash('sha256').update(`${fileMeta.area}|${currentLevel}|${text}`).digest('hex');
    const benchmarkKey = `${slugify(fileMeta.area)}-${currentLevel}-${slugify(currentOrganiser || 'general')}-${checksum.slice(0, 8)}`;

    rows.push({
      benchmark_key: benchmarkKey,
      curriculum_area: fileMeta.area,
      level: currentLevel,
      organiser: currentOrganiser || 'General',
      benchmark_text: text,
      related_outcome_codes: relatedCodes,
      source_document: fileMeta.document,
      source_url: fileMeta.sourceUrl,
      source_page: bulletPage,
      source_published_on: fileMeta.publishedOn,
      keywords: [],
      metadata: {
        extraction: 'pdftotext_raw',
        source_file: fileMeta.file,
      },
      checksum,
    });
  }

  return rows;
}

function dedupe(rows) {
  const seen = new Set();
  const deduped = [];
  for (const row of rows) {
    const key = `${row.curriculum_area}|${row.level}|${row.checksum}`;
    if (seen.has(key)) continue;
    seen.add(key);
    deduped.push(row);
  }
  return deduped;
}

function writeCsv(rows) {
  const header = [
    'benchmark_key',
    'curriculum_area',
    'level',
    'organiser',
    'benchmark_text',
    'related_outcome_codes',
    'source_document',
    'source_url',
    'source_page',
    'source_published_on',
    'keywords',
    'metadata',
    'checksum',
  ];

  const lines = [header.join(',')];
  for (const row of rows) {
    lines.push([
      toCsv(row.benchmark_key),
      toCsv(row.curriculum_area),
      toCsv(row.level),
      toCsv(row.organiser),
      toCsv(row.benchmark_text),
      toCsv(toPgTextArray(row.related_outcome_codes)),
      toCsv(row.source_document),
      toCsv(row.source_url),
      toCsv(row.source_page),
      toCsv(row.source_published_on),
      toCsv(toPgTextArray(row.keywords)),
      toCsv(JSON.stringify(row.metadata)),
      toCsv(row.checksum),
    ].join(','));
  }

  mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
  writeFileSync(OUTPUT_PATH, `${lines.join('\n')}\n`, 'utf8');
}

function ensureSourcePdfs() {
  mkdirSync(SOURCE_DIR, { recursive: true });
  for (const fileMeta of FILES) {
    const target = path.join(SOURCE_DIR, fileMeta.file);
    if (existsSync(target)) continue;
    console.log(`Downloading ${fileMeta.file} ...`);
    execFileSync('curl', ['-sL', fileMeta.sourceUrl, '-o', target], { stdio: 'inherit' });
  }
}

function main() {
  ensureSourcePdfs();

  const allRows = [];
  for (const fileMeta of FILES) {
    const pdfPath = path.join(SOURCE_DIR, fileMeta.file);
    const rows = extractBulletsFromPdf(pdfPath, fileMeta);
    allRows.push(...rows);
  }

  const finalRows = dedupe(allRows);
  writeCsv(finalRows);

  const byLevel = finalRows.reduce((acc, row) => {
    acc[row.level] = (acc[row.level] ?? 0) + 1;
    return acc;
  }, {});

  const byArea = finalRows.reduce((acc, row) => {
    acc[row.curriculum_area] = (acc[row.curriculum_area] ?? 0) + 1;
    return acc;
  }, {});

  console.log(`Wrote ${OUTPUT_PATH}`);
  console.log(`Rows: ${finalRows.length}`);
  console.log('By level:', byLevel);
  console.log('By area:', byArea);
}

main();
