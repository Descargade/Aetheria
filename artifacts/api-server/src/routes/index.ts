import { Router, type IRouter } from "express";
import healthRouter from "./health";
import categoriesRouter from "./categories";
import productsRouter from "./products";
import favoritesRouter from "./favorites";
import cartRouter from "./cart";
import ordersRouter from "./orders";
import couponsRouter from "./coupons";
import promotionsRouter from "./promotions";
import shippingRouter from "./shipping";
import paymentsRouter from "./payments";
import adminRouter from "./admin";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/categories", categoriesRouter);
router.use("/products", productsRouter);
router.use("/favorites", favoritesRouter);
router.use("/cart", cartRouter);
router.use("/orders", ordersRouter);
router.use("/coupons", couponsRouter);
router.use("/promotions", promotionsRouter);
router.use("/shipping-methods", shippingRouter);
router.use("/payment-methods", paymentsRouter);
router.use("/admin", adminRouter);

export default router;
