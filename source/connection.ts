import chromeRemote from 'chrome-remote-interface';

/** 
 * Connect to remote debugging instance with auto retry and timeout
 * 
 * @param remoteDebuggingPort Remote debugging port to connect to
 * @returns Client (on failure process exits)
 * @since 0.0.1
 */
export async function connectToRemoteDebuggingInstance(remoteDebuggingPort) {
    const timeout = 10000;
    const checkInterval = 150;
    const startTime = Date.now();

    console.log(`Connecting to remote remote debugging instance...`);

    while (Date.now() - startTime < timeout) {
        try {
            const client = await chromeRemote({ port: remoteDebuggingPort });
            console.log('Connected to remote debugging instance.');
            return client;
        } catch (error) {
            console.log('Waiting for remote debugging instance...');
            await new Promise(function (resolve) { setTimeout(resolve, checkInterval) });
        }
    }
    console.log(`Failed to connect to a remote debugging instance, exiting...`);
    const exitCode: number = 2;
    process.exit(exitCode);
}
