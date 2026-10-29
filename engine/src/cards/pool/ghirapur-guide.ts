import { defineCard } from "../define.js";

export default defineCard({
  name: "Ghirapur Guide",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elf", "Scout"],
  power: 3,
  toughness: 2,
  text: "{2}{G}: Target creature you control can't be blocked by creatures with power 2 or less this turn.",
  activated: [
    {
      cost: { mana: "{2}{G}", tap: false },
      targets: ["creature-you-control"],
      effect: {
        kind: "restrict",
        target: 0,
        restrictions: [],
        cantBeBlockedBy: { power: { op: "lte", n: 2 } },
      },
      resolve: null,
      text: "{2}{G}: Target creature you control can't be blocked by creatures with power 2 or less this turn.",
    },
  ],
});
