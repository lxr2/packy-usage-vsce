import * as vscode from "vscode"

export class UsageItem extends vscode.TreeItem {
  constructor(
    public readonly label: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
    public readonly contextValue?: string,
    iconPath?: string
  ) {
    super(label, collapsibleState)
    this.tooltip = this.getTooltip()
    this.contextValue = contextValue || "usageItem"

    if (iconPath) {
      this.iconPath = new vscode.ThemeIcon(
        iconPath.replace("$(", "").replace(")", "")
      )
    }

    // Add command for clickable items
    if (contextValue === "setToken") {
      this.command = {
        arguments: [],
        command: "packy-usage.setToken",
        title: "Set API Token"
      }
    } else if (contextValue === "noData") {
      this.command = {
        arguments: [],
        command: "packy-usage.refresh",
        title: "Refresh Budget Data"
      }
    }
  }

  private getTooltip(): string {
    switch (this.contextValue) {
      case "dailyBudget":
        return "今日预算使用情况"
      case "dailyPercentage":
        return "今日预算使用百分比"
      case "dailyTotal":
        return "今日总预算金额"
      case "dailyUsed":
        return "今日已使用的预算金额"
      case "monthlyBudget":
        return "本月预算使用情况"
      case "monthlyPercentage":
        return "本月预算使用百分比"
      case "monthlyTotal":
        return "本月总预算金额"
      case "monthlyUsed":
        return "本月已使用的预算金额"
      case "noData":
        return "点击刷新获取最新预算数据"
      case "noToken":
        return "需要配置API Token才能获取预算数据"
      case "setToken":
        return "点击设置API Token"
      default:
        return this.label
    }
  }
}
