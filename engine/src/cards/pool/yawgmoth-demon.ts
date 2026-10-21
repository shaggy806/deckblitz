import { defineCard } from "../define.js";

// EDHREC rank 28962.
//
// Rulings:
//   The sacrificing of an artifact is not mandatory. You can choose not to
//   sacrifice an artifact but will pay the consequences.
//
// Devouring Sugarmaw's shape: a "may" with a sacrifice option, and the tap
// plus the damage as its "if you don't".

const UPKEEP_TEXT =
  "At the beginning of your upkeep, you may sacrifice an artifact. If you don't, tap this creature and it deals 2 damage to you.";

export default defineCard({
  name: "Yawgmoth Demon",
  manaCost: "{4}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Phyrexian", "Demon"],
  power: 6,
  toughness: 6,
  keywords: ["flying", "first-strike"],
  text: `Flying (This creature can't be blocked except by creatures with flying or reach.)\nFirst strike (This creature deals combat damage before creatures without first strike.)\n${UPKEEP_TEXT}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "each-player-may",
        who: "you",
        options: [{ sacrifice: { type: "artifact" }, text: "Sacrifice an artifact" }],
        ifDidnt: {
          kind: "sequence",
          effects: [
            { kind: "tap", target: "source" },
            { kind: "damage", amount: 2, who: "you" },
          ],
        },
      },
      resolve: null,
      text: UPKEEP_TEXT,
    },
  ],
});
