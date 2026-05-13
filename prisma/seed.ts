// Seeds two campuses, an admin, two demo students, and a handful of listings
// so the app feels lived-in on first boot.
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Wipe tables that are safe to wipe — keeps `npm run seed` idempotent.
  await prisma.message.deleteMany({});
  await prisma.claim.deleteMany({});
  await prisma.photo.deleteMany({});
  await prisma.listing.deleteMany({});
  await prisma.notification.deleteMany({});
  await prisma.broadcast.deleteMany({});
  await prisma.otpToken.deleteMany({});
  await prisma.rateLimit.deleteMany({});

  const admin = await prisma.user.upsert({
    where: { email: "admin@igdtuw.ac.in" },
    update: { role: "admin", campus: "IGDTUW", name: "N. Sharma" },
    create: {
      email: "admin@igdtuw.ac.in",
      role: "admin",
      campus: "IGDTUW",
      name: "N. Sharma",
    },
  });

  const anjali = await prisma.user.upsert({
    where: { email: "anjali.s@igdtuw.ac.in" },
    update: { campus: "IGDTUW", name: "Anjali S." },
    create: { email: "anjali.s@igdtuw.ac.in", campus: "IGDTUW", name: "Anjali S." },
  });

  const riya = await prisma.user.upsert({
    where: { email: "riya.m@iiitd.ac.in" },
    update: { campus: "IIIT Delhi", name: "Riya M." },
    create: { email: "riya.m@iiitd.ac.in", campus: "IIIT Delhi", name: "Riya M." },
  });

  const items = [
    {
      kind: "found",
      title: "Black Wired Earbuds — JBL",
      description:
        "Found on a bench outside CS Block 2nd floor near room 214. Black with red trim, slightly tangled in a pouch. One earbud has a scratch on the back.",
      category: "electronics",
      campus: "IGDTUW",
      locationName: "CS Block, 2F",
      ownerId: anjali.id,
      handover: "desk",
      happenedAt: new Date(Date.now() - 2 * 3600 * 1000),
      status: "open",
    },
    {
      kind: "found",
      title: "College ID — Riya M.",
      description: "Found near the main gate, lanyard intact.",
      category: "documents",
      campus: "IGDTUW",
      locationName: "Main Gate",
      ownerId: anjali.id,
      handover: "desk",
      happenedAt: new Date(Date.now() - 4 * 3600 * 1000),
      status: "open",
    },
    {
      kind: "found",
      title: "Silver Keychain",
      description: "Bunch of three keys with a small silver tag.",
      category: "keys",
      campus: "IIIT Delhi",
      locationName: "Library, 1F",
      ownerId: riya.id,
      handover: "keep",
      happenedAt: new Date(Date.now() - 26 * 3600 * 1000),
      status: "claimed",
    },
    {
      kind: "found",
      title: "Blue Hoodie · M",
      description: "Plain blue hoodie, size medium, left on a bench.",
      category: "clothing",
      campus: "IGDTUW",
      locationName: "Sports Complex",
      ownerId: anjali.id,
      handover: "desk",
      happenedAt: new Date(Date.now() - 30 * 3600 * 1000),
      status: "open",
    },
    {
      kind: "found",
      title: "Calculator Casio fx-991",
      description: "Scientific calculator with name written on the back.",
      category: "electronics",
      campus: "IIIT Delhi",
      locationName: "Math Lab",
      ownerId: riya.id,
      handover: "desk",
      happenedAt: new Date(Date.now() - 50 * 3600 * 1000),
      status: "returned",
    },
    {
      kind: "found",
      title: "Brown Tote Bag",
      description: "Brown canvas tote with a few notebooks inside.",
      category: "accessories",
      campus: "IGDTUW",
      locationName: "Canteen",
      ownerId: anjali.id,
      handover: "keep",
      happenedAt: new Date(Date.now() - 52 * 3600 * 1000),
      status: "open",
    },
    {
      kind: "lost",
      title: "AirPods Pro",
      description: "Lost in the library on the 3rd floor near the window seats.",
      category: "electronics",
      campus: "IGDTUW",
      locationName: "Library, 3F",
      ownerId: anjali.id,
      handover: "keep",
      happenedAt: new Date(Date.now() - 24 * 3600 * 1000),
      status: "open",
    },
  ];

  for (const it of items) {
    await prisma.listing.create({ data: it });
  }

  await prisma.notification.create({
    data: {
      userId: anjali.id,
      kind: "broadcast",
      title: "Welcome to CampusFind",
      body: "Post anything you find — owners can claim it without you sharing your identity.",
    },
  });

  console.log("Seed complete.");
  console.log("Admin email:", admin.email);
  console.log("Student demo emails:", anjali.email, riya.email);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
