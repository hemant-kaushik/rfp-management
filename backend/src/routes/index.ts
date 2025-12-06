import { Router } from "express";
import rfpRoutes from "./rfp.routes";
import vendorRoutes from "./vendor.routes";
import proposalRoutes from "./proposal.routes";
import emailRoutes from "./email.routes";

const appRouter = Router();

const appRoutes = [
    {path: "/rfps", router: rfpRoutes},
    {path: "/vendors", router: vendorRoutes},
    {path: "/proposals", router: proposalRoutes},
    {path: "/email", router: emailRoutes},
]

appRoutes.forEach(route => {
    appRouter.use(route.path, route.router);
});

export default appRouter;