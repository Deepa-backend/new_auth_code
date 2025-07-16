
import { ZodError } from "zod";
import sendResponse from "../utils/sendResponse.js";

export const validateRequest = (schema) => async (req, res, next) => {
  try {
    const parsedBody = await schema.parseAsync(req.body);
    req.body = parsedBody;
    next();
  } catch (err) {
    const isZod = err instanceof ZodError || err?.name === "ZodError";

    if (isZod && Array.isArray(err.errors)) {
      const formattedErrors = err.errors.map((e) => ({
        field: e.path.join("."),
        message: e.message,
      }));

      return sendResponse(res, "Validation error", 400, false, formattedErrors);
    }

    // Still log unexpected error for debugging
    console.error("❌ Unexpected validation middleware error:", err);
    return sendResponse(res, "Unexpected error", 500, false);
  }
};

//   try {
//         const parsedBody = await schema.parseAsync(req.body);
//         req.body = parsedBody;
//         next();
//     } catch (err) {
//         const message = err.errors?.[0]?.message || "Invalid input data";
//         return sendResponse(res, message, 400, false);
//     }
// };

