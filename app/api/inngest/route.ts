import { serve } from "inngest/next";
import { inngest } from "../../../inngest/client";
import { indexRepo } from "./functions";
import { generateReview } from "./functions/review";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [indexRepo, generateReview],
});
