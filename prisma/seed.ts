import { db } from "../src/lib/db";

async function main() {
  await db.siteSettings.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      name: "Aïmane Affagnon",
      tagline: "Entrepreneur · Formation & accompagnement business",
      bio: "Aïmane Affagnon aide les entrepreneurs à structurer et développer leur activité avec des méthodes concrètes et des produits pensés pour le passage à l'échelle.",
      photoUrl: "", // empty → renders an elegant monogram avatar by default
      accent: "gold",
    },
  });

  console.log("✓ Seeded default site settings");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
