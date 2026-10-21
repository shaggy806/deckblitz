import { defineCard } from "../define.js";

// Bristlepack Sentry's static: `countsSelf`, since its own power raised to 4
// lets it attack (the ruling); once attacking it stays so.
const TEXT =
  "As long as you control a creature with power 4 or greater, this creature can attack as though it didn't have defender.";

export default defineCard({
  name: "Drowsing Tyrannodon",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Dinosaur"],
  power: 3,
  toughness: 3,
  keywords: ["defender"],
  text: `Defender (This creature can't attack.)\n${TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      condition: {
        kind: "controls",
        filter: { type: "creature", power: { op: "gte", n: 4 } },
        atLeast: 1,
        countsSelf: true,
      },
      canAttackAsThoughNoDefender: true,
      text: TEXT,
    },
  ],
});
