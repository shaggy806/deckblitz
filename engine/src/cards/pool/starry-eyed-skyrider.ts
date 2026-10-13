import { defineCard } from "../define.js";

// EDHREC rank 8258.
//
// Rulings:
//   [2025-04-04] If Starry-Eyed Skyrider leaves the battlefield, any attacking tokens will no
//     longer be granted flying by the last ability. If that happens before the declare blockers
//     step, it may allow those tokens to be blocked by creatures without flying.

export default defineCard({
  name: "Starry-Eyed Skyrider",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Scout"],
  power: 1,
  toughness: 3,
  keywords: ["flying"],
  text: "Flying\nWhenever this creature attacks, another target creature you control gains flying until end of turn.\nAttacking tokens you control have flying.",
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [{ kind: "other", of: "creature-you-control" }],
      effect: { kind: "grant-keyword", target: 0, keyword: "flying", duration: "end-of-turn" },
      resolve: null,
      text: "Whenever this creature attacks, another target creature you control gains flying until end of turn.",
    },
  ],
  static: [
    {
      affects: { scope: "filter", filter: { token: true, attacking: true, controlledBy: "you" } },
      grantKeywords: ["flying"],
      text: "Attacking tokens you control have flying.",
    },
  ],
});
