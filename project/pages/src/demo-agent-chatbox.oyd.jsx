/**
 * OpenYida Assistant
 *
 * 一个可运行在宜搭自定义页面里的正式 OpenYida 助手模块：
 * - 通过宜搭 AI 文本接口接入 Qwen 生成回答
 * - 面向 OpenYida 查询、登录诊断、资料检索、发布排查等场景给出可执行建议
 * - 支持在对话框里上传或粘贴图片附件，后续可替换为 OCR / 视觉理解服务
 */

var STORAGE_KEY = 'openyida.agentChatboxDemo.v9';
var MARKDOWN_IT_URL = 'https://g.alicdn.com/code/lib/markdown-it/13.0.1/markdown-it.min.js';
var TAILWIND_CDN = 'https://g.alicdn.com/code/lib/tailwindcss-browser/0.0.0-insiders.fed6c6a/index.global.min.js';
var DEFAULT_REQUEST_TIMEOUT_MS = 30000;
var MODEL_TIMEOUT_MS = 120000;
var DEFAULT_MAX_TOKENS = '3000';
var BRIDGE_DEFAULT_PORTS = [6736, 9432];
var BRIDGE_REQUEST_TIMEOUT_MS = 2800;
var BRIDGE_SESSION_KEY = 'openyida.localBridge.v1';
var BRIDGE_PAIR_TOKEN_KEY = 'openyida.localBridge.pairToken.v1';
var BRIDGE_PAIR_TOKEN_TTL_MS = 30 * 24 * 60 * 60 * 1000;
var BRIDGE_MIN_VERSION = '2026.5.21';
var BRIDGE_INSTALL_COMMAND = 'npm i -g openyida';
var BRIDGE_START_COMMAND_PREFIX = 'openyida bridge start --token ';
var BRIDGE_UPDATE_COMMAND = BRIDGE_INSTALL_COMMAND;
var DEFAULT_IMAGE_CONNECTOR = {
  connectorId: 'Http_2aa221179eef4c128de666c5b9c8df1b',
  actionId: 'flowerrecognize',
  connection: 2391,
};
var DEFAULT_APP_TYPE = 'APP_R1CJ1RH6159D9Y027TK2';
var CHAT_DATA_FORM_UUID = 'FORM-FB3ECF4841DB409B9771ED0D2A619E8AM1XE';
var CHAT_DATA_FIELDS = {
  workspaceKey: 'textField_dl9w1wzdf',
  userId: 'textField_dl9w2egl7',
  userName: 'textField_dl9w3ekf2',
  title: 'textField_dl9w4rflu',
  snapshot: 'textareaField_dl9w5fl4i',
  messageCount: 'numberField_dl9w64etf',
  updatedAt: 'dateField_dl9w7u5x2',
  clientVersion: 'textField_dl9w8735w',
};
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
};
var KNOWLEDGE_QUERY_PAGE_SIZE = 100;
var KNOWLEDGE_QUERY_MAX_PAGES = 60;
var KNOWLEDGE_MAX_RESULTS = 4;
var KNOWLEDGE_CACHE_KEY = 'openyida.knowledgeBase.cache.v2.' + KNOWLEDGE_DATA_FORM_UUID;
var KNOWLEDGE_CACHE_TTL_MS = 30 * 60 * 1000;
var KNOWLEDGE_CACHE_STALE_TTL_MS = 7 * 24 * 60 * 60 * 1000;
var REMOTE_SYNC_DEBOUNCE_MS = 2500;
var REMOTE_SYNC_MIN_INTERVAL_MS = 6000;
var REMOTE_MAX_SESSIONS = 20;
var REMOTE_MAX_MESSAGES_PER_SESSION = 400;
var MESSAGE_RENDER_INITIAL_COUNT = 40;
var MESSAGE_RENDER_STEP = 30;
var MESSAGE_SCROLL_TOP_THRESHOLD = 36;
var KNOWLEDGE_DOC_PAGE_PATH = '/s/openyida-doc';
var OPENYIDA_DOCS_URL = 'https://openyida.ai/docs';
var YIDA_DOCS_URL = 'https://docs.aliwork.com/docs/developer/learning';
var CHATGPT_FONT_FAMILY = '"-apple-system-body", "ui-sans-serif", "-apple-system", "system-ui", "Segoe UI", "Helvetica", "Apple Color Emoji", "Arial", "sans-serif", "Segoe UI Emoji", "Segoe UI Symbol"';
var DEFAULT_COMPOSER_PLACEHOLDER = '查询 OpenYida / 宜搭资料、应用或问题';
var YIDA_SOURCE_ICON_DATA_URI = 'data:image/svg+xml,%3Csvg%20viewBox%3D%220%200%201024%201024%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22%230089ff%22%3E%3Cpath%20d%3D%22M966.743%200H57.498A57.197%2057.197%200%200%200%20.06%2057.077v218.07a61.772%2061.772%200%200%201%2012.042%204.936L348.538%20473.83l336.196-193.987a64.421%2064.421%200%200%201%2087.902%2023.36l34.92%2060.208a63.94%2063.94%200%200%201-23.24%2087.54L449.084%20643.613v379.905h517.78a57.197%2057.197%200%200%200%2056.714-56.594V57.077A57.197%2057.197%200%200%200%20966.743%200z%22%2F%3E%3Cpath%20d%3D%22M.663%20501.163v465.76a56.715%2056.715%200%200%200%2016.255%2040.34%2057.558%2057.558%200%200%200%2040.58%2016.255H252.93V646.141z%22%2F%3E%3C%2Fg%3E%3C%2Fsvg%3E';

var TAILWIND_SOURCE_CSS = [
  '@import "tailwindcss/theme";',
  '@import "tailwindcss/preflight";',
  '@import "tailwindcss/utilities";',
  '@theme { --color-chat-bg: #050505; --color-chat-panel: #080808; --color-chat-surface: #2f2f2f; --color-chat-accent: #16b79e; }',
].join('\n');

var TAILWIND_FALLBACK_CSS = [
  '.oy-chat-btn{appearance:none;-webkit-appearance:none;font-family:inherit;}',
  '.oy-chat-scroll{scrollbar-width:thin;scrollbar-color:#4a4a4a transparent;}',
  '.oy-chat-input::placeholder{color:#bcbcbc;}',
].join('');

var MARKDOWN_CSS = [
  'body{background:#050505!important;font-family:"-apple-system-body","ui-sans-serif","-apple-system","system-ui","Segoe UI","Helvetica","Apple Color Emoji","Arial","sans-serif","Segoe UI Emoji","Segoe UI Symbol"!important;-webkit-font-smoothing:antialiased;}',
  '.next-aside-navigation{display:none!important;}',
  '.next-shell-main{padding-left:0!important;}',
  '.next-shell-sub-main{left:0!important;margin-left:0!important;width:100%!important;}',
  '.next-shell-page,.next-shell-content,.next-shell-content-inner,.render-engine-container,.vc-jsx{height:100%!important;min-height:100vh!important;background:#050505!important;}',
  '.vc-rootheader{display:none!important;}',
  '.vc-page-yida-page,.vc-deep-container-entry.vc-rootcontent{background:#050505!important;}',
  '.oy-agent-markdown{font-size:14px;line-height:1.74;color:#f4f4f4;word-break:break-word;font-weight:400;}',
  '.oy-agent-markdown.compact{font-size:11px;line-height:1.55;}',
  '.oy-agent-markdown p{margin:0 0 14px;}',
  '.oy-agent-markdown p:last-child{margin-bottom:0;}',
  '.oy-agent-markdown strong{font-weight:600;color:#ffffff;}',
  '.oy-agent-markdown ol,.oy-agent-markdown ul{margin:10px 0 18px 24px;padding:0;}',
  '.oy-agent-markdown li{margin:6px 0;padding-left:4px;}',
  '.oy-agent-markdown code{border:0;border-radius:5px;background:#2f2f2f;color:#f5f5f5;padding:2px 6px;font-family:Menlo,Consolas,monospace;font-size:0.9em;}',
  '.oy-agent-markdown pre{margin:14px 0;padding:12px 14px;border:1px solid #343434;border-radius:8px;background:#171717;color:#e7e7e7;overflow:auto;}',
  '.oy-agent-markdown pre code{border:0;background:transparent;color:inherit;padding:0;}',
  '.oy-agent-markdown blockquote{margin:14px 0;padding:10px 14px;border-left:3px solid #5f5f5f;background:#1f1f1f;color:#d7d7d7;}',
  '.oy-agent-markdown a{color:#ffffff;text-decoration:underline;text-underline-offset:4px;font-weight:650;}',
  '.oy-agent-markdown a[href*="/s/openyida-doc"],.oy-agent-markdown a[href*="/workbench/' + KNOWLEDGE_DATA_FORM_UUID + '"]{display:inline-flex;align-items:center;gap:7px;}',
  '.oy-agent-markdown a[href*="/s/openyida-doc"]::before,.oy-agent-markdown a[href*="/workbench/' + KNOWLEDGE_DATA_FORM_UUID + '"]::before{content:"";display:inline-block;width:15px;height:15px;flex:0 0 15px;background:url("' + YIDA_SOURCE_ICON_DATA_URI + '") center/contain no-repeat;}',
  '.oy-agent-markdown table{border-collapse:collapse;width:100%;margin:12px 0;font-size:12px;}',
  '.oy-agent-markdown th,.oy-agent-markdown td{border:1px solid #343434;padding:7px 9px;text-align:left;}',
  '.oy-agent-markdown th{background:#202020;font-weight:600;}',
  '.oy-chat-scroll::-webkit-scrollbar{width:8px;height:8px;}',
  '.oy-chat-scroll::-webkit-scrollbar-thumb{background:#4a4a4a;border-radius:999px;}',
  '.oy-chat-scroll::-webkit-scrollbar-track{background:transparent;}',
  '.oy-chat-input::placeholder{color:#bcbcbc;}',
  '@keyframes oy-thinking-breathe{0%,100%{transform:scale(.72);opacity:.62;}50%{transform:scale(1);opacity:1;}}',
  '.oy-thinking-dot{animation:oy-thinking-breathe 1.25s ease-in-out infinite;transform-origin:center;}',
].join('\n');

function cx() {
  var values = Array.prototype.slice.call(arguments);
  return values.filter(Boolean).join(' ');
}

var TEXT_PROMPTS = [
  '你能做什么？',
  '查一下我的宜搭应用列表',
  '悟空怎么使用 OpenYida？把完整链路讲清楚',
  'OpenYida 发布页面失败，应该怎么排查？',
  'openyida login 一直不生效怎么排查？',
];

var IMAGE_PROMPTS = [
  '我上传了页面截图，帮我判断能不能用 OpenYida 改造',
  '根据上传的表单截图，帮我整理字段、权限和流程规则',
  '分析这张流程图，拆成宜搭流程节点和 OpenYida 执行计划',
];

var QUICK_PROMPTS = [
  TEXT_PROMPTS[0],
  TEXT_PROMPTS[1],
  TEXT_PROMPTS[2],
  TEXT_PROMPTS[3],
  TEXT_PROMPTS[4],
];

var KNOWLEDGE_SOURCES = [
  {
    id: 'openyida-docs',
    title: 'OpenYida Docs',
    type: '官方文档',
    url: OPENYIDA_DOCS_URL,
    detail: 'CLI、技能、页面发布、数据管理与 AI Coding 工作流',
  },
  {
    id: 'yida-developer',
    title: '宜搭开发者手册',
    type: '宜搭文档',
    url: YIDA_DOCS_URL,
    detail: '表单、流程、报表、自定义页面、API 与组件能力',
  },
  {
    id: 'yida-page-types',
    title: '宜搭页面类型',
    type: '宜搭文档',
    url: 'https://docs.aliwork.com/docs/developer/usage/newApp',
    detail: '普通表单、流程表单、报表、自定义页面和门户等模块边界',
  },
  {
    id: 'openyida-skills',
    title: 'openyida-skills.zip',
    type: '技能包',
    url: OPENYIDA_DOCS_URL,
    detail: '悟空上传技能包，AI Coding 工具环境使用 OpenYida 技能',
  },
  {
    id: 'security-boundary',
    title: '数据安全边界',
    type: '权限策略',
    url: OPENYIDA_DOCS_URL,
    detail: '默认只处理当前用户会话、上传内容和公开文档；业务数据按宜搭权限读取',
  },
];

var DEFAULT_SESSIONS = [
  {
    id: 'session-main',
    title: '新聊天',
    subtitle: '空白会话',
    updatedAt: '刚刚',
  },
];

var DEFAULT_MESSAGES = {
  'session-main': [],
};

var DEFAULT_TOOL_RUNS = [
  { id: 'run-1', name: 'support.init', status: 'done', detail: 'OpenYida 助手已准备', time: '09:30' },
  { id: 'run-2', name: 'ai.model', status: 'done', detail: 'Qwen 文本模型已接入', time: '09:30' },
  { id: 'run-3', name: 'support.datasource', status: 'done', detail: '宜搭会话表与知识库已接入', time: '09:30' },
  { id: 'run-4', name: 'security.scope', status: 'done', detail: '每个人只能看自己的数据', time: '09:30' },
  { id: 'run-5', name: 'guardrail.confirm', status: 'ready', detail: '搭建/写入类需求建议切换强模型', time: '09:30' },
];

var _remoteSyncTimer = null;
var _remoteSyncInFlight = false;
var _remoteSyncQueued = false;
var _remoteRestoring = false;
var _lastRemoteSyncAt = 0;
var _bridgePollTimer = null;

var tw = {
  page: 'relative h-screen min-h-screen overflow-hidden bg-[#050505] text-[#f5f5f5] font-sans tracking-normal',
  shell: 'grid h-screen min-h-screen overflow-hidden bg-[#050505] [grid-template-columns:260px_minmax(0,1fr)]',
  shellCollapsed: '[grid-template-columns:58px_minmax(0,1fr)]',
  mobileShell: 'block min-h-screen bg-[#050505]',
  sidebar: 'box-border flex h-screen min-h-screen flex-col gap-4 overflow-hidden border-r border-[#222222] bg-[#080808] px-2 pt-4 text-[#f5f5f5]',
  sidebarCollapsed: 'items-center justify-between px-0 py-4',
  collapsedRail: 'flex flex-col items-center gap-4',
  railBottom: 'flex w-full justify-center',
  railIcon: 'oy-chat-btn flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-lg border-0 bg-transparent text-[#f4f4f4]',
  brandRow: 'flex min-h-8 items-center justify-between px-3',
  brandTitle: 'text-lg font-semibold leading-[1.1] text-white',
  sidebarToggle: 'oy-chat-btn flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg border-0 bg-transparent text-[#d7d7d7]',
  sidebarSection: 'flex flex-col gap-1',
  sidebarSectionHeader: 'oy-chat-btn flex h-8 w-full cursor-pointer items-center justify-between rounded-lg border-0 bg-transparent px-3 text-left text-sm font-semibold text-[#d7d7d7]',
  sidebarSectionLabel: 'min-w-0 overflow-hidden text-ellipsis whitespace-nowrap',
  sidebarSectionIcon: 'flex h-5 w-5 shrink-0 items-center justify-center text-[#a4a4a4]',
  recentSection: 'min-h-0 flex-1',
  sidebarAction: 'oy-chat-btn flex h-10 w-full cursor-pointer items-center gap-3 rounded-[10px] border-0 bg-transparent px-3 text-left text-sm text-[#f2f2f2]',
  sidebarActionActive: 'bg-[#303030]',
  sidebarActionIcon: 'flex w-[26px] shrink-0 items-center justify-center text-white',
  sidebarActionText: 'min-w-0 overflow-hidden text-ellipsis whitespace-nowrap',
  projectList: 'flex flex-col gap-1',
  projectItemRow: 'group relative h-[34px]',
  projectItem: 'oy-chat-btn flex h-[34px] w-full cursor-pointer items-center gap-2.5 rounded-[10px] border-0 bg-transparent px-2.5 text-left text-sm text-[#f2f2f2]',
  projectItemActive: 'bg-white/10',
  projectItemWrap: 'relative',
  projectItemText: 'min-w-0 flex-1 overflow-hidden text-ellipsis whitespace-nowrap',
  projectItemActions: 'absolute right-1.5 top-1/2 flex items-center gap-1 opacity-0 group-hover:opacity-100',
  projectItemActionsActive: 'opacity-100',
  projectInlineAction: 'oy-chat-btn flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg border-0 bg-transparent text-[#f4f4f4]',
  projectSessionList: 'mt-1 flex flex-col gap-1 pb-1 pl-9 pr-1',
  projectSessionItem: 'oy-chat-btn flex h-[34px] w-full cursor-pointer items-center gap-2 rounded-xl border-0 bg-transparent px-3 text-left text-sm text-[#f2f2f2]',
  projectSessionItemActive: 'bg-white/10',
  projectSessionDot: 'ml-auto h-2.5 w-2.5 rounded-full bg-[#1683ff]',
  projectEmpty: 'px-3 py-2 text-xs leading-relaxed text-[#8c8c8c]',
  sessionList: 'oy-chat-scroll flex min-h-0 flex-col gap-0.5 overflow-y-auto pb-3',
  sessionItemWrap: 'group relative',
  sessionItem: 'oy-chat-btn flex h-9 min-h-9 w-full cursor-pointer items-center rounded-[10px] border-0 bg-transparent px-3 pr-10 text-left text-[#f2f2f2]',
  sessionItemActive: 'bg-[#303030]',
  sessionMoreButton: 'oy-chat-btn absolute right-1 top-1/2 flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg border-0 bg-transparent text-[#f4f4f4] opacity-0 group-hover:opacity-100',
  sessionMoreButtonActive: 'opacity-100',
  sessionText: 'block min-w-0',
  sessionTitle: 'block overflow-hidden text-ellipsis whitespace-nowrap text-sm font-normal leading-tight',
  sessionPinnedMark: 'ml-1 text-[11px] text-[#a7a7a7]',
  sessionActionMenu: 'absolute z-50 w-[230px] rounded-[18px] border border-white/10 bg-[#333333] p-2 text-[#f4f4f4] shadow-[0_18px_56px_rgba(0,0,0,0.45)]',
  sessionActionItem: 'oy-chat-btn flex h-11 w-full cursor-pointer items-center gap-3 rounded-xl border-0 bg-transparent px-3 text-left text-base text-[#f4f4f4]',
  sessionActionDanger: 'text-[#ff5f5f]',
  sessionActionDivider: 'my-2 h-px bg-white/12',
  sessionMoveList: 'mt-1 rounded-xl bg-black/10 p-1',
  searchOverlay: 'absolute inset-0 z-40 flex items-start justify-center bg-black/20 px-6 pt-[18vh]',
  searchDialog: 'w-[min(680px,calc(100vw_-_80px))] max-h-[72vh] overflow-hidden rounded-[18px] border border-white/10 bg-[#303030] text-[#f4f4f4] shadow-[0_28px_90px_rgba(0,0,0,0.5)]',
  searchHeader: 'flex h-[68px] items-center gap-3 border-b border-white/10 px-6',
  searchInput: 'h-10 min-w-0 flex-1 border-0 bg-transparent text-lg text-[#f4f4f4] outline-none placeholder:text-[#b8b8b8]',
  searchClose: 'oy-chat-btn flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-lg border-0 bg-transparent text-[#b8b8b8]',
  searchBody: 'oy-chat-scroll max-h-[calc(72vh_-_68px)] overflow-y-auto px-5 py-4',
  searchNewItem: 'oy-chat-btn flex h-12 w-full cursor-pointer items-center gap-3 rounded-xl border-0 bg-transparent px-3 text-left text-base text-[#f4f4f4] hover:bg-white/10',
  searchSectionLabel: 'px-3 pb-2 pt-4 text-sm text-[#a7a7a7]',
  searchResultItem: 'oy-chat-btn flex h-12 w-full cursor-pointer items-center gap-3 rounded-xl border-0 bg-transparent px-3 text-left text-base text-[#f4f4f4] hover:bg-white/10',
  searchResultIcon: 'flex h-6 w-6 shrink-0 items-center justify-center text-[#f4f4f4]',
  searchResultTitle: 'min-w-0 overflow-hidden text-ellipsis whitespace-nowrap',
  searchEmpty: 'px-3 py-10 text-center text-sm text-[#a7a7a7]',
  actionDialogOverlay: 'absolute inset-0 z-[70] flex items-center justify-center bg-black/35 px-6',
  actionDialog: 'w-[min(420px,calc(100vw_-_48px))] rounded-[18px] border border-white/10 bg-[#303030] p-4 text-[#f4f4f4] shadow-[0_28px_90px_rgba(0,0,0,0.5)]',
  actionDialogTitle: 'text-base font-medium text-white',
  actionDialogMessage: 'mt-2 text-sm leading-6 text-[#cfcfcf]',
  actionDialogInput: 'mt-4 h-11 w-full rounded-xl border border-white/10 bg-[#252525] px-3 text-sm text-[#f4f4f4] outline-none placeholder:text-[#8f8f8f]',
  actionDialogActions: 'mt-4 flex justify-end gap-2',
  actionDialogSecondary: 'oy-chat-btn h-9 cursor-pointer rounded-xl border-0 bg-white/10 px-4 text-sm text-[#f4f4f4]',
  actionDialogPrimary: 'oy-chat-btn h-9 cursor-pointer rounded-xl border-0 bg-[#f4f4f4] px-4 text-sm font-medium text-[#111111]',
  actionDialogDanger: 'bg-[#ff5f5f] text-white',
  userBar: 'grid h-14 shrink-0 grid-cols-[32px_minmax(0,1fr)_28px] items-center gap-2.5 border-t border-[#1f1f1f] px-3',
  userAvatarMini: 'flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#16b79e] text-[11px] font-bold text-white',
  userAvatarImage: 'h-7 w-7 shrink-0 rounded-full object-cover',
  userMeta: 'min-w-0',
  userName: 'overflow-hidden text-ellipsis whitespace-nowrap text-sm leading-tight text-white',
  storeIcon: 'text-center text-lg text-[#cfcfcf]',
  chatPanel: 'relative flex h-screen min-h-screen min-w-0 flex-col bg-[#050505]',
  chatHeader: 'flex min-h-14 shrink-0 items-center justify-between gap-4 border-b border-white/10 bg-[#050505] px-5',
  headerTitle: 'min-h-5 text-sm font-semibold text-[#f5f5f5]',
  headerProject: 'flex min-w-0 items-center gap-3 text-white',
  headerProjectIcon: 'flex h-8 w-8 shrink-0 items-center justify-center text-[#f4f4f4]',
  headerProjectTitle: 'min-w-0 overflow-hidden text-ellipsis whitespace-nowrap text-[24px] font-medium leading-tight text-white',
  headerActions: 'ml-auto flex items-center gap-3',
  shareButton: 'oy-chat-btn flex h-8 cursor-pointer items-center gap-2 rounded-lg border-0 bg-transparent text-sm font-semibold text-white',
  iconButton: 'oy-chat-btn flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border-0 bg-transparent text-white',
  messageList: 'oy-chat-scroll flex min-h-0 flex-1 flex-col items-center gap-[18px] overflow-y-auto px-6 pb-6 pt-16',
  messageListEmpty: 'justify-center py-0',
  emptyStage: 'flex min-h-0 flex-1 flex-col items-center justify-center px-6',
  emptyHero: 'flex min-h-[150px] w-full -translate-y-10 items-center justify-center',
  emptyTitle: 'text-center text-2xl font-normal leading-tight text-white',
  projectHero: 'flex items-center justify-center gap-3 text-white',
  projectHeroIcon: 'flex h-8 w-8 items-center justify-center text-[#f4f4f4]',
  projectHeroTitle: 'min-w-0 max-w-[560px] overflow-hidden text-ellipsis whitespace-nowrap text-2xl font-medium leading-tight text-white',
  messageRow: 'flex w-full max-w-[840px] items-start justify-start',
  messageRowUser: 'justify-end',
  messageBubble: 'w-[min(100%,840px)] min-w-0 max-w-[840px] rounded-none border-0 bg-transparent px-1 shadow-none',
  userBubble: 'w-auto max-w-[620px] rounded-[18px] border-0 bg-[#2f2f2f] px-4 py-2.5',
  messageMarkdown: 'text-sm text-[#f4f4f4]',
  errorMarkdown: 'text-[#ffb4a9]',
  messageActions: 'mt-2 flex items-center gap-1 text-[#a7a7a7]',
  messageActionButton: 'oy-chat-btn flex h-7 w-7 cursor-pointer items-center justify-center rounded-md border-0 bg-transparent p-0 text-[#a7a7a7] hover:bg-[#242424] hover:text-white',
  thinkingDots: 'flex h-8 items-center',
  dotA: 'oy-thinking-dot h-3.5 w-3.5 rounded-full bg-white',
  composer: 'mx-auto mb-8 w-[min(840px,calc(100%_-_48px))] shrink-0 bg-transparent',
  composerCentered: 'mb-0 mt-14 w-[min(760px,calc(100%_-_48px))]',
  inputRow: 'relative flex min-h-[92px] flex-col items-stretch gap-2 rounded-[26px] border border-white/5 bg-[#2f2f2f] px-4 pb-2.5 pt-3.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04),0_20px_52px_rgba(0,0,0,0.28)]',
  composerDisclaimer: 'mx-auto mt-2.5 max-w-[calc(100%_-_24px)] text-center text-[11px] leading-5 text-[#8f8f8f]',
  attachButton: 'oy-chat-btn flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full border-0 bg-transparent text-[#f5f5f5]',
  attachButtonOpen: 'bg-[#424242]',
  attachMenu: 'absolute bottom-[54px] left-3 z-20 w-[286px] rounded-[22px] border border-white/10 bg-[#333333] p-2 text-[#f4f4f4] shadow-[0_18px_56px_rgba(0,0,0,0.45)]',
  attachMenuItem: 'oy-chat-btn flex h-12 w-full cursor-pointer items-center justify-between gap-3 rounded-[14px] border-0 bg-transparent px-3 text-left text-base text-[#f4f4f4]',
  attachMenuItemActive: 'bg-white/10',
  attachMenuLeft: 'flex min-w-0 items-center gap-3',
  attachMenuIcon: 'flex h-6 w-6 shrink-0 items-center justify-center text-[#f4f4f4]',
  attachMenuLabel: 'overflow-hidden text-ellipsis whitespace-nowrap',
  attachMenuShortcut: 'shrink-0 text-sm text-[#bcbcbc]',
  attachMenuDivider: 'my-2 h-px bg-white/12',
  textarea: 'oy-chat-input min-h-7 max-h-[168px] w-full resize-none overflow-hidden rounded-none border-0 bg-transparent px-1 py-0 text-base leading-7 text-[#f7f7f7] outline-none placeholder:text-[#bcbcbc]',
  composerBottom: 'flex h-10 w-full items-center justify-between gap-3',
  composerRight: 'flex h-9 shrink-0 items-center gap-3',
  modelSelector: 'oy-chat-btn flex h-8 cursor-pointer items-center gap-1 rounded-lg border-0 bg-transparent px-0 text-sm leading-8 text-[#bcbcbc]',
  micButton: 'oy-chat-btn flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border-0 bg-transparent text-white',
  sendButton: 'oy-chat-btn flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-full border-0 bg-[#f5f5f5] p-0 text-xl font-semibold leading-none text-[#111111]',
  sendButtonDisabled: 'cursor-not-allowed bg-[#666666] text-[#d6d6d6]',
  hiddenFileInput: 'hidden',
  pendingImage: 'relative mb-1 flex w-[184px] max-w-[64%] flex-col overflow-hidden rounded-[18px] border border-white/15 bg-[#f7f7f7] text-[#111111] shadow-[0_8px_28px_rgba(0,0,0,0.2)]',
  pendingImageCompact: 'flex items-center gap-2 border-t border-[#333333] bg-[#151515] px-3 py-[9px]',
  pendingImageThumb: 'h-[132px] w-full shrink-0 object-cover',
  pendingImageThumbCompact: 'h-[34px] w-[42px] shrink-0 rounded-lg border border-[#4a4a4a] object-cover',
  pendingImageMeta: 'min-w-0 flex-1',
  pendingImageMetaCard: 'min-w-0 px-3 py-2',
  pendingImageName: 'overflow-hidden text-ellipsis whitespace-nowrap text-xs font-semibold text-[#202020]',
  pendingImageNameCompact: 'overflow-hidden text-ellipsis whitespace-nowrap text-xs font-semibold text-[#f4f4f4]',
  pendingImageSize: 'mt-0.5 text-[11px] text-[#6f6f6f]',
  pendingImageSizeCompact: 'mt-0.5 text-[11px] text-[#a4a4a4]',
  pendingImageRemove: 'oy-chat-btn absolute right-2 top-2 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full border-0 bg-white/90 p-0 text-xl leading-none text-[#171717] shadow-[0_2px_8px_rgba(0,0,0,0.18)]',
  pendingImageRemoveCompact: 'oy-chat-btn h-[26px] cursor-pointer rounded-lg border border-[#4a4a4a] bg-[#2a2a2a] px-2 text-xs font-semibold text-[#f4f4f4]',
  attachmentPreview: 'mb-3 flex max-w-[360px] items-center gap-2.5 rounded-xl border border-[#414141] bg-[#1d1d1d] p-2',
  attachmentPreviewCompact: 'mb-2 flex items-center gap-2 rounded-[10px] border border-[#414141] bg-[#1d1d1d] p-1.5',
  attachmentImage: 'h-16 w-[88px] shrink-0 rounded-lg border border-[#4a4a4a] object-cover',
  attachmentImageCompact: 'h-[46px] w-[62px] shrink-0 rounded-lg border border-[#4a4a4a] object-cover',
  attachmentInfo: 'min-w-0',
  attachmentName: 'overflow-hidden text-ellipsis whitespace-nowrap text-xs font-semibold text-[#f4f4f4]',
  attachmentSize: 'mt-0.5 text-[11px] text-[#a4a4a4]',
  mobileSessionBar: 'flex gap-2 border-b border-[#222222] bg-[#080808] px-3 py-2.5',
  mobileNewButton: 'oy-chat-btn flex h-[42px] w-[46px] shrink-0 items-center justify-center rounded-[10px] border-0 bg-[#303030] font-semibold text-white',
  mobileSessionScroll: 'oy-chat-scroll flex min-w-0 gap-2 overflow-x-auto',
};

var _customState = {
  sessions: cloneSessions(DEFAULT_SESSIONS),
  projects: [],
  activeSessionId: 'session-main',
  messages: cloneMessageMap(DEFAULT_MESSAGES),
  toolRuns: cloneToolRuns(DEFAULT_TOOL_RUNS),
  mode: 'mixed',
  provider: 'yida-text',
  draft: '',
  pendingImage: null,
  widgetDraft: '',
  widgetPendingImage: null,
  widgetOpen: false,
  attachMenuOpen: false,
  searchOpen: false,
  searchQuery: '',
  sessionMenuOpenId: '',
  sessionMenuTop: 0,
  sessionMoveOpenId: '',
  projectMenuOpenId: '',
  projectMenuTop: 0,
  projectOpenMap: {},
  actionDialog: null,
  activeProjectId: '',
  sidebarCollapsed: false,
  projectSectionOpen: true,
  recentSectionOpen: true,
  remoteLoaded: false,
  remoteFormInstId: '',
  remoteSyncStatus: 'idle',
  bridgePanelOpen: false,
  bridgeStatus: 'idle',
  bridgeBaseUrl: '',
  bridgeAccessToken: '',
  bridgePairToken: '',
  bridgeVersion: '',
  bridgeMessage: '等待连接本地 OpenYida',
  bridgeLogin: null,
  bridgeAllowedOrigins: [],
  bridgeQrUrl: '',
  bridgeLoginSessionId: '',
  bridgeOrganizations: [],
  bridgeBusy: false,
  bridgeCapabilities: [],
  confirmCard: null,
  isSending: false,
  statusText: 'Qwen 就绪',
  markdownReady: false,
  messageRenderCount: MESSAGE_RENDER_INITIAL_COUNT,
  sequence: 3,
  ready: false,
};

function cloneSessions(sessions) {
  return (sessions || []).map((item) => ({
    id: item.id,
    title: item.title,
    subtitle: item.subtitle,
    updatedAt: item.updatedAt,
    projectId: item.projectId || '',
    pinned: !!item.pinned,
    archived: !!item.archived,
  }));
}

function cloneProjects(projects) {
  return (projects || []).map((item) => ({
    id: item.id,
    title: item.title,
    subtitle: item.subtitle,
  }));
}

function isDemoSessionId(id) {
  return id === 'session-weekly' || id === 'session-crm';
}

function normalizeSessionsForSidebar(sessions) {
  var seen = {};
  var list = [];
  (sessions || []).forEach((item) => {
    if (!item || !item.id || item.archived || isDemoSessionId(item.id) || seen[item.id]) {
      return;
    }
    seen[item.id] = true;
    var rawTitle = String(item.title || '').trim();
    list.push({
      id: item.id,
      title: rawTitle === '新任务' ? '新聊天' : (rawTitle || '新聊天'),
      subtitle: item.subtitle || '最近',
      updatedAt: item.updatedAt || '刚刚',
      projectId: item.projectId || '',
      pinned: !!item.pinned,
      archived: false,
    });
  });
  list.sort((a, b) => {
    if (a.pinned && !b.pinned) {
      return -1;
    }
    if (!a.pinned && b.pinned) {
      return 1;
    }
    return 0;
  });
  return list.length ? list : cloneSessions(DEFAULT_SESSIONS);
}

function isDefaultNewChatTitle(title) {
  var value = String(title || '').trim();
  return value === '' || value === '新聊天' || value === '新任务';
}

function getSessionMessagesFromMap(sessionId, messageMap) {
  if (messageMap && messageMap[sessionId]) {
    return messageMap[sessionId] || [];
  }
  return getSessionMessages(sessionId);
}

function hasSessionContent(sessionId, messageMap) {
  var list = getSessionMessagesFromMap(sessionId, messageMap);
  return (list || []).some((message) => {
    if (!message) {
      return false;
    }
    if (String(message.content || '').trim()) {
      return true;
    }
    return !!(message.imageData || message.imageUrl || message.imagePersistNote);
  });
}

function getVisibleChatSessions(sessions, messageMap) {
  var hasActualSession = (sessions || []).some((session) => session && session.id && !session.archived && !isDemoSessionId(session.id));
  if (!hasActualSession) {
    return [];
  }
  return normalizeSessionsForSidebar(sessions).filter((session) => hasSessionContent(session.id, messageMap));
}

function getRecentSidebarSessions() {
  return getVisibleChatSessions(_customState.sessions, _customState.messages).filter((session) => !session.projectId);
}

function normalizeProjectsForSidebar(projects) {
  var seen = {};
  var list = [];
  (projects || []).forEach((item) => {
    if (!item || !item.id || !item.title || seen[item.id]) {
      return;
    }
    seen[item.id] = true;
    list.push({
      id: item.id,
      title: String(item.title || '').trim(),
      subtitle: item.subtitle || '',
    });
  });
  return list;
}

function normalizeMessagesForSessions(map, sessions) {
  var next = {};
  (sessions || []).forEach((session) => {
    next[session.id] = cloneMessages(map && map[session.id]);
  });
  return normalizeRestoredMessageMap(next);
}

function resolveActiveSessionId(activeSessionId, sessions) {
  var matched = (sessions || []).filter((item) => item && item.id === activeSessionId);
  if (matched.length) {
    return activeSessionId;
  }
  return sessions && sessions.length ? sessions[0].id : 'session-main';
}

function getCurrentUserProfile() {
  var user = typeof window !== 'undefined' && window.loginUser ? window.loginUser : {};
  var name = user.userName || user.nickName || user.name || user.userId || '宜搭用户';
  var dept = user.deptName ? String(user.deptName).replace(/,/g, ' / ') : '';
  var subtitle = [user.userId || '', dept].filter((item) => !!item).join(' · ') || user.nickName || '当前登录用户';
  return {
    name: name,
    subtitle: subtitle,
    userId: user.userId || '',
    avatar: user.avatar || '',
    initials: getUserInitials(name),
  };
}

function getCurrentUserOrgEntries() {
  var user = typeof window !== 'undefined' && window.loginUser ? window.loginUser : {};
  var names = String(user.deptName || '').split(',');
  var ids = String(user.deptId || '').split(',');
  var entries = [];
  names.forEach((name, index) => {
    var title = String(name || '').trim();
    if (!title) {
      return;
    }
    entries.push({
      id: 'dept-' + (ids[index] || title || index),
      title: title,
      subtitle: ids[index] || '',
    });
  });
  return entries;
}

function buildSearchChatResults(query) {
  var keyword = normalizeText(query);
  var sessions = getVisibleChatSessions(_customState.sessions, _customState.messages);
  if (!keyword) {
    return sessions.slice(0, 12);
  }
  return sessions.filter((session) => {
    var title = normalizeText(session.title || '');
    if (title.indexOf(keyword) >= 0) {
      return true;
    }
    var messages = getSessionMessages(session.id);
    return (messages || []).some((message) => normalizeText(message.content || '').indexOf(keyword) >= 0);
  }).slice(0, 20);
}

function getSearchGroupLabel(session) {
  var updatedAt = String(session && session.updatedAt ? session.updatedAt : '');
  if (updatedAt.indexOf('昨天') >= 0) {
    return '昨天';
  }
  if (updatedAt.indexOf('更早') >= 0 || updatedAt.indexOf('前') >= 0) {
    return '更早';
  }
  return '今天';
}

function groupSearchChatResults(results) {
  var groupMap = {};
  var groups = [];
  (results || []).forEach((session) => {
    var label = getSearchGroupLabel(session);
    if (!groupMap[label]) {
      groupMap[label] = {
        label: label,
        items: [],
      };
      groups.push(groupMap[label]);
    }
    groupMap[label].items.push(session);
  });
  return groups;
}

function getProjectSessions(projectId) {
  return getVisibleChatSessions(_customState.sessions, _customState.messages).filter((session) => session.projectId === projectId);
}

function isProjectExpanded(projectId) {
  var map = _customState.projectOpenMap || {};
  if (Object.prototype.hasOwnProperty.call(map, projectId)) {
    return !!map[projectId];
  }
  return true;
}

function getSessionDisplayTitle(session) {
  if (!session || !hasSessionContent(session.id, _customState.messages) || isDefaultNewChatTitle(session.title)) {
    return '';
  }
  return String(session.title || '').trim();
}

function getActiveDocumentTitle() {
  var title = getSessionDisplayTitle(getActiveSession());
  return title || 'OpenYida 助手';
}

function updateDocumentTitle() {
  if (typeof document === 'undefined') {
    return;
  }
  var title = getActiveDocumentTitle();
  if (document.title !== title) {
    document.title = title;
  }
}

function getSessionById(sessionId) {
  var matched = (_customState.sessions || []).filter((item) => item && item.id === sessionId);
  return matched.length ? matched[0] : null;
}

function getProjectById(projectId) {
  var matched = normalizeProjectsForSidebar(_customState.projects).filter((item) => item.id === projectId);
  return matched.length ? matched[0] : null;
}

function getActiveProject() {
  return _customState.activeProjectId ? getProjectById(_customState.activeProjectId) : null;
}

function getHeaderProject(session) {
  var projectId = session && session.projectId ? session.projectId : _customState.activeProjectId;
  return projectId ? getProjectById(projectId) : null;
}

function getComposerPlaceholder() {
  var project = getActiveProject();
  if (project && project.title) {
    return '在“' + project.title + '”中询问或开始新聊天';
  }
  return DEFAULT_COMPOSER_PLACEHOLDER;
}

