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
  }

  dispose(): void {
    this.statusBarItem.dispose()
  }

  getStatusBarItem(): vscode.StatusBarItem {
    return this.statusBarItem
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
}
