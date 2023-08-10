import { setValueOfId, setValueOfName, setValueOfIdbyTyping, setValueOfIdInIframe } from './values.js';

/**
 * Execute basic authentication script
 * 
 * @param Page
 * @param splitUrl Split url, protocol and domain
 * @param username Username
 * @param password Password
 * @param args All arguments
 * @param url Full url
 * @since 0.0.1
 */
export async function basicAuth({ Page, splitUrl, username, password, args }): Promise<void> {
    await Page.navigate({ url: `${splitUrl[1]}${username}:${password}@${splitUrl[2]}` });
    await Page.loadEventFired();
    await Page.navigate({ url: `${args.url}` });
}

/**
 * Execute authentication script based on field ids
 * 
 * @param Page
 * @param Runtime
 * @param DOM
 * @param Input
 * @param args All arguments
 * @param username
 * @param password
 * @since 0.0.1
 */
export async function fieldId({ Page, Runtime, DOM, Input, args, username, password }): Promise<void> {
    const { frameId } = await Page.navigate({ url: `${args.url}` });
    await Page.loadEventFired();

    const { executionContextId } = await Page.createIsolatedWorld({ frameId });

    const usernameElementId: string = args.formconfig.split(',')[2];

    const timeout = 10000;
    const checkInterval = 150;
    const startTime = Date.now();
    let element = null;

    while (Date.now() - startTime < timeout && !element) {
        element = await Runtime.evaluate({
            expression: `document.getElementById("${usernameElementId}");`,
            contextId: executionContextId
        });
        await new Promise(function (resolve) { setTimeout(resolve, checkInterval) });
        if (element) break;
    }

    await setValueOfId({ executionContextId, Runtime, DOM, id: usernameElementId, value: username });

    const passwordElementId: string = args.formconfig.split(',')[3];
    await setValueOfId({ executionContextId, Runtime, DOM, id: passwordElementId, value: password });

    await Runtime.evaluate({
        expression: `document.body.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, cancelable: true, key: 'Enter',}));`,
        contextId: executionContextId
    });

    await Input.dispatchKeyEvent({
        type: 'char',
        text: '\r', // Use '\r' for Enter key
        windowsVirtualKeyCode: 13,
        nativeVirtualKeyCode: 13
    });

    await Runtime.evaluate({
        expression: `document.getElementById('${passwordElementId}').dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', keyCode: 13, which: 13, bubbles: true, cancelable: true, }));`,
        contextId: executionContextId
    });
}

/**
 * Execute authentication script with field names
 * 
 * @param Page
 * @param Runtime
 * @param Input
 * @param args All arguments
 * @param username Username
 * @param password Password
 * @since 0.0.1
 */
export async function fieldName({ Page, Runtime, Input, args, username, password }): Promise<void> {
    await Page.navigate({ url: `${args.url}` });
    await Page.loadEventFired();

    const usernameElementName: string = args.formconfig.split(',')[2];
    await setValueOfName({ Runtime, name: usernameElementName, value: username });

    const passwordElementName: string = args.formconfig.split(',')[3];
    await setValueOfName({ Runtime, name: passwordElementName, value: password });

    await Runtime.evaluate({
        expression: `document.body.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, cancelable: true, key: 'Enter',}));`
    });

    await Input.dispatchKeyEvent({
        type: 'char',
        text: '\r', // Use '\r' for Enter key
        windowsVirtualKeyCode: 13,
        nativeVirtualKeyCode: 13
    });
}

/**
 * Execute authentication script based on typing values on field ids 
 * 
 * @param Page
 * @param Runtime
 * @param DOM
 * @param Input
 * @param args All arguments
 * @param username Username
 * @param password Password
 * @since 0.0.1
 */
export async function fieldIdTyping({ Page, Runtime, DOM, Input, args, username, password }): Promise<void> {
    const { frameId } = await Page.navigate({ url: `${args.url}` });
    await Page.loadEventFired();

    const { executionContextId } = await Page.createIsolatedWorld({ frameId });

    const usernameElementId: string = args.formconfig.split(',')[2];

    const timeout = 10000;
    const checkInterval = 150;
    const startTime = Date.now();
    let element = null;

    while (Date.now() - startTime < timeout && !element) {
        element = await Runtime.evaluate({
            expression: `document.getElementById("${usernameElementId}");`,
            contextId: executionContextId
        });
        await new Promise(function (resolve) { setTimeout(resolve, checkInterval) });
        if (element) break;
    }

    await setValueOfIdbyTyping({ executionContextId, DOM, Runtime, Input, id: usernameElementId, value: username });

    const passwordElementId: string = args.formconfig.split(',')[3];
    await setValueOfIdbyTyping({ executionContextId, DOM, Runtime, Input, id: passwordElementId, value: password });

    await Runtime.evaluate({
        expression: `$("form").className = 'simple-box-form form-horizontal ng-valid ng-dirty ng-valid-parse'; $("#username").className = 'form-control ng-valid ng-touched ng-not-empty ng-dirty ng-valid-parse'; $("#password").addClass('ng-valid ng-touched ng-not-empty');`,
        contextId: executionContextId
    });

    await Input.dispatchKeyEvent({
        type: 'char',
        text: '\r', // Use '\r' for Enter key
        windowsVirtualKeyCode: 13,
        nativeVirtualKeyCode: 13
    });
}

/**
 * Execute authentication script based on field ids on an iframe id
 * 
 * @param Page
 * @param Runtime
 * @param Input
 * @param args All arguments
 * @param username Username
 * @param password Password
 * @since 0.0.1
 */
export async function fieldIdIframe({ Page, Runtime, Input, args, username, password }): Promise<void> {
    const { frameId } = await Page.navigate({ url: `${args.url}` });
    await Page.loadEventFired();

    const { executionContextId } = await Page.createIsolatedWorld({ frameId });

    const iframeElementId = args.formconfig.split(',')[4];

    const usernameElementId: string = args.formconfig.split(',')[2];
    await setValueOfIdInIframe({ executionContextId, iframeElementId, Runtime, id: usernameElementId, value: username });

    const passwordElementId: string = args.formconfig.split(',')[3];
    await setValueOfIdInIframe({ executionContextId, iframeElementId, Runtime, id: passwordElementId, value: password });

    await Runtime.evaluate({
        expression: `document.body.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, cancelable: true, key: 'Enter',}));`,
        contextId: executionContextId
    });

    await Input.dispatchKeyEvent({
        type: 'char',
        text: '\r',
        windowsVirtualKeyCode: 13,
        nativeVirtualKeyCode: 13
    });
}