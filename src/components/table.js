import {cloneTemplate} from "../lib/utils.js";

/**
 * Инициализирует таблицу и вызывает коллбэк при любых изменениях и нажатиях на кнопки
 *
 * @param {Object} settings
 * @param {(action: HTMLButtonElement | undefined) => void} onAction
 * @returns {{container: Node, elements: *, render: render}}
 */
export function initTable(settings, onAction) {
    const {tableTemplate, rowTemplate, before, after} = settings;
    const root = cloneTemplate(tableTemplate);


    before.reverse().forEach(subName => {
        root[subName] = cloneTemplate(subName);
        root.container.prepend(root[subName].container);
    });

    after.forEach(subName => {
        root[subName] = cloneTemplate(subName);
        root.container.append(root[subName].container);
    });

    root.container.addEventListener("reset", () => setTimeout(onAction))
    root.container.addEventListener("submit", (event) => {
        event.preventDefault()
        onAction(event.submitter)
    })
    root.container.addEventListener('change', () => {
        onAction();
    });

    const render = (data) => {
        // @todo: #1.1 — преобразовать данные в массив строк на основе шаблона rowTemplate
        const nextRows = data.map(item => {
            const row = cloneTemplate(rowTemplate)
            Object.keys(item).forEach(key => {
                if(row.elements && row.elements[key]) {
                    row.elements[key].textContent = item[key]
                }
            })
            return row.container
        });
        root.elements.rows.replaceChildren(...nextRows);
    }

    return {...root, render};
}