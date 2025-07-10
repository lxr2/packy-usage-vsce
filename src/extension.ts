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
  console.log('"packy-usage" extension is now active!')

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
          return null
        }
      })

      if (token) {
        await secretService.setToken(token)
        vscode.window.showInformationMessage("API Token saved successfully!")
        usageExplorerProvider.refresh()
        try {
          const data = await apiService.fetchBudgetData()
          if (data) {
            dataService.updateData(data)
          }
        } catch (error) {
          ErrorHandler.handle(error as Error)
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
