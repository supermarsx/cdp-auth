import { setValueOfId, setValueOfName, setValueOfIdbyTyping, setValueOfIdInIframe, setValueOfNamebyTyping, setValueOfIdInFirstIframe, setValueOfIdTypePasswordInFirstIframe } from './values.js';

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
export async function basicAuth({ Network, Page, splitUrl, username, password, args }): Promise<void> {
    let inflightRequests: number = 0;
    let loadResolve;
    const loadPromise = new Promise((resolve) => {
        loadResolve = resolve;
    });

    Network.requestWillBeSent(function () { inflightRequests++ });

    function checkIdle() {
        if (inflightRequests <= 1) {
            clearTimeout(idleTimeout);
            idleTimeout = setTimeout(loadResolve, 500);
        }
    }

    let idleTimeout;
    Network.loadingFinished(function () {
        inflightRequests--;
        checkIdle();
    });

    Network.loadingFailed(function () {
        inflightRequests--;
        checkIdle();
    });

    await Page.navigate({ url: `${splitUrl[1]}${username}:${password}@${splitUrl[2]}` });
    await loadPromise;
    //await Page.loadEventFired();
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
        try {
            element = await Runtime.evaluate({
                expression: `document.getElementById("${usernameElementId}");`,
                contextId: executionContextId
            });
        } catch (e) { element = null }
        await new Promise(function (resolve) { setTimeout(resolve, checkInterval) });
        if (element) break;
    }

    await setValueOfId({ executionContextId, Runtime, DOM, id: usernameElementId, value: username });

    const passwordElementId: string = args.formconfig.split(',')[3];
    await setValueOfId({ executionContextId, Runtime, DOM, id: passwordElementId, value: password });

    await pressEnterKey({ Runtime, Input, executionContextId, passwordElementId });
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
    const { frameId } = await Page.navigate({ url: `${args.url}` });
    await Page.loadEventFired();

    const { executionContextId } = await Page.createIsolatedWorld({ frameId });

    const usernameElementName: string = args.formconfig.split(',')[2];
    await setValueOfName({ Runtime, name: usernameElementName, value: username });

    const passwordElementName: string = args.formconfig.split(',')[3];
    await setValueOfName({ Runtime, name: passwordElementName, value: password });

    await pressEnterKey({ Runtime, Input, executionContextId });
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
        try {
            element = await Runtime.evaluate({
                expression: `document.getElementById("${usernameElementId}");`,
                contextId: executionContextId
            });
        } catch (e) { element = null }
        await new Promise(function (resolve) { setTimeout(resolve, checkInterval) });
        if (element) break;
    }

    await setValueOfIdbyTyping({ executionContextId, DOM, Runtime, Input, id: usernameElementId, value: username });

    const passwordElementId: string = args.formconfig.split(',')[3];
    await setValueOfIdbyTyping({ executionContextId, DOM, Runtime, Input, id: passwordElementId, value: password });

    await pressEnterKey({ Runtime, Input, executionContextId, passwordElementId });
}

/**
 * Execute authentication script based on typing values on field names 
 * 
 * @param Page
 * @param Runtime
 * @param DOM
 * @param Input
 * @param args All arguments
 * @param username Username
 * @param password Password
 * @since 0.0.2
 */
export async function fieldNameTyping({ Page, Runtime, DOM, Input, args, username, password }): Promise<void> {
    const { frameId } = await Page.navigate({ url: `${args.url}` });
    await Page.loadEventFired();

    const { executionContextId } = await Page.createIsolatedWorld({ frameId });

    const usernameElementName: string = args.formconfig.split(',')[2];

    const timeout = 10000;
    const checkInterval = 150;
    const startTime = Date.now();
    let element = null;

    while (Date.now() - startTime < timeout && !element) {
        element = await Runtime.evaluate({
            expression: `document.getElementsByName("${usernameElementName}")[0];`,
            contextId: executionContextId
        });
        await new Promise(function (resolve) { setTimeout(resolve, checkInterval) });
        if (element) break;
    }

    await setValueOfNamebyTyping({ executionContextId, DOM, Runtime, Input, name: usernameElementName, value: username });

    const passwordElementName: string = args.formconfig.split(',')[3];
    await setValueOfNamebyTyping({ executionContextId, DOM, Runtime, Input, name: passwordElementName, value: password });

    await pressEnterKey({ Runtime, Input, executionContextId });
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

    await pressEnterKey({ Runtime, Input, executionContextId, passwordElementId });
}

