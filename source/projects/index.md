---
title: 项目
date: 2026-09-17 10:00:00
---

## 速达外卖（sky-take-out）

- **简介**：基于 Spring Boot + MyBatis 的外卖点餐系统，包含管理端和用户端
- **技术栈**：Spring Boot、MyBatis、MySQL、Redis、阿里云 OSS、微信支付、WebSocket
- **主要功能**：
  - **管理端**：
    - 员工管理（登录、分页查询、启用禁用、编辑）
    - 分类管理、菜品管理、套餐管理（含图片上传到 OSS）
    - 订单管理（接单、拒单、派送、完成、统计）
    - 数据统计（营业额、订单量、用户量）
    - 来单提醒、客户催单（WebSocket）A
  - **用户端**：
    - 微信登录、微信支付
    - 浏览菜品、加入购物车、下单
    - 查看订单、历史订单
  - **技术亮点**：
    - Redis 缓存菜品和套餐数据
    - 阿里云 OSS 存储图片
    - WebSocket 实现来单提醒和催单
    - 微信支付回调处理
- **代码**：[Gitee 仓库](https://gitee.com/shrimp-delicacy/cangqiong_test)
- 
## 商城微服务（hmall）

- **简介**：基于 Spring Cloud 的微服务商城系统，采用微服务架构，涵盖商品、购物车、订单、支付、用户等核心业务模块，支持 Docker 部署和网关统一鉴权。
- **技术栈**：
  - **框架**：Spring Boot、Spring Cloud、Spring Cloud Alibaba
  - **注册中心/配置中心**：Nacos
  - **远程调用**：OpenFeign
  - **网关**：Spring Cloud Gateway
  - **数据库**：MySQL、MyBatis-Plus
  - **缓存**：Redis
  - **消息队列**：RabbitMQ(暂时没有)
  - **搜索**：Elasticsearch(暂时没有)
  - **容器化**：Docker、Docker Compose
- **主要模块**：
  - **item-service**：商品管理、分页查询、条件搜索（集成 Elasticsearch）
  - **cart-service**：购物车增删改查、商品数量修改、选中状态管理
  - **trade-service**：订单创建、订单查询、订单状态流转、库存扣减
  - **pay-service**：支付单创建、支付状态同步、支付回调处理
  - **user-service**：用户登录、用户信息、收货地址管理
  - **hm-gateway**：统一路由、JWT 鉴权、登录拦截
  - **hm-common**：公共工具类、统一异常处理、通用返回结果
  - **hm-api**：Feign 远程调用客户端、服务间接口定义
- **项目亮点**：
  - 基于 Nacos 实现服务注册发现和配置中心
  - 使用 OpenFeign 实现服务间远程调用，配合 Fallback 实现容错
  - Gateway 统一鉴权，JWT 令牌校验
  - Redis 缓存热点数据，提升查询性能
  - RabbitMQ 异步处理订单和支付消息
  - Elasticsearch 实现商品全文搜索
  - Docker Compose 一键部署全套微服务
- **代码**：[Gitee 仓库](https://gitee.com/shrimp-delicacy/mall)