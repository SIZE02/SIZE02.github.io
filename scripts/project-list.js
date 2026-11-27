"use strict";

function escapeHtml(value) {
  return String(value == null ? "" : value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function asList(value) {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }
  if (typeof value === "string") {
    return value
      .split(/\r?\n|,|，/)
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
}

function renderDetails(markdown) {
  const source = String(markdown || "").trim();
  if (!source) return "";
  try {
    return hexo.render.renderSync({ text: source, engine: "markdown" });
  } catch (error) {
    return `<p>${escapeHtml(source)}</p>`;
  }
}

function repoLabel(url) {
  if (/gitee\.com/i.test(url)) return "Gitee 源码";
  if (/github\.com/i.test(url)) return "GitHub 源码";
  return "查看源码";
}

function safeUrl(value) {
  const url = String(value || "").trim();
  return /^(https?:\/\/|\/)/i.test(url) ? url : "";
}

hexo.extend.tag.register("project_list", function () {
  const data = hexo.locals.get("data") || {};
  const source = Array.isArray(data.projects) ? data.projects.slice() : [];
  const projects = source.sort((a, b) => {
    return Number(a.order || 999) - Number(b.order || 999);
  });

  if (!projects.length) {
    return '<div class="project-showcase-empty">还没有添加项目。</div>';
  }

  const cards = projects.map((project, index) => {
    const title = escapeHtml(project.title || "未命名项目");
    const subtitle = escapeHtml(project.subtitle || "");
    const status = escapeHtml(project.status || "进行中");
    const summary = escapeHtml(project.summary || "");
    const repo = safeUrl(project.repo);
    const demo = safeUrl(project.demo);
    const cover = safeUrl(project.cover);
    const stack = asList(project.stack);
    const highlights = asList(project.highlights);
    const details = renderDetails(project.details);
    const number = String(index + 1).padStart(2, "0");

    const stackHtml = stack.length
      ? `<div class="project-card__stack">${stack
          .map((item) => `<span>${escapeHtml(item)}</span>`)
          .join("")}</div>`
      : "";

    const highlightsHtml = highlights.length
      ? `<section class="project-card__highlights">
          <h3>项目亮点</h3>
          <ul>${highlights.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
        </section>`
      : "";

    const detailsHtml = details
      ? `<section class="project-card__details">${details}</section>`
      : "";

    const coverHtml = cover
      ? `<div class="project-card__cover"><img src="${escapeHtml(cover)}" alt="${title}" loading="lazy" /></div>`
      : "";

    const links = [];
    if (repo) {
      links.push(
        `<a class="project-card__link primary" href="${escapeHtml(
          repo
        )}" target="_blank" rel="noopener noreferrer">${repoLabel(repo)} ↗</a>`
      );
    }
    if (demo) {
      links.push(
        `<a class="project-card__link" href="${escapeHtml(
          demo
        )}" target="_blank" rel="noopener noreferrer">在线演示 ↗</a>`
      );
    }

    return `<article class="project-card">
      <header class="project-card__head">
        <div class="project-card__number">${number}</div>
        <div class="project-card__intro">
          <div class="project-card__eyebrow">
            ${subtitle ? `<span>${subtitle}</span>` : ""}
            <span class="project-card__status">${status}</span>
          </div>
          <h2>${title}</h2>
          ${summary ? `<p class="project-card__summary">${summary}</p>` : ""}
        </div>
      </header>
      ${coverHtml}
      ${stackHtml}
      <div class="project-card__body">
        ${highlightsHtml}
        ${detailsHtml}
      </div>
      ${links.length ? `<footer class="project-card__actions">${links.join("")}</footer>` : ""}
    </article>`;
  });

  return `<div class="project-showcase">${cards.join("")}</div>`;
});
