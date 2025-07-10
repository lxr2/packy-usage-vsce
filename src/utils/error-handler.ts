import * as vscode from "vscode"

export enum ErrorType {
  API_ERROR = "API_ERROR",
  AUTH_ERROR = "AUTH_ERROR",
  NETWORK_ERROR = "NETWORK_ERROR",
  UNKNOWN_ERROR = "UNKNOWN_ERROR",
  VALIDATION_ERROR = "VALIDATION_ERROR"
}

export class AppError extends Error {
  constructor(
    public type: ErrorType,
    message: string,
    public originalError?: Error
  ) {
    super(message)
    this.name = "AppError"
  }
}

export class ErrorHandler {
  static createApiError(message: string, originalError?: Error): AppError {
    return new AppError(ErrorType.API_ERROR, message, originalError)
  }

  static createAuthError(message: string, originalError?: Error): AppError {
    return new AppError(ErrorType.AUTH_ERROR, message, originalError)
  }

  static createNetworkError(message: string, originalError?: Error): AppError {
    return new AppError(ErrorType.NETWORK_ERROR, message, originalError)
  }

  static createValidationError(
    message: string,
    originalError?: Error
  ): AppError {
    return new AppError(ErrorType.VALIDATION_ERROR, message, originalError)
  }

  static handle(error: AppError | Error): void {
    if (error instanceof AppError) {
      this.handleAppError(error)
    } else {
      this.handleUnknownError(error)
    }
  }

  private static handleAppError(error: AppError): void {
    console.error(`[${error.type}]:`, error.message, error.originalError)

    switch (error.type) {
      case ErrorType.API_ERROR:
        vscode.window.showErrorMessage(`API请求失败: ${error.message}`)
        break
      case ErrorType.AUTH_ERROR:
        vscode.window.showErrorMessage(
          `认证失败: ${error.message}。请检查API Token是否正确。`
        )
        break
      case ErrorType.NETWORK_ERROR:
        vscode.window.showErrorMessage(`网络连接错误: ${error.message}`)
        break
      case ErrorType.VALIDATION_ERROR:
        vscode.window.showWarningMessage(`输入验证失败: ${error.message}`)
        break
      default:
        vscode.window.showErrorMessage(`未知错误: ${error.message}`)
        break
    }
  }

  private static handleUnknownError(error: Error): void {
    console.error("Unknown error:", error)
    vscode.window.showErrorMessage(`未知错误: ${error.message}`)
  }
}
