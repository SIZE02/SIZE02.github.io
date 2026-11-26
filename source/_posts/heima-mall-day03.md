---
title: day03｜微服务拆分与远程调用
date: 2026-11-26 18:00:21
updated: 2026-11-26 18:00:21
description: 把单体按业务拆成独立服务，用 Nacos 找到对方，用 OpenFeign 像调用本地方法一样发起远程调用。
tags: [黑马, 黑马商城, SpringCloud, Nacos, OpenFeign, 笔记库, Java]
categories: [黑马商城]
---
> **一句话**
> 把单体按业务拆成独立服务，用 Nacos 找到对方，用 OpenFeign 像调用本地方法一样发起远程调用。

## 本节目标

- 能说明什么时候拆、怎么拆。
- 掌握 Nacos 注册与发现。
- 掌握 OpenFeign 声明式调用和负载均衡。

## 1. 单体与微服务

| 维度 | 单体 | 微服务 |
|---|---|---|
| 部署 | 一个包 | 多个独立服务 |
| 协作 | 共享代码库 | 按服务边界协作 |
| 扩展 | 整体扩容 | 按热点服务扩容 |
| 故障 | 一挂全挂风险高 | 可隔离 |
| 复杂度 | 低 | 高 |

拆分原则：

- 高内聚：一个服务内的业务关联紧密。
- 低耦合：服务之间依赖尽量少。
- 纵向拆：按业务模块拆。
- 横向拆：抽取公共能力。

## 2. 黑马商城拆分

```text
hm-service（单体）
  ├─ item-service    商品
  ├─ cart-service    购物车
  ├─ user-service    用户
  ├─ trade-service   交易
  ├─ pay-service     支付
  └─ hm-gateway      网关
```

## 3. RestTemplate 远程调用

拆分后不能再直接调用本地 Service：

```java
@Bean
public RestTemplate restTemplate() {
    return new RestTemplate();
}
```

```java
ItemDTO item = restTemplate.getForObject(
        "http://localhost:8081/items/" + itemId,
        ItemDTO.class);
```

问题：

- 地址写死。
- 多实例无法负载均衡。
- 服务上下线需要改配置。

因此需要注册中心。

## 4. Nacos

三个角色：

| 角色 | 职责 |
|---|---|
| 服务提供者 | 启动时注册自己 |
| 服务消费者 | 订阅并拉取实例 |
| 注册中心 | 保存实例、健康检查、推送变更 |

客户端：

```yaml
spring:
  cloud:
    nacos:
      discovery:
        server-addr: localhost:8848
```

服务名来自：

```yaml
spring:
  application:
    name: item-service
```

## 5. OpenFeign

启动类开启：

```java
@EnableFeignClients(basePackages = "com.hmall.api.client")
```

定义客户端：

```java
@FeignClient("item-service")
public interface ItemClient {
    @GetMapping("/items")
    List<ItemDTO> queryItemByIds(@RequestParam("ids") Collection<Long> ids);
}
```

调用：

```java
List<ItemDTO> items = itemClient.queryItemByIds(itemIds);
```

OpenFeign 做的事：

1. 根据服务名从注册中心取实例。
2. 通过负载均衡选一个实例。
3. 拼接 HTTP 请求。
4. 解析响应。

## 6. 连接池

默认 `HttpURLConnection` 不支持连接池。项目中常用 OKHttp：

```xml
<dependency>
    <groupId>io.github.openfeign</groupId>
    <artifactId>feign-okhttp</artifactId>
</dependency>
```

```yaml
spring:
  cloud:
    openfeign:
      okhttp:
        enabled: true
```

## 7. 最佳实践

- FeignClient 抽取到 `hm-api` 模块。
- 跨服务 DTO 也放公共模块。
- Controller 与 Feign 接口路径保持一致。
- 不在 Feign 接口中暴露 Entity。

## 8. 常见问题

| 问题 | 原因 |
|---|---|
| 找不到服务 | 服务名不一致或未注册 |
| 404 | Feign 路径与服务端不一致 |
| 405 | HTTP 方法不一致 |
| 超时 | 下游慢或连接池问题 |
| 序列化失败 | DTO 字段或构造器不匹配 |

## 9. 自测

- [ ] 能说明拆分原则。
- [ ] 能画出 Nacos 注册发现流程。
- [ ] 能手写一个 FeignClient。
- [ ] 能解释 OpenFeign 如何做负载均衡。

## 关联

- 上一篇：[day02-Docker](/2026/11/26/heima-mall-day02/)
- 下一篇：[day04-网关与配置管理](/2026/11/26/heima-mall-day04/)
