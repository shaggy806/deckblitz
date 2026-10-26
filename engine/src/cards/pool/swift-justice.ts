import { defineCard } from "../define.js";

export default defineCard({
  name: "Swift Justice",
  manaCost: "{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Until end of turn, target creature gets +1/+0 and gains first strike and lifelink.",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "modify-pt", target: 0, power: 1, toughness: 0, duration: "end-of-turn" },
      { kind: "grant-keyword", target: 0, keyword: "first-strike", duration: "end-of-turn" },
      { kind: "grant-keyword", target: 0, keyword: "lifelink", duration: "end-of-turn" },
    ],
  },
});
