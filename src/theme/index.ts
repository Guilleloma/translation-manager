import { extendTheme, type ThemeConfig } from '@chakra-ui/react';

// Configuración del tema de Chakra UI
const config: ThemeConfig = {
  initialColorMode: 'light',
  useSystemColorMode: false,
};

// Extender el tema por defecto con configuraciones personalizadas
const theme = extendTheme({
  config,
  styles: {
    global: {
      body: {
        bg: 'gray.50',
        color: 'gray.800',
      },
    },
  },
  colors: {
    brand: {
      50: '#e6f7ff',
      100: '#b3e0ff',
      200: '#80caff',
      300: '#4db3ff',
      400: '#1a9cff',
      500: '#0080ff', // Color principal
      600: '#0066cc',
      700: '#004d99',
      800: '#003366',
      900: '#001a33',
    },
  },
  components: {
    Button: {
      baseStyle: {
        fontWeight: 'semibold',
        borderRadius: 'md',
      },
      defaultProps: {
        colorScheme: 'brand',
      },
    },
  },
});

export default theme;
