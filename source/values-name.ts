/**
 * Set value of an element with a specific name
 * 
 * @param Runtime
 * @param name Element name
 * @param value Element value
 * @since 0.0.1
 */
export async function setValueOfName({ Runtime, name, value }) {
    const timeout = 10000;
    const checkInterval = 150;
    const startTime = Date.now();

    while (Date.now() - startTime < timeout) {
        try {
            await Runtime.evaluate({
                expression: `document.querySelector('[name="${name}"]').value = "${value}";`
            });
        } catch (e) { }
        await new Promise(function (resolve) { setTimeout(resolve, checkInterval) });
        const currentValue = await Runtime.evaluate({
            expression: `document.querySelector('[name="${name}"]').value;`
        });
        if (currentValue.result.value === value) break;
    }
}

/**
 * Set value of an element with a specific name by typing (alternative)
 * 
 * @param executionContextId
 * @param DOM
 * @param Runtime
 * @param Input
 * @param name Element name
 * @param value Element value
 * @since 0.0.2
 */
export async function setValueOfNamebyTyping({ executionContextId, DOM, Runtime, Input, name, value }) {
    const timeout = 10000;
    const checkInterval = 500;
    const startTime = Date.now();

    const { root } = await DOM.getDocument();
    const element = await DOM.querySelector({ nodeId: root.nodeId, selector: `input[name='${name}']` });

    while (Date.now() - startTime < timeout) {
        try {
            await DOM.focus({ nodeId: element.nodeId });
            await Input.insertText({ text: value });
        } catch (e) { }
        await new Promise(function (resolve) { setTimeout(resolve, checkInterval) });

        const currentValue = await Runtime.evaluate({
            expression: `document.getElementsByName("${name}")[0].value;`,
            contextId: executionContextId
        });
        if (currentValue.result.value === value) break;

    }

}

