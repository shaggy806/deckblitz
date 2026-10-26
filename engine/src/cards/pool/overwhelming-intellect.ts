import { defineCard } from "../define.js";

// EDHREC rank 18001. The draw reads the countered spell's mana value as it
// last existed on the stack (rule 608.2h).
export default defineCard({
  name: "Overwhelming Intellect",
  manaCost: "{4}{U}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Counter target creature spell. Draw cards equal to that spell's mana value.",
  targets: ["creature-spell"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "counter", target: 0 },
      { kind: "draw", amount: { manaValueOf: 0 } },
    ],
  },
});
