/**
 * OpenYida Knowledge Document
 *
 * A Notion-like read-only document page for OpenYida knowledge records.
 * It is intended to be opened from the assistant source links:
 *   /s/openyida-doc#doc=<knowledge formInstId>
 */

var MARKDOWN_IT_URL = 'https://g.alicdn.com/code/lib/markdown-it/13.0.1/markdown-it.min.js';
var REACT2_URL = 'https://g.alicdn.com/code/lib/react/18.2.0/umd/react.production.min.js';
var REACTDOM2_URL = 'https://g.alicdn.com/code/lib/react-dom/18.2.0/umd/react-dom.production.min.js';
var BLOCKNOTE_REACT_URL = 'https://esm.sh/@blocknote/react@0.51.2?deps=react@18.2.0,react-dom@18.2.0';
var BLOCKNOTE_MANTINE_URL = 'https://esm.sh/@blocknote/mantine@0.51.2?deps=react@18.2.0,react-dom@18.2.0,@mantine/core@8.3.11,@mantine/hooks@8.3.11';
var REACT2_ESM_URL = 'https://esm.sh/react@18.2.0';
var REACTDOM2_CLIENT_ESM_URL = 'https://esm.sh/react-dom@18.2.0/client';
var BLOCKNOTE_CORE_CSS_URL = 'https://cdn.jsdelivr.net/npm/@blocknote/core@0.51.2/fonts/inter.css';
var BLOCKNOTE_MANTINE_CSS_URL = 'https://cdn.jsdelivr.net/npm/@blocknote/mantine@0.51.2/style.css';
var APP_HOME_PATH = '/s/openyida';
var DOC_SHARE_PATH = '/s/openyida-doc';
var KNOWLEDGE_DATA_FORM_UUID = 'FORM-2FD50D15418B4C609998FFF364AF8DE0GJ7Z';
var KNOWLEDGE_DATA_FIELDS = {
  title: 'textField_h8ys1jqwe',
  type: 'selectField_h8ys2bliv',
  keywords: 'textField_h8ys3733s',
  summary: 'textareaField_h8ys4sf65',
  body: 'textareaField_h8ys5mj70',
  source: 'textField_h8ys6jhou',
  status: 'selectField_h8ys7m5i7',
  updatedAt: 'dateField_h8ys8icjo',
  contributors: 'employeeField_pxnq1w9l6',
};
var EDIT_SUGGESTION_FORM_UUID = 'FORM-56E05195F4E84FF99A2B80A5E23222E26A5Z';
var EDIT_SUGGESTION_FIELDS = {
  originalId: 'textField_sd0l1e1hm',
  originalTitle: 'textField_sd0l2rxwn',
  newTitle: 'textField_sd0l3ooan',
  newCategory: 'selectField_sd0l4q2od',
  newKeywords: 'textField_sd0l5yn0h',
  newSummary: 'textareaField_sd0l6fa58',
  newBody: 'textareaField_sd0l710x4',
  editNote: 'textareaField_sd0l8tz9d',
  submitter: 'employeeField_sd0l9b95r',
};
var KNOWLEDGE_QUERY_PAGE_SIZE = 100;
var KNOWLEDGE_CACHE_KEY = 'openyida.knowledgeBase.cache.v1.' + KNOWLEDGE_DATA_FORM_UUID;
var KNOWLEDGE_CACHE_TTL_MS = 30 * 60 * 1000;
var KNOWLEDGE_CACHE_STALE_TTL_MS = 7 * 24 * 60 * 60 * 1000;
var YIDA_SOURCE_ICON_DATA_URI = 'data:image/svg+xml,%3Csvg%20viewBox%3D%220%200%201024%201024%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22%230089ff%22%3E%3Cpath%20d%3D%22M966.743%200H57.498A57.197%2057.197%200%200%200%20.06%2057.077v218.07a61.772%2061.772%200%200%201%2012.042%204.936L348.538%20473.83l336.196-193.987a64.421%2064.421%200%200%201%2087.902%2023.36l34.92%2060.208a63.94%2063.94%200%200%201-23.24%2087.54L449.084%20643.613v379.905h517.78a57.197%2057.197%200%200%200%2056.714-56.594V57.077A57.197%2057.197%200%200%200%20966.743%200z%22%2F%3E%3Cpath%20d%3D%22M.663%20501.163v465.76a56.715%2056.715%200%200%200%2016.255%2040.34%2057.558%2057.558%200%200%200%2040.58%2016.255H252.93V646.141z%22%2F%3E%3C%2Fg%3E%3C%2Fsvg%3E';

var DOC_CSS = [
  'body{background:#050505!important;font-family:"-apple-system-body","ui-sans-serif","-apple-system","system-ui","Segoe UI","Helvetica","Apple Color Emoji","Arial","sans-serif","Segoe UI Emoji","Segoe UI Symbol"!important;-webkit-font-smoothing:antialiased;}',
  '.next-aside-navigation{display:none!important;}',
  '.next-shell-main{padding-left:0!important;}',
  '.next-shell-sub-main{left:0!important;margin-left:0!important;width:100%!important;}',
  '.next-shell-page,.next-shell-content,.next-shell-content-inner,.render-engine-container,.vc-jsx{height:100%!important;min-height:100vh!important;background:#050505!important;}',
  '.vc-rootheader{display:none!important;}',
  '.vc-page-yida-page,.vc-deep-container-entry.vc-rootcontent{background:#050505!important;}',
  '.oy-doc-scroll{scrollbar-width:thin;scrollbar-color:#4a4a4a transparent;}',
  '.oy-doc-scroll::-webkit-scrollbar{width:8px;height:8px;}',
  '.oy-doc-scroll::-webkit-scrollbar-thumb{background:#4a4a4a;border-radius:999px;}',
  '.oy-doc-markdown{font-size:16px;line-height:1.82;color:#f4f4f4;word-break:break-word;font-weight:400;}',
  '.oy-doc-markdown h1,.oy-doc-markdown h2,.oy-doc-markdown h3{color:#fff;font-weight:650;line-height:1.28;letter-spacing:0;}',
  '.oy-doc-markdown h1{font-size:32px;margin:0 0 22px;}',
  '.oy-doc-markdown h2{font-size:24px;margin:38px 0 14px;}',
  '.oy-doc-markdown h3{font-size:19px;margin:28px 0 10px;}',
  '.oy-doc-markdown p{margin:0 0 18px;}',
  '.oy-doc-markdown p:last-child{margin-bottom:0;}',
  '.oy-doc-markdown strong{font-weight:650;color:#fff;}',
  '.oy-doc-markdown ol,.oy-doc-markdown ul{margin:10px 0 22px 26px;padding:0;}',
  '.oy-doc-markdown li{margin:7px 0;padding-left:5px;}',
  '.oy-doc-markdown code{border:1px solid #393939;border-radius:5px;background:#202020;color:#f5f5f5;padding:2px 6px;font-family:Menlo,Consolas,monospace;font-size:.88em;}',
  '.oy-doc-markdown pre{margin:18px 0;padding:16px 18px;border:1px solid #343434;border-radius:8px;background:#171717;color:#e7e7e7;overflow:auto;}',
  '.oy-doc-markdown pre code{border:0;background:transparent;color:inherit;padding:0;}',
  '.oy-doc-markdown blockquote{margin:18px 0;padding:13px 16px;border-left:3px solid #0089ff;background:#101923;color:#dcecff;border-radius:0 8px 8px 0;}',
  '.oy-doc-markdown a{color:#9dccff;text-decoration:underline;text-underline-offset:4px;font-weight:650;}',
  '.oy-doc-markdown table{border-collapse:collapse;width:100%;margin:18px 0;font-size:14px;}',
  '.oy-doc-markdown th,.oy-doc-markdown td{border:1px solid #343434;padding:9px 11px;text-align:left;}',
  '.oy-doc-markdown th{background:#202020;font-weight:650;color:#fff;}',
  '.oy-doc-blocknote-host{position:relative;margin-top:0;}',
  '.oy-doc-blocknote-frame{display:block;width:100%;min-height:220px;border:0;background:#050505;overflow:hidden;}',
  '.oy-doc-blocknote-host[data-blocknote-ready="true"] .oy-doc-blocknote-fallback{display:none!important;}',
].join('\n');

