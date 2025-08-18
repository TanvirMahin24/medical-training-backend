-- CreateIndex
CREATE INDEX "badges_name_idx" ON "badges"("name");

-- CreateIndex
CREATE INDEX "badges_isActive_idx" ON "badges"("isActive");

-- CreateIndex
CREATE INDEX "badges_createdAt_idx" ON "badges"("createdAt");

-- CreateIndex
CREATE INDEX "medical_cases_difficulty_idx" ON "medical_cases"("difficulty");

-- CreateIndex
CREATE INDEX "medical_cases_category_idx" ON "medical_cases"("category");

-- CreateIndex
CREATE INDEX "medical_cases_tags_idx" ON "medical_cases"("tags");

-- CreateIndex
CREATE INDEX "medical_cases_isActive_idx" ON "medical_cases"("isActive");

-- CreateIndex
CREATE INDEX "medical_cases_isPublished_idx" ON "medical_cases"("isPublished");

-- CreateIndex
CREATE INDEX "medical_cases_createdAt_idx" ON "medical_cases"("createdAt");

-- CreateIndex
CREATE INDEX "medical_cases_createdBy_idx" ON "medical_cases"("createdBy");

-- CreateIndex
CREATE INDEX "payment_methods_userId_idx" ON "payment_methods"("userId");

-- CreateIndex
CREATE INDEX "payment_methods_type_idx" ON "payment_methods"("type");

-- CreateIndex
CREATE INDEX "payment_methods_isDefault_idx" ON "payment_methods"("isDefault");

-- CreateIndex
CREATE INDEX "payment_methods_stripePaymentMethodId_idx" ON "payment_methods"("stripePaymentMethodId");

-- CreateIndex
CREATE INDEX "payments_userId_idx" ON "payments"("userId");

-- CreateIndex
CREATE INDEX "payments_status_idx" ON "payments"("status");

-- CreateIndex
CREATE INDEX "payments_amount_idx" ON "payments"("amount");

-- CreateIndex
CREATE INDEX "payments_createdAt_idx" ON "payments"("createdAt");

-- CreateIndex
CREATE INDEX "payments_stripePaymentIntentId_idx" ON "payments"("stripePaymentIntentId");

-- CreateIndex
CREATE INDEX "sessions_userId_idx" ON "sessions"("userId");

-- CreateIndex
CREATE INDEX "sessions_token_idx" ON "sessions"("token");

-- CreateIndex
CREATE INDEX "sessions_expiresAt_idx" ON "sessions"("expiresAt");

-- CreateIndex
CREATE INDEX "sessions_isActive_idx" ON "sessions"("isActive");

-- CreateIndex
CREATE INDEX "sessions_createdAt_idx" ON "sessions"("createdAt");

-- CreateIndex
CREATE INDEX "subscriptions_userId_idx" ON "subscriptions"("userId");

-- CreateIndex
CREATE INDEX "subscriptions_status_idx" ON "subscriptions"("status");

-- CreateIndex
CREATE INDEX "subscriptions_planType_idx" ON "subscriptions"("planType");

-- CreateIndex
CREATE INDEX "subscriptions_currentPeriodEnd_idx" ON "subscriptions"("currentPeriodEnd");

-- CreateIndex
CREATE INDEX "subscriptions_createdAt_idx" ON "subscriptions"("createdAt");

-- CreateIndex
CREATE INDEX "user_badges_userId_idx" ON "user_badges"("userId");

-- CreateIndex
CREATE INDEX "user_badges_badgeId_idx" ON "user_badges"("badgeId");

-- CreateIndex
CREATE INDEX "user_badges_earnedAt_idx" ON "user_badges"("earnedAt");

-- CreateIndex
CREATE INDEX "user_profiles_userId_idx" ON "user_profiles"("userId");

-- CreateIndex
CREATE INDEX "user_profiles_specialization_idx" ON "user_profiles"("specialization");

-- CreateIndex
CREATE INDEX "user_profiles_experienceYears_idx" ON "user_profiles"("experienceYears");

-- CreateIndex
CREATE INDEX "user_progress_userId_idx" ON "user_progress"("userId");

-- CreateIndex
CREATE INDEX "user_progress_caseId_idx" ON "user_progress"("caseId");

-- CreateIndex
CREATE INDEX "user_progress_score_idx" ON "user_progress"("score");

-- CreateIndex
CREATE INDEX "user_progress_completedAt_idx" ON "user_progress"("completedAt");

-- CreateIndex
CREATE INDEX "user_progress_createdAt_idx" ON "user_progress"("createdAt");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_role_idx" ON "users"("role");

-- CreateIndex
CREATE INDEX "users_subscriptionStatus_idx" ON "users"("subscriptionStatus");

-- CreateIndex
CREATE INDEX "users_createdAt_idx" ON "users"("createdAt");

-- CreateIndex
CREATE INDEX "users_isEmailVerified_idx" ON "users"("isEmailVerified");
