export namespace Logger {

    export interface ILogger {
        debug: (message: string, ...args: any[]) => void;
        info: (message: string, ...args: any[]) => void;
        warn: (message: string, ...args: any[]) => void;
        error: (message: string, ...args: any[]) => void;
    }

    export function getLogger(name: string): ILogger {
        const cached = loggers[name];

        if (cached) {
            return cached;
        }

        const logger = new ConsoleLogger(name) as ILogger;
        loggers[name] = logger;

        return logger;
    }

    interface ILoggerIndexer {   
        [name: string]: ILogger;
     }

    const loggers: ILoggerIndexer = {};

    class ConsoleLogger implements ILogger {
        constructor(private name: string) { }

        /**
         * Appends a debug log.
         *
         * @param message The main message to log.
         * @param rest Any additional data to log.
         */
        debug(message: string, ...rest: any[]): void {
            console.debug(`DEBUG [${this.name}]`, [message, ...rest]);
        }

        /**
        * Appends an info log.
        *
        * @param message The main message to log.
        * @param rest Any additional data to log.
        */
        info(message: string, ...rest: any[]): void {
            console.info(`INFO [${this.name}]`, [message, ...rest]);
        }

        /**
        * Appends a warning log.
        *
        * @param message The main message to log.
        * @param rest Any additional data to log.
        */
        warn(message: string, ...rest: any[]): void {
            console.warn(`WARN [${this.name}]`, [message, ...rest]);
        }

        /**
        * Appends an error log.
        *
        * @param message The main message to log.
        * @param rest Any additional data to log.
        */
        error(message: string, ...rest: any[]): void {
            console.error(`ERROR [${this.name}]`, [message, ...rest]);
        }
    }
}