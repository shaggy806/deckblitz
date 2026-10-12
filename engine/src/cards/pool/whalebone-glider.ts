import { defineCard } from "../define.js";

export default defineCard({
  name: "Whalebone Glider",
  manaCost: "{2}",
  colors: [],
  types: ["artifact"],
  text: "{2}, {T}: Target creature with power 3 or less gains flying until end of turn.",
  activated: [
    {
      cost: { mana: "{2}", tap: true },
      targets: [{ kind: "permanent", filter: { type: "creature", power: { op: "lte", n: 3 } } }],
      effect: { kind: "grant-keyword", target: 0, keyword: "flying", duration: "end-of-turn" },
      resolve: null,
      text: "{2}, {T}: Target creature with power 3 or less gains flying until end of turn.",
    },
  ],
});
