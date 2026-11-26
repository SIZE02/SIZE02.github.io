---
title: day05｜服务保护与分布式事务
date: 2026-11-26 18:00:19
updated: 2026-11-26 18:00:19
description: Sentinel 防止一个慢服务拖垮整条链路；Seata 解决一次业务跨多个服务、多个数据库时如何保持一致。
tags: [黑马, 黑马商城, Sentinel, Seata, 分布式事务, 笔记库, Java]
categories: [黑马商城]
---
> **一句话**
> Sentinel 防止一个慢服务拖垮整条链路；Seata 解决一次业务跨多个服务、多个数据库时如何保持一致。

## 本节目标

- 理解雪崩问题和常见保护方案。
- 掌握 Sentinel 的限流、线程隔离、熔断和 fallback。
- 理解 CAP/BASE 与 Seata 的 AT、TCC 模式。

## 1. 雪崩问题

```text
服务 D 变慢
  → 服务 C 的线程被占满
  → 服务 B 的线程被占满
  → 服务 A 也不可用
```

常见原因：

- 下游响应慢。
- 调用方没有超时控制。
- 线程池/连接池耗尽。
- 故障向上传播。

## 2. 保护方案

| 方案 | 解决问题 |
|---|---|
| 请求限流 | 控制进入系统的流量 |
| 线程隔离 | 限制某个依赖占用的线程数 |
| 超时控制 | 避免无限等待 |
| 熔断降级 | 下游故障时快速失败 |
| Fallback | 返回兜底结果 |

## 3. Sentinel

核心概念：

| 概念 | 说明 |
|---|---|
| 资源 | 被保护的接口或方法 |
| 规则 | 限流、熔断、热点等 |
| 簇点链路 | 请求经过的资源路径 |

引入：

```xml
<dependency>
    <groupId>com.alibaba.cloud</groupId>
    <artifactId>spring-cloud-starter-alibaba-sentinel</artifactId>
</dependency>
```

## 4. 请求限流

例如 QPS 限制为 10：

```text
超过阈值的请求直接拒绝或排队
```

限流保护的是系统，不是用户。被限流的请求要返回明确提示，不能无限等待。

## 5. 线程隔离

给某个下游依赖分配固定线程数：

```text
依赖 A 最多占 10 个线程
依赖 A 变慢时，只耗尽这 10 个线程
不会拖垮整个服务
```

线程池隔离和信号量隔离的区别：

| 方式 | 特点 |
|---|---|
| 线程池隔离 | 隔离彻底，有线程切换开销 |
| 信号量隔离 | 轻量，但隔离性弱 |

## 6. 熔断

熔断器状态：

```text
关闭 → 打开 → 半开
```

- 关闭：正常放行。
- 打开：直接失败，不调用下游。
- 半开：放少量请求探测下游是否恢复。

## 7. Fallback

```java
@SentinelResource(value = "queryItem", fallback = "queryItemFallback")
public Item queryItem(Long id) {
    return itemClient.queryById(id);
}

public Item queryItemFallback(Long id, Throwable ex) {
    return new Item();
}
```

Fallback 要区分：

- 业务异常：通常不应该被吞掉。
- 限流/熔断异常：可以返回兜底数据。

## 8. 分布式事务

本地事务只能保证一个数据库连接内的一致性。跨服务后：

```text
trade-service 创建订单
  + item-service 扣库存
  + cart-service 清购物车
  + pay-service 创建支付单
```

任意一步失败，都要整体回滚或补偿。

## 9. CAP 与 BASE

CAP：

- Consistency 一致性。
- Availability 可用性。
- Partition tolerance 分区容错性。

分布式系统必须接受网络分区，因此通常是在 C 和 A 之间取舍。

BASE：

- Basically Available：基本可用。
- Soft state：软状态。
- Eventually consistent：最终一致。

大部分互联网业务选择最终一致。

## 10. Seata

三个角色：

| 角色 | 职责 |
|---|---|
| TC | 事务协调者 |
| TM | 事务管理者，开启/提交/回滚全局事务 |
| RM | 资源管理者，管理分支事务 |

AT 模式：

```text
一阶段：执行业务 SQL，记录 undo log，提交本地事务
二阶段：全局提交则异步清理，全局回滚则根据 undo log 反向补偿
```

AT 的注意点：

- 需要主键。
- 需要支持本地事务。
- 全局锁会影响并发。
- 隔离性不是强隔离。

TCC：

```text
Try    预留资源
Confirm 确认执行
Cancel  取消预留
```

优点是灵活、性能好；缺点是要自己写三个方法，业务侵入大。

## 11. 下单事务怎么选

| 场景 | 方案 |
|---|---|
| 强一致、短事务 | Seata AT |
| 高并发、可补偿 | TCC / 可靠消息 |
| 最终一致 | MQ + 幂等 |

> **重点：面试表达**
> 不建议说“用了 Seata 就解决分布式事务”，要说明业务是否真的需要强一致，以及补偿、幂等、超时和人工兜底。

## 12. 自测

- [ ] 能解释雪崩产生原因。
- [ ] 能区分限流、隔离、熔断。
- [ ] 能说明 Seata 三个角色。
- [ ] 能比较 AT 和 TCC。

## 关联

- 上一篇：[day04-网关与配置管理](/2026/11/26/heima-mall-day04/)
- 下一篇：[day06-MQ基础](/2026/11/26/heima-mall-day06/)
