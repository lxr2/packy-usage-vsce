import * as vscode from "vscode"

import { UsageExplorerProvider } from "../providers/usage-explorer.provider"
import { ApiService } from "../services/api.service"
import { ConfigService } from "../services/config.service"
import { DataService } from "../services/data.service"
import { SecretService } from "../services/secret.service"
import { StatusBarService } from "../services/status-bar.service"
import { ErrorHandler } from "../utils/error-handler"

/**
 * 命令控制器
 * 负责处理所有VS Code命令的业务逻辑
 */
export class CommandController {
  constructor(
    private apiService: ApiService,
    private configService: ConfigService,
    private dataService: DataService,
    private secretService: SecretService,
    private statusBarService: StatusBarService,
    private usageExplorerProvider: UsageExplorerProvider
  ) {}

  /**
   * 自动获取数据（用于启动时）
   */
  async autoFetchOnStartup(): Promise<void> {
    const token = await this.secretService.getToken()

    if (!token) {
      // 显示需要配置Token的状态
      this.statusBarService.showNoTokenStatus()
      setTimeout(() => {
        this.showTokenSetupPrompt()
      }, 1000)
    } else {
      // 显示加载状态并立即开始数据获取
      this.statusBarService.showLoadingStatus()
      await this.fetchAndUpdateData()
    }
  }

  /**
   * 注册所有命令
   */
  registerCommands(): vscode.Disposable[] {
    return [
      vscode.commands.registerCommand("packy-usage.setToken", () =>
        this.handleSetToken()
      ),
      vscode.commands.registerCommand("packy-usage.refresh", () =>
        this.handleRefresh()
      ),
      vscode.commands.registerCommand("packy-usage.showExplorer", () =>
        this.handleShowExplorer()
      )
    ]
  }

  /**
   * 获取并更新数据
   */
  private async fetchAndUpdateData(): Promise<void> {
    try {
      this.statusBarService.showLoadingStatus()
      const data = await this.apiService.fetchBudgetData()

      if (data) {
        this.dataService.updateData(data)
      } else {
        this.statusBarService.showNoTokenStatus()
        vscode.window.showWarningMessage(
          vscode.l10n.t("Please configure API Token first")
        )
      }
    } catch (error) {
      ErrorHandler.handle(error as Error)
      this.statusBarService.showErrorStatus(vscode.l10n.t("Data fetch failed"))
    }
  }

  /**
   * 处理刷新命令
   */
  private async handleRefresh(): Promise<void> {
    await this.fetchAndUpdateData()
  }

  /**
   * 处理设置Token命令
   */
  private async handleSetToken(): Promise<void> {
    // 显示获取Token的帮助信息
    const helpChoice = await vscode.window.showInformationMessage(
      vscode.l10n.t("Please select Token acquisition method"),
      vscode.l10n.t("View acquisition instructions first"),
      vscode.l10n.t("Enter Token")
    )

    if (!helpChoice) {
      return
    }

    if (helpChoice === vscode.l10n.t("View acquisition instructions first")) {
      const tokenType = await vscode.window.showQuickPick(
        [
          {
            description: vscode.l10n.t("Permanently valid access token"),
            detail: vscode.l10n.t("Get API Token starting with 'sk-' directly from PackyCode Dashboard"),
            label: vscode.l10n.t("API Token (Recommended)")
          },
          {
            description: vscode.l10n.t("Temporary token from PackyCode Dashboard"),
            detail: vscode.l10n.t(
              "Visit PackyCode Dashboard, open browser developer tools (F12), find the cookie named 'token' in Application/Storage > Cookies"
            ),
            label: vscode.l10n.t("JWT Token")
          }
        ],
        {
          placeHolder: vscode.l10n.t("Select token type to view detailed instructions"),
          title: vscode.l10n.t("Token acquisition instructions")
        }
      )

      if (!tokenType) {
        return
      }
    }

    const token = await vscode.window.showInputBox({
      password: true,
      placeHolder: vscode.l10n.t("Enter API Token (sk-) or JWT Token"),
      prompt: vscode.l10n.t("Recommended: Use permanent API Token (sk-). JWT Token can be obtained from PackyCode Dashboard cookies"),
      validateInput: (value) => this.validateTokenInput(value)
    })

    if (!token) {
      return
    }

    try {
      await this.secretService.setToken(token)

      // 显示Token类型和过期时间信息
      if (token.startsWith("sk-")) {
        vscode.window.showInformationMessage(
          vscode.l10n.t("API Token saved successfully! This Token is permanently valid.")
        )
      } else {
        const expiration = this.secretService.getTokenExpiration(token)
        const expirationText = expiration
          ? vscode.l10n.t("will expire at {0}", expiration.toLocaleString())
          : ""

        vscode.window.showInformationMessage(
          vscode.l10n.t("JWT Token saved successfully{0}!", expirationText)
        )
      }

      // 刷新视图和数据
      this.usageExplorerProvider.refresh()
      await this.fetchAndUpdateData()
    } catch (error) {
      vscode.window.showErrorMessage(
        vscode.l10n.t("Failed to save Token: {0}", (error as Error).message)
      )
    }
  }

