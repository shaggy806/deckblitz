import { defineCard } from "../define.js";

export default defineCard({
  name: "Harbor Bandit",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human", "Rogue"],
  power: 2,
  toughness: 2,
  text: "This creature gets +1/+1 as long as you control an Island.\n{1}{U}: This creature can't be blocked this turn.",
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "controls", filter: { subtype: "Island" }, atLeast: 1 },
      grantPt: [1, 1],
      text: "This creature gets +1/+1 as long as you control an Island.",
    },
  ],
  activated: [
    {
      cost: { mana: "{1}{U}", tap: false },
      targets: [],
      effect: { kind: "grant-keyword", target: "source", keyword: "unblockable", duration: "end-of-turn" },
      resolve: null,
      text: "{1}{U}: This creature can't be blocked this turn.",
    },
  ],
});
