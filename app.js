const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Log levels
const LogLevel = {
    INFO: 'info',
    ERROR: 'error',
    SUCCESS: 'success'
};

// Log Ingestor class
class LogIngestor {
    constructor() {
        this.logFiles = {};
        this.initializeLoggers();
    }

    initializeLoggers() {
        this.initializeLogger('api1', 'log1.log');
        this.initializeLogger('api2', 'log2.log');
    }

    initializeLogger(apiName, logFileName) {
        const logFilePath = path.join(__dirname, logFileName);
        this.logFiles[apiName] = fs.createWriteStream(logFilePath, { flags: 'a' });
    }

    logMessage(apiName, level, logString) {
        if (this.logFiles[apiName]) {
            const logEntry = {
                level,
                log_string: logString,
                timestamp: new Date().toISOString(),
                metadata: { source: apiName }
            };
            this.logFiles[apiName].write(JSON.stringify(logEntry) + '\n');
        } else {
            console.error(`Logger '${apiName}' not initialized!`);
        }
    }

    closeLogFiles() {
        for (const apiName in this.logFiles) {
            this.logFiles[apiName].end();
        }
    }
}

// Function to search logs based on query parameters
function searchLogs(queryLevel, queryString) {
    const logFilePath = path.join(__dirname, 'log1.log'); // Example: Only searching log1.log for demonstration
    const rl = readline.createInterface({
        input: fs.createReadStream(logFilePath),
        crlfDelay: Infinity
    });

    rl.on('line', (line) => {
        const logEntry = JSON.parse(line);
        const { level, log_string } = logEntry;

        if (level === queryLevel && log_string.includes(queryString)) {
            console.log(logEntry);
        }
    });
}

// Usage example
const logger = new LogIngestor();

// Log messages
logger.logMessage('api1', LogLevel.INFO, 'Processing started');
logger.logMessage('api2', LogLevel.ERROR, 'Failed to connect to database');

// Close log files when done
process.on('exit', () => {
    logger.closeLogFiles();
});

// Example usage: Search for error logs containing 'Failed to connect'
searchLogs(LogLevel.ERROR, 'Failed to connect');
