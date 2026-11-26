---
title: day06｜微信登录与商品浏览
date: 2026-11-26 18:00:32
updated: 2026-11-26 18:00:32
description: 小程序用 code 换 openid，后端据此查找或创建用户，再签发自己的 JWT；登录后用户才能浏览和点餐。
tags: [黑马, 苍穹外卖, 微信小程序, Java, JWT, 笔记库]
categories: [苍穹外卖]
---
> **一句话**
> 小程序用 `code` 换 `openid`，后端据此查找或创建用户，再签发自己的 JWT；登录后用户才能浏览和点餐。

## 本节目标

- 理解微信登录为什么需要后端参与。
- 掌握 `HttpClient` 调用微信接口。
- 掌握用户 JWT 拦截器和商品浏览接口。

## 1. 微信登录流程

```text
小程序调用 wx.login()
  → 得到临时 code
  → 前端把 code 发给后端
  → 后端用 appid + secret + code 请求微信接口
  → 微信返回 openid
  → 后端按 openid 查询用户
  → 不存在则自动注册
  → 生成 JWT 返回小程序
```

关键点：

- `code` 只能用一次，且有有效期。
- `appid` 和 `secret` 必须放服务端配置。
- 不能把 `secret` 下发到小程序。
- `openid` 是用户在当前小程序下的唯一标识。

## 2. HttpClient

后端调用微信接口属于“服务端发起 HTTP 请求”，可用 `HttpClient`：

```java
HttpClient client = HttpClient.newHttpClient();
HttpRequest request = HttpRequest.newBuilder()
        .uri(URI.create(url))
        .GET()
        .build();
HttpResponse<String> response = client.send(request, BodyHandlers.ofString());
```

拿到 JSON 后解析 `openid`，再执行业务。

> **注意：异常处理**
> 第三方接口可能超时、返回错误码或限流。必须校验响应状态和业务错误码，不能假设一定成功。

## 3. 用户表

`user` 表核心字段：

| 字段 | 说明 |
|---|---|
| `id` | 主键 |
| `openid` | 微信唯一标识 |
| `name` | 昵称 |
| `phone` | 手机号 |
| `sex` | 性别 |
| `avatar` | 头像 |
| `create_time` | 创建时间 |

登录成功后返回：

```json
{
  "id": 1,
  "openid": "xxx",
  "token": "jwt..."
}
```

## 4. 用户端 JWT 拦截器

管理端和用户端 token 要分开：

| 端 | 拦截路径 | 请求头 |
|---|---|---|
| 管理端 | `/admin/**` | `token` |
| 用户端 | `/user/**` | `authentication` 或课程配置的字段 |

拦截器职责：

1. 放行登录、浏览等公开接口。
2. 解析 token。
3. 将用户 id 写入 ThreadLocal。
4. 校验失败返回 401。

## 5. 商品浏览

用户端商品浏览接口：

| 功能 | 路径 |
|---|---|
| 查询分类 | `/user/category/list` |
| 按分类查菜品 | `/user/dish/list` |
| 按分类查套餐 | `/user/setmeal/list` |
| 查询套餐详情 | `/user/setmeal/dish/{id}` |

菜品列表通常需要口味：

```text
查询 dish
  → 查询 dish_flavor
  → 按 dishId 分组
  → 组装 DishVO.flavors
```

## 6. 用户端与管理端的差异

| 点 | 管理端 | 用户端 |
|---|---|---|
| 数据范围 | 可看停售数据 | 只看到起售数据 |
| 鉴权 | 员工登录 | 微信登录 |
| 字段 | 管理字段更多 | 展示字段更精简 |
| 缓存 | 通常不必 | 高频浏览适合缓存 |

## 7. 自测

- [ ] 能完整画出微信登录时序图。
- [ ] 能解释为什么 `secret` 不能放前端。
- [ ] 能区分管理端与用户端拦截器。
- [ ] 能说明商品浏览为什么需要组装 VO。

## 关联

- 上一篇：[day05-Redis与营业状态](/2026/11/26/heima-cangqiong-day05/)
- 下一篇：[day07-缓存与购物车](/2026/11/26/heima-cangqiong-day07/)
- [鉴权链路](/2026/11/26/heima-public-request-auth/)
