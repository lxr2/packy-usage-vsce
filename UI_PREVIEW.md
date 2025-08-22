Packy Usage Extension - UI Preview
=====================================

Expected tree structure in the Packy Usage sidebar:

📦 Packy Usage
├── ✅ Opus Model: Enabled        (when opus_enabled: true)
│   └── [Tooltip: Shows whether the Opus model is available for your account]
├── 📅 Daily Budget               (expandable)
│   ├── Used: $5.00
│   ├── Total Budget: $10.00
│   └── Usage Rate: 50.0%
├── 📅 Monthly Budget             (expandable)  
│   ├── Used: $50.00
│   ├── Total Budget: $100.00
│   └── Usage Rate: 50.0%
└── 🔧 Configuration              (collapsible)
    ├── Token: Configured (JWT Token)
    └── API: https://www.packycode.com/api/backend/users/info

OR

📦 Packy Usage
├── ❌ Opus Model: Disabled       (when opus_enabled: false)
│   └── [Tooltip: Shows whether the Opus model is available for your account]
├── 📅 Daily Budget               (expandable)
│   ├── Used: $5.00
│   ├── Total Budget: $10.00
│   └── Usage Rate: 50.0%
├── 📅 Monthly Budget             (expandable)  
│   ├── Used: $50.00
│   ├── Total Budget: $100.00
│   └── Usage Rate: 50.0%
└── 🔧 Configuration              (collapsible)
    ├── Token: Configured (JWT Token)
    └── API: https://www.packycode.com/api/backend/users/info

Key Features:
- Opus status is shown above Daily Budget as requested
- Uses check mark (✅) icon when enabled, X mark (❌) when disabled  
- Shows localized text "Opus Model: Enabled/Disabled"
- Includes helpful tooltip explaining the feature
- Maintains all existing functionality
- Non-expandable single line item for clean display