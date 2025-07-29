import * as vscode from "vscode"

import { DataService } from "../services/data.service"
import { SecretService, TokenType } from "../services/secret.service"
import { UsageItem } from "./usage-item"

export class UsageExplorerProvider
  implements vscode.TreeDataProvider<UsageItem>
{
  private _onDidChangeTreeData: vscode.EventEmitter<
    null | undefined | UsageItem | void
  > = new vscode.EventEmitter<null | undefined | UsageItem | void>()
  readonly onDidChangeTreeData: vscode.Event<
    null | undefined | UsageItem | void
  > = this._onDidChangeTreeData.event

  constructor(
    private dataService: DataService,
    private secretService: SecretService
  ) {
    // Listen to data updates
    this.dataService.onDidUpdateData(() => {
      this.refresh()
    })

    // Listen to secret changes (including token deletion due to expiration)
    this.secretService.onDidChange(() => {
      this.refresh()
    })
  }

  dispose(): void {
    this._onDidChangeTreeData.dispose()
  }

  async getChildren(element?: UsageItem): Promise<UsageItem[]> {
    if (!element) {
      const token = await this.secretService.getToken()

      if (!token) {
        return [
          new UsageItem(
            "⚠️ 未配置 Token",
            vscode.TreeItemCollapsibleState.None,
            "noToken",
            "$(warning)"
          ),
          new UsageItem(
            "点击设置 API Token",
            vscode.TreeItemCollapsibleState.None,
            "setToken",
            "$(gear)"
          )
        ]
      }

      if (!this.dataService.isDataLoaded) {
        return [
          new UsageItem(
            "📊 点击刷新获取预算数据",
            vscode.TreeItemCollapsibleState.None,
            "noData",
            "$(info)"
          ),
          new UsageItem(
            "🔧 配置",
            vscode.TreeItemCollapsibleState.Collapsed,
            "settings",
            "$(gear)"
          )
        ]
      }

      return [
        new UsageItem(
          "日预算",
          vscode.TreeItemCollapsibleState.Expanded,
          "dailyBudget",
          "$(calendar)"
        ),
        new UsageItem(
          "月预算",
          vscode.TreeItemCollapsibleState.Expanded,
          "monthlyBudget",
          "$(calendar)"
        ),
        new UsageItem(
          "🔧 配置",
          vscode.TreeItemCollapsibleState.Collapsed,
          "settings",
          "$(gear)"
        )
      ]
    } else if (element.contextValue === "dailyBudget") {
      return this.getDailyBudgetChildren()
    } else if (element.contextValue === "monthlyBudget") {
      return this.getMonthlyBudgetChildren()
    } else if (element.contextValue === "settings") {
      return await this.getSettingsChildren()
    }
    return []
  }

  getTreeItem(element: UsageItem): vscode.TreeItem {
    return element
  }

  refresh(): void {
    this._onDidChangeTreeData.fire()
  }

  private getDailyBudgetChildren(): Thenable<UsageItem[]> {
    const data = this.dataService.currentData
    const dailyUsed = Number(data.daily.used) || 0
    const dailyTotal = Number(data.daily.total) || 0
    const dailyPercentage = Number(data.daily.percentage) || 0

    return Promise.resolve([
      new UsageItem(
        `已使用: $${dailyUsed.toFixed(2)}`,
        vscode.TreeItemCollapsibleState.None,
        "dailyUsed",
        "$(circle-filled)"
      ),
      new UsageItem(
        `总预算: $${dailyTotal.toFixed(2)}`,
        vscode.TreeItemCollapsibleState.None,
        "dailyTotal",
        "$(circle-outline)"
      ),
      new UsageItem(
        `使用率: ${dailyPercentage.toFixed(1)}%`,
        vscode.TreeItemCollapsibleState.None,
        "dailyPercentage",
        this.dataService.getPercentageIcon(dailyPercentage)
      )
    ])
  }

  private getMonthlyBudgetChildren(): Thenable<UsageItem[]> {
    const data = this.dataService.currentData
    const monthlyUsed = Number(data.monthly.used) || 0
    const monthlyTotal = Number(data.monthly.total) || 0
    const monthlyPercentage = Number(data.monthly.percentage) || 0

    return Promise.resolve([
      new UsageItem(
        `已使用: $${monthlyUsed.toFixed(2)}`,
        vscode.TreeItemCollapsibleState.None,
        "monthlyUsed",
        "$(circle-filled)"
      ),
      new UsageItem(
        `总预算: $${monthlyTotal.toFixed(2)}`,
        vscode.TreeItemCollapsibleState.None,
        "monthlyTotal",
        "$(circle-outline)"
      ),
      new UsageItem(
        `使用率: ${monthlyPercentage.toFixed(1)}%`,
        vscode.TreeItemCollapsibleState.None,
        "monthlyPercentage",
        this.dataService.getPercentageIcon(monthlyPercentage)
      )
    ])
  }

  private async getSettingsChildren(): Promise<UsageItem[]> {
    const config = vscode.workspace.getConfiguration("packy-usage")
    const token = await this.secretService.getToken()
    const tokenType = await this.secretService.getTokenType()
    const endpoint = config.get<string>("apiEndpoint")

    // 构建token状态显示
    let tokenLabel = "Token: "
    if (!token) {
      tokenLabel += "未配置"
    } else if (tokenType === TokenType.API_KEY) {
      tokenLabel += "已配置 (API Token)"
    } else if (tokenType === TokenType.JWT) {
      tokenLabel += "已配置 (JWT Token)"
    } else {
      tokenLabel += "已配置"
    }

    return [
      new UsageItem(
        tokenLabel,
        vscode.TreeItemCollapsibleState.None,
        "tokenStatus",
        token ? "$(check)" : "$(x)"
      ),
      new UsageItem(
        "设置 Token",
        vscode.TreeItemCollapsibleState.None,
        "setToken",
        "$(edit)"
      ),
      new UsageItem(
        `API: ${endpoint}`,
        vscode.TreeItemCollapsibleState.None,
        "apiEndpoint",
        "$(link)"
      )
    ]
  }
}
