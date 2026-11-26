---
title: Spring 常用注解速查
date: 2026-11-26 18:00:10
updated: 2026-11-26 18:00:10
description: 苍穹外卖
tags: [Java, Spring, 速查, 黑马 Java, 笔记库]
categories: [黑马 Java]
---
## Web

| 注解 | 作用 |
|---|---|
| `@RestController` | Controller + 返回 JSON |
| `@RequestMapping` | 路径前缀 |
| `@GetMapping` | GET 映射 |
| `@PostMapping` | POST 映射 |
| `@PutMapping` | PUT 映射 |
| `@DeleteMapping` | DELETE 映射 |
| `@RequestBody` | JSON 转对象 |
| `@RequestParam` | 查询参数 |
| `@PathVariable` | 路径参数 |
| `@Valid` | 参数校验 |

## 依赖注入

| 注解 | 作用 |
|---|---|
| `@Component` | 通用 Bean |
| `@Service` | Service Bean |
| `@Repository` | 持久层 Bean |
| `@Controller` | 控制层 Bean |
| `@Configuration` | 配置类 |
| `@Bean` | 方法返回值注册为 Bean |
| `@Autowired` | 按类型注入 |
| `@Resource` | 按名称/类型注入 |

## 事务与 AOP

| 注解 | 作用 |
|---|---|
| `@Transactional` | 事务 |
| `@Aspect` | 切面 |
| `@Around` | 环绕通知 |
| `@Pointcut` | 切点 |
| `@EnableTransactionManagement` | 开启事务管理 |

## Spring Cache

| 注解 | 作用 |
|---|---|
| `@EnableCaching` | 开启缓存 |
| `@Cacheable` | 查缓存 |
| `@CachePut` | 更新缓存 |
| `@CacheEvict` | 删除缓存 |

## Spring Cloud

| 注解 | 作用 |
|---|---|
| `@EnableDiscoveryClient` | 服务发现 |
| `@EnableFeignClients` | 开启 Feign |
| `@FeignClient` | 声明 Feign 客户端 |
| `@LoadBalanced` | 负载均衡 |
| `@EnableScheduling` | 开启定时任务 |
| `@Scheduled` | 定时任务 |

## 常见组合

```java
@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements IOrderService {

    private final OrderMapper orderMapper;

    @Transactional
    public void createOrder() {
    }
}
```

## 关联

- [苍穹外卖](/2026/11/26/heima-cangqiong-overview/)
- [黑马商城](/2026/11/26/heima-mall-overview/)