var _blockNoteMountKey = '';
var _blockNoteMountTimer = null;
var _blockNoteMessageHandler = null;

var _customState = {
  ready: false,
  status: 'loading',
  docId: '',
  record: null,
  docs: [],
  error: '',
  markdownReady: false,
};

var _editState = {
  editing: false,
  submitting: false,
  editTitle: '',
  editCategory: '',
  editKeywords: '',
  editSummary: '',
  editBody: '',
  editNote: '',
  editError: '',
};

function getSearchDataList(res) {
  return (res && res.data) || (res && res.content && res.content.data) || [];
}

function getRowFormData(row) {
  return (row && row.formData) || (row && row.data) || {};
}

function getRowId(row) {
  return row && (row.formInstId || row.instId || row.id) ? String(row.formInstId || row.instId || row.id) : '';
}

function normalizeKnowledgeValue(value) {
  if (value === undefined || value === null) {
    return '';
  }
  if (Array.isArray(value)) {
    return value.map((item) => normalizeKnowledgeValue(item)).filter(Boolean).join('、');
  }
  if (typeof value === 'object') {
    if (value.value !== undefined) {
      return normalizeKnowledgeValue(value.value);
    }
    if (value.text !== undefined) {
      return normalizeKnowledgeValue(value.text);
    }
    if (value.zh_CN !== undefined) {
      return normalizeKnowledgeValue(value.zh_CN);
    }
    return JSON.stringify(value);
  }
  return String(value || '');
}

function normalizeText(value) {
  return String(value || '').trim();
}

function parseSearchParams(raw) {
  var params = {};
  var text = String(raw || '').replace(/^[?#]/, '');
  if (!text) {
    return params;
  }
  try {
    var search = new URLSearchParams(text);
    search.forEach(function(value, key) {
      params[key] = value;
    });
  } catch (err) {
    text.split('&').forEach(function(part) {
      var pair = part.split('=');
      if (pair[0]) {
        params[decodeURIComponent(pair[0])] = decodeURIComponent(pair.slice(1).join('=') || '');
      }
    });
  }
  return params;
}

function readDocIdFromLocation() {
  if (typeof window === 'undefined' || !window.location) {
    return '';
  }
  var fromQuery = parseSearchParams(window.location.search || '');
  var fromHash = parseSearchParams(window.location.hash || '');
  return fromQuery.doc || fromQuery.id || fromQuery.formInstId || fromHash.doc || fromHash.id || fromHash.formInstId || '';
}

function getAliworkOrigin() {
  if (typeof window !== 'undefined' && window.location && window.location.origin && /(^|\.)aliwork\.com$/.test(window.location.hostname || '')) {
    return String(window.location.origin || '').replace(/\/+$/, '');
  }
  return 'https://demo.aliwork.com';
}

function getAppHomeUrl() {
  return getAliworkOrigin() + APP_HOME_PATH;
}

function getDocUrl(docId) {
  var baseUrl = getAliworkOrigin() + DOC_SHARE_PATH;
  if (!docId) {
    return baseUrl;
  }
  return baseUrl + '#doc=' + encodeURIComponent(docId);
}

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function inlineFallbackMarkdown(value) {
  var escaped = escapeHtml(value);
  escaped = escaped.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  escaped = escaped.replace(/`([^`]+)`/g, '<code>$1</code>');
  escaped = escaped.replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g, '<a href="$2" target="_blank" rel="noreferrer">$1</a>');
  return escaped;
}

function fallbackMarkdownToHtml(text) {
  var lines = String(text || '').split('\n');
  var html = [];
  var listOpen = false;
  lines.forEach((line) => {
    var heading = line.match(/^(#{1,3})\s+(.+)$/);
    var ordered = line.match(/^\s*\d+\.\s+(.+)$/);
    var unordered = line.match(/^\s*[-*]\s+(.+)$/);
    if (heading) {
      if (listOpen) {
        html.push('</ul>');
        listOpen = false;
      }
      html.push('<h' + heading[1].length + '>' + inlineFallbackMarkdown(heading[2]) + '</h' + heading[1].length + '>');
      return;
    }
    if (ordered || unordered) {
      if (!listOpen) {
        html.push('<ul>');
        listOpen = true;
      }
      html.push('<li>' + inlineFallbackMarkdown((ordered || unordered)[1]) + '</li>');
      return;
    }
    if (listOpen) {
      html.push('</ul>');
      listOpen = false;
    }
    if (!line.trim()) {
      html.push('');
      return;
    }
    html.push('<p>' + inlineFallbackMarkdown(line) + '</p>');
  });
  if (listOpen) {
    html.push('</ul>');
  }
  return html.join('');
}

function markdownToHtml(text) {
  if (typeof window !== 'undefined' && window.markdownit) {
    if (!window.__openYidaKnowledgeMarkdownIt) {
      window.__openYidaKnowledgeMarkdownIt = window.markdownit({
        html: false,
        linkify: true,
        breaks: true,
      });
    }
    return window.__openYidaKnowledgeMarkdownIt.render(String(text || ''));
  }
  return fallbackMarkdownToHtml(text);
}

function sanitizeDomId(value) {
  return String(value || 'doc').replace(/[^a-zA-Z0-9_-]+/g, '-').slice(0, 80) || 'doc';
}

function getBlockNoteHostId(docId) {
  return 'oy-blocknote-host-' + sanitizeDomId(docId || _customState.docId || 'doc');
}

function getBlockNoteFrameId(docId) {
  return 'oy-blocknote-frame-' + sanitizeDomId(docId || _customState.docId || 'doc');
}

function jsonForHtml(value) {
  return JSON.stringify(value || {})
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');
}

function createBlockNoteBlock(type, content, props) {
  var text = normalizeText(content);
  if (!text) {
    return null;
  }
  return {
    type: type || 'paragraph',
    props: props || {},
    content: text,
  };
}

function markdownToBlockNoteBlocks(text) {
  var lines = String(text || '').replace(/\r\n/g, '\n').split('\n');
  var blocks = [];
  var paragraph = [];
  var codeLines = [];
  var inCode = false;

  function flushParagraph() {
    if (!paragraph.length) {
      return;
    }
    var block = createBlockNoteBlock('paragraph', paragraph.join('\n'));
    if (block) {
      blocks.push(block);
    }
    paragraph = [];
  }

  function flushCode() {
    if (!codeLines.length) {
      return;
    }
    var block = createBlockNoteBlock('codeBlock', codeLines.join('\n'));
    if (block) {
      blocks.push(block);
    }
    codeLines = [];
  }

  lines.forEach((rawLine) => {
    var line = String(rawLine || '');
    var trimmed = line.trim();
    if (/^```/.test(trimmed)) {
      if (inCode) {
        flushCode();
        inCode = false;
      } else {
        flushParagraph();
        inCode = true;
      }
      return;
    }
    if (inCode) {
      codeLines.push(line);
      return;
    }
    if (!trimmed) {
      flushParagraph();
      return;
    }
    var heading = trimmed.match(/^(#{1,3})\s+(.+)$/);
    var ordered = trimmed.match(/^\d+\.\s+(.+)$/);
    var bullet = trimmed.match(/^[-*]\s+(.+)$/);
    if (heading) {
      flushParagraph();
      blocks.push(createBlockNoteBlock('heading', heading[2], { level: heading[1].length }));
      return;
    }
    if (ordered) {
      flushParagraph();
      blocks.push(createBlockNoteBlock('numberedListItem', ordered[1]));
      return;
    }
    if (bullet) {
      flushParagraph();
      blocks.push(createBlockNoteBlock('bulletListItem', bullet[1]));
      return;
    }
    if (/^>\s+/.test(trimmed)) {
      flushParagraph();
      blocks.push(createBlockNoteBlock('quote', trimmed.replace(/^>\s+/, '')));
      return;
    }
    paragraph.push(trimmed);
  });
  if (inCode) {
    flushCode();
  }
  flushParagraph();
  return blocks.filter(Boolean).length ? blocks.filter(Boolean) : [createBlockNoteBlock('paragraph', '这条知识记录还没有正文内容。')];
}

