---
title: day05｜Redis 与营业状态
date: 2026-11-26 18:00:33
updated: 2026-11-26 18:00:33
description: Redis 负责保存高频、临时、可快速读取的数据；本模块先用一个“营业状态”键建立缓存思维。
tags: [黑马, 苍穹外卖, Redis, Java, SpringDataRedis, 笔记库]
categories: [苍穹外卖]
---
> **一句话**
> Redis 负责保存高频、临时、可快速读取的数据；本模块先用一个“营业状态”键建立缓存思维。

## 本节目标

- 掌握 Redis 五种常用数据结构和常用命令。
- 会用 Spring Data Redis 操作字符串和对象。
- 能用 Redis 保存店铺营业状态。

## 1. Redis 为什么快

- 数据在内存中。
- 单线程处理命令，避免锁竞争。
- IO 多路复用。
- 数据结构针对场景优化。

它不是 MySQL 的替代品，而是缓存和临时状态存储。

## 2. 五种常用数据结构

| 类型 | 典型场景 | 常用命令 |
|---|---|---|
| String | 验证码、状态、序列化对象 | `SET GET INCR EXPIRE` |
| Hash | 对象字段局部更新 | `HSET HGET HGETALL` |
| List | 队列、最新列表 | `LPUSH RPUSH LPOP RPOP` |
| Set | 去重、交集并集 | `SADD SMEMBERS SINTER` |
| ZSet | 排行榜、延迟队列 | `ZADD ZRANGE ZSCORE` |

## 3. Spring Data Redis

依赖：

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-redis</artifactId>
</dependency>
```

配置：

```yaml
spring:
  data:
    redis:
      host: localhost
      port: 6379
      database: 0
```

常用操作：

```java
@Autowired
private StringRedisTemplate redisTemplate;

redisTemplate.opsForValue().set("shop:status", "1");
String status = redisTemplate.opsForValue().get("shop:status");
```

> **提示：序列化**
> 存对象时可以用 JSON 序列化，避免 JDK 序列化带来的可读性差和兼容性问题。

## 4. 营业状态需求

| 操作 | 端 | 接口 |
|---|---|---|
| 设置状态 | 管理端 | `PUT /admin/shop/{status}` |
| 查询状态 | 管理端 | `GET /admin/shop/status` |
| 查询状态 | 用户端 | `GET /user/shop/status` |

状态值：

```text
1 = 营业中
0 = 打烊
```

## 5. 为什么用 Redis

- 营业状态是单个高频读取的小状态。
- 不需要复杂查询和历史记录。
- 用 MySQL 每次查库成本高。
- Redis 的 `String` 正好适合这种键值。

```java
private static final String KEY = "SHOP_STATUS";

public void setStatus(Integer status) {
    redisTemplate.opsForValue().set(KEY, status.toString());
}

public Integer getStatus() {
    String value = redisTemplate.opsForValue().get(KEY);
    return value == null ? 0 : Integer.valueOf(value);
}
```

## 6. 缓存设计的三问

写任何缓存前先问：

1. 数据是否读多写少？
2. 能接受短暂不一致吗？
3. 缓存失效后如何回源？

营业状态可以接受短暂不一致，读取频率高，适合缓存。

## 7. 易错点

- 忘记配置 Redis 连接，启动时报连接拒绝。
- key 命名没有业务前缀，后期难维护。
- 直接存对象但没有统一序列化方式。
- 把 Redis 当唯一数据库，未考虑持久化和丢失风险。

## 8. 自测

- [ ] 能说出五种数据类型及使用场景。
- [ ] 能用 `StringRedisTemplate` 完成读写。
- [ ] 能解释营业状态为什么适合 Redis。
- [ ] 能为 key 设计统一的命名规范。

## 关联

- 上一篇：[day04-套餐管理](/2026/11/26/heima-cangqiong-day04/)
- 下一篇：[day06-微信登录与商品浏览](/2026/11/26/heima-cangqiong-day06/)
- [缓存方案对比](/2026/11/26/heima-public-project-compare/)
