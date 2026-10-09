---
title: Java 后端面试题清单
date: 2026-10-09 10:00:00
tags: [面试, 八股文, Java]
categories: 面试笔记
---

## 一、Java 基础（必问，占比约 20%）

1. Java 中 == 和 equals() 的区别？
2. ArrayList 和 LinkedList 的区别？
3. HashMap 的底层原理？JDK1.8 做了哪些优化？
4. HashMap 和 ConcurrentHashMap 的区别？
5. 多线程的创建方式有哪几种？
6. synchronized 和 Lock 的区别？
7. 线程池的核心参数有哪些？执行流程是怎样的？
8. JVM 内存结构（堆、栈、方法区、程序计数器）？
9. 垃圾回收机制（GC）？常见的垃圾回收器有哪些？
10. 谈谈你对面向对象三大特性（封装、继承、多态）的理解？

**补充**：String、StringBuilder、StringBuffer 的区别？深拷贝和浅拷贝？Error 和 Exception 的区别？什么是反射？Java 8 新特性有哪些？

## 二、Spring / SpringBoot / MyBatis（必问，占比约 25%）

1. 什么是 IOC？什么是 AOP？它们的作用是什么？
2. Spring Bean 的生命周期？
3. Spring Bean 的作用域有哪些？
4. Spring 事务的实现原理？@Transactional 失效的场景有哪些？
5. SpringBoot 自动装配的原理？
6. SpringBoot 和 Spring 的区别？
7. MyBatis 中 #{} 和 ${} 的区别？
8. MyBatis 的一级缓存和二级缓存？
9. MyBatis 中 ResultMap 和 ResultType 的区别？
10. MyBatis 的分页插件原理？

**补充**：SpringMVC 的执行流程？Spring 常用注解？SpringBoot starter 原理？跨域问题？MyBatis-Plus 和 MyBatis 的区别？

## 三、MySQL（必问，占比约 15%）

1. 事务的四大特性（ACID）？
2. 事务的隔离级别有哪些？MySQL 默认是哪个？
3. 什么是脏读、不可重复读、幻读？
4. 索引的底层数据结构？为什么用 B+ 树？
5. 聚簇索引和非聚簇索引的区别？
6. 什么是最左前缀原则？
7. 什么情况下索引会失效？
8. 什么是回表？什么是覆盖索引？
9. MySQL 的锁有哪些？
10. 如何优化 SQL？

**补充**：InnoDB 和 MyISAM 的区别？MVCC？分库分表？主从复制？大表如何加索引？

## 四、Redis（必问，占比约 15%）

1. Redis 有哪些常用数据类型？分别用在什么场景？
2. Redis 为什么快？
3. 什么是缓存穿透？怎么解决？
4. 什么是缓存击穿？怎么解决？
5. 什么是缓存雪崩？怎么解决？
6. Redis 的持久化机制（RDB 和 AOF）？
7. Redis 的过期策略和内存淘汰策略？
8. 如何用 Redis 实现分布式锁？
9. Redis 的主从复制原理？
10. Redis 集群方案有哪些？

**补充**：Redis 和 Memcached 的区别？线程模型？如何实现消息队列？Redisson 看门狗？如何保证 Redis 和 MySQL 数据一致性？

## 五、微服务 / SpringCloud（占比约 15%）

1. 为什么要用微服务？有什么优缺点？
2. Nacos 和 Eureka 的区别？
3. Nacos 的注册中心原理？
4. OpenFeign 的原理？
5. OpenFeign 和 RestTemplate 的区别？
6. SpringCloud Gateway 的作用？和 Nginx 有什么区别？
7. 什么是服务熔断？什么是服务降级？
8. 微服务之间如何保证数据一致性？
9. 什么是 CAP 理论？
10. 你的项目中，服务是怎么拆分的？为什么这么拆？

**补充**：Nacos 配置中心？Gateway 断言和过滤器？Seata？链路追踪？服务雪崩？

## 六、项目 + 场景题（占比约 10%）

1. 介绍一下你的"速达外卖"项目？
2. 介绍一下你的"大众商场"项目？
3. 你在项目中遇到的最大困难是什么？怎么解决的？
4. 你为什么用 Redis 缓存菜品分类？不用行不行？
5. 你缓存的数据，如果数据库更新了，Redis 怎么同步？
6. 你简历说接口响应速度提升了 50%，怎么测的？
7. 你的微服务项目，如果一个服务挂了，怎么办？
8. 你的项目里，用户登录是怎么实现的？JWT 的原理是什么？
9. 你的项目里，AOP 用在了哪里？
10. 你的项目里，阿里云 OSS 是怎么用的？

**补充**：Nginx 配置？Swagger？Docker 部署？POI 导出 Excel？如果重新设计项目你会怎么优化？