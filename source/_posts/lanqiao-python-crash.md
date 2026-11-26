---
title: Python 速成手册（Java 程序员版）
date: 2026-11-26 18:00:44
updated: 2026-11-26 18:00:44
description: 目标：2–3 周内能读懂并写出蓝桥杯难度的 Python 程序。
tags: [蓝桥杯, Python, 语法, 蓝桥杯 2027, 笔记库]
categories: [蓝桥杯 2027]
---
> **目标**：2–3 周内能读懂并写出蓝桥杯难度的 Python 程序。
> **用法**：第 1 周通读第 1–9 节；之后把第 10 节（坑）和第 11 节（性能）当检查表。
> **约定**：示例以 Python 3.8+ 为准，只用标准库；你本机是 3.9.6，蓝桥杯环境以官网为准。
>
> **国奖路线（6–8 小时/周）**：第 1–11 节都要看；第 10 节的 40 个坑至少过一遍。第 12 节的“三周安排”按 4 周、每周 6–7 小时执行。
>
> **阅读方式**：代码右侧的注释（例如 `# 3.5`、`# [1, 2, 3]`）就是该行实际输出或运行后的值，注解紧跟代码；不需要在“代码、效果、注解”三块之间来回对照。标注“顺序不保证”的结果以本机 Python 3.9.6 为例。

---

## 目录

