import { describe, it, expect } from 'vitest';
import { SUPPORTED_DEVICES_DATABASE } from '../data/supportedDevicesData.ts';

describe('SupportedDevicesDatabase Autocomplete filtering', () => {
  it('contains supported devices database records', () => {
    expect(SUPPORTED_DEVICES_DATABASE.length).toBeGreaterThan(0);
  });

  it('filters devices by query string matching model name or board ID', () => {
    const query = '15 pro';
    const matches = SUPPORTED_DEVICES_DATABASE.filter(d => 
      d.modelName.toLowerCase().includes(query) ||
      d.boardId.toLowerCase().includes(query)
    );

    expect(matches.length).toBeGreaterThan(0);
    expect(matches.some(m => m.modelName.includes('iPhone 15 Pro'))).toBe(true);
  });

  it('filters devices by model number e.g. A2849 or SM-S928B', () => {
    const query = 'a2849';
    const matches = SUPPORTED_DEVICES_DATABASE.filter(d => 
      d.modelNumbers.some(num => num.toLowerCase().includes(query))
    );

    expect(matches.length).toBe(1);
    expect(matches[0].modelName).toBe('iPhone 15 Pro Max');
  });
});
