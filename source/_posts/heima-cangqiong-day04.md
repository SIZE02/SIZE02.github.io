---
title: day04｜套餐管理
date: 2026-11-26 18:00:34
updated: 2026-11-26 18:00:34
description: 套餐是“可售卖的菜品组合”，核心难点是套餐与菜品的一对多关系、起售规则和用户端展示。
tags: [黑马, 苍穹外卖, Java, 项目实战, 笔记库]
categories: [苍穹外卖]
---
> **一句话**
> 套餐是“可售卖的菜品组合”，核心难点是套餐与菜品的一对多关系、起售规则和用户端展示。

## 本节目标

- 独立完成套餐新增、分页、回显、修改、起售/停售。
- 理解 `setmeal` 与 `setmeal_dish` 的关系。
- 能处理套餐删除、起售时的业务校验。

## 1. 数据模型

```text
setmeal 1 ── N setmeal_dish N ── 1 dish
```

`setmeal_dish` 是中间表，同时保存套餐中的菜品和份数。

| 表 | 关键字段 |
|---|---|
| `setmeal` | name、category_id、price、status、image |
| `setmeal_dish` | setmeal_id、dish_id、name、price、copies |

## 2. 新增套餐

流程：

1. 保存套餐基本信息。
2. 取得套餐 id。
3. 给每个套餐菜品设置 `setmeal_id`。
4. 批量写入 `setmeal_dish`。

```java
@Transactional
public void save(SetmealDTO dto) {
    Setmeal setmeal = new Setmeal();
    BeanUtils.copyProperties(dto, setmeal);
    setmealMapper.insert(setmeal);

    List<SetmealDish> dishes = dto.getSetmealDishes();
    if (dishes != null && !dishes.isEmpty()) {
        dishes.forEach(item -> item.setSetmealId(setmeal.getId()));
        setmealDishMapper.insertBatch(dishes);
    }
}
```

## 3. 分页查询

返回套餐列表时需要分类名称：

```text
SetmealPageQueryDTO
  → setmeal 分页
  → 补 categoryName
  → PageResult<SetmealVO>
```

可筛选条件：

- 套餐名称，通常做模糊查询。
- 分类 id。
- 状态。

## 4. 回显与修改

回显需要两份数据：

1. `setmeal` 基本信息。
2. `setmeal_dish` 中的菜品列表。

修改策略与菜品类似：

```text
更新 setmeal
delete from setmeal_dish where setmeal_id = ?
insert 新的套餐菜品列表
```

## 5. 起售/停售

批量起售时要校验：

- 套餐必须存在。
- 套餐内至少有一个菜品。
- 套餐内菜品不能包含“停售”菜品。

```java
@Transactional
public void startOrStop(Integer status, List<Long> ids) {
    if (status == StatusConstant.ENABLE) {
        // 查询套餐包含的菜品，存在停售菜品则抛异常
    }
    setmealMapper.updateStatusByIds(status, ids);
}
```

> **注意：易错点**
> 这里校验的是菜品状态，不是套餐状态。套餐可以起售的前提是组合中的每个菜品都能卖。

## 6. 删除套餐

规则：

- 起售中的套餐不能删除。
- 删除套餐时同步删除 `setmeal_dish`。
- 批量删除时任意一个不满足条件，整个操作回滚。

## 7. 用户端套餐展示

用户端按分类查询起售套餐：

```text
GET /user/setmeal/list?categoryId=...
  → status = 1
  → 返回套餐及菜品明细
```

注意：

- 用户端只展示起售套餐。
- 套餐详情要连同套餐内菜品一起返回。
- 套餐价格以套餐价为准，不直接累加菜品价。

## 8. 项目实战检查表

- [ ] 新增套餐能同时写入两张表。
- [ ] 套餐分页能显示分类名。
- [ ] 修改套餐能正确替换关联菜品。
- [ ] 起售时能拦截停售菜品。
- [ ] 删除起售中套餐会失败。
- [ ] 用户端只看到起售套餐。

## 关联

- 上一篇：[day03-菜品管理](/2026/11/26/heima-cangqiong-day03/)
- 下一篇：[day05-Redis与营业状态](/2026/11/26/heima-cangqiong-day05/)