function isGlobalNewChatActive() {
  var session = getActiveSession();
  return !!(session && !session.projectId && !_customState.activeProjectId && isBlankNewTaskSession(session, _customState.messages));
}

function getNextProjectTitle(projects) {
  var list = projects || [];
  if (!list.length) {
    return '新项目';
  }
  var index = list.length + 1;
  return '新项目 ' + index;
}

function actionDialogNeedsInput(dialog) {
  if (!dialog) {
    return false;
  }
  return !!dialog.input || (dialog.type && (dialog.type.indexOf('rename-') === 0 || dialog.type.indexOf('create-') === 0));
}

function getUserInitials(name) {
  var value = String(name || '').trim();
  if (!value) {
    return '我';
  }
  var parts = value.split(/\s+/).filter((item) => !!item);
  if (parts.length > 1) {
    return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
  }
  return value.slice(0, 2).toUpperCase();
}

function cloneMessages(messages) {
  return (messages || []).map((item) => {
    var cloned = {};
    Object.keys(item || {}).forEach((key) => {
      cloned[key] = item[key];
    });
    return cloned;
  });
}

function cloneMessageMap(map) {
  var next = {};
  Object.keys(map || {}).forEach((key) => {
    next[key] = cloneMessages(map[key]);
  });
  return next;
}

function normalizeRestoredMessageMap(map) {
  var next = cloneMessageMap(map);
  Object.keys(next || {}).forEach((key) => {
    next[key] = (next[key] || []).map((item) => {
      if (item && item.status === 'thinking') {
        var patched = {};
        Object.keys(item || {}).forEach((field) => {
          patched[field] = item[field];
        });
        patched.status = 'error';
        patched.content = '上次生成被中断，可以重新发送。';
        patched.meta = 'Agent';
        return patched;
      }
      return item;
    });
  });
  return next;
}

function cloneToolRuns(runs) {
  return (runs || []).map((item) => ({
    id: item.id,
    name: item.name,
    status: item.status,
    detail: item.detail,
    time: item.time,
  }));
}

function normalizeRestoredToolRuns(runs) {
  return cloneToolRuns(runs).map((item) => {
    if (item && item.detail) {
      var legacyAssistantName = ['OpenYida AI', String.fromCharCode(23458, 26381)].join(' ');
      item.detail = String(item.detail).split(legacyAssistantName).join('OpenYida 助手');
    }
    if (item && item.status === 'running') {
      return {
        id: item.id,
        name: item.name,
        status: 'error',
        detail: '上次执行被中断，可重新发起',
        time: item.time,
      };
    }
    return item;
  });
}

function two(value) {
  return value < 10 ? '0' + value : '' + value;
}

function getTimeLabel() {
  var now = new Date();
  return two(now.getHours()) + ':' + two(now.getMinutes());
}

function nextId(prefix) {
  _customState.sequence += 1;
  return prefix + '-' + new Date().getTime() + '-' + _customState.sequence;
}

function limitText(text, maxLength) {
  var value = String(text || '');
  if (value.length <= maxLength) {
    return value;
  }
  return value.slice(0, maxLength - 1) + '…';
}

function getActiveSession() {
  var sessions = _customState.sessions || [];
  var matched = sessions.filter((item) => item.id === _customState.activeSessionId);
  return matched.length ? matched[0] : sessions[0];
}

function getActiveMessages() {
  var session = getActiveSession();
  if (!session) {
    return [];
  }
  return (_customState.messages && _customState.messages[session.id]) || [];
}

function getSessionMessages(sessionId) {
  return (_customState.messages && _customState.messages[sessionId]) || [];
}

function getMessageRenderCount(total) {
  var count = Number(_customState.messageRenderCount || MESSAGE_RENDER_INITIAL_COUNT);
  if (!Number.isFinite(count) || count < MESSAGE_RENDER_INITIAL_COUNT) {
    count = MESSAGE_RENDER_INITIAL_COUNT;
  }
  return Math.min(Math.max(count, MESSAGE_RENDER_INITIAL_COUNT), total || 0);
}

function getRenderableMessages(messages) {
  var list = messages || [];
  var count = getMessageRenderCount(list.length);
  if (count >= list.length) {
    return list;
  }
  return list.slice(list.length - count);
}

function hasMoreEarlierMessages(messages) {
  var list = messages || [];
  return getMessageRenderCount(list.length) < list.length;
}

function isBlankNewTaskSession(session, messageMap) {
  if (!session || !session.id) {
    return false;
  }
  var title = String(session.title || '').trim();
  var isNewTitle = title === '新任务' || title === '新聊天' || title === '';
  return isNewTitle && getSessionMessagesFromMap(session.id, messageMap).length === 0;
}

function findReusableNewTaskSession(sessions, preferredId, messageMap) {
  var list = sessions || [];
  if (preferredId) {
    var preferred = list.filter((item) => item && item.id === preferredId);
    if (preferred.length && isBlankNewTaskSession(preferred[0], messageMap)) {
      return preferred[0].id;
    }
  }
  for (var i = 0; i < list.length; i += 1) {
    if (isBlankNewTaskSession(list[i], messageMap)) {
      return list[i].id;
    }
  }
  return '';
}

function compactEmptyNewTaskSessions(sessions, messages, keepId) {
  var keptBlank = false;
  var nextSessions = [];
  var nextMessages = {};
  (sessions || []).forEach((session) => {
    if (!session || !session.id) {
      return;
    }
    var list = messages && messages[session.id] ? messages[session.id] : getSessionMessages(session.id);
    var title = String(session.title || '').trim();
    var isNewTitle = title === '新任务' || title === '新聊天' || title === '';
    var isBlank = isNewTitle && (!list || !list.length);
    if (isBlank && keptBlank && session.id !== keepId) {
      return;
    }
    if (isBlank) {
      keptBlank = true;
    }
    nextSessions.push(session);
    nextMessages[session.id] = list || [];
  });
  return {
    sessions: nextSessions,
    messages: nextMessages,
  };
}

function getProviderLabel(provider) {
  return 'Qwen';
}

function getProviderStatus(provider) {
  return 'Qwen 就绪';
}

function normalizeBridgeBaseUrl(value) {
  var text = String(value || '').trim().replace(/\/+$/, '');
  if (!text) {
    return '';
  }
  try {
    var parsed = new URL(text);
    if ((parsed.hostname === '127.0.0.1' || parsed.hostname === 'localhost' || parsed.hostname === '[::1]' || parsed.hostname === '::1') && parsed.protocol === 'http:') {
      return parsed.origin;
    }
  } catch (err) {
    return '';
  }
  return '';
}

