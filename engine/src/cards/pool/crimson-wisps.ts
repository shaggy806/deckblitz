import { defineCard } from "../define.js";

// EDHREC rank 2458.

export default defineCard({
  name: "Crimson Wisps",
  manaCost: "{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Target creature becomes red and gains haste until end of turn. (It can attack and {T} this turn.)\nDraw a card.",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "become-color", target: 0, colors: ["R"], duration: "end-of-turn" },
      { kind: "grant-keyword", target: 0, keyword: "haste", duration: "end-of-turn" },
      { kind: "draw", amount: 1 },
    ],
  },
});
