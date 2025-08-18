-- CreateTable
CREATE TABLE "simulation_sessions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "currentVisit" INTEGER NOT NULL DEFAULT 1,
    "currentTask" TEXT,
    "playerPosition" JSONB NOT NULL,
    "gameState" JSONB NOT NULL,
    "score" INTEGER NOT NULL DEFAULT 0,
    "timeSpent" INTEGER NOT NULL DEFAULT 0,
    "completedTasks" TEXT[],
    "patientState" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "simulation_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "simulation_sessions_userId_idx" ON "simulation_sessions"("userId");

-- CreateIndex
CREATE INDEX "simulation_sessions_caseId_idx" ON "simulation_sessions"("caseId");

-- CreateIndex
CREATE INDEX "simulation_sessions_isActive_idx" ON "simulation_sessions"("isActive");

-- CreateIndex
CREATE INDEX "simulation_sessions_createdAt_idx" ON "simulation_sessions"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "simulation_sessions_userId_caseId_key" ON "simulation_sessions"("userId", "caseId");

-- AddForeignKey
ALTER TABLE "simulation_sessions" ADD CONSTRAINT "simulation_sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "simulation_sessions" ADD CONSTRAINT "simulation_sessions_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "medical_cases"("id") ON DELETE CASCADE ON UPDATE CASCADE;
