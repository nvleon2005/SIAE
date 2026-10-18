import { setupWorker } from "msw/browser";
import { authHandlers } from "@/tests/mocks/auth-handlers";
import { emergencyHandlers } from "@/tests/mocks/handlers";

export const worker = setupWorker(...emergencyHandlers, ...authHandlers);
