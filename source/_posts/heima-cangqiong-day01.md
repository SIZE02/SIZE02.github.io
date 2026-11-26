---
title: day01｜项目概述与环境搭建
date: 2026-11-26 18:00:37
updated: 2026-11-26 18:00:37
description: 把管理端、后端、数据库、Nginx 和接口文档跑通，并用 JWT 登录打通前后端联调。
tags: [黑马, 苍穹外卖, Java, SpringBoot, 环境搭建, 笔记库]
categories: [苍穹外卖]
---
> **一句话**
> 把管理端、后端、数据库、Nginx 和接口文档跑通，并用 JWT 登录打通前后端联调。

## 本节目标

- 说清项目角色：管理端、用户端小程序、后端服务。
- 独立完成 MySQL 导入、后端启动、前端启动和 Nginx 代理。
- 理解 JWT 登录链路以及 Swagger 的作用。

## 1. 项目定位

苍穹外卖是一个单体 Spring Boot 项目：

```text
管理端（Vue）  ─┐
                 ├─→ sky-server（Spring Boot）→ MySQL
用户端（小程序）─┘                          → Redis
```

核心业务域：

| 域 | 功能 |
|---|---|
| 员工 | 登录、增删改查、启停 |
| 基础数据 | 分类、菜品、套餐 |
| 用户端 | 微信登录、浏览、购物车、下单、支付 |
| 订单 | 查询、接单、拒单、取消、派送、完成 |
| 统计 | 营业额、用户、订单、销量、工作台、Excel |

## 2. 环境搭建顺序

1. 导入数据库脚本，确认 `sky_take_out` 库和表存在。
2. 修改后端 `application-dev.yml` 中的数据库账号密码。
3. 启动 `SkyApplication`，检查端口与日志。
4. 启动管理端前端，配置后端地址或使用 Nginx 代理。
5. 用默认员工账号登录，确认 JWT 能正常返回。
6. 打开 Knife4j/Swagger 查看并调试接口。

> **提示：排查顺序**
> 页面打不开先看前端端口，接口 404 看代理路径，401 看请求头 token，500 看后端异常栈和数据库连接。

## 3. Nginx 的作用

本项目中 Nginx 主要做两件事：

- 托管前端静态资源。
- 把 `/api/` 请求反向代理到后端服务。

```nginx
location /api/ {
    proxy_pass http://127.0.0.1:8080/admin/;
}
```

需要能解释：

- 正向代理替客户端转发，反向代理替服务器接收请求。
- 负载均衡是反向代理后面配置多个上游实例。

## 4. JWT 登录链路

```text
用户名 + 密码
  → Controller 调用 Service
  → 按用户名查 employee
  → MD5 比对密码
  → 生成 JWT
  → 前端保存 token
  → 后续请求放入 token 请求头
  → 拦截器解析并校验
```

JWT 由三部分组成：

```text
Header.Payload.Signature
```

- Header：算法类型。
- Payload：员工 id 等声明。
- Signature：用服务端密钥签名，防篡改。

> **注意：易错点**
> JWT 不是加密，Payload 可被解码；不要把密码等敏感信息放进 Payload。密钥必须放配置中，不能硬编码到业务代码。

## 5. Swagger / Knife4j

作用：

- 根据注解生成接口文档。
- 直接在页面调试接口。
- 降低前后端联调成本。

常见注解：

| 注解 | 用途 |
|---|---|
| `@Tag` | 模块分组 |
| `@Operation` | 接口说明 |
| `@Parameter` | 参数说明 |
| `@Schema` | 模型字段说明 |

## 6. 代码主线

```java
@RestController
@RequestMapping("/admin/employee")
public class EmployeeController {

    @PostMapping("/login")
    public Result<EmployeeLoginVO> login(@RequestBody EmployeeLoginDTO dto) {
        return Result.success(employeeService.login(dto));
    }
}
```

登录 Service 的关键步骤：

1. 根据用户名查询员工。
2. 校验员工存在、密码一致、账号未被禁用。
3. 生成 token。
4. 返回 `id / userName / name / token`。

## 7. 本地代码位置

- 完整项目：`/Users/wei/Java/苍穹外卖/资料 2/day12/项目完整版代码/sky-take-out`
- 登录接口：`sky-server/src/main/java/com/sky/controller/admin/EmployeeController.java`
- 拦截器：`sky-server/src/main/java/com/sky/interceptor/JwtTokenAdminInterceptor.java`
- 配置：`sky-server/src/main/resources/application-dev.yml`

## 8. 自测

- [ ] 能画出前端、Nginx、后端、MySQL 的关系。
- [ ] 能说出 JWT 三段分别是什么。
- [ ] 能独立排查 404、401、500。
- [ ] 能解释为什么要用拦截器而不是每个接口都校验 token。

## 关联

- 下一篇：[day02-员工与分类管理](/2026/11/26/heima-cangqiong-day02/)
- 总览：[00-苍穹外卖总览](/2026/11/26/heima-cangqiong-overview/)
- [请求链路与鉴权](/2026/11/26/heima-public-request-auth/)
