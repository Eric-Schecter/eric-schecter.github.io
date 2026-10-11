艾琳 Hugo 组件

项目级挂载：layouts/baseof.html 在 #pjax-container 外调用 partial "eileen"。
资源：static/eileen，完全静态，无需 Rev2D 编辑器服务或 API 密钥。
Shadow DOM 隔离样式与查询；PJAX 切换保留角色、位置和当前会话。
页面隐藏时暂停渲染；适配 newsroom 的 data-mode=dim 深色模式。

关闭组件：在 Hugo params 配置中加入
[eileen]
  enabled = false

更新资产：在 assistant-lab 执行 node scripts/package-hugo.cjs，将生成的 static/eileen 同步至 Hugo 项目。
运行库重建：node scripts/bundle-rev2d-web.cjs（需要本机 /Users/eric/Documents/tools/Rev2D）。
仓库已包含运行库，Hugo/CI 不需要该外部工具。
第三方许可：static/eileen/REV2D-LICENSE.txt。
当前聊天为本地规则，不调用 AI，不发送访客留言；对话只存在于当前浏览器页面内存。
