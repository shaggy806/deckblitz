import { defineCard } from "../define.js";

// The −10's "that player or that planeswalker's controller" is what
// `controlledByTarget` already reads: the player in the slot, or the controller
// of the permanent in it.

const ULT_TEXT = "−10: Chandra deals 6 damage to target player or planeswalker and each creature that player or that planeswalker's controller controls.";

export default defineCard({
  name: "Chandra, Pyrogenius",
  manaCost: "{4}{R}{R}",
  colors: ["R"],
  types: ["planeswalker"],
  subtypes: ["Chandra"],
  supertypes: ["legendary"],
  loyalty: 5,
  text: `+2: Chandra deals 2 damage to each opponent.\n−3: Chandra deals 4 damage to target creature.\n${ULT_TEXT}`,
  activated: [
    {
      loyaltyCost: 2,
      cost: { mana: null, tap: false },
      targets: [],
      effect: { kind: "damage", amount: 2, who: "each-opponent" },
      resolve: null,
      text: "+2: Chandra deals 2 damage to each opponent.",
    },
    {
      loyaltyCost: -3,
      cost: { mana: null, tap: false },
      targets: ["creature"],
      effect: { kind: "damage", amount: 4, target: 0 },
      resolve: null,
      text: "−3: Chandra deals 4 damage to target creature.",
    },
    {
      loyaltyCost: -10,
      cost: { mana: null, tap: false },
      targets: ["player-or-planeswalker"],
      effect: {
        kind: "sequence",
        simultaneous: true,
        effects: [
          { kind: "damage", amount: 6, target: 0 },
          { kind: "damage-all", filter: { type: "creature" }, controlledByTarget: 0, amount: 6 },
        ],
      },
      resolve: null,
      text: ULT_TEXT,
    },
  ],
});