function readBridgeHashParams() {
  if (typeof window === 'undefined' || !window.location) {
    return {};
  }
  var raw = String(window.location.hash || '').replace(/^#/, '');
  var params = new URLSearchParams(raw);
  return {
    enabled: params.get('oy_bridge') === '1' || !!params.get('oy_bridge_url'),
    baseUrl: normalizeBridgeBaseUrl(params.get('oy_bridge_url')),
    pairToken: params.get('oy_bridge_token') || '',
  };
}

function readStoredBridgeSession() {
  if (typeof window === 'undefined' || !window.sessionStorage) {
    return {};
  }
  try {
    var raw = window.sessionStorage.getItem(BRIDGE_SESSION_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (err) {
    return {};
  }
}

function writeStoredBridgeSession(baseUrl, accessToken) {
  if (typeof window === 'undefined' || !window.sessionStorage || !baseUrl || !accessToken) {
    return;
  }
  try {
    window.sessionStorage.setItem(BRIDGE_SESSION_KEY, JSON.stringify({
      baseUrl: baseUrl,
      accessToken: accessToken,
      savedAt: new Date().getTime(),
    }));
  } catch (err) {
    // Session storage is best-effort.
  }
}

function clearStoredBridgeSession() {
  if (typeof window === 'undefined' || !window.sessionStorage) {
    return;
  }
  try {
    window.sessionStorage.removeItem(BRIDGE_SESSION_KEY);
  } catch (err) {
    // ignore
  }
}

function parseBridgeVersionParts(version) {
  return String(version || '').split(/[.-]/).map((part) => {
    var value = parseInt(part, 10);
    return Number.isFinite(value) ? value : 0;
  });
}

function compareBridgeVersions(left, right) {
  var a = parseBridgeVersionParts(left);
  var b = parseBridgeVersionParts(right);
  var length = Math.max(a.length, b.length, 3);
  for (var index = 0; index < length; index += 1) {
    var leftValue = a[index] || 0;
    var rightValue = b[index] || 0;
    if (leftValue > rightValue) {
      return 1;
    }
    if (leftValue < rightValue) {
      return -1;
    }
  }
  return 0;
}

function isBridgeVersionSupported(version) {
  return !!version && compareBridgeVersions(version, BRIDGE_MIN_VERSION) >= 0;
}

function hasBridgeCapability(name) {
  var list = _customState.bridgeCapabilities || [];
  return list.indexOf(name) >= 0;
}

function canRunCreateAppBridgeAction() {
  return _customState.bridgeStatus === 'paired' && !!_customState.bridgeAccessToken && hasBridgeCapability('openyida.create-app');
}

function canRunAppListBridgeAction() {
  return _customState.bridgeStatus === 'paired' && !!_customState.bridgeAccessToken && hasBridgeCapability('openyida.app-list');
}

function getBridgeUpgradeMessage(version) {
  var current = version ? '当前版本 ' + version + '，' : '';
  return current + '本地连接需 OpenYida ' + BRIDGE_MIN_VERSION + ' 或更新版本。请先升级后重新启动 bridge。';
}

function createBridgePairToken() {
  var alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_-';
  var token = '';
  if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
    var bytes = new Uint8Array(32);
    window.crypto.getRandomValues(bytes);
    for (var index = 0; index < bytes.length; index += 1) {
      token += alphabet[bytes[index] % alphabet.length];
    }
  } else {
    token = (getRandomId() + getRandomId()).replace(/[^A-Za-z0-9_-]/g, '').slice(0, 48);
  }
  return 'oyb_' + token;
}

function readStoredBridgePairToken() {
  if (typeof window === 'undefined' || !window.localStorage) {
    return '';
  }
  try {
    var raw = window.localStorage.getItem(BRIDGE_PAIR_TOKEN_KEY);
    if (!raw) {
      return '';
    }
    var data = JSON.parse(raw);
    var token = data && data.token ? String(data.token) : '';
    var savedAt = data && data.savedAt ? Number(data.savedAt) : 0;
    if (token && savedAt && new Date().getTime() - savedAt < BRIDGE_PAIR_TOKEN_TTL_MS) {
      return token;
    }
  } catch (err) {
    // Pair token storage is best-effort.
  }
  return '';
}

function writeStoredBridgePairToken(token) {
  if (typeof window === 'undefined' || !window.localStorage || !token) {
    return;
  }
  try {
    window.localStorage.setItem(BRIDGE_PAIR_TOKEN_KEY, JSON.stringify({
      token: token,
      savedAt: new Date().getTime(),
    }));
  } catch (err) {
    // ignore
  }
}

function ensureBridgePairToken() {
  var token = readStoredBridgePairToken() || _customState.bridgePairToken || createBridgePairToken();
  writeStoredBridgePairToken(token);
  return token;
}

function getBridgeStartCommand() {
  return BRIDGE_INSTALL_COMMAND + ' && ' + BRIDGE_START_COMMAND_PREFIX + ensureBridgePairToken();
}

function buildBridgeCandidates() {
  var hash = readBridgeHashParams();
  var stored = readStoredBridgeSession();
  var pagePairToken = ensureBridgePairToken();
  var seen = {};
  var candidates = [];

  function addCandidate(baseUrl, pairToken, accessToken) {
    var normalized = normalizeBridgeBaseUrl(baseUrl);
    if (!normalized || seen[normalized]) {
      return;
    }
    seen[normalized] = true;
    candidates.push({
      baseUrl: normalized,
      pairToken: pairToken || '',
      accessToken: accessToken || '',
    });
  }

  addCandidate(hash.baseUrl, hash.pairToken || pagePairToken, '');
  addCandidate(stored.baseUrl, stored.accessToken ? '' : pagePairToken, stored.accessToken || '');
  BRIDGE_DEFAULT_PORTS.forEach((port) => {
    addCandidate('http://127.0.0.1:' + port, pagePairToken, '');
  });

  return candidates;
}

function bridgeRequest(baseUrl, path, options) {
  var opts = options || {};
  var headers = {
    'Content-Type': 'application/json',
  };
  if (opts.token) {
    headers['X-OpenYida-Token'] = opts.token;
  }

  return new Promise(function(resolve, reject) {
    var targetUrl = normalizeBridgeBaseUrl(baseUrl) + path;
    var timeout = opts.timeout || BRIDGE_REQUEST_TIMEOUT_MS;
    if (!normalizeBridgeBaseUrl(baseUrl)) {
      reject(new Error('invalid_bridge_url'));
      return;
    }

    if (typeof fetch === 'function') {
      var controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
      var timer = null;
      if (controller) {
        timer = setTimeout(function() {
          controller.abort();
        }, timeout);
      }
      fetch(targetUrl, {
        method: opts.method || 'GET',
        headers: headers,
        body: opts.body ? JSON.stringify(opts.body) : undefined,
        signal: controller ? controller.signal : undefined,
      }).then(function(res) {
        if (timer) {
          clearTimeout(timer);
        }
        return res.text().then(function(text) {
          var data = text ? JSON.parse(text) : {};
          if (!res.ok) {
            var error = new Error(data && data.message ? data.message : 'bridge_request_failed');
            error.status = res.status;
            error.data = data;
            throw error;
          }
          return data;
        });
      }).then(resolve).catch(function(error) {
        if (timer) {
          clearTimeout(timer);
        }
        reject(error);
      });
      return;
    }

    if (typeof XMLHttpRequest !== 'undefined') {
      var xhr = new XMLHttpRequest();
      xhr.open(opts.method || 'GET', targetUrl, true);
      xhr.timeout = timeout;
      Object.keys(headers).forEach((key) => {
        xhr.setRequestHeader(key, headers[key]);
      });
      xhr.onload = function() {
        var data = xhr.responseText ? JSON.parse(xhr.responseText) : {};
        if (xhr.status < 200 || xhr.status >= 300) {
          var error = new Error(data && data.message ? data.message : 'bridge_request_failed');
          error.status = xhr.status;
          error.data = data;
          reject(error);
          return;
        }
        resolve(data);
      };
      xhr.onerror = function() {
        reject(new Error('bridge_network_error'));
      };
      xhr.ontimeout = function() {
        reject(new Error('bridge_request_timeout'));
      };
      xhr.send(opts.body ? JSON.stringify(opts.body) : null);
      return;
    }

    if (typeof document !== 'undefined') {
      var callbackName = '__oyBridgeJsonp_' + Math.random().toString(36).slice(2);
      var script = document.createElement('script');
      var timerId = setTimeout(function() {
        cleanup();
        reject(new Error('bridge_request_timeout'));
      }, timeout);
      var cleanup = function() {
        clearTimeout(timerId);
        try {
          delete window[callbackName];
        } catch (err) {
          window[callbackName] = undefined;
        }
        if (script && script.parentNode) {
          script.parentNode.removeChild(script);
        }
      };
      var url = new URL(targetUrl);
      url.searchParams.set('callback', callbackName);
      url.searchParams.set('_', String(new Date().getTime()));
      if (opts.token) {
        url.searchParams.set('accessToken', opts.token);
      }
      Object.keys(opts.body || {}).forEach((key) => {
        var value = opts.body[key];
        if (value !== undefined && value !== null) {
          url.searchParams.set(key, String(value));
        }
      });
      window[callbackName] = function(data) {
        cleanup();
        if (!data || data.ok === false) {
          var error = new Error(data && data.message ? data.message : (data && data.error ? data.error : 'bridge_request_failed'));
          error.status = data && data.statusCode;
          error.data = data;
          reject(error);
          return;
        }
        resolve(data);
      };
      script.onerror = function() {
        cleanup();
        reject(new Error('bridge_jsonp_failed'));
      };
      script.src = url.toString();
      document.head.appendChild(script);
      return;
    }

    reject(new Error('bridge_request_unavailable'));
  });
}

function getBridgeStatusText(status) {
  if (status === 'paired') {
    return '已连接';
  }
  if (status === 'outdated') {
    return '需升级';
  }
  if (status === 'detected') {
    return '待配对';
  }
  if (status === 'probing') {
    return '检测中';
  }
  if (status === 'error') {
    return '连接异常';
  }
  return '未连接';
}

function getBridgeDotStyle(status) {
  if (status === 'paired') {
    return Object.assign({}, styles.bridgeDot, styles.bridgeDotOk);
  }
  if (status === 'detected' || status === 'probing' || status === 'outdated') {
    return Object.assign({}, styles.bridgeDot, styles.bridgeDotWarn);
  }
  return Object.assign({}, styles.bridgeDot, styles.bridgeDotOff);
}

function getBridgeLoginLabel(login) {
  if (!login) {
    return '未检查';
  }
  if (login.status === 'ok' || login.loggedIn) {
    return '已登录';
  }
  if (login.status === 'need_qr_scan') {
    return '等待扫码';
  }
  if (login.status === 'need_corp_selection') {
    return '选择组织';
  }
  if (login.status === 'waiting_scan') {
    return '扫码确认中';
  }
  if (login.status === 'expired') {
    return '二维码过期';
  }
  return '未登录';
}

function buildBridgeDiagnostics() {
  var login = _customState.bridgeLogin || {};
  return JSON.stringify({
    signal: 'openyida_page_bridge',
    page: '/s/openyida',
    bridgeStatus: _customState.bridgeStatus,
    bridgeBaseUrl: _customState.bridgeBaseUrl,
    loginStatus: login.status || '',
    loginCanAutoUse: !!login.canAutoUse,
  });
}

function getCurrentPageOrigin() {
  if (typeof window !== 'undefined' && window.location && window.location.origin) {
    return String(window.location.origin || '');
  }
  return '';
}

function joinBridgeOrigins(origins) {
  if (!origins || !origins.length) {
    return '';
  }
  return (origins || []).map((origin) => String(origin || '')).filter(Boolean).join(', ');
}

function getBridgeEnvironmentRows() {
  var login = _customState.bridgeLogin || {};
  var pageOrigin = getCurrentPageOrigin();
  return [
    { label: '页面域名', value: pageOrigin || '未识别' },
    { label: '宜搭登录域名', value: login.baseUrlOrigin || pageOrigin || '未检查' },
    { label: '允许域名', value: joinBridgeOrigins(_customState.bridgeAllowedOrigins) || '未返回' },
    { label: 'AppType', value: getRuntimeAppType() || '未识别' },
    { label: 'Bridge 地址', value: _customState.bridgeBaseUrl || '未连接' },
    { label: 'CorpId', value: login.corpId || '未检查' },
  ];
}

function buildMockText(prompt, providerNote) {
  var text = String(prompt || '');
  var lines = [
    '我会先把目标拆成一个可执行的宜搭方案。',
    '',
    '1. 识别对象：从你的描述中提取应用、页面、表单、流程和报表。',
    '2. 生成计划：把需求拆成字段、页面布局、权限和自动化动作。',
    '3. 执行边界：高风险动作先给出确认卡片，再调用 OpenYida 或宜搭接口。',
    '',
    '针对这次输入，我会先生成助手答复、可复制 prompt 和需要确认的执行步骤。',
  ];
  if (text.indexOf('分组') >= 0 || text.indexOf('导航') >= 0) {
    lines.push('');
    lines.push('如果这是导航整理任务，我会先生成确认卡，确认后再读取导航树并移动页面。');
  }
  if (text.indexOf('图') >= 0 || text.indexOf('图片') >= 0) {
    lines.push('');
    lines.push('如果你上传或粘贴了图片，我会把它作为附件上下文处理；后续可以把这里替换成 OCR 或视觉理解服务。');
  }
  return lines.join('\n');
}

function formatFileSize(size) {
  var value = Number(size || 0);
  if (value >= 1024 * 1024) {
    return (value / 1024 / 1024).toFixed(1) + ' MB';
  }
  if (value >= 1024) {
    return Math.round(value / 1024) + ' KB';
  }
  return value + ' B';
}

function isImageFile(file) {
  return !!(file && file.type && file.type.indexOf('image/') === 0);
}

function getRenderableImageSrc(message) {
  var src = message && (message.imageData || message.imageUrl) ? String(message.imageData || message.imageUrl) : '';
  if (!src) {
    return '';
  }
  if (src.indexOf('data:image/') === 0 || /^https?:\/\//.test(src)) {
    return src;
  }
  return '';
}

function getAttachmentStateKey(stateKey) {
  return stateKey === 'widgetDraft' ? 'widgetPendingImage' : 'pendingImage';
}

function buildPromptWithAttachment(prompt, attachment) {
  var text = String(prompt || '').trim();
  if (!attachment) {
    return text;
  }
  var note = [
    '用户本次消息附带了一张图片。',
    '图片名称：' + attachment.name,
    '图片大小：' + attachment.sizeLabel,
    '当前 OpenYida 助手已完成图片上传/粘贴和消息附件展示；如需读取图片内容，请接入 OCR 或视觉理解服务。',
  ].join('\n');
  if (!text) {
    return note + '\n\n请先说明你已收到图片，并询问用户希望分析什么。';
  }
  return text + '\n\n' + note;
}

function getRuntimeAppType() {
  if (typeof window === 'undefined') {
    return '';
  }
  if (window.g_config && (window.g_config.appType || window.g_config.appId || window.g_config.appUuid)) {
    return window.g_config.appType || window.g_config.appId || window.g_config.appUuid;
  }
  var href = '';
  try {
    href = String(window.location && window.location.href ? window.location.href : '');
  } catch (err) {
    href = '';
  }
  var pathMatch = href.match(/\/(APP_[A-Za-z0-9]+)(?:\/|$)/);
  if (pathMatch && pathMatch[1]) {
    return pathMatch[1];
  }
  var queryMatch = href.match(/[?&]appType=([^&]+)/);
  return queryMatch && queryMatch[1] ? decodeURIComponent(queryMatch[1]) : DEFAULT_APP_TYPE;
}

function extractImageUrl(text) {
  var value = String(text || '');
  var matched = value.match(/https?:\/\/[^\s"'<>]+?\.(?:png|jpg|jpeg|gif|webp|bmp)(?:\?[^\s"'<>]*)?/i);
  return matched && matched[0] ? matched[0] : '';
}

function resolveAiRoute(prompt, attachment) {
  if (attachment && attachment.dataUrl) {
    return {
      type: 'image-upload',
      label: '识图接口',
      detail: attachment.name || '图片附件',
    };
  }
  var imageUrl = extractImageUrl(prompt);
  if (imageUrl) {
    return {
      type: 'image-url',
      label: '识图接口',
      imageUrl: imageUrl,
      detail: imageUrl,
    };
  }
  return {
    type: 'text',
    label: '文本接口',
    detail: 'txtFromAI',
  };
}

function buildQwenPrompt(prompt, context) {
  var profile = getCurrentUserProfile();
  var lines = [
    '你是 OpenYida 助手，底层模型是 Qwen。',
    '你运行在宜搭自定义页面中，主要回答 OpenYida / 宜搭查询、资料检索、登录诊断、页面发布、表单、流程、报表、权限和排障问题。',
    '你没有真实互联网访问能力，不能声称已经联网搜索、打开网页、查看实时信息或访问外部网站。',
    '涉及事实性问题时，只能基于用户输入、当前会话附件、宜搭表单数据查询结果和页面内置公开说明回答；没有检索命中时必须明确说没有查到，不要编造。',
    '请用中文回答，给出清晰、可执行的建议；遇到创建应用、搭建系统、发布页面、移动导航或写业务数据等高风险写入需求时，建议用户切换到 Codex / OpenYida 强模型链路，不要假装已经执行。',
    '当前用户：' + profile.name + (profile.userId ? '（' + profile.userId + '）' : ''),
    '当前组织：' + (profile.subtitle || '未知'),
    '当前应用：' + (getRuntimeAppType() || '未识别'),
    '路由接口：' + (context && context.routeLabel ? context.routeLabel : '文本接口'),
  ];
  if (context && context.imageUrl) {
    lines.push('图片 URL：' + context.imageUrl);
  }
  if (context && context.recognitionSummary) {
    lines.push('');
    lines.push('识图接口返回：');
    lines.push(context.recognitionSummary);
  }
  if (context && context.knowledgeSummary) {
    lines.push('');
    lines.push('宜搭表单数据查询结果：');
    lines.push(context.knowledgeSummary);
  }
  if (context && context.knowledgeSearched && !context.knowledgeSummary) {
    lines.push('');
    lines.push('宜搭表单数据查询结果：未命中。');
  }
  lines.push('');
  lines.push('回答要求：基于上述查询结果为用户整理出完整、清晰、可操作的回答，把资料中的关键步骤和要点提炼出来直接告诉用户。只有资料确实完全未涉及的细节才补充说明"知识库暂未收录该部分"。不要自行生成"资料来源"段落，页面会在回答后自动追加真实资料详情页链接。');
  lines.push('');
  lines.push('用户输入：');
  lines.push(String(prompt || '').trim() || '请基于当前上下文给出建议。');
  return lines.join('\n');
}

function buildVisionTextPrompt(prompt, imageUrl, serviceReturnValue) {
  return buildQwenPrompt(prompt, {
    routeLabel: '识图接口 + 文本接口',
    imageUrl: imageUrl,
    recognitionSummary: summarizeRecognitionResult(serviceReturnValue),
  });
}

function dataUrlToBlob(dataUrl, mimeType) {
  if (typeof Blob === 'undefined') {
    throw new Error('当前浏览器不支持图片上传 Blob');
  }
  var value = String(dataUrl || '');
  var commaIndex = value.indexOf(',');
  if (commaIndex < 0) {
    throw new Error('图片数据格式异常');
  }
  var header = value.slice(0, commaIndex);
  var body = value.slice(commaIndex + 1);
  var matched = header.match(/data:([^;]+)(;base64)?/);
  var type = mimeType || (matched && matched[1] ? matched[1] : 'image/png');
  var binary = matched && matched[2] ? atob(body) : decodeURIComponent(body);
  var bytes = new Uint8Array(binary.length);
  for (var i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new Blob([bytes], { type: type });
}

function getFileExtension(name, type) {
  var fileName = String(name || '');
  var dotIndex = fileName.lastIndexOf('.');
  if (dotIndex >= 0) {
    var ext = fileName.slice(dotIndex).toLowerCase();
    if (/^\.[a-z0-9]+$/.test(ext)) {
      return ext;
    }
  }
  if (type === 'image/jpeg') {
    return '.jpg';
  }
  if (type === 'image/webp') {
    return '.webp';
  }
  if (type === 'image/gif') {
    return '.gif';
  }
  if (type === 'image/bmp') {
    return '.bmp';
  }
  return '.png';
}

function getRandomId() {
  if (typeof window !== 'undefined' && window.crypto && window.crypto.randomUUID) {
    return window.crypto.randomUUID().replace(/-/g, '').toUpperCase();
  }
  return String(new Date().getTime()) + String(Math.random()).slice(2, 10);
}

function createImageObjectName(appType, attachment) {
  var now = new Date();
  var monthDay = (now.getMonth() + 1) + '-' + now.getDate();
  return appType + '/' + now.getFullYear() + '/' + monthDay + '/' + getRandomId() + getFileExtension(attachment.name, attachment.type);
}

function fetchJsonWithTimeout(url, options, timeoutMessage, timeoutMs) {
  if (typeof fetch === 'undefined') {
    return Promise.reject(new Error('当前页面缺少 fetch 能力'));
  }
  var timeoutId = null;
  var request = fetch(url, options || {});
  var timeout = new Promise((resolve, reject) => {
    timeoutId = setTimeout(function() {
      reject(new Error(timeoutMessage || '接口响应超时'));
    }, timeoutMs || DEFAULT_REQUEST_TIMEOUT_MS);
  });
  return Promise.race([request, timeout]).then(function(res) {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    if (!res || !res.ok) {
      return res.text().then(function(text) {
        throw new Error('HTTP ' + (res ? res.status : '0') + ' ' + String(text || '').slice(0, 120));
      });
    }
    return res.json();
  }).catch(function(err) {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    throw err;
  });
}

function extractTextFromAiResponseNode(node, depth) {
  if (node === undefined || node === null || depth > 4) {
    return '';
  }
  if (typeof node === 'string') {
    return node;
  }
  if (typeof node !== 'object') {
    return '';
  }
  var directKeys = ['content', 'answer', 'text', 'result', 'output', 'message'];
  for (var i = 0; i < directKeys.length; i += 1) {
    var key = directKeys[i];
    if (typeof node[key] === 'string' && node[key]) {
      return node[key];
    }
  }
  for (var j = 0; j < directKeys.length; j += 1) {
    var nestedKey = directKeys[j];
    var nested = extractTextFromAiResponseNode(node[nestedKey], depth + 1);
    if (nested) {
      return nested;
    }
  }
  return '';
}

function extractTextFromAiResponse(data) {
  var text = extractTextFromAiResponseNode(data && data.content, 0)
    || extractTextFromAiResponseNode(data && data.data, 0)
    || extractTextFromAiResponseNode(data && data.result, 0)
    || extractTextFromAiResponseNode(data, 0);
  return String(text || '').trim();
}

function normalizeRecognitionResult(serviceReturnValue) {
  var list = serviceReturnValue && serviceReturnValue.result && Array.isArray(serviceReturnValue.result)
    ? serviceReturnValue.result
    : [];
  return list.map((item) => {
    var score = typeof item.score === 'number' ? item.score : Number(item.score || 0);
    return {
      name: item.name || '',
      confidence: Math.round(score * 10000) / 100,
      baikeInfo: item.baike_info || item.baikeInfo || {},
      raw: item,
    };
  });
}

function summarizeRecognitionResult(serviceReturnValue) {
  var list = normalizeRecognitionResult(serviceReturnValue);
  if (!list.length) {
    return '识图接口未返回结构化结果。原始返回：' + limitText(JSON.stringify(serviceReturnValue || {}), 900);
  }
  return list.map((item, index) => {
    var desc = item.baikeInfo && item.baikeInfo.description ? '，说明：' + item.baikeInfo.description : '';
    return (index + 1) + '. ' + (item.name || '未知') + '，置信度 ' + item.confidence + '%' + desc;
  }).join('\n');
}

function normalizeText(value) {
  return String(value || '').toLowerCase();
}

function hasAny(value, keywords) {
  var text = normalizeText(value);
  return (keywords || []).some((keyword) => text.indexOf(normalizeText(keyword)) >= 0);
}

function canUseKnowledgeSearch(ctx) {
  return !!(KNOWLEDGE_DATA_FORM_UUID && ctx && ctx.utils && ctx.utils.yida && ctx.utils.yida.searchFormDatas);
}

var SEARCH_STOP_WORDS = [
  '怎么', '如何', '什么', '哪里', '哪些', '为什么', '是否', '能否', '可以', '可否',
  '请问', '怎样', '多少', '几个', '有没有', '是不是', '能不能', '要不要',
  '怎么用', '如何用', '有什么用', '啥用', '使用', '作用',
  '的', '了', '吗', '呢', '吧', '啊', '呀', '哦', '嘛', '么',
];

var KNOWLEDGE_QUERY_NOISE_PHRASES = [
  '请问', '帮我', '帮忙', '我想知道', '想知道', '我想', '请介绍', '介绍一下',
  '是什么', '有什么用', '怎么用', '如何用', '怎么使用', '如何使用', '怎么操作',
  '如何操作', '怎么设置', '如何设置', '怎么配置', '如何配置', '怎么处理',
  '如何处理', '怎么解决', '如何解决', '是啥', '啥意思', '能不能', '可不可以',
  '可以吗', '行不行', '一下', '相关', '资料', '文档', '教程', '说明',
];

var KNOWLEDGE_CONCEPT_TERMS = [
  '聚合表', '数据准备', '数据集', '数据源', '报表', '仪表盘', '图表',
  '表单', '流程', '审批', '权限', '成员组件', '部门组件', '子表单',
  '关联表单', '关联记录', '公式', '连接器', '集成自动化', '自定义页面',
  '页面发布', '导航分组', '导入', '导出', '登录', 'bridge', 'openyida', '宜搭',
];

var KNOWLEDGE_GENERIC_ANCHORS = [
  '宜搭', 'openyida', '应用', '页面', '数据', '功能', '问题', '使用', '设置',
  '配置', '操作', '处理', '解决', '支持', '实现', '获取', '查询', '创建',
  '选择', '方式', '区别', '不同', '边界', '相关', '说明',
];

var KNOWLEDGE_MIN_SCORE = 16;
var KNOWLEDGE_RELATIVE_SCORE_RATIO = 0.6;

function pushSearchTerm(list, term) {
  var value = normalizeText(term).trim();
  if (!value || value.length < 2 || list.indexOf(value) >= 0) {
    return;
  }
  if (SEARCH_STOP_WORDS.indexOf(value) >= 0) {
    return;
  }
  list.push(value);
}

function compactKnowledgeText(value) {
  return normalizeText(value).replace(/[\s，。！？、；：,.!?;:()[\]{}"'`~<>《》【】「」『』“”‘’|/\\-]+/g, '');
}

function stripKnowledgeQuestionNoise(value) {
  var text = normalizeText(value).replace(/[，。！？、；：,.!?;:()[\]{}"'`~<>《》【】「」『』“”‘’|/\\-]+/g, ' ');
  KNOWLEDGE_QUERY_NOISE_PHRASES.sort((a, b) => b.length - a.length).forEach((phrase) => {
    text = text.split(normalizeText(phrase)).join(' ');
  });
  SEARCH_STOP_WORDS.sort((a, b) => b.length - a.length).forEach((word) => {
    text = text.split(normalizeText(word)).join(' ');
  });
  return text.replace(/\s+/g, ' ').trim();
}

function isGenericKnowledgeAnchor(term) {
  var value = compactKnowledgeText(term);
  if (!value || value.length < 2) {
    return true;
  }
  return KNOWLEDGE_GENERIC_ANCHORS.some((item) => compactKnowledgeText(item) === value);
}

function pushKnowledgeAnchor(list, term) {
  var value = compactKnowledgeText(term);
  if (!value || value.length < 2 || list.indexOf(value) >= 0) {
    return;
  }
  if (SEARCH_STOP_WORDS.indexOf(value) >= 0 || isGenericKnowledgeAnchor(value)) {
    return;
  }
  list.push(value);
}

function buildDynamicKnowledgeTerms(records) {
  var terms = [];
  (records || []).forEach((record) => {
    var value = [record.title, record.keywords, record.source].filter(Boolean).join(' ');
    var cleaned = stripKnowledgeQuestionNoise(value);
    var parts = cleaned.split(/\s+/);
    parts.forEach((part) => {
      var compact = compactKnowledgeText(part);
      if (compact.length >= 2 && compact.length <= 24 && !isGenericKnowledgeAnchor(compact)) {
        pushKnowledgeAnchor(terms, compact);
      }
    });
    var cjk = cleaned.match(/[\u4e00-\u9fa5]{2,24}/g) || [];
    cjk.forEach((part) => {
      if (!isGenericKnowledgeAnchor(part)) {
        pushKnowledgeAnchor(terms, part);
      }
    });
  });
  return terms.sort((a, b) => b.length - a.length).slice(0, 400);
}

function extractKnowledgeConcepts(value, dynamicTerms) {
  var text = compactKnowledgeText(value);
  var concepts = [];
  var terms = KNOWLEDGE_CONCEPT_TERMS.concat(dynamicTerms || []).sort((a, b) => compactKnowledgeText(b).length - compactKnowledgeText(a).length);
  terms.forEach((term) => {
    var normalized = compactKnowledgeText(term);
    if (normalized && text.indexOf(normalized) >= 0 && concepts.indexOf(normalized) < 0) {
      concepts.push(normalized);
    }
  });
  return concepts;
}

function buildKnowledgeQueryAnalysis(prompt, records) {
  var dynamicTerms = buildDynamicKnowledgeTerms(records);
  var cleaned = stripKnowledgeQuestionNoise(prompt);
  var concepts = extractKnowledgeConcepts(prompt, dynamicTerms);
  var terms = [];
  var requiredAnchors = [];
  var conceptAnchors = [];
  concepts.forEach((concept) => {
    pushSearchTerm(terms, concept);
    pushKnowledgeAnchor(requiredAnchors, concept);
    pushKnowledgeAnchor(conceptAnchors, concept);
  });
  cleaned.split(/\s+/).forEach((part) => {
    pushSearchTerm(terms, part);
    if (compactKnowledgeText(part).length <= 16) {
      pushKnowledgeAnchor(requiredAnchors, part);
    }
  });
  var latin = cleaned.match(/[a-z0-9_.-]{2,}/g) || [];
  latin.forEach((part) => {
    pushSearchTerm(terms, part);
    pushKnowledgeAnchor(requiredAnchors, part);
  });
  var cjk = cleaned.match(/[\u4e00-\u9fa5]{2,16}/g) || [];
  cjk.forEach((part) => {
    pushSearchTerm(terms, part);
    pushKnowledgeAnchor(requiredAnchors, part);
  });
  if (!requiredAnchors.length) {
    extractKnowledgeConcepts(cleaned, dynamicTerms).forEach((concept) => pushKnowledgeAnchor(requiredAnchors, concept));
  }
  return {
    cleaned: cleaned,
    terms: terms.slice(0, 80),
    concepts: concepts,
    conceptAnchors: conceptAnchors.slice(0, 8),
    requiredAnchors: requiredAnchors.slice(0, 8),
    requireAllAnchors: conceptAnchors.length > 1 && hasAny(prompt, ['区别', '不同', '对比', '关系', '边界', '和', '与', 'vs']),
  };
}

function buildSearchTerms(prompt) {
  return buildKnowledgeQueryAnalysis(prompt, []).terms;
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

function getAliworkOrigin() {
  if (typeof window !== 'undefined' && window.location && window.location.origin && /(^|\.)aliwork\.com$/.test(window.location.hostname || '')) {
    return String(window.location.origin || '').replace(/\/+$/, '');
  }
  return 'https://demo.aliwork.com';
}

function buildKnowledgeDetailUrl(formInstId) {
  if (!formInstId) {
    return '';
  }
  return getAliworkOrigin() + KNOWLEDGE_DOC_PAGE_PATH + '#doc=' + encodeURIComponent(formInstId);
}

function escapeMarkdownLinkText(value) {
  return String(value || '').replace(/([\[\]\\])/g, '\\$1');
}

function buildKnowledgeRecord(row) {
  var formData = getRowFormData(row);
  var formInstId = row && (row.formInstId || row.instId || row.id) ? String(row.formInstId || row.instId || row.id) : '';
  return {
    id: formInstId,
    title: normalizeKnowledgeValue(formData[KNOWLEDGE_DATA_FIELDS.title]),
    type: normalizeKnowledgeValue(formData[KNOWLEDGE_DATA_FIELDS.type]),
    keywords: normalizeKnowledgeValue(formData[KNOWLEDGE_DATA_FIELDS.keywords]),
    summary: normalizeKnowledgeValue(formData[KNOWLEDGE_DATA_FIELDS.summary]),
    body: normalizeKnowledgeValue(formData[KNOWLEDGE_DATA_FIELDS.body]),
    source: normalizeKnowledgeValue(formData[KNOWLEDGE_DATA_FIELDS.source]),
    status: normalizeKnowledgeValue(formData[KNOWLEDGE_DATA_FIELDS.status]),
    detailUrl: buildKnowledgeDetailUrl(formInstId),
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
    title: normalizeKnowledgeValue(record.title),
    type: normalizeKnowledgeValue(record.type),
    keywords: normalizeKnowledgeValue(record.keywords),
    summary: normalizeKnowledgeValue(record.summary),
    body: normalizeKnowledgeValue(record.body),
    source: normalizeKnowledgeValue(record.source),
    status: normalizeKnowledgeValue(record.status),
    updatedAt: record.updatedAt || '',
    detailUrl: buildKnowledgeDetailUrl(id),
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
    var isComplete = !!(payload.complete);
    if (!(options && options.allowStale) && (age > KNOWLEDGE_CACHE_TTL_MS || !isComplete)) {
      return null;
    }
    var records = normalizeKnowledgeCacheRecords(payload.records || []);
    if (!records.length) {
      return null;
    }
    return {
      records: records,
      cachedAt: cachedAt,
      complete: isComplete,
      fresh: isComplete && age <= KNOWLEDGE_CACHE_TTL_MS,
    };
  } catch (err) {
    return null;
  }
}

function writeKnowledgeCache(records, options) {
  if (!canUseKnowledgeCache()) {
    return;
  }
  var normalized = normalizeKnowledgeCacheRecords(records);
  if (!normalized.length) {
    return;
  }
  var complete = !!(options && options.complete);
  try {
    window.localStorage.setItem(KNOWLEDGE_CACHE_KEY, JSON.stringify({
      formUuid: KNOWLEDGE_DATA_FORM_UUID,
      cachedAt: new Date().getTime(),
      complete: complete,
      records: normalized,
    }));
  } catch (err) {
    try {
      window.localStorage.removeItem(KNOWLEDGE_CACHE_KEY);
    } catch (removeErr) {}
  }
}

function scoreKnowledgeRecord(record, prompt, analysis) {
  var query = normalizeText(prompt).trim();
  var title = normalizeText(record.title);
  var keywords = normalizeText(record.keywords);
  var summary = normalizeText(record.summary);
  var body = normalizeText(record.body);
  var source = normalizeText(record.source);
  var haystack = [title, keywords, summary, body, source].join('\n');
  var compactHaystack = compactKnowledgeText(haystack);
  var compactTitle = compactKnowledgeText(title);
  var compactKeywords = compactKnowledgeText(keywords);
  var compactSummary = compactKnowledgeText(summary);
  var compactBody = compactKnowledgeText(body);
  var score = 0;
  var queryAnalysis = analysis || buildKnowledgeQueryAnalysis(prompt, [record]);
  var anchors = queryAnalysis.requireAllAnchors && queryAnalysis.conceptAnchors && queryAnalysis.conceptAnchors.length
    ? queryAnalysis.conceptAnchors
    : (queryAnalysis.requiredAnchors || []);
  if (anchors.length) {
    var matchedAnchors = anchors.filter((anchor) => compactHaystack.indexOf(anchor) >= 0);
    var headlineMatchedAnchors = anchors.filter((anchor) => {
      return compactTitle.indexOf(anchor) >= 0 || compactKeywords.indexOf(anchor) >= 0 || compactKnowledgeText(source).indexOf(anchor) >= 0;
    });
    if (queryAnalysis.requireAllAnchors && matchedAnchors.length < anchors.length) {
      return 0;
    }
    if (queryAnalysis.requireAllAnchors && headlineMatchedAnchors.length < anchors.length) {
      return 0;
    }
    if (!queryAnalysis.requireAllAnchors && !matchedAnchors.length) {
      return 0;
    }
    if (!headlineMatchedAnchors.length) {
      return 0;
    }
    score += matchedAnchors.length * 18 + headlineMatchedAnchors.length * 12;
  }
  if (query && haystack.indexOf(query) >= 0) {
    score += 30;
  }
  if (query && compactHaystack.indexOf(compactKnowledgeText(query)) >= 0) {
    score += 24;
  }
  (queryAnalysis.terms || []).forEach((term) => {
    if (!term) {
      return;
    }
    var compactTerm = compactKnowledgeText(term);
    var isConceptTerm = (queryAnalysis.concepts || []).indexOf(compactTerm) >= 0;
    var isRequiredAnchor = anchors.indexOf(compactTerm) >= 0;
    var isStrongTerm = isConceptTerm || term.length >= 3 || /[a-z0-9_.-]{2,}/.test(term);
    if (compactTitle.indexOf(compactTerm) >= 0) {
      score += isRequiredAnchor ? 30 : (isConceptTerm ? 24 : 12);
    }
    if (compactKeywords.indexOf(compactTerm) >= 0) {
      score += isRequiredAnchor ? 24 : (isConceptTerm ? 18 : 10);
    }
    if (isStrongTerm && compactSummary.indexOf(compactTerm) >= 0) {
      score += isRequiredAnchor ? 10 : 5;
    }
    if (isStrongTerm && compactBody.indexOf(compactTerm) >= 0) {
      score += isRequiredAnchor ? 6 : (isConceptTerm ? 4 : 2);
    }
  });
  return score;
}

function selectKnowledgeRecords(records, prompt) {
  var normalized = normalizeKnowledgeCacheRecords(records || []);
  var analysis = buildKnowledgeQueryAnalysis(prompt, normalized);
  var scored = normalized.map((record) => {
    record.score = scoreKnowledgeRecord(record, prompt, analysis);
    return record;
  }).filter((record) => {
    return record.score >= KNOWLEDGE_MIN_SCORE && record.status !== '停用';
  }).sort((a, b) => b.score - a.score);
  if (scored.length) {
    var topScore = scored[0].score;
    scored = scored.filter((record) => record.score >= Math.max(KNOWLEDGE_MIN_SCORE, topScore * KNOWLEDGE_RELATIVE_SCORE_RATIO));
  }
  return {
    analysis: analysis,
    results: scored.slice(0, KNOWLEDGE_MAX_RESULTS),
  };
}

function pickKnowledgeRecords(records, prompt) {
  return selectKnowledgeRecords(records, prompt).results;
}

function buildKnowledgeSearchResponse(records, prompt, extra) {
  var selection = selectKnowledgeRecords(records, prompt);
  return Object.assign({
    searched: true,
    requiresGrounding: shouldRequireKnowledgeGrounding(prompt),
    results: selection.results,
    queryAnalysis: selection.analysis,
    error: '',
  }, extra || {});
}

function pickKnowledgeResults(rows, prompt) {
  return pickKnowledgeRecords((rows || []).map((row) => buildKnowledgeRecord(row)), prompt);
}

function formatKnowledgeResults(results) {
  return (results || []).map((item, index) => {
    var sourceTitle = item.title || item.source || 'OpenYida 助手知识库';
    var sourceLink = item.detailUrl
      ? '[' + escapeMarkdownLinkText(sourceTitle) + '](' + item.detailUrl + ')'
      : escapeMarkdownLinkText(sourceTitle);
    return [
      '[' + (index + 1) + '] ' + (item.title || '未命名资料'),
      '类型：' + (item.type || '未分类'),
      '摘要：' + limitText(item.summary || item.body || '', 420),
      '正文摘录：' + limitText(item.body || item.summary || '', 900),
      '来源名称：' + (item.source || item.title || 'OpenYida 助手知识库'),
      '资料详情链接：' + sourceLink,
    ].join('\n');
  }).join('\n\n');
}

function buildKnowledgeSourceLinks(results) {
  var links = [];
  (results || []).forEach((item) => {
    if (!item || !item.detailUrl) {
      return;
    }
    var title = item.title || item.source || 'OpenYida 助手知识库';
    var line = '- [' + escapeMarkdownLinkText(title) + '](' + item.detailUrl + ')';
    if (links.indexOf(line) < 0) {
      links.push(line);
    }
  });
  return links.length ? ('资料来源：\n' + links.join('\n')) : '';
}

function removeGeneratedKnowledgeSources(content) {
  return String(content || '').replace(/\n{0,2}(?:^|\n)资料来源[:：][\s\S]*$/m, '').trim();
}

function appendKnowledgeSourceLinks(content, results) {
  var text = removeGeneratedKnowledgeSources(content);
  var sourceBlock = buildKnowledgeSourceLinks(results);
  if (!sourceBlock) {
    return text;
  }
  return text + '\n\n' + sourceBlock;
}

function shouldRequireKnowledgeGrounding(prompt) {
  return hasAny(prompt, [
    '是什么', '介绍', '说明', '怎么', '如何', '为什么', '搜索', '查一下', '查询', '联网', '网页',
    '文档', '资料', '来源', 'openyida', '宜搭', 'bridge', '发布', '登录', '报错',
  ]);
}

function buildKnowledgeMissAnswer(prompt, reason, analysis) {
  var queryAnalysis = analysis || buildKnowledgeQueryAnalysis(prompt, []);
  var anchors = queryAnalysis.requiredAnchors || [];
  var lines = [
    '我没有真实的互联网搜索能力，所以这次没有直接编答案。',
    '',
    '我已经按页面内的宜搭数据查询链路检索知识库：`this.utils.yida.searchFormDatas`。',
    '查询问题：' + limitText(prompt || '', 100),
  ];
  if (anchors.length) {
    lines.push('识别到的核心概念：' + anchors.join('、'));
  }
  if (reason) {
    lines.push('查询状态：' + reason);
  } else {
    lines.push('查询结果：当前知识库没有命中相关已发布记录。');
  }
  if (anchors.length) {
    lines.push('补充说明：我只会使用同时覆盖这些核心概念的资料，不会拿相邻但不同的能力文档来替代回答。');
  }
  lines.push('');
  lines.push('因此我现在不能基于可靠资料回答这个问题。需要把对应 FAQ、文档片段或业务数据录入知识库表后，我再基于命中记录整理答案。');
  return lines.join('\n');
}

function getSourceLinks() {
  return [
    '[OpenYida Docs](' + OPENYIDA_DOCS_URL + ')',
    '[宜搭开发者手册](' + YIDA_DOCS_URL + ')',
  ].join(' / ');
}

function buildCapabilityAnswer() {
  return [
    '我是 **OpenYida 助手**，当前网页侧更适合做查询、诊断和资料检索，不把老 Qwen 当成完整搭建模型来用。',
    '',
    '我现在优先处理这些事：',
    '',
    '1. **只读查询**：通过本地 OpenYida 查询应用列表、登录态和环境信息。',
    '2. **资料检索**：从页面内置知识库里找 OpenYida / 宜搭相关说明，并附上来源。',
    '3. **问题排查**：发布参数顺序、登录态、目标页面类型、宜搭接口返回、页面白屏等。',
    '4. **使用指导**：解释 OpenYida CLI、悟空接入、数据查询、权限边界和常见命令。',
    '5. **搭建分流**：如果你要“帮我用宜搭做个系统”，我会建议切换到 Codex / OpenYida 强模型链路执行。',
    '',
    '你可以直接这样问：',
    '',
    '- “查一下我的宜搭应用列表”',
    '- “悟空怎么使用 OpenYida”',
    '- “这个发布失败日志怎么排查”',
    '- “openyida login 一直不生效怎么办”',
    '',
    '**权限边界**：每个人只能看自己的数据。助手回答默认基于当前会话、用户上传内容和公开文档；本地查询也只按当前 OpenYida 登录人的宜搭权限返回。',
    '',
    '资料来源：' + getSourceLinks() + '。如果你贴截图或错误日志，我会优先按 OpenYida 助手工单方式分诊，再给执行建议。',
  ].join('\n');
}

function buildCrmPrompt() {
  return [
    '请使用 OpenYida 帮我搭建一个 CRM 宜搭应用。',
    '',
    '业务目标：',
    '- 管理客户、联系人、销售机会、报价、合同、回款和跟进记录。',
    '',
    '请按以下交付：',
    '1. 新建宜搭应用，命名为「CRM 客户管理」。',
    '2. 设计表单：客户、联系人、商机、跟进记录、报价单、合同、回款。',
    '3. 设计流程：报价审批、合同审批、回款确认。',
    '4. 设计报表：销售漏斗、月度回款、商机阶段分布、客户跟进活跃度。',
    '5. 设计自定义首页：展示关键指标、待办、最近跟进、重点商机。',
    '6. 配置权限：销售只能看自己的客户，销售主管看团队，财务看合同与回款。',
    '7. 每一步先说明计划；涉及创建、发布或移动节点前，先让我确认。',
    '8. 数据权限要求：销售只能看自己的客户和商机；主管看团队；财务只看合同、发票和回款；不要越权展示其他人的数据。',
    '',
    '约束：',
    '- 优先使用 OpenYida CLI 和宜搭原生能力。',
    '- 自定义页面代码需通过 check-page 和 compile。',
    '- 发布命令参数顺序必须是：sourceFile appType formUuid。',
  ].join('\n');
}

function buildCrmAnswer() {
  return [
    '可以，CRM 很适合用 **OpenYida + 宜搭** 来做。我的建议不是先写代码，而是先把业务对象和流程拆清楚，然后交给 OpenYida 创建应用、表单、流程、报表和自定义页面。',
    '',
    '**推荐链路**',
    '',
    '1. 用 OpenYida 创建 CRM 应用。',
    '2. 先建客户、联系人、商机、跟进、报价、合同、回款这些核心表单。',
    '3. 把报价、合同、回款做成流程或权限受控表单。',
    '4. 用报表和自定义首页做销售漏斗、回款看板和待办聚合。',
    '5. 最后配置权限和导航分组，让销售、主管、财务看到不同入口。',
    '',
    '**可以复制给 OpenYida 的 prompt**',
    '',
    '```text',
    buildCrmPrompt(),
    '```',
    '',
    '下一步你可以把这段 prompt 交给 OpenYida 执行，也可以继续补充你的 CRM 行业，比如“教育销售”“B2B 大客户”“项目制交付”，我会把字段和流程再收窄。',
    '',
    '资料来源：' + getSourceLinks() + '。',
  ].join('\n');
}

function buildWukongAnswer() {
  return [
    '悟空可以使用 OpenYida，核心是先把 **OpenYida 技能包** 给到悟空，再让它按宜搭应用开发链路执行。',
    '',
    '**完整链路**',
    '',
    '1. 在 OpenYida 仓库里生成技能包：',
    '',
    '```bash',
    'npm run build:skills',
    '```',
    '',
    '生成物包括：',
    '- `dist/skills/openyida/`',
    '- `openyida-skills.zip`',
    '',
    '2. 在悟空里上传 `openyida-skills.zip`，让悟空获得 OpenYida 子技能，例如创建应用、创建页面、发布页面、数据管理、导航分组等。',
    '',
    '3. 悟空环境执行 Node/npm 前先设置 PATH：',
    '',
    '```bash',
    'export PATH="$HOME/.real/.bin/node/bin:$PATH"',
    '```',
    '',
    '4. 登录宜搭并确认环境：',
    '',
    '```bash',
    'openyida env',
    'openyida login',
    '```',
    '',
    '5. 让悟空按目标执行，比如：',
    '',
    '```text',
    '使用 OpenYida 帮我创建一个 CRM 宜搭应用。先创建应用和核心表单，再创建报表和自定义首页；每次发布前先 check-page 和 compile，涉及写入前先给我确认卡。',
    '```',
    '',
    '**助手建议**：如果你是第一次用，先从“创建一个只读验证页面”开始，确认登录态、appType、formUuid、发布参数顺序都通了，再做完整应用。',
    '',
    '**安全提醒**：悟空和 OpenYida 执行时仍以当前登录人的宜搭权限为边界，不应绕过宜搭的数据权限。',
    '',
    '资料来源：' + getSourceLinks() + '。',
  ].join('\n');
}

function buildPublishAnswer() {
  return [
    'OpenYida 发布失败时，我会按排查单来处理，先看 4 件事：',
    '',
    '1. **参数顺序**：发布命令必须是 `openyida publish <sourceFile> <appType> <formUuid>`，不要把 appType 和 formUuid 传反。',
    '2. **目标类型**：`formUuid` 必须是自定义展示页面，也就是 `display` 类型，不要发布到普通表单或流程表单。',
    '3. **本地预检**：先跑 `openyida check-page <sourceFile>` 和 `openyida compile <sourceFile>`。',
    '4. **登录态与组织**：用 `openyida env` 和 `openyida login` 确认当前 baseUrl、Cookie、corpId 都对。',
    '5. **数据权限**：如果发布页会读取业务数据，确认页面接口只查询当前用户可见范围，不要把全量数据暴露给普通用户。',
    '',
    '**推荐命令顺序**',
    '',
    '```bash',
    'openyida check-page project/pages/src/your-page.oyd.jsx',
    'openyida compile project/pages/src/your-page.oyd.jsx',
    'openyida publish project/pages/src/your-page.oyd.jsx APP_XXX FORM_XXX',
    '```',
    '',
    '如果你把错误日志贴给我，我会继续帮你判断是 JSX 规范、登录态、目标页面类型，还是宜搭接口返回异常。',
  ].join('\n');
}

function buildGroupAnswer() {
  return [
    '可以。导航分组我会按“先分析、再确认、后执行”的助手链路处理。',
    '',
    '**建议分组**',
    '',
    '1. 销售：客户、联系人、商机、报价、合同。',
    '2. 交付：项目、任务、里程碑、验收、交付工单。',
    '3. 财务：回款、发票、付款、费用、预算。',
    '4. 系统设置：成员、权限、字典、集成、自动化。',
    '',
    '**OpenYida 执行方式**',
    '',
    '```bash',
    'openyida nav-group list APP_XXX',
    'openyida nav-group create APP_XXX <groupName>',
    'openyida nav-group move APP_XXX <sourceNode> <targetGroup>',
    '```',
    '',
    '我已经可以先生成右侧确认卡。你确认后，再把 `APP_XXX` 和真实节点替换成当前应用的 appType 与导航节点。',
  ].join('\n');
}

function buildImageSupportAnswer() {
  return [
    '可以。你上传或粘贴截图后，我会把它当作 OpenYida 助手工单附件来处理：',
    '',
    '1. 先识别截图属于页面、表单、流程、报表还是发布错误。',
    '2. 再判断能否用 OpenYida/宜搭能力落地。',
    '3. 最后输出字段、流程、权限、页面或排查步骤。',
    '',
    '当前 OpenYida 助手已完成图片附件接收和消息展示；如果接入 OCR/视觉理解服务，就可以进一步自动读取截图内容。',
  ].join('\n');
}

function buildFallbackSupportAnswer(prompt) {
  var text = limitText(prompt || '你的问题', 72);
  return [
    '我会按 **OpenYida 助手工单** 先帮你分诊：',
    '',
    '- 问题：' + text,
    '- 判断：优先看它属于应用搭建、发布排查、数据管理、导航分组、权限配置，还是悟空/技能包接入。',
    '- 下一步：如果是业务目标，我会生成可复制 prompt；如果是报错，我会让你贴日志并按 OpenYida 发布链路排查；如果是宜搭配置，我会给出表单、流程、报表或权限方案。',
    '',
    '你可以继续补充：目标应用、截图、错误日志、appType、formUuid，或者直接说“帮我写成 OpenYida prompt”。',
    '',
    '资料来源：' + getSourceLinks() + '。',
  ].join('\n');
}

function buildServiceAnswer(prompt) {
  var value = String(prompt || '');
  if (hasAny(value, ['你能做什么', '能做什么', '你是谁', '介绍一下', '助手'])) {
    return buildCapabilityAnswer();
  }
  if (hasAny(value, ['crm', '客户管理', '客户关系', '销售管理'])) {
    return buildCrmAnswer();
  }
  if (hasAny(value, ['悟空', 'wukong', '技能包', 'openyida-skills', 'openyida skills'])) {
    return buildWukongAnswer();
  }
  if (hasAny(value, ['发布失败', '发布页面失败', 'publish', 'formuuid', 'sourcefile', '参数顺序', '白屏'])) {
    return buildPublishAnswer();
  }
  if (isGroupIntent(value)) {
    return buildGroupAnswer();
  }
  if (hasAny(value, ['截图', '图片', '上传', '表单截图', '流程图'])) {
    return buildImageSupportAnswer();
  }
  return buildFallbackSupportAnswer(value);
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
  return escaped;
}

function fallbackMarkdownToHtml(text) {
  var lines = String(text || '').split('\n');
  var html = [];
  var listOpen = false;
  lines.forEach((line) => {
    var ordered = line.match(/^\s*\d+\.\s+(.+)$/);
    if (ordered) {
      if (!listOpen) {
        html.push('<ol>');
        listOpen = true;
      }
      html.push('<li>' + inlineFallbackMarkdown(ordered[1]) + '</li>');
      return;
    }
    if (listOpen) {
      html.push('</ol>');
      listOpen = false;
    }
    if (!line.trim()) {
      html.push('');
      return;
    }
    html.push('<p>' + inlineFallbackMarkdown(line) + '</p>');
  });
  if (listOpen) {
    html.push('</ol>');
  }
  return html.join('');
}

function markdownToHtml(text) {
  if (typeof window !== 'undefined' && window.markdownit) {
    if (!window.__openYidaMarkdownIt) {
      window.__openYidaMarkdownIt = window.markdownit({
        html: false,
        linkify: true,
        breaks: true,
      });
    }
    return window.__openYidaMarkdownIt.render(String(text || ''));
  }
  return fallbackMarkdownToHtml(text);
}

function getCsrfToken() {
  if (typeof window === 'undefined') {
    return '';
  }
  if (window.g_config && window.g_config._csrf_token) {
    return window.g_config._csrf_token;
  }
  return '';
}

function encodeForm(data) {
  var pairs = [];
  Object.keys(data || {}).forEach((key) => {
    pairs.push(encodeURIComponent(key) + '=' + encodeURIComponent(data[key] === undefined || data[key] === null ? '' : data[key]));
  });
  return pairs.join('&');
}

function getRemoteWorkspaceKey() {
  var profile = getCurrentUserProfile();
  var owner = profile.userId || profile.name || 'anonymous';
  return 'openyida-chatbox:' + (getRuntimeAppType() || 'APP') + ':' + owner;
}

function canUseRemoteStorage(ctx) {
  return !!(CHAT_DATA_FORM_UUID && ctx && ctx.utils && ctx.utils.yida && ctx.utils.yida.searchFormDatas && ctx.utils.yida.saveFormData && ctx.utils.yida.updateFormData);
}

function shouldSyncRemotePatch(patch) {
  if (_remoteRestoring || !patch) {
    return false;
  }
  if (patch.isSending === true) {
    return false;
  }
  return !!(patch.sessions || patch.projects || patch.messages || patch.activeSessionId || patch.confirmCard !== undefined);
}

function cloneRemoteMessage(message) {
  var next = {};
  Object.keys(message || {}).forEach((key) => {
    next[key] = message[key];
  });
  if (next.content && String(next.content).length > 12000) {
    next.content = String(next.content).slice(0, 12000) + '\n\n[内容较长，已截断保存]';
  }
  if (next.imageData) {
    next.imageData = '';
    next.imagePersistNote = '图片内容未写入会话快照，避免占用表单容量。';
  }
  return next;
}

function buildRemotePersistPayload() {
  var payload = buildPersistPayload();
  var sessions = (payload.sessions || []).slice(0, REMOTE_MAX_SESSIONS);
  var nextMessages = {};
  sessions.forEach((session) => {
    var list = payload.messages && payload.messages[session.id] ? payload.messages[session.id] : [];
    nextMessages[session.id] = list.slice(Math.max(0, list.length - REMOTE_MAX_MESSAGES_PER_SESSION)).map((message) => cloneRemoteMessage(message));
  });
  payload.sessions = sessions;
  payload.messages = nextMessages;
  payload.savedAt = new Date().getTime();
  payload.clientVersion = STORAGE_KEY;
  return payload;
}

function countPayloadMessages(payload) {
  var total = 0;
  Object.keys((payload && payload.messages) || {}).forEach((key) => {
    total += payload.messages[key] && payload.messages[key].length ? payload.messages[key].length : 0;
  });
  return total;
}

function buildRemoteFormData() {
  var payload = buildRemotePersistPayload();
  var profile = getCurrentUserProfile();
  var session = getActiveSession();
  var formData = {};
  formData[CHAT_DATA_FIELDS.workspaceKey] = getRemoteWorkspaceKey();
  formData[CHAT_DATA_FIELDS.userId] = profile.userId || '';
  formData[CHAT_DATA_FIELDS.userName] = profile.name || '';
  formData[CHAT_DATA_FIELDS.title] = session && session.title ? session.title : '新聊天';
  formData[CHAT_DATA_FIELDS.snapshot] = JSON.stringify(payload);
  formData[CHAT_DATA_FIELDS.messageCount] = countPayloadMessages(payload);
  formData[CHAT_DATA_FIELDS.updatedAt] = new Date().getTime();
  formData[CHAT_DATA_FIELDS.clientVersion] = STORAGE_KEY;
  return formData;
}

function getSearchDataList(res) {
  return (res && res.data) || (res && res.content && res.content.data) || [];
}

function getRowFormData(row) {
  return (row && row.formData) || (row && row.data) || {};
}

function parseRemoteSnapshot(row) {
  var formData = getRowFormData(row);
  var raw = formData[CHAT_DATA_FIELDS.snapshot];
  if (!raw) {
    return null;
  }
  if (typeof raw !== 'string') {
    raw = JSON.stringify(raw);
  }
  return normalizePersistedState(JSON.parse(raw));
}

function buildPersistPayload() {
  return {
    sessions: cloneSessions(_customState.sessions),
    projects: cloneProjects(_customState.projects),
    activeSessionId: _customState.activeSessionId,
    messages: cloneMessageMap(_customState.messages),
    toolRuns: cloneToolRuns(_customState.toolRuns),
    mode: _customState.mode,
    provider: 'yida-text',
    sequence: _customState.sequence,
  };
}

function isLegacyCreateAppSession(session, messages) {
  var list = (messages && messages[session.id]) || [];
  return list.some((message) => {
    var content = String(message && message.content ? message.content : '');
    var meta = String(message && message.meta ? message.meta : '');
    return meta === 'OpenYida · create-app'
      || meta === 'OpenYida · 本地动作'
      || content.indexOf('可以，我先把这个需求转成一个可确认的 OpenYida 动作') >= 0
      || content.indexOf('OpenYida 创建应用失败：bridge_request_failed') >= 0
      || content.indexOf('通过本地 OpenYida 创建宜搭应用') >= 0;
  });
}

function normalizePersistedState(parsed) {
  if (!parsed || !parsed.sessions || !parsed.messages) {
    return null;
  }
  var allSessions = normalizeSessionsForSidebar(parsed.sessions);
  var projects = normalizeProjectsForSidebar(parsed.projects || []);
  var allMessages = normalizeMessagesForSessions(parsed.messages, allSessions);
  var sessions = allSessions.filter((session) => !isLegacyCreateAppSession(session, allMessages));
  if (!sessions.length) {
    sessions = cloneSessions(DEFAULT_SESSIONS);
  }
  var activeSessionId = resolveActiveSessionId(parsed.activeSessionId, sessions);
  return {
    sessions: sessions,
    projects: projects,
    activeSessionId: activeSessionId,
    messages: normalizeMessagesForSessions(allMessages, sessions),
    toolRuns: normalizeRestoredToolRuns(parsed.toolRuns || DEFAULT_TOOL_RUNS),
    mode: 'mixed',
    provider: 'yida-text',
    widgetOpen: false,
    confirmCard: null,
    messageRenderCount: MESSAGE_RENDER_INITIAL_COUNT,
    sequence: Number(parsed.sequence || 3),
  };
}

function appendMessages(sessionId, messages) {
  var nextMap = cloneMessageMap(_customState.messages);
  var list = nextMap[sessionId] ? nextMap[sessionId].slice(0) : [];
  (messages || []).forEach((item) => {
    list.push(item);
  });
  nextMap[sessionId] = list;
  return nextMap;
}

function replaceMessage(sessionId, messageId, patch) {
  var nextMap = cloneMessageMap(_customState.messages);
  var list = nextMap[sessionId] ? nextMap[sessionId].slice(0) : [];
  nextMap[sessionId] = list.map((item) => {
    if (item.id !== messageId) {
      return item;
    }
    var next = {};
    Object.keys(item || {}).forEach((key) => {
      next[key] = item[key];
    });
    Object.keys(patch || {}).forEach((key) => {
      next[key] = patch[key];
    });
    return next;
  });
  return nextMap;
}

function touchSession(sessionId, title) {
  return (_customState.sessions || []).map((item) => {
    if (item.id !== sessionId) {
      return item;
    }
    return {
      id: item.id,
      title: title || item.title,
      subtitle: item.subtitle,
      updatedAt: '刚刚',
      projectId: item.projectId || '',
      pinned: !!item.pinned,
      archived: !!item.archived,
    };
  });
}

function prependToolRun(name, status, detail) {
  var runs = cloneToolRuns(_customState.toolRuns);
  if (status === 'done' || status === 'error') {
    runs = runs.filter((item) => !(item && item.name === name && item.status === 'running'));
  }
  runs.unshift({
    id: nextId('run'),
    name: name,
    status: status,
    detail: limitText(detail || '', 54),
    time: getTimeLabel(),
  });
  return runs.slice(0, 8);
}

function getExecutionStepLabel(name) {
  var labels = {
    'chat.init': '初始化工作台',
    'chat.session.create': '创建会话',
    'chat.session.clear': '清空会话',
    'support.init': '初始化助手',
    'support.datasource': '载入数据源',
    'security.scope': '校验数据权限',
    'ai.model': '连接 Agent 能力',
    'ai.model.switch': '切换模型',
    'ai.text': '调用文本接口',
    'ai.image': '调用识图接口',
    'remote.load': '读取云端会话',
    'remote.save': '保存云端会话',
    'bridge.probe': '探测本地桥接',
    'bridge.pair': '配对本地桥接',
    'bridge.login': '检查本地登录',
    'bridge.feedback': '打开反馈表单',
    'openyida.app-list': '查询应用列表',
    'openyida.create-app': '创建宜搭应用',
    'guardrail.confirm': '等待用户确认',
    'knowledge.search': '查询知识库',
    'knowledge.miss': '知识库未命中',
    'markdown.renderer': '包装 Markdown',
    'text.generate': '生成助手回答',
    'attachment.upload': '上传图片',
    'attachment.add': '读取图片附件',
    'attachment.read': '分析附件上下文',
    'attachment.answer': '生成附件回答',
    'plan.confirm': '生成确认卡',
    'action.copy': '复制内容',
    'action.regenerate': '准备重新生成',
  };
  return labels[name] || name;
}

function getExecutionStatusLabel(status) {
  if (status === 'running') {
    return '进行中';
  }
  if (status === 'done') {
    return '已完成';
  }
  if (status === 'error') {
    return '失败';
  }
  return '待命';
}

function isGroupIntent(text) {
  var value = String(text || '');
  return value.indexOf('分组') >= 0 || value.indexOf('导航') >= 0 || value.indexOf('目录') >= 0;
}

function normalizeCreateAppName(value) {
  var name = String(value || '').replace(/\s+/g, ' ').trim();
  name = name.replace(/^[，,。.:：;；\s]+|[，,。.!！?？;；\s]+$/g, '');
  name = name.replace(/^(一个|个|一套|套|一下|一个类似|类似一个)/, '').trim();
  name = name.replace(/(?:类似|这样的|这种|这个需求|这个应用)[，,。.!！?？\s]*$/g, '').trim();
  name = name.replace(/(?:的)?应用[，,。.!！?？\s]*$/g, '').trim();
  return limitText(name, 60);
}

function parseCreateAppIntent(text) {
  var value = String(text || '').trim();
  if (!value) {
    return null;
  }
  var lower = value.toLowerCase();
  if (hasAny(value, ['是什么', '怎么', '如何', '为什么', '能做什么']) && !hasAny(value, ['帮我', '请帮', '我要', '我想', '需要'])) {
    return null;
  }
  var actionLike = hasAny(value, [
    '帮我用宜搭',
    '用宜搭做',
    '在宜搭',
    '宜搭做个',
    '宜搭创建',
    '宜搭搭建',
    '创建应用',
    '新建应用',
    '创建一个',
    '新建一个',
    '做个',
    '做一个',
    '搭建一个',
    '搭建个',
    '开发一个',
  ]) || lower.indexOf('openyida') >= 0;
  if (!actionLike) {
    return null;
  }

  var patterns = [
    /(?:帮我|请帮我|请|麻烦)?(?:用|在)?(?:宜搭|OpenYida|openyida)?(?:做|搭建|创建|新建|生成|开发|制作)(?:一个|个|一套|套)?(.+)$/i,
    /(?:我要|我想要|我想|需要)(?:用|在)?(?:宜搭|OpenYida|openyida)?(?:做|搭建|创建|新建|生成|开发|制作)(?:一个|个|一套|套)?(.+)$/i,
    /(?:创建|新建)(?:一个|个|一套|套)?(.+?)(?:应用)?$/i,
  ];
  var appName = '';
  for (var index = 0; index < patterns.length; index += 1) {
    var matched = value.match(patterns[index]);
    if (matched && matched[1]) {
      appName = normalizeCreateAppName(matched[1]);
      break;
    }
  }
  if (!appName || appName === '应用' || appName === '系统' || appName === '工具') {
    return null;
  }
  return {
    appName: appName,
    description: limitText('由 OpenYida 助手根据需求创建：' + value, 200),
    prompt: value,
  };
}

function buildCreateAppConfirmCard(intent) {
  var appName = intent && intent.appName ? intent.appName : '新的宜搭应用';
  return {
    title: '创建宜搭应用确认',
    source: appName,
    summary: '将通过本地 OpenYida 创建一个宜搭应用，创建后返回 appType 和管理地址；后续可以继续补表单、流程、报表和自定义页面。',
    action: 'openyida.create-app',
    confirmText: '创建应用',
    payload: {
      appName: appName,
      description: intent && intent.description ? intent.description : appName,
      prompt: intent && intent.prompt ? intent.prompt : appName,
    },
    steps: [
      '检查本地 OpenYida bridge 与宜搭登录态',
      '调用 openyida create-app 创建宜搭应用',
      '返回 appType 与管理地址',
      '继续按需求拆解表单、流程、报表和页面',
    ],
    commands: [
      'openyida create-app --name "' + appName + '" --desc "' + limitText(intent && intent.description ? intent.description : appName, 80) + '"',
    ],
  };
}

function buildCreateAppReadyAnswer(intent) {
  var appName = intent && intent.appName ? intent.appName : '新的宜搭应用';
  return [
    '这个属于“搭建/创建应用”类需求，我不建议直接在当前网页里的 Qwen 老模型上执行。',
    '',
    '**建议链路**',
    '',
    '1. 在 Codex / OpenYida 这类更强模型环境里发起搭建。',
    '2. 先让模型拆清楚表单、流程、权限、报表和页面。',
    '3. 涉及创建、发布、移动导航、写业务数据时，再由 OpenYida CLI 执行并给你确认。',
    '',
    '**我在当前网页里先不执行写入动作**，避免老模型把业务拆错或给出不稳定方案。这里更适合做查询、资料检索、登录诊断和发布排查。',
    '',
    '你可以复制下面这段到 Codex / OpenYida：',
    '',
    '```text',
    '帮我用宜搭搭建「' + appName + '」。请先拆解业务对象、表单字段、流程节点、权限范围、报表和自定义页面；每一步涉及创建或发布前先给确认项，不要直接越权读取或写入业务数据。',
    '```',
  ].join('\n');
}

function parseAppListIntent(text) {
  var value = String(text || '').trim();
  if (!value) {
    return null;
  }
  var lower = value.toLowerCase();
  var matched = hasAny(value, [
    '应用列表',
    '我的应用',
    '我有哪些应用',
    '查应用',
    '查询应用',
    '列出应用',
    '看下应用',
    '看看应用',
    '查一下应用',
  ]) || lower.indexOf('app-list') >= 0;
  if (!matched) {
    return null;
  }
  return { size: 20 };
}

function buildAppListMarkdown(apps) {
  var list = apps || [];
  if (!list.length) {
    return '没有查到当前登录人创建的宜搭应用。可以先确认本地 OpenYida 登录态，或在宜搭控制台检查当前组织。';
  }
  var lines = [
    '**已查询到 ' + list.length + ' 个宜搭应用。**',
    '',
    '| 应用 | appType | 地址 |',
    '| --- | --- | --- |',
  ];
  list.forEach(function(app) {
    var name = (app.appName || '未命名').replace(/\|/g, ' ');
    var appType = app.appType || '';
    var link = app.systemLink ? '[打开](' + app.systemLink + ')' : '-';
    lines.push('| ' + name + ' | `' + appType + '` | ' + link + ' |');
  });
  lines.push('');
  lines.push('这是只读查询，数据来自本机 OpenYida 登录态和宜搭权限范围。');
  return lines.join('\n');
}

function buildGroupConfirmCard(sourceText) {
  var source = limitText(sourceText || '整理当前应用导航分组', 52);
  return {
    title: '导航分组整理确认',
    source: source,
    summary: '先读取应用导航树，识别页面归属，再把页面移动到建议分组。真实执行前会继续等待确认。',
    steps: [
      '读取当前应用的左侧导航树',
      '新建或复用「销售、交付、财务、系统设置」分组',
      '按页面名称和用途移动表单、流程、报表与自定义页面',
      '返回移动结果和未识别页面清单',
    ],
    commands: [
      'openyida nav-group list APP_XXX',
      'openyida nav-group create APP_XXX <groupName>',
      'openyida nav-group move APP_XXX <sourceNode> <targetGroup>',
    ],
  };
}

function buildPlanConfirmCard(sourceText) {
  var source = limitText(sourceText || '把回答转成执行计划', 52);
  return {
    title: '执行计划确认',
    source: source,
    summary: '把当前回答沉淀为可执行计划；涉及写入、发布或移动节点时，先展示确认卡再调用 OpenYida。',
    steps: [
      '确认目标应用和目标页面',
      '拆解只读分析、配置变更和发布动作',
      '逐项执行前校验登录态与参数顺序',
      '输出执行结果、风险和回滚建议',
    ],
    commands: [
      'openyida env',
      'openyida check-page <sourceFile>',
      'openyida publish <sourceFile> <appType> <formUuid>',
    ],
  };
}

function getLatestWidgetMessages(messages) {
  var list = (messages || []).filter((item) => item && item.status !== 'thinking');
  if (!list.length) {
    return [];
  }
  return list.slice(Math.max(0, list.length - 2));
}

function getPreviousUserMessage(messageId) {
  var messages = getActiveMessages();
  var foundIndex = -1;
  messages.forEach((item, index) => {
    if (item.id === messageId) {
      foundIndex = index;
    }
  });
  for (var i = foundIndex - 1; i >= 0; i -= 1) {
    if (messages[i] && messages[i].role === 'user') {
      return messages[i];
    }
  }
  return null;
}

export function getCustomState(key) {
  if (key) {
    return _customState[key];
  }
  return Object.assign({}, _customState);
}

export function setCustomState(newState) {
  var shouldSync = shouldSyncRemotePatch(newState);
  Object.keys(newState || {}).forEach((key) => {
    _customState[key] = newState[key];
  });
  updateDocumentTitle();
  this.forceUpdate();
  this.persistWorkspace();
  if (shouldSync) {
    this.scheduleRemoteWorkspaceSync();
  }
}

export function forceUpdate() {
  this.setState({ timestamp: new Date().getTime() });
}

export function focusComposerInput() {
  if (typeof document === 'undefined') {
    return;
  }
  setTimeout(function() {
    var input = document.getElementById('agent-chatbox-input') || document.getElementById('agent-chatbox-widget-input');
    if (input && input.focus) {
      if (input.id === 'agent-chatbox-input') {
        resizeComposerInput(input);
      }
      input.focus();
    }
  }, 30);
}

function resizeComposerInput(input) {
  if (!input || !input.style) {
    return;
  }
  input.style.height = 'auto';
  var maxHeight = 168;
  var minHeight = 28;
  var nextHeight = Math.max(minHeight, Math.min(input.scrollHeight || minHeight, maxHeight));
  input.style.height = nextHeight + 'px';
  input.style.overflowY = input.scrollHeight > maxHeight ? 'auto' : 'hidden';
}

export function focusMainComposerInput() {
  if (typeof document === 'undefined') {
    return;
  }
  setTimeout(function() {
    var input = document.getElementById('agent-chatbox-input');
    if (input && input.focus) {
      resizeComposerInput(input);
      input.focus();
    }
  }, 50);
}

export function scrollChatToBottom() {
  if (typeof document === 'undefined') {
    return;
  }
  setTimeout(function() {
    var list = document.getElementById('agent-chatbox-message-list');
    if (list) {
      list.scrollTop = list.scrollHeight;
    }
  }, 80);
}

export function handleMessageListScroll(e) {
  var list = e && e.currentTarget ? e.currentTarget : null;
  if (!list || list.scrollTop > MESSAGE_SCROLL_TOP_THRESHOLD) {
    return;
  }
  var messages = getActiveMessages();
  var currentCount = getMessageRenderCount(messages.length);
  if (currentCount >= messages.length) {
    return;
  }
  var previousScrollHeight = list.scrollHeight;
  var previousScrollTop = list.scrollTop;
  var nextCount = Math.min(messages.length, currentCount + MESSAGE_RENDER_STEP);
  this.setCustomState({
    messageRenderCount: nextCount,
    statusText: nextCount >= messages.length ? '已加载全部历史' : '已加载更早消息',
  });
  setTimeout(function() {
    var nextList = document.getElementById('agent-chatbox-message-list');
    if (nextList) {
      nextList.scrollTop = nextList.scrollHeight - previousScrollHeight + previousScrollTop;
    }
  }, 40);
}

export function ensureTailwind() {
  var self = this;
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return Promise.resolve();
  }
  if (window.__openYidaAgentChatTailwindReady) {
    return Promise.resolve();
  }
  if (window.__openYidaAgentChatTailwindLoading) {
    return window.__openYidaAgentChatTailwindLoading;
  }
  if (!TAILWIND_CDN) {
    this.injectTailwindFallback();
    return Promise.resolve();
  }
  this.injectTailwindSource();
  var loader = this.utils && this.utils.loadScript ? this.utils.loadScript(TAILWIND_CDN) : this.loadStandaloneScript(TAILWIND_CDN);
  window.__openYidaAgentChatTailwindLoading = loader.then(function() {
    window.__openYidaAgentChatTailwindReady = true;
    self.forceUpdate();
    self.focusMainComposerInput();
  }).catch(function() {
    window.__openYidaAgentChatTailwindFailed = true;
    self.injectTailwindFallback();
    self.forceUpdate();
    self.focusMainComposerInput();
  });
  return window.__openYidaAgentChatTailwindLoading;
}

export function injectTailwindSource() {
  if (typeof document === 'undefined' || document.getElementById('openyida-agent-chat-tailwind-source')) {
    return;
  }
  var style = document.createElement('style');
  style.id = 'openyida-agent-chat-tailwind-source';
  style.type = 'text/tailwindcss';
  style.innerHTML = TAILWIND_SOURCE_CSS;
  document.head.appendChild(style);
}

export function injectTailwindFallback() {
  if (typeof document === 'undefined' || document.getElementById('openyida-agent-chat-tailwind-fallback')) {
    return;
  }
  var style = document.createElement('style');
  style.id = 'openyida-agent-chat-tailwind-fallback';
  style.innerHTML = TAILWIND_FALLBACK_CSS;
  document.head.appendChild(style);
}

export function loadStandaloneScript(src) {
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
    self.setCustomState({
      markdownReady: !!(typeof window !== 'undefined' && window.markdownit),
      toolRuns: prependToolRun('markdown.renderer', 'done', 'markdown-it@13.0.1'),
    });
  }).catch(function(err) {
    self.setCustomState({
      markdownReady: false,
      toolRuns: prependToolRun('markdown.renderer', 'error', err && err.message ? err.message : 'fallback'),
    });
  });
}

export function persistWorkspace() {
  if (typeof window === 'undefined' || !window.localStorage) {
    return;
  }
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(buildPersistPayload()));
  } catch (err) {
    if (err && err.message) {
      return;
    }
  }
}

export function restoreWorkspace() {
  if (typeof window === 'undefined' || !window.localStorage) {
    return;
  }
  try {
    var raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return;
    }
    var restored = normalizePersistedState(JSON.parse(raw));
    if (!restored) {
      return;
    }
    Object.keys(restored).forEach((key) => {
      _customState[key] = restored[key];
    });
  } catch (err) {
    if (err && err.message) {
      return;
    }
  }
}

export function loadRemoteWorkspace() {
  var self = this;
  if (!canUseRemoteStorage(this)) {
    return Promise.resolve();
  }
  var search = {};
  search[CHAT_DATA_FIELDS.workspaceKey] = getRemoteWorkspaceKey();
  return this.utils.yida.searchFormDatas({
    formUuid: CHAT_DATA_FORM_UUID,
    searchFieldJson: JSON.stringify(search),
    currentPage: 1,
    pageSize: 1,
  }).then(function(res) {
    var rows = getSearchDataList(res);
    if (!rows.length) {
      _remoteRestoring = true;
      self.setCustomState({
        remoteLoaded: true,
        remoteSyncStatus: 'ready',
        toolRuns: prependToolRun('remote.load', 'done', '等待首次保存'),
      });
      _remoteRestoring = false;
      self.scheduleRemoteWorkspaceSync(REMOTE_SYNC_DEBOUNCE_MS);
      return;
    }
    var row = rows[0];
    var restored = null;
    try {
      restored = parseRemoteSnapshot(row);
    } catch (err) {
      restored = null;
    }
    _remoteRestoring = true;
    if (restored) {
      restored.remoteLoaded = true;
      restored.remoteFormInstId = row.formInstId || row.instId || '';
      restored.remoteSyncStatus = 'loaded';
      restored.statusText = '已加载云端会话';
      restored.toolRuns = prependToolRun('remote.load', 'done', '宜搭表单');
      self.setCustomState(restored);
      self.scrollChatToBottom();
    } else {
      self.setCustomState({
        remoteLoaded: true,
        remoteFormInstId: row.formInstId || row.instId || '',
        remoteSyncStatus: 'loaded',
        toolRuns: prependToolRun('remote.load', 'done', '记录已存在'),
      });
    }
    _remoteRestoring = false;
  }).catch(function(err) {
    _remoteRestoring = true;
    self.setCustomState({
      remoteLoaded: false,
      remoteSyncStatus: 'load-error',
      toolRuns: prependToolRun('remote.load', 'error', err && err.message ? err.message : '读取失败'),
    });
    _remoteRestoring = false;
  });
}

export function searchKnowledgeBase(prompt) {
  var requiresGrounding = shouldRequireKnowledgeGrounding(prompt);
  var freshCache = readKnowledgeCache({ allowStale: false });
  if (freshCache && freshCache.records.length) {
    return Promise.resolve(buildKnowledgeSearchResponse(freshCache.records, prompt, {
      cacheHit: true,
    }));
  }
  if (!canUseKnowledgeSearch(this)) {
    var cacheOnly = readKnowledgeCache({ allowStale: true });
    if (cacheOnly && cacheOnly.records.length) {
      return Promise.resolve(buildKnowledgeSearchResponse(cacheOnly.records, prompt, {
        cacheHit: true,
        cacheStale: !cacheOnly.fresh,
      }));
    }
    return Promise.resolve({
      searched: false,
      requiresGrounding: requiresGrounding,
      results: [],
      queryAnalysis: buildKnowledgeQueryAnalysis(prompt, []),
      error: '当前页面没有可用的宜搭表单查询能力',
    });
  }
  var self = this;
  var search = {};
  search[KNOWLEDGE_DATA_FIELDS.status] = '已发布';

  function fetchPage(page) {
    return self.utils.yida.searchFormDatas({
      formUuid: KNOWLEDGE_DATA_FORM_UUID,
      searchFieldJson: JSON.stringify(search),
      currentPage: page,
      pageSize: KNOWLEDGE_QUERY_PAGE_SIZE,
    });
  }

  function fetchAllPages() {
    var allRecords = [];
    function loop(page) {
      if (page > KNOWLEDGE_QUERY_MAX_PAGES) {
        return Promise.resolve(allRecords);
      }
      return fetchPage(page).then(function(res) {
        var rows = getSearchDataList(res);
        var records = (rows || []).map((row) => buildKnowledgeRecord(row)).filter((record) => record && record.id && record.status !== '停用');
        allRecords = allRecords.concat(records);
        if (rows.length < KNOWLEDGE_QUERY_PAGE_SIZE) {
          return allRecords;
        }
        return loop(page + 1);
      });
    }
    return loop(1);
  }

  return fetchAllPages().then(function(records) {
    writeKnowledgeCache(records, { complete: true });
    return buildKnowledgeSearchResponse(records, prompt, {
      cacheHit: false,
    });
  }).catch(function(err) {
    var staleCache = readKnowledgeCache({ allowStale: true });
    if (staleCache && staleCache.records.length) {
      return buildKnowledgeSearchResponse(staleCache.records, prompt, {
        cacheHit: true,
        cacheStale: !staleCache.fresh,
      });
    }
    return {
      searched: true,
      requiresGrounding: requiresGrounding,
      results: [],
      queryAnalysis: buildKnowledgeQueryAnalysis(prompt, []),
      error: err && err.message ? err.message : '知识库查询失败',
    };
  });
}

export function scheduleRemoteWorkspaceSync(delay) {
  var self = this;
  if (_remoteRestoring || !canUseRemoteStorage(this)) {
    return;
  }
  if (_remoteSyncTimer) {
    clearTimeout(_remoteSyncTimer);
  }
  var elapsed = new Date().getTime() - _lastRemoteSyncAt;
  var wait = Math.max(delay || REMOTE_SYNC_DEBOUNCE_MS, Math.max(0, REMOTE_SYNC_MIN_INTERVAL_MS - elapsed));
  _remoteSyncTimer = setTimeout(function() {
    _remoteSyncTimer = null;
    self.saveRemoteWorkspaceNow();
  }, wait);
}

export function saveRemoteWorkspaceNow() {
  var self = this;
  if (!canUseRemoteStorage(this)) {
    return Promise.resolve();
  }
  if (_remoteSyncInFlight) {
    _remoteSyncQueued = true;
    return Promise.resolve();
  }
  _remoteSyncInFlight = true;
  var formData = buildRemoteFormData();
  var request = _customState.remoteFormInstId
    ? this.utils.yida.updateFormData({
      formInstId: _customState.remoteFormInstId,
      updateFormDataJson: JSON.stringify(formData),
      useLatestVersion: 'y',
    })
    : this.utils.yida.saveFormData({
      formUuid: CHAT_DATA_FORM_UUID,
      appType: getRuntimeAppType(),
      formDataJson: JSON.stringify(formData),
    });
  return request.then(function(res) {
    var nextInstId = _customState.remoteFormInstId || (res && (res.result || res.formInstId || res.instId)) || '';
    _lastRemoteSyncAt = new Date().getTime();
    _remoteSyncInFlight = false;
    _remoteRestoring = true;
    self.setCustomState({
      remoteFormInstId: nextInstId,
      remoteLoaded: true,
      remoteSyncStatus: 'synced',
      toolRuns: prependToolRun('remote.save', 'done', '宜搭表单'),
    });
    _remoteRestoring = false;
    if (_remoteSyncQueued) {
      _remoteSyncQueued = false;
      self.scheduleRemoteWorkspaceSync(REMOTE_SYNC_MIN_INTERVAL_MS);
    }
  }).catch(function(err) {
    _remoteSyncInFlight = false;
    _remoteRestoring = true;
    self.setCustomState({
      remoteSyncStatus: 'save-error',
      toolRuns: prependToolRun('remote.save', 'error', err && err.message ? err.message : '保存失败'),
    });
    _remoteRestoring = false;
  });
}

export function initLocalBridge() {
  var pairToken = ensureBridgePairToken();
  var candidates = buildBridgeCandidates();
  if (!candidates.length) {
    return;
  }
  this.setCustomState({
    bridgeStatus: 'probing',
    bridgePairToken: pairToken,
    bridgeMessage: '正在探测本地 OpenYida',
    bridgeBusy: true,
    toolRuns: prependToolRun('bridge.probe', 'running', '127.0.0.1:6736 / 9432'),
  });
  this.probeBridgeCandidates(candidates, 0);
}

export function probeBridgeCandidates(candidates, index) {
  var self = this;
  var item = candidates[index];
  if (!item) {
    self.setCustomState({
      bridgeStatus: 'offline',
      bridgeBaseUrl: '',
      bridgeAccessToken: '',
      bridgeVersion: '',
      bridgeBusy: false,
      bridgePairToken: ensureBridgePairToken(),
      bridgeMessage: '未检测到本地 OpenYida。复制页面里的启动命令到本机终端运行即可连接。',
      toolRuns: prependToolRun('bridge.probe', 'error', getBridgeStartCommand()),
    });
    return;
  }

  bridgeRequest(item.baseUrl, '/v1/hello', { timeout: 1800 }).then(function(data) {
    var version = data && data.version ? data.version : '';
    if (!isBridgeVersionSupported(version)) {
      clearStoredBridgeSession();
      self.setCustomState({
        bridgeStatus: 'outdated',
        bridgeBaseUrl: item.baseUrl,
        bridgeAccessToken: '',
        bridgeVersion: version,
        bridgeCapabilities: data && data.capabilities ? data.capabilities : [],
        bridgeAllowedOrigins: data && data.allowedOrigins ? data.allowedOrigins : [],
        bridgeBusy: false,
        bridgePanelOpen: true,
        bridgeMessage: getBridgeUpgradeMessage(version),
        toolRuns: prependToolRun('bridge.probe', 'error', version ? ('OpenYida ' + version) : 'OpenYida 版本过旧'),
      });
      return;
    }
    self.setCustomState({
      bridgeStatus: 'detected',
      bridgeBaseUrl: item.baseUrl,
      bridgeVersion: version,
      bridgeCapabilities: data && data.capabilities ? data.capabilities : [],
      bridgeAllowedOrigins: data && data.allowedOrigins ? data.allowedOrigins : [],
      bridgeBusy: false,
      bridgeMessage: '已检测到本地 OpenYida，等待配对',
      toolRuns: prependToolRun('bridge.probe', 'done', item.baseUrl),
    });
    if (item.accessToken) {
      self.refreshBridgeStatus(item.baseUrl, item.accessToken);
      return;
    }
    if (item.pairToken) {
      self.pairLocalBridge(item.baseUrl, item.pairToken, function() {
        self.probeBridgeCandidates(candidates, index + 1);
      });
    }
  }).catch(function() {
    self.probeBridgeCandidates(candidates, index + 1);
  });
}

export function detectLocalBridge() {
  clearStoredBridgeSession();
  this.initLocalBridge();
}

export function toggleBridgePanel() {
  var nextOpen = !_customState.bridgePanelOpen;
  this.setCustomState({ bridgePanelOpen: nextOpen });
  if (nextOpen && (_customState.bridgeStatus === 'idle' || _customState.bridgeStatus === 'offline' || _customState.bridgeStatus === 'outdated')) {
    this.detectLocalBridge();
  }
}

export function pairLocalBridge(baseUrl, pairToken, onRetryNext) {
  var self = this;
  var targetBase = normalizeBridgeBaseUrl(baseUrl || _customState.bridgeBaseUrl);
  var token = pairToken || _customState.bridgePairToken;
  if (!targetBase || !token) {
    self.setCustomState({
      bridgeStatus: 'detected',
      bridgeMessage: '请复制页面里的 openyida bridge start --token 命令启动本地连接',
      bridgeBusy: false,
    });
    return;
  }

  self.setCustomState({
    bridgeBusy: true,
    bridgeMessage: '正在配对本地 OpenYida',
    toolRuns: prependToolRun('bridge.pair', 'running', targetBase),
  });
  bridgeRequest(targetBase, '/v1/pair', {
    method: 'POST',
    body: { token: token },
    timeout: 3000,
  }).then(function(data) {
    writeStoredBridgeSession(targetBase, data.token);
    self.setCustomState({
      bridgeStatus: 'paired',
      bridgeBaseUrl: targetBase,
      bridgeAccessToken: data.token,
      bridgeVersion: _customState.bridgeVersion,
      bridgeCapabilities: data.capabilities || _customState.bridgeCapabilities,
      bridgeAllowedOrigins: data.allowedOrigins || _customState.bridgeAllowedOrigins,
      bridgeBusy: false,
      bridgeMessage: '本地 OpenYida 已连接',
      bridgePanelOpen: _customState.bridgePanelOpen,
      toolRuns: prependToolRun('bridge.pair', 'done', 'local bridge'),
    });
    self.checkBridgeLogin();
  }).catch(function(err) {
    clearStoredBridgeSession();
    if (onRetryNext && err && err.data && err.data.error === 'invalid_pairing_token') {
      onRetryNext();
      return;
    }
    self.setCustomState({
      bridgeStatus: 'error',
      bridgeBusy: false,
      bridgeMessage: err && err.message ? err.message : '配对失败',
      toolRuns: prependToolRun('bridge.pair', 'error', err && err.message ? err.message : 'pair failed'),
    });
  });
}

export function refreshBridgeStatus(baseUrl, accessToken) {
  var self = this;
  var targetBase = normalizeBridgeBaseUrl(baseUrl || _customState.bridgeBaseUrl);
  var token = accessToken || _customState.bridgeAccessToken;
  if (!targetBase || !token) {
    return;
  }
  bridgeRequest(targetBase, '/v1/status', {
    token: token,
    timeout: 2500,
  }).then(function(data) {
    writeStoredBridgeSession(targetBase, token);
    self.setCustomState({
      bridgeStatus: 'paired',
      bridgeBaseUrl: targetBase,
      bridgeAccessToken: token,
      bridgeVersion: data.version || _customState.bridgeVersion,
      bridgeCapabilities: data.capabilities || _customState.bridgeCapabilities,
      bridgeAllowedOrigins: data.allowedOrigins || _customState.bridgeAllowedOrigins,
      bridgeLogin: data.login || _customState.bridgeLogin,
      bridgeBusy: false,
      bridgeMessage: '本地 OpenYida 已连接',
      toolRuns: prependToolRun('bridge.pair', 'done', targetBase),
    });
  }).catch(function() {
    clearStoredBridgeSession();
    self.setCustomState({
      bridgeStatus: 'detected',
      bridgeAccessToken: '',
      bridgeBusy: false,
      bridgeMessage: '本地服务在线，请重新配对',
    });
  });
}

export function checkBridgeLogin() {
  var self = this;
  if (!_customState.bridgeBaseUrl || !_customState.bridgeAccessToken) {
    self.toggleBridgePanel();
    return;
  }
  self.setCustomState({
    bridgeBusy: true,
    bridgeMessage: '正在检查本地登录态',
    toolRuns: prependToolRun('bridge.login', 'running', 'login/check'),
  });
  bridgeRequest(_customState.bridgeBaseUrl, '/v1/actions/login/check', {
    method: 'POST',
    token: _customState.bridgeAccessToken,
    body: {},
    timeout: 5000,
  }).then(function(data) {
    self.setCustomState({
      bridgeStatus: 'paired',
      bridgeBusy: false,
      bridgeLogin: data.login || null,
      bridgeMessage: '登录态: ' + getBridgeLoginLabel(data.login),
      toolRuns: prependToolRun('bridge.login', 'done', getBridgeLoginLabel(data.login)),
    });
  }).catch(function(err) {
    self.setCustomState({
      bridgeBusy: false,
      bridgeMessage: err && err.message ? err.message : '登录检查失败',
      toolRuns: prependToolRun('bridge.login', 'error', err && err.message ? err.message : 'check failed'),
    });
  });
}

export function startBridgeLogin() {
  var self = this;
  if (!_customState.bridgeBaseUrl || !_customState.bridgeAccessToken) {
    self.toggleBridgePanel();
    return;
  }
  self.setCustomState({
    bridgeBusy: true,
    bridgeQrUrl: '',
    bridgeLoginSessionId: '',
    bridgeOrganizations: [],
    bridgeMessage: '正在生成本地登录二维码',
    toolRuns: prependToolRun('bridge.login', 'running', 'login/start'),
  });
  bridgeRequest(_customState.bridgeBaseUrl, '/v1/actions/login/start', {
    method: 'POST',
    token: _customState.bridgeAccessToken,
    body: {},
    timeout: 12000,
  }).then(function(data) {
    var login = data.login || {};
    self.setCustomState({
      bridgeBusy: false,
      bridgeLogin: login,
      bridgeQrUrl: login.qrUrl || '',
      bridgeLoginSessionId: login.loginSessionId || '',
      bridgeOrganizations: login.organizations || [],
      bridgeMessage: data.alreadyLoggedIn ? '本地 OpenYida 已登录' : '请用钉钉扫码确认',
      toolRuns: prependToolRun('bridge.login', 'done', login.status || 'started'),
    });
    if (login.loginSessionId) {
      self.scheduleBridgeLoginPoll(1400);
    }
  }).catch(function(err) {
    self.setCustomState({
      bridgeBusy: false,
      bridgeMessage: err && err.message ? err.message : '启动登录失败',
      toolRuns: prependToolRun('bridge.login', 'error', err && err.message ? err.message : 'start failed'),
    });
  });
}

export function scheduleBridgeLoginPoll(delay) {
  var self = this;
  if (_bridgePollTimer) {
    clearTimeout(_bridgePollTimer);
  }
  _bridgePollTimer = setTimeout(function() {
    self.pollBridgeLogin();
  }, delay || 1200);
}

export function pollBridgeLogin() {
  var self = this;
  if (!_customState.bridgeBaseUrl || !_customState.bridgeAccessToken || !_customState.bridgeLoginSessionId) {
    return;
  }
  bridgeRequest(_customState.bridgeBaseUrl, '/v1/actions/login/poll', {
    method: 'POST',
    token: _customState.bridgeAccessToken,
    body: { loginSessionId: _customState.bridgeLoginSessionId },
    timeout: 5000,
  }).then(function(data) {
    var login = data.login || {};
    self.setCustomState({
      bridgeBusy: false,
      bridgeLogin: login,
      bridgeOrganizations: login.organizations || [],
      bridgeMessage: '登录态: ' + getBridgeLoginLabel(login),
      toolRuns: prependToolRun('bridge.login', login.status === 'ok' ? 'done' : 'running', getBridgeLoginLabel(login)),
    });
    if (login.status === 'waiting_scan') {
      self.scheduleBridgeLoginPoll(1600);
    }
  }).catch(function(err) {
    self.setCustomState({
      bridgeBusy: false,
      bridgeMessage: err && err.message ? err.message : '轮询登录失败',
      toolRuns: prependToolRun('bridge.login', 'error', err && err.message ? err.message : 'poll failed'),
    });
  });
}

export function selectBridgeCorp(corpId) {
  var self = this;
  if (!_customState.bridgeBaseUrl || !_customState.bridgeAccessToken || !_customState.bridgeLoginSessionId || !corpId) {
    return;
  }
  self.setCustomState({
    bridgeBusy: true,
    bridgeMessage: '正在切换组织',
  });
  bridgeRequest(_customState.bridgeBaseUrl, '/v1/actions/login/select-corp', {
    method: 'POST',
    token: _customState.bridgeAccessToken,
    body: {
      loginSessionId: _customState.bridgeLoginSessionId,
      corpId: corpId,
    },
    timeout: 12000,
  }).then(function(data) {
    self.setCustomState({
      bridgeBusy: false,
      bridgeLogin: data.login || null,
      bridgeOrganizations: [],
      bridgeMessage: '登录态: ' + getBridgeLoginLabel(data.login),
      toolRuns: prependToolRun('bridge.login', 'done', getBridgeLoginLabel(data.login)),
    });
  }).catch(function(err) {
    self.setCustomState({
      bridgeBusy: false,
      bridgeMessage: err && err.message ? err.message : '组织切换失败',
      toolRuns: prependToolRun('bridge.login', 'error', err && err.message ? err.message : 'select corp failed'),
    });
  });
}

export function openBridgeFeedback() {
  var self = this;
  if (!_customState.bridgeBaseUrl || !_customState.bridgeAccessToken) {
    self.toggleBridgePanel();
    return;
  }
  self.setCustomState({
    bridgeBusy: true,
    bridgeMessage: '正在生成反馈链接',
    toolRuns: prependToolRun('bridge.feedback', 'running', 'feedback-url'),
  });
  bridgeRequest(_customState.bridgeBaseUrl, '/v1/actions/feedback-url', {
    method: 'POST',
    token: _customState.bridgeAccessToken,
    body: {
      tool: 'Yida Page',
      command: 'https://demo.aliwork.com/s/openyida',
      reason: 'openyida_page_bridge',
      diagnostics: buildBridgeDiagnostics(),
    },
    timeout: 5000,
  }).then(function(data) {
    self.setCustomState({
      bridgeBusy: false,
      bridgeMessage: '反馈链接已生成',
      toolRuns: prependToolRun('bridge.feedback', 'done', 'feedback form'),
    });
    if (data && data.url && typeof window !== 'undefined' && window.open) {
      window.open(data.url, '_blank');
    }
  }).catch(function(err) {
    self.setCustomState({
      bridgeBusy: false,
      bridgeMessage: err && err.message ? err.message : '反馈链接生成失败',
      toolRuns: prependToolRun('bridge.feedback', 'error', err && err.message ? err.message : 'feedback failed'),
    });
  });
}

export function callBridgeCreateApp(payload) {
  if (!_customState.bridgeBaseUrl || !_customState.bridgeAccessToken) {
    return Promise.reject(new Error('请先连接本地 OpenYida'));
  }
  return bridgeRequest(_customState.bridgeBaseUrl, '/v1/actions/create-app', {
    method: 'POST',
    token: _customState.bridgeAccessToken,
    body: {
      appName: payload && payload.appName ? payload.appName : '',
      description: payload && payload.description ? payload.description : '',
    },
    timeout: 130000,
  });
}

export function callBridgeAppList(payload) {
  if (!_customState.bridgeBaseUrl || !_customState.bridgeAccessToken) {
    return Promise.reject(new Error('请先连接本地 OpenYida'));
  }
  return bridgeRequest(_customState.bridgeBaseUrl, '/v1/actions/app-list', {
    method: 'POST',
    token: _customState.bridgeAccessToken,
    body: {
      size: payload && payload.size ? payload.size : 20,
    },
    timeout: 35000,
  });
}

export function executeAppListQuery(intent, sessionId, pendingId) {
  var self = this;
  if (!_customState.bridgeBaseUrl || !_customState.bridgeAccessToken || _customState.bridgeStatus !== 'paired') {
    self.setCustomState({
      messages: replaceMessage(sessionId, pendingId, {
        status: 'error',
        content: '应用列表属于本地只读查询。请先点击右上角连接本地 OpenYida，或复制启动命令到本机终端运行后再试。',
        meta: 'OpenYida · 需要连接',
      }),
      isSending: false,
      bridgeMessage: '请先连接本地 OpenYida',
      statusText: '等待本地连接',
      toolRuns: prependToolRun('openyida.app-list', 'error', 'bridge not connected'),
    });
    self.focusMainComposerInput();
    return;
  }

  if (!hasBridgeCapability('openyida.app-list')) {
    self.setCustomState({
      messages: replaceMessage(sessionId, pendingId, {
        status: 'error',
        content: '当前本地 OpenYida bridge 还不支持应用列表查询。请升级 OpenYida 并重启 bridge 后再试。',
        meta: 'OpenYida · 需要升级',
      }),
      isSending: false,
      bridgeMessage: '需要升级本地 OpenYida',
      statusText: '需要升级本地 OpenYida',
      toolRuns: prependToolRun('openyida.app-list', 'error', 'missing capability'),
    });
    self.focusMainComposerInput();
    return;
  }

  self.setCustomState({
    bridgeBusy: true,
    bridgeMessage: '正在查询应用列表',
    statusText: '正在查询应用列表',
    toolRuns: prependToolRun('openyida.app-list', 'running', 'app-list'),
  });

  self.callBridgeAppList(intent || {}).then(function(data) {
    var apps = data && data.apps ? data.apps : [];
    self.setCustomState({
      messages: replaceMessage(sessionId, pendingId, {
        status: 'done',
        content: buildAppListMarkdown(apps),
        meta: 'OpenYida · 应用列表',
      }),
      isSending: false,
      bridgeBusy: false,
      bridgeMessage: '应用列表查询完成',
      statusText: '查询完成',
      toolRuns: prependToolRun('openyida.app-list', 'done', String(apps.length) + ' apps'),
    });
    self.scrollChatToBottom();
    self.focusMainComposerInput();
  }).catch(function(err) {
    var message = err && err.message ? err.message : '应用列表查询失败';
    self.setCustomState({
      messages: replaceMessage(sessionId, pendingId, {
        status: 'error',
        content: 'OpenYida 应用列表查询失败：' + message + '\n\n请确认右上角本地连接、宜搭登录态和当前组织是否正确。',
        meta: 'OpenYida · error',
      }),
      isSending: false,
      bridgeBusy: false,
      bridgeMessage: message,
      statusText: '查询失败',
      toolRuns: prependToolRun('openyida.app-list', 'error', message),
    });
    self.utils.toast({ title: message, type: 'error' });
    self.focusMainComposerInput();
  });
}

export function executeCreateAppConfirmCard(card) {
  var self = this;
  var payload = card && card.payload ? card.payload : {};
  var appName = payload.appName || card.source || '新的宜搭应用';
  if (!_customState.bridgeBaseUrl || !_customState.bridgeAccessToken || _customState.bridgeStatus !== 'paired') {
    self.setCustomState({
      bridgePanelOpen: true,
      bridgeMessage: '请先连接本地 OpenYida，再执行创建应用',
      statusText: '等待本地 OpenYida 连接',
      toolRuns: prependToolRun('openyida.create-app', 'error', 'bridge not connected'),
    });
    self.utils.toast({ title: '请先连接本地 OpenYida', type: 'warning' });
    return;
  }
  if (!hasBridgeCapability('openyida.create-app')) {
    self.setCustomState({
      bridgePanelOpen: true,
      bridgeMessage: '当前本地 bridge 缺少创建应用能力，请升级 OpenYida 并重启 bridge',
      statusText: '需要升级本地 OpenYida',
      toolRuns: prependToolRun('openyida.create-app', 'error', 'missing capability'),
    });
    self.utils.toast({ title: '请升级并重启 OpenYida bridge', type: 'warning' });
    return;
  }

  var session = getActiveSession();
  var sessionId = session ? session.id : 'session-main';
  var pendingId = nextId('m');
  var pendingMessage = {
    id: pendingId,
    role: 'assistant',
    type: 'text',
    status: 'thinking',
    content: '正在通过本地 OpenYida 创建宜搭应用',
    createdAt: getTimeLabel(),
    meta: 'OpenYida · create-app',
  };
  self.setCustomState({
    messages: appendMessages(sessionId, [pendingMessage]),
    isSending: true,
    bridgeBusy: true,
    bridgeMessage: '正在创建应用：' + appName,
    statusText: '正在创建宜搭应用',
    toolRuns: prependToolRun('openyida.create-app', 'running', appName),
  });

  self.callBridgeCreateApp(payload).then(function(data) {
    var app = data && data.app ? data.app : {};
    var appType = app.appType || '';
    var url = app.url || '';
    var lines = [
      '**宜搭应用已创建。**',
      '',
      '- 应用名称：' + (app.appName || appName),
      '- appType：`' + (appType || '未返回') + '`',
    ];
    if (url) {
      lines.push('- 管理地址：[' + url + '](' + url + ')');
    }
    if (app.corpId) {
      lines.push('- 组织标识：`' + app.corpId + '`');
    }
    lines.push('');
    lines.push('下一步可以继续告诉我这个应用需要哪些表单、字段、流程、报表或页面，我会继续生成确认卡再执行。');
    self.setCustomState({
      messages: replaceMessage(sessionId, pendingId, {
        status: 'done',
        content: lines.join('\n'),
        meta: 'OpenYida · create-app',
      }),
      confirmCard: null,
      isSending: false,
      bridgeBusy: false,
      bridgeMessage: '应用创建完成',
      statusText: '应用已创建',
      toolRuns: prependToolRun('openyida.create-app', 'done', appType || appName),
    });
    self.focusMainComposerInput();
  }).catch(function(err) {
    var message = err && err.message ? err.message : '创建应用失败';
    self.setCustomState({
      messages: replaceMessage(sessionId, pendingId, {
        status: 'error',
        content: 'OpenYida 创建应用失败：' + message + '\n\n请确认右上角本地连接、宜搭登录态和 OpenYida 版本；修复后可以再次点击确认执行。',
        meta: 'OpenYida · error',
      }),
      isSending: false,
      bridgeBusy: false,
      bridgeMessage: message,
      statusText: '创建应用失败',
      toolRuns: prependToolRun('openyida.create-app', 'error', message),
    });
    self.utils.toast({ title: message, type: 'error' });
    self.focusMainComposerInput();
  });
}

export function copyBridgeStartCommand() {
  var self = this;
  var command = getBridgeStartCommand();
  var done = function() {
    self.setCustomState({
      bridgeMessage: '启动命令已复制',
      toolRuns: prependToolRun('bridge.probe', 'done', 'copy start command'),
    });
    self.utils.toast({ title: '启动命令已复制', type: 'success' });
  };
  if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(command).then(function() {
      done();
    }).catch(function() {
      self.fallbackCopy(command);
      done();
    });
    return;
  }
  self.fallbackCopy(command);
  done();
}

export function copyBridgeUpdateCommand() {
  var self = this;
  var done = function() {
    self.setCustomState({
      bridgeMessage: '升级命令已复制，升级后再运行启动命令',
      toolRuns: prependToolRun('bridge.probe', 'done', 'copy update command'),
    });
    self.utils.toast({ title: '升级命令已复制', type: 'success' });
  };
  if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(BRIDGE_UPDATE_COMMAND).then(function() {
      done();
    }).catch(function() {
      self.fallbackCopy(BRIDGE_UPDATE_COMMAND);
      done();
    });
    return;
  }
  self.fallbackCopy(BRIDGE_UPDATE_COMMAND);
  done();
}

export function didMount() {
  this.restoreWorkspace();
  updateDocumentTitle();
  this.setCustomState({
    ready: true,
    statusText: getProviderStatus(_customState.provider),
  });
  this.ensureTailwind();
  this.loadMarkdownRenderer();
  this.loadRemoteWorkspace();
  this.initLocalBridge();
  this.focusMainComposerInput();
}

export function didUnmount() {
  if (_remoteSyncTimer) {
    clearTimeout(_remoteSyncTimer);
    _remoteSyncTimer = null;
  }
  if (_bridgePollTimer) {
    clearTimeout(_bridgePollTimer);
    _bridgePollTimer = null;
  }
}

export function switchSession(sessionId) {
  var session = getSessionById(sessionId);
  this.setCustomState({
    activeSessionId: sessionId,
    activeProjectId: session && session.projectId ? session.projectId : '',
    messageRenderCount: MESSAGE_RENDER_INITIAL_COUNT,
    draft: '',
    widgetDraft: '',
    pendingImage: null,
    widgetPendingImage: null,
    attachMenuOpen: false,
    searchOpen: false,
    searchQuery: '',
    sessionMenuOpenId: '',
    sessionMoveOpenId: '',
    projectMenuOpenId: '',
    statusText: '会话已打开',
  });
  this.scrollChatToBottom();
  this.focusMainComposerInput();
}

export function createSession(projectId) {
  var current = getActiveSession();
  var currentSessions = normalizeSessionsForSidebar(_customState.sessions);
  var currentMessages = cloneMessageMap(_customState.messages);
  var targetProjectId = typeof projectId === 'string' ? projectId : (_customState.activeProjectId || '');
  var reusableSessions = currentSessions.filter((item) => (item.projectId || '') === targetProjectId);
  var reusablePreferredId = current && (current.projectId || '') === targetProjectId ? current.id : '';
  var reusableId = findReusableNewTaskSession(reusableSessions, reusablePreferredId, currentMessages);
  var nextProjectOpenMap = Object.assign({}, _customState.projectOpenMap || {});
  if (targetProjectId) {
    nextProjectOpenMap[targetProjectId] = true;
  }
  if (reusableId) {
    var compacted = compactEmptyNewTaskSessions(currentSessions, currentMessages, reusableId);
    this.setCustomState({
      sessions: compacted.sessions,
      messages: compacted.messages,
      activeSessionId: reusableId,
      activeProjectId: targetProjectId,
      messageRenderCount: MESSAGE_RENDER_INITIAL_COUNT,
      projectOpenMap: nextProjectOpenMap,
      draft: '',
      widgetDraft: '',
      pendingImage: null,
      widgetPendingImage: null,
      attachMenuOpen: false,
      searchOpen: false,
      searchQuery: '',
      projectMenuOpenId: '',
      statusText: '已在新聊天',
      toolRuns: prependToolRun('chat.session.create', 'ready', '复用空白聊天'),
    });
    this.focusComposerInput();
    return;
  }
  var sessionId = nextId('session');
  var nextSessions = currentSessions;
  nextSessions.unshift({
    id: sessionId,
    title: '新聊天',
    subtitle: '最近',
    updatedAt: '刚刚',
    projectId: targetProjectId,
    pinned: false,
    archived: false,
  });
  var nextMessages = currentMessages;
  nextMessages[sessionId] = [];
  this.setCustomState({
    sessions: nextSessions,
    messages: nextMessages,
    activeSessionId: sessionId,
    activeProjectId: targetProjectId,
    messageRenderCount: MESSAGE_RENDER_INITIAL_COUNT,
    projectOpenMap: nextProjectOpenMap,
    draft: '',
    widgetDraft: '',
    pendingImage: null,
    widgetPendingImage: null,
    attachMenuOpen: false,
    searchOpen: false,
    searchQuery: '',
    sessionMenuOpenId: '',
    sessionMoveOpenId: '',
    projectMenuOpenId: '',
    statusText: '新聊天已创建',
    toolRuns: prependToolRun('chat.session.create', 'done', targetProjectId ? '在项目中新建聊天' : '创建新聊天'),
  });
  this.focusComposerInput();
  this.focusMainComposerInput();
}

export function clearSession() {
  var session = getActiveSession();
  if (!session) {
    return;
  }
  var nextMessages = cloneMessageMap(_customState.messages);
  nextMessages[session.id] = [];
  this.setCustomState({
    messages: nextMessages,
    statusText: '会话已清空',
    toolRuns: prependToolRun('chat.session.clear', 'done', session.title),
  });
}

export function setMode(mode) {
  this.setCustomState({
    mode: 'mixed',
    statusText: 'Qwen 就绪',
  });
}

export function setProvider(provider) {
  var nextProvider = 'yida-text';
  this.setCustomState({
    provider: nextProvider,
    statusText: getProviderStatus(nextProvider),
    toolRuns: prependToolRun('ai.model.switch', 'ready', getProviderLabel(nextProvider)),
  });
}

export function toggleWidget() {
  this.setCustomState({
    widgetOpen: !_customState.widgetOpen,
    statusText: !_customState.widgetOpen ? '浮窗已打开' : getProviderStatus(_customState.provider),
  });
}

export function openWidget() {
  this.setCustomState({
    widgetOpen: true,
    statusText: '浮窗已打开',
  });
}

export function closeWidget() {
  this.setCustomState({
    widgetOpen: false,
    statusText: getProviderStatus(_customState.provider),
  });
}

export function toggleSidebar() {
  this.setCustomState({
    sidebarCollapsed: !_customState.sidebarCollapsed,
  });
}

export function toggleProjectSection() {
  this.setCustomState({
    projectSectionOpen: !_customState.projectSectionOpen,
  });
}

export function toggleRecentSection() {
  this.setCustomState({
    recentSectionOpen: !_customState.recentSectionOpen,
  });
}

export function createProject() {
  this.openActionDialog({
    type: 'create-project',
    title: '创建项目',
    message: '项目会保存相关聊天和上下文，方便后续持续推进。',
    value: '',
    placeholder: '项目名称',
    confirmText: '创建项目',
    input: true,
  });
}

export function commitCreateProject(title, sessionId) {
  var nextTitle = String(title || '').trim();
  if (!nextTitle) {
    this.utils.toast({ title: '请输入项目名称', type: 'warning' });
    this.focusActionDialogInput(true);
    return;
  }
  var projects = normalizeProjectsForSidebar(_customState.projects);
  var project = {
    id: nextId('project'),
    title: nextTitle,
    subtitle: '会话分组',
  };
  var projectOpenMap = Object.assign({}, _customState.projectOpenMap || {});
  projectOpenMap[project.id] = true;
  projects.unshift(project);
  var sessions = _customState.sessions || [];
  if (sessionId) {
    sessions = sessions.map((item) => item.id === sessionId ? Object.assign({}, item, { projectId: project.id, updatedAt: '刚刚' }) : item);
  }
  this.setCustomState({
    projects: projects,
    sessions: sessions,
    activeProjectId: project.id,
    projectOpenMap: projectOpenMap,
    projectMenuOpenId: '',
    sessionMenuOpenId: '',
    sessionMoveOpenId: '',
    actionDialog: null,
    statusText: sessionId ? '已创建项目并移动聊天' : '项目已创建',
    toolRuns: prependToolRun(sessionId ? 'chat.move' : 'project.create', 'done', project.title),
  });
}

export function selectProject(projectId) {
  var projectOpenMap = Object.assign({}, _customState.projectOpenMap || {});
  projectOpenMap[projectId] = !isProjectExpanded(projectId);
  this.setCustomState({
    activeProjectId: projectId,
    projectOpenMap: projectOpenMap,
    sessionMenuOpenId: '',
    sessionMoveOpenId: '',
    projectMenuOpenId: '',
  });
}

export function createProjectSession(projectId, e) {
  if (e && e.stopPropagation) {
    e.stopPropagation();
  }
  this.createSession(projectId);
}

export function openProjectMenu(projectId, e) {
  var top = 160;
  if (e && e.currentTarget && e.currentTarget.getBoundingClientRect) {
    top = e.currentTarget.getBoundingClientRect().top - 8;
  }
  if (e && e.stopPropagation) {
    e.stopPropagation();
  }
  this.setCustomState({
    projectMenuOpenId: _customState.projectMenuOpenId === projectId ? '' : projectId,
    projectMenuTop: top,
    sessionMenuOpenId: '',
    sessionMoveOpenId: '',
  });
}

export function closeProjectMenu() {
  if (_customState.projectMenuOpenId) {
    this.setCustomState({
      projectMenuOpenId: '',
    });
  }
}

export function openActionDialog(dialog) {
  var nextDialog = Object.assign({}, dialog || {});
  this.setCustomState({
    actionDialog: nextDialog,
    sessionMenuOpenId: '',
    sessionMoveOpenId: '',
    projectMenuOpenId: '',
    attachMenuOpen: false,
  });
  this.focusActionDialogInput(actionDialogNeedsInput(nextDialog));
}

export function focusActionDialogInput(needsInput) {
  setTimeout(function() {
    var el = typeof document !== 'undefined'
      ? document.getElementById(needsInput ? 'agent-chatbox-action-input' : 'agent-chatbox-action-confirm')
      : null;
    if (el && el.focus) {
      el.focus();
      if (needsInput && el.select) {
        el.select();
      }
    }
  }, 0);
}

export function closeActionDialog() {
  if (!_customState.actionDialog) {
    return;
  }
  this.setCustomState({
    actionDialog: null,
  });
  this.focusMainComposerInput();
}

export function handleActionDialogValueChange(e) {
  if (!_customState.actionDialog) {
    return;
  }
  _customState.actionDialog.value = e && e.target ? e.target.value : '';
}

export function handleActionDialogKeyDown(e) {
  if (!e) {
    return;
  }
  if (e.key === 'Escape') {
    e.preventDefault();
    this.closeActionDialog();
    return;
  }
  if (e.key === 'Enter') {
    e.preventDefault();
    this.confirmActionDialog();
  }
}

export function confirmActionDialog() {
  var dialog = _customState.actionDialog;
  if (!dialog) {
    return;
  }
  if (dialog.type === 'rename-session') {
    this.commitRenameSession(dialog.targetId, dialog.value);
    return;
  }
  if (dialog.type === 'rename-project') {
    this.commitRenameProject(dialog.targetId, dialog.value);
    return;
  }
  if (dialog.type === 'create-project') {
    this.commitCreateProject(dialog.value, dialog.targetId);
    return;
  }
  if (dialog.type === 'delete-session') {
    this.commitDeleteSession(dialog.targetId);
    return;
  }
  if (dialog.type === 'delete-project') {
    this.commitDeleteProject(dialog.targetId);
  }
}

export function renameProject(projectId) {
  var project = getProjectById(projectId);
  if (!project) {
    return;
  }
  this.openActionDialog({
    type: 'rename-project',
    targetId: projectId,
    title: '重命名项目',
    value: project.title || '',
    placeholder: '项目名称',
    confirmText: '保存',
  });
}

export function commitRenameProject(projectId, title) {
  var nextTitle = String(title || '').trim();
  if (!nextTitle) {
    this.utils.toast({ title: '请输入项目名称', type: 'warning' });
    this.focusActionDialogInput(true);
    return;
  }
  this.setCustomState({
    projects: normalizeProjectsForSidebar(_customState.projects).map((item) => item.id === projectId ? Object.assign({}, item, { title: nextTitle }) : item),
    actionDialog: null,
    statusText: '项目已重命名',
    toolRuns: prependToolRun('project.rename', 'done', nextTitle),
  });
}

export function deleteProject(projectId) {
  var project = getProjectById(projectId);
  if (!project) {
    return;
  }
  this.openActionDialog({
    type: 'delete-project',
    targetId: projectId,
    title: '删除项目？',
    message: '项目里的聊天会移回最近，这个项目分组会被移除。',
    confirmText: '删除',
    danger: true,
  });
}

export function commitDeleteProject(projectId) {
  var project = getProjectById(projectId);
  if (!project) {
    this.closeActionDialog();
    return;
  }
  var projectOpenMap = Object.assign({}, _customState.projectOpenMap || {});
  delete projectOpenMap[projectId];
  this.setCustomState({
    projects: normalizeProjectsForSidebar(_customState.projects).filter((item) => item.id !== projectId),
    sessions: (_customState.sessions || []).map((item) => item.projectId === projectId ? Object.assign({}, item, { projectId: '', updatedAt: '刚刚' }) : item),
    activeProjectId: _customState.activeProjectId === projectId ? '' : _customState.activeProjectId,
    projectOpenMap: projectOpenMap,
    projectMenuOpenId: '',
    actionDialog: null,
    statusText: '项目已删除，聊天已移回最近',
    toolRuns: prependToolRun('project.delete', 'done', project.title),
  });
}

export function openSessionMenu(sessionId, e) {
  var top = 160;
  if (e && e.currentTarget && e.currentTarget.getBoundingClientRect) {
    top = e.currentTarget.getBoundingClientRect().top - 8;
  }
  if (e && e.stopPropagation) {
    e.stopPropagation();
  }
  this.setCustomState({
    sessionMenuOpenId: _customState.sessionMenuOpenId === sessionId ? '' : sessionId,
    sessionMoveOpenId: '',
    projectMenuOpenId: '',
    sessionMenuTop: top,
  });
}

export function closeSessionMenu() {
  if (_customState.sessionMenuOpenId) {
    this.setCustomState({
      sessionMenuOpenId: '',
      sessionMoveOpenId: '',
    });
  }
}

export function renameSession(sessionId) {
  var session = getSessionById(sessionId);
  if (!session) {
    return;
  }
  this.openActionDialog({
    type: 'rename-session',
    targetId: sessionId,
    title: '重命名聊天',
    value: isDefaultNewChatTitle(session.title) ? '' : (session.title || ''),
    placeholder: '聊天名称',
    confirmText: '保存',
  });
}

export function commitRenameSession(sessionId, title) {
  var nextTitle = String(title || '').trim();
  if (!nextTitle) {
    this.utils.toast({ title: '请输入聊天名称', type: 'warning' });
    this.focusActionDialogInput(true);
    return;
  }
  this.setCustomState({
    sessions: (_customState.sessions || []).map((item) => item.id === sessionId ? Object.assign({}, item, { title: nextTitle, updatedAt: '刚刚' }) : item),
    sessionMenuOpenId: '',
    sessionMoveOpenId: '',
    actionDialog: null,
    statusText: '已重命名',
    toolRuns: prependToolRun('chat.rename', 'done', nextTitle),
  });
}

export function togglePinSession(sessionId) {
  var session = getSessionById(sessionId);
  if (!session) {
    return;
  }
  var nextPinned = !session.pinned;
  this.setCustomState({
    sessions: (_customState.sessions || []).map((item) => item.id === sessionId ? Object.assign({}, item, { pinned: nextPinned, updatedAt: '刚刚' }) : item),
    sessionMenuOpenId: '',
    sessionMoveOpenId: '',
    statusText: nextPinned ? '已置顶' : '已取消置顶',
    toolRuns: prependToolRun('chat.pin', 'done', nextPinned ? '置顶聊天' : '取消置顶'),
  });
}

export function archiveSession(sessionId) {
  var sessions = (_customState.sessions || []).map((item) => item.id === sessionId ? Object.assign({}, item, { archived: true, updatedAt: '刚刚' }) : item);
  var messages = cloneMessageMap(_customState.messages);
  var hasUnarchived = sessions.some((item) => item && !item.archived && !isDemoSessionId(item.id) && hasSessionContent(item.id, messages));
  if (!hasUnarchived) {
    var freshId = nextId('session');
    sessions.push({
      id: freshId,
      title: '新聊天',
      subtitle: '最近',
      updatedAt: '刚刚',
      projectId: '',
      pinned: false,
      archived: false,
    });
    messages[freshId] = [];
  }
  var visible = getVisibleChatSessions(sessions, messages);
  var fallbackBlankId = findReusableNewTaskSession(sessions, '', messages);
  var activeSessionId = _customState.activeSessionId === sessionId ? (visible.length ? visible[0].id : (fallbackBlankId || (sessions[0] && sessions[0].id) || 'session-main')) : _customState.activeSessionId;
  this.setCustomState({
    sessions: sessions,
    messages: messages,
    activeSessionId: activeSessionId,
    messageRenderCount: MESSAGE_RENDER_INITIAL_COUNT,
    sessionMenuOpenId: '',
    sessionMoveOpenId: '',
    statusText: '已归档',
    toolRuns: prependToolRun('chat.archive', 'done', '归档聊天'),
  });
}

export function deleteSession(sessionId) {
  var session = getSessionById(sessionId);
  if (!session) {
    return;
  }
  this.openActionDialog({
    type: 'delete-session',
    targetId: sessionId,
    title: '删除聊天？',
    message: '此操作不可撤销，聊天内容会从当前工作台移除。',
    confirmText: '删除',
    danger: true,
  });
}

export function commitDeleteSession(sessionId) {
  var session = getSessionById(sessionId);
  if (!session) {
    this.closeActionDialog();
    return;
  }
  var sessions = (_customState.sessions || []).filter((item) => item.id !== sessionId);
  var messages = cloneMessageMap(_customState.messages);
  delete messages[sessionId];
  if (!sessions.length) {
    var freshId = nextId('session');
    sessions.push({
      id: freshId,
      title: '新聊天',
      subtitle: '最近',
      updatedAt: '刚刚',
      projectId: '',
      pinned: false,
      archived: false,
    });
    messages[freshId] = [];
  }
  var visible = getVisibleChatSessions(sessions, messages);
  var fallbackBlankId = findReusableNewTaskSession(sessions, '', messages);
  var activeSessionId = _customState.activeSessionId === sessionId ? (visible.length ? visible[0].id : (fallbackBlankId || (sessions[0] && sessions[0].id) || 'session-main')) : _customState.activeSessionId;
  this.setCustomState({
    sessions: sessions,
    messages: messages,
    activeSessionId: activeSessionId,
    messageRenderCount: MESSAGE_RENDER_INITIAL_COUNT,
    sessionMenuOpenId: '',
    sessionMoveOpenId: '',
    actionDialog: null,
    statusText: '已删除',
    toolRuns: prependToolRun('chat.delete', 'done', session.title),
  });
}

export function toggleMoveMenu(sessionId) {
  if (!hasSessionContent(sessionId, _customState.messages)) {
    this.setCustomState({
      sessionMenuOpenId: '',
      sessionMoveOpenId: '',
      statusText: '空聊天不会加入项目',
    });
    this.utils.toast({ title: '先发送内容后再移动到项目', type: 'info' });
    return;
  }
  this.setCustomState({
    sessionMoveOpenId: _customState.sessionMoveOpenId === sessionId ? '' : sessionId,
  });
}

export function moveSessionToProject(sessionId, projectId) {
  var project = getProjectById(projectId);
  if (!project) {
    return;
  }
  if (!hasSessionContent(sessionId, _customState.messages)) {
    this.setCustomState({
      sessionMenuOpenId: '',
      sessionMoveOpenId: '',
      statusText: '空聊天不会加入项目',
    });
    this.utils.toast({ title: '先发送内容后再移动到项目', type: 'info' });
    return;
  }
  var projectOpenMap = Object.assign({}, _customState.projectOpenMap || {});
  projectOpenMap[projectId] = true;
  this.setCustomState({
    sessions: (_customState.sessions || []).map((item) => item.id === sessionId ? Object.assign({}, item, { projectId: projectId, updatedAt: '刚刚' }) : item),
    sessionMenuOpenId: '',
    sessionMoveOpenId: '',
    activeProjectId: projectId,
    projectOpenMap: projectOpenMap,
    statusText: '已移至项目',
    toolRuns: prependToolRun('chat.move', 'done', project.title),
  });
}

export function createProjectAndMoveSession(sessionId) {
  if (!hasSessionContent(sessionId, _customState.messages)) {
    this.setCustomState({
      sessionMenuOpenId: '',
      sessionMoveOpenId: '',
      statusText: '空聊天不会加入项目',
    });
    this.utils.toast({ title: '先发送内容后再移动到项目', type: 'info' });
    return;
  }
  this.openActionDialog({
    type: 'create-project',
    targetId: sessionId,
    title: '创建项目',
    message: '创建后会把当前聊天移动到这个项目里。',
    value: '',
    placeholder: '项目名称',
    confirmText: '创建项目',
    input: true,
  });
}

export function shareSession(sessionId) {
  var session = getSessionById(sessionId);
  var url = typeof window !== 'undefined' && window.location ? String(window.location.href).split('#')[0] + '#chat=' + encodeURIComponent(sessionId) : sessionId;
  var done = () => {
    this.setCustomState({
      sessionMenuOpenId: '',
      sessionMoveOpenId: '',
      statusText: '分享链接已复制',
      toolRuns: prependToolRun('chat.share', 'done', session && session.title ? session.title : '聊天'),
    });
    this.utils.toast({ title: '分享链接已复制', type: 'success' });
  };
  if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(url).then(() => {
      done();
    }).catch(() => {
      this.fallbackCopy(url);
      done();
    });
    return;
  }
  this.fallbackCopy(url);
  done();
}

export function startGroupChat(sessionId) {
  this.setCustomState({
    sessionMenuOpenId: '',
    sessionMoveOpenId: '',
    statusText: '群聊入口暂未接入',
  });
  this.utils.toast({ title: '群聊入口暂未接入', type: 'info' });
}

export function openSearchChat() {
  _customState.searchOpen = true;
  _customState.searchQuery = '';
  _customState.attachMenuOpen = false;
  _customState.projectMenuOpenId = '';
  _customState.sessionMenuOpenId = '';
  _customState.sessionMoveOpenId = '';
  this.forceUpdate();
  setTimeout(function() {
    var input = typeof document !== 'undefined' ? document.getElementById('agent-chatbox-search-input') : null;
    if (input) {
      input.focus();
    }
  }, 0);
}

export function closeSearchChat() {
  _customState.searchOpen = false;
  _customState.searchQuery = '';
  this.forceUpdate();
  this.focusMainComposerInput();
}

export function handleSearchQueryChange(e) {
  _customState.searchQuery = e && e.target ? e.target.value : '';
  this.forceUpdate();
}

export function handleSearchKeyDown(e) {
  if (!e) {
    return;
  }
  if (e.key === 'Escape') {
    e.preventDefault();
    this.closeSearchChat();
    return;
  }
  if (e.key === 'Enter') {
    var results = buildSearchChatResults(_customState.searchQuery);
    if (results.length) {
      e.preventDefault();
      this.switchSession(results[0].id);
    }
  }
}

export function createSessionFromSearch() {
  _customState.searchOpen = false;
  _customState.searchQuery = '';
  this.createSession();
}

export function toggleAttachMenu() {
  this.setCustomState({
    attachMenuOpen: !_customState.attachMenuOpen,
  });
}

export function closeAttachMenu() {
  if (_customState.attachMenuOpen) {
    this.setCustomState({
      attachMenuOpen: false,
    });
  }
}

export function usePrompt(prompt) {
  _customState.draft = prompt;
  this.forceUpdate();
  setTimeout(() => {
    var input = typeof document !== 'undefined' ? document.getElementById('agent-chatbox-input') : null;
    if (input) {
      input.value = prompt;
      resizeComposerInput(input);
      input.focus();
    }
  }, 0);
}

export function useWidgetPrompt(prompt) {
  _customState.widgetDraft = prompt;
  this.forceUpdate();
  setTimeout(() => {
    var input = typeof document !== 'undefined' ? document.getElementById('agent-chatbox-widget-input') : null;
    if (input) {
      input.value = prompt;
      input.focus();
    }
  }, 0);
}

export function handleDraftChange(e) {
  _customState.draft = e && e.target ? e.target.value : '';
  if (e && e.target) {
    resizeComposerInput(e.target);
  }
}

export function handleWidgetDraftChange(e) {
  _customState.widgetDraft = e && e.target ? e.target.value : '';
}

export function attachImageFile(file, attachmentKey) {
  if (!file) {
    return;
  }
  if (!isImageFile(file)) {
    this.utils.toast({ title: '请选择图片文件', type: 'warning' });
    return;
  }
  if (file.size > 4 * 1024 * 1024) {
    this.utils.toast({ title: '图片需小于 4MB', type: 'warning' });
    return;
  }
  if (typeof FileReader === 'undefined') {
    this.utils.toast({ title: '当前浏览器不支持本地图片读取', type: 'error' });
    return;
  }
  var self = this;
  var reader = new FileReader();
  reader.onload = function(event) {
    var patch = {
      statusText: '图片已附加',
      attachMenuOpen: false,
      toolRuns: prependToolRun('attachment.add', 'done', file.name || 'image'),
    };
    patch[attachmentKey || 'pendingImage'] = {
      name: file.name || '粘贴图片',
      type: file.type || 'image/png',
      size: file.size || 0,
      sizeLabel: formatFileSize(file.size || 0),
      dataUrl: event && event.target ? event.target.result : '',
      createdAt: getTimeLabel(),
    };
    self.setCustomState(patch);
  };
  reader.onerror = function() {
    self.utils.toast({ title: '图片读取失败', type: 'error' });
  };
  reader.readAsDataURL(file);
}

export function handleImageUpload(e, stateKey) {
  var file = e && e.target && e.target.files && e.target.files.length ? e.target.files[0] : null;
  if (e && e.target) {
    e.target.value = '';
  }
  this.attachImageFile(file, getAttachmentStateKey(stateKey));
}

export function handleInputPaste(e, stateKey) {
  var clipboard = e && e.clipboardData ? e.clipboardData : null;
  var files = clipboard && clipboard.files ? clipboard.files : [];
  var file = null;
  if (files && files.length) {
    for (var i = 0; i < files.length; i += 1) {
      if (isImageFile(files[i])) {
        file = files[i];
        break;
      }
    }
  }
  if (!file && clipboard && clipboard.items) {
    for (var j = 0; j < clipboard.items.length; j += 1) {
      var item = clipboard.items[j];
      if (item && item.type && item.type.indexOf('image/') === 0 && item.getAsFile) {
        file = item.getAsFile();
        break;
      }
    }
  }
  if (file) {
    e.preventDefault();
    this.attachImageFile(file, getAttachmentStateKey(stateKey));
  }
}

export function triggerImageUpload(inputId) {
  if (typeof document === 'undefined') {
    return;
  }
  var input = document.getElementById(inputId);
  if (input) {
    input.click();
  }
}

export function openAttachUpload(inputId) {
  this.setCustomState({
    attachMenuOpen: false,
  });
  setTimeout(() => {
    this.triggerImageUpload(inputId);
  }, 0);
}

export function hintAttachMenuCapability(label) {
  if (label === '网页搜索' || label === '深度研究') {
    this.setCustomState({
      attachMenuOpen: false,
      statusText: '已接入宜搭知识库查询',
      toolRuns: prependToolRun('knowledge.search', 'ready', 'searchFormDatas'),
    });
    this.utils.toast({ title: '当前搜索通过宜搭知识库查询实现，不会直接联网', type: 'info' });
    return;
  }
  this.setCustomState({
    attachMenuOpen: false,
    statusText: label + '暂未开启',
  });
  this.utils.toast({ title: label + '暂未开启，当前先支持图片识别', type: 'info' });
}

export function removePendingImage(stateKey) {
  var patch = {
    statusText: getProviderStatus(_customState.provider),
  };
  patch[getAttachmentStateKey(stateKey)] = null;
  this.setCustomState(patch);
}

export function handleInputCompositionStart() {
  this._isComposing = true;
}

export function handleInputCompositionEnd(e) {
  this._isComposing = false;
  this.handleDraftChange(e);
}

export function handleWidgetInputCompositionEnd(e) {
  this._isComposing = false;
  this.handleWidgetDraftChange(e);
}

export function handleInputKeyDown(e) {
  if (!e || this._isComposing) {
    return;
  }
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    this.sendMessage();
  }
}

