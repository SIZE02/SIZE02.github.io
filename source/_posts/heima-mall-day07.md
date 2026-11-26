---
title: day07｜MQ 高级
date: 2026-11-26 18:00:17
updated: 2026-11-26 18:00:17
description: MQ 高级解决三件事：消息别丢、别重复、别延迟错；对应可靠性、幂等和延迟消息。
tags: [黑马, 黑马商城, RabbitMQ, 消息可靠性, 笔记库, Java]
categories: [黑马商城]
---
> **一句话**
> MQ 高级解决三件事：消息别丢、别重复、别延迟错；对应可靠性、幂等和延迟消息。

## 本节目标

- 掌握发送者确认、持久化、消费者确认。
- 理解幂等的常见实现。
- 掌握死信交换机和延迟消息。

## 1. 消息可靠性三个环节

```text
生产者 → Broker → 消费者
  ①        ②        ③
```

| 环节 | 风险 | 措施 |
|---|---|---|
| 生产者 | 消息未到 Broker | 重连、确认、重试 |
| Broker | 消息丢失 | 持久化、Lazy Queue |
| 消费者 | 处理失败后丢失 | ACK、失败重试、死信 |

## 2. 发送者确认

开启：

```yaml
spring:
  rabbitmq:
    publisher-confirm-type: correlated
    publisher-returns: true
```

确认回调：

```java
rabbitTemplate.setConfirmCallback((correlationData, ack, cause) -> {
    if (!ack) {
        // 记录失败消息，重试或落库
    }
});
```

注意：

- confirm 只表示 Broker 收到。
- return 表示消息到达交换机但没有路由到队列。
- 两者覆盖的问题不同。

## 3. 消息持久化

- 交换机持久化。
- 队列持久化。
- 消息持久化。

```java
Message message = MessageBuilder
        .withBody(body)
        .setDeliveryMode(MessageDeliveryMode.PERSISTENT)
        .build();
```

Lazy Queue 会把消息尽量直接写磁盘，适合堆积场景。

## 4. 消费者确认

| 模式 | 行为 |
|---|---|
| `none` | 自动确认，可能丢消息 |
| `auto` | 方法正常返回则 ACK，异常则 NACK |
| `manual` | 手动 ACK |

SpringAMQP 常用：

```yaml
spring:
  rabbitmq:
    listener:
      simple:
        acknowledge-mode: auto
        retry:
          enabled: true
          max-attempts: 3
```

## 5. 失败重试与死信

```text
消费失败
  → 本地重试
  → 超过次数
  → 投递到死信交换机
  → 人工/补偿程序处理
```

死信来源：

- 被拒绝且不重新入队。
- 消息过期。
- 队列达到最大长度。

## 6. 幂等

消息可能重复，消费逻辑必须幂等。

常见方案：

| 方案 | 说明 |
|---|---|
| 唯一约束 | 数据库唯一键拦截重复 |
| 业务状态判断 | 已处理则直接返回 |
| 去重表 | 记录消息 id |
| Redis setnx | 短期去重 |

```java
if (order.getStatus() == PAID) {
    return;
}
```

## 7. 延迟消息

场景：

- 下单 15 分钟未支付自动取消。
- 订单完成后延迟发评价提醒。

两种方式：

1. 死信交换机 + TTL。
2. 延迟消息插件。

TTL 方式：

```text
消息进入普通队列
  → 消息过期
  → 进入死信交换机
  → 路由到延迟处理队列
```

延迟插件方式更简单：

```java
rabbitTemplate.convertAndSend("delay.exchange", "order.delay",
        message, msg -> {
            msg.getMessageProperties().setDelay(900_000);
            return msg;
        });
```

## 8. 订单超时取消设计

```text
下单成功 → 发送 15 分钟延迟消息
  → 消费者收到
  → 查询订单状态
  → 仍未支付则取消
  → 已支付则忽略
```

此设计必须幂等，并处理消息延迟误差。

## 9. 易错点

- 只开 confirm 不开 return，路由失败发现不了。
- 消费者重试但没有死信队列，消息反复堆积。
- 先发消息后提交本地事务。
- 延迟消息不做幂等。
- 队列积压后仍使用短 TTL。

## 10. 自测

- [ ] 能画出消息可靠性的三个环节。
- [ ] 能说明 confirm 和 return 的区别。
- [ ] 能设计消费幂等。
- [ ] 能用两种方式实现延迟消息。

## 关联

- 上一篇：[day06-MQ基础](/2026/11/26/heima-mall-day06/)
- 下一篇：[day08-Elasticsearch基础](/2026/11/26/heima-mall-day08/)
