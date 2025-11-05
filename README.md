# react-native-html-table-renderer

A custom table renderer for react-native-render-html

轻量级的表格渲染器，用于在移动端渲染marked或其它库将markdown内容转换为HTML后提交给[react-native-render-html](https://github.com/meliorence/react-native-render-html)的表格内容。

可以避免引入额外的依赖，
不使用webview，直接使用原生组件渲染表格内容，性能良好。
在移动端有较好的阅读体验，能满足一般markdown表格的渲染需求。

## 使用方法简介

首先下载项目文件，`components/renderers/TableRenderer.tsx`、`styles/tableStyles.ts`。

添加文件并导入：`import { TableRenderer } from './renderers/TableRenderer';`
负责table的计算和布局。

1. **注册自定义渲染器**:
  在你需要渲染表格的组件的代码中，通过 `useMemo` 创建一个对象。这个对象告诉 `RenderHTML` 组件当遇到特定 HTML 标签时应该使用哪个组件来渲染。
  示例代码：
  ```typescript
  const finalRenderersForHTML = useMemo(() => ({
    // ... 其他渲染器
    table: TableRenderer, // <--- 核心连接点
    // ...
  }), [preRendererWithThemeClosure, renderersPropsForHTML]);
  ```
  所有 `<table>` 标签都应由我们导入的 `TableRenderer`组件来处理。

2. **传递给 `RenderHTML`**:
  最后，这个`finalRenderersForHTML`对象作为 `renderers` prop 传递给 `<RenderHTML>` 组件实例。
  例如：
  
  ```typescript
  return (
                          <RenderHTML
                            contentWidth={MAX_WIDTH - (RESPONSIVE_PADDING + 4) * 2}
                            source={{ html: finalHtmlContent, baseUrl: appDocumentDirectoryUri ?? undefined }}
                            tagsStyles={tagsStyles}
                            baseStyle={baseStyleToUse}
                            renderers={finalRenderersForHTML} // 在这里传递
                            renderersProps={renderersPropsForHTML}
                            customHTMLElementModels={customHTMLElementModels}
                            systemFonts={systemFontsMemo}
                            enableExperimentalMarginCollapsing={true}
                          />
  ```
  
### 功能介绍

- **接收数据**:
  组件接收一个名为 `tnode` 的 prop，这是 `react-native-render-html` 传递过来的抽象语法树节点，包含了 `<table>` 标签及其所有子元素（`thead`, `tbody`, `tr`, `th`, `td`）的结构化信息。

- **动态列宽计算**：
  
  -  **最大列宽限制**：
      *   如果表格只有一列，该列的最大宽度为屏幕宽度的80%。
      *   如果表格有两列或更多列，每一列的最大宽度被限制为屏幕宽度的50%。
      *   任何超过这个最大宽度的内容都会被强制换行。

  -  **最小列宽保证**：
      *   每一列的宽度至少为 `50px`，以确保基本的可读性。

  -  **智能宽度分配**：
      *   在同时满足了最大和最小宽度限制之后，如果表格的总宽度小于屏幕宽度的80%，那么多出的空间会按比例分配给各列，使表格撑满这个宽度。
      *   如果总宽度超出了屏幕宽度的80%，表格将允许横向滚动。

- **渲染原生组件**:
    -  **横向滚动**: 最外层是一个 `<ScrollView horizontal={true}>`（第 **[119](components/renderers/TableRenderer.tsx)** 行），这使得宽度超出屏幕的表格可以左右滑动。
    -  **结构映射**: 组件遍历 `tnode` 的子节点，用 `<View>` 来模拟 `<thead>`, `<tbody>`, `<tr>` 的行为。
    -  **应用宽度和样式**: 在渲染每个单元格（`<th>` 或 `<td>`）时，它创建一个 `<View>`，并从 `columnWidths` state 中取出对应的宽度应用到 `style` 上。同时，它也会从 [`tableStyles`](components/renderers/TableRenderer.tsx) 中应用对应的样式（如 `tableStyles.th` 或 `tableStyles.td`）。

#### `styles/tableStyles.ts` - 视觉样式定义

这个文件只负责定义表格的外观。

- **StyleSheet**: 使用 React Native 的 `StyleSheet.create` 方法定义了一组样式。
- **样式规则**: 包含了对 `table`（边框）、`thead`（表头背景色）、`tr`（行布局）、`th`（表头单元格样式，如加粗）和 `td`（普通单元格样式）的详细定义。
