---
title: day10｜Redis 高级
date: 2026-11-26 18:00:14
updated: 2026-11-26 18:00:14
description: 高级 Redis 要同时会“高可用、扩展、底层结构、过期淘汰、缓存一致性”，黑马商城的购物车就是典型 Redis 业务。
tags: [黑马, 黑马商城, Redis, 缓存, 笔记库, Java]
categories: [黑马商城]
---
> **一句话**
> 高级 Redis 要同时会“高可用、扩展、底层结构、过期淘汰、缓存一致性”，黑马商城的购物车就是典型 Redis 业务。

## 本节目标

- 理解主从、哨兵、分片集群。
- 理解常见对象的底层编码。
- 掌握过期、淘汰和缓存一致性。

## 1. 主从复制

```text
Master → Slave1
       → Slave2
```

作用：

- 读写分离。
- 数据备份。
- 故障恢复基础。

全量同步：

```text
从节点连接主节点
  → 主节点生成 RDB
  → 发送 RDB
  → 发送期间的新写命令缓存
  → 从节点加载后继续同步
```

增量同步：

```text
基于 replid + offset
只补发断开期间缺失的命令
```

> **提示：记忆**
> 第一次或差距太大用全量，短暂断线用增量。

## 2. 哨兵

哨兵负责：

- 监控主从状态。
- 主节点故障时选举新主。
- 通知客户端新地址。

故障转移：

```text
主观下线 → 多个哨兵确认客观下线
  → 选举 leader 哨兵
  → 选择新主
  → 其他从节点指向新主
```

## 3. 分片集群

数据按槽位分布：

```text
16384 个 hash slot
slot = CRC16(key) % 16384
```

特点：

- 水平扩展。
- 每个主节点负责一部分槽。
- 客户端访问错误节点会收到 MOVED/ASK 重定向。

## 4. RedisObject

Redis 对象包含：

```text
type：String / List / Set / ZSet / Hash
encoding：底层编码
ptr：数据指针
refcount：引用计数
lru：最近访问信息
```

常见编码：

| 类型 | 小数据 | 大数据 |
|---|---|---|
| String | int / embstr | raw |
| Hash | listpack | hashtable |
| List | quicklist | quicklist |
| Set | intset / listpack | hashtable |
| ZSet | listpack | skiplist + dict |

## 5. 跳表

ZSet 需要：

- 按 score 排序。
- 支持范围查询。
- 支持插入删除。

跳表通过多级索引把链表查询从 O(n) 降到平均 O(log n)，实现比平衡树简单。

## 6. 过期删除

两种策略：

| 策略 | 说明 |
|---|---|
| 惰性删除 | 访问 key 时检查过期 |
| 定期删除 | 周期性随机抽查 |

两种结合，避免 CPU 和内存的极端。

## 7. 内存淘汰

常见策略：

- `noeviction`
- `allkeys-lru`
- `allkeys-lfu`
- `volatile-lru`
- `volatile-ttl`

LRU 看最近访问，LFU 看访问频率。

## 8. 缓存三大问题

| 问题 | 现象 | 方案 |
|---|---|---|
| 穿透 | 查不存在的数据，每次都打库 | 空值缓存、布隆过滤器 |
| 击穿 | 热点 key 失效瞬间打库 | 互斥锁、逻辑过期 |
| 雪崩 | 大量 key 同时失效 | 随机过期、多级缓存、限流 |

## 9. 缓存一致性

Cache Aside：

```text
读：缓存 → 未命中查库 → 回填
写：更新数据库 → 删除缓存
```

为什么删除而不是更新：

- 更新缓存可能产生并发覆盖。
- 删除更简单，下次读再回填。

延迟双删：

```text
更新数据库
  → 删除缓存
  → 延迟一段时间再删一次
```

适合对一致性要求较高、读并发大的场景，但仍不是强一致。

## 10. 黑马商城购物车

Redis Hash：

```text
key: cart:{userId}
field: itemId
value: 购物车条目 JSON
```

操作：

```text
HGET cart:1 1001
HINCRBY cart:1:count 1001 1
HDEL cart:1 1001
```

注意：

- 价格和库存仍以商品服务为准。
- 下单时要校验商品状态和库存。
- Redis 丢失要能降级或重建。

## 11. 自测

- [ ] 能解释全量同步和增量同步。
- [ ] 能画出哨兵故障转移。
- [ ] 能说出分片槽位计算。
- [ ] 能比较三种缓存问题。
- [ ] 能说明为什么删除缓存而不是更新。

## 关联

- 上一篇：[day09-Elasticsearch搜索实战](/2026/11/26/heima-mall-day09/)
- 下一篇：[day11-微服务面试速查](/2026/11/26/heima-mall-day11/)
