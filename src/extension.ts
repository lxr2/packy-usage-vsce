import * as vscode from "vscode"

import { ExtensionManager } from "./controllers/extension.manager"

/**
 * 全局扩展管理器实例
 */
let extensionManager: ExtensionManager

/**
 * 扩展激活入口点
 * 当扩展被VS Code激活时调用此方法
 */
export async function activate(
  context: vscode.ExtensionContext
): Promise<void> {
  extensionManager = new ExtensionManager()
  await extensionManager.activate(context)
}

/**
 * 扩展停用入口点
 * 当扩展被停用时调用此方法
 */
export function deactivate(): void {
  extensionManager?.deactivate()
}
