import jquery from 'jquery';
global.$ = jquery;
global.jQuery = jquery;
global.Microsoft = {
  Dynamic365: {
    Portal: {
      User: {
        userName: 'c4ddd57feb4a486496577fd3f42384be@idir',
        contactId: 'e3e89cb2-1f4c-ee11-be6f-002248ae080f',
      },
      version: '9.6.3.12',
      type: 'CDSStarterPortal',
      id: '86443d74-997e-411d-a6b0-bcdbb5767751',
      geo: 'CAN',
      tenant: '6fdb5200-3d0d-4a8a-b036-d3685e359adc',
      correlationId: '713e22ca-99d1-42ab-8a20-09729bf86cfb',
      isTelemetryEnabled: 'True',
      InstrumentationSettings: {
        instrumentationKey:
          '197418c5cb8c4426b201f9db2e87b914-87887378-2790-49b0-9295-51f43b6204b1-7172',
        collectorEndpoint:
          'https://us-mobile.events.data.microsoft.com/OneCollector/1.0/',
      },
      timerProfileForBatching: 'NEAR_REAL_TIME',
      dynamics365PortalAnalytics:
        'iaG1DcfMqTC3jzeR1-dytmEHWD8EXbjUeHhY2KaKkHlqe8dxgrhQI7ISj2Vj5e3O6GMbs2pFNZ9rsmBhGuP9NDgn2WyuwI7AlTYmPHoLXd8Grmlpp2aU8V1qIPZV5zqdQQQP4szozyciCiyl0woskA2',
    },
  },
};

import '../src/assets/css/bootstrap.css';
import '../src/assets/css/shoelace.css';

/** @type { import('@storybook/web-components').Preview } */
const preview = {
  parameters: {
    actions: { argTypesRegex: '^on.*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
};

export default preview;
