import { basicAuth, fieldId, fieldIdIframe, fieldIdTyping, fieldName } from './auth-automation.js';
import { connectToRemoteDebuggingInstance } from './connection.js';

/**
 * Full auth automation routine
 * 
 * @since 0.0.1
 */
export async function runFullCdpAuth(): Promise<void> {
    try {
        await initCheck();
        await runCdpAuth();
    } catch (error) {
        console.trace();
        throw new Error(`Failed cdp-auth with: ${error}`);
    }
}

/**
 * Initial startup checks
 * 
 * @since 0.0.1
 */
async function initCheck(): Promise<void> {
    const argumentsNumber: number = process.argv.length;
    if (argumentsNumber !== 6) {
        console.log(`Incorrect number of arguments, you should be executing chrome-auth with "chrome-auth PORT URL/HOSTNAME TYPEOFLOGIN,LOGIN,ETC PASSWORD`);
        const exitCode: number = 1;
        process.exit(exitCode);
    }
}


/**
 * Run CDP auth
 * 
 * @since 0.0.1
 */
export async function runCdpAuth() {
    const args = {
        debugPort: parseInt(process.argv[2], 10),
        url: process.argv[3],
        formconfig: process.argv[4],
        password: process.argv[5]
    };

    let client = await connectToRemoteDebuggingInstance(args.debugPort);

    const formType: string = args.formconfig.split(',')[0];
    const username: string = args.formconfig.split(',')[1];
    const password: string = args.password;

    var splitUrl = args.url.match(/^(https?:\/\/)(.*)/);

    const { Network, Page, Input, DOM, Runtime } = client;
    await Promise.all([Network.enable(), Page.enable(), Runtime.enable()]);

    try {
        const htmlConnectedMessage = Buffer.from(`<p><span style='font-family: "Lucida Console", Monaco, monospace; font-size: 18px;'>Connected to CDP, loading page...</span></p>`);
        await Page.navigate({ url: `data:text/html;base64,${htmlConnectedMessage.toString('base64')}` });
        await Page.loadEventFired();

        if (splitUrl) {
            switch (formType) {
                case 'basic_auth':
                    await basicAuth({ Page, args, splitUrl, username, password });
                    break;
                case 'field_id':
                    await fieldId({ Page, Runtime, DOM, Input, args, username, password });
                    break;
                case 'field_name':
                    await fieldName({ Page, Runtime, Input, args, username, password });
                    break;
                case 'field_id_typing':
                    await fieldIdTyping({ Page, Runtime, DOM, Input, args, username, password });
                    break;
                case 'field_id+iframe':
                    await fieldIdIframe({ Page, Runtime, Input, args, username, password });
                    break;
                default:
                    console.log(`Unknown auth method: ${formType}`);
            }
        }

    } catch (error: Error | any) {
        console.log(`There was an error: ${error}`);
        const htmlErrorMessage = Buffer.from(`<p><span style='font-family: "Lucida Console", Monaco, monospace; font-size: 18px;'>CDP script failed, There might be an error/bug, the host is down or there's another error... <br /><br />error: ${error}<br />stack: ${error.stack}</span></p>`);
        await Page.navigate({ url: `data:text/html;base64,${htmlErrorMessage.toString('base64')}` });
    }

    console.log(`Finishing, closing remote debugging...`);
    await client.close();
}