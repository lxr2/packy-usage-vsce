import * as vscode from "vscode"

import { BudgetData } from "../models/budget.model"

export class DataService {
  get cacheAge(): number {
    return Date.now() - this.lastFetchTime
  }
  get currentData(): BudgetData {
    return this.budgetData
  }
  get isCacheValid(): boolean {
    return Date.now() - this.lastFetchTime < this.CACHE_DURATION
  }
  get isDataLoaded(): boolean {
    return this.hasDataLoaded
  }
  get onDidUpdateData(): vscode.Event<BudgetData> {
    return this.onDataUpdated.event
  }

  private budgetData: BudgetData = {
    daily: {
      percentage: 0,
      total: 0,
      used: 0
    },
    monthly: {
      percentage: 0,
      total: 0,
      used: 0
    }
  }

  private readonly CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

  private hasDataLoaded: boolean = false

  private lastFetchTime: number = 0

  private onDataUpdated: vscode.EventEmitter<BudgetData>

  constructor() {
    this.onDataUpdated = new vscode.EventEmitter<BudgetData>()
  }

  dispose(): void {
    this.onDataUpdated.dispose()
  }

  getPercentageIcon(percentage: number): string {
    if (percentage >= 90) {
      return "$(error)"
    }
    if (percentage >= 75) {
      return "$(warning)"
    }
    if (percentage >= 50) {
      return "$(info)"
    }
    return "$(check)"
  }

  invalidateCache(): void {
    this.lastFetchTime = 0
  }

  updateData(data: BudgetData): void {
    this.budgetData = data
    this.hasDataLoaded = true
    this.lastFetchTime = Date.now()
    this.onDataUpdated.fire(data)
  }
}
