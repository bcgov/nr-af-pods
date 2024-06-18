import type { TestField } from "./test-field";

export interface TestStep {
    id: number,
    action: string,
    description: string,
    field: TestField,
    button: TestField,
    fields: TestField[],
    url: string,
    executed: boolean,
    failed: boolean,
    results: string
}