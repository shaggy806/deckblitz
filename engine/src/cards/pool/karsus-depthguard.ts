import { defineCard } from "../define.js";

// EDHREC rank 24118.
//
// Rulings:
//   [2023-04-14] Once Karsus Depthguard has legally attacked, causing its last ability to not
//     apply by reducing its power to 4 or less won't cause it to stop attacking.
//
// Demon Wall's shape, with the condition on its own power; it's checked only
// as attackers are declared (rule 508.1c), so it stays attacking after.

const TEXT = "As long as this creature's power is 5 or greater, it can attack as though it didn't have defender.";

export default defineCard({
  name: "Karsus Depthguard",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Lizard", "Warrior"],
  power: 4,
  toughness: 3,
  keywords: ["defender"],
  text: `Defender\n${TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "source", filter: { power: { op: "gte", n: 5 } } },
      canAttackAsThoughNoDefender: true,
      text: TEXT,
    },
  ],
});
