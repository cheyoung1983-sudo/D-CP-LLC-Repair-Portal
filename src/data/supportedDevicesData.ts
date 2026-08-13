export interface BoardRepairCapability {
  id: string;
  name: string;
  tier: 'Tier 3 Micro-Soldering' | 'Tier 4 BGA Reballing' | 'Forensic Data Recovery' | 'Ultrasonic Water Recovery' | 'Port & FPC Rework';
  description: string;
  typicalSuccessRate: number; // percentage
  averageTurnaroundDays: string;
}

export interface SupportedDeviceModel {
  id: string;
  manufacturer: 'Apple' | 'Samsung' | 'Google' | 'Nintendo' | 'Sony' | 'Microsoft' | 'Valve';
  modelName: string;
  modelNumbers: string[]; // e.g. ["A2849", "A2848", "A2847"]
  boardId: string; // e.g. "820-02685"
  chipset: string; // e.g. "Apple A17 Pro"
  category: 'Smartphone' | 'Tablet' | 'Laptop' | 'Gaming Handheld' | 'Console';
  supportTier: 'Full Tier 3 & Tier 4 Supported' | 'Tier 3 Micro-Soldering Only' | 'Data Recovery & PMIC Only';
  schematicsStatus: 'Full Schematics & Boardview On File' | 'Schematics Available' | 'Reverse Engineered Pinouts';
  donorBoardStock: 'In Stock (Spokane Staging)' | 'Limited Stock (24h Staging)' | 'Special Order Donors';
  commonSymptoms: string[];
  supportedRepairs: BoardRepairCapability[];
  releaseYear: number;
  featured?: boolean;
}

