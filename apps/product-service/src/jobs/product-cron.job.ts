import prisma from "@packages/libs/prisma";
import cron from "node-cron";

cron.schedule("0 * * * *", async () => {
  try {
    const now = new Date();

    // Dlete products where `deletedAt` is older than 24 hours
    const deletedProducts = await prisma.products.deleteMany({
      where: {
        isDeleted: true,
        deletedAt: {
          lt: now,
        },
      },
    });
    console.log(
      ` ${deletedProducts.count} expired products permanently deleted successfully`,
    );
  } catch (error) {
    console.log("Cron ERROR:", error);
  }
});
