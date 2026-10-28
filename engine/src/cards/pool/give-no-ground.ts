import { defineCard } from "../define.js";

// EDHREC rank 19372.

export default defineCard({
  name: "Give No Ground",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Target creature gets +2/+6 until end of turn and can block any number of creatures this turn.",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "modify-pt", target: 0, power: 2, toughness: 6, duration: "end-of-turn" },
      { kind: "block-additional", target: 0, amount: "any", duration: "end-of-turn" },
    ],
  },
});
