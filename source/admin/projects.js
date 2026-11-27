(() => {
  "use strict";

  const OWNER = "SIZE02";
  const REPO = "SIZE02.github.io";
  const BRANCH = "main";
  const DATA_PATH = "source/_data/projects.yml";
  const MEDIA_DIR = "source/img/uploads/projects";
  const MEDIA_URL = "/img/uploads/projects";
  const API_ROOT = "https://api.github.com";
  const TOKEN_KEY = "size02-blog-admin-token";
  const KNOWN_FIELDS = new Set([
    "order",
    "title",
    "subtitle",
    "status",
    "summary",
    "stack",
    "highlights",
    "repo",
    "demo",
    "cover",
    "details",
  ]);

  const $ = (selector) => document.querySelector(selector);
  const ui = {
    form: $("#projectForm"),
    emptyState: $("#emptyState"),
    editorMode: $("#editorMode"),
    editorHeading: $("#editorHeading"),
    title: $("#titleInput"),
    subtitle: $("#subtitleInput"),
    status: $("#statusInput"),
    order: $("#orderInput"),
    repo: $("#repoInput"),
    demo: $("#demoInput"),
    cover: $("#coverInput"),
    summary: $("#summaryInput"),
    stack: $("#stackInput"),
    highlights: $("#highlightsInput"),
    details: $("#detailsInput"),
    coverPreview: $("#coverPreview"),
    coverPreviewImage: $("#coverPreviewImage"),
    saveStatus: $("#saveStatus"),
    saveBtnTop: $("#saveBtnTop"),
    saveBtnBottom: $("#saveBtnBottom"),
    deleteBtn: $("#deleteBtn"),
    projectList: $("#projectList"),
    projectCount: $("#projectCount"),
    syncState: $("#syncState"),
    search: $("#searchInput"),
    connectionBadge: $("#connectionBadge"),
    imageFileInput: $("#imageFileInput"),
    toast: $("#toast"),
    sidebar: $("#sidebar"),
  };

  const state = {
    token: localStorage.getItem(TOKEN_KEY) || "",
    projects: [],
    fileSha: "",
    currentIndex: null,
    isNew: false,
    dirty: false,
    loadingForm: false,
    saving: false,
    toastTimer: null,
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

  function setConnection(connected) {
    const connectLink = $("#connectLink");
    if (connected) {
      ui.connectionBadge.textContent = "已连接";
      ui.connectionBadge.classList.add("connected");
      connectLink.classList.add("hidden");
    } else if (state.token) {
      ui.connectionBadge.textContent = "Token 已保存";
      ui.connectionBadge.classList.remove("connected");
    } else {
      ui.connectionBadge.textContent = "未连接";
      ui.connectionBadge.classList.remove("connected");
      connectLink.classList.remove("hidden");
    }
  }

  function encodePath(path) {
    return path.split("/").map(encodeURIComponent).join("/");
  }

  function contentsPath(path) {
    return `/repos/${OWNER}/${REPO}/contents/${encodePath(path)}?ref=${BRANCH}`;
  }

  async function githubApi(path, options = {}) {
    const headers = {
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      ...(options.headers || {}),
    };
    if (state.token) headers.Authorization = `Bearer ${state.token}`;
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
      throw new HttpError(
        (data && data.message) || `GitHub API 请求失败（${response.status}）`,
        response.status,
        data
      );
    }
    return data;
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

  function normalizeHighlightList(value) {
    if (Array.isArray(value)) {
      return value.map((item) => String(item).trim()).filter(Boolean);
    }
    if (typeof value === "string") {
      return value
        .split(/\r?\n/)
        .map((item) => item.trim())
        .filter(Boolean);
    }
    return [];
  }

  function normalizeProject(raw, index) {
    raw = raw && typeof raw === "object" ? raw : {};
    const project = {
      order: Number(raw.order) || (index + 1) * 10,
      title: String(raw.title || ""),
      subtitle: String(raw.subtitle || ""),
      status: String(raw.status || "进行中"),
      summary: String(raw.summary || ""),
      stack: normalizeList(raw.stack),
      highlights: normalizeHighlightList(raw.highlights),
      repo: String(raw.repo || ""),
      demo: String(raw.demo || ""),
      cover: String(raw.cover || ""),
      details: String(raw.details || ""),
      __extra: {},
    };
    Object.entries(raw).forEach(([key, value]) => {
      if (!KNOWN_FIELDS.has(key)) project.__extra[key] = value;
    });
    return project;
  }

  function emptyProject() {
    const maxOrder = state.projects.reduce((max, project) => {
      return Math.max(max, Number(project.order) || 0);
    }, 0);
    return normalizeProject(
      {
        order: maxOrder + 10,
        status: "进行中",
        stack: [],
        highlights: [],
      },
      state.projects.length
    );
  }

  function setDirty(value) {
    state.dirty = value;
    if (value) {
      setSaveStatus("有未保存修改", "dirty");
    } else if (state.currentIndex != null && !state.isNew) {
      setSaveStatus("已同步", "");
    } else {
      setSaveStatus("等待编辑", "");
    }
  }

  function updateHeading() {
    ui.editorHeading.textContent = ui.title.value.trim() || "未命名项目";
  }

  function updateCoverPreview() {
    const url = ui.cover.value.trim();
    ui.coverPreview.classList.toggle("hidden", !url);
    if (url) ui.coverPreviewImage.src = url;
  }

  function getFormValues() {
    return {
      order: Number(ui.order.value) || state.projects.length * 10 + 10,
      title: ui.title.value.trim(),
      subtitle: ui.subtitle.value.trim(),
      status: ui.status.value.trim() || "进行中",
      summary: ui.summary.value.trim(),
      stack: normalizeList(ui.stack.value),
      highlights: normalizeHighlightList(ui.highlights.value),
      repo: ui.repo.value.trim(),
      demo: ui.demo.value.trim(),
      cover: ui.cover.value.trim(),
      details: ui.details.value,
    };
  }

  function populateForm(project) {
    state.loadingForm = true;
    ui.title.value = project.title;
    ui.subtitle.value = project.subtitle;
    ui.status.value = project.status;
    ui.order.value = String(project.order || "");
    ui.repo.value = project.repo;
    ui.demo.value = project.demo;
    ui.cover.value = project.cover;
    ui.summary.value = project.summary;
    ui.stack.value = project.stack.join(", ");
    ui.highlights.value = project.highlights.join("\n");
    ui.details.value = project.details;
    ui.editorMode.textContent = state.isNew ? "新增项目" : "编辑项目";
    ui.deleteBtn.classList.toggle("hidden", state.isNew);
    ui.emptyState.classList.add("hidden");
    ui.form.classList.remove("hidden");
    updateHeading();
    updateCoverPreview();
    state.loadingForm = false;
    setDirty(false);
  }

  function showEmptyState() {
    state.currentIndex = null;
    state.isNew = false;
    ui.form.classList.add("hidden");
    ui.emptyState.classList.remove("hidden");
    setDirty(false);
  }

  function getFilteredProjects() {
    const query = ui.search.value.trim().toLowerCase();
    const sorted = state.projects
      .map((project, index) => ({ project, index }))
      .sort((a, b) => Number(a.project.order || 999) - Number(b.project.order || 999));
    if (!query) return sorted;
    return sorted.filter(({ project }) => {
      return [project.title, project.subtitle, project.status, project.summary, project.stack.join(" ")]
        .join(" ")
        .toLowerCase()
        .includes(query);
    });
  }

  function renderList() {
    const projects = getFilteredProjects();
    ui.projectCount.textContent = `${state.projects.length} 个项目`;
    if (!state.token) {
      ui.projectList.innerHTML = '<div class="list-empty">请先回文章后台连接 GitHub</div>';
      return;
    }
    if (!projects.length) {
      ui.projectList.innerHTML = '<div class="list-empty">还没有匹配的项目</div>';
      return;
    }
    ui.projectList.innerHTML = projects
      .map(({ project, index }) => {
        const active = index === state.currentIndex ? " active" : "";
        return `<button class="post-item${active}" type="button" data-index="${index}">
          <span class="post-title">${escapeHtml(project.title || "未命名项目")}</span>
          <span class="post-detail">
            <span class="project-item-status">${escapeHtml(project.status)}</span>
            <span class="post-tag">排序 ${escapeHtml(project.order)}</span>
          </span>
        </button>`;
      })
      .join("");
  }

  function discardUnsavedNew() {
    if (!state.isNew || state.currentIndex == null) return;
    state.projects.splice(state.currentIndex, 1);
    state.currentIndex = null;
    state.isNew = false;
  }

  function openProject(index) {
    if (state.dirty && !window.confirm("当前项目有未保存修改，确定离开吗？")) return;
    if (state.isNew && index === state.currentIndex) return;
    discardUnsavedNew();
    const project = state.projects[index];
    if (!project) return;
    state.currentIndex = index;
    state.isNew = false;
    populateForm(project);
    renderList();
    if (window.innerWidth <= 760) ui.sidebar.classList.add("collapsed");
  }

  function newProject() {
    if (!state.token) {
      showToast("请先回文章后台连接 GitHub", "error");
      return;
    }
    if (state.dirty && !window.confirm("当前项目有未保存修改，确定新增吗？")) return;
    discardUnsavedNew();
    const project = emptyProject();
    state.projects.push(project);
    state.currentIndex = state.projects.length - 1;
    state.isNew = true;
    populateForm(project);
    renderList();
    ui.title.focus();
  }

  function serializeProjects() {
    return state.projects.map((project) => {
      const item = { ...project.__extra };
      item.order = Number(project.order) || 1;
      item.title = project.title;
      if (project.subtitle) item.subtitle = project.subtitle;
      item.status = project.status || "进行中";
      if (project.summary) item.summary = project.summary;
      if (project.stack.length) item.stack = project.stack;
      if (project.highlights.length) item.highlights = project.highlights;
      if (project.repo) item.repo = project.repo;
      if (project.demo) item.demo = project.demo;
      if (project.cover) item.cover = project.cover;
      if (project.details.trim()) item.details = project.details.trimEnd();
      return item;
    });
  }

  async function persistProjects(successMessage) {
    if (!window.jsyaml) throw new Error("YAML 编辑器加载失败，请刷新页面");
    const yaml = window.jsyaml.dump(serializeProjects(), {
      lineWidth: -1,
      noRefs: true,
      noCompatMode: true,
      sortKeys: false,
      skipInvalid: true,
      quotingType: '"',
      forceQuotes: false,
    });
    const payload = {
      message: "content: update projects",
      content: encodeText(yaml),
      branch: BRANCH,
    };
    if (state.fileSha) payload.sha = state.fileSha;
    const result = await githubApi(`/repos/${OWNER}/${REPO}/contents/${encodePath(DATA_PATH)}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
    state.fileSha = result.content.sha;
    showToast(successMessage, "success");
  }

  async function saveProject(event) {
    if (event) event.preventDefault();
    if (!state.token) {
      showToast("请先回文章后台连接 GitHub", "error");
      return;
    }
    if (state.saving) return;
    const values = getFormValues();
    if (!values.title) {
      ui.title.focus();
      setSaveStatus("请先填写项目名称", "error");
      return;
    }

    const previous =
      state.currentIndex == null ? null : { ...state.projects[state.currentIndex] };
    if (state.currentIndex == null) {
      showToast("请先新建或选择一个项目", "error");
      return;
    }
    state.projects[state.currentIndex] = {
      ...state.projects[state.currentIndex],
      ...values,
    };

    state.saving = true;
    ui.saveBtnTop.disabled = true;
    ui.saveBtnBottom.disabled = true;
    ui.saveBtnTop.textContent = "保存中…";
    ui.saveBtnBottom.textContent = "保存中…";
    setSaveStatus("正在提交到 GitHub…");

    try {
      await persistProjects("项目已保存，GitHub Pages 正在更新");
      state.isNew = false;
      ui.editorMode.textContent = "编辑项目";
      ui.deleteBtn.classList.remove("hidden");
      setDirty(false);
      setSaveStatus("已提交，约 30–60 秒后线上生效", "success");
      renderList();
    } catch (error) {
      if (previous && state.currentIndex != null) {
        state.projects[state.currentIndex] = previous;
      }
      let message = error.message;
      if (error.status === 409) {
        message = "远端项目文件已有新版本，请刷新后重试";
      } else if (error.status === 422) {
        message = "保存失败：请检查内容格式";
      }
      setSaveStatus(message, "error");
      showToast(message, "error");
      handleAuthError(error);
    } finally {
      state.saving = false;
      ui.saveBtnTop.disabled = false;
      ui.saveBtnBottom.disabled = false;
      ui.saveBtnTop.textContent = "保存项目";
      ui.saveBtnBottom.textContent = "保存项目";
    }
  }

  async function deleteProject() {
    if (state.currentIndex == null || state.isNew) return;
    const project = state.projects[state.currentIndex];
    if (!window.confirm(`确定删除项目《${project.title}》吗？`)) return;
    const previousProjects = state.projects.slice();
    state.projects.splice(state.currentIndex, 1);
    try {
      setSaveStatus("正在删除…");
      await persistProjects("项目已删除，GitHub Pages 正在更新");
      showEmptyState();
      renderList();
    } catch (error) {
      state.projects = previousProjects;
      renderList();
      setSaveStatus(error.message, "error");
      showToast(error.message, "error");
      handleAuthError(error);
    }
  }

  function sanitizeSlug(value) {
    return String(value || "")
      .trim()
      .toLowerCase()
      .replace(/\.[^.]+$/, "")
      .replace(/[^\w\u4e00-\u9fa5-]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  async function uploadCover(file) {
    if (!file) return;
    if (!state.token) {
      showToast("请先回文章后台连接 GitHub", "error");
      return;
    }
    if (file.size > 6 * 1024 * 1024) {
      showToast("图片超过 6MB，建议先压缩", "error");
      return;
    }
    const now = new Date();
    const month = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}`;
    const extension =
      (file.name.split(".").pop() || "").toLowerCase() ||
      (file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg");
    const base = sanitizeSlug(file.name.replace(/\.[^.]+$/, "")) || "project";
    const filename = `${Date.now()}-${base}.${extension}`;
    const path = `${MEDIA_DIR}/${month}/${filename}`;
    setSaveStatus("正在上传封面…");
    try {
      const buffer = await file.arrayBuffer();
      await githubApi(`/repos/${OWNER}/${REPO}/contents/${encodePath(path)}`, {
        method: "PUT",
        body: JSON.stringify({
          message: `media: upload project cover ${filename}`,
          content: bytesToBase64(new Uint8Array(buffer)),
          branch: BRANCH,
        }),
      });
      ui.cover.value = `${MEDIA_URL}/${month}/${filename}`;
      updateCoverPreview();
      setDirty(true);
      showToast("封面已上传", "success");
    } catch (error) {
      showToast(error.message, "error");
      handleAuthError(error);
    } finally {
      ui.imageFileInput.value = "";
    }
  }

  async function loadProjects() {
    state.dirty = false;
    state.isNew = false;
    if (!state.token) {
      state.projects = [];
      setConnection(false);
      setSyncState("等待连接");
      renderList();
      return;
    }
    ui.projectList.innerHTML =
      '<div class="list-placeholder"><span class="spinner"></span>正在读取项目…</div>';
    setSyncState("读取数据…");
    try {
      const data = await githubApi(contentsPath(DATA_PATH));
      const text = decodeBase64(data.content);
      const parsed = window.jsyaml
        ? window.jsyaml.load(text, { schema: window.jsyaml.CORE_SCHEMA }) || []
        : [];
      if (!Array.isArray(parsed)) throw new Error("项目数据文件格式异常");
      state.projects = parsed.map(normalizeProject);
      state.fileSha = data.sha;
      setConnection(true);
      setSyncState("已同步");
      renderList();
      if (state.currentIndex != null && state.projects[state.currentIndex]) {
        openProject(state.currentIndex);
      }
    } catch (error) {
      state.projects = [];
      renderList();
      setSyncState("读取失败");
      setConnection(false);
      showToast(error.message, "error");
      handleAuthError(error);
    }
  }

  function setSyncState(message) {
    ui.syncState.textContent = message;
  }

  function handleAuthError(error) {
    if (error.status !== 401 && error.status !== 403) return;
    localStorage.removeItem(TOKEN_KEY);
    state.token = "";
    state.projects = [];
    setConnection(false);
    renderList();
    setSyncState("Token 失效");
    showEmptyState();
    showToast("Token 已失效，请回文章后台重新连接", "error");
  }

  ui.form.addEventListener("input", (event) => {
    if (state.loadingForm) return;
    if (event.target === ui.title) updateHeading();
    if (event.target === ui.cover) updateCoverPreview();
    setDirty(true);
  });

  ui.form.addEventListener("change", () => {
    if (!state.loadingForm) setDirty(true);
  });

  ui.form.addEventListener("submit", saveProject);

  ui.projectList.addEventListener("click", (event) => {
    const item = event.target.closest(".post-item");
    if (item) openProject(Number(item.dataset.index));
  });

  ui.search.addEventListener("input", renderList);
  ui.deleteBtn.addEventListener("click", deleteProject);

  $("#newProjectBtn").addEventListener("click", newProject);
  $("#emptyNewBtn").addEventListener("click", newProject);
  $("#refreshBtn").addEventListener("click", () => {
    if (state.dirty && !window.confirm("当前项目有未保存修改，确定刷新吗？")) return;
    loadProjects();
  });

  $("#uploadCoverBtn").addEventListener("click", () => ui.imageFileInput.click());
  ui.imageFileInput.addEventListener("change", () => {
    uploadCover(ui.imageFileInput.files && ui.imageFileInput.files[0]);
  });

  $("#sidebarToggle").addEventListener("click", () => {
    ui.sidebar.classList.toggle("collapsed");
  });

  document.addEventListener("keydown", (event) => {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "s") {
      event.preventDefault();
      saveProject();
    }
  });

  window.addEventListener("beforeunload", (event) => {
    if (!state.dirty && !state.isNew) return;
    event.preventDefault();
    event.returnValue = "";
  });

  function boot() {
    setConnection(false);
    renderList();
    if (!window.jsyaml) {
      showToast("YAML 编辑器加载失败，请刷新页面", "error");
    }
    if (!state.token) {
      setSyncState("等待连接");
      return;
    }
    loadProjects();
  }

  boot();
})();