/**
 * Execute authentication script based on field ids on the first iframe
 * 
 * @param Page
 * @param Runtime
 * @param Input
 * @param args All arguments
 * @param username Username
 * @param password Password
 * @since 0.0.3
 */
export async function fieldIdFirstIframe({ Page, Runtime, Input, args, username, password }): Promise<void> {
    const { frameId } = await Page.navigate({ url: `${args.url}` });
    await Page.loadEventFired();

    const { executionContextId } = await Page.createIsolatedWorld({ frameId });

    const usernameElementId: string = args.formconfig.split(',')[2];
    await setValueOfIdInFirstIframe({ executionContextId, Runtime, id: usernameElementId, value: username });

    const passwordElementId: string = args.formconfig.split(',')[3];
    await setValueOfIdInFirstIframe({ executionContextId, Runtime, id: passwordElementId, value: password });

    await pressEnterKey({ Runtime, Input, executionContextId, passwordElementId });
}

/**
 * UNTESTED
 * Execute authentication script based on field id on an iframe id, password only
 * 
 * @param Page
 * @param Runtime
 * @param Input
 * @param args All arguments
 * @param password Password
 * @since 0.0.3
 */
export async function fieldIdIframeOnlyPwd({ Page, Runtime, Input, args, password }): Promise<void> {
    const { frameId } = await Page.navigate({ url: `${args.url}` });
    await Page.loadEventFired();

    const { executionContextId } = await Page.createIsolatedWorld({ frameId });

    const iframeElementId = args.formconfig.split(',')[3];

    const passwordElementId: string = args.formconfig.split(',')[2];
    await setValueOfIdInIframe({ executionContextId, iframeElementId, Runtime, id: passwordElementId, value: password });

    await pressEnterKey({ Runtime, Input, executionContextId, passwordElementId });
}

/**
 * Execute authentication script based on field id on the first iframe, password only
 * 
 * @param Page
 * @param Runtime
 * @param Input
 * @param args All arguments
 * @param password Password
 * @since 0.0.3
 */
export async function fieldIdFirstIframeOnlyPwd({ Page, Runtime, Input, args, password }): Promise<void> {
    const { frameId } = await Page.navigate({ url: `${args.url}` });
    await Page.loadEventFired();

    const { executionContextId } = await Page.createIsolatedWorld({ frameId });

    const passwordElementId: string = args.formconfig.split(',')[1];
    await setValueOfIdInFirstIframe({ executionContextId, Runtime, id: passwordElementId, value: password });

    await pressEnterKey({ Runtime, Input, executionContextId, passwordElementId });
}

/**
 * Execute authentication script based on field id and type password on the first iframe, password only
 * 
 * @param Page
 * @param Runtime
 * @param Input
 * @param args All arguments
 * @param password Password
 * @since 0.0.3
 */
export async function fieldIdTypePasswordFirstIframeOnlyPwd({ Page, Runtime, Input, args, password }): Promise<void> {
    const { frameId } = await Page.navigate({ url: `${args.url}` });
    await Page.loadEventFired();

    const { executionContextId } = await Page.createIsolatedWorld({ frameId });

    const passwordElementId: string = args.formconfig.split(',')[1];
    await setValueOfIdTypePasswordInFirstIframe({ executionContextId, Runtime, id: passwordElementId, value: password });

    await pressEnterKey({ Runtime, Input, executionContextId, passwordElementId });
}

