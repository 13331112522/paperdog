# Chrome DevTools MCP Integration

This document explains how to use Chrome DevTools MCP with the PaperDog blog application for development and debugging.

## Setup

The Chrome DevTools MCP configuration has been added to `.claude/mcp-chrome-devtools.json`. This enables Claude to interact with Chrome DevTools for debugging purposes.

## Available Actions

1. **Launch** - Start Chrome DevTools for the application
2. **Inspect** - Inspect specific elements or pages
3. **Screenshot** - Take screenshots of the application
4. **Network** - Monitor network activity
5. **Console** - Access browser console for debugging

## Usage Examples

To use Chrome DevTools MCP with PaperDog:

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Use Claude to launch Chrome DevTools:
   ```javascript
   mcp__chrome_devtools({action: "launch", url: "http://localhost:8787", device: "desktop"})
   ```

3. For mobile testing:
   ```javascript
   mcp__chrome_devtools({action: "launch", url: "http://localhost:8787", device: "mobile"})
   ```

## Debugging Workflow

1. Launch the application with `npm run dev`
2. Use Chrome DevTools MCP to inspect the UI and functionality
3. Monitor network requests for paper fetching
4. Check console logs for any errors
5. Take screenshots for documentation or issue reporting

## Permissions

The MCP tool has been configured with appropriate permissions in the Claude settings:
- Browser access enabled
- Network monitoring enabled
- Filesystem access disabled for security