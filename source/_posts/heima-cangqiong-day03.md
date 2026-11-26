---
title: day03｜菜品管理
date: 2026-11-26 18:00:35
updated: 2026-11-26 18:00:35
description: 用 AOP 自动填充公共字段，用对象存储/本地目录接收图片，再完成菜品与口味的联合增删改查。
tags: [黑马, 苍穹外卖, Java, MyBatis, 文件上传, 笔记库]
categories: [苍穹外卖]
---
> **一句话**
> 用 AOP 自动填充公共字段，用对象存储/本地目录接收图片，再完成菜品与口味的联合增删改查。

## 本节目标

- 理解公共字段自动填充的实现思路。
- 掌握文件上传接口和静态资源映射。
- 掌握菜品与口味的一对多保存、查询和删除。

## 1. 公共字段自动填充

问题：每张业务表都有 `create_time / update_time / create_user / update_user`，手写重复代码多。

思路：

1. 在实体字段上标注填充时机。
2. 编写 `MetaObjectHandler`。
3. 插入时填充创建时间、创建人、更新时间、修改人。
4. 更新时只填充更新时间和修改人。

```java
@Component
public class MyMetaObjectHandler implements MetaObjectHandler {
    @Override
    public void insertFill(MetaObject metaObject) {
        this.strictInsertFill(metaObject, "createTime", LocalDateTime.class, LocalDateTime.now());
        this.strictInsertFill(metaObject, "updateTime", LocalDateTime.class, LocalDateTime.now());
        this.strictInsertFill(metaObject, "createUser", Long.class, BaseContext.getCurrentId());
        this.strictInsertFill(metaObject, "updateUser", Long.class, BaseContext.getCurrentId());
    }

    @Override
    public void updateFill(MetaObject metaObject) {
        this.strictUpdateFill(metaObject, "updateTime", LocalDateTime.class, LocalDateTime.now());
        this.strictUpdateFill(metaObject, "updateUser", Long.class, BaseContext.getCurrentId());
    }
}
```

> **注意：易错点**
> 新增时如果实体字段已有值，`strictInsertFill` 不会覆盖。需要先确认前端没有传入这些公共字段。

## 2. 文件上传

管理端上传菜品图片：

```text
前端选择文件
  → multipart/form-data 请求
  → Controller 接收 MultipartFile
  → 生成唯一文件名
  → 写入磁盘或对象存储
  → 返回可访问 URL
```

Controller 骨架：

```java
@PostMapping("/upload")
public Result<String> upload(MultipartFile file) {
    String url = fileService.upload(file);
    return Result.success(url);
}
```

关键点：

- 文件大小和类型要限制。
- 文件名要避免冲突，可使用 UUID。
- 上传目录要做静态资源映射，或者使用 OSS 返回公网 URL。
- 不要把原始文件名直接拼路径，防止路径穿越。

## 3. 新增菜品

### 数据关系

```text
dish 1 ── N dish_flavor
```

新增菜品分两次写入：

1. 写入 `dish`，获得菜品 id。
2. 把口味列表补上 `dish_id`，批量写入 `dish_flavor`。

```java
@Transactional
public void saveWithFlavor(DishDTO dto) {
    Dish dish = new Dish();
    BeanUtils.copyProperties(dto, dish);
    dishMapper.insert(dish);
    Long dishId = dish.getId();

    List<DishFlavor> flavors = dto.getFlavors();
    if (flavors != null && !flavors.isEmpty()) {
        flavors.forEach(item -> item.setDishId(dishId));
        dishFlavorMapper.insertBatch(flavors);
    }
}
```

> **重点：事务**
> 菜品与口味必须同时成功或同时失败，因此 Service 方法加 `@Transactional`。

## 4. 分页查询

菜品分页通常还要返回分类名称，因此使用 VO：

```text
DishPageQueryDTO → 查询 dish
                → 左连接 category 或查询后补分类名
                → DishVO
```

返回字段比实体多，例如 `categoryName`，这就是需要 VO 的原因。

## 5. 删除菜品

删除是批量操作，业务规则：

- 正在售卖的菜品不能删除。
- 被套餐关联的菜品不能删除。
- 删除菜品时同步删除口味。

```java
@Transactional
public void deleteBatch(List<Long> ids) {
    // 1. 校验是否存在起售中的菜品
    // 2. 校验是否被套餐关联
    // 3. 删除 dish_flavor
    // 4. 删除 dish
}
```

## 6. 修改菜品

修改包括：

- 更新 `dish` 基本字段。
- 删除旧口味。
- 插入新口味。

为了简单可靠，常采用“口味全量替换”：

```text
delete from dish_flavor where dish_id = ?
insert 新口味列表
```

也可以做差量更新，但代码复杂度更高，教学项目通常选全量替换。

## 7. 自测

- [ ] 能解释公共字段自动填充的触发条件。
- [ ] 能说清上传文件后为什么需要静态资源映射。
- [ ] 能手写菜品 + 口味的事务保存。
- [ ] 能列出删除菜品的三个校验。

## 关联

- 上一篇：[day02-员工与分类管理](/2026/11/26/heima-cangqiong-day02/)
- 下一篇：[day04-套餐管理](/2026/11/26/heima-cangqiong-day04/)
