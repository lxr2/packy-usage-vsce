import * as vscode from "vscode"

import { ApiResponse, BudgetData } from "../models/budget.model"
import { ErrorHandler } from "../utils/error-handler"
import { SecretService } from "./secret.service"

export class ApiService {
  private config: vscode.WorkspaceConfiguration
  private readonly REQUEST_TIMEOUT = 10000 // 10 seconds

  constructor(private secretService: SecretService) {
    this.config = vscode.workspace.getConfiguration("packy-usage")
  }

  async fetchBudgetData(): Promise<BudgetData | null> {
    const token = await this.secretService.getToken()
    const endpoint = this.config.get<string>("apiEndpoint")

    if (!token || !endpoint) {
      return null
    }

    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(
        () => controller.abort(),
        this.REQUEST_TIMEOUT
      )

      const response = await fetch(endpoint, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Cookie: `token=${token}`
        },
        method: "GET",
        signal: controller.signal
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          // 认证失败可能是Token过期，触发Token清理
          await this.handleAuthFailure()
          throw ErrorHandler.createAuthError(
            `认证失败 (${response.status}): ${response.statusText}`
          )
        }
        throw ErrorHandler.createApiError(
          `API请求失败 (${response.status}): ${response.statusText}`
        )
      }

      const data = (await response.json()) as ApiResponse
      return this.transformToBudgetData(data)
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === "AbortError") {
          throw ErrorHandler.createNetworkError("请求超时", error)
        }
        if (error.message.includes("fetch")) {
          throw ErrorHandler.createNetworkError("网络连接失败", error)
        }
      }
      throw error
    }
  }

  /**
   * 处理认证失败的情况
   */
  private async handleAuthFailure(): Promise<void> {
    try {
      // 清理可能过期的Token
      await this.secretService.deleteToken()
    } catch {}
  }

  private transformToBudgetData(data: ApiResponse): BudgetData {
    const dailyBudget = Number(data.daily_budget_usd) || 0
    const dailySpent = Number(data.daily_spent_usd) || 0
    const dailyPercentage =
      dailyBudget > 0 ? (dailySpent / dailyBudget) * 100 : 0

    const monthlyBudget = Number(data.monthly_budget_usd) || 0
    const monthlySpent = Number(data.monthly_spent_usd) || 0
    const monthlyPercentage =
      monthlyBudget > 0 ? (monthlySpent / monthlyBudget) * 100 : 0

    return {
      daily: {
        percentage: dailyPercentage,
        total: dailyBudget,
        used: dailySpent
      },
      monthly: {
        percentage: monthlyPercentage,
        total: monthlyBudget,
        used: monthlySpent
      }
    }
  }
}
