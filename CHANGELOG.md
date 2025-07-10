# Change Log

All notable changes to the "packy-usage" extension will be documented in this file.

## [1.0.0] - 2025-07-10

### Added
- 📊 **实时预算监控** - 显示每日和每月的API预算使用情况
- 📈 **使用率统计** - 直观显示预算使用百分比和金额
- 🔧 **状态栏集成** - 在VS Code状态栏实时显示预算使用率
- 🌳 **侧边栏面板** - 详细的预算数据树形展示
- 🔄 **自动轮询** - 定期自动刷新预算数据
- 🔒 **安全存储** - API Token安全存储在VS Code密钥库中
- ⚡ **JWT Token验证** - 支持JWT格式验证和过期检测
- 🛡️ **错误处理** - 完善的网络异常和认证错误处理
- 📱 **用户友好界面** - 自动配置提示和友好的错误信息

### Features
- API Token安全管理，支持JWT格式验证
- 实时预算数据展示（日预算/月预算）
- 状态栏快速查看预算使用率
- 侧边栏树形结构详细展示
- 自动数据轮询和缓存管理
- 网络超时和重试机制
- Token过期自动检测和提醒

### Security
- API Token通过VS Code Secrets API安全存储
- 所有网络请求均通过HTTPS加密
- JWT Token格式验证和过期检测
- 认证失败时自动清理过期Token

### Commands
- `Packy Usage: Set API Token` - 配置或更新API Token
- `Packy Usage: Refresh Budget Data` - 手动刷新预算数据
- `Packy Usage: Show Usage Explorer` - 打开预算监控面板