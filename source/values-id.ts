

/**
 * Set value of an element with a specific ID
 * 
 * @param executionContextId
 * @param Runtime
 * @param DOM
 * @param id Element ID
 * @param value Value to set
 * @since 0.0.1
 */
export async function setValueOfId({ executionContextId, Runtime, DOM, id, value }) {
    const timeout = 10000;
    const checkInterval = 150;
    const startTime = Date.now();
    console.log(executionContextId);    

    const { root } = await DOM.getDocument();
    const element = await DOM.querySelector({ nodeId: root.nodeId, selector: `#${id}` });

    while (Date.now() - startTime < timeout) {
        try {
            await DOM.focus({ nodeId: element.nodeId });
            //await DOM.setAttributeValue({ name: 'value', nodeId: element.nodeId, value: value });
            await Runtime.evaluate({
                expression: `document.getElementById("${id}").value = '${value}'`
            });
        } catch (e) { }
        await new Promise(function (resolve) { setTimeout(resolve, checkInterval) });
        const currentValue = await Runtime.evaluate({
            expression: `document.getElementById("${id}").value;`
        });
        if (currentValue.result.value === value) break;

    }
}

/**
 * Set value of an element with a specific ID by typing (alternative)
 * 
 * @param executionContextId
 * @param DOM
 * @param Runtime
 * @param Input
 * @param id Element ID
 * @param value Element value
 * @since 0.0.1
 */
export async function setValueOfIdbyTyping({ executionContextId, DOM, Runtime, Input, id, value }) {
    const timeout = 10000;
    const checkInterval = 250;
    const startTime = Date.now();

    const { root } = await DOM.getDocument();
    const element = await DOM.querySelector({ nodeId: root.nodeId, selector: `#${id}` });

    while (Date.now() - startTime < timeout) {
        await DOM.focus({ nodeId: element.nodeId });
        await Input.insertText({ text: value });
        await new Promise(function (resolve) { setTimeout(resolve, checkInterval) });
        const currentValue = await Runtime.evaluate({
            expression: `document.getElementById("${id}").value;`,
            contextId: executionContextId
        });
        if (currentValue.result.value === value) break;
    }

}