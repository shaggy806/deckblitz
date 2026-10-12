import { defineCard } from "../define.js";

export default defineCard({
  name: "Coralhelm Guide",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Merfolk", "Scout", "Ally"],
  power: 2,
  toughness: 1,
  text: "{4}{U}: Target creature can't be blocked this turn.",
  activated: [
    {
      cost: { mana: "{4}{U}", tap: false },
      targets: ["creature"],
      effect: { kind: "grant-keyword", target: 0, keyword: "unblockable", duration: "end-of-turn" },
      resolve: null,
      text: "{4}{U}: Target creature can't be blocked this turn.",
    },
  ],
});
