---
title: day09｜Elasticsearch 搜索实战
date: 2026-11-26 18:00:15
updated: 2026-11-26 18:00:15
description: 搜索业务的关键是把用户输入翻译成 DSL：过滤、打分、排序、分页、高亮和聚合各司其职。
tags: [黑马, 黑马商城, Elasticsearch, 搜索, 笔记库, Java]
categories: [黑马商城]
---
> **一句话**
> 搜索业务的关键是把用户输入翻译成 DSL：过滤、打分、排序、分页、高亮和聚合各司其职。

## 本节目标

- 掌握 DSL 查询和 bool 组合。
- 掌握排序、分页、高亮、聚合。
- 能把搜索结果组装成页面 VO。

## 1. 查询分类

| 类型 | 说明 |
|---|---|
| 叶子查询 | match、term、range、exists |
| 复合查询 | bool |

`bool` 四类子句：

| 子句 | 作用 |
|---|---|
| must | 必须匹配，参与打分 |
| should | 可选匹配，影响打分 |
| must_not | 必须不匹配 |
| filter | 必须匹配，不参与打分 |

> **提示：性能**
> 不需要打分的条件放 `filter`，可以利用缓存，性能更好。

## 2. 商品搜索 DSL

```json
GET /items/_search
{
  "query": {
    "bool": {
      "must": [
        { "match": { "name": "手机" } }
      ],
      "filter": [
        { "term": { "status": 1 } },
        { "range": { "price": { "gte": 100000, "lte": 500000 } } }
      ]
    }
  },
  "sort": [
    { "sold": "desc" },
    { "_score": "desc" }
  ],
  "from": 0,
  "size": 10
}
```

## 3. 排序与分页

- `from + size` 适合浅分页。
- 深度分页会消耗大量内存。
- 深分页可用 `search_after`。

深分页问题：

```text
from = 10000
  → 每个分片都要取前 10010 条
  → 协调节点再排序
```

## 4. 高亮

```json
{
  "highlight": {
    "fields": {
      "name": {
        "pre_tags": ["<em>"],
        "post_tags": ["</em>"]
      }
    }
  }
}
```

前端拿到高亮字段后直接渲染，但要防 XSS。

## 5. 聚合

按品牌聚合：

```json
{
  "size": 0,
  "aggs": {
    "brands": {
      "terms": {
        "field": "brand",
        "size": 20
      }
    }
  }
}
```

聚合字段通常要求 `keyword` 或 `fielddata`。

## 6. 搜索业务 VO

```java
public class SearchResult {
    private Long total;
    private List<String> brands;
    private List<String> categories;
    private List<ItemDoc> items;
}
```

请求参数：

```text
keyword
pageNo
pageSize
sortBy
minPrice
maxPrice
brand
category
```

## 7. 搜索与数据库的职责

| 数据 | 来源 |
|---|---|
| 商品详情 | 数据库 |
| 搜索列表 | ES |
| 库存扣减 | 数据库 |
| 销量排序 | ES 中的冗余字段 |

ES 不是交易数据库，不能作为库存扣减的唯一依据。

## 8. 搜索建议与纠错

可以扩展：

- 拼音搜索。
- 同义词。
- 自动补全。
- 拼写纠错。

这些能力依赖分词器、词典和 ES 的 suggest 功能。

## 9. 易错点

- 把用户输入直接拼 DSL，存在注入风险。
- `text` 字段做 term 查询，匹配不到。
- 深分页仍用 `from + size`。
- 高亮字段不处理 XSS。
- ES 与 MySQL 数据不同步。

## 10. 自测

- [ ] 能写 bool 查询并解释四类子句。
- [ ] 能说明 filter 为什么不打分。
- [ ] 能说出深分页问题。
- [ ] 能设计搜索结果 VO。

## 关联

- 上一篇：[day08-Elasticsearch基础](/2026/11/26/heima-mall-day08/)
- 下一篇：[day10-Redis高级](/2026/11/26/heima-mall-day10/)
