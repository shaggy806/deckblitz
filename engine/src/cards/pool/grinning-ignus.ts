import { defineCard } from "../define.js";

const TEXT = "{R}, Return this creature to its owner's hand: Add {C}{C}{R}. Activate only as a sorcery.";

// A mana ability despite its timing restriction (its ruling): no stack. The
// auto-payer never returns a permanent to hand, so it's activated by hand.
export default defineCard({
  name: "Grinning Ignus",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Elemental"],
  power: 2,
  toughness: 2,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{R}", tap: false, returnSelfToHand: true },
      targets: [],
      effect: { kind: "add-mana", mana: { all: ["C", "C", "R"] }, amount: 1 },
      resolve: null,
      sorcerySpeed: true,
      text: TEXT,
    },
  ],
});
