import { defineCard } from "../define.js";

// EDHREC rank 17938.

export default defineCard({
  name: "Ornamental Courage",
  manaCost: "{G}",
  colors: ["G"],
  types: ["instant"],
  text: "Untap target creature. It gets +1/+3 until end of turn.",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "untap", target: 0 },
      { kind: "modify-pt", target: 0, power: 1, toughness: 3, duration: "end-of-turn" },
    ],
  },
});