function createBlockNoteSrcDoc(record) {
  var blocks = markdownToBlockNoteBlocks(buildDocumentMarkdown(record));
  var payload = {
    frameId: getBlockNoteFrameId(record && record.id),
    title: record && record.title ? record.title : 'OpenYida 知识库',
    blocks: blocks,
  };
  var moduleScript = [
    "var notify = function(message) {",
    "  try { parent.postMessage(Object.assign({ source: 'openyida-blocknote', frameId: data.frameId }, message), '*'); } catch (err) {}",
    "};",
    "window.addEventListener('error', function(event) { notify({ status: 'error', error: event && event.message ? event.message : 'BlockNote load failed' }); });",
    "window.addEventListener('unhandledrejection', function(event) { notify({ status: 'error', error: event && event.reason && event.reason.message ? event.reason.message : 'BlockNote load failed' }); });",
    "import React from '" + REACT2_ESM_URL + "';",
    "import { createRoot } from '" + REACTDOM2_CLIENT_ESM_URL + "';",
    "import { useCreateBlockNote } from '" + BLOCKNOTE_REACT_URL + "';",
    "import { BlockNoteView } from '" + BLOCKNOTE_MANTINE_URL + "';",
    "window.react2Module = React;",
    "window.reactDom2Client = { createRoot: createRoot };",
    "function resize() {",
    "  var height = Math.max(220, Math.ceil(document.documentElement.scrollHeight || document.body.scrollHeight || 220));",
    "  notify({ status: 'ready', height: height });",
    "}",
    "function App() {",
    "  var editor = useCreateBlockNote({ initialContent: data.blocks });",
    "  return React.createElement(BlockNoteView, { editor: editor, editable: false, theme: 'dark', formattingToolbar: false, sideMenu: false, slashMenu: false, emojiPicker: false, filePanel: false, tableHandles: false });",
    "}",
    "try {",
    "  createRoot(document.getElementById('root')).render(React.createElement(App));",
    "  if (window.ResizeObserver) { new ResizeObserver(resize).observe(document.body); }",
    "  setTimeout(resize, 160);",
    "  setTimeout(resize, 800);",
    "} catch (err) {",
    "  notify({ status: 'error', error: err && err.message ? err.message : 'BlockNote render failed' });",
    "}"
  ].join('\n');
  return [
    '<!doctype html>',
    '<html>',
    '<head>',
    '<meta charset="utf-8">',
    '<meta name="viewport" content="width=device-width,initial-scale=1">',
    '<link rel="stylesheet" href="' + BLOCKNOTE_CORE_CSS_URL + '">',
    '<link rel="stylesheet" href="' + BLOCKNOTE_MANTINE_CSS_URL + '">',
    '<style>',
    'html,body,#root{margin:0;min-height:220px;background:#050505;color:#f4f4f4;font-family:"-apple-system-body","ui-sans-serif","-apple-system","system-ui","Segoe UI","Helvetica","Arial","sans-serif";}',
    'body{overflow:hidden;}',
    '.bn-container,.bn-editor{background:#050505!important;color:#f4f4f4!important;}',
    '.bn-editor{padding:0!important;}',
    '.bn-block-content{font-size:16px;line-height:1.82;}',
    '.bn-block-content[data-content-type="heading"]{font-weight:700;color:#fff;}',
    '.bn-default-styles{--bn-colors-editor-background:#050505;--bn-colors-menu-background:#171717;--bn-colors-tooltip-background:#242424;--bn-colors-hovered-background:#202020;--bn-colors-selected-background:#17253a;--bn-colors-text:#f4f4f4;--bn-colors-side-menu:#9b9b9b;}',
    '</style>',
    '</head>',
    '<body>',
    '<script src="' + REACT2_URL + '"></script>',
    '<script src="' + REACTDOM2_URL + '"></script>',
    '<script>window.react2=window.React;window.reactDom2=window.ReactDOM;</script>',
    '<script id="bn-data" type="application/json">' + jsonForHtml(payload) + '</script>',
    '<div id="root"></div>',
    '<script type="module">var data = JSON.parse(document.getElementById("bn-data").textContent || "{}");\n' + moduleScript + '</script>',
    '</body>',
    '</html>'
  ].join('');
}

