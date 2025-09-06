/*
  Warnings:

  - The values [medicalFileUpdateRequest] on the enum `Request_requestType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterTable
ALTER TABLE `request` MODIFY `requestType` ENUM('workCertificate', 'leave', 'payslip', 'complaint', 'sickLeave', 'medicalFileUpdate') NOT NULL;
