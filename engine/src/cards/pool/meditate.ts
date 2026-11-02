import { defineCard } from "../define.js";

// Tempest Remastered. "You skip your next turn" is rule 614.10's replacement:
// the `skip-turn` effect.
export default defineCard({
  name: "Meditate",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Draw four cards. You skip your next turn.",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "draw", amount: 4 },
      { kind: "skip-turn", who: "you" },
    ],
  },
});