export function handleWidgetInputKeyDown(e) {
  if (!e || this._isComposing) {
    return;
  }
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    this.sendWidgetMessage();
  }
}

export function readDraft(inputId, stateKey) {
  var id = inputId || 'agent-chatbox-input';
  var key = stateKey || 'draft';
  if (typeof document !== 'undefined') {
    var input = document.getElementById(id);
    if (input && input.value !== undefined) {
      return input.value;
    }
  }
  return _customState[key] || '';
}

export function resetDraftInput(inputId, stateKey) {
  var id = inputId || 'agent-chatbox-input';
  var key = stateKey || 'draft';
  _customState[key] = '';
  if (typeof document !== 'undefined') {
    var input = document.getElementById(id);
    if (input) {
      input.value = '';
      if (id === 'agent-chatbox-input') {
        resizeComposerInput(input);
      }
    }
  }
}

export function sendWidgetMessage() {
  this.sendMessage('agent-chatbox-widget-input', 'widgetDraft');
}

export function sendMessage(inputId, stateKey) {
  if (_customState.isSending) {
    this.utils.toast({ title: '正在生成中', type: 'warning' });
    return;
  }
  var prompt = String(this.readDraft(inputId, stateKey) || '').trim();
  var attachmentKey = getAttachmentStateKey(stateKey);
  var attachment = _customState[attachmentKey];
  if (!prompt && !attachment) {
    this.utils.toast({ title: '请输入内容', type: 'warning' });
    return;
  }

  var self = this;
  var session = getActiveSession();
  var sessionId = session ? session.id : 'session-main';
  var provider = _customState.provider;
  var route = resolveAiRoute(prompt, attachment);
  var routeRunName = route.type === 'text' ? 'ai.text' : 'ai.image';
  var userContent = prompt || '请分析这张图片';
  var createAppIntent = !attachment ? parseCreateAppIntent(userContent) : null;
  var appListIntent = !attachment && !createAppIntent ? parseAppListIntent(userContent) : null;
  var userMessage = {
    id: nextId('m'),
    role: 'user',
    type: 'text',
    status: 'done',
    content: userContent,
    createdAt: getTimeLabel(),
    meta: attachment ? 'user · 图片' : 'user',
    imageData: attachment ? attachment.dataUrl : '',
    imageName: attachment ? attachment.name : '',
    imageSize: attachment ? attachment.sizeLabel : '',
  };
  var pendingId = nextId('m');
  var pendingMessage = {
    id: pendingId,
    role: 'assistant',
    type: 'text',
    status: 'thinking',
    content: appListIntent ? '正在通过本地 OpenYida 查询应用列表' : (route.type === 'text' ? '正在查询知识库' : '正在识别图片并调用 Qwen'),
    createdAt: getTimeLabel(),
    meta: appListIntent ? 'OpenYida · 应用列表' : (route.type === 'text' ? (getProviderLabel(provider) + ' · 知识库查询') : (getProviderLabel(provider) + ' · ' + route.label)),
  };
  var initialRuns = createAppIntent
    ? prependToolRun('guardrail.confirm', 'done', '搭建需求需切换到强模型链路')
    : (appListIntent ? prependToolRun('openyida.app-list', 'running', 'app-list') : prependToolRun(routeRunName, 'running', route.detail || prompt));
  var patch = {
    messages: appendMessages(sessionId, [userMessage, pendingMessage]),
    sessions: touchSession(sessionId, limitText(userContent, 16)),
    isSending: true,
    statusText: appListIntent ? '正在查询应用列表' : (route.type === 'text' ? '正在调用 Qwen' : '正在调用识图接口'),
    attachMenuOpen: false,
    toolRuns: initialRuns,
  };
  if (createAppIntent) {
    patch.statusText = '搭建需求建议切换到强模型';
    patch.toolRuns = prependToolRun('guardrail.confirm', 'done', createAppIntent.appName);
  }
  patch[attachmentKey] = null;

  this.resetDraftInput(inputId, stateKey);
  this.setCustomState(patch);

  if (createAppIntent) {
    this.setCustomState({
      messages: replaceMessage(sessionId, pendingId, {
        status: 'done',
        content: buildCreateAppReadyAnswer(createAppIntent),
        meta: 'OpenYida · 搭建建议',
      }),
      isSending: false,
      statusText: '建议切换强模型',
      toolRuns: prependToolRun('guardrail.confirm', 'done', createAppIntent.appName),
    });
    this.scrollChatToBottom();
    this.focusMainComposerInput();
    return;
  }

  if (appListIntent) {
    this.executeAppListQuery(appListIntent, sessionId, pendingId);
    this.scrollChatToBottom();
    return;
  }

  this.callTextModel(prompt, attachment).then(function(result) {
    var answerRuns = prependToolRun(routeRunName, 'done', result.meta);
    var donePatch = {
      messages: replaceMessage(sessionId, pendingId, {
        status: 'done',
        content: result.content,
        meta: result.meta,
      }),
      isSending: false,
      statusText: '回答已生成',
      toolRuns: answerRuns,
    };
    self.setCustomState(donePatch);
    self.focusMainComposerInput();
  }).catch(function(err) {
    var message = err && err.message ? err.message : '生成失败';
    self.setCustomState({
      messages: replaceMessage(sessionId, pendingId, {
        status: 'error',
        content: 'Qwen 调用失败：' + message + '\n\n我没有切到本地模板回答。请确认当前页面登录态、AI 权限，以及识图连接器配置是否可用。',
        meta: 'Qwen · error',
      }),
      isSending: false,
      statusText: '生成失败',
      toolRuns: prependToolRun(routeRunName, 'error', message),
    });
    self.utils.toast({ title: message, type: 'error' });
    self.focusMainComposerInput();
  });
}

