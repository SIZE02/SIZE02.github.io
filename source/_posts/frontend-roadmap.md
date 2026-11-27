---
title: 前端开发学习路线（Java 后端视角）
date: 2026-11-27 09:00:00
updated: 2026-11-27 09:00:00
description: 不追求成为前端专家，先补齐 Java 后端做全栈项目所需的前端能力：HTML、CSS、JavaScript、Vue、接口联调。
tags: [前端, 学习路线, HTML, CSS, JavaScript, Vue, 项目]
categories: [前端开发]
cover: /img/album/code/code-3.jpg
---
> **目标**：能独立看懂并修改一个 Vue 管理端，完成登录、表格、表单、上传、分页和接口联调。
> **原则**：先能跑通业务，再补底层细节；重点理解“页面如何取数据、如何把操作传给后端”。

## 学习顺序

| 阶段 | 内容 | 学完能做什么 |
|---|---|---|
| 1 | HTML、CSS 基础 | 能写出结构清晰的页面和常见布局 |
| 2 | JavaScript 基础 | 能处理事件、数组对象、异步请求 |
| 3 | HTTP 与接口 | 看懂请求方法、状态码、JSON、Token |
| 4 | Vue 基础 | 组件、模板、响应式、路由、请求封装 |
| 5 | 项目联调 | 登录鉴权、CRUD、分页、上传、部署 |

## 1. HTML：先保证结构正确

最常用的是这些标签：

```html
<div class="card">
  <h2>员工管理</h2>
  <form>
    <label for="name">姓名</label>
    <input id="name" name="name" placeholder="请输入姓名" />
    <button type="submit">保存</button>
  </form>
</div>
```

重点记住：

- `div` 负责布局，`span` 负责行内文本。
- `form`、`input`、`button` 是表单三件套。
- `label` 的 `for` 最好和 `input` 的 `id` 对应。
- 图片必须有 `alt`，按钮最好写清用途。

## 2. CSS：会布局就够用了

管理端最常见的是 Flex 布局：

```css
.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}
```

优先级从高到低理解：

1. 元素能正常排列。
2. 内容不溢出、不重叠。
3. 间距统一。
4. 最后再考虑动画和花哨效果。

## 3. JavaScript：后端最容易卡住的地方

后端同学先掌握这四类：

- 对象和数组：`map`、`filter`、`find`、`reduce`
- 事件：点击、提交、输入
- 异步：`Promise`、`async/await`
- 请求：`fetch` 或 Axios

```js
async function loadEmployees() {
  const response = await fetch("/api/employees?page=1&size=10", {
    headers: { Authorization: `Bearer ${token}` },
  });
  const result = await response.json();
  return result.data.records;
}
```

这段代码对应后端最常见的分页接口：请求带页码和 Token，响应里取 `records`。

## 4. Vue：抓住数据驱动

先理解三件事：

1. `data` 改变，页面自动更新。
2. 页面操作通过事件修改数据。
3. 接口返回的数据直接绑定到表格或表单。

一个最小页面结构：

```vue
<template>
  <el-table :data="rows">
    <el-table-column prop="name" label="姓名" />
    <el-table-column prop="phone" label="手机号" />
  </el-table>
</template>

<script setup>
import { onMounted, ref } from "vue";

const rows = ref([]);

onMounted(async () => {
  rows.value = await loadEmployees();
});
</script>
```

## 5. 前后端联调检查表

- 请求地址是否正确：`/api`、端口、代理。
- 请求方法是否一致：GET、POST、PUT、DELETE。
- 参数位置是否一致：Query、Path、JSON Body。
- 字段名是否一致：`userId` 和 `user_id` 是两回事。
- 登录态是否带上：Cookie 或 `Authorization`。
- 后端返回结构是否统一：`code`、`message`、`data`。
- 跨域是否是后端 CORS 或前端代理问题。
- 上传文件时是否使用了 `FormData`。

## 最小项目练习

建议用一个“员工管理”页面练手：

1. 登录并保存 Token。
2. 分页查询员工列表。
3. 新增和编辑员工。
4. 启用、禁用员工。
5. 上传头像。
6. 退出登录并清理 Token。

做到这六步，已经足够接手大多数 Java 项目的前端管理端。

## 和 Java 后端的对应关系

| 前端 | 后端 |
|---|---|
| 表单提交 | Controller 接收 DTO |
| 表格分页 | PageHelper 或 MyBatis-Plus 分页 |
| 登录 Token | JWT 拦截器或 Gateway 鉴权 |
| 上传图片 | OSS 或本地文件服务 |
| 下拉选项 | 字典接口或枚举接口 |
| 错误提示 | 统一异常处理和错误码 |

> 前端的核心不是把每个 API 都背下来，而是能沿着“页面事件 → 请求 → 后端 → 响应 → 页面更新”这条链路定位问题。
