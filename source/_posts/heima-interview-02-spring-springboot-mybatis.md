---
title: Java后端面试复习（二）：Spring / SpringBoot / MyBatis
date: 2026-11-26 18:00:05
updated: 2026-11-26 18:00:05
description: 本文整理了 Spring 全家桶的高频面试题。
tags: [面试复习, 笔记库, Java]
categories: [面试复习]
---
> 本文整理了 Spring 全家桶的高频面试题。

## 1. 什么是 IOC？什么是 AOP？

- IOC（控制反转）：对象的创建和依赖交给 Spring 容器管理，不用自己 new。
- AOP（面向切面）：把日志、事务等**公共逻辑**抽出来，在不改业务代码的情况下增强功能。

## 2. Spring Bean 的生命周期？

实例化 → 属性赋值 → 初始化（`@PostConstruct`）→ 使用 → 销毁（`@PreDestroy`）。

## 3. Spring Bean 的作用域？

**singleton**（默认，单例）、prototype（多例）、request、session、application。

## 4. Spring 事务实现原理？@Transactional 失效场景？

基于 **AOP** 实现，通过代理对象在方法前后开启/提交事务。

失效场景：
① 方法不是 public；② 自调用（同类内部方法调用）；③ 异常被 catch 没抛出；④ 数据库引擎不支持事务。

## 5. SpringBoot 自动装配原理？

`@SpringBootApplication` 包含 `@EnableAutoConfiguration`，它会读取 `META-INF/spring.factories`（或 2.7+ 的 `AutoConfiguration.imports`）里配置的类，按条件自动装配 Bean。

## 6. SpringBoot 和 Spring 的区别？

SpringBoot 是 Spring 的**简化版**，省去了繁琐的 XML 配置，内置 Tomcat，提供 starter 依赖，开箱即用。

## 7. MyBatis 中 #{} 和 ${} 的区别？

- `#{}` 是**预编译**，用 `?` 占位，防 SQL 注入。
- `${}` 是**字符串拼接**，有 SQL 注入风险，一般用在表名、排序字段。

## 8. MyBatis 的一级缓存和二级缓存？

- 一级缓存：**SqlSession 级别**，默认开启。
- 二级缓存：**Mapper 级别**，需要手动开启，多个 SqlSession 共享。

## 9. ResultMap 和 ResultType 的区别？

- ResultType：**自动映射**，要求数据库列名和实体属性名一致。
- ResultMap：**手动映射**，可以处理列名和属性名不一致、一对多、多对一。

## 10. MyBatis 分页插件原理？

通过**拦截器**拦截 SQL，在 SQL 后面自动拼接 `LIMIT` 语句，并执行一条 `COUNT` 查询总数。

---

> 持续更新中，欢迎交流。
