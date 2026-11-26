---
title: day04｜网关与配置管理
date: 2026-11-26 18:00:20
updated: 2026-11-26 18:00:20
description: 网关是所有流量的统一入口，负责路由、鉴权和用户透传；Nacos Config 负责把配置集中管理并支持热更新。
tags: [黑马, 黑马商城, SpringCloudGateway, NacosConfig, JWT, 笔记库, Java]
categories: [黑马商城]
---
> **一句话**
> 网关是所有流量的统一入口，负责路由、鉴权和用户透传；Nacos Config 负责把配置集中管理并支持热更新。

## 本节目标

- 掌握 Gateway 路由和过滤器。
- 理解网关统一登录校验。
- 掌握网关把用户信息传给下游服务。
- 掌握 Nacos 配置共享和热更新。

## 1. 为什么需要网关

没有网关时：

- 前端要知道每个微服务地址。
- 鉴权逻辑散落在各服务。
- 跨域、限流、日志难以统一。

加网关后：

```text
前端 → 网关 → 各微服务
```

网关职责：

- 路由。
- 鉴权。
- 限流。
- 日志。
- 协议转换。

## 2. 路由配置

```yaml
spring:
  cloud:
    gateway:
      routes:
        - id: item-service
          uri: lb://item-service
          predicates:
            - Path=/items/**,/search/**
        - id: cart-service
          uri: lb://cart-service
          predicates:
            - Path=/carts/**
```

`lb://` 表示从注册中心做负载均衡。

## 3. 过滤器

Gateway 过滤器分两类：

| 类型 | 作用范围 |
|---|---|
| 局部过滤器 | 某个路由 |
| 全局过滤器 | 所有路由 |

全局过滤器示例：

```java
@Component
public class AuthGlobalFilter implements GlobalFilter, Ordered {
    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        // 1. 判断是否需要登录
        // 2. 解析 token
        // 3. 把 userId 写入请求头
        // 4. 放行或返回 401
        return chain.filter(exchange);
    }
}
```

> **注意：响应式编程**
> Gateway 基于 WebFlux，不能使用阻塞式 Servlet API，也不能在过滤器里随意阻塞等待。

## 4. 登录校验

```text
请求进入网关
  → 是否白名单
  → 取 Authorization
  → 校验 JWT
  → 解析 userId
  → 写 user-info 请求头
  → 转发下游
```

白名单通常包括：

- 登录。
- 注册。
- 商品搜索和详情。
- 支付回调。

## 5. 下游获取用户

网关把 userId 放到请求头，下游用拦截器读取：

```java
String userId = request.getHeader("user-info");
UserContext.setUser(Long.valueOf(userId));
```

要点：

- 下游不能直接信任外部传来的 `user-info`。
- 生产环境应保证只有网关能访问服务，或使用内部签名。
- Feign 调用其他服务时要把用户头继续传下去。

## 6. OpenFeign 传递用户

```java
@Bean
public RequestInterceptor userInfoInterceptor() {
    return template -> {
        Long userId = UserContext.getUser();
        if (userId != null) {
            template.header("user-info", userId.toString());
        }
    };
}
```

否则 A 服务调用 B 服务时，B 拿不到当前用户。

## 7. Nacos 配置管理

```yaml
spring:
  config:
    import: nacos:item-service.yaml
```

配置优先级：

```text
服务名-profile.yaml
  > 服务名.yaml
  > 共享配置
  > 本地配置（具体以项目配置为准）
```

## 8. 配置热更新

```java
@ConfigurationProperties(prefix = "hm.cart")
@Component
public class CartProperties {
    private Integer maxItems;
}
```

修改 Nacos 配置后，Spring 会刷新绑定值。

## 9. 易错点

- 路由谓词路径写错，导致 404。
- 网关和服务使用了不同 Nacos 命名空间。
- 只在网关校验 JWT，下游却直接信任外部请求。
- Feign 调用没有透传用户信息。
- 改了 Nacos 配置但客户端没引入 config 依赖。

## 10. 自测

- [ ] 能写出一个 Gateway 路由。
- [ ] 能说明全局过滤器执行流程。
- [ ] 能解释 userId 如何从网关传到下游。
- [ ] 能说出配置管理的优先级和热更新方式。

## 关联

- 上一篇：[day03-微服务拆分与远程调用](/2026/11/26/heima-mall-day03/)
- 下一篇：[day05-服务保护与分布式事务](/2026/11/26/heima-mall-day05/)
