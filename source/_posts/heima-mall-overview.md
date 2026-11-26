---
title: 黑马商城总览
date: 2026-11-26 18:00:24
updated: 2026-11-26 18:00:24
description: 把单体 hm-service 拆成商品、购物车、用户、交易、支付、网关等微服务，围绕 SpringCloud、Nacos、OpenFeign、Sentinel、Seata、RabbitMQ、Elasticsearch、Redis 完成一个可讲清楚的电商系统。
tags: [黑马, 黑马商城, Java, SpringCloud, 微服务, 笔记库]
categories: [黑马商城]
---
> **一句话**
> 把单体 `hm-service` 拆成商品、购物车、用户、交易、支付、网关等微服务，围绕 SpringCloud、Nacos、OpenFeign、Sentinel、Seata、RabbitMQ、Elasticsearch、Redis 完成一个可讲清楚的电商系统。

## 课程模块顺序

| 天数 | 模块 | 主要内容 |
|---|---|---|
| day01 | MyBatis-Plus | BaseMapper、IService、条件构造器、逻辑删除、代码生成 |
| day02 | Docker | 镜像、容器、数据卷、Dockerfile、网络、Compose |
| day03 | 微服务 01 | 服务拆分、RestTemplate、Nacos、OpenFeign、负载均衡 |
| day04 | 微服务 02 | Gateway 路由/过滤器、JWT 登录校验、配置管理 |
| day05 | 服务保护与分布式事务 | Sentinel、熔断限流、Seata AT/TCC |
| day06 | MQ 基础 | 同步/异步、RabbitMQ、SpringAMQP、交换机 |
| day07 | MQ 高级 | 消息可靠性、消费者确认、幂等、延迟消息 |
| day08 | Elasticsearch 01 | 倒排索引、IK、Mapping、文档操作、Java 客户端 |
| day09 | Elasticsearch 02 | DSL 查询、排序分页、高亮、聚合、搜索业务 |
| day10 | Redis 高级 | 主从、哨兵、分片集群、对象编码、淘汰、缓存一致性 |
| day11 | 微服务面试 | 分布式事务、注册中心、负载均衡、服务保护等 |

## 微服务架构

```text
前端
  → hm-gateway :8080
      → item-service :8081
      → cart-service :8082
      → user-service :8084
      → trade-service :8085
      → pay-service :8086

基础设施
  Nacos :8848
  MySQL :3306
  Redis :6379
  RabbitMQ :5672 / 15672
  Elasticsearch :9200
```

## 公共模块

```text
hm-api        Feign 客户端和跨服务 DTO
hm-common     通用工具、异常、配置
hm-gateway    网关、路由、鉴权
hm-service    拆分前的单体服务
```

## 业务模块

| 模块 | 服务 | 数据 |
|---|---|---|
| 商品 | item-service | `item`、`item_stock`、ES 索引 |
| 购物车 | cart-service | Redis `cart:{userId}` |
| 用户 | user-service | `user`、`address` |
| 交易 | trade-service | `order`、`order_detail`、`order_logistics` |
| 支付 | pay-service | `pay_order` |
| 网关 | hm-gateway | 路由、鉴权、用户透传 |

## 一条下单链路

```text
用户请求
  → 网关校验 JWT
  → 请求头带 userId 转发
  → trade-service 下单
  → Feign 调 item-service 扣库存
  → Feign 调 cart-service 清购物车
  → Feign 调 pay-service 创建支付单
  → 返回订单信息
```

这条链路同时涉及：

- 服务发现与远程调用。
- 用户身份透传。
- 分布式事务。
- 消息可靠性。
- 接口幂等。

## 与苍穹外卖的对比

| 维度 | 苍穹外卖 | 黑马商城 |
|---|---|---|
| 架构 | 单体 | 微服务 |
| 服务调用 | 本地方法 | HTTP/Feign |
| 数据 | 单库多表 | 按服务拆库 |
| 鉴权 | 后端拦截器 | 网关统一校验 |
| 事务 | 本地事务 | 分布式事务 |
| 缓存 | Redis + Spring Cache | Redis 购物车 |
| 搜索 | MySQL | Elasticsearch |
| 异步 | 少量定时任务 | RabbitMQ |

## 学习建议

1. 先理解“为什么拆”，再记“怎么拆”。
2. 每个组件都按“解决什么问题 → 怎么用 → 有什么坑”记。
3. 不要只背注解，要能画出一条请求经过哪些服务。
4. 面试时把苍穹外卖当业务主线，把黑马商城当架构升级。

## 逐篇笔记

- [day01-MyBatisPlus](/2026/11/26/heima-mall-day01/)
- [day02-Docker](/2026/11/26/heima-mall-day02/)
- [day03-微服务拆分与远程调用](/2026/11/26/heima-mall-day03/)
- [day04-网关与配置管理](/2026/11/26/heima-mall-day04/)
- [day05-服务保护与分布式事务](/2026/11/26/heima-mall-day05/)
- [day06-MQ基础](/2026/11/26/heima-mall-day06/)
- [day07-MQ高级](/2026/11/26/heima-mall-day07/)
- [day08-Elasticsearch基础](/2026/11/26/heima-mall-day08/)
- [day09-Elasticsearch搜索实战](/2026/11/26/heima-mall-day09/)
- [day10-Redis高级](/2026/11/26/heima-mall-day10/)
- [day11-微服务面试速查](/2026/11/26/heima-mall-day11/)

## 关联

- [苍穹外卖总览](/2026/11/26/heima-cangqiong-overview/)
- [两项目对比速查](/2026/11/26/heima-public-project-compare/)
