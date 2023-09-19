import { basicAuth, fieldId, fieldIdFirstIframe, fieldIdFirstIframeOnlyPwd, fieldIdIframe, fieldIdIframeOnlyPwd, fieldIdOnlyPwd, fieldIdOnlyPwdTyping, fieldIdTypePasswordFirstIframeOnlyPwd, fieldIdTyping, fieldName, fieldNameTyping, specAt, specFreePbx } from './auth-automation.js';
import { connectToRemoteDebuggingInstance } from './connection.js';
import { throwErrorAndQuit } from './error.js';

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
    const neededArguments: number = 6;
    if (argumentsNumber !== neededArguments) {
        const title: string = `Error`;
        const message: string = `Incorrect number of arguments (provided ${argumentsNumber} which is less than the ${neededArguments} arguments needed), you should be executing cdp-auth with (cdp-auth PORT URL/HOSTNAME TYPEOFLOGIN,LOGIN,ETC PASSWORD)`;
        const exitCode: number = 1;
        await throwErrorAndQuit({ title, message, exitCode });
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
                // Basic auth
                case 'basic_auth':
                    await basicAuth({ Network, Page, args, splitUrl, username, password });
                    break;
                // Form auth, based on field id
                case 'field_id':
                    await fieldId({ Page, Runtime, DOM, Input, args, username, password });
                    break;
                // Form auth, based on field id, typed (alternative)
                case 'field_id_typing':
                    await fieldIdTyping({ Page, Runtime, DOM, Input, args, username, password });
                    break;
                // Form auth, based on field id, only password
                case 'field_id_only_pwd':
                    await fieldIdOnlyPwd({ Page, Runtime, DOM, Input, args, password });
                    break;
                // Form auth, based on field id, only password, typed (alternative)
                case 'field_id_only_pwd_typing':
                    await fieldIdOnlyPwdTyping({ Page, Runtime, DOM, Input, args, password });
                    break;
                // Form auth, based on field id inside iframe id
                case 'field_id+iframe':
                    await fieldIdIframe({ Page, Runtime, Input, args, username, password });
                    break;
                // Form auth, based on field id inside first iframe
                case 'field_id+first_iframe':
                    await fieldIdFirstIframe({ Page, Runtime, Input, args, username, password });
                    break;
                // Form auth, based on field id inside iframe id, only password
                case 'field_id+iframe_only_pwd':
                    await fieldIdIframeOnlyPwd({ Page, Runtime, Input, args, password });
                    break;
                // Form auth, based on field id inside first iframe, only password
                case 'field_id+first_iframe_only_pwd':
                    await fieldIdFirstIframeOnlyPwd({ Page, Runtime, Input, args, password });
                    break;
                // Form auth, based on field id that is input type password inside first iframe, only password
                case 'field_id_type_password+first_iframe_only_pwd':
                    await fieldIdTypePasswordFirstIframeOnlyPwd({ Page, Runtime, Input, args, password });
                    break;
                // Form auth, based on field name
                case 'field_name':
                    await fieldName({ Page, Runtime, Input, args, username, password });
                    break;
                // Form auth, based on field name, typed (alternative)
                case 'field_name_typing':
                    await fieldNameTyping({ Page, Runtime, DOM, Input, args, username, password });
                    break;
                // Form auth, specific form, Free PBX admin
                case 'spec_freepbx':
                    await specFreePbx({ Page, Runtime, args, username, password });
                    break;
                // Form auth, specific form, autoridade tributária
                case 'spec_at':
                    await specAt({ Page, Runtime, DOM, Input, args, username, password });
                    break;
                default:
                    console.log(`Unknown auth method: ${formType}`);
            }
        }
    } catch (error: Error | any) {
        console.log(`There was an error: ${error}`);
        const htmlErrorMessage = Buffer.from(`<p><span style='font-family: "Lucida Console", Monaco, monospace; font-size: 18px;'>CDP script failed, There might be an error/bug, the host is down or there's another error... <br /><br />error: ${error}<br />stack: ${error.stack}</span></p>`);
        await Page.navigate({ url: `data:text/html;base64,${htmlErrorMessage.toString('base64')}` });
        const title: string = `Error`;
        const message: string = `There was an error processing a login script, ${error}.`;
        const exitCode: number = 2;
        await throwErrorAndQuit({ title, message, exitCode });
    }

    console.log(`Finishing, closing remote debugging...`);
    await client.close();
}
