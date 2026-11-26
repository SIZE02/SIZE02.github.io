---
title: day02｜Docker
date: 2026-11-26 18:00:22
updated: 2026-11-26 18:00:22
description: Docker 把应用和运行环境一起打包成镜像，再用容器运行，解决“我这里能跑”的环境差异。
tags: [黑马, 黑马商城, Docker, 部署, 笔记库, Java]
categories: [黑马商城]
---
> **一句话**
> Docker 把应用和运行环境一起打包成镜像，再用容器运行，解决“我这里能跑”的环境差异。

## 本节目标

- 理解镜像、容器、数据卷、网络。
- 掌握常用 Docker 命令。
- 会写 Dockerfile 和 Compose。

## 1. 核心概念

| 概念 | 说明 |
|---|---|
| 镜像 Image | 只读模板，包含应用和依赖 |
| 容器 Container | 镜像的运行实例 |
| 数据卷 Volume | 容器外持久化数据 |
| 网络 Network | 容器间通信 |
| 仓库 Registry | 存放镜像 |

```text
Dockerfile → 构建镜像 → 运行容器
```

## 2. 常用命令

```bash
docker pull nginx:1.25
docker images
docker run -d --name nginx -p 80:80 nginx:1.25
docker ps -a
docker logs -f nginx
docker exec -it nginx bash
docker stop nginx
docker rm nginx
docker rmi nginx:1.25
```

端口格式：

```text
-p 宿主机端口:容器端口
```

## 3. 数据卷

容器删除后数据会丢，因此数据库数据要挂载卷：

```bash
docker run -d \
  --name mysql \
  -p 3306:3306 \
  -e MYSQL_ROOT_PASSWORD=123 \
  -v mysql-data:/var/lib/mysql \
  mysql:8
```

查看卷：

```bash
docker volume ls
docker volume inspect mysql-data
```

## 4. Dockerfile

以 Spring Boot 为例：

```dockerfile
FROM eclipse-temurin:17-jre
WORKDIR /app
COPY app.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
```

分层优化：

- 变化少的层放前面。
- 依赖层和业务代码层分开。
- 使用 `.dockerignore` 排除无关文件。

## 5. 容器网络

默认桥接网络下，容器可以通过 IP 通信，但 IP 不稳定。

自定义网络支持容器名解析：

```bash
docker network create hm-net
docker run -d --name mysql --network hm-net mysql:8
docker run -d --name item-service --network hm-net item-service
```

在 `item-service` 容器中可以直接访问：

```text
mysql:3306
```

## 6. Docker Compose

```yaml
services:
  mysql:
    image: mysql:8
    ports:
      - "3306:3306"
    environment:
      MYSQL_ROOT_PASSWORD: 123
    volumes:
      - mysql-data:/var/lib/mysql

  nacos:
    image: nacos/nacos-server:v2.3.0
    ports:
      - "8848:8848"

volumes:
  mysql-data:
```

命令：

```bash
docker compose up -d
docker compose ps
docker compose logs -f
docker compose down
```

## 7. 与微服务的关系

本地开发通常用 Docker 启动：

- MySQL
- Nacos
- Redis
- RabbitMQ
- Elasticsearch

业务服务可以本机启动，也可以打成镜像统一部署。

> **注意：易错点**
> 容器里的 `localhost` 指容器自身，不是宿主机。容器访问宿主机服务应使用 `host.docker.internal` 或宿主机网络 IP。

## 8. 自测

- [ ] 能说出镜像和容器的区别。
- [ ] 能独立启动 MySQL 并挂载数据卷。
- [ ] 能写一个 Spring Boot Dockerfile。
- [ ] 能解释 Compose 中服务名如何互相访问。

## 关联

- 上一篇：[day01-MyBatisPlus](/2026/11/26/heima-mall-day01/)
- 下一篇：[day03-微服务拆分与远程调用](/2026/11/26/heima-mall-day03/)
