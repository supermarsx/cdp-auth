/**
 * Set value of an element with a specific ID inside an Iframe
 * 
 * @param executionContextId
 * @param iframeElementId Iframe element ID
 * @param Runtime
 * @param id Element ID
 * @param value Element value
 * @since 0.0.1
 */
export async function setValueOfIdInIframe({ executionContextId, iframeElementId, Runtime, id, value }) {
    const timeout = 10000;
    const checkInterval = 150;
    const startTime = Date.now();

    while (Date.now() - startTime < timeout) {
        await Runtime.evaluate({
            expression: `document.getElementById("${iframeElementId}").contentWindow.document.getElementById("${id}").value = "${value}";`,
            contextId: executionContextId
        });
        await new Promise(function (resolve) { setTimeout(resolve, checkInterval) });
        const currentValue = await Runtime.evaluate({
            expression: `document.getElementById("${iframeElementId}").contentWindow.document.getElementById("${id}").value;`,
            contextId: executionContextId
        });
        if (currentValue.result.value === value) break;
    }
}


/**
 * Set value of an element with a specific ID inside first Iframe
 * 
 * @param Runtime
 * @param executionContextId
 * @param id Element ID
 * @param value Element value
 * @since 0.0.1
 */
export async function setValueOfIdInFirstIframe({ Runtime, executionContextId, id, value }) {
    const timeout = 10000;
    const checkInterval = 150;
    const startTime = Date.now();

    while (Date.now() - startTime < timeout) {
        await Runtime.evaluate({
            expression: `document.querySelector("frame").contentWindow.document.getElementById("${id}").value = "${value}";`,
            contextId: executionContextId
        });
        await new Promise(function (resolve) { setTimeout(resolve, checkInterval) });
        const currentValue = await Runtime.evaluate({
            expression: `document.querySelector("frame").contentWindow.document.getElementById("${id}").value;`,
            contextId: executionContextId
        });
        if (currentValue.result.value === value) break;
    }
}

/**
* Set value of an element with a specific ID of input type password inside first Iframe
* 
* @param Runtime
* @param executionContextId
* @param id Element ID
* @param value Element value
* @since 0.0.1
*/
export async function setValueOfIdTypePasswordInFirstIframe({ Runtime, executionContextId, id, value }) {
    const timeout = 10000;
    const checkInterval = 150;
    const startTime = Date.now();

    while (Date.now() - startTime < timeout) {
        await Runtime.evaluate({
            expression: `document.querySelector("frame").contentWindow.document.querySelector("input[type='password']#${id}").value = "${value}";`,
            contextId: executionContextId
        });
        await new Promise(function (resolve) { setTimeout(resolve, checkInterval) });
        const currentValue = await Runtime.evaluate({
            expression: `document.querySelector("frame").contentWindow.document.querySelector("input[type='password']#${id}").value;`,
            contextId: executionContextId
        });
        if (currentValue.result.value === value) break;
    }
}