import { defineCard } from "../define.js";

export default defineCard({
  name: "Pathmaker Initiate",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 2,
  toughness: 1,
  text: "{T}: Target creature with power 2 or less can't be blocked this turn.",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [{ kind: "permanent", filter: { type: "creature", power: { op: "lte", n: 2 } } }],
      effect: { kind: "grant-keyword", target: 0, keyword: "unblockable", duration: "end-of-turn" },
      resolve: null,
      text: "{T}: Target creature with power 2 or less can't be blocked this turn.",
    },
  ],
});
