import { defineCard } from "../define.js";

// EDHREC rank 5688.
//
// Pestilence's damage with an X: the creatures and the players are dealt it
// as one event (`simultaneous`). "Spend only black mana on X" is the cost's
// `xSpendOnly`: X is paid as that many black mana, so the X offered goes only
// as high as the black mana there is.
const TEXT = "{X}: This creature deals X damage to each creature and each player. Spend only black mana on X.";

export default defineCard({
  name: "Crypt Rats",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Rat"],
  power: 1,
  toughness: 1,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{X}", tap: false, xSpendOnly: "B" },
      targets: [],
      effect: {
        kind: "sequence",
        simultaneous: true,
        effects: [
          { kind: "damage-all", filter: { type: "creature" }, amount: "x" },
          { kind: "damage", amount: "x", who: "each-player" },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
