import { exec } from 'child_process';

/**
 * Run a command
 * 
 * @param params.command Command to run
 * @param params.parameters Command parameters
 * @example
 * ```
 * runCommand({ command, parameters });
 * ```
 * @returns Command output or null on failure
 * @since 0.0.1
 */
export async function runCommand({ command, parameters }:
    { command: string, parameters: string }): Promise<string | null> {
    try {
        const result: string = await runCommandPromise({ command, parameters });
        return result;
    } catch (error) {
        if (error && typeof error === 'object')
            if (String(error).length > 2) {
                const errorMessage: string = String(error).replaceAll('\r\n', '')
                console.log(`There was an error running a command: ${errorMessage}`);
            }
        return null;
    }
}

/**
 * Runs a command with given parameters on a promise (exec wrapper)
 * 
 * @param params.command Command to run
 * @param params.parameters Command parameters
 * @example
 * ```
 * runCommandPromise({ command, parameters });
 * ```
 * @returns Command output 
 * @since 0.0.1
 */
export async function runCommandPromise({ command, parameters }:
    { command: string, parameters: string }): Promise<string> {

    return new Promise(function (resolve, reject) {
        const fullCommand: string = `${command} ${parameters}`;
        const childProcess: any = exec(fullCommand);
        let output: string = '';
        childProcess.stdout.on('data', function (data) {
            output += data.toString();
        });
        childProcess.stderr.on('data', function (data) {
            output += data.toString();
        });
        childProcess.on('close', function (exitCode) {
            if (exitCode === 0)
                resolve(output);
            else
                reject(new Error(`Command exited with code ${exitCode} and output: ${output}`));
        });
    });
}
