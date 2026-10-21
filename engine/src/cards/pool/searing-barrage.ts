import { defineCard } from "../define.js";

// The adamant damage is additional, to the target creature's controller (read
// as last known, the creature still being there — no SBA mid-resolution).
export default defineCard({
  name: "Searing Barrage",
  manaCost: "{4}{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Searing Barrage deals 5 damage to target creature.\nAdamant — If at least three red mana was spent to cast this spell, Searing Barrage deals 3 damage to that creature's controller.",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "damage", amount: 5, target: 0 },
      {
        kind: "conditional",
        condition: { kind: "source", filter: { manaSpentOfColors: { R: 3 } } },
        then: { kind: "damage", amount: 3, toControllerOfTarget: 0 },
      },
    ],
  },
});