function buildKnowledgeRecord(row) {
  var formData = getRowFormData(row);
  var rawContributors = formData[KNOWLEDGE_DATA_FIELDS.contributors];
  var contributors = [];
  if (Array.isArray(rawContributors)) {
    contributors = rawContributors.map(function (item) {
      if (typeof item === 'string') return item;
      if (item && item.label) return item.label;
      if (item && item.value) return item.value;
      return '';
    }).filter(Boolean);
  } else if (rawContributors && typeof rawContributors === 'string') {
    contributors = rawContributors.split(/[,，]/).map(function (s) { return s.trim(); }).filter(Boolean);
  }
  return {
    id: getRowId(row),
    title: normalizeKnowledgeValue(formData[KNOWLEDGE_DATA_FIELDS.title]) || '未命名资料',
    type: normalizeKnowledgeValue(formData[KNOWLEDGE_DATA_FIELDS.type]) || '知识库',
    keywords: normalizeKnowledgeValue(formData[KNOWLEDGE_DATA_FIELDS.keywords]),
    summary: normalizeKnowledgeValue(formData[KNOWLEDGE_DATA_FIELDS.summary]),
    body: normalizeKnowledgeValue(formData[KNOWLEDGE_DATA_FIELDS.body]),
    source: normalizeKnowledgeValue(formData[KNOWLEDGE_DATA_FIELDS.source]) || 'OpenYida 助手知识库',
    status: normalizeKnowledgeValue(formData[KNOWLEDGE_DATA_FIELDS.status]),
    updatedAt: formData[KNOWLEDGE_DATA_FIELDS.updatedAt],
    contributors: contributors,
  };
}

function canUseKnowledgeCache() {
  if (typeof window === 'undefined' || !window.localStorage) {
    return false;
  }
  try {
    var probeKey = KNOWLEDGE_CACHE_KEY + '.probe';
    window.localStorage.setItem(probeKey, '1');
    window.localStorage.removeItem(probeKey);
    return true;
  } catch (err) {
    return false;
  }
}

function normalizeKnowledgeCacheRecord(record) {
  var id = record && record.id ? String(record.id) : '';
  if (!id) {
    return null;
  }
  return {
    id: id,
    title: normalizeKnowledgeValue(record.title) || '未命名资料',
    type: normalizeKnowledgeValue(record.type) || '知识库',
    keywords: normalizeKnowledgeValue(record.keywords),
    summary: normalizeKnowledgeValue(record.summary),
    body: normalizeKnowledgeValue(record.body),
    source: normalizeKnowledgeValue(record.source) || 'OpenYida 助手知识库',
    status: normalizeKnowledgeValue(record.status),
    updatedAt: record.updatedAt || '',
  };
}

function normalizeKnowledgeCacheRecords(records) {
  return (records || []).map((record) => normalizeKnowledgeCacheRecord(record)).filter(Boolean);
}

function readKnowledgeCache(options) {
  if (!canUseKnowledgeCache()) {
    return null;
  }
  try {
    var raw = window.localStorage.getItem(KNOWLEDGE_CACHE_KEY);
    if (!raw) {
      return null;
    }
    var payload = JSON.parse(raw);
    var cachedAt = Number(payload && payload.cachedAt ? payload.cachedAt : 0);
    var age = new Date().getTime() - cachedAt;
    if (!payload || payload.formUuid !== KNOWLEDGE_DATA_FORM_UUID || !cachedAt || age > KNOWLEDGE_CACHE_STALE_TTL_MS) {
      window.localStorage.removeItem(KNOWLEDGE_CACHE_KEY);
      return null;
    }
    if (!(options && options.allowStale) && age > KNOWLEDGE_CACHE_TTL_MS) {
      return null;
    }
    var records = normalizeKnowledgeCacheRecords(payload.records || []);
    if (!records.length) {
      return null;
    }
    return {
      records: records,
      cachedAt: cachedAt,
      fresh: age <= KNOWLEDGE_CACHE_TTL_MS,
    };
  } catch (err) {
    return null;
  }
}

function writeKnowledgeCache(records) {
  if (!canUseKnowledgeCache()) {
    return;
  }
  var normalized = normalizeKnowledgeCacheRecords(records).slice(0, KNOWLEDGE_QUERY_PAGE_SIZE);
  if (!normalized.length) {
    return;
  }
  try {
    window.localStorage.setItem(KNOWLEDGE_CACHE_KEY, JSON.stringify({
      formUuid: KNOWLEDGE_DATA_FORM_UUID,
      cachedAt: new Date().getTime(),
      records: normalized,
    }));
  } catch (err) {
    try {
      window.localStorage.removeItem(KNOWLEDGE_CACHE_KEY);
    } catch (removeErr) {}
  }
}

function formatDate(value) {
  if (!value) {
    return '';
  }
  var date = null;
  if (typeof value === 'number') {
    date = new Date(value);
  } else if (/^\d+$/.test(String(value))) {
    date = new Date(Number(value));
  } else {
    date = new Date(value);
  }
  if (!date || isNaN(date.getTime())) {
    return String(value);
  }
  var year = date.getFullYear();
  var rawMonth = date.getMonth() + 1;
  var rawDay = date.getDate();
  var month = rawMonth < 10 ? '0' + rawMonth : String(rawMonth);
  var day = rawDay < 10 ? '0' + rawDay : String(rawDay);
  return year + '-' + month + '-' + day;
}

function buildDocumentMarkdown(record) {
  if (!record) {
    return '';
  }
  var body = normalizeText(record.body);
  if (body) {
    return body;
  }
  return normalizeText(record.summary) || '这条知识记录还没有正文内容。';
}

function canUseKnowledgeSearch(ctx) {
  return !!(ctx && ctx.utils && ctx.utils.yida && ctx.utils.yida.searchFormDatas);
}

function findKnowledgeRecord(docs, docId) {
  var record = null;
  (docs || []).forEach((item) => {
    if (docId && item && item.id === docId) {
      record = item;
    }
  });
  return record;
}

function buildDocumentState(docId, docs) {
  if (!docId) {
    return {
      status: 'list',
      docs: docs,
      record: null,
      error: '',
    };
  }
  var record = findKnowledgeRecord(docs, docId);
  if (!record) {
    return {
      status: 'error',
      docs: docs,
      record: null,
      error: '没有找到这条资料，可能已停用或链接已失效。',
    };
  }
  return {
    status: 'ready',
    docs: docs,
    record: record,
    error: '',
  };
}

function updateDocumentTitle(record) {
  if (typeof document === 'undefined') {
    return;
  }
  var title = record && record.title ? record.title + ' - OpenYida 知识库' : 'OpenYida 知识库';
  document.title = title;
}

export function getCustomState(key) {
  if (key) {
    return _customState[key];
  }
  return Object.assign({}, _customState);
}

export function setCustomState(newState) {
  Object.keys(newState || {}).forEach((key) => {
    _customState[key] = newState[key];
  });
  updateDocumentTitle(_customState.record);
  this.forceUpdate();
  if (_customState.status === 'ready') {
    this.scheduleBlockNoteMount();
  }
}

export function forceUpdate() {
  this.setState({ timestamp: new Date().getTime() });
}

export function loadExternalScript(src) {
  if (typeof window !== 'undefined' && window.markdownit) {
    return Promise.resolve();
  }
  if (this.utils && this.utils.loadScript) {
    return this.utils.loadScript(src);
  }
  return new Promise((resolve, reject) => {
    if (typeof document === 'undefined') {
      reject(new Error('document unavailable'));
      return;
    }
    var existed = document.querySelector('script[src="' + src + '"]');
    if (existed) {
      resolve();
      return;
    }
    var script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.onload = function() {
      resolve();
    };
    script.onerror = function() {
      reject(new Error('script load failed'));
    };
    document.head.appendChild(script);
  });
}

