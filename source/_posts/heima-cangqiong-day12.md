---
title: day12｜工作台与 Excel 导出
date: 2026-11-26 18:00:26
updated: 2026-11-26 18:00:26
description: 工作台把多个统计查询聚合到一个页面；Excel 导出把同样的数据写入表格文件并流式返回。
tags: [黑马, 苍穹外卖, Java, POI, 数据导出, 笔记库]
categories: [苍穹外卖]
---
> **一句话**
> 工作台把多个统计查询聚合到一个页面；Excel 导出把同样的数据写入表格文件并流式返回。

## 本节目标

- 掌握工作台各卡片的数据来源。
- 掌握 Apache POI 写 Excel。
- 理解下载接口的响应头设置。

## 1. 工作台数据

常见区域：

| 区域 | 数据 |
|---|---|
| 今日数据 | 营业额、订单数、有效订单、完成率 |
| 订单管理 | 待接单、待派送、派送中、已完成、已取消 |
| 菜品总览 | 起售、停售 |
| 套餐总览 | 起售、停售 |

接口通常是一次聚合返回：

```text
GET /admin/workspace/todayData
GET /admin/workspace/overviewOrders
GET /admin/workspace/overviewDishes
GET /admin/workspace/overviewSetmeals
```

## 2. 今日数据

时间范围：

```text
今天 00:00:00 ～ 当前时间
```

指标：

```text
营业额 = sum(已完成订单金额)
有效订单数 = 已完成订单数量
订单完成率 = 有效订单 / 总订单
平均客单价 = 营业额 / 有效订单数
```

> **注意：除零**
> 有效订单为 0 时，客单价和完成率要单独处理，不能直接除。

## 3. Apache POI

写出 Excel：

```java
XSSFWorkbook workbook = new XSSFWorkbook();
Sheet sheet = workbook.createSheet("运营数据");

Row header = sheet.createRow(0);
header.createCell(0).setCellValue("日期");
header.createCell(1).setCellValue("营业额");

Row row = sheet.createRow(1);
row.createCell(0).setCellValue("2026-11-25");
row.createCell(1).setCellValue(1234.5);
```

读取 Excel：

```java
Workbook workbook = WorkbookFactory.create(inputStream);
Sheet sheet = workbook.getSheetAt(0);
for (Row row : sheet) {
    String value = row.getCell(0).getStringCellValue();
}
```

## 4. 导出接口

```java
@GetMapping("/export")
public void export(HttpServletResponse response) throws IOException {
    byte[] data = reportService.exportBusinessData();

    response.setContentType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    response.setHeader("Content-Disposition", "attachment; filename=business-data.xlsx");
    response.getOutputStream().write(data);
}
```

关键点：

- 文件名含中文时要编码。
- 大文件应流式写入，不要全部放内存。
- 导出前要设置正确的 MIME 类型。

## 5. 报表内容

课程报表通常包含：

- 时间范围。
- 营业额。
- 订单数、有效订单数、完成率。
- 平均客单价。
- 新增用户数。

数据来源与 day11 的统计接口一致，可以复用查询逻辑。

## 6. POI 易错点

- 行列索引从 0 开始。
- 数值和字符串单元格类型不同。
- `Workbook`、`InputStream` 要关闭。
- 大量数据使用 `XSSFWorkbook` 容易 OOM，可考虑 `SXSSFWorkbook`。

## 7. 项目收尾清单

- [ ] 工作台各卡片都有真实数据。
- [ ] 除零场景处理正确。
- [ ] Excel 文件能下载并正常打开。
- [ ] 文件名、MIME 类型、编码正确。
- [ ] 统计 SQL 有时间范围索引。

## 关联

- 上一篇：[day11-数据统计图表](/2026/11/26/heima-cangqiong-day11/)
- 总览：[00-苍穹外卖总览](/2026/11/26/heima-cangqiong-overview/)
- 下一项目：[黑马商城总览](/2026/11/26/heima-mall-overview/)
