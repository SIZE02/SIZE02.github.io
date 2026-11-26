---
title: day06｜MQ 基础
date: 2026-11-26 18:00:18
updated: 2026-11-26 18:00:18
description: MQ 把同步调用改成异步消息，起到解耦、削峰和异步通知的作用；RabbitMQ 用交换机把消息路由到队列。
tags: [黑马, 黑马商城, RabbitMQ, 消息队列, 笔记库, Java]
categories: [黑马商城]
---
> **一句话**
> MQ 把同步调用改成异步消息，起到解耦、削峰和异步通知的作用；RabbitMQ 用交换机把消息路由到队列。

## 本节目标

- 理解同步调用与异步调用的取舍。
- 掌握 RabbitMQ 核心模型和交换机类型。
- 会用 SpringAMQP 发送和接收消息。

## 1. 同步调用的问题

```text
下单 → 扣库存 → 发短信 → 加积分 → 返回
```

问题：

- 链路长，响应慢。
- 任一非核心步骤失败会影响下单。
- 流量高峰会压垮下游。

## 2. 异步调用

```text
下单 → 发消息到 MQ → 立即返回
                    ↘ 短信服务消费
                    ↘ 积分服务消费
```

优点：

- 解耦。
- 削峰。
- 提升响应速度。

缺点：

- 消息可能重复、丢失、乱序。
- 系统复杂度提高。
- 需要处理最终一致。

## 3. RabbitMQ 核心模型

| 概念 | 说明 |
|---|---|
| Producer | 发送消息 |
| Consumer | 消费消息 |
| Queue | 存储消息 |
| Exchange | 接收消息并路由 |
| Binding | 交换机与队列的绑定 |
| Virtual Host | 逻辑隔离 |

```text
Producer → Exchange → Binding → Queue → Consumer
```

## 4. 交换机类型

| 类型 | 路由规则 |
|---|---|
| Fanout | 广播到所有绑定队列 |
| Direct | 按 routing key 精确匹配 |
| Topic | 按通配符匹配 |
| Headers | 按消息头匹配 |

Topic 通配符：

```text
* 匹配一个单词
# 匹配零个或多个单词
```

例如：

```text
item.*.created
item.#
```

## 5. SpringAMQP

配置：

```yaml
spring:
  rabbitmq:
    host: localhost
    port: 5672
    username: guest
    password: guest
```

发送：

```java
rabbitTemplate.convertAndSend("trade.topic", "order.created", message);
```

监听：

```java
@RabbitListener(queues = "trade.order.queue")
public void listen(OrderMessage message) {
    // 处理消息
}
```

## 6. Work Queue

多个消费者监听同一队列：

```text
消息 → 队列 → 消费者 A / 消费者 B
```

默认轮询分发。需要注意：

- 消费速度不同会导致负载不均。
- 需要设置 `prefetch` 控制预取数量。

```yaml
spring:
  rabbitmq:
    listener:
      simple:
        prefetch: 1
```

## 7. 消息转换

默认 Java 序列化可读性差、兼容性差。项目中通常使用 JSON：

```java
@Bean
public MessageConverter messageConverter() {
    return new Jackson2JsonMessageConverter();
}
```

## 8. 何时不该用 MQ

- 必须强一致、同步返回结果。
- 业务链路短且下游稳定。
- 团队没有消息可靠性和运维能力。

> **注意：不要在事务提交前发消息**
> 如果数据库回滚但消息已发出，就会产生脏消息。常见做法是本地消息表或事务消息。

## 9. 自测

- [ ] 能画出 RabbitMQ 模型。
- [ ] 能区分三种常用交换机。
- [ ] 能写出 SpringAMQP 的发送和监听。
- [ ] 能说明 MQ 的优缺点。

## 关联

- 上一篇：[day05-服务保护与分布式事务](/2026/11/26/heima-mall-day05/)
- 下一篇：[day07-MQ高级](/2026/11/26/heima-mall-day07/)
