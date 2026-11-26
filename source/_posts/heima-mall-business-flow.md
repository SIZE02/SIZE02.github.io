---
title: 黑马商城核心业务链路
date: 2026-11-26 18:00:11
updated: 2026-11-26 18:00:11
description: 把用户登录、商品浏览、购物车、下单、支付、搜索串成一条线，才能把零散组件讲成项目经历。
tags: [黑马, 黑马商城, 业务链路, 笔记库, Java]
categories: [黑马商城]
---
> **一句话**
> 把用户登录、商品浏览、购物车、下单、支付、搜索串成一条线，才能把零散组件讲成项目经历。

## 1. 登录

```text
前端提交账号密码
  → user-service 校验用户
  → 生成 JWT
  → 前端保存 token
  → 后续请求带 Authorization
  → 网关校验并解析 userId
```

服务端要点：

- 密码加密存储。
- JWT 设置过期时间。
- 网关白名单放行登录、注册、商品浏览。
- 下游不直接信任外部请求头。

## 2. 商品浏览

```text
请求 → 网关 → item-service
  → 查询 item
  → 查询库存 item_stock
  → 返回商品详情
```

如果使用缓存：

```text
先查 Redis
  → 未命中查 MySQL
  → 回填缓存
```

## 3. 购物车

```text
请求 → 网关 → cart-service
  → 从用户上下文取 userId
  → Redis Hash 读写
  → 调用 item-service 校验商品
  → 返回购物车列表
```

购物车字段：

```text
itemId
name
price
image
quantity
status
```

注意：

- 价格和库存以商品服务为准。
- 购物车只是临时数据，可重建。
- 下单前重新校验商品状态。

## 4. 下单

```text
请求 → 网关 → trade-service
  → Feign 查询购物车
  → Feign 查询商品和库存
  → 计算金额
  → 写 order / order_detail
  → Feign 扣库存
  → Feign 清购物车
  → 返回订单
```

一致性挑战：

- 订单写成功、库存扣失败。
- 库存扣成功、购物车清失败。
- 网络超时导致重复请求。

处理：

- Seata 或消息补偿。
- 请求幂等号。
- 库存条件更新。
- 失败重试和人工补偿。

## 5. 支付

```text
请求 → 网关 → pay-service
  → 创建支付单
  → 调用支付渠道
  → 返回支付参数
  → 渠道回调
  → 验签
  → 更新支付单和订单状态
  → 发消息通知交易服务
```

回调三要素：

- 验签。
- 幂等。
- 状态机校验。

## 6. 搜索

```text
商品变更
  → 发消息
  → 搜索服务消费
  → 更新 ES 文档

用户搜索
  → 网关 → 搜索接口
  → 构造 DSL
  → ES 查询
  → 返回高亮、分页、聚合结果
```

## 7. 一条面试讲述线

```text
我先做单体商城，理解业务；
后来按商品、购物车、用户、交易、支付拆分；
用 Nacos 注册发现、OpenFeign 调用、Gateway 统一鉴权；
用 Sentinel 防雪崩，Seata/MQ 处理一致性；
用 RabbitMQ 做异步和延迟取消，用 ES 做商品搜索，用 Redis 做购物车和缓存。
```

## 关联

- [00-黑马商城总览](/2026/11/26/heima-mall-overview/)
- [day03-微服务拆分与远程调用](/2026/11/26/heima-mall-day03/)
- [day04-网关与配置管理](/2026/11/26/heima-mall-day04/)
- [day05-服务保护与分布式事务](/2026/11/26/heima-mall-day05/)
- [day09-Elasticsearch搜索实战](/2026/11/26/heima-mall-day09/)
- [day10-Redis高级](/2026/11/26/heima-mall-day10/)
