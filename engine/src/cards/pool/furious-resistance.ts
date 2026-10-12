import { defineCard } from "../define.js";

export default defineCard({
  name: "Furious Resistance",
  manaCost: "{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Target blocking creature gets +3/+0 and gains first strike until end of turn.",
  targets: [{ kind: "permanent", filter: { blocking: true, type: "creature" } }],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "modify-pt", target: 0, power: 3, toughness: 0, duration: "end-of-turn" },
      { kind: "grant-keyword", target: 0, keyword: "first-strike", duration: "end-of-turn" },
    ],
  },
});
