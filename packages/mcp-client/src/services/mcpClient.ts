import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import type { CallToolResult, ListToolsResult } from '@modelcontextprotocol/sdk/types.js';

export class MCPClient {
  private client: Client | null = null;
  private transport: StreamableHTTPClientTransport | null = null;
  private serverUrl: string;

  constructor(serverUrl: string = 'http://localhost:3000/mcp') {
    this.serverUrl = serverUrl;
  }

  async initialize(): Promise<void> {
    if (this.client) {
      return;
    }

    this.transport = new StreamableHTTPClientTransport(new URL(this.serverUrl));

    this.client = new Client(
      {
        name: 'mcp-react-client',
        version: '1.0.0',
      },
      {
        capabilities: {},
      }
    );

    await this.client.connect(this.transport);
    console.log('MCP Client initialized');
  }

  async listTools(): Promise<ListToolsResult> {
    if (!this.client) {
      throw new Error('Client not initialized. Call initialize() first.');
    }

    const result = await this.client.listTools();
    return result;
  }

  async callTool(name: string, args?: Record<string, unknown>): Promise<CallToolResult> {
    if (!this.client) {
      throw new Error('Client not initialized. Call initialize() first.');
    }

    const result = await this.client.callTool({
      name,
      arguments: args || {},
    });
    return result as CallToolResult;
  }

  async close(): Promise<void> {
    if (this.client) {
      await this.client.close();
      this.client = null;
      this.transport = null;
    }
  }
}

export const mcpClient = new MCPClient();

