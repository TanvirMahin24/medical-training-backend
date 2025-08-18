/*
  Warnings:

  - Added the required column `subscriptionPlanId` to the `subscriptions` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "subscription_plans" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "tagline" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "duration" INTEGER NOT NULL,
    "keyFeatures" TEXT[],
    "casesPerMonth" INTEGER NOT NULL,
    "simulationsPerMonth" INTEGER NOT NULL,
    "practiceTests" INTEGER NOT NULL,
    "certificates" INTEGER NOT NULL,
    "prioritySupport" BOOLEAN NOT NULL DEFAULT false,
    "offlineAccess" BOOLEAN NOT NULL DEFAULT false,
    "customCases" BOOLEAN NOT NULL DEFAULT false,
    "popular" BOOLEAN NOT NULL DEFAULT false,
    "recommended" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subscription_plans_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "subscription_plans_name_key" ON "subscription_plans"("name");

-- CreateIndex
CREATE INDEX "subscription_plans_name_idx" ON "subscription_plans"("name");

-- CreateIndex
CREATE INDEX "subscription_plans_price_idx" ON "subscription_plans"("price");

-- CreateIndex
CREATE INDEX "subscription_plans_isActive_idx" ON "subscription_plans"("isActive");

-- CreateIndex
CREATE INDEX "subscription_plans_popular_idx" ON "subscription_plans"("popular");

-- CreateIndex
CREATE INDEX "subscription_plans_recommended_idx" ON "subscription_plans"("recommended");

-- CreateIndex
CREATE INDEX "subscription_plans_createdAt_idx" ON "subscription_plans"("createdAt");

-- Insert default subscription plans
INSERT INTO "subscription_plans" ("id", "name", "tagline", "price", "currency", "duration", "keyFeatures", "casesPerMonth", "simulationsPerMonth", "practiceTests", "certificates", "prioritySupport", "offlineAccess", "customCases", "popular", "recommended", "isActive", "createdAt", "updatedAt") VALUES
('default-trial', 'Free Trial', 'Get started with basic features', 0, 'USD', 7, ARRAY['3 basic cases', '2 simulations/month', 'Basic tracking'], 3, 2, 1, 0, false, false, false, false, false, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('default-basic', 'Basic', 'Perfect for students', 19.99, 'USD', 30, ARRAY['15 cases/month', '10 simulations/month', 'Progress analytics', 'Email support'], 15, 10, 5, 2, false, false, false, false, false, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('default-premium', 'Premium', 'Advanced features for professionals', 39.99, 'USD', 30, ARRAY['50+ cases/month', 'Unlimited simulations', 'Advanced analytics', 'Priority support'], 50, -1, -1, 10, true, true, true, true, true, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('default-enterprise', 'Enterprise', 'Complete solution for teams', 99.99, 'USD', 30, ARRAY['Unlimited everything', 'Team management', 'Custom branding', 'Dedicated support'], -1, -1, -1, -1, true, true, true, false, false, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Add the subscriptionPlanId column to subscriptions table
ALTER TABLE "subscriptions" ADD COLUMN "subscriptionPlanId" TEXT;

-- Update existing subscriptions to use the default premium plan
UPDATE "subscriptions" SET "subscriptionPlanId" = 'default-premium' WHERE "subscriptionPlanId" IS NULL;

-- Make the column NOT NULL after updating existing data
ALTER TABLE "subscriptions" ALTER COLUMN "subscriptionPlanId" SET NOT NULL;

-- CreateIndex
CREATE INDEX "subscriptions_subscriptionPlanId_idx" ON "subscriptions"("subscriptionPlanId");

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_subscriptionPlanId_fkey" FOREIGN KEY ("subscriptionPlanId") REFERENCES "subscription_plans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
