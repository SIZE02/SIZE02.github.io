---
title: 请求链路与鉴权
date: 2026-11-26 18:00:08
updated: 2026-11-26 18:00:08
description: 两个拦截器：
tags: [Java, 鉴权, 架构, 黑马 Java, 笔记库]
categories: [黑马 Java]
---
## 单体项目：苍穹外卖

```text
前端
  → JWT 拦截器
  → Controller
  → Service
  → Mapper
  → MySQL / Redis
```

两个拦截器：

- 管理端：校验员工 token。
- 用户端：校验微信用户 token。

用户上下文：

```text
JWT → 解析 id → ThreadLocal → Service 读取 → 请求结束 remove
```

## 微服务项目：黑马商城

```text
前端
  → Gateway
      → 白名单判断
      → JWT 校验
      → userId 写入请求头
  → 目标服务
      → 拦截器读取 userId
      → ThreadLocal
  → Feign 调用下游
      → 透传 userId
```

## 对比

| 点 | 苍穹外卖 | 黑马商城 |
|---|---|---|
| 校验位置 | 每个服务自己 | 网关统一校验 |
| 传递方式 | token 直接到服务 | 网关解析后传 userId |
| 下游信任 | 自身拦截器 | 内部请求头 |
| 用户上下文 | ThreadLocal | ThreadLocal |

## 安全要点

- JWT 密钥不能泄露。
- JWT 不是加密，不能放敏感信息。
- 用户 id 不能信前端参数。
- 下游只能信任网关/内部网络的用户头。
- Feign 透传用户信息时要防止外部伪造。
- 所有用户数据查询都要带用户条件，防止越权。

## 常见错误

| 问题 | 结果 |
|---|---|
| 只校验 token 不校验状态 | 禁用用户仍能访问 |
| 用户 id 从请求体取 | 可越权操作 |
| Feign 不透传用户头 | 下游拿不到用户 |
| ThreadLocal 不 remove | 线程复用串数据 |

## 关联

- [苍穹外卖 day01](/2026/11/26/heima-cangqiong-day01/)
- [黑马商城 day04](/2026/11/26/heima-mall-day04/)