export function loadMarkdownRenderer() {
  var self = this;
  return this.loadExternalScript(MARKDOWN_IT_URL).then(function() {
    self.setCustomState({ markdownReady: true });
  }).catch(function() {
    self.setCustomState({ markdownReady: false });
  });
}

export function scheduleBlockNoteMount() {
  var self = this;
  if (_blockNoteMountTimer) {
    clearTimeout(_blockNoteMountTimer);
  }
  _blockNoteMountTimer = setTimeout(function() {
    self.mountBlockNoteDocument();
  }, 80);
}

export function handleBlockNoteMessage(event) {
  var data = event && event.data ? event.data : null;
  if (!data || data.source !== 'openyida-blocknote' || !data.frameId || typeof document === 'undefined') {
    return;
  }
  var frame = document.getElementById(data.frameId);
  if (!frame) {
    return;
  }
  var host = frame.parentNode;
  if (data.status === 'ready') {
    host.setAttribute('data-blocknote-ready', 'true');
    if (data.height) {
      frame.style.height = Math.max(220, Math.min(Number(data.height) || 220, 2400)) + 'px';
    }
  } else if (data.status === 'error') {
    host.setAttribute('data-blocknote-ready', 'false');
    host.setAttribute('data-blocknote-error', data.error || 'load-error');
  }
}

export function mountBlockNoteDocument() {
  if (typeof document === 'undefined' || !_customState.record || !_customState.record.id) {
    return;
  }
  var record = _customState.record;
  var host = document.getElementById(getBlockNoteHostId(record.id));
  if (!host) {
    return;
  }
  var mountKey = record.id + ':' + String(record.updatedAt || '') + ':' + String(record.body || record.summary || '').length;
  if (host.getAttribute('data-blocknote-key') === mountKey) {
    return;
  }
  var oldFrame = host.querySelector('iframe.oy-doc-blocknote-frame');
  if (oldFrame && oldFrame.parentNode) {
    oldFrame.parentNode.removeChild(oldFrame);
  }
  host.setAttribute('data-blocknote-key', mountKey);
  host.setAttribute('data-blocknote-ready', 'false');
  var frame = document.createElement('iframe');
  frame.id = getBlockNoteFrameId(record.id);
  frame.className = 'oy-doc-blocknote-frame';
  frame.title = record.title || 'OpenYida Knowledge';
  frame.style.height = '260px';
  frame.setAttribute('loading', 'lazy');
  frame.srcdoc = createBlockNoteSrcDoc(record);
  host.insertBefore(frame, host.firstChild);
  _blockNoteMountKey = mountKey;
}

export function loadDocument(options) {
  var self = this;
  var docId = readDocIdFromLocation();
  var forceRefresh = !!(options && options.forceRefresh);

  if (!docId) {
    this.setCustomState({
      ready: true,
      status: 'error',
      docId: '',
      error: '链接中没有指定文档 ID，请从 OpenYida 助手的资料来源链接进入。',
    });
    return;
  }

  var cached = forceRefresh ? null : readKnowledgeCache({ allowStale: true });
  if (cached && cached.records.length) {
    var cachedRecord = findKnowledgeRecord(cached.records, docId);
    if (cachedRecord) {
      this.setCustomState({
        ready: true,
        status: 'ready',
        docId: docId,
        docs: cached.records,
        record: cachedRecord,
        error: '',
      });
      if (cached.fresh) {
        return;
      }
    }
  }

  if (!canUseKnowledgeSearch(this)) {
    if (!(_customState.status === 'ready' && _customState.record)) {
      this.setCustomState({
        ready: true,
        status: 'error',
        docId: docId,
        error: '当前页面没有可用的宜搭知识库查询能力。',
      });
    }
    return;
  }

  if (_customState.status !== 'ready') {
    this.setCustomState({
      ready: true,
      status: 'loading',
      docId: docId,
      record: null,
      error: '',
    });
  }

  this.utils.yida.getFormDataById({
    formUuid: KNOWLEDGE_DATA_FORM_UUID,
    formInstId: docId,
  }).then(function(res) {
    var record = buildKnowledgeRecord(res);
    if (!record || !record.id) {
      self.setCustomState({
        status: 'error',
        docId: docId,
        record: null,
        error: '没有找到这条资料，可能已停用或链接已失效。',
      });
      return;
    }
    if (record.status === '停用') {
      self.setCustomState({
        status: 'error',
        docId: docId,
        record: null,
        error: '这条资料已停用。',
      });
      return;
    }
    self.setCustomState({
      status: 'ready',
      docId: docId,
      docs: [record],
      record: record,
      error: '',
    });
  }).catch(function(err) {
    if (_customState.status === 'ready' && _customState.record) {
      return;
    }
    self.setCustomState({
      status: 'error',
      docId: docId,
      error: err && err.message ? err.message : '读取知识库文档失败。',
    });
  });
}

export function didMount() {
  var self = this;
  if (typeof window !== 'undefined') {
    _blockNoteMessageHandler = function(event) {
      self.handleBlockNoteMessage(event);
    };
    window.addEventListener('message', _blockNoteMessageHandler);
  }
  updateDocumentTitle();
  this.loadMarkdownRenderer();
  this.loadDocument();
}

export function didUnmount() {
  if (_blockNoteMountTimer) {
    clearTimeout(_blockNoteMountTimer);
    _blockNoteMountTimer = null;
  }
  if (typeof window !== 'undefined' && _blockNoteMessageHandler) {
    window.removeEventListener('message', _blockNoteMessageHandler);
    _blockNoteMessageHandler = null;
  }
}

export function goHome() {
  if (typeof window !== 'undefined') {
    window.location.href = getAppHomeUrl();
  }
}

export function reloadDocument() {
  this.loadDocument({ forceRefresh: true });
}

export function copyDocLink() {
  var self = this;
  var url = getDocUrl(_customState.docId || (_customState.record && _customState.record.id));
  if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(url).then(function() {
      if (self.utils && self.utils.toast) {
        self.utils.toast({ title: '链接已复制', type: 'success' });
      }
    }).catch(function() {});
  }
}

export function enterEditMode() {
  var record = _customState.record;
  if (!record || !record.id) return;
  _editState.editing = true;
  _editState.submitting = false;
  _editState.editTitle = record.title || '';
  _editState.editCategory = record.type || '';
  _editState.editKeywords = record.keywords || '';
  _editState.editSummary = record.summary || '';
  _editState.editBody = record.body || '';
  _editState.editNote = '';
  _editState.editError = '';
  this.setState({ timestamp: Date.now() });
}

export function cancelEdit() {
  _editState.editing = false;
  _editState.submitting = false;
  _editState.editError = '';
  this.setState({ timestamp: Date.now() });
}

export function onEditFieldChange(field, value) {
  _editState[field] = value;
  this.setState({ timestamp: Date.now() });
}

