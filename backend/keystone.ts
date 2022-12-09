import { createAuth } from "@keystone-next/auth";
import { config, createSchema } from "@keystone-next/keystone/schema";
import { statelessSessions, withItemData } from "@keystone-next/keystone/session";
import "dotenv/config";
import { accessEnv, sendPasswordResetEmail } from "./lib";
import { extendGraphqlSchema } from "./mutations";
import {
  permissionsList,
  CartItem,
  Order,
  OrderItem,
  Product,
  ProductImage,
  Role,
  User,
} from "./schemas";

const databaseURL = accessEnv("DATABASE_URL", "mongodb://localhost/keystone");
const deployPrevURL = new RegExp(accessEnv("DEPLOY_PREV_URL", "localhost"));
const prodURL = accessEnv("PROD_URL", "https://change-me.vercel.app/");
const sessionDomain = accessEnv("DOMAIN_URL", "localhost");
const sessionSecret = accessEnv(
  "COOKIE_SECRET",
  "8r5a4LVRBiZtz8Uca7jfnHjll31ctXnZVIxOHWhqQLlVOWUGGc3lxVGQjFqVgD9uUboRWCDqoKbl4Zp4GOC7lFAURatavdUMucOLzi0Ps6PI9Ho0LGViDeejX99VLn0G"
);
const port = parseInt(accessEnv("PORT", "7771"));

const sessionConfig = {
  maxAge: 1000 * 60 * 60 * 24 * 30, // 30 days
  secret: sessionSecret,
  domain: sessionDomain,
};

const { withAuth } = createAuth({
  listKey: "User",
  identityField: "email",
  secretField: "password",
  
  passwordResetLink: {
    async sendToken(args) {
      await sendPasswordResetEmail(args.token, args.identity);
    },
  },
});

export default withAuth(
  config({
    server: {
      cors: {
        origin: [new RegExp("localhost"), deployPrevURL, prodURL],
        credentials: true,
      },
      port: port,
    },
    db: {
      adapter: "mongoose",
      url: databaseURL,
      async onConnect() {
        console.log("Connected to the database!");
      },
    },
    lists: createSchema({ CartItem, User, Order, OrderItem, Product, ProductImage, Role }),
    extendGraphqlSchema,
    ui: {
      isAccessAllowed: ({ session }) => Boolean(session?.data),
    },
    session: withItemData(statelessSessions(sessionConfig), {
      User: `id name email role { ${permissionsList.join(" ")} }`,
    }),
  })
);
