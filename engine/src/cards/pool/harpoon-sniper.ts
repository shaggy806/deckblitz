import { defineCard } from "../define.js";

// Lorwyn (LRW). EDHREC rank 21396. X is counted as the ability resolves.
const TEXT =
  "{W}, {T}: This creature deals X damage to target attacking or blocking creature, where X is the number of Merfolk you control.";

export default defineCard({
  name: "Harpoon Sniper",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Merfolk", "Archer"],
  power: 2,
  toughness: 2,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{W}", tap: true },
      targets: ["attacking-or-blocking-creature"],
      effect: {
        kind: "damage",
        amount: { countOf: { type: "creature", subtype: "Merfolk", controlledBy: "you" } },
        target: 0,
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
