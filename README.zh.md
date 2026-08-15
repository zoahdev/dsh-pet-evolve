# dsh-pet-evolve

> 会**随你的 DeepSeek Harness agent 一起成长**的宠物。不是静态贴图——它从真实 agent 信号升级、实时镜像 agent 状态、一键生成可分享的成长卡。

零依赖 · 数据全部留在本机 · 可独立运行，也可装进 DSH。

## 和静态图鉴的区别

宠物图鉴给你看贴图；这里相反——**宠物的形态是挣来的**。

| | petdex / whale-girl 风格 | dsh-pet-evolve |
| --- | --- | --- |
| 形象 | 静态图鉴 | 5 个进化阶段，Canvas 实时绘制 |
| agent 感知 | 无 | 镜像 working / done / failed / idle（读真实会话事件） |
| 成长来源 | 无 | 已验证规则（dsh-rule-evolve）、完成会话、工具调用、压缩 |
| 分享 | 截图 | 一键导出 1200×630 成长卡 PNG |
| 数据 | 不定 | 100% 本地，零遥测 |

## 快速开始

```sh
# 独立运行（免安装）
npx dsh-pet-evolve
# 打开 http://127.0.0.1:4173

# 绑定真实 DSH 信号
npx dsh-pet-evolve --profile ~/.dsh/profiles/web

# 无头成长报告
npx dsh-pet-evolve --report
```

可以直接喂食/玩耍；绑定 profile 后还会从以下来源获得 XP：

- `rule_verified` —— profile 规则库中已验证的规则（兼容 dsh-rule-evolve）
- `session_completed` —— profile 中完成的会话
- `tool_call` —— 会话日志里的工具调用
- `compaction` —— 压缩摘要

## DSH 插件模式

```sh
dsh plugin --profile web add github:zoahdev/dsh-pet-evolve
```

宿主插件会启动绑定到 profile 的宠物服务（默认端口 4173）。`lib/` 已提交构建产物，安装时无需构建。

## 进化

蛋 → 幼崽 → 少年 → 成年 → 传说。每 100 XP 升 1 级；阶段阈值为 300 / 800 / 1600 / 3000。详见 [docs/evolution-stages.md](./docs/evolution-stages.md)。

## 开发

```sh
node --test engine adapter   # 引擎 + 适配器测试
node scripts/build-check.mjs # 产物完整性
node scripts/pet.mjs         # 本地宠物
```

## 隐私

宠物只读取你指定的本地文件（会话日志与规则文件），不向任何地方发送数据；分享卡在浏览器本地生成。

## Roadmap

- [x] 进化引擎 + 测试
- [x] DSH 会话/规则适配器 + 测试
- [x] Canvas 宠物 + 交互 + 分享卡
- [x] CLI + 零依赖服务 + DSH 插件包装
- [x] 多皮肤（鲸鱼 / 猫 / 机器人 / 幽灵）
- [x] 专注计时生产力模式（完成 +5 XP）
- [x] awesome 列表 + 市场收录（PR #623）
- [ ] 在线 Demo 页（等待独立演示域名）
- [ ] 与 dsh-rule-evolve 成长报告联动

## License

MIT
