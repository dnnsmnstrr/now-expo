const tintColorLight = '#007AFF';
const tintColorDark = '#0A84FF';

export const Colors = {
  light: {
    text: '#1a1a1a',
    secondaryText: '#4a4a4a',
    background: '#f8f9fa',
    cardBackground: '#fff',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
    border: '#e5e5e5',
    error: '#dc3545',
    success: '#2ea44f',
    modalOverlay: 'rgba(0, 0, 0, 0.5)',
    inputBackground: '#fff',
    codeBackground: '#f0f0f0',
    blockquoteBorder: '#e0e0e0',
    refreshControl: '#007AFF',
    selectedItem: '#f0f7ff',
  },
  dark: {
    text: '#f8f9fa',
    secondaryText: '#a0a0a0',
    background: '#121212',
    cardBackground: '#1e1e1e',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
    border: '#2c2c2e',
    error: '#ff453a',
    success: '#32d74b',
    modalOverlay: 'rgba(0, 0, 0, 0.7)',
    inputBackground: '#2c2c2e',
    codeBackground: '#2c2c2e',
    blockquoteBorder: '#3a3a3c',
    refreshControl: '#0A84FF',
    selectedItem: '#1a2b3c',
  },
};

export type Theme = typeof Colors.light;