/**
 * Execute authentication script based on field id, password only
 * 
 * @param Page
 * @param Runtime
 * @param DOM
 * @param Input
 * @param args All arguments
 * @param password
 * @since 0.0.3
 */
export async function fieldIdOnlyPwd({ Page, Runtime, DOM, Input, args, password }): Promise<void> {
    const { frameId } = await Page.navigate({ url: `${args.url}` });
    await Page.loadEventFired();

    const { executionContextId } = await Page.createIsolatedWorld({ frameId });

    const passwordElementId: string = args.formconfig.split(',')[1];

    const timeout = 10000;
    const checkInterval = 150;
    const startTime = Date.now();
    let element = null;

    while (Date.now() - startTime < timeout && !element) {
        try {
            element = await Runtime.evaluate({
                expression: `document.getElementById("${passwordElementId}");`,
                contextId: executionContextId
            });
        } catch (e) { element = null }
        await new Promise(function (resolve) { setTimeout(resolve, checkInterval) });
        if (element) break;
    }

    await setValueOfId({ executionContextId, Runtime, DOM, id: passwordElementId, value: password });

    await pressEnterKey({ Runtime, Input, executionContextId, passwordElementId });
}

/**
 * Execute authentication script based on field id, password only typed
 * 
 * @param Page
 * @param Runtime
 * @param DOM
 * @param Input
 * @param args All arguments
 * @param password
 * @since 0.0.3
 */
export async function fieldIdOnlyPwdTyping({ Page, Runtime, DOM, Input, args, password }): Promise<void> {
    const { frameId } = await Page.navigate({ url: `${args.url}` });
    await Page.loadEventFired();

    const { executionContextId } = await Page.createIsolatedWorld({ frameId });

    const passwordElementId: string = args.formconfig.split(',')[1];

    const timeout = 10000;
    const checkInterval = 150;
    const startTime = Date.now();
    let element = null;

    while (Date.now() - startTime < timeout && !element) {
        try {
            element = await Runtime.evaluate({
                expression: `document.getElementById("${passwordElementId}");`,
                contextId: executionContextId
            });
        } catch (e) { element = null }
        await new Promise(function (resolve) { setTimeout(resolve, checkInterval) });
        if (element) break;
    }

    await setValueOfIdbyTyping({ executionContextId, Runtime, DOM, Input, id: passwordElementId, value: password });

    await pressEnterKey({ Runtime, Input, executionContextId, passwordElementId });
}

/**
 * Presses Enter Key automagically
 * 
 * @param Runtime
 * @param Input
 * @param executionContextId
 * @param passwordElementId Password input element ID
 * @since 0.0.3
 */
async function pressEnterKey({ Runtime, Input, executionContextId, passwordElementId = null }: {
    Runtime, Input, executionContextId, passwordElementId?: string | null
}) {
    if (!(passwordElementId === null)) {
        try {
            await Runtime.evaluate({
                expression: `document.querySelector("frame").contentWindow.document.getElementById("${passwordElementId}").focus()`,
                contextId: executionContextId
            });
        } catch (e) { }
        try {
            await Runtime.evaluate({
                expression: `document.getElementById('${passwordElementId}').focus()`,
                contextId: executionContextId
            });
        } catch (e) { }
    }
    try {
        Runtime.evaluate({
            expression: `document.body.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, cancelable: true, key: 'Enter',}));`,
            contextId: executionContextId
        });
    } catch (e) { }
    try {
        Input.dispatchKeyEvent({
            type: 'char',
            text: '\r', // Use '\r' for Enter key
            windowsVirtualKeyCode: 13,
            nativeVirtualKeyCode: 13
        });
    } catch (e) { }
}


/**
 * Execute authentication script specific form, autoridade tributária
 * 
 * @param Page
 * @param Runtime
 * @param DOM
 * @param Input
 * @param args All arguments
 * @param username
 * @param password
 * @since 0.0.3
 */
