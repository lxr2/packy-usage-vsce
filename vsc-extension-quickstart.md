# Welcome to Packy Usage VS Code Extension

## Overview

This VS Code extension provides real-time budget monitoring for your Packy Usage API. It displays daily and monthly budget information directly in your VS Code sidebar, helping you keep track of your API spending while you work.

## What's in the folder

* This folder contains all of the files necessary for your extension.
* `package.json` - this is the manifest file in which you declare your extension and command.
  * The plugin registers multiple commands including token configuration, data refresh, and setup guide.
  * Defines view containers and custom tree views for the sidebar panel.
  * Includes configuration properties for API token and endpoint settings.
* `src/extension.ts` - this is the main file where you provide the implementation of your commands and tree data provider.
  * The file exports the `activate` function, which is called when your extension is activated.
  * Implements the `UsageExplorerProvider` class that manages the tree view and API data fetching.
  * Includes automatic polling functionality that updates budget data every 30 seconds.
  * Provides user-friendly setup guidance for first-time users.

## Core Features

### Budget Monitoring
- **Daily Budget Tracking**: Shows daily budget usage, total budget, and percentage consumed
- **Monthly Budget Tracking**: Displays monthly budget metrics with real-time updates
- **Visual Indicators**: Color-coded icons based on usage percentage (green for low usage, yellow for moderate, red for high)
- **Automatic Refresh**: Background polling every 30 seconds to keep data current

### User Experience
- **Smart Setup Guide**: Automatic detection of configuration status with helpful prompts
- **One-Click Configuration**: Easy API token setup through secure input dialogs
- **Error Handling**: Graceful error management with user-friendly messages
- **Responsive Design**: Clean, VS Code-native interface that integrates seamlessly

### Technical Implementation
- **TypeScript**: Fully typed implementation for better development experience
- **API Integration**: Secure communication with Packy Usage API using Bearer tokens and cookies
- **State Management**: Intelligent data state tracking and UI updates
- **Resource Management**: Proper cleanup of timers and resources when extension is deactivated

## Get up and running straight away

* Press `F5` to open a new window with your extension loaded.
* The extension will automatically appear in the Activity Bar with a package icon.
* If no API token is configured, you'll see a notification guiding you through setup.
* Configure your API token using the command palette (`Ctrl+Shift+P` or `Cmd+Shift+P`) and search for "Set API Token".
* Once configured, budget data will automatically load and refresh every 30 seconds.

## Configuration

### API Token Setup
1. Open the command palette (`Ctrl+Shift+P` or `Cmd+Shift+P`)
2. Type "Set API Token" and select the command
3. Enter your Packy Usage API token in the secure input dialog
4. The extension will automatically fetch and display your budget data

### Settings
The extension provides the following configuration options in VS Code settings:
- `packy-usage.apiToken`: Your API token for accessing budget data
- `packy-usage.apiEndpoint`: The API endpoint URL (defaults to Packy Usage API)

## Usage

### Sidebar Panel
The extension adds a "Packy Usage" panel to your VS Code sidebar containing:
- **Daily Budget Section**: Shows today's usage, total budget, and percentage
- **Monthly Budget Section**: Displays current month's metrics
- **Configuration Section**: Quick access to token status and API settings
- **Refresh Button**: Manual refresh option in the panel title bar

### Commands
Available commands through the command palette:
- `Packy Usage: Set API Token` - Configure your API authentication
- `Packy Usage: Refresh Budget Data` - Manually refresh budget information
- `Packy Usage: Show Setup Guide` - Display the initial configuration guide

## Make changes

* You can relaunch the extension from the debug toolbar after changing code in `src/extension.ts`.
* You can also reload (`Ctrl+R` or `Cmd+R` on Mac) the VS Code window with your extension to load your changes.
* The TypeScript compiler will catch type errors during development.
* Use `npm run compile` to build the extension manually.

## Development Details

### Architecture
The extension follows a clean architecture pattern:
- **Data Layer**: API communication and data fetching logic
- **Presentation Layer**: Tree view implementation and UI components  
- **Service Layer**: Background polling and state management
- **Configuration Layer**: Settings management and user preferences

### Code Structure
```
src/
├── extension.ts          # Main extension entry point
├── interfaces/           # TypeScript type definitions
├── services/            # Business logic and API services  
├── providers/           # Tree data providers
└── utils/               # Helper functions and utilities
```

