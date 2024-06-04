import type { TestStep } from "./test-step";

export interface TestScript {
    name: string,
    testSteps: TestStep[]
}