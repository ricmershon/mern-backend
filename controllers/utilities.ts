import { ResultFactory, validationResult } from "express-validator";

export const getValidationMessages: ResultFactory<string> = validationResult.withDefaults({
    formatter: (error) => error.msg as string
});