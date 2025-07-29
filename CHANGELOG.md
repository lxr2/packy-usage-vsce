# Change Log

All notable changes to the "packy-usage" extension will be documented in this file.

## [1.1.0] - 2025-07-29

### 🚀 新增功能
- 🔑 **双Token支持** - 新增支持两种Token类型：
  - API Token (sk-开头)：永久有效的访问令牌
  - JWT Token：从Dashboard获取的临时令牌
- 📋 **Token类型显示** - 在侧边栏配置区域显示当前Token类型
- 📖 **Token获取帮助** - 提供详细的Token获取说明文档
- 🔄 **自动类型检测** - 自动识别并验证Token类型
- ⬆️ **向后兼容** - 自动迁移旧版本JWT Token，无需重新配置

### 改进
- 优化Token输入提示，优先推荐API Token
- 简化API请求认证，移除Cookie头部，统一使用Bearer认证
- 改进Token验证逻辑，SK Token仅验证前缀
- 增强用户体验，提供清晰的Token获取指引
- 完善错误提示信息，区分不同Token类型的错误

### 技术改进
- 重构SecretService，采用策略模式支持多种Token类型
- 优化Token存储机制，支持Token类型持久化
- 改进代码架构，提升可扩展性和维护性

## [1.0.1] - 2025-07-10

### 🎉 主要改进
- ⚡ **实时数据更新** - 移除数据缓存机制，预算变化立即可见，无需等待
- 🚀 **启动优化** - 修复扩展激活问题，VS Code启动后插件自动可用
- 🔧 **稳定性提升** - 改进数据同步机制和错误处理流程

### Improved
- 预算数据实时同步，移除5分钟缓存延迟，确保显示最新状态
- 扩展自动激活机制，无需手动启用插件
- 支持自定义轮询间隔配置，用户可根据需要调整数据刷新频率
- 优化内存使用和资源管理，提升整体性能
- 更清晰的错误提示和状态显示

### Fixed
- 修复扩展在VS Code启动时不自动激活的问题
- 改进网络异常时的重试和恢复机制
- 优化Token验证和过期处理逻辑
- 修复数据同步中的潜在稳定性问题

### Changed
- 重构内部架构，提升代码质量和维护性
- 优化服务组织结构，改善运行效率和响应速度

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