---
title: 黑马商城面试速查
date: 2026-11-26 18:00:12
updated: 2026-11-26 18:00:12
description: 黑马商城是一个基于 SpringCloud 的微服务电商系统，拆分商品、购物车、用户、交易、支付、网关等服务，使用 Nacos、OpenFeign、Gateway、Sentinel、Seata、RabbitMQ、Elasticsearch、Redis 解决服务治理、搜索、异步和一致性问题。
tags: [黑马, 黑马商城, 面试, 笔记库, Java]
categories: [黑马商城]
---
## 项目一句话介绍

黑马商城是一个基于 SpringCloud 的微服务电商系统，拆分商品、购物车、用户、交易、支付、网关等服务，使用 Nacos、OpenFeign、Gateway、Sentinel、Seata、RabbitMQ、Elasticsearch、Redis 解决服务治理、搜索、异步和一致性问题。

## 高频追问

### 1. 为什么拆微服务？

独立部署、独立扩容、故障隔离、团队边界清晰；代价是网络调用、分布式事务、运维复杂度上升。

### 2. 服务之间怎么调用？

Nacos 注册发现 + OpenFeign 声明式 HTTP 调用 + 负载均衡。Feign 接口放 `hm-api` 公共模块。

### 3. 网关做什么？

统一入口、路由、JWT 鉴权、用户信息透传、限流和日志。

### 4. 用户身份怎么传给下游？

网关解析 JWT 后把 userId 写入请求头，下游拦截器读取并放 ThreadLocal；Feign 调其他服务时继续透传请求头。

### 5. 库存怎么扣？

交易服务通过 Feign 调商品服务扣库存。要保证幂等、防止超卖，数据库层面使用条件更新：

```sql
update item_stock
set stock = stock - ?
where item_id = ? and stock >= ?
```

### 6. 下单如何保证一致性？

本地事务 + Feign 调用 + Seata/消息补偿，核心是幂等、超时、重试和人工兜底。

### 7. 为什么用 RabbitMQ？

解耦、异步、削峰。要处理消息丢失、重复、积压和延迟。

### 8. 消息可靠性怎么做？

- 生产者确认和重试。
- Broker 持久化。
- 消费者 ACK 和失败重试。
- 死信队列兜底。
- 消费幂等。

### 9. 为什么用 ES？

MySQL 不适合全文检索。ES 倒排索引支持分词、相关度、高亮、聚合和复杂查询。

### 10. 购物车为什么用 Redis？

购物车是用户维度高频读写数据，Redis Hash 快且结构简单；同时要接受数据可重建，库存和价格仍以商品服务为准。

### 11. 缓存一致性怎么保证？

Cache Aside：更新数据库后删除缓存，配合过期时间；高要求场景可用延迟双删、订阅 binlog 等。

### 12. 微服务项目难点是什么？

不是“组件多”，而是：

- 网络调用失败。
- 数据一致性。
- 链路追踪。
- 幂等。
- 缓存与数据库同步。
- 集群下的定时任务和消息重复。

## 关联

- [00-黑马商城总览](/2026/11/26/heima-mall-overview/)
- [两项目对比速查](/2026/11/26/heima-public-project-compare/)
