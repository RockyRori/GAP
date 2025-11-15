# GAP
GAP System, designed for MRAG-Bench.
# D
Directory Structure
```
GAP/
├─ README.md                     # 项目介绍、使用说明、论文引用方式
├─ LICENSE                       # 许可证（MIT/Apache-2.0 等）
├─ package.json
├─ pnpm-lock.yaml / yarn.lock / package-lock.json
├─ tsconfig.json
├─ vite.config.ts                # 建议用 Vite + React + TS
├─ index.html
├─ .gitignore
├─ .editorconfig
├─ .prettierrc / .eslintrc.cjs   # 可选：格式化 & 代码规范

├─ public/                       # 静态资源 (favicon、logo 等)
│  ├─ favicon.ico
│  └─ gap-logo.png

├─ docs/                         # 文档 & 论文相关文件（给读者看的）
│  ├─ spec/
│  │  ├─ gap_json_schema.md      # 外部 MRAG 输出 JSON 的格式说明
│  │  ├─ scoring_rules.md        # 评分规则 & 指标定义
│  │  └─ usage_tutorial.md       # 使用教程（带截图）
│  ├─ paper/
│  │  ├─ gap_system_overview.md  # 论文中系统部分的说明草稿
│  │  └─ figures/                # 架构图、流程图等
│  └─ changelog.md               # 版本变更记录

├─ examples/                     # 示例数据，给用户直接下载测试
│  ├─ sample_gold_schema.json    # 标准答案格式（可选）
│  ├─ sample_mrag_openai.json    # 示例：来自 MRAG 系统 A
│  ├─ sample_mrag_claude.json    # 示例：来自 MRAG 系统 B
│  └─ sample_mrag_qwen.json      # 示例：来自 MRAG 系统 C

├─ scripts/                      # 开发/部署脚本（可选）
│  └─ deploy-gh-pages.sh         # 手动部署脚本（用 GitHub Actions 可以不需要）

├─ .github/
│  └─ workflows/
│     └─ pages.yml               # GitHub Pages 自动部署 CI

└─ src/
   ├─ main.tsx                   # React 入口
   ├─ App.tsx                    # 顶层路由和布局
   ├─ router/                    # （可选）React Router 配置
   │  └─ index.tsx

   ├─ pages/                     # 页面级组件
   │  ├─ HomePage/
   │  │  ├─ HomePage.tsx         # 简介、使用流程、入口按钮
   │  │  └─ index.ts
   │  ├─ UploadPage/
   │  │  ├─ UploadPage.tsx       # 多文件上传、解析状态显示
   │  │  └─ index.ts
   │  ├─ EvaluationPage/
   │  │  ├─ EvaluationPage.tsx   # 评分结果表格、对比视图
   │  │  └─ index.ts
   │  ├─ ReportPage/
   │  │  ├─ ReportPage.tsx       # 报告展示 + 下载按钮（JSON/CSV/PDF）
   │  │  └─ index.ts
   │  └─ AboutPage/
   │     ├─ AboutPage.tsx        # 论文引用、作者信息、项目背景
   │     └─ index.ts

   ├─ components/                # 可复用组件
   │  ├─ layout/
   │  │  ├─ Header.tsx
   │  │  ├─ Footer.tsx
   │  │  └─ PageContainer.tsx
   │  ├─ upload/
   │  │  ├─ FileDropZone.tsx     # 拖拽 + 点击上传 JSON
   │  │  └─ FileList.tsx         # 显示已加载的文件列表
   │  ├─ evaluation/
   │  │  ├─ SystemMetricsTable.tsx    # 每个 MRAG 系统的指标表
   │  │  ├─ SystemsComparisonChart.tsx# 多系统对比图(条形图/雷达图)
   │  │  └─ SampleDetailTable.tsx     # 单条样本详情表
   │  ├─ report/
   │  │  ├─ ReportSummaryCard.tsx     # 总结卡片
   │  │  └─ DownloadButtons.tsx
   │  └─ common/
   │     ├─ AlertBox.tsx
   │     ├─ LoadingSpinner.tsx
   │     └─ EmptyState.tsx

   ├─ store/                     # 状态管理（轻量可以直接用 hooks + context）
   │  ├─ GapContext.tsx          # React Context：保存全部上传数据与评分结果
   │  └─ useGapStore.ts          # 自定义 hook（或换成 Zustand 等）

   ├─ types/                     # TypeScript 类型定义
   │  ├─ mrag.ts                 # 外部 MRAG JSON 结构
   │  ├─ gap.ts                  # GAP 内部统一数据结构 & 指标类型
   │  └─ index.ts

   ├─ utils/                     # 通用工具函数
   │  ├─ file.ts                 # 多文件读取与 JSON 解析
   │  ├─ download.ts             # JSON/CSV/PDF 下载逻辑
   │  ├─ format.ts               # 数字/百分比/小数位格式化
   │  └─ logger.ts               # 简单日志封装（可选）

   ├─ core/                      # 评测核心逻辑（论文里会重点介绍）
   │  ├─ parsing/
   │  │  ├─ normalizeMragOutput.ts # 把不同系统的 JSON 规范化为统一结构
   │  │  └─ validateSchema.ts      # JSON schema 校验（可选）
   │  ├─ scoring/
   │  │  ├─ computeMetrics.ts      # 对单个系统计算指标
   │  │  ├─ compareSystems.ts      # 多系统对比汇总
   │  │  └─ matchFormula.ts        # 公式匹配规则（LaTeX 相似度等）
   │  └─ config/
   │     ├─ scoringConfig.ts       # 各指标权重、阈值等
   │     └─ constants.ts

   ├─ styles/                   # 样式相关（看你用什么方案）
   │  ├─ global.css             # 全局样式
   │  └─ variables.css          # 颜色/spacing 等

   ├─ hooks/                    # 通用自定义 hooks
   │  ├─ useFileUpload.ts       # 封装文件上传 + 解析逻辑
   │  └─ useReportExport.ts     # 封装报告导出逻辑

   └─ __tests__/                # 单元测试（可选）
      ├─ core/
      │  ├─ computeMetrics.test.ts
      │  └─ matchFormula.test.ts
      └─ utils/
         └─ file.test.ts

```