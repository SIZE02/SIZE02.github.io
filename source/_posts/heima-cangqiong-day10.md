---
title: day10｜定时任务与来单提醒
date: 2026-11-26 18:00:28
updated: 2026-11-26 18:00:28
description: Spring Task 负责“到点自动处理订单”，WebSocket 负责“订单来了立即通知商家”，两者分别解决延迟和实时问题。
tags: [黑马, 苍穹外卖, Java, SpringTask, WebSocket, 笔记库]
categories: [苍穹外卖]
---
> **一句话**
> Spring Task 负责“到点自动处理订单”，WebSocket 负责“订单来了立即通知商家”，两者分别解决延迟和实时问题。

## 本节目标

- 掌握 cron 表达式和 Spring Task。
- 理解 WebSocket 与 HTTP 的区别。
- 掌握来单提醒和客户催单的实现。

## 1. Spring Task

开启定时任务：

```java
@EnableScheduling
@SpringBootApplication
public class SkyApplication {
}
```

定义任务：

```java
@Component
public class OrderTask {

    @Scheduled(cron = "0 * * * * ?")
    public void processTimeoutOrder() {
        // 每分钟处理一次
    }
}
```

## 2. cron 表达式

```text
秒 分 时 日 月 周
```

示例：

| 表达式 | 含义 |
|---|---|
| `0 * * * * ?` | 每分钟第 0 秒 |
| `0 0 2 * * ?` | 每天 02:00 |
| `0 0/5 * * * ?` | 每 5 分钟 |

> **提示：记忆**
> `?` 常用于“日/周”互斥，表示不指定；`*` 表示任意值。

## 3. 订单超时处理

常见规则：

- 待付款订单超时未支付，自动取消。
- 派送中订单长时间未完成，自动完成。

```java
@Scheduled(cron = "0 * * * * ?")
public void cancelUnpaidOrders() {
    LocalDateTime deadline = LocalDateTime.now().minusMinutes(15);
    List<Orders> orders = orderMapper.listByStatusAndBefore(
            Orders.PENDING_PAYMENT, deadline);
    for (Orders order : orders) {
        orderMapper.updateStatus(order.getId(), Orders.CANCELLED);
    }
}
```

多实例部署时要注意：定时任务会重复执行，需要分布式锁或调度中心。

## 4. WebSocket

HTTP 是“请求-响应”，WebSocket 建立长连接后，服务端可以主动推送。

```text
浏览器/管理端
  ⇄ WebSocket 长连接 ⇄ 后端
```

适用场景：

- 来单提醒。
- 客户催单。
- 实时聊天、进度通知。

## 5. WebSocket Server

```java
@Component
@ServerEndpoint("/ws/{sid}")
public class WebSocketServer {

    private static final Map<String, Session> SESSION_MAP = new ConcurrentHashMap<>();

    @OnOpen
    public void onOpen(Session session, @PathParam("sid") String sid) {
        SESSION_MAP.put(sid, session);
    }

    @OnMessage
    public void onMessage(String message) {
    }

    @OnClose
    public void onClose(@PathParam("sid") String sid) {
        SESSION_MAP.remove(sid);
    }
}
```

发送消息：

```java
public static void sendToAll(String message) {
    SESSION_MAP.values().forEach(session -> {
        try {
            session.getBasicRemote().sendText(message);
        } catch (IOException e) {
            // 记录日志并按需清理失效连接
        }
    });
}
```

## 6. 来单提醒

支付成功后：

```text
支付回调
  → 更新订单状态
  → 构造提醒消息
  → WebSocket 推送给管理端
  → 管理端播放语音/弹窗
```

消息类型可用枚举区分：

```json
{
  "type": 1,
  "orderId": 123,
  "content": "您有新的订单"
}
```

## 7. 客户催单

```text
用户点击催单
  → 校验订单属于当前用户
  → 校验订单状态
  → 推送催单消息给管理端
```

催单是通知动作，不应直接修改订单核心状态。

## 8. 易错点

- `@ServerEndpoint` 注入 Spring Bean 时默认会失败，需要用静态引用或专用配置。
- WebSocket 连接可能断开，发送前要判断 session 是否 open。
- 定时任务多实例会重复执行。
- 推送消息不宜包含敏感信息。

## 9. 自测

- [ ] 能写常见的 cron 表达式。
- [ ] 能解释 WebSocket 与轮询的区别。
- [ ] 能设计来单提醒的消息结构。
- [ ] 能说明定时任务在集群下的问题。

## 关联

- 上一篇：[day09-历史订单与订单管理](/2026/11/26/heima-cangqiong-day09/)
- 下一篇：[day11-数据统计图表](/2026/11/26/heima-cangqiong-day11/)
