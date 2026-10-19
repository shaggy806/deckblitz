import { defineCard } from "../define.js";

// Streets of New Capenna.
//
// Rulings:
//   [2022-04-29] The tokens created by Crash the Party don't enter the battlefield attacking.
//
// Infinite Guideline Station's shape: one batch of tapped tokens, counted as
// it resolves.
const TEXT = "Create a tapped 4/4 green Rhino Warrior creature token for each tapped creature you control.";

export default defineCard({
  name: "Crash the Party",
  manaCost: "{5}{G}",
  colors: ["G"],
  types: ["instant"],
  text: TEXT,
  targets: [],
  effect: {
    kind: "create-token",
    token: "Rhino Warrior Token",
    count: { countOf: { type: "creature", tapped: true, controlledBy: "you" } },
    tapped: true,
  },
});
