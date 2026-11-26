---
title: day09｜历史订单与订单管理
date: 2026-11-26 18:00:29
updated: 2026-11-26 18:00:29
description: 用户端关心自己的历史订单，管理端关心全店订单的状态流转；两端共用订单数据，但权限和可见范围不同。
tags: [黑马, 苍穹外卖, Java, 订单, 笔记库]
categories: [苍穹外卖]
---
> **一句话**
> 用户端关心自己的历史订单，管理端关心全店订单的状态流转；两端共用订单数据，但权限和可见范围不同。

## 本节目标

- 掌握用户历史订单分页和详情。
- 掌握管理端条件查询与各状态操作。
- 理解订单状态机与权限边界。

## 1. 用户端接口

| 功能 | 方法 | 路径 |
|---|---|---|
| 历史订单 | GET | `/user/order/historyOrders` |
| 订单详情 | GET | `/user/order/orderDetail/{id}` |
| 取消订单 | PUT | `/user/order/cancel/{id}` |
| 再来一单 | POST | `/user/order/repetition/{id}` |

### 历史订单查询

必须强制拼接当前用户：

```sql
select * from orders
where user_id = ?
order by order_time desc
```

可选状态筛选：

```text
status = 1 待付款
status = 2 待接单
...
```

### 订单详情

订单详情 = 主表 + 明细：

```text
orders
  → order_detail
  → 地址信息 / 菜品快照
```

> **重点：权限**
> 用户查详情时必须同时校验 `id` 和 `user_id`，不能只按订单 id 查询。

### 再来一单

把历史订单明细重新加入购物车：

1. 校验订单属于当前用户。
2. 遍历订单明细。
3. 转换为购物车记录。
4. 合并已存在商品。

## 2. 管理端接口

| 功能 | 路径 |
|---|---|
| 条件分页查询 | `/admin/order/conditionSearch` |
| 订单统计 | `/admin/order/statistics` |
| 订单详情 | `/admin/order/details/{id}` |
| 接单 | `/admin/order/confirm` |
| 拒单 | `/admin/order/rejection` |
| 取消订单 | `/admin/order/cancel` |
| 派送 | `/admin/order/delivery/{id}` |
| 完成 | `/admin/order/complete/{id}` |

## 3. 条件查询

筛选条件：

- 订单号。
- 手机号。
- 订单状态。
- 下单时间范围。

动态 SQL 思路：

```xml
<where>
  <if test="number != null and number != ''">
    and number like concat('%', #{number}, '%')
  </if>
  <if test="phone != null and phone != ''">
    and phone like concat('%', #{phone}, '%')
  </if>
  <if test="status != null">
    and status = #{status}
  </if>
  <if test="beginTime != null">
    and order_time &gt;= #{beginTime}
  </if>
  <if test="endTime != null">
    and order_time &lt;= #{endTime}
  </if>
</where>
```

返回 VO 中通常带 `orderDishes` 字符串，便于列表展示。

## 4. 订单状态流转

```text
待付款(1)
  ├─ 用户支付 → 待接单(2)
  ├─ 用户取消 → 已取消(6)
  └─ 超时未支付 → 已取消(6)

待接单(2)
  ├─ 商家接单 → 已接单(3)
  ├─ 商家拒单 → 已取消(6)
  └─ 用户取消 → 已取消(6)

已接单(3)
  └─ 商家派送 → 派送中(4)

派送中(4)
  └─ 商家完成 → 已完成(5)
```

> **注意：状态机**
> 每个操作执行前都要校验当前状态是否允许，例如待付款订单不能直接派送。

## 5. 接单与拒单

接单：

```text
校验订单存在且状态 = 待接单
  → 更新状态 = 已接单
```

拒单：

```text
校验状态 = 待接单
  → 填写拒单原因
  → 更新状态 = 已取消
  → 如已支付则触发退款
```

退款是异步或第三方操作，代码中要区分“本地状态更新”和“支付渠道退款”。

## 6. 用户取消规则

- 待付款：可直接取消。
- 待接单：可直接取消，已支付需退款。
- 已接单及之后：通常不允许用户直接取消，需要联系商家。

## 7. 练手重点

- 所有用户端查询都必须带当前用户条件。
- 状态更新建议使用“带旧状态的条件更新”，防止并发重复处理。

```sql
update orders
set status = 3
where id = ? and status = 2
```

返回受影响行数，如果为 0，说明状态已被别人改过。

## 8. 自测

- [ ] 能画出完整订单状态机。
- [ ] 能写出用户历史订单的分页查询。
- [ ] 能说明用户详情为什么必须校验 user_id。
- [ ] 能用条件更新避免重复接单。

## 关联

- 上一篇：[day08-地址簿下单与支付](/2026/11/26/heima-cangqiong-day08/)
- 下一篇：[day10-定时任务与来单提醒](/2026/11/26/heima-cangqiong-day10/)
