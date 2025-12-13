import type { CorsOptions } from "cors";

export const corsConfig: CorsOptions = {
  origin: function (origin, callback) {
    // Allow requests from FRONTEND_URL and localhost during development
    const whitelist = [process.env.FRONTEND_URL, "http://localhost:5173"];

    if (whitelist.includes(origin)) {
      callback(null, true);
    } else {
      // Allow requests with no origin only in development
      if (!origin && process.env.NODE_ENV === "development")
        return callback(null, true);

      // else reject the request
      callback(null, false);
    }
  },
  credentials: true,
};