export async function specAt({ Page, Runtime, DOM, Input, args, username, password }): Promise<void> {
    const { frameId } = await Page.navigate({ url: `${args.url}` });
    await Page.loadEventFired();

    const { executionContextId } = await Page.createIsolatedWorld({ frameId });

    await Runtime.evaluate({
        expression: `document.getElementById("tab2").click();`,
        contextId: executionContextId
    });

    await new Promise(function () {
        setTimeout(function (resolve) { resolve() }, 1000)
    });

    const usernameElementId: string = args.formconfig.split(',')[2];

    const timeout = 10000;
    const checkInterval = 150;
    const startTime = Date.now();
    let element = null;

    while (Date.now() - startTime < timeout && !element) {
        try {
            element = await Runtime.evaluate({
                expression: `document.getElementById("${usernameElementId}");`,
                contextId: executionContextId
            });
        } catch (e) { element = null }
        await new Promise(function (resolve) { setTimeout(resolve, checkInterval) });
        if (element) break;
    }

    await setValueOfId({ executionContextId, Runtime, DOM, id: usernameElementId, value: username });

    const passwordElementId: string = args.formconfig.split(',')[3];
    await setValueOfId({ executionContextId, Runtime, DOM, id: passwordElementId, value: password });

    await new Promise(function () {
        setTimeout(function (resolve) { resolve() }, 1000)
    });

    await pressEnterKey({ Runtime, Input, executionContextId, passwordElementId });
}

/**
* Execute authentication script specific form, free pbx administration
* 
* @param Page
* @param Runtime
* @param Input
* @param args All arguments
* @param username Username
* @param password Password
* @since 0.0.3
*/
export async function specFreePbx({ Page, Runtime, args, username, password }): Promise<void> {
    const { frameId } = await Page.navigate({ url: `${args.url}` });
    await Page.loadEventFired();

    const { executionContextId } = await Page.createIsolatedWorld({ frameId });

    await Runtime.evaluate({
        expression: `document.getElementById("login_admin").click();`,
        contextId: executionContextId
    });

    const timeout = 10000;
    const checkInterval = 150;
    const startTime = Date.now();
    let element = null;

    while (Date.now() - startTime < timeout && !element) {
        try {
            element = await Runtime.evaluate({
                expression: `document.querySelector("#loginform > div:nth-child(2) > input")`,
                contextId: executionContextId
            });
        } catch (e) { element = null }
        await new Promise(function (resolve) { setTimeout(resolve, checkInterval) });
        if (element) break;
    }

    while (Date.now() - startTime < timeout) {
        try {
            await Runtime.evaluate({
                expression: `$("#loginform > div:nth-child(2) > input")[0].value = "${username}"`
            });
        } catch (e) { }
        try {
            await Runtime.evaluate({
                expression: `$("#loginform > div:nth-child(2) > input")[1].value = "${username}"`
            });
        } catch (e) { }
        try {
            await Runtime.evaluate({
                expression: `$("#loginform > div:nth-child(3) > input")[0].value = "${password}"`
            });
        } catch (e) { }
        try {
            await Runtime.evaluate({
                expression: `$("#loginform > div:nth-child(3) > input")[1].value = "${password}"`
            });
        } catch (e) { }
        try {
            const currentPassword = await Runtime.evaluate({
                expression: `$("#loginform > div:nth-child(3) > input")[0].value`
            });
            if (currentPassword.result.value === password) break;
        } catch (e) { }
        await new Promise(function (resolve) { setTimeout(resolve, checkInterval) });
    }

    try {
        element = await Runtime.evaluate({
            expression: `document.querySelector("body > div.ui-dialog.ui-corner-all.ui-widget.ui-widget-content.ui-front.ui-dialog-buttons.ui-draggable > div.ui-dialog-buttonpane.ui-widget-content.ui-helper-clearfix > div > button:nth-child(1)").click()`,
            contextId: executionContextId
        });
    } catch (e) { }

    //await pressEnterKey({ Runtime, Input, executionContextId });
}