---
title: day11｜数据统计图表
date: 2026-11-26 18:00:27
updated: 2026-11-26 18:00:27
description: 统计模块的本质是把业务数据按时间或状态聚合，再转换成前端图表需要的数组结构。
tags: [黑马, 苍穹外卖, Java, 统计, ECharts, 笔记库]
categories: [苍穹外卖]
---
> **一句话**
> 统计模块的本质是把业务数据按时间或状态聚合，再转换成前端图表需要的数组结构。

## 本节目标

- 理解 ECharts 的数据驱动方式。
- 掌握营业额、用户、订单、销量 Top10 的统计 SQL。
- 能把查询结果映射成 VO。

## 1. 图表数据格式

前端只关心两件事：

```json
{
  "dates": ["2026-11-01", "2026-11-02"],
  "values": [1200, 1500]
}
```

后端 VO：

```java
public class TurnoverReportVO {
    private String dateList;
    private String turnoverList;
}
```

通常用逗号拼接字符串，前端再 split 后交给 ECharts。

## 2. 营业额统计

规则：

- 统计时间范围内每天的营业额。
- 只统计已完成订单，或按课程定义的状态。
- 没有数据的日期要补 0。

```sql
select date(order_time) as date, sum(amount) as turnover
from orders
where status = 5
  and order_time between #{begin} and #{end}
group by date(order_time)
order by date
```

后端需要把“日期连续”补齐，否则图表会缺点。

## 3. 用户统计

```sql
select date(create_time) as date, count(*) as total
from user
where create_time between #{begin} and #{end}
group by date(create_time)
```

新增用户数按注册时间统计。

## 4. 订单统计

订单统计通常包括：

- 每日订单总数。
- 每日有效订单数。
- 订单完成率。

```text
订单完成率 = 有效订单数 / 订单总数 × 100%
```

返回字符串时要统一保留两位小数。

## 5. 销量 Top10

从订单明细聚合：

```sql
select od.name, sum(od.number) as total
from order_detail od
join orders o on o.id = od.order_id
where o.status = 5
  and o.order_time between #{begin} and #{end}
group by od.name
order by total desc
limit 10
```

要点：

- 按商品名称分组可能把同名商品合并，正式系统应按商品 id。
- 统计范围要与订单状态一致。
- Top10 可能不足 10 条，前端要能处理。

## 6. ECharts 接入

```js
const option = {
  xAxis: { type: 'category', data: dates },
  yAxis: { type: 'value' },
  series: [{ type: 'line', data: values }]
}
```

后端只给数据，前端负责图表样式。

## 7. 统计模块通用套路

```text
接收 begin / end
  → 校验时间范围
  → 查询聚合数据
  → 补全缺失日期
  → 转成前端需要的字符串或数组
  → 返回 VO
```

## 8. 易错点

- 日期补全遗漏。
- 时间边界使用 `>` 而不是 `>=`。
- 统计状态与业务定义不一致。
- 字符串拼接出现空值或多余逗号。

## 9. 自测

- [ ] 能写出按天聚合营业额的 SQL。
- [ ] 能解释补日期的重要性。
- [ ] 能计算订单完成率。
- [ ] 能设计一个通用统计 VO。

## 关联

- 上一篇：[day10-定时任务与来单提醒](/2026/11/26/heima-cangqiong-day10/)
- 下一篇：[day12-工作台与Excel导出](/2026/11/26/heima-cangqiong-day12/)
