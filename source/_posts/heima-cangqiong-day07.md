---
title: day07｜缓存与购物车
date: 2026-11-26 18:00:31
updated: 2026-11-26 18:00:31
description: 菜品和套餐是典型读多写少数据，适合缓存；购物车是用户维度的临时数据，适合 Redis Hash。
tags: [黑马, 苍穹外卖, Redis, Java, SpringCache, 笔记库]
categories: [苍穹外卖]
---
> **一句话**
> 菜品和套餐是典型读多写少数据，适合缓存；购物车是用户维度的临时数据，适合 Redis Hash。

## 本节目标

- 掌握手动缓存菜品和 Spring Cache 缓存套餐。
- 理解缓存更新时机与 key 设计。
- 掌握购物车增、查、清空逻辑。

## 1. 缓存菜品

### 缓存 key

按分类缓存：

```text
dish:category:{categoryId}
```

查询流程：

```text
查 Redis
  → 命中直接返回
  → 未命中查 MySQL
  → 写入 Redis
  → 返回
```

### 更新时机

新增、修改、删除、起售/停售菜品后，要清理对应分类缓存。

```java
@Transactional
public void save(DishDTO dto) {
    // 写数据库
    redisTemplate.delete("dish:category:" + dto.getCategoryId());
}
```

> **注意：缓存一致性**
> 最简单可靠的策略是“先更新数据库，再删除缓存”。不要先删缓存再写库，否则并发下容易把旧值重新写回。

## 2. Spring Cache 缓存套餐

常用注解：

| 注解 | 作用 |
|---|---|
| `@Cacheable` | 先查缓存，未命中再执行方法 |
| `@CachePut` | 执行方法并更新缓存 |
| `@CacheEvict` | 删除缓存 |
| `@EnableCaching` | 开启缓存 |

示例：

```java
@Cacheable(cacheNames = "setmealCache", key = "#categoryId")
public List<Setmeal> list(Long categoryId) {
    return setmealMapper.listByCategoryId(categoryId);
}
```

清空：

```java
@CacheEvict(cacheNames = "setmealCache", allEntries = true)
public void save(SetmealDTO dto) {
    // 写数据库
}
```

## 3. 购物车数据模型

```text
shopping_cart
  id, user_id, dish_id, setmeal_id, dish_flavor, number, amount, image, name
```

业务规则：

- 同一用户、同一菜品/套餐、同一口味，视为同一条购物车记录。
- 已存在则数量加一或累加。
- 不存在则新增。
- `amount` 是单价快照，不是订单总价。

## 4. 添加购物车

```java
public void add(ShoppingCartDTO dto) {
    ShoppingCart cart = new ShoppingCart();
    BeanUtils.copyProperties(dto, cart);
    cart.setUserId(BaseContext.getCurrentId());

    ShoppingCart existing = shoppingCartMapper.getByUserIdAndDish(cart);
    if (existing == null) {
        // 查询菜品/套餐，填充名称、图片、价格
        shoppingCartMapper.insert(cart);
    } else {
        existing.setNumber(existing.getNumber() + 1);
        shoppingCartMapper.updateNumberById(existing);
    }
}
```

要点：

- 用户 id 从 ThreadLocal 取，不能信前端。
- 价格从数据库取，不能信前端。
- 菜品和套餐二选一。

## 5. 查看与清空购物车

```text
GET /user/shoppingCart/list
DELETE /user/shoppingCart/clean
```

查看时只查当前用户：

```sql
select * from shopping_cart where user_id = ?
```

> **重点：越权**
> 所有用户数据查询都必须带 `user_id`，只凭 id 查询再修改会造成水平越权。

## 6. 购物车是否用 Redis

课程项目使用 MySQL。可以比较：

| 方案 | 优点 | 缺点 |
|---|---|---|
| MySQL | 持久、易查询、实现简单 | 高频写压力大 |
| Redis Hash | 快、适合临时数据 | 需考虑持久化和丢失 |

面试时可以说：购物车可按 `cart:{userId}` 用 Hash 存储，字段为商品标识，值为数量和价格快照。

## 7. 自测

- [ ] 能说出菜品缓存 key 与失效时机。
- [ ] 能解释 `@Cacheable` 和 `@CacheEvict` 的区别。
- [ ] 能写出购物车合并规则。
- [ ] 能说明为什么价格和用户 id 不能信前端。

## 关联

- 上一篇：[day06-微信登录与商品浏览](/2026/11/26/heima-cangqiong-day06/)
- 下一篇：[day08-地址簿下单与支付](/2026/11/26/heima-cangqiong-day08/)
