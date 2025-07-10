import { ErrorHandler } from "../utils/error-handler"
import { ApiService } from "./api.service"
import { DataService } from "./data.service"
import { StatusBarService } from "./status-bar.service"

export class PollingService {
  private readonly POLLING_INTERVAL = 30000 // 30 seconds
  private pollingTimer: NodeJS.Timeout | null = null

  constructor(
    private apiService: ApiService,
    private dataService: DataService,
    private statusBarService: StatusBarService
  ) {}

  dispose(): void {
    this.stop()
  }

  start(): void {
    this.stop()
    this.pollingTimer = setInterval(async () => {
      try {
        // Skip fetch if cache is still valid
        if (this.dataService.isCacheValid) {
          return
        }

        const data = await this.apiService.fetchBudgetData()
        if (data) {
          this.dataService.updateData(data)
        }
      } catch (error) {
        ErrorHandler.handle(error as Error)
      }
    }, this.POLLING_INTERVAL)
  }

  stop(): void {
    if (this.pollingTimer) {
      clearInterval(this.pollingTimer)
      this.pollingTimer = null
    }
  }
}
