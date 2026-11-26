---
title: day01｜MyBatis-Plus
date: 2026-11-26 18:00:23
updated: 2026-11-26 18:00:23
description: MyBatis-Plus 在 MyBatis 上补了通用 CRUD、条件构造器和 Service 层封装，减少重复 SQL。
tags: [黑马, 黑马商城, Java, MyBatisPlus, 笔记库]
categories: [黑马商城]
---
> **一句话**
> MyBatis-Plus 在 MyBatis 上补了通用 CRUD、条件构造器和 Service 层封装，减少重复 SQL。

## 本节目标

- 掌握 `BaseMapper`、`IService`、`ServiceImpl`。
- 会用 `LambdaQueryWrapper` 写类型安全的条件。
- 理解分页插件、逻辑删除、枚举和代码生成。

## 1. 快速接入

```xml
<dependency>
    <groupId>com.baomidou</groupId>
    <artifactId>mybatis-plus-spring-boot3-starter</artifactId>
</dependency>
```

```yaml
mybatis-plus:
  mapper-locations: classpath*:mapper/**/*.xml
  type-aliases-package: com.hmall.item.domain.po
```

## 2. 实体映射

```java
@Data
@TableName("item")
public class Item {
    @TableId(value = "id", type = IdType.AUTO)
    private Long id;

    @TableField("isAD")
    private Boolean isAD;

    private String name;
    private Integer status;
    private Integer stock;
}
```

常用注解：

| 注解 | 作用 |
|---|---|
| `@TableName` | 指定表名 |
| `@TableId` | 主键和生成策略 |
| `@TableField` | 字段映射、自动填充 |

## 3. BaseMapper

```java
public interface ItemMapper extends BaseMapper<Item> {
}
```

自带：

- `insert`
- `deleteById`
- `updateById`
- `selectById`
- `selectList`
- `selectPage`

## 4. 条件构造器

推荐 Lambda 形式，避免手写字段名：

```java
LambdaQueryWrapper<Item> wrapper = Wrappers.lambdaQuery(Item.class)
        .eq(Item::getStatus, 1)
        .like(StringUtils.hasText(name), Item::getName, name)
        .orderByDesc(Item::getCreateTime);

List<Item> list = itemMapper.selectList(wrapper);
```

更新：

```java
LambdaUpdateWrapper<Item> wrapper = Wrappers.lambdaUpdate(Item.class)
        .eq(Item::getId, id)
        .set(Item::getStock, stock);
itemMapper.update(null, wrapper);
```

## 5. IService

```java
public interface IItemService extends IService<Item> {
}

@Service
public class ItemServiceImpl extends ServiceImpl<ItemMapper, Item>
        implements IItemService {
}
```

常用方法：

```java
save(item);
saveBatch(items);
getById(id);
list(wrapper);
page(new Page<>(pageNo, pageSize), wrapper);
```

## 6. 分页

必须配置分页插件：

```java
@Bean
public MybatisPlusInterceptor mybatisPlusInterceptor() {
    MybatisPlusInterceptor interceptor = new MybatisPlusInterceptor();
    interceptor.addInnerInterceptor(new PaginationInnerInterceptor(DbType.MYSQL));
    return interceptor;
}
```

否则 `selectPage` 不会真正分页。

## 7. 逻辑删除

```yaml
mybatis-plus:
  global-config:
    db-config:
      logic-delete-field: deleted
      logic-delete-value: 1
      logic-not-delete-value: 0
```

之后 `removeById` 实际执行的是更新删除标记。

## 8. 自动填充

```java
@TableField(fill = FieldFill.INSERT)
private LocalDateTime createTime;

@TableField(fill = FieldFill.INSERT_UPDATE)
private LocalDateTime updateTime;
```

配合 `MetaObjectHandler` 自动写入。

## 9. 代码生成

适合生成：

- Entity
- Mapper
- Service / ServiceImpl
- Controller

生成后仍要人工补充：

- 业务校验。
- 事务边界。
- DTO/VO。
- 权限和异常处理。

> **注意：易错点**
> 自动生成的 CRUD 不能直接当正式接口，容易暴露数据库字段和越权操作。

## 10. 自测

- [ ] 能区分 `BaseMapper` 和 `IService`。
- [ ] 能写 Lambda 条件查询。
- [ ] 能解释分页插件为什么必须配置。
- [ ] 能说明逻辑删除的优缺点。

## 关联

- 下一篇：[day02-Docker](/2026/11/26/heima-mall-day02/)
- 总览：[00-黑马商城总览](/2026/11/26/heima-mall-overview/)
