---
title: day02｜员工与分类管理
date: 2026-11-26 18:00:36
updated: 2026-11-26 18:00:36
description: 用员工管理练熟标准 CRUD、分页、DTO/VO、MD5、ThreadLocal，再导入分类模块理解同类代码结构。
tags: [黑马, 苍穹外卖, Java, CRUD, ThreadLocal, 笔记库]
categories: [苍穹外卖]
---
> **一句话**
> 用员工管理练熟标准 CRUD、分页、DTO/VO、MD5、ThreadLocal，再导入分类模块理解同类代码结构。

## 本节目标

- 掌握“需求 → 接口 → 表 → DTO/VO → 分层代码”的开发顺序。
- 理解分页查询的 PageHelper 用法。
- 理解 ThreadLocal 如何保存当前登录员工 id。

## 1. 员工管理接口

| 功能 | 方法 | 路径 |
|---|---|---|
| 新增员工 | POST | `/admin/employee` |
| 分页查询 | GET | `/admin/employee/page` |
| 启用/禁用 | POST | `/admin/employee/status/{status}` |
| 根据 id 查询 | GET | `/admin/employee/{id}` |
| 修改员工 | PUT | `/admin/employee` |

## 2. 新增员工

### 业务规则

- 用户名唯一。
- 初始密码通常是固定值，数据库保存 MD5。
- 创建人和修改人来自当前登录员工。
- 账号默认启用。

### DTO

`EmployeeDTO` 只接收新增需要的字段，避免直接暴露实体。

```java
public class EmployeeDTO {
    private String name;
    private String username;
    private String phone;
    private String sex;
    private String idNumber;
}
```

### Service 骨架

```java
public void save(EmployeeDTO dto) {
    Employee employee = new Employee();
    BeanUtils.copyProperties(dto, employee);
    employee.setPassword(DigestUtils.md5DigestAsHex("123456".getBytes()));
    employee.setStatus(StatusConstant.ENABLE);
    employee.setCreateTime(LocalDateTime.now());
    employee.setUpdateTime(LocalDateTime.now());
    employee.setCreateUser(BaseContext.getCurrentId());
    employee.setUpdateUser(BaseContext.getCurrentId());
    employeeMapper.insert(employee);
}
```

## 3. 分页查询

Controller 接收页码、页大小和可选条件：

```java
@GetMapping("/page")
public Result<PageResult> page(EmployeePageQueryDTO dto) {
    PageResult pageResult = employeeService.pageQuery(dto);
    return Result.success(pageResult);
}
```

Service 使用 PageHelper：

```java
PageHelper.startPage(dto.getPage(), dto.getPageSize());
Page<Employee> page = employeeMapper.pageQuery(dto);
return new PageResult(page.getTotal(), page.getResult());
```

> **注意：易错点**
> `PageHelper.startPage` 必须紧挨着真正的查询语句，否则会作用到错误 SQL。

## 4. ThreadLocal

登录后，多个层都需要当前员工 id。逐层传参会让方法签名膨胀，因此用 ThreadLocal 保存本次请求的上下文。

```java
public class BaseContext {
    private static final ThreadLocal<Long> THREAD_LOCAL = new ThreadLocal<>();

    public static void setCurrentId(Long id) {
        THREAD_LOCAL.set(id);
    }

    public static Long getCurrentId() {
        return THREAD_LOCAL.get();
    }

    public static void remove() {
        THREAD_LOCAL.remove();
    }
}
```

拦截器校验 JWT 后：

```java
BaseContext.setCurrentId(employeeId);
```

请求结束后必须 `remove()`，尤其在线程池环境下，避免线程复用导致数据串用。

## 5. MD5 与密码

- MD5 是摘要算法，不可逆。
- 登录时把用户输入密码做同样摘要，再与数据库值比较。
- 更安全的系统会加盐或使用 BCrypt，本项目为教学简化使用 MD5。

## 6. 启用/禁用与编辑

- 状态修改只需要 id 和目标状态。
- 编辑分两步：先按 id 回显，再提交修改。
- 修改时要更新 `updateTime` 和 `updateUser`。

## 7. 分类管理

分类模块代码结构类似，重点理解：

| 功能 | 关键点 |
|---|---|
| 新增分类 | 名称、类型（菜品/套餐）、排序 |
| 分页查询 | 支持名称和类型筛选 |
| 修改分类 | 校验分类是否存在 |
| 删除分类 | 有菜品/套餐关联时不能删 |
| 启用禁用 | 影响用户端是否展示 |
| 分类下拉 | 用户端按类型查询启用分类 |

> **重点：业务规则**
> 删除分类前要查询 `dish` 或 `setmeal` 是否有引用。这是“业务外键”校验，不能只依赖数据库。

## 8. 自测

- [ ] 能独立写出一个标准 CRUD 的五层代码。
- [ ] 能解释 DTO 与 Entity 的区别。
- [ ] 能解释 ThreadLocal 的 set/get/remove 时机。
- [ ] 能说清分类为什么不能直接删除。

## 关联

- 上一篇：[day01-项目概述与环境搭建](/2026/11/26/heima-cangqiong-day01/)
- 下一篇：[day03-菜品管理](/2026/11/26/heima-cangqiong-day03/)
- [Spring 常用注解](/2026/11/26/heima-public-spring-annotations/)
