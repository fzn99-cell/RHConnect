import dotenv from "dotenv";
dotenv.config();

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  // 1. Admin user from env (keep yours)
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    console.error("ADMIN_EMAIL and ADMIN_PASSWORD must be set in .env");
    process.exit(1);
  }

  const existingAdmin = await prisma.user.findUnique({ where: { email } });
  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash(password, 10);
    await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName: "Super",
        lastName: "Admin",
        fullName: "Super Admin",
        role: "admin",
        department: "none",
      },
    });
    console.log("Admin account created");
  } else {
    console.log("Admin already exists");
  }

  // 2. Other users seed (with hashed password)
  const plainPassword = "Test1234"; // for test users
  const hashedPassword = await bcrypt.hash(plainPassword, 10);

  const usersData = [
    {
      email: "employee1@example.com",
      firstName: "John",
      lastName: "Doe",
      fullName: "John Doe",
      role: "employee",
      department: "none",
      password: hashedPassword,
    },
    {
      email: "hr1@example.com",
      firstName: "John",
      lastName: "Doe",
      fullName: "John Doe",
      role: "hr",
      department: "none",
      password: hashedPassword,
    },
    {
      email: "tl1@example.com",
      firstName: "Alice",
      lastName: "Smith",
      fullName: "Alice Smith",
      role: "tl",
      department: "none",
      password: hashedPassword,
    },
    {
      email: "nurse1@example.com",
      firstName: "Marie",
      lastName: "Curie",
      fullName: "Marie Curie",
      role: "nurse",
      department: "nurse",
      password: hashedPassword,
    },
  ];

  for (const userData of usersData) {
    const exists = await prisma.user.findUnique({
      where: { email: userData.email },
    });
    if (!exists) {
      await prisma.user.create({ data: userData });
      console.log(`User created: ${userData.email}`);
    }
  }

  // 3. Sample Requests linked to employee1@example.com
  const employee = await prisma.user.findUnique({
    where: { email: "employee1@example.com" },
  });
  if (!employee) {
    throw new Error("Seed error: employee1 not found");
  }

  // Create a Payslip Request
  await prisma.request.create({
    data: {
      userId: employee.id,
      requestType: "payslip",
      description: "Requesting payslip for July 2025",
      status: "pending",
      payslipRequest: {
        create: {
          deliveryMode: "Download",
        },
      },
      files: {
        create: [
          {
            originalName: "payslip_july_2025.pdf",
            storedName: "abc123.pdf",
            filePath: "/files/payslip_july_2025.pdf",
          },
        ],
      },
    },
  });

  await prisma.request.create({
    data: {
      userId: employee.id,
      requestType: "medicalFileUpdate",
      description: "Update medical record with latest test results",
      status: "pending",
      medicalFileUpdateRequest: {
        create: {
          notes: "Please review urgently",
          mrid: "abcd1234",
          reviewedBy: null,
        },
      },
    },
  });

  // Create a Leave Request
  const leaveRequest = await prisma.request.create({
    data: {
      userId: employee.id,
      requestType: "leave",
      description: "Requesting annual leave from Aug 1 to Aug 10",
      status: "approved",
      leaveRequest: {
        create: {
          startDate: new Date("2025-08-01"),
          endDate: new Date("2025-08-10"),
        },
      },
    },
  });

  // Create a Medical File Update Request (for nurse role)
  await prisma.request.create({
    data: {
      userId: employee.id,
      requestType: "medicalFileUpdate",
      description: "Update medical record with latest test results",
      status: "pending",
      medicalFileUpdateRequest: {
        create: {
          notes: "Please review urgently",
          mrid: "abcd1234",
          reviewedBy: null,
        },
      },
    },
  });

  console.log("Sample requests created.");

  // 4. Notifications example (notify TL about leave request)
  const tlUser = await prisma.user.findUnique({
    where: { email: "tl1@example.com" },
  });
  if (tlUser) {
    await prisma.notification.create({
      data: {
        userId: tlUser.id,
        requestId: leaveRequest.id,
        title: "Nouvelle demande de congé",
        message: "Une nouvelle demande de congé a été soumise.",
      },
    });
    console.log("Notification created for TL.");
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
