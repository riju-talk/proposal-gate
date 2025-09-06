import { Profile } from "@shared/schema";

declare global {
  namespace Express {
    interface Request {
      user?: Profile;
    }
  }
}
