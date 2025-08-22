import * as assert from "assert"

import { ApiResponse } from "../models/budget.model"
import { ApiService } from "../services/api.service"

suite("Opus Model Tests", () => {
  test("ApiService should handle opus_enabled field", () => {
    // Mock dependencies
    const mockSecretService = {} as any
    const mockConfigService = {} as any

    const apiService = new ApiService(mockSecretService, mockConfigService)

    // Test with opus enabled
    const apiResponseEnabled: ApiResponse = {
      daily_budget_usd: 100,
      daily_spent_usd: 50,
      monthly_budget_usd: 1000,
      monthly_spent_usd: 500,
      opus_enabled: true
    }

    const transformedDataEnabled = (apiService as any).transformToBudgetData(
      apiResponseEnabled
    )
    assert.strictEqual(transformedDataEnabled.opus.enabled, true)

    // Test with opus disabled
    const apiResponseDisabled: ApiResponse = {
      daily_budget_usd: 100,
      daily_spent_usd: 50,
      monthly_budget_usd: 1000,
      monthly_spent_usd: 500,
      opus_enabled: false
    }

    const transformedDataDisabled = (apiService as any).transformToBudgetData(
      apiResponseDisabled
    )
    assert.strictEqual(transformedDataDisabled.opus.enabled, false)

    // Test with opus field missing (should default to false)
    const apiResponseMissing: ApiResponse = {
      daily_budget_usd: 100,
      daily_spent_usd: 50,
      monthly_budget_usd: 1000,
      monthly_spent_usd: 500
    }

    const transformedDataMissing = (apiService as any).transformToBudgetData(
      apiResponseMissing
    )
    assert.strictEqual(transformedDataMissing.opus.enabled, false)
  })
})
