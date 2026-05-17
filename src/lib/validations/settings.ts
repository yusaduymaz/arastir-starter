import { z } from "zod";

export const settingsSchema = z.object({
  theme: z.enum(["dark", "light", "system"]),
  notifications_enabled: z
    .preprocess((val) => val === "on" || val === true, z.boolean())
    .default(false),
});