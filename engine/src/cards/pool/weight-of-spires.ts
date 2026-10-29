import { defineCard } from "../define.js";

// The lands are counted as it resolves, from the side of the
// creature's controller then.

const TEXT =
  "Weight of Spires deals damage to target creature equal to the number of nonbasic lands that creature's controller controls.";

export default defineCard({
  name: "Weight of Spires",
  manaCost: "{R}",
  colors: ["R"],
  types: ["instant"],
  text: TEXT,
  targets: ["creature"],
  effect: {
    kind: "damage",
    target: 0,
    amount: {
      countOf: { type: "land", notSupertype: "basic", controlledBy: "you" },
      forPlayer: { controllerOfTarget: 0 },
    },
  },
});
