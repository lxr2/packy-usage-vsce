import * as vscode from "vscode"

export class SecretService {
  private readonly TOKEN_KEY = "packy-usage.apiToken"

  constructor(private context: vscode.ExtensionContext) {}

  async deleteToken(): Promise<void> {
    await this.context.secrets.delete(this.TOKEN_KEY)
  }

  async getToken(): Promise<string | undefined> {
    return await this.context.secrets.get(this.TOKEN_KEY)
  }

  onDidChange(
    listener: (e: vscode.SecretStorageChangeEvent) => void
  ): vscode.Disposable {
    return this.context.secrets.onDidChange(listener)
  }

  async setToken(token: string): Promise<void> {
    await this.context.secrets.store(this.TOKEN_KEY, token)
  }
}