export const SUPPORTED_DEVICES_DATABASE: SupportedDeviceModel[] = [
  // --- APPLE IPHONE ---
  {
    id: 'apple-iphone-15-pro-max',
    manufacturer: 'Apple',
    modelName: 'iPhone 15 Pro Max',
    modelNumbers: ['A2849', 'A3105', 'A3106', 'A3108'],
    boardId: '820-02685',
    chipset: 'Apple A17 Pro (3nm)',
    category: 'Smartphone',
    supportTier: 'Full Tier 3 & Tier 4 Supported',
    schematicsStatus: 'Full Schematics & Boardview On File',
    donorBoardStock: 'In Stock (Spokane Staging)',
    releaseYear: 2023,
    featured: true,
    commonSymptoms: [
      'No Power / 0.00A Ammeter Draw',
      'Short on VDD_MAIN / VDD_BOOST',
      'USB-C 20V Negotiation Failure (338S00838 IC)',
      'Camera FPC Connector Bent / Corrosion',
      'Liquid Damage Corrosion under CPU shield'
    ],
    supportedRepairs: [
      {
        id: 'pmic-replacement',
        name: 'Main PMIC & Sub-PMIC BGA Replacement',
        tier: 'Tier 3 Micro-Soldering',
        description: 'Removal and reballing/replacement of primary power management ICs to resolve dead board 0A draw.',
        typicalSuccessRate: 96,
        averageTurnaroundDays: '1-2 Days'
      },
      {
        id: 'usbc-controller',
        name: 'USB-C Type-C Transceiver IC Rework',
        tier: 'Tier 3 Micro-Soldering',
        description: 'Micro-soldering replacement of 338S00838 Type-C PHY chip destroyed by faulty high-voltage car chargers.',
        typicalSuccessRate: 98,
        averageTurnaroundDays: '24 Hours'
      },
      {
        id: 'data-recovery-nand',
        name: 'CPU & Encrypted NAND Pair Data Extraction',
        tier: 'Forensic Data Recovery',
        description: 'Sandwich board split, trace jump wire reconstruction, or CPU/NAND transplant to donor board for data extraction.',
        typicalSuccessRate: 92,
        averageTurnaroundDays: '2-4 Days'
      },
      {
        id: 'ultasonic-restoration',
        name: 'Ultrasonic Bath & Corrosion Remediation',
        tier: 'Ultrasonic Water Recovery',
        description: 'Multi-stage Crest ultrasonic solvent wash followed by micro-soldering corroded ceramic decoupling caps.',
        typicalSuccessRate: 91,
        averageTurnaroundDays: '1-3 Days'
      }
    ]
  },
  {
    id: 'apple-iphone-15-pro',
    manufacturer: 'Apple',
    modelName: 'iPhone 15 Pro',
    modelNumbers: ['A2848', 'A3101', 'A3102', 'A3104'],
    boardId: '820-02684',
    chipset: 'Apple A17 Pro',
    category: 'Smartphone',
    supportTier: 'Full Tier 3 & Tier 4 Supported',
    schematicsStatus: 'Full Schematics & Boardview On File',
    donorBoardStock: 'In Stock (Spokane Staging)',
    releaseYear: 2023,
    commonSymptoms: [
      'USB-C Port Slow Charging / One-Sided Cable',
      'Boot Loop on Apple Logo (NAND / I2C bus error)',
      'No Touch / OLED Backlight Voltage Rail Drop'
    ],
    supportedRepairs: [
      {
        id: 'pmic-replacement',
        name: 'Main PMIC Rework',
        tier: 'Tier 3 Micro-Soldering',
        description: 'Reballing or replacing primary power management IC.',
        typicalSuccessRate: 96,
        averageTurnaroundDays: '1-2 Days'
      },
      {
        id: 'fpc-connector',
        name: 'Display / Touch FPC Micro-Soldering',
        tier: 'Port & FPC Rework',
        description: 'Hot-air micro-soldering replacement of melted or broken plastic FPC socket pins.',
        typicalSuccessRate: 99,
        averageTurnaroundDays: '24 Hours'
      }
    ]
  },
  {
    id: 'apple-iphone-14-pro-max',
    manufacturer: 'Apple',
    modelName: 'iPhone 14 Pro Max',
    modelNumbers: ['A2651', 'A2893', 'A2894', 'A2895'],
    boardId: '820-02381',
    chipset: 'Apple A16 Bionic',
    category: 'Smartphone',
    supportTier: 'Full Tier 3 & Tier 4 Supported',
    schematicsStatus: 'Full Schematics & Boardview On File',
    donorBoardStock: 'In Stock (Spokane Staging)',
    releaseYear: 2022,
    featured: true,
    commonSymptoms: [
      'Hydra / Tristar Charging IC Short',
      'Interposer Sandwich Board Separation / No Cellular Service',
      'Kernel Panic panic-full (i2c0 sensor failure)',
      'Wireless Charging Coil PMIC Short'
    ],
    supportedRepairs: [
      {
        id: 'sandwich-reball',
        name: 'Sandwich Interposer Splitting & Reballing',
        tier: 'Tier 4 BGA Reballing',
        description: 'Precision hot-plate separation of top RF and bottom AP boards, reballing interposer frame at 183°C.',
        typicalSuccessRate: 95,
        averageTurnaroundDays: '1-2 Days'
      },
      {
        id: 'hydra-charging',
        name: 'Hydra Charging Transceiver IC Replacement',
        tier: 'Tier 3 Micro-Soldering',
        description: 'Underfill removal and micro-soldering replacement of 1614A1 / Hydra IC.',
        typicalSuccessRate: 98,
        averageTurnaroundDays: '24 Hours'
      }
    ]
  },
  {
    id: 'apple-iphone-13-pro-max',
    manufacturer: 'Apple',
    modelName: 'iPhone 13 Pro Max',
    modelNumbers: ['A2484', 'A2641', 'A2643', 'A2644', 'A2645'],
    boardId: '820-02102',
    chipset: 'Apple A15 Bionic',
    category: 'Smartphone',
    supportTier: 'Full Tier 3 & Tier 4 Supported',
    schematicsStatus: 'Full Schematics & Boardview On File',
    donorBoardStock: 'In Stock (Spokane Staging)',
    releaseYear: 2021,
    commonSymptoms: [
      'White Screen of Death (WSOD) Flex Jumper Fix',
      'Kernel Panic prs0 (Barometer sensor open loop)',
      'No Power / VDD_MAIN Short after 12V Car Charger'
    ],
    supportedRepairs: [
      {
        id: 'wsod-display-jumper',
        name: 'White Screen (WSOD) OLED Trace Jumpering',
        tier: 'Tier 3 Micro-Soldering',
        description: 'Micro-soldering 0.02mm enameled jumper wire across failed display flex clock traces without replacing panel.',
        typicalSuccessRate: 97,
        averageTurnaroundDays: '24 Hours'
      }
    ]
  },

  // --- APPLE MACBOOK & IPAD ---
  {
    id: 'apple-macbook-pro-16-m3-m2-m1',
    manufacturer: 'Apple',
    modelName: 'MacBook Pro 14" / 16" (M1 / M2 / M3 Pro/Max)',
    modelNumbers: ['A2442', 'A2485', 'A2779', 'A2780', 'A2992', 'A2991'],
    boardId: '820-02100 / 820-02382',
    chipset: 'Apple M1/M2/M3 Silicon',
    category: 'Laptop',
    supportTier: 'Full Tier 3 & Tier 4 Supported',
    schematicsStatus: 'Full Schematics & Boardview On File',
    donorBoardStock: 'In Stock (Spokane Staging)',
    releaseYear: 2023,
    featured: true,
    commonSymptoms: [
      'Stuck on 5V 0.00A / CD3217 Thunderbolt IC Failure',
      'Liquid Damage on ISL9240 / Intersil Charging Controller',
      'No Backlight / 50V Screen Rail Diode Short',
      'Corroded Trackpad / Battery Data Connector'
    ],
    supportedRepairs: [
      {
        id: 'cd3217-thunderbolt',
        name: 'CD3217 / CD3218 Thunderbolt Controller Rework',
        tier: 'Tier 3 Micro-Soldering',
        description: 'Individual replacement of 4-channel Thunderbolt Type-C power negotiation ICs to restore 20V bus.',
        typicalSuccessRate: 96,
        averageTurnaroundDays: '1-3 Days'
      },
      {
        id: 'isl9240-power-rail',
        name: 'PPBUS_G3H Primary Power Rail Restoration',
        tier: 'Tier 3 Micro-Soldering',
        description: 'Troubleshooting and clearing high-side MOSFET shorts or ISL9240 PWM controller failure.',
        typicalSuccessRate: 94,
        averageTurnaroundDays: '2 Days'
      },
      {
        id: 'mac-data-forensics',
        name: 'M-Series Encrypted NAND Direct Pinout Extraction',
        tier: 'Forensic Data Recovery',
        description: 'Soldering high-frequency logic analyzer probes directly to NAND bus for dead logic board data recovery.',
        typicalSuccessRate: 89,
        averageTurnaroundDays: '3-5 Days'
      }
    ]
  },
  {
    id: 'apple-ipad-pro-129-m2',
    manufacturer: 'Apple',
    modelName: 'iPad Pro 12.9" / 11" (M1 & M2)',
    modelNumbers: ['A2378', 'A2379', 'A2436', 'A2437', 'A2764'],
    boardId: '820-02201',
    chipset: 'Apple M1 / M2',
    category: 'Tablet',
    supportTier: 'Full Tier 3 & Tier 4 Supported',
    schematicsStatus: 'Full Schematics & Boardview On File',
    donorBoardStock: 'In Stock (Spokane Staging)',
    releaseYear: 2022,
    commonSymptoms: [
      'USB-C Port Pins Burned / No Charge',
      'Dead PMIC MAX77818 / Battery Gas Gauge Disconnect',
      'Pencil Charging Coil Line Micro-Fracture'
    ],
    supportedRepairs: [
      {
        id: 'ipad-usbc-rework',
        name: 'iPad Pro Through-Hole USB-C Port Replacement',
        tier: 'Port & FPC Rework',
        description: 'Desoldering thick multi-layer ground anchors and soldering fresh OEM USB-C port.',
        typicalSuccessRate: 99,
        averageTurnaroundDays: '24 Hours'
      }
    ]
  },

  // --- SAMSUNG GALAXY ---
  {
    id: 'samsung-galaxy-s24-ultra',
    manufacturer: 'Samsung',
    modelName: 'Galaxy S24 Ultra / S24+',
    modelNumbers: ['SM-S928B', 'SM-S928U', 'SM-S926B'],
    boardId: 'SM-S928_MAIN_REV1',
    chipset: 'Snapdragon 8 Gen 3 for Galaxy',
    category: 'Smartphone',
    supportTier: 'Full Tier 3 & Tier 4 Supported',
    schematicsStatus: 'Full Schematics & Boardview On File',
    donorBoardStock: 'In Stock (Spokane Staging)',
    releaseYear: 2024,
    featured: true,
    commonSymptoms: [
      'No Power / PM8550 PMIC Short',
      'Moisture Detected Alert stuck in USB-C port',
      'UFS 4.0 Storage Chip Power Line Dropout',
      'No Network / RF Transceiver Flex Short'
    ],
    supportedRepairs: [
      {
        id: 'samsung-pmic-rework',
        name: 'Qualcomm PM8550 PMIC BGA Replacement',
        tier: 'Tier 3 Micro-Soldering',
        description: 'Precision underfill removal and replacement of main Qualcomm PMIC chip.',
        typicalSuccessRate: 95,
        averageTurnaroundDays: '1-2 Days'
      },
      {
        id: 'samsung-ufs-data',
        name: 'UFS 4.0 Direct Chip-Off / Pinout Data Recovery',
        tier: 'Forensic Data Recovery',
        description: 'BGA reballing or direct trace jump for corrupted power rails supplying Knox encrypted UFS memory.',
        typicalSuccessRate: 91,
        averageTurnaroundDays: '2-4 Days'
      }
    ]
  },
  {
    id: 'samsung-galaxy-z-fold-5',
    manufacturer: 'Samsung',
    modelName: 'Galaxy Z Fold 5 / Z Flip 5',
    modelNumbers: ['SM-F946B', 'SM-F946U', 'SM-F731B'],
    boardId: 'SM-F946_DUAL_PCB',
    chipset: 'Snapdragon 8 Gen 2',
    category: 'Smartphone',
    supportTier: 'Full Tier 3 & Tier 4 Supported',
    schematicsStatus: 'Full Schematics & Boardview On File',
    donorBoardStock: 'Limited Stock (24h Staging)',
    releaseYear: 2023,
    commonSymptoms: [
      'Hinge Flex Cable Micro-Fracture / Audio Cuts Out When Unfolded',
      'Sub-Board Interconnect Connector Melting',
      'Dual Battery Charger IC MAX77705 Failure'
    ],
    supportedRepairs: [
      {
        id: 'fold-hinge-fpc',
        name: 'Hinge Interconnect FPC Socket Replacement',
        tier: 'Port & FPC Rework',
        description: 'Micro-soldering 60-pin double-density FPC connectors connecting sub-board to main PCB.',
        typicalSuccessRate: 93,
        averageTurnaroundDays: '1-3 Days'
      }
    ]
  },

  // --- GOOGLE PIXEL ---
  {
    id: 'google-pixel-8-pro',
    manufacturer: 'Google',
    modelName: 'Google Pixel 8 Pro / Pixel 8',
    modelNumbers: ['GC3VE', 'G9B03', 'G1MNW'],
    boardId: 'PIXEL8_MAIN_REV2',
    chipset: 'Google Tensor G3',
    category: 'Smartphone',
    supportTier: 'Full Tier 3 & Tier 4 Supported',
    schematicsStatus: 'Full Schematics & Boardview On File',
    donorBoardStock: 'In Stock (Spokane Staging)',
    releaseYear: 2023,
    featured: true,
    commonSymptoms: [
      'USB-C Port Pin Corrosion / Thermal Shutdown',
      'MAX77759 IF-PMIC Short / Dead Phone',
      'Display Green Screen Flicker / OLED Power MOSFET',
      'Titan M2 Security Chip Communication Dropout'
    ],
    supportedRepairs: [
      {
        id: 'pixel-max77759',
        name: 'MAX77759 Companion PMIC Replacement',
        tier: 'Tier 3 Micro-Soldering',
        description: 'Replacing Maxim charging & fuel gauge IC destroyed by fast-charging surges.',
        typicalSuccessRate: 97,
        averageTurnaroundDays: '24 Hours'
      },
      {
        id: 'pixel-titan-m2',
        name: 'Titan M2 Security Bus Trace Jump Wire Repair',
        tier: 'Tier 3 Micro-Soldering',
        description: '0.01mm jumper wire installation across severed PCB traces leading to Google Titan enclave.',
        typicalSuccessRate: 90,
        averageTurnaroundDays: '2-3 Days'
      }
    ]
  },

  // --- GAMING HANDHELDS & CONSOLES ---
  {
    id: 'valve-steam-deck-oled',
    manufacturer: 'Valve',
    modelName: 'Valve Steam Deck (LCD & OLED)',
    modelNumbers: ['1010', '1030', 'OLED-1030'],
    boardId: 'VALVE_SEATTLE_MAIN_PCB',
    chipset: 'Custom AMD Sephiroth / Aerith APU',
    category: 'Gaming Handheld',
    supportTier: 'Full Tier 3 & Tier 4 Supported',
    schematicsStatus: 'Full Schematics & Boardview On File',
    donorBoardStock: 'In Stock (Spokane Staging)',
    releaseYear: 2023,
    featured: true,
    commonSymptoms: [
      'Slow Charging / Stuck at 5V 0.05A (MAX77961 PMIC Failure)',
      'USB-C Port Solder Joint Separation from Drops',
      'No Display / HDMI Dock Output Failure',
      '32GB LPDDR5 RAM BGA Upgrade to 32GB'
    ],
    supportedRepairs: [
      {
        id: 'deck-max77961',
        name: 'MAX77961 / BQ25713 Power Management Rework',
        tier: 'Tier 3 Micro-Soldering',
        description: 'Replacing primary charging regulator IC responsible for 15V PD handshake on Steam Deck.',
        typicalSuccessRate: 98,
        averageTurnaroundDays: '24-48 Hours'
      },
      {
        id: 'deck-ram-upgrade',
        name: 'LPDDR5 32GB BGA RAM Module Swap & BIOS Patch',
        tier: 'Tier 4 BGA Reballing',
        description: 'Desoldering stock 16GB LPDDR5 chips, installing 7500MHz 32GB chips and flashing modified BIOS.',
        typicalSuccessRate: 94,
        averageTurnaroundDays: '2-3 Days'
      }
    ]
  },
  {
    id: 'nintendo-switch-oled',
    manufacturer: 'Nintendo',
    modelName: 'Nintendo Switch / Switch OLED / Lite',
    modelNumbers: ['HAC-001', 'HEG-001', 'HDH-001'],
    boardId: 'HAC-CPU-20 / HEG-CPU-01',
    chipset: 'NVIDIA Tegra X1 / Mariko',
    category: 'Gaming Handheld',
    supportTier: 'Full Tier 3 & Tier 4 Supported',
    schematicsStatus: 'Full Schematics & Boardview On File',
    donorBoardStock: 'In Stock (Spokane Staging)',
    releaseYear: 2021,
    commonSymptoms: [
      'M92T36 Power Management IC Short (Third party dock damage)',
      'BQ24193 Battery Charger Chip Failure',
      'PI3USB Video Transmitter IC Short / No TV Docking',
      'USB-C Dual-Row Surface Mount Pin Separation'
    ],
    supportedRepairs: [
      {
        id: 'm92t36-rework',
        name: 'M92T36 & BQ24193 Charging IC Bundle Rework',
        tier: 'Tier 3 Micro-Soldering',
        description: 'Micro-soldering both M92T36 power controller and BQ charging IC after third-party dock voltage spikes.',
        typicalSuccessRate: 99,
        averageTurnaroundDays: '24 Hours'
      },
      {
        id: 'pi3usb-video',
        name: 'PI3USB TV Docking Transmitter Replacement',
        tier: 'Tier 3 Micro-Soldering',
        description: 'Replacing Pericom USB video multiplexer IC to restore TV mode HDMI streaming.',
        typicalSuccessRate: 98,
        averageTurnaroundDays: '24 Hours'
      }
    ]
  },
  {
    id: 'sony-playstation-5',
    manufacturer: 'Sony',
    modelName: 'PlayStation 5 (Disc & Digital / Slim)',
    modelNumbers: ['CFI-1000', 'CFI-1100', 'CFI-1200', 'CFI-2000'],
    boardId: 'EDM-010 / EDM-020 / KSR-001',
    chipset: 'AMD Oberon / Oberon Plus APU',
    category: 'Console',
    supportTier: 'Full Tier 3 & Tier 4 Supported',
    schematicsStatus: 'Full Schematics & Boardview On File',
    donorBoardStock: 'In Stock (Spokane Staging)',
    releaseYear: 2020,
    featured: true,
    commonSymptoms: [
      'HDMI Port Broken Pins / No Video Output (White Light of Death)',
      'MN864729 HDMI Encoder IC Short',
      'Liquid Metal Oxidation Spill Shorting APU SMD Capacitors',
      '12V Power Rail Fuse Blown / Instant Beep-Off'
    ],
    supportedRepairs: [
      {
        id: 'ps5-hdmi-port',
        name: 'PS5 Reinforced HDMI 2.1 Port Micro-Soldering',
        tier: 'Port & FPC Rework',
        description: 'Replacing damaged HDMI port with solid zinc-plated anchor tabs and liquid flux pin reflow.',
        typicalSuccessRate: 100,
        averageTurnaroundDays: '24 Hours'
      },
      {
        id: 'ps5-hdmi-encoder',
        name: 'MN864729 Panasonic HDMI Encoder IC Replacement',
        tier: 'Tier 3 Micro-Soldering',
        description: 'Replacing fried HDMI transmitter chip destroyed by static discharge or hot-plugging cables.',
        typicalSuccessRate: 97,
        averageTurnaroundDays: '24 Hours'
      },
      {
        id: 'liquid-metal-cleanup',
        name: 'APU Liquid Metal Decontamination & Barrier Seal',
        tier: 'Ultrasonic Water Recovery',
        description: 'Cleaning shorted liquid metal alloy from APU surface, replacing foam barrier ring, and re-applying high-performance thermal compound.',
        typicalSuccessRate: 96,
        averageTurnaroundDays: '1-2 Days'
      }
    ]
  },
  {
    id: 'microsoft-surface-pro-9',
    manufacturer: 'Microsoft',
    modelName: 'Microsoft Surface Pro 9 / 8 / 7+',
    modelNumbers: ['1983', '1960', '1866'],
    boardId: 'SURFACE_MAIN_BOARD_GEN9',
    chipset: 'Intel 12th Gen Core i5/i7 / Microsoft SQ3',
    category: 'Tablet',
    supportTier: 'Full Tier 3 & Tier 4 Supported',
    schematicsStatus: 'Schematics Available',
    donorBoardStock: 'Limited Stock (24h Staging)',
    releaseYear: 2022,
    commonSymptoms: [
      'Surface Connect / Type-C Power Rail MOSFET Short',
      'Screen Backlight Fuse F7001 Blown',
      'Onboard BGA NVMe Controller Failure / Data Extraction'
    ],
    supportedRepairs: [
      {
        id: 'surface-backlight-fuse',
        name: 'Backlight Driver IC & F7001 Micro-Fuse Replacement',
        tier: 'Tier 3 Micro-Soldering',
        description: 'Replacing 0402 micro-fuse and LED driver IC blown when screen was disconnected with battery attached.',
        typicalSuccessRate: 98,
        averageTurnaroundDays: '24 Hours'
      }
    ]
  }
];