export function handleMessageAction(action, messageId) {
  var messages = getActiveMessages();
  var matched = messages.filter((item) => item.id === messageId);
  if (!matched.length) {
    return;
  }
  var message = matched[0];
  if (action === 'copy') {
    this.copyMessage(message);
  } else if (action === 'regenerate') {
    this.prepareRegenerate(message);
  } else if (action === 'plan') {
    this.createPlanCard(message);
  } else if (action === 'confirm') {
    this.createConfirmCard(message);
  }
}

export function copyMessage(message) {
  var self = this;
  var content = String(message && message.content ? message.content : '');
  var done = function() {
    self.setCustomState({
      statusText: '内容已复制',
      toolRuns: prependToolRun('action.copy', 'done', '复制 AI 回答'),
    });
    self.utils.toast({ title: '已复制', type: 'success' });
  };
  if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(content).then(function() {
      done();
    }).catch(function() {
      self.fallbackCopy(content);
      done();
    });
    return;
  }
  this.fallbackCopy(content);
  done();
}

export function fallbackCopy(content) {
  if (typeof document === 'undefined') {
    return;
  }
  var textarea = document.createElement('textarea');
  textarea.value = content;
  textarea.setAttribute('readonly', 'readonly');
  textarea.style.position = 'fixed';
  textarea.style.left = '-9999px';
  document.body.appendChild(textarea);
  textarea.select();
  try {
    document.execCommand('copy');
  } catch (err) {
    if (err && err.message) {
      document.body.removeChild(textarea);
      return;
    }
  }
  document.body.removeChild(textarea);
}

export function prepareRegenerate(message) {
  var previous = getPreviousUserMessage(message.id);
  var prompt = previous && previous.content ? previous.content : message.content;
  this.usePrompt(prompt || '');
  this.setCustomState({
    statusText: '已填入，可重新生成',
    toolRuns: prependToolRun('action.regenerate', 'done', limitText(prompt || '', 40)),
  });
}

export function createPlanCard(message) {
  this.setCustomState({
    confirmCard: buildPlanConfirmCard(message && message.content ? message.content : ''),
    statusText: '已生成执行计划确认卡',
    toolRuns: prependToolRun('plan.confirm', 'done', '执行计划确认'),
  });
}

export function createConfirmCard(message) {
  var text = message && message.content ? message.content : '';
  var card = isGroupIntent(text) ? buildGroupConfirmCard(text) : buildPlanConfirmCard(text);
  this.setCustomState({
    confirmCard: card,
    statusText: '已生成确认卡',
    toolRuns: prependToolRun('plan.confirm', 'done', card.title),
  });
}

export function dismissConfirmCard() {
  this.setCustomState({
    confirmCard: null,
    statusText: getProviderStatus(_customState.provider),
  });
}

export function confirmMockAction() {
  var card = _customState.confirmCard;
  if (!card) {
    return;
  }
  if (card.action === 'openyida.create-app') {
    this.setCustomState({
      confirmCard: null,
      statusText: '建议切换强模型',
      toolRuns: prependToolRun('guardrail.confirm', 'done', '搭建需求暂不在网页执行'),
    });
    this.utils.toast({ title: '搭建类写入动作请切换到 Codex / OpenYida 执行', type: 'warning' });
    return;
  }
  var session = getActiveSession();
  var sessionId = session ? session.id : 'session-main';
  var resultMessage = {
    id: nextId('m'),
    role: 'assistant',
    type: 'text',
    status: 'done',
    content: '**已确认执行方案。**\n\n当前 OpenYida 助手不会绕过确认直接改动真实应用。我会把这张确认卡作为后续接入 OpenYida 能力的执行契约：先校验 appType / formUuid，再按步骤调用命令，最后回写执行结果。',
    createdAt: getTimeLabel(),
    meta: 'Agent',
  };
  this.setCustomState({
    messages: appendMessages(sessionId, [resultMessage]),
    confirmCard: null,
    statusText: '确认卡已归档',
    toolRuns: prependToolRun('guardrail.confirm', 'done', card.title),
  });
}

export function callTextModel(prompt, attachment) {
  var self = this;
  var route = resolveAiRoute(prompt, attachment);
  if (route.type === 'image-upload') {
    this.setCustomState({
      statusText: '正在上传图片',
      toolRuns: prependToolRun('attachment.upload', 'running', route.detail),
    });
    return this.uploadAttachmentForAI(attachment).then(function(upload) {
      self.setCustomState({
        statusText: '正在调用识图接口',
        toolRuns: prependToolRun('attachment.upload', 'done', upload.imageUrl),
      });
      return self.callImageThenText(prompt, upload.imageUrl, attachment, upload.fileName || route.detail);
    });
  }
  if (route.type === 'image-url') {
    return this.callImageThenText(prompt, route.imageUrl, null, route.imageUrl);
  }
  this.setCustomState({
    statusText: '正在查询知识库',
    toolRuns: prependToolRun('knowledge.search', 'running', limitText(prompt || '', 54)),
  });
  return this.searchKnowledgeBase(prompt).then(function(knowledge) {
    var results = knowledge && knowledge.results ? knowledge.results : [];
    if (knowledge && knowledge.error) {
      self.setCustomState({
        statusText: '知识库查询失败',
        toolRuns: prependToolRun('knowledge.search', 'error', knowledge.error),
      });
    } else if (results.length) {
      self.setCustomState({
        statusText: '已命中知识库，正在调用 Qwen',
        toolRuns: prependToolRun('knowledge.search', 'done', results.length + ' 条命中'),
      });
    } else {
      self.setCustomState({
        statusText: '知识库未命中',
        toolRuns: prependToolRun('knowledge.miss', 'done', limitText(prompt || '', 54)),
      });
    }
    if (knowledge && knowledge.requiresGrounding && !results.length) {
      return {
        content: buildKnowledgeMissAnswer(prompt, knowledge.error || '', knowledge.queryAnalysis),
        meta: knowledge && knowledge.error ? '知识库 · 查询失败' : '知识库 · 未命中',
      };
    }
    self.setCustomState({
      statusText: '正在调用 Qwen',
      toolRuns: prependToolRun('ai.text', 'running', results.length ? '知识库查询 + txtFromAI' : 'txtFromAI'),
    });
    return self.callYidaText(buildQwenPrompt(prompt, {
      routeLabel: results.length ? '知识库查询 + 文本接口' : '文本接口',
      knowledgeSearched: knowledge && knowledge.searched,
      knowledgeSummary: results.length ? formatKnowledgeResults(results) : '',
    })).then(function(content) {
      return {
        content: results.length ? appendKnowledgeSourceLinks(content, results) : content,
        meta: results.length ? ('Qwen · 知识库 ' + results.length + ' 条') : 'Qwen · 文本接口',
      };
    });
  });
}

export function callMockText(prompt, providerNote) {
  return this.callTextModel(prompt, null);
}

export function callImageThenText(prompt, imageUrl, attachment, detail) {
  var self = this;
  this.setCustomState({
    statusText: '正在调用识图接口',
    toolRuns: prependToolRun('ai.image', 'running', detail || imageUrl),
  });
  return this.callYidaImage(imageUrl).then(function(serviceReturnValue) {
    self.setCustomState({
      statusText: '正在调用 Qwen 整理识图结果',
      toolRuns: prependToolRun('ai.image', 'done', detail || '识图完成'),
    });
    return self.callYidaText(buildVisionTextPrompt(prompt, imageUrl, serviceReturnValue)).then(function(content) {
      return {
        content: content,
        meta: 'Qwen · 识图接口',
      };
    });
  });
}

function requestImageUploadSign(csrfToken, appType, attachment, blob, fileName, objectName) {
  var signQuery = encodeForm({
    scene: 'ImageField',
    _api: 'nattyFetch',
    _mock: 'false',
    _csrf_token: csrfToken,
    appType: appType,
    fileName: fileName,
    fileSize: String(attachment.size || blob.size || 0),
    contentType: attachment.type || blob.type || 'image/png',
    isOpen: 'n',
    newContext: 'y',
    objectName: objectName,
    procInstId: '',
    businessType: '',
    accelerate: 'y',
    _stamp: String(new Date().getTime()),
  });
  return fetchJsonWithTimeout('/ossSign?' + signQuery, {
    method: 'GET',
    credentials: 'same-origin',
    headers: {
      Accept: 'application/json, text/json',
      'X-Requested-With': 'XMLHttpRequest',
    },
  }, '获取 OSS 上传签名超时').then(function(signResponse) {
    if (!signResponse || !signResponse.success || !signResponse.content) {
      throw new Error(signResponse && signResponse.errorMsg ? signResponse.errorMsg : '获取 OSS 上传签名失败');
    }
    return signResponse.content;
  });
}

function postImageBlobToOss(signContent, appType, fileName, blob) {
  var form = new FormData();
  form.append('accessid', signContent.accessid);
  form.append('key', signContent.objectName);
  form.append('policy', signContent.policy);
  form.append('OSSAccessKeyId', signContent.accessid);
  form.append('signature', signContent.signature);
  form.append('expire', signContent.expire);
  form.append('appType', signContent.appType || appType);
  form.append('Content-Disposition', 'attachment; filename=' + fileName);
  form.append('file', blob, fileName);
  return fetch(signContent.host, {
    method: 'POST',
    body: form,
  }).then(function(res) {
    if (!res.ok && res.status !== 204) {
      return res.text().then(function(text) {
        throw new Error('OSS 上传失败：HTTP ' + res.status + ' ' + String(text || '').slice(0, 120));
      });
    }
    return signContent;
  });
}

function convertOssImageUrl(csrfToken, signContent, fileName) {
  return fetchJsonWithTimeout('/aliyun/sdk/upload2Oss.json?' + encodeForm({
    imageUrl: signContent.downloadUrl,
    _csrf_token: csrfToken,
  }), {
    method: 'GET',
    credentials: 'same-origin',
    headers: {
      Accept: 'application/json, text/json',
      'X-Requested-With': 'XMLHttpRequest',
    },
  }, '图片 URL 转换超时').then(function(convertResponse) {
    if (!convertResponse || !convertResponse.success) {
      throw new Error(convertResponse && convertResponse.errorMsg ? convertResponse.errorMsg : '图片 URL 转换失败');
    }
    var imageUrl = convertResponse.content;
    if (imageUrl && typeof imageUrl !== 'string') {
      imageUrl = imageUrl.imageUrl || imageUrl.url || imageUrl.downloadUrl || '';
    }
    if (!imageUrl) {
      throw new Error('图片 URL 转换结果为空');
    }
    return {
      imageUrl: imageUrl,
      fileName: fileName,
      objectName: signContent.objectName,
    };
  });
}

export function uploadAttachmentForAI(attachment) {
  var csrfToken = getCsrfToken();
  var appType = getRuntimeAppType();
  if (!csrfToken) {
    return Promise.reject(new Error('缺少宜搭登录态或 CSRF Token'));
  }
  if (!appType) {
    return Promise.reject(new Error('无法识别当前 appType，不能上传图片给识图接口'));
  }
  if (typeof FormData === 'undefined') {
    return Promise.reject(new Error('当前浏览器不支持 FormData 上传'));
  }
  var blob;
  try {
    blob = dataUrlToBlob(attachment.dataUrl, attachment.type);
  } catch (err) {
    return Promise.reject(err);
  }
  var fileName = attachment.name || ('image' + getFileExtension('', attachment.type));
  var objectName = createImageObjectName(appType, attachment);
  return requestImageUploadSign(csrfToken, appType, attachment, blob, fileName, objectName).then(function(signContent) {
    return postImageBlobToOss(signContent, appType, fileName, blob);
  }).then(function(signContent) {
    return convertOssImageUrl(csrfToken, signContent, fileName);
  });
}

