-- CreateTable
CREATE TABLE "Student" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "grade" INTEGER NOT NULL,
    "classNum" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Admin" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Demerit" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "points" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,
    "assigner" TEXT NOT NULL,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "studentId" TEXT NOT NULL,
    CONSTRAINT "Demerit_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Warning" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "reason" TEXT NOT NULL,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "studentId" TEXT NOT NULL,
    CONSTRAINT "Warning_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Expulsion" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME NOT NULL,
    "totalDays" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Expulsion_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Student_grade_classNum_name_key" ON "Student"("grade", "classNum", "name");

-- CreateIndex
CREATE UNIQUE INDEX "Admin_username_key" ON "Admin"("username");
