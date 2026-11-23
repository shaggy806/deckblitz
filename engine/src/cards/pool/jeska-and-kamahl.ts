import { defineCard } from "../define.js";

// Playtest card (Mystery Booster 2).
const PING_TEXT = "{T}: Jeska and Kamahl deals 2 damage to target opponent, battle, or planeswalker.";

export default defineCard({
  name: "Jeska and Kamahl",
  manaCost: "{3}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Barbarian", "Warrior"],
  power: 4,
  toughness: 1,
  keywords: ["haste", "first-strike"],
  text: `Haste, first strike\n${PING_TEXT}`,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [
        { kind: "permanent", whose: "any", filter: { typesAnyOf: ["battle", "planeswalker"] }, orPlayer: "opponent" },
      ],
      effect: { kind: "damage", amount: 2, target: 0 },
      resolve: null,
      text: PING_TEXT,
    },
  ],
});