export function submitEditSuggestion() {
  var self = this;
  var record = _customState.record;
  if (!record || !record.id) return;

  var hasChange = (
    _editState.editTitle !== (record.title || '') ||
    _editState.editCategory !== (record.type || '') ||
    _editState.editKeywords !== (record.keywords || '') ||
    _editState.editSummary !== (record.summary || '') ||
    _editState.editBody !== (record.body || '')
  );
  if (!hasChange) {
    _editState.editError = '没有修改任何内容，无需提交。';
    this.setState({ timestamp: Date.now() });
    return;
  }
  if (!_editState.editTitle.trim()) {
    _editState.editError = '标题不能为空。';
    this.setState({ timestamp: Date.now() });
    return;
  }

  _editState.submitting = true;
  _editState.editError = '';
  this.setState({ timestamp: Date.now() });

  var formData = {};
  formData[EDIT_SUGGESTION_FIELDS.originalId] = record.id;
  formData[EDIT_SUGGESTION_FIELDS.originalTitle] = record.title || '';
  formData[EDIT_SUGGESTION_FIELDS.newTitle] = _editState.editTitle;
  formData[EDIT_SUGGESTION_FIELDS.newCategory] = _editState.editCategory;
  formData[EDIT_SUGGESTION_FIELDS.newKeywords] = _editState.editKeywords;
  formData[EDIT_SUGGESTION_FIELDS.newSummary] = _editState.editSummary;
  formData[EDIT_SUGGESTION_FIELDS.newBody] = _editState.editBody;
  formData[EDIT_SUGGESTION_FIELDS.editNote] = _editState.editNote;

  this.utils.yida.saveFormData({
    formUuid: EDIT_SUGGESTION_FORM_UUID,
    formDataJson: JSON.stringify(formData),
  }).then(function () {
    _editState.editing = false;
    _editState.submitting = false;
    _editState.editError = '';
    if (self.utils && self.utils.toast) {
      self.utils.toast({ title: '编辑建议已提交，等待管理员审批', type: 'success' });
    }
    self.setState({ timestamp: Date.now() });
  }).catch(function (err) {
    _editState.submitting = false;
    _editState.editError = '提交失败：' + (err && err.message ? err.message : '请确认已登录后重试');
    self.setState({ timestamp: Date.now() });
  });
}

export function openDoc(record) {
  if (!record || !record.id || typeof window === 'undefined') {
    return;
  }
  window.location.href = getDocUrl(record.id);
}

export function renderMarkdownContent(content) {
  return (
    <div
      className="oy-doc-markdown"
      style={styles.markdown}
      dangerouslySetInnerHTML={{ __html: markdownToHtml(content) }}
    />
  );
}

export function renderBlockNoteContent(record) {
  var content = buildDocumentMarkdown(record);
  return this.renderMarkdownContent(content);
}

export function renderHeader() {
  var record = _customState.record;
  return (
    <header style={styles.header}>
      <button type="button" onClick={(e) => { this.goHome(); }} style={styles.backButton}>返回 OpenYida</button>
      <div style={styles.headerTitle}>
        <span style={styles.logoMark}><img src={YIDA_SOURCE_ICON_DATA_URI} alt="" style={styles.logoIcon} /></span>
        <span style={styles.headerName}>知识库文档</span>
      </div>
      <div style={styles.headerActions}>
        <button type="button" onClick={(e) => { this.reloadDocument(); }} style={styles.headerButton}>刷新</button>
        {record ? <button type="button" onClick={(e) => { this.copyDocLink(); }} style={styles.headerButton}>复制链接</button> : null}
      </div>
    </header>
  );
}

export function renderLoading() {
  return (
    <main style={styles.centerStage}>
      <div style={styles.statusEyebrow}>OpenYida Knowledge</div>
      <div style={styles.statusTitle}>正在读取资料</div>
      <div style={styles.statusText}>从宜搭知识库加载文档内容。</div>
    </main>
  );
}

export function renderError() {
  return (
    <main style={styles.centerStage}>
      <div style={styles.statusEyebrow}>OpenYida Knowledge</div>
      <div style={styles.statusTitle}>资料暂时不可用</div>
      <div style={styles.statusText}>{_customState.error || '请稍后重试。'}</div>
      <div style={styles.statusActions}>
        <button type="button" onClick={(e) => { this.reloadDocument(); }} style={styles.primaryButton}>重新读取</button>
        <button type="button" onClick={(e) => { this.goHome(); }} style={styles.secondaryButton}>返回 OpenYida</button>
      </div>
    </main>
  );
}

export function renderDocList() {
  var self = this;
  var docs = _customState.docs || [];
  return (
    <main style={styles.listStage}>
      <div style={styles.listInner}>
        <div style={styles.statusEyebrow}>OpenYida Knowledge</div>
        <h1 style={styles.listTitle}>知识库文档</h1>
        <p style={styles.listSummary}>这些文档来自 OpenYida 助手知识库，资料来源链接会打开对应的详情页。</p>
        <div style={styles.docList}>
          {docs.length ? docs.map((record) => (
            <button key={record.id} type="button" onClick={(e) => { self.openDoc(record); }} style={styles.docListItem}>
              <span style={styles.docListTop}>
                <span style={styles.docListTitle}>{record.title}</span>
                <span style={styles.docListType}>{record.type}</span>
              </span>
              <span style={styles.docListText}>{record.summary || record.source || 'OpenYida 助手知识库'}</span>
            </button>
          )) : (
            <div style={styles.statusText}>当前没有已发布资料。</div>
          )}
        </div>
      </div>
    </main>
  );
}

export function renderDocument() {
  var record = _customState.record;
  if (!record) {
    return this.renderError();
  }
  if (_editState.editing) {
    return this.renderEditMode(record);
  }
  var updatedAt = formatDate(record.updatedAt);
  var contributors = record.contributors || [];
  return (
    <main className="oy-doc-scroll" style={styles.documentScroll}>
      <article style={styles.article}>
        <div style={styles.breadcrumb}>OpenYida 助手 / 知识库</div>
        <div style={styles.titleRow}>
          <h1 style={styles.title}>{record.title}</h1>
          <button type="button" onClick={(e) => { this.enterEditMode(); }} style={styles.editButton}>✏️ 编辑</button>
        </div>
        <div style={styles.metaRow}>
          <span style={styles.metaPill}>{record.type}</span>
          {updatedAt ? <span style={styles.metaText}>更新于 {updatedAt}</span> : null}
          {record.source ? <span style={styles.metaText}>来源：{record.source}</span> : null}
        </div>
        {contributors.length > 0 ? (
          <div style={styles.contributorRow}>
            <span style={styles.contributorLabel}>贡献者</span>
            {contributors.map(function (name) {
              return <span key={name} style={styles.contributorPill}>{name}</span>;
            })}
          </div>
        ) : null}
        {record.summary ? (
          <section style={styles.callout}>
            <div style={styles.calloutIcon}>i</div>
            <div style={styles.calloutText}>{record.summary}</div>
          </section>
        ) : null}
        {record.keywords ? (
          <div style={styles.keywordRow}>
            {record.keywords.split(/[、,，\s]+/).filter(Boolean).slice(0, 10).map((keyword) => (
              <span key={keyword} style={styles.keyword}>{keyword}</span>
            ))}
          </div>
        ) : null}
        {this.renderBlockNoteContent(record)}
      </article>
    </main>
  );
}

