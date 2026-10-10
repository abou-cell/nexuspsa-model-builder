export type IcGroupLabel =
  | 'Field Sensors & Instruments'
  | 'Control & Processing'
  | 'HMI / Operator / Engineering'
  | 'Communication & Interfaces'
  | 'Final Elements & Actuators'
  | 'Power & Support';

export interface IcSymbolDefinition {
  category: string;
  name: string;
  description: string;
  rating: string;
  kbClass: string;
  groupLabel: IcGroupLabel;
  width: number;
  height: number;
  source: string;
  symbolCode?: string;
}

export const IC_SYMBOLS: readonly IcSymbolDefinition[] = [
  { category: 'Temperature Sensor', name: 'Temperature Sensor', description: 'Measures process temperature', rating: 'RTD / TC · 4–20 mA', kbClass: 'IC.TEMPERATURE_SENSOR', groupLabel: 'Field Sensors & Instruments', width: 72, height: 72, source: './ic/instrument-bubble.svg?v=1', symbolCode: 'T' },
  { category: 'Pressure Sensor', name: 'Pressure Sensor', description: 'Measures process pressure', rating: '0–250 bar · 4–20 mA', kbClass: 'IC.PRESSURE_SENSOR', groupLabel: 'Field Sensors & Instruments', width: 72, height: 72, source: './ic/instrument-bubble.svg?v=1', symbolCode: 'P' },
  { category: 'Flow Sensor', name: 'Flow Sensor', description: 'Measures process flow rate', rating: 'FT · 4–20 mA / HART', kbClass: 'IC.FLOW_SENSOR', groupLabel: 'Field Sensors & Instruments', width: 88, height: 62, source: './ic/flow-sensor.svg?v=1', symbolCode: 'F' },
  { category: 'Level Sensor', name: 'Level Sensor', description: 'Measures level in tanks or vessels', rating: 'LT · 4–20 mA / HART', kbClass: 'IC.LEVEL_SENSOR', groupLabel: 'Field Sensors & Instruments', width: 72, height: 72, source: './ic/level-sensor.svg?v=1', symbolCode: 'L' },
  { category: 'Position / Limit Switch', name: 'Position / Limit Switch', description: 'Detects mechanical position open / closed', rating: 'DI · dry contact', kbClass: 'IC.LIMIT_SWITCH', groupLabel: 'Field Sensors & Instruments', width: 82, height: 62, source: './ic/limit-switch.svg?v=1' },
  { category: 'Proximity Sensor', name: 'Proximity Sensor', description: 'Detects presence without physical contact', rating: '24 VDC · DI', kbClass: 'IC.PROXIMITY_SENSOR', groupLabel: 'Field Sensors & Instruments', width: 84, height: 58, source: './ic/proximity-sensor.svg?v=1' },
  { category: 'Smart Transmitter', name: 'Smart Transmitter', description: 'Field transmitter with digital communication', rating: '4–20 mA + HART', kbClass: 'IC.SMART_TRANSMITTER', groupLabel: 'Field Sensors & Instruments', width: 72, height: 72, source: './ic/smart-transmitter.svg?v=1' },
  { category: 'Indicator / Local Gauge', name: 'Indicator / Local Gauge', description: 'Local indication of process value', rating: 'Local indication', kbClass: 'IC.LOCAL_INDICATOR', groupLabel: 'Field Sensors & Instruments', width: 72, height: 72, source: './ic/local-gauge.svg?v=1' },
  { category: 'PLC / Control Cabinet', name: 'PLC / Control Cabinet', description: 'Programmable logic controller for process control', rating: 'CPU + redundant I/O', kbClass: 'IC.PLC_CONTROL_CABINET', groupLabel: 'Control & Processing', width: 92, height: 68, source: './ic/control-cabinet.svg?v=1', symbolCode: 'PLC' },
  { category: 'Safety PLC / Protection Cabinet', name: 'Safety PLC / Protection Cabinet', description: 'Safety instrumented / protection controller', rating: 'Redundant safety logic', kbClass: 'IC.SAFETY_PLC', groupLabel: 'Control & Processing', width: 92, height: 68, source: './ic/safety-cabinet.svg?v=1', symbolCode: 'SIS' },
  { category: 'I/O Module', name: 'I/O Module', description: 'Digital and analog input / output module', rating: 'AI / AO / DI / DO', kbClass: 'IC.IO_MODULE', groupLabel: 'Control & Processing', width: 88, height: 62, source: './ic/io-module.svg?v=1', symbolCode: 'I/O' },
  { category: 'Remote I/O Panel', name: 'Remote I/O Panel', description: 'Distributed I/O in field or remote building', rating: 'Remote I/O rack', kbClass: 'IC.REMOTE_IO_PANEL', groupLabel: 'Control & Processing', width: 90, height: 64, source: './ic/io-module.svg?v=1', symbolCode: 'RIO' },
  { category: 'Logic / PID Controller Block', name: 'Logic / PID Controller Block', description: 'Control, logic or PID function block', rating: 'PID / logic', kbClass: 'IC.PID_LOGIC_BLOCK', groupLabel: 'Control & Processing', width: 82, height: 58, source: './ic/pid-block.svg?v=1' },
  { category: 'Signal Conditioner / Isolator', name: 'Signal Conditioner / Isolator', description: 'Signal conversion, isolation or conditioning', rating: 'AI / AO isolation', kbClass: 'IC.SIGNAL_CONDITIONER', groupLabel: 'Control & Processing', width: 82, height: 58, source: './ic/signal-conditioner.svg?v=1' },
  { category: 'Interposing Relay', name: 'Interposing Relay', description: 'Interface relay for signal isolation', rating: '24 VDC coil', kbClass: 'IC.INTERPOSING_RELAY', groupLabel: 'Control & Processing', width: 82, height: 58, source: './ic/relay.svg?v=1' },
  { category: 'Sequence / Function Block', name: 'Sequence / Function Block', description: 'Sequential control function / SFC', rating: 'SFC / sequence', kbClass: 'IC.SEQUENCE_BLOCK', groupLabel: 'Control & Processing', width: 72, height: 66, source: './ic/sequence-block.svg?v=1' },
  { category: 'HMI Terminal', name: 'HMI Terminal', description: 'Operator workstation for monitoring and control', rating: 'Operator HMI', kbClass: 'IC.HMI_TERMINAL', groupLabel: 'HMI / Operator / Engineering', width: 90, height: 68, source: './ic/hmi-terminal.svg?v=1' },
  { category: 'Engineering Workstation', name: 'Engineering Workstation', description: 'Configuration and maintenance station', rating: 'Engineering station', kbClass: 'IC.ENGINEERING_WORKSTATION', groupLabel: 'HMI / Operator / Engineering', width: 96, height: 68, source: './ic/engineering-workstation.svg?v=1' },
  { category: 'Historian / Server', name: 'Historian / Server', description: 'Data acquisition and historization server', rating: 'Server / historian', kbClass: 'IC.HISTORIAN_SERVER', groupLabel: 'HMI / Operator / Engineering', width: 76, height: 68, source: './ic/server.svg?v=1' },
  { category: 'Alarm / Annunciator Panel', name: 'Alarm / Annunciator Panel', description: 'Alarm indication and signalling panel', rating: 'Alarm panel', kbClass: 'IC.ANNUNCIATOR_PANEL', groupLabel: 'HMI / Operator / Engineering', width: 88, height: 64, source: './ic/annunciator.svg?v=1' },
  { category: 'Local Control Panel', name: 'Local Control Panel', description: 'Local operation and control interface', rating: 'Local panel', kbClass: 'IC.LOCAL_CONTROL_PANEL', groupLabel: 'HMI / Operator / Engineering', width: 84, height: 60, source: './ic/local-panel.svg?v=1' },
  { category: 'Network Switch', name: 'Network Switch', description: 'Industrial Ethernet switch for plant networks', rating: 'Ethernet · managed', kbClass: 'IC.NETWORK_SWITCH', groupLabel: 'Communication & Interfaces', width: 90, height: 54, source: './ic/network-switch.svg?v=1' },
  { category: 'Gateway / Protocol Converter', name: 'Gateway / Protocol Converter', description: 'Protocol conversion between I&C networks', rating: 'OPC UA / Modbus TCP', kbClass: 'IC.PROTOCOL_GATEWAY', groupLabel: 'Communication & Interfaces', width: 90, height: 60, source: './ic/gateway.svg?v=1' },
  { category: 'Redundant Communication Link', name: 'Redundant Communication Link', description: 'Dual redundant communication channel', rating: 'Channel A + B', kbClass: 'IC.REDUNDANT_COMM_LINK', groupLabel: 'Communication & Interfaces', width: 92, height: 46, source: './ic/comm-link.svg?v=1' },
  { category: 'Hardwired Signal Link', name: 'Hardwired Signal Link', description: 'Hardwired analog or digital signal', rating: '4–20 mA / DI / DO', kbClass: 'IC.HARDWIRED_LINK', groupLabel: 'Communication & Interfaces', width: 92, height: 44, source: './ic/hardwired-link.svg?v=1' },
  { category: 'Fiber / Ethernet Communication', name: 'Fiber / Ethernet Communication', description: 'Fiber optic or Ethernet communication link', rating: 'Fiber / Ethernet', kbClass: 'IC.FIBER_ETHERNET_LINK', groupLabel: 'Communication & Interfaces', width: 92, height: 44, source: './ic/fiber-link.svg?v=1' },
  { category: 'Junction / Marshalling Cabinet', name: 'Junction / Marshalling Cabinet', description: 'Signal marshalling and junction cabinet', rating: 'Field termination', kbClass: 'IC.MARSHALLING_CABINET', groupLabel: 'Communication & Interfaces', width: 84, height: 66, source: './ic/marshalling-cabinet.svg?v=1' },
  { category: 'Motorized Valve Actuator', name: 'Motorized Valve Actuator', description: 'Motor-driven valve actuator', rating: 'MOV · open / close', kbClass: 'IC.MOTORIZED_VALVE_ACTUATOR', groupLabel: 'Final Elements & Actuators', width: 92, height: 66, source: './ic/motorized-valve-actuator.svg?v=1' },
  { category: 'Electric Motor Actuator', name: 'Electric Motor Actuator', description: 'Electric motor for damper or mechanism', rating: '400 Vac motor', kbClass: 'IC.ELECTRIC_MOTOR_ACTUATOR', groupLabel: 'Final Elements & Actuators', width: 88, height: 60, source: './ic/motor-actuator.svg?v=1' },
  { category: 'Solenoid Actuator / Solenoid Valve', name: 'Solenoid Actuator / Solenoid Valve', description: 'Solenoid-operated valve or actuator', rating: '24 VDC coil', kbClass: 'IC.SOLENOID_ACTUATOR', groupLabel: 'Final Elements & Actuators', width: 92, height: 66, source: './ic/solenoid-valve.svg?v=1' },
  { category: 'Damper Actuator', name: 'Damper Actuator', description: 'Actuator for air / gas damper', rating: '24 VDC / 230 Vac', kbClass: 'IC.DAMPER_ACTUATOR', groupLabel: 'Final Elements & Actuators', width: 88, height: 60, source: './ic/damper-actuator.svg?v=1' },
  { category: 'Positioner', name: 'Positioner', description: 'Valve positioner for modulating control', rating: '4–20 mA command', kbClass: 'IC.POSITIONER', groupLabel: 'Final Elements & Actuators', width: 82, height: 66, source: './ic/positioner.svg?v=1' },
  { category: 'Trip / Shutdown Device', name: 'Trip / Shutdown Device', description: 'Automatic trip or shutdown device', rating: 'Trip / AAR output', kbClass: 'IC.TRIP_SHUTDOWN_DEVICE', groupLabel: 'Final Elements & Actuators', width: 82, height: 62, source: './ic/trip-device.svg?v=1' },
  { category: '24 VDC Power Supply', name: '24 VDC Power Supply', description: '24 VDC power supply for I&C equipment', rating: '230 Vac → 24 Vdc', kbClass: 'IC.POWER_SUPPLY_24VDC', groupLabel: 'Power & Support', width: 76, height: 66, source: './ic/power-supply.svg?v=1' },
  { category: 'UPS / Battery-backed Supply', name: 'UPS / Battery-backed Supply', description: 'Uninterruptible supply for critical I&C systems', rating: 'UPS · backed supply', kbClass: 'IC.UPS_SUPPLY', groupLabel: 'Power & Support', width: 76, height: 66, source: './ic/ups.svg?v=1' },
  { category: 'Power Distribution Panel', name: 'Power Distribution Panel', description: 'AC / DC power distribution panel', rating: 'I&C distribution', kbClass: 'IC.POWER_DISTRIBUTION_PANEL', groupLabel: 'Power & Support', width: 86, height: 62, source: './electrical/switchboard.svg?v=2' },
  { category: 'Maintenance / Test Terminal', name: 'Maintenance / Test Terminal', description: 'Portable terminal for test and maintenance', rating: 'Maintenance station', kbClass: 'IC.MAINTENANCE_TERMINAL', groupLabel: 'Power & Support', width: 88, height: 62, source: './ic/maintenance-terminal.svg?v=1' }
];