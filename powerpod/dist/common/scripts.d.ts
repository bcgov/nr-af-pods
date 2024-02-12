/**
 * Allows use of a pre-defined script, employs lazy-loading.
 * @function
 * @param {string} id - The id of the associated script.
 * @param {function} onload - A function to be executed on load of the script.
 * @param {function} onerror - A function to be executed on error.
 */
export function useScript(id: string, onload?: Function, onerror?: Function): void;
export namespace Scripts {
    let jquerymask: string;
}
