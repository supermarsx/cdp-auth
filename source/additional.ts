import { runCommand } from './commands.js';

/**
 * @private
 * Start a cef client locally, path has to be changed to your own (used for tests)
 * 
 * @param debugPort Remote debugging port
 * @since 0.0.1
 */
export async function startCefClient(debugPort: number): Promise<void> {
    const command: string = '.\\cef_client_bin\\cefclient.exe';
    const parameters: string = `--remote-allow-origins=* --ignore-certificate-errors --remote-debugging-port=${debugPort}`;
    console.log('Starting CEF Client');
    runCommand({ command, parameters });
}

/**
 * @private
 * Add a delay between two instructions (not recommended, last case scenario usage)
 * 
 * @param ms Amount of milliseconds to delay execution
 * @returns A promise that resolves once a certain amount of time has passed
 * @since 0.0.1
 */
export function delay(ms: number): Promise<any> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * @private
 * Generate a random number in a range with lower and upper bound (used for testing)
 * 
 * @param min Minimum number
 * @param max Maximum number
 * @returns Random number 
 * @since 0.0.1
 */
export function randomInteger(min: number, max: number): Number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
