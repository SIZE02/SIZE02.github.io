---
title: 算法模板库
date: 2026-11-26 18:00:43
updated: 2026-11-26 18:00:43
description: 1. 先理解，再默写。考前要能在 30 分钟内写出核心模板。
tags: [蓝桥杯, 算法, 模板, 蓝桥杯 2027, 笔记库]
categories: [蓝桥杯 2027]
---
> **使用原则**
> 1. 先理解，再默写。考前要能在 30 分钟内写出核心模板。
> 2. 模板只是骨架，题目要改下标（0/1 开始）、边界、取模。
> 3. 每个模板至少配 3 道题，否则背了也不会用。
> 4. 比赛的最终目标是**做对题**，不是套模板；想不清楚时先写暴力。
>
> **国奖路线（6–8 小时/周）**：省赛前学核心 20 个 + 省一选学；国赛模板（线段树、状压/数位 DP 等）省一后再学。省赛遇到不会的，用暴力拿部分分。
>
> 核心 20 个：快读、二分、前缀和/差分、滑动窗口、并查集、堆、单调栈、单调队列、树状数组、BFS/DFS、回溯、拓扑排序、Dijkstra、Kruskal、01/完全背包、LIS/LCS、筛法、快速幂、日期/进制、对拍。

## 默写优先级

| 优先级 | 模板 |
|---|---|
| ★★★ 必须闭眼写 | 快读、二分、前缀和/差分、并查集、BFS/DFS、01/完全背包、Dijkstra、筛法、快速幂 |
| ★★ 省一选学 | 滑动窗口、堆、回溯、拓扑排序、Kruskal、LIS/LCS、单调栈/队列、树状数组、区间 DP、日期/进制 |
| ★ 国赛再学 | 线段树、状压 DP、数位 DP、树形 DP、KMP、字符串哈希、矩阵快速幂、组合数 |

---

## 索引