export function renderEditMode(record) {
  var self = this;
  var categoryOptions = ['常见问答', '操作指南', '技术文档', '产品公告', '最佳实践'];
  var editKey = record.id + '-edit';
  return (
    <main className="oy-doc-scroll" style={styles.documentScroll}>
      <article style={styles.article}>
        <div style={styles.breadcrumb}>OpenYida 助手 / 知识库 / 编辑模式</div>
        <div style={styles.titleRow}>
          <h1 style={styles.title}>编辑文档</h1>
          <div style={styles.editActions}>
            <button type="button" onClick={(e) => { self.cancelEdit(); }} style={styles.cancelButton} disabled={_editState.submitting}>取消</button>
            <button type="button" onClick={(e) => { self.submitEditSuggestion(); }} style={styles.submitButton} disabled={_editState.submitting}>
              {_editState.submitting ? '提交中...' : '提交编辑建议'}
            </button>
          </div>
        </div>
        {_editState.editError ? (
          <div style={styles.editErrorBanner}>{_editState.editError}</div>
        ) : null}
        <div style={styles.editField}>
          <label style={styles.editLabel}>标题</label>
          <input
            key={editKey + '-title'}
            type="text"
            defaultValue={_editState.editTitle}
            onChange={(e) => { _editState.editTitle = e.target.value; }}
            style={styles.editInput}
            disabled={_editState.submitting}
          />
        </div>
        <div style={styles.editField}>
          <label style={styles.editLabel}>分类</label>
          <select
            key={editKey + '-cat'}
            defaultValue={_editState.editCategory}
            onChange={(e) => { _editState.editCategory = e.target.value; }}
            style={styles.editSelect}
            disabled={_editState.submitting}
          >
            {categoryOptions.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        </div>
        <div style={styles.editField}>
          <label style={styles.editLabel}>关键词</label>
          <input
            key={editKey + '-kw'}
            type="text"
            defaultValue={_editState.editKeywords}
            onChange={(e) => { _editState.editKeywords = e.target.value; }}
            style={styles.editInput}
            placeholder="多个关键词用 | 分隔"
            disabled={_editState.submitting}
          />
        </div>
        <div style={styles.editField}>
          <label style={styles.editLabel}>摘要</label>
          <textarea
            key={editKey + '-summary'}
            defaultValue={_editState.editSummary}
            onChange={(e) => { _editState.editSummary = e.target.value; }}
            style={styles.editTextareaShort}
            rows={3}
            disabled={_editState.submitting}
          />
        </div>
        <div style={styles.editField}>
          <label style={styles.editLabel}>正文（Markdown）</label>
          <textarea
            key={editKey + '-body'}
            defaultValue={_editState.editBody}
            onChange={(e) => { _editState.editBody = e.target.value; }}
            style={styles.editTextarea}
            rows={16}
            disabled={_editState.submitting}
          />
        </div>
        <div style={styles.editField}>
          <label style={styles.editLabel}>修改说明（可选，便于管理员审批）</label>
          <input
            key={editKey + '-note'}
            type="text"
            defaultValue={_editState.editNote}
            onChange={(e) => { _editState.editNote = e.target.value; }}
            style={styles.editInput}
            placeholder="简要说明修改了什么"
            disabled={_editState.submitting}
          />
        </div>
        <div style={styles.editHint}>提交后将由管理员审批，通过后才会更新到知识库。</div>
      </article>
    </main>
  );
}

export function renderJsx() {
  var timestamp = this.state && this.state.timestamp;
  var body = null;
  if (_customState.status === 'ready') {
    body = this.renderDocument();
  } else if (_customState.status === 'list') {
    body = this.renderDocList();
  } else if (_customState.status === 'error') {
    body = this.renderError();
  } else {
    body = this.renderLoading();
  }
  return (
    <div style={styles.page}>
      <div style={{ display: 'none' }}>{timestamp}</div>
      <style>{DOC_CSS}</style>
      {this.renderHeader()}
      {body}
    </div>
  );
}

var styles = {
  page: {
    minHeight: '100vh',
    height: '100vh',
    overflow: 'hidden',
    background: '#050505',
    color: '#f5f5f5',
    fontFamily: '"-apple-system-body","ui-sans-serif","-apple-system","system-ui","Segoe UI","Helvetica","Arial","sans-serif"',
  },
  header: {
    height: 58,
    boxSizing: 'border-box',
    display: 'grid',
    gridTemplateColumns: '180px minmax(0,1fr) 220px',
    alignItems: 'center',
    gap: 16,
    padding: '0 22px',
    borderBottom: '1px solid rgba(255,255,255,0.1)',
    background: '#050505',
  },
  backButton: {
    appearance: 'none',
    border: 0,
    background: 'transparent',
    color: '#f4f4f4',
    cursor: 'pointer',
    textAlign: 'left',
    fontSize: 14,
    fontWeight: 600,
  },
  headerTitle: {
    minWidth: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  logoMark: {
    display: 'flex',
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoIcon: {
    width: 19,
    height: 19,
    display: 'block',
  },
  headerName: {
    minWidth: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    fontSize: 15,
    fontWeight: 650,
    color: '#ffffff',
  },
  headerActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: 8,
  },
  headerButton: {
    appearance: 'none',
    border: '1px solid rgba(255,255,255,0.12)',
    background: '#151515',
    color: '#f4f4f4',
    cursor: 'pointer',
    borderRadius: 8,
    height: 32,
    padding: '0 12px',
    fontSize: 13,
    fontWeight: 600,
  },
  centerStage: {
    height: 'calc(100vh - 58px)',
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    textAlign: 'center',
  },
  statusEyebrow: {
    color: '#8fc8ff',
    fontSize: 13,
    fontWeight: 700,
    marginBottom: 14,
  },
  statusTitle: {
    color: '#ffffff',
    fontSize: 30,
    lineHeight: 1.25,
    fontWeight: 650,
    marginBottom: 12,
  },
  statusText: {
    maxWidth: 560,
    color: '#bdbdbd',
    fontSize: 15,
    lineHeight: 1.75,
  },
  statusActions: {
    display: 'flex',
    gap: 10,
    marginTop: 22,
  },
  primaryButton: {
    appearance: 'none',
    border: 0,
    background: '#f4f4f4',
    color: '#111',
    cursor: 'pointer',
    borderRadius: 10,
    height: 38,
    padding: '0 16px',
    fontSize: 14,
    fontWeight: 650,
  },
  secondaryButton: {
    appearance: 'none',
    border: '1px solid rgba(255,255,255,0.14)',
    background: '#151515',
    color: '#f4f4f4',
    cursor: 'pointer',
    borderRadius: 10,
    height: 38,
    padding: '0 16px',
    fontSize: 14,
    fontWeight: 650,
  },
  documentScroll: {
    height: 'calc(100vh - 58px)',
    overflowY: 'auto',
    boxSizing: 'border-box',
    padding: '56px 24px 92px',
  },
  article: {
    width: 'min(820px, 100%)',
    margin: '0 auto',
  },
  breadcrumb: {
    color: '#9b9b9b',
    fontSize: 13,
    lineHeight: 1.5,
    marginBottom: 18,
  },
  titleRow: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 16,
  },
  title: {
    margin: 0,
    color: '#fff',
    fontSize: 40,
    lineHeight: 1.18,
    fontWeight: 700,
    letterSpacing: 0,
    flex: 1,
    minWidth: 0,
  },
  editButton: {
    appearance: 'none',
    border: '1px solid rgba(0,137,255,0.35)',
    background: 'rgba(0,137,255,0.1)',
    color: '#9dccff',
    cursor: 'pointer',
    borderRadius: 8,
    height: 36,
    padding: '0 14px',
    fontSize: 14,
    fontWeight: 650,
    whiteSpace: 'nowrap',
    flexShrink: 0,
    marginTop: 6,
  },
  contributorRow: {
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  contributorLabel: {
    color: '#9b9b9b',
    fontSize: 13,
    fontWeight: 600,
  },
  contributorPill: {
    display: 'inline-flex',
    alignItems: 'center',
    height: 24,
    borderRadius: 999,
    background: 'rgba(76,175,80,0.14)',
    color: '#a5d6a7',
    padding: '0 10px',
    fontSize: 12,
    fontWeight: 650,
  },
  editActions: {
    display: 'flex',
    gap: 8,
    flexShrink: 0,
    marginTop: 6,
  },
  cancelButton: {
    appearance: 'none',
    border: '1px solid rgba(255,255,255,0.14)',
    background: '#151515',
    color: '#f4f4f4',
    cursor: 'pointer',
    borderRadius: 8,
    height: 36,
    padding: '0 14px',
    fontSize: 14,
    fontWeight: 650,
  },
  submitButton: {
    appearance: 'none',
    border: 0,
    background: '#0089ff',
    color: '#fff',
    cursor: 'pointer',
    borderRadius: 8,
    height: 36,
    padding: '0 16px',
    fontSize: 14,
    fontWeight: 650,
  },
  editErrorBanner: {
    margin: '12px 0 18px',
    padding: '10px 14px',
    borderRadius: 8,
    background: 'rgba(244,67,54,0.12)',
    border: '1px solid rgba(244,67,54,0.3)',
    color: '#ff8a80',
    fontSize: 14,
  },
  editField: {
    marginBottom: 20,
  },
  editLabel: {
    display: 'block',
    color: '#bdbdbd',
    fontSize: 13,
    fontWeight: 600,
    marginBottom: 6,
  },
  editInput: {
    display: 'block',
    width: '100%',
    boxSizing: 'border-box',
    height: 40,
    padding: '0 12px',
    border: '1px solid rgba(255,255,255,0.14)',
    borderRadius: 8,
    background: '#101010',
    color: '#f4f4f4',
    fontSize: 15,
    outline: 'none',
  },
  editSelect: {
    display: 'block',
    width: '100%',
    boxSizing: 'border-box',
    height: 40,
    padding: '0 10px',
    border: '1px solid rgba(255,255,255,0.14)',
    borderRadius: 8,
    background: '#101010',
    color: '#f4f4f4',
    fontSize: 15,
    outline: 'none',
  },
  editTextareaShort: {
    display: 'block',
    width: '100%',
    boxSizing: 'border-box',
    minHeight: 80,
    padding: '10px 12px',
    border: '1px solid rgba(255,255,255,0.14)',
    borderRadius: 8,
    background: '#101010',
    color: '#f4f4f4',
    fontSize: 15,
    lineHeight: 1.6,
    resize: 'vertical',
    outline: 'none',
  },
  editTextarea: {
    display: 'block',
    width: '100%',
    boxSizing: 'border-box',
    minHeight: 300,
    padding: '12px 14px',
    border: '1px solid rgba(255,255,255,0.14)',
    borderRadius: 8,
    background: '#101010',
    color: '#f4f4f4',
    fontSize: 15,
    lineHeight: 1.6,
    fontFamily: 'Menlo, Consolas, monospace',
    resize: 'vertical',
    outline: 'none',
  },
  editHint: {
    marginTop: 8,
    color: '#777',
    fontSize: 13,
  },
  metaRow: {
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 18,
    marginBottom: 28,
  },
  metaPill: {
    display: 'inline-flex',
    alignItems: 'center',
    height: 26,
    borderRadius: 999,
    background: 'rgba(0,137,255,0.16)',
    color: '#aad5ff',
    padding: '0 10px',
    fontSize: 12,
    fontWeight: 700,
  },
  metaText: {
    color: '#a9a9a9',
    fontSize: 13,
  },
  callout: {
    display: 'grid',
    gridTemplateColumns: '24px minmax(0,1fr)',
    gap: 12,
    margin: '0 0 26px',
    padding: '15px 16px',
    borderRadius: 8,
    background: '#111820',
    border: '1px solid rgba(0,137,255,0.22)',
  },
  calloutIcon: {
    width: 22,
    height: 22,
    borderRadius: 999,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#0089ff',
    color: '#fff',
    fontSize: 13,
    fontWeight: 800,
    fontFamily: 'Georgia,serif',
  },
  calloutText: {
    color: '#dcecff',
    fontSize: 14,
    lineHeight: 1.75,
  },
  keywordRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 30,
  },
  keyword: {
    display: 'inline-flex',
    alignItems: 'center',
    height: 26,
    borderRadius: 6,
    background: '#202020',
    color: '#d7d7d7',
    padding: '0 9px',
    fontSize: 12,
    fontWeight: 600,
  },
  blockNoteHost: {
    minHeight: 220,
    background: '#050505',
  },
  markdown: {
    color: '#f4f4f4',
  },
  listStage: {
    height: 'calc(100vh - 58px)',
    overflowY: 'auto',
    boxSizing: 'border-box',
    padding: '60px 24px 90px',
  },
  listInner: {
    width: 'min(880px, 100%)',
    margin: '0 auto',
  },
  listTitle: {
    margin: 0,
    color: '#fff',
    fontSize: 38,
    lineHeight: 1.2,
    fontWeight: 700,
    letterSpacing: 0,
  },
  listSummary: {
    margin: '14px 0 26px',
    color: '#bdbdbd',
    fontSize: 15,
    lineHeight: 1.75,
  },
  docList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
  },
  docListItem: {
    appearance: 'none',
    border: '1px solid rgba(255,255,255,0.11)',
    background: '#101010',
    color: '#f4f4f4',
    cursor: 'pointer',
    borderRadius: 8,
    padding: '16px 18px',
    textAlign: 'left',
  },
  docListTop: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  docListTitle: {
    minWidth: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    color: '#fff',
    fontSize: 16,
    fontWeight: 650,
  },
  docListType: {
    display: 'inline-flex',
    alignItems: 'center',
    height: 22,
    borderRadius: 999,
    background: 'rgba(0,137,255,0.14)',
    color: '#a9d5ff',
    padding: '0 8px',
    fontSize: 12,
    fontWeight: 650,
  },
  docListText: {
    display: 'block',
    color: '#bdbdbd',
    fontSize: 13,
    lineHeight: 1.65,
  },
};
