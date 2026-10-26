import { defineCard } from "../define.js";

const TEXT = "Sacrifice this creature: You gain 4 life. Activate only during your upkeep.";

export default defineCard({
  name: "Augur il-Vec",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Cleric"],
  power: 1,
  toughness: 3,
  keywords: ["shadow"],
  text: `Shadow (This creature can block or be blocked by only creatures with shadow.)\n${TEXT}`,
  activated: [
    {
      cost: { mana: null, tap: false, sacrifice: "self" },
      condition: { kind: "all", of: [{ kind: "your-turn" }, { kind: "turn-structure", steps: ["upkeep"] }] },
      targets: [],
      effect: { kind: "gain-life", amount: 4 },
      resolve: null,
      text: TEXT,
    },
  ],
});