0. [快读快写](#0-快读快写)
1. [二分](#1-二分)
2. [前缀和与差分](#2-前缀和与差分)
3. [双指针与滑动窗口](#3-双指针与滑动窗口)
4. [排序与贪心](#4-排序与贪心)
5. [并查集](#5-并查集)
6. [堆](#6-堆)
7. [单调栈与单调队列](#7-单调栈与单调队列)
8. [树状数组](#8-树状数组)
9. [线段树](#9-线段树)
10. [DFS / BFS / 回溯](#10-dfs--bfs--回溯)
11. [图论](#11-图论)
12. [动态规划](#12-动态规划)
13. [数学](#13-数学)
14. [字符串](#14-字符串)
15. [杂项](#15-杂项)

---

## 0. 快读快写

**用途**：所有题。输入行数/格式不确定时最稳。

```python
import sys

def main():
    data = sys.stdin.buffer.read().split()
    if not data:
        return
    it = iter(data)
    n = int(next(it))
    a = [int(next(it)) for _ in range(n)]

    # 计算
    ans = sum(a)

    sys.stdout.write(str(ans))

if __name__ == "__main__":
    main()
```

**注意**：

- `sys.stdin.buffer.read()` 读到 EOF，返回 bytes；`.split()` 按任意空白切分。
- `int(b"123")` 可以直接用。
- 不确定行数、矩阵、多组数据，都可以用这个方式先全部读进来。

---

## 1. 二分

### 1.1 标准二分查找

```python
def binary_search(a, x):
    lo, hi = 0, len(a) - 1
    while lo <= hi:
        mid = (lo + hi) // 2
        if a[mid] == x:
            return mid
        if a[mid] < x:
            lo = mid + 1
        else:
            hi = mid - 1
    return -1
```

### 1.2 lower_bound / upper_bound

```python
def lower_bound(a, x):
    """第一个 >= x 的下标，找不到返回 len(a)"""
    lo, hi = 0, len(a)
    while lo < hi:
        mid = (lo + hi) // 2
        if a[mid] < x:
            lo = mid + 1
        else:
            hi = mid
    return lo

def upper_bound(a, x):
    """第一个 > x 的下标"""
    lo, hi = 0, len(a)
    while lo < hi:
        mid = (lo + hi) // 2
        if a[mid] <= x:
            lo = mid + 1
        else:
            hi = mid
    return lo
```

也可以直接用标准库：

```python
from bisect import bisect_left, bisect_right

i = bisect_left(a, x)
j = bisect_right(a, x)
```

### 1.3 二分答案

**识别**：求"最小的最大值 / 最大的最小值 / 至少需要多少"，且答案具有单调性。

```python
def min_feasible(lo, hi, check):
    """check(x) 为 True 表示 x 可行；返回最小的可行值。
    要求 check 单调：x 可行 => 更大的 x 也可行。"""
    while lo < hi:
        mid = (lo + hi) // 2
        if check(mid):
            hi = mid
        else:
            lo = mid + 1
    return lo

def max_feasible(lo, hi, check):
    """check(x) 为 True 表示 x 可行；返回最大的可行值。
    要求 check 单调：x 可行 => 更小的 x 也可行。"""
    while lo < hi:
        mid = (lo + hi + 1) // 2
        if check(mid):
            lo = mid
        else:
            hi = mid - 1
    return lo
```

### 1.4 浮点二分

```python
def solve_float(lo, hi, check):
    for _ in range(80):          # 80 次足够精确
        mid = (lo + hi) / 2
        if check(mid):
            hi = mid
        else:
            lo = mid
    return lo
```

**易错**：`max_feasible` 的 `mid = (lo + hi + 1) // 2`，不加 1 会死循环。

---

## 2. 前缀和与差分

### 2.1 一维前缀和

```python
n = len(a)
pre = [0] * (n + 1)
for i in range(n):
    pre[i + 1] = pre[i] + a[i]

# 区间 [l, r]（0-index，包含 r）的和
def range_sum(l, r):
    return pre[r + 1] - pre[l]
```

### 2.2 二维前缀和

```python
def build_prefix_2d(a):
    n, m = len(a), len(a[0])
    pre = [[0] * (m + 1) for _ in range(n + 1)]
    for i in range(1, n + 1):
        row = pre[i]
        prev = pre[i - 1]
        acc = 0
        for j in range(1, m + 1):
            acc += a[i - 1][j - 1]
            row[j] = prev[j] + acc
    return pre

def rect_sum(pre, x1, y1, x2, y2):
    """(x1,y1) 到 (x2,y2) 的矩形和，包含边界，0-index"""
    return (pre[x2 + 1][y2 + 1]
            - pre[x1][y2 + 1]
            - pre[x2 + 1][y1]
            + pre[x1][y1])
```

### 2.3 一维差分

**用途**：多次区间加，最后一次性求原数组。

```python
diff = [0] * (n + 2)
# 区间 [l, r] 加 v
diff[l] += v
diff[r + 1] -= v

cur = 0
for i in range(n):
    cur += diff[i]
    a[i] = cur
```

### 2.4 二维差分

```python
def add_rect(d, x1, y1, x2, y2, v):
    """d 的大小至少 (n+2) x (m+2)，0-index"""
    d[x1][y1] += v
    d[x1][y2 + 1] -= v
    d[x2 + 1][y1] -= v
    d[x2 + 1][y2 + 1] += v

def build_diff_2d(d, n, m):
    """把差分数组还原成原数组（原地）"""
    for i in range(n):
        for j in range(m):
            if i > 0:
                d[i][j] += d[i - 1][j]
            if j > 0:
                d[i][j] += d[i][j - 1]
            if i > 0 and j > 0:
                d[i][j] -= d[i - 1][j - 1]
```

---

## 3. 双指针与滑动窗口

### 3.1 有序数组两数之和

```python
def two_sum(a, target):
    l, r = 0, len(a) - 1
    while l < r:
        s = a[l] + a[r]
        if s == target:
            return l, r
        if s < target:
            l += 1
        else:
            r -= 1
    return -1, -1
```

### 3.2 最长窗口（和不超过 limit）

```python
def longest_window(a, limit):
    left = 0
    cur = 0
    best = 0
    for right, x in enumerate(a):
        cur += x
        while cur > limit:
            cur -= a[left]
            left += 1
        best = max(best, right - left + 1)
    return best
```

### 3.3 固定长度窗口

```python
def max_sum_k(a, k):
    cur = sum(a[:k])
    best = cur
    for i in range(k, len(a)):
        cur += a[i] - a[i - k]
        if cur > best:
            best = cur
    return best
```

**识别**：连续子数组 + 单调条件（和、计数、不同元素个数）→ 滑动窗口。

---

## 4. 排序与贪心

### 4.1 多关键字排序

```python
a.sort(key=lambda x: (-x[1], x[0]))   # 第二列降序，第一列升序
```

### 4.2 区间调度：最多选多少个不重叠区间

```python
def max_intervals(intervals):
    # intervals: [(l, r), ...]
    intervals.sort(key=lambda x: x[1])   # 按右端点升序
    cnt = 0
    last_end = -float("inf")
    for l, r in intervals:
        if l >= last_end:
            cnt += 1
            last_end = r
    return cnt
```

### 4.3 合并区间

```python
def merge_intervals(intervals):
    intervals.sort()
    res = []
    for l, r in intervals:
        if res and l <= res[-1][1]:
            if r > res[-1][1]:
                res[-1][1] = r
        else:
            res.append([l, r])
    return res
```

### 4.4 哈夫曼 / 合并果子

```python
import heapq

def min_merge_cost(a):
    heapq.heapify(a)
    total = 0
    while len(a) > 1:
        x = heapq.heappop(a)
        y = heapq.heappop(a)
        total += x + y
        heapq.heappush(a, x + y)
    return total
```

---

## 5. 并查集

```python
class DSU:
    def __init__(self, n):
        self.parent = list(range(n))
        self.size = [1] * n

    def find(self, x):
        p = self.parent
        while p[x] != x:
            p[x] = p[p[x]]          # 路径减半
            x = p[x]
        return x

    def union(self, a, b):
        ra, rb = self.find(a), self.find(b)
        if ra == rb:
            return False
        if self.size[ra] < self.size[rb]:
            ra, rb = rb, ra
        self.parent[rb] = ra
        self.size[ra] += self.size[rb]
        return True
```

**用途**：连通性、Kruskal、亲戚/朋友关系、动态合并集合。

**注意**：节点编号是 `0..n-1`；如果题目是 `1..n`，传 `n+1` 并忽略 0。

---

## 6. 堆

```python
import heapq

h = []
heapq.heappush(h, 3)
heapq.heappush(h, 1)
x = heapq.heappop(h)              # 1

# 最大堆：存负数
heapq.heappush(h, -5)
y = -heapq.heappop(h)             # 5

# O(n) 建堆
a = [3, 1, 2]
heapq.heapify(a)

# 前 k 大 / 前 k 小
top_k = heapq.nlargest(k, a)
low_k = heapq.nsmallest(k, a)
```

**注意**：`heapq` 是最小堆；元组会按字典序比较，常用来存 `(dist, node)`。

---

## 7. 单调栈与单调队列

### 7.1 单调栈：下一个更大元素

```python
def next_greater(a):
    n = len(a)
    res = [n] * n                 # n 表示不存在
    st = []
    for i in range(n - 1, -1, -1):
        while st and a[st[-1]] <= a[i]:
            st.pop()
        res[i] = st[-1] if st else n
        st.append(i)
    return res
```

### 7.2 单调队列：滑动窗口最大值

```python
from collections import deque

def sliding_max(a, k):
    dq = deque()                  # 存下标，值单调递减
    res = []
    for i, x in enumerate(a):
        while dq and a[dq[-1]] <= x:
            dq.pop()
        dq.append(i)
        if dq[0] <= i - k:
            dq.popleft()
        if i >= k - 1:
            res.append(a[dq[0]])
    return res
```

**用途**：滑动窗口最值、优化 DP（单调队列优化）、直方图最大矩形。

---

## 8. 树状数组

**用途**：单点修改 + 区间查询，代码短，常数小。**下标从 1 开始。**

```python
class Fenwick:
    def __init__(self, n):
        self.n = n
        self.t = [0] * (n + 1)

    def add(self, i, delta):
        t, n = self.t, self.n
        while i <= n:
            t[i] += delta
            i += i & -i

    def prefix_sum(self, i):
        t = self.t
        s = 0
        while i > 0:
            s += t[i]
            i -= i & -i
        return s

    def range_sum(self, l, r):
        """闭区间 [l, r]，1-index"""
        return self.prefix_sum(r) - self.prefix_sum(l - 1)
```

**变体**：

- 区间加 + 单点查：对差分数组建树状数组。
- 区间加 + 区间查：维护两个树状数组（较复杂，省赛少用）。

---

## 9. 线段树

### 9.1 单点修改 + 区间求和（迭代版，快）

```python
class SegTree:
    def __init__(self, a):
        n = len(a)
        size = 1
        while size < n:
            size <<= 1
        self.size = size
        self.t = [0] * (2 * size)
        for i, x in enumerate(a):
            self.t[size + i] = x
        for i in range(size - 1, 0, -1):
            self.t[i] = self.t[i << 1] + self.t[(i << 1) | 1]

    def set(self, p, value):
        i = p + self.size
        self.t[i] = value
        i >>= 1
        while i:
            self.t[i] = self.t[i << 1] + self.t[(i << 1) | 1]
            i >>= 1

    def query(self, l, r):
        """[l, r) 的和"""
        res = 0
        l += self.size
        r += self.size
        while l < r:
            if l & 1:
                res += self.t[l]
                l += 1
            if r & 1:
                r -= 1
                res += self.t[r]
            l >>= 1
            r >>= 1
        return res
```

### 9.2 区间加 + 区间求和（懒标记，递归版）

```python
class LazySegTree:
    def __init__(self, a):
        self.n = len(a)
        self.t = [0] * (4 * self.n)
        self.lz = [0] * (4 * self.n)
        if self.n:
            self._build(1, 0, self.n - 1, a)

    def _build(self, p, l, r, a):
        if l == r:
            self.t[p] = a[l]
            return
        m = (l + r) >> 1
        self._build(p << 1, l, m, a)
        self._build((p << 1) | 1, m + 1, r, a)
        self.t[p] = self.t[p << 1] + self.t[(p << 1) | 1]

    def _apply(self, p, l, r, v):
        self.t[p] += v * (r - l + 1)
        self.lz[p] += v

    def _push(self, p, l, r):
        v = self.lz[p]
        if v and l != r:
            m = (l + r) >> 1
            self._apply(p << 1, l, m, v)
            self._apply((p << 1) | 1, m + 1, r, v)
            self.lz[p] = 0

    def add(self, ql, qr, v):
        """[ql, qr] 加 v"""
        self._add(1, 0, self.n - 1, ql, qr, v)

    def _add(self, p, l, r, ql, qr, v):
        if ql <= l and r <= qr:
            self._apply(p, l, r, v)
            return
        self._push(p, l, r)
        m = (l + r) >> 1
        if ql <= m:
            self._add(p << 1, l, m, ql, qr, v)
        if qr > m:
            self._add((p << 1) | 1, m + 1, r, ql, qr, v)
        self.t[p] = self.t[p << 1] + self.t[(p << 1) | 1]

    def query(self, ql, qr):
        """[ql, qr] 的和"""
        return self._query(1, 0, self.n - 1, ql, qr)

    def _query(self, p, l, r, ql, qr):
        if ql <= l and r <= qr:
            return self.t[p]
        self._push(p, l, r)
        m = (l + r) >> 1
        s = 0
        if ql <= m:
            s += self._query(p << 1, l, m, ql, qr)
        if qr > m:
            s += self._query((p << 1) | 1, m + 1, r, ql, qr)
        return s
```

> 线段树在省赛出现频率不高；省赛前不学，省一后再补。省赛遇到就写暴力。

---

## 10. DFS / BFS / 回溯

### 10.1 递归 DFS（图/树）

```python
import sys
sys.setrecursionlimit(1_000_000)

def dfs(u, adj, vis):
    vis[u] = True
    for v in adj[u]:
        if not vis[v]:
            dfs(v, adj, vis)
```

> 10 万节点的链会爆栈，改用显式栈或 BFS。

### 10.2 网格 BFS（最短路）

```python
from collections import deque

def bfs_grid(grid, sx, sy):
    n, m = len(grid), len(grid[0])
    dist = [[-1] * m for _ in range(n)]
    dist[sx][sy] = 0
    q = deque([(sx, sy)])
    while q:
        x, y = q.popleft()
        for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            nx, ny = x + dx, y + dy
            if 0 <= nx < n and 0 <= ny < m:
                if grid[nx][ny] != '#' and dist[nx][ny] == -1:
                    dist[nx][ny] = dist[x][y] + 1
                    q.append((nx, ny))
    return dist
```

### 10.3 多源 BFS

```python
from collections import deque

def multi_source_bfs(grid, sources):
    n, m = len(grid), len(grid[0])
    dist = [[-1] * m for _ in range(n)]
    q = deque()
    for x, y in sources:
        dist[x][y] = 0
        q.append((x, y))
    while q:
        x, y = q.popleft()
        for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            nx, ny = x + dx, y + dy
            if 0 <= nx < n and 0 <= ny < m and dist[nx][ny] == -1:
                if grid[nx][ny] != '#':
                    dist[nx][ny] = dist[x][y] + 1
                    q.append((nx, ny))
    return dist
```

### 10.4 回溯：全排列

```python
def permutations(a):
    n = len(a)
    res = []
    path = []
    used = [False] * n

    def dfs():
        if len(path) == n:
            res.append(path[:])
            return
        for i in range(n):
            if used[i]:
                continue
            used[i] = True
            path.append(a[i])
            dfs()
            path.pop()
            used[i] = False

    dfs()
    return res
```

### 10.5 回溯：子集

```python
def subsets(a):
    res = []
    path = []

    def dfs(start):
        res.append(path[:])
        for i in range(start, len(a)):
            path.append(a[i])
            dfs(i + 1)
            path.pop()

    dfs(0)
    return res
```

### 10.6 记忆化搜索

```python
from functools import lru_cache

def fib(n):
    @lru_cache(maxsize=None)
    def f(i):
        if i <= 1:
            return i
        return f(i - 1) + f(i - 2)
    return f(n)
```

**剪枝思路**：

- 排序后，当前和已经超过目标 → 剪；
- 剩余元素全部加上也不够 → 剪；
- 去重：同一层相同的数只选一次。

---

## 11. 图论

### 11.1 建图

```python
n, m = map(int, input().split())
adj = [[] for _ in range(n)]
for _ in range(m):
    u, v, w = map(int, input().split())
    u -= 1
    v -= 1
    adj[u].append((v, w))
    adj[v].append((u, w))       # 无向图
```

### 11.2 拓扑排序（Kahn）

```python
from collections import deque

def topo_sort(n, adj):
    indeg = [0] * n
    for u in range(n):
        for v in adj[u]:
            indeg[v] += 1
    q = deque(i for i in range(n) if indeg[i] == 0)
    order = []
    while q:
        u = q.popleft()
        order.append(u)
        for v in adj[u]:
            indeg[v] -= 1
            if indeg[v] == 0:
                q.append(v)
    return order if len(order) == n else None
```

### 11.3 Dijkstra（非负权最短路）

```python
import heapq

def dijkstra(n, adj, src):
    INF = float("inf")
    dist = [INF] * n
    dist[src] = 0
    pq = [(0, src)]
    while pq:
        d, u = heapq.heappop(pq)
        if d > dist[u]:
            continue
        for v, w in adj[u]:
            nd = d + w
            if nd < dist[v]:
                dist[v] = nd
                heapq.heappush(pq, (nd, v))
    return dist
```

### 11.4 Floyd（多源最短路，n ≤ 500）

```python
def floyd(dist):
    n = len(dist)
    for k in range(n):
        dk = dist[k]
        for i in range(n):
            dik = dist[i][k]
            if dik == float("inf"):
                continue
            di = dist[i]
            for j in range(n):
                nd = dik + dk[j]
                if nd < di[j]:
                    di[j] = nd
    return dist
```

### 11.5 Bellman-Ford（可处理负权）

```python
def bellman_ford(n, edges, src):
    INF = float("inf")
    dist = [INF] * n
    dist[src] = 0
    for _ in range(n - 1):
        changed = False
        for u, v, w in edges:
            if dist[u] != INF and dist[u] + w < dist[v]:
                dist[v] = dist[u] + w
                changed = True
        if not changed:
            break
    return dist
```

### 11.6 SPFA（队列优化，最坏 O(nm)，慎用）

```python
from collections import deque

def spfa(n, adj, src):
    INF = float("inf")
    dist = [INF] * n
    inq = [False] * n
    dist[src] = 0
    q = deque([src])
    inq[src] = True
    while q:
        u = q.popleft()
        inq[u] = False
        du = dist[u]
        for v, w in adj[u]:
            if du + w < dist[v]:
                dist[v] = du + w
                if not inq[v]:
                    inq[v] = True
                    q.append(v)
    return dist
```

### 11.7 0-1 BFS（边权只有 0/1）

```python
from collections import deque

def bfs01(n, adj, src):
    INF = float("inf")
    dist = [INF] * n
    dist[src] = 0
    dq = deque([src])
    while dq:
        u = dq.popleft()
        du = dist[u]
        for v, w in adj[u]:
            nd = du + w
            if nd < dist[v]:
                dist[v] = nd
                if w == 0:
                    dq.appendleft(v)
                else:
                    dq.append(v)
    return dist
```

### 11.8 Kruskal（最小生成树）

依赖上面的 `DSU`。

```python
def kruskal(n, edges):
    """edges: [(u, v, w), ...]；返回最小生成树权值，不连通返回 None"""
    edges.sort(key=lambda e: e[2])
    dsu = DSU(n)
    total = 0
    used = 0
    for u, v, w in edges:
        if dsu.union(u, v):
            total += w
            used += 1
            if used == n - 1:
                return total
    return None
```

### 11.9 Prim（稠密图，O(n²)）

```python
def prim(n, adj):
    INF = float("inf")
    dist = [INF] * n
    used = [False] * n
    dist[0] = 0
    total = 0
    for _ in range(n):
        u = -1
        for i in range(n):
            if not used[i] and (u == -1 or dist[i] < dist[u]):
                u = i
        if u == -1 or dist[u] == INF:
            return None
        used[u] = True
        total += dist[u]
        for v, w in adj[u]:
            if not used[v] and w < dist[v]:
                dist[v] = w
    return total
```

---

## 12. 动态规划

### 12.1 01 背包

```python
def knapsack_01(W, items):
    """items: [(weight, value), ...]；容量 W，返回最大价值"""
    dp = [0] * (W + 1)
    for w, v in items:
        for j in range(W, w - 1, -1):
            cand = dp[j - w] + v
            if cand > dp[j]:
                dp[j] = cand
    return dp[W]
```

### 12.2 完全背包

```python
def knapsack_complete(W, items):
    dp = [0] * (W + 1)
    for w, v in items:
        for j in range(w, W + 1):
            cand = dp[j - w] + v
            if cand > dp[j]:
                dp[j] = cand
    return dp[W]
```

### 12.3 多重背包（二进制拆分）

```python
def knapsack_multi(W, items):
    """items: [(weight, value, count), ...]"""
    dp = [0] * (W + 1)
    for w, v, c in items:
        k = 1
        while c > 0:
            take = min(k, c)
            ww, vv = w * take, v * take
            for j in range(W, ww - 1, -1):
                cand = dp[j - ww] + vv
                if cand > dp[j]:
                    dp[j] = cand
            c -= take
            k <<= 1
    return dp[W]
```

### 12.4 分组背包

```python
def knapsack_group(W, groups):
    """groups: [[(w, v), ...], ...]；每组最多选一个"""
    dp = [0] * (W + 1)
    for group in groups:
        for j in range(W, -1, -1):
            for w, v in group:
                if j >= w:
                    cand = dp[j - w] + v
                    if cand > dp[j]:
                        dp[j] = cand
    return dp[W]
```

### 12.5 LIS（最长上升子序列，O(n log n)）

```python
from bisect import bisect_left

def lis_length(a):
    """严格上升"""
    tails = []
    for x in a:
        i = bisect_left(tails, x)
        if i == len(tails):
            tails.append(x)
        else:
            tails[i] = x
    return len(tails)
```

> 非下降子序列把 `bisect_left` 换成 `bisect_right`。

### 12.6 LCS（最长公共子序列）

```python
def lcs(a, b):
    n, m = len(a), len(b)
    dp = [[0] * (m + 1) for _ in range(n + 1)]
    for i in range(1, n + 1):
        ai = a[i - 1]
        row = dp[i]
        prev = dp[i - 1]
        for j in range(1, m + 1):
            if ai == b[j - 1]:
                row[j] = prev[j - 1] + 1
            else:
                row[j] = prev[j] if prev[j] > row[j - 1] else row[j - 1]
    return dp[n][m]
```

### 12.7 最大子段和

```python
def max_subarray(a):
    best = cur = a[0]
    for x in a[1:]:
        cur = x if cur < 0 else cur + x
        if cur > best:
            best = cur
    return best
```

### 12.8 编辑距离

```python
def edit_distance(a, b):
    n, m = len(a), len(b)
    dp = list(range(m + 1))
    for i in range(1, n + 1):
        ndp = [i] + [0] * m
        for j in range(1, m + 1):
            if a[i - 1] == b[j - 1]:
                ndp[j] = dp[j - 1]
            else:
                ndp[j] = min(dp[j], ndp[j - 1], dp[j - 1]) + 1
        dp = ndp
    return dp[m]
```

### 12.9 区间 DP：石子合并

```python
def stone_merge(a):
    n = len(a)
    pre = [0] * (n + 1)
    for i, x in enumerate(a):
        pre[i + 1] = pre[i] + x

    INF = float("inf")
    dp = [[0] * n for _ in range(n)]
    for length in range(2, n + 1):
        for i in range(n - length + 1):
            j = i + length - 1
            best = INF
            for k in range(i, j):
                cand = dp[i][k] + dp[k + 1][j]
                if cand < best:
                    best = cand
            dp[i][j] = best + pre[j + 1] - pre[i]
    return dp[0][n - 1]
```

### 12.10 树形 DP：没有上司的舞会

```python
import sys
sys.setrecursionlimit(1_000_000)

def tree_dp(n, value, edges):
    adj = [[] for _ in range(n)]
    for u, v in edges:
        adj[u].append(v)
        adj[v].append(u)

    def dfs(u, parent):
        take = value[u]
        skip = 0
        for v in adj[u]:
            if v == parent:
                continue
            child_take, child_skip = dfs(v, u)
            take += child_skip
            skip += max(child_take, child_skip)
        return take, skip

    take, skip = dfs(0, -1)
    return max(take, skip)
```

### 12.11 状压 DP：TSP

```python
def tsp(cost):
    n = len(cost)
    if n == 1:
        return 0
    INF = float("inf")
    size = 1 << n
    dp = [[INF] * n for _ in range(size)]
    dp[1][0] = 0
    for mask in range(size):
        row = dp[mask]
        for u in range(n):
            du = row[u]
            if du == INF:
                continue
            for v in range(n):
                if (mask >> v) & 1:
                    continue
                nm = mask | (1 << v)
                nd = du + cost[u][v]
                if nd < dp[nm][v]:
                    dp[nm][v] = nd
    full = size - 1
    return min(dp[full][u] + cost[u][0] for u in range(1, n))
```

### 12.12 网格路径数

```python
def unique_paths(n, m):
    dp = [1] * m
    for _ in range(1, n):
        for j in range(1, m):
            dp[j] += dp[j - 1]
    return dp[m - 1]
```

---

## 13. 数学

### 13.1 快速幂

```python
def qpow(a, b, mod):
    res = 1 % mod
    a %= mod
    while b:
        if b & 1:
            res = res * a % mod
        a = a * a % mod
        b >>= 1
    return res
```

> 内置 `pow(a, b, mod)` 更快，优先用。

### 13.2 矩阵快速幂

```python
def mat_mul(A, B, mod):
    n, k, m = len(A), len(B), len(B[0])
    C = [[0] * m for _ in range(n)]
    for i in range(n):
        Ai = A[i]
        Ci = C[i]
        for t in range(k):
            a = Ai[t]
            if a == 0:
                continue
            Bt = B[t]
            for j in range(m):
                Ci[j] = (Ci[j] + a * Bt[j]) % mod
    return C

def mat_pow(A, e, mod):
    n = len(A)
    R = [[int(i == j) for j in range(n)] for i in range(n)]
    while e:
        if e & 1:
            R = mat_mul(R, A, mod)
        A = mat_mul(A, A, mod)
        e >>= 1
    return R
```

### 13.3 素数筛

```python
def sieve(n):
    """返回 bytearray，is_prime[i] == 1 表示 i 是素数"""
    if n < 2:
        return bytearray(n + 1)
    is_prime = bytearray(b'\x01') * (n + 1)
    is_prime[0] = is_prime[1] = 0
    i = 2
    while i * i <= n:
        if is_prime[i]:
            start = i * i
            is_prime[start::i] = b'\x00' * (((n - start) // i) + 1)
        i += 1
    return is_prime
```

### 13.4 质因数分解

```python
def factorize(x):
    res = []
    d = 2
    while d * d <= x:
        if x % d == 0:
            c = 0
            while x % d == 0:
                x //= d
                c += 1
            res.append((d, c))
        d += 1
    if x > 1:
        res.append((x, 1))
    return res
```

### 13.5 gcd / lcm

```python
from math import gcd

def lcm(a, b):
    return a // gcd(a, b) * b
```

### 13.6 组合数：杨辉三角

```python
def build_comb(n):
    C = [[0] * (n + 1) for _ in range(n + 1)]
    for i in range(n + 1):
        C[i][0] = C[i][i] = 1
        for j in range(1, i):
            C[i][j] = C[i - 1][j - 1] + C[i - 1][j]
    return C
```

### 13.7 组合数取模（MOD 为素数）

```python
def build_fact(n, mod):
    fact = [1] * (n + 1)
    for i in range(1, n + 1):
        fact[i] = fact[i - 1] * i % mod
    inv_fact = [1] * (n + 1)
    inv_fact[n] = pow(fact[n], mod - 2, mod)
    for i in range(n, 0, -1):
        inv_fact[i - 1] = inv_fact[i] * i % mod
    return fact, inv_fact

def comb_mod(n, r, fact, inv_fact, mod):
    if r < 0 or r > n:
        return 0
    return fact[n] * inv_fact[r] % mod * inv_fact[n - r] % mod
```

> 要求 `n < mod` 且 `mod` 是素数（常见 `10^9+7`）。

### 13.8 进制转换

```python
def to_base(x, b):
    if x == 0:
        return "0"
    digits = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ"
    neg = x < 0
    x = abs(x)
    out = []
    while x:
        out.append(digits[x % b])
        x //= b
    if neg:
        out.append("-")
    return "".join(reversed(out))

# 其他进制转十进制
print(int("1f", 16))       # 31
print(int("1010", 2))      # 10
```

### 13.9 日期

```python
from datetime import date, timedelta

def days_between(y1, m1, d1, y2, m2, d2):
    return (date(y2, m2, d2) - date(y1, m1, d1)).days

def is_leap(y):
    return y % 4 == 0 and (y % 100 != 0 or y % 400 == 0)

def days_in_month(y, m):
    if m == 2:
        return 29 if is_leap(y) else 28
    return 30 if m in (4, 6, 9, 11) else 31
```

### 13.10 卡特兰数

```python
def catalan(n):
    # C(2n, n) / (n + 1)
    from math import comb
    return comb(2 * n, n) // (n + 1)
```

---

## 14. 字符串

### 14.1 KMP

```python
def prefix_function(s):
    n = len(s)
    pi = [0] * n
    for i in range(1, n):
        j = pi[i - 1]
        while j > 0 and s[i] != s[j]:
            j = pi[j - 1]
        if s[i] == s[j]:
            j += 1
        pi[i] = j
    return pi

def kmp_search(text, pattern):
    if not pattern:
        return []
    pi = prefix_function(pattern)
    res = []
    j = 0
    for i, ch in enumerate(text):
        while j > 0 and ch != pattern[j]:
            j = pi[j - 1]
        if ch == pattern[j]:
            j += 1
        if j == len(pattern):
            res.append(i - len(pattern) + 1)
            j = pi[j - 1]
    return res
```

### 14.2 字符串哈希

```python
MOD = (1 << 61) - 1
BASE = 131

def build_hash(s):
    n = len(s)
    h = [0] * (n + 1)
    p = [1] * (n + 1)
    for i, ch in enumerate(s):
        h[i + 1] = (h[i] * BASE + ord(ch)) % MOD
        p[i + 1] = p[i] * BASE % MOD
    return h, p

def sub_hash(h, p, l, r):
    """子串 s[l:r] 的哈希"""
    return (h[r] - h[l] * p[r - l]) % MOD
```

> 哈希有碰撞概率，重要题可以用双哈希（换一个 base/mod）。

### 14.3 回文判断

```python
def is_palindrome(s):
    return s == s[::-1]
```

---

## 15. 杂项

### 15.1 离散化

```python
from bisect import bisect_left

def compress(a):
    vals = sorted(set(a))
    b = [bisect_left(vals, x) + 1 for x in a]   # 1-index
    return b, vals
```

### 15.2 归并排序求逆序对

```python
def merge_sort_count(a):
    def rec(l, r):
        if r - l <= 1:
            return 0
        mid = (l + r) // 2
        cnt = rec(l, mid) + rec(mid, r)
        tmp = []
        i, j = l, mid
        while i < mid and j < r:
            if a[i] <= a[j]:
                tmp.append(a[i])
                i += 1
            else:
                tmp.append(a[j])
                j += 1
                cnt += mid - i
        tmp.extend(a[i:mid])
        tmp.extend(a[j:r])
        a[l:r] = tmp
        return cnt

    return rec(0, len(a))
```

### 15.3 itertools

```python
from itertools import permutations, combinations, product, accumulate

list(permutations([1, 2, 3]))
list(combinations([1, 2, 3], 2))
list(product([0, 1], repeat=3))
list(accumulate([1, 2, 3]))      # [1, 3, 6]
```

### 15.4 方向数组

```python
DIR4 = ((1, 0), (-1, 0), (0, 1), (0, -1))
DIR8 = ((1, 0), (-1, 0), (0, 1), (0, -1),
        (1, 1), (1, -1), (-1, 1), (-1, -1))
```

### 15.5 保序去重

```python
def dedupe(a):
    return list(dict.fromkeys(a))
```

### 15.6 最大公约数 + 扩展欧几里得

```python
def exgcd(a, b):
    if b == 0:
        return a, 1, 0
    g, x1, y1 = exgcd(b, a % b)
    return g, y1, x1 - (a // b) * y1
```

### 15.7 二分 + 前缀和：快速查询区间

```python
from bisect import bisect_left

pre = [0]
for x in a:
    pre.append(pre[-1] + x)

# 最小的 r 使得 sum(a[l:r]) >= target
r = bisect_left(pre, target + pre[l])
```

---

## 附：模板默写清单

考前能做到"合上资料，20 分钟内写完"：

- [ ] 快读 `read().split()`
- [ ] `lower_bound` / `upper_bound`
- [ ] 二分答案两个方向
- [ ] 一维前缀和、二维前缀和
- [ ] 一维差分、二维差分
- [ ] 滑动窗口
- [ ] 并查集
- [ ] 堆（含最大堆）
- [ ] 单调栈、单调队列
- [ ] 树状数组
- [ ] 网格 BFS、DFS
- [ ] 全排列回溯
- [ ] 拓扑排序
- [ ] Dijkstra
- [ ] Kruskal
- [ ] 01 背包、完全背包
- [ ] LIS、LCS
- [ ] 区间 DP
- [ ] 树形 DP
- [ ] 快速幂、筛法
- [ ] 组合数取模
- [ ] KMP

> 默写不是抄写：写完以后自己造 3 组数据验证，尤其是边界（n=1、空、全相同）。
