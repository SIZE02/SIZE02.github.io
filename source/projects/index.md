---
title: 项目
date: 2026-09-17 10:00:00
---

## 苍穹外卖（sky-take-out）

- **简介**：基于 Spring Boot + MyBatis 的外卖点餐系统，包含管理端和用户端
- **技术栈**：Spring Boot、MyBatis、MySQL、Redis、阿里云 OSS、微信支付、WebSocket
- **主要功能**：
  - **管理端**：
    - 员工管理（登录、分页查询、启用禁用、编辑）
    - 分类管理、菜品管理、套餐管理（含图片上传到 OSS）
    - 订单管理（接单、拒单、派送、完成、统计）
    - 数据统计（营业额、订单量、用户量）
    - 来单提醒、客户催单（WebSocket）
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