import { defineCard } from "../define.js";

const TEXT = "{R}{G}{W}: This creature and each other creature with the same name as it get +3/+3 until end of turn.";

// One `-all` effect over this creature and its namesakes (`sameNameWith:
// "source"`, bound to its name as the ability resolves — this creature has
// its own name).
export default defineCard({
  name: "Cylian Sunsinger",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elf", "Shaman"],
  power: 2,
  toughness: 2,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{R}{G}{W}", tap: false },
      targets: [],
      effect: {
        kind: "modify-pt-all",
        filter: { type: "creature", sameNameWith: "source" },
        power: 3,
        toughness: 3,
        duration: "end-of-turn",
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
