const fs = require("fs");
const path = require("path");

// Define API configurations with names and log file names
const apiConfigurations = [
  { name: "api1", logFile: "log1.log" },
  { name: "api2", logFile: "log2.log" },
  { name: "api3", logFile: "log3.log" },
  { name: "api4", logFile: "log4.log" },
  { name: "api5", logFile: "log5.log" },
  { name: "api6", logFile: "log6.log" },
  { name: "api7", logFile: "log7.log" },
  { name: "api8", logFile: "log8.log" },
  { name: "api9", logFile: "log9.log" },
];

class Logger {
  constructor(apiName, logFile) {
    this.apiName = apiName;
    this.logFile = logFile;
    this.logStream = fs.createWriteStream(logFile, { flags: "a" });
  }

  log(level, logString) {
    const logData = {
      level,
      log_string: logString,
      timestamp: new Date().toISOString().slice(0, -1) + "Z",
      metadata: { source: this.logFile },
    };
    this.logStream.write(JSON.stringify(logData) + "\n");
  }

  close() {
    this.logStream.end();
  }
}

class LogIngestor {
  constructor() {
    this.loggers = {};
    this.initializeLoggers();
  }

  initializeLoggers() {
    apiConfigurations.forEach((api) => {
      const { name, logFile } = api;
      this.loggers[name] = new Logger(name, logFile);
    });
  }

  logMessage(apiName, level, logString) {
    const logger = this.loggers[apiName];
    if (logger) {
      logger.log(level, logString);
    } else {
      console.error(`Logger '${apiName}' not found!`);
    }
  }

  closeAllLoggers() {
    Object.values(this.loggers).forEach((logger) => logger.close());
  }
}

// Usage example
const logIngestor = new LogIngestor();

const apiMessages = [
  { api: "api1", level: "info", message: "Processing started" },
  { api: "api2", level: "error", message: "Failed to connect to database" },
  { api: "api3", level: "info", message: "Processing started" },
  { api: "api4", level: "error", message: "Failed to connect to database" },
  { api: "api5", level: "info", message: "Processing started" },
  { api: "api6", level: "error", message: "Failed to connect to database" },
  { api: "api7", level: "info", message: "Processing started" },
  { api: "api8", level: "error", message: "Failed to connect to database" },
  { api: "api9", level: "info", message: "Processing started" },
];

// Iterate over the array and log messages dynamically
apiMessages.forEach(({ api, level, message }) => {
  logIngestor.logMessage(api, level, message);
});

// Ensure log streams are closed properly
process.on("exit", () => {
  logIngestor.closeAllLoggers();
});

process.on("SIGINT", () => {
  logIngestor.closeAllLoggers();
  process.exit();
});

process.on("SIGTERM", () => {
  logIngestor.closeAllLoggers();
  process.exit();
});
