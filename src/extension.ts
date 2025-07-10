import * as vscode from "vscode"

import { UsageExplorerProvider } from "./providers/usage-explorer.provider"
import { ApiService } from "./services/api.service"
import { DataService } from "./services/data.service"
import { PollingService } from "./services/polling.service"
import { SecretService } from "./services/secret.service"
import { StatusBarService } from "./services/status-bar.service"
import { ErrorHandler } from "./utils/error-handler"

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  // Initialize services
  const dataService = new DataService()
  const statusBarService = new StatusBarService()
  const secretService = new SecretService(context)
  const apiService = new ApiService(secretService)
  const pollingService = new PollingService(
    apiService,
    dataService,
    statusBarService
  )

  // Initialize providers
  const usageExplorerProvider = new UsageExplorerProvider(
    dataService,
    secretService
  )

  // Register tree data provider
  vscode.window.registerTreeDataProvider(
    "packy-usage.explorer",
    usageExplorerProvider
  )

  // Listen to data updates for status bar
  dataService.onDidUpdateData((data) => {
    statusBarService.updateStatus(data, dataService.isDataLoaded)
  })

  // Auto-fetch data on startup
  checkAndAutoFetch(apiService, dataService, secretService)

  // Start polling
  pollingService.start()

  const disposables = [
    vscode.commands.registerCommand("packy-usage.setToken", async () => {
      const token = await vscode.window.showInputBox({
        password: true,
        placeHolder: "API Token for budget data access",
        prompt: "Enter your API Token",
        validateInput: (value) => {
          if (!value || value.trim().length === 0) {
            return "Token cannot be empty"
          }
          if (value.length < 10) {
            return "Token seems too short"
          }

          // 检查JWT格式
          const parts = value.split(".")
          if (parts.length !== 3) {
            return "Token格式无效，请确保是有效的JWT Token"
          }

          // 检查是否已过期
          try {
            const [, payload] = parts
            const base64 = payload.replace(/-/g, "+").replace(/_/g, "/")
            const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4)
            const decoded = Buffer.from(padded, "base64").toString("utf8")
            const parsedPayload = JSON.parse(decoded)

            if (parsedPayload.exp) {
              const currentTime = Math.floor(Date.now() / 1000)
              if (currentTime >= parsedPayload.exp) {
                const expiredDate = new Date(parsedPayload.exp * 1000)
                return `Token已过期（过期时间: ${expiredDate.toLocaleString()}）`
              }
            }
          } catch {
            return "Token格式无效，无法解析"
          }

          return null
        }
      })

      if (token) {
        try {
          await secretService.setToken(token)

          // 显示Token过期时间信息
          const expiration = secretService.getTokenExpiration(token)
          const expirationText = expiration
            ? `，将于 ${expiration.toLocaleString()} 过期`
            : ""

          vscode.window.showInformationMessage(
            `API Token保存成功${expirationText}！`
          )

          usageExplorerProvider.refresh()

          try {
            const data = await apiService.fetchBudgetData()
            if (data) {
              dataService.updateData(data)
            }
          } catch (error) {
            ErrorHandler.handle(error as Error)
          }
        } catch (error) {
          vscode.window.showErrorMessage(
            `保存Token失败: ${(error as Error).message}`
          )
        }
      }
    }),

    vscode.commands.registerCommand("packy-usage.refresh", async () => {
      try {
        // Invalidate cache to force fresh data
        dataService.invalidateCache()
        const data = await apiService.fetchBudgetData()
        if (data) {
          dataService.updateData(data)
        } else {
          vscode.window.showWarningMessage("Please configure API Token first")
        }
      } catch (error) {
        ErrorHandler.handle(error as Error)
      }
    }),

    vscode.commands.registerCommand("packy-usage.showExplorer", () => {
      vscode.commands.executeCommand("packy-usage.explorer.focus")
    })
  ]

  // Register disposables
  context.subscriptions.push(...disposables)
  context.subscriptions.push({
    dispose: () => {
      usageExplorerProvider.dispose()
      dataService.dispose()
      statusBarService.dispose()
      pollingService.dispose()
    }
  })
}

export function deactivate() {}

async function checkAndAutoFetch(
  apiService: ApiService,
  dataService: DataService,
  secretService: SecretService
) {
  const token = await secretService.getToken()

  if (!token) {
    setTimeout(() => {
      showTokenSetupPrompt()
    }, 1000)
  } else {
    setTimeout(async () => {
      try {
        const data = await apiService.fetchBudgetData()
        if (data) {
          dataService.updateData(data)
        }
      } catch (error) {
        ErrorHandler.handle(error as Error)
      }
    }, 1000)
  }
}

async function showTokenSetupPrompt() {
  const choice = await vscode.window.showInformationMessage(
    "需要配置 API Token 来获取预算数据",
    "立即配置",
    "稍后配置"
  )

  switch (choice) {
    case "稍后配置":
      vscode.window.showInformationMessage(
        '您可以随时通过命令面板搜索 "Set API Token" 来配置。'
      )
      break
    case "立即配置":
      vscode.commands.executeCommand("packy-usage.setToken")
      break
  }
}
