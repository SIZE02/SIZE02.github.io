---
title: 苍穹外卖总览
date: 2026-11-26 18:00:38
updated: 2026-11-26 18:00:38
description: 用 Spring Boot + MyBatis + MySQL + Redis 完成一个“管理端 + 用户端小程序”的外卖系统，核心能力是基础数据维护、点餐、下单支付、订单处理和运营统计。
tags: [黑马, 苍穹外卖, Java, SpringBoot, 笔记库]
categories: [苍穹外卖]
---
> **一句话**
> 用 Spring Boot + MyBatis + MySQL + Redis 完成一个“管理端 + 用户端小程序”的外卖系统，核心能力是基础数据维护、点餐、下单支付、订单处理和运营统计。

## 课程模块顺序

| 阶段 | 天数 | 模块 |
|---|---|---|
| 环境搭建 | day01 | 项目概述、前后端环境、Git、数据库、Nginx、登录、Swagger |
| 基础数据维护 | day02 | 员工管理、分类管理 |
| 基础数据维护 | day03 | 公共字段填充、文件上传、菜品管理 |
| 基础数据维护 | day04 | 套餐管理实战 |
| 点餐业务 | day05 | Redis、店铺营业状态 |
| 点餐业务 | day06 | HttpClient、微信小程序、微信登录、商品浏览 |
| 点餐业务 | day07 | 缓存菜品/套餐、购物车 |
| 点餐业务 | day08 | 地址簿、用户下单、微信支付 |
| 点餐业务 | day09 | 历史订单、订单管理 |
| 点餐业务 | day10 | 定时任务、WebSocket、来单提醒、催单 |
| 数据统计 | day11 | ECharts、营业额/用户/订单统计、销量 Top10 |
| 数据统计 | day12 | 工作台、Apache POI、Excel 导出 |

## 技术栈

| 层 | 技术 |
|---|---|
| Web | Spring MVC、Spring Boot |
| 持久层 | MyBatis、PageHelper |
| 数据库 | MySQL |
| 缓存 | Redis、Spring Cache |
| 鉴权 | JWT、拦截器、ThreadLocal |
| 文档 | Swagger / Knife4j |
| 前端 | Vue 管理端、微信小程序 |
| 其他 | Nginx、WebSocket、Spring Task、Apache POI、ECharts |

## 项目结构

```text
sky-take-out
├── sky-common   公共工具、常量、异常、JWT、上下文
├── sky-pojo     Entity / DTO / VO
└── sky-server   配置、Controller、Service、Mapper、拦截器
```

## 核心数据模型

```text
employee        员工/管理员
category        分类
dish            菜品
dish_flavor     菜品口味
setmeal         套餐
setmeal_dish    套餐-菜品关系
user            微信用户
address_book    地址簿
shopping_cart   购物车
orders          订单
order_detail    订单明细
```

## 一条典型请求链路

```text
浏览器 / 小程序
  → Nginx（可选反向代理）
  → JWT 拦截器
  → Controller
  → Service（事务、业务规则、缓存）
  → Mapper
  → MySQL / Redis
  → 统一返回 Result<T>
```

## 管理端与用户端

| 端 | 前缀 | 鉴权 |
|---|---|---|
| 管理端 | `/admin/**` | 员工 JWT，拦截器校验后写入 ThreadLocal |
| 用户端 | `/user/**` | 微信用户 JWT，拦截器校验后写入 ThreadLocal |
| 公共端 | `/notify/**` 等 | 第三方回调校验 |

## 复习主线

1. 先记“表 → 接口 → DTO/VO → Controller → Service → Mapper”。
2. 再记每个模块的业务规则，例如菜品能否删除、订单如何取消。
3. 最后记可优化点：缓存、事务、幂等、定时任务、WebSocket。

## 逐日笔记

- [day01-项目概述与环境搭建](/2026/11/26/heima-cangqiong-day01/)
- [day02-员工与分类管理](/2026/11/26/heima-cangqiong-day02/)
- [day03-菜品管理](/2026/11/26/heima-cangqiong-day03/)
- [day04-套餐管理](/2026/11/26/heima-cangqiong-day04/)
- [day05-Redis与营业状态](/2026/11/26/heima-cangqiong-day05/)
- [day06-微信登录与商品浏览](/2026/11/26/heima-cangqiong-day06/)
- [day07-缓存与购物车](/2026/11/26/heima-cangqiong-day07/)
- [day08-地址簿下单与支付](/2026/11/26/heima-cangqiong-day08/)
- [day09-历史订单与订单管理](/2026/11/26/heima-cangqiong-day09/)
- [day10-定时任务与来单提醒](/2026/11/26/heima-cangqiong-day10/)
- [day11-数据统计图表](/2026/11/26/heima-cangqiong-day11/)
- [day12-工作台与Excel导出](/2026/11/26/heima-cangqiong-day12/)

## 关联

- [两项目对比速查](/2026/11/26/heima-public-project-compare/)
- [黑马商城总览](/2026/11/26/heima-mall-overview/)