export function callYidaText(prompt) {
  var csrfToken = getCsrfToken();
  if (!csrfToken || typeof fetch === 'undefined') {
    return Promise.reject(new Error('缺少宜搭登录态或 fetch 能力'));
  }
  return fetchJsonWithTimeout('/query/intelligent/txtFromAI.json?_api=nattyFetch&_mock=false&_stamp=' + new Date().getTime(), {
    method: 'POST',
    credentials: 'same-origin',
    headers: {
      Accept: 'application/json, text/json',
      'Content-Type': 'application/x-www-form-urlencoded',
      'X-Requested-With': 'XMLHttpRequest',
    },
    body: encodeForm({
      _csrf_token: csrfToken,
      prompt: prompt,
      maxTokens: DEFAULT_MAX_TOKENS,
      skill: 'ToText',
    }),
  }, 'Qwen 响应超时，请稍后重试', MODEL_TIMEOUT_MS).then(function(data) {
    if (!data || data.success === false) {
      throw new Error(data && data.errorMsg ? data.errorMsg : 'AI 接口返回异常');
    }
    var text = extractTextFromAiResponse(data);
    if (text) {
      return text;
    }
    throw new Error('AI 没有返回内容');
  }).catch(function(err) {
    throw err;
  });
}

export function callYidaImage(imageUrl) {
  var csrfToken = getCsrfToken();
  if (!csrfToken || typeof fetch === 'undefined') {
    return Promise.reject(new Error('缺少宜搭登录态或 fetch 能力'));
  }
  var inputs = {
    path: {},
    query: {
      PageIndex: '1',
      PageSize: '50',
      KeyWord: '',
    },
    header: {},
    body: {
      image: imageUrl,
      baike: '1',
    },
  };
  var serviceInfo = {
    connectorInfo: {
      connectorId: DEFAULT_IMAGE_CONNECTOR.connectorId,
      actionId: DEFAULT_IMAGE_CONNECTOR.actionId,
      type: 'httpConnector',
      connection: DEFAULT_IMAGE_CONNECTOR.connection,
    },
  };
  return fetchJsonWithTimeout('/query/publicService/invokeService.json?_api=nattyFetch&_mock=false&_stamp=' + new Date().getTime(), {
    method: 'POST',
    credentials: 'same-origin',
    headers: {
      Accept: 'application/json, text/json',
      'Content-Type': 'application/x-www-form-urlencoded',
      'X-Requested-With': 'XMLHttpRequest',
    },
    body: encodeForm({
      inputs: JSON.stringify(inputs),
      serviceInfo: JSON.stringify(serviceInfo),
      _csrf_token: csrfToken,
    }),
  }, '识图接口响应超时，请稍后重试', 60000).then(function(data) {
    if (!data || !data.success) {
      throw new Error(data && data.errorMsg ? data.errorMsg : '识图服务调用失败');
    }
    if (data.content && data.content.serviceReturnValue) {
      return data.content.serviceReturnValue;
    }
    return data.content || {};
  });
}

export function renderSessionItem(item) {
  var self = this;
  var active = item.id === _customState.activeSessionId;
  var menuOpen = item.id === _customState.sessionMenuOpenId;
  var moreClass = active || menuOpen ? cx(tw.sessionMoreButton, tw.sessionMoreButtonActive) : tw.sessionMoreButton;
  var moreStyle = active || menuOpen ? Object.assign({}, styles.sessionMoreButton, styles.sessionMoreButtonActive) : styles.sessionMoreButton;
  return (
    <div key={item.id} className={tw.sessionItemWrap} style={styles.sessionItemWrap}>
      <button
        type="button"
        onClick={(e) => { self.switchSession(item.id); }}
        className={active ? cx(tw.sessionItem, tw.sessionItemActive) : tw.sessionItem}
        style={active ? Object.assign({}, styles.sessionItem, styles.sessionItemActive) : styles.sessionItem}
      >
        <span className={tw.sessionText} style={styles.sessionText}>
          <span className={tw.sessionTitle} style={styles.sessionTitle}>{item.title}{item.pinned ? <span className={tw.sessionPinnedMark} style={styles.sessionPinnedMark}>置顶</span> : null}</span>
        </span>
      </button>
      <button
        type="button"
        title="聊天操作"
        aria-label="聊天操作"
        onClick={(e) => { self.openSessionMenu(item.id, e); }}
        className={moreClass}
        style={moreStyle}
      >
        {chatIcon('more', 18)}
      </button>
    </div>
  );
}

export function renderSessionActionMenu() {
  var self = this;
  var sessionId = _customState.sessionMenuOpenId;
  var session = getSessionById(sessionId);
  if (!session || !hasSessionContent(sessionId, _customState.messages)) {
    return null;
  }
  var projects = normalizeProjectsForSidebar(_customState.projects);
  var menuStyle = Object.assign({}, styles.sessionActionMenu, {
    top: Math.max(80, Number(_customState.sessionMenuTop || 160)),
    left: _customState.sidebarCollapsed ? 64 : 250,
  });
  return (
    <div className={tw.sessionActionMenu} style={menuStyle}>
      <button type="button" onClick={(e) => { self.shareSession(sessionId); }} className={tw.sessionActionItem} style={styles.sessionActionItem}>{chatIcon('share', 20)}<span>分享</span></button>
      <button type="button" onClick={(e) => { self.startGroupChat(sessionId); }} className={tw.sessionActionItem} style={styles.sessionActionItem}>{chatIcon('users', 20)}<span>开始群聊</span></button>
      <button type="button" onClick={(e) => { self.renameSession(sessionId); }} className={tw.sessionActionItem} style={styles.sessionActionItem}>{chatIcon('pencil', 20)}<span>重命名</span></button>
      <button type="button" onClick={(e) => { self.toggleMoveMenu(sessionId); }} className={tw.sessionActionItem} style={styles.sessionActionItem}>{chatIcon('folder', 20)}<span>移至项目</span><span style={{ marginLeft: 'auto' }}>{chatIcon('chevron-right', 18)}</span></button>
      {_customState.sessionMoveOpenId === sessionId ? (
        <div className={tw.sessionMoveList} style={styles.sessionMoveList}>
          <button type="button" onClick={(e) => { self.createProjectAndMoveSession(sessionId); }} className={tw.sessionActionItem} style={styles.sessionActionItem}>{chatIcon('new-folder', 18)}<span>新项目</span></button>
          {projects.map((project) => (
            <button key={'move-' + project.id} type="button" onClick={(e) => { self.moveSessionToProject(sessionId, project.id); }} className={tw.sessionActionItem} style={styles.sessionActionItem}>{chatIcon('folder', 18)}<span>{project.title}</span></button>
          ))}
        </div>
      ) : null}
      <div className={tw.sessionActionDivider} style={styles.sessionActionDivider}></div>
      <button type="button" onClick={(e) => { self.togglePinSession(sessionId); }} className={tw.sessionActionItem} style={styles.sessionActionItem}>{chatIcon('pin', 20)}<span>{session.pinned ? '取消置顶' : '置顶聊天'}</span></button>
      <button type="button" onClick={(e) => { self.archiveSession(sessionId); }} className={tw.sessionActionItem} style={styles.sessionActionItem}>{chatIcon('archive', 20)}<span>归档</span></button>
      <button type="button" onClick={(e) => { self.deleteSession(sessionId); }} className={cx(tw.sessionActionItem, tw.sessionActionDanger)} style={Object.assign({}, styles.sessionActionItem, styles.sessionActionDanger)}>{chatIcon('trash', 20)}<span>删除</span></button>
    </div>
  );
}

export function renderProjectActionMenu() {
  var self = this;
  var projectId = _customState.projectMenuOpenId;
  var project = getProjectById(projectId);
  if (!project) {
    return null;
  }
  var menuStyle = Object.assign({}, styles.sessionActionMenu, {
    top: Math.max(80, Number(_customState.projectMenuTop || 160)),
    left: _customState.sidebarCollapsed ? 64 : 250,
  });
  return (
    <div className={tw.sessionActionMenu} style={menuStyle}>
      <button type="button" onClick={(e) => { self.createProjectSession(projectId, e); }} className={tw.sessionActionItem} style={styles.sessionActionItem}>{chatIcon('new', 20)}<span>新聊天</span></button>
      <button type="button" onClick={(e) => { self.renameProject(projectId); }} className={tw.sessionActionItem} style={styles.sessionActionItem}>{chatIcon('pencil', 20)}<span>重命名项目</span></button>
      <div className={tw.sessionActionDivider} style={styles.sessionActionDivider}></div>
      <button type="button" onClick={(e) => { self.deleteProject(projectId); }} className={cx(tw.sessionActionItem, tw.sessionActionDanger)} style={Object.assign({}, styles.sessionActionItem, styles.sessionActionDanger)}>{chatIcon('trash', 20)}<span>删除项目</span></button>
    </div>
  );
}

export function renderProjectSessionItem(session) {
  var self = this;
  var active = session.id === _customState.activeSessionId;
  return (
    <button
      key={'project-session-' + session.id}
      type="button"
      onClick={(e) => { self.switchSession(session.id); }}
      className={active ? cx(tw.projectSessionItem, tw.projectSessionItemActive) : tw.projectSessionItem}
      style={active ? Object.assign({}, styles.projectSessionItem, styles.projectSessionItemActive) : styles.projectSessionItem}
    >
      <span className={tw.searchResultTitle} style={styles.searchResultTitle}>{session.title}</span>
      {active ? <span className={tw.projectSessionDot} style={styles.projectSessionDot}></span> : null}
    </button>
  );
}

export function renderProjectItem(project) {
  var self = this;
  var active = _customState.activeProjectId === project.id;
  var expanded = isProjectExpanded(project.id);
  var menuOpen = _customState.projectMenuOpenId === project.id;
  var sessions = getProjectSessions(project.id);
  var actionClass = active || menuOpen ? cx(tw.projectItemActions, tw.projectItemActionsActive) : tw.projectItemActions;
  var actionStyle = active || menuOpen ? Object.assign({}, styles.projectItemActions, styles.projectItemActionsActive) : styles.projectItemActions;
  return (
    <div key={project.id} className={tw.projectItemWrap} style={styles.projectItemWrap}>
      <div className={tw.projectItemRow} style={styles.projectItemRow}>
        <button
          type="button"
          onClick={(e) => { self.selectProject(project.id); }}
          className={active ? cx(tw.projectItem, tw.projectItemActive) : tw.projectItem}
          style={active ? Object.assign({}, styles.projectItem, styles.projectItemActive) : styles.projectItem}
        >
          {chatIcon(expanded ? 'folder-open' : 'folder', 18)}
          <span className={tw.projectItemText} style={styles.projectItemText}>{project.title}</span>
        </button>
        <span className={actionClass} style={actionStyle}>
          <button type="button" title="项目操作" aria-label="项目操作" onClick={(e) => { self.openProjectMenu(project.id, e); }} className={tw.projectInlineAction} style={styles.projectInlineAction}>{chatIcon('more', 17)}</button>
          <button type="button" title="项目中新聊天" aria-label="项目中新聊天" onClick={(e) => { self.createProjectSession(project.id, e); }} className={tw.projectInlineAction} style={styles.projectInlineAction}>{chatIcon('new', 17)}</button>
        </span>
      </div>
      {expanded && sessions.length ? (
        <div className={tw.projectSessionList} style={styles.projectSessionList}>
          {sessions.map((session) => self.renderProjectSessionItem(session))}
        </div>
      ) : null}
    </div>
  );
}

export function renderSearchResultItem(item) {
  var self = this;
  return (
    <button
      key={'search-' + item.id}
      type="button"
      onClick={(e) => { self.switchSession(item.id); }}
      className={tw.searchResultItem}
      style={styles.searchResultItem}
    >
      <span className={tw.searchResultIcon} style={styles.searchResultIcon}>{chatIcon('chat', 20)}</span>
      <span className={tw.searchResultTitle} style={styles.searchResultTitle}>{item.title}</span>
    </button>
  );
}

export function renderSearchChatModal() {
  var self = this;
  var results = buildSearchChatResults(_customState.searchQuery);
  var groups = groupSearchChatResults(results);
  var hasQuery = String(_customState.searchQuery || '').trim().length > 0;
  return (
    <div className={tw.searchOverlay} style={styles.searchOverlay} onClick={(e) => { self.closeSearchChat(); }}>
      <div className={tw.searchDialog} style={styles.searchDialog} onClick={(e) => { e.stopPropagation(); }}>
        <div className={tw.searchHeader} style={styles.searchHeader}>
          <input
            id="agent-chatbox-search-input"
            type="text"
            defaultValue={_customState.searchQuery || ''}
            placeholder="搜索聊天..."
            onChange={(e) => { self.handleSearchQueryChange(e); }}
            onKeyDown={(e) => { self.handleSearchKeyDown(e); }}
            className={tw.searchInput}
            style={styles.searchInput}
          />
          <button type="button" aria-label="关闭搜索" title="关闭搜索" onClick={(e) => { self.closeSearchChat(); }} className={tw.searchClose} style={styles.searchClose}>{chatIcon('close', 20)}</button>
        </div>
        <div className={tw.searchBody} style={styles.searchBody}>
          {!hasQuery ? (
            <button type="button" onClick={(e) => { self.createSessionFromSearch(); }} className={tw.searchNewItem} style={styles.searchNewItem}>
              <span className={tw.searchResultIcon} style={styles.searchResultIcon}>{chatIcon('new', 20)}</span>
              <span className={tw.searchResultTitle} style={styles.searchResultTitle}>新聊天</span>
            </button>
          ) : null}
          {groups.length ? groups.map((group) => (
            <div key={'search-group-' + group.label}>
              <div className={tw.searchSectionLabel} style={styles.searchSectionLabel}>{group.label}</div>
              {group.items.map((item) => self.renderSearchResultItem(item))}
            </div>
          )) : (
            <div className={tw.searchEmpty} style={styles.searchEmpty}>没有找到聊天</div>
          )}
        </div>
      </div>
    </div>
  );
}

export function renderActionDialog() {
  var self = this;
  var dialog = _customState.actionDialog;
  if (!dialog) {
    return null;
  }
  var needsInput = actionDialogNeedsInput(dialog);
  var primaryClass = dialog.danger ? cx(tw.actionDialogPrimary, tw.actionDialogDanger) : tw.actionDialogPrimary;
  var primaryStyle = dialog.danger ? Object.assign({}, styles.actionDialogPrimary, styles.actionDialogDanger) : styles.actionDialogPrimary;
  return (
    <div className={tw.actionDialogOverlay} style={styles.actionDialogOverlay} onClick={(e) => { self.closeActionDialog(); }}>
      <div className={tw.actionDialog} style={styles.actionDialog} onClick={(e) => { e.stopPropagation(); }}>
        <div className={tw.actionDialogTitle} style={styles.actionDialogTitle}>{dialog.title}</div>
        {dialog.message ? <div className={tw.actionDialogMessage} style={styles.actionDialogMessage}>{dialog.message}</div> : null}
        {needsInput ? (
          <input
            id="agent-chatbox-action-input"
            type="text"
            defaultValue={dialog.value || ''}
            placeholder={dialog.placeholder || ''}
            onChange={(e) => { self.handleActionDialogValueChange(e); }}
            onKeyDown={(e) => { self.handleActionDialogKeyDown(e); }}
            className={tw.actionDialogInput}
            style={styles.actionDialogInput}
          />
        ) : (
          <button
            id="agent-chatbox-action-confirm"
            type="button"
            onKeyDown={(e) => { self.handleActionDialogKeyDown(e); }}
            onClick={(e) => { self.confirmActionDialog(); }}
            className={primaryClass}
            style={Object.assign({}, primaryStyle, styles.actionDialogHiddenFocus)}
          >
            {dialog.confirmText || '确认'}
          </button>
        )}
        <div className={tw.actionDialogActions} style={styles.actionDialogActions}>
          <button type="button" onClick={(e) => { self.closeActionDialog(); }} className={tw.actionDialogSecondary} style={styles.actionDialogSecondary}>取消</button>
          <button type="button" onClick={(e) => { self.confirmActionDialog(); }} className={primaryClass} style={primaryStyle}>{dialog.confirmText || '确认'}</button>
        </div>
      </div>
    </div>
  );
}

export function renderModeButton(mode, label) {
  var self = this;
  var active = _customState.mode === mode;
  return (
    <button
      key={mode}
      type="button"
      onClick={(e) => { self.setMode(mode); }}
      style={active ? Object.assign({}, styles.segmentButton, styles.segmentButtonActive) : styles.segmentButton}
    >
      {label}
    </button>
  );
}

export function renderProviderButton(provider, label) {
  var self = this;
  var active = _customState.provider === provider;
  return (
    <button
      key={provider}
      type="button"
      onClick={(e) => { self.setProvider(provider); }}
      style={active ? Object.assign({}, styles.providerButton, styles.providerButtonActive) : styles.providerButton}
    >
      {label}
    </button>
  );
}

export function renderPromptChip(prompt) {
  var self = this;
  return (
    <button
      key={prompt}
      type="button"
      onClick={(e) => { self.usePrompt(prompt); }}
      style={styles.promptChip}
    >
      {prompt}
    </button>
  );
}

export function renderPendingImage(stateKey, compact) {
  var self = this;
  var attachment = _customState[getAttachmentStateKey(stateKey)];
  if (!attachment) {
    return null;
  }
  var removeClass = compact ? tw.pendingImageRemoveCompact : tw.pendingImageRemove;
  var removeStyle = compact ? styles.pendingImageRemoveCompact : styles.pendingImageRemove;
  return (
    <div className={compact ? tw.pendingImageCompact : tw.pendingImage} style={compact ? styles.pendingImageCompact : styles.pendingImage}>
      <img className={compact ? tw.pendingImageThumbCompact : tw.pendingImageThumb} src={attachment.dataUrl} alt={attachment.name || '待发送图片'} style={compact ? styles.pendingImageThumbCompact : styles.pendingImageThumb} />
      <div className={compact ? tw.pendingImageMeta : tw.pendingImageMetaCard} style={compact ? styles.pendingImageMeta : styles.pendingImageMetaCard}>
        <div className={compact ? tw.pendingImageNameCompact : tw.pendingImageName} style={compact ? styles.pendingImageNameCompact : styles.pendingImageName}>{attachment.name}</div>
        <div className={compact ? tw.pendingImageSizeCompact : tw.pendingImageSize} style={compact ? styles.pendingImageSizeCompact : styles.pendingImageSize}>{attachment.sizeLabel}</div>
      </div>
      <button type="button" title="移除文件" aria-label="移除文件" onClick={(e) => { self.removePendingImage(stateKey); }} className={removeClass} style={removeStyle}>{compact ? '移除' : '×'}</button>
    </div>
  );
}

export function renderAttachMenu() {
  var self = this;
  var items = [
    { key: 'upload', label: '添加照片和文件', icon: 'paperclip', shortcut: '⌘U', active: true, action: 'upload' },
    { key: 'recent', label: '最近文件', icon: 'file', shortcut: '›', action: 'recent' },
    { key: 'divider-1', type: 'divider' },
    { key: 'image', label: '创建图片', icon: 'image', action: 'image' },
    { key: 'research', label: '深度研究', icon: 'research', action: 'research' },
    { key: 'web', label: '网页搜索', icon: 'globe', action: 'web' },
    { key: 'more', label: '更多', icon: 'more', shortcut: '›', action: 'more' },
    { key: 'divider-2', type: 'divider' },
    { key: 'project', label: '项目', icon: 'folder', shortcut: '›', action: 'project' },
  ];
  return (
    <div className={tw.attachMenu} style={styles.attachMenu}>
      {items.map((item) => {
        if (item.type === 'divider') {
          return <div key={item.key} className={tw.attachMenuDivider} style={styles.attachMenuDivider}></div>;
        }
        var itemClass = item.active ? cx(tw.attachMenuItem, tw.attachMenuItemActive) : tw.attachMenuItem;
        var itemStyle = item.active ? Object.assign({}, styles.attachMenuItem, styles.attachMenuItemActive) : styles.attachMenuItem;
        return (
          <button
            key={item.key}
            type="button"
            onClick={(e) => { if (item.action === 'upload') { self.openAttachUpload('agent-chatbox-file-input'); } else { self.hintAttachMenuCapability(item.label); } }}
            className={itemClass}
            style={itemStyle}
          >
            <span className={tw.attachMenuLeft} style={styles.attachMenuLeft}>
              <span className={tw.attachMenuIcon} style={styles.attachMenuIcon}>{chatIcon(item.icon, 22)}</span>
              <span className={tw.attachMenuLabel} style={styles.attachMenuLabel}>{item.label}</span>
            </span>
            {item.shortcut ? <span className={tw.attachMenuShortcut} style={styles.attachMenuShortcut}>{item.shortcut}</span> : null}
          </button>
        );
      })}
    </div>
  );
}

export function renderQuickStartCard(title, detail, prompt) {
  var self = this;
  return (
    <button
      key={title}
      type="button"
      onClick={(e) => { self.usePrompt(prompt); }}
      style={styles.quickCard}
    >
      <span style={styles.quickCardTitle}>{title}</span>
      <span style={styles.quickCardDetail}>{detail}</span>
    </button>
  );
}

export function renderQuickStartPanel() {
  var project = getActiveProject();
  if (project) {
    return (
      <div className={tw.emptyHero} style={styles.emptyHero}>
        <div className={tw.projectHero} style={styles.projectHero}>
          <span className={tw.projectHeroIcon} style={styles.projectHeroIcon}>{chatIcon('folder-open', 30)}</span>
          <span className={tw.projectHeroTitle} style={styles.projectHeroTitle}>{project.title}</span>
        </div>
      </div>
    );
  }
  return (
    <div className={tw.emptyHero} style={styles.emptyHero}>
      <div className={tw.emptyTitle} style={styles.emptyTitle}>想让 OpenYida 帮你做什么?</div>
    </div>
  );
}

export function renderMessage(message) {
  var self = this;
  var isUser = message.role === 'user';
  var bubbleStyle = isUser ? Object.assign({}, styles.messageBubble, styles.userBubble) : styles.messageBubble;
  var rowStyle = isUser ? Object.assign({}, styles.messageRow, styles.messageRowUser) : styles.messageRow;
  return (
    <div key={message.id} className={isUser ? cx(tw.messageRow, tw.messageRowUser) : tw.messageRow} style={rowStyle}>
      <div className={isUser ? cx(tw.messageBubble, tw.userBubble) : tw.messageBubble} style={bubbleStyle}>
        {getRenderableImageSrc(message) ? this.renderAttachmentPreview(message, false) : null}
        {message.status !== 'thinking' ? this.renderMarkdownContent(message.content, false, message.status === 'error') : null}
        {message.status === 'thinking' ? (
          <div className={tw.thinkingDots} style={styles.thinkingDots}>
            <span className={tw.dotA} style={styles.dotA}></span>
          </div>
        ) : null}
        {!isUser && message.status === 'done' ? self.renderMessageActions(message) : null}
      </div>
    </div>
  );
}

export function renderMessageActions(message) {
  var self = this;
  var actions = [
    { key: 'copy', label: '复制', icon: 'copy' },
    { key: 'regenerate', label: '重新生成', icon: 'regenerate' },
  ];
  return (
    <div className={tw.messageActions} style={styles.messageActions}>
      {actions.map((action) => (
        <button
          key={action.key}
          type="button"
          title={action.label}
          aria-label={action.label}
          onClick={(e) => { self.handleMessageAction(action.key, message.id); }}
          className={tw.messageActionButton}
          style={styles.messageActionButton}
        >
          {chatIcon(action.icon, 15)}
        </button>
      ))}
    </div>
  );
}

export function renderWidgetMessage(message) {
  var isUser = message.role === 'user';
  var bubbleStyle = isUser ? Object.assign({}, styles.widgetBubble, styles.widgetBubbleUser) : styles.widgetBubble;
  return (
    <div key={'widget-' + message.id} style={isUser ? styles.widgetMessageUser : styles.widgetMessage}>
      <div style={bubbleStyle}>
        <div style={styles.widgetMeta}>{isUser ? '你' : 'Agent'} · {message.meta}</div>
        {getRenderableImageSrc(message) ? this.renderAttachmentPreview(message, true) : null}
        {this.renderMarkdownContent(message.content, true, message.status === 'error')}
      </div>
    </div>
  );
}

export function renderAttachmentPreview(message, compact) {
  var imageStyle = compact ? styles.attachmentImageCompact : styles.attachmentImage;
  var imageSrc = getRenderableImageSrc(message);
  if (!imageSrc) {
    return null;
  }
  return (
    <div className={compact ? tw.attachmentPreviewCompact : tw.attachmentPreview} style={compact ? styles.attachmentPreviewCompact : styles.attachmentPreview}>
      <img className={compact ? tw.attachmentImageCompact : tw.attachmentImage} src={imageSrc} alt={message.imageName || '图片附件'} style={imageStyle} />
      <div className={tw.attachmentInfo} style={styles.attachmentInfo}>
        <div className={tw.attachmentName} style={styles.attachmentName}>{message.imageName || '图片附件'}</div>
        <div className={tw.attachmentSize} style={styles.attachmentSize}>{message.imageSize || 'image'}</div>
      </div>
    </div>
  );
}

export function renderMarkdownContent(content, compact, isError) {
  var className = compact ? 'oy-agent-markdown compact' : 'oy-agent-markdown';
  var blockStyle = compact ? styles.widgetMarkdown : styles.messageMarkdown;
  if (isError) {
    blockStyle = Object.assign({}, blockStyle, styles.errorMarkdown);
    className = cx(className, compact ? '' : tw.errorMarkdown);
  } else if (!compact) {
    className = cx(className, tw.messageMarkdown);
  }
  return (
    <div
      className={className}
      style={blockStyle}
      dangerouslySetInnerHTML={{ __html: markdownToHtml(content) }}
    />
  );
}

export function renderContextCard(title, value, tone) {
  var valueStyle = styles.contextValue;
  if (tone === 'ok') {
    valueStyle = Object.assign({}, styles.contextValue, styles.contextValueOk);
  } else if (tone === 'warn') {
    valueStyle = Object.assign({}, styles.contextValue, styles.contextValueWarn);
  }
  return (
    <div key={title} style={styles.contextCard}>
      <div style={styles.contextLabel}>{title}</div>
      <div style={valueStyle}>{value}</div>
    </div>
  );
}

export function renderKnowledgeSource(source) {
  return (
    <a
      key={source.id}
      href={source.url}
      target="_blank"
      rel="noreferrer"
      style={styles.sourceItem}
    >
      <span style={styles.sourceTop}>
        <span style={styles.sourceTitle}>{source.title}</span>
        <span style={styles.sourceType}>{source.type}</span>
      </span>
      <span style={styles.sourceDetail}>{source.detail}</span>
    </a>
  );
}

export function renderToolRun(run) {
  var statusStyle = styles.statusReady;
  if (run.status === 'running') {
    statusStyle = styles.statusRunning;
  } else if (run.status === 'done') {
    statusStyle = styles.statusDone;
  } else if (run.status === 'error') {
    statusStyle = styles.statusError;
  }
  return (
    <div key={run.id} style={styles.toolRun}>
      <div style={styles.toolRunTop}>
        <span style={styles.toolName}>{getExecutionStepLabel(run.name)}</span>
        <span style={Object.assign({}, styles.statusPill, statusStyle)}>{getExecutionStatusLabel(run.status)}</span>
      </div>
      <div style={styles.toolDetail}>{run.detail}</div>
      <div style={styles.toolTime}>{run.time}</div>
    </div>
  );
}

export function renderConfirmCard() {
  var self = this;
  var card = _customState.confirmCard;
  var primaryDisabled = card && card.action === 'openyida.create-app';
  var primaryStyle = primaryDisabled ? Object.assign({}, styles.confirmPrimaryButton, styles.confirmPrimaryButtonDisabled) : styles.confirmPrimaryButton;
  if (!card) {
    return (
      <div style={styles.confirmEmpty}>
        需要执行写入、发布或移动节点时，这里会出现确认卡。
      </div>
    );
  }
  return (
    <div style={styles.confirmCard}>
      <div style={styles.confirmTitle}>{card.title}</div>
      <div style={styles.confirmSource}>{card.source}</div>
      <div style={styles.confirmSummary}>{card.summary}</div>
      <div style={styles.confirmStepList}>
        {(card.steps || []).map((step, index) => (
          <div key={'step-' + index} style={styles.confirmStep}>
            <span style={styles.confirmStepIndex}>{index + 1}</span>
            <span style={styles.confirmStepText}>{step}</span>
          </div>
        ))}
      </div>
      <div style={styles.confirmCommandList}>
        {(card.commands || []).map((command, index) => (
          <div key={'cmd-' + index} style={styles.confirmCommand}>{command}</div>
        ))}
      </div>
      <div style={styles.confirmActions}>
        <button type="button" disabled={primaryDisabled} onClick={(e) => { if (!primaryDisabled) { self.confirmMockAction(); } }} style={primaryStyle}>{card.action === 'openyida.create-app' ? '请切换强模型' : (primaryDisabled ? '需要升级' : (card.confirmText || '确认执行'))}</button>
        <button type="button" onClick={(e) => { self.dismissConfirmCard(); }} style={styles.confirmSecondaryButton}>取消</button>
      </div>
    </div>
  );
}

export function renderInlineConfirmCard() {
  var self = this;
  var card = _customState.confirmCard;
  if (!card) {
    return null;
  }
  var primaryDisabled = card.action === 'openyida.create-app';
  var primaryStyle = primaryDisabled ? Object.assign({}, styles.inlineConfirmPrimaryButton, styles.inlineConfirmPrimaryButtonDisabled) : styles.inlineConfirmPrimaryButton;
  return (
    <div style={styles.inlineConfirmCard}>
      <div style={styles.inlineConfirmHeader}>
        <span style={styles.inlineConfirmBadge}>待确认</span>
        <span style={styles.inlineConfirmTitle}>{card.title}</span>
      </div>
      <div style={styles.inlineConfirmSource}>{card.source}</div>
      <div style={styles.inlineConfirmSummary}>{card.summary}</div>
      {card.action === 'openyida.create-app' ? (
        <div style={styles.inlineConfirmNote}>搭建类写入动作暂不在当前网页执行，请切换到 Codex / OpenYida 强模型链路。</div>
      ) : null}
      <div style={styles.inlineConfirmActions}>
        <button type="button" disabled={primaryDisabled} onClick={(e) => { if (!primaryDisabled) { self.confirmMockAction(); } }} style={primaryStyle}>{card.action === 'openyida.create-app' ? '请切换强模型' : (primaryDisabled ? '需要升级' : (card.confirmText || '确认执行'))}</button>
        <button type="button" onClick={(e) => { self.dismissConfirmCard(); }} style={styles.inlineConfirmSecondaryButton}>取消</button>
      </div>
    </div>
  );
}

function chatIcon(name, size) {
  var value = size || 22;
  var iconStyle = {
    width: value,
    height: value,
    display: 'block',
    flexShrink: 0,
  };
  var commonProps = {
    width: value,
    height: value,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    style: iconStyle,
    'aria-hidden': 'true',
  };
  var iconfontProps = {
    width: value,
    height: value,
    viewBox: '0 0 1024 1024',
    fill: 'currentColor',
    stroke: 'none',
    style: iconStyle,
    'aria-hidden': 'true',
  };
  if (name === 'search') {
    return <svg {...commonProps}><circle cx="11" cy="11" r="7"></circle><path d="M20 20l-4.2-4.2"></path></svg>;
  }
  if (name === 'chat') {
    return <svg {...commonProps}><path d="M5 6.5A7.5 7.5 0 0 1 12.5 3h.8A7.2 7.2 0 0 1 20.5 10.2c0 4-3.2 7.3-7.2 7.3h-4L5 21v-4.2A7.4 7.4 0 0 1 5 6.5z"></path></svg>;
  }
  if (name === 'close') {
    return <svg {...commonProps}><path d="M6 6l12 12"></path><path d="M18 6L6 18"></path></svg>;
  }
  if (name === 'new') {
    return <svg {...commonProps}><path d="M4 20h4.8L19 9.8 14.2 5 4 15.2V20z"></path><path d="M13 6l5 5"></path></svg>;
  }
  if (name === 'skill' || name === 'codex') {
    return <svg {...commonProps}><path d="M12 3l2.1 2.7 3.4-.4.9 3.3 3 1.6-1.6 3 1.1 3.2-3.4.9-2 2.8-3-1.6-3 1.6-2-2.8-3.4-.9 1.1-3.2-1.6-3 3-1.6.9-3.3 3.4.4L12 3z"></path><path d="M8.8 12.3l2.2 2.2 4.4-5"></path></svg>;
  }
  if (name === 'more') {
    return <svg {...commonProps}><circle cx="5" cy="12" r="1.4" fill="currentColor" stroke="none"></circle><circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none"></circle><circle cx="19" cy="12" r="1.4" fill="currentColor" stroke="none"></circle></svg>;
  }
  if (name === 'folder') {
    return <svg {...iconfontProps}><path d="M912 208H427.872l-50.368-94.176A63.936 63.936 0 0 0 321.056 80H112c-35.296 0-64 28.704-64 64v736c0 35.296 28.704 64 64 64h800c35.296 0 64-28.704 64-64v-608c0-35.296-28.704-64-64-64z m-800-64h209.056l68.448 128H912v97.984c-0.416 0-0.8-0.128-1.216-0.128H113.248c-0.416 0-0.8 0.128-1.248 0.128V144z m0 736v-96l1.248-350.144 798.752 1.216V784h0.064v96H112z"></path></svg>;
  }
  if (name === 'folder-open') {
    return <svg {...iconfontProps}><path d="M928 444H820V330.4c0-17.7-14.3-32-32-32H473L355.7 186.2c-1.5-1.4-3.5-2.2-5.5-2.2H96c-17.7 0-32 14.3-32 32v592c0 17.7 14.3 32 32 32h698c13 0 24.8-7.9 29.7-20l134-332c1.5-3.8 2.3-7.9 2.3-12 0-17.7-14.3-32-32-32zM136 256h188.5l119.6 114.4H748V444H238c-13 0-24.8 7.9-29.7 20L136 643.2V256z m635.3 512H159l103.3-256h612.4L771.3 768z"></path></svg>;
  }
  if (name === 'new-folder') {
    return <svg {...iconfontProps}><path d="M529.664 213.333333H896a42.666667 42.666667 0 0 1 42.666667 42.666667v597.333333a42.666667 42.666667 0 0 1-42.666667 42.666667H128a42.666667 42.666667 0 0 1-42.666667-42.666667V170.666667a42.666667 42.666667 0 0 1 42.666667-42.666667h316.330667l85.333333 85.333333zM170.666667 213.333333v597.333334h682.666666V298.666667h-358.997333l-85.333333-85.333334H170.666667z m298.666666 298.666667V384h85.333334v128h128v85.333333h-128v128h-85.333334v-128H341.333333v-85.333333h128z"></path></svg>;
  }
  if (name === 'users') {
    return <svg {...commonProps}><path d="M16 19v-1.2a3.8 3.8 0 0 0-3.8-3.8H7.8A3.8 3.8 0 0 0 4 17.8V19"></path><circle cx="10" cy="7" r="3"></circle><path d="M20 19v-1a3 3 0 0 0-2.4-2.9"></path><path d="M16.5 4.2a3 3 0 0 1 0 5.6"></path></svg>;
  }
  if (name === 'pencil') {
    return <svg {...commonProps}><path d="M4 20h4l10.5-10.5a2.8 2.8 0 0 0-4-4L4 16v4z"></path><path d="M13.5 6.5l4 4"></path></svg>;
  }
  if (name === 'pin') {
    return <svg {...commonProps}><path d="M14 3l7 7-3 1-3.5 3.5.5 4-1.5 1.5-4-4L5 20l-1-1 4-4-4-4 1.5-1.5 4 .5L13 6.5 14 3z"></path></svg>;
  }
  if (name === 'archive') {
    return <svg {...commonProps}><rect x="4" y="5" width="16" height="4" rx="1"></rect><path d="M6 9v10a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V9"></path><path d="M10 13h4"></path></svg>;
  }
  if (name === 'trash') {
    return <svg {...commonProps}><path d="M4 7h16"></path><path d="M10 11v6"></path><path d="M14 11v6"></path><path d="M6 7l1 14h10l1-14"></path><path d="M9 7V4h6v3"></path></svg>;
  }
  if (name === 'layout') {
    return <svg {...commonProps}><rect x="4" y="4" width="16" height="16" rx="2.5"></rect><path d="M10 4v16"></path></svg>;
  }
  if (name === 'share') {
    return <svg {...commonProps}><path d="M12 16V4"></path><path d="M7 9l5-5 5 5"></path><path d="M5 14v4a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-4"></path></svg>;
  }
  if (name === 'mic') {
    return <svg {...commonProps}><rect x="9" y="3" width="6" height="11" rx="3"></rect><path d="M5 11a7 7 0 0 0 14 0"></path><path d="M12 18v3"></path></svg>;
  }
  if (name === 'add') {
    return <svg {...commonProps}><path d="M12 5v14"></path><path d="M5 12h14"></path></svg>;
  }
  if (name === 'paperclip') {
    return <svg {...commonProps}><path d="M21 11.5l-8.4 8.4a5 5 0 0 1-7.1-7.1l9.1-9.1a3.5 3.5 0 0 1 4.9 4.9l-9.1 9.1a2 2 0 0 1-2.8-2.8l8.4-8.4"></path></svg>;
  }
  if (name === 'file') {
    return <svg {...commonProps}><path d="M6 3.5h8l4 4V20a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 6 20V3.5z"></path><path d="M14 3.5v4h4"></path><path d="M9 13h6"></path><path d="M9 16h4"></path></svg>;
  }
  if (name === 'image') {
    return <svg {...commonProps}><rect x="4" y="5" width="16" height="14" rx="2"></rect><circle cx="9" cy="10" r="1.5"></circle><path d="M7 17l4-4 3 3 2-2 3 3"></path></svg>;
  }
  if (name === 'research') {
    return <svg {...commonProps}><path d="M12 3v5"></path><path d="M7 8h10"></path><path d="M8.5 8l-2.7 10A2.5 2.5 0 0 0 8.2 21h7.6a2.5 2.5 0 0 0 2.4-3L15.5 8"></path><path d="M9 15h6"></path></svg>;
  }
  if (name === 'globe') {
    return <svg {...commonProps}><circle cx="12" cy="12" r="9"></circle><path d="M3 12h18"></path><path d="M12 3a14 14 0 0 1 0 18"></path><path d="M12 3a14 14 0 0 0 0 18"></path></svg>;
  }
  if (name === 'send') {
    return <svg {...commonProps}><path d="M12 19V5"></path><path d="M5 12l7-7 7 7"></path></svg>;
  }
  if (name === 'home') {
    return <svg {...commonProps}><path d="M4 10.5L12 4l8 6.5"></path><path d="M6.5 9.5V20h11V9.5"></path></svg>;
  }
  if (name === 'copy') {
    return <svg {...commonProps}><rect x="8" y="8" width="11" height="11" rx="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v1"></path></svg>;
  }
  if (name === 'regenerate') {
    return <svg {...commonProps}><path d="M20 11a8 8 0 1 0-2.3 5.7"></path><path d="M20 5v6h-6"></path></svg>;
  }
  if (name === 'chevron-down') {
    return <svg {...commonProps} strokeWidth="2"><path d="M7.5 10.2l4.5 4.1 4.5-4.1"></path></svg>;
  }
  if (name === 'chevron-right') {
    return <svg {...commonProps} strokeWidth="2"><path d="M10.1 7.5l4.1 4.5-4.1 4.5"></path></svg>;
  }
  return <svg {...commonProps}><path d="M12 5v14"></path><path d="M5 12h14"></path></svg>;
}

