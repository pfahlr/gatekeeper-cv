import { describe, it, expect, beforeEach } from 'vitest';
import { loadSpoofHeadersConfig } from '../../src/config/load-spoof-headers-config.js';
import { writeFile, unlink, mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

const testConfigPath = join(tmpdir(), 'test-spoof-headers.config.json');

describe('loadSpoofHeadersConfig', () => {
  const validConfig = {
    enabled: true,
    headers: {
      'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64; rv:134.0) Gecko/20100101 Firefox/134.0',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.5',
      'Connection': 'keep-alive',
      'DNT': '1',
      'Priority': 'u=0, i',
      'Sec-Fetch-Dest': 'document',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Site': 'same-origin',
      'Sec-GPC': '1',
      'Upgrade-Insecure-Requests': '1',
    },
    notes: 'Test configuration',
  };

  beforeEach(async () => {
    try {
      await unlink(testConfigPath);
    } catch {
      // File doesn't exist, ignore
    }
  });

  it('should load valid config file', async () => {
    await writeFile(testConfigPath, JSON.stringify(validConfig, null, 2));

    const config = await loadSpoofHeadersConfig(testConfigPath);

    expect(config.enabled).toBe(true);
    expect(config.headers).toEqual(validConfig.headers);
    expect(config.notes).toBe('Test configuration');
  });

  it('should use default enabled=true when not specified', async () => {
    const configWithoutEnabled = {
      headers: {
        'User-Agent': 'Test',
      },
    };
    await writeFile(testConfigPath, JSON.stringify(configWithoutEnabled, null, 2));

    const config = await loadSpoofHeadersConfig(testConfigPath);

    expect(config.enabled).toBe(true);
    expect(config.headers['User-Agent']).toBe('Test');
  });

  it('should return disabled config when file does not exist', async () => {
    const config = await loadSpoofHeadersConfig(testConfigPath);

    expect(config.enabled).toBe(false);
    expect(config.headers).toEqual({});
  });

  it('should parse enabled=false', async () => {
    const disabledConfig = {
      enabled: false,
      headers: {
        'User-Agent': 'Test',
      },
    };
    await writeFile(testConfigPath, JSON.stringify(disabledConfig, null, 2));

    const config = await loadSpoofHeadersConfig(testConfigPath);

    expect(config.enabled).toBe(false);
  });

  it('should handle empty headers object', async () => {
    const emptyHeadersConfig = {
      enabled: true,
      headers: {},
    };
    await writeFile(testConfigPath, JSON.stringify(emptyHeadersConfig, null, 2));

    const config = await loadSpoofHeadersConfig(testConfigPath);

    expect(config.enabled).toBe(true);
    expect(config.headers).toEqual({});
  });

  it('should reject invalid JSON', async () => {
    await writeFile(testConfigPath, 'invalid json{');

    await expect(loadSpoofHeadersConfig(testConfigPath)).rejects.toThrow();
  });

  it('should allow extra fields in headers', async () => {
    const configWithExtraHeaders = {
      enabled: true,
      headers: {
        'User-Agent': 'Test',
        'X-Custom-Header': 'custom-value',
        'Another-Header': 'another-value',
      },
    };
    await writeFile(testConfigPath, JSON.stringify(configWithExtraHeaders, null, 2));

    const config = await loadSpoofHeadersConfig(testConfigPath);

    expect(config.headers['X-Custom-Header']).toBe('custom-value');
    expect(config.headers['Another-Header']).toBe('another-value');
  });

  it('should omit notes field when not provided', async () => {
    const configWithoutNotes = {
      enabled: true,
      headers: {
        'User-Agent': 'Test',
      },
    };
    await writeFile(testConfigPath, JSON.stringify(configWithoutNotes, null, 2));

    const config = await loadSpoofHeadersConfig(testConfigPath);

    expect(config.notes).toBeUndefined();
  });
});