### API Integration
The extension communicates with the Packy Usage API using:
- **Authentication**: Bearer token in Authorization header
- **Session Management**: Token also sent as cookie for compatibility
- **Error Handling**: Comprehensive error catching and user notification
- **Rate Limiting**: Respectful 30-second polling interval

### Performance Considerations
- **Efficient Polling**: Only polls when token is configured
- **Memory Management**: Proper cleanup of timers and event listeners
- **Lazy Loading**: Data is fetched on-demand and cached appropriately
- **Background Processing**: Non-blocking API calls with progress indicators

## Explore the API

* You can open the full set of VS Code API when you open the file `node_modules/@types/vscode/index.d.ts`.
* Review the Packy Usage API documentation for endpoint details and response formats.
* The extension uses the `/api/backend/users/info` endpoint for budget data retrieval.

## Testing

### Run tests
* Install the [Extension Test Runner](https://marketplace.visualstudio.com/items?itemName=ms-vscode.extension-test-runner)
* Run the "watch" task via the **Tasks: Run Task** command. Make sure this is running, or tests might not be discovered.
* Open the Testing view from the activity bar and click the "Run Test" button, or use the hotkey `Ctrl/Cmd + ; A`
* See the output of the test result in the Test Results view.
* Make changes to `src/test/extension.test.ts` or create new test files inside the `test` folder.
  * The provided test runner will only consider files matching the name pattern `**.test.ts`.
  * You can create folders inside the `test` folder to structure your tests any way you want.

### Testing Strategies
- **Unit Tests**: Test individual functions and classes in isolation
- **Integration Tests**: Verify API communication and data flow
- **UI Tests**: Validate tree view rendering and user interactions
- **Configuration Tests**: Ensure settings management works correctly

## Troubleshooting

### Common Issues
1. **No data displayed**: Verify API token is configured correctly
2. **Authentication errors**: Check token validity and permissions
3. **Network issues**: Ensure internet connection and API endpoint accessibility
4. **Performance issues**: Monitor background polling frequency and resource usage

### Debug Mode
- Enable debug mode by setting `"packy-usage.debug": true` in settings
- Check the Developer Console for detailed logging information
- Use breakpoints in `src/extension.ts` to step through code execution
- Monitor network requests in the VS Code developer tools

### Support
For additional support and bug reports:
- Check the extension's GitHub repository for known issues
- Review the VS Code extension development documentation
- Consult the Packy Usage API documentation for endpoint details

## Go further

* [Follow UX guidelines](https://code.visualstudio.com/api/ux-guidelines/overview) to create extensions that seamlessly integrate with VS Code's native interface and patterns.
* Reduce the extension size and improve the startup time by [bundling your extension](https://code.visualstudio.com/api/working-with-extensions/bundling-extension).
* [Publish your extension](https://code.visualstudio.com/api/working-with-extensions/publishing-extension) on the VS Code extension marketplace.
* Automate builds by setting up [Continuous Integration](https://code.visualstudio.com/api/working-with-extensions/continuous-integration).
* Integrate to the [report issue](https://code.visualstudio.com/api/get-started/wrapping-up#issue-reporting) flow to get issue and feature requests reported by users.

### Extension Enhancement Ideas
- **Multiple Account Support**: Allow switching between different Packy Usage accounts
- **Historical Data**: Display usage trends and historical budget information
- **Notifications**: Alert users when approaching budget limits
- **Export Functionality**: Allow exporting budget data to CSV or other formats
- **Custom Themes**: Support for different color schemes and visual styles
- **Keyboard Shortcuts**: Add configurable hotkeys for common actions
- **Status Bar Integration**: Show current budget status in the VS Code status bar
- **Workspace Integration**: Save configuration per workspace/project
- **Advanced Filtering**: Filter budget data by date ranges or categories
- **Performance Metrics**: Display API response times and extension performance data

### Distribution and Deployment
When ready to share your extension:
1. Package using `vsce package` command
2. Test thoroughly on different platforms and VS Code versions
3. Prepare marketplace assets (icons, screenshots, documentation)
4. Submit to VS Code marketplace for review and publication
5. Set up automated CI/CD pipeline for future updates

Remember that successful VS Code extensions focus on solving real developer problems while maintaining excellent performance and user experience standards.