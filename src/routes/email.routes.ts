import { Router } from "express";

import { testEmail } from "../controllers/email/email.controller";

const emailRouter = Router();

emailRouter.post("/test", testEmail);

export default emailRouter;
