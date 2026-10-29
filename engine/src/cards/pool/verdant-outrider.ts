import { defineCard } from "../define.js";

// EDHREC rank 28475. Ghirapur Guide's restriction on itself; a block already
// made stands (the ruling).

const TEXT = "{1}{G}: This creature can't be blocked by creatures with power 2 or less this turn.";

export default defineCard({
  name: "Verdant Outrider",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Human", "Knight"],
  power: 4,
  toughness: 2,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{1}{G}", tap: false },
      targets: [],
      effect: {
        kind: "restrict",
        target: "source",
        restrictions: [],
        cantBeBlockedBy: { power: { op: "lte", n: 2 } },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
