import { z } from 'zod';

export interface KAPDisclosure {
  title: string;
  date: string;
  company: string;
  url: string;
  content: string;
}

export const KAPDisclosureSchema = z.object({
  title: z.string(),
  date: z.string(),
  company: z.string(),
  url: z.string(),
  content: z.string(),
});