1. [环境与运行](#1-环境与运行)
2. [最小程序骨架](#2-最小程序骨架)
3. [语法对照：Java → Python](#3-语法对照java--python)
4. [五大容器](#4-五大容器)
5. [字符串](#5-字符串)
6. [函数](#6-函数)
7. [排序](#7-排序)
8. [输入输出（竞赛最重要）](#8-输入输出竞赛最重要)
9. [标准库速查](#9-标准库速查)
10. [Java 程序员最容易踩的 40 个坑](#10-java-程序员最容易踩的-40-个坑)
11. [性能：Python 慢，怎么活](#11-性能python-慢怎么活)
12. [三周学习安排](#12-三周学习安排)
13. [自测清单](#13-自测清单)

---

## 1. 环境与运行

### 安装

- 本机已有 **Python 3.9.6**，够用。
- 建议再装一个 **Python 3.10+**（新特性多，但比赛代码不要依赖新语法）。
- 编辑器：**VS Code + Python 插件**，或 PyCharm Community。

### 运行

```bash
python3 main.py          # 运行脚本，终端显示脚本输出
python3 -i main.py       # 运行完不退出，继续进入交互环境
```

`main.py`：

```python
print("hello")           # 终端输出: hello
```

> **注解**：`python3` 明确指定 Python 3；正常脚本执行完就退出，`-i` 会停在交互环境。比赛提交的是单个 `.py` 文件，不是整个文件夹。

VS Code 里按 `F5` 或点右上角运行；调试时用断点，比到处 `print` 高效。

### 竞赛环境注意

- **只能用标准库**，不要用 numpy / pandas / scipy。
- 可能是较老的 Python 3.8，避免 `match`、`int.bit_count()`、`dict |` 等新语法。
- 单文件提交，标准输入输出，不要写文件路径。
- 练习时**关掉自动补全**做几次，适应比赛环境。

---

## 2. 最小程序骨架

假设输入是下面三行：

```text
3
1 2 3
```

```python
import sys

def solve():
    data = sys.stdin.buffer.read().split()  # [b'3', b'1', b'2', b'3']
    if not data:                            # 空输入时 True，直接返回
        return
    n = int(data[0])                        # b'3' -> 3
    a = list(map(int, data[1:1 + n]))       # [b'1', b'2', b'3'] -> [1, 2, 3]
    print(sum(a))                           # 6

if __name__ == "__main__":
    solve()
```

> **注解**：`read().split()` 一次读完并按任意空白切分；`data` 里是 `bytes`，`int(b'3')` 可以直接转换。`data[1:1 + n]` 取接下来 `n` 个数，切片左闭右开。`if __name__ == "__main__":` 保证被其他文件导入时不会自动执行。

记住这个骨架：**读入 → 转换 → 计算 → 输出**。蓝桥杯 90% 的题都是这个结构。

---

## 3. 语法对照：Java → Python

| Java                              | Python                            | 备注                 |
| --------------------------------- | --------------------------------- | ------------------ |
| `int a = 1;`                      | `a = 1`                           | 不用声明类型             |
| `final int N = 10;`               | `N = 10`                          | 常量靠命名约定（大写）        |
| `System.out.println(x);`          | `print(x)`                        | 自动换行               |
| `System.out.print(x);`            | `print(x, end="")`                |                    |
| `if (x > 0) { ... } else { ... }` | `if x > 0:` … `elif` … `else:`    | 冒号 + 缩进            |
| `for (int i = 0; i < n; i++)`     | `for i in range(n):`              | 左闭右开               |
| `for (int x : a)`                 | `for x in a:`                     |                    |
| `while (true)`                    | `while True:`                     |                    |
| `int[] a = new int[n];`           | `a = [0] * n`                     |                    |
| `int[][] g = new int[n][m];`      | `g = [[0] * m for _ in range(n)]` | 不要用 `[[0]*m]*n`    |
| `ArrayList<Integer>`              | `list`                            | 动态数组               |
| `HashMap<K, V>`                   | `dict`                            | 哈希表                |
| `HashSet<T>`                      | `set`                             | 哈希集合               |
| `String`                          | `str`                             | 不可变                |
| `a.length`                        | `len(a)`                          |                    |
| `s.length()`                      | `len(s)`                          |                    |
| `Math.max(a, b)`                  | `max(a, b)`                       | 可传多个               |
| `Integer.MAX_VALUE`               | `float("inf")` 或 `10**18`         |                    |
| `a / b`（整数除法）                     | `a // b`                          | **向下取整，和 Java 不同** |
| `a % b`                           | `a % b`                           | **负数结果不同**         |
| `(int) Math.sqrt(x)`              | `math.isqrt(x)`                   | 精确整数平方根            |
| `null`                            | `None`                            |                    |
| `true / false`                    | `True / False`                    | 大写                 |
| `&& / \|\| / !`                   | `and / or / not`                  |                    |
| `x++ / x--`                       | `x += 1 / x -= 1`                 | Python 没有自增        |
| `switch`                          | `if/elif` 或字典                     | 不要用 `match`（3.10+） |
| `try/catch`                       | `try/except`                      | 竞赛少用               |
| `String.format("%d", x)`          | `f"{x}"`                          | f-string 更快        |
| `Arrays.sort(a)`                  | `a.sort()`                        | 原地，返回 `None`       |
| `new Random().nextInt(n)`         | `random.randrange(n)`             |                    |

### 3.1 变量与类型

```python
a = 1
b = 2.5
c = "hello"
d = [1, 2, 3]
e = True
f = None

print(type(a))   # <class 'int'>
print(type(b))   # <class 'float'>
print(type(c))   # <class 'str'>
print(type(d))   # <class 'list'>
print(type(e))   # <class 'bool'>
print(type(f))   # <class 'NoneType'>
```

> **注解**：变量不需要声明类型，名字只是绑定到一个对象；`type(x)` 查看对象的实际类型。Java 的 `null` 对应 `None`，布尔值必须大写为 `True / False`。

### 3.2 数字运算

```python
print(7 / 2)        # 3.5
print(7 // 2)       # 3
print(-7 // 2)      # -4，向下取整，Java 是 -3
print(7 % 3)        # 1
print(-7 % 3)       # 2，结果符号跟除数一致
print(2 ** 10)      # 1024
print(abs(-5))      # 5
print(divmod(17, 5)) # (3, 2)，等价于 (17 // 5, 17 % 5)
```

> **注解**：`/` 永远返回浮点数；整数除法用 `//`，取余用 `%`，幂用 `**`。Python 的负数整除和取模都不是向零截断，做还原题时不要照搬 Java 的结论。

### 3.3 布尔值与真值判断

```python
print(bool(0), bool(1))          # False True
print(bool(""), bool("0"))       # False True
print(bool([]), bool([0]))       # False True
print(bool(None), bool("abc"))   # False True
```

> **注解**：`0`、`0.0`、`""`、`[]`、`{}`、`set()`、`None`、`False` 都按假处理，其余大多数对象按真处理。因此 `if a:` 常用来判断“非空/非零”。

### 3.4 分支

```python
score = 85

if score >= 90:       # False
    level = "A"
elif score >= 60:     # True
    level = "B"
else:
    level = "C"

print(level)          # B

x = 75
label = "及格" if x >= 60 else "不及格"
print(label)          # 及格
```

> **注解**：条件后面必须有冒号，代码块靠缩进划分，没有 Java 的花括号。`elif` 相当于 `else if`；三元表达式写成 `A if 条件 else B`，顺序和 Java 的 `条件 ? A : B` 不同。

### 3.5 循环

```python
for i in range(5):
    print(i)          # 依次输出: 0、1、2、3、4

for x in [10, 20, 30]:
    print(x)          # 依次输出: 10、20、30

x = 3
while x > 0:
    print(x)          # 依次输出: 3、2、1
    x -= 1
```

```python
for x in range(1, 6):
    if x == 2:        # 2 满足时跳过本轮
        continue
    if x == 5:        # 5 满足时结束整个循环
        break
    print(x)          # 依次输出: 1、3、4
```

> **注解**：`range(n)` 是左闭右开的 `0..n-1`；`range(a, b)` 是 `a..b-1`。`for ... in ...` 直接遍历元素，不需要下标。Python 没有 `x++ / x--`，要写 `x += 1 / x -= 1`。

### 3.6 函数

```python
def add(x, y=0):
    return x + y

print(add(2, 3))      # 5
print(add(5))         # 5，使用默认值 y=0

square = lambda x: x * x
print(square(5))      # 25

def show(*args, **kwargs):
    print(args)       # (1, 2)
    print(kwargs)     # {'x': 3}

show(1, 2, x=3)
```

> **注解**：`def` 定义函数，默认参数让调用更灵活；`*args` 收集多余的位置参数为 tuple，`**kwargs` 收集多余的关键字参数为 dict。`lambda` 只适合很短的函数，排序的 `key` 最常用。

### 3.7 类

```python
class Point:
    def __init__(self, x, y):      # 构造方法
        self.x = x
        self.y = y

    def dist2(self):               # 实例方法必须显式带 self
        return self.x * self.x + self.y * self.y

p = Point(3, 4)
print(p.x, p.y)       # 3 4
print(p.dist2())      # 25
```

> **注解**：`__init__` 是构造方法，`self` 相当于 Java 里的 `this`，但必须显式写在第一个参数。实例属性通过 `self.xxx` 创建和访问。

> **缩进就是语法**：同一代码块必须用相同的空格数（统一 4 个空格），不要混用 Tab 和空格。

---

## 4. 五大容器

### 4.1 list（动态数组）

```python
a = [10, 20, 30, 40]

print(a[0])          # 10
print(a[-1])         # 40，最后一个
print(a[1:3])        # [20, 30]，左闭右开
print(a[:2])         # [10, 20]
print(a[2:])         # [30, 40]
print(a[::-1])       # [40, 30, 20, 10]
print(len(a))        # 4
```

> **注解**：list 的索引从 0 开始，负数索引从末尾倒数。切片是左闭右开，`a[:n]` 取前 `n` 个，`a[n:]` 从下标 `n` 取到末尾，`a[::-1]` 反转。

#### 增删改查

```python
a = [1, 2, 3]

a.append(4)                    # 末尾追加，O(1)
print(a)                       # [1, 2, 3, 4]
a.extend([5, 6])               # 拼接另一个列表
print(a)                       # [1, 2, 3, 4, 5, 6]
a.insert(0, 0)                 # 头部插入，O(n)
print(a)                       # [0, 1, 2, 3, 4, 5, 6]
print(a.pop())                 # 6，弹出末尾，O(1)
print(a.pop(0))                # 0，弹出头部，O(n)
a.remove(3)                    # 删除第一个值为 3 的元素
print(a)                       # [1, 2, 4, 5]
print(a.index(2))              # 1，找不到会抛 ValueError
print(a.count(1))              # 1
```

> **注解**：`append / pop()` 操作末尾，平均 O(1)；`insert(0, x) / pop(0) / remove(x)` 需要移动元素，是 O(n)。`remove` 只删第一个匹配值，不存在会抛异常。

#### 排序、反转与查找

```python
a = [3, 1, 2]

a.sort()                # 原地升序，返回 None
print(a)                # [1, 2, 3]
a.sort(reverse=True)    # 原地降序
print(a)                # [3, 2, 1]
print(sorted(a))        # [1, 2, 3]，返回新列表，a 不变
a.reverse()             # 原地反转
print(a)                # [1, 2, 3]
print(sum(a), min(a), max(a))  # 6 1 3
print(2 in a)           # True，线性扫描 O(n)
```

> **注解**：`a.sort()` 原地修改并返回 `None`，不要写 `a = a.sort()`；`sorted(a)` 返回新列表。`x in list` 是 O(n)，频繁判断存在性应改用 `set`。

#### 切片赋值与复制

```python
a = [0, 1, 2, 3, 4, 5]
a[1:3] = [9, 8, 7]     # 用三个元素替换原来的两个元素
print(a)               # [0, 9, 8, 7, 3, 4, 5]

b = a                  # b 和 a 指向同一个 list
b.append(6)
print(a)               # [0, 9, 8, 7, 3, 4, 5, 6]

c = a[:]               # 浅拷贝，新 list
c.append(7)
print(a[-1], c[-1])    # 6 7
```

> **注解**：`=` 只是让两个名字指向同一个对象，不是复制；需要独立列表时用 `a[:]`、`a.copy()` 或 `list(a)`。切片赋值可以改变原列表长度。

#### 列表推导式

```python
sq = [x * x for x in range(6)]
print(sq)                      # [0, 1, 4, 9, 16, 25]

even = [x for x in sq if x % 2 == 0]
print(even)                    # [0, 4, 16]

pairs = [(i, ch) for i, ch in enumerate("ab")]
print(pairs)                   # [(0, 'a'), (1, 'b')]

print([x for x in range(10) if x % 2])  # [1, 3, 5, 7, 9]
```

> **注解**：列表推导式是“表达式 + for + 可选 if”，通常比 `for + append` 更快。`enumerate(a)` 同时给下标和元素，`enumerate(a, 1)` 下标从 1 开始。

#### 二维列表初始化

```python
n, m = 2, 3
g = [[0] * m for _ in range(n)]    # 正确：每行都是新 list
g[0][0] = 1
print(g)                            # [[1, 0, 0], [0, 0, 0]]

bad = [[0] * m] * n                 # 错误：所有行引用同一个 list
bad[0][0] = 1
print(bad)                          # [[1, 0, 0], [1, 0, 0]]
```

> **注解**：二维列表统一用 `[[0] * m for _ in range(n)]`。`[[0] * m] * n` 只是复制内层 list 的引用，改一行会牵连所有行。

### 4.2 dict（哈希表）

```python
d = {"a": 1, "b": 2}

print(d["a"])                  # 1
print(d.get("c"))              # None，不存在但不报错
print(d.get("c", 0))           # 0，使用默认值
d.setdefault("list", []).append(1)
print(d)                       # {'a': 1, 'b': 2, 'list': [1]}
print("a" in d)                # True，哈希查找 O(1)
```

> **注解**：`d[key]` 在 key 不存在时抛 `KeyError`；不确定时用 `d.get(key)` 或 `d.get(key, 默认值)`。`setdefault` 适合“没有就创建默认值”的场景。

#### 遍历与删除

```python
d = {"a": 1, "b": 2}

for k in d:
    print(k)                   # 依次输出: a、b

for k, v in d.items():
    print(k, v)                # 依次输出: a 1、b 2

print(list(d.keys()))          # ['a', 'b']
print(list(d.values()))        # [1, 2]

del d["a"]
print(d)                       # {'b': 2}
print(d.pop("x", None))        # None，安全删除，不报错
```

> **注解**：遍历 `d.items()` 同时拿 key 和 value；`d.keys()`、`d.values()` 返回视图。`del d[key]` 删除不存在的 key 会报错，`d.pop(key, None)` 不会。Python 3.7+ 的 dict 保持插入顺序，但业务排序仍应显式排序。

#### 计数与邻接表

```python
from collections import Counter

cnt = Counter("abracadabra")
print(cnt["a"])                # 5
print(cnt["x"])                # 0，不存在也不报错
print(cnt.most_common(2))      # [('a', 5), ('b', 2)]

from collections import defaultdict

g = defaultdict(list)
g[1].append(2)                 # 键不存在时自动创建空 list
print(dict(g))                 # {1: [2]}
```

> **注解**：`Counter` 统计频次，不存在的 key 返回 0；`most_common(k)` 取次数最多的前 `k` 项。`defaultdict(list)` 最适合建邻接表，`defaultdict(int)` 适合计数。

### 4.3 set（哈希集合）

```python
a = {1, 2, 3}
b = {2, 3, 4}

print(a & b)               # {2, 3}
print(a | b)               # {1, 2, 3, 4}
print(a - b)               # {1}
print(a ^ b)               # {1, 4}
print(2 in a)              # True，平均 O(1)

a.add(5)
a.discard(1)               # 不存在也不报错
print(a)                   # {2, 3, 5}（顺序不保证）
```

> **注解**：`&` 交集、`|` 并集、`-` 差集、`^` 对称差。`add` 添加，`discard` 安全删除，`remove` 删除不存在的元素会报错。set 无序，不能按下标访问。

#### 去重

```python
a = [3, 1, 3, 2]
print(list(set(a)))                 # [1, 2, 3]，顺序不保证
print(list(dict.fromkeys(a)))       # [3, 1, 2]，保留首次出现顺序
```

> **注解**：只关心去重用 `set(a)`；既去重又保留原顺序用 `list(dict.fromkeys(a))`。不要依赖 `list(set(a))` 的顺序。

### 4.4 tuple（元组）

```python
p = (1, 2)
print(p)                    # (1, 2)
x, y = p                    # 解包
print(x, y)                 # 1 2

points = [(1, 2), (3, 4)]
points.sort(key=lambda p: (p[1], p[0]))
print(points)               # [(1, 2), (3, 4)]
print((1,))                 # (1,)，单元素 tuple 必须有逗号
```

> **注解**：tuple 不可修改、可哈希，适合作为 dict 的 key、set 的元素和排序的多关键字。`x, y = p` 是解包，左右元素个数必须一致；单元素 tuple 必须写 `(1,)`。

### 4.5 deque（双端队列）

```python
from collections import deque

q = deque()
q.append(1)                 # 右端加入
q.appendleft(2)             # 左端加入
print(q)                    # deque([2, 1])
print(q.pop())              # 1，右端弹出
print(q.popleft())          # 2，左端弹出，O(1)
print(q)                    # deque([])
```

> **注解**：deque 两端插入/删除都是 O(1)，适合 BFS 队列和滑动窗口。不要用 list 当队列，`pop(0)` 是 O(n)。`deque(maxlen=3)` 可以自动丢弃旧元素。

### 复杂度速查

| 操作 | list | dict | set |
|---|---|---|---|
| 按下标访问 | O(1) | — | — |
| `x in` | O(n) | O(1) 平均 | O(1) 平均 |
| 末尾 append / pop | O(1) | — | — |
| 头部 insert / pop(0) | O(n) | — | — |
| 排序 | O(n log n) | — | — |

> **注解**：表中的 O(1) 是平均复杂度，哈希冲突严重时会退化，但竞赛中通常按 O(1) 估算。选容器先看操作：查找多 → set/dict；两端操作多 → deque；需要有序和下标 → list。

---

## 5. 字符串

```python
s = "Hello, World"

print(len(s))                    # 12
print(s[0], s[-1])               # H d
print(s[7:12])                   # World
print(s[::-1])                   # dlroW ,olleH
print("ell" in s)                # True，子串判断
```

> **注解**：字符串支持下标、切片和 `len()`，切片规则与 list 相同。字符串不可变，不能写 `s[0] = "h"`；反转常用 `s[::-1]`。

### 5.1 大小写与清理

```python
s = "  Hello, World  "

print(repr(s.strip()))           # 'Hello, World'
print(repr(s.lstrip()))          # 'Hello, World  '
print(repr(s.rstrip()))          # '  Hello, World'
print(repr(s.upper()))           # '  HELLO, WORLD  '
print(repr(s.lower()))           # '  hello, world  '
print(repr(s.title()))           # '  Hello, World  '
```

> **注解**：这里用 `repr()` 是为了把前后空格也显示出来；普通 `print` 不会显示引号。`strip / lstrip / rstrip` 只去两端空白，不改变中间内容；`upper / lower` 返回新字符串，原字符串不变。

### 5.2 查找、替换与拆分

```python
s = "Hello, World"

print(s.find("World"))           # 7
print(s.find("Java"))            # -1，找不到
print(s.index("World"))          # 7
print(s.count("l"))              # 3
print(s.replace("l", "L"))       # HeLLo, WorLd
print(s.split(","))              # ['Hello', ' World']
print("a b  c".split())          # ['a', 'b', 'c']，按任意空白切分
print("-".join(["a", "b", "c"])) # a-b-c
```

> **注解**：`find` 找不到返回 `-1`，`index` 找不到抛异常，竞赛里通常用 `find` 或 `in`。`split()` 不写分隔符时按任意空白切分；`join` 只接受字符串元素。

### 5.3 判断字符类型

```python
print("123".isdigit())       # True
print("abc".isalpha())       # True
print("abc123".isalnum())    # True
print("ABC".isupper())       # True
print("abc".islower())       # True

print(ord("a"))              # 97，字符转编码
print(chr(97))               # a，编码转字符
print(ord("A"), ord("Z"))    # 65 90
print(ord("a"), ord("z"))    # 97 122
```

> **注解**：`ord / chr` 用于字符和编码互转，字母大小写相差 32。Python 没有单独的 `char` 类型，`s[i]` 就是长度为 1 的字符串。

### 5.4 格式化

```python
x, y = 3, 4

print(f"{x} + {y} = {x + y}")    # 3 + 4 = 7
print(f"{3.14159:.2f}")          # 3.14
print(f"{x:03d}")                # 003
print(f"{0.1234:.1%}")           # 12.3%
print("%d %.2f" % (x, 3.14159))  # 3 3.14
```

> **注解**：f-string 最推荐，`{}` 中可以直接写变量和表达式。`:.2f` 保留两位小数，`:03d` 表示至少三位、左边补零，`:.1%` 输出百分比。

### 5.5 不可变与高效拼接

```python
parts = []
for i in range(100000):
    parts.append(str(i))
ans = "".join(parts)
print(len(ans))                  # 488890

s = "abc"
print(s[0])                      # a
# s[0] = "A"                     # TypeError，字符串不可变
```

> **注解**：循环里 `s += ch` 会不断创建新字符串，最坏 O(n²)。大量拼接先放进 list，最后 `"".join(parts)`，总复杂度 O(n)；数字要先 `str(x)` 转换。

---

## 6. 函数

```python
def add(a, b=0):
    return a + b

print(add(2, 3))       # 5
print(add(5))          # 5，b 使用默认值 0

def greet(name, prefix="Hi"):
    return f"{prefix}, {name}"

print(greet("Tom"))              # Hi, Tom
print(greet("Tom", "Hello"))     # Hello, Tom
```

> **注解**：默认参数在调用方不传时生效；位置参数按顺序匹配，也可以写 `greet(prefix="Hello", name="Tom")`。函数没有写 `return` 时默认返回 `None`。

### 6.1 可变参数与 lambda

```python
def show(*args, **kwargs):
    print(args)        # (1, 2)，多余位置参数组成 tuple
    print(kwargs)      # {'x': 3}，多余关键字参数组成 dict

show(1, 2, x=3)

square = lambda x: x * x
print(square(5))       # 25

def no_return():
    pass

print(no_return())     # None
```

> **注解**：`*args` 收集位置参数，`**kwargs` 收集关键字参数。`lambda` 只适合一行短函数，排序的 `key` 最常用。

### 6.2 默认参数陷阱

```python
def bad(x, acc=[]):        # 错：所有调用共享同一个默认 list
    acc.append(x)
    return acc

def good(x, acc=None):
    if acc is None:
        acc = []
    acc.append(x)
    return acc

print(bad(1))    # [1]
print(bad(2))    # [1, 2]，上一次的 1 还在
print(good(1))   # [1]
print(good(2))   # [2]，每次重新创建
```

> **注解**：默认参数只在函数定义时求值一次，`acc=[]` 会被所有调用共享。需要可变默认值时用 `None` 占位，进入函数后再创建。数字、字符串、`None`、tuple 等不可变默认值没有这个问题。

### 6.3 作用域：global 与 nonlocal

```python
cnt = 0

def inc():
    global cnt
    cnt += 1

inc()
print(cnt)             # 1

def outer():
    x = 0
    def inner():
        nonlocal x
        x += 1
        return x
    return inner

f = outer()
print(f(), f())        # 1 2
```

> **注解**：只读全局变量不需要 `global`；在函数内给全局变量重新赋值必须声明 `global`。嵌套函数修改外层函数的局部变量要用 `nonlocal`。修改 list/dict 的内容（`append`、`d[k] = v`）不用声明。

### 6.4 递归与类型标注

```python
def fact(n):
    if n <= 1:
        return 1
    return n * fact(n - 1)

print(fact(5))         # 120

def add(a: int, b: int) -> int:   # 类型标注，运行时不强制检查
    return a + b

print(add(2, 3))       # 5
```

> **注解**：递归必须有终止条件；Python 默认递归深度约 1000，深递归要改迭代或调高上限。类型标注只是提示，不会自动阻止传入其他类型。

---

## 7. 排序

```python
a = [3, 1, 2]

result = a.sort()               # 原地升序，返回值是 None
print(result)                   # None
print(a)                        # [1, 2, 3]

b = sorted(a, reverse=True)     # 返回新列表
print(b)                        # [3, 2, 1]
print(a)                        # [1, 2, 3]，原列表不变
```

> **注解**：`list.sort()` 原地修改，返回 `None`；`sorted()` 返回新列表。千万不要写 `a = a.sort()`，否则 `a` 会变成 `None`。`reverse=True` 表示降序。

### 7.1 按 key 排序

```python
students = [("Tom", 90), ("Amy", 95), ("Bob", 90)]

students.sort(key=lambda x: x[1])
print(students)      # [('Tom', 90), ('Bob', 90), ('Amy', 95)]

students.sort(key=lambda x: (-x[1], x[0]))
print(students)      # [('Amy', 95), ('Bob', 90), ('Tom', 90)]
```

> **注解**：`key` 接收一个函数，排序时比较它返回的值。多关键字让 key 返回 tuple，会按字段顺序依次比较。数字降序可以对数字取负；字符串不能直接取负。

### 7.2 混合升降序

```python
a = [("b", 2), ("a", 2), ("c", 1)]

# 先排次要关键字，再排主要关键字；sort 是稳定排序
a.sort(key=lambda x: x[1], reverse=True)
a.sort(key=lambda x: x[0])
print(a)             # [('a', 2), ('b', 2), ('c', 1)]

items = [("b", 2), ("a", 2), ("c", 1)]
items.sort(key=lambda x: (x[0], -x[1]))
print(items)         # [('a', 2), ('b', 2), ('c', 1)]
```

> **注解**：稳定排序会保留相等元素的相对顺序，所以多次排序必须“先排次要关键字，再排主要关键字”。数字降序可以写成 `-x[1]`；字符串降序不能取负，只能用两次稳定排序。

### 7.3 自定义比较器

```python
from functools import cmp_to_key

def cmp(a, b):
    if a < b:
        return -1
    if a > b:
        return 1
    return 0

a = [3, 1, 2]
a.sort(key=cmp_to_key(cmp))
print(a)                  # [1, 2, 3]
```

> **注解**：比较器返回负数表示 `a` 在前，返回 0 表示相等，返回正数表示 `b` 在前。`cmp_to_key` 比普通 key 慢，能写成 key 就优先写 key。

---

## 8. 输入输出（竞赛最重要）

> 下面代码注释中的“样例输入”是终端里键入的内容；右侧注释是运行后得到的值或屏幕输出。

### 8.1 常见读法

```python
# 样例输入：5
n = int(input())                 # n = 5，input() 得到字符串 "5"
print(n)                         # 5
```

```python
# 样例输入：3 1 4 1 5
a = list(map(int, input().split()))
print(a)                         # [3, 1, 4, 1, 5]
```

```python
# 样例输入：3，然后依次输入 10、20、30
n = int(input())                 # n = 3
a = [int(input()) for _ in range(n)]
print(a)                         # [10, 20, 30]
```

```python
# 样例输入：
# 2 3
# 1 2 3
# 4 5 6
n, m = map(int, input().split())  # n=2, m=3
g = [list(map(int, input().split())) for _ in range(n)]
print(g)                          # [[1, 2, 3], [4, 5, 6]]
```

```python
# 行数未知，读到 EOF 为止
import sys

for line in sys.stdin:
    line = line.strip()           # 去掉行末换行
    if not line:                  # 跳过空行
        continue
    a = list(map(int, line.split()))
    print(sum(a))                 # 样例每行 1 2 3 -> 6
```

> **注解**：`input()` 返回字符串，数值一定要 `int()` 或 `map(int, ...)`；`split()` 不写参数时按任意空白切分。`n, m = map(...)` 要求这一行恰好两个数，否则会解包失败。读到 EOF 用 `for line in sys.stdin:`，记得跳过空行。

### 8.2 推荐：一次读入全部

```python
import sys

def solve():
    data = sys.stdin.buffer.read().split()  # [b'3', b'10', b'20', b'30']
    if not data:                            # 空输入时直接结束
        return
    n = int(data[0])                        # 3
    a = list(map(int, data[1:1 + n]))       # [10, 20, 30]
    print(sum(a))                           # 60

if __name__ == "__main__":
    solve()
```

> **注解**：`read().split()` 一次读完，比循环调用 `input()` 快；`data` 是 `bytes` 列表，`int(b"10")` 可以直接转换。`data[1:1 + n]` 只取需要的 `n` 个元素。需要字符串时用 `data[i].decode()`。这是最稳的竞赛模板。

### 8.3 输出

```python
x, y = 10, 20
a = [1, 2, 3]

print(x)                     # 10
print(x, y)                  # 10 20
print(*a)                    # 1 2 3
print(f"{x:.2f}")            # 10.00
print(x, end="")             # 输出 10，不换行
print(y, end=" ")            # 输出 20 和一个空格，不换行
```

> **注解**：`print` 默认用空格分隔多个参数，并在末尾换行；`end=""` 去掉换行，`end=" "` 改成用空格结尾。`*a` 是解包，把列表元素当成多个参数传给 `print`。

#### 大量输出

```python
import sys

ans = [1, 2, 3]
sys.stdout.write("\n".join(map(str, ans)))  # 屏幕显示：1 换行 2 换行 3
print()                                    # 补一个换行
```

> **注解**：`join` 只接受字符串，所以先用 `map(str, ans)` 转换。`sys.stdout.write` 不自动换行；大量输出时一次 `join` 比循环 `print` 快很多。

### 8.4 输入输出的坑

- `input()` 返回**字符串**，要 `int()`。
- `input()` 会去掉末尾换行，但不会去空格；必要时 `.strip()`。
- 有的题一行有多个空格或前后空格，`.split()` 会自动处理。
- 输出不要多打空格/空行；有的 OJ 严格比对。
- 多组数据时，注意每组之间是否要空行（蓝桥杯一般不用）。
- 输入格式不规整时，不要假设“每行一个数”，优先 `split()`。
- 多组数据常见格式：先读 `T`，再循环 `T` 次；每组的输入格式要单独分析。
- 本地测试时把样例复制到终端，逐字比对输出，包括行尾空格。

---

## 9. 标准库速查

> 比赛只用标准库。先记高频 API，所有结果都写在对应调用的右侧。

### math

```python
import math

a, b = 12, 18

print(math.gcd(a, b))                    # 6
print(math.lcm(a, b))                    # 36，Python 3.9+
print(math.isqrt(17))                    # 4，精确整数平方根
print(math.factorial(5))                 # 120
print(math.comb(5, 2))                   # 10，组合数 C(5,2)
print(math.perm(5, 2))                   # 20，排列数 A(5,2)
print(math.ceil(3.1), math.floor(3.9))   # 4 3
print(math.log2(8))                      # 3.0
print(math.inf, -math.inf)               # inf -inf
print(math.pi)                           # 3.141592653589793
```

> **注解**：`gcd / lcm` 比手写欧几里得更稳；`isqrt` 返回向下取整的整数平方根，避免浮点误差。Python 3.8 没有 `math.lcm`，可写 `a // math.gcd(a, b) * b`。

### collections

```python
from collections import deque, Counter, defaultdict

q = deque([1, 2])
q.appendleft(0)
q.pop()
print(q)                                # deque([0, 1])

cnt = Counter("aab")
print(cnt)                              # Counter({'a': 2, 'b': 1})
print(cnt["x"])                         # 0，不存在的键返回 0

g = defaultdict(list)
g[1].append(2)
print(dict(g))                          # {1: [2]}
```

> **注解**：`deque` 适合队列和 BFS；`Counter` 统计频次；`defaultdict(list)` 建邻接表时不用先判断键是否存在。这些操作都按平均 O(1) 估算。

### itertools

```python
from itertools import permutations, combinations, product, accumulate

print(len(list(permutations([1, 2, 3]))))        # 6，全排列
print(list(combinations([1, 2, 3], 2)))          # [(1, 2), (1, 3), (2, 3)]
print(len(list(product([0, 1], repeat=3))))      # 8，笛卡尔积
print(list(accumulate([1, 2, 3])))               # [1, 3, 6]，前缀和
```

> **注解**：`permutations` 有顺序，`combinations` 不考虑顺序；`product` 是笛卡尔积，`repeat=3` 表示每个位置都从原列表取。它们返回迭代器，需要 `list()` 才能一次看到全部结果。

### heapq（最小堆）

```python
import heapq

h = []
heapq.heappush(h, 3)
heapq.heappush(h, 1)
print(heapq.heappop(h))       # 1，每次弹出最小值

# 最大堆：存负数
heapq.heappush(h, -5)
print(-heapq.heappop(h))      # 5，用负数实现最大堆

a = [3, 1, 2]
heapq.heapify(a)              # 原地建堆，O(n)
print(a)                      # [1, 3, 2]，只保证堆顶最小
```

> **注解**：heapq 只保证堆顶最小，不保证整个列表有序。`heappush / heappop` 是 O(log n)，`heapify` 是 O(n)。最大堆存负数；堆里放 tuple 时按 tuple 顺序比较。

### bisect（有序数组二分）

```python
from bisect import bisect_left, bisect_right

a = [1, 2, 2, 3]

i = bisect_left(a, 2)
j = bisect_right(a, 2)

print(i, j)                       # 1 3
print(j - i)                      # 2，等于 2 的元素个数
print(bisect_left([1, 3, 5], 4))  # 2，插入位置
```

> **注解**：`bisect_left` 返回第一个 `>= x` 的位置，`bisect_right` 返回第一个 `> x` 的位置；两者之差就是 `x` 的出现次数。二分前数组必须有序。

### functools

```python
from functools import lru_cache

@lru_cache(maxsize=None)
def f(n):
    if n <= 1:
        return n
    return f(n - 1) + f(n - 2)

print(f(10))                # 55
print(f.cache_info().hits)  # 8
```

> **注解**：`@lru_cache` 把参数作为 key 缓存返回值，是递归 DP 的常用写法。参数必须可哈希，list 不能直接缓存，要转成 tuple；`maxsize=None` 表示不限制缓存数量。

### datetime（日期题）

```python
from datetime import date, timedelta

d = date(2027, 4, 10)
print(d)                                      # 2027-04-10
print(d.weekday())                            # 5，0=周一、6=周日
print(d.isoweekday())                         # 6，1=周一、7=周日
print((d - date(2026, 11, 25)).days)          # 136
print(d + timedelta(days=1))                  # 2027-04-11

import calendar
print(calendar.isleap(2024))                  # True
print(calendar.monthrange(2027, 2))           # (0, 28)，周一起始与当月天数
```

> **注解**：`weekday()` 周一为 0，`isoweekday()` 周一为 1；两个 `date` 相减得到 `timedelta`，`.days` 是整数天数。`timedelta(days=1)` 可用来枚举日期。`date.fromisoformat("2027-04-10")` 可以解析 ISO 日期。

### fractions / decimal（精度题）

```python
from fractions import Fraction

x = Fraction(1, 3) + Fraction(1, 6)
print(x)                                # 1/2
print(x.numerator, x.denominator)       # 1 2

from decimal import Decimal, getcontext
getcontext().prec = 50
print(Decimal(1) / Decimal(3))          # 0.33333333333333333333333333333333333333333333333333
print(0.1 + 0.2)                        # 0.30000000000000004
print(f"{0.1 + 0.2:.2f}")               # 0.30
```

> **注解**：精确分数用 `Fraction`，避免浮点误差；`Decimal` 要先设置 `getcontext().prec`。普通浮点数 `0.1 + 0.2` 不等于 `0.3`，比较时用 `abs(a - b) < 1e-9`，输出时用格式化控制小数位。

### random

```python
import random

random.seed(42)              # 固定种子，结果可复现
print(random.randint(1, 6))  # 6
print(random.randrange(10))  # 1

a = [1, 2, 3, 4, 5]
random.shuffle(a)
print(a)                     # [2, 4, 5, 3, 1]
print(random.choice(a))      # 4
```

> **注解**：`randint(a, b)` 两端都包含，`randrange(n)` 等价于 `randrange(0, n)` 且右端不包含。`seed` 只用于本地复现实验，正式提交时通常不要固定；上面结果由 `seed(42)` 产生。

### sys

```python
import sys

print(sys.getrecursionlimit())            # 1000，默认递归上限
sys.setrecursionlimit(1_000_000)
print(sys.getrecursionlimit())            # 1000000

data = sys.stdin.buffer.read()            # 快速读入，返回 bytes
sys.stdout.write("hello\n")              # 输出 hello，write 不自动换行
```

> **注解**：默认递归深度约 1000，DFS 前可适当提高，但太深仍可能爆栈。`sys.stdin.buffer.read()` 返回 bytes，配合 `.split()` 快读；`sys.stdout.write()` 不会自动换行，需要自己加 `"\n"`。

---

## 10. Java 程序员最容易踩的 40 个坑

### 1. 整数除法不是向零取整

```python
print(7 / 2)     # 3.5   （/ 永远返回 float）
print(7 // 2)    # 3
print(-7 // 2)   # -4    ← Java 是 -3
print(-7 % 3)    # 2     ← Java 是 -1
```

需要 Java 语义时：

```python
import math
q = math.trunc(a / b)   # 小数据可以；大整数会掉精度
```

### 2. `/` 总是浮点

`10**18 / 2` 会变成 float，可能丢精度。整数运算统一用 `//`。

### 3. `a = a.sort()` 得到 None

```python
a = [3, 1, 2]
a = a.sort()      # a 变成 None！
a.sort()          # 正确：原地
b = sorted(a)     # 正确：新列表
```

### 4. 赋值不是复制

```python
a = [1, 2]
b = a             # 指向同一个列表
b.append(3)       # a 也变了
b = a[:]          # 浅拷贝
b = a.copy()      # 浅拷贝
```

### 5. 二维数组不要这样初始化

```python
bad = [[0] * 3] * 2          # 两行是同一个对象
good = [[0] * 3 for _ in range(2)]
```

### 6. 默认参数不要用可变对象

```python
def f(x, acc=[]):    # 错
    ...
def f(x, acc=None):
    if acc is None:
        acc = []
```

### 7. 递归默认深度只有 1000

```python
import sys
sys.setrecursionlimit(1_000_000)
```

但 10 万层的链式递归仍可能爆 C 栈，优先改迭代。

### 8. `input()` 返回字符串

```python
n = int(input())
a = list(map(int, input().split()))
```

### 9. `range` 是左闭右开

`range(n)` → `0..n-1`；`range(1, n + 1)` → `1..n`；倒序 `range(n - 1, -1, -1)`。

### 10. 浮点数不要用 `==`

```python
if abs(a - b) < 1e-9:
    ...
```

### 11. `is` 不是 `==`

`is` 比较身份，`==` 比较值。只用 `x is None`，不要用 `is` 比较数字/字符串。

### 12. 字符串不可变

循环里 `s += ch` 可能 O(n²)，用 `list.append` + `"".join`。

### 13. list 删除的复杂度

`remove(v)`、`pop(0)`、`insert(0, v)` 都是 O(n)。频繁头部操作 use `deque`。

### 14. dict 的键必须可哈希

list 不能当键，tuple 可以。

### 15. set 无序

遍历顺序不保证；要按顺序输出先 `sorted(s)`。

### 16. 多关键字排序

```python
a.sort(key=lambda x: (x[1], -x[0]))
```

### 17. 混合升降序（字符串）

不能取负，用稳定排序排两次（见第 7 节）。

### 18. 无穷大

```python
INF = float("inf")
if dist[u] < INF:
    ...
```

### 19. 大整数自动支持

```python
print(2 ** 100)
print(math.factorial(100))
print(pow(a, b, mod))     # 快速幂 + 取模，直接用
```

### 20. 函数里改全局变量要 `global`

```python
cnt = 0
def inc():
    global cnt
    cnt += 1
```

### 21. `and` / `or` 返回的是操作数

```python
x = a or 0        # a 为假时取 0
y = a and b       # a 为真时取 b
```

### 22. 真值判断

`0`、`0.0`、`""`、`[]`、`{}`、`set()`、`None`、`False` 都是假。

### 23. `enumerate` / `zip`

```python
for i, x in enumerate(a, 1):   # 从 1 开始
    ...
for x, y in zip(a, b):         # 以短的为准
    ...
```

### 24. `map` / `filter` 是惰性的

Python 3 里要 `list(map(...))` 才能看到全部结果。

### 25. 队列用 deque

```python
from collections import deque
q = deque()
q.append(x)
q.popleft()      # O(1)
```

### 26. heapq 只有最小堆

最大堆存负数；堆里放元组时，按元组顺序比较。

### 27. `lru_cache` 的参数必须可哈希

不能缓存 list；需要时转成 tuple。

### 28. 深递归改迭代

树上 10 万节点、网格 1000×1000，优先 BFS/显式栈。

### 29. Python 没有 char

`s[i]` 是长度为 1 的字符串；`ord` / `chr` 转换。

### 30. `round` 是银行家舍入

```python
round(2.5)   # 2，不是 3
round(3.5)   # 4
```

要四舍五入：`math.floor(x + 0.5)`（正数）。

### 31. `int()` 向零截断

`int(-3.9)` → `-3`；`int("12")` → 12。

### 32. 空列表的 max/min 会报错

```python
max([], default=0)   # 安全
```

### 33. 输出空格

`print(a, b)` 会自动加一个空格；`print(*a)` 展开列表。严格比对的题要小心。

### 34. 多行输入

最稳的是 `sys.stdin.buffer.read().split()`，不要假设每行格式完全规整。

### 35. 闭包与 `nonlocal`

嵌套函数里修改外层变量需要 `nonlocal`；只读不需要。

### 36. 类的方法要带 `self`

```python
class A:
    def __init__(self):
        self.x = 1
    def get(self):
        return self.x
```

### 37. 异常不要滥用

竞赛里只在解析输入时用 `try/except`，不要用异常控制流程（慢）。

### 38. 深拷贝很慢

`copy.deepcopy` 能不用就不用；二维数组用列表推导式复制。

### 39. 时间/空间常数大

同样 O(n)，Python 可能比 C++ 慢 20–50 倍。看到 `n = 10^7` 就要警惕。

### 40. 版本兼容

蓝桥杯环境可能不是你本机的版本。避免：

- `match`（3.10+）
- `int.bit_count()`（3.10+）
- `dict1 | dict2`（3.9+）
- `list[int]` 类型标注（3.9+）

---

## 11. 性能：Python 慢，怎么活

### 先记住数量级

| 操作量 | 大致耗时 | 建议 |
|---|---|---|
| 10^6 次简单循环 | 0.05–0.2 s | 放心写 |
| 10^7 次简单循环 | 0.5–2 s | 勉强，尽量优化 |
| 10^8 次 | 5–20 s | 基本会超时，换算法 |

> 蓝桥杯对 Python 的时限通常比 C++ 宽松，但不是无限。**先想复杂度，再想常数。**

### 1. 快速读入

```python
data = sys.stdin.buffer.read().split()
```

不要在大循环里反复 `input()`。

### 2. 局部变量

函数内的局部变量比全局变量快。热循环里先把常用对象绑定到局部：

```python
def solve():
    a = data
    n = len(a)
    total = 0
    for i in range(n):
        total += a[i]
```

### 3. 用内置函数

`sum`、`min`、`max`、`sorted`、`any`、`all` 都是 C 实现，比手写循环快。

```python
total = sum(a)                 # 快
total = 0
for x in a: total += x         # 慢一些
```

### 4. 列表推导式 > append 循环

```python
b = [x * 2 for x in a]         # 快
b = []
for x in a:
    b.append(x * 2)            # 慢
```

### 5. 避免深递归

递归有函数调用开销，还可能爆栈。能用 BFS/迭代就用。

### 6. 字符串用 join

```python
ans = "".join(parts)
```

### 7. 成员判断用 set/dict

```python
seen = set()
if x in seen:      # O(1)
    ...
```

不要用 `if x in list`（O(n)）。

### 8. 预处理

多次查询区间和 → 前缀和；多次查询最值 → ST 表/线段树；多次判断素数 → 筛法。

### 9. 减少取模次数

`(a + b) % MOD` 比每个中间结果都取模快；但注意别溢出（Python 不会溢出，只是数字变大后变慢）。

### 10. 输出用 join

```python
sys.stdout.write("\n".join(map(str, ans)))
```

### 11. 不要用 numpy

比赛环境没有，且不允许。

### 12. 必要时换算法

Python 下 O(n²) 在 n=5000 就可能 2–3 秒；能 O(n log n) 就 O(n log n)。

---

## 12. 三周学习安排

### 第 1 周：语法 + 容器

| 天 | 内容 | 题量 |
|---|---|---|
| 1 | 安装、变量、输入输出、分支、循环 | 3 个小程序 |
| 2 | list、切片、列表推导式 | 5 题 |
| 3 | dict、set、tuple、Counter | 5 题 |
| 4 | 函数、lambda、排序 | 5 题 |
| 5 | 字符串、格式化 | 5 题 |
| 6 | 综合练习 | 8 题 |
| 7 | 复盘 + 重做错题 | — |

### 第 2 周：标准库 + 基础算法手感

| 天 | 内容 | 题量 |
|---|---|---|
| 1 | math、itertools、collections | 5 题 |
| 2 | heapq、bisect | 5 题 |
| 3 | 枚举、模拟 | 5 题 |
| 4 | 排序、贪心 | 5 题 |
| 5 | 递归、递推 | 5 题 |
| 6 | 蓝桥杯官方"基础练习" | 8 题 |
| 7 | 复盘 + 限时小测 | 3 题 |

### 第 3 周：IO + 综合 + 坑清单

| 天 | 内容 | 题量 |
|---|---|---|
| 1 | 快读、快写、矩阵输入 | 5 题 |
| 2 | 日期、进制、大整数 | 5 题 |
| 3 | 二维数组、方向数组 | 5 题 |
| 4 | 综合模拟题 | 5 题 |
| 5 | 综合模拟题 | 5 题 |
| 6 | 限时 2 小时小测 | 4 题 |
| 7 | 整理自己的"Java→Python 坑"清单 | — |

---

## 13. 自测清单

能**不看资料**完成下面 20 项，P0 就过关了：

- [ ] 读出 n 和一行 n 个整数
- [ ] 读入 n×m 矩阵
- [ ] 求和、最大值、最小值、平均值
- [ ] 排序并去重
- [ ] 统计每个元素出现次数
- [ ] 判断素数 / 筛出 1..n 的素数
- [ ] 求 gcd、lcm
- [ ] 十进制转二进制/十六进制，反之
- [ ] 判断闰年、算两个日期的天数差
- [ ] 用 `itertools` 生成全排列/组合
- [ ] 手写二分查找
- [ ] 一维前缀和、一维差分
- [ ] 双指针 / 滑动窗口
- [ ] 递归求阶乘/斐波那契
- [ ] 记忆化搜索
- [ ] 并查集
- [ ] BFS / DFS 遍历网格
- [ ] 01 背包
- [ ] 快速幂
- [ ] 写一个对拍脚本

> 任何一项卡住，回到对应章节补，不要往下赶。
