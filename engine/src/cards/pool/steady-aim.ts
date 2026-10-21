import { defineCard } from "../define.js";

// War of the Spark. EDHREC rank 22428.
//
// An untapped target still gets the +1/+4 and reach (its ruling).

export default defineCard({
  name: "Steady Aim",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["instant"],
  text: "Untap target creature. It gets +1/+4 and gains reach until end of turn.",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "untap", target: 0 },
      { kind: "modify-pt", target: 0, power: 1, toughness: 4, duration: "end-of-turn" },
      { kind: "grant-keyword", target: 0, keyword: "reach", duration: "end-of-turn" },
    ],
  },
});
