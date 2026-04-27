import { Router, type IRouter } from "express";
import healthRouter from "./health";
import rumahotpRouter from "./rumahotp";
import testimonialsRouter from "./testimonials";
import meRouter from "./me";

const router: IRouter = Router();

router.use(healthRouter);
router.use(rumahotpRouter);
router.use(testimonialsRouter);
router.use(meRouter);

export default router;
