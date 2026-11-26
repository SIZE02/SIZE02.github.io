---
title: day08｜地址簿、下单与支付
date: 2026-11-26 18:00:30
updated: 2026-11-26 18:00:30
description: 下单是把购物车快照转成订单和订单明细，支付则是把订单状态从“待付款”推进到“待接单”。
tags: [黑马, 苍穹外卖, Java, 订单, 微信支付, 笔记库]
categories: [苍穹外卖]
---
> **一句话**
> 下单是把购物车快照转成订单和订单明细，支付则是把订单状态从“待付款”推进到“待接单”。

## 本节目标

- 掌握地址簿的 CRUD 和默认地址规则。
- 掌握订单主表与明细表的写入。
- 理解微信支付的回调与幂等。

## 1. 地址簿

接口：

| 功能 | 路径 |
|---|---|
| 新增地址 | `POST /user/addressBook` |
| 查询列表 | `GET /user/addressBook/list` |
| 查询默认地址 | `GET /user/addressBook/default` |
| 修改地址 | `PUT /user/addressBook` |
| 删除地址 | `DELETE /user/addressBook` |
| 设置默认 | `PUT /user/addressBook/default` |

默认地址规则：

- 每个用户最多一个默认地址。
- 设置新默认时，先把该用户其他地址改为非默认。
- 查询和修改地址都要带 `user_id`，防止越权。

## 2. 下单流程

```text
选择地址
  → 查询购物车
  → 校验购物车非空
  → 计算总金额
  → 写入 orders
  → 写入 order_detail
  → 清空购物车
  → 返回订单 id / 订单号
```

### 为什么要有订单明细

订单是交易快照。即使菜品后来改价、下架或删除，历史订单仍要保留当时的信息。

```text
orders 1 ── N order_detail
```

### 订单字段

| 字段 | 说明 |
|---|---|
| `number` | 订单号 |
| `status` | 订单状态 |
| `user_id` | 下单用户 |
| `address_book_id` | 地址 |
| `order_time` | 下单时间 |
| `pay_status` | 支付状态 |
| `pay_method` | 支付方式 |
| `amount` | 订单金额 |
| `remark` | 备注 |

## 3. 订单状态

常见状态：

```text
1 待付款
2 待接单
3 已接单
4 派送中
5 已完成
6 已取消
```

不同状态允许的操作不同，Service 必须先校验状态，再执行动作。

## 4. 下单代码骨架

```java
@Transactional
public OrderSubmitVO submit(OrdersSubmitDTO dto) {
    Long userId = BaseContext.getCurrentId();
    List<ShoppingCart> cartList = cartMapper.listByUserId(userId);
    if (cartList == null || cartList.isEmpty()) {
        throw new OrderBusinessException("购物车为空");
    }

    Orders order = buildOrder(dto, userId, cartList);
    orderMapper.insert(order);

    List<OrderDetail> details = cartList.stream()
            .map(item -> buildDetail(order.getId(), item))
            .toList();
    orderDetailMapper.insertBatch(details);

    cartMapper.deleteByUserId(userId);
    return new OrderSubmitVO(order.getId(), order.getNumber(), order.getOrderTime(), order.getAmount());
}
```

> **注意：事务边界**
> 写订单、写明细、清购物车必须同一事务。金额要在服务端重新计算，不能直接信任前端。

## 5. 微信支付

支付流程：

```text
小程序请求支付
  → 后端创建支付单
  → 调用微信支付下单接口
  → 返回预支付参数
  → 小程序拉起支付
  → 微信回调后端
  → 校验签名
  → 更新订单支付状态
```

关键点：

- 商户号、私钥、证书等敏感配置放服务端。
- 回调必须验签。
- 回调可能重复，必须幂等。
- 支付成功后要更新订单状态并通知商家端。

## 6. 支付幂等

幂等设计：

```text
根据订单号查询支付单
  → 已支付：直接返回成功
  → 未支付：执行更新
```

或用唯一约束保证同一订单只处理一次。

## 7. 自测

- [ ] 能画出下单到支付的状态流转。
- [ ] 能解释订单明细为什么要存快照。
- [ ] 能说明默认地址的更新规则。
- [ ] 能说出支付回调的三个安全点。

## 关联

- 上一篇：[day07-缓存与购物车](/2026/11/26/heima-cangqiong-day07/)
- 下一篇：[day09-历史订单与订单管理](/2026/11/26/heima-cangqiong-day09/)
