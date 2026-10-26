import { defineCard } from "../define.js";

// Dissension. EDHREC rank 28465.

const PING_TEXT = "{T}: This creature deals 2 damage to target attacking or blocking creature.";
const TEXT = `As long as this creature is enchanted, it has "${PING_TEXT}"`;

export default defineCard({
  name: "Freewind Equenaut",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Archer"],
  power: 2,
  toughness: 2,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "source", filter: { enchanted: true } },
      grantsActivated: [
        {
          cost: { mana: null, tap: true },
          targets: ["attacking-or-blocking-creature"],
          effect: { kind: "damage", amount: 2, target: 0 },
          resolve: null,
          text: PING_TEXT,
        },
      ],
      text: TEXT,
    },
  ],
});
