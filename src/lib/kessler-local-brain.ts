// Local Brain - Fallback AI for Kessler Terminal
// Provides hardcoded military-style responses when cloud AI is unavailable

export interface LocalResponse {
  text: string;
  isLocal: true;
  timestamp: Date;
}

export function processLocalCommand(input: string): LocalResponse {
  const normalizedInput = input.toUpperCase().trim();
  
  // Status commands
  if (normalizedInput.match(/^(STATUS|STATE|HEALTH|SYSTEM)$/)) {
    return {
      text: `SYSTEM STATUS: OPERATIONAL
POWER CORE: STABLE
ORBITAL TRACKING: ACTIVE
COLLISION RISK ASSESSMENT: ONLINE
LOCAL DATABASE: LIMITED
MODE: BACKUP PROTOCOL ENGAGED`,
      isLocal: true,
      timestamp: new Date()
    };
  }
  
  // Identity commands
  if (normalizedInput.match(/^(IDENTIFY|WHO ARE YOU|NAME|SELF)$/)) {
    return {
      text: `UNIT: KESSLER TERMINAL v2.4
PURPOSE: SPACE DEBRIS RISK ASSESSMENT
STATUS: LOCAL BACKUP MODE
CAPABILITIES: LIMITED COMMAND SET
ORIGIN: SDCRA GROUND CONTROL`,
      isLocal: true,
      timestamp: new Date()
    };
  }
  
  // Project commands
  if (normalizedInput.match(/^(PROJECT|SDCRA|MISSION|OBJECTIVE)$/)) {
    return {
      text: `PROJECT: SPACE DEBRIS COLLISION RISK ANALYZER
PRIMARY MISSION: ORBITAL SAFETY ASSESSMENT
SECONDARY: DEBRIS TRACKING & PREDICTION
STATUS: ACTIVE MONITORING SYSTEM
THREAT LEVEL: VARIABLE BASED ON ORBITAL DATA`,
      isLocal: true,
      timestamp: new Date()
    };
  }
  
  // ISS commands
  if (normalizedInput.match(/^(ISS|INTERNATIONAL SPACE STATION|STATION)$/)) {
    return {
      text: `ISS STATUS: OPERATIONAL
ORBIT: LOW EARTH ORBIT (~408 KM)
VELOCITY: 27,600 KM/H
CREW: VARIABLE (TYPICALLY 7)
RISK ASSESSMENT: CONTINUOUS MONITORING
LAST DEBRIS AVOIDANCE: [CLASSIFIED]`,
      isLocal: true,
      timestamp: new Date()
    };
  }
  
  // Debris commands
  if (normalizedInput.match(/^(DEBRIS|SPACE JUNK|ORBITAL DEBRIS|COLLISION)$/)) {
    return {
      text: `DEBRIS TRACKING: ACTIVE
CATALOGED OBJECTS: >34,000
RISK THRESHOLDS:
- CRITICAL: <10 KM SEPARATION
- WARNING: <50 KM SEPARATION
- MONITOR: <100 KM SEPARATION
CURRENT HOTSPOTS: [REQUIRES CLOUD ACCESS]`,
      isLocal: true,
      timestamp: new Date()
    };
  }
  
  // Help commands
  if (normalizedInput.match(/^(HELP|COMMANDS|LIST|\?|H)$/)) {
    return {
      text: `AVAILABLE LOCAL COMMANDS:
STATUS - System status report
IDENTIFY - Unit identification
PROJECT - Mission information
ISS - International Space Station data
DEBRIS - Orbital debris information
HELP - This command list

NOTE: FULL CAPABILITIES REQUIRE CLOUD CONNECTION`,
      isLocal: true,
      timestamp: new Date()
    };
  }
  
  // Default response for unrecognized commands
  return {
    text: `COMMAND UNRECOGNIZED. OFFLINE DATABASE LIMITED.

AVAILABLE COMMANDS: STATUS, IDENTIFY, PROJECT, ISS, DEBRIS, HELP

FOR FULL AI ASSISTANCE, ESTABLISH CLOUD CONNECTION.`,
    isLocal: true,
    timestamp: new Date()
  };
}
