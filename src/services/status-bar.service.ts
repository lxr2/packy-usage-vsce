import * as vscode from "vscode"

import { BudgetData } from "../models/budget.model"

export class StatusBarService {
  private hasDataLoaded: boolean = false
  private statusBarItem: vscode.StatusBarItem

  constructor() {
    this.statusBarItem = vscode.window.createStatusBarItem(
      vscode.StatusBarAlignment.Right,
      100
    )
    // 立即显示初始状态
    this.showInitialStatus()
  }

  dispose(): void {
    this.statusBarItem.dispose()
  }

  getStatusBarItem(): vscode.StatusBarItem {
    return this.statusBarItem
  }

  showErrorStatus(message?: string): void {
    this.statusBarItem.text = "$(warning) 获取失败"
    this.statusBarItem.tooltip = message || "预算数据获取失败，点击重试"
    this.statusBarItem.command = "packy-usage.refresh"
    this.statusBarItem.show()
  }

  showLoadingStatus(): void {
    this.statusBarItem.text = "$(loading~spin) 获取数据中..."
    this.statusBarItem.tooltip = "正在获取预算数据，请稍候"
    this.statusBarItem.command = "packy-usage.refresh"
    this.statusBarItem.show()
  }

  showNoTokenStatus(): void {
    this.statusBarItem.text = "$(key) 需要配置Token"
    this.statusBarItem.tooltip = "点击配置API Token"
    this.statusBarItem.command = "packy-usage.setToken"
    this.statusBarItem.show()
  }

  updateStatus(data: BudgetData | null, isDataLoaded: boolean): void {
    this.hasDataLoaded = isDataLoaded

    if (!isDataLoaded || !data) {
      this.statusBarItem.text = "$(warning) 未获取预算数据"
      this.statusBarItem.tooltip = "点击获取预算数据"
      this.statusBarItem.command = "packy-usage.refresh"
    } else {
      const dailyPercentage = data.daily.percentage
      const dailyUsed = data.daily.used
      const dailyTotal = data.daily.total

      this.statusBarItem.text = `日预算: ${dailyPercentage.toFixed(1)}%`
      this.statusBarItem.tooltip = `日预算使用率: ${dailyPercentage.toFixed(1)}%\n已用: $${dailyUsed.toFixed(2)} / $${dailyTotal.toFixed(2)}`
      this.statusBarItem.command = "packy-usage.showExplorer"
    }

    this.statusBarItem.show()
  }

  private showInitialStatus(): void {
    this.statusBarItem.text = "$(loading~spin) 初始化中..."
    this.statusBarItem.tooltip = "正在初始化预算数据"
    this.statusBarItem.command = "packy-usage.refresh"
    this.statusBarItem.show()
  }
}
