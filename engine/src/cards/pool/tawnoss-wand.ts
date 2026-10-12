import { defineCard } from "../define.js";

export default defineCard({
  name: "Tawnos's Wand",
  manaCost: "{4}",
  colors: [],
  types: ["artifact"],
  text: "{2}, {T}: Target creature with power 2 or less can't be blocked this turn.",
  activated: [
    {
      cost: { mana: "{2}", tap: true },
      targets: [{ kind: "permanent", filter: { type: "creature", power: { op: "lte", n: 2 } } }],
      effect: { kind: "grant-keyword", target: 0, keyword: "unblockable", duration: "end-of-turn" },
      resolve: null,
      text: "{2}, {T}: Target creature with power 2 or less can't be blocked this turn.",
    },
  ],
});