export function renderSidebarAction(iconName, label, active, onClick) {
  return (
    <button
      type="button"
      onClick={(e) => { if (onClick) { onClick(); } }}
      className={active ? cx(tw.sidebarAction, tw.sidebarActionActive) : tw.sidebarAction}
      style={active ? Object.assign({}, styles.sidebarAction, styles.sidebarActionActive) : styles.sidebarAction}
    >
      <span className={tw.sidebarActionIcon} style={styles.sidebarActionIcon}>{chatIcon(iconName, 19)}</span>
      <span className={tw.sidebarActionText} style={styles.sidebarActionText}>{label}</span>
    </button>
  );
}

export function renderSidebarSectionHeader(label, open, onClick) {
  return (
    <button
      type="button"
      onClick={(e) => { if (onClick) { onClick(); } }}
      className={tw.sidebarSectionHeader}
      style={styles.sidebarSectionHeader}
    >
      <span className={tw.sidebarSectionLabel} style={styles.sidebarSectionLabel}>{label}</span>
      <span className={tw.sidebarSectionIcon} style={styles.sidebarSectionIcon}>{chatIcon(open ? 'chevron-down' : 'chevron-right', 15)}</span>
    </button>
  );
}

export function renderSidebar(isMobile) {
  var self = this;
  var sessions = getRecentSidebarSessions();
  var projects = normalizeProjectsForSidebar(_customState.projects);
  var profile = getCurrentUserProfile();
  var leftGroupTitle = '项目';
  var leftGroupItems = projects;
  if (isMobile) {
    return null;
  }
  if (_customState.sidebarCollapsed) {
    return (
      <aside className={cx(tw.sidebar, tw.sidebarCollapsed)} style={Object.assign({}, styles.sidebar, styles.sidebarCollapsed)}>
        <div className={tw.collapsedRail} style={styles.collapsedRail}>
          <button type="button" onClick={(e) => { self.toggleSidebar(); }} className={tw.railIcon} style={styles.railIcon}>{chatIcon('layout', 20)}</button>
          <button type="button" onClick={(e) => { self.createSession(); }} className={tw.railIcon} style={styles.railIcon}>{chatIcon('new', 20)}</button>
          <button type="button" onClick={(e) => { self.openSearchChat(); }} className={tw.railIcon} style={styles.railIcon}>{chatIcon('search', 20)}</button>
        </div>
        <div className={tw.railBottom} style={styles.railBottom}>
          {profile.avatar ? (
            <img className={tw.userAvatarImage} src={profile.avatar} alt={profile.name} style={styles.userAvatarImage} />
          ) : (
            <div className={tw.userAvatarMini} style={styles.userAvatarMini}>{profile.initials}</div>
          )}
        </div>
      </aside>
    );
  }
  return (
    <aside className={tw.sidebar} style={styles.sidebar}>
      <div className={tw.brandRow} style={styles.brandRow}>
        <div className={tw.brandTitle} style={styles.brandTitle}>OpenYida 助手</div>
        <button type="button" onClick={(e) => { self.toggleSidebar(); }} className={tw.sidebarToggle} style={styles.sidebarToggle}>{chatIcon('layout', 19)}</button>
      </div>

      <div className={tw.sidebarSection} style={styles.sidebarSection}>
        {this.renderSidebarAction('new', '新聊天', isGlobalNewChatActive(), function() { self.createSession(); })}
        {this.renderSidebarAction('search', '搜索聊天', false, function() { self.openSearchChat(); })}
      </div>

      <div className={tw.sidebarSection} style={styles.sidebarSection}>
        {this.renderSidebarSectionHeader(leftGroupTitle, _customState.projectSectionOpen, function() { self.toggleProjectSection(); })}
        {_customState.projectSectionOpen ? (
          leftGroupItems.length ? (
            <div className={tw.projectList} style={styles.projectList}>
              <button type="button" onClick={(e) => { self.createProject(); }} className={tw.projectItem} style={styles.projectItem}>{chatIcon('new-folder', 18)}<span>新项目</span></button>
              {leftGroupItems.map((project) => self.renderProjectItem(project))}
            </div>
          ) : (
            <div className={tw.projectList} style={styles.projectList}>
              <button type="button" onClick={(e) => { self.createProject(); }} className={tw.projectItem} style={styles.projectItem}>{chatIcon('new-folder', 18)}<span>新项目</span></button>
            </div>
          )
        ) : null}
      </div>

      <div className={cx(tw.sidebarSection, tw.recentSection)} style={Object.assign({}, styles.sidebarSection, styles.recentSection)}>
        {this.renderSidebarSectionHeader('最近', _customState.recentSectionOpen, function() { self.toggleRecentSection(); })}
        {_customState.recentSectionOpen ? (
          <div className={tw.sessionList} style={styles.sessionList}>
            {sessions.map((item) => self.renderSessionItem(item))}
          </div>
        ) : null}
      </div>

      <div className={tw.userBar} style={styles.userBar}>
        {profile.avatar ? (
          <img className={tw.userAvatarImage} src={profile.avatar} alt={profile.name} style={styles.userAvatarImage} />
        ) : (
          <div className={tw.userAvatarMini} style={styles.userAvatarMini}>{profile.initials}</div>
        )}
        <div className={tw.userMeta} style={styles.userMeta}>
          <div className={tw.userName} style={styles.userName}>{profile.name}</div>
        </div>
        <div className={tw.storeIcon} style={styles.storeIcon}>{chatIcon('home', 17)}</div>
      </div>
    </aside>
  );
}

export function renderInspector(isMobile) {
  var self = this;
  var messages = getActiveMessages();
  var imageMessages = messages.filter((item) => getRenderableImageSrc(item));
  var lastImage = imageMessages.length ? imageMessages[imageMessages.length - 1] : null;
  if (isMobile) {
    return null;
  }
  return (
    <aside style={styles.inspector}>
      <section style={styles.inspectorSection}>
        <div style={styles.panelTitle}>当前状态</div>
      <div style={styles.contextGrid}>
          {self.renderContextCard('能力', 'OpenYida 助手', 'ok')}
          {self.renderContextCard('输入', '文字 / 截图 / 附件', 'ok')}
          {self.renderContextCard('权限', '只看自己的数据', 'warn')}
          {self.renderContextCard('形态', _customState.widgetOpen ? '浮窗已打开' : '全页工作台', '')}
        </div>
      </section>
      <section style={styles.inspectorSection}>
        <div style={styles.panelTitle}>数据安全</div>
        <div style={styles.securityPanel}>
          <div style={styles.securityTitle}>最小权限原则</div>
          <div style={styles.securityText}>OpenYida 助手默认只使用当前会话、上传附件和公开文档源。读取宜搭业务数据时，必须遵循当前登录人的数据权限：每个人只能看自己的数据。</div>
        </div>
      </section>
      <section style={styles.inspectorSection}>
        <div style={styles.panelTitle}>执行确认</div>
        {self.renderConfirmCard()}
      </section>
      <section style={styles.inspectorSection}>
        <div style={styles.panelTitle}>数据源</div>
        <div style={styles.sourceList}>
          {KNOWLEDGE_SOURCES.map((source) => self.renderKnowledgeSource(source))}
        </div>
      </section>
      <section style={styles.inspectorSection}>
        <div style={styles.panelTitle}>执行步骤</div>
        <div style={styles.toolList}>
          {(_customState.toolRuns || []).slice(0, 6).map((run) => self.renderToolRun(run))}
        </div>
      </section>
      <section style={styles.inspectorSection}>
        <div style={styles.panelTitle}>图片附件</div>
        {lastImage ? self.renderAttachmentPreview(lastImage, false) : (
          <div style={styles.emptyAttachment}>暂无图片附件</div>
        )}
      </section>
    </aside>
  );
}

export function renderMobileSessions(isMobile) {
  var self = this;
  var sessions = getRecentSidebarSessions();
  if (!isMobile) {
    return null;
  }
  return (
    <div className={tw.mobileSessionBar} style={styles.mobileSessionBar}>
      <button type="button" onClick={(e) => { self.createSession(); }} className={tw.mobileNewButton} style={styles.mobileNewButton}>{chatIcon('new', 19)}</button>
      <div className={tw.mobileSessionScroll} style={styles.mobileSessionScroll}>
        {sessions.map((item) => self.renderSessionItem(item))}
      </div>
    </div>
  );
}

export function renderPromptRow() {
  return null;
}

export function renderComposer(centered) {
  var self = this;
  var composerClass = centered ? cx(tw.composer, tw.composerCentered) : tw.composer;
  var attachButtonClass = _customState.attachMenuOpen ? cx(tw.attachButton, tw.attachButtonOpen) : tw.attachButton;
  var attachButtonStyle = _customState.attachMenuOpen ? Object.assign({}, styles.attachButton, styles.attachButtonOpen) : styles.attachButton;
  return (
    <div className={composerClass}>
      <input
        id="agent-chatbox-file-input"
        type="file"
        accept="image/*"
        onChange={(e) => { self.handleImageUpload(e, 'draft'); }}
        className={tw.hiddenFileInput}
        style={styles.hiddenFileInput}
      />
      <div className={tw.inputRow} style={styles.inputRow}>
        {_customState.attachMenuOpen ? this.renderAttachMenu() : null}
        {this.renderPendingImage('draft', false)}
        <textarea
          id="agent-chatbox-input"
          defaultValue={_customState.draft || ''}
          placeholder={getComposerPlaceholder()}
          autoFocus={true}
          rows={1}
          onFocus={(e) => { self.closeAttachMenu(); }}
          onCompositionStart={(e) => { self.handleInputCompositionStart(e); }}
          onCompositionEnd={(e) => { self.handleInputCompositionEnd(e); }}
          onInput={(e) => { self.handleDraftChange(e); }}
          onChange={(e) => { self.handleDraftChange(e); }}
          onKeyDown={(e) => { self.handleInputKeyDown(e); }}
          onPaste={(e) => { self.handleInputPaste(e, 'draft'); }}
          className={tw.textarea}
          style={styles.textarea}
        />
        <div className={tw.composerBottom} style={styles.composerBottom}>
          <button type="button" title="添加" aria-label="添加" aria-expanded={_customState.attachMenuOpen ? 'true' : 'false'} onClick={(e) => { self.toggleAttachMenu(); }} className={attachButtonClass} style={attachButtonStyle}>{chatIcon('add', 22)}</button>
          <div className={tw.composerRight} style={styles.composerRight}>
            <button type="button" className={tw.modelSelector} style={styles.modelSelector}>Qwen</button>
            <button type="button" className={tw.micButton} style={styles.micButton}>{chatIcon('mic', 19)}</button>
            <button
              type="button"
              onClick={(e) => { self.sendMessage(); }}
              className={_customState.isSending ? cx(tw.sendButton, tw.sendButtonDisabled) : tw.sendButton}
              style={_customState.isSending ? Object.assign({}, styles.sendButton, styles.sendButtonDisabled) : styles.sendButton}
            >
              {_customState.isSending ? '…' : chatIcon('send', 18)}
            </button>
          </div>
        </div>
      </div>
      <div className={tw.composerDisclaimer} style={styles.composerDisclaimer}>
        当前网页侧优先支持资料检索、登录诊断和只读查询；搭建、创建、发布等写入需求建议切换到 Codex / OpenYida 强模型链路。知识问答由宜搭知识库与 Qwen 生成，请自行核验；宜搭 Qwen 当前不支持 stream，回答会一次性返回，可能较慢。
      </div>
    </div>
  );
}

export function renderBridgeButton() {
  var self = this;
  var active = _customState.bridgePanelOpen || _customState.bridgeStatus === 'paired';
  var buttonStyle = active ? Object.assign({}, styles.bridgeButton, styles.bridgeButtonActive) : styles.bridgeButton;
  var label = _customState.bridgeStatus === 'paired' ? '已连接 · 详情' : getBridgeStatusText(_customState.bridgeStatus);
  return (
    <button
      type="button"
      title="点击查看 OpenYida 本地连接详情"
      aria-label="点击查看 OpenYida 本地连接详情"
      onClick={(e) => { self.toggleBridgePanel(); }}
      style={buttonStyle}
    >
      <span style={getBridgeDotStyle(_customState.bridgeStatus)} />
      <span style={styles.bridgeButtonText}>{label}</span>
      <span style={styles.bridgeButtonChevron}>{chatIcon('chevron-down', 13)}</span>
    </button>
  );
}

export function renderBridgePanel(isMobile) {
  var self = this;
  if (!_customState.bridgePanelOpen) {
    return null;
  }
  var panelStyle = isMobile ? Object.assign({}, styles.bridgePanel, styles.bridgePanelMobile) : styles.bridgePanel;
  var paired = _customState.bridgeStatus === 'paired' && _customState.bridgeAccessToken;
  var outdated = _customState.bridgeStatus === 'outdated';
  var startCommand = getBridgeStartCommand();
  var login = _customState.bridgeLogin || null;
  var loginLabel = getBridgeLoginLabel(login);
  var organizations = _customState.bridgeOrganizations || [];
  var envRows = getBridgeEnvironmentRows();
  return (
    <div style={panelStyle}>
      <div style={styles.bridgePanelHeader}>
        <div>
          <div style={styles.bridgePanelTitle}>OpenYida Local Bridge</div>
          <div style={styles.bridgePanelSub}>{_customState.bridgeMessage}</div>
        </div>
        <button type="button" onClick={(e) => { self.toggleBridgePanel(); }} style={styles.bridgeCloseButton}>关闭</button>
      </div>

      <div style={styles.bridgeStatusGrid}>
        <div style={styles.bridgeStatusItem}>
          <span style={styles.bridgeStatusLabel}>连接</span>
          <strong style={styles.bridgeStatusValue}>{getBridgeStatusText(_customState.bridgeStatus)}</strong>
        </div>
        <div style={styles.bridgeStatusItem}>
          <span style={styles.bridgeStatusLabel}>登录</span>
          <strong style={styles.bridgeStatusValue}>{loginLabel}</strong>
        </div>
        <div style={styles.bridgeStatusItem}>
          <span style={styles.bridgeStatusLabel}>版本要求</span>
          <strong style={styles.bridgeStatusValue}>{BRIDGE_MIN_VERSION}+</strong>
        </div>
        <div style={styles.bridgeStatusItem}>
          <span style={styles.bridgeStatusLabel}>本地版本</span>
          <strong style={styles.bridgeStatusValue}>{_customState.bridgeVersion || '未检测'}</strong>
        </div>
      </div>

      {outdated ? (
        <div style={styles.bridgeCommandBox}>
          <code style={styles.bridgeCommand}>{BRIDGE_UPDATE_COMMAND}</code>
          <button type="button" onClick={(e) => { self.copyBridgeUpdateCommand(); }} style={styles.bridgeSmallButton}>复制</button>
        </div>
      ) : _customState.bridgeBaseUrl ? (
        <div style={styles.bridgeBaseUrl}>{_customState.bridgeBaseUrl}</div>
      ) : (
        <div style={styles.bridgeCommandBox}>
          <code style={styles.bridgeCommand}>{startCommand}</code>
          <button type="button" onClick={(e) => { self.copyBridgeStartCommand(); }} style={styles.bridgeSmallButton}>复制</button>
        </div>
      )}

      {!paired ? (
        <div style={styles.bridgeHelpText}>{outdated ? '正式版升级完成后，重新运行页面里的启动命令。' : '首次使用复制这一条命令到本机终端运行即可，页面会自动完成配对。'}</div>
      ) : null}

      <div style={styles.bridgeEnvSection}>
        <div style={styles.bridgeEnvHeader}>环境信息</div>
        <div style={styles.bridgeEnvGrid}>
          {envRows.map((row) => (
            <div key={row.label} style={styles.bridgeEnvItem}>
              <span style={styles.bridgeEnvLabel}>{row.label}</span>
              <strong title={row.value} style={styles.bridgeEnvValue}>{row.value}</strong>
            </div>
          ))}
        </div>
      </div>

      {paired ? (
        <div style={styles.bridgeActionRow}>
          <button type="button" disabled={_customState.bridgeBusy} onClick={(e) => { self.checkBridgeLogin(); }} style={styles.bridgeActionButton}>检查登录</button>
          <button type="button" disabled={_customState.bridgeBusy} onClick={(e) => { self.startBridgeLogin(); }} style={styles.bridgeActionButton}>本地登录</button>
          <button type="button" disabled={_customState.bridgeBusy} onClick={(e) => { self.openBridgeFeedback(); }} style={styles.bridgeActionButton}>提交反馈</button>
        </div>
      ) : (
        <div style={styles.bridgeActionRow}>
          <button type="button" disabled={_customState.bridgeBusy} onClick={(e) => { self.detectLocalBridge(); }} style={styles.bridgeActionButton}>重新检测</button>
          {outdated ? <button type="button" onClick={(e) => { self.copyBridgeUpdateCommand(); }} style={styles.bridgeActionButton}>复制升级命令</button> : null}
          <button type="button" onClick={(e) => { self.copyBridgeStartCommand(); }} style={styles.bridgeActionButton}>复制命令</button>
        </div>
      )}

      {_customState.bridgeQrUrl ? (
        <div style={styles.bridgeQrBox}>
          <div style={styles.bridgeQrTitle}>钉钉扫码登录</div>
          <a href={_customState.bridgeQrUrl} target="_blank" rel="noreferrer" style={styles.bridgeQrLink}>打开二维码链接</a>
          <button type="button" onClick={(e) => { self.pollBridgeLogin(); }} style={styles.bridgeSmallButton}>我已扫码</button>
        </div>
      ) : null}

      {organizations.length ? (
        <div style={styles.bridgeOrgList}>
          <div style={styles.bridgeQrTitle}>选择组织</div>
          {organizations.map((org) => (
            <button
              key={org.corpId}
              type="button"
              onClick={(e) => { self.selectBridgeCorp(org.corpId); }}
              style={styles.bridgeOrgButton}
            >
              {org.corpName || org.corpId}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function renderChatHeader(isMobile) {
  var session = getActiveSession() || { title: '会话' };
  var project = getHeaderProject(session);
  var title = getSessionDisplayTitle(session);
  return (
    <header className={tw.chatHeader} style={styles.chatHeader}>
      {project ? (
        <div className={tw.headerProject} style={styles.headerProject} title={project.title}>
          <span className={tw.headerProjectIcon} style={styles.headerProjectIcon}>{chatIcon('folder-open', 28)}</span>
          <span className={tw.headerProjectTitle} style={styles.headerProjectTitle}>{project.title}</span>
        </div>
      ) : (
        <div className={tw.headerTitle} style={styles.headerTitle}>{isMobile ? 'OpenYida 助手' : title}</div>
      )}
      <div className={tw.headerActions} style={styles.headerActions}>
        {this.renderBridgeButton()}
      </div>
    </header>
  );
}

export function renderFloatingWidget(isMobile) {
  var self = this;
  var messages = getActiveMessages();
  var compactMessages = getLatestWidgetMessages(messages);
  var panelStyle = isMobile ? Object.assign({}, styles.widgetPanel, styles.widgetPanelMobile) : styles.widgetPanel;
  if (!_customState.widgetOpen) {
    return (
      <button type="button" onClick={(e) => { self.openWidget(); }} style={styles.widgetTrigger}>
        <span style={styles.widgetTriggerIcon}>OY</span>
        <span style={styles.widgetTriggerText}>问 OpenYida 助手</span>
        <span style={styles.widgetTriggerBadge}>在线</span>
      </button>
    );
  }
  return (
    <div style={panelStyle}>
      <div style={styles.widgetHeader}>
        <div style={styles.widgetHeaderLeft}>
          <div style={styles.widgetLogo}>OY</div>
          <div>
            <div style={styles.widgetTitle}>OpenYida 助手</div>
            <div style={styles.widgetSub}>应用搭建、排查和技能包接入</div>
          </div>
        </div>
        <button type="button" onClick={(e) => { self.closeWidget(); }} style={styles.widgetCloseButton}>收起</button>
      </div>
      <div style={styles.widgetBody}>
        {compactMessages.length ? compactMessages.map((message) => self.renderWidgetMessage(message)) : (
          <div style={styles.widgetEmpty}>描述任务，或直接粘贴截图</div>
        )}
      </div>
      <div style={styles.widgetSuggestions}>
        <button type="button" onClick={(e) => { self.useWidgetPrompt(TEXT_PROMPTS[1]); }} style={styles.widgetSuggestion}>搭建 CRM</button>
        <button type="button" onClick={(e) => { self.useWidgetPrompt(TEXT_PROMPTS[2]); }} style={styles.widgetSuggestion}>悟空接入</button>
        <button type="button" onClick={(e) => { self.triggerImageUpload('agent-chatbox-widget-file-input'); }} style={styles.widgetSuggestion}>上传图片</button>
      </div>
      {this.renderPendingImage('widgetDraft', true)}
      <input
        id="agent-chatbox-widget-file-input"
        type="file"
        accept="image/*"
        onChange={(e) => { self.handleImageUpload(e, 'widgetDraft'); }}
        style={styles.hiddenFileInput}
      />
      <div style={styles.widgetComposer}>
        <textarea
          id="agent-chatbox-widget-input"
          defaultValue={_customState.widgetDraft || ''}
          placeholder={DEFAULT_COMPOSER_PLACEHOLDER}
          onCompositionStart={(e) => { self.handleInputCompositionStart(e); }}
          onCompositionEnd={(e) => { self.handleWidgetInputCompositionEnd(e); }}
          onChange={(e) => { self.handleWidgetDraftChange(e); }}
          onKeyDown={(e) => { self.handleWidgetInputKeyDown(e); }}
          onPaste={(e) => { self.handleInputPaste(e, 'widgetDraft'); }}
          style={styles.widgetTextarea}
        />
        <button
          type="button"
          onClick={(e) => { self.sendWidgetMessage(); }}
          style={_customState.isSending ? Object.assign({}, styles.widgetSendButton, styles.sendButtonDisabled) : styles.widgetSendButton}
        >
          发送
        </button>
      </div>
    </div>
  );
}

export function renderJsx() {
  var self = this;
  var timestamp = this.state && this.state.timestamp;
  var viewportWidth = typeof window !== 'undefined' && window.innerWidth ? window.innerWidth : 1280;
  var isMobile = viewportWidth <= 760 || (this.utils && this.utils.isMobile ? this.utils.isMobile() : false);
  var messages = getActiveMessages();
  var visibleMessages = getRenderableMessages(messages);
  var hasMoreMessages = hasMoreEarlierMessages(messages);
  var shellStyle = isMobile ? styles.mobileShell : (_customState.sidebarCollapsed ? Object.assign({}, styles.shell, styles.shellCollapsed) : styles.shell);

  return (
    <div className={tw.page} style={styles.page}>
      <div style={{ display: 'none' }}>{timestamp}</div>
      <style>{MARKDOWN_CSS}</style>
      <div className={isMobile ? tw.mobileShell : (_customState.sidebarCollapsed ? cx(tw.shell, tw.shellCollapsed) : tw.shell)} style={shellStyle}>
        {this.renderSidebar(isMobile)}
        <main className={tw.chatPanel} style={styles.chatPanel}>
          {this.renderMobileSessions(isMobile)}
          {this.renderChatHeader(isMobile)}
          {this.renderBridgePanel(isMobile)}
          {messages.length ? (
            <div id="agent-chatbox-message-list" className={tw.messageList} style={styles.messageList} onScroll={(e) => { self.handleMessageListScroll(e); }}>
              {hasMoreMessages ? (
                <div style={styles.historyLoader}>
                  向上滚动加载更早消息
                </div>
              ) : null}
              {visibleMessages.map((message) => self.renderMessage(message))}
              {_customState.confirmCard ? (
                <div className={tw.messageRow} style={styles.messageRow}>
                  {this.renderInlineConfirmCard()}
                </div>
              ) : null}
            </div>
          ) : (
            <div className={tw.emptyStage} style={styles.emptyStage}>
              {this.renderQuickStartPanel()}
              {this.renderComposer(true)}
            </div>
          )}
          {messages.length ? this.renderComposer(false) : null}
          {_customState.searchOpen ? this.renderSearchChatModal() : null}
        </main>
      </div>
      {_customState.sessionMenuOpenId ? this.renderSessionActionMenu() : null}
      {_customState.projectMenuOpenId ? this.renderProjectActionMenu() : null}
      {_customState.actionDialog ? this.renderActionDialog() : null}
    </div>
  );
}

var styles = {
  page: {
    minHeight: '100vh',
    background: '#EEF2F6',
    color: '#172033',
    fontFamily: CHATGPT_FONT_FAMILY,
    letterSpacing: 0,
  },
  shell: {
    minHeight: '100vh',
    display: 'grid',
    gridTemplateColumns: '260px minmax(0, 1fr) 320px',
  },
  mobileShell: {
    minHeight: '100vh',
    display: 'block',
  },
  sidebar: {
    background: '#172033',
    color: '#FFFFFF',
    padding: '22px 16px',
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
  },
  brandRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  },
  brandMark: {
    width: 42,
    height: 42,
    borderRadius: 8,
    background: '#2DD4BF',
    color: '#082F49',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 600,
    fontSize: 14,
  },
  brandTitle: {
    fontSize: 16,
    fontWeight: 600,
  },
  brandSub: {
    marginTop: 2,
    fontSize: 12,
    color: '#A7B6CC',
  },
  newChatButton: {
    height: 38,
    border: '0 none',
    borderRadius: 6,
    background: '#FFFFFF',
    color: '#172033',
    fontWeight: 600,
    cursor: 'pointer',
  },
  sessionList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    overflowY: 'auto',
  },
  sessionItem: {
    width: '100%',
    minHeight: 58,
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 8,
    background: 'rgba(255,255,255,0.04)',
    color: '#E7EEF8',
    textAlign: 'left',
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '10px 12px',
    cursor: 'pointer',
  },
  sessionItemActive: {
    background: '#25324A',
    border: '1px solid #2DD4BF',
  },
  sessionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    background: '#2DD4BF',
    flexShrink: 0,
  },
  sessionText: {
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: 3,
  },
  sessionTitle: {
    display: 'block',
    fontSize: 13,
    fontWeight: 600,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  sessionSub: {
    display: 'block',
    fontSize: 11,
    color: '#A7B6CC',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  chatPanel: {
    minWidth: 0,
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    background: '#F8FAFC',
  },
  chatHeader: {
    minHeight: 72,
    padding: '16px 22px',
    borderBottom: '1px solid #DCE3ED',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
    background: '#FFFFFF',
  },
  chatTitle: {
    fontSize: 18,
    fontWeight: 600,
    color: '#172033',
  },
  chatSub: {
    marginTop: 4,
    fontSize: 12,
    color: '#66758A',
  },
  headerActions: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
  },
  segmentButton: {
    height: 34,
    minWidth: 58,
    border: '1px solid #C9D3E2',
    borderRadius: 6,
    background: '#FFFFFF',
    color: '#46566E',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
  },
  segmentButtonActive: {
    background: '#0F766E',
    border: '1px solid #0F766E',
    color: '#FFFFFF',
  },
  clearButton: {
    height: 34,
    minWidth: 58,
    border: '1px solid #F0C2A0',
    borderRadius: 6,
    background: '#FFF7ED',
    color: '#9A3412',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
  },
  widgetPreviewButton: {
    height: 34,
    minWidth: 78,
    border: '1px solid #B7E4D3',
    borderRadius: 6,
    background: '#ECFDF5',
    color: '#047857',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
  },
  messageList: {
    flex: 1,
    minHeight: 360,
    overflowY: 'auto',
    padding: '24px 28px',
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
  },
  quickPanel: {
    maxWidth: 820,
    border: '1px solid #D8E0EA',
    borderRadius: 8,
    background: '#FFFFFF',
    padding: 16,
    boxShadow: '0 10px 24px rgba(15, 23, 42, 0.05)',
  },
  quickPanelTop: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 14,
    marginBottom: 14,
  },
  quickPanelTitle: {
    fontSize: 15,
    fontWeight: 600,
    color: '#172033',
  },
  quickPanelSub: {
    marginTop: 4,
    fontSize: 12,
    color: '#64748B',
    lineHeight: 1.5,
  },
  quickPanelBadge: {
    flexShrink: 0,
    borderRadius: 999,
    background: '#E0F2FE',
    color: '#075985',
    fontSize: 11,
    fontWeight: 600,
    padding: '5px 9px',
  },
  quickGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: 10,
  },
  quickCard: {
    minHeight: 88,
    border: '1px solid #E1E7F0',
    borderRadius: 8,
    background: '#F8FAFC',
    color: '#172033',
    textAlign: 'left',
    padding: 12,
    cursor: 'pointer',
  },
  quickCardTitle: {
    display: 'block',
    fontSize: 13,
    fontWeight: 600,
    marginBottom: 6,
  },
  quickCardDetail: {
    display: 'block',
    fontSize: 12,
    color: '#64748B',
    lineHeight: 1.45,
  },
  messageRow: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 10,
    maxWidth: 820,
  },
  messageRowUser: {
    alignSelf: 'flex-end',
    flexDirection: 'row-reverse',
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 8,
    background: '#E0F2FE',
    color: '#075985',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 12,
    fontWeight: 600,
    flexShrink: 0,
  },
  userAvatar: {
    background: '#DCFCE7',
    color: '#166534',
  },
  messageBubble: {
    background: '#FFFFFF',
    border: '1px solid #DCE3ED',
    borderRadius: 8,
    padding: '12px 14px',
    minWidth: 160,
    maxWidth: 680,
    boxShadow: '0 12px 26px rgba(15, 23, 42, 0.06)',
  },
  userBubble: {
    background: '#ECFDF5',
    border: '1px solid #B7E4D3',
  },
  messageMeta: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 8,
    color: '#64748B',
    fontSize: 11,
  },
  messageMarkdown: {
    fontSize: 14,
    color: '#1E293B',
  },
  messageActions: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
    color: '#64748B',
  },
  messageActionButton: {
    width: 28,
    height: 28,
    border: '0 none',
    borderRadius: 6,
    background: 'transparent',
    color: '#64748B',
    cursor: 'pointer',
    padding: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorMarkdown: {
    color: '#B91C1C',
  },
  thinkingDots: {
    display: 'flex',
    alignItems: 'center',
    height: 32,
  },
  dotA: {
    width: 14,
    height: 14,
    borderRadius: 999,
    background: '#ffffff',
  },
  composer: {
    borderTop: '1px solid #DCE3ED',
    padding: '14px 18px 18px',
    background: '#FFFFFF',
  },
  composerTools: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  attachButton: {
    height: 30,
    border: '1px solid #B7E4D3',
    borderRadius: 6,
    background: '#ECFDF5',
    color: '#047857',
    fontSize: 12,
    fontWeight: 600,
    cursor: 'pointer',
    padding: '0 10px',
  },
  pasteHint: {
    fontSize: 12,
    color: '#64748B',
  },
  hiddenFileInput: {
    display: 'none',
  },
  pendingImage: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    border: '1px solid #D8E0EA',
    borderRadius: 8,
    background: '#F8FAFC',
    padding: 8,
    marginBottom: 10,
    maxWidth: 420,
  },
  pendingImageCompact: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    borderTop: '1px solid #E5EAF1',
    background: '#FFFFFF',
    padding: '9px 12px',
  },
  pendingImageThumb: {
    width: 54,
    height: 42,
    objectFit: 'cover',
    borderRadius: 6,
    border: '1px solid #D8E0EA',
    flexShrink: 0,
  },
  pendingImageThumbCompact: {
    width: 42,
    height: 34,
    objectFit: 'cover',
    borderRadius: 6,
    border: '1px solid #D8E0EA',
    flexShrink: 0,
  },
  pendingImageMeta: {
    minWidth: 0,
    flex: 1,
  },
  pendingImageMetaCard: {
    minWidth: 0,
    padding: '8px 12px',
  },
  pendingImageName: {
    fontSize: 12,
    fontWeight: 600,
    color: '#1E293B',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  pendingImageSize: {
    marginTop: 2,
    fontSize: 11,
    color: '#64748B',
  },
  pendingImageRemove: {
    height: 26,
    border: '1px solid #E5EAF1',
    borderRadius: 6,
    background: '#FFFFFF',
    color: '#64748B',
    fontSize: 12,
    fontWeight: 600,
    cursor: 'pointer',
  },
  promptRow: {
    display: 'flex',
    gap: 8,
    marginBottom: 10,
    overflowX: 'auto',
    paddingBottom: 2,
  },
  promptChip: {
    flexShrink: 0,
    height: 32,
    maxWidth: 320,
    border: '1px solid #D7DEE9',
    borderRadius: 16,
    background: '#F8FAFC',
    color: '#46566E',
    fontSize: 12,
    padding: '0 12px',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  inputRow: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1fr) 92px',
    gap: 10,
    alignItems: 'stretch',
  },
  textarea: {
    minHeight: 70,
    maxHeight: 148,
    resize: 'vertical',
    border: '1px solid #C9D3E2',
    borderRadius: 8,
    padding: '12px 14px',
    outline: 'none',
    fontSize: 14,
    lineHeight: 1.5,
    color: '#172033',
    background: '#FFFFFF',
    fontFamily: 'inherit',
  },
  sendButton: {
    border: '0 none',
    borderRadius: 8,
    background: '#0F766E',
    color: '#FFFFFF',
    fontWeight: 600,
    fontSize: 14,
    cursor: 'pointer',
  },
  sendButtonDisabled: {
    background: '#94A3B8',
    cursor: 'not-allowed',
  },
  inspector: {
    background: '#FFFFFF',
    borderLeft: '1px solid #DCE3ED',
    padding: '18px 16px',
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
    overflowY: 'auto',
  },
  inspectorSection: {
    borderBottom: '1px solid #E5EAF1',
    paddingBottom: 16,
  },
  inspectorSectionMuted: {
    borderTop: '1px solid #E5EAF1',
    paddingTop: 14,
    marginTop: 2,
  },
  panelTitle: {
    fontSize: 12,
    fontWeight: 600,
    color: '#334155',
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  panelTitleMuted: {
    fontSize: 12,
    fontWeight: 600,
    color: '#64748B',
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  contextGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 8,
  },
  contextCard: {
    border: '1px solid #E1E7F0',
    borderRadius: 8,
    background: '#F8FAFC',
    padding: 10,
  },
  contextLabel: {
    fontSize: 11,
    color: '#64748B',
    marginBottom: 5,
  },
  contextValue: {
    fontSize: 12,
    color: '#1E293B',
    fontWeight: 600,
  },
  contextValueOk: {
    color: '#047857',
  },
  contextValueWarn: {
    color: '#B45309',
  },
  sourceList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  sourceItem: {
    display: 'block',
    border: '1px solid #E1E7F0',
    borderRadius: 8,
    background: '#F8FAFC',
    padding: 10,
    color: '#172033',
    textDecoration: 'none',
  },
  sourceTop: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 5,
  },
  sourceTitle: {
    fontSize: 12,
    fontWeight: 600,
    color: '#1E293B',
  },
  sourceType: {
    flexShrink: 0,
    borderRadius: 999,
    background: '#E0F2FE',
    color: '#075985',
    fontSize: 10,
    fontWeight: 600,
    padding: '2px 6px',
  },
  sourceDetail: {
    display: 'block',
    fontSize: 11,
    lineHeight: 1.45,
    color: '#64748B',
  },
  securityPanel: {
    border: '1px solid #F0D49A',
    borderRadius: 8,
    background: '#FFFBEB',
    padding: 12,
  },
  securityTitle: {
    fontSize: 13,
    fontWeight: 600,
    color: '#92400E',
    marginBottom: 6,
  },
  securityText: {
    fontSize: 12,
    lineHeight: 1.55,
    color: '#5F4320',
  },
  confirmEmpty: {
    border: '1px dashed #C9D3E2',
    borderRadius: 8,
    background: '#F8FAFC',
    padding: '18px 12px',
    color: '#94A3B8',
    fontSize: 12,
    lineHeight: 1.5,
    textAlign: 'center',
  },
  confirmCard: {
    border: '1px solid #B7E4D3',
    borderRadius: 8,
    background: '#F0FDFA',
    padding: 12,
  },
  confirmTitle: {
    fontSize: 14,
    fontWeight: 600,
    color: '#134E4A',
  },
  confirmSource: {
    marginTop: 5,
    fontSize: 11,
    color: '#0F766E',
    fontWeight: 600,
  },
  confirmSummary: {
    marginTop: 8,
    fontSize: 12,
    color: '#334155',
    lineHeight: 1.5,
  },
  confirmStepList: {
    marginTop: 10,
    display: 'flex',
    flexDirection: 'column',
    gap: 7,
  },
  confirmStep: {
    display: 'flex',
    gap: 7,
    alignItems: 'flex-start',
  },
  confirmStepIndex: {
    width: 18,
    height: 18,
    borderRadius: 9,
    background: '#0F766E',
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 600,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  confirmStepText: {
    fontSize: 12,
    color: '#1E293B',
    lineHeight: 1.45,
  },
  confirmCommandList: {
    marginTop: 10,
    display: 'flex',
    flexDirection: 'column',
    gap: 5,
  },
  confirmCommand: {
    border: '1px solid #CCFBF1',
    borderRadius: 6,
    background: '#FFFFFF',
    color: '#0F766E',
    fontFamily: 'Menlo, Consolas, monospace',
    fontSize: 10,
    lineHeight: 1.45,
    padding: '5px 6px',
    wordBreak: 'break-all',
  },
  confirmActions: {
    display: 'grid',
    gridTemplateColumns: '1fr 72px',
    gap: 8,
    marginTop: 12,
  },
  confirmPrimaryButton: {
    height: 32,
    border: '0 none',
    borderRadius: 6,
    background: '#0F766E',
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 600,
    cursor: 'pointer',
  },
  confirmSecondaryButton: {
    height: 32,
    border: '1px solid #C9D3E2',
    borderRadius: 6,
    background: '#FFFFFF',
    color: '#475569',
    fontSize: 12,
    fontWeight: 600,
    cursor: 'pointer',
  },
  providerGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 8,
  },
  providerButton: {
    height: 34,
    border: '1px solid #C9D3E2',
    borderRadius: 6,
    background: '#FFFFFF',
    color: '#46566E',
    fontSize: 12,
    fontWeight: 600,
    cursor: 'pointer',
  },
  providerButtonActive: {
    background: '#172033',
    border: '1px solid #172033',
    color: '#FFFFFF',
  },
  toolList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  toolRun: {
    border: '1px solid #E1E7F0',
    borderRadius: 8,
    padding: 10,
    background: '#F8FAFC',
  },
  toolRunTop: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  toolName: {
    fontSize: 12,
    fontWeight: 600,
    color: '#1E293B',
  },
  statusPill: {
    borderRadius: 10,
    padding: '2px 7px',
    fontSize: 10,
    fontWeight: 600,
  },
  statusReady: {
    color: '#475569',
    background: '#E2E8F0',
  },
  statusRunning: {
    color: '#92400E',
    background: '#FEF3C7',
  },
  statusDone: {
    color: '#047857',
    background: '#D1FAE5',
  },
  statusError: {
    color: '#B91C1C',
    background: '#FEE2E2',
  },
  toolDetail: {
    marginTop: 6,
    fontSize: 12,
    color: '#64748B',
    lineHeight: 1.4,
  },
  toolTime: {
    marginTop: 6,
    fontSize: 11,
    color: '#94A3B8',
  },
  attachmentPreview: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    border: '1px solid #D8E0EA',
    borderRadius: 8,
    background: '#F8FAFC',
    padding: 8,
    marginBottom: 10,
    maxWidth: 360,
  },
  attachmentPreviewCompact: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    border: '1px solid #D8E0EA',
    borderRadius: 8,
    background: '#F8FAFC',
    padding: 6,
    marginBottom: 8,
  },
  attachmentImage: {
    width: 88,
    height: 64,
    objectFit: 'cover',
    borderRadius: 6,
    border: '1px solid #D8E0EA',
    flexShrink: 0,
  },
  attachmentImageCompact: {
    width: 62,
    height: 46,
    objectFit: 'cover',
    borderRadius: 6,
    border: '1px solid #D8E0EA',
    flexShrink: 0,
  },
  attachmentInfo: {
    minWidth: 0,
  },
  attachmentName: {
    fontSize: 12,
    fontWeight: 600,
    color: '#1E293B',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  attachmentSize: {
    marginTop: 3,
    fontSize: 11,
    color: '#64748B',
  },
  emptyAttachment: {
    minHeight: 120,
    border: '1px dashed #C9D3E2',
    borderRadius: 8,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#94A3B8',
    fontSize: 13,
  },
  emptyState: {
    minHeight: 180,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#94A3B8',
    border: '1px dashed #C9D3E2',
    borderRadius: 8,
    background: '#FFFFFF',
  },
  widgetTrigger: {
    position: 'fixed',
    right: 26,
    bottom: 24,
    zIndex: 9999,
    height: 52,
    border: '1px solid rgba(15, 118, 110, 0.28)',
    borderRadius: 18,
    background: '#0F766E',
    color: '#FFFFFF',
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '0 14px 0 10px',
    cursor: 'pointer',
    boxShadow: '0 18px 42px rgba(15, 23, 42, 0.24)',
  },
  widgetTriggerIcon: {
    width: 34,
    height: 34,
    borderRadius: 8,
    background: '#CCFBF1',
    color: '#134E4A',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 12,
    fontWeight: 600,
  },
  widgetTriggerText: {
    fontSize: 14,
    fontWeight: 600,
  },
  widgetTriggerBadge: {
    borderRadius: 999,
    background: 'rgba(255,255,255,0.16)',
    color: '#D1FAE5',
    fontSize: 11,
    fontWeight: 600,
    padding: '3px 7px',
  },
  widgetPanel: {
    position: 'fixed',
    right: 24,
    bottom: 24,
    zIndex: 9999,
    width: 390,
    height: 560,
    border: '1px solid #D3DCE8',
    borderRadius: 10,
    background: '#FFFFFF',
    boxShadow: '0 24px 60px rgba(15, 23, 42, 0.24)',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  widgetPanelMobile: {
    left: 12,
    right: 12,
    bottom: 12,
    width: 'auto',
    height: '72vh',
  },
  widgetHeader: {
    minHeight: 64,
    padding: '12px 14px',
    background: '#172033',
    color: '#FFFFFF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  widgetHeaderLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    minWidth: 0,
  },
  widgetLogo: {
    width: 34,
    height: 34,
    borderRadius: 8,
    background: '#2DD4BF',
    color: '#082F49',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 12,
    fontWeight: 600,
    flexShrink: 0,
  },
  widgetTitle: {
    fontSize: 15,
    fontWeight: 600,
  },
  widgetSub: {
    marginTop: 2,
    fontSize: 11,
    color: '#B6C4D8',
  },
  widgetCloseButton: {
    height: 30,
    border: '1px solid rgba(255,255,255,0.18)',
    borderRadius: 6,
    background: 'rgba(255,255,255,0.08)',
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 600,
    cursor: 'pointer',
  },
  widgetBody: {
    flex: 1,
    minHeight: 0,
    overflowY: 'auto',
    padding: 14,
    background: '#F8FAFC',
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
  },
  widgetMessage: {
    display: 'flex',
    justifyContent: 'flex-start',
  },
  widgetMessageUser: {
    display: 'flex',
    justifyContent: 'flex-end',
  },
  widgetBubble: {
    maxWidth: '88%',
    border: '1px solid #DCE3ED',
    borderRadius: 8,
    background: '#FFFFFF',
    padding: '9px 10px',
    boxShadow: '0 8px 18px rgba(15, 23, 42, 0.05)',
  },
  widgetBubbleUser: {
    background: '#ECFDF5',
    border: '1px solid #B7E4D3',
  },
  widgetMeta: {
    marginBottom: 5,
    fontSize: 10,
    color: '#64748B',
    fontWeight: 600,
  },
  widgetMarkdown: {
    fontSize: 12,
    color: '#1E293B',
  },
  widgetEmpty: {
    marginTop: 42,
    minHeight: 90,
    border: '1px dashed #C9D3E2',
    borderRadius: 8,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#94A3B8',
    fontSize: 13,
  },
  widgetSuggestions: {
    display: 'flex',
    gap: 8,
    padding: '10px 12px 0',
    background: '#FFFFFF',
  },
  widgetSuggestion: {
    height: 28,
    border: '1px solid #D7DEE9',
    borderRadius: 999,
    background: '#F8FAFC',
    color: '#46566E',
    fontSize: 12,
    fontWeight: 600,
    padding: '0 10px',
    cursor: 'pointer',
  },
  widgetComposer: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1fr) 64px',
    gap: 8,
    padding: 12,
    background: '#FFFFFF',
    borderTop: '1px solid #E5EAF1',
  },
  widgetTextarea: {
    minHeight: 54,
    maxHeight: 96,
    resize: 'vertical',
    border: '1px solid #C9D3E2',
    borderRadius: 8,
    padding: '9px 10px',
    outline: 'none',
    fontSize: 13,
    lineHeight: 1.45,
    color: '#172033',
    background: '#FFFFFF',
    fontFamily: 'inherit',
  },
  widgetSendButton: {
    border: '0 none',
    borderRadius: 8,
    background: '#0F766E',
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
  },
  mobileSessionBar: {
    display: 'flex',
    gap: 8,
    padding: '10px 12px',
    background: '#172033',
  },
  mobileNewButton: {
    width: 58,
    border: '0 none',
    borderRadius: 6,
    background: '#2DD4BF',
    color: '#082F49',
    fontWeight: 600,
  },
  mobileSessionScroll: {
    display: 'flex',
    gap: 8,
    overflowX: 'auto',
    minWidth: 0,
  },
};

