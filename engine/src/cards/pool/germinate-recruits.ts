import { defineCard } from "../define.js";

// Reality Fracture (FRA). EDHREC rank 20128.
//
// Rulings:
//   [2026-08-21] Germinate Recruits counts the total amount of life gained without taking into
//     account any life you lost during that turn. For example, if you lost 3 life and gained 3
//     life earlier in the turn, you'll create three tokens.

const TEXT =
  "Create X 2/2 colorless Wizard Soldier creature tokens named Cadet, where X is the amount of life you gained this turn.";

export default defineCard({
  name: "Germinate Recruits",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["instant"],
  text: TEXT,
  targets: [],
  effect: { kind: "create-token", token: "Cadet", count: { turnStat: "life-gained", who: "you" } },
});
