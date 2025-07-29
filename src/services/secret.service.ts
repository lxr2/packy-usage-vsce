import * as vscode from "vscode"

export enum TokenType {
  API_KEY = "API_KEY",
  JWT = "JWT"
}

interface JWTPayload {
  [key: string]: any
  exp?: number
}

interface TokenValidator {
  getExpiration(token: string): Date | null
  isExpired(token: string): boolean
  validate(token: string): boolean
}

class JWTValidator implements TokenValidator {
  getExpiration(token: string): Date | null {
    try {
      const payload = this.parseJWTPayload(token)
      if (payload.exp) {
        return new Date(payload.exp * 1000)
      }
      return null
    } catch {
      return null
    }
  }

  isExpired(token: string): boolean {
    try {
      const payload = this.parseJWTPayload(token)
      if (!payload.exp) {
        return false
      }
      const currentTime = Math.floor(Date.now() / 1000)
      return currentTime >= payload.exp
    } catch {
      return true
    }
  }

  validate(token: string): boolean {
    return token.split(".").length === 3
  }

  private parseJWTPayload(token: string): JWTPayload {
    const parts = token.split(".")
    if (parts.length !== 3) {
      throw new Error("Invalid JWT format")
    }

    try {
      const [, payload] = parts
      const base64 = payload.replace(/-/g, "+").replace(/_/g, "/")
      const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4)
      const decoded = Buffer.from(padded, "base64").toString("utf8")
      return JSON.parse(decoded)
    } catch (error) {
      throw new Error(`Failed to parse JWT payload: ${error}`)
    }
  }
}

class SKTokenValidator implements TokenValidator {
  getExpiration(_token: string): Date | null {
    return null
  }

  isExpired(_token: string): boolean {
    return false
  }

  validate(token: string): boolean {
    return token.startsWith("sk-")
  }
}

export class SecretService {
  private readonly TOKEN_KEY = "packy-usage.apiToken"
  private readonly TOKEN_TYPE_KEY = "packy-usage.tokenType"

  private validators: Map<TokenType, TokenValidator> = new Map([
    [TokenType.API_KEY, new SKTokenValidator()],
    [TokenType.JWT, new JWTValidator()]
  ])

  constructor(private context: vscode.ExtensionContext) {}

  async deleteToken(): Promise<void> {
    await this.context.secrets.delete(this.TOKEN_KEY)
    await this.context.globalState.update(this.TOKEN_TYPE_KEY, undefined)
  }

  async getToken(): Promise<string | undefined> {
    const token = await this.context.secrets.get(this.TOKEN_KEY)
    const tokenType = this.context.globalState.get<TokenType>(
      this.TOKEN_TYPE_KEY
    )

    if (!token) {
      return undefined
    }

    // 如果没有tokenType，尝试检测（兼容旧版本）
    let actualTokenType = tokenType
    if (!actualTokenType) {
      actualTokenType = this.detectTokenType(token)
      if (actualTokenType) {
        await this.context.globalState.update(
          this.TOKEN_TYPE_KEY,
          actualTokenType
        )
      }
    }

    if (!actualTokenType) {
      return undefined
    }

    const validator = this.validators.get(actualTokenType)
    if (validator && validator.isExpired(token)) {
      await this.deleteToken()
      vscode.window
        .showWarningMessage("Token已过期，请重新配置", "立即配置")
        .then((choice) => {
          if (choice === "立即配置") {
            vscode.commands.executeCommand("packy-usage.setToken")
          }
        })
      return undefined
    }

    return token
  }

  /**
   * 获取Token的过期时间（用于调试）
   */
  getTokenExpiration(token: string): Date | null {
    const tokenType = this.detectTokenType(token)
    if (!tokenType) {
      return null
    }
    const validator = this.validators.get(tokenType)
    return validator ? validator.getExpiration(token) : null
  }

  async getTokenType(): Promise<TokenType | undefined> {
    return this.context.globalState.get<TokenType>(this.TOKEN_TYPE_KEY)
  }

  onDidChange(
    listener: (e: vscode.SecretStorageChangeEvent) => void
  ): vscode.Disposable {
    return this.context.secrets.onDidChange(listener)
  }

  async setToken(token: string): Promise<void> {
    const tokenType = this.detectTokenType(token)
    if (!tokenType) {
      throw new Error(
        "无法识别Token类型，请提供有效的API Token (sk-开头) 或 JWT Token"
      )
    }

    const validator = this.validators.get(tokenType)!
    if (!validator.validate(token)) {
      throw new Error(`无效的${tokenType} Token格式`)
    }

    if (validator.isExpired(token)) {
      throw new Error("Token已过期")
    }

    await this.context.secrets.store(this.TOKEN_KEY, token)
    await this.context.globalState.update(this.TOKEN_TYPE_KEY, tokenType)
  }

  private detectTokenType(token: string): TokenType | undefined {
    if (token.startsWith("sk-")) {
      return TokenType.API_KEY
    }
    if (token.split(".").length === 3) {
      return TokenType.JWT
    }
    return undefined
  }
}
