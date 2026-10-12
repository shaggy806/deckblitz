import { defineCard } from "../define.js";

export default defineCard({
  name: "Ragged Playmate",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["artifact", "creature"],
  subtypes: ["Toy"],
  power: 2,
  toughness: 2,
  text: "{1}, {T}: Target creature with power 2 or less can't be blocked this turn.",
  activated: [
    {
      cost: { mana: "{1}", tap: true },
      targets: [{ kind: "permanent", filter: { type: "creature", power: { op: "lte", n: 2 } } }],
      effect: { kind: "grant-keyword", target: 0, keyword: "unblockable", duration: "end-of-turn" },
      resolve: null,
      text: "{1}, {T}: Target creature with power 2 or less can't be blocked this turn.",
    },
  ],
});
