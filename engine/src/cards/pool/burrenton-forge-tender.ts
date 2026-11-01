import { defineCard } from "../define.js";

// The source is chosen as the ability resolves (rule 609.7a), a permanent spell
// staying covered as the permanent it becomes (the rulings); a source that
// stops being red isn't stopped (609.7b).

const TEXT = "Sacrifice this creature: Prevent all damage a red source of your choice would deal this turn.";

export default defineCard({
  name: "Burrenton Forge-Tender",
  manaCost: "{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Kithkin", "Wizard"],
  power: 1,
  toughness: 1,
  text: `Protection from red\n${TEXT}`,
  static: [{ affects: { scope: "self" }, protection: { colors: ["R"] }, text: "Protection from red" }],
  activated: [
    {
      cost: { mana: null, tap: false, sacrifice: "self" },
      targets: [],
      effect: { kind: "prevent-damage-from-chosen-source", filter: { colors: ["R"] }, to: "any", amount: "all" },
      resolve: null,
      text: TEXT,
    },
  ],
});
