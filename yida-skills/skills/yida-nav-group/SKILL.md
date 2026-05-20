---
name: yida-nav-group
description: 宜搭应用左侧导航分组管理。适用于：查询应用导航树、新建/重命名/删除分组、把表单/页面/外链移动到分组、隐藏或显示导航项。不适用于表单字段分组布局（→ yida-create-form-page）。
---

# 应用导航分组

## 严格要求

- 操作前必须已知 `appType`；不要编造。
- 移动页面前先执行 `openyida nav-group list <appType>` 确认 `navUuid` / `formUuid` 和目标分组。
- 删除分组默认只删除空分组；非空分组必须先移动子项，除非用户明确要求 `--force`。
- 分组节点是 `navType: "NAV"`，普通页面是 `navType: "PAGE"`，外链是 `navType: "LINK"`，系统节点不要移动或删除。

## 命令

### 查询导航树

```bash
openyida nav-group list <appType>
openyida nav-group list <appType> --flat
```

输出为 JSON。树形结果中 `type=group` 的节点即分组；`navUuid` 是后续重命名、删除、移动的稳定标识。

### 创建分组

```bash
openyida nav-group create <appType> "分组名"
openyida nav-group create <appType> "子分组名" --parent <groupNavUuid>
```

分组只能创建在根目录或一级分组下。

### 重命名分组

```bash
openyida nav-group rename <appType> <groupNavUuid|groupName> "新分组名"
```

同名分组可能歧义，优先使用 `navUuid`。

### 移动页面或分组

```bash
openyida nav-group move <appType> <formUuid|navUuid|name> --to <groupNavUuid|groupName|root>
openyida nav-group move <appType> <formUuid> --to <groupNavUuid> --before <siblingNavUuid>
openyida nav-group move <appType> <formUuid> --to root --after <siblingNavUuid>
```

常见场景：把新建表单放入已有分组：

```bash
openyida nav-group list APP_XXX --flat
openyida nav-group move APP_XXX FORM_XXX --to NAV_XXX
```

### 删除分组

```bash
openyida nav-group delete <appType> <groupNavUuid>
```

非空分组会报错，先把子页面移动到其他分组或 `root`。

### 隐藏 / 显示导航项

```bash
openyida nav-group hide <appType> <navUuid|formUuid|name>
openyida nav-group show <appType> <navUuid|formUuid|name>
```

隐藏会同时设置 PC 与移动端导航隐藏。

## 接口事实

- 查询：`/dingtalk/web/{appType}/query/formnav/getFormNavigationListByOrder.json`
- 创建：`/dingtalk/web/{appType}/query/formnav/saveFormNavigation.json`
- 重命名：`/dingtalk/web/{appType}/query/formnav/updateNavigationTitle.json`
- 移动排序：`/dingtalk/web/{appType}/query/formnav/updateFormNavigationOrderNew.json`
- 删除：`/dingtalk/web/{appType}/query/formnav/deleteFormNavigation.json`

`ROOT` 分组的后端标识是 `NAV-SYSTEM-PARENT-UUID`，命令中可用 `root` 代替。