  /**
   * 处理显示资源管理器命令
   */
  private handleShowExplorer(): void {
    vscode.commands.executeCommand("packy-usage.explorer.focus")
  }

  /**
   * 显示Token设置提示
   */
  private async showTokenSetupPrompt(): Promise<void> {
    const choice = await vscode.window.showInformationMessage(
      vscode.l10n.t("You need to configure an access token to get budget data"),
      vscode.l10n.t("Configure Now"),
      vscode.l10n.t("View Help"),
      vscode.l10n.t("Configure Later")
    )

    switch (choice) {
      case vscode.l10n.t("View Help"): {
        const helpText = vscode.l10n.t(`### Token Acquisition Methods

**API Token (Recommended)**
- Permanently valid access token
- Get API Token starting with 'sk-' directly from PackyCode Dashboard

**JWT Token**
- Temporary token from PackyCode Dashboard
- Acquisition steps:
  1. Visit PackyCode Dashboard
  2. Open browser developer tools (press F12 or right-click and select "Inspect")
  3. Switch to "Application" or "Storage" tab
  4. Find "Cookies" in the left panel and expand it
  5. Select the current website domain
  6. Find the cookie named "token" in the right list
  7. Copy its value as your JWT Token`)

        vscode.window.showInformationMessage(helpText, { modal: true })
        // 显示帮助后再提示配置
        setTimeout(() => {
          vscode.commands.executeCommand("packy-usage.setToken")
        }, 500)
        break
      }
      case vscode.l10n.t("Configure Later"):
        vscode.window.showInformationMessage(
          vscode.l10n.t(
            'You can configure it later by searching for "Set API Token" in the command palette.'
          )
        )
        break
      case vscode.l10n.t("Configure Now"):
        vscode.commands.executeCommand("packy-usage.setToken")
        break
    }
  }

  /**
   * 验证Token输入
   */
  private validateTokenInput(value: string): null | string {
    if (!value || value.trim().length === 0) {
      return vscode.l10n.t("Token cannot be empty")
    }

    // 优先检查是否为SK Token
    if (value.startsWith("sk-")) {
      // SK Token验证通过
      return null
    }

    // 其次检查JWT格式
    if (value.split(".").length === 3) {
      // JWT验证
      try {
        const [, payload] = value.split(".")
        const base64 = payload.replace(/-/g, "+").replace(/_/g, "/")
        const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4)
        const decoded = Buffer.from(padded, "base64").toString("utf8")
        const parsedPayload = JSON.parse(decoded)

        if (parsedPayload.exp) {
          const currentTime = Math.floor(Date.now() / 1000)
          if (currentTime >= parsedPayload.exp) {
            const expiredDate = new Date(parsedPayload.exp * 1000)
            return vscode.l10n.t(
              "JWT Token has expired (expiration: {0})",
              expiredDate.toLocaleString()
            )
          }
        }
        return null
      } catch {
        return vscode.l10n.t("Invalid JWT Token format")
      }
    }

    return vscode.l10n.t("Unrecognized Token format, please provide API Token (sk-) or JWT Token")
  }
}
