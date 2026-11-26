---
title: day08｜Elasticsearch 基础
date: 2026-11-26 18:00:16
updated: 2026-11-26 18:00:16
description: Elasticsearch 用倒排索引实现全文搜索；先建 Mapping，再写文档，最后用 Java 客户端操作索引和文档。
tags: [黑马, 黑马商城, Elasticsearch, 搜索, 笔记库, Java]
categories: [黑马商城]
---
> **一句话**
> Elasticsearch 用倒排索引实现全文搜索；先建 Mapping，再写文档，最后用 Java 客户端操作索引和文档。

## 本节目标

- 理解倒排索引、文档、词条。
- 掌握 IK 分词器。
- 掌握索引库和文档的 CRUD。
- 会用 JavaRestClient 操作 ES。

## 1. 为什么不用 MySQL 做全文搜索

MySQL 的 `like '%关键词%'`：

- 无法利用普通索引。
- 不支持中文分词。
- 相关度排序弱。
- 数据量大时慢。

ES 适合：

- 全文检索。
- 多条件组合搜索。
- 排序、高亮、聚合。

## 2. 倒排索引

正排：

```text
文档 1 → 小米手机
文档 2 → 华为手机
```

倒排：

```text
小米 → 文档 1
华为 → 文档 2
手机 → 文档 1, 文档 2
```

查询“手机”时直接找到包含该词的文档。

## 3. 核心概念

| ES | MySQL 类比 |
|---|---|
| Index 索引库 | 表 |
| Document 文档 | 行 |
| Field 字段 | 列 |
| Mapping 映射 | 表结构 |
| DSL | SQL |

## 4. IK 分词器

安装 IK 插件后：

```json
{
  "analyzer": "ik_max_word",
  "text": "小米手机"
}
```

两种粒度：

- `ik_max_word`：拆分更细，召回高。
- `ik_smart`：拆分更粗，性能好。

## 5. Mapping

```json
PUT /items
{
  "mappings": {
    "properties": {
      "id": { "type": "keyword" },
      "name": {
        "type": "text",
        "analyzer": "ik_max_word"
      },
      "price": { "type": "long" },
      "stock": { "type": "integer" },
      "sold": { "type": "integer" },
      "isAD": { "type": "boolean" }
    }
  }
}
```

字段类型选择：

- 精确匹配、聚合、排序用 `keyword`。
- 全文搜索用 `text`。
- 数值范围用 `integer/long`。
- 布尔用 `boolean`。

## 6. 文档操作

新增/全量替换：

```json
PUT /items/_doc/1
{
  "id": 1,
  "name": "小米手机",
  "price": 399900
}
```

局部更新：

```json
POST /items/_update/1
{
  "doc": { "price": 299900 }
}
```

删除：

```json
DELETE /items/_doc/1
```

批量：

```json
POST /_bulk
{"index":{"_index":"items","_id":"1"}}
{"id":1,"name":"小米手机"}
{"delete":{"_index":"items","_id":"2"}}
```

> **注意：bulk 格式**
> 每条操作一行、文档一行，最后必须有换行。格式错误会导致整批失败。

## 7. JavaRestClient

```java
RestClient restClient = RestClient.builder(
        new HttpHost("localhost", 9200)).build();

ElasticsearchTransport transport = new RestClientTransport(
        restClient, new JacksonJsonpMapper());
ElasticsearchClient client = new ElasticsearchClient(transport);
```

索引:

```java
client.indices().create(c -> c.index("items"));
```

文档:

```java
client.index(i -> i.index("items").id("1").document(item));
client.get(g -> g.index("items").id("1"), Item.class);
client.delete(d -> d.index("items").id("1"));
```

## 8. 数据同步

MySQL 是主数据源，ES 是搜索副本。同步方式：

| 方式 | 特点 |
|---|---|
| 同步双写 | 简单，但耦合高 |
| MQ 异步 | 常用，最终一致 |
| Canal 监听 binlog | 侵入小，运维复杂 |

黑马商城通常通过 MQ 把商品变更同步到 ES。

## 9. 自测

- [ ] 能解释倒排索引。
- [ ] 能说出 `text` 和 `keyword` 的区别。
- [ ] 能写索引创建和文档 CRUD。
- [ ] 能说明 MySQL 到 ES 的同步方案。

## 关联

- 上一篇：[day07-MQ高级](/2026/11/26/heima-mall-day07/)
- 下一篇：[day09-Elasticsearch搜索实战](/2026/11/26/heima-mall-day09/)