styles = Object.assign({}, styles, {
  page: {
    position: 'relative',
    height: '100vh',
    minHeight: '100vh',
    background: '#050505',
    color: '#f5f5f5',
    fontFamily: CHATGPT_FONT_FAMILY,
    letterSpacing: 0,
    overflow: 'hidden',
  },
  shell: {
    height: '100vh',
    minHeight: '100vh',
    display: 'grid',
    gridTemplateColumns: '260px minmax(0, 1fr)',
    background: '#050505',
    overflow: 'hidden',
  },
  shellCollapsed: {
    gridTemplateColumns: '58px minmax(0, 1fr)',
  },
  mobileShell: {
    minHeight: '100vh',
    display: 'block',
    background: '#050505',
  },
  sidebar: {
    height: '100vh',
    minHeight: '100vh',
    background: '#080808',
    color: '#f5f5f5',
    borderRight: '1px solid #222222',
    padding: '16px 8px 0',
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
    boxSizing: 'border-box',
    overflow: 'hidden',
  },
  sidebarCollapsed: {
    padding: '16px 0',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  collapsedRail: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 16,
  },
  railBottom: {
    display: 'flex',
    justifyContent: 'center',
    width: '100%',
  },
  railIcon: {
    width: 36,
    height: 36,
    border: '0 none',
    borderRadius: 8,
    background: 'transparent',
    color: '#f4f4f4',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
  },
  brandRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 32,
    padding: '0 12px',
  },
  brandTitle: {
    fontSize: 18,
    lineHeight: 1.1,
    color: '#ffffff',
    fontWeight: 600,
  },
  sidebarToggle: {
    width: 28,
    height: 28,
    border: '0 none',
    borderRadius: 8,
    background: 'transparent',
    color: '#d7d7d7',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
  },
  sidebarSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
  },
  sidebarSectionHeader: {
    width: '100%',
    height: 32,
    border: '0 none',
    borderRadius: 8,
    background: 'transparent',
    color: '#d7d7d7',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 12px',
    fontSize: 14,
    fontWeight: 500,
    textAlign: 'left',
    cursor: 'pointer',
  },
  sidebarSectionLabel: {
    minWidth: 0,
    color: '#d7d7d7',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  sidebarSectionIcon: {
    width: 20,
    height: 20,
    color: '#a4a4a4',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  recentSection: {
    minHeight: 0,
    flex: 1,
  },
  sidebarAction: {
    width: '100%',
    height: 36,
    border: '0 none',
    borderRadius: 10,
    background: 'transparent',
    color: '#f2f2f2',
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '0 12px',
    fontSize: 14,
    textAlign: 'left',
    cursor: 'pointer',
  },
  sidebarActionActive: {
    background: '#303030',
  },
  sidebarActionIcon: {
    width: 26,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#ffffff',
    flexShrink: 0,
  },
  sidebarActionText: {
    minWidth: 0,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  projectList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
  },
  projectItemWrap: {
    position: 'relative',
  },
  projectItemRow: {
    position: 'relative',
    height: 34,
  },
  projectItem: {
    width: '100%',
    height: 34,
    border: '0 none',
    borderRadius: 10,
    background: 'transparent',
    color: '#f2f2f2',
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '0 10px',
    fontSize: 14,
    textAlign: 'left',
    cursor: 'pointer',
    paddingRight: 64,
  },
  projectItemActive: {
    background: 'rgba(255,255,255,0.10)',
  },
  projectItemText: {
    minWidth: 0,
    flex: 1,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  projectItemActions: {
    position: 'absolute',
    right: 6,
    top: '50%',
    transform: 'translateY(-50%)',
    height: 28,
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    opacity: 0,
  },
  projectItemActionsActive: {
    opacity: 1,
  },
  projectInlineAction: {
    width: 28,
    height: 28,
    border: '0 none',
    borderRadius: 8,
    background: 'transparent',
    color: '#f4f4f4',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    lineHeight: 0,
    cursor: 'pointer',
  },
  projectSessionList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
    marginTop: 4,
    padding: '0 4px 6px 36px',
  },
  projectSessionItem: {
    width: '100%',
    height: 34,
    border: '0 none',
    borderRadius: 12,
    background: 'transparent',
    color: '#f2f2f2',
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '0 12px',
    fontSize: 14,
    textAlign: 'left',
    cursor: 'pointer',
    boxSizing: 'border-box',
  },
  projectSessionItemActive: {
    background: 'rgba(255,255,255,0.10)',
    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.03)',
  },
  projectSessionDot: {
    width: 9,
    height: 9,
    borderRadius: 999,
    background: '#1683ff',
    marginLeft: 'auto',
    flexShrink: 0,
    boxShadow: '0 0 0 3px rgba(22,131,255,0.12)',
  },
  projectEmpty: {
    padding: '8px 12px',
    color: '#8c8c8c',
    fontSize: 12,
    lineHeight: 1.6,
  },
  sessionList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
    overflowY: 'auto',
    minHeight: 0,
    paddingBottom: 12,
  },
  sessionItem: {
    width: '100%',
    height: 34,
    minHeight: 34,
    border: '0 none',
    borderRadius: 10,
    background: 'transparent',
    color: '#f2f2f2',
    textAlign: 'left',
    display: 'flex',
    alignItems: 'center',
    padding: '0 12px',
    paddingRight: 40,
    cursor: 'pointer',
  },
  sessionItemActive: {
    background: '#303030',
  },
  sessionItemWrap: {
    position: 'relative',
  },
  sessionMoreButton: {
    position: 'absolute',
    right: 4,
    top: '50%',
    transform: 'translateY(-50%)',
    width: 28,
    height: 28,
    border: '0 none',
    borderRadius: 8,
    background: 'transparent',
    color: '#f4f4f4',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    lineHeight: 0,
    cursor: 'pointer',
    opacity: 0,
  },
  sessionMoreButtonActive: {
    opacity: 1,
  },
  sessionText: {
    minWidth: 0,
    display: 'block',
  },
  sessionTitle: {
    display: 'block',
    fontSize: 14,
    lineHeight: 1.25,
    fontWeight: 420,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  sessionPinnedMark: {
    marginLeft: 4,
    color: '#a7a7a7',
    fontSize: 11,
  },
  sessionActionMenu: {
    position: 'absolute',
    zIndex: 50,
    width: 230,
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 18,
    background: '#333333',
    color: '#f4f4f4',
    padding: 8,
    boxShadow: '0 18px 56px rgba(0,0,0,0.45)',
  },
  sessionActionItem: {
    width: '100%',
    minHeight: 44,
    border: '0 none',
    borderRadius: 12,
    background: 'transparent',
    color: '#f4f4f4',
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '0 12px',
    textAlign: 'left',
    fontSize: 16,
    fontWeight: 400,
    fontFamily: 'inherit',
    cursor: 'pointer',
  },
  sessionActionDanger: {
    color: '#ff5f5f',
  },
  sessionActionDivider: {
    height: 1,
    margin: '8px 0',
    background: 'rgba(255,255,255,0.12)',
  },
  sessionMoveList: {
    marginTop: 4,
    borderRadius: 12,
    background: 'rgba(0,0,0,0.1)',
    padding: 4,
  },
  searchOverlay: {
    position: 'absolute',
    inset: 0,
    zIndex: 40,
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'center',
    padding: '18vh 24px 0',
    background: 'rgba(0,0,0,0.2)',
  },
  searchDialog: {
    width: 'min(680px, calc(100vw - 80px))',
    maxHeight: '72vh',
    overflow: 'hidden',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 18,
    background: '#303030',
    color: '#f4f4f4',
    boxShadow: '0 28px 90px rgba(0,0,0,0.5)',
  },
  searchHeader: {
    height: 68,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    borderBottom: '1px solid rgba(255,255,255,0.1)',
    padding: '0 24px',
  },
  searchInput: {
    height: 40,
    minWidth: 0,
    flex: 1,
    border: '0 none',
    outline: 'none',
    background: 'transparent',
    color: '#f4f4f4',
    fontSize: 18,
    fontFamily: 'inherit',
  },
  searchClose: {
    width: 36,
    height: 36,
    border: '0 none',
    borderRadius: 8,
    background: 'transparent',
    color: '#b8b8b8',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
  },
  searchBody: {
    maxHeight: 'calc(72vh - 68px)',
    overflowY: 'auto',
    padding: '16px 20px',
  },
  searchNewItem: {
    width: '100%',
    height: 48,
    border: '0 none',
    borderRadius: 12,
    background: 'transparent',
    color: '#f4f4f4',
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '0 12px',
    textAlign: 'left',
    fontSize: 16,
    fontFamily: 'inherit',
    cursor: 'pointer',
  },
  searchSectionLabel: {
    padding: '16px 12px 8px',
    color: '#a7a7a7',
    fontSize: 14,
  },
  searchResultItem: {
    width: '100%',
    height: 48,
    border: '0 none',
    borderRadius: 12,
    background: 'transparent',
    color: '#f4f4f4',
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '0 12px',
    textAlign: 'left',
    fontSize: 16,
    fontFamily: 'inherit',
    cursor: 'pointer',
  },
  searchResultIcon: {
    width: 24,
    height: 24,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#f4f4f4',
    flexShrink: 0,
  },
  searchResultTitle: {
    minWidth: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  searchEmpty: {
    padding: '40px 12px',
    color: '#a7a7a7',
    fontSize: 14,
    textAlign: 'center',
  },
  actionDialogOverlay: {
    position: 'absolute',
    inset: 0,
    zIndex: 70,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0 24px',
    background: 'rgba(0,0,0,0.35)',
  },
  actionDialog: {
    width: 'min(420px, calc(100vw - 48px))',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 18,
    background: '#303030',
    color: '#f4f4f4',
    padding: 16,
    boxShadow: '0 28px 90px rgba(0,0,0,0.5)',
  },
  actionDialogTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 500,
  },
  actionDialogMessage: {
    marginTop: 8,
    color: '#cfcfcf',
    fontSize: 14,
    lineHeight: 1.6,
  },
  actionDialogInput: {
    marginTop: 16,
    width: '100%',
    height: 44,
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 12,
    background: '#252525',
    color: '#f4f4f4',
    padding: '0 12px',
    outline: 'none',
    fontSize: 14,
    fontFamily: 'inherit',
    boxSizing: 'border-box',
  },
  actionDialogActions: {
    marginTop: 16,
    display: 'flex',
    justifyContent: 'flex-end',
    gap: 8,
  },
  actionDialogSecondary: {
    height: 36,
    border: '0 none',
    borderRadius: 12,
    background: 'rgba(255,255,255,0.1)',
    color: '#f4f4f4',
    padding: '0 16px',
    fontSize: 14,
    cursor: 'pointer',
  },
  actionDialogPrimary: {
    height: 36,
    border: '0 none',
    borderRadius: 12,
    background: '#f4f4f4',
    color: '#111111',
    padding: '0 16px',
    fontSize: 14,
    fontWeight: 500,
    cursor: 'pointer',
  },
  actionDialogDanger: {
    background: '#ff5f5f',
    color: '#ffffff',
  },
  actionDialogHiddenFocus: {
    position: 'absolute',
    width: 1,
    height: 1,
    opacity: 0,
    pointerEvents: 'none',
    padding: 0,
  },
  userBar: {
    height: 56,
    borderTop: '1px solid #1f1f1f',
    display: 'grid',
    gridTemplateColumns: '32px minmax(0, 1fr) 28px',
    alignItems: 'center',
    gap: 10,
    padding: '0 12px',
    flexShrink: 0,
  },
  userAvatarMini: {
    width: 28,
    height: 28,
    borderRadius: 999,
    background: '#16b79e',
    color: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 11,
    fontWeight: 600,
    flexShrink: 0,
  },
  userAvatarImage: {
    width: 28,
    height: 28,
    borderRadius: 999,
    objectFit: 'cover',
    flexShrink: 0,
  },
  userMeta: {
    minWidth: 0,
  },
  userName: {
    color: '#ffffff',
    fontSize: 14,
    lineHeight: 1.2,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  storeIcon: {
    color: '#cfcfcf',
    fontSize: 18,
    textAlign: 'center',
  },
  chatPanel: {
    minWidth: 0,
    height: '100vh',
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    background: '#050505',
    position: 'relative',
  },
  chatHeader: {
    minHeight: 56,
    padding: '0 20px',
    borderBottom: '0 none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
    background: '#050505',
    flexShrink: 0,
  },
  headerTitle: {
    minHeight: 20,
    color: '#f5f5f5',
    fontSize: 14,
    fontWeight: 500,
    minWidth: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  headerProject: {
    minWidth: 0,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    color: '#ffffff',
  },
  headerProjectIcon: {
    width: 32,
    height: 32,
    color: '#f4f4f4',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  headerProjectTitle: {
    minWidth: 0,
    maxWidth: 520,
    color: '#ffffff',
    fontSize: 24,
    lineHeight: 1.2,
    fontWeight: 500,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  headerActions: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    marginLeft: 'auto',
  },
  shareButton: {
    height: 32,
    border: '0 none',
    borderRadius: 8,
    background: 'transparent',
    color: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
  },
  iconButton: {
    width: 32,
    height: 32,
    border: '0 none',
    borderRadius: 8,
    background: 'transparent',
    color: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
  },
  bridgeButton: {
    minWidth: 132,
    height: 32,
    border: '1px solid #2f2f2f',
    borderRadius: 8,
    background: '#151515',
    color: '#f5f5f5',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: '0 10px',
    fontSize: 12,
    fontWeight: 600,
    cursor: 'pointer',
    boxSizing: 'border-box',
  },
  bridgeButtonActive: {
    border: '1px solid #16B79E',
    background: '#0B2E29',
    color: '#D1FAE5',
  },
  bridgeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    flexShrink: 0,
  },
  bridgeDotOk: {
    background: '#2DD4BF',
    boxShadow: '0 0 0 3px rgba(45, 212, 191, 0.16)',
  },
  bridgeDotWarn: {
    background: '#F59E0B',
    boxShadow: '0 0 0 3px rgba(245, 158, 11, 0.16)',
  },
  bridgeDotOff: {
    background: '#737373',
  },
  bridgeButtonText: {
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  bridgeButtonChevron: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    color: 'currentColor',
    opacity: 0.78,
  },
  bridgePanel: {
    position: 'absolute',
    top: 56,
    right: 16,
    zIndex: 30,
    width: 384,
    maxWidth: 'calc(100vw - 32px)',
    border: '1px solid #2f2f2f',
    borderRadius: 10,
    background: '#171717',
    color: '#f5f5f5',
    boxShadow: '0 24px 60px rgba(0, 0, 0, 0.42)',
    padding: 14,
    boxSizing: 'border-box',
  },
  bridgePanelMobile: {
    top: 62,
    left: 12,
    right: 12,
    width: 'auto',
    maxWidth: 'none',
  },
  bridgePanelHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 12,
  },
  bridgePanelTitle: {
    fontSize: 14,
    fontWeight: 650,
    lineHeight: 1.3,
  },
  bridgePanelSub: {
    marginTop: 4,
    fontSize: 12,
    color: '#bcbcbc',
    lineHeight: 1.4,
  },
  bridgeCloseButton: {
    height: 28,
    border: '1px solid #343434',
    borderRadius: 7,
    background: '#242424',
    color: '#e7e7e7',
    fontSize: 12,
    fontWeight: 600,
    cursor: 'pointer',
    flexShrink: 0,
  },
  bridgeStatusGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 8,
    marginBottom: 10,
  },
  bridgeStatusItem: {
    border: '1px solid #2f2f2f',
    borderRadius: 8,
    background: '#101010',
    padding: '9px 10px',
  },
  bridgeStatusLabel: {
    display: 'block',
    marginBottom: 4,
    fontSize: 11,
    color: '#a3a3a3',
  },
  bridgeStatusValue: {
    display: 'block',
    fontSize: 13,
    color: '#ffffff',
  },
  bridgeBaseUrl: {
    minHeight: 32,
    border: '1px solid #2f2f2f',
    borderRadius: 8,
    background: '#0d0d0d',
    color: '#d4d4d4',
    fontSize: 12,
    lineHeight: '32px',
    padding: '0 10px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    boxSizing: 'border-box',
  },
  bridgeCommandBox: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1fr) 58px',
    gap: 8,
    alignItems: 'center',
  },
  bridgeCommand: {
    minHeight: 32,
    border: '1px solid #2f2f2f',
    borderRadius: 8,
    background: '#0d0d0d',
    color: '#d4d4d4',
    fontFamily: 'Menlo, Consolas, monospace',
    fontSize: 11,
    lineHeight: '32px',
    padding: '0 10px',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    boxSizing: 'border-box',
  },
  bridgeSmallButton: {
    height: 32,
    border: '1px solid #343434',
    borderRadius: 8,
    background: '#242424',
    color: '#f5f5f5',
    fontSize: 12,
    fontWeight: 600,
    cursor: 'pointer',
  },
  bridgeHelpText: {
    marginTop: 8,
    color: '#a3a3a3',
    fontSize: 12,
    lineHeight: 1.55,
  },
  bridgeEnvSection: {
    marginTop: 12,
    border: '1px solid #2f2f2f',
    borderRadius: 8,
    background: '#101010',
    padding: 10,
  },
  bridgeEnvHeader: {
    marginBottom: 8,
    color: '#f5f5f5',
    fontSize: 12,
    fontWeight: 650,
  },
  bridgeEnvGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 8,
  },
  bridgeEnvItem: {
    minWidth: 0,
  },
  bridgeEnvLabel: {
    display: 'block',
    marginBottom: 3,
    color: '#8f8f8f',
    fontSize: 11,
    lineHeight: 1.3,
  },
  bridgeEnvValue: {
    display: 'block',
    color: '#e7e7e7',
    fontSize: 11,
    lineHeight: 1.4,
    fontWeight: 600,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  bridgeActionRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(92px, 1fr))',
    gap: 8,
    marginTop: 12,
  },
  bridgeActionButton: {
    height: 34,
    border: '1px solid #3a3a3a',
    borderRadius: 8,
    background: '#ffffff',
    color: '#171717',
    fontSize: 12,
    fontWeight: 650,
    cursor: 'pointer',
  },
  bridgeQrBox: {
    marginTop: 12,
    border: '1px solid #2f2f2f',
    borderRadius: 8,
    background: '#101010',
    padding: 10,
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1fr) 76px',
    gap: 8,
    alignItems: 'center',
  },
  bridgeQrTitle: {
    fontSize: 12,
    color: '#f5f5f5',
    fontWeight: 650,
    gridColumn: '1 / -1',
  },
  bridgeQrLink: {
    minWidth: 0,
    color: '#5EEAD4',
    fontSize: 12,
    textDecoration: 'underline',
    textUnderlineOffset: 3,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  bridgeOrgList: {
    marginTop: 12,
    border: '1px solid #2f2f2f',
    borderRadius: 8,
    background: '#101010',
    padding: 10,
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  bridgeOrgButton: {
    minHeight: 32,
    border: '1px solid #343434',
    borderRadius: 8,
    background: '#242424',
    color: '#f5f5f5',
    fontSize: 12,
    fontWeight: 600,
    cursor: 'pointer',
    textAlign: 'left',
    padding: '0 10px',
  },
  messageList: {
    flex: 1,
    minHeight: 0,
    overflowY: 'auto',
    padding: '64px 24px 24px',
    display: 'flex',
    flexDirection: 'column',
    gap: 18,
    alignItems: 'center',
  },
  historyLoader: {
    width: '100%',
    maxWidth: 840,
    textAlign: 'center',
    color: '#8f8f8f',
    fontSize: 12,
    lineHeight: '28px',
    padding: '2px 0 8px',
  },
  messageListEmpty: {
    justifyContent: 'center',
    paddingTop: 0,
    paddingBottom: 0,
  },
  emptyStage: {
    flex: 1,
    minHeight: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0 24px',
    boxSizing: 'border-box',
    transform: 'translateY(-96px)',
  },
  emptyHero: {
    width: '100%',
    minHeight: 'auto',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transform: 'none',
  },
  emptyTitle: {
    color: '#ffffff',
    fontSize: 24,
    lineHeight: 1.25,
    fontWeight: 420,
    textAlign: 'center',
  },
  projectHero: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    color: '#ffffff',
    maxWidth: 'min(640px, calc(100vw - 96px))',
  },
  projectHeroIcon: {
    width: 32,
    height: 32,
    color: '#f4f4f4',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  projectHeroTitle: {
    minWidth: 0,
    maxWidth: 560,
    color: '#ffffff',
    fontSize: 24,
    lineHeight: 1.25,
    fontWeight: 500,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  messageRow: {
    width: '100%',
    maxWidth: 840,
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
  },
  messageRowUser: {
    justifyContent: 'flex-end',
  },
  messageBubble: {
    width: 'min(100%, 840px)',
    background: 'transparent',
    border: '0 none',
    borderRadius: 0,
    padding: '0 4px',
    minWidth: 0,
    maxWidth: 840,
    boxShadow: 'none',
  },
  userBubble: {
    width: 'auto',
    maxWidth: 620,
    background: '#2f2f2f',
    border: '0 none',
    borderRadius: 18,
    padding: '10px 16px',
  },
  messageMarkdown: {
    fontSize: 14,
    color: '#f4f4f4',
  },
  errorMarkdown: {
    color: '#ffb4a9',
  },
  messageActions: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
    color: '#a7a7a7',
  },
  messageActionButton: {
    width: 28,
    height: 28,
    border: '0 none',
    borderRadius: 6,
    background: 'transparent',
    color: '#a7a7a7',
    cursor: 'pointer',
    padding: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  thinkingDots: {
    display: 'flex',
    alignItems: 'center',
    height: 32,
  },
  dotA: {
    width: 14,
    height: 14,
    borderRadius: 999,
    background: '#ffffff',
  },
  composer: {
    width: 'min(840px, calc(100% - 48px))',
    margin: '0 auto 32px',
    background: 'transparent',
    borderTop: '0 none',
    flexShrink: 0,
  },
  composerCentered: {
    width: 'min(760px, calc(100% - 48px))',
    margin: '56px auto 0',
  },
  inputRow: {
    position: 'relative',
    minHeight: 92,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch',
    gap: 8,
    border: '1px solid rgba(255,255,255,0.05)',
    borderRadius: 26,
    background: '#2f2f2f',
    padding: '14px 16px 10px',
    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04), 0 20px 52px rgba(0,0,0,0.28)',
  },
  composerDisclaimer: {
    maxWidth: 'calc(100% - 24px)',
    margin: '10px auto 0',
    color: '#8f8f8f',
    fontSize: 11,
    lineHeight: '20px',
    textAlign: 'center',
  },
  attachButton: {
    width: 36,
    height: 36,
    border: '0 none',
    borderRadius: 999,
    background: 'transparent',
    color: '#f5f5f5',
    fontSize: 20,
    lineHeight: 1,
    fontWeight: 260,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  attachButtonOpen: {
    background: '#424242',
  },
  attachMenu: {
    position: 'absolute',
    left: 12,
    bottom: 54,
    zIndex: 20,
    width: 286,
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 22,
    background: '#333333',
    color: '#f4f4f4',
    padding: 8,
    boxShadow: '0 18px 56px rgba(0,0,0,0.45)',
  },
  attachMenuItem: {
    width: '100%',
    height: 48,
    border: '0 none',
    borderRadius: 14,
    background: 'transparent',
    color: '#f4f4f4',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    padding: '0 12px',
    cursor: 'pointer',
    textAlign: 'left',
    fontSize: 16,
    fontFamily: 'inherit',
  },
  attachMenuItemActive: {
    background: 'rgba(255,255,255,0.1)',
  },
  attachMenuLeft: {
    minWidth: 0,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  },
  attachMenuIcon: {
    width: 24,
    height: 24,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    color: '#f4f4f4',
  },
  attachMenuLabel: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  attachMenuShortcut: {
    flexShrink: 0,
    color: '#bcbcbc',
    fontSize: 14,
  },
  attachMenuDivider: {
    height: 1,
    margin: '8px 0',
    background: 'rgba(255,255,255,0.12)',
  },
  textarea: {
    flex: '0 0 auto',
    minWidth: 0,
    minHeight: 28,
    maxHeight: 168,
    resize: 'none',
    overflow: 'hidden',
    border: '0 none',
    borderRadius: 0,
    padding: 0,
    outline: 'none',
    fontSize: 16,
    lineHeight: '28px',
    color: '#f7f7f7',
    background: 'transparent',
    fontFamily: 'inherit',
  },
  composerBottom: {
    width: '100%',
    height: 40,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    flexShrink: 0,
  },
  composerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    height: 32,
    flexShrink: 0,
  },
  modelSelector: {
    height: 32,
    border: '0 none',
    borderRadius: 8,
    background: 'transparent',
    color: '#bcbcbc',
    fontSize: 14,
    lineHeight: '32px',
    cursor: 'pointer',
    padding: 0,
    display: 'flex',
    alignItems: 'center',
    gap: 4,
  },
  micButton: {
    width: 32,
    height: 32,
    border: '0 none',
    borderRadius: 999,
    background: 'transparent',
    color: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
  },
  sendButton: {
    width: 40,
    height: 40,
    border: '0 none',
    borderRadius: 999,
    background: '#f5f5f5',
    color: '#111111',
    fontWeight: 600,
    fontSize: 20,
    lineHeight: 1,
    cursor: 'pointer',
    flexShrink: 0,
    padding: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    background: '#666666',
    color: '#d6d6d6',
    cursor: 'not-allowed',
  },
  pendingImage: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    width: 184,
    maxWidth: '64%',
    border: '1px solid rgba(255,255,255,0.15)',
    borderRadius: 18,
    background: '#f7f7f7',
    color: '#111111',
    margin: '0 0 4px',
    boxShadow: '0 8px 28px rgba(0,0,0,0.2)',
  },
  pendingImageCompact: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    borderTop: '1px solid #333333',
    background: '#151515',
    padding: '9px 12px',
  },
  pendingImageThumb: {
    width: '100%',
    height: 132,
    objectFit: 'cover',
    flexShrink: 0,
  },
  pendingImageThumbCompact: {
    width: 42,
    height: 34,
    objectFit: 'cover',
    borderRadius: 8,
    border: '1px solid #4a4a4a',
    flexShrink: 0,
  },
  pendingImageName: {
    fontSize: 12,
    fontWeight: 500,
    color: '#202020',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  pendingImageNameCompact: {
    fontSize: 12,
    fontWeight: 500,
    color: '#f4f4f4',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  pendingImageSize: {
    marginTop: 2,
    fontSize: 11,
    color: '#6f6f6f',
  },
  pendingImageSizeCompact: {
    marginTop: 2,
    fontSize: 11,
    color: '#a4a4a4',
  },
  pendingImageRemove: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    border: '0 none',
    borderRadius: 999,
    background: 'rgba(255,255,255,0.9)',
    color: '#171717',
    fontSize: 20,
    lineHeight: 1,
    padding: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 2px 8px rgba(0,0,0,0.18)',
    cursor: 'pointer',
  },
  pendingImageRemoveCompact: {
    height: 26,
    border: '1px solid #4a4a4a',
    borderRadius: 8,
    background: '#2a2a2a',
    color: '#f4f4f4',
    fontSize: 12,
    fontWeight: 500,
    cursor: 'pointer',
  },
  hiddenFileInput: {
    display: 'none',
  },
  attachmentPreview: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    border: '1px solid #414141',
    borderRadius: 12,
    background: '#1d1d1d',
    padding: 8,
    marginBottom: 12,
    maxWidth: 360,
  },
  attachmentPreviewCompact: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    border: '1px solid #414141',
    borderRadius: 10,
    background: '#1d1d1d',
    padding: 6,
    marginBottom: 8,
  },
  attachmentImage: {
    width: 88,
    height: 64,
    objectFit: 'cover',
    borderRadius: 8,
    border: '1px solid #4a4a4a',
    flexShrink: 0,
  },
  attachmentImageCompact: {
    width: 62,
    height: 46,
    objectFit: 'cover',
    borderRadius: 8,
    border: '1px solid #4a4a4a',
    flexShrink: 0,
  },
  attachmentInfo: {
    minWidth: 0,
  },
  attachmentName: {
    fontSize: 12,
    fontWeight: 500,
    color: '#f4f4f4',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  attachmentSize: {
    marginTop: 3,
    fontSize: 11,
    color: '#a4a4a4',
  },
  inlineConfirmCard: {
    width: 'min(100%, 520px)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: 18,
    background: '#1f1f1f',
    padding: 14,
    boxShadow: '0 12px 34px rgba(0,0,0,0.24)',
  },
  inlineConfirmHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    minWidth: 0,
  },
  inlineConfirmBadge: {
    flexShrink: 0,
    borderRadius: 999,
    background: 'rgba(45,212,191,0.16)',
    color: '#5eead4',
    fontSize: 11,
    fontWeight: 650,
    padding: '3px 8px',
  },
  inlineConfirmTitle: {
    minWidth: 0,
    color: '#f4f4f4',
    fontSize: 14,
    fontWeight: 650,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  inlineConfirmSource: {
    marginTop: 8,
    color: '#f4f4f4',
    fontSize: 15,
    fontWeight: 650,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  inlineConfirmSummary: {
    marginTop: 6,
    color: '#c9c9c9',
    fontSize: 12,
    lineHeight: 1.5,
  },
  inlineConfirmNote: {
    marginTop: 8,
    color: '#8f8f8f',
    fontSize: 11,
    lineHeight: 1.45,
  },
  inlineConfirmActions: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
  },
  inlineConfirmPrimaryButton: {
    height: 34,
    border: '0 none',
    borderRadius: 999,
    background: '#f4f4f4',
    color: '#111111',
    fontSize: 13,
    fontWeight: 650,
    cursor: 'pointer',
    padding: '0 16px',
  },
  inlineConfirmPrimaryButtonDisabled: {
    background: '#4a4a4a',
    color: '#bcbcbc',
    cursor: 'not-allowed',
  },
  inlineConfirmSecondaryButton: {
    height: 34,
    border: '1px solid #3a3a3a',
    borderRadius: 999,
    background: '#242424',
    color: '#e7e7e7',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    padding: '0 14px',
  },
  confirmEmpty: {
    border: '1px dashed #3a3a3a',
    borderRadius: 14,
    background: '#171717',
    padding: '18px 12px',
    color: '#8f8f8f',
    fontSize: 12,
    lineHeight: 1.5,
    textAlign: 'center',
  },
  confirmCard: {
    border: '1px solid rgba(45,212,191,0.42)',
    borderRadius: 18,
    background: 'linear-gradient(180deg, rgba(20,83,75,0.28), rgba(18,18,18,0.96))',
    padding: 16,
    boxShadow: '0 16px 46px rgba(0,0,0,0.32), inset 0 1px 0 rgba(255,255,255,0.05)',
  },
  confirmTitle: {
    fontSize: 15,
    fontWeight: 650,
    color: '#f4f4f4',
  },
  confirmSource: {
    marginTop: 6,
    fontSize: 12,
    color: '#5eead4',
    fontWeight: 600,
  },
  confirmSummary: {
    marginTop: 9,
    fontSize: 13,
    color: '#d7d7d7',
    lineHeight: 1.55,
  },
  confirmStepList: {
    marginTop: 12,
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  confirmStep: {
    display: 'flex',
    gap: 8,
    alignItems: 'flex-start',
  },
  confirmStepIndex: {
    width: 19,
    height: 19,
    borderRadius: 999,
    background: '#14b8a6',
    color: '#06201d',
    fontSize: 10,
    fontWeight: 700,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  confirmStepText: {
    fontSize: 12,
    color: '#ededed',
    lineHeight: 1.5,
  },
  confirmCommandList: {
    marginTop: 12,
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  },
  confirmCommand: {
    border: '1px solid rgba(255,255,255,0.09)',
    borderRadius: 9,
    background: '#111111',
    color: '#c7fff5',
    fontFamily: 'Menlo, Consolas, monospace',
    fontSize: 11,
    lineHeight: 1.45,
    padding: '7px 8px',
    wordBreak: 'break-all',
  },
  confirmActions: {
    display: 'grid',
    gridTemplateColumns: '1fr 84px',
    gap: 8,
    marginTop: 14,
  },
  confirmPrimaryButton: {
    height: 36,
    border: '0 none',
    borderRadius: 10,
    background: '#f4f4f4',
    color: '#111111',
    fontSize: 13,
    fontWeight: 650,
    cursor: 'pointer',
  },
  confirmPrimaryButtonDisabled: {
    background: '#4a4a4a',
    color: '#bcbcbc',
    cursor: 'not-allowed',
  },
  confirmSecondaryButton: {
    height: 36,
    border: '1px solid #3a3a3a',
    borderRadius: 10,
    background: '#242424',
    color: '#e7e7e7',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
  },
  mobileSessionBar: {
    display: 'flex',
    gap: 8,
    padding: '10px 12px',
    background: '#080808',
    borderBottom: '1px solid #222222',
  },
  mobileNewButton: {
    width: 46,
    height: 42,
    border: '0 none',
    borderRadius: 10,
    background: '#303030',
    color: '#ffffff',
    fontWeight: 500,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  mobileSessionScroll: {
    display: 'flex',
    gap: 8,
    overflowX: 'auto',
    minWidth: 0,
  },
});
