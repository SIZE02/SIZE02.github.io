(() => {
  "use strict";

  const OWNER = "SIZE02";
  const REPO = "SIZE02.github.io";
  const BRANCH = "main";
  const POSTS_DIR = "source/_posts";
  const MEDIA_DIR = "source/img/uploads";
  const MEDIA_URL = "/img/uploads";
  const API_ROOT = "https://api.github.com";
  const TOKEN_KEY = "size02-blog-admin-token";
  const KNOWN_FIELDS = new Set([
    "title",
    "date",
    "updated",
    "description",
    "tags",
    "categories",
    "cover",
    "random",
  ]);

  const $ = (selector) => document.querySelector(selector);
  const ui = {
    form: $("#editorForm"),
    emptyState: $("#emptyState"),
    editor: $("#editorForm"),
    editorMode: $("#editorMode"),
    editorHeading: $("#editorHeading"),
    editorPath: $("#editorPath"),
    title: $("#titleInput"),
    slug: $("#slugInput"),
    slugField: $("#slugField"),
    date: $("#dateInput"),
    updated: $("#updatedInput"),
    categories: $("#categoriesInput"),
    tags: $("#tagsInput"),
    description: $("#descriptionInput"),
    cover: $("#coverInput"),
    random: $("#randomInput"),
    body: $("#bodyInput"),
    bodyWrap: $("#editorBody"),
    previewPane: $("#previewPane"),
    previewBtn: $("#previewBtn"),
    wordCount: $("#wordCount"),
    saveStatus: $("#saveStatus"),
    saveBtn: $("#saveBtn"),
    saveBtnBottom: $("#saveBtnBottom"),
    deleteBtn: $("#deleteBtn"),
    viewPostLink: $("#viewPostLink"),
    postList: $("#postList"),
    postCount: $("#postCount"),
    syncState: $("#syncState"),
    search: $("#searchInput"),
    connectionBadge: $("#connectionBadge"),
    tokenDialog: $("#tokenDialog"),
    tokenForm: $("#tokenForm"),
    tokenInput: $("#tokenInput"),
    tokenError: $("#tokenError"),
    connectBtn: $("#connectBtn"),
    clearTokenBtn: $("#clearTokenBtn"),
    imageFileInput: $("#imageFileInput"),
    toast: $("#toast"),
    sidebar: $("#sidebar"),
  };

  const state = {
    token: localStorage.getItem(TOKEN_KEY) || "",
    user: null,
    posts: [],
    currentPath: null,
    currentPost: null,
    extra: {},
    isNew: false,
    dirty: false,
    loadingForm: false,
    saving: false,
    previewOpen: false,
    slugTouched: false,
    imageTarget: null,
    toastTimer: null,
    renderQueued: false,
  };

  class HttpError extends Error {
    constructor(message, status, data) {
      super(message);
      this.status = status;
      this.data = data;
    }
  }

  function escapeHtml(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function showToast(message, type = "") {
    clearTimeout(state.toastTimer);
    ui.toast.textContent = message;
    ui.toast.className = `toast show ${type}`.trim();
    state.toastTimer = setTimeout(() => {
      ui.toast.className = "toast";
    }, 3600);
  }

  function setSaveStatus(message, type = "") {
    ui.saveStatus.textContent = message;
    ui.saveStatus.className = `save-status ${type}`.trim();
  }

  function setSyncState(message) {
    ui.syncState.textContent = message;
  }

  function setConnection() {
    if (state.user) {
      ui.connectionBadge.textContent = `已连接 @${state.user.login}`;
      ui.connectionBadge.classList.add("connected");
    } else {
      ui.connectionBadge.textContent = "未连接";
      ui.connectionBadge.classList.remove("connected");
    }
  }

  function encodePath(path) {
    return path.split("/").map(encodeURIComponent).join("/");
  }

  function contentsPath(path) {
    return `/repos/${OWNER}/${REPO}/contents/${encodePath(path)}?ref=${BRANCH}`;
  }

  async function githubApi(path, options = {}, token = state.token) {
    const headers = {
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      ...(options.headers || {}),
    };
    if (token) headers.Authorization = `Bearer ${token}`;
    const response = await fetch(`${API_ROOT}${path}`, {
      ...options,
      headers,
      cache: "no-store",
    });
    let data = null;
    const contentType = response.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      data = await response.json();
    }
    if (!response.ok) {
      const message = (data && data.message) || `GitHub API 请求失败（${response.status}）`;
      throw new HttpError(message, response.status, data);
    }
    return data;
  }

  async function validateToken(token) {
    const user = await githubApi("/user", {}, token);
    await githubApi(`/repos/${OWNER}/${REPO}`, {}, token);
    return user;
  }

  function decodeBase64(content) {
    const binary = atob(String(content || "").replace(/\s/g, ""));
    const bytes = new Uint8Array(binary.length);
    for (let index = 0; index < binary.length; index += 1) {
      bytes[index] = binary.charCodeAt(index);
    }
    return new TextDecoder().decode(bytes);
  }

  function bytesToBase64(bytes) {
    let binary = "";
    const chunkSize = 0x8000;
    for (let index = 0; index < bytes.length; index += chunkSize) {
      binary += String.fromCharCode.apply(null, bytes.subarray(index, index + chunkSize));
    }
    return btoa(binary);
  }

  function encodeText(text) {
    return bytesToBase64(new TextEncoder().encode(text));
  }

  function toDateString(value) {
    if (value instanceof Date && !Number.isNaN(value.getTime())) {
      const pad = (number) => String(number).padStart(2, "0");
      return (
        `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())} ` +
        `${pad(value.getHours())}:${pad(value.getMinutes())}:${pad(value.getSeconds())}`
      );
    }
    return String(value == null ? "" : value);
  }

  function normalizeYamlValue(value) {
    if (value instanceof Date) return toDateString(value);
    if (Array.isArray(value)) return value.map(normalizeYamlValue);
    if (value && typeof value === "object") {
      return Object.fromEntries(
        Object.entries(value).map(([key, item]) => [key, normalizeYamlValue(item)])
      );
    }
    return value;
  }

  function normalizeList(value) {
    if (Array.isArray(value)) {
      return value.map((item) => String(item).trim()).filter(Boolean);
    }
    if (typeof value === "string") {
      return value
        .split(/[,，]/)
        .map((item) => item.trim())
        .filter(Boolean);
    }
    return [];
  }

  function parseMarkdown(text) {
    const source = String(text || "").replace(/\r\n/g, "\n");
    const match = /^---\n([\s\S]*?)\n---\n?/.exec(source);
    let data = {};
    let body = source;
    if (match) {
      try {
        data = window.jsyaml
          ? window.jsyaml.load(match[1], { schema: window.jsyaml.CORE_SCHEMA }) || {}
          : {};
      } catch (error) {
        data = {};
      }
      body = source.slice(match[0].length).replace(/^\n+/, "");
    }
    const extra = {};
    Object.entries(data).forEach(([key, value]) => {
      if (!KNOWN_FIELDS.has(key)) extra[key] = normalizeYamlValue(value);
    });
    return {
      data,
      body,
      extra,
      title: String(data.title || ""),
      date: toDateString(data.date),
      updated: toDateString(data.updated),
      description: String(data.description || ""),
      cover: String(data.cover || ""),
      tags: normalizeList(data.tags),
      categories: normalizeList(data.categories),
      random: data.random !== false,
    };
  }

  function nowString() {
    return toDateString(new Date());
  }

  function todayPathParts(dateString) {
    const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(dateString || ""));
    return match ? { year: match[1], month: match[2], day: match[3] } : null;
  }

  function postUrl(post) {
    if (!post || !post.name) return "";
    const date = todayPathParts(post.date);
    if (!date) return "";
    const slug = post.name.replace(/\.md$/i, "");
    return `https://size02.github.io/${date.year}/${date.month}/${date.day}/${encodeURIComponent(slug)}/`;
  }

  function sanitizeSlug(value) {
    const clean = String(value || "")
      .trim()
      .toLowerCase()
      .replace(/\.md$/i, "")
      .replace(/[^\w\u4e00-\u9fa5-]+/g, "-")
      .replace(/^-+|-+$/g, "");
    return clean || `post-${Date.now()}`;
  }

  function serializeFrontmatter(values) {
    const data = {
      title: values.title,
      date: values.date || nowString(),
      updated: nowString(),
    };
    if (values.description) data.description = values.description;
    if (values.tags.length) data.tags = values.tags;
    if (values.categories.length) data.categories = values.categories;
    if (values.cover) data.cover = values.cover;
    if (!values.random) data.random = false;
    Object.entries(state.extra).forEach(([key, value]) => {
      if (!KNOWN_FIELDS.has(key)) data[key] = normalizeYamlValue(value);
    });
    const yaml = window.jsyaml
      ? window.jsyaml.dump(data, {
          lineWidth: -1,
          noRefs: true,
          sortKeys: false,
          skipInvalid: true,
          quotingType: '"',
          forceQuotes: false,
        })
      : "title: " + JSON.stringify(values.title);
    return `---\n${yaml}---\n\n${values.body.trimEnd()}\n`;
  }

  function updateEditorHeading() {
    const title = ui.title.value.trim() || "未命名文章";
    ui.editorHeading.textContent = title;
  }

  function updateWordCount() {
    const count = ui.body.value.replace(/\s/g, "").length;
    ui.wordCount.textContent = `${count} 字`;
  }

  function setDirty(value) {
    state.dirty = value;
    if (value) {
      setSaveStatus("有未保存修改", "dirty");
    } else if (state.currentPath) {
      setSaveStatus("已同步", "");
    } else {
      setSaveStatus("等待编辑", "");
    }
  }

  function getFormValues() {
    return {
      title: ui.title.value.trim(),
      date: ui.date.value.trim(),
      description: ui.description.value.trim(),
      categories: normalizeList(ui.categories.value),
      tags: normalizeList(ui.tags.value),
      cover: ui.cover.value.trim(),
      random: ui.random.checked,
      body: ui.body.value,
    };
  }

  function populateForm(parsed, post) {
    state.loadingForm = true;
    state.extra = parsed.extra || {};
    ui.title.value = parsed.title;
    ui.slug.value = post.name.replace(/\.md$/i, "");
    ui.slugField.classList.add("hidden");
    ui.date.value = parsed.date || nowString();
    ui.updated.value = parsed.updated || "";
    ui.categories.value = parsed.categories.join(", ");
    ui.tags.value = parsed.tags.join(", ");
    ui.description.value = parsed.description;
    ui.cover.value = parsed.cover;
    ui.random.checked = parsed.random;
    ui.body.value = parsed.body;
    ui.editorMode.textContent = "编辑文章";
    ui.editorPath.textContent = post.path;
    ui.deleteBtn.classList.remove("hidden");
    const url = postUrl(post);
    ui.viewPostLink.href = url || "#";
    ui.viewPostLink.classList.toggle("hidden", !url);
    updateEditorHeading();
    updateWordCount();
    renderPreview();
    state.loadingForm = false;
    setDirty(false);
  }

  function resetEditor() {
    state.loadingForm = true;
    state.extra = {};
    state.currentPath = null;
    state.currentPost = null;
    state.isNew = true;
    state.slugTouched = false;
    ui.form.reset();
    ui.slugField.classList.remove("hidden");
    ui.slug.value = "";
    ui.date.value = nowString();
    ui.updated.value = "";
    ui.random.checked = true;
    ui.body.value = "";
    ui.editorMode.textContent = "新建文章";
    ui.editorPath.textContent = `${POSTS_DIR}/新文章.md`;
    ui.deleteBtn.classList.add("hidden");
    ui.viewPostLink.classList.add("hidden");
    ui.editorHeading.textContent = "未命名文章";
    ui.emptyState.classList.add("hidden");
    ui.form.classList.remove("hidden");
    updateWordCount();
    renderPreview();
    state.loadingForm = false;
    setDirty(false);
    ui.title.focus();
  }

  function showEmptyState() {
    state.currentPath = null;
    state.currentPost = null;
    state.isNew = false;
    ui.form.classList.add("hidden");
    ui.emptyState.classList.remove("hidden");
    setDirty(false);
  }

  function getFilteredPosts() {
    const query = ui.search.value.trim().toLowerCase();
    if (!query) return state.posts;
    return state.posts.filter((post) => {
      return [post.title, post.name, post.categories.join(" "), post.tags.join(" ")]
        .join(" ")
        .toLowerCase()
        .includes(query);
    });
  }

  function renderPosts() {
    const posts = getFilteredPosts();
    ui.postCount.textContent = `${state.posts.length} 篇文章`;
    if (!state.token) {
      ui.postList.innerHTML = '<div class="list-empty">连接 GitHub 后读取文章</div>';
      return;
    }
    if (!posts.length) {
      ui.postList.innerHTML = '<div class="list-empty">没有找到匹配的文章</div>';
      return;
    }
    ui.postList.innerHTML = posts
      .map((post) => {
        const active = post.path === state.currentPath ? " active" : "";
        const category = post.categories[0] || "未分类";
        const date = post.date ? post.date.slice(0, 10) : "读取中";
        return `<button class="post-item${active}" type="button" data-path="${escapeHtml(post.path)}">
          <span class="post-title">${escapeHtml(post.title || post.name)}</span>
          <span class="post-detail">
            <span>${escapeHtml(date)}</span>
            <span class="post-tag">${escapeHtml(category)}</span>
          </span>
        </button>`;
      })
      .join("");
  }

  function queueRender() {
    if (state.renderQueued) return;
    state.renderQueued = true;
    requestAnimationFrame(() => {
      state.renderQueued = false;
      renderPosts();
    });
  }

  async function fetchRawPost(file) {
    if (file.downloadUrl) {
      try {
        const response = await fetch(`${file.downloadUrl}?v=${Date.now()}`, {
          cache: "no-store",
        });
        if (response.ok) return response.text();
      } catch (error) {}
    }
    const data = await githubApi(contentsPath(file.path));
    return decodeBase64(data.content);
  }

  async function enrichPost(post) {
    const text = await fetchRawPost(post);
    const parsed = parseMarkdown(text);
    post.content = text;
    post.title = parsed.title || post.title;
    post.date = parsed.date;
    post.updated = parsed.updated;
    post.description = parsed.description;
    post.cover = parsed.cover;
    post.tags = parsed.tags;
    post.categories = parsed.categories;
    post.random = parsed.random;
    post.extra = parsed.extra;
  }

  async function runPool(items, limit, worker) {
    let index = 0;
    const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
      while (index < items.length) {
        const current = index;
        index += 1;
        await worker(items[current], current);
      }
    });
    await Promise.all(workers);
  }

  async function loadPosts() {
    if (!state.token) {
      state.posts = [];
      renderPosts();
      return;
    }
    ui.postList.innerHTML =
      '<div class="list-placeholder"><span class="spinner"></span>正在读取文章…</div>';
    setSyncState("读取目录…");
    try {
      const files = await githubApi(contentsPath(POSTS_DIR));
      if (!Array.isArray(files)) throw new Error("文章目录返回格式异常");
      const markdownFiles = files.filter((file) => file.type === "file" && /\.md$/i.test(file.name));
      state.posts = markdownFiles
        .map((file) => ({
          path: file.path,
          name: file.name,
          sha: file.sha,
          downloadUrl: file.download_url,
          title: file.name.replace(/\.md$/i, ""),
          date: "",
          updated: "",
          description: "",
          cover: "",
          tags: [],
          categories: [],
          random: true,
          content: null,
          extra: {},
        }))
        .sort((a, b) => a.name.localeCompare(b.name));
      renderPosts();
      let done = 0;
      await runPool(state.posts, 5, async (post) => {
        try {
          await enrichPost(post);
        } catch (error) {
          post.title = post.name.replace(/\.md$/i, "");
        }
        done += 1;
        setSyncState(`已读取 ${done}/${state.posts.length}`);
        if (done % 5 === 0 || done === state.posts.length) queueRender();
      });
      state.posts.sort((a, b) => String(b.date).localeCompare(String(a.date)));
      renderPosts();
      setSyncState("已同步");
    } catch (error) {
      ui.postList.innerHTML = `<div class="list-empty">${escapeHtml(error.message)}</div>`;
      setSyncState("读取失败");
      if (error.status === 401 || error.status === 403) {
        handleAuthError(error);
      }
    }
  }

  async function openPost(path) {
    if (state.dirty && !window.confirm("当前文章有未保存修改，确定离开吗？")) return;
    const post = state.posts.find((item) => item.path === path);
    if (!post) return;
    try {
      setSaveStatus("正在打开…");
      const data = await githubApi(contentsPath(post.path));
      post.sha = data.sha;
      post.content = decodeBase64(data.content);
      const parsed = parseMarkdown(post.content);
      post.title = parsed.title || post.title;
      post.date = parsed.date;
      post.updated = parsed.updated;
      post.description = parsed.description;
      post.cover = parsed.cover;
      post.tags = parsed.tags;
      post.categories = parsed.categories;
      post.random = parsed.random;
      post.extra = parsed.extra;
      state.currentPath = post.path;
      state.currentPost = post;
      state.isNew = false;
      populateForm(parsed, post);
      ui.emptyState.classList.add("hidden");
      ui.form.classList.remove("hidden");
      renderPosts();
      if (window.innerWidth <= 760) ui.sidebar.classList.add("collapsed");
    } catch (error) {
      setSaveStatus(error.message, "error");
      showToast(error.message, "error");
      if (error.status === 401 || error.status === 403) handleAuthError(error);
    }
  }

  async function savePost(event) {
    if (event) event.preventDefault();
    if (!state.token) {
      openTokenDialog();
      return;
    }
    if (state.saving) return;
    const values = getFormValues();
    if (!values.title) {
      ui.title.focus();
      setSaveStatus("请先填写标题", "error");
      return;
    }
    if (!values.body.trim()) {
      ui.body.focus();
      setSaveStatus("正文不能为空", "error");
      return;
    }
    const slug = sanitizeSlug(ui.slug.value || values.title);
    if (state.isNew) {
      ui.slug.value = slug;
    }
    const path = state.isNew ? `${POSTS_DIR}/${slug}.md` : state.currentPath;
    const content = serializeFrontmatter(values);
    const message = `${state.isNew ? "content: create" : "content: update"} ${values.title}`;
    state.saving = true;
    ui.saveBtn.disabled = true;
    ui.saveBtnBottom.disabled = true;
    ui.saveBtn.textContent = "保存中…";
    ui.saveBtnBottom.textContent = "保存中…";
    setSaveStatus("正在提交到 GitHub…");
    try {
      const payload = {
        message,
        content: encodeText(content),
        branch: BRANCH,
      };
      if (!state.isNew && state.currentPost && state.currentPost.sha) {
        payload.sha = state.currentPost.sha;
      }
      const result = await githubApi(`/repos/${OWNER}/${REPO}/contents/${encodePath(path)}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });
      const parsed = parseMarkdown(content);
      const savedPost = state.currentPost || {};
      Object.assign(savedPost, {
        path,
        name: `${slug}.md`,
        sha: result.content.sha,
        content,
        title: parsed.title,
        date: parsed.date,
        updated: parsed.updated,
        description: parsed.description,
        cover: parsed.cover,
        tags: parsed.tags,
        categories: parsed.categories,
        random: parsed.random,
        extra: parsed.extra,
      });
      if (state.isNew) {
        state.posts.push(savedPost);
      } else {
        const index = state.posts.findIndex((post) => post.path === path);
        if (index >= 0) state.posts[index] = savedPost;
      }
      state.posts.sort((a, b) => String(b.date).localeCompare(String(a.date)));
      state.currentPath = path;
      state.currentPost = savedPost;
      state.isNew = false;
      state.slugTouched = false;
      ui.slugField.classList.add("hidden");
      ui.updated.value = parsed.updated;
      ui.editorMode.textContent = "编辑文章";
      ui.editorPath.textContent = path;
      ui.deleteBtn.classList.remove("hidden");
      const url = postUrl(savedPost);
      ui.viewPostLink.href = url || "#";
      ui.viewPostLink.classList.toggle("hidden", !url);
      state.loadingForm = true;
      state.loadingForm = false;
      setDirty(false);
      setSaveStatus("已提交，约 30–60 秒后线上生效", "success");
      renderPosts();
      showToast("文章已提交，GitHub Pages 正在更新", "success");
    } catch (error) {
      let messageText = error.message;
      if (error.status === 409) {
        messageText = "远端文件已有新版本，请刷新文章列表后重试";
      } else if (error.status === 422) {
        messageText = "保存失败：文件名可能已存在，或字段格式不正确";
      }
      setSaveStatus(messageText, "error");
      showToast(messageText, "error");
      if (error.status === 401 || error.status === 403) handleAuthError(error);
    } finally {
      state.saving = false;
      ui.saveBtn.disabled = false;
      ui.saveBtnBottom.disabled = false;
      ui.saveBtn.textContent = "保存并发布";
      ui.saveBtnBottom.textContent = "保存并发布";
    }
  }

  async function deletePost() {
    if (!state.currentPath || !state.currentPost) return;
    const answer = window.confirm(`确定删除《${state.currentPost.title}》吗？此操作会从 GitHub 仓库删除文件。`);
    if (!answer) return;
    try {
      setSaveStatus("正在删除…");
      await githubApi(`/repos/${OWNER}/${REPO}/contents/${encodePath(state.currentPath)}`, {
        method: "DELETE",
        body: JSON.stringify({
          message: `content: delete ${state.currentPost.title}`,
          sha: state.currentPost.sha,
          branch: BRANCH,
        }),
      });
      state.posts = state.posts.filter((post) => post.path !== state.currentPath);
      renderPosts();
      showEmptyState();
      showToast("文章已删除，GitHub Pages 正在更新", "success");
    } catch (error) {
      setSaveStatus(error.message, "error");
      showToast(error.message, "error");
      if (error.status === 401 || error.status === 403) handleAuthError(error);
    }
  }

  function insertAtCursor(before, after, placeholder) {
    const start = ui.body.selectionStart;
    const end = ui.body.selectionEnd;
    const selected = ui.body.value.slice(start, end) || placeholder;
    const text = `${before}${selected}${after}`;
    ui.body.setRangeText(text, start, end, "end");
    ui.body.focus();
    ui.body.dispatchEvent(new Event("input", { bubbles: true }));
  }

  function applyInsert(type) {
    if (type === "h2") insertAtCursor("## ", "", "标题");
    if (type === "bold") insertAtCursor("**", "**", "加粗文字");
    if (type === "italic") insertAtCursor("*", "*", "斜体文字");
    if (type === "inline-code") insertAtCursor("`", "`", "代码");
    if (type === "code-block") insertAtCursor("```java\n", "\n```", "代码");
    if (type === "link") insertAtCursor("[", "](https://)", "链接文字");
    if (type === "quote") insertAtCursor("> ", "", "引用");
    if (type === "list") insertAtCursor("- ", "", "列表项");
  }

  function renderPreview() {
    if (!state.previewOpen) return;
    const body = ui.body.value.trim();
    if (!body) {
      ui.previewPane.innerHTML = '<p class="file-path">还没有正文</p>';
      return;
    }
    if (window.marked && window.DOMPurify) {
      ui.previewPane.innerHTML = window.DOMPurify.sanitize(window.marked.parse(body));
    } else {
      ui.previewPane.textContent = body;
    }
  }

  function togglePreview() {
    state.previewOpen = !state.previewOpen;
    ui.previewPane.classList.toggle("hidden", !state.previewOpen);
    ui.bodyWrap.classList.toggle("split", state.previewOpen);
    ui.previewBtn.textContent = state.previewOpen ? "关闭预览" : "预览";
    ui.previewBtn.classList.toggle("primary", state.previewOpen);
    if (state.previewOpen) renderPreview();
  }

  function openTokenDialog() {
    ui.tokenInput.value = "";
    ui.tokenError.textContent = "";
    ui.clearTokenBtn.classList.toggle("hidden", !state.token);
    if (typeof ui.tokenDialog.showModal === "function") {
      if (!ui.tokenDialog.open) ui.tokenDialog.showModal();
    } else {
      ui.tokenDialog.setAttribute("open", "");
    }
  }

  function closeTokenDialog() {
    if (typeof ui.tokenDialog.close === "function" && ui.tokenDialog.open) {
      ui.tokenDialog.close();
    } else {
      ui.tokenDialog.removeAttribute("open");
    }
  }

  function handleAuthError(error) {
    if (error.status === 401 || error.status === 403) {
      localStorage.removeItem(TOKEN_KEY);
      state.token = "";
      state.user = null;
      setConnection();
      state.posts = [];
      renderPosts();
      ui.tokenError.textContent =
        error.status === 401
          ? "Token 已失效，请重新生成一个 Token。"
          : "Token 没有这个仓库的内容读写权限。";
      openTokenDialog();
    }
  }

  async function connectToken(event) {
    if (event) event.preventDefault();
    const token = ui.tokenInput.value.trim();
    if (!token) {
      ui.tokenError.textContent = "请先粘贴 GitHub Token。";
      return;
    }
    ui.connectBtn.disabled = true;
    ui.connectBtn.textContent = "验证中…";
    ui.tokenError.textContent = "";
    try {
      const user = await validateToken(token);
      state.token = token;
      state.user = user;
      localStorage.setItem(TOKEN_KEY, token);
      setConnection();
      closeTokenDialog();
      showToast(`已连接 @${user.login}`, "success");
      await loadPosts();
    } catch (error) {
      ui.tokenError.textContent =
        error.status === 401
          ? "Token 无效，请检查是否复制完整。"
          : "连接失败：请确认 Token 对 SIZE02.github.io 有 Contents 读写权限。";
    } finally {
      ui.connectBtn.disabled = false;
      ui.connectBtn.textContent = "连接 GitHub";
    }
  }

  function clearToken() {
    localStorage.removeItem(TOKEN_KEY);
    state.token = "";
    state.user = null;
    state.posts = [];
    state.currentPath = null;
    state.currentPost = null;
    setConnection();
    closeTokenDialog();
    showEmptyState();
    renderPosts();
    setSyncState("等待连接");
    showToast("已清除浏览器里的 Token");
  }

  async function uploadImage(file) {
    if (!file) return;
    if (!state.token) {
      openTokenDialog();
      return;
    }
    if (file.size > 4 * 1024 * 1024) {
      showToast("图片超过 4MB，建议先压缩再上传", "error");
      return;
    }
    const now = new Date();
    const month = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}`;
    const extension =
      (file.name.split(".").pop() || "").toLowerCase() ||
      (file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg");
    const base = sanitizeSlug(file.name.replace(/\.[^.]+$/, "")) || "image";
    const filename = `${Date.now()}-${base}.${extension}`;
    const path = `${MEDIA_DIR}/${month}/${filename}`;
    const buffer = await file.arrayBuffer();
    setSaveStatus("正在上传图片…");
    try {
      await githubApi(`/repos/${OWNER}/${REPO}/contents/${encodePath(path)}`, {
        method: "PUT",
        body: JSON.stringify({
          message: `media: upload ${filename}`,
          content: bytesToBase64(new Uint8Array(buffer)),
          branch: BRANCH,
        }),
      });
      const url = `${MEDIA_URL}/${month}/${filename}`;
      if (state.imageTarget === "cover") {
        ui.cover.value = url;
        setDirty(true);
      } else {
        insertAtCursor(`\n![图片](${url})\n`, "", "");
      }
      showToast("图片已上传", "success");
    } catch (error) {
      showToast(error.message, "error");
      if (error.status === 401 || error.status === 403) handleAuthError(error);
    } finally {
      state.imageTarget = null;
      ui.imageFileInput.value = "";
    }
  }

  ui.form.addEventListener("input", (event) => {
    if (state.loadingForm) return;
    if (event.target === ui.title) {
      updateEditorHeading();
      if (state.isNew && !state.slugTouched) {
        ui.slug.value = sanitizeSlug(ui.title.value);
      }
    }
    if (event.target === ui.body) {
      updateWordCount();
      renderPreview();
    }
    setDirty(true);
  });

  ui.form.addEventListener("change", () => {
    if (!state.loadingForm) setDirty(true);
  });

  ui.form.addEventListener("submit", savePost);

  ui.postList.addEventListener("click", (event) => {
    const item = event.target.closest(".post-item");
    if (item) openPost(item.dataset.path);
  });

  ui.search.addEventListener("input", renderPosts);

  ui.slug.addEventListener("input", () => {
    state.slugTouched = true;
    ui.slug.value = ui.slug.value.replace(/\.md$/i, "");
  });

  ui.body.addEventListener("keydown", (event) => {
    if (event.key === "Tab") {
      event.preventDefault();
      insertAtCursor("  ", "", "");
    }
  });

  document.querySelectorAll("[data-insert]").forEach((button) => {
    button.addEventListener("click", () => applyInsert(button.dataset.insert));
  });

  ui.previewBtn.addEventListener("click", togglePreview);
  ui.deleteBtn.addEventListener("click", deletePost);

  $("#newPostBtn").addEventListener("click", () => {
    if (!state.token) {
      openTokenDialog();
      return;
    }
    if (state.dirty && !window.confirm("当前文章有未保存修改，确定新建吗？")) return;
    resetEditor();
  });

  $("#emptyNewBtn").addEventListener("click", () => {
    if (!state.token) {
      openTokenDialog();
      return;
    }
    resetEditor();
  });

  $("#emptyConnectBtn").addEventListener("click", openTokenDialog);
  $("#settingsBtn").addEventListener("click", openTokenDialog);
  $("#refreshBtn").addEventListener("click", () => {
    if (state.dirty && !window.confirm("当前文章有未保存修改，确定刷新列表吗？")) return;
    loadPosts();
  });

  ui.tokenForm.addEventListener("submit", connectToken);
  ui.clearTokenBtn.addEventListener("click", clearToken);
  $("#tokenDialogClose").addEventListener("click", closeTokenDialog);

  $("#uploadCoverBtn").addEventListener("click", () => {
    state.imageTarget = "cover";
    ui.imageFileInput.click();
  });

  $("#uploadBodyImageBtn").addEventListener("click", () => {
    state.imageTarget = "body";
    ui.imageFileInput.click();
  });

  ui.imageFileInput.addEventListener("change", () => {
    uploadImage(ui.imageFileInput.files && ui.imageFileInput.files[0]);
  });

  $("#sidebarToggle").addEventListener("click", () => {
    ui.sidebar.classList.toggle("collapsed");
  });

  document.addEventListener("keydown", (event) => {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "s") {
      event.preventDefault();
      savePost();
    }
  });

  window.addEventListener("beforeunload", (event) => {
    if (!state.dirty) return;
    event.preventDefault();
    event.returnValue = "";
  });

  async function boot() {
    setConnection();
    renderPosts();
    if (!window.jsyaml || !window.marked || !window.DOMPurify) {
      showToast("编辑器依赖加载失败，请刷新页面", "error");
    }
    if (!state.token) {
      setSyncState("等待连接");
      openTokenDialog();
      return;
    }
    try {
      state.user = await validateToken(state.token);
      setConnection();
      await loadPosts();
    } catch (error) {
      localStorage.removeItem(TOKEN_KEY);
      state.token = "";
      state.user = null;
      setConnection();
      renderPosts();
      ui.tokenError.textContent = "保存的 Token 已失效，请重新连接。";
      openTokenDialog();
    }
  }

  boot();
})();
