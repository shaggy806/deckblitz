import { defineCard } from "../define.js";

// EDHREC rank 13451.

export default defineCard({
  name: "Wing It",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Target creature gets +2/+2 until end of turn. Put a flying counter on it. Scry 1.",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "modify-pt", target: 0, power: 2, toughness: 2, duration: "end-of-turn" },
      { kind: "add-counter", target: 0, counter: "flying", amount: 1 },
      { kind: "scry", amount: 1 },
    ],
  },
});
